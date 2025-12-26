import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TradeListing } from '../tradingSlice';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;

interface ListingCardProps {
  listing: TradeListing;
  onPress: () => void;
}

const CONDITION_LABELS: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  worn: 'Worn',
};

const CATEGORY_ICONS: Record<string, string> = {
  clothing: 'tshirt-crew',
  electronics: 'laptop',
  collectibles: 'diamond-stone',
  books: 'book-open-variant',
  sports: 'basketball',
  home: 'home',
  toys: 'puzzle',
  accessories: 'watch',
  other: 'dots-horizontal',
};

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onPress }) => {
  const formatDistance = (km: number | undefined): string => {
    if (km === undefined || km === null) {
      return '';
    }
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {/* Photo */}
      <View style={styles.imageContainer}>
        {listing.photos.length > 0 ? (
          <Image source={{ uri: listing.photos[0] }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon
              name={CATEGORY_ICONS[listing.category] || 'package-variant'}
              size={40}
              color="#444"
            />
          </View>
        )}

        {/* Photo count badge */}
        {listing.photos.length > 1 && (
          <View style={styles.photoCountBadge}>
            <Icon name="image-multiple" size={12} color="#fff" />
            <Text style={styles.photoCountText}>{listing.photos.length}</Text>
          </View>
        )}

        {/* Condition badge */}
        <View style={styles.conditionBadge}>
          <Text style={styles.conditionText}>
            {CONDITION_LABELS[listing.condition] || listing.condition}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.distanceContainer}>
            <Icon name="map-marker" size={12} color="#888" />
            <Text style={styles.metaText}>{formatDistance(listing.distance)}</Text>
          </View>

          {listing.offerCount > 0 && (
            <View style={styles.offersContainer}>
              <Icon name="hand-wave" size={12} color="#00d4ff" />
              <Text style={styles.offersText}>{listing.offerCount}</Text>
            </View>
          )}
        </View>

        {/* Seller info */}
        <View style={styles.sellerRow}>
          {listing.sellerAvatar ? (
            <Image source={{ uri: listing.sellerAvatar }} style={styles.sellerAvatar} />
          ) : (
            <View style={styles.sellerAvatarPlaceholder}>
              <Text style={styles.sellerInitial}>
                {listing.sellerName?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <Text style={styles.sellerName} numberOfLines={1}>
            {listing.sellerName}
          </Text>
          {listing.verificationScore >= 50 && (
            <Icon name="check-decagram" size={12} color="#00d4ff" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: '#0a0a0f',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
  },
  photoCountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  photoCountText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  conditionBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,212,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  conditionText: {
    fontSize: 10,
    color: '#000',
    fontWeight: '600',
  },
  info: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: '#888',
  },
  offersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  offersText: {
    fontSize: 11,
    color: '#00d4ff',
    fontWeight: '600',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  sellerAvatarPlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerInitial: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#888',
  },
  sellerName: {
    fontSize: 11,
    color: '#888',
    flex: 1,
  },
});

export default ListingCard;
