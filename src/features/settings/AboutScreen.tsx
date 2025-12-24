// src/features/settings/AboutScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '1';

export const AboutScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  const legalLinks = [
    {
      title: 'Terms of Service',
      url: 'https://g88app.com/terms',
      icon: 'file-document',
    },
    {
      title: 'Privacy Policy',
      url: 'https://g88app.com/privacy',
      icon: 'shield-account',
    },
    {
      title: 'Cookie Policy',
      url: 'https://g88app.com/cookies',
      icon: 'cookie',
    },
    {
      title: 'Licenses',
      url: 'https://g88app.com/licenses',
      icon: 'license',
    },
  ];

  const socialLinks = [
    {
      title: 'Instagram',
      username: '@g88app',
      url: 'https://instagram.com/g88app',
      icon: 'instagram',
    },
    {
      title: 'Twitter',
      username: '@g88app',
      url: 'https://twitter.com/g88app',
      icon: 'twitter',
    },
    {
      title: 'Website',
      username: 'g88app.com',
      url: 'https://g88app.com',
      icon: 'web',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Info Card */}
        <View style={styles.appCard}>
          <View style={styles.appIcon}>
            <Icon name="map-marker-radius" size={48} color="#00d4ff" />
          </View>
          <Text style={styles.appName}>G88</Text>
          <Text style={styles.appTagline}>Connect with people nearby</Text>
          <Text style={styles.versionText}>
            Version {APP_VERSION} ({BUILD_NUMBER})
          </Text>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.sectionContent}>
            {legalLinks.map((link) => (
              <TouchableOpacity
                key={link.title}
                style={styles.linkItem}
                onPress={() => handleOpenLink(link.url)}
              >
                <View style={styles.linkLeft}>
                  <Icon name={link.icon} size={20} color="#00d4ff" />
                  <Text style={styles.linkTitle}>{link.title}</Text>
                </View>
                <Icon name="open-in-new" size={18} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Follow Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.sectionContent}>
            {socialLinks.map((link) => (
              <TouchableOpacity
                key={link.title}
                style={styles.linkItem}
                onPress={() => handleOpenLink(link.url)}
              >
                <View style={styles.linkLeft}>
                  <Icon name={link.icon} size={20} color="#00d4ff" />
                  <View>
                    <Text style={styles.linkTitle}>{link.title}</Text>
                    <Text style={styles.linkSubtitle}>{link.username}</Text>
                  </View>
                </View>
                <Icon name="open-in-new" size={18} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rate App */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.rateButton}>
            <Icon name="star" size={20} color="#FFD700" />
            <Text style={styles.rateText}>Rate G88 on the App Store</Text>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <View style={styles.footer}>
          <Text style={styles.copyright}>
            Made with love in Stockholm
          </Text>
          <Text style={styles.copyright}>
            2024 G88 Inc. All rights reserved.
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
  appCard: {
    alignItems: 'center',
    padding: 32,
    marginTop: 16,
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
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
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3a',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  linkSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a24',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  rateText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    padding: 32,
    paddingBottom: 48,
  },
  copyright: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
});
