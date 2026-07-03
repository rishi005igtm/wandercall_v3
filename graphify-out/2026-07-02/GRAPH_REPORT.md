# Graph Report - .  (2026-07-02)

## Corpus Check
- 195 files · ~173,078 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 970 nodes · 1974 edges · 54 communities (43 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

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

## God Nodes (most connected - your core abstractions)
1. `UserController` - 27 edges
2. `AuthRepository` - 26 edges
3. `InteractionRepository` - 26 edges
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

## Communities (54 total, 11 thin omitted)

### Community 0 - "Auth Component"
Cohesion: 0.05
Nodes (18): AuthController, AuthResponseDto, AuthUserDto, GoogleAuthRequestDto, LoginRequestDto, RefreshTokenRequestDto, RegisterRequestDto, UserAuthEntity (+10 more)

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
Cohesion: 0.06
Nodes (18): categories, CreatePostPage(), Home(), bottomMenuVariants, navItems, ProfileLayout(), ExperienceResult, VoiceRoom (+10 more)

### Community 5 - "Config Component"
Cohesion: 0.10
Nodes (20): aiConfig, analyticsConfig, appConfig, cacheConfig, AppConfigModule, databaseConfig, Environment, EnvironmentVariables (+12 more)

### Community 6 - "Post Entity Component"
Cohesion: 0.10
Nodes (4): PostEntity, FeedEventDispatcher, PostRepository, PostService

### Community 7 - "App Component"
Cohesion: 0.14
Nodes (9): AppModule, DatabaseInitializerService, AuthModule, FeedModule, StorageModule, FollowEntity, UserProfileEntity, FollowRepository (+1 more)

### Community 8 - "Use User Mutations Component"
Cohesion: 0.15
Nodes (19): ProfilePage(), ExplorerProfilePage(), CompanionAvatarProps, ProfileRenderer(), ProfileRendererProps, useFollowMutation(), useUnfollowMutation(), useUploadCoverImageMutation() (+11 more)

### Community 9 - "Page Component"
Cohesion: 0.17
Nodes (17): categories, ExplorerFeedPage(), FeedImageGalleryProps, UserMemoriesPage(), useCommentMutation(), useCommentsQuery(), useDeletePostMutation(), useFeedInfiniteQuery() (+9 more)

### Community 10 - "Use Auth Mutations Component"
Cohesion: 0.18
Nodes (18): LoginPage(), SignupCompleteContent(), SignupPage(), useGoogleAuthMutation(), useLoginMutation(), useLogoutMutation(), useResendVerificationMutation(), useSignupMutation() (+10 more)

### Community 11 - "Dependencies Component"
Cohesion: 0.09
Nodes (23): dependencies, bcrypt, class-transformer, class-validator, cloudinary, @nestjs/common, @nestjs/config, @nestjs/core (+15 more)

### Community 12 - "Feed Component"
Cohesion: 0.13
Nodes (8): FeedController, CommentRequestDto, CreatePostRequestDto, FeedQueryDto, UpdatePostRequestDto, PostVisibility, CreatePostParams, UpdatePostParams

### Community 13 - "User Controller Component"
Cohesion: 0.14
Nodes (4): UserController, UserPlanDto, UserProfileResponseDto, UserSettingsDto

### Community 14 - "Page Component"
Cohesion: 0.09
Nodes (18): CampfireRoom, CARD_GRADIENTS, CATEGORIES, CompanionAvatarProps, FEATURED_EVENTS, FloatingEmoji, INITIAL_CAMPFIRES, INITIAL_HOSTED_ROOMS (+10 more)

### Community 15 - "Feed Component"
Cohesion: 0.25
Nodes (6): FeedImpressionEntity, PostCommentEntity, PostLikeEntity, InteractionType, UserInteractionEntity, UserInterestEntity

### Community 16 - "Community 16"
Cohesion: 0.15
Nodes (3): FollowerPreviewDto, RelationshipResponseDto, FollowService

### Community 17 - "Compiler Options Component"
Cohesion: 0.10
Nodes (20): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+12 more)

