# 💬 WanderCall Realtime Chat Platform — Architecture Document
> Generated: 2026-07-04 | Phase 1 Complete

---

## 🏗️ System Architecture Overview

```
Next.js Frontend (client/)
     │
     ├── HTTP (axios/httpClient)  →  REST API (GET conversations, GET messages history)
     └── WebSocket (socket.io-client)  →  Socket.IO Gateway (realtime events)
              │
     Express + NestJS Backend (backend/)
              │
     ┌────────┴────────────────────────────────────────────────┐
     │                    ChatModule                            │
     │  ChatGateway (Socket.IO)                                 │
     │       │ thin handlers — auth, validate, call service     │
     │  ChatController (REST)                                   │
     │       │                                                  │
     │  ChatService  ←→  ConversationService                   │
     │       │                │                                 │
     │  MessageRepository  ConversationRepository               │
     │       │                │                                 │
     │  chat_messages    chat_conversations                     │
     │                   chat_participants                       │
     │                                                          │
     │  PresenceService (in-memory, Redis-ready)               │
     │  ChatEventDispatcher (EventEmitter, Kafka-ready)        │
     └──────────────────────────────────────────────────────────┘
              │
     Reused Modules:
     ├── AuthModule   (JwtAuthGuard, JwtService for socket auth)
     ├── UserModule   (UserRepository for profile lookups)
     ├── PrivacyModule (checkIsBlocked — bidirectional)
     └── StorageModule (future: media attachments)
```

---

## 🗄️ Database Schema

### `chat_conversations`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `type` | varchar | DIRECT / GROUP / CAMPFIRE / COMMUNITY / AI_ASSISTANT |
| `lastMessageText` | text nullable | Preview for conversation list |
| `lastMessageId` | uuid nullable | FK to message |
| `lastMessageSenderId` | uuid nullable | For "You: ..." display |
| `lastMessageAt` | timestamp nullable | Ordering |
| `unreadCounts` | jsonb | `{ [userId]: number }` — avoids N+1 |
| `metadata` | jsonb nullable | Group name, campfire ID, etc. |
| `isArchived` | boolean | Soft hide |
| `createdAt`, `updatedAt` | timestamp | |

### `chat_participants`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `conversationId` | uuid FK | → chat_conversations |
| `userId` | uuid FK | → users_profile (userId) |
| `lastReadAt` | timestamp nullable | Read receipt tracking |
| `joinedAt` | timestamp nullable | Group chat join time |
| `isAdmin` | boolean | Group admin |
| `hasLeft` | boolean | Soft leave |
| `isMuted` | boolean | Per-conversation mute |
| `createdAt`, `updatedAt` | timestamp | |

**Indexes:** `(conversationId, userId) UNIQUE`, `(userId, updatedAt)`

### `chat_messages`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | Server-assigned |
| `clientMessageId` | uuid UNIQUE | Client-generated — idempotency |
| `conversationId` | uuid FK | → chat_conversations |
| `senderId` | uuid FK | → users_profile (userId) |
| `type` | varchar | TEXT / IMAGE / VIDEO / AUDIO / DOCUMENT / EXPERIENCE_CARD / PLAN_CARD / CAMPFIRE_INVITE / SYSTEM |
| `text` | text nullable | |
| `attachments` | jsonb nullable | `[{ url, publicId, mimeType, size, name }]` |
| `replyToId` | uuid nullable | FK to parent message |
| `forwardedFromId` | uuid nullable | FK to original |
| `status` | varchar | SENDING → SENT → DELIVERED → READ → EDITED → DELETED → FAILED |
| `isEdited` | boolean | |
| `isDeleted` | boolean | Soft delete |
| `deletedAt` | timestamp nullable | |
| `deliveredAt` | timestamp nullable | |
| `readAt` | timestamp nullable | |
| `mentions` | jsonb | `string[]` of userIds |
| `reactions` | jsonb | `{ [emoji]: string[] }` — userIds who reacted |
| `metadata` | jsonb nullable | Rich data for card types |
| `createdAt`, `updatedAt` | timestamp | |

**Indexes:** `(conversationId, createdAt)`, `(conversationId, status)`, `(senderId, createdAt)`, `clientMessageId UNIQUE`

