# Proposal

## Why

Saat demo, setiap kali tutup shift presenter harus mengetik username dan kata sandi Kepala Toko di modal "Otorisasi Kepala Toko". Ini hanya aplikasi demo, jadi langkah mengetik itu memperlambat alur tanpa menambah nilai. Langkah persetujuan Kepala Toko tetap perlu terlihat, tetapi field-nya cukup sudah terisi.

## What Changes

- Aplikasi terdampak: **POS outlet** (`index.html` / `app.js`) saja. Pusat Data (`outlet-data.html`) tidak berubah.
- Modal "Otorisasi Kepala Toko" pada tutup shift membuka dengan field username sudah terisi username Kepala Toko shift yang ditutup (mis. `budi.leader` untuk Shift 1), dan field kata sandi sudah terisi kata sandi demo (`demo123`).
- Field tetap bisa diubah. Validasi kredensial yang ada tidak berubah, sehingga presenter masih bisa mendemokan penolakan dengan mengganti isinya (mis. `rina.leader`).
- Alur setelahnya (form BA, paket data, isi dan nama paket ZIP) tidak berubah, sehingga tidak ada dampak pada sisi hub.

**Di luar cakupan:**
- Modal "Verifikasi Kepala Toko" saat Mulai Shift dan form berita acara (catatan BA, centang konfirmasi) tidak diisi otomatis.
- Tidak ada backend, persistensi, atau autentikasi nyata; kata sandi tetap kata sandi demo yang sama untuk semua akun.

## Capabilities

### New Capabilities

(tidak ada)

### Modified Capabilities

- `shift-closing`: requirement "Otorisasi Kepala Toko sebelum tutup shift" berubah dari field kosong menjadi field yang sudah terisi kredensial Kepala Toko shift tersebut; scenario "Field otorisasi kosong" pada "Penolakan kredensial otorisasi" kini hanya terjadi bila pengguna mengosongkan field secara manual.

## Impact

- `app.js`: fungsi `closeShiftAuth()` (satu-satunya definisi), hanya atribut `value` pada input `#authUser` dan `#authPass`.
- Tidak ada perubahan pada `index.html`, `styles.css`, data, atau `outlet-data.*`.
