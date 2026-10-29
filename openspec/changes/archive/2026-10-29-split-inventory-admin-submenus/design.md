## Context

POS outlet (`index.html` + `app.js` + `styles.css`) adalah prototipe statis. Navigasi sekarang:

- Sidebar `.sidebar nav` berisi 5 tombol `.nav-item[data-view]`. Handler di `app.js:27` menandai tombol aktif dan menampilkan `section.view` dengan id yang sama. `loginAs()` (`app.js:208`) menyembunyikan tombol lewat `.role-hidden` sesuai `ROLE_ACCESS` (`app.js:173`), lalu mengaktifkan `access.home` (Laporan).
- `section#inventory`: `.summary-grid` statis (Stok menipis, Bahan baku, Transfer hari ini), `.stock-ledger-tabs` yang mengubah `activeLedger` ('raw'/'finished', handler `app.js:126`), `.inventory-grid` berisi panel stok (`#rawTable`, tombol `#stockIn`) dan panel mutasi (`#tatList`), `#productionPanel` (disembunyikan saat 'raw'), `#requestPanel`, dan `#requestFormPanel` (dibuka `showRequestForm()`).
- `section#admin`: `#adminTabs` + 6 `.admin-content` yang diganti `switchAdminTab(name)` (`app.js:169`). Tab `users` berisi summary-grid statis, `#shiftCards`, `#userList` (staffUsers), dan `#baTable`.
- `renderInventory` dideklarasikan dua kali; definisi aktif adalah yang kedua (`app.js:76`), salinan di `app.js:25` mati.
- Detail BA (`section#closingReview`) kembali lewat `backToClosings()` yang memanggil `showView('admin')` + `switchAdminTab('users')`.

Keputusan perilaku (struktur sidebar, kartu, akses) sudah dicatat di `brainstorm.md` dan `proposal.md`. Dokumen ini memuat cara membangunnya.

## Goals / Non-Goals

**Goals:**
- Sidebar dengan urutan Laporan, Persediaan (5 submenu), Pesanan, Admin (5 submenu), grup selalu terbuka.
- Setiap submenu menampilkan hanya panelnya sendiri, dengan kartu ringkasan sendiri.
- Akses per peran ditentukan dari satu tempat (`ROLE_ACCESS`).
- Memakai ulang render dan handler yang ada (`activeLedger`, `renderInventory`, `switchAdminTab`, `renderMaterialRequests`, `renderClosings`, `renderMasterMenus`, `renderMasterLogins`).

**Non-Goals:**
- Mengubah data stok, produksi, permintaan barang, tutup shift, atau Pesanan.
- Routing URL/hash, menyimpan submenu terakhir, atau grup sidebar yang bisa dibuka-tutup.
- Menyentuh Pusat Data Outlet.

## Decisions

### D1: Section induk tetap, submenu memilih panel
- **Choice**: `#inventory` dan `#admin` tetap satu `section.view`. Item submenu sidebar adalah `.nav-item` dengan `data-view` (section induk) dan `data-sub`. Satu fungsi baru `openSub(view, sub)` menampilkan section induk, menandai tombol aktif, lalu memanggil `setInventorySub(sub)` atau `switchAdminTab(sub)`.
- **Rationale**: ID dan render yang ada tidak perlu dipecah; risiko regresi di `app.js` yang berlapis paling kecil.
- **Alternatives considered**: satu `section.view` per submenu (≈10 section baru). Ditolak karena perubahan HTML besar dan `#rawTable` dipakai bersama oleh dua buku stok.

### D2: Markup sidebar
- **Choice**: urutan tombol menjadi Kasir (tetap, tersembunyi untuk semua kecuali Kasir), Laporan, label grup Persediaan, 5 submenu, Pesanan, label grup Admin, 5 submenu. Label grup adalah elemen non-klik `.nav-group` (bukan tombol). Submenu memakai `.nav-item.sub` dengan ikon kecil dan indentasi.

  | `data-view` | `data-sub` | Label |
  |---|---|---|
  | inventory | finished | Stok barang dagangan |
  | inventory | raw | Stok bahan baku |
  | inventory | moves | Mutasi stok |
  | inventory | requests | Permintaan barang |
  | inventory | menus | Master menu |
  | admin | outlets | Outlet |
  | admin | users | Pengguna |
  | admin | shifts | Shift |
  | admin | access | Hak akses |
  | admin | notifications | Notifikasi owner |

