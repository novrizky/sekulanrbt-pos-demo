## Purpose

Mengatur navigasi sidebar POS outlet untuk Kepala Toko dan Administrator: grup Persediaan dan Admin yang selalu terbuka beserta submenunya, isi panel dan kartu ringkasan per submenu, tampilan di layar sempit, paging contoh pada tabel dan daftar, serta filter status dan jenis item di halaman stok.

## ADDED Requirements

### Requirement: Struktur dan urutan sidebar
Sidebar POS untuk Kepala Toko dan Administrator SHALL menampilkan menu dengan urutan Laporan, Persediaan, Pesanan, Admin. Persediaan dan Admin SHALL tampil sebagai grup berlabel yang selalu terbuka, tanpa tombol buka-tutup. Label grup MUST NOT dapat diklik. Submenu Persediaan SHALL berurutan Stok barang dagangan, Stok bahan baku, Mutasi stok, Permintaan barang, Master menu. Submenu Admin SHALL berurutan Outlet, Pengguna, Shift, Hak akses, Notifikasi owner.

#### Scenario: Administrator melihat sidebar
- **WHEN** `admin.rbt` login sebagai Administrator
- **THEN** sidebar menampilkan dari atas "Laporan", grup "Persediaan" dengan "Stok barang dagangan", "Stok bahan baku", "Mutasi stok", "Permintaan barang", "Master menu", lalu "Pesanan", lalu grup "Admin" dengan "Outlet", "Pengguna", "Shift", "Hak akses", "Notifikasi owner"

#### Scenario: Laporan tetap halaman awal
- **WHEN** Kepala Toko atau Administrator login
- **THEN** menu "Laporan" di posisi paling atas dalam keadaan aktif dan view Laporan tampil

#### Scenario: Label grup tidak membuka halaman
- **WHEN** Administrator menekan label grup "Persediaan"
- **THEN** halaman yang sedang tampil tidak berubah

### Requirement: Submenu menampilkan hanya panelnya sendiri
Menekan sebuah submenu SHALL menampilkan halaman induknya dengan judul sesuai label submenu dan hanya panel milik submenu itu. Submenu yang diklik SHALL ditandai aktif, dan menu lain MUST NOT ikut aktif. Tab "LPP bahan baku / LPP barang dagangan" dan tab Admin MUST NOT tampil lagi di halaman.

#### Scenario: Isi tiap submenu
- **WHEN** Administrator membuka setiap submenu satu per satu
- **THEN** isi halamannya adalah:
  - Stok barang dagangan: tabel stok barang dagangan dengan "+ Hasil produksi", dan panel "Riwayat produksi".
  - Stok bahan baku: tabel stok bahan baku dengan "+ Stok masuk".
  - Mutasi stok: panel "Riwayat mutasi stok" dengan "⇄ Transfer antar toko".
  - Permintaan barang: daftar permintaan dengan "+ Buat permintaan".
  - Master menu: tabel master menu.
  - Outlet: panel "Informasi outlet".
  - Pengguna: daftar pengguna dengan "+ Tambah pengguna", dan tabel Master login dengan "+ Tambah login".
  - Shift: panel "Pengaturan 3 shift" dan panel "Berita acara tutup shift".
  - Hak akses dan Notifikasi owner: panel penjelasan masing-masing.

#### Scenario: Membuka Stok bahan baku
- **WHEN** Administrator menekan submenu "Stok bahan baku"
- **THEN** judul halaman "Stok bahan baku", tabel stok bahan baku dan tombol "+ Stok masuk" tampil, sedangkan "Riwayat produksi", "Riwayat mutasi stok", dan "Permintaan barang" tidak tampil

#### Scenario: Berpindah ke Stok barang dagangan
- **WHEN** Administrator menekan submenu "Stok barang dagangan" dari halaman Stok bahan baku
- **THEN** tabel berisi stok barang dagangan, tombol berlabel "+ Hasil produksi", dan panel "Riwayat produksi" tampil

