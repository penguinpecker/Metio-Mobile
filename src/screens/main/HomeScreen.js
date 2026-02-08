import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, AGENTS } from '../../constants/theme';
import {
  Header,
  Card,
  Badge,
  MetricsRow,
  AgentGridCard,
  NotificationCard,
  SectionLabel,
} from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useAgents, useStats, usePendingActions, useActivity } from '../../hooks/useData';

const AGENT_EMOJIS = {
  COMM_MANAGER: '📧',
  MONEY_BOT: '💰',
  LIFE_PLANNER: '📅',
  SOCIAL_PILOT: '📱',
  HOME_COMMAND: '🏠',
};

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();
  const { agents, isLoading: agentsLoading, refetch: refetchAgents } = useAgents();
  const { stats, isLoading: statsLoading, refetch: refetchStats } = useStats();
  const { actions: pendingApprovals, approveAction, rejectAction, refetch: refetchActions } = usePendingActions();
  const { activities, refetch: refetchActivities } = useActivity();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchAgents(), refetchStats(), refetchActions(), refetchActivities()]);
    setRefreshing(false);
  }, []);

  const metrics = [
    { value: String(stats.activeAgents || 0), label: 'Active Agents' },
    { value: String(stats.tasksToday || 0), label: 'Tasks Today' },
    { value: String(stats.pendingApprovals || 0), label: 'Pending' },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <Header
        variant="orange"
        title={"COMMAND\nCENTER"}
        statusText="System Active"
        statusActive={true}
        showAvatar={true}
        avatarText={getInitials(user?.name)}
        onAvatarPress={() => navigation.navigate('Settings')}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Metrics */}
        <MetricsRow metrics={metrics} />

        {/* Agents Grid */}
        <SectionLabel>🤖 Your Agents</SectionLabel>
        {agentsLoading ? (
          <ActivityIndicator color={COLORS.orange} style={{ padding: 20 }} />
        ) : (
          <View style={styles.agentGrid}>
            {agents.slice(0, 4).map((agent) => (
              <AgentGridCard
                key={agent.id}
                emoji={AGENT_EMOJIS[agent.type] || '🤖'}
                name={agent.name}
                status={agent.status === 'ACTIVE' ? 'active' : 'paused'}
                onPress={() => navigation.navigate('AgentDetail', { agentId: agent.id })}
              />
            ))}
          </View>
        )}

        {/* Pending Approvals */}
        <SectionLabel>⏳ Pending Approvals ({pendingApprovals.length})</SectionLabel>
        {pendingApprovals.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No pending approvals ✓</Text>
          </Card>
        ) : (
          pendingApprovals.map((action) => (
            <NotificationCard
              key={action.id}
              emoji={action.agentEmoji || '🤖'}
              iconColor={COLORS.orange}
              title={action.title}
              body={action.description || 'Requires your approval'}
              agent={action.type}
              variant="highlighted"
              actions={[
                { label: 'Approve', primary: true, onPress: () => approveAction(action.id) },
                { label: 'View', onPress: () => navigation.navigate('DraftApproval', { action }) },
                { label: 'Reject', onPress: () => rejectAction(action.id) },
              ]}
            />
          ))
        )}

        {/* Recent Activity */}
        <SectionLabel>📊 Recent Activity</SectionLabel>
        {activities.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No recent activity</Text>
          </Card>
        ) : (
          activities.slice(0, 3).map((activity, index) => (
            <Card key={activity.id || index}>
              <View style={styles.activityItem}>
                <Text style={styles.activityEmoji}>
                  {AGENT_EMOJIS[activity.agent?.type] || '📊'}
                </Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.action}</Text>
                  <Text style={styles.activityTime}>{activity.description}</Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: 100 + insets.bottom }]}
        onPress={() => setShowVoiceModal(true)}
      >
        <Text style={styles.fabIcon}>🎤</Text>
      </TouchableOpacity>

      {/* Voice Modal */}
      <Modal
        visible={showVoiceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVoiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            onPress={() => setShowVoiceModal(false)}
          />
          <View style={styles.voiceModal}>
            <View style={styles.modalHandle} />
            <View style={styles.voiceWave}>
              <Text style={styles.voiceEmoji}>🎤</Text>
            </View>
            <Text style={styles.voiceText}>Listening...</Text>
            <Text style={styles.voiceHint}>"Hey Metio, summarize my emails"</Text>
            
            <View style={styles.voiceSuggestions}>
              <Text style={styles.suggestLabel}>Try saying:</Text>
              <View style={styles.chips}>
                <View style={styles.chip}><Text style={styles.chipText}>📧 "Check my inbox"</Text></View>
                <View style={styles.chip}><Text style={styles.chipText}>💰 "How much did I spend?"</Text></View>
                <View style={styles.chip}><Text style={styles.chipText}>📅 "What's on my calendar?"</Text></View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowVoiceModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  agentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm + 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  activityEmoji: {
    fontSize: 24,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
  },
  activityTime: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SIZES.md,
  },
  fab: {
    position: 'absolute',
    right: SIZES.lg,
    width: 56,
    height: 56,
    backgroundColor: COLORS.orange,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  voiceModal: {
    backgroundColor: COLORS.black,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    padding: SIZES.xxl,
    paddingBottom: 48,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    marginBottom: SIZES.xxl,
  },
  voiceWave: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.orange,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.xxl,
  },
  voiceEmoji: {
    fontSize: 48,
  },
  voiceText: {
    fontSize: SIZES.fontXl,
    color: COLORS.white,
    marginBottom: SIZES.sm,
  },
  voiceHint: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xxl,
  },
  voiceSuggestions: {
    width: '100%',
    marginBottom: SIZES.xxl,
  },
  suggestLabel: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SIZES.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  chip: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: SIZES.radiusFull,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md + 2,
  },
  chipText: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.white,
  },
  cancelButton: {
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.xxxl,
  },
  cancelText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});

export default HomeScreen;
