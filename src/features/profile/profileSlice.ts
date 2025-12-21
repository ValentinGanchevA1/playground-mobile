// src/features/profile/profileSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';
import { ProfileFormData, ProfileStep, PhotoSlot } from './types';

interface ProfileState {
  formData: ProfileFormData;
  currentStep: ProfileStep;
  completionStatus: {
    percentage: number;
    isComplete: boolean;
    nextStep: string | null;
  } | null;
  isSubmitting: boolean;
  error: string | null;
}

const initialFormData: ProfileFormData = {
  displayName: '',
  bio: '',
  age: null,
  gender: null,
  interestedIn: null,
  interests: [],
  goals: [],
  photos: Array(6).fill({ uri: null, isUploading: false, uploadProgress: 0 }),
};

export const submitProfile = createAsyncThunk(
  'profile/submit',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { profile } = getState() as { profile: ProfileState };
      const { formData } = profile;

      // Filter out empty photo slots
      const photoUrls = formData.photos
        .filter(p => p.uri)
        .map(p => p.uri);

      console.log('submitProfile: Sending data:', {
        displayName: formData.displayName,
        age: formData.age,
        gender: formData.gender,
        location: formData.location,
      });

      const { data } = await apiClient.post('/users/profile', {
        displayName: formData.displayName,
        bio: formData.bio,
        age: formData.age,
        gender: formData.gender,
        interestedIn: formData.interestedIn,
        interests: formData.interests,
        goals: formData.goals,
        photoUrls,
        location: formData.location, // Include location!
      });

      console.log('submitProfile: Response:', data);
      return data;
    } catch (error: any) {
      console.error('submitProfile: Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Profile creation failed');
    }
  }
);

export const uploadPhoto = createAsyncThunk(
  'profile/uploadPhoto',
  async (
    { uri, position }: { uri: string; position: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setPhotoUploading({ position, isUploading: true }));

      const formData = new FormData();
      formData.append('photo', {
        uri,
        type: 'image/jpeg',
        name: `photo-${position}.jpg`,
      } as any);

      const { data } = await apiClient.post(
        `/users/profile/photos?position=${position}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            dispatch(setPhotoProgress({ position, progress }));
          },
        }
      );

      return { position, url: data.url };
    } catch (error: any) {
      return rejectWithValue({ position, error: error.message });
    }
  }
);

export const fetchCompletionStatus = createAsyncThunk(
  'profile/fetchCompletion',
  async () => {
    const { data } = await apiClient.get('/users/me/completion');
    return data;
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    formData: initialFormData,
    currentStep: 'basics' as ProfileStep,
    completionStatus: null,
    isSubmitting: false,
    error: null,
  } as ProfileState,
  reducers: {
    setStep: (state, action: PayloadAction<ProfileStep>) => {
      state.currentStep = action.payload;
    },
    updateFormData: (state, action: PayloadAction<Partial<ProfileFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    toggleInterest: (state, action: PayloadAction<string>) => {
      const interest = action.payload;
      const index = state.formData.interests.indexOf(interest);
      if (index > -1) {
        state.formData.interests.splice(index, 1);
      } else if (state.formData.interests.length < 10) {
        state.formData.interests.push(interest);
      }
    },
    toggleGoal: (state, action: PayloadAction<RelationshipGoal>) => {
      const goal = action.payload;
      const index = state.formData.goals.indexOf(goal);
      if (index > -1) {
        state.formData.goals.splice(index, 1);
      } else {
        state.formData.goals.push(goal);
      }
    },
    setPhotoUploading: (
      state,
      action: PayloadAction<{ position: number; isUploading: boolean }>
    ) => {
      state.formData.photos[action.payload.position].isUploading =
        action.payload.isUploading;
    },
    setPhotoProgress: (
      state,
      action: PayloadAction<{ position: number; progress: number }>
    ) => {
      state.formData.photos[action.payload.position].uploadProgress =
        action.payload.progress;
    },
    removePhoto: (state, action: PayloadAction<number>) => {
      state.formData.photos[action.payload] = {
        uri: null,
        isUploading: false,
        uploadProgress: 0,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetForm: () => ({
      formData: initialFormData,
      currentStep: 'basics',
      completionStatus: null,
      isSubmitting: false,
      error: null,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitProfile.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitProfile.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(submitProfile.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      .addCase(uploadPhoto.fulfilled, (state, action) => {
        const { position, url } = action.payload;
        state.formData.photos[position] = {
          uri: url,
          isUploading: false,
          uploadProgress: 100,
        };
      })
      .addCase(uploadPhoto.rejected, (state, action) => {
        const { position } = action.payload as { position: number };
        state.formData.photos[position].isUploading = false;
        state.formData.photos[position].uploadProgress = 0;
      })
      .addCase(fetchCompletionStatus.fulfilled, (state, action) => {
        state.completionStatus = action.payload;
      });
  },
});

export const {
  setStep,
  updateFormData,
  toggleInterest,
  toggleGoal,
  setPhotoUploading,
  setPhotoProgress,
  removePhoto,
  clearError,
  resetForm,
} = profileSlice.actions;

export default profileSlice.reducer;
