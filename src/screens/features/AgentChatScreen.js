import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, AGENTS } from '../../constants/theme';
import { Header, Card, Badge } from '../../components';

const API_BASE_URL = 'https://metio-backend-production.up.railway.app/api/v1';

const AgentChatScreen = ({ route, navigation }) => {
  const { agent } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const scrollViewRef = useRef(null);

  // Get agent details
  const agentData = agent || AGENTS.find(a => a.id === 'comm-manager');
  const agentType = agentData?.id || 'comm-manager';

  useEffect(() => {
    fetchSuggestions();
    // Add welcome message
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm your ${agentData?.name || 'AI Assistant'}. How can I help you today?`,
    }]);
  }, []);

  const fetchSuggestions = async () => {
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      const response = await fetch(`${API_BASE_URL}/chat/suggestions?agentType=${agentType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data.suggestions || []);
      }
    } catch (err) {
      console.log('Failed to fetch suggestions');
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      
      // Build history (last 10 messages, excluding welcome)
      const history = messages
        .filter(m => m.id !== 'welcome')
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentType,
          message: text.trim(),
          history,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.message) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.message,
          actions: data.data.actions,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Error message
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Sorry, I couldn't process that. Please try again.",
          isError: true,
        }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Connection error. Please check your internet and try again.",
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    sendMessage(suggestion);
  };

  const getAgentColor = () => {
    switch (agentType) {
      case 'comm-manager': return COLORS.orange;
      case 'life-planner': return COLORS.lavender;
      case 'money-bot': return '#4CAF50';
      case 'news-pilot': return '#2196F3';
      default: return COLORS.orange;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: getAgentColor() }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <Header
        variant="orange"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        style={{ backgroundColor: getAgentColor() }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.agentEmoji}>{agentData?.emoji || '🤖'}</Text>
          <View>
            <Text style={styles.agentName}>{agentData?.name || 'AI Assistant'}</Text>
            <Text style={styles.agentStatus}>Online</Text>
          </View>
        </View>
      </Header>

      <View style={styles.chatContainer}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View 
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                message.isError && styles.errorBubble,
              ]}
            >
              <Text style={[
                styles.messageText,
                message.role === 'user' ? styles.userText : styles.assistantText,
              ]}>
                {message.content}
              </Text>
              
              {/* Show suggested actions */}
              {message.actions && message.actions.length > 0 && (
                <View style={styles.actionsContainer}>
                  {message.actions.map((action, index) => (
                    <View key={index} style={styles.actionBadge}>
                      <Text style={styles.actionText}>💡 {action.message}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          {loading && (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color={COLORS.textSecondary} />
                <Text style={styles.typingText}>Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Suggestions */}
        {messages.length <= 2 && suggestions.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsContainer}
            contentContainerStyle={styles.suggestionsContent}
          >
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything..."
            placeholderTextColor={COLORS.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(inputText)}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || loading) && styles.sendButtonDisabled,
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || loading}
          >
            <Text style={styles.sendButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  agentEmoji: {
    fontSize: 36,
  },
  agentName: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.black,
  },
  agentStatus: {
    fontSize: SIZES.fontSm,
    color: COLORS.black,
    opacity: 0.7,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    marginTop: -20,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SIZES.lg,
    paddingTop: SIZES.xl,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.orange,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gray,
    borderBottomLeftRadius: 4,
  },
  errorBubble: {
    backgroundColor: COLORS.error + '20',
  },
  messageText: {
    fontSize: SIZES.fontMd,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.black,
  },
  assistantText: {
    color: COLORS.black,
  },
  actionsContainer: {
    marginTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.white + '30',
    paddingTop: SIZES.sm,
  },
  actionBadge: {
    backgroundColor: COLORS.white + '40',
    padding: SIZES.xs,
    borderRadius: SIZES.radiusSm,
    marginTop: 4,
  },
  actionText: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.black,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  typingText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  suggestionsContainer: {
    maxHeight: 50,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
  suggestionsContent: {
    padding: SIZES.sm,
    paddingHorizontal: SIZES.md,
  },
  suggestionChip: {
    backgroundColor: COLORS.gray,
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginRight: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.orange + '40',
  },
  suggestionText: {
    fontSize: SIZES.fontSm,
    color: COLORS.black,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.gray,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    fontSize: SIZES.fontMd,
    color: COLORS.black,
    maxHeight: 100,
    marginRight: SIZES.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray,
    borderColor: COLORS.gray,
  },
  sendButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
  },
});

export default AgentChatScreen;
