// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector } from '../hooks/redux';

// Auth
import { AuthScreen } from '../features/auth/AuthScreen';

// Main Tabs
import { MapScreen } from '../features/map/MapScreen';
import { DiscoveryScreen } from '../features/discovery/DiscoveryScreen';
import { ChatListScreen } from '../features/chat/ChatListScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';

// Stack Screens
import { ChatScreen } from '../features/chat/ChatScreen';
import { UserProfileScreen } from '../features/discovery/UserProfileScreen';
import { ProfileCreationScreen } from '../features/profile/ProfileCreationScreen';
import { ProfileEditScreen } from '../features/profile/ProfileEditScreen';
import { VerificationScreen } from '../features/verification/VerificationScreen';
import { SocialLinkingScreen } from '../features/verification/SocialLinkingScreen';
import {
  SettingsScreen,
  PrivacyScreen,
  HelpScreen,
  AboutScreen,
} from '../features/settings';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: {
        backgroundColor: '#0a0a0f',
        borderTopColor: '#1a1a24',
        height: 85,
        paddingBottom: 25,
        paddingTop: 10,
      },
      tabBarActiveTintColor: '#00d4ff',
      tabBarInactiveTintColor: '#666',
      headerShown: false,
      tabBarShowLabel: true,
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '500',
      },
    }}
  >
    <Tab.Screen
      name="Discover"
      component={DiscoveryScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="cards" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Map"
      component={MapScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="map-marker-radius" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Chats"
      component={ChatListScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="chat" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="account" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const needsProfileSetup = isAuthenticated && !user?.profile?.completedAt;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : needsProfileSetup ? (
          <Stack.Screen name="ProfileCreation" component={ProfileCreationScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfileScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="ProfileEdit"
              component={ProfileEditScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Verification"
              component={VerificationScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="SocialLinking"
              component={SocialLinkingScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Privacy"
              component={PrivacyScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Help"
              component={HelpScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="About"
              component={AboutScreen}
              options={{ presentation: 'card' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
