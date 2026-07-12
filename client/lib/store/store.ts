import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import chatReducer from './slices/chatSlice';
import communityWizardReducer from './slices/communityWizardSlice';
import communityMembershipReducer from './slices/communityMembershipSlice';
import communityDiscoveryReducer from './slices/communityDiscoverySlice';
import campfireReducer from './slices/campfireSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    chat: chatReducer,
    communityWizard: communityWizardReducer,
    communityMembership: communityMembershipReducer,
    communityDiscovery: communityDiscoveryReducer,
    campfire: campfireReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
