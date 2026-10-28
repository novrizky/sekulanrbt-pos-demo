## Context

POS outlet (`index.html` + `app.js`) adalah prototipe statis tanpa persistensi. Role Kasir hanya melihat view Kasir: `body.role-kasir .sidebar{display:none}` (styles.css:15) ikut menyembunyikan `#logoutButton` di profil sidebar (index.html:31). Header view Kasir (index.html:38) hanya berisi `#closeShift` dan `#newOrder`.

Status shift berjalan saat ini tersebar di beberapa global (`openingCash`, `openingNote`) dan teks `#shiftBadge`:
- Diisi oleh handler `#verifyStart` di dalam `openVerifyModal()` (app.js:174).
- Di-reset oleh `loginAs()` (app.js:182) dan `endSession()` (app.js:187).
- Dibaca oleh `expectedCash()` (app.js:171) untuk rekap tutup shift.

`loginAs()` selalu memanggil `openShiftScreen()` untuk role Kasir. Tutup shift berakhir di `closeShiftBA()` (app.js:119) yang memanggil `endSession("Shift n berhasil ditutup")`.

## Goals / Non-Goals

**Goals:**
- Kasir bisa logout dari view Kasir lewat konfirmasi, tanpa menutup shift.
- Keranjang dan order aktif yang belum dibayar dikosongkan saat logout.
- Kasir yang sama yang login ulang langsung kembali ke shift yang berjalan, dengan modal awal yang sama.
- Tutup shift mengakhiri status shift terbuka.

**Non-Goals:**
- Menangani Kasir dengan username lain yang login saat shift masih terbuka.
- Persistensi lintas reload, localStorage, backend.
- Logout otomatis atau batas waktu sesi.
- Mengubah alur Kepala Toko/Administrator atau Pusat Data Outlet.

## Decisions

### D1: Status shift terbuka disimpan di global `openShift`
- **Choice**: `let openShift=null;` dideklarasikan bersama global sesi di app.js:167. Bentuknya `{username, n, cash, note}`.
- **Rationale**: status shift punya satu pemilik yang jelas dan hidup di luar `session`, sehingga tidak ikut hilang oleh `endSession()`.
- **Alternatives considered**: (B) menempelkan status ke objek akun di `loginAccounts`. Ditolak karena mencampur state runtime dengan master data, dan `loginForm()` (app.js:155) mengganti objek akun saat diedit. (C) tidak me-reset `openingCash` dan menambah `shiftOwner`. Ditolak karena status tetap tersebar di global yang sekarang sengaja di-reset di dua tempat.

### D2: `openingCash`/`openingNote` tetap menjadi sumber untuk rekap
- **Choice**: `openShift` hanya dipakai untuk memulihkan nilai. Saat login ulang, `loginAs()` menyalin `openShift.cash`/`openShift.note` ke `openingCash`/`openingNote`, sehingga `expectedCash()` dan alur tutup shift tidak berubah.
- **Rationale**: perubahan minimal pada kode tutup shift yang sudah stabil.
- **Alternatives considered**: membaca `openShift` langsung di `expectedCash()`. Ditolak karena alur tutup shift ikut berubah tanpa manfaat.

### D3: Titik perubahan di app.js (handler terakhir)
- `openVerifyModal()` (app.js:174), handler `$('#verifyStart').onclick` adalah satu-satunya definisi. Setelah `openingCash=cash;openingNote=note;` ditambah `openShift={username:session.username,n,cash,note};`.
- `loginAs()` (app.js:182), satu-satunya definisi. Bagian `openingCash=null;openingNote='';...;if(account.role==='Kasir')openShiftScreen(account);` diganti dengan cabang: kalau `account.role==='Kasir'&&openShift?.username===account.username`, pulihkan `openingCash`/`openingNote`, tampilkan badge `Shift ${openShift.n} berjalan • Modal awal ${rupiah(openShift.cash)}`, dan tampilkan toast "Melanjutkan Shift n" sebagai pengganti "Masuk sebagai Kasir". Kalau tidak, perilaku lama tetap berlaku.
- `closeShiftBA()` (app.js:119), satu-satunya definisi. Sebelum `endSession(\`Shift ${n} berhasil ditutup\`)` ditambah `openShift=null`.
- `endSession()` (app.js:187) tidak menyentuh `openShift`. Tidak ada salinan mati untuk fungsi-fungsi ini.
- Grep `#closeShift`, `endSession(`, dan `openShiftScreen(` sebelum mengubah, karena app.js berlapis.

### D4: Tombol dan modal Logout Kasir
- **Choice**: `<button class="btn ghost" id="kasirLogout">Logout</button>` di `.top-actions` header view Kasir (index.html:38), sebelum "Tutup shift". Handler baru `$('#kasirLogout').onclick` dipasang di dekat app.js:188. Handler membuka `openModal()` dengan judul "Logout", teks "Yakin logout tanpa tutup shift?", ditambah "Keranjang yang belum dibayar akan dikosongkan." bila `cart.length`, serta tombol "Batal" (`data-close`) dan "Logout" (`btn primary`, id `confirmLogout`). Konfirmasi menjalankan `closeModal();activeOrder=null;cart=[];fee=0;renderCart();endSession('Anda telah keluar dari sistem')`.
- **Rationale**: memakai pola modal dan toast yang sudah ada. Tombol hanya tampil di view Kasir, yang hanya diakses Kasir dalam praktiknya.
- **Alternatives considered**: memunculkan sidebar mini atau menu profil untuk Kasir. Ditolak karena lebih banyak CSS dan tidak diperlukan.

### D5: Tidak ada konfirmasi untuk jalan keluar lain
- **Choice**: "Keluar" di layar Mulai Shift (`#shiftLogout`) dan `#logoutButton` di sidebar tetap memanggil `endSession` langsung.
- **Rationale**: di kedua tempat itu tidak ada shift berjalan milik pengguna yang perlu dilindungi.

## Risks / Trade-offs

- [Risk] Kasir B memulai shift saat shift A masih terbuka, sehingga `openShift` A tertimpa. → Mitigation: diterima. Skenario ini di luar cakupan demo.
- [Risk] Kepala Toko/Administrator melihat tombol "Logout" di view Kasir kalau view itu dibuka. → Mitigation: berdasarkan `ROLE_ACCESS`, role tersebut tidak membuka view Kasir. Kalaupun terbuka, konfirmasi tetap aman (`openShift` tidak berubah).
- [Trade-off] Reload halaman menghapus `openShift`. → Diterima karena sesuai sifat prototipe tanpa persistensi, dan spec yang ada sudah menyebut reload menampilkan Mulai Shift lagi.

## Migration Plan

N/A. Perubahan ini tidak melibatkan deployment. Cukup buka `index.html` di browser.

## Open Questions

Tidak ada.
