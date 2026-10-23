# Proposal

## Why

Saat ini semua role di POS outlet bisa membuka view Kasir, dan Kasir juga bisa mengelola Persediaan. Pembagian tugas jadi kabur. Transaksi penjualan seharusnya hanya dilakukan Kasir. Pengelolaan stok, laporan, dan administrasi seharusnya menjadi tugas Kepala Toko dan Administrator.

## What Changes

Aplikasi terdampak: **POS outlet saja** (`index.html`, `app.js`, `styles.css`). Pusat Data Outlet (`outlet-data.html`) tidak disentuh.

- **BREAKING** Role Kasir hanya dapat mengakses view Kasir. Menu Persediaan dihapus dari aksesnya.
- Sidebar disembunyikan sepenuhnya untuk role Kasir, dan view Kasir memakai lebar penuh layar.
- **BREAKING** Menu Kasir dihapus dari role Kepala Toko dan Administrator. Keduanya mengakses Persediaan, Laporan, dan Admin. Kepala Toko tetap terbatas pada tab Admin "Shift & pengguna" dan "Outlet".
- Halaman awal setelah login untuk Kepala Toko dan Administrator berubah menjadi Laporan.
- Tutup shift hanya terjadi dari sesi Kasir. Langkah otorisasi kredensial Kepala Toko selalu tampil. Jalur pintas "Kepala Toko shift sendiri tidak perlu otorisasi ulang" dihapus karena Kepala Toko tidak lagi bisa membuka view Kasir, tempat tombol "Tutup shift" berada.
- Teks panel "Hak akses" di Admin disesuaikan dengan pembagian akses yang baru.

Dampak pada alur tutup shift: di sisi POS, pemeriksa berita acara selalu ditentukan lewat modal otorisasi. Format paket ZIP dan sisi hub (Pusat Data) tidak berubah.

Di luar cakupan:
- Tombol logout untuk Kasir. Karena sidebar disembunyikan, Kasir tidak punya tombol logout setelah shift dimulai. Logout akan dipindahkan ke alur tutup shift pada change terpisah. Sebelum shift dimulai, tombol logout di layar "Mulai Shift" tetap ada.
- Pembatasan akses di level data atau backend. Ini prototipe statis, jadi hanya visibilitas menu dan view yang diatur.
- Perubahan pada isi view Persediaan, Laporan, atau Admin.

## Capabilities

### New Capabilities
<!-- Tidak ada -->

### Modified Capabilities
- `pos-access-control`: menu yang dapat diakses Kasir, Kepala Toko, dan Administrator, halaman awal setelah login, sidebar disembunyikan untuk Kasir, dan teks panel Hak akses.
- `shift-closing`: otorisasi Kepala Toko selalu diminta saat tutup shift, dan requirement "Kepala Toko shift sendiri tidak perlu otorisasi ulang" dihapus.

## Impact

- `app.js`:
  - tabel `ROLE_ACCESS` (views dan home per role)
  - `loginAs()` (penanda role Kasir untuk menyembunyikan sidebar)
  - handler terakhir `$('#closeShift').onclick` (jalur pintas Kepala Toko dihapus)
  - handler `#logoutButton` (penanda role dibersihkan saat logout)
- `index.html`: teks panel `#adminAccess`.
- `styles.css`: aturan untuk menyembunyikan `.sidebar` dan membuat `.app-shell` satu kolom saat role Kasir, serta grid nav sidebar di layar mobile yang kini hanya berisi 3 menu.
