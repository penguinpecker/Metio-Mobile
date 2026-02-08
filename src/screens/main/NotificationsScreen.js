import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { Header, Card, SectionLabel } from '../../components';
import { useNotifications } from '../../hooks/useData';

const AGENT_TYPE_MAP = {
  COMM_MANAGER: { emoji: '📧', color: COLORS.orange },
  MONEY_BOT: { emoji: '💰', color: COLORS.success },
  LIFE_PLANNER: { emoji: '📅', color: '#3B82F6' },
  SOCIAL_PILOT: { emoji: '📱', color: COLORS.warning },
  HOME_COMMAND: { emoji: '🏠', color: COLORS.warning },
  PRICE_WATCHDOG: { emoji: '🐕', color: COLORS.error },
};

const NotificationsScreen = ({ navigation }) => {
  const { notifications, isLoading, markAsRead, markAllAsRead, refetch } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  const getAgentInfo = (notification) => {
    const type = notification.agentType || notification.agent?.type;
    return AGENT_TYPE_MAP[type] || { emoji: '🔔', color: COLORS.orange };
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead([notification.id]);
    }

    // Navigate based on type
    if (notification.actionType === 'approval' && notification.actionId) {
      navigation.navigate('DraftApproval', { actionId: notification.actionId });
    } else if (notification.agentType === 'COMM_MANAGER') {
      navigation.navigate('AgentDetail', {
        agent: { id: 'comm-manager', name: 'COMM MANAGER', emoji: '📧', features: ['Email Digest', 'Priority Inbox', 'Smart Replies'] },
        status: 'active',
      });
    } else if (notification.agentType === 'MONEY_BOT') {
      navigation.navigate('AgentDetail', {
        agent: { id: 'money-bot', name: 'MONEY BOT', emoji: '💰', features: ['Statement Scanner', 'Budget Alerts', 'Expense Tracker'] },
        status: 'active',
      });
    }
  };

  const renderNotification = (notification, isUnread) => {
    const info = getAgentInfo(notification);
    return (
      <TouchableOpacity
        key={notification.id}
        onPress={() => handleNotificationPress(notification)}
        activeOpacity={0.7}
      >
        <Card style={[
          styles.notificationCard,
          isUnread && styles.unreadCard,
        ]}>
          <View style={styles.notificationRow}>
            <View style={[styles.iconCircle, { backgroundColor: info.color }]}>
              <Text style={styles.iconEmoji}>{info.emoji}</Text>
            </View>
            <View style={styles.notificationContent}>
              <View style={styles.titleRow}>
                <Text style={[styles.notificationTitle, isUnread && styles.unreadTitle]} numberOfLines={1}>
                  {notification.title}
                </Text>
                {isUnread && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notificationBody} numberOfLines={2}>
                {notification.body || notification.description || notification.message}
              </Text>
              <Text style={styles.notificationTime}>{formatTime(notification.createdAt)}</Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        variant="gray"
        title="NOTIFICATIONS"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.orange} style={{ padding: 40 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptyText}>
              No notifications yet. Your agents will notify you when something needs attention.
            </Text>
          </View>
        ) : (
          <>
            {/* Mark all as read */}
            {unread.length > 0 && (
              <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
                <Text style={styles.markAllText}>Mark all as read ({unread.length})</Text>
              </TouchableOpacity>
            )}

            {/* Unread */}
            {unread.length > 0 && (
              <>
                <SectionLabel>New</SectionLabel>
                {unread.map(n => renderNotification(n, true))}
              </>
            )}

            {/* Read */}
            {read.length > 0 && (
              <>
                <SectionLabel>Earlier</SectionLabel>
                {read.map(n => renderNotification(n, false))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
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
  markAllButton: {
    alignSelf: 'flex-end',
    marginBottom: SIZES.sm,
  },
  markAllText: {
    fontSize: SIZES.fontSm,
    color: COLORS.orange,
    fontWeight: '600',
  },
  notificationCard: {
    marginBottom: 2,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orange,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.sm + 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  iconEmoji: {
    fontSize: 16,
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '500',
    color: COLORS.black,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.orange,
  },
  notificationBody: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: SIZES.fontXs,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: SIZES.md,
  },
  emptyTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SIZES.sm,
  },
  emptyText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SIZES.xxl,
  },
});

export default NotificationsScreen;
