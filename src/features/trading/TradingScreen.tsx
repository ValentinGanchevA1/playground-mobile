// src/features/trading/TradingScreen.tsx
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState, AppDispatch } from '../../store';
import {
  fetchNearbyListings,
  updateFilters,
  TradeListing,
} from './tradingSlice';
import { ListingCard } from './components/ListingCard';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'view-grid' },
  { key: 'clothing', label: 'Clothing', icon: 'tshirt-crew' },
  { key: 'electronics', label: 'Electronics', icon: 'laptop' },
  { key: 'collectibles', label: 'Collectibles', icon: 'diamond-stone' },
  { key: 'books', label: 'Books', icon: 'book-open-variant' },
  { key: 'sports', label: 'Sports', icon: 'basketball' },
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'toys', label: 'Toys', icon: 'puzzle' },
  { key: 'accessories', label: 'Accessories', icon: 'watch' },
  { key: 'other', label: 'Other', icon: 'dots-horizontal' },
];

export const TradingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const { nearbyListings, filters, isLoading, hasMore, error } = useSelector(
    (state: RootState) => state.trading,
  );
  const { currentLocation } = useSelector((state: RootState) => state.map);

  const selectedCategory = filters.category || 'all';

  const fetchListings = useCallback(
    (refresh = false) => {
      if (!currentLocation) return;

      dispatch(
        fetchNearbyListings({
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          refresh,
        }),
      );
    },
    [currentLocation, dispatch],
  );

  useEffect(() => {
    if (currentLocation) {
      fetchListings(true);
    }
  }, [currentLocation, filters, fetchListings]);

  const handleCategorySelect = (category: string) => {
    dispatch(
      updateFilters({
        category: category === 'all' ? undefined : category,
      }),
    );
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore && currentLocation) {
      fetchListings(false);
    }
  };

  const handleListingPress = (listing: TradeListing) => {
    navigation.navigate('ListingDetail', { listingId: listing.id });
  };

  const renderListingCard = ({ item }: { item: TradeListing }) => (
    <ListingCard listing={item} onPress={() => handleListingPress(item)} />
  );

  const renderHeader = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesContainer}
    >
      {CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.key}
          style={[
            styles.categoryChip,
            selectedCategory === category.key && styles.categoryChipActive,
          ]}
          onPress={() => handleCategorySelect(category.key)}
        >
          <Icon
            name={category.icon}
            size={16}
            color={selectedCategory === category.key ? '#000' : '#888'}
          />
          <Text
            style={[
              styles.categoryChipText,
              selectedCategory === category.key && styles.categoryChipTextActive,
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#00d4ff" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyState}>
        <Icon name="package-variant" size={64} color="#333" />
        <Text style={styles.emptyTitle}>No Listings Found</Text>
        <Text style={styles.emptySubtitle}>
          {selectedCategory !== 'all'
            ? `No ${selectedCategory} items nearby`
            : 'Be the first to list something!'}
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

  if (!currentLocation) {
    return (
      <View style={styles.centered}>
        <Icon name="map-marker-off" size={48} color="#666" />
        <Text style={styles.locationText}>Location required</Text>
        <Text style={styles.locationSubtext}>
          Enable location to see nearby listings
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Trade</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('MyListings')}
          >
            <Icon name="package-variant-closed" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Offers')}
          >
            <Icon name="hand-wave" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Error banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Icon name="alert-circle" size={16} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Category filters */}
      {renderHeader()}

      {/* Listings grid */}
      <FlatList
        data={nearbyListings}
        keyExtractor={(item) => item.id}
        renderItem={renderListingCard}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && nearbyListings.length === 0}
            onRefresh={() => fetchListings(true)}
            tintColor="#00d4ff"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateListing')}
        activeOpacity={0.8}
      >
        <Icon name="plus" size={28} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
    paddingHorizontal: 32,
  },
  locationText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  locationSubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,68,68,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 13,
    flex: 1,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#00d4ff',
  },
  categoryChipText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default TradingScreen;
