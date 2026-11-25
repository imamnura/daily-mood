import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { MoodProvider, useMood } from "../MoodContext";

const MOODS_KEY = "dailymood:moods";

const entry = (id) => ({
  id,
  mood: { id: 1, emoji: "😄", label: "Great", color: "#4CAF50" },
  note: "",
  createdAt: "2026-11-25T03:00:00.000Z",
});

async function renderUseMood() {
  const hook = await renderHook(() => useMood(), { wrapper: MoodProvider });
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useMood", () => {
  it("melempar error jika dipakai di luar MoodProvider", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(renderHook(() => useMood())).rejects.toThrow(
      "useMood harus dipakai di dalam MoodProvider",
    );
  });
});

describe("MoodProvider", () => {
  it("memuat histori dari storage saat pertama kali dipasang", async () => {
    const data = [entry("b"), entry("a")];
    await AsyncStorage.setItem(MOODS_KEY, JSON.stringify(data));

    const { result } = await renderUseMood();
    expect(result.current.moods).toEqual(data);
  });

  it("memulai dengan list kosong jika storage kosong", async () => {
    const { result } = await renderUseMood();
    expect(result.current.moods).toEqual([]);
  });

  it("addMood menambahkan entri ke state dan storage", async () => {
    await AsyncStorage.setItem(MOODS_KEY, JSON.stringify([entry("a")]));
    const { result } = await renderUseMood();

    await act(() => result.current.addMood(entry("b")));

    expect(result.current.moods.map((m) => m.id)).toEqual(["b", "a"]);
    const stored = JSON.parse(await AsyncStorage.getItem(MOODS_KEY));
    expect(stored.map((m) => m.id)).toEqual(["b", "a"]);
  });

  it("removeMood menghapus entri dari state dan storage", async () => {
    await AsyncStorage.setItem(
      MOODS_KEY,
      JSON.stringify([entry("a"), entry("b")]),
    );
    const { result } = await renderUseMood();

    await act(() => result.current.removeMood("a"));

    expect(result.current.moods.map((m) => m.id)).toEqual(["b"]);
    const stored = JSON.parse(await AsyncStorage.getItem(MOODS_KEY));
    expect(stored.map((m) => m.id)).toEqual(["b"]);
  });

  it("addMood gagal saat storage korup: error diteruskan, histori tidak tertimpa", async () => {
    await AsyncStorage.setItem(MOODS_KEY, "{bukan json");
    const { result } = await renderUseMood();
    // Saat load, data korup ditampilkan sebagai list kosong...
    expect(result.current.moods).toEqual([]);

    // ...tapi menyimpan mood baru TIDAK boleh menimpa data asli dengan [entri]
    await act(async () => {
      await expect(result.current.addMood(entry("b"))).rejects.toThrow();
    });

    expect(result.current.moods).toEqual([]);
    expect(await AsyncStorage.getItem(MOODS_KEY)).toBe("{bukan json");
  });
});
