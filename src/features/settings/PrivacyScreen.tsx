// src/features/settings/PrivacyScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface PrivacySetting {
  id: string;
  title: string;
  description: string;
  value: boolean;
}

export const PrivacyScreen: React.FC = () => {
  const navigation = useNavigation();

  const [settings, setSettings] = useState<PrivacySetting[]>([
    {
      id: 'showOnline',
      title: 'Show Online Status',
      description: 'Let others see when you are online',
      value: true,
    },
    {
      id: 'showDistance',
      title: 'Show Distance',
      description: 'Display your distance from other users',
      value: true,
    },
    {
      id: 'showLastActive',
      title: 'Show Last Active',
      description: 'Display when you were last active',
      value: true,
    },
    {
      id: 'readReceipts',
      title: 'Read Receipts',
      description: 'Let others know when you read their messages',
      value: true,
    },
    {
      id: 'showInSearch',
      title: 'Appear in Discovery',
      description: 'Allow others to find your profile',
      value: true,
    },
    {
      id: 'showOnMap',
      title: 'Appear on Map',
      description: 'Show your location on the map to nearby users',
      value: true,
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, value: !setting.value } : setting
      )
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
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visibility</Text>
          <View style={styles.sectionContent}>
            {settings.map((setting) => (
              <View key={setting.id} style={styles.item}>
                <View style={styles.itemText}>
                  <Text style={styles.itemTitle}>{setting.title}</Text>
                  <Text style={styles.itemDescription}>{setting.description}</Text>
                </View>
                <Switch
                  value={setting.value}
                  onValueChange={() => toggleSetting(setting.id)}
                  trackColor={{ false: '#333', true: '#00d4ff40' }}
                  thumbColor={setting.value ? '#00d4ff' : '#666'}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.item}>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>Download My Data</Text>
                <Text style={styles.itemDescription}>
                  Request a copy of all your data
                </Text>
              </View>
              <Icon name="download" size={24} color="#00d4ff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.item}>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>Clear Search History</Text>
                <Text style={styles.itemDescription}>
                  Remove all your search history
                </Text>
              </View>
              <Icon name="delete-outline" size={24} color="#888" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Icon name="shield-lock" size={32} color="#00d4ff" />
          <Text style={styles.infoTitle}>Your Privacy Matters</Text>
          <Text style={styles.infoText}>
            We take your privacy seriously. Your location is only shared when
            you have the app open, and you can control exactly what others see.
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
  itemText: {
    flex: 1,
    marginRight: 16,
  },
  itemTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  infoCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});
