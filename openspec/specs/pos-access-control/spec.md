# pos-access-control Specification

## Purpose

Mengatur siapa yang dapat masuk ke POS outlet, dengan identitas apa (nama, role, outlet, shift), dan menu atau tab Admin mana saja yang dapat diakses oleh setiap role.

## Requirements

### Requirement: Pilihan role di layar login
Layar login SHALL menampilkan tiga pilihan role demo: Kasir, Kepala Toko, dan Administrator. Memilih role SHALL mengisi otomatis username akun demo role tersebut dan kata sandi `demo123`.

#### Scenario: Memilih role Kepala Toko
- **WHEN** pengguna memilih "Kepala Toko" di layar login
- **THEN** field nama pengguna berisi `budi.leader` dan field kata sandi berisi `demo123`

#### Scenario: Memilih role Kasir dan Administrator
- **WHEN** pengguna memilih "Kasir" lalu "Administrator"
- **THEN** field nama pengguna berisi `ayu.kasir`, lalu berganti menjadi `admin.rbt`

### Requirement: Login diverifikasi terhadap Master login
Sistem SHALL menerima login hanya jika username terdaftar di Master login, akunnya berstatus Aktif, dan kata sandinya `demo123`. Sesi SHALL memakai nama, role, outlet, dan shift dari akun tersebut, bukan dari tombol role yang dipilih.

#### Scenario: Login Kepala Toko Shift 2
- **WHEN** pengguna memasukkan `rina.leader` / `demo123` lalu menekan "Masuk"
- **THEN** profil di sidebar menampilkan "Rina Pratiwi" dan "Kepala Toko • Shift 2", dan toast "Masuk sebagai Kepala Toko" tampil

#### Scenario: Username tidak terdaftar atau kata sandi salah
- **WHEN** pengguna memasukkan username yang tidak ada di Master login, atau kata sandi selain `demo123`
- **THEN** login ditolak, layar login tetap tampil, dan toast "Nama pengguna atau kata sandi salah" tampil

#### Scenario: Akun nonaktif
- **WHEN** pengguna memasukkan `sari.kasir` / `demo123`
- **THEN** login ditolak dengan toast "Akun tidak aktif. Hubungi Administrator"

#### Scenario: Role tanpa akses POS
- **WHEN** pengguna login dengan akun aktif ber-role Owner yang dibuat lewat Master login
- **THEN** login ditolak dengan toast "Peran ini belum dapat masuk ke POS"

#### Scenario: Field kosong
- **WHEN** nama pengguna atau kata sandi kosong lalu pengguna menekan "Masuk"
- **THEN** toast "Nama pengguna dan kata sandi wajib diisi" tampil dan login tidak diproses

### Requirement: Akun demo Kepala Toko per shift
Master login SHALL memuat satu akun Kepala Toko berstatus Aktif untuk setiap shift outlet Sekulan RBT 519A: `budi.leader` (Budi Santoso, Shift 1), `rina.leader` (Rina Pratiwi, Shift 2), dan `taufik.leader` (Taufik Hadi, Shift 3). Data staf SHALL memuat ketiganya dengan jabatan Kepala Toko.

#### Scenario: Tabel Master login
- **WHEN** Administrator membuka tab "Master login"
- **THEN** tabel menampilkan ketiga akun tersebut dengan peran "Kepala Toko", shift masing-masing, dan status "Aktif"

#### Scenario: Daftar pengguna
- **WHEN** Administrator membuka tab "Shift & pengguna"
- **THEN** daftar "Pengguna & akses outlet" memuat Budi Santoso, Rina Pratiwi, dan Taufik Hadi dengan jabatan Kepala Toko

### Requirement: Menu yang dapat diakses Kasir
Pengguna dengan role Kasir SHALL hanya dapat mengakses view Kasir. Sidebar SHALL disembunyikan untuk role Kasir sehingga view Kasir memakai lebar penuh layar. Setelah login, layar Mulai Shift SHALL tampil lebih dulu, dan view Kasir SHALL terbuka setelah Kasir memulai shift. Bila Kasir masih memiliki shift terbuka, view Kasir SHALL langsung terbuka tanpa layar Mulai Shift.

