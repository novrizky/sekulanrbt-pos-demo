## MODIFIED Requirements

### Requirement: Layar Mulai Shift mengunci POS untuk Kasir
Setiap kali pengguna ber-role Kasir berhasil login, sistem SHALL menampilkan layar penuh "Mulai Shift" yang menutupi seluruh POS, termasuk sidebar, view Kasir, dan Persediaan, kecuali bila username tersebut masih memiliki shift terbuka (lihat requirement "Melanjutkan shift yang masih terbuka"). POS SHALL tidak dapat dipakai sampai Kasir menekan "Mulai shift" dan shift berhasil dimulai.

#### Scenario: Kasir login
- **WHEN** Ayu Setiani login dengan `ayu.kasir` / `demo123` dan tidak ada shift terbuka miliknya
- **THEN** layar "Mulai Shift" tampil menutupi seluruh POS, dan menu maupun tombol POS tidak dapat diklik

#### Scenario: Refresh halaman
- **WHEN** halaman di-refresh setelah shift dimulai, lalu Kasir login kembali
- **THEN** layar "Mulai Shift" tampil lagi dengan isian kosong

## ADDED Requirements

### Requirement: Melanjutkan shift yang masih terbuka
Bila Kasir login dengan username yang sama dengan pemilik shift yang masih terbuka (sudah dimulai, belum ditutup, lalu logout), sistem SHALL melewati layar "Mulai Shift" dan modal "Verifikasi Kepala Toko", langsung membuka view Kasir, menampilkan penanda "Shift <n> berjalan • Modal awal <nominal>" dengan modal awal yang sama, dan menampilkan toast "Melanjutkan Shift <n>". Rekap tutup shift SHALL memakai modal awal tersebut.

#### Scenario: Ayu login ulang
- **WHEN** Ayu Setiani memulai Shift 1 dengan modal awal 450000, logout dari view Kasir, lalu login kembali dengan `ayu.kasir` / `demo123`
- **THEN** layar "Mulai Shift" tidak tampil, view Kasir aktif, toast "Melanjutkan Shift 1" tampil, dan header view Kasir menampilkan "Shift 1 berjalan • Modal awal Rp450.000"

#### Scenario: Rekap tutup shift setelah login ulang
- **WHEN** setelah melanjutkan Shift 1, Kasir menekan "Tutup shift"
- **THEN** rekap kas menghitung uang seharusnya dari modal awal Rp450.000, sama seperti bila Kasir tidak pernah logout
