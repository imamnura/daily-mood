// Satu-satunya sumber definisi mood di aplikasi.
//
// `id` adalah identitas permanen: sudah tersimpan di setiap entri histori
// (`entry.mood.id`), jadi JANGAN diubah atau dipakai ulang untuk mood lain.
// `emoji`, `label`, `color`, dan `score` boleh diubah kapan saja — statistik
// selalu mencocokkan entri berdasarkan `id`, bukan label.
//
// `score` dipakai untuk rata-rata mood (5 = paling baik, 1 = paling buruk).
export const MOODS = Object.freeze(
  [
    { id: 1, emoji: "😄", label: "Great", color: "#4CAF50", score: 5 },
    { id: 2, emoji: "🙂", label: "Good", color: "#8BC34A", score: 4 },
    { id: 3, emoji: "😐", label: "Okay", color: "#FFC107", score: 3 },
    { id: 4, emoji: "😔", label: "Bad", color: "#FF9800", score: 2 },
    { id: 5, emoji: "😢", label: "Awful", color: "#F44336", score: 1 },
  ].map((mood) => Object.freeze(mood)),
);

const MOODS_BY_ID = new Map(MOODS.map((mood) => [mood.id, mood]));

// Kembalikan definisi mood untuk `id`, atau `null` bila tidak dikenal.
export function getMoodById(id) {
  return MOODS_BY_ID.get(id) ?? null;
}
