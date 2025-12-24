// src/features/gifts/GiftsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiClient } from '../../api/client';

interface Gift {
  id: string;
  name: string;
  icon: string;
  category: string;
  coinPrice: number;
  usdPrice: number;
  animationType: string;
}

interface WalletBalance {
  coinBalance: number;
  totalEarned: number;
  totalSpent: number;
}

interface CoinPackage {
  coins: number;
  price: number;
  bonusCoins: number;
}

interface GiftTransaction {
  id: string;
  quantity: number;
  coinAmount: number;
  createdAt: string;
  gift: Gift;
  sender?: { displayName: string; avatarUrl: string };
  recipient?: { displayName: string; avatarUrl: string };
}

type TabType = 'catalog' | 'received' | 'sent';

const CATEGORY_COLORS: Record<string, string> = {
  basic: '#4CAF50',
  premium: '#9C27B0',
  luxury: '#FFD700',
};

export const GiftsScreen: React.FC = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [receivedGifts, setReceivedGifts] = useState<GiftTransaction[]>([]);
  const [sentGifts, setSentGifts] = useState<GiftTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchData = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [catalogRes, walletRes, packagesRes, receivedRes, sentRes] = await Promise.all([
        apiClient.get('/gifts/catalog'),
        apiClient.get('/gifts/wallet'),
        apiClient.get('/gifts/wallet/packages'),
        apiClient.get('/gifts/received'),
        apiClient.get('/gifts/sent'),
      ]);

      setGifts(catalogRes.data);
      setWallet(walletRes.data);
      setPackages(packagesRes.data);
      setReceivedGifts(receivedRes.data);
      setSentGifts(sentRes.data);
    } catch (error) {
      console.error('Failed to fetch gifts data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const categories = ['basic', 'premium', 'luxury'];

  const filteredGifts = selectedCategory
    ? gifts.filter((g) => g.category === selectedCategory)
    : gifts;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderWalletCard = () => (
    <View style={styles.walletCard}>
      <View style={styles.walletHeader}>
        <Text style={styles.walletTitle}>Your Wallet</Text>
        <TouchableOpacity style={styles.topUpButton}>
          <Icon name="plus" size={16} color="#000" />
          <Text style={styles.topUpText}>Top Up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.walletBalance}>
        <Icon name="circle-multiple" size={32} color="#FFD700" />
        <Text style={styles.balanceAmount}>
          {wallet?.coinBalance.toLocaleString() || 0}
        </Text>
        <Text style={styles.balanceLabel}>coins</Text>
      </View>

      <View style={styles.walletStats}>
        <View style={styles.walletStatItem}>
          <Text style={styles.walletStatValue}>
            {wallet?.totalEarned.toLocaleString() || 0}
          </Text>
          <Text style={styles.walletStatLabel}>Earned</Text>
        </View>
        <View style={styles.walletStatDivider} />
        <View style={styles.walletStatItem}>
          <Text style={styles.walletStatValue}>
            {wallet?.totalSpent.toLocaleString() || 0}
          </Text>
          <Text style={styles.walletStatLabel}>Spent</Text>
        </View>
      </View>
    </View>
  );

  const renderCoinPackages = () => (
    <View style={styles.packagesSection}>
      <Text style={styles.sectionTitle}>Buy Coins</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.packagesScroll}
      >
        {packages.map((pkg, index) => (
          <TouchableOpacity key={index} style={styles.packageCard}>
            <View style={styles.packageCoins}>
              <Icon name="circle-multiple" size={20} color="#FFD700" />
              <Text style={styles.packageCoinAmount}>{pkg.coins.toLocaleString()}</Text>
            </View>
            {pkg.bonusCoins > 0 && (
              <View style={styles.bonusBadge}>
                <Text style={styles.bonusText}>+{pkg.bonusCoins} bonus</Text>
              </View>
            )}
            <Text style={styles.packagePrice}>${pkg.price.toFixed(2)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderGiftItem = ({ item }: { item: Gift }) => (
    <TouchableOpacity style={styles.giftCard}>
      <View
        style={[
          styles.giftIconContainer,
          { backgroundColor: CATEGORY_COLORS[item.category] + '20' },
        ]}
      >
        <Text style={styles.giftEmoji}>{item.icon}</Text>
      </View>
      <Text style={styles.giftName}>{item.name}</Text>
      <View style={styles.giftPrice}>
        <Icon name="circle-multiple" size={12} color="#FFD700" />
        <Text style={styles.giftPriceText}>{item.coinPrice}</Text>
      </View>
      <View
        style={[
          styles.categoryBadge,
          { backgroundColor: CATEGORY_COLORS[item.category] },
        ]}
      >
        <Text style={styles.categoryBadgeText}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTransactionItem = (
    { item }: { item: GiftTransaction },
    type: 'received' | 'sent'
  ) => {
    const user = type === 'received' ? item.sender : item.recipient;

    return (
      <View style={styles.transactionCard}>
        {user?.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.transactionAvatar} />
        ) : (
          <View style={styles.transactionAvatarPlaceholder}>
            <Text style={styles.transactionInitial}>{user?.displayName?.[0] || '?'}</Text>
          </View>
        )}

        <View style={styles.transactionContent}>
          <Text style={styles.transactionName}>
            {type === 'received' ? 'From ' : 'To '}
            {user?.displayName || 'Unknown'}
          </Text>
          <Text style={styles.transactionTime}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.transactionGift}>
          <Text style={styles.transactionEmoji}>{item.gift.icon}</Text>
          {item.quantity > 1 && (
            <Text style={styles.transactionQuantity}>x{item.quantity}</Text>
          )}
        </View>

        <View style={styles.transactionAmount}>
          <Icon
            name="circle-multiple"
            size={14}
            color={type === 'received' ? '#4CAF50' : '#FF5722'}
          />
          <Text
            style={[
              styles.transactionAmountText,
              { color: type === 'received' ? '#4CAF50' : '#FF5722' },
            ]}
          >
            {type === 'received' ? '+' : '-'}
            {item.coinAmount}
          </Text>
        </View>
      </View>
    );
  };

  const renderCatalogTab = () => (
    <>
      {renderCoinPackages()}

      <View style={styles.catalogSection}>
        <Text style={styles.sectionTitle}>Gift Catalog</Text>

        <View style={styles.categoryFilters}>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !selectedCategory && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.categoryChipText,
                !selectedCategory && styles.categoryChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
                { borderColor: CATEGORY_COLORS[cat] },
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.giftsGrid}>
          {filteredGifts.map((gift) => (
            <View key={gift.id} style={styles.giftGridItem}>
              {renderGiftItem({ item: gift })}
            </View>
          ))}
        </View>
      </View>
    </>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gifts</Text>
      </View>

      {renderWalletCard()}

      <View style={styles.tabs}>
        {(['catalog', 'received', 'sent'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Icon
              name={
                tab === 'catalog'
                  ? 'gift'
                  : tab === 'received'
                  ? 'gift-open'
                  : 'send'
              }
              size={18}
              color={activeTab === tab ? '#00d4ff' : '#666'}
            />
            <Text
              style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={
          activeTab === 'catalog'
            ? []
            : activeTab === 'received'
            ? receivedGifts
            : sentGifts
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          renderTransactionItem({ item }, activeTab as 'received' | 'sent')
        }
        ListHeaderComponent={activeTab === 'catalog' ? renderCatalogTab : null}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchData(true)}
            tintColor="#00d4ff"
          />
        }
        ListEmptyComponent={
          activeTab !== 'catalog' ? (
            <View style={styles.emptyState}>
              <Icon
                name={activeTab === 'received' ? 'gift-open-outline' : 'send'}
                size={64}
                color="#333"
              />
              <Text style={styles.emptyTitle}>
                No {activeTab === 'received' ? 'Received' : 'Sent'} Gifts
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'received'
                  ? 'Gifts you receive will appear here'
                  : 'Gifts you send will appear here'}
              </Text>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  walletCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1a1a24',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00d4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  topUpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  walletBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFD700',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#888',
  },
  walletStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#2a2a3a',
    paddingTop: 16,
  },
  walletStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  walletStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  walletStatLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  walletStatDivider: {
    width: 1,
    backgroundColor: '#2a2a3a',
  },
  packagesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  packagesScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  packageCard: {
    backgroundColor: '#1a1a24',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    minWidth: 100,
  },
  packageCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  packageCoinAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  bonusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 8,
  },
  bonusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  packagePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00d4ff',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#2a2a3a',
  },
  tabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#00d4ff',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  catalogSection: {
    flex: 1,
  },
  categoryFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  categoryChipActive: {
    backgroundColor: '#00d4ff',
    borderColor: '#00d4ff',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#000',
  },
  giftsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  giftGridItem: {
    width: '33.33%',
    padding: 4,
  },
  giftCard: {
    backgroundColor: '#1a1a24',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  giftIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  giftEmoji: {
    fontSize: 28,
  },
  giftName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  giftPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  giftPriceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
  },
  categoryBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
  },
  transactionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  transactionAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a2a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  transactionContent: {
    flex: 1,
    marginLeft: 12,
  },
  transactionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  transactionTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  transactionGift: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionEmoji: {
    fontSize: 24,
  },
  transactionQuantity: {
    fontSize: 12,
    color: '#888',
    marginLeft: 2,
  },
  transactionAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transactionAmountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#666',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
