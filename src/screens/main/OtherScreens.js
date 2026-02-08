import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { Header, Card, NotificationCard, SectionLabel, QuickAction, Button } from '../../components';
import { useActivity } from '../../hooks/useData';

const AGENT_TYPE_MAP = {
  COMM_MANAGER: { emoji: '📧', color: COLORS.orange },
  MONEY_BOT: { emoji: '💰', color: COLORS.success },
  LIFE_PLANNER: { emoji: '📅', color: COLORS.info || '#3B82F6' },
  SOCIAL_PILOT: { emoji: '📱', color: COLORS.warning },
  HOME_COMMAND: { emoji: '🏠', color: COLORS.warning },
  PRICE_WATCHDOG: { emoji: '🐕', color: COLORS.error },
};

// Activity Screen
export const ActivityScreen = ({ navigation }) => {
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const { activities, isLoading, refetch } = useActivity();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getAgentInfo = (activity) => {
    const type = activity.agent?.type || activity.agentType;
    return AGENT_TYPE_MAP[type] || { emoji: '📊', color: COLORS.orange };
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (isToday) return time;
    if (isYesterday) return `Yesterday ${time}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + time;
  };

  const groupByDay = (items) => {
    const groups = {};
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    items.forEach(item => {
      const date = new Date(item.createdAt);
      let key;
      if (date.toDateString() === now.toDateString()) key = 'Today';
      else if (date.toDateString() === yesterday.toDateString()) key = 'Yesterday';
      else key = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  };

  const grouped = groupByDay(activities);

  return (
    <View style={styles.container}>
      <Header
        variant="gray"
        title="ACTIVITY"
        showAvatar={true}
        avatarText="JD"
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterChips}>
            {['All', '📧 Comm', '💰 Money', '📅 Life', '📱 Social', '🏠 Home', '🐕 Watchdog'].map((label, index) => (
              <TouchableOpacity
                key={label}
                style={[styles.filterChip, index === 0 && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, index === 0 && styles.filterChipTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {isLoading ? (
          <ActivityIndicator color={COLORS.orange} style={{ padding: 40 }} />
        ) : activities.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📊</Text>
            <Text style={{ fontSize: SIZES.fontMd, fontWeight: '600', color: COLORS.black }}>No activity yet</Text>
            <Text style={{ fontSize: SIZES.fontSm, color: COLORS.textSecondary, marginTop: 4 }}>Start using your agents to see activity here</Text>
          </View>
        ) : (
          Object.entries(grouped).map(([day, items]) => (
            <React.Fragment key={day}>
              <SectionLabel>{day}</SectionLabel>
              {items.map((activity) => {
                const info = getAgentInfo(activity);
                return (
                  <Card key={activity.id} style={day !== 'Today' ? { opacity: 0.8 } : undefined}>
                    <View style={styles.activityItem}>
                      <View style={[styles.activityIcon, { backgroundColor: info.color }]}>
                        <Text style={styles.activityEmoji}>{info.emoji}</Text>
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={styles.activityTitle}>{activity.action || activity.description}</Text>
                        <Text style={styles.activitySubtitle}>{formatTime(activity.createdAt)}{activity.description && activity.action ? ` • ${activity.description}` : ''}</Text>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </React.Fragment>
          ))
        )}
      </ScrollView>
    </View>
  );
};

// Empty State - No Agents
export const EmptyAgentsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <Text style={styles.emptyEmoji}>🤖</Text>
        <Text style={styles.emptyTitle}>No Agents Yet</Text>
        <Text style={styles.emptyDescription}>
          Create your first AI agent to start automating your life. It only takes a minute!
        </Text>
        <Button
          title="Create Your First Agent →"
          variant="orange"
          onPress={() => navigation.navigate('AgentSetup')}
          style={styles.emptyButton}
        />
      </View>
    </SafeAreaView>
  );
};

// Empty State - No Activity
export const EmptyActivityScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={styles.emptyTitle}>No Activity Yet</Text>
        <Text style={styles.emptyDescription}>
          Once your agents start working, you'll see all their activity here.
        </Text>
        <Button
          title="Go to Agents"
          variant="secondary"
          onPress={() => navigation.navigate('Agents')}
          style={styles.emptyButton}
        />
      </View>
    </SafeAreaView>
  );
};

// Empty State - No Notifications
export const EmptyNotificationsScreen = () => {
  return (
    <View style={styles.emptyContent}>
      <Text style={styles.emptyEmoji}>🔔</Text>
      <Text style={styles.emptyTitle}>All Caught Up!</Text>
      <Text style={styles.emptyDescription}>
        No pending notifications. Your agents are working smoothly.
      </Text>
    </View>
  );
};

// Error State - Network Error
export const NetworkErrorScreen = ({ onRetry }) => {
  return (
    <SafeAreaView style={styles.errorContainer}>
      <View style={styles.emptyContent}>
        <Text style={styles.emptyEmoji}>📡</Text>
        <Text style={styles.emptyTitle}>Connection Lost</Text>
        <Text style={styles.emptyDescription}>
          We couldn't connect to our servers. Check your internet connection and try again.
        </Text>
        <Button
          title="Try Again"
          variant="primary"
          onPress={onRetry}
          style={styles.emptyButton}
        />
      </View>
    </SafeAreaView>
  );
};

// Error State - General Error
export const GeneralErrorScreen = ({ onRetry, onGoHome }) => {
  return (
    <SafeAreaView style={styles.errorContainer}>
      <View style={styles.emptyContent}>
        <Text style={styles.emptyEmoji}>😵</Text>
        <Text style={styles.emptyTitle}>Oops! Something Went Wrong</Text>
        <Text style={styles.emptyDescription}>
          We encountered an unexpected error. Our team has been notified.
        </Text>
        <Button
          title="Try Again"
          variant="primary"
          onPress={onRetry}
          style={styles.emptyButton}
        />
        <Button
          title="Go Home"
          variant="ghost"
          onPress={onGoHome}
        />
      </View>
    </SafeAreaView>
  );
};

// Push Notification Permission Screen
export const NotificationPermissionScreen = ({ navigation, onEnable, onSkip }) => {
  return (
    <SafeAreaView style={styles.permissionContainer}>
      <View style={styles.permissionContent}>
        <View style={styles.permissionIcon}>
          <Text style={styles.permissionEmoji}>🔔</Text>
        </View>
        
        <Text style={styles.permissionTitle}>STAY IN{'\n'}THE LOOP</Text>
        
        <Text style={styles.permissionDescription}>
          Get notified when your agents need approval, complete tasks, or detect something important.
        </Text>

        <View style={styles.permissionFeatures}>
          <View style={styles.permissionFeature}>
            <Text style={styles.featureEmoji}>⚡</Text>
            <Text style={styles.featureText}>Instant alerts for urgent items</Text>
          </View>
          <View style={styles.permissionFeature}>
            <Text style={styles.featureEmoji}>✅</Text>
            <Text style={styles.featureText}>Approve drafts on the go</Text>
          </View>
          <View style={styles.permissionFeature}>
            <Text style={styles.featureEmoji}>📊</Text>
            <Text style={styles.featureText}>Daily summary notifications</Text>
          </View>
        </View>

        <Button
          title="Enable Notifications"
          variant="orange"
          onPress={onEnable}
          style={styles.permissionButton}
        />
        <Button
          title="Maybe Later"
          variant="ghost"
          onPress={onSkip}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.gray,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    marginTop: -20,
  },
  contentContainer: {
    padding: SIZES.lg,
    paddingBottom: 100,
  },
  filterScroll: {
    marginBottom: SIZES.md,
    marginHorizontal: -SIZES.lg,
    paddingHorizontal: SIZES.lg,
  },
  filterChips: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  filterChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: SIZES.radiusFull,
    paddingVertical: 6,
    paddingHorizontal: SIZES.md,
  },
  filterChipActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  filterChipText: {
    fontSize: SIZES.fontXs,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm + 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityEmoji: {
    fontSize: 14,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
  },
  activitySubtitle: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Empty States
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.xxxl,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: SIZES.xxl,
  },
  emptyTitle: {
    fontSize: SIZES.fontXxl,
    fontWeight: '900',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  emptyDescription: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.xxl,
  },
  emptyButton: {
    width: '100%',
    marginBottom: SIZES.md,
  },
  // Error States
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  // Permission Screen
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.orange,
  },
  permissionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.xxl,
  },
  permissionIcon: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.white,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.xxl,
  },
  permissionEmoji: {
    fontSize: 56,
  },
  permissionTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SIZES.lg,
    lineHeight: 38,
  },
  permissionDescription: {
    fontSize: SIZES.fontMd,
    color: COLORS.black,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.xxl,
  },
  permissionFeatures: {
    width: '100%',
    marginBottom: SIZES.xxxl,
  },
  permissionFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureText: {
    fontSize: SIZES.fontMd,
    color: COLORS.black,
    fontWeight: '500',
  },
  permissionButton: {
    width: '100%',
    marginBottom: SIZES.md,
  },
});

export default {
  ActivityScreen,
  EmptyAgentsScreen,
  EmptyActivityScreen,
  EmptyNotificationsScreen,
  NetworkErrorScreen,
  GeneralErrorScreen,
  NotificationPermissionScreen,
};
