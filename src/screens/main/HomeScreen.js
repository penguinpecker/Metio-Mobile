import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { agentsAPI } from '../../services/api';

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState({});

  const { user } = useAuth();
  const { agents, isLoading: agentsLoading, refetch: refetchAgents } = useAgents();
  const { stats, isLoading: statsLoading, refetch: refetchStats } = useStats();
  const { actions: pendingApprovals, approveAction, rejectAction, refetch: refetchActions } = usePendingActions();
  const { activities, refetch: refetchActivities } = useActivity();

  useEffect(() => {
    loadStatuses();
  }, []);

  // Reload statuses when screen comes back into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadStatuses);
    return unsubscribe;
  }, [navigation]);

  const loadStatuses = async () => {
    try {
      // Try real API first
      const response = await agentsAPI.getAll();
      if (response.success && response.data?.length > 0) {
        const statuses = {};
        response.data.forEach(a => {
          statuses[a.type || a.id] = a.status || 'active';
        });
        setAgentStatuses(statuses);
        await AsyncStorage.setItem('@metio_agent_statuses', JSON.stringify(statuses));
      } else {
        const saved = await AsyncStorage.getItem('@metio_agent_statuses');
        if (saved) setAgentStatuses(JSON.parse(saved));
      }
    } catch (err) {
      console.log('API unavailable, using local statuses:', err.message);
      try {
        const saved = await AsyncStorage.getItem('@metio_agent_statuses');
        if (saved) setAgentStatuses(JSON.parse(saved));
      } catch (storageErr) {
        console.error('Error loading statuses:', storageErr);
      }
    }
  };

  const getStatus = (agentId) => agentStatuses[agentId] || 'active';

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchAgents(), refetchStats(), refetchActions(), refetchActivities(), loadStatuses()]);
    setRefreshing(false);
  }, []);

  // Use backend agents if available, otherwise fallback to local AGENTS constant
  const displayAgents = (agents && agents.length > 0) 
    ? AGENTS.map(localAgent => {
        const backendAgent = agents.find(a => a.type === localAgent.id || a.id === localAgent.id);
        return {
          ...localAgent,
          backendId: backendAgent?.id,
          backendStatus: backendAgent?.status,
        };
      })
    : AGENTS;

  const activeCount = displayAgents.filter(a => {
    const status = a.backendStatus || getStatus(a.id);
    return status === 'active';
  }).length;

  const metrics = [
    { value: String(activeCount), label: 'Active Agents' },
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
        title={"COMMAND CENTER"}
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
        <View style={styles.agentGrid}>
          {displayAgents.map((agent) => {
            const status = agent.backendStatus || getStatus(agent.id);
            return (
              <AgentGridCard
                key={agent.id}
                emoji={agent.emoji}
                name={agent.name}
                status={status}
                onPress={() => navigation.navigate('AgentDetail', { agent, status })}
              />
            );
          })}
        </View>

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

        {/* Notifications Link */}
        <TouchableOpacity
          style={styles.notificationsLink}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.notificationsLinkEmoji}>🔔</Text>
          <Text style={styles.notificationsLinkText}>View All Notifications</Text>
          <Text style={styles.notificationsLinkArrow}>→</Text>
        </TouchableOpacity>

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
                  {{ COMM_MANAGER: '📧', MONEY_BOT: '💰', LIFE_PLANNER: '📅', NEWS_PILOT: '📰', PRICE_WATCHDOG: '🐕' }[activity.agent?.type] || '📊'}
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
    marginTop: -12,
  },
  contentContainer: {
    padding: SIZES.lg,
    paddingTop: SIZES.xl,
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
  notificationsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: SIZES.md,
    marginTop: SIZES.sm,
    marginBottom: SIZES.sm,
    gap: SIZES.sm,
  },
  notificationsLinkEmoji: {
    fontSize: 18,
  },
  notificationsLinkText: {
    flex: 1,
    fontSize: SIZES.fontMd,
    fontWeight: '500',
    color: COLORS.black,
  },
  notificationsLinkArrow: {
    fontSize: 18,
    color: COLORS.textSecondary,
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
