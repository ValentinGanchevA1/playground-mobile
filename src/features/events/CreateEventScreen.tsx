// src/features/events/CreateEventScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { apiClient } from '../../api/client';

const CATEGORIES = [
  { value: 'social', label: 'Social', icon: 'account-group' },
  { value: 'music', label: 'Music', icon: 'music' },
  { value: 'sports', label: 'Sports', icon: 'basketball' },
  { value: 'food', label: 'Food', icon: 'food' },
  { value: 'fitness', label: 'Fitness', icon: 'dumbbell' },
  { value: 'networking', label: 'Networking', icon: 'handshake' },
  { value: 'gaming', label: 'Gaming', icon: 'gamepad-variant' },
  { value: 'arts', label: 'Arts', icon: 'palette' },
  { value: 'business', label: 'Business', icon: 'briefcase' },
  { value: 'other', label: 'Other', icon: 'calendar' },
];

export const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('social');
  const [address, setAddress] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [startDate, setStartDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 26 * 60 * 60 * 1000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter an event description');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an event location');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/events', {
        title: title.trim(),
        description: description.trim(),
        category,
        address: address.trim(),
        latitude: 42.6977, // Default to Sofia - should use actual location
        longitude: 23.3219,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : null,
        isPublic,
      });

      Alert.alert('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Give your event a catchy name"
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell people what your event is about..."
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={1000}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryChip,
                  category === cat.value && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Icon
                  name={cat.icon}
                  size={18}
                  color={category === cat.value ? '#000' : '#888'}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat.value && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter address or venue name"
            placeholderTextColor="#666"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Time</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Icon name="calendar-clock" size={20} color="#00d4ff" />
            <Text style={styles.dateButtonText}>{formatDateTime(startDate)}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="datetime"
              display="default"
              minimumDate={new Date()}
              onChange={(event, date) => {
                setShowStartPicker(false);
                if (date) {
                  setStartDate(date);
                  if (date > endDate) {
                    setEndDate(new Date(date.getTime() + 2 * 60 * 60 * 1000));
                  }
                }
              }}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Time</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Icon name="calendar-clock" size={20} color="#00d4ff" />
            <Text style={styles.dateButtonText}>{formatDateTime(endDate)}</Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="datetime"
              display="default"
              minimumDate={startDate}
              onChange={(event, date) => {
                setShowEndPicker(false);
                if (date) setEndDate(date);
              }}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Max Capacity (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Leave empty for unlimited"
            placeholderTextColor="#666"
            value={maxCapacity}
            onChangeText={setMaxCapacity}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setIsPublic(!isPublic)}
          >
            <View style={styles.toggleInfo}>
              <Icon name={isPublic ? 'earth' : 'lock'} size={24} color="#00d4ff" />
              <View style={styles.toggleText}>
                <Text style={styles.toggleLabel}>
                  {isPublic ? 'Public Event' : 'Private Event'}
                </Text>
                <Text style={styles.toggleDescription}>
                  {isPublic
                    ? 'Anyone can see and join this event'
                    : 'Only invited users can see this event'}
                </Text>
              </View>
            </View>
            <View style={[styles.toggle, isPublic && styles.toggleActive]}>
              <View style={[styles.toggleKnob, isPublic && styles.toggleKnobActive]} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Icon name="calendar-plus" size={20} color="#000" />
              <Text style={styles.createButtonText}>Create Event</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1a1a24',
    gap: 6,
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  categoryChipActive: {
    backgroundColor: '#00d4ff',
    borderColor: '#00d4ff',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#000',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    padding: 16,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  toggleText: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  toggleDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2a2a3a',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#00d4ff',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#666',
  },
  toggleKnobActive: {
    backgroundColor: '#fff',
    marginLeft: 'auto',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00d4ff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginTop: 12,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
