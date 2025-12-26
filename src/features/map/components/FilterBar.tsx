// src/features/map/components/FilterBar.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { toggleFilter } from '../mapSlice';
import { selectFilters, CATEGORY_COLORS } from '../mapSelectors';

interface FilterChipProps {
  label: string;
  icon: string;
  color: string;
  isActive: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  icon,
  color,
  isActive,
  onPress,
}) => (
  <TouchableOpacity
    style={[
      styles.filterChip,
      isActive && { backgroundColor: color, borderColor: color },
    ]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Icon
      name={icon}
      size={16}
      color={isActive ? '#fff' : color}
    />
    <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const FilterBar: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);

  // Mock notification count - replace with actual state
  const notificationCount = 0;

  return (
    <View style={styles.container}>
      {/* Left: Show Label */}
      <View style={styles.showLabel}>
        <Text style={styles.showText}>Show:</Text>
      </View>

      {/* Center: Filter Chips */}
      <View style={styles.filtersRow}>
        <FilterChip
          label="People"
          icon="account-group"
          color={CATEGORY_COLORS.dating}
          isActive={filters.dating}
          onPress={() => dispatch(toggleFilter('dating'))}
        />
        <FilterChip
          label="Events"
          icon="calendar-star"
          color={CATEGORY_COLORS.events}
          isActive={filters.events}
          onPress={() => dispatch(toggleFilter('events'))}
        />
        <FilterChip
          label="Trades"
          icon="swap-horizontal"
          color={CATEGORY_COLORS.trading}
          isActive={filters.trading}
          onPress={() => dispatch(toggleFilter('trading'))}
        />
      </View>

      {/* Right: Notification Bell */}
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => navigation.navigate('Notifications' as never)}
        activeOpacity={0.8}
      >
        <Icon name="bell-outline" size={22} color="#fff" />
        {notificationCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {notificationCount > 9 ? '9+' : notificationCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 10,
  },
  showLabel: {
    marginRight: 8,
  },
  showText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  filtersRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(10, 10, 15, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 5,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  filterLabelActive: {
    color: '#fff',
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(10, 10, 15, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ff4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
});

export default FilterBar;
