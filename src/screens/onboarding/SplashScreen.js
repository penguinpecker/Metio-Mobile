import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to onboarding after delay
    const timer = setTimeout(() => {
      navigation.replace('Onboarding1');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* TV Robot Logo */}
        <View style={styles.tvRobot}>
          <View style={styles.antennaLeft} />
          <View style={styles.antennaRight} />
          <View style={styles.tvBody}>
            <View style={styles.tvScreen}>
              <View style={styles.faceContainer}>
                <View style={styles.eyesRow}>
                  <View style={styles.eye} />
                  <View style={styles.eye} />
                </View>
                <View style={styles.mouth} />
              </View>
            </View>
            <View style={styles.controlsPanel}>
              <View style={styles.knob} />
              <View style={styles.knobSmall} />
              <View style={styles.dotsRow}>
                <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.title}>METIO</Text>
        <Text style={styles.tagline}>Your AI agents, your rules</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  tvRobot: {
    width: 140,
    height: 100,
    marginBottom: 24,
    position: 'relative',
  },
  antennaLeft: {
    position: 'absolute',
    top: 0,
    left: 35,
    width: 6,
    height: 14,
    backgroundColor: COLORS.black,
    borderRadius: 3,
  },
  antennaRight: {
    position: 'absolute',
    top: 0,
    right: 45,
    width: 6,
    height: 14,
    backgroundColor: COLORS.black,
    borderRadius: 3,
  },
  tvBody: {
    position: 'absolute',
    top: 14,
    width: 140,
    height: 86,
    backgroundColor: COLORS.gray,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: COLORS.black,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  tvScreen: {
    width: 85,
    height: 62,
    backgroundColor: COLORS.orange,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: 4,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceContainer: {
    alignItems: 'center',
  },
  eyesRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 8,
  },
  eye: {
    width: 16,
    height: 16,
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  mouth: {
    width: 32,
    height: 10,
    borderWidth: 3,
    borderColor: '#FFD700',
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  controlsPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingRight: 8,
  },
  knob: {
    width: 22,
    height: 10,
    backgroundColor: COLORS.black,
    borderRadius: 2,
  },
  knobSmall: {
    width: 16,
    height: 10,
    backgroundColor: COLORS.black,
    borderRadius: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.black,
    opacity: 0.7,
    marginTop: 8,
  },
});

export default SplashScreen;
