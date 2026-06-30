# Wandercall Enterprise Backend Architecture Master Blueprint

Welcome to the **Wandercall** enterprise backend application repository. Wandercall is an ultra-scale travel and experience platform combining social networking, live voice rooms, experience marketplaces, real-time chat, automated booking, e-commerce, and AI recommendation engines designed to serve millions of daily active users (DAU) and concurrent connections.

This repository implements a **Domain-Driven Design (DDD)** based **Modular Monolith** architecture designed for seamless evolution into **Distributed Microservices**.

---

## 🎯 Architectural Philosophy & Core Principles

### 1. Domain-Driven Design (DDD) Bounded Contexts
Wandercall is strictly organized around business domains rather than technical layer boundaries. Each domain module inside `src/modules/` acts as an autonomous **Bounded Context** containing its own ubiquitously named ubiquitous language, domain models, contracts, and interfaces.

### 2. Modular Monolith Evolving into Microservices
To maintain rapid development velocity and single-repository governance without sacrificing enterprise scalability, Wandercall is built today as a unified NestJS runtime. However, **every domain module is strictly isolated**. Module implementations are strictly private, preventing cross-domain coupling. When a domain module hits scale thresholds (e.g., `booking` or `chat`), it can be extracted into an independent microservice deployment target (e.g., `booking-service`) within minutes without modifying internal code structures.

### 3. Stateless Application & Scalability
- **Stateless Services**: All application instances are fully stateless. Session states, WebSocket connection registries, and temporal workflows live in distributed data stores (Redis, Kafka).
- **Concurrency & Resilience**: Horizontal pod autoscaling (HPA) is supported out-of-the-box. Pods can be spun up or destroyed dynamically based on telemetry metrics.

---

## 📁 Repository Directory Structure

```
backend/
├── docs/                      # Architectural documentation & API specifications
│   ├── api/                   # OpenAPI / AsyncAPI contracts
│   ├── architecture/          # Architecture Decision Records (ADRs)
│   └── diagrams/              # Sequence diagrams & C4 architecture models
├── scripts/                   # Utility CLI and operational scripts
│   ├── cli/                   # Developer CLI tools
│   ├── migrations/            # Database migration scripts
│   └── seeders/               # Domain data seeders
├── test/                      # Testing architecture & infrastructure
│   ├── e2e/                   # End-to-end user flow test suites
│   ├── factories/             # Entity/DTO test object generators
│   ├── fixtures/              # Test data fixtures
│   ├── integration/           # Cross-module integration tests
│   ├── mocks/                 # Service & provider mocks
│   └── unit/                  # Isolated domain unit tests
└── src/
    ├── main.ts                # Application bootstrap entry point
    ├── app.module.ts          # Root orchestration module
    ├── config/                # Strongly-typed environment configurations
    ├── core/                  # Engine bootstrap, global guards & interceptors
    ├── common/                # Cross-cutting enterprise technical base classes
    ├── shared/                # Application-wide domain primitives & types
    ├── events/                # Cross-domain system integration events
    ├── libs/                  # Third-party driver abstraction wrappers
    ├── health/                # System health, readiness & liveness probes
    └── modules/               # Domain Bounded Contexts (19 Enterprise Modules)
```

---

## 🏛️ System Layers & Communication Rules

| Layer | Location | Purpose & Responsibility | Access / Dependency Rules |
| :--- | :--- | :--- | :--- |
| **Config** | `src/config/` | Strongly-typed configuration schemas for infrastructure engines. | Pure functions/schemas. No module dependency. |
| **Core** | `src/core/` | Global application bootstrap, framework plugins, global filters, and interceptors. | Imports `config`, `common`, `libs`. Root-level access. |
| **Common** | `src/common/` | Reusable technical primitives (Base Entities, Standard API Responses, Exception Filters). | Zero business logic. Dependent only on framework abstractions. |
| **Shared** | `src/shared/` | Shared domain primitives (Global enums, cross-domain interfaces, validation schemas). | Pure domain contracts. Imported by domain modules. |
| **Events** | `src/events/` | Integrated domain event definitions for asynchronous event bus communication. | Published and subscribed across modules via event interfaces. |
| **Libs** | `src/libs/` | Standardized wrappers around external infrastructure drivers (Cache, SMS, S3, Kafka). | Encapsulated wrappers. Consumed by modules via interfaces. |
| **Modules** | `src/modules/` | Autonomous domain business contexts containing actual features and workflows. | Strict encapsulation. Cross-module imports prohibited except via public module interfaces/events. |

---

## 🧱 Standard Internal Module Anatomy

Every module in `src/modules/<module-name>` MUST follow this strict 13-folder standardized hierarchy. No business code lives outside this hierarchy.

```
src/modules/<module-name>/
├── config/         # Module-specific environment & runtime parameters
├── constants/      # Module-specific constants & error codes
├── controllers/    # Transport adapters (HTTP endpoints, WebSockets, gRPC, Event Consumers)
├── dto/            # Data Transfer Objects for ingress/egress validation
├── entities/       # Domain Models, Aggregates, and Persistence Entities
├── events/         # Internal module domain events published upon state changes
├── exceptions/     # Custom domain-specific business exceptions
├── interfaces/     # Internal contracts & repository interface definitions
├── repositories/   # Persistence access implementation (TypeORM / Prisma / Custom)
├── services/       # Domain Services executing core business rules & orchestrations
├── types/          # Module-specific internal TypeScript types
├── utils/          # Pure helper utilities exclusive to this domain
└── validators/     # Custom validation logic and business rule guard checkers
```

