# Enterprise Community Architecture & RBAC System

This document outlines the technical architecture, data model, event-driven topology, and Role-Based Access Control (RBAC) system for the Wandercall Enterprise Community Service.

---

## 1. Executive Summary

Wandercall's Community Engine is designed as a multi-tenant, highly scalable domain capable of supporting thousands of concurrent travel communities, coordinates, and real-time member interactions. To ensure high availability, data consistency, and low-latency user interfaces, the architecture leverages:
- **Atomic Database Transactions**: Ensuring zero orphaned records or null foreign keys during community initialization and member onboarding.
- **Event-Driven Architecture (EDA)**: Decoupling core persistence from auxiliary services (search indexing, statistics aggregation, and 3D galaxy visualization) using a centralized event dispatcher.
- **Dynamic Frontend Registries & Caching**: Utilizing TanStack Query for optimistic UI state synchronization and an extensible message renderer registry for rich chat interactions.

---

## 2. Event-Driven Topology & Domain Subscribers

To prevent long-running synchronous operations during high-frequency domain actions (such as creating a community, joining, or leaving), the service implements an in-process domain event bus using `CommunityEventDispatcher`.

### 2.1 Event Flow Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User as Client / Creator
    participant CS as CommunityService
    participant DB as PostgreSQL (Tx)
    participant Bus as CommunityEventDispatcher
    participant Stats as StatisticsSubscriber
    participant Search as SearchSubscriber
    participant Galaxy as GalaxySubscriber

    User->>CS: createCommunity(dto, creatorId)
    activate CS
    Note over CS,DB: Begin ACID Transaction
    CS->>DB: Insert CommunityEntity
    CS->>DB: Insert CommunitySettingsEntity
    CS->>DB: Lookup/Assign OWNER Role
    CS->>DB: Insert CommunityMemberEntity (Owner)
    CS->>DB: Insert CommunityStatisticsEntity
    CS->>DB: Commit Transaction
    
    CS->>Bus: emit("community.created", event)
    deactivate CS
    CS-->>User: 201 Created (Community Node)

    Note over Bus,Galaxy: Asynchronous Non-Blocking Execution
    Bus-)Stats: handleCommunityCreated(event)
    Bus-)Search: handleCommunityCreated(event)
    Bus-)Galaxy: handleCommunityCreated(event)
    
    activate Stats
    Stats->>DB: Initialize counters & metrics
    deactivate Stats

    activate Search
    Search->>DB: Index community metadata for discovery
    deactivate Search

    activate Galaxy
    Galaxy->>DB: Register 3D spatial coordinates in Galaxy Map
    deactivate Galaxy
```

### 2.2 Subscriber Responsibilities
- **`CommunityStatisticsSubscriber`**: Listens to `community.created`, `community.member_joined`, and `community.member_left`. Automatically increments/decrements `currentMemberCount` and recalculates community energy scores without table-locking the main community record.
- **`CommunitySearchSubscriber`**: Maintains search indexes and keyword tags for full-text discovery when communities are updated or created.
- **`CommunityGalaxySubscriber`**: Synchronizes community spatial nodes with the interactive 3D Galaxy Map, updating cluster densities and coordinate linkages in real time.

---

## 3. Data Model & Atomic Coordination

A critical requirement of multi-tenant community platforms is ensuring that system roles and default configurations exist before user assignment.

### 3.1 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    COMMUNITY ||--o{ COMMUNITY_MEMBER : "has"
    COMMUNITY ||--|| COMMUNITY_SETTINGS : "configures"
    COMMUNITY ||--|| COMMUNITY_STATISTICS : "tracks"
    COMMUNITY ||--o| COMMUNITY_COORDINATES : "anchored_to"
    COMMUNITY_ROLE ||--o{ COMMUNITY_MEMBER : "assigned_to"
    USER ||--o{ COMMUNITY_MEMBER : "joins"

    COMMUNITY {
        uuid id PK
        string slug UK
        string name
        string visibility
        string status
        uuid ownerId FK
        uuid primaryCategoryId
    }

    COMMUNITY_ROLE {
        uuid id PK
        string name UK
        string displayName
        string description
        boolean isSystem
        int priority
    }

    COMMUNITY_MEMBER {
        uuid id PK
        uuid communityId FK
        uuid userId FK
        uuid roleId FK
        boolean isOwner
        timestamp joinedAt
    }

    COMMUNITY_SETTINGS {
        uuid id PK
        uuid communityId FK
        boolean requiresApproval
        boolean allowMemberInvites
    }
```

