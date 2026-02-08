import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const Badge = ({
  text,
  variant = 'default', // default, active, paused, ai, new, urgent, action, fyi
  showDot = false,
  size = 'md', // sm, md
  style,
}) => {
  const getBadgeStyle = () => {
    const baseStyle = [styles.base, styles[size]];
    
    switch (variant) {
      case 'active':
        return [...baseStyle, styles.active];
      case 'paused':
        return [...baseStyle, styles.paused];
      case 'ai':
        return [...baseStyle, styles.ai];
      case 'new':
        return [...baseStyle, styles.new];
      case 'urgent':
        return [...baseStyle, styles.urgent];
      case 'action':
        return [...baseStyle, styles.action];
      case 'fyi':
        return [...baseStyle, styles.fyi];
      case 'success':
        return [...baseStyle, styles.success];
      case 'warning':
        return [...baseStyle, styles.warningBadge];
      default:
        return [...baseStyle, styles.default];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'active':
      case 'ai':
        return styles.textLight;
      case 'paused':
      case 'new':
      case 'action':
        return styles.textDark;
      case 'urgent':
        return styles.textUrgent;
      case 'fyi':
        return styles.textFyi;
      default:
        return styles.textDark;
    }
  };

  const getDotColor = () => {
    switch (variant) {
      case 'active':
        return COLORS.white;
      case 'success':
        return COLORS.success;
      default:
        return COLORS.success;
    }
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      {showDot && <View style={[styles.dot, { backgroundColor: getDotColor() }]} />}
      <Text style={[styles.text, styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`], getTextStyle()]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radiusFull,
  },
  sm: {
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  md: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  default: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: COLORS.black,
  },
  active: {
    backgroundColor: COLORS.success,
  },
  paused: {
    backgroundColor: COLORS.warning,
  },
  ai: {
    backgroundColor: COLORS.lavender,
  },
  new: {
    backgroundColor: COLORS.orange,
  },
  urgent: {
    backgroundColor: '#FECACA',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  action: {
    backgroundColor: '#FED7AA',
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  fyi: {
    backgroundColor: '#E5E5E5',
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  success: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  warningBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  textSm: {
    fontSize: 8,
  },
  textMd: {
    fontSize: 9,
  },
  textLight: {
    color: COLORS.white,
  },
  textDark: {
    color: COLORS.black,
  },
  textUrgent: {
    color: COLORS.error,
  },
  textFyi: {
    color: COLORS.textSecondary,
  },
});

export default Badge;
