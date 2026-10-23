# Proposal

## Why

Di prototipe POS saat ini, Kasir yang login langsung bisa menerima pesanan. Tidak ada momen "membuka shift": modal awal kas di laci tidak tercatat, catatan dari shift sebelumnya tidak tersampaikan, dan Kepala Toko tidak terlihat ikut mengawali shift. Padahal penutupan shift sudah punya alur lengkap (otorisasi Kepala Toko dan berita acara). Demo ke stakeholder perlu menampilkan siklus shift yang utuh, dari buka sampai tutup.

## What Changes

- Setelah login, Kasir SHALL melihat **layar Mulai Shift** layar penuh (seperti layar login). Seluruh POS (sidebar, view Kasir, Persediaan) tertutup sampai shift dimulai. Layar ini muncul setiap kali Kasir login. Refresh halaman mengulang alur dari awal.
- Isi layar Mulai Shift:
  - **Identitas shift** (read-only, dari akun login): outlet, Shift n beserta jamnya, nama kasir, dan tanggal demo.
  - **Modal awal kas** (Rupiah). Boleh Rp0, dan field yang dikosongkan dianggap Rp0.
  - **Catatan serah terima** dari kasir shift sebelumnya (teks contoh) **tidak tampil di layar Kasir**, tetapi di modal verifikasi Kepala Toko. Isinya hanya catatan kejadian dan sisa uang di cash register, tanpa informasi stok. Di modal ada centang "Saya sudah membaca catatan serah terima" yang wajib sebelum shift dimulai.
  - **Checklist kesiapan**: printer struk, mesin EDC, QRIS. Bebas dicentang, tidak wajib.
  - **Verifikasi Kepala Toko** tidak berada di layar Kasir. Setelah Kasir menekan "Mulai shift", muncul **modal "Verifikasi Kepala Toko"** terpisah berisi nama Kepala Toko, ringkasan (kasir, modal awal, sisa uang shift sebelumnya), field kata sandi yang **hanya tampilan** (isian apa pun diterima, termasuk kosong), dan kolom **Catatan Kepala Toko**. Jika modal awal berbeda dari sisa uang di cash register shift sebelumnya, modal menampilkan **peringatan selisih** dan catatan menjadi **wajib**. Jika nilainya sama, catatan opsional. Tombolnya "Batal" (kembali ke layar Kasir) dan "Verifikasi & mulai shift".
  - Tombol "Keluar" (kembali ke layar login) dan "Mulai shift" (membuka modal verifikasi).
- Setelah shift dimulai, view Kasir menampilkan penanda "Shift n berjalan · Modal awal Rp…".
- Kepala Toko dan Administrator tidak melewati layar Mulai Shift. Alur login mereka tidak berubah.

**Di luar cakupan:**
- Perhitungan uang diterima dan kembalian di pembayaran tunai, saldo laci, dan perhitungan selisih kas saat tutup shift. Modal awal hanya dicatat dan ditampilkan. Satu-satunya perbandingan di change ini adalah modal awal terhadap sisa uang shift sebelumnya di layar Mulai Shift.
- Alur tutup shift, termasuk berita acara (BA) dan siapa yang menutup shift. Rencananya Kasir menutup shift sendiri, dan hal itu dibahas di change terpisah. Change ini tidak mengubah `closeShiftBA()` maupun spec `shift-closing`.
- Verifikasi kata sandi Kepala Toko yang sebenarnya.
- Rincian pecahan uang dan cek stok awal.
- Mempertahankan shift yang sudah dimulai saat logout/login ulang atau refresh. Shift selalu dimulai ulang.
- Aplikasi Pusat Data Outlet (`outlet-data.html`) dan isi paket ZIP (`shift_closing.csv`/`manifest.json`). Modal awal tidak ditambahkan ke paket, jadi sisi hub tidak berubah.
- Backend, persistensi, dan integrasi perangkat nyata (printer, EDC, QRIS).

## Capabilities

### New Capabilities
- `shift-opening`: alur Kasir membuka shift di POS, mencakup layar Mulai Shift, data yang diisi, verifikasi Kepala Toko (tampilan), dan penanda shift berjalan.

### Modified Capabilities
- `pos-access-control`: setelah login, Kasir tidak langsung masuk ke view Kasir. Layar Mulai Shift tampil lebih dulu.

## Impact

- Aplikasi: **POS** (`index.html`) saja.
- `index.html`: markup layar Mulai Shift (overlay setingkat layar login) dan tempat penanda shift berjalan di header view Kasir.
- `app.js`: menampilkan layar setelah login Kasir (`loginAs`), handler "Mulai shift" dan "Keluar", dan menyembunyikan layar saat logout (`#logoutButton`).
- `styles.css`: gaya layar Mulai Shift dan penanda shift berjalan.
- Sisi hub: tidak ada dampak.