---

## 🌐 Enterprise Domain Modules (19 Bounded Contexts)

1. **`auth`**: Authentication workflows, JWT token lifecycle management, OAuth2 integrations, multi-factor authentication (MFA).
2. **`user`**: User profiles, preferences, traveler passports, account verification, KYC compliance.
3. **`experience`**: Experience catalogs, host activity listings, itineraries, dynamic pricing, geo-spatial indexing.
4. **`booking`**: Multi-state reservation state machines, calendar locks, availability management, booking holds.
5. **`payment`**: Escrow holds, multi-split marketplace payouts via Cashfree, refund processing, currency conversion.
6. **`provider`**: Merchant/Host onboarding dashboards, earnings telemetry, payout configuration, service schedules.
7. **`community`**: Travel clubs, community forums, local meetup groups, moderation governance.
8. **`feed`**: High-throughput personalized activity feeds, dynamic timeline ranking algorithms, social activity streams.
9. **`memory`**: Travel journals, user moments, photo/video highlights, story collections.
10. **`friend`**: Social graph management, connection requests, follower lists, contact discovery integrations.
11. **`wishlist`**: Bucket list curation, saved travel collections, collaborative group trip planning.
12. **`quest`**: Gamification engine, travel achievement badges, reward point engines, leaderboard challenges.
13. **`chat`**: Low-latency direct and group messaging, channel management, persistent media attachments via Socket.IO.
14. **`voice`**: Real-time live audio rooms, host stages, interactive listener spaces powered by LiveKit integrations.
15. **`notification`**: Multi-channel notification dispatch engine (Web Push, Mobile Push, SMS, Email, In-App).
16. **`review`**: Verified buyer reviews, multi-criterion ratings, automated sentiment analysis, anti-fraud evaluation.
17. **`analytics`**: High-volume telemetry ingress, user interaction metrics, conversion tracking, data warehousing pipelines.
18. **`search`**: Sub-second full-text search, multi-facet filtering (Meilisearch), and AI vector similarity search (Qdrant).
19. **`admin`**: System-wide operations, audit logging, content moderation queues, user platform overrides.

---

## 🚫 Architectural Boundary Rules & Dependency Mandates

To ensure clean architecture and prevent technical debt:

1. **Database Isolation**: No module may directly query or access another module's database tables or persistence entities. Database joins across domain boundaries are strictly forbidden.
2. **Synchronous Communication**: Modules must communicate synchronously ONLY via exported Domain Service interfaces registered in NestJS module exports. Direct instantiation or importing internal controllers/repositories of another module is prohibited.
3. **Asynchronous Communication**: Cross-domain side effects (e.g., `booking` triggering `notification` or updating `analytics`) MUST occur asynchronously via Domain Events (`src/events/`) published to Kafka/EventBus.
4. **Zero Circular Dependencies**: Modules must maintain acyclic dependencies. Standard nest CLI linting enforces dependency trees.
5. **Public API Contracts**: Each module must define a clear `index.ts` public interface file. Internal helper utilities, DTOs, and repositories must remain encapsulated within the domain.

---

## 🚀 Microservice Migration Strategy

When a domain module needs to scale independently:

1. **Container Decoupling**: Copy `src/modules/<target-module>` into an isolated NestJS container service (e.g., `services/booking-service`).
2. **Transport Swapping**: Update the exported interface from internal NestJS dependency injection to gRPC / Kafka message handlers. Because controllers and transport layers are segregated in `controllers/`, business logic in `services/` and persistence in `repositories/` remain 100% unchanged!
3. **Database Migration**: Move the domain's database tables to a dedicated database instance/schema without impacting other services.

---

## 📐 Coding Standards & Naming Conventions

### File & Directory Naming
- **Directories**: `kebab-case` (e.g., `user-passport`, `experience-catalog`)
- **Files**: `kebab-case` with explicit type suffix (e.g., `create-booking.dto.ts`, `booking.service.ts`)

### Code Artifact Naming
- **Classes**: `PascalCase` matching file role (e.g., `BookingService`, `CreateBookingDto`, `PaymentCompletedEvent`)
- **Interfaces**: `PascalCase` prefixed with `I` (e.g., `IBookingRepository`, `IUserContext`)
- **Enums**: `PascalCase` with uppercase property keys (e.g., `BookingStatus.PENDING`)
- **Constants**: `SNAKE_CASE_UPPERCASE` (e.g., `MAX_RESERVATION_HOLDS_PER_USER`)

---

## ⚡ Performance & Resilience Architecture

1. **Stateless Operations**: Session caches, socket maps, and temporal tokens are stored in Redis clusters to enable frictionless multi-region horizontal autoscaling.
2. **Multi-Tier Caching Strategy**: L1 in-memory LRU caching for microsecond metadata lookups combined with L2 distributed Redis caching for heavy query results.
3. **CQRS & Event Sourcing Readiness**: Command pipelines (writes/updates) are isolated from Query pipelines (reads). Search indexing pipelines stream out-of-band updates to Meilisearch and Qdrant via Kafka event consumers.
4. **Resilient Third-Party Integrations**: All third-party library wrappers in `src/libs/` implement circuit breakers, retries with exponential backoff, and fallback degrade paths.

---

## ⚙️ Enterprise Environment Configuration Architecture

The Wandercall backend enforces a centralized, strictly validated, dependency-injection friendly configuration layer. Configuration is treated as application-level infrastructure, isolated completely from source code.

