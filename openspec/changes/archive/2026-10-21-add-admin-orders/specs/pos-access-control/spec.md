# Spec Delta

## MODIFIED Requirements

### Requirement: Menu yang dapat diakses Kepala Toko
Pengguna dengan role Kepala Toko SHALL melihat menu Persediaan, Pesanan, Laporan, dan Admin, dan SHALL NOT melihat menu Kasir. Di dalam Admin, hanya tab "Shift & pengguna" dan "Outlet" yang tampil. Setelah login, view Laporan SHALL terbuka.

#### Scenario: Kepala Toko login
- **WHEN** Budi Santoso login sebagai Kepala Toko
- **THEN** sidebar menampilkan "Persediaan", "Pesanan", "Laporan", dan "Admin", tidak menampilkan "Kasir", dan view Laporan aktif

#### Scenario: Tab Admin untuk Kepala Toko
- **WHEN** Kepala Toko membuka menu Admin
- **THEN** hanya tab "Shift & pengguna" dan "Outlet" yang tampil, sedangkan tab "Master menu", "Master login", "Hak akses", dan "Notifikasi owner" tidak tampil

### Requirement: Menu yang dapat diakses Administrator
Pengguna dengan role Administrator SHALL melihat menu Persediaan, Pesanan, Laporan, dan Admin beserta semua tab Admin, dan SHALL NOT melihat menu Kasir. Setelah login, view Laporan SHALL terbuka.

#### Scenario: Administrator login
- **WHEN** `admin.rbt` login sebagai Administrator
- **THEN** sidebar menampilkan "Persediaan", "Pesanan", "Laporan", dan "Admin", tidak menampilkan "Kasir", dan view Laporan aktif

#### Scenario: Administrator login setelah Kepala Toko logout
- **WHEN** Kepala Toko logout, lalu `admin.rbt` login dan membuka menu Admin
- **THEN** keenam tab Admin tampil kembali

### Requirement: Penjelasan hak akses
Panel "Hak akses" di Admin SHALL menjelaskan akses ketiga role sesuai perilaku sistem: Kasir, Kepala Toko, dan Administrator.

#### Scenario: Membuka panel Hak akses
- **WHEN** Administrator membuka tab "Hak akses"
- **THEN** panel menjelaskan bahwa Kasir hanya mengakses Kasir untuk transaksi penjualan, termasuk memproses order Open outletnya; Kepala Toko mengakses Persediaan, Pesanan (hanya outletnya), Laporan, dan Admin terbatas (shift & pengguna, outlet), serta mengotorisasi tutup shift dan pembatalan item order; Administrator mengakses Persediaan, Pesanan, Laporan, dan seluruh Admin untuk semua outlet. Panel tidak lagi menyebut Kasir mengakses Persediaan, maupun Kepala Toko atau Administrator mengakses menu Kasir