#### Scenario: Transfer dari Mutasi stok
- **WHEN** Administrator membuka submenu "Mutasi stok" lalu menekan "⇄ Transfer antar toko"
- **THEN** modal transfer antar toko terbuka seperti sebelumnya

#### Scenario: Pengguna menggabungkan Master login
- **WHEN** Administrator membuka submenu "Pengguna"
- **THEN** daftar pengguna dan tabel Master login tampil di halaman yang sama, dan tidak ada submenu "Master login" terpisah

#### Scenario: Penanda aktif
- **WHEN** Administrator menekan submenu "Shift"
- **THEN** hanya "Shift" yang ditandai aktif di sidebar

### Requirement: Kartu ringkasan per submenu
Setiap submenu Persediaan dan Admin SHALL menampilkan kartu ringkasannya sendiri di atas panel, dihitung dari data saat itu, dan SHALL diperbarui setelah aksi yang mengubah datanya. Kartu "Stok menipis" SHALL menghitung item `stok <= minimum` di buku stok halaman itu saja. "Nilai persediaan" SHALL menjumlahkan stok x biaya per unit bahan baku dalam Rupiah. "PO belum diterima" SHALL menghitung permintaan berstatus Disetujui dan PO dicetak.

#### Scenario: Daftar kartu per submenu
- **WHEN** Administrator membuka setiap submenu satu per satu
- **THEN** kartunya adalah:
  - Stok barang dagangan: Stok menipis, Jumlah item, Produksi hari ini, Item tersambung.
  - Stok bahan baku: Stok menipis, Jumlah item, Nilai persediaan, Stok masuk hari ini.
  - Mutasi stok: Transfer hari ini, Produksi hari ini, Total mutasi.
  - Permintaan barang: Menunggu persetujuan, PO belum diterima, Selesai.
  - Master menu: Jumlah menu, Kategori.
  - Outlet: Outlet terdaftar, Outlet aktif.
  - Pengguna: Jumlah akun, Aktif / nonaktif, Per peran.
  - Shift: Shift aktif, BA belum diperiksa, BA sudah diperiksa.

#### Scenario: Kartu Permintaan barang
- **WHEN** Administrator membuka submenu "Permintaan barang" dengan data contoh
- **THEN** kartu menampilkan Menunggu persetujuan 1, PO belum diterima 2, dan Selesai 1

#### Scenario: Kartu Outlet
- **WHEN** Administrator membuka submenu "Outlet"
- **THEN** kartu menampilkan Outlet terdaftar 8 dan Outlet aktif 7

#### Scenario: Kartu Master menu
- **WHEN** Administrator membuka submenu "Master menu"
- **THEN** tampil dua kartu, Jumlah menu dan Kategori dengan nilai 7 (termasuk Rokok), tanpa kartu "Menu dengan resep"

#### Scenario: Item tersambung menipis dihitung di kedua halaman stok
- **WHEN** Rokok Brand D (stok 6, minimum 10) berstatus Menipis
- **THEN** Rokok Brand D ikut terhitung di kartu "Stok menipis" halaman Stok bahan baku maupun Stok barang dagangan

#### Scenario: Kartu ikut berubah setelah aksi
- **WHEN** Administrator menyimpan "+ Stok masuk" di Stok bahan baku
- **THEN** kartu "Stok masuk hari ini" bertambah 1 dan "Nilai persediaan" berubah sesuai penerimaan

#### Scenario: Kartu Shift
- **WHEN** Kepala Toko membuka submenu "Shift" sebelum ada tutup shift baru
- **THEN** kartu menampilkan Shift aktif 3, BA belum diperiksa 1, dan BA sudah diperiksa 2

### Requirement: Sidebar di layar sempit
Pada lebar layar <=1050px, label grup MUST NOT tampil dan setiap menu serta submenu SHALL tampil sebagai ikon. Pada lebar <=760px, sidebar SHALL menjadi bar bawah satu baris yang dapat digulir horizontal dan memuat semua menu dan submenu yang diizinkan.

#### Scenario: Semua submenu terjangkau di layar ponsel
- **WHEN** Administrator membuka POS pada lebar 390px
- **THEN** bar bawah dapat digulir ke samping sampai "Notifikasi owner", dan menekan "Mutasi stok" membuka halaman Mutasi stok

