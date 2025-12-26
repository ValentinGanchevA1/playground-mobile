import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { apiClient } from '../../api/client';

// Helper to extract error message
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

// Types
export interface TradeListing {
  id: string;
  sellerId: string;
  title: string;
  description: string | null;
  category: string;
  condition: string;
  photos: string[];
  address: string | null;
  lookingFor: string | null;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  latitude: number;
  longitude: number;
  distance: number;
  sellerName: string;
  sellerAvatar: string | null;
  verificationScore: number;
  offerCount: number;
  isFavorited?: boolean;
}

export interface TradeOffer {
  id: string;
  listingId: string;
  buyerId: string;
  message: string | null;
  offerItems: string | null;
  status: string;
  createdAt: string;
  respondedAt: string | null;
  listing?: TradeListing;
  buyer?: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export interface TradingFilters {
  category?: string;
  condition?: string;
  radius: number;
}

interface TradingState {
  nearbyListings: TradeListing[];
  myListings: TradeListing[];
  favorites: TradeListing[];
  receivedOffers: TradeOffer[];
  sentOffers: TradeOffer[];
  currentListing: TradeListing | null;
  filters: TradingFilters;
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  hasMore: boolean;
}

const initialState: TradingState = {
  nearbyListings: [],
  myListings: [],
  favorites: [],
  receivedOffers: [],
  sentOffers: [],
  currentListing: null,
  filters: { radius: 25 },
  isLoading: false,
  isUploading: false,
  error: null,
  hasMore: true,
};

// ═══════════════════════════════════════════════════════════════════════
// Async Thunks - Listings
// ═══════════════════════════════════════════════════════════════════════

export const fetchNearbyListings = createAsyncThunk(
  'trading/fetchNearby',
  async (
    {
      latitude,
      longitude,
      refresh = false,
    }: {
      latitude: number;
      longitude: number;
      refresh?: boolean;
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const { trading } = getState() as { trading: TradingState };
      const offset = refresh ? 0 : trading.nearbyListings.length;

      const { data } = await apiClient.get('/trading/listings/nearby', {
        params: {
          latitude,
          longitude,
          radius: trading.filters.radius,
          category: trading.filters.category,
          condition: trading.filters.condition,
          limit: 20,
          offset,
        },
      });
      return { listings: data, refresh };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch listings'));
    }
  },
);

export const fetchMyListings = createAsyncThunk(
  'trading/fetchMyListings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/trading/listings/my');
      return data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch your listings'));
    }
  },
);

export const fetchListingDetails = createAsyncThunk(
  'trading/fetchListingDetails',
  async (listingId: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/trading/listings/${listingId}`);
      return data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch listing details'));
    }
  },
);

export const createListing = createAsyncThunk(
  'trading/createListing',
  async (
    listingData: {
      title: string;
      description?: string;
      category: string;
      condition: string;
      latitude: number;
      longitude: number;
      address?: string;
      lookingFor?: string;
      photos?: string[];
    },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await apiClient.post('/trading/listings', listingData);
      return data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create listing'));
    }
  },
);

export const uploadListingPhoto = createAsyncThunk(
  'trading/uploadPhoto',
  async (
    photo: { uri: string; type?: string; name?: string },
    { rejectWithValue },
  ) => {
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: photo.name || `photo-${Date.now()}.jpg`,
      } as unknown as Blob);

      const { data } = await apiClient.post(
        '/trading/listings/upload-photo',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      return data.url;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to upload photo'));
    }
  },
);

export const updateListing = createAsyncThunk(
  'trading/updateListing',
  async (
    {
      listingId,
      updates,
    }: {
      listingId: string;
      updates: Partial<{
        title: string;
        description: string;
        category: string;
        condition: string;
        photos: string[];
        address: string;
        lookingFor: string;
        status: string;
      }>;
    },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await apiClient.patch(
        `/trading/listings/${listingId}`,
        updates,
      );
      return data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update listing'));
    }
  },
);

export const deleteListing = createAsyncThunk(
  'trading/deleteListing',
  async (listingId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/trading/listings/${listingId}`);
      return listingId;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to delete listing'));
    }
  },
);

export const completeTrade = createAsyncThunk(
  'trading/completeTrade',
  async (listingId: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(
        `/trading/listings/${listingId}/complete`,
      );
      return data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to complete trade'));
    }
  },
);

export const toggleFavorite = createAsyncThunk(
  'trading/toggleFavorite',
  async (listingId: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(
        `/trading/listings/${listingId}/favorite`,
      );
      return { listingId, isFavorited: data.isFavorited };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update favorite'));
    }
  },
);

export const fetchFavorites = createAsyncThunk(
  'trading/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/trading/listings/favorites');
      return data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch favorites'));
    }
  },
);

// ═══════════════════════════════════════════════════════════════════════
// Async Thunks - Offers
// ═══════════════════════════════════════════════════════════════════════

export const makeOffer = createAsyncThunk(
  'trading/makeOffer',
  async (
    {
      listingId,
      message,
      offerItems,
    }: {
      listingId: string;
      message?: string;
      offerItems?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await apiClient.post(
        `/trading/listings/${listingId}/offers`,
        { message, offerItems },
      );
      return data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to make offer'));
    }
  },
);

