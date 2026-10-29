## ADDED Requirements

### Requirement: Daftar tutup shift di panel berita acara
Panel "Berita acara tutup shift" di Admin › Shift & pengguna SHALL menampilkan daftar data tutup shift, yang terbaru di atas, dengan kolom NO. BA, PERIODE, KASIR, UANG FISIK, SELISIH, CANCEL, STATUS, dan AKSI. Setiap tutup shift dari Kasir SHALL menambah baris baru berstatus "Belum Diperiksa". Panel SHALL dapat dibuka oleh Kepala Toko dan Administrator.

#### Scenario: Tutup shift baru masuk daftar
- **WHEN** Ayu Setiani menutup Shift 1 dengan uang 2490000, lalu Budi Santoso login dan membuka Admin
- **THEN** baris teratas panel adalah "BA-0920-S1" dengan periode "20 Sep 2026 • Shift 1", kasir "Ayu Setiani", uang fisik "Rp2.490.000", selisih "Kurang Rp25.000", cancel "2", dan status "Belum Diperiksa"

#### Scenario: Data contoh
- **WHEN** Kepala Toko membuka Admin sebelum ada tutup shift baru
- **THEN** panel menampilkan BA-0919-S3 berstatus "Belum Diperiksa", serta BA-0919-S2 dan BA-0919-S1 berstatus "Sudah Diperiksa"

#### Scenario: Shift yang sama ditutup ulang
- **WHEN** Shift 1 tanggal 20 Sep ditutup lagi dalam sesi demo yang sama
- **THEN** panel tetap hanya memiliki satu baris "BA-0920-S1" dengan data penutupan terakhir

### Requirement: Status pemeriksaan tutup shift
Data tutup shift SHALL hanya memiliki dua status, yaitu "Belum Diperiksa" dan "Sudah Diperiksa". Metrik ringkasan di tab Shift & pengguna SHALL menampilkan "BA belum diperiksa" beserta jumlah data berstatus "Belum Diperiksa".

#### Scenario: Metrik mengikuti data
- **WHEN** panel berisi BA-0920-S1 dan BA-0919-S3 berstatus "Belum Diperiksa"
- **THEN** metrik menampilkan "BA belum diperiksa" dengan nilai "2 dokumen"

#### Scenario: Status lama tidak dipakai
- **WHEN** panel ditampilkan
- **THEN** tidak ada status "Menunggu kepala toko", "Dikirim owner", maupun "Disetujui"

### Requirement: Hanya Kepala Toko yang memeriksa
Kepala Toko SHALL dapat memeriksa data tutup shift dari semua shift di outletnya. Baris "Belum Diperiksa" menampilkan aksi "Periksa" untuk Kepala Toko. Administrator SHALL hanya dapat melihat: semua baris menampilkan aksi "Lihat" baginya, dan detailnya tidak memuat form berita acara. Baris "Sudah Diperiksa" SHALL menampilkan aksi "Lihat" untuk semua role.

#### Scenario: Kepala Toko shift lain memeriksa
- **WHEN** Rina Pratiwi (Kepala Toko Shift 2) membuka panel yang berisi BA-0920-S1 (Shift 1) berstatus "Belum Diperiksa"
- **THEN** baris tersebut menampilkan aksi "Periksa"

#### Scenario: Administrator hanya melihat
- **WHEN** Administrator membuka detail BA-0919-S3 yang berstatus "Belum Diperiksa"
- **THEN** detail tampil tanpa field "Catatan berita acara", tanpa centang konfirmasi, dan tanpa tombol "Tandai sudah diperiksa"

