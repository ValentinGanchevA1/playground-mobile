// src/features/market/MarketScreen.tsx
import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState, AppDispatch } from '../../store';
import {
  fetchNearbyListings,
  fetchMyListings,
  fetchFavorites,
  updateFilters,
  TradeListing,
} from '../trading/tradingSlice';
import { ListingCard } from '../trading/components/ListingCard';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'view-grid' },
  { key: 'clothing', label: 'Clothing', icon: 'tshirt-crew' },
  { key: 'electronics', label: 'Electronics', icon: 'laptop' },
  { key: 'collectibles', label: 'Collectibles', icon: 'diamond-stone' },
  { key: 'books', label: 'Books', icon: 'book-open-variant' },
  { key: 'sports', label: 'Sports', icon: 'basketball' },
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'accessories', label: 'Accessories', icon: 'watch' },
  { key: 'other', label: 'Other', icon: 'dots-horizontal' },
];

type ViewMode = 'browse' | 'my-listings' | 'favorites';

export const MarketScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const { nearbyListings, myListings, favorites, filters, isLoading, hasMore } = useSelector(
    (state: RootState) => state.trading,
  );
  const { currentLocation } = useSelector((state: RootState) => state.map);
  const { receivedOffers } = useSelector((state: RootState) => state.trading);

  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [searchQuery, setSearchQuery] = useState('');
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
    dispatch(fetchMyListings());
    dispatch(fetchFavorites());
  }, [currentLocation, filters, dispatch, fetchListings]);

  const handleCategorySelect = (category: string) => {
    dispatch(
      updateFilters({
        category: category === 'all' ? undefined : category,
      }),
    );
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore && currentLocation && viewMode === 'browse') {
      fetchListings(false);
    }
  };

  const handleListingPress = (listing: TradeListing) => {
    navigation.navigate('ListingDetail', { listingId: listing.id });
  };

  const getDisplayListings = (): TradeListing[] => {
    let listings: TradeListing[] = [];
    switch (viewMode) {
      case 'browse':
        listings = nearbyListings;
        break;
      case 'my-listings':
        listings = myListings;
        break;
      case 'favorites':
        listings = favorites;
        break;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return listings.filter(
        (l) =>
          l.title.toLowerCase().includes(query) ||
          l.description?.toLowerCase().includes(query),
      );
    }

    return listings;
  };

  const pendingOffersCount = receivedOffers.filter((o) => o.status === 'pending').length;

  const renderListingCard = ({ item }: { item: TradeListing }) => (
    <ListingCard listing={item} onPress={() => handleListingPress(item)} />
  );

  const renderHeader = () => (
    <View>
      {/* View Mode Tabs */}
      <View style={styles.viewModeTabs}>
        <TouchableOpacity
          style={[styles.viewModeTab, viewMode === 'browse' && styles.viewModeTabActive]}
          onPress={() => setViewMode('browse')}
        >
          <Icon
            name="compass"
            size={18}
            color={viewMode === 'browse' ? '#000' : '#888'}
          />
          <Text style={[styles.viewModeTabText, viewMode === 'browse' && styles.viewModeTabTextActive]}>
            Browse
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeTab, viewMode === 'my-listings' && styles.viewModeTabActive]}
          onPress={() => setViewMode('my-listings')}
        >
          <Icon
            name="package-variant"
            size={18}
            color={viewMode === 'my-listings' ? '#000' : '#888'}
          />
          <Text style={[styles.viewModeTabText, viewMode === 'my-listings' && styles.viewModeTabTextActive]}>
            My Items
          </Text>
          {myListings.filter((l) => l.status === 'active').length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {myListings.filter((l) => l.status === 'active').length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeTab, viewMode === 'favorites' && styles.viewModeTabActive]}
          onPress={() => setViewMode('favorites')}
        >
          <Icon
            name="heart"
            size={18}
            color={viewMode === 'favorites' ? '#000' : '#888'}
          />
          <Text style={[styles.viewModeTabText, viewMode === 'favorites' && styles.viewModeTabTextActive]}>
            Saved
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories - only show in browse mode */}
      {viewMode === 'browse' && (
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
      )}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    const emptyMessages = {
      browse: {
        icon: 'compass-outline',
        title: 'No Listings Nearby',
        subtitle: 'Be the first to list something in your area!',
      },
      'my-listings': {
        icon: 'package-variant',
        title: 'No Listings Yet',
        subtitle: 'Create your first listing to start trading',
      },
      favorites: {
        icon: 'heart-outline',
        title: 'No Saved Items',
        subtitle: 'Heart items you like to save them here',
      },
    };

    const msg = emptyMessages[viewMode];

    return (
      <View style={styles.emptyState}>
        <Icon name={msg.icon} size={64} color="#333" />
        <Text style={styles.emptyTitle}>{msg.title}</Text>
        <Text style={styles.emptySubtitle}>{msg.subtitle}</Text>
        {viewMode !== 'favorites' && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateListing')}
          >
            <Text style={styles.createButtonText}>Create Listing</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!currentLocation && viewMode === 'browse') {
    return (
      <View style={styles.centered}>
        <Icon name="map-marker-off" size={48} color="#666" />
        <Text style={styles.locationText}>Location required</Text>
        <Text style={styles.locationSubtext}>Enable location to browse nearby items</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Market</Text>
        <TouchableOpacity
          style={styles.offersButton}
          onPress={() => navigation.navigate('Offers')}
        >
          <Icon name="hand-wave" size={22} color="#fff" />
          {pendingOffersCount > 0 && (
            <View style={styles.offersBadge}>
              <Text style={styles.offersBadgeText}>{pendingOffersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="magnify" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.sellButton}
          onPress={() => navigation.navigate('CreateListing')}
        >
          <Icon name="plus" size={20} color="#000" />
          <Text style={styles.sellButtonText}>Sell</Text>
        </TouchableOpacity>
      </View>

      {/* Listings */}
      <FlatList
        data={getDisplayListings()}
        keyExtractor={(item) => item.id}
        renderItem={renderListingCard}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && getDisplayListings().length === 0}
            onRefresh={() => fetchListings(true)}
            tintColor="#00d4ff"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isLoading && getDisplayListings().length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#00d4ff" />
            </View>
          ) : null
        }
        ListEmptyComponent={renderEmpty}
      />
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
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  offersButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offersBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offersBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#fff',
    fontSize: 15,
  },
  sellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00d4ff',
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 4,
  },
  sellButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
  viewModeTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  viewModeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a24',
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  viewModeTabActive: {
    backgroundColor: '#00d4ff',
  },
  viewModeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  viewModeTabTextActive: {
    color: '#000',
  },
  tabBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#00d4ff',
  },
  categoryChipText: {
    color: '#888',
    fontSize: 12,
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
    paddingTop: 40,
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
});

export default MarketScreen;
