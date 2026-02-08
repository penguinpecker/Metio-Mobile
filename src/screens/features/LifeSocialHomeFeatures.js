import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { Header, Card, Badge, Button, SectionLabel, ToggleRow, AlertBanner } from '../../components';

// ============== LIFE PLANNER FEATURES ==============

// Smart Scheduling Screen
export const SmartSchedulingScreen = ({ navigation }) => {
  const [selectedSlot, setSelectedSlot] = useState(1);

  const timeSlots = [
    { id: 1, time: '2:00 PM - 2:30 PM', day: 'Today', match: 95, badge: 'Best Match' },
    { id: 2, time: '4:30 PM - 5:00 PM', day: 'Today', match: 82 },
    { id: 3, time: '10:00 AM - 10:30 AM', day: 'Tomorrow', match: 78 },
  ];

  return (
    <View style={styles.container}>
      <Header
        variant="orange"
        title={"SMART\nSCHEDULE"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<Badge text="AI Suggested" variant="ai" />}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Command Card */}
        <Card variant="lavender">
          <Text style={styles.commandLabel}>Your Command</Text>
          <Text style={styles.commandText}>"Schedule a 30-min call with Sarah this week"</Text>
        </Card>

        <SectionLabel>Available Time Slots</SectionLabel>
        {timeSlots.map((slot) => (
          <Card
            key={slot.id}
            variant={selectedSlot === slot.id ? 'selected' : 'default'}
            onPress={() => setSelectedSlot(slot.id)}
          >
            <View style={styles.slotRow}>
              <View style={styles.slotInfo}>
                <View style={styles.slotHeader}>
                  <Text style={[styles.slotTime, selectedSlot === slot.id && { color: COLORS.black }]}>
                    {slot.time}
                  </Text>
                  {slot.badge && <Badge text={slot.badge} variant="ai" size="sm" />}
                </View>
                <Text style={[styles.slotDay, selectedSlot === slot.id && { color: COLORS.black, opacity: 0.8 }]}>
                  {slot.day}
                </Text>
              </View>
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{slot.match}%</Text>
                <Text style={styles.matchLabel}>match</Text>
              </View>
            </View>
          </Card>
        ))}

        <SectionLabel>Conflicts Check</SectionLabel>
        <Card variant="success">
          <View style={styles.conflictRow}>
            <Text style={styles.conflictEmoji}>✅</Text>
            <Text style={styles.conflictText}>No conflicts with your calendar</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.noteLabel}>📝 Note</Text>
          <Text style={styles.noteText}>Sarah's availability was checked via Calendly. Both of you are free at the suggested times.</Text>
        </Card>
      </ScrollView>

      <View style={styles.bottomActions}>
        <Button
          title="Send Calendar Invite →"
          variant="primary"
          onPress={() => {}}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};

// Morning Briefing Screen
export const MorningBriefingScreen = ({ navigation }) => {
  const events = [
    { id: 1, time: '9:00', title: 'Team Standup', location: 'Zoom', duration: '15 min', color: COLORS.orange },
    { id: 2, time: '11:00', title: 'Product Review', location: 'Conf Room B', duration: '1 hour', color: COLORS.info },
    { id: 3, time: '2:30', title: '1:1 with Mike', location: 'Google Meet', duration: '30 min', color: COLORS.lavender },
    { id: 4, time: '4:00', title: '🦷 Dentist', location: 'Dr. Smith Dental', duration: '1 hour', color: COLORS.error },
  ];

  const tasks = [
    { id: 1, title: 'Submit expense report', done: false },
    { id: 2, title: 'Review Q1 contract', done: false },
    { id: 3, title: 'Call mom', done: true },
  ];

  return (
    <View style={styles.container}>
      <Header
        variant="orange"
        title={"GOOD\nMORNING"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<Badge text="7:00 AM" variant="ai" />}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Weather Card */}
        <Card style={styles.weatherCard}>
          <View style={styles.weatherContent}>
            <Text style={styles.weatherEmoji}>☀️</Text>
            <View>
              <Text style={styles.weatherTemp}>72°F</Text>
              <Text style={styles.weatherDesc}>Sunny • High 78°</Text>
            </View>
          </View>
        </Card>

        <SectionLabel>📅 Today ({events.length} events)</SectionLabel>
        {events.map((event) => (
          <Card key={event.id}>
            <View style={styles.eventRow}>
              <View style={[styles.eventTime, { backgroundColor: event.color }]}>
                <Text style={styles.eventTimeText}>{event.time}</Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventLocation}>{event.location} • {event.duration}</Text>
              </View>
            </View>
          </Card>
        ))}

        <SectionLabel>✅ Tasks Due Today</SectionLabel>
        {tasks.map((task) => (
          <Card key={task.id}>
            <View style={styles.taskRow}>
              <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
                {task.done && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.taskTitle, task.done && styles.taskDone]}>{task.title}</Text>
            </View>
          </Card>
        ))}

        <SectionLabel>📊 Quick Stats</SectionLabel>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>47</Text>
            <Text style={styles.statLabel}>Emails</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>$142</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

