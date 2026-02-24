# DailyMood

Aplikasi React Native (Expo) untuk mencatat mood harian secara sederhana dan cepat. Pengguna dapat memilih emoji mood, menambahkan catatan, melihat riwayat, dan mengetahui mood yang paling sering muncul.

## Fitur

- Pilih mood dengan emoji dan warna yang representatif
- Tambah catatan opsional untuk memperkaya konteks
- Simpan data secara lokal menggunakan AsyncStorage
- Lihat riwayat mood dan hapus entri yang tidak diinginkan
- Insight sederhana: total catatan dan mood terbanyak

## Teknologi

- Expo SDK 54 (`expo ~54.0.33`)
- React `18.2.0`
- React Native `0.76.6`
- React Navigation Bottom Tabs `^7.14.0`
- react-native-gesture-handler (dibutuhkan oleh React Navigation)
- react-native-screens, react-native-safe-area-context
- @react-native-async-storage/async-storage untuk penyimpanan lokal

## Struktur Proyek

```
daily-mood/
├─ assets/                 # ikon & aset lain
├─ components/
│  └─ MoodPicker.jsx       # pemilih mood (emoji, warna)
├─ context/
│  └─ MoodContext.jsx      # state global moods + operasi (load/add/remove)
├─ screens/
│  ├─ HomeScreen.jsx       # input mood + catatan
│  ├─ HistoryScreen.jsx    # daftar mood + hapus
│  └─ InsightScreen.jsx    # statistik sederhana
├─ utils/
│  └─ storage.js           # helper AsyncStorage + format tanggal/waktu
├─ App.js                  # root navigasi (tab)
├─ index.js                # entry point (registerRootComponent, gesture-handler)
├─ package.json
└─ app.json
```

## Menjalankan Secara Lokal

1) Pasang dependensi:

```bash
npm install
```

2) Jalankan Metro bundler:

```bash
npm start
```

3) Menjalankan di perangkat/emulator:

```bash
npm run android
npm run ios    # di macOS dengan Xcode
npm run web
```

Jika perintah `expo` tidak dikenali secara global, perintah di atas tetap berjalan melalui script `npm` karena Expo CLI tersedia sebagai dependensi.

## Catatan Kompatibilitas

Proyek ini dikonfigurasi untuk Expo SDK 54. Pastikan versi berikut selaras agar menghindari error runtime:

- react: `18.2.0`
- react-native: `0.76.6`

Menggunakan versi yang lebih baru (mis. React 19 atau RN 0.81.x) pada SDK 54 dapat menimbulkan error seperti “Cannot call a class as a function” atau ketidakcocokan peer dependency.

## Troubleshooting

- “Unable to resolve 'react-native-gesture-handler' from 'index.js'”  
  Pastikan paket telah terpasang. Jalankan:
  ```bash
  npx expo install react-native-gesture-handler
  ```
  dan restart bundler dengan cache bersih:
  ```bash
  npm start -- --clear
  ```

- “TypeError: Cannot call a class as a function”  
  Umumnya akibat ketidaksesuaian versi React/React Native/Expo atau kesalahan import. Pastikan versi sesuai bagian kompatibilitas, kemudian lakukan langkah berikut:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  npm start -- --clear
  ```

## Lisensi

Proyek ini untuk keperluan pembelajaran/demonstrasi. Silakan menambahkan lisensi sesuai kebutuhan Anda.
*** End Patch***}>>,
