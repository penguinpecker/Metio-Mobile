import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Linking } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { Button, Input, Divider } from '../../components';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setTokens } from '../../services/api';

const API_BASE_URL = 'https://metio-backend-production.up.railway.app/api/v1';

// Login Screen
export const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
      navigation.replace('MainTabs');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick demo login
  const handleDemoLogin = async () => {
    setEmail('demo@metio.app');
    setPassword('password123');
    setLoading(true);
    setError('');
    
    try {
      await login('demo@metio.app', 'password123');
      navigation.replace('MainTabs');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get Google OAuth URL from backend
      const response = await fetch(`${API_BASE_URL}/auth/google/url`);
      const data = await response.json();
      
      if (data.success && data.data.url) {
        // Open in browser
        if (Platform.OS === 'web') {
          window.location.href = data.data.url;
        } else {
          await Linking.openURL(data.data.url);
        }
      } else {
        setError('Failed to start Google sign in');
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      setError('Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.miniLogo}>
              <View style={styles.miniScreen}>
                <Text style={styles.miniFace}>◠◠</Text>
              </View>
            </View>
            <Text style={styles.headerTitle}>ACCESS{'\n'}PROTOCOL</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Email"
              placeholder="yourname@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity 
              style={styles.forgotLink}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In →"
              variant="primary"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            <Button
              title="🚀 Demo Login"
              variant="orange"
              onPress={handleDemoLogin}
              loading={loading}
              style={styles.demoButton}
            />

            <Divider text="OR" />

            <View style={styles.socialButtons}>
              <TouchableOpacity style={[styles.socialButton, { opacity: 0.5 }]} disabled={true}>
                <Text style={styles.socialIcon}>🍎</Text>
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
                <Text style={styles.socialIcon}>G</Text>
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Sign Up Screen
export const SignUpScreen = ({ navigation }) => {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await signup(email, password, name);
      navigation.replace('MainTabs');
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.headerSmall}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitleSmall}>CREATE{'\n'}ACCOUNT</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Email"
              placeholder="yourname@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Input
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Button
              title="Create Account →"
              variant="orange"
              onPress={handleSignUp}
              loading={loading}
              style={styles.loginButton}
            />

            <Divider text="OR" />

            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialIcon}>🍎</Text>
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialIcon}>G</Text>
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.signupLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Forgot Password Screen
export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSmall}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitleSmall}>RESET{'\n'}PASSWORD</Text>
      </View>

      <View style={styles.form}>
        {sent ? (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Text style={styles.successEmoji}>✉️</Text>
            </View>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successText}>
              We've sent a password reset link to {email}
            </Text>
            <Button
              title="Back to Login"
              variant="primary"
              onPress={() => navigation.navigate('Login')}
              style={styles.loginButton}
            />
          </View>
        ) : (
          <>
            <Text style={styles.instructions}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <Input
              label="Email"
              placeholder="yourname@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Button
              title="Send Reset Link →"
              variant="orange"
              onPress={handleReset}
              loading={loading}
              style={styles.loginButton}
            />

            <Button
              title="Back to Login"
              variant="ghost"
              onPress={() => navigation.goBack()}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: COLORS.orange,
    paddingTop: SIZES.xxxl,
    paddingBottom: SIZES.xxxl + 8,
    paddingHorizontal: SIZES.xxl,
    alignItems: 'center',
  },
  headerSmall: {
    backgroundColor: COLORS.orange,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.xxl,
    paddingHorizontal: SIZES.xl,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.lg,
  },
  backIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  miniLogo: {
    width: 80,
    height: 55,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.black,
    padding: 5,
    marginBottom: SIZES.lg,
  },
  miniScreen: {
    width: 45,
    height: 35,
    backgroundColor: COLORS.orange,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniFace: {
    fontSize: 10,
    color: '#FFD700',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.black,
    textAlign: 'center',
    lineHeight: 30,
  },
  headerTitleSmall: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.black,
    lineHeight: 30,
  },
  form: {
    flex: 1,
    padding: SIZES.xxl,
  },
  instructions: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xxl,
    lineHeight: 22,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: SIZES.xl,
    marginTop: -SIZES.sm,
  },
  forgotText: {
    fontSize: SIZES.fontSm,
    color: COLORS.orange,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: SIZES.sm,
  },
  demoButton: {
    marginTop: SIZES.sm,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.fontSm,
    textAlign: 'center',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    padding: SIZES.md,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: SIZES.radiusMd,
  },
  socialIcon: {
    fontSize: SIZES.fontLg,
  },
  socialText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.black,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.xxl,
  },
  signupText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  signupLink: {
    fontSize: SIZES.fontSm,
    color: COLORS.orange,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: SIZES.xxxl,
  },
  successIcon: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.success,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.xxl,
  },
  successEmoji: {
    fontSize: 48,
  },
  successTitle: {
    fontSize: SIZES.fontXxl,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: SIZES.md,
  },
  successText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.xxxl,
    lineHeight: 22,
  },
});

export default { LoginScreen, SignUpScreen, ForgotPasswordScreen };
