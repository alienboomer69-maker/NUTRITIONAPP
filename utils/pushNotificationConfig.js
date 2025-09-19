import { Platform, PermissionsAndroid } from "react-native";
import PushNotification from "react-native-push-notification";

/**
 * Request Notification permissions (Android 13+ requires POST_NOTIFICATIONS)
 */
export async function requestNotificationPermissions() {
  try {
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn("⚠️ POST_NOTIFICATIONS permission not granted");
      }
    }
  } catch (err) {
    console.error("Permission error:", err);
  }
}

/**
 * Configure Push Notifications & create default channel
 */
export function configurePushNotifications() {
  PushNotification.createChannel(
    {
      channelId: "default-channel-id",
      channelName: "Default Channel",
      channelDescription: "General notifications",
      importance: 4,
      vibrate: true,
    },
    (created) => console.log(`✅ Notification channel created: ${created}`)
  );

  PushNotification.configure({
    onRegister: (token) => {
      console.log("📲 Notification Token:", token);
    },
    onNotification: (notification) => {
      console.log("🔔 Notification received:", notification);
    },
    onRegistrationError: (err) => {
      console.error("❌ Notification error:", err);
    },
    requestPermissions: false, // handled manually above
  });
}
