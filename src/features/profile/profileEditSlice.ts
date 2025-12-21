// src/features/profile/profileEditSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';
import { User } from './types';

interface ProfileEditState {
  originalData: User | null;
  editedData: Partial<User & User['profile']>;
  hasChanges: boolean;
  isSaving: boolean;
  error: string | null;
}

export const fetchProfile = createAsyncThunk('profileEdit/fetch', async () => {
  const { data } = await apiClient.get('/users/me');
  return data;
});

export const saveProfile = createAsyncThunk(
  'profileEdit/save',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { profileEdit } = getState() as { profileEdit: ProfileEditState };
      const { data } = await apiClient.patch('/users/profile', profileEdit.editedData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Save failed');
    }
  }
);

export const uploadEditedPhoto = createAsyncThunk(
  'profileEdit/uploadPhoto',
  async ({ uri, position }: { uri: string; position: number }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri,
        type: 'image/jpeg',
        name: `photo-${position}.jpg`,
      } as any);

      const { data } = await apiClient.post(
        `/users/profile/photos?position=${position}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      return { position, url: data.url };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePhoto = createAsyncThunk(
  'profileEdit/deletePhoto',
  async (position: number, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/users/profile/photos/${position}`);
      return position;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const profileEditSlice = createSlice({
  name: 'profileEdit',
  initialState: {
    originalData: null,
    editedData: {},
    hasChanges: false,
    isSaving: false,
    error: null,
  } as ProfileEditState,
  reducers: {
    updateField: (state, action: PayloadAction<{ field: string; value: any }>) => {
      const { field, value } = action.payload;
      state.editedData[field] = value;
      state.hasChanges = true;
    },
    resetChanges: (state) => {
      state.editedData = {};
      state.hasChanges = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.originalData = action.payload;
        state.editedData = {};
        state.hasChanges = false;
      })
      .addCase(saveProfile.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.isSaving = false;
        state.originalData = action.payload;
        state.editedData = {};
        state.hasChanges = false;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      .addCase(uploadEditedPhoto.fulfilled, (state, action) => {
        const { position, url } = action.payload;
        if (state.originalData?.profile?.photoUrls) {
          state.originalData.profile.photoUrls[position] = url;
        }
      })
      .addCase(deletePhoto.fulfilled, (state, action) => {
        const position = action.payload;
        if (state.originalData?.profile?.photoUrls) {
          state.originalData.profile.photoUrls.splice(position, 1);
        }
      });
  },
});

export const { updateField, resetChanges, clearError } = profileEditSlice.actions;
export default profileEditSlice.reducer;
