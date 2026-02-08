import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES } from '../../constants/theme';
import {
  Header,
  Card,
  Button,
  ToggleRow,
  ListItem,
  SectionLabel,
  IntegrationItem,
  Input,
  Avatar,
} from '../../components';
import { useAuth } from '../../context/AuthContext';

// Gmail API
const API_BASE_URL = 'https://metio-backend-production.up.railway.app/api/v1';

// Settings Screen
export const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check Gmail status every time screen gains focus
  useFocusEffect(
    useCallback(() => {
      checkGmailStatus();
    }, [])
  );

  const checkGmailStatus = async () => {
    try {
      const token = require('../../services/api').getAccessToken();
      console.log('Checking Gmail status with token:', !!token);
      
      if (!token) {
        console.log('No token available for Gmail status check');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/gmail/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log('Gmail status response:', data);
      
      if (data.success) {
        setGmailConnected(data.data.connected);
        setGmailEmail(data.data.email);
      }
    } catch (err) {
      console.log('Gmail status check failed:', err);
    }
  };

  const handleConnectGmail = async () => {
    setLoading(true);
    try {
      const token = require('../../services/api').getAccessToken();
      const response = await fetch(`${API_BASE_URL}/gmail/connect`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success && data.data.url) {
        // Open Google OAuth in browser
        await Linking.openURL(data.data.url);
      } else {
        Alert.alert('Error', 'Failed to get Gmail connect URL');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to connect Gmail');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectGmail = async () => {
    Alert.alert(
      'Disconnect Gmail',
      'Are you sure you want to disconnect Gmail?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = require('../../services/api').getAccessToken();
              await fetch(`${API_BASE_URL}/gmail/disconnect`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              setGmailConnected(false);
              setGmailEmail(null);
            } catch (err) {
              Alert.alert('Error', 'Failed to disconnect Gmail');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          }
        },
      ]
    );
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <Header
        variant="gray"
        title="SETTINGS"
        showAvatar={true}
        avatarText={getInitials(user?.name)}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <TouchableOpacity 
          style={styles.profileCard}
          onPress={() => navigation.navigate('ProfileEdit')}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>{getInitials(user?.name)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          </View>
          <Text style={styles.profileArrow}>→</Text>
        </TouchableOpacity>

        <SectionLabel>Connected Services</SectionLabel>
        <IntegrationItem
          icon="📧"
          iconBg="#EA4335"
          name="Gmail"
          status={gmailConnected ? `Connected: ${gmailEmail}` : 'Tap to connect'}
          connected={gmailConnected}
          onPress={gmailConnected ? handleDisconnectGmail : handleConnectGmail}
        />
        <IntegrationItem
          icon="📅"
          iconBg="#4285F4"
          name="Google Calendar"
          status="Coming soon"
          connected={false}
        />
        <IntegrationItem
          icon="🏦"
          iconBg={COLORS.success}
          name="Bank (Plaid)"
          status="Coming soon"
          connected={false}
        />

        <SectionLabel>Notifications</SectionLabel>
        <Card>
          <ToggleRow
            title="Push Notifications"
            subtitle="Agent alerts & updates"
            value={notifications}
            onValueChange={setNotifications}
          />
          <ToggleRow
            title="Daily Digest"
            subtitle="Morning summary at 8 AM"
            value={dailyDigest}
            onValueChange={setDailyDigest}
            style={{ borderBottomWidth: 0 }}
          />
        </Card>

        <SectionLabel>Support</SectionLabel>
        <ListItem
          icon="❓"
          iconBg={COLORS.lavender}
          title="Help & FAQ"
          showArrow={true}
          onPress={() => navigation.navigate('HelpFAQ')}
        />
        <ListItem
          icon="💬"
          iconBg={COLORS.info}
          title="Contact Support"
          showArrow={true}
        />
        <ListItem
          icon="📝"
          iconBg={COLORS.warning}
          title="Send Feedback"
          showArrow={true}
        />

        <SectionLabel>About</SectionLabel>
        <ListItem
          icon="📄"
          iconBg={COLORS.gray}
          title="Terms of Service"
          showArrow={true}
        />
        <ListItem
          icon="🔒"
          iconBg={COLORS.gray}
          title="Privacy Policy"
          showArrow={true}
        />
        <ListItem
          icon="ℹ️"
          iconBg={COLORS.gray}
          title="App Version"
          rightText="1.0.0"
        />

        <Button
          title="Sign Out"
          variant="ghost"
          onPress={handleLogout}
          style={styles.logoutButton}
          textStyle={styles.logoutText}
        />
      </ScrollView>
    </View>
  );
};

// Profile Edit Screen
export const ProfileEditScreen = ({ navigation }) => {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    Alert.alert('Success', 'Profile updated successfully!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header
        variant="gray"
        title={"EDIT\nPROFILE"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.editAvatar}>
            <Text style={styles.editAvatarText}>JD</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Full Name"
          placeholder="Your name"
          value={name}
          onChangeText={setName}
        />

        <Input
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Phone (Optional)"
          placeholder="+1 (555) 000-0000"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <SectionLabel>Security</SectionLabel>
        <ListItem
          icon="🔑"
          title="Change Password"
          showArrow={true}
        />
        <ListItem
          icon="🛡️"
          title="Two-Factor Authentication"
          rightText="Off"
          showArrow={true}
        />

        <SectionLabel>Danger Zone</SectionLabel>
        <Button
          title="Delete Account"
          variant="ghost"
          textStyle={{ color: COLORS.error }}
          style={{ marginTop: SIZES.md }}
        />
      </ScrollView>

      <View style={styles.bottomActions}>
        <Button
          title="Save Changes"
          variant="orange"
          onPress={handleSave}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};

// Help & FAQ Screen
export const HelpFAQScreen = ({ navigation }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'How do I create a new agent?',
      answer: 'Tap the + button on the Agents tab, select an agent type, connect your accounts, configure features, and deploy!',
    },
    {
      id: 2,
      question: 'Are my emails and data secure?',
      answer: 'Yes! We use end-to-end encryption and never store your actual email content. We only process metadata to provide our services.',
    },
    {
      id: 3,
      question: 'How do I pause an agent?',
      answer: 'Go to the agent detail page and tap the "Pause" button. You can resume at any time.',
    },
    {
      id: 4,
      question: 'What happens if I disconnect an account?',
      answer: 'The agent will stop monitoring that account but your previous data and settings will be preserved.',
    },
    {
      id: 5,
      question: 'Can I use voice commands?',
      answer: 'Yes! Tap the microphone icon and speak your command. Try saying "Summarize my emails" or "What\'s on my calendar?"',
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        variant="gray"
        title={"HELP &\nFAQ"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <SectionLabel>Frequently Asked Questions</SectionLabel>
        {faqs.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={styles.faqItem}
            onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Text style={styles.faqArrow}>{expandedFaq === faq.id ? '−' : '+'}</Text>
            </View>
            {expandedFaq === faq.id && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}

        <SectionLabel>Quick Help</SectionLabel>
        <Card onPress={() => {}}>
          <View style={styles.helpItem}>
            <Text style={styles.helpEmoji}>📖</Text>
            <View>
              <Text style={styles.helpTitle}>Getting Started Guide</Text>
              <Text style={styles.helpSubtitle}>Learn the basics in 5 minutes</Text>
            </View>
          </View>
        </Card>
        <Card onPress={() => {}}>
          <View style={styles.helpItem}>
            <Text style={styles.helpEmoji}>🎥</Text>
            <View>
              <Text style={styles.helpTitle}>Video Tutorials</Text>
              <Text style={styles.helpSubtitle}>Watch how to use each agent</Text>
            </View>
          </View>
        </Card>
        <Card onPress={() => {}}>
          <View style={styles.helpItem}>
            <Text style={styles.helpEmoji}>💬</Text>
            <View>
              <Text style={styles.helpTitle}>Live Chat Support</Text>
              <Text style={styles.helpSubtitle}>Talk to a human</Text>
            </View>
          </View>
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
    paddingBottom: 120,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.black,
    padding: SIZES.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    marginBottom: SIZES.lg,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.orange,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  profileInitials: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.black,
  },
  profileEmail: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  profileArrow: {
    fontSize: SIZES.fontXl,
    color: COLORS.textTertiary,
  },
  logoutButton: {
    marginTop: SIZES.xxxl,
  },
  logoutText: {
    color: COLORS.error,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.black,
    padding: SIZES.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SIZES.xxl,
  },
  editAvatar: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.orange,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.black,
    marginBottom: SIZES.md,
  },
  editAvatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.black,
  },
  changePhotoText: {
    fontSize: SIZES.fontMd,
    color: COLORS.orange,
    fontWeight: '600',
  },
  faqItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.black,
    padding: SIZES.md + 2,
    marginBottom: SIZES.sm + 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
    marginRight: SIZES.md,
  },
  faqArrow: {
    fontSize: SIZES.fontXl,
    fontWeight: '600',
    color: COLORS.orange,
  },
  faqAnswer: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: SIZES.md,
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  helpEmoji: {
    fontSize: 28,
  },
  helpTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
  },
  helpSubtitle: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textSecondary,
  },
});

export default { SettingsScreen, ProfileEditScreen, HelpFAQScreen };