---

## 🔌 Socket Event Contracts

### Client → Server (Emit)
```typescript
'send-message'       { clientMessageId: uuid, conversationId: uuid, type?, text?, attachments?, replyToId? }
'typing-start'       { conversationId: uuid }
'typing-stop'        { conversationId: uuid }
'mark-delivered'     { messageId: uuid }
'mark-read'          { conversationId: uuid, messageId: uuid }
'open-conversation'  { conversationId: uuid }
```

### Server → Client (On)
```typescript
'chat:connected'     { socketId, userId, status }
'chat:auth-error'    { message }
'message:new'        { message: MessageResponseDto, conversationId }
'message:delivered'  { messageId, conversationId, deliveredAt }
'message:read'       { messageId, conversationId, readAt }
'message:edited'     { messageId, conversationId, newText }
'message:deleted'    { messageId, conversationId }
'typing:start'       { userId, conversationId }
'typing:stop'        { userId, conversationId }
'presence:change'    { userId, status, lastSeen? }
'conversation:updated' { conversation }
'chat:error'         { code, message }
```

### ACK Structure
Every emit from client gets an ACK:
```typescript
// Success
{ success: true, clientMessageId, serverMessageId, status, createdAt }

// Error
{ success: false, code: 'RATE_LIMITED' | 'VALIDATION_ERROR' | 'SEND_FAILED' | 'AUTH_REQUIRED', message }
```

---

## 📡 REST API Contracts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/chat/conversations` | Required | All conversations for current user |
| POST | `/api/v1/chat/conversations/direct/:targetUserId` | Required | Get or create direct conversation |
| GET | `/api/v1/chat/conversations/:conversationId/messages?limit&cursor` | Required | Cursor-paginated message history |
| PATCH | `/api/v1/chat/messages/:messageId` | Required | Edit message |
| DELETE | `/api/v1/chat/messages/:messageId` | Required | Soft-delete message |
| GET | `/api/v1/chat/presence/:userId` | Required | Get user presence status |

---

## 🔁 Message Lifecycle

```
DRAFT (client only)
  → SENDING (optimistic UI — client sets immediately)
    → SENT (server ACK — message persisted)
      → DELIVERED (receiver socket receives it)
        → READ (receiver opens conversation)
          → EDITED (sender edits)
          → DELETED (soft delete)
  → FAILED (socket error / rate limit)
```

---

## 📤 Complete Send Message Workflow

```
User presses Send
        │
1. Generate clientMessageId (UUID) on client
        │
2. Optimistic insert into TanStack Query cache (status: SENDING)
        │
3. Socket emit 'send-message' with clientMessageId
        │
4. Server: ChatGateway.handleSendMessage()
        │   └── Authenticates socket (JwtService.verify)
        │   └── Validates DTO (class-validator)
        │   └── Calls ChatService.sendMessage()
        │
5. ChatService:
        │   └── Rate limit check (20 msgs / 10s)
        │   └── Validate conversation membership
        │   └── Privacy check (block in both directions)
        │   └── Content validation (text length, type)
        │   └── Idempotency check (clientMessageId unique)
        │   └── MessageRepository.save()
        │   └── ConversationRepository.updateLastMessage()
        │   └── ChatEventDispatcher.dispatch(MESSAGE_CREATED)
        │
6. ChatEventDispatcher emits MESSAGE_CREATED
        │
7. ChatGateway subscriber receives MESSAGE_CREATED
        │   └── server.to(`user:${recipientId}`).emit('message:new')
        │   └── (reaches all devices of each recipient)
        │
8. Server ACK → { success: true, serverMessageId, status: 'SENT' }
        │
9. Client receives ACK → updates optimistic entry (status: SENT, id: serverMessageId)
        │
10. Receiver's socket receives 'message:new' → TanStack Query cache updated
        │
11. Receiver's device emits 'mark-delivered' → SERVER updates deliveredAt
        │
12. Sender receives 'message:delivered' → status: DELIVERED (✓✓)
        │
13. Receiver opens conversation → emits 'mark-read'
        │
14. Sender receives 'message:read' → status: READ (blue ✓✓)
```

---

## 👁️ Presence Service Architecture

