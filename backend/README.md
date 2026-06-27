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
