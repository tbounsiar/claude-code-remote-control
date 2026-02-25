import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { WebViewSession } from '../../components/WebViewSession';

export default function SessionScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const decodedUrl = decodeURIComponent(url || '');

  if (!decodedUrl) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.error, { color: colors.danger }]}>
          Invalid session URL
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Minimal Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: insets.top },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.urlText, { color: colors.textSecondary }]} numberOfLines={1}>
          {decodedUrl.replace('https://', '')}
        </Text>
      </View>

      {/* WebView */}
      <WebViewSession url={decodedUrl} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 12,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  urlText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});
