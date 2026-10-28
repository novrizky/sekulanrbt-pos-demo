# Brainstorm: Logout Kasir tanpa tutup shift, lanjut shift saat login ulang

Ukuran: perubahan kecil (POS `index.html` + `app.js`). Desain singkat.

## Latar belakang

- Tombol logout `#logoutButton` (index.html:31) ada di profil sidebar, tetapi `body.role-kasir .sidebar{display:none}` (styles.css:15) menyembunyikan sidebar untuk Kasir. Akibatnya Kasir tidak punya jalan keluar selain "Tutup shift".
- Header view Kasir (index.html:38) hanya berisi "Tutup shift" dan "+ Pesanan baru".
- Status shift yang berjalan hanya tersimpan sebagai `openingCash`, `openingNote`, dan teks `#shiftBadge`. Ketiganya di-reset oleh `endSession()` (app.js:187) dan `loginAs()` (app.js:182). `loginAs()` juga selalu membuka layar Mulai Shift untuk Kasir.
- Tutup shift berakhir di `endSession("Shift n berhasil ditutup")` (app.js:119).
- `expectedCash()` (app.js:171) membaca `openingCash`, jadi nilai ini harus pulih setelah login ulang agar rekap tutup shift tetap benar.

## Intent

Kasir perlu bisa logout sementara, misalnya istirahat atau berganti perangkat, tanpa harus menutup shift. Saat Kasir yang sama kembali, ia langsung melanjutkan shift tanpa mengulang verifikasi Kepala Toko.

## Rantai keputusan

- **Q1. Apakah logout wajib tutup shift dulu?** Tidak. Logout memunculkan popup konfirmasi "Yakin logout tanpa tutup shift?". (pengguna)
- **Q2. Login ulang oleh username yang sama?** Tidak perlu Mulai Shift lagi, karena sesi shift masih berjalan. (pengguna)
- **Q3. Kasir lain (username berbeda) login saat shift A masih terbuka?** Diabaikan, di luar cakupan. (pengguna)
- **Q4. Keranjang yang belum dibayar saat logout?** Dikosongkan. (pengguna)
- **Q5. Cara menyimpan shift terbuka?** Pendekatan A, satu variabel `openShift`. (pengguna, lihat Pendekatan)

## Pendekatan

| | Pendekatan | Trade-off |
|---|---|---|
| **A (dipilih)** | Global baru `openShift = {username, n, cash, note}` yang hidup di luar sesi | Satu sumber kebenaran untuk shift berjalan dan tidak bergantung pada data master. Hanya ada satu slot, tapi sesuai dengan Q3. |
| B | Ditempel ke objek akun (`account.openShift`) | Perubahan minimal, tetapi status runtime tercampur dengan data master login, dan `loginForm()` mengganti objek akun saat diedit sehingga shift bisa hilang diam-diam. |
| C | Jangan reset `openingCash`/`openingNote` dan tambah `shiftOwner` | Diff terkecil, tetapi status tersebar di beberapa global yang sekarang sengaja di-reset di dua tempat, jadi mudah rusak. |

Alasan memilih A: status shift punya pemilik yang jelas tanpa menambah kerumitan. Ini sesuai prinsip demo (tampilan dan alur, bukan integritas data).

## Bentuk perilaku

```
 login Kasir --> openShift?.username === account.username ?
                   | tidak                       | ya
                   v                             v
           Layar Mulai Shift            view Kasir langsung aktif
           -> verifikasi KT             openingCash/openingNote dipulihkan
           -> openShift diisi           badge "Shift n berjalan • Modal awal Rp..."
                   |                    toast "Melanjutkan Shift n"
                   +-------------+---------------+
                                 v
                          SHIFT BERJALAN
                     |                      |
                 [Logout]              [Tutup shift]
                     |                      |
        modal "Yakin logout tanpa     (alur lama) -> openShift = null
        tutup shift?"                       -> endSession -> login
                     |
        cart/activeOrder dikosongkan,
        endSession, openShift TETAP
```

## Keputusan perancang (dapat dikoreksi)

- Tombol "Logout" ditaruh di `.top-actions` header Kasir, di sebelah "Tutup shift", dengan gaya `btn ghost`.
- Teks modal: judul "Logout", isi "Yakin logout tanpa tutup shift?". Kalau keranjang berisi, ditambah "Keranjang yang belum dibayar akan dikosongkan." Tombol: "Batal" (`data-close`) dan "Logout".
- Toast setelah logout memakai pesan `endSession` yang ada: "Anda telah keluar dari sistem".
- Toast saat login ulang: "Melanjutkan Shift n". Toast ini menggantikan "Masuk sebagai Kasir" untuk kasus tersebut.
- "Keluar" di layar Mulai Shift dan logout sidebar untuk Kepala Toko/Administrator tetap tanpa konfirmasi, karena tidak ada shift yang berjalan.
- Mengosongkan keranjang cukup memakai reset yang sudah ada di `loginAs()` (`cart=[]`, `activeOrder=null`, `fee=0`) dan dijalankan juga saat logout, supaya keranjang tidak sempat terlihat oleh login berikutnya.

## Non-goal

- Menangani Kasir lain yang login saat shift masih terbuka (satu slot `openShift`; shift baru akan menimpanya).
- Persistensi lintas reload (reload tetap mereset semuanya).
- Batas waktu sesi atau logout otomatis.
- Perubahan di Pusat Data Outlet (`outlet-data.html`) atau format paket ZIP.

## Untuk perancang/pembangun

- Pastikan `openShift` diisi di handler `#verifyStart` yang terakhir (app.js:174) dan dikosongkan sebelum `endSession` di alur tutup shift (app.js:119).
- Spec yang terdampak: `shift-opening` (melanjutkan shift) dan `shift-closing` atau capability baru untuk logout Kasir.
