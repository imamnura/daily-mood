import { useMemo } from "react";
import { MOODS, getMoodById } from "../constants/moods";
import { calculateStreak, toLocalDateKey } from "../utils/date";

// Hitung statistik histori mood dalam satu kali iterasi.
//
// Mengembalikan:
// - total:    jumlah seluruh entri (termasuk yang id mood-nya tidak dikenal)
// - counts:   setiap mood di constants/moods.js beserta `count`, urut sesuai MOODS
// - topMood:  mood dengan count terbanyak; bila seri, yang lebih dulu di MOODS
//             (lebih positif) menang. `null` bila tidak ada entri yang dikenal
// - avgScore: rata-rata `score` (angka mentah, belum dibulatkan); entri dengan
//             id tidak dikenal dilewati. `null` bila tidak ada entri yang dikenal
// - streak:   hari berturut-turut mencatat mood, dihitung terhadap `today`
export function computeMoodStats(moods, today = new Date()) {
  const countById = new Map();
  let scoreSum = 0;
  let scoredCount = 0;

  for (const entry of moods) {
    const meta = getMoodById(entry.mood?.id);
    if (!meta) continue;
    countById.set(meta.id, (countById.get(meta.id) ?? 0) + 1);
    scoreSum += meta.score;
    scoredCount += 1;
  }

  const counts = MOODS.map((meta) => ({
    ...meta,
    count: countById.get(meta.id) ?? 0,
  }));

  const topMood = counts.reduce(
    (best, curr) => (curr.count > (best?.count ?? 0) ? curr : best),
    null,
  );

  return {
    total: moods.length,
    counts,
    topMood,
    avgScore: scoredCount > 0 ? scoreSum / scoredCount : null,
    streak: calculateStreak(
      moods.map((m) => m.date),
      today,
    ),
  };
}

// Statistik mood yang hanya dihitung ulang saat histori berubah.
// Tanggal hari ini ikut jadi dependency agar streak tetap benar ketika
// layar dirender ulang setelah melewati tengah malam.
export function useMoodStats(moods) {
  const todayKey = toLocalDateKey(new Date());
  return useMemo(
    () => computeMoodStats(moods),
    // todayKey sengaja jadi dependency walau tidak dipakai di dalam callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [moods, todayKey],
  );
}
