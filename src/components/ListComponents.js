import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import Button from './Button';

// Notification Card
export const NotificationCard = ({
  emoji,
  iconColor = COLORS.orange,
  title,
  body,
  time,
  agent,
  actions,
  onPress,
  variant = 'default', // default, highlighted
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.notifCard, variant === 'highlighted' && styles.notifCardHighlighted, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.notifIcon, { backgroundColor: iconColor }]}>
        <Text style={styles.notifEmoji}>{emoji}</Text>
      </View>
      <View style={styles.notifContent}>
        <Text style={styles.notifTitle}>{title}</Text>
        {body && <Text style={styles.notifBody}>{body}</Text>}
        {(time || agent) && (
          <Text style={styles.notifTime}>
            {time}{agent && ` • ${agent}`}
          </Text>
        )}
        {actions && (
          <View style={styles.notifActions}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.notifBtn, action.primary && styles.notifBtnPrimary]}
                onPress={action.onPress}
              >
                <Text style={[styles.notifBtnText, action.primary && styles.notifBtnTextPrimary]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// List Item
export const ListItem = ({
  icon,
  iconBg = COLORS.orange,
  title,
  subtitle,
  rightText,
  rightColor,
  showArrow = false,
  onPress,
  style,
}) => {
  const Component = onPress ? TouchableOpacity : View;
  
  return (
    <Component style={[styles.listItem, style]} onPress={onPress} activeOpacity={0.8}>
      {icon && (
        <View style={[styles.listIcon, { backgroundColor: iconBg }]}>
          <Text style={styles.listEmoji}>{icon}</Text>
        </View>
      )}
      <View style={styles.listContent}>
        <Text style={styles.listTitle}>{title}</Text>
        {subtitle && <Text style={styles.listSubtitle}>{subtitle}</Text>}
      </View>
      {rightText && (
        <Text style={[styles.listRight, rightColor && { color: rightColor }]}>{rightText}</Text>
      )}
      {showArrow && <Text style={styles.listArrow}>→</Text>}
    </Component>
  );
};

// Section Label
export const SectionLabel = ({ children, style }) => {
  return <Text style={[styles.sectionLabel, style]}>{children}</Text>;
};

// Divider
export const Divider = ({ text, style }) => {
  return (
    <View style={[styles.divider, style]}>
      <View style={styles.dividerLine} />
      {text && <Text style={styles.dividerText}>{text}</Text>}
      {text && <View style={styles.dividerLine} />}
    </View>
  );
};

// Progress Steps
export const ProgressSteps = ({ steps = 4, current = 1, style }) => {
  return (
    <View style={[styles.progressSteps, style]}>
      {Array.from({ length: steps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressStep,
            index < current - 1 && styles.progressStepDone,
            index === current - 1 && styles.progressStepActive,
          ]}
        />
      ))}
    </View>
  );
};

// Integration Item
export const IntegrationItem = ({
  icon,
  iconBg = COLORS.orange,
  name,
  status,
  connected = false,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.integrationItem, connected && styles.integrationItemConnected, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.integrationIcon, { backgroundColor: iconBg }]}>
        <Text style={styles.integrationEmoji}>{icon}</Text>
      </View>
      <View style={styles.integrationInfo}>
        <Text style={styles.integrationName}>{name}</Text>
        <Text style={[styles.integrationStatus, connected && styles.integrationStatusConnected]}>
          {status}
        </Text>
      </View>
      <Text style={[styles.integrationAction, connected && { color: COLORS.success }]}>
        {connected ? '✓' : '+'}
      </Text>
    </TouchableOpacity>
  );
};

// Alert Banner
export const AlertBanner = ({
  emoji,
  title,
  description,
  variant = 'error', // error, warning, success, info
  onPress,
  style,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return { bg: '#FEFCE8', border: COLORS.warning };
      case 'success':
        return { bg: '#F0FDF4', border: COLORS.success };
      case 'info':
        return { bg: '#EFF6FF', border: COLORS.info };
      default:
        return { bg: '#FEF2F2', border: COLORS.error };
    }
  };
  
  const variantStyle = getVariantStyles();
  
  return (
    <TouchableOpacity
      style={[styles.alertBanner, { backgroundColor: variantStyle.bg, borderColor: variantStyle.border }, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Text style={styles.alertEmoji}>{emoji}</Text>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{title}</Text>
        {description && <Text style={styles.alertDesc}>{description}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Notification Card
  notifCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: SIZES.radiusLg - 2,
    padding: SIZES.md + 2,
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.sm + 2,
  },
  notifCardHighlighted: {
    borderColor: COLORS.orange,
    borderWidth: 2,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifEmoji: {
    fontSize: 20,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  notifBody: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  notifTime: {
    fontSize: SIZES.fontXs,
    color: COLORS.textTertiary,
    marginTop: 6,
  },
  notifActions: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginTop: SIZES.sm + 2,
  },
  notifBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: COLORS.black,
  },
  notifBtnPrimary: {
    backgroundColor: COLORS.black,
  },
  notifBtnText: {
    fontSize: SIZES.fontXs,
    fontWeight: '600',
    color: COLORS.black,
  },
  notifBtnTextPrimary: {
    color: COLORS.white,
  },
  
  // List Item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: SIZES.radiusSm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listEmoji: {
    fontSize: 16,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
  },
  listSubtitle: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listRight: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textSecondary,
  },
  listArrow: {
    fontSize: SIZES.fontLg,
    color: '#CCC',
  },
  
  // Section Label
  sectionLabel: {
    fontSize: SIZES.fontXs,
    fontWeight: '600',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SIZES.sm + 2,
    marginTop: SIZES.lg,
  },
  
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.lg,
    marginVertical: SIZES.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CCC',
  },
  dividerText: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textTertiary,
  },
  
  // Progress Steps
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.xl,
  },
  progressStep: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDD',
  },
  progressStepDone: {
    backgroundColor: COLORS.success,
  },
  progressStepActive: {
    backgroundColor: COLORS.orange,
  },
  
  // Integration Item
  integrationItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    marginBottom: SIZES.sm + 2,
  },
  integrationItemConnected: {
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  integrationIcon: {
    width: 40,
    height: 40,
    borderRadius: SIZES.radiusSm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  integrationEmoji: {
    fontSize: 20,
  },
  integrationInfo: {
    flex: 1,
  },
  integrationName: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
  },
  integrationStatus: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textTertiary,
  },
  integrationStatusConnected: {
    color: COLORS.success,
  },
  integrationAction: {
    fontSize: SIZES.fontXl,
    color: '#CCC',
  },
  
  // Alert Banner
  alertBanner: {
    borderWidth: 2,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.md,
    marginBottom: SIZES.lg,
  },
  alertEmoji: {
    fontSize: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
  },
  alertDesc: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default {
  NotificationCard,
  ListItem,
  SectionLabel,
  Divider,
  ProgressSteps,
  IntegrationItem,
  AlertBanner,
};
