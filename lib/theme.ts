export interface AppTheme {
  dark: boolean;
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
    primaryDark: string;
    border: string;
    statusActive: string;
    statusInactive: string;
    danger: string;
  };
}

export const lightTheme: AppTheme = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    primary: '#D97706',
    primaryDark: '#B45309',
    border: '#E5E7EB',
    statusActive: '#22C55E',
    statusInactive: '#9CA3AF',
    danger: '#EF4444',
  },
};

export const darkTheme: AppTheme = {
  dark: true,
  colors: {
    background: '#0F0F0F',
    surface: '#1A1A1A',
    card: '#252525',
    text: '#F5F5F5',
    textSecondary: '#9CA3AF',
    primary: '#F59E0B',
    primaryDark: '#D97706',
    border: '#374151',
    statusActive: '#4ADE80',
    statusInactive: '#6B7280',
    danger: '#F87171',
  },
};
