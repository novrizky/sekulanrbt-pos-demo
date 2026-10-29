## MODIFIED Requirements

### Requirement: Menu yang dapat diakses Kepala Toko
Pengguna dengan role Kepala Toko SHALL melihat menu Laporan, Persediaan, Pesanan, dan Admin, dan SHALL NOT melihat menu Kasir. Di Persediaan, semua submenu tampil: Stok barang dagangan, Stok bahan baku, Mutasi stok, Stok opname, Permintaan barang, dan Master menu. Di Admin, hanya submenu "Outlet" dan "Shift" yang tampil. Setelah login, view Laporan SHALL terbuka.

#### Scenario: Kepala Toko login
- **WHEN** Budi Santoso login sebagai Kepala Toko
- **THEN** sidebar menampilkan "Laporan", "Persediaan", "Pesanan", dan "Admin", tidak menampilkan "Kasir", dan view Laporan aktif

#### Scenario: Tab Admin untuk Kepala Toko
- **WHEN** Kepala Toko melihat grup Admin di sidebar
- **THEN** hanya submenu "Outlet" dan "Shift" yang tampil, sedangkan "Pengguna", "Hak akses", dan "Notifikasi owner" tidak tampil

#### Scenario: Submenu Persediaan untuk Kepala Toko
- **WHEN** Kepala Toko melihat grup Persediaan di sidebar
- **THEN** keenam submenu Persediaan tampil, termasuk "Stok opname" dan "Master menu"

### Requirement: Penjelasan hak akses
Panel "Hak akses" di Admin SHALL menjelaskan akses ketiga role sesuai perilaku sistem: Kasir, Kepala Toko, dan Administrator.

#### Scenario: Membuka panel Hak akses
- **WHEN** Administrator membuka submenu "Hak akses"
- **THEN** panel menjelaskan bahwa:
  - Kasir hanya mengakses Kasir untuk transaksi penjualan, termasuk memproses order Open outletnya.
  - Kepala Toko mengakses Laporan, Persediaan (Master menu hanya dapat dilihat, kecuali mengubah status aktif menu), Pesanan (hanya outletnya), dan Admin terbatas (Outlet dan Shift), serta mengotorisasi tutup shift, memeriksa berita acara tutup shift outletnya, mengotorisasi pembatalan item order, dan melakukan stock opname outletnya.
  - Administrator mengakses Laporan, Persediaan, Pesanan, dan seluruh Admin untuk semua outlet, dan melihat riwayat stock opname semua outlet.

  Panel tidak lagi menyebut Kasir mengakses Persediaan, maupun Kepala Toko atau Administrator mengakses menu Kasir.
