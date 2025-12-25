// src/features/map/components/FilterBar.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { toggleFilter } from '../mapSlice';
import { selectFilters, CATEGORY_COLORS } from '../mapSelectors';

interface FilterButtonProps {
  label: string;
  icon: string;
  color: string;
  isActive: boolean;
  onPress: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  label,
  icon,
  color,
  isActive,
  onPress,
}) => (
  <TouchableOpacity
    style={[
      styles.filterButton,
      isActive && { backgroundColor: color, borderColor: color },
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Icon
      name={icon}
      size={18}
      color={isActive ? '#fff' : color}
      style={styles.filterIcon}
    />
    <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const FilterBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);

  return (
    <View style={styles.container}>
      <FilterButton
        label="Dating"
        icon="heart"
        color={CATEGORY_COLORS.dating}
        isActive={filters.dating}
        onPress={() => dispatch(toggleFilter('dating'))}
      />
      <FilterButton
        label="Trading"
        icon="briefcase"
        color={CATEGORY_COLORS.trading}
        isActive={filters.trading}
        onPress={() => dispatch(toggleFilter('trading'))}
      />
      <FilterButton
        label="Events"
        icon="calendar-star"
        color={CATEGORY_COLORS.events}
        isActive={filters.events}
        onPress={() => dispatch(toggleFilter('events'))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterIcon: {
    marginRight: 6,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  filterLabelActive: {
    color: '#fff',
  },
});

export default FilterBar;
