import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../../constants/theme';
import { Header, Badge } from '../../components';

const API_BASE_URL = 'https://metio-backend-production.up.railway.app/api/v1';

const ChatScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'bot',
      agent: 'METIO',
      emoji: '🤖',
      text: "Good morning! I'm your Metio command center. Ask me anything — check emails, review spending, plan your day, or manage your agents.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/chat/suggestions?agentType=general`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data?.suggestions || []);
      }
    } catch (err) {
      console.log('Failed to fetch suggestions');
      // Fallback suggestions
      setSuggestions([
        'Summarize my emails',
        'How much did I spend this week?',
        "What's on my calendar today?",
        'Show my agent status',
      ]);
    }
  };

  const sendMessage = async (text) => {
    const msgText = (text || message).trim();
    if (!msgText || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      type: 'user',
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setSuggestions([]);
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('@metio_access_token');

      // Build chat history (last 10 messages, exclude welcome)
      const history = messages
        .filter(m => m.id !== 'welcome')
        .slice(-10)
        .map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentType: 'general',
          message: msgText,
          history,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.message) {
        const agentInfo = detectAgent(data.data.message);
        const botMsg = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          agent: agentInfo.agent,
          emoji: agentInfo.emoji,
          text: data.data.message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        addErrorMessage("Sorry, I couldn't process that. Please try again.");
      }
    } catch (err) {
      console.error('Chat error:', err);
      addErrorMessage('Connection error. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  const addErrorMessage = (text) => {
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      agent: 'METIO',
      emoji: '⚠️',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isError: true,
    }]);
  };

  const detectAgent = (responseText) => {
    const lower = responseText.toLowerCase();
    if (lower.includes('email') || lower.includes('inbox') || lower.includes('digest'))
      return { agent: 'COMM MANAGER', emoji: '📧' };
    if (lower.includes('spend') || lower.includes('budget') || lower.includes('expense') || lower.includes('transaction'))
      return { agent: 'MONEY BOT', emoji: '💰' };
    if (lower.includes('calendar') || lower.includes('schedule') || lower.includes('meeting') || lower.includes('event'))
      return { agent: 'LIFE PLANNER', emoji: '📅' };
    if (lower.includes('news') || lower.includes('social') || lower.includes('mention'))
      return { agent: 'SOCIAL PILOT', emoji: '📱' };
    if (lower.includes('home') || lower.includes('device') || lower.includes('routine'))
      return { agent: 'HOME COMMAND', emoji: '🏠' };
    if (lower.includes('price') || lower.includes('deal') || lower.includes('watchdog'))
      return { agent: 'PRICE WATCHDOG', emoji: '🐕' };
    return { agent: 'METIO', emoji: '🤖' };
  };

  const renderMessage = (msg) => {
    if (msg.type === 'user') {
      return (
        <View key={msg.id} style={styles.userMessageContainer}>
          <View style={styles.userBubble}>
            <Text style={styles.userText}>{msg.text}</Text>
          </View>
          <Text style={styles.userTime}>{msg.time}</Text>
        </View>
      );
    }

    return (
      <View key={msg.id} style={styles.botMessageContainer}>
        <View style={[styles.botBubble, msg.isError && styles.errorBubble]}>
          <View style={styles.botHeader}>
            <Text style={styles.botEmoji}>{msg.emoji}</Text>
            <Text style={styles.botAgent}>{msg.agent}</Text>
          </View>
          <Text style={styles.botText}>{msg.text}</Text>
        </View>
        <Text style={styles.botTime}>{msg.time}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        variant="black"
        title={"COMMAND\nCHAT"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        statusText="All Agents"
        statusActive={true}
      />

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(renderMessage)}

          {/* Loading indicator */}
          {loading && (
            <View style={styles.botMessageContainer}>
              <View style={styles.botBubble}>
                <View style={styles.botHeader}>
                  <Text style={styles.botEmoji}>🤖</Text>
                  <Text style={styles.botAgent}>METIO</Text>
                </View>
                <View style={styles.typingRow}>
                  <ActivityIndicator size="small" color={COLORS.orange} />
                  <Text style={styles.typingText}>Thinking...</Text>
                </View>
              </View>
            </View>
          )}

          {/* Suggestion chips */}
          {suggestions.length > 0 && messages.length <= 1 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsLabel}>Try asking:</Text>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => sendMessage(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + SIZES.md }]}>
          <TouchableOpacity style={styles.micButton}>
            <Text style={styles.micIcon}>🎤</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Type a command..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={() => sendMessage()}
            disabled={loading}
          >
            <Text style={styles.sendIcon}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: SIZES.md,
  },
  userBubble: {
    backgroundColor: COLORS.orange,
    borderRadius: SIZES.radiusLg,
    borderBottomRightRadius: 4,
    padding: SIZES.md,
    maxWidth: '85%',
  },
  userText: {
    fontSize: SIZES.fontMd,
    color: COLORS.black,
    lineHeight: 20,
  },
  userTime: {
    fontSize: SIZES.fontXs - 1,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  botMessageContainer: {
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
  },
  botBubble: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.black,
    padding: SIZES.md,
    maxWidth: '85%',
  },
  errorBubble: {
    borderColor: '#E53E3E',
  },
  botHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SIZES.sm,
  },
  botEmoji: {
    fontSize: 16,
  },
  botAgent: {
    fontSize: SIZES.fontSm - 1,
    fontWeight: '600',
    color: COLORS.black,
  },
  botText: {
    fontSize: SIZES.fontMd,
    color: COLORS.black,
    lineHeight: 20,
  },
  botTime: {
    fontSize: SIZES.fontXs - 1,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    marginTop: SIZES.md,
    gap: SIZES.sm,
  },
  suggestionsLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  suggestionChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: SIZES.radiusFull,
    paddingVertical: SIZES.sm + 2,
    paddingHorizontal: SIZES.md + 2,
    alignSelf: 'flex-start',
  },
  suggestionText: {
    fontSize: SIZES.fontSm,
    color: COLORS.black,
    fontWeight: '500',
  },
  inputBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.black,
    padding: SIZES.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm + 2,
  },
  micButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.black,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingVertical: SIZES.sm + 2,
    paddingHorizontal: SIZES.md + 2,
    fontSize: SIZES.fontMd,
    color: COLORS.black,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.orange,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 18,
    color: COLORS.black,
    fontWeight: '600',
  },
});

export default ChatScreen;
