// Kunci tanggal berdasarkan zona waktu LOKAL device (format YYYY-MM-DD).
// Jangan pakai `toISOString().split("T")[0]` — itu tanggal UTC, sehingga
// mood yang dicatat jam 00:00–06:59 WIB terhitung ke hari sebelumnya.
export function toLocalDateKey(dateInput) {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Hitung berapa hari berturut-turut user mencatat mood.
// Streak tetap dihitung jika hari ini belum dicatat tapi kemarin sudah.
export function calculateStreak(isoDates, today = new Date()) {
  if (isoDates.length === 0) return 0;

  const recordedDays = new Set(isoDates.map(toLocalDateKey));

  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);
  if (!recordedDays.has(toLocalDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (recordedDays.has(toLocalDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1); // setDate aman terhadap DST
  }
  return streak;
}
