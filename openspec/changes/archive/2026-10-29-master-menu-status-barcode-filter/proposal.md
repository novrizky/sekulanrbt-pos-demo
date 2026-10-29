## Why

Halaman Master menu di POS belum bisa dipakai untuk mengelola menu. Status selalu "Aktif" tanpa data, kode menu dihitung dari urutan sehingga bisa bergeser, menekan "Simpan" di detail malah membuat menu duplikat, dan tabel tidak bisa difilter maupun dicari. Untuk demo ke stakeholder, outlet perlu bisa menonaktifkan menu yang sedang tidak dijual, mencatat barcode, dan menemukan menu dengan cepat.

## What Changes

**Status aktif menu**
- From: kolom STATUS selalu teks "Aktif"; tidak ada cara menonaktifkan menu.
- To: setiap menu menyimpan status aktif. Popup Detail punya toggle "Menu aktif". Menu nonaktif disembunyikan dari grid Kasir, form Pesanan ("Buat order"), dan daftar merek di modal fee rokok.
- Impact: non-breaking. Kasir hanya melihat menu aktif.

**Hak Kepala Toko di Master menu**
- From: Kepala Toko hanya bisa melihat detail (semua field terkunci, tombol "Tutup").
- To: role yang punya akses submenu Master menu (lihat `ROLE_ACCESS`) bisa mengubah status aktif. Field lain tetap terkunci bagi Kepala Toko, dengan tombol "Simpan status".

**Edit menu**
- From: "Detail → Simpan" menambah menu baru (duplikat).
- To: Simpan mengubah menu yang dibuka. Mengganti kategori memindahkan menu ke kategori baru.

**Tambahan baru**
- Field opsional "Kode barcode" di form Tambah/Detail menu (termasuk dari tombol "＋ Tambah menu" di Kasir), dan kolom BARCODE di tabel.
- Kode menu disimpan di data (format tetap `MNU-PA01`), tidak lagi dihitung ulang setiap render.
- Toolbar tabel Master menu: filter Kategori, filter Status (Semua/Aktif/Nonaktif), dan pencarian berdasarkan kode menu, nama menu, atau barcode.

**Di luar cakupan**
- Tidak ada backend, persistensi, atau localStorage. Reload mengembalikan data awal.
- Tidak ada pencarian/scan barcode di Kasir maupun integrasi pemindai.
- Tidak ada status aktif per outlet; status berlaku global.
- Tidak ada perubahan di Pusat Data Outlet (`outlet-data.html`) maupun format paket ZIP shift.

## Capabilities

### New Capabilities
- `master-menu-management`: data menu (kode tetap, barcode, status aktif), popup Detail untuk edit dan toggle status, filter dan pencarian tabel Master menu, serta penyembunyian menu nonaktif dari Kasir dan form Pesanan.

### Modified Capabilities
- `pos-access-control`: Kepala Toko kini boleh mengubah status aktif menu (sebelumnya hanya lihat); teks panel "Hak akses" ikut disesuaikan.
- `rokok-multibrand`: modal fee driver rokok hanya menampilkan merek rokok yang aktif.

## Impact

- Aplikasi: hanya POS (`index.html`).
- `app.js`: `menuData` + inisialisasi kolom baru, `renderMenu`, `renderOrderForm`, `rokokPickerHtml`, `menuForm`, `renderMasterMenus`, `SUB_CARDS.menus`, handler filter/pencarian baru.
- `index.html`: toolbar filter & pencarian di panel Master menu; teks panel "Hak akses".
- `styles.css`: sedikit penyesuaian toolbar bila perlu (memakai ulang `.order-toolbar`, `.order-chips`, `.filter-label`).