- **Rationale**: grup selalu terbuka tidak butuh state buka-tutup; label non-klik menghindari pertanyaan "submenu mana yang dibuka saat induk diklik".
- **Alternatives considered**: tombol induk yang membuka submenu pertama. Ditolak karena menambah perilaku yang tidak diminta.

### D3: Handler navigasi tunggal
- **Choice**: handler di `app.js:27` diganti: tombol dengan `data-sub` memanggil `openSub(view, sub)`, tombol tanpa `data-sub` tetap berperilaku seperti sekarang. Penandaan aktif memakai tombol yang diklik, bukan `data-view`, karena beberapa tombol berbagi `data-view`. `loginAs()` tetap mengaktifkan `access.home`.
- **Rationale**: satu titik navigasi; tidak ada handler lain di file yang menimpa `.nav-item` (diperiksa saat implementasi).

### D4: Panel Persediaan per submenu
- **Choice**: setiap panel di `#inventory` diberi atribut `data-subs` berisi daftar submenu tempat ia tampil. `setInventorySub(sub)` menyimpan `activeInvSub`, mengisi `activeLedger` bila sub adalah 'raw'/'finished', menyembunyikan panel yang tidak cocok, lalu memanggil `renderInventory()` dan `renderSubSummary()`.

  | Panel | `data-subs` |
  |---|---|
  | panel stok (`#rawTable`, `#stockIn`) | `raw finished` |
  | `#productionPanel` | `finished` |
  | panel mutasi (`#tatList`) + tombol `#transferStock` dipindah ke panel ini | `moves` |
  | `#requestPanel` | `requests` |
  | panel Master menu (dipindah dari `#adminMenus`) | `menus` |

  `.stock-ledger-tabs` dan handler `app.js:126` dihapus. Pembungkus `.inventory-grid` dihapus sehingga panel tampil selebar halaman. `#productionPanel` tidak lagi ditoggle di `renderInventory`; visibilitasnya dikendalikan `data-subs`. Judul `h1` topbar mengikuti label submenu (mis. "Stok bahan baku"); `showRequestForm(false)` mengembalikan judul ke label submenu, bukan "Persediaan".
- **Rationale**: tabel stok bersama tetap dipakai ulang; visibilitas jadi deklaratif di HTML.
- **Salinan mati**: `renderInventory` pertama (`app.js:25`) dihapus sekalian karena fungsinya disentuh.

### D5: Panel Admin per submenu
- **Choice**: `switchAdminTab()` tetap dipakai dengan peta baru: `outlets → #adminOutlets`, `users → #adminUsers`, `shifts → #adminShifts`, `access → #adminAccess`, `notifications → #adminNotifications`. `#adminUsers` berisi panel daftar pengguna (`#userList`, tombol `#addUser`) dan panel Master login (`#masterLoginTable`, tombol `#addLogin`). `#adminShifts` (baru) berisi `#shiftCards` + `#editShifts` dan panel BA (`#baTable`). `#adminMenus` dan `#adminLogins` dihapus. `#adminTabs` dihapus beserta handler `app.js:170` dan baris `#adminTabs` di `loginAs()`. Penanganan `#addUser` di `switchAdminTab` dihapus karena tombol sudah berada di panel Pengguna.
- **Choice**: `switchAdminTab(name)` juga menyimpan `activeAdminSub`, mengisi judul `#admin .topbar h1` dari `ADMIN_TITLES` (`outlets:'Outlet'`, `users:'Pengguna'`, `shifts:'Shift'`, `access:'Hak akses'`, `notifications:'Notifikasi owner'`; fallback "Administrasi"), lalu memanggil `renderSubSummary('admin')`. Judul ini memenuhi spec "judul sesuai label submenu" dan setara dengan `INV_TITLES` di Persediaan (D4).
- **Choice**: `backToClosings()` memanggil `openSub('admin','shifts')`. `loginAs()` tidak lagi memanggil `switchAdminTab('users')`.

### D6: `ROLE_ACCESS` dengan daftar submenu
- **Choice**: setiap peran mendapat `subs` (`'all'` atau array):
  - Kasir: `views:['pos'], subs:[]`.
  - Kepala Toko: `views:['inventory','orders','reports','admin'], subs:['finished','raw','moves','requests','menus','outlets','shifts']`.
  - Administrator: `views:[...]` sama, `subs:'all'`.
  Field `admin` dihapus. `loginAs()` menyembunyikan `.nav-item` bila `view` tidak diizinkan atau `sub` tidak ada di `subs`, dan menyembunyikan `.nav-group` yang semua submenunya tersembunyi.
