import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View, StyleSheet } from "react-native";

// Firebase Auth
import auth from "@react-native-firebase/auth";

// Screens
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import MealLogScreen from "./screens/MealLogScreen";
import GoalManagementScreen from "./screens/GoalManagementScreen";
import RecommendationModule from "./screens/RecommendationModule";
import AnalyticsModule from "./screens/AnalyticsModule";
import BarcodeScannerScreen from "./screens/BarcodeScannerScreen";
import NotificationSettingsScreen from "./screens/NotificationSettingsScreen"; // ✅ NEW

const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  function onAuthStateChange(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChange);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="MealLogScreen" component={MealLogScreen} />
            <Stack.Screen
              name="GoalManagementScreen"
              component={GoalManagementScreen}
            />
            <Stack.Screen
              name="RecommendationModule"
              component={RecommendationModule}
            />
            <Stack.Screen name="AnalyticsModule" component={AnalyticsModule} />
            <Stack.Screen
              name="BarcodeScannerScreen"
              component={BarcodeScannerScreen}
            />
            <Stack.Screen
              name="NotificationSettingsScreen"
              component={NotificationSettingsScreen}
            /> 
          </>
        ) : (
          <>
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0c0c0bff",
  },
});
