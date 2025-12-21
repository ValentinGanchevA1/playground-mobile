// src/features/discovery/discoverySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';
import { User } from '../profile/types';

interface DiscoveryState {
  profiles: User[];
  currentIndex: number;
  matches: Match[];
  likesReceived: LikeReceived[];
  isLoading: boolean;
  error: string | null;
  filters: DiscoveryFilters;
  hasMore: boolean;
  lastSwipedProfile: User | null;
  boostStatus: {
    isBoosted: boolean;
    boostedUntil: string | null;
  };
}

interface Match {
  id: string;
  user: User;
  matchedAt: string;
  lastMessage?: string;
  unread: boolean;
}

interface LikeReceived {
  id: string;
  user: User;
  type: 'like' | 'super_like';
  createdAt: string;
}

interface DiscoveryFilters {
  minAge: number;
  maxAge: number;
  maxDistance: number; // in km
  genders: string[];
  goals: string[];
}

const initialState: DiscoveryState = {
  profiles: [],
  currentIndex: 0,
  matches: [],
  likesReceived: [],
  isLoading: false,
  error: null,
  filters: {
    minAge: 18,
    maxAge: 50,
    maxDistance: 50,
    genders: [],
    goals: [],
  },
  hasMore: true,
  lastSwipedProfile: null,
  boostStatus: {
    isBoosted: false,
    boostedUntil: null,
  },
};

export const fetchDiscoveryProfiles = createAsyncThunk(
  'discovery/fetchProfiles',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { discovery } = getState() as { discovery: DiscoveryState };
      const { data } = await apiClient.get('/discovery/profiles', {
        params: {
          ...discovery.filters,
          skip: discovery.profiles.length,
          limit: 10,
        },
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profiles');
    }
  }
);

export const likeProfile = createAsyncThunk(
  'discovery/like',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/discovery/like/${userId}`);
      return data; // Returns { matched: boolean, match?: Match }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like profile');
    }
  }
);

export const passProfile = createAsyncThunk(
  'discovery/pass',
  async (userId: string, { rejectWithValue }) => {
    try {
      await apiClient.post(`/discovery/pass/${userId}`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to pass profile');
    }
  }
);

export const superLikeProfile = createAsyncThunk(
  'discovery/superLike',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/discovery/super-like/${userId}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to super like');
    }
  }
);

export const fetchMatches = createAsyncThunk(
  'discovery/fetchMatches',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/discovery/matches');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch matches');
    }
  }
);

export const unmatch = createAsyncThunk(
  'discovery/unmatch',
  async (matchId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/discovery/matches/${matchId}`);
      return matchId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unmatch');
    }
  }
);

export const fetchLikesReceived = createAsyncThunk(
  'discovery/fetchLikesReceived',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/discovery/likes');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch likes');
    }
  }
);

export const rewindLastSwipe = createAsyncThunk(
  'discovery/rewind',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/discovery/rewind');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rewind');
    }
  }
);

export const activateBoost = createAsyncThunk(
  'discovery/boost',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/discovery/boost');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to activate boost');
    }
  }
);

export const fetchBoostStatus = createAsyncThunk(
  'discovery/fetchBoostStatus',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/discovery/boost/status');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch boost status');
    }
  }
);

const discoverySlice = createSlice({
  name: 'discovery',
  initialState,
  reducers: {
    nextProfile: (state) => {
      if (state.currentIndex < state.profiles.length - 1) {
        state.currentIndex += 1;
      }
    },
    updateFilters: (state, action: PayloadAction<Partial<DiscoveryFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset profiles when filters change
      state.profiles = [];
      state.currentIndex = 0;
      state.hasMore = true;
    },
    resetDiscovery: (state) => {
      state.profiles = [];
      state.currentIndex = 0;
      state.hasMore = true;
    },
    addMatch: (state, action: PayloadAction<Match>) => {
      state.matches.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscoveryProfiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDiscoveryProfiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profiles = [...state.profiles, ...action.payload.profiles];
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchDiscoveryProfiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(likeProfile.fulfilled, (state, action) => {
        // Store the swiped profile before incrementing
        state.lastSwipedProfile = state.profiles[state.currentIndex] || null;
        state.currentIndex += 1;
        if (action.payload.matched) {
          state.matches.unshift(action.payload.match);
        }
      })
      .addCase(passProfile.fulfilled, (state) => {
        // Store the swiped profile before incrementing
        state.lastSwipedProfile = state.profiles[state.currentIndex] || null;
        state.currentIndex += 1;
      })
      .addCase(superLikeProfile.fulfilled, (state, action) => {
        // Store the swiped profile before incrementing
        state.lastSwipedProfile = state.profiles[state.currentIndex] || null;
        state.currentIndex += 1;
        if (action.payload.matched) {
          state.matches.unshift(action.payload.match);
        }
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.matches = action.payload;
      })
      .addCase(unmatch.fulfilled, (state, action) => {
        state.matches = state.matches.filter((m) => m.id !== action.payload);
      })
      // Likes received
      .addCase(fetchLikesReceived.fulfilled, (state, action) => {
        state.likesReceived = action.payload;
      })
      // Rewind
      .addCase(rewindLastSwipe.fulfilled, (state, action) => {
        if (action.payload?.profile && state.currentIndex > 0) {
          // Insert the rewound profile at the current position
          state.profiles.splice(state.currentIndex - 1, 0, action.payload.profile);
          state.currentIndex -= 1;
          state.lastSwipedProfile = null;
        }
      })
      // Boost
      .addCase(activateBoost.fulfilled, (state, action) => {
        state.boostStatus = {
          isBoosted: true,
          boostedUntil: action.payload.boostedUntil,
        };
      })
      .addCase(fetchBoostStatus.fulfilled, (state, action) => {
        state.boostStatus = {
          isBoosted: action.payload.isBoosted,
          boostedUntil: action.payload.boostedUntil,
        };
      });
  },
});

export const { nextProfile, updateFilters, resetDiscovery, addMatch } = discoverySlice.actions;
export type { LikeReceived };
export default discoverySlice.reducer;
