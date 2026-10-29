Aplikasi: POS outlet saja (`index.html`, `app.js`, `styles.css`). Pusat Data Outlet tidak disentuh.

## 1. index.html: sidebar

- [x] 1.1 Susun ulang `.sidebar nav`: Kasir (tetap), Laporan, `.nav-group` "Persediaan", 5 `.nav-item.sub` (`data-view="inventory"`, `data-sub` = finished/raw/moves/requests/menus), Pesanan, `.nav-group` "Admin", 5 `.nav-item.sub` (`data-view="admin"`, `data-sub` = outlets/users/shifts/access/notifications), sesuai tabel D2 di design.md

## 2. index.html: section Persediaan

- [x] 2.1 Ganti `.summary-grid` statis dengan `<div class="summary-grid" id="invSummary"></div>`; hapus `.stock-ledger-tabs`
- [x] 2.2 Hapus pembungkus `.inventory-grid`; beri `data-subs` pada panel stok (`raw finished`), `#productionPanel` (`finished`), panel mutasi (`moves`), `#requestPanel` (`requests`)
- [x] 2.3 Pindahkan `#transferStock` dari topbar ke `panel-head` panel Riwayat mutasi stok (ID tetap)
- [x] 2.4 Pindahkan panel Master menu (`#masterMenuTable`, `#adminAddMenu`) dari `#adminMenus` ke `#inventory` dengan `data-subs="menus"`; hapus `#adminMenus`

## 3. index.html: section Admin

- [x] 3.1 Ganti `.summary-grid` statis di `#adminUsers` dengan satu `<div class="summary-grid" id="adminSummary"></div>` di bawah topbar; hapus `#adminTabs` dan tombol `#addUser` dari topbar
- [x] 3.2 Ubah `#adminUsers` menjadi panel daftar pengguna (`#userList` + tombol `#addUser` di `panel-head`) dan panel Master login (`#masterLoginTable` + `#addLogin`); hapus `#adminLogins`
- [x] 3.3 Buat `#adminShifts` berisi panel "Pengaturan 3 shift" (`#shiftCards`, `#editShifts`) dan panel "Berita acara tutup shift" (`#baTable`)
- [x] 3.4 Perbarui teks `#adminAccess` sesuai D10 / skenario "Membuka panel Hak akses"
- [x] 3.5 Buka `index.html` di browser: login `admin.rbt`, pastikan sidebar tampil berurutan dan tidak ada error di console

## 4. app.js: navigasi dan akses

- [x] 4.1 Cari semua penugasan `.nav-item` `.onclick`, `#adminTabs`, `.stock-ledger-tabs`, `switchAdminTab`, `#lowStockCount`, `#rawItemCount`, `#baPending`, `#transferStock`, `#addUser`, `#adminAddMenu`, `#stockIn` sebelum mengubah
- [x] 4.2 Ubah `ROLE_ACCESS` (`app.js:173`): tambah `subs` per peran, hapus field `admin` (D6)
- [x] 4.3 Tambah `openSub(view,sub)`; ganti handler `.nav-item` di `app.js:27` agar tombol `data-sub` memanggil `openSub` dan penanda aktif memakai tombol yang diklik (D3)
- [x] 4.4 Ubah `loginAs()`: sembunyikan `.nav-item` berdasarkan `views` + `subs`, sembunyikan `.nav-group` yang semua submenunya tersembunyi, hapus baris `#adminTabs` dan `switchAdminTab('users')`
- [x] 4.5 Ubah `switchAdminTab()` ke peta baru (outlets/users/shifts/access/notifications), hapus toggle `#addUser`; hapus handler `#adminTabs` (`app.js:170`)
- [x] 4.6 Ubah `backToClosings()` menjadi `openSub('admin','shifts')`

## 5. app.js: Persediaan per submenu

- [x] 5.1 Tambah `activeInvSub` dan `setInventorySub(sub)`: set `activeLedger` untuk raw/finished, toggle panel lewat `data-subs`, set judul `h1` sesuai label submenu, lalu `renderInventory()` + `renderSubSummary()` (D4)
- [x] 5.2 Di `renderInventory` (definisi terakhir, `app.js:76`): hapus toggle `#productionPanel` dan penulisan `#lowStockCount`/`#rawItemCount`; hapus salinan mati `renderInventory` di `app.js:25`
- [x] 5.3 Hapus handler `.stock-ledger-tabs` (`app.js:126`)
- [x] 5.4 Ubah `showRequestForm(false)` agar judul kembali ke "Permintaan barang", bukan "Persediaan"
- [x] 5.5 Buka browser: sebagai Administrator klik kelima submenu Persediaan; cek panel yang tampil, tombol "+ Stok masuk" / "+ Hasil produksi", modal transfer dari Mutasi stok, dan form permintaan (Batal kembali ke daftar)

