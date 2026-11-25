# Tech Debt Report — DailyMood

Dibuat: 2026-11-25
Cakupan: seluruh source (`App.js`, `components/`, `context/`, `screens/`, `utils/`), konfigurasi (`app.json`, `eas.json`, `package.json`), dan dependency.

> Proyek ini React Native + Expo (JavaScript). Kategori checklist web Bluebird yang tidak berlaku
> (Kitbird, TanStack Query, Zustand, Biome, Vitest) diganti padanannya untuk React Native.

## Kondisi Saat Scan

| Pemeriksaan | Hasil |
|---|---|
| `npx expo-doctor` | ✅ 18/18 check lulus |
| `npx expo export` (Android & iOS) | ✅ bundle berhasil |
| ESLint (`eslint:recommended` + `react-hooks`) | ✅ 0 error, 0 warning (di luar `console` yang dibungkus `__DEV__`) |
| `npm audit` | ⚠️ 35 vulnerability transitif (2 critical, 16 high, 16 moderate, 1 low) — setelah TD-01: 24 (0 critical, 3 high) |
| Test otomatis | ❌ tidak ada |

## Ringkasan

| Kategori | Jumlah | Severity |
|---|---|---|
| Dependency & keamanan | 3 | HIGH |
| Test coverage | 1 (seluruh proyek) | HIGH |
| Duplikasi data / logika | 3 | HIGH–MEDIUM |
| Pelanggaran layer | 3 | MEDIUM |
| Tooling & konvensi | 3 | MEDIUM |
| Integritas data | 2 | MEDIUM |
| Aksesibilitas | 1 | MEDIUM |
| Design token / style | 2 | MEDIUM–LOW |
| Dead code / dependency tak terpakai | 3 | LOW |
| UX minor | 3 | LOW |

---

## CRITICAL Issues

Tidak ada temuan CRITICAL di kode aplikasi.

Dua advisory critical dari `npm audit` (`fast-xml-parser`, `shell-quote`) adalah dependency **transitif tooling
build/dev** (Metro, Expo CLI) dan tidak ikut ke bundle aplikasi, sehingga dimasukkan ke HIGH (lihat TD-01).

---

## HIGH Issues

### TD-01 — 35 vulnerability transitif di dependency
- **Lokasi:** `package-lock.json`
- **Detail:** 2 critical (`fast-xml-parser`, `shell-quote`), 16 high (antara lain `ws`, `js-yaml`, `picomatch`,
  `brace-expansion`, `body-parser`, `launch-editor`, `@xmldom/xmldom`, `@react-navigation/core`, `query-string`).
  Semuanya transitif; sebagian besar berasal dari tooling dev server/CLI. `minimatch` dan `postcss` baru bisa
  diperbaiki dengan upgrade major Expo.
- **Aksi:** jalankan `npm audit fix` (tanpa `--force`) di branch terpisah, lalu verifikasi dengan
  `npx expo-doctor` + build dev client. Sisanya diselesaikan lewat upgrade SDK (TD-02).
- **Status (2026-11-25): ✅ sebagian selesai** — branch `fix/td-01-npm-audit`.
  - `npm audit fix` **tidak dipakai**: di npm 11 perintah itu memasang `expo@58` + `@expo/cli@58` bersarang
    di bawah `expo@54` (33 paket duplikat), berisiko membuat CLI membaca config SDK yang salah.
  - Sebagai gantinya: `npm update` terarah untuk paket transitif yang rentan saja (`shell-quote`,
    `fast-xml-parser`, `ws`, `js-yaml`, `picomatch`, `brace-expansion`, `body-parser`, `launch-editor`,
    `@xmldom/xmldom`, `@react-navigation/core`, `query-string`, `qs`, `yaml`, dll.). `package.json` tidak berubah.
  - Hasil: **35 → 24** (critical 2 → 0, high 16 → 3, moderate 16 → 14, low 1 → 7*).
    Verifikasi: `npx expo-doctor` 18/18 lulus, `npx expo export` Android & iOS berhasil.
  - Sisa, tidak bisa diperbaiki tanpa perubahan major:
    - `minimatch`, `glob`, `postcss` dan rantai `@expo/*` / `expo-*` → butuh Expo SDK 58 (TD-02).
    - `image-size` (high, via `metro@0.83`) → fix ada di `image-size@2` (API berubah), ikut upgrade Metro di TD-02.
    - 7 low di rantai `@react-native-community/cli` (`fast-xml-parser` lama) → hilang saat paket itu dihapus (TD-17).
  - \* Low naik karena `fast-xml-parser` sudah diperbarui dari versi ber-advisory critical ke versi yang hanya tersisa
    advisory low, dan npm menghitungnya juga pada 6 paket induk `@react-native-community/cli-*`; bukan temuan baru.
  - Belum dilakukan: build dev client (EAS) — perlu dijalankan manual sebelum merge.

### TD-02 — Expo SDK tertinggal 4 versi major
- **Lokasi:** `package.json`
- **Detail:** terpasang `expo@54.0.38` / `react-native@0.81.5`; terbaru `expo@58` / `react-native@0.88`.
  `@react-navigation/*` juga tertinggal minor (7.14 → 7.22, 7.1 → 7.5).
