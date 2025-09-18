import { PermissionsAndroid, Platform, Linking } from "react-native";

/**
 * Request Notification + Exact Alarm permissions
 */
export async function requestNotificationPermissions() {
  try {
    // 🔔 Android 13+ requires POST_NOTIFICATIONS
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn("POST_NOTIFICATIONS not granted");
      }
    }

    // ⏰ Android 12+ requires SCHEDULE_EXACT_ALARM (but user must allow it in Settings)
    if (Platform.OS === "android" && Platform.Version >= 31) {
      // We can't request this like a normal runtime permission,
      // so we must send user to the system settings page
      await Linking.openSettings(); 
      // This opens app settings → user must enable "Alarms & reminders"
    }
  } catch (err) {
    console.error("Permission error:", err);
  }
}
