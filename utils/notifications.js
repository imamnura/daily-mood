import * as Notifications from "expo-notifications";
import { PLatform } from "react-native";

// Konfigurasi bagaimana notifikasi ditampilkan saat app sedang buka
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Minta permission notifikasi dari user
export async function requestNotificationPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// Jalankan reminder harian
export async function scheduleDailyReminder(hour = 20, minute = 0) {
  // Hapus semua notifikasi yang sudah di jadwalkan sebelumnya
  await Notifications.cancelAllScheduledNotificationsAsync();

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "DailyMood 🌟",
      body: "Jangan lupa catat moodmu hari ini!",
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true, // Ulangi setiap hari
    },
  });

  return true;
}

// Batalkan semua notifikasi
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Cek apakah ada reminder yang aktif
export async function getScheduledReminders() {
  return await Notifications.getAllScheduledNotificationsAsync();
}
