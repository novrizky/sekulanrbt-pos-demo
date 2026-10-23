# Spec Delta

## ADDED Requirements

### Requirement: Rekap kas Kasir sebagai langkah pertama tutup shift
Saat Kasir menekan "Tutup shift", sistem SHALL menampilkan langkah rekap kas sebelum langkah otorisasi Kepala Toko. Langkah ini SHALL berisi field "Sisa uang di cash register" (kosong saat dibuka), field "Catatan khusus kasir", dan perbandingan kas: modal awal (dari isian saat Mulai Shift), penjualan tunai dan fee driver tunai (angka contoh per shift), "Seharusnya di laci" = modal awal + penjualan tunai − fee driver tunai, uang fisik, dan selisih.

#### Scenario: Kasir membuka rekap kas
- **WHEN** Ayu Setiani (Kasir, Shift 1, modal awal Rp450.000) menekan "Tutup shift"
- **THEN** modal "Tutup Shift 1" tampil dengan langkah rekap kas yang menampilkan modal awal Rp450.000, penjualan tunai Rp2.150.000, fee driver tunai Rp85.000, dan seharusnya di laci Rp2.515.000, serta field sisa uang yang masih kosong; langkah otorisasi belum tampil

#### Scenario: Lanjut ke otorisasi
- **WHEN** pada langkah rekap kas Kasir menekan "Lanjut ke Kepala Toko"
- **THEN** langkah otorisasi Kepala Toko tampil

#### Scenario: Batal di langkah rekap kas
- **WHEN** Kasir menekan "Batal" di langkah rekap kas
- **THEN** modal tertutup dan shift tidak ditutup

### Requirement: Selisih kas dihitung langsung
Selisih kas SHALL dihitung sebagai uang fisik dikurangi seharusnya di laci, dan diperbarui setiap kali Kasir mengubah isian sisa uang. Selisih positif SHALL diberi label "Lebih", selisih negatif "Kurang", dan selisih nol "Sesuai". Isian sisa uang yang kosong SHALL dihitung sebagai Rp0, tanpa menahan Kasir untuk lanjut.

#### Scenario: Uang di laci lebih
- **WHEN** seharusnya di laci Rp2.515.000 dan Kasir mengisi sisa uang Rp2.550.000
- **THEN** selisih tampil "Lebih Rp35.000"

#### Scenario: Uang di laci kurang
- **WHEN** seharusnya di laci Rp2.515.000 dan Kasir mengisi sisa uang Rp2.490.000
- **THEN** selisih tampil "Kurang Rp25.000"

#### Scenario: Uang di laci sesuai
- **WHEN** seharusnya di laci Rp2.515.000 dan Kasir mengisi sisa uang Rp2.515.000
- **THEN** selisih tampil "Sesuai Rp0"

### Requirement: Catatan kasir ditandai wajib saat ada selisih
Saat selisih kas tidak nol, label field catatan kasir SHALL menampilkan "(wajib)". Ini hanya penanda; sistem SHALL tetap mengizinkan Kasir lanjut ke otorisasi walaupun catatan kosong.

#### Scenario: Ada selisih
- **WHEN** selisih kas tampil "Lebih" atau "Kurang"
- **THEN** label catatan kasir menampilkan "(wajib)"

#### Scenario: Lanjut tanpa catatan meski ada selisih
- **WHEN** selisih kas tidak nol, catatan kasir kosong, lalu Kasir menekan "Lanjut ke Kepala Toko"
- **THEN** langkah otorisasi Kepala Toko tetap tampil tanpa toast peringatan

#### Scenario: Tidak ada selisih
- **WHEN** selisih kas "Sesuai"
- **THEN** label catatan kasir tidak menampilkan "(wajib)"

### Requirement: Sesi Kasir berakhir setelah tutup shift
Setelah berita acara lengkap dan "Tutup shift" ditekan, sistem SHALL menampilkan toast "Shift <n> berhasil ditutup", mengakhiri sesi Kasir, dan kembali ke layar login.

#### Scenario: Shift 1 ditutup
- **WHEN** Ayu Setiani menyelesaikan BA Shift 1 lalu menekan "Tutup shift"
- **THEN** toast "Shift 1 berhasil ditutup" tampil, modal tertutup, dan layar login tampil kembali

