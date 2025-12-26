// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import mapReducer from '../features/map/mapSlice';
import chatReducer from '../features/chat/chatSlice';
import discoveryReducer from '../features/discovery/discoverySlice';
import profileReducer from '../features/profile/profileSlice';
import profileEditReducer from '../features/profile/profileEditSlice';
import verificationReducer from '../features/verification/verificationSlice';
import interactionsReducer from '../features/interactions/interactionsSlice';
import tradingReducer from '../features/trading/tradingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    map: mapReducer,
    chat: chatReducer,
    discovery: discoveryReducer,
    profile: profileReducer,
    profileEdit: profileEditReducer,
    verification: verificationReducer,
    interactions: interactionsReducer,
    trading: tradingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
