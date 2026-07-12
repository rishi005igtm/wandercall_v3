import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CampfireUiState {
  activeCampfireId: string | null;
  isCreatingCampfire: boolean;
  focusedParticipantId: string | null;
  localAudioMuted: boolean;
  localVideoMuted: boolean;
}

const initialState: CampfireUiState = {
  activeCampfireId: null,
  isCreatingCampfire: false,
  focusedParticipantId: null,
  localAudioMuted: true,
  localVideoMuted: true,
};

export const campfireSlice = createSlice({
  name: 'campfire',
  initialState,
  reducers: {
    setActiveCampfire: (state, action: PayloadAction<string | null>) => {
      state.activeCampfireId = action.payload;
    },
    setCreatingCampfire: (state, action: PayloadAction<boolean>) => {
      state.isCreatingCampfire = action.payload;
    },
    setFocusedParticipant: (state, action: PayloadAction<string | null>) => {
      state.focusedParticipantId = action.payload;
    },
    toggleLocalAudio: (state) => {
      state.localAudioMuted = !state.localAudioMuted;
    },
    toggleLocalVideo: (state) => {
      state.localVideoMuted = !state.localVideoMuted;
    },
  },
});

export const {
  setActiveCampfire,
  setCreatingCampfire,
  setFocusedParticipant,
  toggleLocalAudio,
  toggleLocalVideo,
} = campfireSlice.actions;

export default campfireSlice.reducer;