### Community 19 - "Page Component"
Cohesion: 0.16
Nodes (18): ActiveSession, ADVENTURE_CATEGORIES_LIST, ADVENTURE_DNA_DNA_BADGES, INITIAL_SESSIONS, SessionDisplayItem, SETTINGS_SECTIONS, SettingsPage(), SettingsTab (+10 more)

### Community 20 - "Page Component"
Cohesion: 0.12
Nodes (15): ACTIVITY_FEED, BLOCKED_USERS, Companion, CompanionAvatarProps, CompanionProps, COMPANIONS, DEFAULT_CAMPFIRES, FriendsPage() (+7 more)

### Community 21 - "Store Component"
Cohesion: 0.14
Nodes (12): httpClient, authSlice, AuthState, initialState, initialState, uiSlice, UiState, AppDispatch (+4 more)

### Community 23 - "Recommendation Component"
Cohesion: 0.28
Nodes (7): RANKING_CONFIG, PostAuthorType, PostStatus, InterestEngine, RankingEngine, FeedCursor, FeedQueryDto

### Community 24 - "Page Component"
Cohesion: 0.13
Nodes (13): ALL_COMMUNITIES, CATEGORY_WALLPAPERS, ChatMessage, CommunityNode, INITIAL_CAMPFIRES, INITIAL_CHAT_MESSAGES, INITIAL_EXPERIENCES, INITIAL_GALLERY (+5 more)

### Community 25 - "Page Component"
Cohesion: 0.13
Nodes (9): ExperienceDetail, EXPERIENCES_DATABASE, FAQItem, HostProfile, ReviewComment, StoryBlock, TimelineStop, ExperienceItem (+1 more)

### Community 26 - "Page Component"
Cohesion: 0.18
Nodes (10): CATEGORIES, Friend, FRIENDS_LIST, LocationData, TEMPLATE_WALLPAPERS, LocationSearch(), LocationSearchProps, GeoapifyLocation (+2 more)

### Community 27 - "Scripts Component"
Cohesion: 0.15
Nodes (13): scripts, build, format, lint, start, start:debug, start:dev, start:prod (+5 more)

### Community 28 - "User Component"
Cohesion: 0.31
Nodes (4): OptionalJwtAuthGuard, CompleteProfileRequestDto, PublicProfileResponseDto, UpdateProfileRequestDto

### Community 29 - "User Repository Component"
Cohesion: 0.24
Nodes (3): UserPlanEntity, UserSettingsEntity, UserRepository

### Community 30 - "Layout Component"
Cohesion: 0.18
Nodes (8): geistMono, geistSans, metadata, AUTH_ONLY_ROUTES, AuthGuard(), GUEST_ONLY_ROUTES, SmoothScroll(), SmoothScrollProps

### Community 31 - "Page Component"
Cohesion: 0.18
Nodes (11): AudioMessagePlayer(), Companion, CompanionAvatarProps, CompanionProps, COMPANIONS, DEFAULT_CAMPFIRES, getIcebreakers(), INITIAL_MESSAGES (+3 more)

### Community 32 - "Dependencies Component"
Cohesion: 0.15
Nodes (13): dependencies, axios, framer-motion, lenis, lucide-react, next, react-dom, react-redux (+5 more)

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
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 38 - "Dev Dependencies Component"
Cohesion: 0.22
Nodes (9): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+1 more)

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

## Knowledge Gaps
- **287 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+282 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Page Component` to `Dependencies Component`, `Page Component`, `Use Auth Mutations Component`, `Page Component`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `SignupPage()` connect `Use Auth Mutations Component` to `Use App Selector Component`, `Page Component`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `useAppSelector` connect `Use App Selector Component` to `Use User Mutations Component`, `Page Component`, `Use Auth Mutations Component`, `Page Component`, `Layout Component`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _287 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth Component` be split into smaller, more focused modules?**
  _Cohesion score 0.05240549828178694 - nodes in this community are weakly interconnected._
- **Should `Page Component` be split into smaller, more focused modules?**
  _Cohesion score 0.07482993197278912 - nodes in this community are weakly interconnected._
- **Should `Dev Dependencies Component` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._