import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CommunityDiscoveryState {
  selectedClusters: string[];
  searchQuery: string;
  isMapLoaded: boolean;
}

const initialState: CommunityDiscoveryState = {
  selectedClusters: [],
  searchQuery: '',
  isMapLoaded: false,
};

export const communityDiscoverySlice = createSlice({
  name: 'communityDiscovery',
  initialState,
  reducers: {
    toggleClusterSelection: (state, action: PayloadAction<string>) => {
      const clusterId = action.payload;
      if (state.selectedClusters.includes(clusterId)) {
        state.selectedClusters = state.selectedClusters.filter(id => id !== clusterId);
      } else {
        state.selectedClusters.push(clusterId);
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setMapLoaded: (state, action: PayloadAction<boolean>) => {
      state.isMapLoaded = action.payload;
    },
    clearFilters: (state) => {
      state.selectedClusters = [];
      state.searchQuery = '';
    }
  },
});

export const {
  toggleClusterSelection,
  setSearchQuery,
  setMapLoaded,
  clearFilters,
} = communityDiscoverySlice.actions;

export default communityDiscoverySlice.reducer;
