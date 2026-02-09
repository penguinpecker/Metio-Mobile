import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { Header, Card, Badge, Button, SectionLabel, ToggleRow, AlertBanner } from '../../components';
import { newsAPI } from '../../services/api';

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
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const categories = [
    { id: 'all', name: 'All', emoji: '📰' },
    { id: 'tech', name: 'Tech', emoji: '🚀' },
    { id: 'ai', name: 'AI', emoji: '🤖' },
    { id: 'finance', name: 'Finance', emoji: '💰' },
    { id: 'science', name: 'Science', emoji: '🔬' },
  ];

  const colorMap = {
    AI: [COLORS.orange, '#FF8C42'],
    Tech: [COLORS.info, COLORS.lavender],
    Finance: [COLORS.success, '#16A34A'],
    Science: ['#8B5CF6', '#A78BFA'],
    Business: [COLORS.black, '#374151'],
    General: [COLORS.textSecondary, '#6B7280'],
  };

  const fetchNews = async (category) => {
    try {
      setError(null);
      const response = await newsAPI.getBrief(category, 10);
      if (response.success && response.data) {
        setArticles(response.data.articles || []);
      } else {
        setError(response.error?.message || 'Failed to load news');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews(activeCategory);
  }, [activeCategory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setAiSummary(null);
    fetchNews(activeCategory);
  }, [activeCategory]);

  const handleCategoryPress = (catId) => {
    if (catId !== activeCategory) {
      setActiveCategory(catId);
      setLoading(true);
      setAiSummary(null);
    }
  };

  const fetchAISummary = async () => {
    if (!articles.length) return;
    setLoadingSummary(true);
    try {
      const response = await newsAPI.getAISummary(articles.slice(0, 5));
      if (response.success && response.data) {
        setAiSummary(response.data);
      }
    } catch (err) {
      console.error('Error fetching AI summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const openArticle = (url) => {
    if (url) Linking.openURL(url);
  };

  const now = new Date();
  const briefTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <View style={styles.container}>
      <Header
        variant="orange"
        title={"NEWS\nBRIEF"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<Badge text={briefTime} variant="ai" />}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.orange} />
        }
      >
        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryTab, activeCategory === cat.id && styles.categoryTabActive]}
              onPress={() => handleCategoryPress(cat.id)}
            >
              <Text style={[styles.categoryTabText, activeCategory === cat.id && styles.categoryTabTextActive]}>
                {cat.emoji} {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* AI Summary */}
        {aiSummary ? (
          <Card style={{ backgroundColor: '#FFF8F0', borderWidth: 2, borderColor: COLORS.orange, marginBottom: SIZES.md }}>
            <Text style={{ fontSize: SIZES.fontSm, fontWeight: '700', color: COLORS.black, marginBottom: 6 }}>✨ AI Brief</Text>
            <Text style={{ fontSize: SIZES.fontMd, color: COLORS.black, lineHeight: 22, marginBottom: 8 }}>{aiSummary.summary}</Text>
            {aiSummary.keyTakeaways?.length > 0 && aiSummary.keyTakeaways.map((t, i) => (
              <Text key={i} style={{ fontSize: SIZES.fontSm, color: COLORS.textSecondary, marginBottom: 2 }}>• {t}</Text>
            ))}
            {aiSummary.sentiment && (
              <Text style={{ fontSize: SIZES.fontXs, color: COLORS.orange, fontWeight: '600', marginTop: 6 }}>
                Sentiment: {aiSummary.sentiment.toUpperCase()}
              </Text>
            )}
          </Card>
        ) : articles.length > 0 && (
          <TouchableOpacity
            style={{ backgroundColor: COLORS.white, borderRadius: SIZES.radiusMd, padding: SIZES.md, marginBottom: SIZES.md, alignItems: 'center', borderWidth: 2, borderColor: COLORS.orange }}
            onPress={fetchAISummary}
            disabled={loadingSummary}
          >
            {loadingSummary ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator color={COLORS.black} size="small" />
                <Text style={{ fontSize: SIZES.fontSm, fontWeight: '600', color: COLORS.black }}>Generating AI summary...</Text>
              </View>
            ) : (
              <Text style={{ fontSize: SIZES.fontSm, fontWeight: '600', color: COLORS.black }}>✨ Generate AI Summary</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Loading State */}
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color={COLORS.orange} />
            <Text style={{ fontSize: SIZES.fontSm, color: COLORS.textSecondary, marginTop: 12 }}>Fetching latest news...</Text>
          </View>
        ) : error ? (
          <Card>
            <Text style={{ fontSize: SIZES.fontMd, color: COLORS.error, textAlign: 'center', marginBottom: 12 }}>{error}</Text>
            <Button title="Retry" onPress={() => { setLoading(true); fetchNews(activeCategory); }} />
          </Card>
        ) : articles.length === 0 ? (
          <Card>
            <Text style={{ fontSize: SIZES.fontMd, color: COLORS.textSecondary, textAlign: 'center' }}>No articles found for this category.</Text>
          </Card>
        ) : (
          <>
            {/* News Cards */}
            {articles.map((item) => {
              const colors = colorMap[item.category] || colorMap.General;
              return (
                <TouchableOpacity key={item.id} onPress={() => openArticle(item.url)} activeOpacity={0.7}>
                  <Card style={styles.newsCard}>
                    <View style={[styles.newsImage, { backgroundColor: colors[0] }]}>
                      <Text style={styles.newsEmoji}>{item.emoji || '📰'}</Text>
                    </View>
                    <View style={styles.newsContent}>
                      <Text style={styles.newsMeta}>{item.source} • {item.timeAgo}</Text>
                      <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                      <Text style={styles.newsSummary} numberOfLines={3}>{item.summary}</Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
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
});

export default {
  SmartSchedulingScreen,
  MorningBriefingScreen,
  NewsBriefScreen,
};
