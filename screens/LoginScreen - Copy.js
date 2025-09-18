import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert, // Keeping Alert as it's standard for React Native for simplicity
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator // Import ActivityIndicator for loading feedback
} from 'react-native';
// Assuming AuthService.js exists and exports these functions
import { loginUser, resetPassword } from './AuthService';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // New state for loading indicator

  // Handles user login
  const handleLogin = async () => {
    // Basic input validation
    if (!email || !password) {
      return Alert.alert('Error', 'Please enter both email and password');
    }

    setLoading(true); // Start loading
    try {
      // Attempt to log in the user using AuthService
      await loginUser(email, password);
      // If login is successful, navigate to the HomeScreen and replace the current screen
      navigation.replace('HomeScreen');
    } catch (error) {
      // Display an alert if login fails
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false); // End loading
    }
  };

  // Handles password reset request
  const handleForgotPassword = async () => {
    // Ensure email is provided for password reset
    if (!email) {
      return Alert.alert('Reset Password', 'Please enter your email address first.');
    }

    setLoading(true); // Start loading
    try {
      // Attempt to send a password reset email using AuthService
      await resetPassword(email);
      // Inform the user that the email has been sent
      Alert.alert(
        'Email Sent',
        'A password reset link has been sent to your email address.'
      );
    } catch (error) {
      // Display an alert if there's an error sending the reset email
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    // KeyboardAvoidingView helps prevent the keyboard from obscuring inputs
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to continue your nutrition journey.</Text>

        {/* Email Input Group */}
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
            editable={!loading} // Disable input when loading
          />
        </View>

        {/* Password Input Group */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading} // Disable input when loading
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading} // Disable button when loading
        >
          {loading ? (
            <ActivityIndicator color="#FFF" /> // Show spinner when loading
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Forgot Password Button */}
        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotPasswordButton}
          disabled={loading} // Disable button when loading
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>
            Don’t have an account?{' '}
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate('RegisterScreen')}
              disabled={loading} // Disable link when loading
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
    backgroundColor: '#FFFFFF', // Dark background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentWrapper: {
    backgroundColor: '#FFFFFF', // White card background
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 25,
    width: width * 0.9, // Responsive width
    maxWidth: 400, // Max width for larger screens
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10, // Android shadow
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2E7D32', // Green color
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
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
    backgroundColor: '#4CAF50', // Green button
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
    color: '#2196F3', // Blue link
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
    color: '#4CAF50', // Green link
    fontWeight: 'bold',
    fontSize: 15,
  },
});