- **Rationale**: satu sumber kebenaran untuk akses menu dan submenu.

### D7: Master menu hanya lihat untuk Kepala Toko
- **Choice**: `const menuReadOnly=()=>session?.role==='Kepala Toko'`. `renderMasterMenus()` menyembunyikan `#adminAddMenu` bila hanya lihat. `menuForm()` dalam mode hanya lihat menonaktifkan field dan mengganti tombol simpan dengan "Tutup". Tombol "+ Tambah menu" di view Kasir (`#addMenu`) tidak tersentuh.
- **Alternatives considered**: menyembunyikan tombol "Detail". Ditolak karena Kepala Toko perlu melihat detail menu.

### D8: Kartu ringkasan per submenu
- **Choice**: `#inventory` dan `#admin` masing-masing punya satu `.summary-grid` kosong (`#invSummary`, `#adminSummary`). `renderSubSummary(scope)` dengan `scope` `'inv'` atau `'admin'` membaca submenu aktif scope itu (`activeInvSub` atau `activeAdminSub`) dan mengisi `#invSummary` atau `#adminSummary` saja. Fungsi ini sengaja tidak mengisi keduanya sekaligus, karena `renderInventory()` dijalankan saat startup sebelum `const outlets` dan `materialRequests` terinisialisasi (TDZ). Kartu diisi dari peta `SUB_CARDS` (sub → fungsi yang mengembalikan array `[ikon, warna, label, nilai, trend, trendClass]`), memakai markup `article` + `.metric-icon` yang sudah ada. Kelas `.summary-grid.cols-2` / `.cols-4` mengatur jumlah kolom.

  | Sub | Kartu (sumber data) |
  |---|---|
  | finished | Stok menipis (`finishedStock` qty<=min) · Jumlah item (`finishedStock.length`) · Produksi hari ini (`productionLog` bertanggal "20 Sep 2026") · Item tersambung (`finishedStock` dengan `shared`) |
  | raw | Stok menipis (`rawStock`) · Jumlah item (`rawStock.length`) · Nilai persediaan (Σ qty x cost, `rupiah`) · Stok masuk hari ini (`stockInToday`) |
  | moves | Transfer hari ini (`stockMoves` berawalan TAT) · Produksi hari ini (berawalan PRD) · Total mutasi (`stockMoves.length`) |
  | requests | Menunggu persetujuan · PO belum diterima (Disetujui + PO dicetak) · Selesai (`materialRequests`) |
  | menus | Jumlah menu · Kategori (`menuData`) |
  | outlets | Outlet terdaftar · Outlet aktif (`outlets`) |
  | users | Jumlah akun · Aktif / nonaktif · Per peran (`loginAccounts`) |
  | shifts | Shift aktif (3) · BA belum diperiksa · BA sudah diperiksa (`shiftClosings`) |

  Kartu dirender ulang saat submenu dibuka dan di akhir render yang mengubah datanya: `renderInventory`, `renderMaterialRequests`, dan `renderMasterMenus` memanggil `renderSubSummary('inv')`; `switchAdminTab`, `renderClosings`, `renderMasterLogins`, dan `renderOutlets` memanggil `renderSubSummary('admin')`. Submenu tanpa kartu (Hak akses, Notifikasi owner) menyembunyikan `#adminSummary`. Elemen lama `#lowStockCount`, `#rawItemCount`, dan `#baPending` dihapus beserta penulisannya.
- **Data baru**: tidak ada log stok masuk, jadi ditambah global `let stockInToday=2` (data contoh), naik 1 setiap simpan "+ Stok masuk" dan setiap penerimaan barang dari PO.
- **Stok menipis per buku stok**: menggantikan hitungan `Set` gabungan; item tersambung yang menipis terhitung di kedua halaman stok.

### D9: Sidebar di layar sempit
- **Choice**: di <=1050px (mode ikon) `.nav-group` disembunyikan dan submenu tampil sebagai ikon. Di <=760px (bar bawah) `nav` menjadi satu baris yang bisa digulir horizontal (`grid-auto-flow:column; overflow-x:auto`) berisi semua item yang diizinkan.
- **Rationale**: semua submenu tetap terjangkau tanpa menambah menu tambahan.

