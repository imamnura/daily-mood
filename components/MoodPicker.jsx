import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useRef } from "react";
import * as Haptics from "expo-haptics";
import { MOODS } from "../constants/moods";

// Komponen terpisah untuk setiap tombol mood
// agar setiap tombol punya animated value sendiri
function MoodButton({ mood, isSelected, onSelect }) {
  // setiap button mempunyai scale animation sendiri
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // 1. Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // 2. Animasi "bounce" — kecil dulu lalu kembali normal
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }),
    ]).start();

    // 3. Panggil callback ke parent
    onSelect(mood);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1}>
      {/* Animated.view untuk bisa menerima animated style */}
      <Animated.View
        style={[
          styles.moodButton,
          isSelected && styles.moodButtonSelected,
          isSelected && { borderColor: mood.color },
          { transform: [{ scale: scaleAnim }] }, // animated scale
        ]}
      >
        <Text style={styles.emoji}>{mood.emoji}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// Komponent ini menerima 2 props:
// - selectedMood: mood yang sedang dipilih
// - onSelectMood: function yang dipanggil saat user pilih mood
export default function MoodPicker({ selectedMood, onSelectMood }) {
  // Animasi fade-in untuk label mood yang dipilih
  const labelAnim = useRef(new Animated.Value(0)).current;

  const handleSelect = (mood) => {
    onSelectMood(mood);

    // Fade in label
    labelAnim.setValue(0); // reset dulu
    Animated.timing(labelAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View>
      <View style={styles.row}>
        {MOODS.map((mood) => (
          <MoodButton
            key={mood.id}
            mood={mood}
            isSelected={selectedMood?.id === mood.id}
            onSelect={handleSelect}
          />
        ))}
      </View>

      {/* Label dengan animasi fade */}
      {selectedMood && (
        <Animated.View
          style={[
            styles.labelContainer,
            { backgroundColor: selectedMood.color + "20" },
            { opacity: labelAnim }, // animated opacity
          ]}
        >
          <Text style={[styles.label, { color: selectedMood.color }]}>
            {selectedMood.emoji} {selectedMood.label}
          </Text>
        </Animated.View>
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
