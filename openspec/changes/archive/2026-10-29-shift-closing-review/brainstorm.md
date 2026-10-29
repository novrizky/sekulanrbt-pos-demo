# Brainstorm: Tutup shift Kasir disederhanakan, pemeriksaan BA oleh Kepala Toko

Ukuran: project kecil–menengah (POS `index.html` + `app.js`). Dua alur berubah dan ada satu model data baru.

## Latar belakang (kondisi kode saat ini)

- Tutup shift sekarang terjadi dalam satu rangkaian modal di perangkat Kasir:
  1. `closeShiftRecap()` (app.js:118) menampilkan modal awal, penjualan tunai, fee, "Seharusnya di laci", field "Sisa uang di cash register", selisih yang dihitung langsung, dan "Catatan khusus kasir" dengan penanda "(wajib)" saat ada selisih. Penanda ini tidak divalidasi.
  2. `closeShiftAuth()` (app.js:120–121) menampilkan otorisasi Kepala Toko dengan isian otomatis dan aturan penolakan kredensial.
  3. `closeShiftBA()` (app.js:119) menampilkan form BA (ringkasan kas, catatan BA, centang konfirmasi), lalu `endSession("Shift n berhasil ditutup")`.
- Kepala Toko mengisi BA di perangkat Kasir. Kasir juga melihat semua angka kas, termasuk seharusnya dan selisih.
- Panel "Berita acara tutup shift" (`#baTable`) berada di **Admin › Shift & pengguna** (index.html:171), dirender di `renderAdmin()` dari array posisional hard-coded `bas` (app.js:97). Statusnya: "Menunggu kepala toko", "Dikirim owner", "Disetujui". Di tab yang sama ada metrik statis "BA menunggu owner – 2 dokumen" dan teks "Kepala Toko wajib menyelesaikan berita acara sebelum shift ditutup."
- Belum ada data transaksi per baris. Yang ada hanya `salesRows` (rekap per shift: 87 / 102 / 35 transaksi pada 20 Sep), `cancelLog` (histori cancel per shift), dan `CLOSING_CASH` (penjualan tunai dan fee per shift).
- `ROLE_ACCESS`: Kepala Toko punya akses Admin `users` dan `outlets`, Administrator punya akses semua tab.

## Intent

Kasir cukup menghitung uang dan menyerahkannya. Kasir tidak perlu tahu berapa seharusnya, supaya hitungan fisik tidak terpengaruh angka sistem. Kepala Toko cukup memverifikasi penutupan saat itu, lalu memeriksa ulang data tutup shift belakangan dari panel BA, lengkap dengan detail transaksi dan histori cancel.

## Rantai keputusan (dari sesi explore)

- **Q1. Isi modal tutup shift Kasir?** Hanya field "Uang di cash register" (label lama "Sisa uang di cash register") dan catatan opsional. Detail uang tidak terlihat oleh Kasir. (user, poin 1–3)
- **Q2. Penanda "(wajib)" pada catatan?** Dibuang. (user)
- **Q3. Setelah isi uang?** Otorisasi Kepala Toko seperti sekarang, hanya untuk memvalidasi tutup shift. Setelah itu tampil halaman "Verifikasi tutup shift berhasil". (user, poin 4)
- **Q4. Form BA dalam alur Kasir?** Dihapus dan pindah ke pemeriksaan Kepala Toko. (user, poin 5–6)
- **Q5. Menu baru atau panel lama?** Panel "Berita acara tutup shift" yang sudah ada dimodifikasi, tidak ada menu sidebar baru. (user)
- **Q6. Lokasi panel?** Tetap di Admin › Shift & pengguna. User memilih ini setelah diberi tahu panel tersebut bukan di Laporan.
- **Q7. Status?** Hanya "Belum Diperiksa" dan "Sudah Diperiksa". Status lama diganti. (user, poin 9)
- **Q8. Detail saat memeriksa?** Kepala Toko melihat seluruh detail: rekap kas lengkap, catatan kasir, daftar transaksi, histori cancel. (user, poin 10)
- **Q9. Menandai Sudah Diperiksa?** Isi catatan berita acara dan centang "Saya sebagai Kepala Toko telah memeriksa transaksi dan histori cancel." (user, poin 11)
- **Q10. Data transaksi?** Tambah data contoh sekitar 8 baris per shift, ditampilkan sebagai "Menampilkan 8 dari 87 transaksi". (usulan, disetujui user)
- **Q11. Bentuk data?** `bas` posisional diganti array objek. Tutup shift Kasir menambahkan baris baru di urutan teratas. Baris contoh lama dipertahankan dengan campuran Belum dan Sudah. (usulan, disetujui user)
- **Q12. UI detail?** `openModal()`. Baris yang sudah diperiksa dibuka dalam mode baca (BA, pemeriksa, waktu). Layar sukses Kasir berupa modal dengan tombol "Selesai". (usulan, disetujui user)
- **Q13. Siapa yang boleh menandai?** Hanya Kepala Toko. Administrator hanya melihat. (user)
- **Q14. Cakupan Kepala Toko?** Semua shift di outletnya, tidak terbatas pada shift yang dipimpinnya. (user)

