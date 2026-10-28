## Why

Kasir tidak bisa logout. Tombol logout ada di sidebar, tetapi sidebar disembunyikan untuk role Kasir, sehingga satu-satunya jalan keluar adalah "Tutup shift". Kasir yang hanya ingin keluar sebentar (istirahat, berganti perangkat) terpaksa menutup shift dan membuka shift baru, lengkap dengan verifikasi Kepala Toko. Dengan logout tanpa tutup shift, alur demo menjadi lebih realistis: shift tetap berjalan dan Kasir yang sama bisa langsung melanjutkannya.

## What Changes

**Logout dari view Kasir**
- From: view Kasir hanya punya "Tutup shift" dan "+ Pesanan baru". Kasir tidak bisa keluar tanpa menutup shift.
- To: header view Kasir punya tombol "Logout". Menekannya membuka modal konfirmasi "Yakin logout tanpa tutup shift?". Kalau dikonfirmasi, keranjang yang belum dibayar dikosongkan, sesi berakhir, layar login tampil, dan shift tetap berjalan.
- Reason: Kasir perlu keluar sementara tanpa mengakhiri shift.
- Impact: non-breaking, hanya menambah perilaku untuk role Kasir.

**Login ulang Kasir dengan shift terbuka**
- From: setiap login Kasir selalu menampilkan layar "Mulai Shift".
- To: kalau username yang login sama dengan pemilik shift yang masih terbuka, layar "Mulai Shift" dilewati, view Kasir langsung aktif dengan penanda "Shift n berjalan • Modal awal Rp..." dan toast "Melanjutkan Shift n". Modal awal shift dipulihkan sehingga rekap tutup shift tetap memakai angka yang sama.
- Reason: sesi shift masih berjalan, jadi verifikasi pembukaan tidak perlu diulang.
- Impact: non-breaking. Login setelah tutup shift atau setelah reload halaman tetap menampilkan "Mulai Shift".

## Capabilities

### New Capabilities
- `kasir-logout`: tombol Logout di view Kasir, konfirmasi logout tanpa tutup shift, pengosongan keranjang, dan shift tetap terbuka setelah logout.

### Modified Capabilities
- `shift-opening`: layar Mulai Shift tidak tampil lagi bila Kasir yang sama masih punya shift terbuka. Ditambah requirement melanjutkan shift.
- `pos-access-control`: requirement "Menu yang dapat diakses Kasir" mendapat pengecualian untuk shift yang masih terbuka.

## Impact

- Aplikasi: hanya POS (`index.html`, `app.js`). Pusat Data Outlet (`outlet-data.html`) tidak tersentuh.
- `index.html`: tombol "Logout" di `.top-actions` header view Kasir.
- `app.js`: global baru `openShift`. Mengubah `loginAs()`, handler `#verifyStart` di `openVerifyModal()`, dan alur akhir tutup shift `closeShiftBA()`. Menambah handler tombol Logout Kasir.
- Alur tutup shift: perilaku dan isi berita acara tidak berubah. Tutup shift hanya juga menghapus status shift terbuka. Format paket ZIP dan sisi hub tidak terdampak.
- Di luar cakupan: Kasir dengan username lain yang login saat shift masih terbuka (tidak ditangani, satu slot shift terbuka), persistensi lintas reload, backend, localStorage, batas waktu sesi atau logout otomatis.
