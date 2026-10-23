# Design

## Context

Hak akses menu POS diatur oleh satu tabel, `ROLE_ACCESS` di `app.js`. Tabel ini berisi `views`, `admin`, dan `home` per role. `loginAs()` membaca tabel tersebut untuk memberi class `role-hidden` pada `.nav-item` dan tab Admin, lalu mengaktifkan view `home`. Tombol "Tutup shift" (`#closeShift`) berada di topbar view Kasir (`section#pos`). Handler terakhirnya ada di `app.js` baris ±119 dan berisi jalur pintas untuk Kepala Toko shift sendiri. Layout `.app-shell` adalah grid `238px 1fr`, dan di layar ≤760px sidebar menjadi bar bawah fixed dengan `.sidebar nav{grid-template-columns:repeat(4,1fr)}`.

## Goals / Non-Goals

**Goals:**
- Mengubah akses menu dan halaman awal per role cukup lewat data di `ROLE_ACCESS`, tanpa menambah mekanisme baru.
- Menyembunyikan sidebar untuk Kasir hanya dengan CSS.

**Non-Goals:**
- Logout Kasir setelah shift dimulai. Ini dikerjakan di change terpisah.
- Mencegah akses view lewat cara lain selain menu, misalnya memanggil fungsi dari console.

## Decisions

1. **`ROLE_ACCESS` diubah menjadi:**
   - Kasir `{views:['pos'],admin:[],home:'pos'}`
   - Kepala Toko `{views:['inventory','reports','admin'],admin:['users','outlets'],home:'reports'}`
   - Administrator `{views:['inventory','reports','admin'],admin:'all',home:'reports'}`

   `loginAs()` sudah mengaktifkan nav dan view berdasarkan `home`, jadi tidak perlu logika tambahan. `renderReports()` sudah dipanggil saat inisialisasi, sehingga view Laporan langsung berisi data.

2. **Sidebar Kasir disembunyikan lewat class body.** `loginAs()` menjalankan `document.body.classList.toggle('role-kasir',account.role==='Kasir')`, dan handler terakhir `#logoutButton` menghapus class itu. Di `styles.css` ditambahkan `body.role-kasir .sidebar{display:none}` dan `body.role-kasir .app-shell{grid-template-columns:1fr}`. Aturan ini harus menang atas media query 1050px dan 760px, jadi selektornya lebih spesifik atau diletakkan setelahnya.

   *Alternatif yang ditolak:*
   - Memberi `role-hidden` pada semua nav-item. Sidebar kosong tetap memakan ruang 238px.
   - Menghapus elemen sidebar dari DOM. Elemen itu diperlukan lagi saat role lain login.

3. **Jalur pintas tutup shift dihapus.** Handler terakhir `$('#closeShift').onclick` disederhanakan menjadi `()=>{closingApprover=null;closeShiftAuth()}`. Tidak ada salinan lama `#closeShift` lain di `app.js` (hanya ada satu penugasan), jadi tidak ada kode mati yang perlu dibersihkan. Validasi di `closeShiftAuth()` tetap dipakai apa adanya.

4. **Grid nav mobile** diubah dari `repeat(4,1fr)` menjadi `repeat(3,1fr)`, karena role yang melihat sidebar sekarang maksimal punya 3 menu.

5. **Teks `#adminAccess`** di `index.html` ditulis ulang sesuai skenario spec "Membuka panel Hak akses".

## Risks / Trade-offs

- [Kasir tidak bisa logout setelah shift dimulai] → Diterima untuk sementara. Reload halaman mengembalikan ke layar login, dan logout akan dipindahkan ke alur tutup shift pada change berikutnya.
- [Kepala Toko login di perangkat kasir tidak bisa menutup shift sendiri] → Sesuai keputusan. Tutup shift dilakukan dari sesi Kasir dengan kredensial Kepala Toko.
- [`role-kasir` tertinggal setelah logout lalu login role lain] → `loginAs()` memakai `toggle` dengan kondisi, bukan `add`, sehingga class selalu dihitung ulang setiap kali login.
