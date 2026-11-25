import { act, renderHook } from "@testing-library/react-native";
import { computeMoodStats, useMoodStats } from "../useMoodStats";
import { MOODS } from "../../constants/moods";

// TZ dikunci ke Asia/Jakarta oleh test/globalSetup.js.
const TODAY = new Date("2026-11-25T12:00:00+07:00");

let seq = 0;
function entry(moodId, date = "2026-11-25T09:00:00+07:00") {
  seq += 1;
  return { id: String(seq), mood: { id: moodId }, note: "", date };
}

function countsById(stats) {
  return Object.fromEntries(stats.counts.map((c) => [c.id, c.count]));
}

beforeEach(() => {
  seq = 0;
});

describe("computeMoodStats", () => {
  it("mengembalikan nilai kosong untuk histori kosong", () => {
    const stats = computeMoodStats([], TODAY);

    expect(stats.total).toBe(0);
    expect(stats.counts.map((c) => c.count)).toEqual([0, 0, 0, 0, 0]);
    expect(stats.topMood).toBeNull();
    expect(stats.avgScore).toBeNull();
    expect(stats.streak).toBe(0);
  });

  it("menghitung jumlah per mood sesuai urutan MOODS beserta metadatanya", () => {
    const stats = computeMoodStats(
      [entry(1), entry(3), entry(1), entry(5), entry(1)],
      TODAY,
    );

    expect(stats.total).toBe(5);
    expect(countsById(stats)).toEqual({ 1: 3, 2: 0, 3: 1, 4: 0, 5: 1 });
    expect(stats.counts.map((c) => c.id)).toEqual(MOODS.map((m) => m.id));
    expect(stats.counts[0]).toMatchObject({ ...MOODS[0], count: 3 });
  });

  it("memilih mood terbanyak sebagai topMood", () => {
    const stats = computeMoodStats([entry(4), entry(2), entry(4)], TODAY);
    expect(stats.topMood).toMatchObject({ id: 4, label: "Bad", count: 2 });
  });

  it("memilih mood yang lebih positif saat jumlahnya seri", () => {
    const stats = computeMoodStats([entry(5), entry(2)], TODAY);
    expect(stats.topMood).toMatchObject({ id: 2, label: "Good" });
  });

  it("menghitung rata-rata score tanpa pembulatan", () => {
    // (5 + 4 + 4) / 3 = 4.333...
    const stats = computeMoodStats([entry(1), entry(2), entry(2)], TODAY);
    expect(stats.avgScore).toBeCloseTo(13 / 3);
  });

  it("melewati entri dengan id tidak dikenal untuk count dan rata-rata", () => {
    const stats = computeMoodStats(
      [entry(5), entry(99), { id: "x", mood: undefined, date: TODAY }],
      TODAY,
    );

    expect(stats.total).toBe(3);
    expect(countsById(stats)).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 });
    expect(stats.avgScore).toBe(1);
  });

  it("tidak memberi topMood/avgScore jika semua entri tidak dikenal", () => {
    const stats = computeMoodStats([entry(99)], TODAY);

    expect(stats.total).toBe(1);
    expect(stats.topMood).toBeNull();
    expect(stats.avgScore).toBeNull();
  });

  it("menghitung streak terhadap tanggal `today` (tanggal lokal)", () => {
    const moods = [
      entry(1, "2026-11-25T08:00:00+07:00"),
      entry(2, "2026-11-24T23:30:00+07:00"),
      // 00:30 WIB = masih 22 Nov di UTC, tetap terhitung 23 Nov lokal.
      entry(3, "2026-11-23T00:30:00+07:00"),
      entry(4, "2026-11-21T10:00:00+07:00"),
    ];

    expect(computeMoodStats(moods, TODAY).streak).toBe(3);
  });
});

describe("useMoodStats", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("mengembalikan hasil yang sama dengan computeMoodStats", async () => {
    jest.useFakeTimers({ now: TODAY });
    const moods = [entry(1), entry(4)];

    const { result } = await renderHook(() => useMoodStats(moods));

    expect(result.current).toEqual(computeMoodStats(moods, TODAY));
  });

  it("tidak menghitung ulang saat render ulang dengan histori yang sama", async () => {
    jest.useFakeTimers({ now: TODAY });
    const moods = [entry(1)];

    const { result, rerender } = await renderHook(
      ({ list }) => useMoodStats(list),
      { initialProps: { list: moods } },
    );
    const first = result.current;
    await rerender({ list: moods });

    expect(result.current).toBe(first);
  });

  it("menghitung ulang saat histori berubah", async () => {
    jest.useFakeTimers({ now: TODAY });
    const moods = [entry(1)];

    const { result, rerender } = await renderHook(
      ({ list }) => useMoodStats(list),
      { initialProps: { list: moods } },
    );
    const first = result.current;
    await rerender({ list: [entry(5), ...moods] });

    expect(result.current).not.toBe(first);
    expect(result.current.total).toBe(2);
    expect(result.current.avgScore).toBe(3);
  });

  it("menghitung ulang streak setelah melewati tengah malam", async () => {
    jest.useFakeTimers({ now: new Date("2026-11-25T23:59:00+07:00") });
    const moods = [entry(1, "2026-11-24T10:00:00+07:00")];

    const { result, rerender } = await renderHook(
      ({ list }) => useMoodStats(list),
      { initialProps: { list: moods } },
    );
    // Hari ini (25) belum dicatat, kemarin (24) sudah → streak masih 1.
    expect(result.current.streak).toBe(1);

    // Histori sama, hari berganti ke 26 → 25 bolong, streak putus.
    // Hasil memo hari sebelumnya tidak boleh dipakai lagi.
    const first = result.current;
    await act(async () => {
      jest.setSystemTime(new Date("2026-11-26T00:01:00+07:00"));
    });
    await rerender({ list: moods });

    expect(result.current).not.toBe(first);
    expect(result.current.streak).toBe(0);
  });
});
