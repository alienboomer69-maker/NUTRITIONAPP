import React, { useState, useEffect } from "react";
import { 
  View, Text, Switch, TouchableOpacity, StyleSheet, 
  TextInput, ScrollView, Alert 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  clearAllNotifications, 
  scheduleDailyNotification, 
  scheduleIntervalNotification 
} from "../utils/notificationService";
import { requestNotificationPermissions } from "../utils/permission"; // ✅ import helper

export default function NotificationSettingsScreen() {
  const [mealReminders, setMealReminders] = useState(true);
  const [waterInterval, setWaterInterval] = useState(120); // minutes
  const [activityInterval, setActivityInterval] = useState(180);
  const [quietHours, setQuietHours] = useState({ start: "22:00", end: "07:00" });
  const [motivationalTips, setMotivationalTips] = useState(true);

  // 🔹 Load saved settings
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("reminderSettings");
      if (saved) {
        const s = JSON.parse(saved);
        setMealReminders(s.mealReminders);
        setWaterInterval(s.waterInterval);
        setActivityInterval(s.activityInterval);
        setQuietHours(s.quietHours);
        setMotivationalTips(s.motivationalTips);
      }
    })();
  }, []);

  // 🔹 Save + schedule
  const saveSettings = async () => {
    try {
      // ✅ Ask for permissions before scheduling
      await requestNotificationPermissions();

      const settings = { 
        mealReminders, waterInterval, activityInterval, 
        quietHours, motivationalTips 
      };
      await AsyncStorage.setItem("reminderSettings", JSON.stringify(settings));

      clearAllNotifications();

      if (mealReminders) {
        scheduleDailyNotification(1, "🍳 Time for Breakfast!", 9, 0);
        scheduleDailyNotification(2, "🥗 Time for Lunch!", 13, 0);
        scheduleDailyNotification(3, "🍲 Time for Dinner!", 20, 0);
      }
      if (waterInterval > 0) {
        scheduleIntervalNotification(4, "💧 Drink some water!", waterInterval);
      }
      if (activityInterval > 0) {
        scheduleIntervalNotification(5, "🏃 Take a quick activity break!", activityInterval);
      }
      if (motivationalTips) {
        scheduleDailyNotification(6, "💡 Remember: Protein builds strength 💪", 8, 0);
      }

      Alert.alert("✅ Saved", "Your reminders have been scheduled!");
    } catch (err) {
      console.error("Error scheduling notifications:", err);
      Alert.alert("Error", "Could not schedule reminders. Check permissions.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>🔔 Notification Settings</Text>

      <View style={styles.row}>
        <Text>Meal Reminders</Text>
        <Switch value={mealReminders} onValueChange={setMealReminders} />
      </View>

      <View style={styles.row}>
        <Text>Water Reminder Interval (minutes)</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="numeric" 
          value={waterInterval.toString()} 
          onChangeText={(t) => setWaterInterval(Number(t))} 
        />
      </View>

      <View style={styles.row}>
        <Text>Activity Reminder Interval (minutes)</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="numeric" 
          value={activityInterval.toString()} 
          onChangeText={(t) => setActivityInterval(Number(t))} 
        />
      </View>

      <View style={styles.row}>
        <Text>Quiet Hours (start-end)</Text>
        <TextInput 
          style={styles.input} 
          value={quietHours.start} 
          onChangeText={(t) => setQuietHours({ ...quietHours, start: t })} 
        />
        <TextInput 
          style={styles.input} 
          value={quietHours.end} 
          onChangeText={(t) => setQuietHours({ ...quietHours, end: t })} 
        />
      </View>

      <View style={styles.row}>
        <Text>Motivational Tips</Text>
        <Switch value={motivationalTips} onValueChange={setMotivationalTips} />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveButtonText}>Save & Schedule</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  row: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 15, 
    justifyContent: "space-between" 
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#ccc", 
    padding: 8, 
    width: 80, 
    borderRadius: 8, 
    textAlign: "center" 
  },
  saveButton: { 
    backgroundColor: "#4CAF50", 
    padding: 15, 
    borderRadius: 10, 
    alignItems: "center", 
    marginTop: 20 
  },
  saveButtonText: { color: "#fff", fontWeight: "bold" },
});
