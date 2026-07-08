# Wandercall Enterprise Architecture: Phase 7.7 Implementation & System Audit

## 1. Backend Architecture (NestJS + TypeORM + Redis + Socket.io)

### 1.1 Community Module Redesign
The Community module has been upgraded from a simple CRUD entity into a globally scalable, real-time presence, and discovery engine.

- **CommunityRedisPresenceService**: Replaced legacy in-memory maps with Redis Sets (`community:{id}:online`) and Sorted Sets (`community:ranking:online`). This enables O(1) state lookups and multi-node scalability for tracking online members. Heartbeats ensure dead sockets are purged automatically.
- **CommunityRankingEngine**: A multi-factor recommendation engine combining 8 weighted signals:
  - Base Popularity (Member count)
  - Live Activity (Online users)
  - Recent Chat Volume
  - Distance/Geo-proximity
  - Trending Velocity (Growth spikes)
  - Friend Presence (Social graph intersection)
- **CommunityPresenceTracker (Refactor)**: Acts as the immediate bridge between WebSocket disconnects/connects and Redis. Now enforces the **Active Community Rule** (`minOnlineForActive: 1`). The moment 1 user joins, the community is broadcasted as LIVE to the entire global Galaxy.
- **CommunityDiscoveryService (Galaxy Engine)**: 
  - Retrieves live stats instantly from `PresenceTracker`.
  - Enforces the rule: Communities *only* appear in the Galaxy if they are ACTIVE (except during cold-start fallback testing).
  - Groups communities into Clusters based on `COMMUNITY_RANKING_CONFIG.clusterCategories` (Adventure, Social, Gaming, etc.).
  - Calculates coordinate spiral mathematics (`x`, `y`) with pulsating radii.
  - Performs Cursor-based Pagination.

### 1.2 The "Guest" Role Injection Pattern
Guests visiting a community (reading chat without clicking "Join Guild") are now fully supported.
- `CommunityMembershipService.getMembers` has been augmented to query the database for permanent members, and then instantly merge visiting `Guest` cohorts fetched from `CommunityPresenceTracker.getActiveCohorts()`.
- `CommunityMembershipController` now exposes `@Get()` directly on `/communities/:communityId/members` to deliver this enriched payload.

### 1.3 Event-Driven Moderation
- Moderation actions (`MUTE`, `UNMUTE`, `BAN`, `KICK`) in `CommunityModerationService` trigger `CommunityEventDispatcher`.
- `ChatGateway` subscribes to these dispatcher events and globally emits `community:moderation:action` to every socket inside the specific community room.

## 2. Frontend Architecture (React + TanStack Query + Redux)

### 2.1 Deduplication & Synchronization
- **Duplicate Messages Fix**: In `useSocket.ts`, the `community:message:new` listener now uses **Strict Deduplication**. Before prepending a new message to the TanStack Query cache (`COMMUNITY_CHAT_QUERY_KEYS.MESSAGES`), it iterates the first page and checks if `message.id` or `message.clientMessageId` already exists. This completely resolves the "duplicate messages sending" glitch caused by Optimistic UI + Socket Roundtrip overlap.
- **Real-Time Moderation Sync**: In `_page_monolith.tsx`, the `handleModerationAction` socket listener was patched. Previously, it only showed a toast. Now, it immediately triggers `setMyMember(prev => ({ ...prev, isMuted: true, mutedUntil: ... }))` for the active user. This instantly disables the chat input for the muted user.
- **Mod Control Center Invalidation**: For the moderator performing the action, `queryClient.invalidateQueries` forces `MemberDetailsControlCenter` to re-fetch the fresh muted states without requiring a page refresh.

### 2.2 Galaxy UI Rendering
- `profile/community/page.tsx` strictly consumes the paginated, clustered response from `/discovery/communities/galaxy`.
- Pulse animations (`framer-motion`) and coordinate mapping are derived straight from the backend `CommunityDiscoveryService`, ensuring the server remains the source of truth for all spatial rendering.

## 3. Recommended Next Steps
- **Graphify Knowledge Base**: The codebase has shifted significantly. Run the `/graphify` workflow (or `graphify update .` locally) to rebuild the relationship graph between `PresenceTracker`, `RedisService`, and `DiscoveryService`.
- **Load Testing**: Monitor the Redis connection pooling during high chat volumes to ensure `CommunityEventDispatcher` publishes scale efficiently.