#### Scenario: Kasir login
- **WHEN** Ayu Setiani login sebagai Kasir tanpa shift terbuka
- **THEN** layar "Mulai Shift" tampil sebelum POS dapat dipakai

#### Scenario: Kasir memulai shift
- **WHEN** Ayu Setiani memulai shift dari layar "Mulai Shift"
- **THEN** view Kasir aktif dan sidebar tidak tampil, termasuk menu "Persediaan", "Laporan", dan "Admin"

#### Scenario: Kasir melanjutkan shift
- **WHEN** Ayu Setiani logout tanpa tutup shift lalu login kembali sebagai Kasir
- **THEN** view Kasir langsung aktif dan sidebar tidak tampil

#### Scenario: Sidebar tampil kembali untuk role lain
- **WHEN** sesi Kasir diakhiri, lalu Budi Santoso login sebagai Kepala Toko
- **THEN** sidebar tampil kembali dengan menu sesuai role Kepala Toko

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

### Requirement: Menu yang dapat diakses Administrator
Pengguna dengan role Administrator SHALL melihat menu Laporan, Persediaan, Pesanan, dan Admin beserta semua submenu Persediaan dan Admin, dan SHALL NOT melihat menu Kasir. Setelah login, view Laporan SHALL terbuka.

#### Scenario: Administrator login
- **WHEN** `admin.rbt` login sebagai Administrator
- **THEN** sidebar menampilkan "Laporan", "Persediaan", "Pesanan", dan "Admin", tidak menampilkan "Kasir", dan view Laporan aktif

#### Scenario: Administrator login setelah Kepala Toko logout
- **WHEN** Kepala Toko logout, lalu `admin.rbt` login
- **THEN** kelima submenu Admin tampil kembali, termasuk "Pengguna", "Hak akses", dan "Notifikasi owner"

### Requirement: Istilah Kepala Toko di UI POS
UI POS SHALL memakai istilah "Kepala Toko" untuk peran yang sebelumnya disebut "Leader". Ini berlaku di pilihan peran dan jabatan, kartu shift, status berita acara, dan teks tutup shift. Label penanggung jawab outlet SHALL tetap "Penanggung jawab".

#### Scenario: Kartu shift
- **WHEN** pengguna membuka tab "Shift & pengguna"
- **THEN** kartu Shift 1 menampilkan "Kepala Toko: Budi S." dan tidak ada teks "Leader" di halaman

#### Scenario: Form pengguna dan login
- **WHEN** Administrator membuka form "Tambah pengguna" atau "Tambah login"
- **THEN** dropdown jabatan atau peran berisi pilihan "Kepala Toko" dan tidak berisi "Leader"

### Requirement: Penjelasan hak akses
Panel "Hak akses" di Admin SHALL menjelaskan akses ketiga role sesuai perilaku sistem: Kasir, Kepala Toko, dan Administrator.

#### Scenario: Membuka panel Hak akses
- **WHEN** Administrator membuka submenu "Hak akses"
- **THEN** panel menjelaskan bahwa:
  - Kasir hanya mengakses Kasir untuk transaksi penjualan, termasuk memproses order Open outletnya.
  - Kepala Toko mengakses Laporan, Persediaan (Master menu hanya dapat dilihat, kecuali mengubah status aktif menu), Pesanan (hanya outletnya), dan Admin terbatas (Outlet dan Shift), serta mengotorisasi tutup shift, memeriksa berita acara tutup shift outletnya, mengotorisasi pembatalan item order, dan melakukan stock opname outletnya.
  - Administrator mengakses Laporan, Persediaan, Pesanan, dan seluruh Admin untuk semua outlet, dan melihat riwayat stock opname semua outlet.

  Panel tidak lagi menyebut Kasir mengakses Persediaan, maupun Kepala Toko atau Administrator mengakses menu Kasir.

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
