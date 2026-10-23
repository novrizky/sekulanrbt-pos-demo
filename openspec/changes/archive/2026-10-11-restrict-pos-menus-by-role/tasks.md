# Tasks

## 1. POS — app.js (akses role)

- [x] 1.1 Ubah `ROLE_ACCESS`: Kasir `views:['pos']`; Kepala Toko dan Administrator `views:['inventory','reports','admin']` dengan `home:'reports'`. Verifikasi: login `budi.leader` lalu `admin.rbt`, sidebar hanya menampilkan Persediaan/Laporan/Admin dan view Laporan aktif.
- [x] 1.2 Di `loginAs()` tambahkan `document.body.classList.toggle('role-kasir',account.role==='Kasir')`, dan di handler terakhir `#logoutButton` hapus class `role-kasir`. Verifikasi: inspeksi `<body>` di DevTools setelah login Kasir (ada class) dan setelah logout lalu login Kepala Toko (tidak ada class).
- [x] 1.3 Sederhanakan handler terakhir `$('#closeShift').onclick` menjadi `()=>{closingApprover=null;closeShiftAuth()}`. Pastikan dengan grep bahwa tidak ada penugasan `#closeShift` lain. Verifikasi: sebagai Kasir Shift 1, "Tutup shift" selalu menampilkan modal otorisasi "Shift 1 · Kepala Toko: Budi Santoso".

## 2. POS — styles.css (sidebar Kasir)

- [x] 2.1 Tambahkan `body.role-kasir .sidebar{display:none}` dan `body.role-kasir .app-shell{grid-template-columns:1fr}` di posisi yang menang atas media query 1050px dan 760px. Verifikasi: login Kasir lalu mulai shift, view Kasir memenuhi lebar layar tanpa kolom kosong di lebar desktop, ≤1050px, dan ≤760px.
- [x] 2.2 Ubah `.sidebar nav{grid-template-columns:repeat(4,1fr)}` di media query 760px menjadi `repeat(3,1fr)`. Verifikasi: di lebar ≤760px sebagai Administrator, bar bawah berisi 3 menu tanpa slot kosong.

## 3. POS — index.html (teks Hak akses)

- [x] 3.1 Tulis ulang teks panel `#adminAccess` sesuai skenario spec "Membuka panel Hak akses". Verifikasi: sebagai Administrator buka Admin › Hak akses. Teks tidak lagi menyebut Kasir mengakses Persediaan, maupun Kepala Toko/Administrator mengakses menu Kasir.

## 4. Verifikasi alur menyeluruh di browser

- [x] 4.1 Buka `index.html` dan jalankan alur ini: login Kasir `ayu.kasir` → Mulai shift → verifikasi Kepala Toko → transaksi → Tutup shift (otorisasi `budi.leader`/`demo123`) → berita acara → paket data. Lalu reload, login `budi.leader` (cek menu, tab Admin terbatas, view Laporan), logout, dan login `admin.rbt` (cek keenam tab Admin). Verifikasi: semua langkah berjalan tanpa error di console dan toast sesuai spec.
