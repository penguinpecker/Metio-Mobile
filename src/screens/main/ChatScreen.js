import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../../constants/theme';
import { Header, Badge } from '../../components';

const ChatScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      agent: 'METIO',
      emoji: '🤖',
      text: "Good morning! I'm ready to help. What would you like me to do?",
      time: '9:00 AM',
    },
    {
      id: 2,
      type: 'user',
      text: 'Summarize my emails from last 24 hours',
      time: '9:01 AM',
    },
    {
      id: 3,
      type: 'bot',
      agent: 'COMM MANAGER',
      emoji: '📧',
      text: "**Email Digest (24h)**\n\n📥 **47 new emails**\n🔴 5 Urgent (Client contract, Server alert...)\n🟠 12 Action required\n📋 30 FYI/Newsletter\n\nWould you like me to show details?",
      time: '9:01 AM',
    },
    {
      id: 4,
      type: 'user',
      text: 'Show me the urgent ones',
      time: '9:02 AM',
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        agent: 'METIO',
        emoji: '🤖',
        text: "I'm processing your request. One moment...",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
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
        <View style={styles.botBubble}>
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
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
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
  sendIcon: {
    fontSize: 18,
    color: COLORS.black,
    fontWeight: '600',
  },
});

export default ChatScreen;