### Requirement: Detail pemeriksaan tutup shift
Detail tutup shift SHALL tampil sebagai halaman tersendiri di dalam POS, bukan modal. Halaman ini SHALL memiliki tombol "Kembali" ke panel berita acara di Admin › Shift & pengguna. Detail SHALL menampilkan seluruh data yang diinputkan Kasir beserta perhitungan sistem:
- modal awal, penjualan tunai, fee driver tunai, seharusnya di laci, dan uang fisik;
- selisih, dengan label "Lebih", "Kurang", atau "Sesuai";
- catatan kasir ("-" bila kosong);
- Kepala Toko yang memverifikasi saat tutup shift;
- daftar transaksi shift dengan keterangan "Menampilkan <x> dari <total> transaksi";
- histori cancel shift tersebut.

#### Scenario: Detail BA-0920-S1
- **WHEN** Budi Santoso menekan "Periksa" pada BA-0920-S1 (modal awal Rp450.000, uang fisik Rp2.490.000, catatan "Kembalian berlebih ke pelanggan meja 4")
- **THEN** halaman detail BA-0920-S1 tampil menggantikan view Admin, tanpa modal, dan menampilkan:
  - modal awal Rp450.000, penjualan tunai Rp2.150.000, fee driver tunai Rp85.000;
  - seharusnya di laci Rp2.515.000, uang fisik Rp2.490.000, selisih "Kurang Rp25.000";
  - catatan kasir tersebut, dan "Diverifikasi saat tutup shift oleh: Budi Santoso (Kepala Toko)";
  - tabel transaksi dengan "Menampilkan 8 dari 87 transaksi";
  - histori cancel CNL-0920-007 dan CNL-0920-006.

#### Scenario: Tanpa catatan kasir
- **WHEN** Kasir menutup shift tanpa catatan, lalu Kepala Toko membuka detailnya
- **THEN** catatan kasir tampil "-"

#### Scenario: Tanpa pembatalan
- **WHEN** Kepala Toko membuka detail tutup shift yang tidak memiliki pembatalan
- **THEN** bagian histori cancel menampilkan "Tidak ada pembatalan"

#### Scenario: Kembali ke daftar
- **WHEN** pengguna menekan "Kembali" di halaman detail tanpa menandai apa pun
- **THEN** panel "Berita acara tutup shift" di Admin › Shift & pengguna tampil lagi dan status tutup shift tersebut tidak berubah

### Requirement: Detail item transaksi dan pembatalan
Tabel transaksi SHALL berkolom NO. TRANSAKSI, JAM, JUMLAH ITEM, METODE, TOTAL, dan AKSI "Detail", tanpa menuliskan daftar item dalam satu baris. Tabel histori cancel SHALL berkolom ID, WAKTU, ITEM, KASIR, dan AKSI "Detail". Aksi "Detail" pada baris transaksi SHALL membuka modal berisi nomor transaksi, jam, metode, tabel item (ITEM, QTY, HARGA, SUBTOTAL), dan total. Harga item SHALL diambil dari harga menu. Aksi "Detail" pada baris histori cancel SHALL membuka modal berisi ID, waktu, shift, item, harga, alasan, dan kasir. Menutup modal SHALL tetap menampilkan halaman detail tutup shift.

#### Scenario: Detail transaksi
- **WHEN** Kepala Toko menekan "Detail" pada transaksi TRX-0920-1081 di halaman detail BA-0920-S1
- **THEN** modal menampilkan TRX-0920-1081, jam 07.15, metode QRIS, item "Paket Favorit 25K" qty 1 Rp25.000 dan "Es teh manis" qty 1 Rp6.000, serta total Rp31.000

#### Scenario: Detail pembatalan
- **WHEN** Kepala Toko menekan "Detail" pada CNL-0920-007 di halaman detail BA-0920-S1
- **THEN** modal menampilkan CNL-0920-007, "20 Sep 2026 12.43", Shift 1, item "Paket Komplit 23K" Rp23.000, alasan "Salah pilih menu", dan kasir "Ayu Setiani"

#### Scenario: Tutup modal detail item
- **WHEN** pengguna menutup modal detail transaksi atau pembatalan
- **THEN** modal tertutup dan halaman detail tutup shift tetap tampil

