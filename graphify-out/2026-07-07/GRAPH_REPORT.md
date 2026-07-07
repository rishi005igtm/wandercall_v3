# Graph Report - wandercall_v3  (2026-07-07)

## Corpus Check
- 292 files · ~208,730 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1730 nodes · 3871 edges · 90 communities (74 shown, 16 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `03929245`
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
- [[_COMMUNITY_useChatInbox.ts|useChatInbox.ts]]
- [[_COMMUNITY_registry.ts|registry.ts]]
- [[_COMMUNITY_Navbar.tsx|Navbar.tsx]]
- [[_COMMUNITY_CommunityBanEntity|CommunityBanEntity]]
- [[_COMMUNITY_communityWizardSlice.ts|communityWizardSlice.ts]]
- [[_COMMUNITY_community.controller.ts|community.controller.ts]]
- [[_COMMUNITY_AudioMessagePlayer.tsx|AudioMessagePlayer.tsx]]
- [[_COMMUNITY_CommunityDashboard|CommunityDashboard]]

## God Nodes (most connected - your core abstractions)
1. `useAppSelector` - 44 edges
2. `CommunityEventDispatcher` - 35 edges
3. `UserProfileEntity` - 33 edges
4. `InteractionRepository` - 32 edges
5. `UserRepository` - 31 edges
6. `FollowRepository` - 28 edges
7. `UserController` - 27 edges
8. `AuthRepository` - 26 edges
9. `CommunityEntity` - 25 edges
10. `PostEntity` - 24 edges

## Surprising Connections (you probably didn't know these)
- `CompanionAvatar()` --calls--> `getHashColor()`  [INFERRED]
  client/app/profile/campfires/[id]/page.tsx → client/components/shared/CompanionAvatar.tsx
- `CompanionAvatar()` --calls--> `getHashColor()`  [INFERRED]
  client/app/profile/campfires/page.tsx → client/components/shared/CompanionAvatar.tsx
- `CompanionAvatar()` --calls--> `getHashColor()`  [INFERRED]
  client/app/profile/friends/[chatId]/page.tsx → client/components/shared/CompanionAvatar.tsx
- `CompanionAvatar()` --calls--> `getHashColor()`  [INFERRED]
  client/app/profile/friends/page.tsx → client/components/shared/CompanionAvatar.tsx
- `UserProfileResponseDto` --references--> `UserRole`  [EXTRACTED]
  backend/src/modules/user/dto/user-profile-response.dto.ts → backend/src/modules/auth/enums/user-role.enum.ts

## Import Cycles
- None detected.

## Communities (90 total, 16 thin omitted)

### Community 0 - "Auth Backend Module"
Cohesion: 0.05
Nodes (18): AuthController, AuthResponseDto, AuthUserDto, GoogleAuthRequestDto, LoginRequestDto, RefreshTokenRequestDto, RegisterRequestDto, UserAuthEntity (+10 more)

### Community 1 - "Client Booking Module"
Cohesion: 0.08
Nodes (25): BookingPage(), EXPERIENCES_CATALOG, BookingStepperProps, BookingSummaryProps, AvailabilityLegend(), CalendarProps, DateDetailsPanelProps, TimeSlotModalProps (+17 more)

### Community 2 - "Backend Package Module"
Cohesion: 0.05
Nodes (43): devDependencies, eslint, eslint-config-prettier, @eslint/eslintrc, @eslint/js, eslint-plugin-prettier, globals, jest (+35 more)

### Community 3 - "Storage Backend Module"
Cohesion: 0.11
Nodes (13): StorageController, DeleteAssetRequestDto, ReplaceAssetRequestDto, StorageAssetResponseDto, UploadAssetRequestDto, UploadIntent, IStorageAssetMetadata, IStorageService (+5 more)

### Community 4 - "Client Components Module"
Cohesion: 0.05
Nodes (20): categories, CreatePostPage(), Home(), bottomMenuVariants, navItems, ProfileLayout(), DnaTrait, PersonalityPreset (+12 more)

### Community 5 - "Config Backend Module"
Cohesion: 0.09
Nodes (20): aiConfig, analyticsConfig, appConfig, cacheConfig, AppConfigModule, databaseConfig, Environment, EnvironmentVariables (+12 more)

### Community 6 - "Client App Module"
Cohesion: 0.32
Nodes (7): CATEGORY_STYLES, CreateCommunityPage(), Friend, LocationData, TEMPLATE_WALLPAPERS, useCategories(), useCreateCommunity()

### Community 7 - "User Backend Module"
Cohesion: 0.13
Nodes (6): UserController, CompleteProfileRequestDto, UpdateProfileRequestDto, UserPlanDto, UserProfileResponseDto, UserSettingsDto

### Community 8 - "Client Package Module"
Cohesion: 0.06
Nodes (33): dependencies, axios, framer-motion, lenis, lucide-react, next, react-dom, react-redux (+25 more)

### Community 9 - "useUserMutations.ts"
Cohesion: 0.12
Nodes (22): ProfilePage(), ExplorerProfilePage(), CompanionAvatarProps, ProfileRenderer(), ProfileRendererProps, RelationshipButton(), RelationshipButtonProps, RelationshipState (+14 more)

### Community 10 - "Client Feed Module"
Cohesion: 0.15
Nodes (20): categories, ExplorerFeedPage(), FeedImageGalleryProps, ImpressionTracker(), UserMemoriesPage(), useCommentMutation(), useCommentsQuery(), useDeletePostMutation() (+12 more)

### Community 12 - "User Backend Module"
Cohesion: 0.16
Nodes (8): UserSearchQueryDto, FollowEntity, UserPlanEntity, UserProfileEntity, UserSettingsEntity, FollowRepository, UserRepository, RelationshipService

### Community 13 - "Feed Backend Module"
Cohesion: 0.21
Nodes (7): FeedImpressionEntity, PostCommentEntity, PostLikeEntity, UserAuthorAffinityEntity, UserPostStateEntity, InteractionType, FeedModule

### Community 14 - "Client Store Module"
Cohesion: 0.06
Nodes (34): geistMono, geistSans, metadata, AUTH_ONLY_ROUTES, AuthGuard(), GUEST_ONLY_ROUTES, InviteModal(), InviteModalProps (+26 more)

### Community 15 - "Backend Package Module"
Cohesion: 0.07
Nodes (27): dependencies, bcrypt, class-transformer, class-validator, cloudinary, ioredis, @nestjs/common, @nestjs/config (+19 more)

### Community 16 - "Campfires Client Module"
Cohesion: 0.05
Nodes (33): CampfireRoom, CompanionAvatar(), CompanionAvatarProps, FloatingEmoji, INITIAL_CAMPFIRES, INITIAL_HOSTED_ROOMS, Listener, Speaker (+25 more)

### Community 17 - "Feed Backend Module"
Cohesion: 0.14
Nodes (3): PostSaveEntity, InteractionRepository, InterestEngine

### Community 18 - "User Backend Module"
Cohesion: 0.12
Nodes (5): CommunityEventDispatcher, CommunityEvents, CommunityGalaxySubscriber, CommunitySearchSubscriber, CommunityStatisticsSubscriber

### Community 19 - "Backend Tsconfig Module"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+12 more)

### Community 20 - "User Backend Module"
Cohesion: 0.31
Nodes (3): DatabaseInitializerService, CommunityRoleSeederService, SYSTEM_ROLES

### Community 21 - "Client Settings Module"
Cohesion: 0.14
Nodes (5): FeedController, CommentRequestDto, CreatePostRequestDto, FeedQueryDto, UpdatePostRequestDto

### Community 22 - "store.ts"
Cohesion: 0.11
Nodes (7): CommunityVisibility, CommunityController, CreateCommunityDto, UpdateCommunityDto, CommunityEntity, CommunityRepository, CommunityService

### Community 23 - "Client App Module"
Cohesion: 0.14
Nodes (18): ACTIVITY_FEED, Companion, CompanionAvatarProps, CompanionProps, DEFAULT_CAMPFIRES, FriendsPage(), FriendsPageProps, getIcebreakers() (+10 more)

### Community 24 - "Client Hooks Module"
Cohesion: 0.16
Nodes (5): JwtAuthGuard, PrivacyController, PrivacyRelationEntity, PrivacyRepository, PrivacyService

### Community 25 - "Feed Backend Module"
Cohesion: 0.23
Nodes (10): RANKING_CONFIG, PostAuthorType, PostStatus, PostVisibility, CreatePostParams, UpdatePostParams, RankingEngine, ScoringContext (+2 more)

### Community 26 - "Backend Src Module"
Cohesion: 0.11
Nodes (7): FriendController, FavoriteFriendEntity, FriendModule, FavoriteFriendRepository, FavoriteFriendService, FriendService, FollowerPreviewDto

### Community 28 - "Client App Module"
Cohesion: 0.16
Nodes (5): MessageResponseDto, MessageEntity, MessageRepository, PaginatedMessages, ChatService

### Community 29 - "Client Experiences Module"
Cohesion: 0.11
Nodes (31): LoginPage(), ActiveSession, ADVENTURE_CATEGORIES_LIST, ADVENTURE_DNA_DNA_BADGES, INITIAL_SESSIONS, SessionDisplayItem, SETTINGS_SECTIONS, SettingsPage() (+23 more)

### Community 30 - "Backend Package Module"
Cohesion: 0.15
Nodes (13): scripts, build, format, lint, start, start:debug, start:dev, start:prod (+5 more)

### Community 31 - "Backend Src Module"
Cohesion: 0.11
Nodes (17): 1. Data Model & DTOs, 2. Optional Authentication & Relationship State, 3. Caching and Invalidation Strategy, 4. Image Rendering & Fail-safes, Admin, 💻 Client Dev Setup, 🔐 Enterprise Authentication & Multi-Tenant User Session Architecture, Experience Provider (+9 more)

### Community 32 - "Client App Module"
Cohesion: 0.10
Nodes (7): CommunityDiscoveryController, CommunityCategoryEntity, CommunityCoordinateEntity, CommunityCategoryRepository, CommunityCoordinateRepository, CommunityDiscoveryService, CommunityPresenceTracker

### Community 34 - "Campfires Client Module"
Cohesion: 0.18
Nodes (3): CommunityInviteEntity, CommunityInviteStatus, CommunityInviteRepository

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
Cohesion: 0.11
Nodes (6): CurrentUser, AuthUser, GetUser, CommunityMembershipController, CommunityInviteService, CommunityMembershipService

### Community 39 - "Client App Module"
Cohesion: 0.29
Nodes (5): Experience, Host, initialDropdownCollections, initialExperiences, mainCollections

### Community 40 - "Backend Nest Module"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 41 - "ChatGateway"
Cohesion: 0.12
Nodes (4): ChatGateway, MarkDeliveredDto, OpenConversationDto, ChatEventDispatcher

### Community 43 - "PostEntity"
Cohesion: 0.15
Nodes (3): PostEntity, FeedEventDispatcher, PostService

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
Cohesion: 0.18
Nodes (3): IPresenceService, PresenceStatus, UserPresence

### Community 59 - "PresenceService"
Cohesion: 0.11
Nodes (3): ChatController, TypingDto, PresenceService

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
Cohesion: 0.10
Nodes (14): AppModule, AuthModule, ChatModule, ConversationResponseDto, ErrorAckDto, ParticipantDto, SendMessageAckDto, ConversationEntity (+6 more)

### Community 70 - "useChat.ts"
Cohesion: 0.17
Nodes (12): CHAT_QUERY_KEYS, SendMessageParams, useMessages(), usePresence(), ChatMessage, useChatConversation(), UseChatConversationOptions, chatService (+4 more)

### Community 71 - "page.tsx"
Cohesion: 0.17
Nodes (16): Companion, CompanionAvatarProps, CompanionProps, DEFAULT_CAMPFIRES, getIcebreakers(), INITIAL_MESSAGES, MobileChatPage(), useAddFavoriteMutation() (+8 more)

### Community 72 - "community.service.ts"
Cohesion: 0.16
Nodes (6): CommunityModule, CommunityMemberEntity, CommunityMemberStatus, CommunityStatisticsEntity, CommunityMemberRepository, CommunityStatisticsRepository

### Community 73 - "CommunitySettingsEntity"
Cohesion: 0.19
Nodes (5): CommunityJoinPolicy, CommunityStatus, UpdateCommunitySettingsDto, CommunitySettingsEntity, CommunitySettingsRepository

### Community 74 - "CommunityRoleEntity"
Cohesion: 0.15
Nodes (3): PublicProfileResponseDto, RelationshipResponseDto, FollowService

### Community 75 - "chat.gateway.ts"
Cohesion: 0.19
Nodes (11): SOCKET_EVENTS, MarkReadDto, ChatEvent, IChatEventDispatcher, MessageCreatedEvent, MessageDeletedEvent, MessageDeliveredEvent, MessageEditedEvent (+3 more)

### Community 76 - "chat.service.ts"
Cohesion: 0.31
Nodes (7): REDIS_KEYS, AuthUser, GetUser, AttachmentDto, SendMessageDto, MessageStatus, MessageType

### Community 77 - "page.tsx"
Cohesion: 0.18
Nodes (10): AudioMessagePlayer(), Achievement, ActiveQuest, LadderStep, LeaderboardUser, QuestsPage(), QuestStory, Region (+2 more)

### Community 78 - "Community Core Architecture"
Cohesion: 0.22
Nodes (8): Community Core Architecture, Entity Relationship Diagram (ERD), Event Flow, Frontend State Management Flow, Future Extension Points, Galaxy Discovery Data Flow, Module Interaction Diagram, Overview

### Community 80 - "page.tsx"
Cohesion: 0.13
Nodes (9): ExperienceDetail, EXPERIENCES_DATABASE, FAQItem, HostProfile, ReviewComment, StoryBlock, TimelineStop, ExperienceItem (+1 more)

### Community 81 - "useChatInbox.ts"
Cohesion: 0.33
Nodes (6): useConversations(), EMPTY_STATE, formatInboxTime(), formatMessagePreview(), FriendInboxState, useChatInbox()

### Community 82 - "registry.ts"
Cohesion: 0.40
Nodes (4): getMessageRenderer(), MESSAGE_RENDERER_REGISTRY, MessageRenderer, MessageRendererProps

### Community 83 - "Navbar.tsx"
Cohesion: 0.50
Nodes (3): authSlice, AuthState, initialState

### Community 85 - "communityWizardSlice.ts"
Cohesion: 0.50
Nodes (3): communityWizardSlice, CommunityWizardState, initialState

### Community 87 - "community.controller.ts"
Cohesion: 0.09
Nodes (11): UserInterestEntity, DISCOVERY_CONFIG, SearchController, UserRecommendationCacheEntity, UserSearchHistoryEntity, SearchModule, ExplorerCircleEdge, ExplorerCircleNode (+3 more)

### Community 95 - "CommunityDashboard"
Cohesion: 0.07
Nodes (46): CommunityDashboard(), CommunityNode, ALL_COMMUNITIES, CLUSTER_METADATA, ClusterMeta, CommunitiesPage(), CommunityNode, CommunityTrophy (+38 more)

## Knowledge Gaps
- **428 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+423 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `page.tsx` to `Client Package Module`, `Client Experiences Module`, `page.tsx`, `CommunityDashboard`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `Client Components Module` to `Client App Module`, `page.tsx`, `useChat.ts`, `useUserMutations.ts`, `Client Feed Module`, `Client Store Module`, `useChatInbox.ts`, `page.tsx`, `Client App Module`, `Client Experiences Module`, `CommunityDashboard`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `InteractionRepository` connect `Feed Backend Module` to `Feed Backend Module`, `User Backend Module`, `Feed Backend Module`, `Client Settings Module`, `user.service.ts`, `Feed Backend Module`, `Feed Backend Module`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _428 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth Backend Module` be split into smaller, more focused modules?**
  _Cohesion score 0.05154639175257732 - nodes in this community are weakly interconnected._
- **Should `Client Booking Module` be split into smaller, more focused modules?**
  _Cohesion score 0.07712765957446809 - nodes in this community are weakly interconnected._
- **Should `Backend Package Module` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._