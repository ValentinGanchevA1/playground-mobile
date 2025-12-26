// src/components/ActionHub.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch, useAppSelector } from '../hooks/redux';

const { width, height } = Dimensions.get('window');

interface ActionItem {
  icon: string;
  label: string;
  description: string;
  color: string;
  route?: string;
  onPress?: () => void;
}

export const ActionHub: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [visible, setVisible] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  const isVisible = user?.isVisible ?? true;

  const openModal = () => {
    setVisible(true);
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
  };

  const closeModal = () => {
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
    ]).start(() => setVisible(false));
  };

  const handleAction = (item: ActionItem) => {
    closeModal();
    setTimeout(() => {
      if (item.route) {
        navigation.navigate(item.route as never);
      } else if (item.onPress) {
        item.onPress();
      }
    }, 200);
  };

  const toggleVisibility = () => {
    // TODO: Dispatch action to toggle visibility
    closeModal();
  };

  const actions: ActionItem[] = [
    {
      icon: 'calendar-plus',
      label: 'Create Event',
      description: 'Host a local meetup or activity',
      color: '#FF6B6B',
      route: 'CreateEvent',
    },
    {
      icon: 'tag-plus',
      label: 'List Item',
      description: 'Post something for trade',
      color: '#4ECDC4',
      route: 'CreateListing',
    },
    {
      icon: 'video-wireless',
      label: 'Go Live',
      description: 'Start a live broadcast',
      color: '#9B59B6',
      onPress: () => {
        // TODO: Implement live streaming
      },
    },
    {
      icon: isVisible ? 'eye-off' : 'eye',
      label: isVisible ? 'Go Invisible' : 'Go Visible',
      description: isVisible ? 'Hide from map & discovery' : 'Appear on map & discovery',
      color: isVisible ? '#95A5A6' : '#2ECC71',
      onPress: toggleVisibility,
    },
  ];

  return (
    <>
      {/* FAB Button - This is rendered by the tab navigator */}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={['rgba(0,0,0,0.95)', 'rgba(10,10,15,0.98)']}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </TouchableWithoutFeedback>

        <View style={styles.modalContent}>
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                })}],
              },
            ]}
          >
            <Text style={styles.title}>Quick Actions</Text>
            <Text style={styles.subtitle}>What would you like to do?</Text>
          </Animated.View>

          {/* Action Grid */}
          <View style={styles.actionsGrid}>
            {actions.map((action, index) => (
              <Animated.View
                key={action.label}
                style={{
                  transform: [
                    {
                      scale: scaleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ],
                  opacity: fadeAnim,
                }}
              >
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => handleAction(action)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIconContainer, { backgroundColor: action.color }]}>
                    <Icon name={action.icon} size={32} color="#fff" />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Close Button */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Icon name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

// Standalone FAB component for use in tab bar
export const ActionFAB: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.9}>
    <LinearGradient
      colors={['#00d4ff', '#0099cc']}
      style={styles.fabGradient}
    >
      <Icon name="plus" size={32} color="#fff" />
    </LinearGradient>
  </TouchableOpacity>
);

// Context for sharing FAB state
import { createContext, useContext } from 'react';

interface ActionHubContextType {
  openActionHub: () => void;
}

export const ActionHubContext = createContext<ActionHubContextType>({
  openActionHub: () => {},
});

export const useActionHub = () => useContext(ActionHubContext);

// Provider component
export const ActionHubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hubRef, setHubRef] = useState<{ open: () => void } | null>(null);

  return (
    <ActionHubContext.Provider value={{ openActionHub: () => hubRef?.open() }}>
      {children}
    </ActionHubContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    maxWidth: 360,
  },
  actionCard: {
    width: 160,
    backgroundColor: '#1a1a24',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
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
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ActionHub;
