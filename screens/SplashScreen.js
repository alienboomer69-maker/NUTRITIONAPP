import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('LoginScreen'); // Change to your actual screen name
    }, 2000); // 2 seconds splash

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
