import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../../constants/theme';
import { Header, Card, Badge, MetricsRow, SectionLabel, Button } from '../../components';

const API_BASE_URL = 'https://metio-backend-production.up.railway.app/api/v1';

// ============== SMART SCHEDULING / CALENDAR ==============

export const SmartSchedulingScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [briefing, setBriefing] = useState(null);
  const [error, setError] = useState(null);

  const fetchCalendarData = async () => {
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      if (!token) {
        setError('Please log in');
        setLoading(false);
        return;
      }

      // Check status
      const statusResponse = await fetch(`${API_BASE_URL}/calendar/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statusData = await statusResponse.json();

      if (!statusData.success || !statusData.data?.connected) {
        setConnected(false);
        setLoading(false);
        return;
      }

      setConnected(true);

      // Sync events
      await fetch(`${API_BASE_URL}/calendar/sync`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days: 7 }),
      });

      // Get briefing
      const briefingResponse = await fetch(`${API_BASE_URL}/calendar/briefing`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const briefingData = await briefingResponse.json();

      if (briefingData.success) {
        setBriefing(briefingData.data);
      }
    } catch (err) {
      console.error('Calendar error:', err);
      setError('Failed to load calendar');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCalendarData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCalendarData();
  };

  const handleConnect = async () => {
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      const response = await fetch(`${API_BASE_URL}/calendar/connect`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.data?.url) {
        Linking.openURL(data.data.url);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to connect calendar');
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const minutes = Math.round((endDate - startDate) / (1000 * 60));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          variant="lavender"
          title={"TODAY'S\nSCHEDULE"}
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.lavender} />
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      </View>
    );
  }

  if (!connected) {
    return (
      <View style={styles.container}>
        <Header
          variant="lavender"
          title={"TODAY'S\nSCHEDULE"}
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.connectContainer}>
          <Text style={styles.connectIcon}>📅</Text>
          <Text style={styles.connectTitle}>Connect Google Calendar</Text>
          <Text style={styles.connectDescription}>
            Connect your Google Calendar to see your schedule, get meeting reminders, and let your Life Planner help manage your time.
          </Text>
          <Button
            title="Connect Calendar"
            variant="primary"
            onPress={handleConnect}
            style={{ marginTop: 24 }}
          />
        </View>
      </View>
    );
  }

  const metrics = [
    { value: (briefing?.summary?.totalEvents || 0).toString(), label: 'Events', color: COLORS.lavender },
    { value: `${briefing?.summary?.busyHours || 0}h`, label: 'Busy', color: COLORS.orange },
    { value: briefing?.summary?.firstEvent ? formatTime(briefing.summary.firstEvent.startTime) : '—', label: 'First', color: COLORS.black },
  ];

  return (
    <View style={styles.container}>
      <Header
        variant="lavender"
        title={"TODAY'S\nSCHEDULE"}
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<Badge text="Connected" variant="active" />}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.lavender} />
        }
      >
        <MetricsRow metrics={metrics} />

        {/* Today's Events */}
        <SectionLabel>📅 Today's Events</SectionLabel>
        {briefing?.todayEvents && briefing.todayEvents.length > 0 ? (
          briefing.todayEvents.map((event, index) => (
            <Card key={event.id || index} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={styles.eventTime}>
                  <Text style={styles.eventTimeText}>
                    {event.isAllDay ? 'All Day' : formatTime(event.startTime)}
                  </Text>
                  {!event.isAllDay && (
                    <Text style={styles.eventDuration}>{formatDuration(event.startTime, event.endTime)}</Text>
                  )}
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.location && (
                    <Text style={styles.eventLocation}>📍 {event.location}</Text>
                  )}
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Card>
            <Text style={styles.noEventsText}>🎉 No events scheduled for today!</Text>
            <Text style={styles.noEventsSubtext}>Enjoy your free time or schedule something new.</Text>
          </Card>
        )}

        {/* Upcoming Highlights */}
        {briefing?.upcomingHighlights && briefing.upcomingHighlights.length > 0 && (
          <>
            <SectionLabel>🔮 Coming Up</SectionLabel>
            <Card>
              {briefing.upcomingHighlights.map((event, index) => (
                <View key={event.id || index} style={styles.upcomingItem}>
                  <Text style={styles.upcomingDate}>
                    {new Date(event.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={styles.upcomingTitle}>{event.title}</Text>
                </View>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
};

// ============== MORNING BRIEFING ==============

export const MorningBriefingScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState(null);
  const [emailDigest, setEmailDigest] = useState(null);

  useEffect(() => {
    fetchBriefing();
  }, []);

  const fetchBriefing = async () => {
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');

      // Get calendar briefing
      try {
        const calResponse = await fetch(`${API_BASE_URL}/calendar/briefing`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const calData = await calResponse.json();
        if (calData.success) {
          setBriefing(calData.data);
        }
      } catch (e) {
        console.log('Calendar not connected');
      }

      // Get email digest
      try {
        const emailResponse = await fetch(`${API_BASE_URL}/gmail/digest`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const emailData = await emailResponse.json();
        if (emailData.success) {
          setEmailDigest(emailData.data);
        }
      } catch (e) {
        console.log('Gmail not connected');
      }
    } catch (err) {
      console.error('Briefing error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          variant="lavender"
          title={"MORNING\nBRIEFING"}
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.lavender} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        variant="lavender"
        title={"MORNING\nBRIEFING"}
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<Badge text="AI Generated" variant="ai" />}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Greeting Card */}
        <Card style={styles.greetingCard}>
          <Text style={styles.greetingText}>{getGreeting()}! ☀️</Text>
          <Text style={styles.greetingSubtext}>Here's what's on your plate today.</Text>
        </Card>

        {/* Calendar Summary */}
        <SectionLabel>📅 Schedule Overview</SectionLabel>
        <Card>
          {briefing ? (
            <>
              <View style={styles.briefingRow}>
                <Text style={styles.briefingLabel}>Events today:</Text>
                <Text style={styles.briefingValue}>{briefing.summary?.totalEvents || 0}</Text>
              </View>
              <View style={styles.briefingRow}>
                <Text style={styles.briefingLabel}>Busy time:</Text>
                <Text style={styles.briefingValue}>{briefing.summary?.busyHours || 0} hours</Text>
              </View>
              {briefing.summary?.firstEvent && (
                <View style={styles.briefingRow}>
                  <Text style={styles.briefingLabel}>First event:</Text>
                  <Text style={styles.briefingValue}>
                    {briefing.summary.firstEvent.title} at {formatTime(briefing.summary.firstEvent.startTime)}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.notConnectedText}>Connect Google Calendar to see your schedule</Text>
          )}
        </Card>

        {/* Email Summary */}
        <SectionLabel>📧 Inbox Status</SectionLabel>
        <Card>
          {emailDigest ? (
            <>
              <View style={styles.briefingRow}>
                <Text style={styles.briefingLabel}>Emails:</Text>
                <Text style={styles.briefingValue}>{emailDigest.totalEmails || emailDigest.summary?.total || 0}</Text>
              </View>
              <View style={styles.briefingRow}>
                <Text style={styles.briefingLabel}>🔴 Urgent:</Text>
                <Text style={[styles.briefingValue, { color: COLORS.error }]}>
                  {emailDigest.summary?.urgent || 0}
                </Text>
              </View>
              <View style={styles.briefingRow}>
                <Text style={styles.briefingLabel}>🟠 Action needed:</Text>
                <Text style={[styles.briefingValue, { color: COLORS.orange }]}>
                  {emailDigest.summary?.action || 0}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.notConnectedText}>Connect Gmail to see inbox status</Text>
          )}
        </Card>

        {/* Quick Actions */}
        <SectionLabel>⚡ Quick Actions</SectionLabel>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('SmartScheduling')}
          >
            <Text style={styles.quickActionEmoji}>📅</Text>
            <Text style={styles.quickActionText}>View Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('EmailDigest')}
          >
            <Text style={styles.quickActionEmoji}>📧</Text>
            <Text style={styles.quickActionText}>Check Emails</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lavender,
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
    paddingTop: SIZES.xl,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
  },
  loadingText: {
    marginTop: 16,
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
  },
  connectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    padding: SIZES.xl,
  },
  connectIcon: {
    fontSize: 64,
    marginBottom: SIZES.lg,
  },
  connectTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SIZES.sm,
  },
  connectDescription: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  eventCard: {
    marginBottom: SIZES.sm,
  },
  eventHeader: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  eventTime: {
    width: 70,
  },
  eventTimeText: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.lavender,
  },
  eventDuration: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textSecondary,
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
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  noEventsText: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
  },
  noEventsSubtext: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  upcomingDate: {
    width: 100,
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  upcomingTitle: {
    flex: 1,
    fontSize: SIZES.fontSm,
    color: COLORS.black,
  },
  greetingCard: {
    backgroundColor: COLORS.lavender + '20',
    marginBottom: SIZES.lg,
  },
  greetingText: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.black,
  },
  greetingSubtext: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  briefingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  briefingLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  briefingValue: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.black,
  },
  notConnectedText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SIZES.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  quickActionEmoji: {
    fontSize: 32,
    marginBottom: SIZES.sm,
  },
  quickActionText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.black,
  },
});

export default {
  SmartSchedulingScreen,
  MorningBriefingScreen,
};
