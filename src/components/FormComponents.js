import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

// Avatar Component
export const Avatar = ({ text = 'JD', size = 36, onPress, style }) => {
  const Component = onPress ? TouchableOpacity : View;
  
  return (
    <Component
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{text}</Text>
    </Component>
  );
};

// Input Component
export const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  variant = 'default', // default, dark
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  style,
}) => {
  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          variant === 'dark' && styles.inputDark,
          error && styles.inputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor={variant === 'dark' ? '#666' : '#999'}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Toggle Component
export const Toggle = ({ value, onValueChange, disabled = false }) => {
  return (
    <View style={[styles.toggle, value && styles.toggleActive]}>
      <TouchableOpacity
        style={[styles.toggleKnob, value && styles.toggleKnobActive]}
        onPress={() => onValueChange(!value)}
        disabled={disabled}
        activeOpacity={0.8}
      />
    </View>
  );
};

// Toggle Row Component
export const ToggleRow = ({ title, subtitle, value, onValueChange, style }) => {
  return (
    <View style={[styles.toggleRow, style]}>
      <View style={styles.toggleRowContent}>
        <Text style={styles.toggleRowTitle}>{title}</Text>
        {subtitle && <Text style={styles.toggleRowSubtitle}>{subtitle}</Text>}
      </View>
      <Toggle value={value} onValueChange={onValueChange} />
    </View>
  );
};

// Metric Card Component
export const MetricCard = ({ value, label, valueColor, style }) => {
  return (
    <View style={[styles.metricCard, style]}>
      <Text style={[styles.metricValue, valueColor && { color: valueColor }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
};

// Metrics Row Component
export const MetricsRow = ({ metrics, style }) => {
  return (
    <View style={[styles.metricsRow, style]}>
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          value={metric.value}
          label={metric.label}
          valueColor={metric.color}
          style={{ flex: 1 }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // Avatar
  avatar: {
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.orange,
    fontWeight: '600',
  },
  
  // Input
  inputContainer: {
    marginBottom: SIZES.md,
  },
  inputLabel: {
    fontSize: SIZES.fontSm - 1,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.md + 2,
    paddingHorizontal: SIZES.lg,
    fontSize: SIZES.fontMd,
    color: COLORS.black,
  },
  inputDark: {
    backgroundColor: COLORS.darkGray,
    borderColor: '#333',
    color: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.fontSm,
    marginTop: 4,
  },
  
  // Toggle
  toggle: {
    width: 44,
    height: 26,
    backgroundColor: '#CCC',
    borderRadius: 13,
    padding: 3,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: COLORS.black,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    backgroundColor: COLORS.white,
    borderRadius: 10,
  },
  toggleKnobActive: {
    backgroundColor: COLORS.orange,
    alignSelf: 'flex-end',
  },
  
  // Toggle Row
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  toggleRowContent: {
    flex: 1,
    marginRight: SIZES.md,
  },
  toggleRowTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
  },
  toggleRowSubtitle: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  
  // Metric Card
  metricCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: SIZES.radiusSm + 2,
    padding: SIZES.sm + 2,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: SIZES.fontXl + 2,
    fontWeight: '900',
    color: COLORS.black,
  },
  metricLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  
  // Metrics Row
  metricsRow: {
    flexDirection: 'row',
    gap: SIZES.sm + 2,
    marginBottom: SIZES.md + 2,
  },
});

export default { Avatar, Input, Toggle, ToggleRow, MetricCard, MetricsRow };
