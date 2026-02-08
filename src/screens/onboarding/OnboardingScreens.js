import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { Button } from '../../components';

// Reusable Onboarding Layout
const OnboardingLayout = ({
  emoji,
  emojiBackground,
  title,
  description,
  currentStep,
  totalSteps = 3,
  buttonText,
  onButtonPress,
  onSkip,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.imageContainer, { backgroundColor: emojiBackground || COLORS.orange }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        
        <View style={styles.dots}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentStep - 1 && styles.dotActive,
                index < currentStep - 1 && styles.dotDone,
              ]}
            />
          ))}
        </View>
        
        <Button
          title={buttonText}
          variant="primary"
          onPress={onButtonPress}
          style={styles.button}
        />
        
        {onSkip && (
          <Button
            title="Skip"
            variant="ghost"
            onPress={onSkip}
            style={styles.skipButton}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

// Onboarding Screen 1 - Agents
export const Onboarding1Screen = ({ navigation }) => {
  return (
    <OnboardingLayout
      emoji="🤖"
      emojiBackground={COLORS.orange}
      title={"DEPLOY AI\nAGENTS"}
      description="Create personal AI agents that work 24/7 to automate your life — emails, finances, calendar, and more."
      currentStep={1}
      buttonText="Next →"
      onButtonPress={() => navigation.navigate('Onboarding2')}
      onSkip={() => navigation.navigate('Login')}
    />
  );
};

// Onboarding Screen 2 - Automate
export const Onboarding2Screen = ({ navigation }) => {
  return (
    <OnboardingLayout
      emoji="⚡"
      emojiBackground={COLORS.lavender}
      title={"AUTOMATE\nYOUR LIFE"}
      description="From morning briefings to expense tracking — your agents handle the boring stuff so you don't have to."
      currentStep={2}
      buttonText="Next →"
      onButtonPress={() => navigation.navigate('Onboarding3')}
      onSkip={() => navigation.navigate('Login')}
    />
  );
};

// Onboarding Screen 3 - Control
export const Onboarding3Screen = ({ navigation }) => {
  return (
    <OnboardingLayout
      emoji="🛡️"
      emojiBackground={COLORS.success}
      title={"STAY IN\nCONTROL"}
      description="You approve every action. Nothing happens without your permission. Your data stays yours."
      currentStep={3}
      buttonText="Get Started →"
      onButtonPress={() => navigation.navigate('Login')}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.xxl,
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: SIZES.xxl,
    borderWidth: 3,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.xxxl,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SIZES.md,
    lineHeight: 34,
  },
  description: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.xxxl + 8,
  },
  dots: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginBottom: SIZES.xxxl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCC',
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
    backgroundColor: COLORS.orange,
  },
  dotDone: {
    backgroundColor: COLORS.black,
  },
  button: {
    width: '100%',
  },
  skipButton: {
    marginTop: SIZES.sm,
  },
});

export default {
  Onboarding1Screen,
  Onboarding2Screen,
  Onboarding3Screen,
};
