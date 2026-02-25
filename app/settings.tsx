import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useTheme, type ThemePreference } from '../hooks/useTheme';
import { useSessions } from '../hooks/useSessions';

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useTheme();
  const insets = useSafeAreaInsets();
  const { clearAll } = useSessions();

  const themeOptions: { label: string; value: ThemePreference }[] = [
    { label: 'System', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  const handleClearSessions = () => {
    Alert.alert('Clear All Sessions', 'This will remove all saved sessions.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearAll },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          APPEARANCE
        </Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionRow,
                { borderBottomColor: colors.border },
              ]}
              onPress={() => setPreference(option.value)}
            >
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                {option.label}
              </Text>
              {preference === option.value && (
                <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Sessions */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          SESSIONS
        </Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomWidth: 0 }]}
            onPress={handleClearSessions}
          >
            <Text style={[styles.optionLabel, { color: colors.danger }]}>
              Clear All Sessions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Links */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          RESOURCES
        </Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomColor: colors.border }]}
            onPress={() => Linking.openURL('https://code.claude.com/docs/en/remote-control')}
          >
            <Text style={[styles.optionLabel, { color: colors.text }]}>
              Remote Control Documentation
            </Text>
            <Text style={[styles.chevron, { color: colors.textSecondary }]}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomWidth: 0 }]}
            onPress={() => Linking.openURL('https://claude.ai/code')}
          >
            <Text style={[styles.optionLabel, { color: colors.text }]}>
              Open claude.ai/code
            </Text>
            <Text style={[styles.chevron, { color: colors.textSecondary }]}>→</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.about}>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            Claude Code Remote Control
          </Text>
          <Text style={[styles.aboutVersion, { color: colors.textSecondary }]}>
            Version {Constants.expoConfig?.version || '1.0.0'}
          </Text>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            Made for Claude Code
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 60,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  optionLabel: {
    fontSize: 16,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 16,
  },
  about: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  aboutText: {
    fontSize: 13,
  },
  aboutVersion: {
    fontSize: 12,
    marginVertical: 4,
  },
});
