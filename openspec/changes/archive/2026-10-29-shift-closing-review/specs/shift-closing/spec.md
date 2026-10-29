## MODIFIED Requirements

### Requirement: Otorisasi Kepala Toko sebelum tutup shift
Setelah Kasir mengisi uang di cash register, sistem SHALL selalu menampilkan langkah otorisasi Kepala Toko sebelum shift ditutup. Otorisasi ini hanya memvalidasi tutup shift Kasir. Form berita acara SHALL tidak ditampilkan dalam alur Kasir. Modal otorisasi SHALL menampilkan nama Kepala Toko yang berwenang untuk shift tersebut. Karena ini aplikasi demo, field username SHALL sudah terisi username Kepala Toko shift tersebut dan field kata sandi SHALL sudah terisi kata sandi demo, sehingga Kasir cukup menekan "Verifikasi". Kedua field SHALL tetap dapat diubah.

#### Scenario: Kasir membuka tutup shift
- **WHEN** Ayu Setiani (Kasir, Shift 1) menekan "Lanjut ke Kepala Toko" di modal tutup shift
- **THEN** langkah otorisasi tampil dengan keterangan "Shift 1 · Kepala Toko: Budi Santoso", field username sudah berisi `budi.leader`, dan field kata sandi sudah terisi

#### Scenario: Verifikasi langsung dengan isian bawaan
- **WHEN** pada langkah otorisasi Shift 1 Kasir langsung menekan "Verifikasi" tanpa mengubah isian
- **THEN** modal "Verifikasi tutup shift berhasil" tampil dan form berita acara tidak tampil

#### Scenario: Kredensial Kepala Toko yang benar
- **WHEN** pada langkah otorisasi Shift 1 dimasukkan `budi.leader` / `demo123` lalu "Verifikasi" ditekan
- **THEN** modal "Verifikasi tutup shift berhasil" tampil dengan teks "Shift 1 telah diverifikasi oleh Budi Santoso (Kepala Toko)."

#### Scenario: Batal di langkah otorisasi
- **WHEN** pengguna menekan "Batal" di langkah otorisasi
- **THEN** modal tertutup dan shift tidak ditutup

### Requirement: Rekap kas Kasir sebagai langkah pertama tutup shift
Saat Kasir menekan "Tutup shift", sistem SHALL menampilkan modal "Tutup Shift <n>" sebelum langkah otorisasi Kepala Toko. Modal ini SHALL hanya berisi field "Uang di cash register" (kosong saat dibuka), field "Catatan (opsional)", serta tombol "Batal" dan "Lanjut ke Kepala Toko". Modal SHALL tidak menampilkan detail uang apa pun, yaitu modal awal, penjualan tunai, fee driver, seharusnya di laci, maupun selisih. Catatan SHALL selalu opsional tanpa penanda "(wajib)". Isian uang yang kosong SHALL dihitung sebagai Rp0 tanpa menahan Kasir untuk lanjut.

#### Scenario: Kasir membuka rekap kas
- **WHEN** Ayu Setiani (Kasir, Shift 1, modal awal Rp450.000) menekan "Tutup shift"
- **THEN** modal "Tutup Shift 1" tampil dengan field "Uang di cash register" yang kosong dan field "Catatan (opsional)", tanpa teks "Modal awal", "Penjualan tunai", "Fee driver", "Seharusnya di laci", maupun "Selisih"

#### Scenario: Lanjut ke otorisasi
- **WHEN** Kasir mengisi uang 2490000 tanpa catatan lalu menekan "Lanjut ke Kepala Toko"
- **THEN** langkah otorisasi Kepala Toko tampil tanpa toast peringatan, dan label catatan tidak pernah menampilkan "(wajib)"

#### Scenario: Batal di langkah rekap kas
- **WHEN** Kasir menekan "Batal" di modal tutup shift
- **THEN** modal tertutup dan shift tidak ditutup

### Requirement: Sesi Kasir berakhir setelah tutup shift
Setelah otorisasi Kepala Toko berhasil, sistem SHALL menyimpan data tutup shift dengan status "Belum Diperiksa", mengakhiri sesi Kasir dengan toast "Shift <n> berhasil ditutup", dan kembali ke layar login. Sistem SHALL lalu menampilkan modal "Verifikasi tutup shift berhasil" yang berisi nama Kepala Toko yang memverifikasi serta tombol "Selesai". Setelah modal tersebut ditutup, layar login SHALL tetap tampil.

#### Scenario: Shift 1 ditutup
- **WHEN** Ayu Setiani mengisi uang 2490000 lalu otorisasi Shift 1 berhasil
- **THEN** toast "Shift 1 berhasil ditutup" tampil, modal "Verifikasi tutup shift berhasil" tampil di atas layar login, dan setelah "Selesai" ditekan layar login tampil

#### Scenario: Login lagi setelah tutup shift
- **WHEN** setelah tutup shift Kasir login kembali dengan `ayu.kasir` / `demo123`
- **THEN** layar "Mulai Shift" tampil seperti awal sesi

## REMOVED Requirements

### Requirement: Berita acara wajib dilengkapi Kepala Toko
**Reason**: Form berita acara tidak lagi diisi dalam alur tutup shift Kasir. Kepala Toko mengisinya belakangan saat memeriksa data tutup shift.
**Migration**: Lihat requirement "Menandai tutup shift Sudah Diperiksa" dan "Detail pemeriksaan tutup shift" di capability `shift-closing-review`.

### Requirement: Selisih kas dihitung langsung
**Reason**: Kasir tidak lagi melihat seharusnya di laci maupun selisih.
**Migration**: Selisih dihitung dan ditampilkan ke Kepala Toko di capability `shift-closing-review` (requirement "Detail pemeriksaan tutup shift").

### Requirement: Catatan kasir ditandai wajib saat ada selisih
**Reason**: Catatan kasir menjadi opsional sepenuhnya, dan Kasir tidak lagi melihat selisih, sehingga penanda "(wajib)" dibuang.
**Migration**: Tidak ada. Catatan tetap dapat diisi secara opsional di modal tutup shift.
