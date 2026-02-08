import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, orange, ghost
  size = 'md', // sm, md, lg
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.base, styles[size]];
    
    switch (variant) {
      case 'primary':
        return [...baseStyle, styles.primary, disabled && styles.disabled];
      case 'secondary':
        return [...baseStyle, styles.secondary, disabled && styles.disabledSecondary];
      case 'orange':
        return [...baseStyle, styles.orange, disabled && styles.disabled];
      case 'ghost':
        return [...baseStyle, styles.ghost];
      default:
        return [...baseStyle, styles.primary];
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.text, styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`]];
    
    switch (variant) {
      case 'primary':
        return [...baseTextStyle, styles.textPrimary];
      case 'secondary':
        return [...baseTextStyle, styles.textSecondary];
      case 'orange':
        return [...baseTextStyle, styles.textOrange];
      case 'ghost':
        return [...baseTextStyle, styles.textGhost];
      default:
        return [...baseTextStyle, styles.textPrimary];
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? COLORS.black : COLORS.white} />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radiusFull,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  sm: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
  },
  md: {
    paddingVertical: SIZES.md + 2,
    paddingHorizontal: SIZES.xl,
  },
  lg: {
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.xxl,
  },
  primary: {
    backgroundColor: COLORS.black,
  },
  secondary: {
    backgroundColor: COLORS.white,
  },
  orange: {
    backgroundColor: COLORS.orange,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledSecondary: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: SIZES.fontSm,
  },
  textMd: {
    fontSize: SIZES.fontMd,
  },
  textLg: {
    fontSize: SIZES.fontLg,
  },
  textPrimary: {
    color: COLORS.white,
  },
  textSecondary: {
    color: COLORS.black,
  },
  textOrange: {
    color: COLORS.black,
  },
  textGhost: {
    color: COLORS.textSecondary,
  },
  icon: {
    marginRight: SIZES.sm,
    fontSize: SIZES.fontLg,
  },
});

export default Button;
