import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

// Onboarding Screens
import SplashScreen from '../screens/onboarding/SplashScreen';
import { Onboarding1Screen, Onboarding2Screen, Onboarding3Screen } from '../screens/onboarding/OnboardingScreens';

// Auth Screens
import { LoginScreen, SignUpScreen, ForgotPasswordScreen } from '../screens/auth/AuthScreens';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import ChatScreen from '../screens/main/ChatScreen';
import { ActivityScreen, NotificationPermissionScreen } from '../screens/main/OtherScreens';

// Agent Screens
import { AgentsListScreen, AgentDetailScreen } from '../screens/agents/AgentScreens';
import DraftApprovalScreen from '../screens/agents/DraftApprovalScreen';

// Agent Setup Screens
import { AgentSetupStep1, AgentSetupStep2, AgentSetupStep3, AgentSetupStep4 } from '../screens/setup/AgentSetupScreens';

// Settings Screens
import { SettingsScreen, ProfileEditScreen, HelpFAQScreen } from '../screens/settings/SettingsScreens';

// Feature Screens
import { EmailDigestScreen, PriorityInboxScreen } from '../screens/features/CommMoneyFeatures';
import { SmartSchedulingScreen as OldSmartScheduling, MorningBriefingScreen as OldMorningBriefing, NewsBriefScreen, MentionAlertsScreen, VoiceRoutinesScreen, AwayDetectionScreen } from '../screens/features/LifeSocialHomeFeatures';
import EmailDetailScreen from '../screens/features/EmailDetailScreen';
import { SmartSchedulingScreen, MorningBriefingScreen } from '../screens/features/LifePlannerFeatures';
import { StatementScannerScreen, ReceiptScannerScreen, SpendingInsightsScreen, ExpenseTrackerScreen } from '../screens/features/MoneyBotFeatures';
import AgentChatScreen from '../screens/features/AgentChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Icon Component
const TabIcon = ({ focused, icon, label }) => (
  <View style={styles.tabItem}>
    <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
  </View>
);

// Main Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🏠" label="Home" />,
        }}
      />
      <Tab.Screen
        name="Agents"
        component={AgentsListScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="🤖" label="Agents" />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="💬" label="Chat" />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="⚙️" label="Settings" />,
        }}
      />
    </Tab.Navigator>
  );
};

// Main Navigation
const AppNavigator = () => {
  const { isLoading, isAuthenticated } = useAuth();

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.orange} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "MainTabs" : "Splash"}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Onboarding Flow */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding1" component={Onboarding1Screen} />
        <Stack.Screen name="Onboarding2" component={Onboarding2Screen} />
        <Stack.Screen name="Onboarding3" component={Onboarding3Screen} />
        
        {/* Auth Flow */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        
        {/* Notification Permission */}
        <Stack.Screen name="NotificationPermission" component={NotificationPermissionScreen} />
        
        {/* Main App */}
        <Stack.Screen name="MainTabs" component={MainTabs} />
        
        {/* Agent Screens */}
        <Stack.Screen name="AgentDetail" component={AgentDetailScreen} />
        <Stack.Screen name="DraftApproval" component={DraftApprovalScreen} />
        <Stack.Screen name="Activity" component={ActivityScreen} />
        
        {/* Agent Setup Flow */}
        <Stack.Screen name="AgentSetup" component={AgentSetupStep1} />
        <Stack.Screen name="AgentSetupStep1" component={AgentSetupStep1} />
        <Stack.Screen name="AgentSetupStep2" component={AgentSetupStep2} />
        <Stack.Screen name="AgentSetupStep3" component={AgentSetupStep3} />
        <Stack.Screen name="AgentSetupStep4" component={AgentSetupStep4} />
        
        {/* Settings Screens */}
        <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
        <Stack.Screen name="HelpFAQ" component={HelpFAQScreen} />
        
        {/* Feature Screens - Comm Manager */}
        <Stack.Screen name="EmailDigest" component={EmailDigestScreen} />
        <Stack.Screen name="PriorityInbox" component={PriorityInboxScreen} />
        <Stack.Screen name="EmailDetail" component={EmailDetailScreen} />
        
        {/* Feature Screens - Money Bot */}
        <Stack.Screen name="StatementScanner" component={StatementScannerScreen} />
        <Stack.Screen name="ReceiptScanner" component={ReceiptScannerScreen} />
        <Stack.Screen name="SpendingInsights" component={SpendingInsightsScreen} />
        <Stack.Screen name="ExpenseTracker" component={ExpenseTrackerScreen} />
        
        {/* Feature Screens - Life Planner */}
        <Stack.Screen name="SmartScheduling" component={SmartSchedulingScreen} />
        <Stack.Screen name="MorningBriefing" component={MorningBriefingScreen} />
        
        {/* Feature Screens - Social Pilot */}
        <Stack.Screen name="NewsBrief" component={NewsBriefScreen} />
        <Stack.Screen name="MentionAlerts" component={MentionAlertsScreen} />
        
        {/* Feature Screens - Home Command */}
        <Stack.Screen name="VoiceRoutines" component={VoiceRoutinesScreen} />
        <Stack.Screen name="AwayDetection" component={AwayDetectionScreen} />

        {/* Agent Chat */}
        <Stack.Screen name="AgentChat" component={AgentChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.white,
    fontSize: 16,
  },
  tabBar: {
    backgroundColor: COLORS.black,
    borderTopWidth: 0,
    height: 80,
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.xl,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  tabIconActive: {
    // Active state handled by color
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  tabLabelActive: {
    color: COLORS.orange,
  },
});

export default AppNavigator;
