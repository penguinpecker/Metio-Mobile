// Metio Design System
export const COLORS = {
  // Primary
  orange: '#F26F21',
  orangeLight: '#FF8C42',
  orangeDark: '#D85A10',
  
  // Secondary
  lavender: '#938EF2',
  lavenderLight: '#B5B1F7',
  lavenderDark: '#7570D1',
  
  // Neutrals
  black: '#080808',
  darkGray: '#1A1A1A',
  gray: '#D9D9D9',
  lightGray: '#F5F5F5',
  white: '#FFFFFF',
  
  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Text
  textPrimary: '#080808',
  textSecondary: '#666666',
  textTertiary: '#888888',
  textLight: '#FFFFFF',
  
  // Background
  background: '#D9D9D9',
  backgroundDark: '#080808',
  card: '#FFFFFF',
};

export const FONTS = {
  // Using system fonts that mimic Anton and Inter
  heading: {
    fontFamily: 'System',
    fontWeight: '900',
  },
  body: {
    fontFamily: 'System',
    fontWeight: '400',
  },
  bodyMedium: {
    fontFamily: 'System',
    fontWeight: '500',
  },
  bodySemiBold: {
    fontFamily: 'System',
    fontWeight: '600',
  },
  bodyBold: {
    fontFamily: 'System',
    fontWeight: '700',
  },
};

export const SIZES = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Border Radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 100,
  
  // Font Sizes
  fontXs: 10,
  fontSm: 12,
  fontMd: 14,
  fontLg: 16,
  fontXl: 20,
  fontXxl: 24,
  fontXxxl: 32,
  fontDisplay: 48,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
};

// Agent configurations
export const AGENTS = [
  {
    id: 'comm-manager',
    name: 'COMM MANAGER',
    emoji: '📧',
    color: COLORS.orange,
    description: 'Email digest & priority inbox',
    features: ['Daily Email Digest', 'Priority Inbox'],
  },
  {
    id: 'money-bot',
    name: 'MONEY BOT',
    emoji: '💰',
    color: COLORS.success,
    description: 'Statement scan & spend alerts',
    features: ['Statement Scanner', 'Spend Rate Alert'],
  },
  {
    id: 'life-planner',
    name: 'LIFE PLANNER',
    emoji: '📅',
    color: COLORS.info,
    description: 'Calendar & daily briefing',
    features: ['Smart Scheduling', 'Morning Briefing'],
  },
  {
    id: 'news-pilot',
    name: 'NEWS PILOT',
    emoji: '📰',
    color: COLORS.lavender,
    description: 'AI-curated news & search',
    features: ['Daily News Brief', 'News Search'],
  },
  {
    id: 'price-watchdog',
    name: 'PRICE WATCHDOG',
    emoji: '🐕',
    color: COLORS.error,
    description: 'Track prices & get drop alerts',
    features: ['My Watchlist', 'Price Alerts'],
  },
];

export default {
  COLORS,
  FONTS,
  SIZES,
  SHADOWS,
  AGENTS,
};
