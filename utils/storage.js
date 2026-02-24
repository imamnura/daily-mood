import AsyncStorage from "@react-native-async-storage/async-storage";

const MOODS_KEY = "dailymood:moods";

// Ambil semua mood dari storage
export async function getMoods() {
  try {
    const raw = await AsyncStorage.getItem(MOODS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.log("Gagal membaca mood", error);
    return [];
  }
}

// Simpan satu mood baru (ditambahkan kedepan array)
export async function saveMood(payload) {
  try {
    const existing = await getMoods();
    const updated = [payload, ...existing];
    await AsyncStorage.setItem(MOODS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.log("Gagal menyimpan mood", error);
    throw error; // re throw agar bisa di handle di tempat pemanggil
  }
}

export async function deleteMood(id) {
  try {
    const existing = await getMoods();
    const updated = existing.filter((item) => item.id !== id);
    await AsyncStorage.setItem(MOODS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.log("Gagal menghapus mood", error);
    throw error;
  }
}

// Format tanggal untuk ditampilkan
export function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Format waktu untuk ditampilkan
export function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