### 📁 Environment File Strategy & Root Placement

All environment configuration files reside exclusively at the root of the `backend/` project directory:

```
wandercall_v3/
└── backend/
    ├── .env                    ← Primary development configuration
    ├── .env.local              ← Local developer overrides (GITIGNORED)
    ├── .env.example            ← Master onboarding template with placeholders
    ├── .env.production         ← Production template for cloud secret managers
    ├── src/
    │   └── config/             ← Centralized Configuration Layer
    └── ...
```

#### Purpose of Each File:
- **`.env`**: Default development configuration values for local development and sandbox environments.
- **`.env.local`**: Personal developer overrides (e.g., custom local database passwords, individual API keys). **Never committed and gitignored.**
- **`.env.example`**: Comprehensive onboarding documentation detailing every required application environment variable with dummy/placeholder values. Contains **zero secrets**.
- **`.env.production`**: Production infrastructure variable mapping template. In production, actual credentials originate dynamically from cloud secret management services.

---

### 🎯 Configuration Philosophy & Dependency Flow

Direct access to `process.env` outside `src/config/` is strictly prohibited across the codebase. 

#### Dependency Flow:
```
[ Transport Layer / Controller ]
              ↓
    [ Application Service ]
              ↓
  [ Strongly-Typed Config Layer ]
              ↓
  [ Environment Variables (.env) ]
```

#### Why Centralized Configuration?
1. **Single Source of Truth**: Eliminates scattered, ad-hoc `process.env` calls across controller and service files.
2. **Type Safety & Intellisense**: Provides autocompletion and type safety for every configuration property.
3. **Immutability**: Config objects are frozen during startup, preventing runtime modifications.
4. **Decoupling**: Business logic services receive strongly-typed configuration interfaces via dependency injection, making unit testing and mocking trivial.

---

### 🛡️ Fail-Fast Startup Validation

The application incorporates a strict fail-fast validation engine (`src/config/env.validation.ts`) powered by `class-validator` and `class-transformer`. 

Upon execution of `NestFactory.create(AppModule)`:
1. Environment variables are loaded from `.env.local` and `.env`.
2. Variables are parsed and validated against the `EnvironmentVariables` class schema.
3. **Boot-up Halt**: If any required variable is missing, invalid, or of an unexpected data type, the application immediately terminates startup with explicit, actionable validation logs, preventing runtime crashes or corrupted states.

---

### 🔒 Security Rules & Production Secret Management

1. **Zero Secrets in Source Control**: Never commit real API keys, passwords, or tokens to Git repositories.
2. **Local Overrides Isolation**: Local modifications belong strictly in `.env.local`.
3. **Production Cloud Secrets Integration**: In staging and production environments (ECS / K8s / AWS), `.env` files are not used for credentials. Secrets are managed dynamically using **AWS Secrets Manager** or **AWS Systems Manager (SSM) Parameter Store**. Container environment variables are populated directly into container runtimes via IAM roles or injected securely during pod initialization.

---

### ➕ Guide: How to Add a New Environment Variable

To introduce a new configuration variable (e.g., `THIRD_PARTY_API_KEY`):

1. **Update Root Templates**: Add the key with default local values to `backend/.env`, placeholder values to `backend/.env.example`, and cloud mapping tags to `backend/.env.production`.
2. **Extend Validation Schema**: Update `src/config/env.validation.ts` by adding the property decorated with appropriate validation constraints (`@IsString()`, `@IsNotEmpty()`, etc.).
3. **Register Domain Namespace**: Add the variable getter to the appropriate domain configuration file under `src/config/<domain>/<domain>.config.ts` (or create a new domain under `src/config/`).
4. **Inject into Service**: Inject the configuration token or service into your domain service via NestJS Dependency Injection:
   ```typescript
   constructor(
     @Inject(appConfig.KEY)
     private readonly appConfiguration: ConfigType<typeof appConfig>,
   ) {}
   ```

---

### 🔄 Microservices Reusability Strategy

When domain modules (such as `booking`, `payment`, or `notification`) are extracted from this modular monolith into independent microservices (e.g., `booking-service`):
- The entire `src/config/` module package can be copied directly or published to an internal npm package repository without architectural redesign.
- Microservices inherit identical validation rules, injection patterns, and environment loading semantics out-of-the-box.

---

## 🔐 Enterprise Authentication & Onboarding Architecture

The Wandercall authentication architecture operates as an enterprise-grade, staged onboarding system engineered for ultra-scale multi-device applications (Web, iOS, Android) and modular microservice extraction.

### 🔄 Staged Onboarding Lifecycle & Frontend Workflow Alignment

Authentication follows a multi-phase SaaS onboarding model where accounts are strictly segregated from active platform privileges until profile setup is complete.

```
[ Landing ] ──> [ /signup ] ──> [ Create Account / Google OAuth ] 
                                          │
                                          ▼
                             [ State: PROFILE_INCOMPLETE ]
                                          │
                                          ▼
                                [ /signup/complete ]
                                          │
                                          ▼
                                [ Complete Profile ]
                                          │
                                          ▼
                                [ State: ACTIVE ] ──> [ Home / Profile ]
```

