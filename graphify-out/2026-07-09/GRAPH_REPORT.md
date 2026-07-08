# Graph Report - wandercall_v3  (2026-07-09)

## Corpus Check
- 319 files · ~221,409 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1915 nodes · 4500 edges · 92 communities (70 shown, 22 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2e81ec30`
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
- [[_COMMUNITY_useUserMutations.ts|useUserMutations.ts]]
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
- [[_COMMUNITY_store.ts|store.ts]]
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
- [[_COMMUNITY_community.controller.ts|community.controller.ts]]
- [[_COMMUNITY_Client App Module|Client App Module]]
- [[_COMMUNITY_Backend Nest Module|Backend Nest Module]]
- [[_COMMUNITY_ChatGateway|ChatGateway]]
- [[_COMMUNITY_Backend Tsconfig Module|Backend Tsconfig Module]]
- [[_COMMUNITY_PostEntity|PostEntity]]
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
- [[_COMMUNITY_ProfileRenderer.tsx|ProfileRenderer.tsx]]
- [[_COMMUNITY_PresenceService|PresenceService]]
- [[_COMMUNITY_🏗️ Frontend State Management & Enterprise API Architecture|🏗️ Frontend State Management & Enterprise API Architecture]]
- [[_COMMUNITY_🔐 Enterprise Authentication & Onboarding Architecture|🔐 Enterprise Authentication & Onboarding Architecture]]
- [[_COMMUNITY_🔐 Enterprise Role-Based Access Control (RBAC) Foundation|🔐 Enterprise Role-Based Access Control (RBAC) Foundation]]
- [[_COMMUNITY_🎯 Architectural Philosophy & Core Principles|🎯 Architectural Philosophy & Core Principles]]
- [[_COMMUNITY_graphify|graphify.md]]
- [[_COMMUNITY_graphify|graphify.md]]
- [[_COMMUNITY_AGENTS|AGENTS.md]]
- [[_COMMUNITY_UserService|UserService]]
- [[_COMMUNITY_ConversationEntity|ConversationEntity]]
- [[_COMMUNITY_useChat.ts|useChat.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_community.service.ts|community.service.ts]]
- [[_COMMUNITY_CommunitySettingsEntity|CommunitySettingsEntity]]
- [[_COMMUNITY_CommunityRoleEntity|CommunityRoleEntity]]
- [[_COMMUNITY_chat.gateway.ts|chat.gateway.ts]]
- [[_COMMUNITY_chat.service.ts|chat.service.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_Community Core Architecture|Community Core Architecture]]
- [[_COMMUNITY_CommunitySavedEntity|CommunitySavedEntity]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_chat.module.ts|chat.module.ts]]
- [[_COMMUNITY_CommunitySavedEntity|CommunitySavedEntity]]
- [[_COMMUNITY_InviteModal.tsx|InviteModal.tsx]]
- [[_COMMUNITY_recommendation.engine.ts|recommendation.engine.ts]]
- [[_COMMUNITY_CommunityAdminDashboard.tsx|CommunityAdminDashboard.tsx]]
- [[_COMMUNITY_community.controller.ts|community.controller.ts]]
- [[_COMMUNITY_scratch_query.js|scratch_query.js]]
- [[_COMMUNITY_AudioMessagePlayer.tsx|AudioMessagePlayer.tsx]]
- [[_COMMUNITY_CommunityDashboard|CommunityDashboard]]

## God Nodes (most connected - your core abstractions)
1. `CommunityEventDispatcher` - 46 edges
2. `useAppSelector` - 44 edges
3. `UserProfileEntity` - 33 edges
4. `UserRepository` - 33 edges
5. `InteractionRepository` - 32 edges
6. `PostEntity` - 30 edges
7. `FollowRepository` - 28 edges
8. `MessageEntity` - 27 edges
9. `UserController` - 27 edges
10. `AuthRepository` - 26 edges

## Surprising Connections (you probably didn't know these)
- `CompanionAvatar()` --calls--> `getHashColor()`  [INFERRED]
  client/app/profile/campfires/[id]/page.tsx → client/components/shared/CompanionAvatar.tsx
- `CompanionAvatar()` --calls--> `getHashColor()`  [INFERRED]
  client/app/profile/campfires/page.tsx → client/components/shared/CompanionAvatar.tsx
- `CompanionAvatar()` --calls--> `getHashColor()`  [INFERRED]
  client/app/profile/friends/[chatId]/page.tsx → client/components/shared/CompanionAvatar.tsx
- `CompanionAvatar()` --calls--> `getHashColor()`  [INFERRED]
  client/app/profile/friends/page.tsx → client/components/shared/CompanionAvatar.tsx
- `BookingSummary()` --references--> `react`  [EXTRACTED]
  client/components/booking/BookingSummary.tsx → client/package.json

## Import Cycles
- None detected.

## Communities (92 total, 22 thin omitted)

### Community 0 - "Auth Backend Module"
Cohesion: 0.05
Nodes (18): AuthController, AuthResponseDto, AuthUserDto, GoogleAuthRequestDto, LoginRequestDto, RefreshTokenRequestDto, RegisterRequestDto, UserAuthEntity (+10 more)

### Community 1 - "Client Booking Module"
Cohesion: 0.07
Nodes (26): BookingPage(), EXPERIENCES_CATALOG, BookingStepperProps, BookingSummary(), BookingSummaryProps, AvailabilityLegend(), CalendarProps, DateDetailsPanelProps (+18 more)

### Community 2 - "Backend Package Module"
Cohesion: 0.05
Nodes (43): devDependencies, eslint, eslint-config-prettier, @eslint/eslintrc, @eslint/js, eslint-plugin-prettier, globals, jest (+35 more)

### Community 3 - "Storage Backend Module"
Cohesion: 0.11
Nodes (12): StorageController, DeleteAssetRequestDto, ReplaceAssetRequestDto, StorageAssetResponseDto, UploadAssetRequestDto, UploadIntent, IStorageAssetMetadata, IStorageService (+4 more)

### Community 4 - "Client Components Module"
Cohesion: 0.06
Nodes (11): Home(), DnaTrait, PersonalityPreset, ExperienceResult, VoiceRoom, StoryPost, Host, FinalCTA() (+3 more)

### Community 5 - "Config Backend Module"
Cohesion: 0.10
Nodes (20): aiConfig, analyticsConfig, appConfig, cacheConfig, AppConfigModule, databaseConfig, Environment, EnvironmentVariables (+12 more)

### Community 6 - "Client App Module"
Cohesion: 0.07
Nodes (38): CATEGORY_STYLES, CreateCommunityPage(), Friend, LocationData, TEMPLATE_WALLPAPERS, bottomMenuVariants, navItems, ProfileLayout() (+30 more)

### Community 7 - "User Backend Module"
Cohesion: 0.13
Nodes (5): UserController, UpdateProfileRequestDto, UserPlanDto, UserProfileResponseDto, UserSettingsDto

### Community 8 - "Client Package Module"
Cohesion: 0.04
Nodes (45): AudioMessagePlayer(), Achievement, ActiveQuest, LadderStep, LeaderboardUser, QuestsPage(), QuestStory, Region (+37 more)

### Community 9 - "useUserMutations.ts"
Cohesion: 0.12
Nodes (23): ProfilePage(), ActiveSession, ADVENTURE_CATEGORIES_LIST, ADVENTURE_DNA_DNA_BADGES, INITIAL_SESSIONS, SessionDisplayItem, SETTINGS_SECTIONS, SettingsPage() (+15 more)

### Community 10 - "Client Feed Module"
Cohesion: 0.09
Nodes (32): categories, CreatePostPage(), categories, ExplorerFeedPage(), FeedImageGalleryProps, ImpressionTracker(), UserMemoriesPage(), ExplorerProfilePage() (+24 more)

### Community 11 - "Feed Backend Module"
Cohesion: 0.08
Nodes (3): FeedController, FeedEventDispatcher, PostService

### Community 12 - "User Backend Module"
Cohesion: 0.16
Nodes (7): CompleteProfileRequestDto, PublicProfileResponseDto, UserPlanEntity, FollowRepository, UserRepository, FollowService, RelationshipService

### Community 13 - "Feed Backend Module"
Cohesion: 0.17
Nodes (5): FeedImpressionEntity, PostCommentEntity, PostLikeEntity, UserPostStateEntity, FeedModule

### Community 14 - "Client Store Module"
Cohesion: 0.18
Nodes (8): geistMono, geistSans, metadata, AUTH_ONLY_ROUTES, AuthGuard(), GUEST_ONLY_ROUTES, SmoothScroll(), SmoothScrollProps

### Community 15 - "Backend Package Module"
Cohesion: 0.07
Nodes (28): dependencies, bcrypt, class-transformer, class-validator, cloudinary, ioredis, @nestjs/common, @nestjs/config (+20 more)

### Community 16 - "Campfires Client Module"
Cohesion: 0.05
Nodes (33): CampfireRoom, CompanionAvatar(), CompanionAvatarProps, FloatingEmoji, INITIAL_CAMPFIRES, INITIAL_HOSTED_ROOMS, Listener, Speaker (+25 more)

### Community 17 - "Feed Backend Module"
Cohesion: 0.13
Nodes (5): PostSaveEntity, UserAuthorAffinityEntity, UserInterestEntity, InteractionRepository, InterestEngine

### Community 18 - "User Backend Module"
Cohesion: 0.11
Nodes (5): CommunityEventDispatcher, CommunityEvents, CommunityGalaxySubscriber, CommunitySearchSubscriber, CommunityStatisticsSubscriber

### Community 19 - "Backend Tsconfig Module"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+12 more)

### Community 21 - "Client Settings Module"
Cohesion: 0.08
Nodes (26): ALL_COMMUNITIES, CLUSTER_METADATA, ClusterMeta, CommunitiesPage(), CommunityNode, CommunityTrophy, CompanionOrbitNode, JoinedCommunity (+18 more)

### Community 22 - "store.ts"
Cohesion: 0.08
Nodes (13): CommunityJoinPolicy, CommunityStatus, CommunityVisibility, AuthUser, GetUser, CreateCommunityDto, UpdateCommunityDto, UpdateCommunitySettingsDto (+5 more)

### Community 23 - "Client App Module"
Cohesion: 0.07
Nodes (43): Companion, CompanionAvatarProps, CompanionProps, DEFAULT_CAMPFIRES, getIcebreakers(), INITIAL_MESSAGES, MobileChatPage(), ACTIVITY_FEED (+35 more)

### Community 24 - "Client Hooks Module"
Cohesion: 0.16
Nodes (5): JwtAuthGuard, PrivacyController, PrivacyRelationEntity, PrivacyRepository, PrivacyService

### Community 25 - "Feed Backend Module"
Cohesion: 0.25
Nodes (8): CommentRequestDto, CreatePostRequestDto, UpdatePostRequestDto, PostAuthorType, PostStatus, PostVisibility, CreatePostParams, UpdatePostParams

### Community 26 - "Backend Src Module"
Cohesion: 0.11
Nodes (6): FriendController, FavoriteFriendEntity, FavoriteFriendRepository, FavoriteFriendService, FriendService, FollowerPreviewDto

### Community 28 - "Client App Module"
Cohesion: 0.16
Nodes (5): MessageResponseDto, MessageEntity, MessageRepository, PaginatedMessages, ChatService

### Community 29 - "Client Experiences Module"
Cohesion: 0.50
Nodes (4): ACTION_COLOR_MAP, AuditLogsTable(), AuditLogsTableProps, useCommunityAuditLogs()

### Community 30 - "Backend Package Module"
Cohesion: 0.15
Nodes (13): scripts, build, format, lint, start, start:debug, start:dev, start:prod (+5 more)

### Community 31 - "Backend Src Module"
Cohesion: 0.11
Nodes (17): 1. Data Model & DTOs, 2. Optional Authentication & Relationship State, 3. Caching and Invalidation Strategy, 4. Image Rendering & Fail-safes, Admin, 💻 Client Dev Setup, 🔐 Enterprise Authentication & Multi-Tenant User Session Architecture, Experience Provider (+9 more)

### Community 32 - "Client App Module"
Cohesion: 0.09
Nodes (7): CommunityDiscoveryController, CommunityCategoryEntity, CommunityCoordinateEntity, CommunityCategoryRepository, CommunityCoordinateRepository, CommunityDiscoveryService, CommunityPresenceTracker

### Community 33 - "Client App Module"
Cohesion: 0.11
Nodes (16): AppModule, AuthModule, ChatModule, CommunityModule, FriendModule, PrivacyModule, DISCOVERY_CONFIG, UserRecommendationCacheEntity (+8 more)

### Community 34 - "Campfires Client Module"
Cohesion: 0.09
Nodes (6): CommunityController, CommunityRoleEntity, CommunityRoleRepository, SYSTEM_ROLES, CommunityRoleService, CommunityStatisticsService

### Community 35 - "Backend Package Module"
Cohesion: 0.22
Nodes (9): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+1 more)

### Community 36 - "Client App Module"
Cohesion: 0.25
Nodes (5): Booking, filterTabs, Friend, Host, initialBookings

### Community 37 - "Backend Package Module"
Cohesion: 0.29
Nodes (6): author, description, license, name, private, version

### Community 38 - "community.controller.ts"
Cohesion: 0.17
Nodes (5): CurrentUser, CommunityInviteEntity, CommunityInviteStatus, CommunityInviteRepository, CommunityInviteService

### Community 39 - "Client App Module"
Cohesion: 0.29
Nodes (5): Experience, Host, initialDropdownCollections, initialExperiences, mainCollections

### Community 40 - "Backend Nest Module"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 41 - "ChatGateway"
Cohesion: 0.11
Nodes (5): ChatGateway, MarkDeliveredDto, MarkReadDto, OpenConversationDto, TypingDto

### Community 51 - "📦 Centralized Media Storage Service Architecture"
Cohesion: 0.14
Nodes (14): 1. Upload Flow, 2. Replace Flow (Updating Profile Picture), 3. Delete Flow, 📄 API Contracts, 🔄 Asset Lifecycle Workflows, 📦 Centralized Media Storage Service Architecture, ⚙️ Cloudinary Configuration, 📁 Cloudinary Folder Organization Strategy (+6 more)

### Community 52 - "page.tsx"
Cohesion: 0.29
Nodes (8): SignupCompleteContent(), LocationSearch(), LocationSearchProps, useCompleteProfileMutation(), useUploadAvatarMutation(), GeoapifyLocation, searchCache, useGeoapifyAutocomplete()

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

### Community 58 - "ProfileRenderer.tsx"
Cohesion: 0.08
Nodes (5): IPresenceService, PresenceStatus, UserPresence, ChatEventDispatcher, PresenceService

### Community 59 - "PresenceService"
Cohesion: 0.10
Nodes (22): ChatMessage, useChatConversation(), UseChatConversationOptions, COMMUNITY_CHAT_QUERY_KEYS, useCommunityMessages(), CHAT_QUERY_KEYS, SendMessageParams, useMessages() (+14 more)

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

### Community 69 - "ConversationEntity"
Cohesion: 0.09
Nodes (8): CommunityRoomEntity, CommunityRoomType, ConversationEntity, ConversationMemberStateEntity, ConversationParticipantEntity, ConversationCreatedEvent, ConversationRepository, ConversationService

### Community 70 - "useChat.ts"
Cohesion: 0.21
Nodes (15): LoginPage(), SignupPage(), useGoogleAuthMutation(), useLoginMutation(), useLogoutMutation(), useResendVerificationMutation(), useSignupMutation(), useVerifyEmailMutation() (+7 more)

### Community 71 - "page.tsx"
Cohesion: 0.13
Nodes (9): ExperienceDetail, EXPERIENCES_DATABASE, FAQItem, HostProfile, ReviewComment, StoryBlock, TimelineStop, ExperienceItem (+1 more)

### Community 72 - "community.service.ts"
Cohesion: 0.09
Nodes (4): CommunityMembershipController, CommunityMembershipService, CommunityModerationService, CommunityStoryService

### Community 73 - "CommunitySettingsEntity"
Cohesion: 0.17
Nodes (8): CommunityAuditAction, CommunityAuditLogEntity, CommunityMemberEntity, CommunityMemberStatus, CommunityAuditLogRepository, CommunityMemberRepository, CommunityAuditService, CommunityPermissionService

### Community 75 - "chat.gateway.ts"
Cohesion: 0.23
Nodes (10): SOCKET_EVENTS, ChatEvent, IChatEventDispatcher, MessageCreatedEvent, MessageDeletedEvent, MessageDeliveredEvent, MessageEditedEvent, MessageReadEvent (+2 more)

### Community 76 - "chat.service.ts"
Cohesion: 0.25
Nodes (12): REDIS_KEYS, AuthUser, GetUser, ConversationResponseDto, ErrorAckDto, ParticipantDto, SendMessageAckDto, AttachmentDto (+4 more)

### Community 78 - "Community Core Architecture"
Cohesion: 0.22
Nodes (8): Community Core Architecture, Entity Relationship Diagram (ERD), Event Flow, Frontend State Management Flow, Future Extension Points, Galaxy Discovery Data Flow, Module Interaction Diagram, Overview

### Community 79 - "CommunitySavedEntity"
Cohesion: 0.12
Nodes (3): ChatController, CommunityChatService, MessageService

### Community 84 - "recommendation.engine.ts"
Cohesion: 0.24
Nodes (6): RANKING_CONFIG, InteractionType, RankingEngine, ScoringContext, FeedCursor, FeedQueryDto

### Community 87 - "community.controller.ts"
Cohesion: 0.12
Nodes (5): SearchController, SocialDiscoveryService, UserSearchService, FollowEntity, UserProfileEntity

### Community 95 - "CommunityDashboard"
Cohesion: 0.09
Nodes (41): CommunityDashboard(), CommunityNode, CommunityInviteMetadata, CommunityInviteRenderer(), VirtualizedMessageList(), PERMISSION_LIST, RoleMatrixEditor(), CommunityMembersModal() (+33 more)

## Knowledge Gaps
- **440 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+435 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Client Package Module` to `Client Booking Module`, `useChat.ts`, `Client Settings Module`, `Client App Module`, `CommunityDashboard`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `Client App Module` to `Client Components Module`, `useChat.ts`, `useUserMutations.ts`, `Client Feed Module`, `Client Store Module`, `page.tsx`, `Client Settings Module`, `Client App Module`, `PresenceService`, `CommunityDashboard`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `CommunityRoleEntity` connect `Campfires Client Module` to `Client App Module`, `community.service.ts`, `CommunitySettingsEntity`, `User Backend Module`, `store.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _440 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth Backend Module` be split into smaller, more focused modules?**
  _Cohesion score 0.05197594501718213 - nodes in this community are weakly interconnected._
- **Should `Client Booking Module` be split into smaller, more focused modules?**
  _Cohesion score 0.07482993197278912 - nodes in this community are weakly interconnected._
- **Should `Backend Package Module` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._