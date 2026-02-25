import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import type { Session } from '../lib/storage';

interface Props {
  session: Session;
  onPress: () => void;
  onLongPress: () => void;
}

export function SessionCard({ session, onPress, onLongPress }: Props) {
  const { colors } = useTheme();

  const displayLabel = session.label || extractSessionId(session.url);
  const timeAgo = formatTimeAgo(session.addedAt);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View style={[styles.statusDot, { backgroundColor: colors.statusActive }]} />
        <View style={styles.content}>
          <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
            {displayLabel}
          </Text>
          <Text style={[styles.url, { color: colors.textSecondary }]} numberOfLines={1}>
            {session.url}
          </Text>
        </View>
        <Text style={[styles.time, { color: colors.textSecondary }]}>{timeAgo}</Text>
      </View>
    </TouchableOpacity>
  );
}

function extractSessionId(url: string): string {
  const parts = url.split('/');
  const last = parts[parts.length - 1];
  if (last && last.length > 8) {
    return last.substring(0, 8) + '...';
  }
  return last || 'Session';
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  url: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  time: {
    fontSize: 12,
  },
});
