# 🌌 Wandercall - The Real-Life Experience Network

> **"Discover Experiences Worth Remembering"**  
> *Book adventures, join communities, meet explorers, and create real-life memories.*

Wandercall is a world-class platform engineered to get users **off their screens and into the real world**. By combining an **Experience Marketplace**, a **Social Network**, an **AI-Powered Discovery Engine**, and a **Gamified Real-Life Adventure Ecosystem**, Wandercall offers a premium, immersive, and emotionally engaging user experience. 

---

## 🧭 Project Vision & Core Philosophy

Traditional social networks keep users scrolling passively. Wandercall's mission is to motivate users to explore, learn, connect, attend offline events, complete adventure quests, and build real-life memories.

### 🎨 Visual Identity & Style System
Our aesthetics are inspired by a fusion of **Apple**, **Linear**, **Arc Browser**, and **Spotify**:
* **Theme**: Premium dark mode by default.
* **Palette**: Curated harmonious colors tailored for an adventure-focused visual depth.
  * **Background**: Near Black (`#0B0B0B`)
  * **Primary**: Deep Indigo
  * **Secondary**: Electric Purple
  * **Accent**: Neon Cyan
  * **Success**: Emerald
  * **Warning**: Amber
* **Aesthetics**: Glassmorphism, smooth gradients, thin glowing borders, 3D tilt effects, and parallax backgrounds.

---

## 🔐 Enterprise Authentication & Multi-Tenant User Session Architecture

Wandercall implements a production-grade, multi-tenant authentication lifecycle designed for high scale and mobile readiness across web and native clients.

### 🔄 Session & Token Lifecycle
1. **Authentication Bootstrap**: On application mount, `AuthBootstrap` verifies active stored credentials via backend `GET /api/v1/users/me`.
2. **Multi-Tenant Resolution**: Authenticated routes automatically resolve current user identity via backend context. URLs like `/profile` and `/settings` do not require explicit `userId` path parameters.
3. **Silent Token Rotation**: Axios interceptors automatically handle 401 Unauthorized responses by dispatching POST `/api/v1/auth/refresh` requests in background queues.
4. **State Segregation**:
   - **Redux (`authSlice`)**: Client-side auth flags (`isAuthenticated`, `isAuthReady`, `userId`, `accountStatus`, `role`).
   - **TanStack Query (`useCurrentUserQuery`)**: Server-side user profile metadata, level, XP, and active lobby states.
5. **Centralized AuthGuard**: Protects authenticated routes (`/profile`, `/settings`, `/feed`, `/bookings`, `/campfires`, `/experiences`), redirects unauthenticated guests to `/login`, and enforces profile completion for staged accounts.

---

## 👥 User Roles & Access Matrix

### Explorer (User)
* **Discover**: Search experiences via filters, maps, and AI.
* **Interact**: Create posts, comments, follow users, and join campfires.
* **Gamification**: Complete daily quests, level up, track Adventure DNA, and build a Memory Book.
* **Booking**: Order tickets, download QR codes, and pay with Cashfree.

### Experience Provider
* **Listing Management**: Create experiences, configure pricing, upload videos, and customize itineraries.
* **Booking Ledger**: Manage attendee registration calendars and review schedules.
* **Ecosystem Analytics**: Track conversion metrics, total earnings, and payout status.

### Admin
* **Content Moderation**: Moderate communities, flag posts, and review reports.
* **Ecosystem Health**: Access DAU/MAU dashboards, transaction audits, and host verifications.

---

## 🚀 Getting Started

### 📋 Prerequisites
* **Node.js** v18+
* **PostgreSQL** & **Redis** instances (or Docker Desktop)

### 💻 Client Dev Setup
1. **Navigate to client directory:**
   ```bash
   cd client
   ```
2. **Install node dependencies:**
   ```bash
   npm install
   ```
3. **Run local dev server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the client.

---

## 👤 Profile & Relationship Graph Lifecycle

Wandercall implements a fully synchronized, backend-driven profile and follower network architecture mirroring enterprise standards.

### 1. Data Model & DTOs
All profile metrics, images, and relationships are driven by backend payloads, eliminating hardcoded fallbacks:
* **UserProfileResponseDto**: Served for `/users/profile/me`. Returns owner profile fields, including `followerCount` and `followingCount`.
* **PublicProfileResponseDto**: Served for `/users/profile/username/:username`. Returns target profile details, including `followerCount`, `followingCount`, and requesting user's `relationshipState`.
* **Dynamic Resolution**: Checks if the target user profile exists. If missing, a 404 "Passport Not Found" error is returned immediately.

### 2. Optional Authentication & Relationship State
To resolve target user relationships on public endpoints (e.g. `/profile/:username`) while keeping the page readable for anonymous visitors:
1. **OptionalJwtAuthGuard**: Intercepts request headers to evaluate user tokens without throwing `UnauthorizedException` if absent.
2. **Context Passing**: Passes requesting user ID to `getPublicProfileByUsername`.
3. **Status Check**: Determines if requesting user is the target user (`'Self'`), following the target user (`'Following'`), or not (`'Not Following'`).

### 3. Caching and Invalidation Strategy
State updates are executed reactively on the client using TanStack Query, avoiding manual refreshes:
* **Follow Mutations**: Following or unfollowing triggers immediate query invalidation.
* **Prefix Invalidation**: Instead of targeting exact sub-keys, the system invalidates base keys (`['user', 'relationship', username]`, `['user', 'public_profile', username]`, `['user', 'followers']`, `['user', 'following']`, `['user', 'current']`, `['user', 'profile']`).
* **Search Context**: Ensures list queries with different search strings, pagination cursors, or pages are correctly refetched inside connections modals.

### 4. Image Rendering & Fail-safes
Avatar and Cover Banner rendering utilize strict rules to handle missing assets without demo fallbacks:
* **Cover Photo**: Shows uploaded `coverImageUrl`. If missing, renders the verified grid and neon glow styling from the passport design system.
* **Avatar**: Shows uploaded `avatarUrl`. If missing, renders a text avatar based on the first letter of the user's `displayName`.