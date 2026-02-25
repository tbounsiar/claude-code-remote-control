import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useSessions } from '../hooks/useSessions';
import { SessionCard } from '../components/SessionCard';
import { EmptyState } from '../components/EmptyState';
import { CLAUDE_BASE_URL } from '../lib/constants';
import type { Session } from '../lib/storage';

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { sessions, loading, refresh, addSession, removeSession } = useSessions();
  const [urlModalVisible, setUrlModalVisible] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleSessionPress = useCallback((session: Session) => {
    router.push(`/session/${encodeURIComponent(session.url)}`);
  }, []);

  const handleSessionLongPress = useCallback(
    (session: Session) => {
      Alert.alert('Remove Session', `Remove "${session.label || session.url}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeSession(session.url),
        },
      ]);
    },
    [removeSession]
  );

  const handleAddUrl = useCallback(async () => {
    const url = urlInput.trim();
    if (!url) return;

    const sessionUrl = url.includes('claude.ai') ? url : `${CLAUDE_BASE_URL}/${url}`;
    await addSession({ url: sessionUrl, addedAt: Date.now() });
    setUrlInput('');
    setUrlModalVisible(false);
    router.push(`/session/${encodeURIComponent(sessionUrl)}`);
  }, [urlInput, addSession]);

  const handleBrowseSessions = useCallback(() => {
    router.push(`/session/${encodeURIComponent(CLAUDE_BASE_URL)}`);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Sessions</Text>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={styles.headerButton}
        >
          <Text style={{ fontSize: 22 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/scanner')}
        >
          <Text style={styles.actionButtonText}>📷 Scan QR Code</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
          onPress={() => setUrlModalVisible(true)}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>📋 Paste URL</Text>
        </TouchableOpacity>
      </View>

      {/* Browse button */}
      <TouchableOpacity
        style={[styles.browseButton, { borderColor: colors.border }]}
        onPress={handleBrowseSessions}
      >
        <Text style={[styles.browseText, { color: colors.primary }]}>
          🌐 Browse all sessions on claude.ai/code
        </Text>
      </TouchableOpacity>

      {/* Session List */}
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.url}
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            onPress={() => handleSessionPress(item)}
            onLongPress={() => handleSessionLongPress(item)}
          />
        )}
        ListEmptyComponent={loading ? null : <EmptyState />}
        contentContainerStyle={sessions.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
      />

      {/* URL Input Modal */}
      <Modal
        visible={urlModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setUrlModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Enter Session URL
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="https://claude.ai/code/..."
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              autoFocus
              onSubmitEditing={handleAddUrl}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => {
                  setUrlInput('');
                  setUrlModalVisible(false);
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleAddUrl}
              >
                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Open</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  headerButton: {
    padding: 4,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  browseButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  browseText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    paddingBottom: 20,
  },
  emptyList: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontWeight: '700',
    fontSize: 15,
  },
});