#### Scenario: Login lagi setelah tutup shift
- **WHEN** setelah tutup shift Kasir login kembali dengan `ayu.kasir` / `demo123`
- **THEN** layar "Mulai Shift" tampil seperti awal sesi

## MODIFIED Requirements

### Requirement: Otorisasi Kepala Toko sebelum tutup shift
Setelah Kasir menyelesaikan langkah rekap kas, sistem SHALL selalu menampilkan langkah otorisasi Kepala Toko sebelum menampilkan form berita acara. Modal otorisasi SHALL menampilkan nama Kepala Toko yang berwenang untuk shift tersebut. Karena ini aplikasi demo, field username SHALL sudah terisi username Kepala Toko shift tersebut dan field kata sandi SHALL sudah terisi kata sandi demo, sehingga Kasir cukup menekan "Verifikasi". Kedua field SHALL tetap dapat diubah.

#### Scenario: Kasir membuka tutup shift
- **WHEN** Ayu Setiani (Kasir, Shift 1) menekan "Lanjut ke Kepala Toko" di langkah rekap kas
- **THEN** langkah otorisasi tampil dengan keterangan "Shift 1 · Kepala Toko: Budi Santoso", field username sudah berisi `budi.leader`, field kata sandi sudah terisi, dan form berita acara belum tampil

#### Scenario: Verifikasi langsung dengan isian bawaan
- **WHEN** pada langkah otorisasi Shift 1 Kasir langsung menekan "Verifikasi" tanpa mengubah isian
- **THEN** form berita acara tampil dengan keterangan "Diperiksa oleh: Budi Santoso (Kepala Toko)"

#### Scenario: Kredensial Kepala Toko yang benar
- **WHEN** pada langkah otorisasi Shift 1 dimasukkan `budi.leader` / `demo123` lalu "Verifikasi" ditekan
- **THEN** form berita acara tampil dengan keterangan "Diperiksa oleh: Budi Santoso (Kepala Toko)"

#### Scenario: Batal di langkah otorisasi
- **WHEN** pengguna menekan "Batal" di langkah otorisasi
- **THEN** modal tertutup dan shift tidak ditutup

### Requirement: Berita acara wajib dilengkapi Kepala Toko
Form berita acara SHALL menampilkan ringkasan kas dari langkah rekap kas (seharusnya di laci, uang fisik, selisih) beserta catatan kasir, dan SHALL mewajibkan catatan BA serta centang konfirmasi "Saya sebagai Kepala Toko telah memeriksa transaksi dan histori cancel." sebelum shift dapat ditutup. Form BA SHALL tidak lagi menyebut paket data maupun SFTP.

#### Scenario: Ringkasan kas di BA
- **WHEN** Kasir mengisi sisa uang Rp2.490.000 dengan catatan "Kembalian berlebih ke pelanggan meja 4", lalu otorisasi Shift 1 berhasil
- **THEN** form BA menampilkan seharusnya di laci Rp2.515.000, uang fisik Rp2.490.000, selisih "Kurang Rp25.000", dan catatan kasir tersebut

#### Scenario: BA tanpa catatan kasir
- **WHEN** Kasir tidak mengisi catatan khusus, lalu otorisasi berhasil
- **THEN** form BA menampilkan catatan kasir "-"

#### Scenario: BA belum lengkap
- **WHEN** "Tutup shift" pada form BA ditekan tanpa catatan BA atau tanpa centang konfirmasi
- **THEN** toast "Lengkapi catatan dan konfirmasi Kepala Toko" tampil dan shift tidak ditutup

#### Scenario: BA lengkap
- **WHEN** catatan BA diisi, konfirmasi dicentang, lalu "Tutup shift" pada form BA ditekan
- **THEN** shift ditutup tanpa menampilkan modal paket data

## REMOVED Requirements

### Requirement: Paket data mencantumkan pemeriksa
**Reason**: Aplikasi akan menjadi aplikasi cloud, sehingga POS tidak lagi membuat maupun mengirim paket data ZIP via SFTP saat tutup shift.
**Migration**: Nama Kepala Toko pemeriksa tetap tampil di form BA ("Diperiksa oleh: …"). Penyesuaian Pusat Data Outlet ditangani di change terpisah.
