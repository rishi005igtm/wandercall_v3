import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CommunityWizardState {
  currentStep: number;
  coreDetails: {
    name: string;
    slug: string;
    description: string;
    primaryCategoryId: string;
  };
  branding: {
    avatar: string;
    cover: string;
  };
  settings: {
    visibility: string;
    approvalRequired: boolean;
    allowInvite: boolean;
  };
}

const initialState: CommunityWizardState = {
  currentStep: 1,
  coreDetails: {
    name: '',
    slug: '',
    description: '',
    primaryCategoryId: '',
  },
  branding: {
    avatar: '',
    cover: '',
  },
  settings: {
    visibility: 'PUBLIC',
    approvalRequired: false,
    allowInvite: true,
  },
};

export const communityWizardSlice = createSlice({
  name: 'communityWizard',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updateCoreDetails: (state, action: PayloadAction<Partial<CommunityWizardState['coreDetails']>>) => {
      state.coreDetails = { ...state.coreDetails, ...action.payload };
    },
    updateBranding: (state, action: PayloadAction<Partial<CommunityWizardState['branding']>>) => {
      state.branding = { ...state.branding, ...action.payload };
    },
    updateSettings: (state, action: PayloadAction<Partial<CommunityWizardState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    resetWizard: (state) => {
      return initialState;
    },
  },
});

export const {
  setStep,
  updateCoreDetails,
  updateBranding,
  updateSettings,
  resetWizard,
} = communityWizardSlice.actions;

export default communityWizardSlice.reducer;
