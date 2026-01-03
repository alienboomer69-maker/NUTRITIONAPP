import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  clearAllNotifications,
  scheduleDailyNotification,
  scheduleIntervalNotification,
  sendTestNotification,
} from "../utils/notificationService";

export default function NotificationSettingsScreen() {
  const [mealReminders, setMealReminders] = useState(true);
  const [waterInterval, setWaterInterval] = useState("120");
  const [activityInterval, setActivityInterval] = useState("180");
  const [motivationalTips, setMotivationalTips] = useState(true);

  // 🔹 Load saved settings
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("reminderSettings");
      if (saved) {
        const s = JSON.parse(saved);
        setMealReminders(s.mealReminders);
        setWaterInterval(String(s.waterInterval));
        setActivityInterval(String(s.activityInterval));
        setMotivationalTips(s.motivationalTips);
      }
    })();
  }, []);

  // 🔹 Save & schedule
  const saveSettings = async () => {
    try {
      const settings = {
        mealReminders,
        waterInterval: Number(waterInterval),
        activityInterval: Number(activityInterval),
        motivationalTips,
      };

      await AsyncStorage.setItem(
        "reminderSettings",
        JSON.stringify(settings)
      );

      await clearAllNotifications();

      if (mealReminders) {
        await scheduleDailyNotification(
          1,
          "🍳 Breakfast Time",
          "Log your breakfast",
          9,
          0,
          "MealLogScreen"
        );
        await scheduleDailyNotification(
          2,
          "🥗 Lunch Time",
          "Log your lunch",
          13,
          0,
          "MealLogScreen"
        );
        await scheduleDailyNotification(
          3,
          "🍲 Dinner Time",
          "Log your dinner",
          20,
          0,
          "MealLogScreen"
        );
      }

      if (Number(waterInterval) >= 15) {
        await scheduleIntervalNotification(
          4,
          "💧 Drink Water",
          "Time to hydrate",
          Number(waterInterval),
          "HomeScreen"
        );
      }

      if (Number(activityInterval) >= 15) {
        await scheduleIntervalNotification(
          5,
          "🏃 Activity Break",
          "Time to move your body",
          Number(activityInterval),
          "HomeScreen"
        );
      }

      if (motivationalTips) {
        await scheduleDailyNotification(
          6,
          "💡 Nutrition Tip",
          "Protein helps muscle recovery 💪",
          8,
          0,
          "HomeScreen"
        );
      }

      Alert.alert("✅ Saved", "Notifications scheduled successfully!");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to schedule notifications");
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
        <Text>Water Interval (minutes)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={waterInterval}
          onChangeText={setWaterInterval}
        />
      </View>

      <View style={styles.row}>
        <Text>Activity Interval (minutes)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={activityInterval}
          onChangeText={setActivityInterval}
        />
      </View>

      <View style={styles.row}>
        <Text>Motivational Tips</Text>
        <Switch
          value={motivationalTips}
          onValueChange={setMotivationalTips}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveText}>Save & Schedule</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: "#2196F3" }]}
        onPress={sendTestNotification}
      >
        <Text style={styles.saveText}>Send Test Notification</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    width: 80,
    borderRadius: 8,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
