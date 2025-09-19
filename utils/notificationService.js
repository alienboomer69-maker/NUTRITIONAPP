import PushNotification from "react-native-push-notification";

// ✅ Create notification channel at startup
PushNotification.createChannel(
  {
    channelId: "default-channel-id", 
    channelName: "Default Channel", 
    channelDescription: "General notifications",
    soundName: "default",
    importance: 4,
    vibrate: true,
  },
  (created) => console.log(`Notification channel created: ${created}`)
);

// 🔹 Clear all notifications
export const clearAllNotifications = () => {
  PushNotification.cancelAllLocalNotifications();
};

// 🔹 Schedule daily notification
export const scheduleDailyNotification = (id, message, hour, minute) => {
  PushNotification.localNotificationSchedule({
    channelId: "default-channel-id",
    id: id.toString(),
    title: "Reminder",
    message: message,
    date: getNextTriggerDate(hour, minute),
    repeatType: "day",
    allowWhileIdle: true,
  });
};

// 🔹 Schedule interval notification
export const scheduleIntervalNotification = (id, message, minutes) => {
  PushNotification.localNotificationSchedule({
    channelId: "default-channel-id",
    id: id.toString(),
    title: "Reminder",
    message: message,
    date: new Date(Date.now() + minutes * 60 * 1000),
    repeatType: "time",
    repeatTime: minutes * 60 * 1000,
    allowWhileIdle: true,
  });
};

// 🔹 Helper function
function getNextTriggerDate(hour, minute) {
  const now = new Date();
  const trigger = new Date();
  trigger.setHours(hour);
  trigger.setMinutes(minute);
  trigger.setSeconds(0);
  if (trigger <= now) {
    trigger.setDate(trigger.getDate() + 1);
  }
  return trigger;
}

// 🔹 Instant test notification
export const sendTestNotification = () => {
  PushNotification.localNotification({
    channelId: "default-channel-id",
    title: "🔔 Test Notification",
    message: "If you see this, notifications are working!",
    playSound: true,
    soundName: "default",
    importance: 4,
    vibrate: true,
  });
};
