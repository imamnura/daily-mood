import AsyncStorage from "@react-native-async-storage/async-storage";

const MOODS_KEY = "dailymood:moods";

function logError(message, error) {
  if (__DEV__) console.warn(message, error);
}

// Baca mood dari storage dan LEMPAR error kalau gagal.
// Dipakai di jalur tulis: kalau baca gagal kita tidak boleh lanjut menulis,
// karena akan menimpa seluruh histori dengan array kosong.
async function readMoodsOrThrow() {
  const raw = await AsyncStorage.getItem(MOODS_KEY);
  if (!raw) return [];

  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Data mood di storage tidak valid");
  }
  return parsed;
}

// Ambil semua mood untuk ditampilkan (aman: kembalikan [] kalau gagal)
export async function getMoods() {
  try {
    return await readMoodsOrThrow();
  } catch (error) {
    logError("Gagal membaca mood", error);
    return [];
  }
}

// Simpan satu mood baru (ditambahkan kedepan array)
export async function saveMood(payload) {
  try {
    const existing = await readMoodsOrThrow();
    const updated = [payload, ...existing];
    await AsyncStorage.setItem(MOODS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    logError("Gagal menyimpan mood", error);
    throw error; // re throw agar bisa di handle di tempat pemanggil
  }
}

export async function deleteMood(id) {
  try {
    const existing = await readMoodsOrThrow();
    const updated = existing.filter((item) => item.id !== id);
    await AsyncStorage.setItem(MOODS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    logError("Gagal menghapus mood", error);
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
