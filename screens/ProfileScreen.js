import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { launchImageLibrary } from "react-native-image-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function ProfileScreen({ navigation }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState(null);

  // 🔹 Load saved profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await AsyncStorage.getItem("userProfile");
        if (profile) {
          const data = JSON.parse(profile);
          setName(data.name || "");
          setAge(data.age || "");
          setWeight(data.weight || "");
          setGender(data.gender || "");
          setDietaryPreferences(data.dietaryPreferences || "");
          setEmail(data.email || "");
          setPhotoURL(data.photoURL || null);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    loadProfile();
  }, []);

  // 🔹 Pick Image
  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      quality: 0.8,
    });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      setPhotoURL(result.assets[0].uri);
    }
  };

  // 🔹 Save Profile
  const handleSaveProfile = async () => {
    try {
      const profile = {
        name,
        age,
        weight,
        gender,
        dietaryPreferences,
        email,
        photoURL,
        updatedAt: new Date(),
      };
      await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
      Alert.alert("✅ Saved", "Your profile has been updated.");
      navigation.navigate("HomeScreen");
    } catch (error) {
      Alert.alert("❌ Error", "Could not save profile.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Your Profile</Text>

      {/* Avatar */}
      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Icon name="account-circle" size={80} color="#6A11CB" />
          </View>
        )}
        <Text style={styles.changePhoto}>Change Photo</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        placeholder="Enter your full name"
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

      <Text style={styles.label}>Gender</Text>
      <TextInput
        placeholder="Enter your gender"
        value={gender}
        onChangeText={setGender}
        style={styles.input}
      />

      <Text style={styles.label}>Dietary Preferences</Text>
      <TextInput
        placeholder="e.g., Vegetarian, Vegan, etc."
        value={dietaryPreferences}
        onChangeText={setDietaryPreferences}
        style={styles.input}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        style={[styles.input, { backgroundColor: "#FAFAFA" }]}
      />

      <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
        <Text style={styles.buttonText}>Save Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#F9FAFB" },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 20,
  },
  label: { marginBottom: 5, fontWeight: "600", color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    backgroundColor: "#FFF",
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: { color: "#FFF", textAlign: "center", fontWeight: "bold" },

  // Avatar
  avatarContainer: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 8 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#DDD",
    justifyContent: "center",
    alignItems: "center",
  },
  changePhoto: { color: "#4CAF50", fontWeight: "600" },
});
