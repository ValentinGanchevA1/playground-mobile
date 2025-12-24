// src/features/settings/HelpScreen.tsx
import React, { useState } from 'react';
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

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How do I verify my profile?',
    answer:
      'Go to Settings > Verification and choose from phone, email, photo, or ID verification. Each method adds points to your trust score.',
  },
  {
    question: 'How does the map feature work?',
    answer:
      'The map shows other users nearby. Your location is only shared while the app is open. You can disable this in Privacy settings.',
  },
  {
    question: 'What are matches and how do they work?',
    answer:
      'When you like someone and they like you back, it creates a match! You can then start chatting with each other.',
  },
  {
    question: 'How do I report a user?',
    answer:
      'Open their profile and tap the three dots in the top right corner. Select "Report" and choose the reason for your report.',
  },
  {
    question: 'How do I upgrade to Premium?',
    answer:
      'Go to Settings > Subscription to view available plans. Premium gives you unlimited likes, see who liked you, and more.',
  },
  {
    question: 'Can I hide my profile temporarily?',
    answer:
      'Yes! Go to Settings > Privacy and toggle off "Appear in Discovery" to hide your profile from other users.',
  },
];

export const HelpScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@g88app.com');
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
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            {FAQ_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.faqItem}
                onPress={() => toggleExpand(index)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Icon
                    name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="#888"
                  />
                </View>
                {expandedIndex === index ? (
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need More Help?</Text>
          <View style={styles.contactContainer}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleContactSupport}
            >
              <View style={styles.contactIcon}>
                <Icon name="email" size={24} color="#00d4ff" />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactTitle}>Email Support</Text>
                <Text style={styles.contactSubtitle}>support@g88app.com</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Icon name="chat" size={24} color="#00d4ff" />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactTitle}>Live Chat</Text>
                <Text style={styles.contactSubtitle}>Chat with our team</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Icon name="file-document" size={24} color="#00d4ff" />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactTitle}>Community Guidelines</Text>
                <Text style={styles.contactSubtitle}>Read our policies</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
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
  faqContainer: {
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3a',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#888',
    marginTop: 12,
    lineHeight: 20,
  },
  contactContainer: {
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    overflow: 'hidden',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3a',
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  contactSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  bottomSpacer: {
    height: 40,
  },
});