```
PresenceService (in-memory)
├── socketMap: Map<userId, Set<socketId>>     ← Multi-device tracking
├── presenceMap: Map<userId, UserPresence>    ← Current status
└── typingTimers: Map<userId:convId, Timer>  ← Auto-clear typing

Status values:
  ONLINE | OFFLINE | IDLE | TYPING | RECORDING_AUDIO | UPLOADING | DO_NOT_DISTURB

Multi-device:
  User A → Phone (socket-abc)
         → Laptop (socket-xyz)
         → Tablet (socket-def)
  All three in Set<socketId>
  User is ONLINE if Set.size > 0

Typing (NEVER hits database):
  client: emit('typing-start', { conversationId })
  server: PresenceService.startTyping(userId, conversationId)
       → 5s auto-clear timer
  server: emit to conv:${conversationId} room → 'typing:start'

Redis Migration Path:
  Replace PresenceService with RedisPresenceService
  Uses: HSET presence:{userId} socketIds [...] status ONLINE
  No interface changes needed
```

---

## 📑 Socket Room Architecture

```
Connection:
  socket.join(`user:${userId}`)    ← Private room, all devices share this

Per Conversation:
  socket.join(`conv:${conversationId}`)  ← Joined via 'open-conversation' event

Broadcasting:
  New message to ALL devices of ALL participants:
    server.to(`user:${recipientId}`).emit('message:new')
  
  Typing to other participants in conversation:
    socket.to(`conv:${conversationId}`).emit('typing:start')
  
  Delivery + read receipts to original sender:
    server.to(`user:${senderId}`).emit('message:delivered')
```

---

## 🎯 Client Architecture

### Redux (chatSlice) — UI State Only
```typescript
{
  activeConversationId: string | null,    // Which chat is open
  typingMap: Record<conversationId, userId[]>,  // Who is typing (from socket)
  inputDrafts: Record<conversationId, string>,  // Per-conversation input drafts
  presenceMap: Record<userId, PresenceEntry>,   // Online status (from socket)
  isSocketConnected: boolean,
  isEmojiPickerOpen: boolean,
  isRecordingAudio: boolean,
  replyToMessageId: string | null,
}
```

### TanStack Query — Server State
```typescript
['chat', 'conversations']              → useConversations()  — conversation list
['chat', 'messages', conversationId]   → useMessages()       — infinite scroll
['chat', 'presence', userId]           → usePresence()       — REST fallback
```

### SocketProvider (mounted once in AppProviders)
- Creates single socket.io-client connection per authenticated session
- Routes ALL socket events to Redux (typing/presence) or TanStack Query (messages)
- Provides `emit()` and `joinConversation()` via React context
- Reconnects automatically on auth token change

### useChatConversation hook
- High-level abstraction for page components
- Takes `targetUserId` → returns `messages`, `sendTextMessage`, `emitTyping`, etc.
- Handles conversation initialization, socket room joining, optimistic updates

---

## 🚀 Horizontal Scaling Strategy

### Current (Single Server)
```
Node.js process
  └── In-memory PresenceService
  └── In-memory rate limiter
  └── EventEmitter ChatEventDispatcher
```

### Phase 2 (Redis Adapter)
```
Multiple Node.js processes
  └── RedisPresenceService (ioredis HSET/EXPIRE)
  └── Redis rate limiter (INCR + EXPIRE)
  └── @nestjs/platform-socket.io adapter → socket.io-redis (pub/sub)
```

### Phase 3 (Microservices)
```
ChatGateway Service (Socket.IO cluster)
ChatService        (message processing)
NotificationService (event consumers)
PresenceService    (dedicated Redis-backed)
        ↕ Kafka / NATS topics
```

No interface changes needed — ChatService depends on IChatEventDispatcher, not EventEmitter directly.

---

## ⚡ Event-Driven Architecture

