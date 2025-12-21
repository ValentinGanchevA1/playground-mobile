// src/features/trending/TrendingScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const TrendingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trending</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Trending content coming soon</Text>
          <Text style={styles.emptySubtext}>
            Discover what's popular in your area
          </Text>
        </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
  },
});
