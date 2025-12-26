// src/features/verification/SocialLinkingScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchSocialLinks,
  linkSocialAccount,
  unlinkSocialAccount,
  SocialLink,
} from './verificationSlice';

interface SocialProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  available: boolean;
}

const PROVIDERS: SocialProvider[] = [
  { id: 'google', name: 'Google', icon: '🔍', color: '#4285F4', available: true },
  { id: 'apple', name: 'Apple', icon: '🍎', color: '#000', available: Platform.OS === 'ios' },
  { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2', available: true },
  { id: 'twitter', name: 'X (Twitter)', icon: '𝕏', color: '#000', available: true },
  { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F', available: true },
];

export const SocialLinkingScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { socialLinks } = useAppSelector(
    (state) => state.verification
  );
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      // @ts-ignore - webClientId from environment
      webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID',
      offlineAccess: true,
    });

    dispatch(fetchSocialLinks());
  }, [dispatch]);

  const getLinkedAccount = (providerId: string) => {
    return socialLinks.find((link) => link.provider === providerId);
  };

  const handleLink = async (provider: SocialProvider) => {
    setLinkingProvider(provider.id);

    try {
      let token: string | null = null;

      switch (provider.id) {
        case 'google':
          token = await handleGoogleSignIn();
          break;
        case 'apple':
          token = await handleAppleSignIn();
          break;
        case 'facebook':
          token = await handleFacebookSignIn();
          break;
        case 'twitter':
          token = await handleTwitterSignIn();
          break;
        case 'instagram':
          token = await handleInstagramSignIn();
          break;
      }

      if (token) {
        await dispatch(linkSocialAccount({ provider: provider.id, token })).unwrap();
        Alert.alert('Success', `${provider.name} account linked!`);
      }
    } catch (err: any) {
      if (!err.message?.includes('cancelled')) {
        Alert.alert('Error', err.message || 'Failed to link account');
      }
    } finally {
      setLinkingProvider(null);
    }
  };

  const handleGoogleSignIn = async (): Promise<string> => {
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();
    return tokens.idToken;
  };

  const handleAppleSignIn = async (): Promise<string> => {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user
    );

    if (credentialState !== appleAuth.State.AUTHORIZED) {
      throw new Error('Apple Sign-In failed');
    }

    return appleAuthRequestResponse.identityToken!;
  };

  const handleFacebookSignIn = async (): Promise<string> => {
    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
    ]);

    if (result.isCancelled) {
      throw new Error('User cancelled');
    }

    const data = await AccessToken.getCurrentAccessToken();
    if (!data?.accessToken) {
      throw new Error('Failed to get access token');
    }

    return data.accessToken;
  };

  const handleTwitterSignIn = async (): Promise<string> => {
    // Implement Twitter OAuth flow
    // This typically requires a WebView or deep linking
    Alert.alert('Coming Soon', 'Twitter linking will be available soon');
    throw new Error('Not implemented');
  };

  const handleInstagramSignIn = async (): Promise<string> => {
    // Instagram requires OAuth via WebView
    Alert.alert('Coming Soon', 'Instagram linking will be available soon');
    throw new Error('Not implemented');
  };

  const handleUnlink = (link: SocialLink) => {
    Alert.alert(
      'Unlink Account',
      `Remove ${link.displayName || link.provider} from your profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: () => dispatch(unlinkSocialAccount(link.id)),
        },
      ]
    );
  };

  const renderProvider = (provider: SocialProvider) => {
    const linked = getLinkedAccount(provider.id);
    const isLinking = linkingProvider === provider.id;

    if (!provider.available) return null;

    return (
      <TouchableOpacity
        key={provider.id}
        style={[
          styles.providerCard,
          linked && styles.providerCardLinked,
        ]}
        onPress={() => (linked ? handleUnlink(linked) : handleLink(provider))}
        disabled={isLinking || (!!linkingProvider && linkingProvider !== provider.id)}
      >
        <View style={[styles.providerIcon, { backgroundColor: provider.color }]}>
          <Text style={styles.providerIconText}>{provider.icon}</Text>
        </View>

        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{provider.name}</Text>
          {linked ? (
            <Text style={styles.linkedText}>
              {linked.metadata?.username
                ? `@${linked.metadata.username}`
                : linked.displayName || 'Connected'}
            </Text>
          ) : (
            <Text style={styles.notLinkedText}>Not connected</Text>
          )}
        </View>

        {isLinking ? (
          <ActivityIndicator color="#00d4ff" />
        ) : linked ? (
          <View style={styles.linkedBadge}>
            <Text style={styles.linkedBadgeText}>✓</Text>
          </View>
        ) : (
          <Text style={styles.linkText}>Link</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔗</Text>
        </View>
        <Text style={styles.title}>Connect Social Accounts</Text>
        <Text style={styles.subtitle}>
          Link your social profiles to increase trust and show others who you are
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Platforms</Text>
        {PROVIDERS.map(renderProvider)}
      </View>

      {/* Linked Accounts Preview */}
      {socialLinks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linked Accounts</Text>
          <View style={styles.linkedPreview}>
            {socialLinks.map((link) => (
              <View key={link.id} style={styles.linkedChip}>
                {link.avatarUrl ? (
                  <Image source={{ uri: link.avatarUrl }} style={styles.linkedAvatar} />
                ) : (
                  <View style={styles.linkedAvatarPlaceholder}>
                    <Text style={styles.linkedAvatarText}>
                      {link.displayName?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
                <View style={styles.linkedChipInfo}>
                  <Text style={styles.linkedChipName}>{link.displayName}</Text>
                  {link.metadata?.verified && (
                    <Text style={styles.verifiedBadge}>✓</Text>
                  )}
                </View>
                {link.metadata?.followers && (
                  <Text style={styles.followersText}>
                    {formatFollowers(link.metadata.followers)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Benefits */}
      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>Why Link Social Accounts?</Text>
        <View style={styles.benefit}>
          <Text style={styles.benefitIcon}>🛡️</Text>
          <Text style={styles.benefitText}>Earn +10 trust points per account</Text>
        </View>
        <View style={styles.benefit}>
          <Text style={styles.benefitIcon}>👤</Text>
          <Text style={styles.benefitText}>Show verified social presence</Text>
        </View>
        <View style={styles.benefit}>
          <Text style={styles.benefitIcon}>🔍</Text>
          <Text style={styles.benefitText}>Help others verify you're real</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const formatFollowers = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  providerCardLinked: {
    borderColor: '#00d4ff',
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  providerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerIconText: {
    fontSize: 20,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkedText: {
    color: '#00d4ff',
    fontSize: 12,
    marginTop: 2,
  },
  notLinkedText: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  linkText: {
    color: '#00d4ff',
    fontSize: 14,
    fontWeight: '600',
  },
  linkedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkedBadgeText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 12,
  },
  linkedPreview: {
    gap: 8,
  },
  linkedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    padding: 12,
    borderRadius: 12,
  },
  linkedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  linkedAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkedAvatarText: {
    color: '#fff',
    fontWeight: '600',
  },
  linkedChipInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkedChipName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  verifiedBadge: {
    color: '#00d4ff',
    marginLeft: 4,
    fontSize: 12,
  },
  followersText: {
    color: '#888',
    fontSize: 12,
  },
  benefitsSection: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1a1a24',
    borderRadius: 16,
  },
  benefitsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  benefitText: {
    color: '#aaa',
    fontSize: 14,
  },
});
