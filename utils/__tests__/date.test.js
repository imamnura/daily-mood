import { calculateStreak, toLocalDateKey } from "../date";

// Semua test berjalan di TZ Asia/Jakarta (UTC+7), lihat test/globalSetup.js.

// Buat ISO string dari waktu lokal WIB, mis. wib(2026, 11, 25, 9) = 25 Nov 2026 09:00 WIB
function wib(year, month, day, hour = 12, minute = 0) {
  return new Date(year, month - 1, day, hour, minute).toISOString();
}

describe("zona waktu test", () => {
  it("berjalan di WIB (UTC+7)", () => {
    expect(new Date(2026, 10, 25).getTimezoneOffset()).toBe(-420);
  });
});

describe("toLocalDateKey", () => {
  it("menghasilkan format YYYY-MM-DD dengan zero padding", () => {
    expect(toLocalDateKey(wib(2026, 1, 5))).toBe("2026-01-05");
  });

  it("memakai tanggal lokal, bukan tanggal UTC (entri 00:00–06:59 WIB)", () => {
    // 25 Nov 01:30 WIB = 24 Nov 18:30 UTC
    const iso = "2026-11-24T18:30:00.000Z";
    expect(iso.split("T")[0]).toBe("2026-11-24"); // cara lama yang salah
    expect(toLocalDateKey(iso)).toBe("2026-11-25");
  });

  it("batas akhir hari lokal tetap di hari yang sama", () => {
    expect(toLocalDateKey(wib(2026, 11, 25, 23, 59))).toBe("2026-11-25");
  });

  it("menerima objek Date maupun timestamp", () => {
    const date = new Date(2026, 10, 25, 8);
    expect(toLocalDateKey(date)).toBe("2026-11-25");
    expect(toLocalDateKey(date.getTime())).toBe("2026-11-25");
  });
});

describe("calculateStreak", () => {
  const today = new Date(2026, 10, 25, 15, 0); // Rabu, 25 Nov 2026 15:00 WIB

  it("mengembalikan 0 jika belum ada catatan", () => {
    expect(calculateStreak([], today)).toBe(0);
  });

  it("menghitung hari berturut-turut sampai hari ini", () => {
    const dates = [wib(2026, 11, 25), wib(2026, 11, 24), wib(2026, 11, 23)];
    expect(calculateStreak(dates, today)).toBe(3);
  });

  it("tetap menghitung streak jika hari ini kosong tapi kemarin ada", () => {
    const dates = [wib(2026, 11, 24), wib(2026, 11, 23)];
    expect(calculateStreak(dates, today)).toBe(2);
  });

  it("mengembalikan 0 jika catatan terakhir lebih dari kemarin", () => {
    const dates = [wib(2026, 11, 23), wib(2026, 11, 22)];
    expect(calculateStreak(dates, today)).toBe(0);
  });

  it("berhenti di hari yang bolong", () => {
    const dates = [wib(2026, 11, 25), wib(2026, 11, 24), wib(2026, 11, 22)];
    expect(calculateStreak(dates, today)).toBe(2);
  });

  it("menghitung beberapa entri di hari yang sama sebagai satu hari", () => {
    const dates = [
      wib(2026, 11, 25, 8),
      wib(2026, 11, 25, 20),
      wib(2026, 11, 24, 9),
      wib(2026, 11, 24, 22),
    ];
    expect(calculateStreak(dates, today)).toBe(2);
  });

  it("entri 00:00–06:59 WIB terhitung ke hari lokal yang benar", () => {
    // 25 Nov 00:30 WIB (= 24 Nov UTC) dan 24 Nov 06:59 WIB (= 23 Nov UTC)
    const dates = [wib(2026, 11, 25, 0, 30), wib(2026, 11, 24, 6, 59)];
    expect(calculateStreak(dates, today)).toBe(2);
  });

  it("tidak bergantung pada urutan input", () => {
    const dates = [wib(2026, 11, 23), wib(2026, 11, 25), wib(2026, 11, 24)];
    expect(calculateStreak(dates, today)).toBe(3);
  });

  it("melewati batas bulan dan tahun", () => {
    const newYear = new Date(2027, 0, 1, 10);
    const dates = [wib(2027, 1, 1), wib(2026, 12, 31), wib(2026, 12, 30)];
    expect(calculateStreak(dates, newYear)).toBe(3);
  });

  it("tidak mengubah objek `today` milik pemanggil", () => {
    const now = new Date(today);
    calculateStreak([wib(2026, 11, 25)], now);
    expect(now.getTime()).toBe(today.getTime());
  });
});