// ============== SOCIAL PILOT FEATURES ==============

// News Brief Screen
export const NewsBriefScreen = ({ navigation }) => {
  const [activeCategory, setActiveCategory] = useState('tech');

  const categories = ['Tech', 'Finance', 'Crypto', 'AI'];

  const news = [
    {
      id: 1,
      category: 'TECHCRUNCH',
      time: '2H AGO',
      title: 'OpenAI Launches GPT-5 with Real-Time Learning',
      summary: 'OpenAI unveiled GPT-5 featuring breakthrough real-time learning capabilities. CEO called it "most significant leap since GPT-4."',
      gradient: [COLORS.orange, '#FF8C42'],
      emoji: '🤖',
    },
    {
      id: 2,
      category: 'BLOOMBERG',
      time: '4H AGO',
      title: 'Fed Signals Rate Cuts Coming in Q2 2025',
      summary: 'Federal Reserve indicated rate cuts likely by mid-2025 as inflation cools. Markets rallied 2.3% on the news.',
      gradient: [COLORS.info, COLORS.lavender],
      emoji: '💰',
    },
    {
      id: 3,
      category: 'THE VERGE',
      time: '5H AGO',
      title: 'Apple Vision Pro 2 Leaks Reveal 50% Lighter Design',
      summary: 'Leaked schematics show Apple\'s next headset significantly lighter with improved battery life and new gesture controls.',
      gradient: [COLORS.success, '#16A34A'],
      emoji: '🚀',
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        variant="orange"
        title={"NEWS\nBRIEF"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<Badge text="9:00 AM" variant="ai" />}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryTab, index === 0 && styles.categoryTabActive]}
            >
              <Text style={[styles.categoryTabText, index === 0 && styles.categoryTabTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* News Cards */}
        {news.map((item) => (
          <Card key={item.id} style={styles.newsCard}>
            <View style={[styles.newsImage, { backgroundColor: item.gradient[0] }]}>
              <Text style={styles.newsEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.newsContent}>
              <Text style={styles.newsMeta}>{item.category} • {item.time}</Text>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsSummary}>{item.summary}</Text>
            </View>
          </Card>
        ))}

        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreButtonText}>↓ 7 more headlines</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Mention Alerts Screen
