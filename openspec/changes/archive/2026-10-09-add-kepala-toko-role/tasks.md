# Tasks

Semua tugas di POS outlet (`index.html`, `app.js`, `styles.css`). Verifikasi dilakukan secara manual di browser dengan membuka `index.html`. Reload halaman untuk mengembalikan state awal.

## 1. Data akun dan istilah Kepala Toko

- [x] 1.1 Di `app.js`, ubah role `'Leader'` menjadi `'Kepala Toko'` di `staffUsers` dan `loginAccounts`, tambahkan akun `rina.leader` (Rina Pratiwi, Shift 2) dan `taufik.leader` (Taufik Hadi, Shift 3) berstatus Aktif, dan tambahkan Taufik Hadi ke `staffUsers`. Verifikasi: login Administrator, lalu tab Master login menampilkan tiga akun Kepala Toko, dan tab Shift & pengguna memuat Taufik.
- [x] 1.2 Ganti opsi `Leader` menjadi `Kepala Toko` di dropdown `staffForm` dan `loginForm`, beserta pengecekan `selected`-nya. Verifikasi: form "Tambah pengguna" dan "Tambah login" tidak lagi berisi "Leader", dan "Kelola" Budi menampilkan "Kepala Toko" terpilih.
- [x] 1.3 Tambahkan helper `shiftLeader(n)` (design keputusan 3). Ubah kartu shift di `renderAdmin` agar menampilkan `Kepala Toko: <nama pendek>` dari helper tersebut, dan ubah status BA "Menunggu leader" menjadi "Menunggu kepala toko". Verifikasi: kartu Shift 1–3 menampilkan Budi S., Rina P., dan Taufik H., dan tabel BA tidak memuat kata "leader".
- [x] 1.4 Di `index.html`, ubah teks panel shift menjadi "Kepala Toko wajib menyelesaikan berita acara sebelum shift ditutup." Ubah juga teks panel Hak akses agar menjelaskan Kasir, Kepala Toko, dan Administrator sesuai spec. Verifikasi: tab "Shift & pengguna" dan "Hak akses" menampilkan teks baru.

## 2. Login berbasis akun dan hak akses per role

- [x] 2.1 Di `index.html`, tambahkan tombol `data-role="kepala"` berlabel "Kepala Toko" di antara Kasir dan Administrator pada `.role-switch`. Di `styles.css`, ubah `.role-switch` menjadi `grid-template-columns:repeat(3,1fr)`. Verifikasi: tiga tombol tampil sejajar dan tidak terpotong.
- [x] 2.2 Ubah handler role switch agar auto-fill `ayu.kasir` / `budi.leader` / `admin.rbt` dengan kata sandi `demo123`. Verifikasi: menekan setiap tombol mengisi username yang sesuai.
- [x] 2.3 Tambahkan `session`, `ROLE_ACCESS`, dan `findAccount(username,password)` (design keputusan 1–2). Ubah handler `#loginForm` agar memakai `findAccount` dan menampilkan toast penolakan sesuai spec, termasuk untuk akun tidak aktif dan role tanpa akses POS. Verifikasi: `sari.kasir` ditolak dengan pesan "Akun tidak aktif…", sandi salah ditolak, dan username asal-asalan ditolak.
- [x] 2.4 Bangun ulang `loginAs(account)` agar profil (nama, `role • shift`, inisial di `.profile .avatar`), visibilitas `.nav-item`, visibilitas tombol `#adminTabs`, dan view awal diambil dari `ROLE_ACCESS`. Verifikasi:
  - Kasir hanya melihat Kasir dan Persediaan.
  - `rina.leader` masuk sebagai "Rina Pratiwi · Kepala Toko • Shift 2", melihat empat menu, tetapi Admin hanya berisi tab Shift & pengguna dan Outlet.
  - Administrator melihat semua menu dan tab, lalu view Admin terbuka.
- [x] 2.5 Ubah handler `#logoutButton` agar mengosongkan `session` dan `closingApprover`, lalu mengembalikan field login sesuai role yang dipilih. Verifikasi: logout dari Kepala Toko lalu login Administrator menampilkan kembali semua menu dan tab tanpa sisa yang tersembunyi.

## 3. Otorisasi Kepala Toko pada tutup shift

- [x] 3.1 Hapus handler `#closeShift` pertama yang sudah mati di section awal `app.js`. Tambahkan `closingShift()` dan variabel `closingApprover` (design keputusan 4–5). Verifikasi: pencarian `closeShift` di `app.js` hanya menemukan satu penugasan `.onclick`.
- [x] 3.2 Ubah handler `#closeShift` yang tersisa agar menampilkan langkah otorisasi (keterangan "Shift N · Kepala Toko: <nama>", input username dan kata sandi, tombol Batal dan Verifikasi) kecuali Kepala Toko shift itu sendiri yang login. Verifikasi: Ayu melihat langkah otorisasi, sedangkan Budi langsung melihat form BA.
- [x] 3.3 Pasang `#verifyLeader.onclick` dengan `findAccount` ditambah pemeriksaan role, outlet, dan shift, lengkap dengan pesan toast sesuai spec. Jika berhasil, set `closingApprover` dan buka form BA. Verifikasi dengan login Ayu:
  - Field kosong ditolak.
  - Sandi salah ditolak dengan "Kredensial Kepala Toko tidak valid".
  - `ayu.kasir` ditolak dengan "Akun ini bukan Kepala Toko".
  - `rina.leader` ditolak dengan "Hanya Kepala Toko Shift 1 (Budi Santoso)…".
  - Setelah Budi dinonaktifkan lewat Master login sebagai Administrator, `budi.leader` ditolak dengan "Akun Kepala Toko tidak aktif".
  - `budi.leader` / `demo123` membuka form BA.
- [x] 3.4 Perbarui modal BA: judul "Tutup Shift N", baris "Diperiksa oleh: <nama> (Kepala Toko)", teks checkbox "Saya sebagai Kepala Toko telah memeriksa transaksi dan histori cancel.", serta toast validasi "Lengkapi catatan dan konfirmasi Kepala Toko" di delegasi `#submitBA`. Verifikasi: menekan "Buat paket data" tanpa catatan atau centang memunculkan toast baru.
- [x] 3.5 Perbarui modal paket: nama paket memakai `SHIFT<n>` dari `closingShift()`, dan ringkasan menampilkan "Diperiksa oleh: <nama>". Verifikasi: alur Ayu + Budi menghasilkan `…_SHIFT1_…` dengan nama Budi, dan login `rina.leader` menghasilkan judul "Tutup Shift 2" dan paket `…_SHIFT2_…` tanpa langkah otorisasi.

## 4. Verifikasi integrasi

- [x] 4.1 Jalankan seluruh alur dari reload: Kasir login, transaksi pembayaran, tutup shift dengan otorisasi Budi, kirim ke pusat, logout, Kepala Toko login, cek menu Laporan dan Admin terbatas, logout, Administrator login, cek semua tab. Verifikasi: tidak ada error di konsol browser dan semua toast sesuai spec.
- [x] 4.2 Perbarui `CLAUDE.md` (tabel aplikasi POS: tiga role login dan otorisasi Kepala Toko saat tutup shift). Verifikasi: deskripsi di CLAUDE.md sesuai perilaku baru.

## Workflow follow-up

- Arsipkan change dengan `/opsx:archive` setelah implementasi diverifikasi, agar spec `pos-access-control` dan `shift-closing` masuk ke `openspec/specs/`.
