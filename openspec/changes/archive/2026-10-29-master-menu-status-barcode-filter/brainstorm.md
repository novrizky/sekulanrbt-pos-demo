# Brainstorm: Master menu (status aktif, barcode, filter, pencarian)

Sumber: sesi `/opsx:explore` lalu `/opsx:propose` pada 2026-10-29. Aplikasi yang disentuh hanya POS (`index.html`, `app.js`, `styles.css`).

## Permintaan awal pengguna

1. Menu aktif di tabel bisa dinonaktifkan lewat popup detail, yang juga dipakai untuk edit menu.
2. Form tambah/edit menu mendapat field tambahan **kode barcode**.
3. Tabel punya filter **kategori** dan **aktif/nonaktif**.
4. Pencarian menu berdasarkan **kode menu** dan **nama menu**.

## Temuan di kode (kondisi sekarang)

- `menuData` berupa map kategori → array posisional `[nama, harga, deskripsi, labelGambar]` (`app.js:2`).
- `renderMasterMenus()` (`app.js:181`) menghitung KODE dari posisi (`MNU-` + 2 huruf kategori + urutan). Kode bisa bergeser bila item ditambah atau dipindah. Kolom STATUS selalu teks tetap `'Aktif'` dan tidak punya data.
- `menuForm(edit)` (`app.js:165`): tombol Simpan **selalu** `push` item baru, jadi "Detail → Simpan" membuat duplikat. Kategori yang diganti juga tidak memindahkan item.
- `menuReadOnly()` (`app.js:164`) mengunci seluruh form untuk Kepala Toko (hanya tombol "Tutup").
- Menu dipakai untuk penjualan di tiga tempat: grid Kasir `renderMenu` (`app.js:18`), form Pesanan `renderOrderForm` (`app.js:275`), dan pemilih fee rokok `rokokPickerHtml` (`app.js:261`). `menuPrice(name)` (`app.js:211`) mencari harga berdasarkan nama.
- Tabel memakai `tableHtml` + `setPager` (pager hanya contoh, menampilkan 10 baris pertama).
- Pola filter chip + search sudah ada: toolbar "Permintaan barang" dan filter stok (`.order-toolbar.stock-filter`, `.filter-label`, `.order-chips`).
- `ROLE_ACCESS['Kepala Toko'].subs` memuat `'menus'`, jadi Kepala Toko memang punya akses ke Master menu.

## Rantai keputusan

**Q1. Apa efek menu Nonaktif di luar halaman Master menu?**
Opsi: A) hanya label; B) disembunyikan dari penjualan (grid Kasir + form Pesanan); C) B ditambah pemilih fee rokok.
→ **Pengguna memilih B + C.** Menu nonaktif tidak muncul di grid Kasir, tab/grid form Pesanan, dan daftar merek di modal fee rokok.

**Q2. Siapa yang boleh mengubah status aktif?**
→ **Pengguna:** Kepala Toko juga boleh mengubah toggle aktif *jika memiliki akses ke master menu*. Turunannya: hak toggle diturunkan dari `ROLE_ACCESS` (subs `'all'` atau memuat `'menus'`), bukan dari nama role. Field lain tetap read-only untuk Kepala Toko. Administrator mengedit semua field.

**Q3. Barcode dipakai di mana?** (rekomendasi diterima: "sisanya ikuti rekomendasi kamu")
→ Field opsional di form Tambah/Detail, termasuk form yang dibuka dari tombol "＋ Tambah menu" di Kasir karena formnya sama. Bisa dicari di pencarian Master menu. **Tidak** dipakai untuk pencarian/scan di Kasir.

**Q4. Di mana kode, barcode, dan status disimpan?** (rekomendasi diterima)
Pendekatan yang dipertimbangkan:
- (a) **Tambah posisi di akhir array menu**: `x[4]=kode`, `x[5]=barcode`, `x[6]=aktif`. Kode diisi sekali saat inisialisasi dengan format yang sama seperti sekarang. Sesuai konvensi "tambah kolom di AKHIR array", indeks lama tetap aman. ← **dipilih**
- (b) Map terpisah `menuMeta[nama]`. Tidak menyentuh array, tetapi bergantung pada nama (rename merusak tautan) dan menambah satu global lagi.
- (c) Ubah `menuData` menjadi objek. Paling rapi, tetapi menyentuh semua pembaca `x[0]`/`x[1]` di banyak fungsi. Terlalu lebar untuk demo.

**Q5. Bug edit = tambah baru?** (rekomendasi diterima)
→ Diperbaiki. Simpan pada mode Detail mengubah item yang ada. Bila kategori diganti, item dipindah dari array kategori lama ke array kategori baru.

**Q6. Bentuk filter & pencarian** (rekomendasi diterima)
→ Toolbar di atas tabel: label "Kategori" + chip (Semua + 7 kategori), label "Status" + chip (Semua/Aktif/Nonaktif), dan kotak cari. Gaya mengikuti `.order-toolbar.stock-filter`. Pencarian mencocokkan kode, nama, dan barcode (case-insensitive). Pager tetap contoh dan dihitung dari jumlah hasil filter.

**Q7. Tampilan status di tabel** (rekomendasi diterima)
→ Kolom STATUS memakai badge yang sudah ada: `ok` untuk Aktif, `low` untuk Nonaktif. Kolom BARCODE ditambahkan (berisi "-" bila kosong) supaya hasil pencarian barcode terlihat masuk akal. *(Kolom BARCODE adalah keputusan Claude.)*

## Keputusan kecil (keputusan Claude, tercatat untuk direview)

- Data demo: dua menu nonaktif sejak awal agar filter langsung terlihat berguna, yaitu **Seafood 100K** (Premium) dan **Jeruk hangat** (Minuman). Keduanya tidak dipakai di data order/spec lain. Rokok sengaja tetap aktif semua agar skenario spec rokok tidak berubah.
- Barcode contoh diisi untuk barang kemasan (Rokok Brand A–E, Air mineral, Keripik singkong, Kacang). Menu masak dibiarkan kosong.
- Toast: tambah "`<nama>` tersimpan di master menu" (tetap seperti sekarang); edit Administrator "`<nama>` diperbarui"; ubah status oleh Kepala Toko "`<nama>` dinonaktifkan" / "`<nama>` diaktifkan".
- Kartu ringkasan "Jumlah menu" menghitung menu aktif (labelnya sudah "Aktif"), ditambah kartu "Nonaktif".
- Teks panel "Hak akses" diperbarui: Kepala Toko "Master menu hanya dapat dilihat, kecuali mengubah status aktif".

## Trade-off yang diterima

- `menuData` global untuk semua outlet. Kepala Toko satu outlet yang menonaktifkan menu berpengaruh ke semua outlet. Untuk demo diterima.
- Bila semua item satu kategori nonaktif, grid Kasir menampilkan "0 pilihan tersedia". Dibiarkan.
- Fee rokok yang sudah tersimpan untuk merek yang kemudian dinonaktifkan tidak tampil lagi saat modal dibuka ulang. Edge case data, diabaikan (fokus demo).
- Order/cart yang sudah memuat menu nonaktif tidak diubah.
