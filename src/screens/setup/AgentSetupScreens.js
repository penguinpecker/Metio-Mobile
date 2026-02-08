import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, AGENTS } from '../../constants/theme';
import {
  Header,
  Card,
  Button,
  AgentGridCard,
  ProgressSteps,
  IntegrationItem,
  ToggleRow,
  SectionLabel,
} from '../../components';

// Step 1: Select Agent Type
export const AgentSetupStep1 = ({ navigation }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);

  return (
    <View style={styles.container}>
      <Header
        variant="gray"
        title={"SELECT\nAGENT TYPE"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<Text style={styles.stepText}>STEP 1/4</Text>}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <ProgressSteps steps={4} current={1} />

        <View style={styles.agentGrid}>
          {AGENTS.map((agent) => (
            <AgentGridCard
              key={agent.id}
              emoji={agent.emoji}
              name={agent.name}
              description={agent.description.split(' & ')[0]}
              selected={selectedAgent === agent.id}
              onPress={() => setSelectedAgent(agent.id)}
              style={styles.gridCard}
            />
          ))}
          <AgentGridCard
            emoji="🛠️"
            name="CUSTOM"
            description="Build Your Own"
            selected={selectedAgent === 'custom'}
            onPress={() => setSelectedAgent('custom')}
            style={styles.gridCard}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <Button
          title="Next →"
          variant="primary"
          disabled={!selectedAgent}
          onPress={() => navigation.navigate('AgentSetupStep2', { 
            agent: AGENTS.find(a => a.id === selectedAgent) || AGENTS[0] 
          })}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};

