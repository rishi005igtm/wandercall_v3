import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CommunityMembershipState {
  isInviteModalOpen: boolean;
  selectedMemberId: string | null;
  isRoleModalOpen: boolean;
  isTransferOwnershipModalOpen: boolean;
  isKickModalOpen: boolean;
  isBanModalOpen: boolean;
  searchQuery: string;
}

const initialState: CommunityMembershipState = {
  isInviteModalOpen: false,
  selectedMemberId: null,
  isRoleModalOpen: false,
  isTransferOwnershipModalOpen: false,
  isKickModalOpen: false,
  isBanModalOpen: false,
  searchQuery: '',
};

const communityMembershipSlice = createSlice({
  name: 'communityMembership',
  initialState,
  reducers: {
    setInviteModalOpen(state, action: PayloadAction<boolean>) {
      state.isInviteModalOpen = action.payload;
    },
    setSelectedMember(state, action: PayloadAction<string | null>) {
      state.selectedMemberId = action.payload;
    },
    setRoleModalOpen(state, action: PayloadAction<boolean>) {
      state.isRoleModalOpen = action.payload;
    },
    setTransferOwnershipModalOpen(state, action: PayloadAction<boolean>) {
      state.isTransferOwnershipModalOpen = action.payload;
    },
    setKickModalOpen(state, action: PayloadAction<boolean>) {
      state.isKickModalOpen = action.payload;
    },
    setBanModalOpen(state, action: PayloadAction<boolean>) {
      state.isBanModalOpen = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    resetMembershipState(state) {
      return initialState;
    },
  },
});

export const {
  setInviteModalOpen,
  setSelectedMember,
  setRoleModalOpen,
  setTransferOwnershipModalOpen,
  setKickModalOpen,
  setBanModalOpen,
  setSearchQuery,
  resetMembershipState,
} = communityMembershipSlice.actions;

export default communityMembershipSlice.reducer;
