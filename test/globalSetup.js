// Kunci zona waktu test ke WIB (UTC+7) agar test tanggal deterministik
// di mesin mana pun (lokal maupun CI). Logika streak & kunci tanggal
// sengaja memakai waktu LOKAL, jadi hasilnya bergantung pada TZ.
module.exports = async () => {
  process.env.TZ = "Asia/Jakarta";
};
