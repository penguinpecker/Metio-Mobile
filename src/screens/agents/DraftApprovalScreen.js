import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { Header, Card, Button, Badge } from '../../components';
import { pendingActionsAPI } from '../../services/api';

const DraftApprovalScreen = ({ navigation, route }) => {
  const action = route.params?.action || {};
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draftText, setDraftText] = useState(
    action.draft || action.content || action.description ||
    "Hi Sarah,\n\nThanks for following up! I've reviewed the Q1 contract and everything looks good. I'll have it signed and sent back to you within the hour.\n\nBest,\nJohn"
  );

  // Extract metadata from action if available
  const senderName = action.metadata?.senderName || action.senderName || 'Sarah Chen';
  const senderEmail = action.metadata?.senderEmail || action.senderEmail || 'sarah@acme.com';
  const senderInitials = senderName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const originalMessage = action.metadata?.originalMessage || action.originalMessage ||
    'Hi, just following up on the Q1 contract. We need your signature by EOD today. Can you please review and confirm?';
  const originalTime = action.metadata?.receivedAt
    ? new Date(action.metadata.receivedAt).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : action.time || 'Today at 9:15 AM';
  const agentName = action.agentName || action.type || 'Comm Manager';

  const handleApprove = async () => {
    setLoading(true);
    try {
      if (action.id) {
        // Send modifications if user edited the draft
        const modifications = draftText !== (action.draft || action.content || action.description)
          ? { content: draftText }
          : null;
        const response = await pendingActionsAPI.approve(action.id, modifications);
        if (response.success) {
          Alert.alert(
            'Approved ✓',
            'The action has been approved and sent.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert('Error', response.error || 'Failed to approve. Please try again.');
        }
      } else {
        // Fallback for mock data - no action ID
        Alert.alert(
          'Email Sent',
          'Your reply has been sent successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err) {
      console.error('Error approving action:', err);
      Alert.alert('Error', 'Failed to approve. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    Alert.alert(
      'Reject Draft',
      'Are you sure you want to reject this draft?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              if (action.id) {
                const response = await pendingActionsAPI.reject(action.id);
                if (response.success) {
                  Alert.alert(
                    'Rejected',
                    'The draft has been discarded.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                  );
                } else {
                  Alert.alert('Error', response.error || 'Failed to reject. Please try again.');
                }
              } else {
                Alert.alert(
                  'Draft Rejected',
                  'The draft has been discarded.',
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              }
            } catch (err) {
              console.error('Error rejecting action:', err);
              Alert.alert('Error', 'Failed to reject. Please check your connection and try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        variant="orange"
        title={"DRAFT\nREVIEW"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<Badge text="AI Generated" variant="ai" />}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Original Thread */}
        <Text style={styles.sectionLabel}>Original Thread</Text>
        <Card variant="outlined" style={styles.originalCard}>
          <View style={styles.senderRow}>
            <View style={styles.senderAvatar}>
              <Text style={styles.senderInitials}>{senderInitials}</Text>
            </View>
            <View style={styles.senderInfo}>
              <Text style={styles.senderName}>{senderName}</Text>
              <Text style={styles.senderEmail}>{senderEmail}</Text>
            </View>
          </View>
          <Text style={styles.originalText}>{originalMessage}</Text>
          <Text style={styles.originalTime}>{originalTime}</Text>
        </Card>

        {/* AI Draft */}
        <Text style={styles.sectionLabel}>AI Drafted Response</Text>
        <Card variant="lavender">
          <View style={styles.draftHeader}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiIcon}>{action.agentEmoji || '🤖'}</Text>
            </View>
            <View style={styles.draftInfo}>
              <Text style={styles.draftTitle}>{action.title || 'Your Reply'}</Text>
              <Text style={styles.draftSubtitle}>Generated by {agentName}</Text>
            </View>
          </View>
          
          {isEditing ? (
            <TextInput
              style={styles.draftInput}
              value={draftText}
              onChangeText={setDraftText}
              multiline
              autoFocus
            />
          ) : (
            <View style={styles.draftBody}>
              <Text style={styles.draftText}>{draftText}</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.editToggle}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={styles.editToggleText}>
              {isEditing ? '✓ Done Editing' : '✏️ Edit Draft'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Suggestions */}
        <Text style={styles.sectionLabel}>AI Suggestions</Text>
        <View style={styles.suggestions}>
          <TouchableOpacity style={styles.suggestionChip}>
            <Text style={styles.suggestionText}>Add signature</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.suggestionChip}>
            <Text style={styles.suggestionText}>More formal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.suggestionChip}>
            <Text style={styles.suggestionText}>Add timeline</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          title="Reject"
          variant="secondary"
          onPress={handleReject}
          style={{ flex: 0.3 }}
          disabled={loading}
        />
        <Button
          title="✏️ Edit"
          variant="secondary"
          onPress={() => setIsEditing(true)}
          style={{ flex: 0.3 }}
          disabled={loading}
        />
        <Button
          title={loading ? "Sending..." : "✓ Approve & Send"}
          variant="primary"
          onPress={handleApprove}
          style={{ flex: 0.4 }}
          disabled={loading}
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
    paddingBottom: 120,
  },
  sectionLabel: {
    fontSize: SIZES.fontXs,
    fontWeight: '600',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SIZES.sm + 2,
    marginTop: SIZES.lg,
  },
  originalCard: {
    backgroundColor: '#F9F9F9',
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm + 2,
    marginBottom: SIZES.md,
  },
  senderAvatar: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.gray,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderInitials: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  senderInfo: {
    flex: 1,
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
  originalText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  originalTime: {
    fontSize: SIZES.fontXs,
    color: COLORS.textTertiary,
    marginTop: SIZES.sm,
  },
  draftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm + 2,
    marginBottom: SIZES.md,
  },
  aiAvatar: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiIcon: {
    fontSize: 18,
  },
  draftInfo: {
    flex: 1,
  },
  draftTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.white,
  },
  draftSubtitle: {
    fontSize: SIZES.fontSm - 1,
    color: 'rgba(255,255,255,0.7)',
  },
  draftBody: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
  },
  draftText: {
    fontSize: SIZES.fontMd,
    color: COLORS.white,
    lineHeight: 22,
  },
  draftInput: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    fontSize: SIZES.fontMd,
    color: COLORS.black,
    lineHeight: 22,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  editToggle: {
    alignSelf: 'flex-end',
    marginTop: SIZES.md,
  },
  editToggleText: {
    fontSize: SIZES.fontSm,
    color: COLORS.white,
    fontWeight: '600',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  suggestionChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: SIZES.radiusFull,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
  },
  suggestionText: {
    fontSize: SIZES.fontSm,
    color: COLORS.black,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.black,
    padding: SIZES.lg,
    flexDirection: 'row',
    gap: SIZES.sm,
  },
});

export default DraftApprovalScreen;
