// src/features/verification/verificationSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';

interface VerificationState {
  badges: Record<string, boolean>;
  score: number;
  pending: string[];
  socialLinks: SocialLink[];
  // Email verification
  emailStep: 'input' | 'code' | 'success';
  emailCountdown: number;
  // Phone verification
  phoneCountdown: number;
  // Shared
  isLoading: boolean;
  error: string | null;
}

// Fetch verification status
export const fetchVerificationStatus = createAsyncThunk(
  'verification/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/verification/status');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch status');
    }
  }
);

// Email verification
export const sendEmailCode = createAsyncThunk(
  'verification/sendEmailCode',
  async (email: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/verification/email/send', { email });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send code');
    }
  }
);

export const verifyEmailCode = createAsyncThunk(
  'verification/verifyEmailCode',
  async (code: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/verification/email/verify', { code });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Verification failed');
    }
  }
);

export const resendEmailCode = createAsyncThunk(
  'verification/resendEmailCode',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/verification/email/resend');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resend');
    }
  }
);

// Social links
export const fetchSocialLinks = createAsyncThunk(
  'verification/fetchSocialLinks',
  async () => {
    const { data } = await apiClient.get('/social/links');
    return data;
  }
);

export const linkSocialAccount = createAsyncThunk(
  'verification/linkSocial',
  async (
    { provider, token }: { provider: string; token: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.post('/social/link', { provider, token });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Linking failed');
    }
  }
);

export const unlinkSocialAccount = createAsyncThunk(
  'verification/unlinkSocial',
  async (linkId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/social/links/${linkId}`);
      return linkId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Unlinking failed');
    }
  }
);

const verificationSlice = createSlice({
  name: 'verification',
  initialState: {
    badges: {},
    score: 0,
    pending: [],
    socialLinks: [],
    emailStep: 'input',
    emailCountdown: 0,
    phoneCountdown: 0,
    isLoading: false,
    error: null,
  } as VerificationState,
  reducers: {
    setEmailStep: (state, action) => {
      state.emailStep = action.payload;
    },
    decrementEmailCountdown: (state) => {
      if (state.emailCountdown > 0) state.emailCountdown -= 1;
    },
    decrementPhoneCountdown: (state) => {
      if (state.phoneCountdown > 0) state.phoneCountdown -= 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch status
      .addCase(fetchVerificationStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVerificationStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.badges = action.payload.badges || {};
        state.score = action.payload.score || 0;
        state.pending = action.payload.pending || [];
      })
      .addCase(fetchVerificationStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Email
      .addCase(sendEmailCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendEmailCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.emailStep = 'code';
        state.emailCountdown = action.payload.expiresIn;
      })
      .addCase(sendEmailCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyEmailCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmailCode.fulfilled, (state) => {
        state.isLoading = false;
        state.emailStep = 'success';
        state.badges.email = true;
      })
      .addCase(verifyEmailCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Social
      .addCase(fetchSocialLinks.fulfilled, (state, action) => {
        state.socialLinks = action.payload;
      })
      .addCase(linkSocialAccount.fulfilled, (state, action) => {
        state.socialLinks.push(action.payload);
        state.badges.social = true;
      })
      .addCase(unlinkSocialAccount.fulfilled, (state, action) => {
        state.socialLinks = state.socialLinks.filter((l) => l.id !== action.payload);
      });
  },
});

export const {
  setEmailStep,
  decrementEmailCountdown,
  decrementPhoneCountdown,
  clearError,
} = verificationSlice.actions;

export default verificationSlice.reducer;
