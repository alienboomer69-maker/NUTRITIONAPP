import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { auth, db } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// This is a simplified ProfileScreen component with core functionality.
export default function ProfileScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [isReady, setIsReady] = useState(false); // New state to track if auth is ready

  // Auth state listener: fetches user data or navigates to login if no user.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Only fetch profile if a user is logged in
        fetchProfile(user.uid);
      } else {
        // Navigate to LoginScreen if no user is found
        navigation.replace('LoginScreen');
        setIsReady(true); // Ensure isReady is set to true even if there is no user
      }
    });

    return unsubscribe;
  }, []);

  // Fetches user profile data from Firestore
  const fetchProfile = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || '');
        setAge(data.age?.toString() || '');
        setWeight(data.weight?.toString() || '');
      } else {
        Alert.alert('Welcome!', 'Please fill in your details and save.');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile.');
    } finally {
      // Set the component as ready to render the form after fetching is complete
      setIsReady(true);
    }
  };

  // Handles saving the profile data to Firestore
  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User not logged in. Please try again.');
      return;
    }

    try {
      await setDoc(doc(db, 'users', user.uid), {
        name,
        age: age ? Number(age) : null,
        weight: weight ? Number(weight) : null,
        updatedAt: new Date()
      }, { merge: true });

      Alert.alert('Success', 'Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  // Handles user logout. The `onAuthStateChanged` listener will handle navigation.
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  // The main UI for the profile screen
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Your Profile</Text>
      
      {isReady ? (
        // Render the form only when the component is ready
        <>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          
          <Text style={styles.label}>Age</Text>
          <TextInput
            placeholder="Enter your age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            style={styles.input}
          />
          
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            placeholder="Enter your weight"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            style={styles.input}
          />
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Text style={styles.buttonText}>Save Profile</Text>
          </TouchableOpacity>
        </>
      ) : (
        // Show a simple loading message while checking auth state
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading...</Text>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    borderColor: 'red',
    borderWidth: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  logoutText: {
    color: 'red',
    fontWeight: 'bold',
  },
});
