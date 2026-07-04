# Graph Report - wandercall_v3  (2026-07-04)

## Corpus Check
- 208 files · ~177,958 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1200 nodes · 2446 edges · 68 communities (54 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0669c7fe`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Auth Backend Module|Auth Backend Module]]
- [[_COMMUNITY_Client Booking Module|Client Booking Module]]
- [[_COMMUNITY_Backend Package Module|Backend Package Module]]
- [[_COMMUNITY_Storage Backend Module|Storage Backend Module]]
- [[_COMMUNITY_Client Components Module|Client Components Module]]
- [[_COMMUNITY_Config Backend Module|Config Backend Module]]
- [[_COMMUNITY_Client App Module|Client App Module]]
- [[_COMMUNITY_User Backend Module|User Backend Module]]
- [[_COMMUNITY_Client Package Module|Client Package Module]]
- [[_COMMUNITY_Feed Backend Module|Feed Backend Module]]
- [[_COMMUNITY_Client Feed Module|Client Feed Module]]
- [[_COMMUNITY_Feed Backend Module|Feed Backend Module]]
- [[_COMMUNITY_User Backend Module|User Backend Module]]
- [[_COMMUNITY_Feed Backend Module|Feed Backend Module]]
- [[_COMMUNITY_Client Store Module|Client Store Module]]
- [[_COMMUNITY_Backend Package Module|Backend Package Module]]
- [[_COMMUNITY_Campfires Client Module|Campfires Client Module]]
- [[_COMMUNITY_Feed Backend Module|Feed Backend Module]]
- [[_COMMUNITY_User Backend Module|User Backend Module]]
- [[_COMMUNITY_Backend Tsconfig Module|Backend Tsconfig Module]]
- [[_COMMUNITY_User Backend Module|User Backend Module]]
- [[_COMMUNITY_Client Settings Module|Client Settings Module]]
- [[_COMMUNITY_Client Lib Module|Client Lib Module]]
- [[_COMMUNITY_Client App Module|Client App Module]]
- [[_COMMUNITY_Client Hooks Module|Client Hooks Module]]
- [[_COMMUNITY_Feed Backend Module|Feed Backend Module]]
- [[_COMMUNITY_Backend Src Module|Backend Src Module]]
- [[_COMMUNITY_Feed Backend Module|Feed Backend Module]]
- [[_COMMUNITY_Client App Module|Client App Module]]
- [[_COMMUNITY_Client Experiences Module|Client Experiences Module]]
- [[_COMMUNITY_Backend Package Module|Backend Package Module]]
- [[_COMMUNITY_Backend Src Module|Backend Src Module]]
- [[_COMMUNITY_Client App Module|Client App Module]]
- [[_COMMUNITY_Client App Module|Client App Module]]
- [[_COMMUNITY_Campfires Client Module|Campfires Client Module]]
- [[_COMMUNITY_Backend Package Module|Backend Package Module]]
- [[_COMMUNITY_Client App Module|Client App Module]]
- [[_COMMUNITY_Backend Package Module|Backend Package Module]]
- [[_COMMUNITY_Client App Module|Client App Module]]
- [[_COMMUNITY_Client App Module|Client App Module]]
- [[_COMMUNITY_Backend Nest Module|Backend Nest Module]]
- [[_COMMUNITY_Adventuredna Client Module|Adventuredna Client Module]]
- [[_COMMUNITY_Backend Tsconfig Module|Backend Tsconfig Module]]
- [[_COMMUNITY_Featuredhosts Client Module|Featuredhosts Client Module]]
- [[_COMMUNITY_Quests Client Module|Quests Client Module]]
- [[_COMMUNITY_Dto Backend Module|Dto Backend Module]]
- [[_COMMUNITY_Client Eslint Module|Client Eslint Module]]
- [[_COMMUNITY_Client Next Module|Client Next Module]]
- [[_COMMUNITY_Config Client Module|Config Client Module]]
- [[_COMMUNITY_📦 Centralized Media Storage Service Architecture|📦 Centralized Media Storage Service Architecture]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_Wandercall Enterprise Backend Architecture Master Blueprint|Wandercall Enterprise Backend Architecture Master Blueprint]]
- [[_COMMUNITY_📄 API Documentation|📄 API Documentation]]
- [[_COMMUNITY_⚙️ Enterprise Environment Configuration Architecture|⚙️ Enterprise Environment Configuration Architecture]]
- [[_COMMUNITY_📄 API Contracts|📄 API Contracts]]
- [[_COMMUNITY_📢 Enterprise Feed & Recommendation Engine Service|📢 Enterprise Feed & Recommendation Engine Service]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_🏗️ Frontend State Management & Enterprise API Architecture|🏗️ Frontend State Management & Enterprise API Architecture]]
- [[_COMMUNITY_🔐 Enterprise Authentication & Onboarding Architecture|🔐 Enterprise Authentication & Onboarding Architecture]]
- [[_COMMUNITY_🔐 Enterprise Role-Based Access Control (RBAC) Foundation|🔐 Enterprise Role-Based Access Control (RBAC) Foundation]]
- [[_COMMUNITY_🎯 Architectural Philosophy & Core Principles|🎯 Architectural Philosophy & Core Principles]]
- [[_COMMUNITY_graphify|graphify.md]]
- [[_COMMUNITY_graphify|graphify.md]]
- [[_COMMUNITY_AGENTS|AGENTS.md]]

## God Nodes (most connected - your core abstractions)
1. `InteractionRepository` - 32 edges
2. `UserController` - 27 edges
3. `AuthRepository` - 26 edges
4. `PostEntity` - 24 edges
5. `UserProfileEntity` - 24 edges
6. `useAppSelector` - 24 edges
7. `UserRepository` - 23 edges
8. `FollowRepository` - 22 edges
9. `PostRepository` - 20 edges
10. `UserService` - 20 edges

## Surprising Connections (you probably didn't know these)
- `UserProfileResponseDto` --references--> `UserRole`  [EXTRACTED]
  backend/src/modules/user/dto/user-profile-response.dto.ts → backend/src/modules/auth/enums/user-role.enum.ts
- `CreatePostParams` --references--> `PostVisibility`  [EXTRACTED]
  backend/src/modules/feed/services/post.service.ts → backend/src/modules/feed/entities/post.entity.ts
- `UpdatePostParams` --references--> `PostVisibility`  [EXTRACTED]
  backend/src/modules/feed/services/post.service.ts → backend/src/modules/feed/entities/post.entity.ts
- `FavoriteFriendEntity` --references--> `UserProfileEntity`  [EXTRACTED]
  backend/src/modules/friend/entities/favorite-friend.entity.ts → backend/src/modules/user/entities/user-profile.entity.ts
- `PrivacyRelationEntity` --references--> `UserProfileEntity`  [EXTRACTED]
  backend/src/modules/privacy/entities/privacy-relation.entity.ts → backend/src/modules/user/entities/user-profile.entity.ts

## Import Cycles
- None detected.

## Communities (68 total, 14 thin omitted)

### Community 0 - "Auth Backend Module"
Cohesion: 0.05
Nodes (19): AuthController, AuthResponseDto, AuthUserDto, GoogleAuthRequestDto, LoginRequestDto, RefreshTokenRequestDto, RegisterRequestDto, UserAuthEntity (+11 more)

### Community 1 - "Client Booking Module"
Cohesion: 0.08
Nodes (25): BookingPage(), EXPERIENCES_CATALOG, BookingStepperProps, BookingSummaryProps, AvailabilityLegend(), CalendarProps, DateDetailsPanelProps, TimeSlotModalProps (+17 more)

### Community 2 - "Backend Package Module"
Cohesion: 0.05
Nodes (43): devDependencies, eslint, eslint-config-prettier, @eslint/eslintrc, @eslint/js, eslint-plugin-prettier, globals, jest (+35 more)

### Community 3 - "Storage Backend Module"
Cohesion: 0.11
Nodes (12): StorageController, DeleteAssetRequestDto, ReplaceAssetRequestDto, StorageAssetResponseDto, UploadAssetRequestDto, UploadIntent, IStorageAssetMetadata, IStorageService (+4 more)

### Community 4 - "Client Components Module"
Cohesion: 0.06
Nodes (18): categories, CreatePostPage(), Home(), bottomMenuVariants, navItems, ProfileLayout(), ExperienceResult, VoiceRoom (+10 more)

### Community 5 - "Config Backend Module"
Cohesion: 0.10
Nodes (20): aiConfig, analyticsConfig, appConfig, cacheConfig, AppConfigModule, databaseConfig, Environment, EnvironmentVariables (+12 more)

### Community 6 - "Client App Module"
Cohesion: 0.22
Nodes (16): LoginPage(), SignupPage(), useGoogleAuthMutation(), useLoginMutation(), useLogoutMutation(), useResendVerificationMutation(), useSignupMutation(), useVerifyEmailMutation() (+8 more)

### Community 7 - "User Backend Module"
Cohesion: 0.12
Nodes (7): UserController, CompleteProfileRequestDto, PublicProfileResponseDto, UpdateProfileRequestDto, UserPlanDto, UserProfileResponseDto, UserSettingsDto

### Community 8 - "Client Package Module"
Cohesion: 0.15
Nodes (13): dependencies, axios, framer-motion, lenis, lucide-react, next, react-dom, react-redux (+5 more)

### Community 10 - "Client Feed Module"
Cohesion: 0.15
Nodes (20): categories, ExplorerFeedPage(), FeedImageGalleryProps, ImpressionTracker(), UserMemoriesPage(), useCommentMutation(), useCommentsQuery(), useDeletePostMutation() (+12 more)

### Community 11 - "Feed Backend Module"
Cohesion: 0.07
Nodes (5): FeedController, PostEntity, FeedEventDispatcher, PostRepository, PostService

### Community 12 - "User Backend Module"
Cohesion: 0.12
Nodes (11): AppModule, DatabaseInitializerService, AuthModule, FriendModule, PrivacyModule, StorageModule, FollowEntity, UserProfileEntity (+3 more)

### Community 13 - "Feed Backend Module"
Cohesion: 0.21
Nodes (5): FeedImpressionEntity, PostCommentEntity, PostLikeEntity, UserPostStateEntity, FeedModule

### Community 14 - "Client Store Module"
Cohesion: 0.09
Nodes (19): geistMono, geistSans, metadata, AUTH_ONLY_ROUTES, AuthGuard(), GUEST_ONLY_ROUTES, SmoothScroll(), SmoothScrollProps (+11 more)

### Community 15 - "Backend Package Module"
Cohesion: 0.09
Nodes (23): dependencies, bcrypt, class-transformer, class-validator, cloudinary, @nestjs/common, @nestjs/config, @nestjs/core (+15 more)

### Community 16 - "Campfires Client Module"
Cohesion: 0.09
Nodes (18): CampfireRoom, CARD_GRADIENTS, CATEGORIES, CompanionAvatarProps, FEATURED_EVENTS, FloatingEmoji, INITIAL_CAMPFIRES, INITIAL_HOSTED_ROOMS (+10 more)

### Community 17 - "Feed Backend Module"
Cohesion: 0.13
Nodes (5): PostSaveEntity, UserAuthorAffinityEntity, UserInterestEntity, InteractionRepository, InterestEngine

### Community 19 - "Backend Tsconfig Module"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+12 more)

### Community 20 - "User Backend Module"
Cohesion: 0.19
Nodes (4): UserPlanEntity, UserSettingsEntity, UserRepository, UserService

### Community 21 - "Client Settings Module"
Cohesion: 0.12
Nodes (22): ProfilePage(), ActiveSession, ADVENTURE_CATEGORIES_LIST, ADVENTURE_DNA_DNA_BADGES, INITIAL_SESSIONS, SessionDisplayItem, SETTINGS_SECTIONS, SettingsPage() (+14 more)

### Community 22 - "Client Lib Module"
Cohesion: 0.12
Nodes (21): SignupCompleteContent(), CompanionAvatarProps, ProfileRenderer(), ProfileRendererProps, RelationshipButton(), RelationshipButtonProps, RelationshipState, useRelationship() (+13 more)

### Community 23 - "Client App Module"
Cohesion: 0.10
Nodes (34): Companion, CompanionAvatarProps, CompanionProps, DEFAULT_CAMPFIRES, getIcebreakers(), INITIAL_MESSAGES, MobileChatPage(), ACTIVITY_FEED (+26 more)

### Community 24 - "Client Hooks Module"
Cohesion: 0.18
Nodes (4): PrivacyController, PrivacyRelationEntity, PrivacyRepository, PrivacyService

### Community 25 - "Feed Backend Module"
Cohesion: 0.19
Nodes (13): RANKING_CONFIG, CreatePostRequestDto, UpdatePostRequestDto, PostAuthorType, PostStatus, PostVisibility, InteractionType, CreatePostParams (+5 more)

### Community 26 - "Backend Src Module"
Cohesion: 0.20
Nodes (4): FriendController, FavoriteFriendEntity, FavoriteFriendRepository, FavoriteFriendService

### Community 28 - "Client App Module"
Cohesion: 0.13
Nodes (13): ALL_COMMUNITIES, CATEGORY_WALLPAPERS, ChatMessage, CommunityNode, INITIAL_CAMPFIRES, INITIAL_CHAT_MESSAGES, INITIAL_EXPERIENCES, INITIAL_GALLERY (+5 more)

### Community 29 - "Client Experiences Module"
Cohesion: 0.13
Nodes (9): ExperienceDetail, EXPERIENCES_DATABASE, FAQItem, HostProfile, ReviewComment, StoryBlock, TimelineStop, ExperienceItem (+1 more)

### Community 30 - "Backend Package Module"
Cohesion: 0.15
Nodes (13): scripts, build, format, lint, start, start:debug, start:dev, start:prod (+5 more)

### Community 31 - "Backend Src Module"
Cohesion: 0.11
Nodes (17): 1. Data Model & DTOs, 2. Optional Authentication & Relationship State, 3. Caching and Invalidation Strategy, 4. Image Rendering & Fail-safes, Admin, 💻 Client Dev Setup, 🔐 Enterprise Authentication & Multi-Tenant User Session Architecture, Experience Provider (+9 more)

### Community 32 - "Client App Module"
Cohesion: 0.50
Nodes (4): AudioMessagePlayer(), QuestsPage(), BookingSummary(), react

### Community 33 - "Client App Module"
Cohesion: 0.18
Nodes (8): ALL_COMMUNITIES, CLUSTER_METADATA, ClusterMeta, CommunitiesPage(), CommunityNode, CommunityTrophy, CompanionOrbitNode, JoinedCommunity

### Community 34 - "Campfires Client Module"
Cohesion: 0.18
Nodes (7): CampfireRoom, CompanionAvatarProps, FloatingEmoji, INITIAL_CAMPFIRES, INITIAL_HOSTED_ROOMS, Listener, Speaker

### Community 35 - "Backend Package Module"
Cohesion: 0.22
Nodes (9): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+1 more)

### Community 36 - "Client App Module"
Cohesion: 0.25
Nodes (5): Booking, filterTabs, Friend, Host, initialBookings

### Community 37 - "Backend Package Module"
Cohesion: 0.29
Nodes (6): author, description, license, name, private, version

### Community 38 - "Client App Module"
Cohesion: 0.29
Nodes (6): Achievement, ActiveQuest, LadderStep, LeaderboardUser, QuestStory, Region

### Community 39 - "Client App Module"
Cohesion: 0.29
Nodes (5): Experience, Host, initialDropdownCollections, initialExperiences, mainCollections

### Community 40 - "Backend Nest Module"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 51 - "📦 Centralized Media Storage Service Architecture"
Cohesion: 0.14
Nodes (14): 1. Upload Flow, 2. Replace Flow (Updating Profile Picture), 3. Delete Flow, 📄 API Contracts, 🔄 Asset Lifecycle Workflows, 📦 Centralized Media Storage Service Architecture, ⚙️ Cloudinary Configuration, 📁 Cloudinary Folder Organization Strategy (+6 more)

### Community 52 - "page.tsx"
Cohesion: 0.18
Nodes (10): CATEGORIES, Friend, FRIENDS_LIST, LocationData, TEMPLATE_WALLPAPERS, LocationSearch(), LocationSearchProps, GeoapifyLocation (+2 more)

### Community 53 - "Wandercall Enterprise Backend Architecture Master Blueprint"
Cohesion: 0.17
Nodes (11): 🚫 Architectural Boundary Rules & Dependency Mandates, Code Artifact Naming, 📐 Coding Standards & Naming Conventions, 🌐 Enterprise Domain Modules (19 Bounded Contexts), File & Directory Naming, 🚀 Microservice Migration Strategy, ⚡ Performance & Resilience Architecture, 📁 Repository Directory Structure (+3 more)

### Community 54 - "📄 API Documentation"
Cohesion: 0.20
Nodes (10): 📄 API Documentation, `DELETE /api/v1/feed/posts/:id` (Authenticated), `GET /api/v1/feed` (Guest allowed), `PATCH /api/v1/feed/posts/:id` (Authenticated), `POST /api/v1/feed/posts` (Authenticated), `POST /api/v1/feed/posts/:id/comments` & `GET /api/v1/feed/posts/:id/comments`, `POST /api/v1/feed/posts/:id/like` & `DELETE /api/v1/feed/posts/:id/like`, `POST /api/v1/feed/posts/:id/save` & `DELETE /api/v1/feed/posts/:id/save` (+2 more)

### Community 55 - "⚙️ Enterprise Environment Configuration Architecture"
Cohesion: 0.20
Nodes (10): 🎯 Configuration Philosophy & Dependency Flow, Dependency Flow:, ⚙️ Enterprise Environment Configuration Architecture, 📁 Environment File Strategy & Root Placement, 🛡️ Fail-Fast Startup Validation, ➕ Guide: How to Add a New Environment Variable, 🔄 Microservices Reusability Strategy, Purpose of Each File: (+2 more)

### Community 56 - "📄 API Contracts"
Cohesion: 0.22
Nodes (9): 📄 API Contracts, 🏛️ Architecture & Relationship Model, ⚡ Client State & Invalidation Strategy, `GET /api/v1/users/profile/username/:username` (Public), `GET /api/v1/users/relationship/:username` (Authenticated), `GET /api/v1/users/:username/followers` & `GET /api/v1/users/:username/following` (Public), `POST /api/v1/users/follow/:username` & `POST /api/v1/users/unfollow/:username` (Authenticated), 👥 Public User Profile Discovery & Follow Relationship Architecture (+1 more)

### Community 57 - "📢 Enterprise Feed & Recommendation Engine Service"
Cohesion: 0.22
Nodes (9): 📁 Database Relationships, 📢 Enterprise Feed & Recommendation Engine Service, 🧩 Future AI & Search Extension Points, 🌊 Infinite Scroll & Stable Cursors, 📐 Module Folder Structure, 🧮 Personalization & Scoring Formula, ⏱️ Post Lifecycle State Machine, 🔐 Security & Publishing Rules (+1 more)

### Community 58 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 59 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+1 more)

### Community 60 - "🏗️ Frontend State Management & Enterprise API Architecture"
Cohesion: 0.22
Nodes (8): ⏱️ Caching & Invalidation Strategy, Deploy on Vercel, 📁 Enterprise Directory Architecture (`client/lib/`), 🏗️ Frontend State Management & Enterprise API Architecture, Getting Started, Learn More, 🏛️ Responsibilities Matrix, 🔑 Token Lifecycle & Silent Refresh Rotation

### Community 61 - "🔐 Enterprise Authentication & Onboarding Architecture"
Cohesion: 0.25
Nodes (8): 🌐 Cross-Platform & Microservice Readiness, 🏛️ Decoupled Module & Service Responsibilities, 🏷️ Enterprise Account Lifecycle States, 🔐 Enterprise Authentication & Onboarding Architecture, Onboarding Phases:, 🛡️ Security Philosophy & Protection Layers, 🔑 Session Management & Multi-Device Architecture, 🔄 Staged Onboarding Lifecycle & Frontend Workflow Alignment

### Community 62 - "🔐 Enterprise Role-Based Access Control (RBAC) Foundation"
Cohesion: 0.29
Nodes (7): 1. Centralized Role Definitions, 2. Separation of Concerns & Storage Strategy, 3. Signup & Login Lifecycle, 4. Future Transitions & Scalability, 5. Future-Ready Route Authorization (Guards & Decorators), 6. Existing Users Migration (Backfill), 🔐 Enterprise Role-Based Access Control (RBAC) Foundation

### Community 63 - "🎯 Architectural Philosophy & Core Principles"
Cohesion: 0.50
Nodes (4): 1. Domain-Driven Design (DDD) Bounded Contexts, 2. Modular Monolith Evolving into Microservices, 3. Stateless Application & Scalability, 🎯 Architectural Philosophy & Core Principles

## Knowledge Gaps
- **375 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+370 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Client App Module` to `Client Package Module`, `Client App Module`, `Client App Module`, `Client App Module`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `SignupPage()` connect `Client App Module` to `Client App Module`, `Client Components Module`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `Client Components Module` to `Client App Module`, `Client Feed Module`, `Client Store Module`, `Client Settings Module`, `Client Lib Module`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _375 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth Backend Module` be split into smaller, more focused modules?**
  _Cohesion score 0.050101010101010104 - nodes in this community are weakly interconnected._
- **Should `Client Booking Module` be split into smaller, more focused modules?**
  _Cohesion score 0.07712765957446809 - nodes in this community are weakly interconnected._
- **Should `Backend Package Module` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._