export const MentionAlertsScreen = ({ navigation }) => {
  const mentions = [
    {
      id: 1,
      platform: 'Twitter',
      platformEmoji: '🐦',
      user: '@techcrunch',
      followers: '12.4M',
      text: 'Excited to see @johndoe\'s new AI project launch! This is going to change how we think about automation.',
      time: '2h ago',
      engagement: '+45%',
    },
    {
      id: 2,
      platform: 'LinkedIn',
      platformEmoji: '💼',
      user: 'Sarah Chen',
      followers: '8.2K',
      text: 'Just had an amazing meeting with John Doe about our Q1 partnership. Can\'t wait to share more!',
      time: '4h ago',
      engagement: '+23%',
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        variant="orange"
        title={"MENTION\nALERTS"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        statusText="Live"
        statusActive={true}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <AlertBanner
          emoji="🎉"
          title="3 new mentions today"
          description="Engagement up 45% compared to last week"
          variant="success"
        />

        <SectionLabel>Recent Mentions</SectionLabel>
        {mentions.map((mention) => (
          <Card key={mention.id}>
            <View style={styles.mentionHeader}>
              <Text style={styles.mentionEmoji}>{mention.platformEmoji}</Text>
              <View style={styles.mentionInfo}>
                <Text style={styles.mentionUser}>{mention.user}</Text>
                <Text style={styles.mentionFollowers}>{mention.followers} followers</Text>
              </View>
              <Text style={styles.mentionTime}>{mention.time}</Text>
            </View>
            <Text style={styles.mentionText}>{mention.text}</Text>
            
            <View style={styles.aiReplyBox}>
              <View style={styles.aiReplyHeader}>
                <Text style={styles.aiReplyLabel}>🤖 AI Suggested Reply</Text>
              </View>
              <Text style={styles.aiReplyText}>
                "Thanks for the shoutout! Excited to share more details soon. 🚀"
              </Text>
              <View style={styles.aiReplyActions}>
                <TouchableOpacity style={styles.aiReplyBtn}>
                  <Text style={styles.aiReplyBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.aiReplyBtn, styles.aiReplyBtnPrimary]}>
                  <Text style={[styles.aiReplyBtnText, { color: COLORS.white }]}>Send Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

// ============== HOME COMMAND FEATURES ==============

// Voice Routines Screen
export const VoiceRoutinesScreen = ({ navigation }) => {
  const routines = [
    {
      id: 1,
      name: 'GOODNIGHT',
      emoji: '🌙',
      trigger: '"Hey Metio, goodnight"',
      actions: ['🔒 Lock doors', '💡 Lights off', '🚨 Arm alarm', '🌡️ Set to 68°'],
      active: true,
    },
    {
      id: 2,
      name: 'GOOD MORNING',
      emoji: '☀️',
      trigger: '"Hey Metio, good morning"',
      actions: ['☕ Start coffee', '💡 Lights on', '📰 Play news'],
      active: true,
    },
    {
      id: 3,
      name: 'MOVIE TIME',
      emoji: '🎬',
      trigger: '"Hey Metio, movie time"',
      actions: ['💡 Dim lights', '📺 Turn on TV', '🔇 Do not disturb'],
      active: false,
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        variant="orange"
        title={"VOICE\nROUTINES"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        statusText="Listening"
        statusActive={true}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Voice Prompt */}
        <Card variant="lavender" style={styles.voicePrompt}>
          <Text style={styles.voicePromptEmoji}>🎤</Text>
          <Text style={styles.voicePromptText}>Say a command to trigger a routine</Text>
        </Card>

        <SectionLabel>Your Routines</SectionLabel>
        {routines.map((routine) => (
          <Card 
            key={routine.id} 
            variant={routine.active ? 'selected' : 'default'}
            onPress={() => {}}
          >
            <View style={styles.routineHeader}>
              <Text style={styles.routineEmoji}>{routine.emoji}</Text>
              <Text style={styles.routineName}>{routine.name}</Text>
              <Badge 
                text={routine.active ? 'Active' : 'Inactive'} 
                variant={routine.active ? 'active' : 'fyi'} 
                size="sm" 
              />
            </View>
            <Text style={styles.routineTrigger}>{routine.trigger}</Text>
            <View style={styles.routineActions}>
              {routine.actions.map((action, index) => (
                <View key={index} style={styles.actionChip}>
                  <Text style={styles.actionChipText}>{action}</Text>
                </View>
              ))}
            </View>
          </Card>
        ))}

        <Button
          title="+ Create New Routine"
          variant="secondary"
          style={{ marginTop: SIZES.md }}
        />
      </ScrollView>
    </View>
  );
};

// Away Detection Screen
export const AwayDetectionScreen = ({ navigation }) => {
  const [awayMode, setAwayMode] = useState(true);

  const devices = [
    { id: 1, name: 'Thermostat', emoji: '🌡️', status: 'Set to Eco (65°)', active: true },
    { id: 2, name: 'Lights', emoji: '💡', status: 'All off', active: true },
    { id: 3, name: 'Cameras', emoji: '📹', status: 'Recording', active: true },
    { id: 4, name: 'Locks', emoji: '🔒', status: 'All locked', active: true },
  ];

  return (
    <View style={styles.container}>
      <Header
        variant="orange"
        title={"AWAY\nDETECTION"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        statusText="Away Mode"
        statusActive={awayMode}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Status Card */}
        <Card variant={awayMode ? 'selected' : 'default'}>
          <View style={styles.awayHeader}>
            <View>
              <Text style={styles.awayStatus}>{awayMode ? 'Away Mode Active' : 'Home Mode'}</Text>
              <Text style={styles.awayTime}>Left home 2 hours ago</Text>
            </View>
            <View style={[styles.awayIndicator, awayMode && styles.awayIndicatorActive]} />
          </View>
        </Card>

        {awayMode && (
          <AlertBanner
            emoji="✅"
            title="Auto-adjustments applied"
            description="Thermostat, lights, and cameras have been configured for away mode."
            variant="success"
          />
        )}

        <SectionLabel>Devices</SectionLabel>
        <View style={styles.deviceGrid}>
          {devices.map((device) => (
            <Card key={device.id} style={styles.deviceCard}>
              <Text style={styles.deviceEmoji}>{device.emoji}</Text>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceStatus}>{device.status}</Text>
              <View style={[styles.deviceDot, device.active && styles.deviceDotActive]} />
            </Card>
          ))}
        </View>

        <SectionLabel>Settings</SectionLabel>
        <Card>
          <ToggleRow
            title="Auto Away Detection"
            subtitle="Detect when you leave home (100m radius)"
            value={true}
            onValueChange={() => {}}
          />
          <ToggleRow
            title="Auto Eco Mode"
            subtitle="Adjust thermostat when away"
            value={true}
            onValueChange={() => {}}
          />
          <ToggleRow
            title="Camera Recording"
            subtitle="Start recording when away"
            value={true}
            onValueChange={() => {}}
            style={{ borderBottomWidth: 0 }}
          />
        </Card>
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
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.black,
    padding: SIZES.lg,
  },
  // Command styles
  commandLabel: {
    fontSize: SIZES.fontXs,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  commandText: {
    fontSize: SIZES.fontLg,
    color: COLORS.white,
    fontStyle: 'italic',
  },
  // Slot styles
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotInfo: {
    flex: 1,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  slotTime: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: COLORS.black,
  },
  slotDay: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  matchBadge: {
    alignItems: 'center',
  },
  matchText: {
    fontSize: SIZES.fontXl,
    fontWeight: '900',
    color: COLORS.success,
  },
  matchLabel: {
    fontSize: SIZES.fontXs,
    color: COLORS.textSecondary,
  },
  conflictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  conflictEmoji: {
    fontSize: 20,
  },
  conflictText: {
    fontSize: SIZES.fontMd,
    color: COLORS.black,
    fontWeight: '500',
  },
  noteLabel: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  noteText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // Weather styles
  weatherCard: {
    alignItems: 'center',
    paddingVertical: SIZES.lg,
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  weatherEmoji: {
    fontSize: 48,
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.black,
  },
  weatherDesc: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  // Event styles
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  eventTime: {
    width: 50,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusSm,
    alignItems: 'center',
  },
  eventTimeText: {
    fontSize: SIZES.fontSm,
    fontWeight: '700',
    color: COLORS.white,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
  },
  eventLocation: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textSecondary,
  },
  // Task styles
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  taskTitle: {
    flex: 1,
    fontSize: SIZES.fontMd,
    color: COLORS.black,
  },
  taskDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  // Stats styles
  statsRow: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SIZES.md,
  },
  statValue: {
    fontSize: SIZES.fontXl,
    fontWeight: '900',
    color: COLORS.black,
  },
  statLabel: {
    fontSize: SIZES.fontXs,
    color: COLORS.textSecondary,
  },
  // Category tabs
  categoryScroll: {
    marginBottom: SIZES.lg,
    marginHorizontal: -SIZES.lg,
    paddingHorizontal: SIZES.lg,
  },
  categoryTab: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: SIZES.radiusFull,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md + 2,
    marginRight: SIZES.sm,
  },
  categoryTabActive: {
    backgroundColor: COLORS.black,
  },
  categoryTabText: {
    fontSize: SIZES.fontSm,
    color: COLORS.black,
  },
  categoryTabTextActive: {
    color: COLORS.white,
  },
  // News styles
  newsCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: SIZES.md,
  },
  newsImage: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsEmoji: {
    fontSize: 32,
  },
  newsContent: {
    padding: SIZES.md,
  },
  newsMeta: {
    fontSize: SIZES.fontXs - 1,
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  newsTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 6,
  },
  newsSummary: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  moreButton: {
    alignItems: 'center',
    paddingVertical: SIZES.md,
  },
  moreButtonText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textTertiary,
  },
  // Mention styles
  mentionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  mentionEmoji: {
    fontSize: 24,
  },
  mentionInfo: {
    flex: 1,
  },
  mentionUser: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
  },
  mentionFollowers: {
    fontSize: SIZES.fontXs,
    color: COLORS.textSecondary,
  },
  mentionTime: {
    fontSize: SIZES.fontXs,
    color: COLORS.textTertiary,
  },
  mentionText: {
    fontSize: SIZES.fontMd,
    color: COLORS.black,
    lineHeight: 22,
    marginBottom: SIZES.md,
  },
  aiReplyBox: {
    backgroundColor: COLORS.lavender + '20',
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
  },
  aiReplyHeader: {
    marginBottom: SIZES.sm,
  },
  aiReplyLabel: {
    fontSize: SIZES.fontXs,
    fontWeight: '600',
    color: COLORS.lavender,
  },
  aiReplyText: {
    fontSize: SIZES.fontSm,
    color: COLORS.black,
    fontStyle: 'italic',
    marginBottom: SIZES.md,
  },
  aiReplyActions: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  aiReplyBtn: {
    flex: 1,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: COLORS.black,
    alignItems: 'center',
  },
  aiReplyBtnPrimary: {
    backgroundColor: COLORS.black,
  },
  aiReplyBtnText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.black,
  },
  // Routine styles
  voicePrompt: {
    alignItems: 'center',
    paddingVertical: SIZES.xxl,
  },
  voicePromptEmoji: {
    fontSize: 40,
    marginBottom: SIZES.sm,
  },
  voicePromptText: {
    fontSize: SIZES.fontMd,
    color: COLORS.white,
  },
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: 4,
  },
  routineEmoji: {
    fontSize: 24,
  },
  routineName: {
    flex: 1,
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.black,
  },
  routineTrigger: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
  },
  routineActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionChip: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  actionChipText: {
    fontSize: SIZES.fontXs,
    color: COLORS.black,
  },
  // Away detection styles
  awayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  awayStatus: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.black,
  },
  awayTime: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  awayIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.textTertiary,
  },
  awayIndicatorActive: {
    backgroundColor: COLORS.success,
  },
  deviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  deviceCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SIZES.lg,
    position: 'relative',
  },
  deviceEmoji: {
    fontSize: 32,
    marginBottom: SIZES.sm,
  },
  deviceName: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
  },
  deviceStatus: {
    fontSize: SIZES.fontXs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  deviceDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textTertiary,
  },
  deviceDotActive: {
    backgroundColor: COLORS.success,
  },
});

export default {
  SmartSchedulingScreen,
  MorningBriefingScreen,
  NewsBriefScreen,
  MentionAlertsScreen,
  VoiceRoutinesScreen,
  AwayDetectionScreen,
};