### Requirement: Paging contoh pada tabel dan daftar
Tabel dan daftar data di POS outlet SHALL menampilkan maksimal 10 baris dan paging contoh di bawahnya: teks "Halaman 1 dari <N>" (N = jumlah baris dibagi 10, dibulatkan ke atas, minimal 1), tombol "‹ Sebelumnya" nonaktif, nomor halaman, dan "Berikutnya ›". Menekan tombol halaman lain MUST NOT mengganti isi tabel dan SHALL menampilkan toast "Data contoh: hanya halaman 1 yang ditampilkan". Ini berlaku untuk tabel stok, Riwayat produksi, Riwayat mutasi stok, Permintaan barang, Master menu, daftar pengguna, Master login, Berita acara tutup shift, daftar order Pesanan, detail register sales, dan histori pembatalan. Keranjang Kasir, tabel pilihan bahan di form permintaan, dan kartu shift MUST NOT diberi paging.

#### Scenario: Master menu lebih dari 10 baris
- **WHEN** Administrator membuka submenu "Master menu" yang berisi 42 menu
- **THEN** tabel menampilkan 10 baris dan di bawahnya tertulis "Halaman 1 dari 5"

#### Scenario: Tombol halaman hanya contoh
- **WHEN** pengguna menekan "Berikutnya ›" pada tabel Master menu
- **THEN** toast "Data contoh: hanya halaman 1 yang ditampilkan" tampil dan tabel tetap berisi 10 baris yang sama

#### Scenario: Data kurang dari 10 baris
- **WHEN** Administrator membuka submenu "Permintaan barang" berisi lima permintaan
- **THEN** kelima permintaan tampil dengan paging "Halaman 1 dari 1" dan tombol "Berikutnya ›" nonaktif

#### Scenario: Form permintaan tanpa paging
- **WHEN** pengguna membuka "+ Buat permintaan"
- **THEN** semua bahan baku tampil di tabel pilihan tanpa paging

### Requirement: Filter status dan jenis item di halaman stok
Submenu "Stok bahan baku" dan "Stok barang dagangan" SHALL memiliki filter Status (Semua, Aman, Menipis) dan filter "Jenis item". Di Stok bahan baku, pilihan Jenis item SHALL berupa Semua, Bahan produksi, dan Siap jual. Di Stok barang dagangan, pilihannya SHALL berupa Semua, Hasil produksi, dan Siap jual. "Siap jual" SHALL berisi item bersama (Rokok Brand A–E dan Air mineral). Kedua filter SHALL dapat digabung, paging SHALL mengikuti jumlah baris hasil filter, dan kartu ringkasan MUST NOT berubah karena filter. Filter SHALL kembali ke Semua setiap kali submenu stok dibuka. Badge "Tersambung" di tabel tidak berubah.

#### Scenario: Filter Menipis
- **WHEN** Administrator membuka Stok bahan baku lalu memilih Status "Menipis"
- **THEN** hanya item dengan stok <= minimum yang tampil, dan kartu "Stok menipis" tidak berubah

#### Scenario: Filter Siap jual
- **WHEN** Administrator memilih Jenis item "Siap jual" di Stok bahan baku
- **THEN** hanya Rokok Brand A–E dan Air mineral yang tampil, dengan paging "Halaman 1 dari 1"

#### Scenario: Filter Hasil produksi
- **WHEN** Administrator memilih Jenis item "Hasil produksi" di Stok barang dagangan
- **THEN** item bersama tidak tampil dan hanya barang dagangan hasil produksi yang tampil

#### Scenario: Filter digabung tanpa hasil
- **WHEN** kombinasi filter tidak cocok dengan item mana pun
- **THEN** tabel menampilkan "Tidak ada item sesuai filter"

#### Scenario: Filter di-reset saat pindah halaman
- **WHEN** pengguna memilih Status "Menipis" di Stok bahan baku, lalu membuka Stok barang dagangan
- **THEN** filter Status dan Jenis item di Stok barang dagangan berada di Semua
