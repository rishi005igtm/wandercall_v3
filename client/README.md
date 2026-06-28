This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 🏗️ Frontend State Management & Enterprise API Architecture

Wandercall enforces an enterprise frontend architecture strictly segregating **Client/UI State** (Redux Toolkit) from **Server State** (TanStack Query). This guarantees ultra-scale performance, zero duplicate sources of truth, and cross-platform reusability for mobile and desktop runtimes.

### 🏛️ Responsibilities Matrix

```
┌─────────────────────────────────────────────────────────┐
│                     WANDERCALL CLIENT                   │
├────────────────────────────┬────────────────────────────┤
│   Redux Toolkit (Client)   │   TanStack Query (Server)  │
├────────────────────────────┼────────────────────────────┤
│ • Session tokens & status  │ • Signup & Login APIs      │
│ • User ID & Account state  │ • Profile Completion       │
│ • Onboarding step          │ • Username Availability    │
│ • Theme & Language         │ • User Profile metadata    │
│ • Modal & Drawer states    │ • Experiences & Quests     │
│ • Active filters & forms   │ • Communities & Feed       │
└────────────────────────────┴────────────────────────────┘
```

---

### 📁 Enterprise Directory Architecture (`client/lib/`)

```
client/
├── lib/
│   ├── api/
│   │   ├── httpClient.ts       # Centralized Axios engine (interceptors, tokens, refresh)
│   │   └── queryKeys.ts        # Hierarchy of typed TanStack query key constants
│   ├── services/
│   │   ├── auth.service.ts     # Ingress/egress auth API calls
│   │   └── user.service.ts     # Ingress/egress profile API calls
│   ├── store/
│   │   ├── slices/
│   │   │   ├── authSlice.ts    # Session tokens & account lifecycle state
│   │   │   └── uiSlice.ts      # Client theme, drawers, modals, onboarding steps
│   │   └── store.ts            # Typed Redux store setup (useAppDispatch, useAppSelector)
│   └── utils/
│       └── errorMapper.ts      # Normalizes HTTP 4xx/5xx status codes into user strings
├── hooks/
│   └── api/
│       ├── useAuthMutations.ts # Custom TanStack hooks (useSignupMutation, useGoogleAuthMutation)
│       └── useUserMutations.ts # Custom TanStack hooks (useCompleteProfileMutation, useUsernameCheck)
└── providers/
    └── AppProviders.tsx        # Encapsulates Redux Provider and QueryClientProvider
```

---

### 🔑 Token Lifecycle & Silent Refresh Rotation

1. **Header Interceptor**: All outgoing HTTP requests pass through `httpClient.ts`. If an `accessToken` exists in local storage, it is injected into the `Authorization: Bearer <token>` header.
2. **Silent Refresh Rotation**: Upon encountering a `401 Unauthorized` response, the interceptor traps the failure, issues a POST request to `/auth/refresh` using the stored `refreshToken`, saves the newly rotated key pair, and re-executes the initial request seamlessly.
3. **Revocation**: If refresh token rotation fails or is revoked, local tokens are cleared and the user is redirected to `/login`.

---

### ⏱️ Caching & Invalidation Strategy

| State Domain | Stale Time (`staleTime`) | Garbage Collection (`gcTime`) | Invalidation Triggers |
| :--- | :--- | :--- | :--- |
| **User Profile** | 1 minute | 5 minutes | `useCompleteProfileMutation`, profile update |
| **Username Availability** | 1 minute | 5 minutes | On input change (debounced) |
| **Experiences & Quests** | 5 minutes | 15 minutes | Booking completion, review submission |
| **Communities & Feed** | 2 minutes | 10 minutes | Post creation, community join |

