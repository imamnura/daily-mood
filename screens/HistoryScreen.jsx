import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useMood } from "../context/MoodContext";
import { formatDate, formatTime } from "../utils/storage";

function MoodItem({ item, onDelete }) {
  const handleDelete = () => {
    Alert.alert("Hapus Mood", "Yakin ingin menghapus catatan ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive", //merah di IOS
        onPress: () => onDelete(item.id),
      },
    ]);
  };

  return (
    <View style={styles.item}>
      {/* Kiri: emoji dan info mood */}
      <View
        style={[
          styles.moodIndicator,
          {
            backgroundColor: item.mood.color + "20",
          },
        ]}
      >
        <Text style={styles.itemEmoji}>{item.mood.emoji}</Text>
      </View>

      {/* Tengah Detail */}
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemMoodLabel}>{item.mood.label}</Text>
          <Text style={styles.itemTime}>{formatTime(item.date)}</Text>
        </View>
        <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
        {item.note ? (
          <Text style={styles.itemNote} numberOfLines={2}>
            "{item.note}"
          </Text>
        ) : null}
      </View>

      {/* Kanan Tombol hapus */}
      <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
        <Text style={styles.deleteBtnText}>x</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📭</Text>
      <Text style={styles.emptyTitle}>Belum ada catatan</Text>
      <Text style={styles.emptySubtitle}>
        Mulai catat moodmu hari ini!{"\n"}
        Pergi ke tab Home untuk memulai.
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const { moods, isLoading, removeMood } = useMood();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={"large"} color={"#6C63FF"} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Histori Mood</Text>
        {moods.length > 0 && (
          <Text style={styles.subtitle}>{moods.length} catatan</Text>
        )}
      </View>

      <FlatList
        data={moods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MoodItem item={item} onDelete={removeMood} />
        )}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={[
          styles.list,
          moods.length === 0 && styles.listEmpty,
        ]}
        // Performa: memberitahu Flatlist bahwa tinggi item sama
        // sehingga tidak perlu di kalkulasi ulang
        // getItemLayout={(data, index) => (
        //   { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
        // )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#212121" },
  subtitle: { fontSize: 14, color: "#757575" },
  list: { padding: 20, paddingTop: 8 },
  listEmpty: { flex: 1 },

  // Item styles
  item: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  moodIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemEmoji: { fontSize: 24 },
  itemContent: { flex: 1 }, // flex: 1 agar mengambil sisa ruang
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemMoodLabel: { fontSize: 16, fontWeight: "600", color: "#212121" },
  itemTime: { fontSize: 12, color: "#9E9E9E" },
  itemDate: { fontSize: 13, color: "#757575", marginTop: 2 },
  itemNote: {
    fontSize: 13,
    color: "#9E9E9E",
    fontStyle: "italic",
    marginTop: 6,
  },
  deleteBtn: { padding: 8, marginLeft: 8 },
  deleteBtnText: { color: "#BDBDBD", fontSize: 16 },

  // Empty state styles
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 24,
  },
});
