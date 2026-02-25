import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export function EmptyState() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.icon]}>📡</Text>
      <Text style={[styles.title, { color: colors.text }]}>No Sessions Yet</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Scan a QR code from{' '}
        <Text style={{ fontFamily: 'monospace' }}>claude remote-control</Text>
        {'\n'}or paste a session URL to get started.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
