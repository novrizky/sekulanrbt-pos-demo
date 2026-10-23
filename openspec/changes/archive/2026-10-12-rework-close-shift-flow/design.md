# Design

## Context

Alur tutup shift di `app.js` saat ini:

- `$('#closeShift').onclick` (app.js:119, penugasan terakhir) → `closeShiftAuth()` (app.js:116) → `closeShiftBA()` (app.js:115).
- Tombol `#submitBA` dan `#uploadFTP` ditangani lewat `document.addEventListener('click', …)` di app.js:119. Ini satu-satunya listener seperti itu di alur ini, dan bertentangan dengan konvensi `.onclick =`.
- `openingCash` (app.js:163) diisi saat Mulai Shift; `HANDOVER_NOTES[1].cash` = 450.000 adalah modal bawaan Shift 1.
- Reset sesi hanya ada di `$('#logoutButton').onclick` (app.js:178).
- Angka di form BA (87 transaksi, Rp3.335.000, fee driver Rp85.000) sudah hard-coded.

## Goals / Non-Goals

**Goals:**
- Satu modal per langkah (rekap kas → otorisasi → BA) dengan `openModal()` yang ada.
- Semua handler alur tutup shift dipasang via `.onclick` di dalam fungsi yang me-render modalnya.

**Non-Goals:**
- Tidak mencatat metode bayar di `#finishPay`.
- Tidak menyentuh `outlet-data.*`.

## Decisions

1. **Data contoh per shift.** Tambah konstanta `CLOSING_CASH={1:{sales:2150000,fee:85000},2:{…},3:{…}}` di dekat `HANDOVER_NOTES`. Shift 1 selaras dengan fee driver Rp85.000 di BA. Alternatif menghitung dari transaksi POS ditolak (lihat proposal).
2. **State rekap.** Tambah global `closingCash` (angka) dan `closingNote` (string) di samping `closingApprover`, di-reset saat `#closeShift` ditekan dan saat sesi diakhiri. Modal awal memakai `openingCash ?? HANDOVER_NOTES[n].cash` agar Administrator (yang tidak melewati Mulai Shift) tetap mendapat angka wajar.
3. **Fungsi baru `closeShiftRecap()`** me-render modal "Tutup Shift n" berisi field `#closingCash` (type number) dan `#closingNote`, plus grid `.ba-summary`. `#closingCash.oninput` memperbarui sel selisih dan label catatan di tempat (bukan me-render ulang modal), supaya fokus input tidak hilang. Tombol "Lanjut ke Kepala Toko" menyimpan `closingCash`/`closingNote` lalu memanggil `closeShiftAuth()`. `#closeShift.onclick` diubah memanggil `closeShiftRecap()`.
4. **Warna selisih** memakai kelas yang ada: `.ok` (hijau) untuk Lebih, `.low` (oranye/merah) untuk Kurang, tanpa kelas untuk Sesuai. Tidak perlu CSS baru.
5. **Helper `cashDiff(physical, expected)`** mengembalikan `{label, cls, text}` (mis. `Kurang Rp25.000`), dipakai bersama oleh modal rekap dan form BA agar teksnya identik.
6. **Form BA** (`closeShiftBA()`): ganti teks pembuka tanpa paket/SFTP, tambah blok ringkasan kas dan catatan kasir (`-` bila kosong), ganti tombol menjadi `#submitBA` berlabel "Tutup shift", dan pasang `$('#submitBA').onclick` di dalam fungsi ini.
7. **Hapus `document.addEventListener('click', …)`** beserta modal "Paket data siap dikirim" dan cabang `#uploadFTP`. Tidak ada salinan lain yang mati.
8. **Akhir sesi.** Ekstrak isi `$('#logoutButton').onclick` menjadi `endSession(message)`; tombol logout memanggil `endSession('Anda telah keluar dari sistem')`, dan submit BA memanggil `closeModal()` lalu `endSession(\`Shift ${n} berhasil ditutup\`)`. `endSession` juga me-reset `closingCash`/`closingNote`. Alternatif menyalin kode reset ditolak karena dua salinan akan cepat berbeda.

## Risks / Trade-offs

- [Angka penjualan tunai statis, tidak berubah walau presenter membuat transaksi tunai] → Diterima untuk demo; disebut di proposal sebagai di luar cakupan.
- [Hub `outlet-data.html` masih menampilkan alur paket ZIP yang tak lagi dihasilkan POS] → Ditangani di change terpisah.
- [`endSession` mengubah handler `#logoutButton`] → Perilaku logout tetap sama; diverifikasi manual.
