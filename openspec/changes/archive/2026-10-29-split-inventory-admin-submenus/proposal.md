## Why

Halaman Persediaan dan Admin di POS outlet sekarang menumpuk banyak modul dalam satu layar: stok bahan baku dan barang dagangan berbagi satu tabel bertab, Riwayat mutasi dan Permintaan barang selalu tampil di bawahnya, dan Admin punya enam tab. Kepala Toko dan Administrator jadi sulit menemukan modul yang dicari, dan akses per peran tidak terlihat dari navigasi. Memecah setiap modul menjadi submenu di sidebar membuat tiap halaman fokus pada satu pekerjaan dan membuat batas akses per peran jelas saat demo.

## What Changes

Aplikasi terdampak: **POS outlet saja** (`index.html`, `app.js`, `styles.css`). Pusat Data Outlet (`outlet-data.*`) tidak berubah.

**Struktur sidebar**
- From: lima menu datar Kasir, Persediaan, Pesanan, Laporan, Admin; Persediaan dan Admin masing-masing satu halaman dengan tab di dalamnya.
- To: urutan Laporan, Persediaan, Pesanan, Admin. Persediaan dan Admin menjadi grup yang selalu terbuka dengan submenu:
  - Persediaan: Stok barang dagangan, Stok bahan baku, Mutasi stok, Permintaan barang, Master menu.
  - Admin: Outlet, Pengguna, Shift, Hak akses, Notifikasi owner.
- Reason: tiap modul punya pintu masuk sendiri dari navigasi.
- Impact: non-breaking untuk Kasir (sidebar tetap tersembunyi); halaman awal Kepala Toko dan Administrator tetap Laporan.

**Isi halaman Persediaan**
- From: tab "LPP bahan baku / LPP barang dagangan", panel Riwayat mutasi dan Permintaan barang selalu tampil, Riwayat produksi muncul di tab dagangan, tombol "Transfer antar toko" di topbar.
- To: tab LPP dihapus dari halaman. Stok barang dagangan memuat tabel stok dagangan, "+ Hasil produksi", dan Riwayat produksi. Stok bahan baku memuat tabel stok bahan baku dan "+ Stok masuk". Mutasi stok memuat Riwayat mutasi stok dan "⇄ Transfer antar toko". Permintaan barang memuat daftar dan form permintaan. Master menu pindah dari Admin ke sini.

**Isi halaman Admin**
- From: tab Shift & pengguna (kartu shift, daftar pengguna, BA tutup shift), Outlet, Master menu, Master login, Hak akses, Notifikasi owner.
- To: Pengguna menggabungkan daftar pengguna dan tabel Master login. Shift memuat kartu 3 shift dan BA tutup shift. Outlet, Hak akses, dan Notifikasi owner tetap. Tab Admin di halaman dihapus.

**Kartu ringkasan per halaman**
- From: tiga kartu tetap di Persediaan dan tiga di Admin.
- To: setiap submenu punya kartu ringkasannya sendiri (mis. Nilai persediaan di Stok bahan baku, Menunggu persetujuan di Permintaan barang, BA belum diperiksa di Shift). Kartu "Stok menipis" dihitung per buku stok, sehingga item tersambung yang menipis terhitung di kedua halaman stok.

**Akses Kepala Toko**
- From: Admin terbatas pada tab Shift & pengguna dan Outlet; Master menu tidak terlihat.
- To: melihat semua submenu Persediaan, dengan Master menu hanya lihat (tanpa tambah/simpan); di Admin hanya melihat Outlet dan Shift. Pengguna, Hak akses, dan Notifikasi owner tidak tampil.
- Impact: Kepala Toko tidak lagi melihat daftar pengguna yang sebelumnya ada di tab Shift & pengguna.

**Paging contoh pada tabel dan daftar** (tambahan atas permintaan user)
- From: tabel menampilkan semua baris tanpa paging (kecuali detail BA).
- To: tabel/daftar data di POS outlet menampilkan maksimal 10 baris dengan paging contoh "Halaman 1 dari N". Tombol halaman tidak berpindah, hanya toast. Keranjang Kasir, tabel pilihan bahan di form permintaan, dan kartu shift tidak diberi paging.

**Filter stok** (tambahan atas permintaan user)
- To: Stok bahan baku dan Stok barang dagangan punya filter Status (Semua, Aman, Menipis) dan "Jenis item": Stok bahan baku = Semua, Bahan produksi, Siap jual; Stok barang dagangan = Semua, Hasil produksi, Siap jual. "Siap jual" adalah item bersama (rokok, air mineral). Badge "Tersambung" di tabel tidak berubah.

**Di luar cakupan**: paging di Pusat Data Outlet; backend, persistensi, dan integrasi nyata; perubahan data stok, alur produksi, alur permintaan barang, alur tutup shift, dan format paket ZIP; menu Kasir dan Pesanan selain posisinya di sidebar; Pusat Data Outlet.

## Capabilities

### New Capabilities
- `sidebar-submenu-navigation`: struktur dan urutan sidebar dengan grup Persediaan/Admin yang selalu terbuka, perpindahan antar submenu, isi panel per submenu, kartu ringkasan per submenu, paging contoh pada tabel/daftar, dan filter status/jenis item pada halaman stok.

### Modified Capabilities
- `pos-access-control`: menu dan submenu yang tampil untuk Kepala Toko dan Administrator, Master menu hanya lihat bagi Kepala Toko, dan teks panel Hak akses.
- `raw-material-request`: Permintaan barang menjadi submenu sendiri (bukan section di bawah kedua tab LPP); kartu "Stok menipis" dihitung per buku stok.
- `stock-production`: titik masuk produksi dan Riwayat produksi berada di submenu Stok barang dagangan; Riwayat mutasi stok berada di submenu Mutasi stok.
- `shift-closing-review`: panel BA dan metrik "BA belum diperiksa" berada di Admin › Shift; tombol Kembali mendarat di sana.
- `shared-stock-item`: item bersama tampil di submenu Stok bahan baku dan Stok barang dagangan (bukan tab LPP).

## Impact

- `index.html`: sidebar (`.sidebar nav`) diberi grup dan item submenu; `section#inventory` kehilangan `.stock-ledger-tabs` dan mendapat wadah kartu ringkasan per submenu; `section#admin` kehilangan `#adminTabs`, Master menu dipindah ke Persediaan, daftar pengguna dipindah ke panel Pengguna.
- `app.js`: handler navigasi `.nav-item` (baris 27), `ROLE_ACCESS` dan `loginAs()`, `renderInventory` (definisi terakhir), `switchAdminTab()`, `backToClosings()`, `renderMasterMenus()`/`menuForm()` (mode hanya lihat), dan fungsi baru untuk kartu ringkasan per submenu.
- `styles.css`: gaya item submenu sidebar, termasuk tampilan di layar <=1050px dan <=760px.
- Tidak ada dependensi baru.
