import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';

// Screens
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import MealLogScreen from './screens/MealLogScreen';
import BarcodeScannerScreen from './screens/BarcodeScannerScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import GoalManagementScreen from './screens/GoalManagementScreen';
import RecommendationModule from './screens/RecommendationModule';
import AnalyticsModule from './screens/AnalyticsModule';
import NotificationSettingsScreen from './screens/NotificationSettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(currentUser => {
      setUser(currentUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {!user ? (
          <>
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="MealLogScreen" component={MealLogScreen} />
            <Stack.Screen name="BarcodeScannerScreen" component={BarcodeScannerScreen} />
            <Stack.Screen name="ProductDetailsScreen" component={ProductDetailsScreen} />
            <Stack.Screen name="GoalManagementScreen" component={GoalManagementScreen} />
            <Stack.Screen name="RecommendationModule" component={RecommendationModule} />
            <Stack.Screen name="AnalyticsModule" component={AnalyticsModule} />
            <Stack.Screen
              name="NotificationSettingsScreen"
              component={NotificationSettingsScreen}
            />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