## Pendekatan

| | Pendekatan | Trade-off |
|---|---|---|
| **A (dipilih)** | Array objek `shiftClosings` (satu record per tutup shift, berisi angka kas, catatan, pengotorisasi, status, dan BA) ditambah `shiftTransactions` per nomor shift. Cancel diambil dari `cancelLog` berdasarkan tanggal dan shift | Record mandiri, mudah dirender di tabel dan detail. Konvensi proyek mengizinkan objek untuk data baru (`scheduledOrders`, `materialRequests`) |
| B | Tetap memakai array posisional `bas` dan menambah kolom di akhir | Konsisten dengan data lama, tetapi record dengan BA bersarang dan sekitar 12 field sulit dibaca lewat indeks |
| C | Detail dihitung saat dibuka dari `salesRows`/`CLOSING_CASH` tanpa menyimpan record | Tidak bisa menyimpan uang fisik, catatan kasir, atau BA per tutup shift. Tidak memenuhi Q8 dan Q9 |

A adalah keputusan saya. B dan C tidak dipilih karena alasan di atas.

## Keputusan perancang (dapat dikoreksi)

- **ID record.** Record baru diberi ID `BA-0920-S<n>`. Baris contoh: `BA-0919-S3` (Sari W., Belum Diperiksa), `BA-0919-S2` (Dimas A., Sudah Diperiksa oleh Rina Pratiwi), `BA-0919-S1` (Ayu Setiani, Sudah Diperiksa oleh Budi Santoso). Baris lama `BA-0920-S1` "Menunggu kepala toko" dihapus karena ID-nya akan dipakai saat Ayu menutup Shift 1 pada 20 Sep.
- **Bila shift yang sama ditutup lagi** (misalnya demo diulang tanpa reload), record dengan ID yang sama diganti, bukan diduplikasi.
- **Kolom tabel:** NO. BA, PERIODE, KASIR, UANG FISIK, SELISIH, CANCEL, STATUS, AKSI. Status berupa pill (`low` untuk Belum, `ok` untuk Sudah). Aksinya:
  - Kepala Toko: "Periksa" di baris Belum Diperiksa, "Lihat" di baris Sudah Diperiksa.
  - Administrator: "Lihat" di semua baris.
- **Metrik "BA menunggu owner"** diganti menjadi "BA belum diperiksa" dengan jumlah yang dihitung dari data.
- **Teks yang ikut diperbarui:**
  - Kartu shift: "Kepala Toko memverifikasi tutup shift Kasir, lalu memeriksa berita acaranya di bawah."
  - Subjudul panel: "Kepala Toko memeriksa ulang setiap tutup shift dari Kasir."
  - Hak akses: Kepala Toko "mengotorisasi tutup shift dan memeriksa berita acara tutup shift".
- **Layar sukses Kasir.** Setelah otorisasi berhasil: record disimpan, `openShift=null`, `endSession("Shift n berhasil ditutup")`, lalu modal "Verifikasi tutup shift berhasil" tampil di atas layar login dengan tombol "Selesai". Modal (z-index 105) berada di atas layar login (100), jadi cara apa pun menutup modal hasilnya sama: layar login.
- **Validasi saat menandai** memakai toast yang sudah ada: "Lengkapi catatan dan konfirmasi Kepala Toko". Sukses: toast "BA-0920-S1 sudah diperiksa".
- **Waktu pemeriksaan** memakai `ORDER_NOW` ("20 Sep 2026 13.02") sebagai jam demo.

## Non-goal

- Menu sidebar baru.
- Persetujuan atau pengiriman ke owner, dan status selain dua status di atas.
- Mencatat transaksi nyata dari keranjang ke daftar transaksi (tetap data contoh).
- Perubahan di Pusat Data Outlet (`outlet-data.html`) atau format paket ZIP.
- Pembatasan pemeriksaan per shift Kepala Toko (Q14).
- Persistensi lintas reload.

## Untuk perancang/pembangun

- `closeShiftBA()` dihapus. Penggantinya adalah modal sukses dan modal pemeriksaan di Admin.
- Panggilan `closeShiftBA()` di `closeShiftAuth()` (handler `#verifyLeader`) diganti.
- `renderAdmin()` harus dipanggil ulang setelah record ditambah atau diperiksa, supaya tabel dan metrik ikut berubah.
