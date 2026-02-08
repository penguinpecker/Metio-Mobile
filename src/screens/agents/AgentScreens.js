import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, AGENTS } from '../../constants/theme';
import {
  Header,
  AgentCard,
  QuickAction,
  SectionLabel,
  MetricsRow,
  ToggleRow,
  Card,
  Button,
  Badge,
  AgentIcon,
} from '../../components';

// Agents List Screen
export const AgentsListScreen = ({ navigation }) => {
  const [filter, setFilter] = useState('all'); // all, active, paused

  const agentStatuses = ['active', 'active', 'active', 'paused', 'active'];

  const filteredAgents = AGENTS.filter((_, index) => {
    if (filter === 'all') return true;
    return agentStatuses[index] === filter;
  });

  return (
    <View style={styles.container}>
      <Header
        variant="gray"
        title={"MY\nAGENTS"}
        showAvatar={true}
        avatarText="JD"
        onAvatarPress={() => navigation.navigate('Settings')}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Actions */}
        <View style={styles.filterRow}>
          <QuickAction
            icon="✨"
            label="All"
            active={filter === 'all'}
            onPress={() => setFilter('all')}
            style={styles.filterAction}
          />
          <QuickAction
            icon="🟢"
            label="Active"
            active={filter === 'active'}
            onPress={() => setFilter('active')}
            style={styles.filterAction}
          />
          <QuickAction
            icon="⏸️"
            label="Paused"
            active={filter === 'paused'}
            onPress={() => setFilter('paused')}
            style={styles.filterAction}
          />
        </View>

        {/* Agents List */}
        {filteredAgents.map((agent, index) => (
          <AgentCard
            key={agent.id}
            emoji={agent.emoji}
            name={agent.name}
            description={agent.features.join(' • ')}
            status={agentStatuses[AGENTS.indexOf(agent)]}
            stats={[
              { value: '47', label: 'today' },
              { value: '98%', label: 'accuracy' },
            ]}
            onPress={() => navigation.navigate('AgentDetail', { agent, status: agentStatuses[AGENTS.indexOf(agent)] })}
          />
        ))}

        {filteredAgents.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🤖</Text>
            <Text style={styles.emptyTitle}>No {filter} agents</Text>
            <Text style={styles.emptyText}>
              {filter === 'paused' 
                ? "All your agents are running!" 
                : "Create your first agent to get started"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AgentSetup')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

// Agent Detail Screen
export const AgentDetailScreen = ({ route, navigation }) => {
  const { agent, status = 'active' } = route.params;
  const [features, setFeatures] = useState({
    feature1: true,
    feature2: true,
    notifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [gmailStatus, setGmailStatus] = useState(null);
  const [activities, setActivities] = useState([]);
  const [emailStats, setEmailStats] = useState({ total: 0, urgent: 0, action: 0 });

  const API_BASE_URL = 'https://metio-backend-production.up.railway.app/api/v1';

  useEffect(() => {
    fetchAgentData();
  }, []);

  const fetchAgentData = async () => {
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch Gmail status
      const gmailResponse = await fetch(`${API_BASE_URL}/gmail/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const gmailData = await gmailResponse.json();
      if (gmailData.success) {
        setGmailStatus(gmailData.data);
      }

      // Fetch activity
      const activityResponse = await fetch(`${API_BASE_URL}/activity?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activityData = await activityResponse.json();
      if (activityData.success && activityData.data) {
        setActivities(activityData.data);
      }

      // Fetch email digest for stats
      const digestResponse = await fetch(`${API_BASE_URL}/gmail/digest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const digestData = await digestResponse.json();
      if (digestData.success && digestData.data) {
        setEmailStats({
          total: digestData.data.totalEmails || digestData.data.summary?.total || 0,
          urgent: digestData.data.summary?.urgent || digestData.data.categories?.URGENT?.length || 0,
          action: digestData.data.summary?.action || digestData.data.categories?.ACTION?.length || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatActivityTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const metrics = [
    { value: emailStats.total.toString(), label: 'Processed' },
    { value: `${emailStats.urgent + emailStats.action}`, label: 'Need Action' },
    { value: '98%', label: 'Accuracy' },
  ];

  // Map agent type to feature screens
  const getFeatureScreens = () => {
    switch (agent.id) {
      case 'comm-manager':
        return ['EmailDigest', 'PriorityInbox'];
      case 'money-bot':
        return ['ExpenseTracker', 'BudgetStatus'];
      case 'life-planner':
        return ['SmartScheduling', 'MorningBriefing'];
      case 'social-pilot':
        return ['NewsBrief', 'MentionAlerts'];
      case 'home-command':
        return ['VoiceRoutines', 'AwayDetection'];
      default:
        return [null, null];
    }
  };

  const featureScreens = getFeatureScreens();

  const handleConnectGmail = async () => {
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      const response = await fetch(`${API_BASE_URL}/gmail/connect`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.data?.url) {
        Linking.openURL(data.data.url);
      }
    } catch (err) {
      console.error('Error connecting Gmail:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        variant="orange"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        statusText={status === 'active' ? 'Active' : 'Paused'}
        statusActive={status === 'active'}
      >
        <View style={styles.agentHeaderContent}>
          <AgentIcon emoji={agent.emoji} color={agent.color} size={48} />
          <Text style={styles.agentTitle}>{agent.name.split(' ').join('\n')}</Text>
        </View>
      </Header>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <MetricsRow metrics={metrics} />

        <SectionLabel>Features</SectionLabel>
        <Card>
          <TouchableOpacity 
            style={styles.featureRow}
            onPress={() => featureScreens[0] && navigation.navigate(featureScreens[0])}
          >
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>📋 {agent.features[0]}</Text>
              <Text style={styles.featureSubtitle}>Summary at 8 AM</Text>
            </View>
            <View style={styles.featureRight}>
              <Text style={styles.featureArrow}>→</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.featureRow, { borderBottomWidth: 0 }]}
            onPress={() => featureScreens[1] && navigation.navigate(featureScreens[1])}
          >
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>📥 {agent.features[1]}</Text>
              <Text style={styles.featureSubtitle}>Auto-sort incoming</Text>
            </View>
            <View style={styles.featureRight}>
              <Text style={styles.featureArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </Card>

        <ToggleRow
          title="🔔 Urgent Notifications"
          subtitle="Alert for high-priority items"
          value={features.notifications}
          onValueChange={(val) => setFeatures({ ...features, notifications: val })}
        />

        <SectionLabel>Recent Activity</SectionLabel>
        <Card>
          {loading ? (
            <Text style={styles.activityText}>Loading activity...</Text>
          ) : activities.length > 0 ? (
            activities.map((activity, index) => (
              <View key={activity.id || index} style={styles.activityItem}>
                <Text style={styles.activityBold}>{formatActivityTime(activity.createdAt)}</Text>
                <Text style={styles.activityText}> — {activity.description}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.activityText}>No recent activity. Start using the agent to see activity here.</Text>
          )}
        </Card>

        <SectionLabel>Connected Accounts</SectionLabel>
        {gmailStatus?.connected ? (
          <Card>
            <View style={styles.connectedAccount}>
              <Text style={styles.connectedEmoji}>📧</Text>
              <View style={styles.connectedInfo}>
                <Text style={styles.connectedName}>Gmail</Text>
                <Text style={styles.connectedEmail}>{gmailStatus.email}</Text>
              </View>
              <Badge text="Synced" variant="active" size="sm" />
            </View>
          </Card>
        ) : (
          <TouchableOpacity onPress={handleConnectGmail}>
            <Card>
              <View style={styles.connectedAccount}>
                <Text style={styles.connectedEmoji}>📧</Text>
                <View style={styles.connectedInfo}>
                  <Text style={styles.connectedName}>Gmail</Text>
                  <Text style={styles.connectedEmail}>Tap to connect</Text>
                </View>
                <Badge text="Connect" variant="warning" size="sm" />
              </View>
            </Card>
          </TouchableOpacity>
        )}

        <Button
          title="+ Add Another Account"
          variant="secondary"
          style={{ marginTop: SIZES.md }}
        />

        {/* Chat with Agent Button */}
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => navigation.navigate('AgentChat', { agent })}
        >
          <Text style={styles.chatButtonEmoji}>💬</Text>
          <View style={styles.chatButtonInfo}>
            <Text style={styles.chatButtonTitle}>Chat with {agent.name}</Text>
            <Text style={styles.chatButtonSubtitle}>Ask questions, get insights</Text>
          </View>
          <Text style={styles.chatButtonArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          title={status === 'active' ? '⏸️ Pause' : '▶️ Resume'}
          variant="secondary"
          style={{ flex: 0.4 }}
        />
        <Button
          title="View Activity →"
          variant="orange"
          style={{ flex: 0.6 }}
          onPress={() => navigation.navigate('Activity')}
        />
      </View>
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
  filterRow: {
    flexDirection: 'row',
    gap: SIZES.sm + 2,
    marginBottom: SIZES.lg,
  },
  filterAction: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: SIZES.lg,
    bottom: 100,
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
    fontSize: 28,
    color: COLORS.black,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SIZES.xxxl * 2,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SIZES.lg,
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
  },
  agentHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    marginTop: SIZES.sm,
  },
  agentTitle: {
    fontSize: SIZES.fontXxl,
    fontWeight: '900',
    color: COLORS.black,
    lineHeight: SIZES.fontXxl,
  },
  activityText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  activityItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  activityBold: {
    fontWeight: '700',
    color: COLORS.black,
  },
  connectedAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  connectedEmoji: {
    fontSize: 24,
  },
  connectedInfo: {
    flex: 1,
  },
  connectedName: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
  },
  connectedEmail: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textSecondary,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.black,
    padding: SIZES.lg,
    flexDirection: 'row',
    gap: SIZES.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textSecondary,
  },
  featureRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureArrow: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginLeft: SIZES.sm,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.orange,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginTop: SIZES.lg,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  chatButtonEmoji: {
    fontSize: 28,
    marginRight: SIZES.md,
  },
  chatButtonInfo: {
    flex: 1,
  },
  chatButtonTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.black,
  },
  chatButtonSubtitle: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.black,
    opacity: 0.7,
  },
  chatButtonArrow: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.black,
  },
});

export default { AgentsListScreen, AgentDetailScreen };
