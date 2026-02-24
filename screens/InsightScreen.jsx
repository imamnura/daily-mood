import { View, Text, StyleSheet } from "react-native";
import { useMood } from "../context/MoodContext";

export default function InsightScreen() {
  const { moods } = useMood();

  //Hitung total dan mood terbanyak
  const total = moods.length;
  const moodCount = moods.reduce((acc, entry) => {
    acc[entry.mood.label] = (acc[entry.mood.label] || 0) + 1;
    return acc;
  }, {});
  const topMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insights</Text>
      <Text style={styles.stat}>Total catatan: {total}</Text>
      {topMood && (
        <Text style={styles.stat}>
          Mood Terbanyak: {topMood[0]} ({topMood[1]}x)
        </Text>
      )}
      <Text style={styles.coming}>
        📊 Statistik lengkap coming soon di minggu 3!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 24,
  },
  stat: { fontSize: 16, color: "#424242", marginBottom: 12 },
  coming: {
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 24,
    textAlign: "center",
  },
});
