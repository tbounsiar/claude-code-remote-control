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

/** Check if a hostname belongs to an allowed domain (claude.ai or anthropic.com) */
export function isAllowedHost(hostname: string): boolean {
  return (
    hostname === CLAUDE_DOMAIN ||
    hostname.endsWith('.' + CLAUDE_DOMAIN) ||
    hostname === ANTHROPIC_DOMAIN ||
    hostname.endsWith('.' + ANTHROPIC_DOMAIN)
  );
}

/** Check if a hostname is a Google OAuth domain */
export function isGoogleAuthHost(hostname: string): boolean {
  return hostname === 'accounts.google.com';
}

/** Check if a URL is a valid Claude session URL */
export function isValidClaudeUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    return parsed.hostname === CLAUDE_DOMAIN || parsed.hostname.endsWith('.' + CLAUDE_DOMAIN);
  } catch {
    return false;
  }
}

export const COLORS = {
  primary: '#D97706',
  primaryLight: '#F59E0B',
  danger: '#EF4444',
  success: '#22C55E',
} as const;
