// src/features/settings/SettingsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppDispatch } from '../../hooks/redux';
import { logout } from '../auth/authSlice';

interface SettingItem {
  icon: string;
  title: string;
  subtitle?: string;
  type: 'navigation' | 'toggle' | 'action';
  route?: string;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
}

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [notifications, setNotifications] = React.useState(true);
  const [locationSharing, setLocationSharing] = React.useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Coming Soon', 'Account deletion will be available soon.');
          },
        },
      ]
    );
  };

  const sections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Account',
      items: [
        {
          icon: 'account-edit',
          title: 'Edit Profile',
          subtitle: 'Update your photos and bio',
          type: 'navigation',
          route: 'ProfileEdit',
        },
        {
          icon: 'shield-check',
          title: 'Verification',
          subtitle: 'Verify your identity',
          type: 'navigation',
          route: 'Verification',
        },
        {
          icon: 'crown',
          title: 'Subscription',
          subtitle: 'Manage your plan',
          type: 'navigation',
          route: 'Subscription',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'bell',
          title: 'Push Notifications',
          subtitle: 'Receive alerts for matches and messages',
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: 'map-marker',
          title: 'Location Sharing',
          subtitle: 'Share your location on the map',
          type: 'toggle',
          value: locationSharing,
          onToggle: setLocationSharing,
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: 'lock',
          title: 'Privacy',
          subtitle: 'Control who can see your profile',
          type: 'navigation',
          route: 'Privacy',
        },
        {
          icon: 'block-helper',
          title: 'Blocked Users',
          subtitle: 'Manage blocked accounts',
          type: 'navigation',
          route: 'BlockedUsers',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle',
          title: 'Help Center',
          subtitle: 'Get help and support',
          type: 'navigation',
          route: 'Help',
        },
        {
          icon: 'information',
          title: 'About',
          subtitle: 'App version and legal info',
          type: 'navigation',
          route: 'About',
        },
      ],
    },
    {
      title: 'Account Actions',
      items: [
        {
          icon: 'logout',
          title: 'Logout',
          type: 'action',
          onPress: handleLogout,
        },
        {
          icon: 'delete',
          title: 'Delete Account',
          type: 'action',
          onPress: handleDeleteAccount,
          danger: true,
        },
      ],
    },
  ];

  const renderItem = (item: SettingItem) => {
    const handlePress = () => {
      if (item.type === 'navigation' && item.route) {
        navigation.navigate(item.route as never);
      } else if (item.type === 'action' && item.onPress) {
        item.onPress();
      }
    };

    return (
      <TouchableOpacity
        key={item.title}
        style={styles.item}
        onPress={handlePress}
        disabled={item.type === 'toggle'}
      >
        <View style={styles.itemLeft}>
          <View style={[styles.iconContainer, item.danger && styles.iconDanger]}>
            <Icon
              name={item.icon}
              size={22}
              color={item.danger ? '#ff4444' : '#00d4ff'}
            />
          </View>
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, item.danger && styles.textDanger]}>
              {item.title}
            </Text>
            {item.subtitle ? (
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            ) : null}
          </View>
        </View>
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#333', true: '#00d4ff40' }}
            thumbColor={item.value ? '#00d4ff' : '#666'}
          />
        ) : item.type === 'navigation' ? (
          <Icon name="chevron-right" size={24} color="#666" />
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderItem)}
            </View>
          </View>
        ))}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#0a0a0f',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a24',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingLeft: 4,
  },
  sectionContent: {
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3a',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconDanger: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  textDanger: {
    color: '#ff4444',
  },
  bottomSpacer: {
    height: 40,
  },
});
