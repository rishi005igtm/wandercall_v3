# Graph Report - wandercall_v3  (2026-07-02)

## Corpus Check
- 189 files · ~173,211 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1089 nodes · 2092 edges · 64 communities (50 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f9906b28`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Auth Component|Auth Component]]
- [[_COMMUNITY_Page Component|Page Component]]
- [[_COMMUNITY_Dev Dependencies Component|Dev Dependencies Component]]
- [[_COMMUNITY_Storage Service Component|Storage Service Component]]
- [[_COMMUNITY_Use App Selector Component|Use App Selector Component]]
- [[_COMMUNITY_Config Component|Config Component]]
- [[_COMMUNITY_Post Entity Component|Post Entity Component]]
- [[_COMMUNITY_App Component|App Component]]
- [[_COMMUNITY_Use User Mutations Component|Use User Mutations Component]]
- [[_COMMUNITY_Page Component|Page Component]]
- [[_COMMUNITY_Use Auth Mutations Component|Use Auth Mutations Component]]
- [[_COMMUNITY_Dependencies Component|Dependencies Component]]
- [[_COMMUNITY_Feed Component|Feed Component]]
- [[_COMMUNITY_User Controller Component|User Controller Component]]
- [[_COMMUNITY_Page Component|Page Component]]
- [[_COMMUNITY_Feed Component|Feed Component]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Compiler Options Component|Compiler Options Component]]
- [[_COMMUNITY_Interaction Repository Component|Interaction Repository Component]]
- [[_COMMUNITY_Page Component|Page Component]]
- [[_COMMUNITY_Page Component|Page Component]]
- [[_COMMUNITY_Store Component|Store Component]]
- [[_COMMUNITY_User Service Component|User Service Component]]
- [[_COMMUNITY_Recommendation Component|Recommendation Component]]
- [[_COMMUNITY_Page Component|Page Component]]
- [[_COMMUNITY_Page Component|Page Component]]
- [[_COMMUNITY_Page Component|Page Component]]
- [[_COMMUNITY_Scripts Component|Scripts Component]]
- [[_COMMUNITY_User Component|User Component]]
- [[_COMMUNITY_User Repository Component|User Repository Component]]
- [[_COMMUNITY_Layout Component|Layout Component]]
- [[_COMMUNITY_Page Component|Page Component]]
- [[_COMMUNITY_Dependencies Component|Dependencies Component]]
- [[_COMMUNITY_Page Component|Page Component]]
- [[_COMMUNITY_Page Component|Page Component]]
- [[_COMMUNITY_Recommendation Engine Component|Recommendation Engine Component]]
- [[_COMMUNITY_Jest Component|Jest Component]]
- [[_COMMUNITY_Package Component|Package Component]]
- [[_COMMUNITY_Dev Dependencies Component|Dev Dependencies Component]]
- [[_COMMUNITY_Post Save Entity Component|Post Save Entity Component]]
- [[_COMMUNITY_Page Component|Page Component]]
- [[_COMMUNITY_Package Component|Package Component]]
- [[_COMMUNITY_Page Component|Page Component]]
- [[_COMMUNITY_Page Component|Page Component]]
- [[_COMMUNITY_Nest Cli Component|Nest Cli Component]]
- [[_COMMUNITY_Adventure D N A Component|Adventure D N A Component]]
- [[_COMMUNITY_Tsconfig Component|Tsconfig Component]]
- [[_COMMUNITY_Quests Component|Quests Component]]
- [[_COMMUNITY_Check Username Component|Check Username Component]]
- [[_COMMUNITY_Eslint Component|Eslint Component]]
- [[_COMMUNITY_Next Component|Next Component]]
- [[_COMMUNITY_Postcss Component|Postcss Component]]
- [[_COMMUNITY_📢 Enterprise Feed & Recommendation Engine Service|📢 Enterprise Feed & Recommendation Engine Service]]
- [[_COMMUNITY_🏗️ Frontend State Management & Enterprise API Architecture|🏗️ Frontend State Management & Enterprise API Architecture]]
- [[_COMMUNITY_🔐 Enterprise Authentication & Onboarding Architecture|🔐 Enterprise Authentication & Onboarding Architecture]]
- [[_COMMUNITY_🔐 Enterprise Role-Based Access Control (RBAC) Foundation|🔐 Enterprise Role-Based Access Control (RBAC) Foundation]]
- [[_COMMUNITY_🎯 Architectural Philosophy & Core Principles|🎯 Architectural Philosophy & Core Principles]]
- [[_COMMUNITY_DatabaseInitializerService|DatabaseInitializerService]]
- [[_COMMUNITY_graphify|graphify.md]]
- [[_COMMUNITY_graphify|graphify.md]]
- [[_COMMUNITY_AGENTS|AGENTS.md]]

## God Nodes (most connected - your core abstractions)
1. `InteractionRepository` - 28 edges
2. `UserController` - 27 edges
3. `AuthRepository` - 26 edges
4. `useAppSelector` - 24 edges
5. `PostEntity` - 23 edges
6. `PostRepository` - 20 edges
7. `UserService` - 20 edges
8. `compilerOptions` - 20 edges
9. `AuthService` - 19 edges
10. `UserRepository` - 19 edges

## Surprising Connections (you probably didn't know these)
- `BookingSummary()` --references--> `react`  [EXTRACTED]
  client/components/booking/BookingSummary.tsx → client/package.json
- `UserProfileResponseDto` --references--> `UserRole`  [EXTRACTED]
  backend/src/modules/user/dto/user-profile-response.dto.ts → backend/src/modules/auth/enums/user-role.enum.ts
- `CreatePostParams` --references--> `PostVisibility`  [EXTRACTED]
  backend/src/modules/feed/services/post.service.ts → backend/src/modules/feed/entities/post.entity.ts
- `UpdatePostParams` --references--> `PostVisibility`  [EXTRACTED]
  backend/src/modules/feed/services/post.service.ts → backend/src/modules/feed/entities/post.entity.ts
- `ExplorerFeedPage()` --calls--> `useAppSelector`  [EXTRACTED]
  client/app/feed/page.tsx → client/lib/store/store.ts

## Import Cycles
- None detected.

## Communities (64 total, 14 thin omitted)

### Community 0 - "Auth Component"
Cohesion: 0.05
Nodes (19): AuthController, AuthResponseDto, AuthUserDto, GoogleAuthRequestDto, LoginRequestDto, RefreshTokenRequestDto, RegisterRequestDto, UserAuthEntity (+11 more)

### Community 1 - "Page Component"
Cohesion: 0.07
Nodes (26): BookingPage(), EXPERIENCES_CATALOG, BookingStepperProps, BookingSummary(), BookingSummaryProps, AvailabilityLegend(), CalendarProps, DateDetailsPanelProps (+18 more)

### Community 2 - "Dev Dependencies Component"
Cohesion: 0.05
Nodes (43): devDependencies, eslint, eslint-config-prettier, @eslint/eslintrc, @eslint/js, eslint-plugin-prettier, globals, jest (+35 more)

### Community 3 - "Storage Service Component"
Cohesion: 0.11
Nodes (12): StorageController, DeleteAssetRequestDto, ReplaceAssetRequestDto, StorageAssetResponseDto, UploadAssetRequestDto, UploadIntent, IStorageAssetMetadata, IStorageService (+4 more)

### Community 4 - "Use App Selector Component"
Cohesion: 0.04
Nodes (19): ExperienceDetail, EXPERIENCES_DATABASE, FAQItem, HostProfile, ReviewComment, StoryBlock, TimelineStop, ExperienceItem (+11 more)

### Community 5 - "Config Component"
Cohesion: 0.09
Nodes (20): aiConfig, analyticsConfig, appConfig, cacheConfig, AppConfigModule, databaseConfig, Environment, EnvironmentVariables (+12 more)

### Community 6 - "Post Entity Component"
Cohesion: 0.11
Nodes (4): PostEntity, FeedEventDispatcher, PostRepository, PostService

### Community 7 - "App Component"
Cohesion: 0.19
Nodes (9): AppModule, AuthModule, FeedModule, StorageModule, UserPlanEntity, UserProfileEntity, UserSettingsEntity, UserRepository (+1 more)

### Community 8 - "Use User Mutations Component"
Cohesion: 0.16
Nodes (17): ExplorerProfilePage(), CompanionAvatarProps, ProfileRenderer(), ProfileRendererProps, useFollowMutation(), useUnfollowMutation(), useUploadCoverImageMutation(), useFollowersInfiniteQuery() (+9 more)

### Community 9 - "Page Component"
Cohesion: 0.17
Nodes (17): categories, ExplorerFeedPage(), FeedImageGalleryProps, UserMemoriesPage(), useCommentMutation(), useCommentsQuery(), useDeletePostMutation(), useFeedInfiniteQuery() (+9 more)

### Community 10 - "Use Auth Mutations Component"
Cohesion: 0.18
Nodes (18): LoginPage(), SignupPage(), useGoogleAuthMutation(), useLoginMutation(), useLogoutMutation(), useResendVerificationMutation(), useSignupMutation(), useVerifyEmailMutation() (+10 more)

### Community 11 - "Dependencies Component"
Cohesion: 0.09
Nodes (23): dependencies, bcrypt, class-transformer, class-validator, cloudinary, @nestjs/common, @nestjs/config, @nestjs/core (+15 more)

### Community 12 - "Feed Component"
Cohesion: 0.13
Nodes (8): FeedController, CommentRequestDto, CreatePostRequestDto, FeedQueryDto, UpdatePostRequestDto, PostVisibility, CreatePostParams, UpdatePostParams

### Community 13 - "User Controller Component"
Cohesion: 0.11
Nodes (7): UserController, CompleteProfileRequestDto, PublicProfileResponseDto, UpdateProfileRequestDto, UserPlanDto, UserProfileResponseDto, UserSettingsDto

### Community 14 - "Page Component"
Cohesion: 0.09
Nodes (18): CampfireRoom, CARD_GRADIENTS, CATEGORIES, CompanionAvatarProps, FEATURED_EVENTS, FloatingEmoji, INITIAL_CAMPFIRES, INITIAL_HOSTED_ROOMS (+10 more)

### Community 15 - "Feed Component"
Cohesion: 0.25
Nodes (6): FeedImpressionEntity, PostCommentEntity, PostLikeEntity, InteractionType, UserInteractionEntity, UserInterestEntity

### Community 17 - "Compiler Options Component"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+12 more)

### Community 19 - "Page Component"
Cohesion: 0.17
Nodes (17): ActiveSession, ADVENTURE_CATEGORIES_LIST, ADVENTURE_DNA_DNA_BADGES, INITIAL_SESSIONS, SessionDisplayItem, SETTINGS_SECTIONS, SettingsPage(), SettingsTab (+9 more)

### Community 20 - "Page Component"
Cohesion: 0.12
Nodes (15): ACTIVITY_FEED, BLOCKED_USERS, Companion, CompanionAvatarProps, CompanionProps, COMPANIONS, DEFAULT_CAMPFIRES, FriendsPage() (+7 more)

### Community 21 - "Store Component"
Cohesion: 0.09
Nodes (18): geistMono, geistSans, metadata, AUTH_ONLY_ROUTES, AuthGuard(), GUEST_ONLY_ROUTES, SmoothScroll(), SmoothScrollProps (+10 more)

### Community 23 - "Recommendation Component"
Cohesion: 0.28
Nodes (7): RANKING_CONFIG, PostAuthorType, PostStatus, InterestEngine, RankingEngine, FeedCursor, FeedQueryDto

### Community 24 - "Page Component"
Cohesion: 0.13
Nodes (13): ALL_COMMUNITIES, CATEGORY_WALLPAPERS, ChatMessage, CommunityNode, INITIAL_CAMPFIRES, INITIAL_CHAT_MESSAGES, INITIAL_EXPERIENCES, INITIAL_GALLERY (+5 more)

### Community 25 - "Page Component"
Cohesion: 0.11
Nodes (17): 1. Data Model & DTOs, 2. Optional Authentication & Relationship State, 3. Caching and Invalidation Strategy, 4. Image Rendering & Fail-safes, Admin, 💻 Client Dev Setup, 🔐 Enterprise Authentication & Multi-Tenant User Session Architecture, Experience Provider (+9 more)

### Community 26 - "Page Component"
Cohesion: 0.15
Nodes (13): CATEGORIES, Friend, FRIENDS_LIST, LocationData, TEMPLATE_WALLPAPERS, SignupCompleteContent(), LocationSearch(), LocationSearchProps (+5 more)

### Community 27 - "Scripts Component"
Cohesion: 0.15
Nodes (13): scripts, build, format, lint, start, start:debug, start:dev, start:prod (+5 more)

### Community 28 - "User Component"
Cohesion: 0.22
Nodes (12): categories, CreatePostPage(), Home(), bottomMenuVariants, navItems, ProfileLayout(), ProfilePage(), Navbar() (+4 more)

### Community 29 - "User Repository Component"
Cohesion: 0.20
Nodes (3): FollowerPreviewDto, FollowEntity, FollowRepository

### Community 30 - "Layout Component"
Cohesion: 0.14
Nodes (14): 1. Upload Flow, 2. Replace Flow (Updating Profile Picture), 3. Delete Flow, 📄 API Contracts, 🔄 Asset Lifecycle Workflows, 📦 Centralized Media Storage Service Architecture, ⚙️ Cloudinary Configuration, 📁 Cloudinary Folder Organization Strategy (+6 more)

### Community 31 - "Page Component"
Cohesion: 0.18
Nodes (11): AudioMessagePlayer(), Companion, CompanionAvatarProps, CompanionProps, COMPANIONS, DEFAULT_CAMPFIRES, getIcebreakers(), INITIAL_MESSAGES (+3 more)

### Community 32 - "Dependencies Component"
Cohesion: 0.06
Nodes (30): dependencies, axios, framer-motion, lenis, lucide-react, next, react-dom, react-redux (+22 more)

### Community 33 - "Page Component"
Cohesion: 0.18
Nodes (8): ALL_COMMUNITIES, CLUSTER_METADATA, ClusterMeta, CommunitiesPage(), CommunityNode, CommunityTrophy, CompanionOrbitNode, JoinedCommunity

### Community 34 - "Page Component"
Cohesion: 0.18
Nodes (7): CampfireRoom, CompanionAvatarProps, FloatingEmoji, INITIAL_CAMPFIRES, INITIAL_HOSTED_ROOMS, Listener, Speaker

### Community 36 - "Jest Component"
Cohesion: 0.22
Nodes (9): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+1 more)

### Community 37 - "Package Component"
Cohesion: 0.17
Nodes (11): 🚫 Architectural Boundary Rules & Dependency Mandates, Code Artifact Naming, 📐 Coding Standards & Naming Conventions, 🌐 Enterprise Domain Modules (19 Bounded Contexts), File & Directory Naming, 🚀 Microservice Migration Strategy, ⚡ Performance & Resilience Architecture, 📁 Repository Directory Structure (+3 more)

### Community 38 - "Dev Dependencies Component"
Cohesion: 0.20
Nodes (10): 📄 API Documentation, `DELETE /api/v1/feed/posts/:id` (Authenticated), `GET /api/v1/feed` (Guest allowed), `PATCH /api/v1/feed/posts/:id` (Authenticated), `POST /api/v1/feed/posts` (Authenticated), `POST /api/v1/feed/posts/:id/comments` & `GET /api/v1/feed/posts/:id/comments`, `POST /api/v1/feed/posts/:id/like` & `DELETE /api/v1/feed/posts/:id/like`, `POST /api/v1/feed/posts/:id/save` & `DELETE /api/v1/feed/posts/:id/save` (+2 more)

### Community 39 - "Post Save Entity Component"
Cohesion: 0.20
Nodes (10): 🎯 Configuration Philosophy & Dependency Flow, Dependency Flow:, ⚙️ Enterprise Environment Configuration Architecture, 📁 Environment File Strategy & Root Placement, 🛡️ Fail-Fast Startup Validation, ➕ Guide: How to Add a New Environment Variable, 🔄 Microservices Reusability Strategy, Purpose of Each File: (+2 more)

### Community 40 - "Page Component"
Cohesion: 0.25
Nodes (5): Booking, filterTabs, Friend, Host, initialBookings

### Community 41 - "Package Component"
Cohesion: 0.29
Nodes (6): author, description, license, name, private, version

### Community 42 - "Page Component"
Cohesion: 0.29
Nodes (6): Achievement, ActiveQuest, LadderStep, LeaderboardUser, QuestStory, Region

### Community 43 - "Page Component"
Cohesion: 0.29
Nodes (5): Experience, Host, initialDropdownCollections, initialExperiences, mainCollections

### Community 44 - "Nest Cli Component"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 45 - "Adventure D N A Component"
Cohesion: 0.22
Nodes (9): 📄 API Contracts, 🏛️ Architecture & Relationship Model, ⚡ Client State & Invalidation Strategy, `GET /api/v1/users/profile/username/:username` (Public), `GET /api/v1/users/relationship/:username` (Authenticated), `GET /api/v1/users/:username/followers` & `GET /api/v1/users/:username/following` (Public), `POST /api/v1/users/follow/:username` & `POST /api/v1/users/unfollow/:username` (Authenticated), 👥 Public User Profile Discovery & Follow Relationship Architecture (+1 more)

### Community 54 - "📢 Enterprise Feed & Recommendation Engine Service"
Cohesion: 0.22
Nodes (9): 📁 Database Relationships, 📢 Enterprise Feed & Recommendation Engine Service, 🧩 Future AI & Search Extension Points, 🌊 Infinite Scroll & Stable Cursors, 📐 Module Folder Structure, 🧮 Personalization & Scoring Formula, ⏱️ Post Lifecycle State Machine, 🔐 Security & Publishing Rules (+1 more)

### Community 55 - "🏗️ Frontend State Management & Enterprise API Architecture"
Cohesion: 0.22
Nodes (8): ⏱️ Caching & Invalidation Strategy, Deploy on Vercel, 📁 Enterprise Directory Architecture (`client/lib/`), 🏗️ Frontend State Management & Enterprise API Architecture, Getting Started, Learn More, 🏛️ Responsibilities Matrix, 🔑 Token Lifecycle & Silent Refresh Rotation

### Community 56 - "🔐 Enterprise Authentication & Onboarding Architecture"
Cohesion: 0.25
Nodes (8): 🌐 Cross-Platform & Microservice Readiness, 🏛️ Decoupled Module & Service Responsibilities, 🏷️ Enterprise Account Lifecycle States, 🔐 Enterprise Authentication & Onboarding Architecture, Onboarding Phases:, 🛡️ Security Philosophy & Protection Layers, 🔑 Session Management & Multi-Device Architecture, 🔄 Staged Onboarding Lifecycle & Frontend Workflow Alignment

### Community 57 - "🔐 Enterprise Role-Based Access Control (RBAC) Foundation"
Cohesion: 0.29
Nodes (7): 1. Centralized Role Definitions, 2. Separation of Concerns & Storage Strategy, 3. Signup & Login Lifecycle, 4. Future Transitions & Scalability, 5. Future-Ready Route Authorization (Guards & Decorators), 6. Existing Users Migration (Backfill), 🔐 Enterprise Role-Based Access Control (RBAC) Foundation

### Community 58 - "🎯 Architectural Philosophy & Core Principles"
Cohesion: 0.50
Nodes (4): 1. Domain-Driven Design (DDD) Bounded Contexts, 2. Modular Monolith Evolving into Microservices, 3. Stateless Application & Scalability, 🎯 Architectural Philosophy & Core Principles

## Knowledge Gaps
- **374 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+369 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Page Component` to `Dependencies Component`, `Page Component`, `Use Auth Mutations Component`, `Page Component`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `SignupPage()` connect `Use Auth Mutations Component` to `User Component`, `Page Component`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `User Component` to `Use App Selector Component`, `Use User Mutations Component`, `Page Component`, `Use Auth Mutations Component`, `Page Component`, `Store Component`, `Page Component`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _374 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth Component` be split into smaller, more focused modules?**
  _Cohesion score 0.050505050505050504 - nodes in this community are weakly interconnected._
- **Should `Page Component` be split into smaller, more focused modules?**
  _Cohesion score 0.07482993197278912 - nodes in this community are weakly interconnected._
- **Should `Dev Dependencies Component` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._