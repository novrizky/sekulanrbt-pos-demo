# Proposal

## Why

Prototipe POS baru mengenal dua role login (Kasir dan Administrator), padahal data dan narasinya sudah memuat peran "Leader" yang bertanggung jawab memeriksa dan menutup shift. Akibatnya, tutup shift saat ini dilakukan dan dikonfirmasi oleh Kasir yang sedang login ("Saya sebagai leader…" dicentang oleh Ayu). Tidak ada pemisahan tanggung jawab antara kasir dan pimpinan shift.

## What Changes

- Menambahkan role login ketiga, **Kepala Toko**, di layar login (Kasir / Kepala Toko / Administrator). Kepala Toko adalah peran yang sebelumnya disebut "Leader". Setiap shift punya satu Kepala Toko.
- Login memverifikasi akun terhadap Master login: username harus terdaftar, berstatus Aktif, dan kata sandinya `demo123`. Pengguna masuk dengan role, outlet, dan shift dari akun tersebut. **BREAKING** (perilaku prototipe): sebelumnya input apa pun yang tidak kosong diterima.
- Akun demo Kepala Toko: `budi.leader` (Shift 1), `rina.leader` (Shift 2), dan `taufik.leader` (Shift 3), semuanya berkata sandi `demo123`. Taufik Hadi juga ditambahkan ke data staf.
- Hak akses menu per role:
  - **Kasir:** Kasir dan Persediaan. Menu Laporan kini disembunyikan.
  - **Kepala Toko:** Kasir, Persediaan, Laporan, dan Admin terbatas (tab Shift & pengguna serta Outlet).
  - **Administrator:** semua menu.
- Tutup shift diberi langkah **otorisasi Kepala Toko**. Jika yang login bukan Kepala Toko shift yang sedang ditutup, pengguna harus memasukkan username dan kata sandi Kepala Toko shift tersebut. Kredensial dari Kepala Toko shift lain, akun non-Kepala Toko, akun Nonaktif, atau kata sandi yang salah ditolak. Jika Kepala Toko shift itu sendiri yang login, langkah ini dilewati.
- Berita acara tutup shift dan ringkasan paket data mencantumkan nama Kepala Toko yang memeriksa.
- Istilah "Leader" di seluruh UI POS diganti "Kepala Toko": dropdown peran/jabatan, kartu shift, status BA, dan teks modal tutup shift. Field outlet tetap berlabel "Penanggung jawab".
- Panel "Hak akses" di Admin diperbarui agar menjelaskan ketiga role sesuai perilaku baru.

**Di luar cakupan:**
- Aplikasi Pusat Data Outlet (`outlet-data.html`).
- Login untuk role Owner.
- Penyimpanan kata sandi per akun, karena semua akun demo memakai `demo123`.
- Persistensi sesi, backend, dan autentikasi nyata.
- Format nama paket ZIP.
- Pembatasan tombol "+ Tambah menu" di view Kasir.

## Capabilities

### New Capabilities
- `pos-access-control`: login POS berbasis akun dan role (Kasir, Kepala Toko, Administrator), identitas sesi (nama, outlet, shift), serta menu dan tab Admin yang boleh diakses tiap role.
- `shift-closing`: alur tutup shift di POS, yaitu otorisasi Kepala Toko per shift, berita acara, dan pembuatan paket data untuk pusat.

### Modified Capabilities
<!-- Belum ada spec di openspec/specs/. -->

## Impact

- **Aplikasi:** hanya POS outlet (`index.html`).
- **`app.js`:**
  - Data `loginAccounts` dan `staffUsers`.
  - Data shift di `renderAdmin`, data BA, serta dropdown di `staffForm` dan `loginForm`.
  - `loginAs`, handler `#loginForm`, handler role switch, dan handler `#logoutButton`.
  - Handler `#closeShift` terakhir beserta delegasi klik `submitBA`/`uploadFTP` di section kedua.
  - `switchAdminTab`.
- **`index.html`:** tombol role ketiga di `.role-switch`, teks panel shift ("Leader wajib…"), dan teks panel "Hak akses".
- **`styles.css`:** `.role-switch` menjadi 3 kolom, dan mungkin gaya kecil untuk langkah otorisasi.
- **Dependensi:** tidak ada.
