import { act, render, screen, within } from "@testing-library/react-native";
import InsightScreen from "../InsightScreen";
import { useMood } from "../../context/MoodContext";

// Render pertama screen men-transform banyak modul React Native secara lazy;
// dengan cache Jest kosong (mis. CI) bisa melewati batas default 5 detik.
jest.setTimeout(30000);

jest.mock("../../context/MoodContext", () => ({ useMood: jest.fn() }));
jest.mock("../../utils/notifications", () => ({
  scheduleDailyReminder: jest.fn(),
  cancelAllReminders: jest.fn(),
  getScheduledReminders: jest.fn().mockResolvedValue([]),
}));

let seq = 0;
// Entri dengan snapshot mood seperti yang tersimpan di AsyncStorage.
function entry(mood) {
  seq += 1;
  return { id: String(seq), mood, note: "", date: "2026-11-20T10:00:00.000Z" };
}

async function renderWith(moods) {
  useMood.mockReturnValue({ moods, isLoading: false });
  await render(<InsightScreen />);
  // Selesaikan animasi masuk (StatCard/MoodBar) di dalam act().
  await act(async () => {
    jest.runAllTimers();
  });
}

// Nilai pada kartu statistik berada tepat sebelum label kartunya.
function statValue(label) {
  const card = screen.getByText(label).parent;
  return within(card).getAllByText(/.*/)[1].props.children;
}

beforeEach(() => {
  seq = 0;
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("InsightScreen — statistik mood", () => {
  it("menghitung top mood dan rata-rata dari id mood", async () => {
    await renderWith([
      entry({ id: 1, emoji: "😄", label: "Great", color: "#4CAF50" }),
      entry({ id: 1, emoji: "😄", label: "Great", color: "#4CAF50" }),
      entry({ id: 4, emoji: "😔", label: "Bad", color: "#FF9800" }),
    ]);

    expect(statValue("Mood Terbanyak")).toBe("Great");
    expect(statValue("Rata-rata")).toBe("4.0"); // (5 + 5 + 2) / 3
  });

  it("tetap menghitung entri lama walau label/emoji tersimpannya berbeda", async () => {
    // Snapshot lama dengan label & emoji yang sudah tidak dipakai lagi.
    await renderWith([
      entry({ id: 2, emoji: "😊", label: "Baik", color: "#000000" }),
      entry({ id: 2, emoji: "😊", label: "Baik", color: "#000000" }),
      entry({ id: 5, emoji: "😭", label: "Buruk", color: "#000000" }),
    ]);

    // Ditampilkan memakai definisi terbaru di constants/moods.js.
    expect(statValue("Mood Terbanyak")).toBe("Good");
    expect(statValue("Rata-rata")).toBe("3.0"); // (4 + 4 + 1) / 3
  });

  it("melewati entri dengan id tidak dikenal saat menghitung rata-rata", async () => {
    await renderWith([
      entry({ id: 5, emoji: "😢", label: "Awful", color: "#F44336" }),
      entry({ id: 99, emoji: "❓", label: "Unknown", color: "#000000" }),
    ]);

    // Sebelumnya entri tak dikenal dianggap 3 sehingga hasilnya 2.0.
    expect(statValue("Rata-rata")).toBe("1.0");
    expect(statValue("Total Catatan")).toBe(2);
  });

  it("menampilkan '-' jika semua entri tidak dikenal", async () => {
    await renderWith([entry({ id: 99, emoji: "❓", label: "?", color: "#000" })]);

    expect(statValue("Rata-rata")).toBe("-");
    expect(statValue("Mood Terbanyak")).toBe("-");
  });

  it("menampilkan empty state jika belum ada data", async () => {
    await renderWith([]);
    expect(screen.getByText("Belum ada data")).toBeOnTheScreen();
  });
});