#### Onboarding Phases:
1. **Phase 1 (Account Creation)**: User registers via Email/Password (`/api/v1/auth/register`) or Google OAuth (`/api/v1/auth/google`). Backend persists credentials, creates a multi-device session, generates JWT tokens, and initializes account status as `PROFILE_INCOMPLETE`.
2. **Phase 2 (Profile Customization)**: Frontend redirects user to `/signup/complete`. User selects/uploads profile picture, sets unique username, specifies current location (Geoapify), and fills bio.
3. **Phase 3 (Activation)**: Profile service processes submission (`/api/v1/users/profile/complete`), persists profile metadata, and transitions account state to `ACTIVE`. User gains full platform access.

---

### 🏛️ Decoupled Module & Service Responsibilities

To maintain clean architecture and prevent monolithic coupling, authentication and profile responsibilities are strictly segregated into autonomous domain modules:

| Domain Module | Responsibility | Service Methods / Endpoints | Prohibited Logic |
| :--- | :--- | :--- | :--- |
| **`AuthModule`** (`src/modules/auth/`) | Credentials, OAuth verification, session tokens, password hashing, account lifecycle states. | `/auth/register`<br>`/auth/login`<br>`/auth/google`<br>`/auth/refresh`<br>`/auth/logout` | No profile metadata, no bios, no location queries, no friend/community logic. |
| **`UserModule`** (`src/modules/user/`) | User profiles, username availability, avatars, Geoapify location formatting, bio, privacy settings. | `/users/profile/complete`<br>`/users/username/check`<br>`/users/username/suggestions`<br>`/users/profile/:userId` | No password hashing, no raw token generation, no direct session manipulation. |

---

### 🏷️ Enterprise Account Lifecycle States

Every user account transitions through explicit, immutable lifecycle states:

```
[ PENDING ] ──> [ EMAIL_VERIFIED ] ──> [ PROFILE_INCOMPLETE ] ──> [ ACTIVE ]
                                                                      │
                                                ┌─────────────────────┴─────────────────────┐
                                                ▼                                           ▼
                                          [ SUSPENDED ]                               [ DELETED ]
```

- **`PENDING`**: Account registered, awaiting primary email verification token.
- **`EMAIL_VERIFIED`**: Email confirmed via link/OTP.
- **`PROFILE_INCOMPLETE`**: Authentication established; awaiting profile setup (Username, Avatar, Bio, Location).
- **`ACTIVE`**: Fully onboarded explorer with unrestricted access to bookings, campfires, and quests.
- **`SUSPENDED`**: Temporarily restricted due to security telemetry or moderation triggers.
- **`BLOCKED`**: Permanently revoked access.
- **`DELETED`**: Soft-deleted and anonymized for GDPR compliance.

---

### 🔑 Session Management & Multi-Device Architecture

- **Token Lifecycle**: Short-lived access tokens (1 hour) paired with cryptographically secure, rotating refresh tokens (7 days).
- **Single Active Session per Device Policy**: To prevent database session proliferation and redundant row accumulation, Wandercall enforces a single active session per unique device/browser identity (`deviceFingerprint = SHA256(userId + OS + Browser + DeviceType)`).
- **Session Reuse on Authentication**: Logging in or authenticating from a known browser/device updates the existing unrevoked `UserSessionEntity` record (refresh token hash, IP address, and `lastActive` timestamps) rather than inserting duplicate records.
- **Single-Row Refresh Token Rotation**: Refreshing access tokens (`/api/v1/auth/refresh`) verifies the active session ID, updates the session's refresh token hash, and advances expiration without creating new database rows.
- **Granular & Batch Revocation**: Supports logging out specific devices (`/auth/logout`), revoking individual session IDs (`/auth/sessions/revoke/:sessionId`), terminating all secondary devices (`/auth/sessions/revoke-others`), or revoking all global active sessions (`/auth/sessions/revoke-all`).

---

### 🛡️ Security Philosophy & Protection Layers

1. **Password Hashing Policy**: All local passwords are salted and hashed using `bcrypt` with configurable cost factors retrieved from central configuration (`BCRYPT_SALT_ROUNDS`).
2. **Rate Limiting & Brute-Force Protection**: Auth endpoints are guarded by IP-based sliding window rate limiters (`RATE_LIMIT_TTL`, `RATE_LIMIT_MAX`).
3. **Timing Attack Mitigation**: Credential verification pathways use constant-time comparisons to prevent execution time side-channel analysis.
4. **Opaque Error Messages**: Authentication failures return unified, non-enumerating messages (e.g., *"Invalid credentials provided"*) to prevent user enumeration attacks. Internal database exceptions are trapped and mapped cleanly.

---

### 🌐 Cross-Platform & Microservice Readiness

- **Standardized Payloads**: Standard REST responses with Bearer tokens without browser-bound dependencies, guaranteeing zero-modification compatibility for Next.js, Android (Kotlin), and iOS (Swift).
- **Database Architecture**: Configured out-of-the-box for local PostgreSQL (`DB_NAME=postgres`, `DB_PASSWORD=anmol162004`) with TypeORM/Prisma abstraction layers enabling zero-code-change migration to AWS RDS Aurora.

---

## 📦 Centralized Media Storage Service Architecture

The **Storage Service** (`src/modules/storage`) is Wandercall's enterprise media asset gateway. It decouples all business domain modules (`user`, `feed`, `community`, `experience`, `provider`) from underlying cloud providers (Cloudinary) and provides standardized media handling across Web, iOS, Android, and Desktop platforms.

### 🏛️ Storage Service Architecture & Intent-Based Model

```
Client (Web / Mobile) ──> Gateway ──> Storage Controller ──> Storage Service ──> Validation Layer ──> Cloudinary Provider ──> Global CDN
```

