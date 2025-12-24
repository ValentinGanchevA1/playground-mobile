// src/features/profile/types.ts

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non_binary',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export type RelationshipGoal = 'dating' | 'friends' | 'networking' | 'business';

export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  VIP = 'vip',
}

export enum SocialProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  LINKEDIN = 'linkedin',
  TIKTOK = 'tiktok',
}

export interface SocialLink {
  id: string;
  provider: SocialProvider;
  displayName?: string;
  profileUrl?: string;
  username?: string;
  followers?: number;
  verified?: boolean;
  isVisible: boolean;
}

export interface UserBadges {
  phone?: boolean;
  email?: boolean;
  photo?: boolean;
  id?: boolean;
  social?: boolean;
  premium?: boolean;
}

export interface UserProfile {
  bio?: string;
  age?: number;
  gender?: Gender;
  interestedIn?: Gender;
  interests?: string[];
  goals?: RelationshipGoal[];
  photoUrls?: string[];
  height?: number;
  occupation?: string;
  education?: string;
  languages?: string[];
  completedAt?: string;
}

export interface UserSettings {
  notifications?: boolean;
  locationSharing?: boolean;
  showOnline?: boolean;
  distanceUnit?: 'km' | 'miles';
  language?: string;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  displayName: string;
  avatarUrl?: string;
  lastLatitude?: number;
  lastLongitude?: number;
  lastLocationUpdate?: string;
  profile: UserProfile;
  badges: UserBadges;
  verificationScore: number;
  subscriptionTier: SubscriptionTier;
  isVisible: boolean;
  isActive: boolean;
  settings: UserSettings;
  lastSeenAt?: string;
  createdAt: string;
  socialLinks?: SocialLink[];
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface ProfileFormData {
  displayName: string;
  bio: string;
  age: number | null;
  gender: Gender | null;
  interestedIn: Gender | null;
  interests: string[];
  goals: RelationshipGoal[];
  photos: PhotoSlot[];
  location?: LocationData;
}

export interface PhotoSlot {
  uri: string | null;
  isUploading: boolean;
  uploadProgress: number;
}

export type ProfileStep = 'basics' | 'photos' | 'interests' | 'goals' | 'location';

export interface ProfileCompletion {
  percentage: number;
  completedSteps: string[];
  nextStep: string | null;
  missingFields: string[];
}

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: Gender.MALE, label: 'Male' },
  { value: Gender.FEMALE, label: 'Female' },
  { value: Gender.NON_BINARY, label: 'Non-binary' },
  { value: Gender.OTHER, label: 'Other' },
  { value: Gender.PREFER_NOT_TO_SAY, label: 'Prefer not to say' },
];

export const INTEREST_OPTIONS = [
  'Music', 'Movies', 'Gaming', 'Fitness', 'Travel', 'Food', 'Art',
  'Photography', 'Reading', 'Sports', 'Tech', 'Fashion', 'Nature',
  'Cooking', 'Dancing', 'Yoga', 'Hiking', 'Coffee', 'Wine', 'Pets',
];

export const GOAL_OPTIONS: { value: RelationshipGoal; label: string; icon: string }[] = [
  { value: 'dating', label: 'Dating', icon: '❤️' },
  { value: 'friends', label: 'New Friends', icon: '🤝' },
  { value: 'networking', label: 'Networking', icon: '💼' },
  { value: 'business', label: 'Business', icon: '📈' },
];

export const SOCIAL_PROVIDER_CONFIG: Record<SocialProvider, { label: string; icon: string; color: string }> = {
  [SocialProvider.INSTAGRAM]: { label: 'Instagram', icon: 'instagram', color: '#E4405F' },
  [SocialProvider.TIKTOK]: { label: 'TikTok', icon: 'music-note', color: '#000000' },
  [SocialProvider.TWITTER]: { label: 'X (Twitter)', icon: 'twitter', color: '#1DA1F2' },
  [SocialProvider.FACEBOOK]: { label: 'Facebook', icon: 'facebook', color: '#1877F2' },
  [SocialProvider.LINKEDIN]: { label: 'LinkedIn', icon: 'linkedin', color: '#0A66C2' },
  [SocialProvider.GOOGLE]: { label: 'Google', icon: 'google', color: '#4285F4' },
  [SocialProvider.APPLE]: { label: 'Apple', icon: 'apple', color: '#000000' },
};
