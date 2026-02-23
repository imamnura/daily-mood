import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

//Data mood kita definisikan di luar komponen
// karena nilainya tidak pernah berubah (konstanta)
const MOODS = [
  { id: 1, emoji: "😄", label: "Great", color: "#4CAF50" },
  { id: 2, emoji: "🙂", label: "Good", color: "#8BC34A" },
  { id: 3, emoji: "😐", label: "Okay", color: "#FFC107" },
  { id: 4, emoji: "😔", label: "Bad", color: "#FF9800" },
  { id: 5, emoji: "😢", label: "Awful", color: "#F44336" },
];

// Komponent ini menerima 2 props:
// - selectedMood: mood yang sedang dipilih
// - onSelectMood: function yang dipanggil saat user pilih mood
export default function MoodPicker({ selectedMood, onSelectMood }) {
  return (
    <View>
      {/* Row berisi semua emoji */}
      <View style={styles.row}>
        {MOODS.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={[
              styles.moodButton,
              // Kalau mood ini yang dipilih, tambahkan style 'selected'
              // Ini adalah conditional style — sangat umum di RN
              selectedMood?.id === mood.id && styles.moodButtonSelected,
              // Kalau dipilih, border pakai warna mood tersebut
              selectedMood?.id === mood.id && { borderColor: mood.color },
            ]}
            onPress={() => onSelectMood(mood)}
            // Feedback haptic saat ditekan (feel lebih native)
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{mood.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tampilkan label mood yang dipilih */}
      {selectedMood && (
        <View
          style={[
            styles.labelContainer,
            { backgroundColor: selectedMood.color + "20" },
          ]}
        >
          <Text style={[styles.label, { color: selectedMood.color }]}>
            {selectedMood.emoji} {selectedMood.label}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", // Susun emoji secara horizontal
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  moodButton: {
    width: 56,
    height: 56,
    borderRadius: 28, // Bulat sempurna (width/2)
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent", // Default transparan, berubah saat dipilih
  },
  moodButtonSelected: {
    backgroundColor: "#FFFFFF",
    // Shadow untuk efek "terangkat" saat dipilih
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4, // Shadow khusus Android
  },
  emoji: {
    fontSize: 28,
  },
  labelContainer: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "center", // Hanya selebar kontennya (bukan stretch)
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
});
