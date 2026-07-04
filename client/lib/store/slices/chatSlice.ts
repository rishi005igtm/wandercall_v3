import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * chatSlice — Redux owns ONLY transient UI state for chat.
 *
 * This slice NEVER stores messages, conversations, or unread counts.
 * Those belong to TanStack Query (server state).
 *
 * This slice owns:
 * - Which conversation is currently open
 * - Typing indicators (ephemeral, never persisted)
 * - Input drafts per conversation
 * - UI toggles (emoji picker, recording, sidebar, modals)
 * - Presence map (ephemeral, from socket events)
 */

export interface TypingUser {
  userId: string;
  conversationId: string;
}

export interface PresenceEntry {
  userId: string;
  status: 'ONLINE' | 'OFFLINE' | 'TYPING' | 'IDLE' | 'RECORDING_AUDIO' | 'DO_NOT_DISTURB';
  lastSeen?: string;
}

export interface ChatUiState {
  /** The conversation ID currently open in the chat panel */
  activeConversationId: string | null;

  /** Map of conversationId → Set of userIds currently typing */
  typingMap: Record<string, string[]>;

  /** Input draft text per conversation (conversationId → draft string) */
  inputDrafts: Record<string, string>;

  /** Attachment staged for sending (before upload) */
  pendingAttachmentConversationId: string | null;

  /** Whether the emoji picker is open */
  isEmojiPickerOpen: boolean;

  /** Whether the user is currently recording audio */
  isRecordingAudio: boolean;

  /** Whether the chat sidebar is visible (mobile) */
  isChatSidebarOpen: boolean;

  /** ID of the message being replied to */
  replyToMessageId: string | null;

  /** Presence map from socket events (userId → PresenceEntry) */
  presenceMap: Record<string, PresenceEntry>;

  /** Whether socket is connected */
  isSocketConnected: boolean;

  /** Socket connection error */
  socketError: string | null;
}

const initialState: ChatUiState = {
  activeConversationId: null,
  typingMap: {},
  inputDrafts: {},
  pendingAttachmentConversationId: null,
  isEmojiPickerOpen: false,
  isRecordingAudio: false,
  isChatSidebarOpen: false,
  replyToMessageId: null,
  presenceMap: {},
  isSocketConnected: false,
  socketError: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
      state.isEmojiPickerOpen = false;
      state.replyToMessageId = null;
    },

    setInputDraft: (
      state,
      action: PayloadAction<{ conversationId: string; draft: string }>,
    ) => {
      state.inputDrafts[action.payload.conversationId] = action.payload.draft;
    },

    clearInputDraft: (state, action: PayloadAction<string>) => {
      delete state.inputDrafts[action.payload];
    },

    // Typing indicators — ephemeral, driven by socket events
    setTypingStart: (
      state,
      action: PayloadAction<{ conversationId: string; userId: string }>,
    ) => {
      const { conversationId, userId } = action.payload;
      if (!state.typingMap[conversationId]) {
        state.typingMap[conversationId] = [];
      }
      if (!state.typingMap[conversationId].includes(userId)) {
        state.typingMap[conversationId].push(userId);
      }
    },

    setTypingStop: (
      state,
      action: PayloadAction<{ conversationId: string; userId: string }>,
    ) => {
      const { conversationId, userId } = action.payload;
      if (state.typingMap[conversationId]) {
        state.typingMap[conversationId] = state.typingMap[conversationId].filter(
          (id) => id !== userId,
        );
      }
    },

    clearTyping: (state, action: PayloadAction<string>) => {
      delete state.typingMap[action.payload];
    },

    // Presence map — updated from socket 'presence:change' events
    updatePresence: (state, action: PayloadAction<PresenceEntry>) => {
      state.presenceMap[action.payload.userId] = action.payload;
    },

    // UI toggles
    toggleEmojiPicker: (state) => {
      state.isEmojiPickerOpen = !state.isEmojiPickerOpen;
    },

    closeEmojiPicker: (state) => {
      state.isEmojiPickerOpen = false;
    },

    setRecordingAudio: (state, action: PayloadAction<boolean>) => {
      state.isRecordingAudio = action.payload;
    },

    toggleChatSidebar: (state) => {
      state.isChatSidebarOpen = !state.isChatSidebarOpen;
    },

    setReplyTo: (state, action: PayloadAction<string | null>) => {
      state.replyToMessageId = action.payload;
    },

    setPendingAttachment: (state, action: PayloadAction<string | null>) => {
      state.pendingAttachmentConversationId = action.payload;
    },

    // Socket connection state
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.isSocketConnected = action.payload;
      if (action.payload) state.socketError = null;
    },

    setSocketError: (state, action: PayloadAction<string | null>) => {
      state.socketError = action.payload;
      state.isSocketConnected = false;
    },

    // Reset all chat UI state (e.g. on logout)
    resetChatState: () => initialState,
  },
});

export const {
  setActiveConversation,
  setInputDraft,
  clearInputDraft,
  setTypingStart,
  setTypingStop,
  clearTyping,
  updatePresence,
  toggleEmojiPicker,
  closeEmojiPicker,
  setRecordingAudio,
  toggleChatSidebar,
  setReplyTo,
  setPendingAttachment,
  setSocketConnected,
  setSocketError,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
