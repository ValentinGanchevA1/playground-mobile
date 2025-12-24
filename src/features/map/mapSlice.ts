// src/features/map/mapSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';

interface Location {
  lat: number;
  lng: number;
}

interface NearbyUser {
  id: string;
  displayName: string;
  avatarUrl?: string;
  latitude: number;
  longitude: number;
  distance: number; // in km
  verificationScore: number;
  isOnline: boolean;
}

interface MapState {
  currentLocation: Location | null;
  nearbyUsers: NearbyUser[];
  isLoading: boolean;
  error: string | null;
  lastLocationUpdate: number | null;
}

const initialState: MapState = {
  currentLocation: null,
  nearbyUsers: [],
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
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(updateUserLocation.fulfilled, (state, action) => {
        state.currentLocation = action.payload;
        state.lastLocationUpdate = Date.now();
      })
      .addCase(updateUserLocation.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { updateLocation, setNearbyUsers, setError, updateNearbyUser, setUserOnline } = mapSlice.actions;
export type { NearbyUser };

export default mapSlice.reducer;