### Requirement: Paging contoh pada tabel detail
Tabel transaksi dan tabel histori cancel di halaman detail SHALL menampilkan paging contoh di bawah tabel: teks "Halaman 1 dari <N>" dan tombol "‹ Sebelumnya", nomor halaman, serta "Berikutnya ›". N dihitung dari jumlah data dengan 8 baris per halaman. Halaman 1 SHALL aktif dan "‹ Sebelumnya" SHALL nonaktif. Menekan halaman lain atau "Berikutnya ›" SHALL hanya menampilkan toast "Data contoh: hanya halaman 1 yang ditampilkan" tanpa mengubah baris tabel. Paging tidak tampil bila tidak ada pembatalan.

#### Scenario: Paging transaksi
- **WHEN** Kepala Toko membuka halaman detail BA-0920-S1 (87 transaksi)
- **THEN** di bawah tabel transaksi tampil "Halaman 1 dari 11", halaman 1 aktif, dan "‹ Sebelumnya" nonaktif

#### Scenario: Halaman lain belum tersedia
- **WHEN** Kepala Toko menekan "Berikutnya ›" atau nomor halaman 2 pada tabel transaksi
- **THEN** toast "Data contoh: hanya halaman 1 yang ditampilkan" tampil dan tabel tetap berisi 8 transaksi yang sama

#### Scenario: Paging histori cancel
- **WHEN** Kepala Toko membuka halaman detail BA-0920-S1 (2 pembatalan)
- **THEN** di bawah tabel histori cancel tampil "Halaman 1 dari 1", dengan "‹ Sebelumnya" dan "Berikutnya ›" nonaktif

### Requirement: Menandai tutup shift Sudah Diperiksa
Untuk menandai "Sudah Diperiksa", Kepala Toko SHALL mengisi "Catatan berita acara", mencentang "Saya sebagai Kepala Toko telah memeriksa transaksi dan histori cancel.", lalu menekan "Tandai sudah diperiksa". Bila salah satunya belum dilakukan, sistem SHALL menolak dengan toast "Lengkapi catatan dan konfirmasi Kepala Toko" dan status tidak berubah. Setelah berhasil, status SHALL menjadi "Sudah Diperiksa", dan sistem SHALL mencatat catatan BA, nama Kepala Toko pemeriksa, serta waktunya.

#### Scenario: Tampilan form berita acara
- **WHEN** Kepala Toko membuka halaman detail tutup shift berstatus "Belum Diperiksa"
- **THEN** label "Catatan berita acara" tampil di atas textarea selebar panel, dengan gaya label dan field yang sama seperti form lain di POS, dan centang konfirmasi tampil di bawahnya

#### Scenario: BA belum lengkap
- **WHEN** Budi Santoso menekan "Tandai sudah diperiksa" pada BA-0920-S1 tanpa catatan berita acara atau tanpa centang konfirmasi
- **THEN** toast "Lengkapi catatan dan konfirmasi Kepala Toko" tampil dan status tetap "Belum Diperiksa"

#### Scenario: BA lengkap
- **WHEN** Budi Santoso mengisi catatan berita acara "Selisih karena kembalian, sudah dikonfirmasi kasir", mencentang konfirmasi, lalu menekan "Tandai sudah diperiksa"
- **THEN** halaman kembali ke panel berita acara, toast "BA-0920-S1 sudah diperiksa" tampil, baris BA-0920-S1 berstatus "Sudah Diperiksa" dengan aksi "Lihat", dan metrik "BA belum diperiksa" berkurang satu

#### Scenario: Melihat BA yang sudah diperiksa
- **WHEN** pengguna menekan "Lihat" pada BA-0920-S1 yang sudah diperiksa
- **THEN** detail tampil dalam mode baca dengan catatan berita acara tersebut dan "Diperiksa oleh Budi Santoso • 20 Sep 2026 13.02", tanpa form maupun tombol "Tandai sudah diperiksa"
