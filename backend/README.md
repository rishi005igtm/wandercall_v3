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
- **Multi-Device Tracking**: Each login creates an active record in `UserSessionEntity` storing `userId`, `refreshTokenHash`, `ipAddress`, and `deviceInfo`.
- **Granular Revocation**: Supports logging out a single device (`/auth/logout`) or terminating all active global sessions across Web, iOS, and Android devices upon security events.

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