- **Aksi:** upgrade bertahap satu SDK per langkah (`npx expo install expo@^55 --fix`, dst.), baca changelog
  `expo-notifications` di setiap langkah karena API trigger pernah berubah (SDK 52).

### TD-03 — Tidak ada test sama sekali
- **Lokasi:** seluruh proyek (tidak ada runner, config, maupun file `*.test.*`)
- **Detail:** logika yang paling berisiko belum terlindungi: `utils/date.js` (`calculateStreak`,
  `toLocalDateKey` — sensitif timezone), `utils/storage.js` (jalur tulis yang sengaja melempar error agar
  histori tidak tertimpa), serta kalkulasi statistik di `InsightScreen`.
- **Aksi:** pasang `jest-expo` + `@testing-library/react-native`. Prioritas test:
  1. `calculateStreak` (hari ini kosong tapi kemarin ada, entri 00:00–06:59 WIB, duplikat per hari)
  2. `saveMood`/`deleteMood` saat storage korup → harus throw, bukan menimpa data
  3. Statistik Insight (top mood, rata-rata) setelah diekstrak (TD-05)

### TD-04 — Definisi mood terduplikasi di 3 tempat dan dicocokkan via `label`
- **Lokasi:** `components/MoodPicker.jsx:13` (`MOODS`), `screens/InsightScreen.jsx:22` (`MOODS_META`),
  `screens/InsightScreen.jsx:255` (`moodScore`)
- **Detail:** statistik mencocokkan `m.mood.label === meta.label`. Mengubah label/emoji di satu tempat akan
  membuat data lama tidak terhitung, dan skor rata-rata jatuh ke default `3`.
- **Aksi:** buat `constants/moods.js` sebagai satu sumber (tambahkan field `score`), cocokkan berdasarkan `id`.

---

## MEDIUM Issues

### TD-05 — Logika bisnis statistik berada di dalam screen
- **Lokasi:** `screens/InsightScreen.jsx:103` dan `:245` (hitungan per mood dilakukan **dua kali**),
  `:249` (`topMood`), `:256` (`avgScore`)
- **Aksi:** ekstrak ke `hooks/useMoodStats.js` (dibungkus `useMemo`) sehingga bisa di-test dan tidak dihitung
  ulang setiap render.

### TD-06 — Akses `AsyncStorage` langsung dari screen
- **Lokasi:** `screens/InsightScreen.jsx:138`, `:183` (key `"reminderHour"`)
- **Detail:** melewati layer `utils/storage.js` dan tidak memakai namespace `dailymood:` seperti key lain.
- **Aksi:** pindahkan ke `utils/storage.js` (`getReminderHour` / `setReminderHour`) dengan key
  `dailymood:reminderHour` + migrasi dari key lama.

### TD-07 — Strategi import `expo-notifications` tidak konsisten
- **Lokasi:** `App.js:28-29` (dynamic import + cek Expo Go), `screens/InsightScreen.jsx:17` (static import
  `utils/notifications.js` yang memanggil `setNotificationHandler` saat modul di-load)
- **Detail:** upaya menghindari `expo-notifications` di Expo Go di `App.js` tidak efektif karena modul tetap
  ter-load lewat `InsightScreen`. `Constants.appOwnership` juga sudah deprecated.
- **Aksi:** pilih satu pendekatan; pakai
  `Constants.executionEnvironment === ExecutionEnvironment.StoreClient` bila tetap perlu deteksi Expo Go.

### TD-08 — Reminder memakai `cancelAllScheduledNotificationsAsync`
- **Lokasi:** `utils/notifications.js:39`, `:62`; status aktif diturunkan dari
  `getScheduledReminders().length > 0`
- **Detail:** semua notifikasi terjadwal ikut terhapus dan status "aktif" salah bila nanti ada jenis
  notifikasi lain.
- **Aksi:** jadwalkan dengan `identifier` tetap (mis. `"daily-reminder"`) lalu cancel/cek berdasarkan
  identifier tersebut.

### TD-09 — Pola read-modify-write di storage rawan race
- **Lokasi:** `utils/storage.js:36`, `:48`
- **Detail:** `saveMood` dan `deleteMood` yang berjalan berdekatan dapat saling menimpa.
- **Aksi:** serialisasi operasi tulis (antrian promise sederhana) atau simpan per-entri dengan key terpisah.

### TD-10 — Skema data tanpa versi
- **Lokasi:** `screens/HomeScreen.jsx:44` (payload entri), `utils/storage.js`
- **Detail:** entri menyimpan seluruh objek mood (emoji, warna, label) tanpa `schemaVersion`. Perubahan desain
  mood memerlukan migrasi tetapi belum ada mekanismenya.
- **Aksi:** simpan hanya `moodId` + `schemaVersion`, tambahkan fungsi migrasi saat load.

### TD-11 — Tidak ada linter/formatter di repo
- **Detail:** tidak ada config ESLint/Prettier maupun script `lint`. Scan ini memakai ESLint sementara di luar
  repo.
