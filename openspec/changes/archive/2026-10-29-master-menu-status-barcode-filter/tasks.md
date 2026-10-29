## 1. POS app.js: data menu

- [x] 1.1 Tambah `MENU_BARCODES` (nama → barcode untuk Rokok Brand A–E, Air mineral, Keripik singkong, Kacang) dan loop inisialisasi tepat setelah `menuData` yang mengisi `x[4]` kode `MNU-<2 huruf><urutan 2 digit>`, `x[5]` barcode (`''` bila tidak ada), dan `x[6]` aktif (`false` untuk "Seafood 100K" dan "Jeruk hangat")
- [x] 1.2 Tambah helper `menuActive(x)` (`x[6]!==false`) dan `canToggleMenu()` (subs `ROLE_ACCESS` = `'all'` atau memuat `'menus'`)
- [x] 1.3 Verifikasi manual: buka `index.html`, login Administrator, buka Persediaan › Master menu, dan pastikan tabel masih tampil tanpa error di console

## 2. POS app.js: sembunyikan menu nonaktif dari penjualan

- [x] 2.1 `renderMenu` (baris 18, satu-satunya definisi): saring `menuActive` sebelum filter teks, supaya jumlah "pilihan tersedia" ikut menyesuaikan
- [x] 2.2 `renderOrderForm` (baris 275): saring `menuActive` pada item grid form "Buat order"
- [x] 2.3 `rokokPickerHtml` (baris 261): hanya merek rokok yang `menuActive`
- [x] 2.4 Verifikasi manual: login Kasir, Premium menampilkan "3 pilihan tersedia" tanpa Seafood 100K; cari "jeruk" di Minuman hanya menampilkan Es jeruk; login Administrator, form "Buat order" tab Premium tanpa Seafood 100K

## 3. POS app.js: popup Tambah/Detail menu

- [x] 3.1 Ubah `menuForm` agar menerima `{cat,i}` dan membaca `menuData[cat][i]`; tambah field "Kode barcode" (`#menuBarcode`) dan toggle "Menu aktif" (`#menuActive`, tercentang pada mode Tambah)
- [x] 3.2 Simpan mode Tambah: `push` 7 kolom; kode `'MNU-'` kosong diganti kode berikutnya di kategori; toast "`<nama>` tersimpan di master menu"
- [x] 3.3 Simpan mode Detail (Administrator): tulis ulang item, pindahkan antar kategori bila kategori berubah (`splice` + `push`); toast "`<nama>` diperbarui"
- [x] 3.4 Mode Detail Kepala Toko (`menuReadOnly()`): kunci semua field kecuali `#menuActive` bila `canToggleMenu()`; tombol "Batal" + "Simpan status"; simpan hanya `x[6]`; toast "`<nama>` dinonaktifkan" / "`<nama>` diaktifkan"
- [x] 3.5 Setelah simpan panggil `renderCategories(); renderMenu(); renderMasterMenus(); closeModal()`
- [x] 3.6 Verifikasi manual: Administrator ubah harga Paket Hemat 20K (tidak ada duplikat), pindahkan Gorengan ke Ala carte, tambah "Kopi susu" dengan barcode; Kepala Toko nonaktifkan Bakso lalu cek grid Kasir

## 4. POS app.js + index.html: tabel, filter, dan pencarian Master menu

- [x] 4.1 `index.html`: sisipkan toolbar `div.order-toolbar.stock-filter` (label "Kategori" + dropdown `select#menuCatFilter`, label "Status" + `#menuStatusFilter` dengan Semua/Aktif/Nonaktif, `input#masterMenuSearch` placeholder "Cari kode, nama, atau barcode...") di panel `data-subs="menus"` sebelum `#masterMenuTable`
- [x] 4.2 `app.js`: state `menuCatFilter`, `menuStatusFilter`, `menuQuery`; `renderMasterMenus` merender opsi dropdown kategori, menyaring baris (kategori, status, kode/nama/barcode case-insensitive), kolom `KODE, NAMA MENU, KATEGORI, BARCODE, HARGA, STATUS, AKSI`, badge `ok`/`low`, empty state "Tidak ada menu sesuai filter", `setPager` dari jumlah hasil filter, dan tombol Detail memanggil `menuForm({cat,i})`
- [x] 4.3 `app.js`: pasang `.onclick` chip status, `#menuCatFilter.onchange`, dan `#masterMenuSearch.oninput` sekali di blok handler global
- [x] 4.4 `SUB_CARDS.menus`: kartu "Jumlah menu" (aktif), "Nonaktif" (keterangan "Tidak tampil di Kasir"), "Kategori"
- [x] 4.5 `styles.css`: hanya bila toolbar terlalu sempit, tambah aturan kecil untuk `#masterMenuSearch`/toolbar Master menu (memakai ulang gaya `.order-toolbar`)
- [x] 4.6 Verifikasi manual: filter Premium + Nonaktif hanya Seafood 100K; cari "mnu-pa01", "nasi box", "zzz"; kartu Nonaktif = 2

## 5. POS index.html: teks Hak akses

- [x] 5.1 Ubah teks Kepala Toko di `#adminAccess` menjadi "Persediaan (Master menu hanya dapat dilihat, kecuali mengubah status aktif menu)"
- [x] 5.2 Verifikasi manual: login Administrator, buka Admin › Hak akses, dan cek teks baru
