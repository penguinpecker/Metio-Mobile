import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import Badge from './Badge';

// Agent Card - List View
export const AgentCard = ({
  emoji,
  name,
  description,
  status = 'active', // active, paused, setup
  stats,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity style={[styles.agentCard, style]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.agentIcon, status === 'active' && { backgroundColor: COLORS.orange }]}>
        <Text style={styles.agentEmoji}>{emoji}</Text>
      </View>
      <View style={styles.agentInfo}>
        <View style={styles.agentHeader}>
          <Text style={styles.agentName}>{name}</Text>
          <Badge
            text={status === 'active' ? 'Active' : status === 'paused' ? 'Paused' : 'Setup'}
            variant={status === 'active' ? 'active' : status === 'paused' ? 'paused' : 'fyi'}
            size="sm"
          />
        </View>
        <Text style={styles.agentDesc}>{description}</Text>
        {stats && (
          <View style={styles.agentStats}>
            {stats.map((stat, index) => (
              <Text key={index} style={styles.agentStat}>
                <Text style={styles.agentStatValue}>{stat.value}</Text> {stat.label}
              </Text>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Agent Grid Card - For selection
export const AgentGridCard = ({
  emoji,
  name,
  description,
  selected = false,
  status,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.agentGridCard,
        selected && styles.agentGridCardSelected,
        status === 'active' && styles.agentGridCardActive,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.agentGridEmoji}>{emoji}</Text>
      <Text style={styles.agentGridName}>{name}</Text>
      {description && <Text style={styles.agentGridDesc}>{description}</Text>}
      {status && (
        <Text style={[styles.agentGridStatus, status === 'active' && styles.agentGridStatusActive]}>
          ● {status === 'active' ? 'Active' : 'Paused'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// Agent Icon
export const AgentIcon = ({ emoji, color = COLORS.orange, size = 52 }) => {
  return (
    <View style={[styles.agentIconLarge, { backgroundColor: color, width: size, height: size, borderRadius: size * 0.27 }]}>
      <Text style={[styles.agentEmojiLarge, { fontSize: size * 0.46 }]}>{emoji}</Text>
    </View>
  );
};

// Quick Action Card
export const QuickAction = ({ icon, label, onPress, active = false, style }) => {
  return (
    <TouchableOpacity
      style={[styles.quickAction, active && styles.quickActionActive, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={[styles.quickActionLabel, active && styles.quickActionLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Agent Card
  agentCard: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    flexDirection: 'row',
    gap: SIZES.md + 2,
    marginBottom: SIZES.md,
  },
  agentIcon: {
    width: 52,
    height: 52,
    backgroundColor: COLORS.gray,
    borderRadius: SIZES.radiusLg - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentEmoji: {
    fontSize: 24,
  },
  agentInfo: {
    flex: 1,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  agentName: {
    fontSize: SIZES.fontLg + 2,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  agentDesc: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  agentStats: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  agentStat: {
    fontSize: SIZES.fontXs,
    color: COLORS.textTertiary,
  },
  agentStatValue: {
    fontWeight: '700',
    color: COLORS.black,
  },
  
  // Agent Grid Card
  agentGridCard: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: SIZES.radiusLg - 2,
    padding: SIZES.md + 2,
    alignItems: 'center',
  },
  agentGridCardSelected: {
    backgroundColor: COLORS.orange,
    shadowColor: COLORS.black,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  agentGridCardActive: {
    borderColor: COLORS.success,
  },
  agentGridEmoji: {
    fontSize: 32,
    marginBottom: SIZES.sm,
  },
  agentGridName: {
    fontSize: SIZES.fontSm - 1,
    fontWeight: '700',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 4,
  },
  agentGridDesc: {
    fontSize: 9,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  agentGridStatus: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.warning,
    marginTop: 4,
  },
  agentGridStatusActive: {
    color: COLORS.success,
  },
  
  // Agent Icon Large
  agentIconLarge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentEmojiLarge: {
    // fontSize set dynamically
  },
  
  // Quick Action
  quickAction: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md + 2,
    alignItems: 'center',
  },
  quickActionActive: {
    backgroundColor: COLORS.black,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: SIZES.fontXs,
    fontWeight: '600',
    color: COLORS.black,
  },
  quickActionLabelActive: {
    color: COLORS.white,
  },
});

export default { AgentCard, AgentGridCard, AgentIcon, QuickAction };
