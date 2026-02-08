import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { Header, Card, Button, Badge } from '../../components';
import { getAccessToken } from '../../services/api';

const API_BASE_URL = 'https://metio-backend-production.up.railway.app/api/v1';

const EmailDetailScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [selectedTone, setSelectedTone] = useState('professional');

  const tones = [
    { id: 'professional', label: '💼 Professional' },
    { id: 'friendly', label: '😊 Friendly' },
    { id: 'brief', label: '⚡ Brief' },
  ];

  const getCategoryEmoji = (category) => {
    switch (category) {
      case 'URGENT': return '🔴';
      case 'ACTION': return '🟠';
      case 'FYI': return '🔵';
      case 'NEWSLETTER': return '📰';
      default: return '📧';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return '';
    }
  };

  const extractEmail = (fromString) => {
    const match = fromString.match(/<(.+?)>/);
    return match ? match[1] : fromString;
  };

  const extractName = (fromString) => {
    const match = fromString.match(/^(.+?)\s*</);
    return match ? match[1].trim() : fromString.split('@')[0];
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      Alert.alert('Error', 'Please enter a reply message');
      return;
    }

    setSending(true);
    try {
      const token = getAccessToken();
      const toEmail = extractEmail(email.from);
      
      const messageIdRef = email.externalId ? `<${email.externalId}>` : null;
      
      const response = await fetch(`${API_BASE_URL}/gmail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: [toEmail],
          subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
          body: replyText,
          threadId: email.threadId,
          inReplyTo: messageIdRef,
          references: messageIdRef,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowReply(false);
        setReplyText('');
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        Alert.alert('Error', data.error?.message || 'Failed to send reply');
      }
    } catch (err) {
      console.error('Send reply error:', err);
      Alert.alert('Error', 'Failed to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const openInGmail = () => {
    if (email.externalId || email.gmailId) {
      const messageId = email.externalId || email.gmailId;
      const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${messageId}`;
      Linking.openURL(gmailUrl);
    }
  };

  const handleGenerateAIDraft = async () => {
    setGeneratingDraft(true);
    try {
      const token = getAccessToken();
      
      const response = await fetch(`${API_BASE_URL}/gmail/draft-reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailId: email.id,
          tone: selectedTone,
        }),
      });

      const data = await response.json();
      console.log('AI Draft response:', data);

      if (data.success && data.data?.draft) {
        setReplyText(data.data.draft);
        setShowReply(true);
      } else {
        Alert.alert('Error', data.error?.message || 'Failed to generate draft');
      }
    } catch (err) {
      console.error('Generate draft error:', err);
      Alert.alert('Error', 'Failed to generate AI draft. Please try again.');
    } finally {
      setGeneratingDraft(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        variant="orange"
        title="EMAIL"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <Badge 
            text={email.category} 
            variant={email.category === 'URGENT' ? 'error' : 'ai'} 
            size="sm" 
          />
        }
      />

      {showSuccess && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✓ Reply sent successfully!</Text>
        </View>
      )}

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.headerCard}>
          <View style={styles.subjectRow}>
            <Text style={styles.categoryEmoji}>{getCategoryEmoji(email.category)}</Text>
            <Text style={styles.subject}>{email.subject}</Text>
          </View>
          
          <View style={styles.metaRow}>
            <View style={styles.senderInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{extractName(email.from).charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.senderName}>{extractName(email.from)}</Text>
                <Text style={styles.senderEmail}>{extractEmail(email.from)}</Text>
              </View>
            </View>
            <Text style={styles.date}>{formatDate(email.receivedAt)}</Text>
          </View>
        </Card>

        <Card style={styles.bodyCard}>
          <Text style={styles.bodyText}>{email.snippet}</Text>
          
          <TouchableOpacity style={styles.openGmailBtn} onPress={openInGmail}>
            <Text style={styles.openGmailText}>📧 View full email in Gmail →</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <Text style={styles.analysisTitle}>🤖 AI Analysis</Text>
            <Badge text="Auto" variant="ai" size="sm" />
          </View>
          <Text style={styles.analysisText}>
            {email.category === 'URGENT' && 'This email requires immediate attention. Consider responding as soon as possible.'}
            {email.category === 'ACTION' && 'This email requires an action from you. Review and respond when convenient.'}
            {email.category === 'FYI' && 'This is an informational email. No immediate action required.'}
            {email.category === 'NEWSLETTER' && 'This is a newsletter or marketing email. Read at your leisure.'}
          </Text>
        </Card>

        {showReply ? (
          <Card style={styles.replyCard}>
            <Text style={styles.replyTitle}>Reply to {extractName(email.from)}</Text>
            <Text style={styles.replyTo}>To: {extractEmail(email.from)}</Text>
            <TextInput
              style={styles.replyInput}
              placeholder="Type your reply..."
              placeholderTextColor={COLORS.textTertiary}
              multiline
              numberOfLines={6}
              value={replyText}
              onChangeText={setReplyText}
              textAlignVertical="top"
              autoFocus
            />
            <View style={styles.replyActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setShowReply(false);
                  setReplyText('');
                }}
                style={{ flex: 1 }}
              />
              <Button
                title={sending ? "Sending..." : "Send Reply →"}
                variant="primary"
                onPress={handleReply}
                loading={sending}
                disabled={sending}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        ) : (
          <>
            {/* AI Draft Section */}
            <Card style={styles.aiDraftCard}>
              <View style={styles.aiDraftHeader}>
                <Text style={styles.aiDraftTitle}>✨ AI Draft Reply</Text>
                <Badge text="Powered by Claude" variant="ai" size="sm" />
              </View>
              <Text style={styles.aiDraftDescription}>
                Let AI write a reply for you. Choose a tone:
              </Text>
              
              {/* Tone Selector */}
              <View style={styles.toneSelector}>
                {tones.map((tone) => (
                  <TouchableOpacity
                    key={tone.id}
                    style={[
                      styles.toneButton,
                      selectedTone === tone.id && styles.toneButtonActive,
                    ]}
                    onPress={() => setSelectedTone(tone.id)}
                  >
                    <Text
                      style={[
                        styles.toneButtonText,
                        selectedTone === tone.id && styles.toneButtonTextActive,
                      ]}
                    >
                      {tone.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Generate Button */}
              <TouchableOpacity
                style={[styles.generateButton, generatingDraft && styles.generateButtonDisabled]}
                onPress={handleGenerateAIDraft}
                disabled={generatingDraft}
              >
                {generatingDraft ? (
                  <View style={styles.generatingRow}>
                    <ActivityIndicator color={COLORS.black} size="small" />
                    <Text style={styles.generateButtonText}>Generating draft...</Text>
                  </View>
                ) : (
                  <Text style={styles.generateButtonText}>✨ Generate AI Draft</Text>
                )}
              </TouchableOpacity>
            </Card>

            {/* Manual Reply & Gmail Buttons */}
            <View style={styles.actionButtons}>
              <Button
                title="✏️ Write Manually"
                variant="secondary"
                onPress={() => setShowReply(true)}
                style={{ flex: 1 }}
              />
              <Button
                title="📧 Open in Gmail"
                variant="secondary"
                onPress={openInGmail}
                style={{ flex: 1 }}
              />
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 40,
  },
  successBanner: {
    backgroundColor: COLORS.success,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    alignItems: 'center',
  },
  successText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    fontWeight: '600',
  },
  headerCard: {
    marginBottom: SIZES.md,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  categoryEmoji: {
    fontSize: 24,
    marginTop: 2,
  },
  subject: {
    flex: 1,
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.black,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.black,
    fontSize: SIZES.fontLg,
    fontWeight: '700',
  },
  senderName: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
  },
  senderEmail: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textSecondary,
  },
  date: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textSecondary,
  },
  bodyCard: {
    marginBottom: SIZES.md,
  },
  bodyText: {
    fontSize: SIZES.fontMd,
    color: COLORS.black,
    lineHeight: 24,
    marginBottom: SIZES.md,
  },
  openGmailBtn: {
    paddingVertical: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
  openGmailText: {
    fontSize: SIZES.fontSm,
    color: COLORS.orange,
    fontWeight: '600',
  },
  analysisCard: {
    backgroundColor: '#938EF220',
    marginBottom: SIZES.md,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  analysisTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.black,
  },
  analysisText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  replyCard: {
    marginBottom: SIZES.md,
  },
  replyTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  replyTo: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  replyInput: {
    backgroundColor: COLORS.gray,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    fontSize: SIZES.fontMd,
    color: COLORS.black,
    minHeight: 120,
    marginBottom: SIZES.md,
  },
  replyActions: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  aiDraftCard: {
    marginBottom: SIZES.md,
    backgroundColor: '#FFF8F0',
    borderWidth: 2,
    borderColor: COLORS.orange,
  },
  aiDraftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  aiDraftTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.black,
  },
  aiDraftDescription: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
  },
  toneSelector: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  toneButton: {
    flex: 1,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray,
    alignItems: 'center',
  },
  toneButtonActive: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orange + '20',
  },
  toneButtonText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toneButtonTextActive: {
    color: COLORS.black,
  },
  generateButton: {
    backgroundColor: COLORS.orange,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.black,
  },
  generatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
});

export default EmailDetailScreen;
