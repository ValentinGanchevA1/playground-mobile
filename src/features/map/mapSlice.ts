// src/features/map/mapSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';

interface Location {
  lat: number;
  lng: number;
}

export type MarkerCategory = 'dating' | 'trading';

interface NearbyUser {
  id: string;
  displayName: string;
  avatarUrl?: string;
  latitude: number;
  longitude: number;
  distance: number; // in km
  verificationScore: number;
  isOnline: boolean;
  primaryCategory: MarkerCategory;
  secondaryCategory: MarkerCategory | null;
  goals: string[];
}

interface NearbyEvent {
  id: string;
  title: string;
  category: string;
  latitude: number;
  longitude: number;
  distance: number;
  startTime: string;
  attendeeCount: number;
  hostName: string;
  hostAvatar: string | null;
  coverImageUrl: string | null;
}

interface MapFilters {
  dating: boolean;
  trading: boolean;
  events: boolean;
}

interface MapDataResponse {
  users: NearbyUser[];
  events: NearbyEvent[];
}

interface MapState {
  currentLocation: Location | null;
  nearbyUsers: NearbyUser[];
  nearbyEvents: NearbyEvent[];
  filters: MapFilters;
  isLoading: boolean;
  error: string | null;
  lastLocationUpdate: number | null;
}

const initialState: MapState = {
  currentLocation: null,
  nearbyUsers: [],
  nearbyEvents: [],
  filters: {
    dating: true,
    trading: true,
    events: true,
  },
  isLoading: false,
  error: null,
  lastLocationUpdate: null,
};

export const updateUserLocation = createAsyncThunk(
  'map/updateUserLocation',
  async ({ lat, lng }: { lat: number; lng: number }, { rejectWithValue }) => {
    try {
      await apiClient.post('/locations/update', {
        latitude: lat,
        longitude: lng,
      });
      return { lat, lng };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update location');
    }
  }
);

// Legacy thunk - keep for backward compatibility
export const fetchNearbyUsers = createAsyncThunk(
  'map/fetchNearbyUsers',
  async ({ lat, lng, radius }: { lat: number; lng: number; radius: number }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<NearbyUser[]>('/locations/nearby', {
        params: {
          latitude: lat,
          longitude: lng,
          radiusKm: radius,
          limit: 50,
        },
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch nearby users');
    }
  }
);

// New combined thunk for users + events
export const fetchMapData = createAsyncThunk(
  'map/fetchMapData',
  async ({ lat, lng, radius }: { lat: number; lng: number; radius: number }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<MapDataResponse>('/locations/map-data', {
        params: {
          latitude: lat,
          longitude: lng,
          radiusKm: radius,
          limit: 100,
        },
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch map data');
    }
  }
);

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    updateLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
    },
    setNearbyUsers: (state, action: PayloadAction<NearbyUser[]>) => {
      state.nearbyUsers = action.payload;
    },
    setNearbyEvents: (state, action: PayloadAction<NearbyEvent[]>) => {
      state.nearbyEvents = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateNearbyUser: (state, action: PayloadAction<Partial<NearbyUser> & { id: string }>) => {
      const index = state.nearbyUsers.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.nearbyUsers[index] = { ...state.nearbyUsers[index], ...action.payload };
      }
    },
    setUserOnline: (state, action: PayloadAction<string>) => {
      const index = state.nearbyUsers.findIndex((u) => u.id === action.payload);
      if (index !== -1) {
        state.nearbyUsers[index].isOnline = true;
      }
    },
    toggleFilter: (state, action: PayloadAction<keyof MapFilters>) => {
      state.filters[action.payload] = !state.filters[action.payload];
    },
    setFilters: (state, action: PayloadAction<Partial<MapFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Legacy fetchNearbyUsers
      .addCase(fetchNearbyUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNearbyUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nearbyUsers = action.payload;
      })
      .addCase(fetchNearbyUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // New fetchMapData
      .addCase(fetchMapData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMapData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nearbyUsers = action.payload.users;
        state.nearbyEvents = action.payload.events;
      })
      .addCase(fetchMapData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Location update
      .addCase(updateUserLocation.fulfilled, (state, action) => {
        state.currentLocation = action.payload;
        state.lastLocationUpdate = Date.now();
      })
      .addCase(updateUserLocation.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  updateLocation,
  setNearbyUsers,
  setNearbyEvents,
  setError,
  updateNearbyUser,
  setUserOnline,
  toggleFilter,
  setFilters,
} = mapSlice.actions;

export type { NearbyUser, NearbyEvent, MapFilters, MapState };

export default mapSlice.reducer;
