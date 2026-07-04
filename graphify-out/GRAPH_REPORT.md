# Graph Report - .  (2026-07-04)

## Corpus Check
- 198 files · ~174,714 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 987 nodes · 2019 edges · 51 communities (40 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

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

## God Nodes (most connected - your core abstractions)
1. `InteractionRepository` - 32 edges
2. `UserController` - 27 edges
3. `AuthRepository` - 26 edges
4. `PostEntity` - 24 edges
5. `useAppSelector` - 24 edges
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

## Communities (51 total, 11 thin omitted)

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
Cohesion: 0.07
Nodes (17): categories, CreatePostPage(), Home(), bottomMenuVariants, navItems, ProfileLayout(), ExperienceResult, VoiceRoom (+9 more)

### Community 5 - "Config Backend Module"
Cohesion: 0.10
Nodes (19): aiConfig, analyticsConfig, appConfig, cacheConfig, databaseConfig, Environment, EnvironmentVariables, validate() (+11 more)

### Community 6 - "Client App Module"
Cohesion: 0.10
Nodes (28): LoginPage(), CATEGORIES, Friend, FRIENDS_LIST, LocationData, TEMPLATE_WALLPAPERS, SignupCompleteContent(), SignupPage() (+20 more)

### Community 7 - "User Backend Module"
Cohesion: 0.10
Nodes (8): OptionalJwtAuthGuard, UserController, CompleteProfileRequestDto, PublicProfileResponseDto, UpdateProfileRequestDto, UserPlanDto, UserProfileResponseDto, UserSettingsDto

### Community 8 - "Client Package Module"
Cohesion: 0.06
Nodes (30): dependencies, axios, framer-motion, lenis, lucide-react, next, react-dom, react-redux (+22 more)

### Community 9 - "Feed Backend Module"
Cohesion: 0.11
Nodes (4): PostEntity, FeedEventDispatcher, PostRepository, PostService

### Community 10 - "Client Feed Module"
Cohesion: 0.15
Nodes (20): categories, ExplorerFeedPage(), FeedImageGalleryProps, ImpressionTracker(), UserMemoriesPage(), useCommentMutation(), useCommentsQuery(), useDeletePostMutation() (+12 more)

### Community 12 - "User Backend Module"
Cohesion: 0.21
Nodes (6): FollowEntity, UserPlanEntity, UserProfileEntity, UserSettingsEntity, FollowRepository, UserRepository

### Community 13 - "Feed Backend Module"
Cohesion: 0.18
Nodes (5): FeedImpressionEntity, PostCommentEntity, PostLikeEntity, PostSaveEntity, UserPostStateEntity

### Community 14 - "Client Store Module"
Cohesion: 0.10
Nodes (16): geistMono, geistSans, metadata, AUTH_ONLY_ROUTES, AuthGuard(), GUEST_ONLY_ROUTES, SmoothScroll(), SmoothScrollProps (+8 more)

### Community 15 - "Backend Package Module"
Cohesion: 0.09
Nodes (23): dependencies, bcrypt, class-transformer, class-validator, cloudinary, @nestjs/common, @nestjs/config, @nestjs/core (+15 more)

### Community 16 - "Campfires Client Module"
Cohesion: 0.09
Nodes (18): CampfireRoom, CARD_GRADIENTS, CATEGORIES, CompanionAvatarProps, FEATURED_EVENTS, FloatingEmoji, INITIAL_CAMPFIRES, INITIAL_HOSTED_ROOMS (+10 more)

### Community 17 - "Feed Backend Module"
Cohesion: 0.14
Nodes (4): UserAuthorAffinityEntity, UserInterestEntity, InteractionRepository, InterestEngine

### Community 18 - "User Backend Module"
Cohesion: 0.17
Nodes (3): FollowerPreviewDto, RelationshipResponseDto, FollowService

### Community 19 - "Backend Tsconfig Module"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+12 more)

### Community 21 - "Client Settings Module"
Cohesion: 0.16
Nodes (18): ActiveSession, ADVENTURE_CATEGORIES_LIST, ADVENTURE_DNA_DNA_BADGES, INITIAL_SESSIONS, SessionDisplayItem, SETTINGS_SECTIONS, SettingsPage(), SettingsTab (+10 more)

### Community 22 - "Client Lib Module"
Cohesion: 0.17
Nodes (11): ProfileRendererProps, httpClient, QUERY_KEYS, CompleteProfilePayload, UserPlanResponse, UserProfileResponse, userService, UserSettingsResponse (+3 more)

### Community 23 - "Client App Module"
Cohesion: 0.12
Nodes (15): ACTIVITY_FEED, BLOCKED_USERS, Companion, CompanionAvatarProps, CompanionProps, COMPANIONS, DEFAULT_CAMPFIRES, FriendsPage() (+7 more)

### Community 24 - "Client Hooks Module"
Cohesion: 0.23
Nodes (12): ProfilePage(), ExplorerProfilePage(), CompanionAvatarProps, ProfileRenderer(), useFollowMutation(), useUnfollowMutation(), useUploadCoverImageMutation(), useFollowersInfiniteQuery() (+4 more)

### Community 25 - "Feed Backend Module"
Cohesion: 0.24
Nodes (8): CommentRequestDto, CreatePostRequestDto, UpdatePostRequestDto, PostAuthorType, PostStatus, PostVisibility, CreatePostParams, UpdatePostParams

### Community 26 - "Backend Src Module"
Cohesion: 0.17
Nodes (7): AppModule, AppConfigModule, DatabaseInitializerService, AuthModule, FeedModule, StorageModule, UserModule

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
Cohesion: 0.24
Nodes (6): RANKING_CONFIG, InteractionType, RankingEngine, ScoringContext, FeedCursor, FeedQueryDto

### Community 32 - "Client App Module"
Cohesion: 0.18
Nodes (11): AudioMessagePlayer(), Companion, CompanionAvatarProps, CompanionProps, COMPANIONS, DEFAULT_CAMPFIRES, getIcebreakers(), INITIAL_MESSAGES (+3 more)

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

## Knowledge Gaps
- **288 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+283 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Client App Module` to `Client Package Module`, `Client App Module`, `Client App Module`, `Client Booking Module`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `SignupPage()` connect `Client App Module` to `Client App Module`, `Client Components Module`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `Client Components Module` to `Client App Module`, `Client Feed Module`, `Client Store Module`, `Client Settings Module`, `Client Hooks Module`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _288 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth Backend Module` be split into smaller, more focused modules?**
  _Cohesion score 0.05154639175257732 - nodes in this community are weakly interconnected._
- **Should `Client Booking Module` be split into smaller, more focused modules?**
  _Cohesion score 0.07482993197278912 - nodes in this community are weakly interconnected._
- **Should `Backend Package Module` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._