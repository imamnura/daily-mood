import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  deleteMood,
  formatDate,
  formatTime,
  getMoods,
  saveMood,
} from "../storage";

const MOODS_KEY = "dailymood:moods";

const entry = (id, label = "Good") => ({
  id,
  mood: { id: 2, emoji: "🙂", label, color: "#8BC34A" },
  note: "",
  createdAt: "2026-11-25T03:00:00.000Z",
});

async function readRaw() {
  return AsyncStorage.getItem(MOODS_KEY);
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  // storage.js memanggil console.warn di __DEV__ saat gagal; bungkam di test.
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  console.warn.mockRestore();
});

describe("getMoods", () => {
  it("mengembalikan [] jika storage kosong", async () => {
    await expect(getMoods()).resolves.toEqual([]);
  });

  it("mengembalikan data yang tersimpan", async () => {
    const data = [entry("a"), entry("b")];
    await AsyncStorage.setItem(MOODS_KEY, JSON.stringify(data));
    await expect(getMoods()).resolves.toEqual(data);
  });

  it("mengembalikan [] (tidak throw) jika JSON korup", async () => {
    await AsyncStorage.setItem(MOODS_KEY, "{bukan json");
    await expect(getMoods()).resolves.toEqual([]);
  });

  it("mengembalikan [] jika data bukan array", async () => {
    await AsyncStorage.setItem(MOODS_KEY, JSON.stringify({ id: "a" }));
    await expect(getMoods()).resolves.toEqual([]);
  });

  it("mengembalikan [] jika AsyncStorage gagal dibaca", async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error("disk error"));
    await expect(getMoods()).resolves.toEqual([]);
  });
});

describe("saveMood", () => {
  it("menyimpan entri pertama ke storage kosong", async () => {
    const result = await saveMood(entry("a"));
    expect(result).toEqual([entry("a")]);
    expect(JSON.parse(await readRaw())).toEqual([entry("a")]);
  });

  it("menambahkan entri baru di depan histori", async () => {
    await AsyncStorage.setItem(MOODS_KEY, JSON.stringify([entry("a")]));
    const result = await saveMood(entry("b"));
    expect(result.map((m) => m.id)).toEqual(["b", "a"]);
    expect(JSON.parse(await readRaw()).map((m) => m.id)).toEqual(["b", "a"]);
  });

  it("melempar error dan TIDAK menimpa data jika JSON korup", async () => {
    await AsyncStorage.setItem(MOODS_KEY, "{bukan json");
    AsyncStorage.setItem.mockClear();

    await expect(saveMood(entry("b"))).rejects.toThrow(SyntaxError);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(await readRaw()).toBe("{bukan json");
  });

  it("melempar error dan TIDAK menimpa data jika data bukan array", async () => {
    const raw = JSON.stringify({ id: "a" });
    await AsyncStorage.setItem(MOODS_KEY, raw);
    AsyncStorage.setItem.mockClear();

    await expect(saveMood(entry("b"))).rejects.toThrow(
      "Data mood di storage tidak valid",
    );
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(await readRaw()).toBe(raw);
  });

  it("melempar error dan TIDAK menulis jika AsyncStorage gagal dibaca", async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error("disk error"));
    await expect(saveMood(entry("b"))).rejects.toThrow("disk error");
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("meneruskan error jika AsyncStorage gagal ditulis", async () => {
    AsyncStorage.setItem.mockRejectedValueOnce(new Error("disk penuh"));
    await expect(saveMood(entry("b"))).rejects.toThrow("disk penuh");
  });
});

describe("deleteMood", () => {
  it("menghapus entri berdasarkan id", async () => {
    await AsyncStorage.setItem(
      MOODS_KEY,
      JSON.stringify([entry("a"), entry("b"), entry("c")]),
    );
    const result = await deleteMood("b");
    expect(result.map((m) => m.id)).toEqual(["a", "c"]);
    expect(JSON.parse(await readRaw()).map((m) => m.id)).toEqual(["a", "c"]);
  });

  it("tidak mengubah data jika id tidak ditemukan", async () => {
    await AsyncStorage.setItem(MOODS_KEY, JSON.stringify([entry("a")]));
    await expect(deleteMood("x")).resolves.toEqual([entry("a")]);
  });

  it("melempar error dan TIDAK menimpa data jika JSON korup", async () => {
    await AsyncStorage.setItem(MOODS_KEY, "{bukan json");
    AsyncStorage.setItem.mockClear();

    await expect(deleteMood("a")).rejects.toThrow(SyntaxError);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(await readRaw()).toBe("{bukan json");
  });

  it("melempar error dan TIDAK menimpa data jika data bukan array", async () => {
    const raw = JSON.stringify("histori");
    await AsyncStorage.setItem(MOODS_KEY, raw);
    AsyncStorage.setItem.mockClear();

    await expect(deleteMood("a")).rejects.toThrow(
      "Data mood di storage tidak valid",
    );
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(await readRaw()).toBe(raw);
  });
});

describe("formatDate / formatTime", () => {
  // 25 Nov 2026 10:05 WIB
  const iso = "2026-11-25T03:05:00.000Z";

  it("memformat tanggal lengkap dalam bahasa Indonesia", () => {
    expect(formatDate(iso)).toBe("Rabu, 25 November 2026");
  });

  it("memformat jam:menit dua digit sesuai waktu lokal", () => {
    expect(formatTime(iso)).toBe("10.05");
  });
});
