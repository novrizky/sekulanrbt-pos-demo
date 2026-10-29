## RENAMED Requirements

- FROM: `### Requirement: Master menu hanya lihat untuk Kepala Toko`
- TO: `### Requirement: Master menu untuk Kepala Toko: lihat dan ubah status aktif`

## MODIFIED Requirements

### Requirement: Master menu untuk Kepala Toko: lihat dan ubah status aktif
Kepala Toko SHALL dapat membuka submenu "Master menu" dan melihat detail setiap menu. Kepala Toko MUST NOT dapat menambah menu atau mengubah field menu selain status aktif. Karena role Kepala Toko memiliki akses submenu Master menu di pengaturan akses role, Kepala Toko SHALL dapat mengubah toggle "Menu aktif" di popup Detail dan menyimpannya dengan tombol "Simpan status". Administrator SHALL tetap dapat menambah dan mengubah semua field menu.

#### Scenario: Kepala Toko membuka Master menu
- **WHEN** Budi Santoso membuka submenu "Master menu"
- **THEN** tabel master menu tampil tanpa tombol "+ Tambah menu", lengkap dengan filter Kategori, filter Status, dan kotak cari

#### Scenario: Kepala Toko membuka detail menu
- **WHEN** Kepala Toko menekan "Detail" pada sebuah menu
- **THEN** modal "Detail item menu" tampil dengan semua field terkunci kecuali toggle "Menu aktif", serta tombol "Batal" dan "Simpan status"

#### Scenario: Kepala Toko menonaktifkan menu
- **WHEN** Kepala Toko membuka Detail "Bakso", menghapus centang "Menu aktif", lalu menekan "Simpan status"
- **THEN** toast "Bakso dinonaktifkan" tampil, kolom STATUS "Bakso" menjadi "Nonaktif", dan "Bakso" tidak tampil lagi di grid Kasir

#### Scenario: Kepala Toko mengaktifkan menu
- **WHEN** Kepala Toko membuka Detail "Jeruk hangat", mencentang "Menu aktif", lalu menekan "Simpan status"
- **THEN** toast "Jeruk hangat diaktifkan" tampil dan kolom STATUS menjadi "Aktif"

#### Scenario: Administrator tetap mengelola menu
- **WHEN** Administrator membuka submenu "Master menu"
- **THEN** tombol "+ Tambah menu" tampil dan semua field detail menu dapat diubah serta disimpan

### Requirement: Penjelasan hak akses
Panel "Hak akses" di Admin SHALL menjelaskan akses ketiga role sesuai perilaku sistem: Kasir, Kepala Toko, dan Administrator.

#### Scenario: Membuka panel Hak akses
- **WHEN** Administrator membuka submenu "Hak akses"
- **THEN** panel menjelaskan bahwa:
  - Kasir hanya mengakses Kasir untuk transaksi penjualan, termasuk memproses order Open outletnya.
  - Kepala Toko mengakses Laporan, Persediaan (Master menu hanya dapat dilihat, kecuali mengubah status aktif menu), Pesanan (hanya outletnya), dan Admin terbatas (Outlet dan Shift), serta mengotorisasi tutup shift, memeriksa berita acara tutup shift outletnya, dan mengotorisasi pembatalan item order.
  - Administrator mengakses Laporan, Persediaan, Pesanan, dan seluruh Admin untuk semua outlet.

  Panel tidak lagi menyebut Kasir mengakses Persediaan, maupun Kepala Toko atau Administrator mengakses menu Kasir.