```
ChatEventDispatcher (extends EventEmitter)
  │
  ├── MESSAGE_CREATED  →  ChatGateway (broadcast to participants)
  │                   →  NotificationService (offline push — future)
  │                   →  AnalyticsService (future)
  │                   →  SearchIndexer (future)
  │
  ├── MESSAGE_DELIVERED → ChatGateway (notify sender)
  ├── MESSAGE_READ      → ChatGateway (notify sender, clear unread)
  ├── MESSAGE_EDITED    → ChatGateway (broadcast to conversation room)
  └── MESSAGE_DELETED   → ChatGateway (broadcast to conversation room)

To add a new subscriber (e.g. NotificationService):
  chatEventDispatcher.subscribe('MESSAGE_CREATED', (payload) => {
    // send push notification
  });
  — No changes to ChatService or ChatGateway required.
```

---

## 📦 Installed Dependencies

### Backend
```json
"@nestjs/websockets": "^11.0.0"
"@nestjs/platform-socket.io": "^11.0.0"
"socket.io": "^4.8.1"
"ioredis": "^5.6.1"
```

### Frontend
```json
"socket.io-client": "^4.8.1"
"uuid": "latest"
"@types/uuid": "latest"
```

---

## 🔐 Security Measures

1. **Socket Authentication**: JWT extracted from `handshake.auth.token` → `JwtService.verify()` → userId stored in `socket.data.userId`
2. **Message Authorization**: `isParticipant()` check before every operation
3. **Privacy Validation**: Bidirectional block check (sender blocks receiver AND receiver blocks sender)
4. **Rate Limiting**: 20 messages per 10 seconds per userId (in-memory, Redis-ready)
5. **Content Validation**: class-validator on every DTO before service call
6. **Idempotency**: `clientMessageId` UNIQUE constraint prevents duplicate messages on retry
7. **Input Sanitization**: `whitelist: true` on ValidationPipe strips unknown fields
8. **Soft Delete**: Messages are never physically deleted — audit trail preserved

---

## 🧩 Reused Modules (Zero Duplication)

| Capability | Source Module | Used By Chat |
|------------|---------------|--------------|
| JWT verification | AuthModule.JwtService | ChatGateway socket auth |
| Block check | PrivacyModule.PrivacyService.checkIsBlocked() | ChatService.sendMessage() |
| User lookup | UserModule.UserRepository.findByUserId() | ChatService |
| File upload | StorageModule.StorageService | Future: media messages |
| Follow check | UserModule.FollowRepository | Future: restrict to friends only |

---

## 🗂️ File Map

```
backend/src/modules/chat/
├── chat.gateway.ts                    ← Socket.IO gateway (thin handlers)
├── chat.module.ts                     ← NestJS module with all providers
├── constants/
│   └── chat.constants.ts              ← Event names, limits, Redis keys
├── controllers/
│   └── chat.controller.ts             ← HTTP REST endpoints
├── dto/
│   ├── conversation-response.dto.ts   ← Response shapes
│   └── send-message.dto.ts            ← Validated input DTOs
├── entities/
│   ├── conversation.entity.ts         ← TypeORM: chat_conversations
│   ├── conversation-participant.entity.ts ← TypeORM: chat_participants
│   └── message.entity.ts              ← TypeORM: chat_messages
├── interfaces/
│   ├── chat-event.interface.ts        ← Event type definitions
│   └── presence.interface.ts          ← Presence type definitions
├── repositories/
│   ├── conversation.repository.ts     ← Conversation DB operations
│   └── message.repository.ts          ← Message DB operations (cursor pagination)
└── services/
    ├── chat.service.ts                 ← Core business logic
    ├── chat-event.dispatcher.ts        ← EventEmitter (Kafka-ready interface)
    └── presence.service.ts             ← Multi-device presence tracking

client/
├── providers/
│   └── SocketProvider.tsx             ← Single socket connection, event routing
├── lib/
│   ├── store/slices/chatSlice.ts      ← Redux UI-only chat state
│   └── services/chat.service.ts       ← HTTP API calls
├── hooks/api/
│   ├── useChat.ts                     ← TanStack Query hooks (conversations, messages)
│   └── useChatConversation.ts         ← High-level hook for pages
├── components/shared/
│   ├── CompanionAvatar.tsx            ← Extracted (was duplicated in 2 pages)
│   └── AudioMessagePlayer.tsx         ← Extracted (was duplicated in 2 pages)
└── app/profile/friends/
    └── [chatId]/page.tsx              ← Connected to real socket + API
```
