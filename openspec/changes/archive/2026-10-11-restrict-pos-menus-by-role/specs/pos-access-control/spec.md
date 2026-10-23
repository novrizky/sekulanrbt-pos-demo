# Spec Delta

## MODIFIED Requirements

### Requirement: Menu yang dapat diakses Kasir
Pengguna dengan role Kasir SHALL hanya dapat mengakses view Kasir. Sidebar SHALL disembunyikan untuk role Kasir sehingga view Kasir memakai lebar penuh layar. Setelah login, layar Mulai Shift SHALL tampil lebih dulu, dan view Kasir SHALL terbuka setelah Kasir memulai shift.

#### Scenario: Kasir login
- **WHEN** Ayu Setiani login sebagai Kasir
- **THEN** layar "Mulai Shift" tampil sebelum POS dapat dipakai

#### Scenario: Kasir memulai shift
- **WHEN** Ayu Setiani memulai shift dari layar "Mulai Shift"
- **THEN** view Kasir aktif dan sidebar tidak tampil, termasuk menu "Persediaan", "Laporan", dan "Admin"

#### Scenario: Sidebar tampil kembali untuk role lain
- **WHEN** sesi Kasir diakhiri, lalu Budi Santoso login sebagai Kepala Toko
- **THEN** sidebar tampil kembali dengan menu sesuai role Kepala Toko

### Requirement: Menu yang dapat diakses Kepala Toko
Pengguna dengan role Kepala Toko SHALL melihat menu Persediaan, Laporan, dan Admin, dan SHALL NOT melihat menu Kasir. Di dalam Admin, hanya tab "Shift & pengguna" dan "Outlet" yang tampil. Setelah login, view Laporan SHALL terbuka.

#### Scenario: Kepala Toko login
- **WHEN** Budi Santoso login sebagai Kepala Toko
- **THEN** sidebar menampilkan "Persediaan", "Laporan", dan "Admin", tidak menampilkan "Kasir", dan view Laporan aktif

#### Scenario: Tab Admin untuk Kepala Toko
- **WHEN** Kepala Toko membuka menu Admin
- **THEN** hanya tab "Shift & pengguna" dan "Outlet" yang tampil, sedangkan tab "Master menu", "Master login", "Hak akses", dan "Notifikasi owner" tidak tampil

### Requirement: Menu yang dapat diakses Administrator
Pengguna dengan role Administrator SHALL melihat menu Persediaan, Laporan, dan Admin beserta semua tab Admin, dan SHALL NOT melihat menu Kasir. Setelah login, view Laporan SHALL terbuka.

#### Scenario: Administrator login
- **WHEN** `admin.rbt` login sebagai Administrator
- **THEN** sidebar menampilkan "Persediaan", "Laporan", dan "Admin", tidak menampilkan "Kasir", dan view Laporan aktif

#### Scenario: Administrator login setelah Kepala Toko logout
- **WHEN** Kepala Toko logout, lalu `admin.rbt` login dan membuka menu Admin
- **THEN** keenam tab Admin tampil kembali

### Requirement: Penjelasan hak akses
Panel "Hak akses" di Admin SHALL menjelaskan akses ketiga role sesuai perilaku sistem: Kasir, Kepala Toko, dan Administrator.

#### Scenario: Membuka panel Hak akses
- **WHEN** Administrator membuka tab "Hak akses"
- **THEN** panel menjelaskan bahwa Kasir hanya mengakses Kasir untuk transaksi penjualan; Kepala Toko mengakses Persediaan, Laporan, dan Admin terbatas (shift & pengguna, outlet), serta mengotorisasi tutup shift; Administrator mengakses Persediaan, Laporan, dan seluruh Admin untuk semua outlet. Panel tidak lagi menyebut Kasir mengakses Persediaan, maupun Kepala Toko atau Administrator mengakses menu Kasir
