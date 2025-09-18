import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
// Updated import to include phone authentication functions
import { loginUser, resetPassword, sendVerificationCode, confirmVerificationCode } from './AuthService';
import { auth } from './firebaseConfig';
import { getAuth } from 'firebase/auth';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loginMode, setLoginMode] = useState('email'); // 'email' or 'phone'

  // Handles user login with email and password
  const handleEmailLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please enter both email and password.');
    }

    setLoading(true);
    try {
      await loginUser(email, password);
      navigation.replace('HomeScreen');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handles sending the verification code via phone number
  const handleSendCode = async () => {
    if (!phoneNumber) {
      return Alert.alert('Error', 'Please enter a valid phone number.');
    }

    setLoading(true);
    try {
      // Assuming phoneNumber is in a valid format, e.g., '+15551234567'
      const confirmation = await sendVerificationCode(phoneNumber);
      setConfirmationResult(confirmation);
      setLoginMode('codeSent'); // Switch to the verification code input view
      Alert.alert('Code Sent', 'A verification code has been sent to your phone.');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handles confirming the verification code
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      return Alert.alert('Error', 'Please enter the verification code.');
    }

    setLoading(true);
    try {
      await confirmVerificationCode(confirmationResult, verificationCode);
      navigation.replace('HomeScreen');
    } catch (error) {
      Alert.alert('Verification Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handles password reset request
  const handleForgotPassword = async () => {
    if (!email) {
      return Alert.alert('Reset Password', 'Please enter your email address first.');
    }

    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert('Email Sent', 'A password reset link has been sent to your email address.');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to continue your nutrition journey.</Text>
        
        {/* Toggle between Email and Phone login */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, loginMode === 'email' && styles.activeToggleButton]} 
            onPress={() => {
              setLoginMode('email');
              setConfirmationResult(null); // Reset phone auth state
            }}
          >
            <Text style={[styles.toggleButtonText, loginMode === 'email' && styles.activeToggleButtonText]}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, loginMode === 'phone' && styles.activeToggleButton]} 
            onPress={() => {
              setLoginMode('phone');
              setConfirmationResult(null); // Reset phone auth state
            }}
          >
            <Text style={[styles.toggleButtonText, loginMode === 'phone' && styles.activeToggleButtonText]}>Phone</Text>
          </TouchableOpacity>
        </View>

        {/* Email/Password Form */}
        {loginMode === 'email' && (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordButton}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Phone Auth Form */}
        {loginMode === 'phone' && (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+15551234567"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Send Code</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Code Verification Form */}
        {loginMode === 'codeSent' && (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••"
                placeholderTextColor="#999"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="numeric"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleVerifyCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Verify Code</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>
            Don’t have an account?{' '}
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate('RegisterScreen')}
              disabled={loading}
            >
              Register here
            </Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// StyleSheet for component styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 25,
    width: width * 0.9,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 25,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeToggleButton: {
    backgroundColor: '#4CAF50',
  },
  toggleButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  activeToggleButtonText: {
    color: '#FFF',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '700',
    color: '#333',
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#F9FAFB',
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 15,
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  registerContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  registerText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 15,
  },
  registerLink: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
