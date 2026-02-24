import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import MoodPicker from "../components/MoodPicker";
import { useMood } from "../context/MoodContext";

function getFormattedDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString("id-ID", options);
}

export default function HomeScreen() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { addMood } = useMood();

  const handleSave = async () => {
    if (!selectedMood) {
      Alert.alert("Opps!", "Pilih mood kamu dulu ya 😊");
      return;
    }

    setIsSaving(true);
    try {
      await addMood({
        id: Date.now().toString(),
        mood: selectedMood,
        note: note.trim(),
        date: new Date().toISOString(),
      });

      Alert.alert(
        "Tersimpan! 🎉",
        `Mood "${selectedMood.label}" berhasil dicatat!`,
      );
      setSelectedMood(null);
      setNote("");
    } catch (error) {
      Alert.alert("Error", "Gagal menyimpan mood. Coba lagi.");
    } finally {
      setIsSaving(false); // finally selalu dijalankan, error atau tidak
    }
  };

  return (
    // KeyboardAvoidingView mencegah keyboard menutupi input
    // behavior 'padding' di IOS, 'height' di Android
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        // Keyboard dismiss saat scroll
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Halo! 👋</Text>
          <Text style={styles.date}>{getFormattedDate()}</Text>
        </View>

        {/* Card Utama */}
        <View style={styles.card}>
          <Text style={styles.question}>
            Bagaimana perasaanmu{"\n"} hari ini ?
          </Text>

          <MoodPicker
            selectedMood={selectedMood}
            onSelectMood={setSelectedMood}
          />
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Catatan (opsional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ceritakan lebih lanjut..."
            placeholderTextColor={"#BDBDBD"}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
            maxLength={200}
            textAlignVertical="top" //Text mulai dari atas (Android)
          />
          <Text style={styles.charCount}>{note.length}/200</Text>
        </View>

        {/* Button Save */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            // Tombol disabled kalo belum pilih mood
            !selectedMood && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Simpan Mood</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    padding: 20,
    paddingBottom: 40, //Extra space di bawah agar tidak terpotong
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#212121",
  },
  date: {
    fontSize: 14,
    color: "#757575",
    marginTop: 4,
    textTransform: "capitalize",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  question: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212121",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 30, // Jarak antar baris teks
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#212121",
    minHeight: 100,
    backgroundColor: "#FAFAFA",
  },
  charCount: {
    textAlign: "right",
    color: "#BDBDBD",
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#6C63FF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#C5C5C5",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
