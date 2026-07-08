# Community Chat Architecture

## State Ownership Diagram

```mermaid
graph TD
    A[TanStack Query] -->|Manages Server State| B(COMMUNITY_CHAT_QUERY_KEYS)
    A -->|Optimistic Updates| C(useSendCommunityMessage)
    
    D[useSocket Hook] -->|Listens community:message:new| A
    D -->|Invalidates| A
    
    E[CommunityLayout] -->|Reads URL segment| F[CommunityShell]
    F -->|Derives activeTab| G[_page_monolith]
    G -->|Passes state| H[VirtualizedMessageList]
```

## Component Graph

```mermaid
graph TD
    Layout[app/community/slug/layout.tsx] --> Shell[app/community/slug/CommunityShell.tsx]
    Shell --> Monolith[_page_monolith.tsx]
    Monolith --> ChatFeed[VirtualizedMessageList.tsx]
    Monolith --> InviteModal[InviteModal]
    Monolith --> MembersModal[CommunityMembersModal]
```

## Refactoring Note
The monolith `page.tsx` was wrapped in a Next.js Layout (`layout.tsx`). The `CommunityShell` component intercepts the URL segments to set the `activeTab` inside the monolith, maintaining 100% UI parity while enabling App Router nested routes. The Chat Feed uses `react-virtuoso` for rendering performance.
