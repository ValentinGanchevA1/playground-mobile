// src/features/interactions/interactionsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';

export interface Wave {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  isRead: boolean;
  createdAt: string;
}

interface InteractionsState {
  sentWaves: { [userId: string]: number }; // userId -> timestamp (cooldown tracking)
  receivedWaves: Wave[];
  unreadCount: number;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

const initialState: InteractionsState = {
  sentWaves: {},
  receivedWaves: [],
  unreadCount: 0,
  isLoading: false,
  isSending: false,
  error: null,
};

export const sendWave = createAsyncThunk(
  'interactions/sendWave',
  async (toUserId: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/interactions/wave', { toUserId });
      return { toUserId, wave: data.wave };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send wave';
      return rejectWithValue(message);
    }
  }
);

export const fetchReceivedWaves = createAsyncThunk(
  'interactions/fetchReceived',
  async (limit: number = 50, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/interactions/waves/received?limit=${limit}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch waves');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'interactions/fetchUnreadCount',
  async () => {
    const { data } = await apiClient.get('/interactions/waves/unread-count');
    return data.count;
  }
);

export const markWaveAsRead = createAsyncThunk(
  'interactions/markAsRead',
  async (waveId: string, { rejectWithValue }) => {
    try {
      await apiClient.patch(`/interactions/waves/${waveId}/read`);
      return waveId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const markAllWavesAsRead = createAsyncThunk(
  'interactions/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/interactions/waves/read-all');
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

const interactionsSlice = createSlice({
  name: 'interactions',
  initialState,
  reducers: {
    addReceivedWave: (state, action: PayloadAction<Wave>) => {
      // Add to beginning of list
      state.receivedWaves.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetInteractions: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Send wave
      .addCase(sendWave.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendWave.fulfilled, (state, action) => {
        state.isSending = false;
        state.sentWaves[action.payload.toUserId] = Date.now();
      })
      .addCase(sendWave.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      })
      // Fetch received waves
      .addCase(fetchReceivedWaves.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchReceivedWaves.fulfilled, (state, action) => {
        state.isLoading = false;
        state.receivedWaves = action.payload;
      })
      .addCase(fetchReceivedWaves.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      // Mark as read
      .addCase(markWaveAsRead.fulfilled, (state, action) => {
        const wave = state.receivedWaves.find((w) => w.id === action.payload);
        if (wave && !wave.isRead) {
          wave.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark all as read
      .addCase(markAllWavesAsRead.fulfilled, (state) => {
        state.receivedWaves.forEach((wave) => {
          wave.isRead = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { addReceivedWave, clearError, resetInteractions } = interactionsSlice.actions;
export default interactionsSlice.reducer;