- **Aksi:** `npx expo lint` (membuat `eslint.config.js` dengan preset Expo, termasuk `react-hooks`), tambahkan
  Prettier dan script `lint` / `format` di `package.json`.

### TD-12 — JavaScript tanpa type checking
- **Detail:** tidak ada TypeScript/JSDoc; bentuk entri mood dan props komponen tidak terdokumentasi.
- **Aksi:** migrasi bertahap ke TypeScript (Expo mendukung `.tsx` langsung), mulai dari `utils/` dan
  `context/`.

### TD-13 — Aksesibilitas belum ditangani
- **Lokasi:** `components/MoodPicker.jsx:51` (tombol emoji), `screens/HistoryScreen.jsx:55` (tombol hapus
  berlabel `x`), tab icon emoji di `App.js`
- **Detail:** tidak ada satu pun `accessibilityLabel`/`accessibilityRole`; screen reader hanya membaca emoji
  atau "x".
- **Aksi:** tambahkan `accessibilityRole="button"`, `accessibilityLabel` (mis. "Mood Great"),
  `accessibilityState={{ selected }}`, dan perbesar hit area tombol hapus.

### TD-14 — Warna hardcoded tanpa design token
- **Detail:** 68 literal warna hex tersebar di `App.js`, `screens/`, `components/` (mis. `#212121` ×10,
  `#6C63FF` ×7, `#F8F9FA` ×5).
- **Aksi:** buat `constants/theme.js` (colors, spacing, radius) dan ganti literal secara bertahap. Membuka
  jalan untuk dark mode (`app.json:8` saat ini dikunci `"light"`).

---

## LOW Issues

### TD-15 — Style duplikat antar screen
- `card`, `emptyContainer`, `emptyTitle`, `emptySubtitle`, `sectionTitle` didefinisikan ulang di
  `HomeScreen`, `HistoryScreen`, `InsightScreen`. Ekstrak ke komponen `Card` / `EmptyState` bersama.

### TD-16 — `StatusBar` dari `react-native`, `expo-status-bar` tidak terpakai
- `App.js:4`, `:47` — `backgroundColor` diabaikan di mode edge-to-edge. `expo-status-bar`
  (`package.json:21`) terpasang tetapi tidak di-import. Ganti ke `<StatusBar style="dark" />` dari
  `expo-status-bar`.

### TD-17 — Dependency / kode tak terpakai
- `@react-native-community/cli` (`package.json:28`) tidak diperlukan untuk proyek Expo managed.
- Listener tap notifikasi (`App.js:33`) hanya mencetak log — bisa diarahkan ke tab Home atau dihapus.
- `MoodContext` tidak meng-expose `loadMoods` (tidak ada pull-to-refresh/retry).

### TD-18 — `MoodContext` value tidak di-memo
- `context/MoodContext.jsx:32` — objek `value` dibuat ulang setiap render sehingga semua consumer ikut
  re-render. Bungkus dengan `useMemo` dan fungsi dengan `useCallback`. Tidak ada state error yang diekspos.

### TD-19 — Insight tidak memperhatikan `isLoading`
- `screens/InsightScreen.jsx:277` — saat data masih dimuat, layar sempat menampilkan empty state
  "Belum ada data" sebelum data muncul. Gunakan `isLoading` seperti di `HistoryScreen`.

### TD-20 — Batas jam reminder hardcoded
- `screens/InsightScreen.jsx:178` — rentang 06–23 dan menit selalu `0`. Jadikan konstanta atau pakai time
  picker.

### TD-21 — ID entri berbasis `Date.now()`
- `screens/HomeScreen.jsx:44` — cukup untuk satu device, tetapi bisa bentrok bila nanti ada import/sync.
  Pertimbangkan `expo-crypto` `randomUUID()`.

---

## Rekomendasi Urutan Pengerjaan

1. **Segera:** TD-01 (`npm audit fix` non-breaking) dan TD-11 (lint/format di repo) — murah, mencegah regresi.
2. **Sprint berikutnya:** TD-03 (setup test + test untuk `date.js` & `storage.js`), lalu TD-04 dan TD-05
   (konstanta mood tunggal + `useMoodStats`) karena saling terkait dan menyentuh data pengguna.
3. **Berikutnya:** TD-06 s.d. TD-10 (notifikasi, storage, skema data) dalam satu paket refactor data layer.
4. **Kuartal ini:** TD-02 (upgrade SDK bertahap), TD-12 (TypeScript), TD-13 (aksesibilitas), TD-14 (theme).
5. **Oportunistik:** TD-15 s.d. TD-21 saat menyentuh file terkait.

## Riwayat Perbaikan Terkait

Sudah diperbaiki pada commit yang sama dengan dokumen ini (tidak lagi termasuk tech debt):
Rules of Hooks di bar chart, stagger animasi, format trigger notifikasi harian, typo `permissions` di
`app.json`, versi `expo-constants` & patch Expo, tanggal UTC vs lokal di streak/7 hari terakhir, risiko
histori tertimpa saat storage gagal dibaca, safe area, posisi spinner, error handling reminder,
`console.log` di production, dan typo `MoodBotton`.
