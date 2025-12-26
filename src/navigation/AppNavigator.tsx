// src/navigation/AppNavigator.tsx
import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAppSelector } from '../hooks/redux';

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  ProfileCreation: undefined;
  Main: undefined;
  Chat: { recipientId: string; recipientName?: string };
  UserProfile: { userId: string };
  ProfileEdit: undefined;
  Verification: undefined;
  PhoneVerification: undefined;
  PhotoVerification: undefined;
  IdVerification: undefined;
  SocialLinking: undefined;
  Settings: undefined;
  Privacy: undefined;
  Help: undefined;
  About: undefined;
  Achievements: undefined;
  Leaderboard: undefined;
  Gifts: undefined;
  CreateEvent: undefined;
  EventDetail: { eventId: string };
  LikesReceived: undefined;
  Matches: undefined;
  Premium: undefined;
  Notifications: undefined;
  // Trading
  ListingDetail: { listingId: string };
  CreateListing: undefined;
  MyListings: undefined;
  Offers: undefined;
  TradeOfferDetail: { offerId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// Auth
import { AuthScreen } from '../features/auth/AuthScreen';

// Main Tabs - New Structure
import { MapScreen } from '../features/map/MapScreen';
import { DiscoveryScreen } from '../features/discovery/DiscoveryScreen';
import { MarketScreen } from '../features/market/MarketScreen';
import { InboxScreen } from '../features/inbox/InboxScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';

// Events
import { CreateEventScreen } from '../features/events/CreateEventScreen';
import { EventDetailScreen } from '../features/events/EventDetailScreen';

// Stack Screens
import { ChatScreen } from '../features/chat/ChatScreen';
import { UserProfileScreen } from '../features/discovery/UserProfileScreen';
import { ProfileCreationScreen } from '../features/profile/ProfileCreationScreen';
import { ProfileEditScreen } from '../features/profile/ProfileEditScreen';
import { VerificationScreen } from '../features/verification/VerificationScreen';
import { PhoneVerificationScreen } from '../features/verification/PhoneVerificationScreen';
import { PhotoVerificationScreen } from '../features/verification/PhotoVerificationScreen';
import { IdVerificationScreen } from '../features/verification/IdVerificationScreen';
import { SocialLinkingScreen } from '../features/verification/SocialLinkingScreen';
import {
  SettingsScreen,
  PrivacyScreen,
  HelpScreen,
  AboutScreen,
} from '../features/settings';

// Gamification & Gifts
import { AchievementsScreen } from '../features/gamification/AchievementsScreen';
import { LeaderboardScreen } from '../features/gamification/LeaderboardScreen';
import { GiftsScreen } from '../features/gifts/GiftsScreen';

// Trading
import { ListingDetailScreen } from '../features/trading/ListingDetailScreen';
import { CreateListingScreen } from '../features/trading/CreateListingScreen';
import { MyListingsScreen } from '../features/trading/MyListingsScreen';
import { OffersScreen } from '../features/trading/OffersScreen';
import { TradeOfferDetailScreen } from '../features/trading/TradeOfferDetailScreen';

// Notifications
import { NotificationsScreen } from '../features/notifications/NotificationsScreen';

// Error Boundaries
import { withScreenErrorBoundary } from '../components/ScreenErrorBoundary';

// Wrap critical screens with error boundaries
const SafeListingDetailScreen = withScreenErrorBoundary(ListingDetailScreen, 'Listing Details');
const SafeCreateListingScreen = withScreenErrorBoundary(CreateListingScreen, 'Create Listing');
const SafeOffersScreen = withScreenErrorBoundary(OffersScreen, 'Offers');
const SafeMarketScreen = withScreenErrorBoundary(MarketScreen, 'Market');
const SafeTradeOfferDetailScreen = withScreenErrorBoundary(TradeOfferDetailScreen, 'Trade Offer Detail');

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Empty component for FAB placeholder
const EmptyComponent = () => null;

// Custom Tab Bar with center FAB
const CustomTabBar = ({ state, navigation, onFabPress }: any) => {
  return (
    <View style={tabBarStyles.container}>
      <View style={tabBarStyles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          // Handle center FAB
          if (route.name === 'ActionHub') {
            return (
              <TouchableOpacity
                key={route.key}
                style={tabBarStyles.fabContainer}
                onPress={onFabPress}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#00d4ff', '#0099cc']}
                  style={tabBarStyles.fab}
                >
                  <Icon name="plus" size={28} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            );
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = getTabIcon(route.name);

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={tabBarStyles.tab}
            >
              <Icon
                name={iconName}
                size={24}
                color={isFocused ? '#00d4ff' : '#666'}
              />
              <View style={tabBarStyles.labelContainer}>
                <View style={[tabBarStyles.labelDot, isFocused && tabBarStyles.labelDotActive]} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const getTabIcon = (name: string): string => {
  switch (name) {
    case 'Map': return 'map-marker-radius';
    case 'Discover': return 'cards';
    case 'Market': return 'store';
    case 'Inbox': return 'message-text';
    case 'Profile': return 'account';
    default: return 'circle';
  }
};

const MainTabs = () => {
  const [showActionHub, setShowActionHub] = useState(false);

  const renderTabBar = useCallback(
    (props: any) => (
      <CustomTabBar {...props} onFabPress={() => setShowActionHub(true)} />
    ),
    []
  );

  return (
    <>
      <Tab.Navigator
        initialRouteName="Map"
        tabBar={renderTabBar}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Discover" component={DiscoveryScreen} />
        <Tab.Screen name="ActionHub" component={EmptyComponent} />
        <Tab.Screen name="Market" component={SafeMarketScreen} />
        <Tab.Screen name="Inbox" component={InboxScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      {/* Action Hub Modal */}
      <ActionHubModal
        visible={showActionHub}
        onClose={() => setShowActionHub(false)}
      />
    </>
  );
};

// ActionHub Modal Component
import { Modal, Animated, TouchableWithoutFeedback, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const ActionHubModal: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible,
  onClose,
}) => {
  const navigation = useNavigation();
  const { user } = useAppSelector((state) => state.auth);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible, scaleAnim, fadeAnim]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(onClose);
  }, [scaleAnim, fadeAnim, onClose]);

  const handleAction = useCallback((route: string) => {
    handleClose();
    setTimeout(() => {
      navigation.navigate(route as never);
    }, 200);
  }, [handleClose, navigation]);

  const actions = [
    {
      icon: 'calendar-plus',
      label: 'Create Event',
      description: 'Host a local meetup',
      color: '#FF6B6B',
      route: 'CreateEvent',
    },
    {
      icon: 'tag-plus',
      label: 'List Item',
      description: 'Post for trade',
      color: '#4ECDC4',
      route: 'CreateListing',
    },
    {
      icon: 'video-wireless',
      label: 'Go Live',
      description: 'Start broadcast',
      color: '#9B59B6',
      route: null,
    },
    {
      icon: user?.isVisible !== false ? 'eye-off' : 'eye',
      label: user?.isVisible !== false ? 'Go Invisible' : 'Go Visible',
      description: user?.isVisible !== false ? 'Hide from map' : 'Show on map',
      color: user?.isVisible !== false ? '#95A5A6' : '#2ECC71',
      route: null,
    },
  ];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[modalStyles.overlay, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['rgba(0,0,0,0.95)', 'rgba(10,10,15,0.98)']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </TouchableWithoutFeedback>

      <View style={modalStyles.content}>
        <Animated.View
          style={[
            modalStyles.header,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              }],
            },
          ]}
        >
          <Text style={modalStyles.title}>Quick Actions</Text>
          <Text style={modalStyles.subtitle}>What would you like to do?</Text>
        </Animated.View>

        <View style={modalStyles.grid}>
          {actions.map((action) => (
            <Animated.View
              key={action.label}
              style={{
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              }}
            >
              <TouchableOpacity
                style={modalStyles.card}
                onPress={() => action.route ? handleAction(action.route) : handleClose()}
                activeOpacity={0.8}
              >
                <View style={[modalStyles.iconContainer, { backgroundColor: action.color }]}>
                  <Icon name={action.icon} size={28} color="#fff" />
                </View>
                <Text style={modalStyles.cardLabel}>{action.label}</Text>
                <Text style={modalStyles.cardDesc}>{action.description}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity style={modalStyles.closeButton} onPress={handleClose}>
            <Icon name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

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
              name="PhoneVerification"
              component={PhoneVerificationScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="PhotoVerification"
              component={PhotoVerificationScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="IdVerification"
              component={IdVerificationScreen}
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
            <Stack.Screen
              name="Achievements"
              component={AchievementsScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Leaderboard"
              component={LeaderboardScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Gifts"
              component={GiftsScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="CreateEvent"
              component={CreateEventScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="EventDetail"
              component={EventDetailScreen}
              options={{ presentation: 'card' }}
            />
            {/* Trading Screens - wrapped with error boundaries */}
            <Stack.Screen
              name="ListingDetail"
              component={SafeListingDetailScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="CreateListing"
              component={SafeCreateListingScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="MyListings"
              component={MyListingsScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Offers"
              component={SafeOffersScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="TradeOfferDetail"
              component={SafeTradeOfferDetailScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ presentation: 'card' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const tabBarStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0f',
    borderTopWidth: 1,
    borderTopColor: '#1a1a24',
    height: 80,
    paddingBottom: 20,
    paddingTop: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    marginTop: 4,
  },
  labelDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  labelDotActive: {
    backgroundColor: '#00d4ff',
  },
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    maxWidth: 360,
  },
  card: {
    width: 150,
    backgroundColor: '#1a1a24',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
