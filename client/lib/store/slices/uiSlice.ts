import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  theme: 'dark' | 'light';
  isSidebarOpen: boolean;
  activeModal: string | null;
  onboardingStep: number;
}

const initialState: UiState = {
  theme: 'dark',
  isSidebarOpen: false,
  activeModal: null,
  onboardingStep: 1,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    setOnboardingStep: (state, action: PayloadAction<number>) => {
      state.onboardingStep = action.payload;
    },
  },
});

export const { setTheme, toggleSidebar, openModal, closeModal, setOnboardingStep } = uiSlice.actions;
export default uiSlice.reducer;