No domain module interacts with Cloudinary directly. All media interactions pass through `StorageService` using explicit **Upload Intents**:
- `PROFILE_AVATAR`: User profile avatars (Max 5MB, 1:1 face crop)
- `PROFILE_BANNER`: User profile header banners (Max 10MB, 3:1 aspect ratio)
- `COMMUNITY_BANNER`: Community header banners (Max 10MB)
- `COMMUNITY_THUMBNAIL`: Community card thumbnails (Max 5MB)
- `COMMUNITY_COVER`: Community detail covers (Max 10MB)
- `FEED_IMAGE`: Feed post media attachments (Max 15MB)
- `EXPERIENCE_IMAGE`: Experience gallery & cover photos (Max 15MB)
- `PROVIDER_IMAGE`: Tour provider identity media (Max 10MB)
- `DOCUMENT`: Verification PDFs / DOCX files (Max 20MB, future ready)
- `CERTIFICATE`: Guide verification certificates (Max 15MB, future ready)

---

### 📁 Cloudinary Folder Organization Strategy

Assets are organized systematically under a single root namespace:

```
wandercall/
├── users/
│   ├── avatars/
│   └── banners/
├── communities/
│   ├── banners/
│   ├── thumbnails/
│   └── covers/
├── feed/
│   └── images/
├── experiences/
│   └── gallery/
├── providers/
├── documents/
└── certificates/
```

### 🆔 Deterministic Public ID Strategy
To enable seamless asset updates and prevent orphan file accumulation, public IDs are deterministically structured:
- **Profile Avatar**: `wandercall/users/avatars/avatar_{userId}`
- **Profile Banner**: `wandercall/users/banners/banner_{userId}`
- **Community Banner**: `wandercall/communities/banners/banner_{communityId}`
- **Feed Image**: `wandercall/feed/images/post_{postId}_{timestamp}`

---

### ⚙️ Cloudinary Configuration

Environment variables in `.env` and `storageConfig`:
```env
STORAGE_DRIVER=cloudinary
CLOUDINARY_CLOUD_NAME=drfndqoql
CLOUDINARY_API_KEY=823945215118359
CLOUDINARY_API_SECRET=ZsfDuNyV7hCAuPj_Q-fxbDiQvYk
CLOUDINARY_URL=cloudinary://823945215118359:ZsfDuNyV7hCAuPj_Q-fxbDiQvYk@drfndqoql
```

---