export const fetchReceivedOffers = createAsyncThunk(
  'trading/fetchReceivedOffers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/trading/offers/received');
      return data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch offers'));
    }
  },
);

export const fetchSentOffers = createAsyncThunk(
  'trading/fetchSentOffers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/trading/offers/sent');
      return data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch offers'));
    }
  },
);

export const acceptOffer = createAsyncThunk(
  'trading/acceptOffer',
  async (offerId: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.patch(`/trading/offers/${offerId}/accept`);
      return data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to accept offer'));
    }
  },
);

export const rejectOffer = createAsyncThunk(
  'trading/rejectOffer',
  async (offerId: string, { rejectWithValue }) => {
    try {
      await apiClient.patch(`/trading/offers/${offerId}/reject`);
      return offerId;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to reject offer'));
    }
  },
);

export const withdrawOffer = createAsyncThunk(
  'trading/withdrawOffer',
  async (offerId: string, { rejectWithValue }) => {
    try {
      await apiClient.patch(`/trading/offers/${offerId}/withdraw`);
      return offerId;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to withdraw offer'));
    }
  },
);

// ═══════════════════════════════════════════════════════════════════════
// Slice
// ═══════════════════════════════════════════════════════════════════════

const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    updateFilters: (state, action: PayloadAction<Partial<TradingFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.nearbyListings = [];
      state.hasMore = true;
    },
    setCurrentListing: (state, action: PayloadAction<TradeListing | null>) => {
      state.currentListing = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetListings: (state) => {
      state.nearbyListings = [];
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Nearby listings
      .addCase(fetchNearbyListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNearbyListings.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.refresh) {
          state.nearbyListings = action.payload.listings;
        } else {
          state.nearbyListings = [
            ...state.nearbyListings,
            ...action.payload.listings,
          ];
        }
        state.hasMore = action.payload.listings.length === 20;
      })
      .addCase(fetchNearbyListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // My listings
      .addCase(fetchMyListings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyListings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myListings = action.payload;
      })
      .addCase(fetchMyListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Listing details
      .addCase(fetchListingDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchListingDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentListing = action.payload;
      })
      .addCase(fetchListingDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create listing
      .addCase(createListing.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createListing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myListings.unshift(action.payload);
      })
      .addCase(createListing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Upload photo
      .addCase(uploadListingPhoto.pending, (state) => {
        state.isUploading = true;
      })
      .addCase(uploadListingPhoto.fulfilled, (state) => {
        state.isUploading = false;
      })
      .addCase(uploadListingPhoto.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload as string;
      })

      // Update listing
      .addCase(updateListing.fulfilled, (state, action) => {
        const index = state.myListings.findIndex(
          (l) => l.id === action.payload.id,
        );
        if (index !== -1) {
          state.myListings[index] = action.payload;
        }
        if (state.currentListing?.id === action.payload.id) {
          state.currentListing = action.payload;
        }
      })

      // Delete listing
      .addCase(deleteListing.fulfilled, (state, action) => {
        state.myListings = state.myListings.filter(
          (l) => l.id !== action.payload,
        );
      })

      // Complete trade
      .addCase(completeTrade.fulfilled, (state, action) => {
        const index = state.myListings.findIndex(
          (l) => l.id === action.payload.id,
        );
        if (index !== -1) {
          state.myListings[index] = action.payload;
        }
      })

      // Toggle favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { listingId, isFavorited } = action.payload;
        // Update in nearby listings
        const nearbyIndex = state.nearbyListings.findIndex(
          (l) => l.id === listingId,
        );
        if (nearbyIndex !== -1) {
          state.nearbyListings[nearbyIndex].isFavorited = isFavorited;
        }
        // Update current listing
        if (state.currentListing?.id === listingId) {
          state.currentListing.isFavorited = isFavorited;
        }
        // Update favorites list
        if (!isFavorited) {
          state.favorites = state.favorites.filter((l) => l.id !== listingId);
        }
      })

      // Fetch favorites
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })

      // Received offers
      .addCase(fetchReceivedOffers.fulfilled, (state, action) => {
        state.receivedOffers = action.payload;
      })

      // Sent offers
      .addCase(fetchSentOffers.fulfilled, (state, action) => {
        state.sentOffers = action.payload;
      })

      // Accept offer
      .addCase(acceptOffer.fulfilled, (state, action) => {
        const index = state.receivedOffers.findIndex(
          (o) => o.id === action.payload.id,
        );
        if (index !== -1) {
          state.receivedOffers[index] = action.payload;
        }
      })

      // Reject offer
      .addCase(rejectOffer.fulfilled, (state, action) => {
        state.receivedOffers = state.receivedOffers.filter(
          (o) => o.id !== action.payload,
        );
      })

      // Withdraw offer
      .addCase(withdrawOffer.fulfilled, (state, action) => {
        state.sentOffers = state.sentOffers.filter(
          (o) => o.id !== action.payload,
        );
      });
  },
});

export const { updateFilters, setCurrentListing, clearError, resetListings } =
  tradingSlice.actions;

export default tradingSlice.reducer;
