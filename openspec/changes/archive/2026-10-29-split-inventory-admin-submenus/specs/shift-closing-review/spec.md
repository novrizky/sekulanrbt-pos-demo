## MODIFIED Requirements

### Requirement: Daftar tutup shift di panel berita acara
Panel "Berita acara tutup shift" di Admin › Shift SHALL menampilkan daftar data tutup shift, yang terbaru di atas, dengan kolom NO. BA, PERIODE, KASIR, UANG FISIK, SELISIH, CANCEL, STATUS, dan AKSI. Setiap tutup shift dari Kasir SHALL menambah baris baru berstatus "Belum Diperiksa". Panel SHALL dapat dibuka oleh Kepala Toko dan Administrator.

#### Scenario: Tutup shift baru masuk daftar
- **WHEN** Ayu Setiani menutup Shift 1 dengan uang 2490000, lalu Budi Santoso login dan membuka submenu Admin › Shift
- **THEN** baris teratas panel adalah "BA-0920-S1" dengan periode "20 Sep 2026 • Shift 1", kasir "Ayu Setiani", uang fisik "Rp2.490.000", selisih "Kurang Rp25.000", cancel "2", dan status "Belum Diperiksa"

#### Scenario: Data contoh
- **WHEN** Kepala Toko membuka submenu Admin › Shift sebelum ada tutup shift baru
- **THEN** panel menampilkan BA-0919-S3 berstatus "Belum Diperiksa", serta BA-0919-S2 dan BA-0919-S1 berstatus "Sudah Diperiksa"

#### Scenario: Shift yang sama ditutup ulang
- **WHEN** Shift 1 tanggal 20 Sep ditutup lagi dalam sesi demo yang sama
- **THEN** panel tetap hanya memiliki satu baris "BA-0920-S1" dengan data penutupan terakhir

### Requirement: Status pemeriksaan tutup shift
Data tutup shift SHALL hanya memiliki dua status, yaitu "Belum Diperiksa" dan "Sudah Diperiksa". Kartu ringkasan di submenu Admin › Shift SHALL menampilkan "BA belum diperiksa" dan "BA sudah diperiksa" beserta jumlah data pada masing-masing status.

#### Scenario: Metrik mengikuti data
- **WHEN** panel berisi BA-0920-S1 dan BA-0919-S3 berstatus "Belum Diperiksa"
- **THEN** kartu "BA belum diperiksa" menampilkan nilai "2 dokumen"

#### Scenario: Status lama tidak dipakai
- **WHEN** panel ditampilkan
- **THEN** tidak ada status "Menunggu kepala toko", "Dikirim owner", maupun "Disetujui"

### Requirement: Detail pemeriksaan tutup shift
Detail tutup shift SHALL tampil sebagai halaman tersendiri di dalam POS, bukan modal. Halaman ini SHALL memiliki tombol "Kembali" ke panel berita acara di Admin › Shift. Detail SHALL menampilkan seluruh data yang diinputkan Kasir beserta perhitungan sistem:
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
- **THEN** submenu Admin › Shift tampil lagi dengan "Shift" aktif di sidebar, panel "Berita acara tutup shift" terlihat, dan status tutup shift tersebut tidak berubah
