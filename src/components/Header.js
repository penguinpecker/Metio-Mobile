import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../constants/theme';
import Badge from './Badge';
import Avatar from './Avatar';

const Header = ({
  variant = 'orange', // orange, gray, black
  title,
  subtitle,
  showBack = false,
  showAvatar = false,
  avatarText = 'JD',
  statusText,
  statusActive = true,
  onBackPress,
  onAvatarPress,
  leftIcon,
  rightComponent,
  children,
}) => {
  const insets = useSafeAreaInsets();

  const getHeaderStyle = () => {
    switch (variant) {
      case 'gray':
        return styles.headerGray;
      case 'black':
        return styles.headerBlack;
      default:
        return styles.headerOrange;
    }
  };

  const getTextColor = () => {
    return variant === 'black' ? COLORS.white : COLORS.black;
  };

  const getBackButtonStyle = () => {
    return variant === 'black' ? styles.backButtonLight : styles.backButton;
  };

  return (
    <View style={[styles.container, getHeaderStyle(), { paddingTop: insets.top + SIZES.md }]}>
      <StatusBar
        barStyle={variant === 'black' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity style={getBackButtonStyle()} onPress={onBackPress}>
            <Text style={[styles.backIcon, { color: getTextColor() }]}>←</Text>
          </TouchableOpacity>
        ) : leftIcon ? (
          <View>{leftIcon}</View>
        ) : (
          <View style={styles.placeholder} />
        )}

        {statusText ? (
          <Badge
            text={statusText}
            variant={statusActive ? 'active' : 'default'}
            showDot={statusActive}
          />
        ) : rightComponent ? (
          rightComponent
        ) : showAvatar ? (
          <Avatar text={avatarText} onPress={onAvatarPress} />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {title && (
        <View style={styles.titleContainer}>
          {children}
          <Text style={[styles.title, { color: getTextColor() }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: getTextColor(), opacity: 0.7 }]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.xl,
    paddingBottom: SIZES.xxl,
  },
  headerOrange: {
    backgroundColor: COLORS.orange,
  },
  headerGray: {
    backgroundColor: COLORS.gray,
  },
  headerBlack: {
    backgroundColor: COLORS.black,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonLight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 36,
    height: 36,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: SIZES.fontXxxl,
    fontWeight: '900',
    textTransform: 'uppercase',
    lineHeight: SIZES.fontXxxl,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: SIZES.fontSm,
    marginTop: SIZES.xs,
  },
});

export default Header;