## 6. app.js: kartu ringkasan

- [x] 6.1 Tambah `let stockInToday=2`; naikkan di simpan "+ Stok masuk" (`#saveStockIn`) dan simpan penerimaan PO (`#rcSave`)
- [x] 6.2 Tambah peta `SUB_CARDS` dan `renderSubSummary()` sesuai tabel D8, memakai markup `article` + `.metric-icon` yang ada; hapus penulisan `#baPending`
- [x] 6.3 Panggil `renderSubSummary()` di akhir `renderInventory`, `renderMaterialRequests`, `renderClosings`, `renderMasterLogins`, `renderOutlets`
- [x] 6.4 Buka browser: cek nilai kartu di setiap submenu (Permintaan 1/2/1, Outlet 8/7, Master menu 2 kartu dengan Kategori 7, Shift 3/1/2, Jumlah item bahan baku 23); simpan "+ Stok masuk" dan pastikan "Stok masuk hari ini" naik

## 7. app.js: Master menu hanya lihat

- [x] 7.1 Tambah `menuReadOnly()`; `renderMasterMenus()` menyembunyikan `#adminAddMenu` bila hanya lihat
- [x] 7.2 `menuForm()` mode hanya lihat: field dinonaktifkan, tombol simpan diganti "Tutup" (D7); `#addMenu` di view Kasir tidak diubah
- [x] 7.3 Buka browser: login `budi.leader`, cek sidebar (Admin hanya Outlet dan Shift; Persediaan lengkap), Master menu tanpa "+ Tambah menu", Detail hanya lihat; login `admin.rbt`, pastikan menu bisa ditambah/diubah

## 8. styles.css

- [x] 8.1 Gaya `.nav-group` (label grup kecil, non-klik) dan `.nav-item.sub` (indentasi, ukuran sedikit lebih kecil) di sidebar desktop
- [x] 8.2 Di <=1050px sembunyikan `.nav-group`, submenu tampil sebagai ikon; di <=760px `nav` satu baris gulir horizontal (`grid-auto-flow:column; overflow-x:auto`) untuk semua item
- [x] 8.3 Tambah `.summary-grid.cols-2` dan `.cols-4`; pastikan panel Persediaan tampil selebar halaman tanpa `.inventory-grid`
- [x] 8.4 Buka browser pada lebar 1440px, 1000px, dan 390px: semua submenu terlihat dan dapat diklik

## 9. Verifikasi akhir

- [x] 9.1 Alur Kepala Toko: login `budi.leader` → Laporan aktif → Admin › Shift → Periksa BA-0919-S3 → Kembali mendarat di Shift dengan "Shift" aktif → tandai sudah diperiksa, kartu BA berubah
- [x] 9.2 Alur Kasir tidak berubah: login `ayu.kasir`, mulai shift, sidebar tetap tersembunyi, bayar dan tutup shift berjalan
- [x] 9.3 Item tersambung: stok masuk Rokok Brand D di Stok bahan baku, cek angka sama dan badge "Tersambung" di Stok barang dagangan

## 10. Paging contoh (tambahan)

- [x] 10.1 app.js: tambah `PAGE_SIZE=10` dan `setPager(el,total)` (D11)
- [x] 10.2 app.js: potong baris menjadi 10 dan pasang pager di render `#rawTable`, `#productionTable`, `#tatList`, `#requestTable`, `#masterMenuTable`, `#userList`, `#masterLoginTable`, `#baTable`, `#orderTable`, `#salesDetail`, `#cancelHistory`
- [x] 10.3 Buka browser: Master menu "Halaman 1 dari 5" dengan 10 baris, "Berikutnya ›" memunculkan toast; form permintaan tanpa paging

## 11. Filter stok (tambahan)

- [x] 11.1 index.html: toolbar filter Status dan Jenis item di panel stok
- [x] 11.2 app.js: state `stockStatus`/`stockType`, label Jenis item per halaman, filter di `renderInventory`, reset saat submenu stok dibuka, pesan "Tidak ada item sesuai filter" (D12)
- [x] 11.3 Buka browser: filter Menipis, Siap jual, Hasil produksi, gabungan kosong, dan reset saat pindah halaman
