## ADDED Requirements

### Requirement: Data menu memiliki kode tetap, barcode, dan status aktif
Setiap menu SHALL menyimpan kode menu yang tetap (format `MNU-` + 2 huruf kategori + urutan 2 digit, misalnya `MNU-PA01`), kode barcode (boleh kosong), dan status aktif. Kode MUST NOT berubah ketika menu lain ditambah atau dipindah kategori. Data awal SHALL berisi menu "Seafood 100K" dan "Jeruk hangat" dalam status Nonaktif, dan barcode terisi untuk Rokok Brand A–E, Air mineral, Keripik singkong, dan Kacang.

#### Scenario: Kode tidak bergeser setelah menu ditambah
- **WHEN** Administrator menambah menu baru di kategori Paket
- **THEN** "Paket Hemat 20K" tetap berkode `MNU-PA01` di tabel Master menu

#### Scenario: Status awal data demo
- **WHEN** Administrator membuka submenu "Master menu" setelah halaman dimuat
- **THEN** "Seafood 100K" dan "Jeruk hangat" berstatus "Nonaktif", dan semua menu lain berstatus "Aktif"

### Requirement: Tabel Master menu menampilkan barcode dan status
Tabel Master menu SHALL memiliki kolom KODE, NAMA MENU, KATEGORI, BARCODE, HARGA, STATUS, dan AKSI. Kolom BARCODE SHALL menampilkan "-" bila barcode kosong. Kolom STATUS SHALL menampilkan badge "Aktif" atau "Nonaktif". Kartu ringkasan Master menu SHALL menampilkan "Jumlah menu" (jumlah menu aktif), "Nonaktif" (jumlah menu nonaktif), dan "Kategori".

#### Scenario: Menu tanpa barcode
- **WHEN** tabel Master menu menampilkan "Paket Hemat 20K" yang tidak punya barcode
- **THEN** kolom BARCODE baris itu berisi "-"

#### Scenario: Ringkasan menghitung menu nonaktif
- **WHEN** Administrator membuka submenu "Master menu" dengan data awal
- **THEN** kartu "Nonaktif" menampilkan 2

### Requirement: Filter dan pencarian tabel Master menu
Di atas tabel Master menu SHALL tampil filter "Kategori" berupa dropdown (Semua dan setiap kategori menu), filter "Status" (Semua, Aktif, Nonaktif), dan kotak cari berplaceholder "Cari kode, nama, atau barcode...". Ketiganya SHALL bekerja bersamaan. Pencarian SHALL mencocokkan kode menu, nama menu, atau barcode tanpa membedakan huruf besar/kecil. Bila tidak ada baris yang cocok, tabel SHALL menampilkan "Tidak ada menu sesuai filter".

#### Scenario: Filter kategori dan status
- **WHEN** pengguna memilih Kategori "Premium" dan Status "Nonaktif"
- **THEN** tabel hanya menampilkan "Seafood 100K"

#### Scenario: Cari berdasarkan kode menu
- **WHEN** pengguna mengetik "mnu-pa01" di kotak cari dengan filter Semua
- **THEN** tabel hanya menampilkan "Paket Hemat 20K"

#### Scenario: Cari berdasarkan nama menu
- **WHEN** pengguna mengetik "nasi box" di kotak cari
- **THEN** tabel hanya menampilkan menu kategori Nasi Box

#### Scenario: Tidak ada hasil
- **WHEN** pengguna mengetik "zzz" di kotak cari
- **THEN** tabel menampilkan "Tidak ada menu sesuai filter"

### Requirement: Field kode barcode di form menu
Form "Tambah item menu" dan "Detail item menu" SHALL memiliki field opsional "Kode barcode". Menyimpan menu tanpa barcode SHALL tetap diterima. Form yang dibuka dari tombol "＋ Tambah menu" di Kasir SHALL memakai form yang sama.

#### Scenario: Menambah menu dengan barcode
- **WHEN** Administrator mengisi nama "Kopi susu", kategori Minuman, barcode "8990001112223", lalu menekan "Simpan item"
- **THEN** toast "Kopi susu tersimpan di master menu" tampil dan tabel Master menu menampilkan "Kopi susu" dengan barcode "8990001112223"

#### Scenario: Mencari menu lewat barcode
- **WHEN** pengguna mengetik "8990001112223" di kotak cari Master menu
- **THEN** tabel hanya menampilkan "Kopi susu"

#### Scenario: Nama menu wajib diisi
- **WHEN** Administrator menekan "Simpan item" dengan nama menu kosong
- **THEN** toast "Nama menu wajib diisi" tampil dan modal tetap terbuka

### Requirement: Edit menu lewat popup Detail
Administrator SHALL dapat mengubah semua field menu dari popup "Detail item menu". Menyimpan SHALL mengubah menu yang dibuka dan MUST NOT menambah menu baru. Bila kategori diganti, menu SHALL pindah ke kategori baru.

#### Scenario: Mengubah harga menu
- **WHEN** Administrator membuka Detail "Paket Hemat 20K", mengubah harga menjadi 21000, lalu menekan "Simpan item"
- **THEN** toast "Paket Hemat 20K diperbarui" tampil, tabel menampilkan "Rp21.000" untuk menu itu, dan jumlah menu tidak bertambah

#### Scenario: Memindah kategori
- **WHEN** Administrator membuka Detail "Gorengan", mengganti kategori ke "Ala carte", lalu menyimpan
- **THEN** "Gorengan" tampil di kategori Ala carte dan tidak lagi di kategori Jajanan, baik di tabel Master menu maupun di grid Kasir

### Requirement: Menonaktifkan dan mengaktifkan menu
Popup "Detail item menu" SHALL memiliki toggle "Menu aktif". Pengguna yang memiliki akses submenu Master menu SHALL dapat mengubah toggle ini dan menyimpannya. Form "Tambah item menu" SHALL menampilkan toggle yang sama dalam keadaan tercentang.

#### Scenario: Administrator menonaktifkan menu
- **WHEN** Administrator membuka Detail "Bakso", menghapus centang "Menu aktif", lalu menekan "Simpan item"
- **THEN** toast "Bakso diperbarui" tampil dan kolom STATUS "Bakso" menjadi "Nonaktif"

#### Scenario: Mengaktifkan kembali menu
- **WHEN** Administrator membuka Detail "Seafood 100K", mencentang "Menu aktif", lalu menyimpan
- **THEN** "Seafood 100K" berstatus "Aktif" dan muncul lagi di kategori Premium di Kasir

### Requirement: Menu nonaktif disembunyikan dari penjualan
Menu berstatus Nonaktif MUST NOT tampil di grid menu Kasir, di grid form "Buat order" Pesanan, maupun di daftar merek modal fee driver rokok. Jumlah "pilihan tersedia" di Kasir SHALL hanya menghitung menu aktif. Cart dan order yang sudah memuat menu tersebut SHALL tidak diubah.

#### Scenario: Kasir tidak melihat menu nonaktif
- **WHEN** Kasir membuka kategori Premium dengan data awal
- **THEN** grid menampilkan Premium 40K, Premium 50K, dan Prasmanan 90K, tanpa "Seafood 100K", dan teks jumlah berbunyi "3 pilihan tersedia"

#### Scenario: Pencarian Kasir tidak menemukan menu nonaktif
- **WHEN** Kasir di kategori Minuman mengetik "jeruk" di kotak cari menu
- **THEN** hanya "Es jeruk" yang tampil

#### Scenario: Form order tidak menampilkan menu nonaktif
- **WHEN** Administrator membuka form "Buat order" dan memilih tab Premium
- **THEN** "Seafood 100K" tidak tampil di grid item
