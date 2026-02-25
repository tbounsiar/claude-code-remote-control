export const CLAUDE_BASE_URL = 'https://claude.ai/code';
export const CLAUDE_DOMAIN = 'claude.ai';
export const ANTHROPIC_DOMAIN = 'anthropic.com';

export const APP_NAME = 'Claude Code Remote Control';
export const APP_SCHEME = 'clauderemote';

export const NOTIFICATION_CHANNEL_ID = 'session-events';
export const NOTIFICATION_CHANNEL_NAME = 'Session Events';

export const STORAGE_KEYS = {
  SESSIONS: '@sessions',
  THEME_PREFERENCE: '@theme_preference',
} as const;

export const COLORS = {
  primary: '#D97706',
  primaryLight: '#F59E0B',
  danger: '#EF4444',
  success: '#22C55E',
} as const;