// Step 2: Connect Services
export const AgentSetupStep2 = ({ route, navigation }) => {
  const { agent } = route.params;
  const [connected, setConnected] = useState([]);

  const services = [
    { id: 'gmail', icon: '📧', iconBg: '#EA4335', name: 'Gmail', desc: 'Connect your Google account' },
    { id: 'outlook', icon: '📬', iconBg: '#0078D4', name: 'Outlook', desc: 'Connect Microsoft account' },
    { id: 'imap', icon: '✉️', iconBg: COLORS.gray, name: 'Other Email (IMAP)', desc: 'Yahoo, ProtonMail, etc.' },
  ];

  const toggleConnect = (id) => {
    if (connected.includes(id)) {
      setConnected(connected.filter(c => c !== id));
    } else {
      setConnected([...connected, id]);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        variant="orange"
        title={"CONNECT\nSERVICES"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<Text style={styles.stepText}>STEP 2/4</Text>}
      />

      <ScrollView 
        style={styles.contentOrange}
        contentContainerStyle={styles.contentContainer}
      >
        <ProgressSteps steps={4} current={2} />

        <Text style={styles.stepDescription}>
          Connect your accounts to enable {agent.name} features.
        </Text>

        {services.map((service) => (
          <IntegrationItem
            key={service.id}
            icon={service.icon}
            iconBg={service.iconBg}
            name={service.name}
            status={connected.includes(service.id) ? '✓ Connected' : service.desc}
            connected={connected.includes(service.id)}
            onPress={() => toggleConnect(service.id)}
          />
        ))}

        {connected.length > 0 && (
          <Card variant="success" style={{ marginTop: SIZES.xl }}>
            <View style={styles.successRow}>
              <Text style={styles.successEmoji}>✅</Text>
              <View>
                <Text style={styles.successTitle}>{connected.length} Account(s) Connected!</Text>
                <Text style={styles.successSubtitle}>Ready for the next step</Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>

      <View style={styles.bottomActions}>
        <Button
          title="Skip for now"
          variant="ghost"
          onPress={() => navigation.navigate('AgentSetupStep3', { agent })}
          style={{ flex: 0.4 }}
          textStyle={{ color: COLORS.textSecondary }}
        />
        <Button
          title="Next →"
          variant="primary"
          onPress={() => navigation.navigate('AgentSetupStep3', { agent })}
          style={{ flex: 0.6 }}
        />
      </View>
    </View>
  );
};

// Step 3: Configure Features
export const AgentSetupStep3 = ({ route, navigation }) => {
  const { agent } = route.params;
  const [features, setFeatures] = useState({
    feature1: true,
    feature2: true,
  });
  const [digestTime, setDigestTime] = useState('8:00 AM');

  return (
    <View style={styles.container}>
      <Header
        variant="gray"
        title={"CONFIGURE\nFEATURES"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<Text style={styles.stepText}>STEP 3/4</Text>}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <ProgressSteps steps={4} current={3} />

        <Text style={styles.stepDescription}>
          Choose which features to enable for your agent.
        </Text>

        <Card>
          <ToggleRow
            title={`📋 ${agent.features[0]}`}
            subtitle="Get summaries at scheduled times"
            value={features.feature1}
            onValueChange={(val) => setFeatures({ ...features, feature1: val })}
          />
          <ToggleRow
            title={`📥 ${agent.features[1]}`}
            subtitle="Automatic sorting and prioritization"
            value={features.feature2}
            onValueChange={(val) => setFeatures({ ...features, feature2: val })}
            style={{ borderBottomWidth: 0 }}
          />
        </Card>

        <SectionLabel>Schedule</SectionLabel>
        <Card onPress={() => {}}>
          <View style={styles.scheduleRow}>
            <Text style={styles.scheduleLabel}>⏰ Send digest at</Text>
            <View style={styles.scheduleValue}>
              <Text style={styles.scheduleTime}>{digestTime}</Text>
            </View>
          </View>
        </Card>

        <SectionLabel>Notifications</SectionLabel>
        <Card>
          <ToggleRow
            title="🔔 Urgent Alerts"
            subtitle="Get notified for high-priority items"
            value={true}
            onValueChange={() => {}}
            style={{ borderBottomWidth: 0 }}
          />
        </Card>
      </ScrollView>

      <View style={styles.bottomActions}>
        <Button
          title="Deploy Agent →"
          variant="orange"
          onPress={() => navigation.navigate('AgentSetupStep4', { agent })}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};

// Step 4: Deploy Success
export const AgentSetupStep4 = ({ route, navigation }) => {
  const { agent } = route.params;

  return (
    <View style={styles.successContainer}>
      <ProgressSteps steps={4} current={4} style={{ marginTop: 60 }} />

      <View style={styles.successContent}>
        <View style={styles.successIcon}>
          <Text style={styles.successCheck}>✓</Text>
        </View>

        <Text style={styles.successTitle2}>AGENT{'\n'}DEPLOYED!</Text>

        <View style={styles.agentBadge}>
          <Text style={styles.agentBadgeEmoji}>{agent.emoji}</Text>
          <View>
            <Text style={styles.agentBadgeName}>{agent.name}</Text>
            <Text style={styles.agentBadgeStatus}>Now monitoring your data</Text>
          </View>
        </View>
      </View>

      <View style={styles.successActions}>
        <Button
          title="View Agent →"
          variant="primary"
          onPress={() => navigation.navigate('AgentDetail', { agent, status: 'active' })}
          style={{ marginBottom: SIZES.md }}
        />
        <Button
          title="Create Another"
          variant="ghost"
          onPress={() => navigation.navigate('AgentSetupStep1')}
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
  contentOrange: {
    flex: 1,
    backgroundColor: COLORS.gray,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    marginTop: -20,
  },
  contentContainer: {
    padding: SIZES.lg,
    paddingBottom: 120,
  },
  stepText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.black,
  },
  stepDescription: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xl,
    lineHeight: 22,
  },
  agentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm + 2,
  },
  gridCard: {
    width: '48%',
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
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  successEmoji: {
    fontSize: 28,
  },
  successTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
  },
  successSubtitle: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textSecondary,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleLabel: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
  },
  scheduleValue: {
    backgroundColor: COLORS.orange,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusSm,
  },
  scheduleTime: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
  },
  // Success Screen
  successContainer: {
    flex: 1,
    backgroundColor: COLORS.orange,
    padding: SIZES.xxl,
  },
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.white,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.xxl,
  },
  successCheck: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.black,
  },
  successTitle2: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SIZES.xxl,
    lineHeight: 38,
  },
  agentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: SIZES.lg,
    paddingHorizontal: SIZES.xxl,
    borderRadius: SIZES.radiusLg,
  },
  agentBadgeEmoji: {
    fontSize: 36,
  },
  agentBadgeName: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.black,
  },
  agentBadgeStatus: {
    fontSize: SIZES.fontSm,
    color: COLORS.black,
    opacity: 0.7,
  },
  successActions: {
    paddingBottom: SIZES.xxl,
  },
});

export default {
  AgentSetupStep1,
  AgentSetupStep2,
  AgentSetupStep3,
  AgentSetupStep4,
};
