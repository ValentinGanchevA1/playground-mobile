// src/features/trading/MyListingsScreen.tsx
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState, AppDispatch } from '../../store';
import {
  fetchMyListings,
  deleteListing,
  completeTrade,
  TradeListing,
} from './tradingSlice';

const STATUS_COLORS: Record<string, string> = {
  active: '#4CAF50',
  pending: '#FFC107',
  completed: '#2196F3',
  cancelled: '#666',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  pending: 'Pending Trade',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const MyListingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const { myListings, isLoading } = useSelector((state: RootState) => state.trading);

  const loadListings = useCallback(() => {
    dispatch(fetchMyListings());
  }, [dispatch]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const handleDelete = (listing: TradeListing) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${listing.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteListing(listing.id)).unwrap();
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Failed to delete';
              Alert.alert('Error', message);
            }
          },
        },
      ],
    );
  };

  const handleComplete = (listing: TradeListing) => {
    Alert.alert(
      'Complete Trade',
      'Mark this trade as completed? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await dispatch(completeTrade(listing.id)).unwrap();
              Alert.alert('Success', 'Trade marked as completed!');
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Failed to complete';
              Alert.alert('Error', message);
            }
          },
        },
      ],
    );
  };

  const renderListing = ({ item }: { item: TradeListing }) => (
    <TouchableOpacity
      style={styles.listingCard}
      onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
      activeOpacity={0.8}
    >
      {item.photos && item.photos.length > 0 ? (
        <Image source={{ uri: item.photos[0] }} style={styles.listingImage} />
      ) : (
        <View style={[styles.listingImage, styles.noImage]}>
          <Icon name="image-off" size={32} color="#333" />
        </View>
      )}

      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || '#666' }]}>
            <Text style={styles.statusText}>
              {STATUS_LABELS[item.status] || item.status}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Actions based on status */}
        <View style={styles.actionsRow}>
          {item.status === 'active' && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete(item)}
              >
                <Icon name="delete-outline" size={18} color="#ff4444" />
              </TouchableOpacity>
            </>
          )}
          {item.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleComplete(item)}
            >
              <Icon name="check" size={16} color="#000" />
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {item.offerCount !== undefined && item.offerCount > 0 && (
        <View style={styles.offerBadge}>
          <Text style={styles.offerBadgeText}>{item.offerCount}</Text>
          <Icon name="hand-wave" size={12} color="#000" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyState}>
        <Icon name="package-variant" size={64} color="#333" />
        <Text style={styles.emptyTitle}>No Listings Yet</Text>
        <Text style={styles.emptySubtitle}>
          Create your first listing to start trading!
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateListing')}
        >
          <Text style={styles.createButtonText}>Create Listing</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Listings</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateListing')}
        >
          <Icon name="plus" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {myListings.filter((l) => l.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {myListings.filter((l) => l.status === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {myListings.filter((l) => l.status === 'completed').length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Listings */}
      <FlatList
        data={myListings}
        keyExtractor={(item) => item.id}
        renderItem={renderListing}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadListings}
            tintColor="#00d4ff"
          />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#00d4ff" />
            </View>
          ) : null
        }
      />
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
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a24',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  listingCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  listingImage: {
    width: 100,
    height: 100,
  },
  noImage: {
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  listingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,68,68,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButton: {
    flexDirection: 'row',
    width: 'auto',
    paddingHorizontal: 12,
    backgroundColor: '#00d4ff',
    gap: 4,
  },
  completeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  offerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  offerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  createButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default MyListingsScreen;
