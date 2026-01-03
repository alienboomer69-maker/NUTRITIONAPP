import notifee, {
  AndroidImportance,
  TriggerType,
  EventType,
} from "@notifee/react-native";

// 🔹 Create / ensure notification channel
export async function ensureChannel() {
  const channelId = await notifee.createChannel({
    id: "default",
    name: "General Notifications",
    importance: AndroidImportance.HIGH,
  });
  return channelId;
}

// 🔹 Clear all notifications
export async function clearAllNotifications() {
  await notifee.cancelAllNotifications();
}

// 🔹 Daily notification (fixed)
export async function scheduleDailyNotification(
  id,
  title,
  body,
  hour,
  minute,
  screen
) {
  if (!title || !body) return;

  const channelId = await ensureChannel();

  const now = new Date();
  const triggerDate = new Date();
  triggerDate.setHours(hour, minute, 0, 0);

  if (triggerDate <= now) {
    triggerDate.setDate(triggerDate.getDate() + 1);
  }

  await notifee.createTriggerNotification(
    {
      id: `daily-${String(id)}`, // ✅ STRING
      title: String(title),
      body: String(body),
      android: {
        channelId,
        pressAction: { id: "default" },
      },
      data: screen ? { screen: String(screen) } : {},
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerDate.getTime(),
      repeatFrequency: TriggerType.DAILY,
    }
  );
}

// 🔹 Interval notification (Android-safe)
export async function scheduleIntervalNotification(
  id,
  title,
  body,
  minutes,
  screen
) {
  if (!title || !body) return;
  if (minutes < 15) return; // ❗ Android rule

  const channelId = await ensureChannel();

  await notifee.createTriggerNotification(
    {
      id: `interval-${String(id)}`,
      title: String(title),
      body: String(body),
      android: {
        channelId,
        pressAction: { id: "default" },
      },
      data: screen ? { screen: String(screen) } : {},
    },
    {
      type: TriggerType.INTERVAL,
      interval: minutes * 60 * 1000,
    }
  );
}

// 🔹 Test notification (instant)
export async function sendTestNotification() {
  const channelId = await ensureChannel();

  await notifee.displayNotification({
    title: "✅ Test Notification",
    body: "Notifications are working correctly!",
    android: {
      channelId,
      pressAction: { id: "default" },
    },
  });
}
