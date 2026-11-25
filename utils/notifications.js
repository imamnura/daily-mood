import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: true,
  });
}

export async function scheduleDailyReminder(hour = 20, minute = 0) {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return false;

  if (Platform.OS === "android") {
    await ensureAndroidChannel();
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "DailyMood 🌟",
      body: "Jangan lupa catat moodmu hari ini!",
      sound: true,
    },
    // Sejak SDK 52 trigger WAJIB punya `type`. Tanpa `type`, Android
    // menganggapnya trigger "channel" (notifikasi muncul seketika, tidak
    // berulang) dan iOS menolaknya sebagai trigger tidak valid.
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY, // Ulangi setiap hari
      hour,
      minute,
      channelId: "default", // Diabaikan di iOS
    },
  });

  return true;
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledReminders() {
  return await Notifications.getAllScheduledNotificationsAsync();
}
