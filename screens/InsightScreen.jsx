import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useMood } from "../context/MoodContext";
import {
  scheduleDailyReminder,
  cancelAllReminders,
  getScheduledReminders,
} from "../utils/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MOODS_META = [
  { label: "Great", emoji: "😄", color: "#4CAF50" },
  { label: "Good", emoji: "🙂", color: "#8BC34A" },
  { label: "Okay", emoji: "😐", color: "#FFC107" },
  { label: "Bad", emoji: "😔", color: "#FF9800" },
  { label: "Awful", emoji: "😢", color: "#F44336" },
];

// ─── Sub-komponen: Kartu Statistik Ringkas ───────────────────
function StatCard({ emoji, label, value, color }) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statCard,
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
    >
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

// ─── Sub-komponen: Bar Chart Sederhana ───────────────────────
function MoodBarChart({ moods }) {
  if (moods.length === 0) return null;

  // Hitung jumlah setiap mood
  const counts = MOODS_META.map((meta) => ({
    ...meta,
    count: moods.filter((m) => m.mood.label === meta.label).length,
  }));

  const maxCount = Math.max(...counts.map((c) => c.count), 1);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionTitle}>Distribusi Mood</Text>
      {counts.map((item) => {
        // Animasi bar width
        const widthAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
          Animated.timing(widthAnim, {
            toValue: (item.count / maxCount) * 100,
            duration: 600,
            delay: MOODS_META.indexOf(item) * 100, // stagger per bar
            useNativeDriver: false, // false karena animasi width (layout property)
          }).start();
        }, [item.count]);

        return (
          <View key={item.label} style={styles.barRow}>
            <Text style={styles.barEmoji}>{item.emoji}</Text>
            <View style={styles.barTrack}>
              <Animated.View
                style={[
                  styles.barFill,
                  {
                    backgroundColor: item.color,
                    width: widthAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.barCount}>{item.count}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Sub-komponen: Setting Notifikasi ────────────────────────
function NotificationSetting() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(20);

  // Cek apakah sudah ada reminder aktif saat komponen mount
  useEffect(() => {
    const checkReminder = async () => {
      const reminders = await getScheduledReminders();
      setIsEnabled(reminders.length > 0);

      // Load jam yang tersimpan
      const savedHour = await AsyncStorage.getItem("reminderHour");
      if (savedHour) setReminderHour(parseInt(savedHour));
    };
    checkReminder();
  }, []);

  const toggleReminder = async (value) => {
    if (value) {
      const success = await scheduleDailyReminder(reminderHour, 0);
      if (success) {
        setIsEnabled(true);
        Alert.alert(
          "Reminder aktif! ✅",
          `Kamu akan diingatkan setiap jam ${reminderHour}:00`,
        );
      } else {
        Alert.alert(
          "Gagal",
          "Izin notifikasi diperlukan. Aktifkan di Settings HP kamu.",
        );
      }
    } else {
      await cancelAllReminders();
      setIsEnabled(false);
    }
  };

  const changeHour = async (delta) => {
    const newHour = Math.min(23, Math.max(6, reminderHour + delta));
    setReminderHour(newHour);
    await AsyncStorage.setItem("reminderHour", newHour.toString());

    // Update jadwal kalau reminder aktif
    if (isEnabled) {
      await scheduleDailyReminder(newHour, 0);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>🔔 Reminder Harian</Text>

      <View style={styles.reminderRow}>
        <Text style={styles.reminderLabel}>Aktifkan reminder</Text>
        <Switch
          value={isEnabled}
          onValueChange={toggleReminder}
          trackColor={{ false: "#E0E0E0", true: "#6C63FF40" }}
          thumbColor={isEnabled ? "#6C63FF" : "#BDBDBD"}
        />
      </View>

      {/* Pengatur jam — hanya tampil kalau reminder aktif */}
      {isEnabled && (
        <View style={styles.timePickerRow}>
          <Text style={styles.reminderLabel}>Jam reminder</Text>
          <View style={styles.timePicker}>
            <TouchableOpacity
              style={styles.timeBtn}
              onPress={() => changeHour(-1)}
            >
              <Text style={styles.timeBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.timeValue}>
              {reminderHour.toString().padStart(2, "0")}:00
            </Text>
            <TouchableOpacity
              style={styles.timeBtn}
              onPress={() => changeHour(1)}
            >
              <Text style={styles.timeBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Screen Utama ─────────────────────────────────────────────
export default function InsightScreen() {
  const { moods } = useMood();

  // ── Kalkulasi statistik ──
  const totalMoods = moods.length;

  // Mood terbanyak
  const moodCounts = MOODS_META.map((meta) => ({
    ...meta,
    count: moods.filter((m) => m.mood.label === meta.label).length,
  }));
  const topMood = moodCounts.reduce(
    (best, curr) => (curr.count > best.count ? curr : best),
    { count: 0 },
  );

  // Hitung streak — berapa hari berturut-turut mencatat mood
  const calculateStreak = () => {
    if (moods.length === 0) return 0;

    // Ambil tanggal unik yang sudah di-record (format YYYY-MM-DD)
    const uniqueDates = [...new Set(moods.map((m) => m.date.split("T")[0]))]
      .sort()
      .reverse(); // urutkan dari terbaru

    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    for (const dateStr of uniqueDates) {
      const date = new Date(dateStr);
      const diffDays = Math.round((checkDate - date) / (1000 * 60 * 60 * 24));

      if (diffDays === 0 || diffDays === 1) {
        streak++;
        checkDate = date;
      } else {
        break; // Streak terputus
      }
    }
    return streak;
  };

  // Rata-rata mood (Great=5, Good=4, Okay=3, Bad=2, Awful=1)
  const moodScore = { Great: 5, Good: 4, Okay: 3, Bad: 2, Awful: 1 };
  const avgScore =
    moods.length > 0
      ? (
          moods.reduce((sum, m) => sum + (moodScore[m.mood.label] || 3), 0) /
          moods.length
        ).toFixed(1)
      : "-";

  const streak = calculateStreak();

  // ── Render ──
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Insights 📊</Text>

      {/* Empty state */}
      {totalMoods === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={styles.emptyTitle}>Belum ada data</Text>
          <Text style={styles.emptySubtitle}>
            Mulai catat moodmu untuk melihat insights!
          </Text>
        </View>
      ) : (
        <>
          {/* Kartu statistik ringkas */}
          <View style={styles.statsGrid}>
            <StatCard
              emoji="📝"
              label="Total Catatan"
              value={totalMoods}
              color="#6C63FF"
            />
            <StatCard
              emoji="🔥"
              label="Streak"
              value={`${streak} hari`}
              color="#FF6B35"
            />
            <StatCard
              emoji={topMood.emoji || "😐"}
              label="Mood Terbanyak"
              value={topMood.label || "-"}
              color={topMood.color || "#757575"}
            />
            <StatCard
              emoji="⭐"
              label="Rata-rata"
              value={avgScore}
              color="#FFC107"
            />
          </View>

          {/* Bar chart */}
          <View style={styles.card}>
            <MoodBarChart moods={moods} />
          </View>

          {/* Mood 7 hari terakhir */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>7 Hari Terakhir</Text>
            <LastSevenDays moods={moods} />
          </View>
        </>
      )}

      {/* Setting notifikasi — selalu tampil */}
      <NotificationSetting />
    </ScrollView>
  );
}

// ─── Sub-komponen: 7 Hari Terakhir ───────────────────────────
function LastSevenDays({ moods }) {
  // Generate 7 hari ke belakang
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i)); // 6 hari lalu sampai hari ini
    const dateStr = date.toISOString().split("T")[0];

    // Cari mood di hari ini
    const entry = moods.find((m) => m.date.split("T")[0] === dateStr);

    return {
      dateStr,
      dayLabel: date.toLocaleDateString("id-ID", { weekday: "short" }),
      dayNum: date.getDate(),
      entry,
    };
  });

  return (
    <View style={styles.weekRow}>
      {days.map((day) => (
        <View key={day.dateStr} style={styles.dayColumn}>
          <Text style={styles.dayEmoji}>
            {day.entry ? day.entry.mood.emoji : "○"}
          </Text>
          <Text style={styles.dayNum}>{day.dayNum}</Text>
          <Text style={styles.dayLabel}>{day.dayLabel}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  content: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 20,
  },

  // Stats Grid — 2 kolom
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap", // Wrap ke baris berikutnya kalau tidak muat
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: "47%", // ~2 kolom dengan gap
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statEmoji: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  statLabel: { fontSize: 12, color: "#9E9E9E", textAlign: "center" },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 16,
  },

  // Bar Chart
  chartContainer: {},
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  barEmoji: { fontSize: 20, width: 32 },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 6,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 6 },
  barCount: { fontSize: 13, color: "#757575", width: 24, textAlign: "right" },

  // 7 Hari Terakhir
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayColumn: { alignItems: "center", flex: 1 },
  dayEmoji: { fontSize: 20, marginBottom: 4 },
  dayNum: { fontSize: 14, fontWeight: "600", color: "#212121" },
  dayLabel: { fontSize: 11, color: "#9E9E9E", marginTop: 2 },

  // Reminder
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  timePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  reminderLabel: { fontSize: 15, color: "#424242" },
  timePicker: { flexDirection: "row", alignItems: "center" },
  timeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
  },
  timeBtnText: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  timeValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
    marginHorizontal: 16,
  },

  // Empty State
  emptyContainer: { alignItems: "center", paddingVertical: 48 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 8,
  },
  emptySubtitle: { fontSize: 15, color: "#9E9E9E", textAlign: "center" },
});
