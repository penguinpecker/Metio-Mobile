import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const Card = ({
  children,
  variant = 'default', // default, selected, lavender, outlined
  onPress,
  style,
  padding = SIZES.md + 2,
}) => {
  const getCardStyle = () => {
    const baseStyle = [styles.base, { padding }];
    
    switch (variant) {
      case 'selected':
        return [...baseStyle, styles.selected];
      case 'lavender':
        return [...baseStyle, styles.lavender];
      case 'outlined':
        return [...baseStyle, styles.outlined];
      case 'dark':
        return [...baseStyle, styles.dark];
      case 'success':
        return [...baseStyle, styles.success];
      case 'error':
        return [...baseStyle, styles.error];
      case 'warning':
        return [...baseStyle, styles.warning];
      default:
        return [...baseStyle, styles.default];
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    marginBottom: SIZES.sm + 2,
  },
  default: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.black,
  },
  selected: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.black,
    borderWidth: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  lavender: {
    backgroundColor: COLORS.lavender,
    borderColor: COLORS.black,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: COLORS.black,
    borderStyle: 'dashed',
  },
  dark: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  success: {
    backgroundColor: '#F0FDF4',
    borderColor: COLORS.success,
    borderWidth: 2,
  },
  error: {
    backgroundColor: '#FEF2F2',
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  warning: {
    backgroundColor: '#FEFCE8',
    borderColor: COLORS.warning,
    borderWidth: 2,
  },
});

export default Card;
