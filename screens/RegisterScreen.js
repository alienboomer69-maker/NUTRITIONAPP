import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { registerUser } from './AuthService';
import { db } from './firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please enter both email and password');
    }

    setIsLoading(true);

    try {
      const { uid } = await registerUser(email, password);

      // Save to Firestore
      await setDoc(doc(db, 'users', uid), {
        email: email,
        name: email.split('@')[0] || 'New User',
        createdAt: serverTimestamp(),
      });

      setIsLoading(false);

      Alert.alert('Success 🎉', 'You have registered successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.replace('LoginScreen'),
        }
      ]);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Join Us!</Text>
        <Text style={styles.subtitle}>Create your account to start tracking your nutrition.</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholder="your.email@example.com"
            placeholderTextColor="#999"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#999"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Register</Text>}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginLink} onPress={() => navigation.navigate('LoginScreen')}>
              Login here
            </Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
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
  registerButton: {
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
  loginContainer: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  loginText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 15,
  },
  loginLink: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