### D10: Teks Hak akses
- **Choice**: paragraf `#adminAccess` diperbarui: Kepala Toko mengakses Laporan, Persediaan (Master menu hanya lihat), Pesanan (hanya outletnya), dan Admin terbatas (Outlet dan Shift). Administrator mengakses seluruh menu dan submenu untuk semua outlet.

### D11: Paging contoh pada tabel dan daftar (tambahan)
- **Choice**: `const PAGE_SIZE=10` dan helper `setPager(el,total)` yang menaruh satu `.table-pager` tepat setelah wadah `el` (mengganti pager lama bila ada) memakai `pagerHtml(total,PAGE_SIZE)` yang sudah ada, lalu memasang toast "Data contoh: hanya halaman 1 yang ditampilkan" ke tombol yang bisa diklik. Setiap render memotong baris dengan `.slice(0,PAGE_SIZE)` setelah indeks asli dipakai untuk atribut `data-*`, lalu memanggil `setPager` dengan jumlah baris sebelum dipotong. Pager tetap tampil walau hanya 1 halaman, sama seperti detail BA.
- **Wadah yang diberi paging**: `#rawTable`, `#productionTable`, `#tatList`, `#requestTable`, `#masterMenuTable`, `#userList`, `#masterLoginTable`, `#baTable`, `#orderTable`, `#salesDetail`, `#cancelHistory`.
- **Tidak diberi paging**: `#cartList`, `#rfTable` (item di halaman lain tidak bisa dicentang), `#shiftCards`, `#outletGrid`, Pusat Data Outlet.
- **Rationale**: pager di luar `.table-scroll` agar tidak ikut tergulir horizontal; satu helper untuk semua tabel.

### D12: Filter status dan jenis item di halaman stok (tambahan)
- **Choice**: toolbar di panel stok (`data-subs="raw finished"`) berisi dua grup chip memakai `.order-toolbar`/`.order-chips` yang sudah ada: `#stockStatusFilter` (Semua, Aman, Menipis) dan `#stockTypeFilter` berlabel "Jenis item" (nilai `all`/`own`/`shared`; label `own` = "Bahan produksi" di Stok bahan baku dan "Hasil produksi" di Stok barang dagangan; `shared` = "Siap jual"). State di global `stockStatus` dan `stockType`, di-reset ke Semua setiap kali submenu stok dibuka. Filter tidak mengubah kartu ringkasan. Hasil kosong menampilkan "Tidak ada item sesuai filter".
- **Rationale**: "Siap jual" menjelaskan sifat item bersama (dibeli lalu dijual tanpa produksi) tanpa istilah teknis; badge "Tersambung" tetap untuk menandai stok yang sama di dua halaman.

## Risks / Trade-offs

- [Risk] Handler lain di section akhir `app.js` menimpa `.onclick` pada elemen yang dipindah (`#stockIn`, `#transferStock`, `#addUser`, `#adminAddMenu`) → Mitigation: ID dipertahankan saat memindahkan elemen, dan semua penugasan handler untuk ID tersebut dicari sebelum mengubah.
- [Risk] Fungsi lama yang menulis ke `#lowStockCount`/`#rawItemCount`/`#baPending` akan error bila elemennya dihapus → Mitigation: cari semua referensi dan hapus bersama elemennya.
- [Risk] Bar bawah mobile dengan ~12 item terasa padat → Mitigation: gulir horizontal; prototipe didemokan di desktop.
- [Trade-off] Lapisan "submenu aktif" (`activeInvSub`) di atas `section.view` sedikit kurang lurus dibanding satu section per submenu → diterima demi perubahan kecil dan pemakaian ulang render yang ada.
- [Trade-off] Teks spec lama di luar requirement yang diubah masih menyebut "tab LPP bahan baku/barang dagangan" → diterima; artinya sama dengan submenu Stok bahan baku/Stok barang dagangan.

## Migration Plan

N/A — prototipe statis tanpa deployment. Rollback dengan mengembalikan `index.html`, `app.js`, dan `styles.css` lewat git.

## Open Questions

Tidak ada. Tafsiran "B – sidebar yang terbuka" sebagai grup yang selalu terbuka dicatat di `brainstorm.md` Q8.
