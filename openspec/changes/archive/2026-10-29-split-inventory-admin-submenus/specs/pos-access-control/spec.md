## MODIFIED Requirements

### Requirement: Menu yang dapat diakses Kepala Toko
Pengguna dengan role Kepala Toko SHALL melihat menu Laporan, Persediaan, Pesanan, dan Admin, dan SHALL NOT melihat menu Kasir. Di Persediaan, semua submenu tampil: Stok barang dagangan, Stok bahan baku, Mutasi stok, Permintaan barang, dan Master menu. Di Admin, hanya submenu "Outlet" dan "Shift" yang tampil. Setelah login, view Laporan SHALL terbuka.

#### Scenario: Kepala Toko login
- **WHEN** Budi Santoso login sebagai Kepala Toko
- **THEN** sidebar menampilkan "Laporan", "Persediaan", "Pesanan", dan "Admin", tidak menampilkan "Kasir", dan view Laporan aktif

#### Scenario: Tab Admin untuk Kepala Toko
- **WHEN** Kepala Toko melihat grup Admin di sidebar
- **THEN** hanya submenu "Outlet" dan "Shift" yang tampil, sedangkan "Pengguna", "Hak akses", dan "Notifikasi owner" tidak tampil

#### Scenario: Submenu Persediaan untuk Kepala Toko
- **WHEN** Kepala Toko melihat grup Persediaan di sidebar
- **THEN** kelima submenu Persediaan tampil, termasuk "Master menu"

### Requirement: Menu yang dapat diakses Administrator
Pengguna dengan role Administrator SHALL melihat menu Laporan, Persediaan, Pesanan, dan Admin beserta semua submenu Persediaan dan Admin, dan SHALL NOT melihat menu Kasir. Setelah login, view Laporan SHALL terbuka.

#### Scenario: Administrator login
- **WHEN** `admin.rbt` login sebagai Administrator
- **THEN** sidebar menampilkan "Laporan", "Persediaan", "Pesanan", dan "Admin", tidak menampilkan "Kasir", dan view Laporan aktif

#### Scenario: Administrator login setelah Kepala Toko logout
- **WHEN** Kepala Toko logout, lalu `admin.rbt` login
- **THEN** kelima submenu Admin tampil kembali, termasuk "Pengguna", "Hak akses", dan "Notifikasi owner"

### Requirement: Penjelasan hak akses
Panel "Hak akses" di Admin SHALL menjelaskan akses ketiga role sesuai perilaku sistem: Kasir, Kepala Toko, dan Administrator.

#### Scenario: Membuka panel Hak akses
- **WHEN** Administrator membuka submenu "Hak akses"
- **THEN** panel menjelaskan bahwa:
  - Kasir hanya mengakses Kasir untuk transaksi penjualan, termasuk memproses order Open outletnya.
  - Kepala Toko mengakses Laporan, Persediaan (Master menu hanya dapat dilihat), Pesanan (hanya outletnya), dan Admin terbatas (Outlet dan Shift), serta mengotorisasi tutup shift, memeriksa berita acara tutup shift outletnya, dan mengotorisasi pembatalan item order.
  - Administrator mengakses Laporan, Persediaan, Pesanan, dan seluruh Admin untuk semua outlet.

  Panel tidak lagi menyebut Kasir mengakses Persediaan, maupun Kepala Toko atau Administrator mengakses menu Kasir.

## ADDED Requirements

### Requirement: Master menu hanya lihat untuk Kepala Toko
Kepala Toko SHALL dapat membuka submenu "Master menu" dan melihat detail setiap menu, tetapi MUST NOT dapat menambah atau menyimpan perubahan menu. Administrator SHALL tetap dapat menambah dan mengubah menu.

#### Scenario: Kepala Toko membuka Master menu
- **WHEN** Budi Santoso membuka submenu "Master menu"
- **THEN** tabel master menu tampil tanpa tombol "+ Tambah menu"

#### Scenario: Kepala Toko membuka detail menu
- **WHEN** Kepala Toko menekan "Detail" pada sebuah menu
- **THEN** modal "Detail item menu" tampil dengan field yang tidak dapat diubah dan hanya tombol "Tutup"

#### Scenario: Administrator tetap mengelola menu
- **WHEN** Administrator membuka submenu "Master menu"
- **THEN** tombol "+ Tambah menu" tampil dan detail menu dapat diubah serta disimpan seperti sebelumnya