### 3.2 Solving the `roleId = NULL` Initialization Bottleneck
Historically, if system roles (`OWNER`, `ADMIN`, `MODERATOR`, `MEMBER`) were seeded asynchronously or lazily during request handling, race conditions caused creators to receive `roleId = NULL`.
To guarantee relational integrity:
1. **Bootstrap Seeding (`CommunityRoleSeederService`)**: Executed strictly during `onApplicationBootstrap()` after database schema synchronization (`dataSource.synchronize()`). It verifies and seeds immutable system roles with designated priority weights.
2. **Atomic Creation**: When a community is generated, `CommunityService.createCommunity()` queries the pre-seeded `OWNER` role within the same database transaction. If the role lookup fails or any child entity (`Settings`, `Statistics`) fails to persist, the entire transaction rolls back cleanly.

---

## 4. Role-Based Access Control (RBAC) & Moderation Lifecycle

Wandercall enforces a hierarchical RBAC permission model. Actions performed on community members are validated against role priority levels and explicit capability flags.

### 4.1 Permission Matrix

| Capability / Action | Owner | Admin | Moderator | Member |
| :--- | :---: | :---: | :---: | :---: |
| **Delete Community / Transfer Ownership** | ✅ | ❌ | ❌ | ❌ |
| **Promote / Demote Admins** | ✅ | ❌ | ❌ | ❌ |
| **Promote / Demote Moderators** | ✅ | ✅ | ❌ | ❌ |
| **Kick Member (`kickMember`)** | ✅ | ✅ | ✅ | ❌ |
| **Ban Member (`banMember`)** | ✅ | ✅ | ✅ | ❌ |
| **Mute Member (`muteMember`)** | ✅ | ✅ | ✅ | ❌ |
| **Invite New Members** | ✅ | ✅ | ✅ | ⚠️ *(If enabled)* |
| **Participate in Chat / Book Experiences** | ✅ | ✅ | ✅ | ✅ |

### 4.2 Member Moderation Lifecycle

```mermaid
stateDiagram-v2
    [*] --> ActiveMember: Joins Community (Default: MEMBER)
    
    state ActiveMember {
        [*] --> Normal
        Normal --> Muted: muteMember(durationMinutes)
        Muted --> Normal: Timer Expires / Unmute
    }

    ActiveMember --> Moderator: updateRole(MODERATOR)
    Moderator --> ActiveMember: updateRole(MEMBER)
    
    ActiveMember --> Admin: updateRole(ADMIN) [Owner Only]
    Admin --> ActiveMember: updateRole(MEMBER) [Owner Only]
    
    ActiveMember --> Kicked: kickMember()
    Kicked --> [*]: Removed from Community (Can Rejoin)
    
    ActiveMember --> Banned: banMember(reason, permanent)
    Moderator --> Banned: banMember(reason, permanent)
    Banned --> [*]: Access Denied (Blacklisted)
    
    ActiveMember --> Owner: transferOwnership(newOwnerId) [Owner Only]
    Owner --> ActiveMember: Demoted to Admin/Member upon transfer
```

---

## 5. Frontend Operational Center & Chat Integration

The frontend client leverages modular design patterns and React best practices to deliver a stunning, responsive operational center for community leaders.

### 5.1 TanStack Query Synchronization Strategy
All moderation actions (`useKickMember`, `useBanMember`, `useMuteMember`, `useUpdateRole`, `useTransferOwnership`) trigger surgical cache invalidations upon success:
```typescript
onSuccess: () => {
  // 1. Invalidate specific member list query to refresh UI instantly
  queryClient.invalidateQueries({ queryKey: ['communities', 'members', communityId] });
  // 2. Invalidate community detail metadata (member counts, online status)
  queryClient.invalidateQueries({ queryKey: ['communities', 'detail'] });
  // 3. Invalidate personal membership state if ownership changed
  queryClient.invalidateQueries({ queryKey: ['community', 'me'] });
}
```

### 5.2 Extensible Chat Renderer Registry (`MESSAGE_RENDERER_REGISTRY`)
To prevent monolithic conditional clutter (`if (msg.type === '...')`) within chat loops, the client utilizes a central message renderer registry:
- **`registry.ts`**: Maps message types (e.g., `COMMUNITY_INVITE`, `TEXT`, `AUDIO`) to specialized React components.
- **`CommunityInviteRenderer.tsx`**: Renders interactive invitation cards embedded directly inside chat threads, featuring rich cover images, member counts, and optimistic **Join / Decline** action buttons.
- **Decoupled Execution**: Chat views (`[chatId]/page.tsx` and `friends/page.tsx`) simply invoke `getMessageRenderer(msg.type)` and render the component dynamically.

---

## 6. Verification & System Health

1. **TypeScript Compile Safety**: Both `backend` and `client` codebases maintain strict type safety, verified via automated `npx tsc --noEmit` checks.
2. **Knowledge Graph Synchronization**: This architecture document is continuously synchronized with the workspace Graphify knowledge graph (`graphify-out/`), enabling semantic queries, relationship tracing, and impact analysis across the entire full-stack ecosystem.
