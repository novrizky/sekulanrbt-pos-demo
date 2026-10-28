## 1. POS: index.html

- [x] 1.1 Tambah `<button class="btn ghost" id="kasirLogout">Logout</button>` di `.top-actions` header view Kasir (`section#pos`), sebelum `#closeShift`
- [x] 1.2 Verifikasi manual: buka `index.html`, login `ayu.kasir` / `demo123`, mulai shift, lalu pastikan header menampilkan "Logout", "Tutup shift", "+ Pesanan baru" tanpa layout rusak di desktop maupun lebar ponsel

## 2. POS: app.js, status shift terbuka

- [x] 2.1 Grep `endSession(`, `openShiftScreen(`, `#verifyStart`, dan `#closeShift` untuk memastikan definisi/handler terakhir sebelum mengubah
- [x] 2.2 Tambah `openShift=null` ke deklarasi global sesi (app.js:167)
- [x] 2.3 Di handler `#verifyStart` dalam `openVerifyModal()`, isi `openShift={username:session.username,n,cash,note}` setelah `openingCash`/`openingNote` diisi
- [x] 2.4 Di `closeShiftBA()`, set `openShift=null` tepat sebelum `endSession(\`Shift ${n} berhasil ditutup\`)`
- [x] 2.5 Di `loginAs()`, ganti reset shift dan `openShiftScreen` dengan cabang: bila Kasir dan `openShift?.username===account.username`, pulihkan `openingCash`/`openingNote` dari `openShift`, tampilkan `#shiftBadge` "Shift n berjalan • Modal awal Rp...", dan toast "Melanjutkan Shift n" (menggantikan "Masuk sebagai Kasir"). Selain itu, perilaku lama tetap berlaku
- [x] 2.6 Verifikasi manual: mulai Shift 1 dengan modal 450000, buka "Tutup shift" untuk melihat uang seharusnya, batal, lalu catat angka tersebut (akan dibandingkan di 3.4)

## 3. POS: app.js, logout Kasir

- [x] 3.1 Pasang `$('#kasirLogout').onclick` di dekat handler `#logoutButton`: `openModal()` dengan judul "Logout", teks "Yakin logout tanpa tutup shift?", tambahan "Keranjang yang belum dibayar akan dikosongkan." bila `cart.length`, tombol "Batal" (`data-close`) dan "Logout" (`#confirmLogout`, `btn primary`)
- [x] 3.2 `#confirmLogout`: `closeModal()`, kosongkan `activeOrder`/`cart`/`fee`, `renderCart()`, lalu `endSession('Anda telah keluar dari sistem')`. `openShift` tidak disentuh
- [x] 3.3 Pastikan `#shiftLogout` (layar Mulai Shift) dan `#logoutButton` (sidebar) tetap logout langsung tanpa konfirmasi
- [x] 3.4 Verifikasi manual di browser:
  - "Logout" lalu "Batal": view Kasir tetap aktif dengan badge shift.
  - Isi keranjang, "Logout": modal menampilkan teks keranjang. Konfirmasi: layar login dan toast "Anda telah keluar dari sistem".
  - Login `ayu.kasir`: tanpa "Mulai Shift", toast "Melanjutkan Shift 1", badge "Shift 1 berjalan • Modal awal Rp450.000", keranjang kosong, pelanggan "Umum".
  - "Tutup shift": uang seharusnya sama dengan 2.6. Selesaikan tutup shift, lalu login `ayu.kasir` lagi: layar "Mulai Shift" tampil.
  - Login `budi.leader` dan `admin.rbt`: perilaku tidak berubah. "Keluar" di layar Mulai Shift tanpa konfirmasi.