### 🛡️ Validation Rules & Security Model
Every upload undergoes multi-stage server-side validation:
1. **Authentication**: All endpoints protected by `JwtAuthGuard`. Anonymous uploads strictly rejected.
2. **Buffer Integrity**: Checks against corrupted or empty file buffers (`file.buffer.length > 0`).
3. **Strict Size Limits**: Enforces intent-specific maximum file size boundaries.
4. **MIME Type Validation**: Validates file types (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`).
5. **Sanitized Public IDs**: Generates safe, clean public IDs derived from entity IDs.

---

### 🔄 Asset Lifecycle Workflows

#### 1. Upload Flow
`Client` ──> `POST /api/v1/storage/upload` (multipart/form-data with `file`, `intent`, `entityId`) ──> `StorageService.uploadFile()` ──> Validates & streams to Cloudinary ──> Returns `StorageAssetResponseDto`.

#### 2. Replace Flow (Updating Profile Picture)
`Client` ──> `POST /api/v1/storage/replace` (with `file`, `oldPublicId`, `intent`, `entityId`) ──> Uploads new asset to Cloudinary ──> Deletes previous asset specified by `oldPublicId` ──> Updates domain entity in database with new `avatarUrl` and `avatarPublicId` ──> Invalidates frontend cache.

#### 3. Delete Flow
`Client` ──> `DELETE /api/v1/storage/asset` (with `publicId`) ──> `CloudinaryProvider.deleteAsset()` ──> Clears database reference fields (`null`) ──> Invalidates cache.

---

### 🎨 Transformation Strategy & Optimization
Cloudinary automatically applies real-time optimization and formatting parameters:
- `quality: 'auto'` (Dynamic compression based on viewing device)
- `fetch_format: 'auto'` (Delivers next-gen formats like WebP / AVIF automatically)
- Transformation presets per intent (e.g., `gravity: 'face'` for avatars).

---

### 📄 API Contracts

#### `POST /api/v1/storage/upload`
**Form Data**: `file` (binary), `intent` (string), `entityId` (string)
**Response**:
```json
{
  "publicId": "wandercall/users/avatars/avatar_12345",
  "secureUrl": "https://res.cloudinary.com/drfndqoql/image/upload/v1/wandercall/users/avatars/avatar_12345.jpg",
  "resourceType": "image",
  "width": 500,
  "height": 500,
  "format": "jpg",
  "bytes": 45120,
  "version": 1,
  "folder": "wandercall/users/avatars",
  "createdTimestamp": "2026-06-29T18:00:00.000Z"
}
```

---

### 🚀 Performance, Mobile & Future Readiness
- **Zero Binary Storage in DB**: Stores paired reference URLs and Public IDs (`avatarUrl` + `avatarPublicId`).
- **Mobile Ready**: REST endpoints accept standard `multipart/form-data`, ensuring 100% compatibility with React Native, Android (Kotlin), and iOS (Swift).
- **Future Video & Document Ready**: Architecture designed with multi-resource support (`resourceType: 'image' | 'raw' | 'video' | 'auto'`). Adding video or audio stream processing will reuse the existing Storage Service pipeline without breaking domain modules.

---

## 👥 Public User Profile Discovery & Follow Relationship Architecture

Wandercall implements an enterprise-grade public user profile discovery and scalable follow relationship social graph system, designed for high concurrency and fast performance similarly to Instagram.

### 🏛️ Architecture & Relationship Model
1. **Separation of Concerns**: User auth credentials (`users_auth`) and user session states are isolated from relationship contexts. Follow relationships are managed inside a dedicated `user_follows` table rather than nested columns inside user profiles.
2. **Double-Indexed Social Graph**: The `FollowEntity` table maintains indexed columns for `followerId` and `followingId`, alongside a unique composite index `(followerId, followingId)` to guarantee that double-following is physically impossible and ensure queries scale to millions of records.
3. **Cached Metric Counters**: To avoid expensive full-table aggregation scans (`COUNT`) on profile load, cached columns `followerCount` and `followingCount` are placed in `users_profile`. These are dynamically updated via atomic TypeORM database transactions during follow/unfollow operations to prevent race conditions.

### 🔄 Relationship Lifecycle Workflows
```mermaid
sequenceDiagram
    participant Client
    participant Controller as UserController
    participant Service as FollowService
    participant DB as Database (Postgres)

    Client->>Controller: POST /users/follow/:username (JWT Auth)
    Controller->>Service: followUser(currentUserId, targetUsername)
    Service->>DB: Lookup Target Profile by username
    alt Username not found
        Service-->>Client: 404 Not Found
    else Username found
        Service->>DB: Check existing relationship / self-following
        alt Invalid relationship (self or duplicate)
            Service-->>Client: 400 Bad Request
        else Valid relationship
            rect rgb(20, 20, 25)
                Note over Service,DB: TypeORM Database Transaction (ACID)
                Service->>DB: Insert Follow Entity (followerId, followingId)
                Service->>DB: Increment target followerCount +1
                Service->>DB: Increment follower followingCount +1
            end
            DB-->>Service: Transaction Success
            Service-->>Client: 200 OK { state: 'Following' }
        end
    end
```

### ⚡ Client State & Invalidation Strategy
1. **State Segregation**: Redux Toolkit handles only ephemeral UI states (modal triggers, tabs selection, search query values). Server states (profile data, relationship statuses, paginated connections lists) are managed entirely by TanStack Query.
2. **Optimistic Updates**: Following/unfollowing triggers mutations that immediately flip the client-side relationship state and adjust profile counts. The client UI responds instantly to user gestures, rolling back to query cache snapshots automatically if the API reports a failure.
3. **Cursor-Based Pagination & Search**: Followers/following modals utilize cursor pagination (`createdAt` timestamps) to bypass heavy SQL offset scans. Debounced inputs trigger database-level `LIKE` queries to filter matches without over-fetching or client-side overhead.

### 📄 API Contracts
#### `GET /api/v1/users/profile/username/:username` (Public)
- Resolves username to public profile. Excludes private fields (email, phone coordinates, internal permissions).
- **Response DTO**: `PublicProfileResponseDto`

#### `GET /api/v1/users/relationship/:username` (Authenticated)
- Evaluates relationship state from current user to target.
- **Response**: `{ state: 'Following' | 'Not Following' | 'Requested' | 'Blocked' | 'Self' }`

#### `POST /api/v1/users/follow/:username` & `POST /api/v1/users/unfollow/:username` (Authenticated)
- Adds or removes follow records and updates cache counters.
- **Response**: `{ state: 'Following' | 'Not Following' }`

#### `GET /api/v1/users/:username/followers` & `GET /api/v1/users/:username/following` (Public)
- Lists connections matching optional search queries, supporting cursor pagination.
- **Response**: `{ items: FollowerPreviewDto[], nextCursor?: string }`

---

## 🔐 Enterprise Role-Based Access Control (RBAC) Foundation

Wandercall features a scalable, enterprise-grade Role-Based Access Control (RBAC) foundation to prepare the platform for future Host and Admin capabilities.

### 1. Centralized Role Definitions
All authorization behaviors depend on a single source of truth defined in the shared `UserRole` enum (`backend/src/modules/auth/enums/user-role.enum.ts`):
- `INDIVIDUAL`: Default explorer. Can book experiences, join campfires, create feed posts, and manage their profiles.
- `HOST`: Reserved role for travel guides and organizers (unlocked post-KYC verification).
- `ADMIN`: Reserved role for internal Wandercall administrators to manage moderation, approvals, and analytics.

### 2. Separation of Concerns & Storage Strategy
The primary user role is stored inside the **`users_auth`** credential table rather than the profile table. Because roles represent core identity authentication claims (rather than public profile metadata), this ensures:
- Clean data separation between credentials (`users_auth`) and user profiles (`users_profiles`).
- Tamper-proof role resolution directly inside the authentication microservice.

### 3. Signup & Login Lifecycle
- During registration (`/auth/register` or `/auth/google`), the backend automatically sets the default user role to `INDIVIDUAL`. No client-side inputs or manual role assignments are allowed.
- Successful login responses and token refreshes include the user's active `role` inside the `AuthUserDto` response payload.
- The JWT access token payload contains a compact `role` claim, enabling fast local authorization checks by middleware/gateways without repetitive database queries.

### 4. Future Transitions & Scalability
- **Become a Host**: Upgrading a user to a `HOST` requires only modifying the `role` field on their credentials row (e.g. after KYC validation is approved). No database migrations or architectural shifts are required.
- **Admin Dashboard**: Admin accounts simply carry the `ADMIN` role, which grants authorization access to future administrative modules.

### 5. Future-Ready Route Authorization (Guards & Decorators)
The platform establishes decorators and guards to easily secure routes in the future:
- **`@Roles(...roles: UserRole[])`**: Annotates target controller routes with required authorization levels.
- **`RolesGuard`**: Extracts route role metadata using the NestJS `Reflector` and validates it against `request.user.role` extracted from the JWT token passport strategy.

### 6. Existing Users Migration (Backfill)
Existing user accounts without a designated role are handled safely at application startup. The `DatabaseInitializerService` automatically executes a safe database query on boot:
```sql
UPDATE users_auth SET role = 'INDIVIDUAL' WHERE role IS NULL;
```
This ensures zero service disruption for existing users.

---

## 📢 Enterprise Feed & Recommendation Engine Service

The Feed Bounded Context is implemented not as a simple CRUD posts system, but as an enterprise-grade, high-throughput personalized recommendation engine designed for millions of daily active users. Every feed retrieval query is treated as a recommendation evaluation: **"What should THIS particular user see RIGHT NOW?"**

### 📐 Module Folder Structure
```
src/modules/feed/
├── config/
│   └── ranking.config.ts          # Scoring weights, freshness decay coefficients, penalties
├── constants/                     # Module error constants
├── controllers/
│   └── feed.controller.ts         # Endpoints for publishing, likes, bookmarks, cursor queries
├── dto/
│   ├── create-post-request.dto.ts # Validates coordinates logging inputs
│   ├── update-post-request.dto.ts # Validates coordinate edits
│   ├── feed-query.dto.ts          # Validates type filters & cursors
│   └── comment-request.dto.ts     # Validates post comments inputs
├── entities/
│   ├── post.entity.ts             # Primary post metadata, coordinates, categories, metrics
│   ├── post-like.entity.ts        # Unique user-post like mapping
│   ├── post-save.entity.ts        # Unique user-post bookmarks mapping
│   ├── post-comment.entity.ts     # Post comments
│   ├── user-interest.entity.ts    # Lightweight category affinity vector per user
│   ├── user-interaction.entity.ts # Telemetry telemetry interaction logging
│   └── feed-impression.entity.ts  # Historical impression records to avoid repetition fatigue
├── events/
│   └── feed-event.dispatcher.ts   # Decoupled Node EventEmitter for domain/integration events
├── repositories/
│   ├── post.repository.ts         # Candidate retrieval queries with database-level visibility checks
│   └── interaction.repository.ts  # CRUD for likes, saves, comments, impressions, and interests
└── services/
    ├── post.service.ts            # CRUD orchestration, uploads validation, status state machine
    ├── ranking.engine.ts          # Freshness decays, engagement scalars, interest scores
    ├── interest.engine.ts         # User activity affinity processors
    └── recommendation.engine.ts   # Cursor parsing, candidate filters, diversity re-ranking, batch stitching
```

---

### 🏛️ System Architecture & Recommendation Pipeline
```mermaid
sequenceDiagram
    autonumber
    actor User as Explorer Client
    participant API as FeedController
    participant Recs as RecommendationEngine
    participant DB as Post/Interaction Repository
    participant Rank as RankingEngine
    participant Users as UserModule (UserService)

    User->>API: GET /feed (cursor, feedType)
    API->>Recs: getPersonalizedFeed(viewerId, query)
    
    critical Generate Candidates
        Recs->>DB: getCandidates(viewerId, followedCreatorIds)
        DB-->>Recs: return candidate list (top 500 published posts)
    end

    opt Viewer is Authenticated
        Recs->>DB: getImpressions(viewerId)
        DB-->>Recs: return previously seen post IDs
        Recs->>DB: getUserInterestMap(viewerId)
        DB-->>Recs: return category interest score vector
    end

    loop For each candidate post
        Recs->>Rank: scorePost(post, viewerId, userInterests, follows, seen)
        Note over Rank: Calculate Freshness, Engagement, Interests,<br/>Relationship boosts, and Seen penalties.
        Rank-->>Recs: return recommendation score
    end

    Note over Recs: Apply Creator & Category Diversity Re-ranking<br/>(Demote consecutive repeats)
    Note over Recs: Slice page according to Cursor offset limits
    
    rect rgb(20, 20, 25)
        Note over Recs,Users: Batch stitch profiles (Avoid N+1 queries)
        Recs->>Users: findByUserId(authorIds)
        Users-->>Recs: return creator profile metadata
    end

    Recs-->>API: return items page + next base64 cursor
    API-->>User: HTTP 200 OK (Paginated feed response)
```

---

### ⏱️ Post Lifecycle State Machine
Wandercall tracks posts through modular status states rather than a simple published flag:
1. **DRAFT**: Entity initialized with owner ID and baseline parameters.
2. **VALIDATING**: Checked against required constraints (title presence, categories, story length >= 50 chars).
3. **IMAGE_VERIFIED**: Images uploaded using `StorageService` to Cloudinary. Verified that at least 1 image exists.
4. **METADATA_GENERATED**: Optional audio note uploaded to Cloudinary. Tag mappings created and initial AI quality score set.
5. **PUBLISHED**: Post set to `publishedAt = Date.now()` and becomes indexable by recommendation generators.
6. **DELETED**: Post removed and Cloudinary resources garbage collected.

---

### 🧮 Personalization & Scoring Formula
The recommendation engine evaluates posts using a multi-factor scorer:
$$Score = \Big( W_{interest} \cdot S_{interest} + W_{relationship} \cdot S_{relationship} + W_{freshness} \cdot S_{freshness} + W_{engagement} \cdot S_{engagement} \Big) \cdot Penalty_{seen} \cdot Score_{AI}$$

- **Freshness Score ($S_{freshness}$)**: Derived using an exponential time decay: $S_{freshness} = e^{-k \cdot t_{days}}$ where $k$ is the decay rate (default `0.15`) and $t_{days}$ is the time since publication.
- **Engagement Score ($S_{engagement}$)**: Derived using a saturation curve: $S_{engagement} = \frac{E}{E + 15}$ where $E$ is the weighted engagement sum: $E = 1 \cdot Likes + 2 \cdot Comments + 3 \cdot Saves + 4 \cdot Shares$.
- **Interest Score ($S_{interest}$)**: Saturation mapped: $\frac{A}{A + 5}$ where $A$ is the cumulative interest score for the category updated when users like (+1), comment (+2), save (+3), share (+4), or view (+0.2) content.
- **Relationship Score ($S_{relationship}$)**: Binary boost (`1.0` if viewer follows creator, `0.0` otherwise).
- **Seen fatigue ($Penalty_{seen}$)**: If the post ID matches the viewer's impression history, score is multiplied by `0.20` to demote it.

---

### 🌊 Infinite Scroll & Stable Cursors
To avoid duplicates or missing items on scrolling while pages are ranked dynamically:
- Cursors are represented as base64-encoded strings: `Buffer.from(JSON.stringify({ timestamp, offset, feedType, category })).toString('base64')`.
- Freshness calculations are evaluated relative to the cursor's `timestamp` (the exact instant the user began viewing the feed) rather than `Date.now()`. This ensures that post scoring is frozen and static throughout the user's paginated session, allowing stable offset cursors.

---

### 🧩 Future AI & Search Extension Points
- **AI Moderation & Quality scoring**: Post entity contains `aiQualityScore: number` and `aiMetadata: jsonb` fields. Future AI pipelines can run asynchronously on `PostPublished` events to update these scores or flag content.
- **Search Engine Synchronization**: Search indexes are isolated from database schemas. Future Elasticsearch/Meilisearch synchronization services can listen to `post.published`, `post.updated`, and `post.deleted` events from `FeedEventDispatcher` to index metadata out-of-band.

---

### 📁 Database Relationships
- **`posts`**:
  - `authorId` -> maps to `users_profile.userId` (logical relationship, no database-level joins to maintain microservice readiness).
- **`post_likes`** / **`post_saves`** / **`post_comments`**:
  - `postId` -> foreign key to `posts.id` (ON DELETE CASCADE).
  - `userId` -> maps to `users_profile.userId`.
- **`user_interests`** / **`user_interactions`** / **`feed_impressions`**:
  - Indexed by `userId` to speed up personalized query loops.

---

### 🔐 Security & Publishing Rules
1. **Ownership Enforcement**: Edits and deletions verify that `request.user.userId === post.authorId` (except for `ADMIN` override).
2. **RBAC Rules**: User roles determine authorship:
   - `INDIVIDUAL` publishes as author type `INDIVIDUAL`.
   - `HOST` publishes as author type `HOST` (indicated in UI badges).
   - `ADMIN` publishes official system coordinates as `OFFICIAL`.
3. **Storage Sanitization**: File uploads enforce MIME restrictions (JPG/PNG/WEBP for images, MP3/WAV/WebM for audio coordinates) and size limits (15MB images, 10MB audio) to prevent resource fatigue.

---

### 📄 API Documentation

#### `GET /api/v1/feed` (Guest allowed)
- Retrieves feed according to type.
- **Query Params**:
  - `feedType`: `'global' | 'following' | 'trending' | 'recent' | 'category'`
  - `category`: string (e.g. `'story'`, `'memory'`, `'food'`)
  - `limit`: number (default `10`)
  - `cursor`: string (base64 string representing pagination context)
- **Response**: `{ items: FeedPostDto[], nextCursor?: string }`

#### `POST /api/v1/feed/posts` (Authenticated)
- Creates coordinates log with attachments (Multipart Form-Data).
- **Body Params**: `title`, `content` (min 50 chars), `category`, `visibility` (`PUBLIC`|`FOLLOWERS`|`PRIVATE`), location coordinates, and metadata.
- **File Uploads**: `images` (up to 4 files, required), `audio` (up to 1 file, optional).

#### `PATCH /api/v1/feed/posts/:id` (Authenticated)
- Updates title, description, category, or visibility of a post.

#### `DELETE /api/v1/feed/posts/:id` (Authenticated)
- Deletes post and triggers Cloudinary media asset garbage collection.

#### `POST /api/v1/feed/posts/:id/like` & `DELETE /api/v1/feed/posts/:id/like`
- Likes or unlikes post; dynamically adjusts category interests score.

#### `POST /api/v1/feed/posts/:id/save` & `DELETE /api/v1/feed/posts/:id/save`
- Bookmarks or un-bookmarks post.

#### `POST /api/v1/feed/posts/:id/comments` & `GET /api/v1/feed/posts/:id/comments`
- Adds comments or retrieves post comment thread.

#### `POST /api/v1/feed/posts/:id/share`
- Tracks sharing interaction (updates engagement scores).

#### `POST /api/v1/feed/posts/:id/view`
- Logs impression in database to apply seen fatigue penalty.

