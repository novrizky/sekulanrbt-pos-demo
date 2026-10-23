# Tasks

## 1. POS outlet — app.js: data, state, dan akhir sesi

- [x] 1.1 Tambah konstanta `CLOSING_CASH` (Shift 1: penjualan tunai 2.150.000, fee 85.000; Shift 2 dan 3 angka realistis) di dekat `HANDOVER_NOTES`, dan global `closingCash`/`closingNote` di samping `closingApprover`. Verifikasi: `node --check app.js` lolos.
- [x] 1.2 Ekstrak isi `$('#logoutButton').onclick` menjadi `endSession(message)` (juga me-reset `closingCash`/`closingNote`), lalu tombol logout memanggil `endSession('Anda telah keluar dari sistem')`. Verifikasi manual: login lalu logout, layar login tampil dengan toast yang sama seperti sebelumnya.
- [x] 1.3 Tambah helper `cashDiff(physical, expected)` yang mengembalikan label Lebih/Kurang/Sesuai, kelas (`ok`/`low`/kosong), dan teks seperti `Kurang Rp25.000`. Verifikasi: `node --check app.js` lolos.

## 2. POS outlet — app.js: langkah rekap kas

- [x] 2.1 Buat `closeShiftRecap()`: modal "Tutup Shift n" dengan ringkasan modal awal, penjualan tunai, fee driver tunai, seharusnya di laci, field `#closingCash` (kosong), `#closingNote`, sel selisih, tombol "Batal" dan "Lanjut ke Kepala Toko". Verifikasi manual: login `ayu.kasir`, mulai shift dengan modal Rp450.000, tekan "Tutup shift" → tampil seharusnya di laci Rp2.515.000.
- [x] 2.2 Pasang `#closingCash.oninput` untuk memperbarui selisih dan label "(wajib)" di tempat. Verifikasi manual: ketik 2550000 → "Lebih Rp35.000" + "(wajib)"; 2490000 → "Kurang Rp25.000"; 2515000 → "Sesuai Rp0" tanpa "(wajib)".
- [x] 2.3 Tombol "Lanjut ke Kepala Toko" menyimpan `closingCash`/`closingNote` lalu memanggil `closeShiftAuth()`; ubah `$('#closeShift').onclick` (penugasan terakhir) agar me-reset state lalu memanggil `closeShiftRecap()`. Verifikasi manual: lanjut dengan catatan kosong meski ada selisih → modal otorisasi tampil tanpa toast; "Batal" menutup modal.

## 3. POS outlet — app.js: form BA dan hapus paket data

- [x] 3.1 Ubah `closeShiftBA()`: teks pembuka tanpa paket/SFTP, tambah ringkasan kas (seharusnya, fisik, selisih via `cashDiff`) dan catatan kasir (`-` bila kosong), tombol `#submitBA` berlabel "Tutup shift" dengan `.onclick` dipasang di fungsi ini (validasi catatan BA + centang tetap). Verifikasi manual: BA menampilkan "Kurang Rp25.000" dan catatan kasir yang diisi; tanpa catatan BA → toast "Lengkapi catatan dan konfirmasi Kepala Toko".
- [x] 3.2 Hapus `document.addEventListener('click', …)` beserta modal "Paket data siap dikirim" dan cabang `#uploadFTP`. Verifikasi: `grep -n "uploadFTP\|Paket data siap\|addEventListener('click'" app.js` tidak menemukan apa pun dari alur ini.
- [x] 3.3 Submit BA lengkap memanggil `closeModal()` lalu `endSession(\`Shift ${n} berhasil ditutup\`)`. Verifikasi manual: BA lengkap → toast "Shift 1 berhasil ditutup", layar login tampil; login lagi `ayu.kasir` → layar "Mulai Shift" tampil.

## 4. Verifikasi alur lengkap

- [x] 4.1 Verifikasi manual end-to-end di browser: login Kasir → Mulai Shift → transaksi → Tutup shift → rekap kas → otorisasi (isian bawaan) → BA → login kembali; pastikan tidak ada error di console dan logout biasa masih berfungsi.

## Workflow follow-up

- Saat arsip, perbarui `## Purpose` di `openspec/specs/shift-closing/spec.md` agar tidak lagi menyebut paket data.
- Change terpisah untuk Pusat Data Outlet serta `CLAUDE.md`/`openspec/config.yaml` yang masih menjelaskan paket ZIP/SFTP.
