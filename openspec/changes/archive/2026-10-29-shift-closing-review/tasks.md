## 1. POS: app.js, data

- [x] 1.1 Tambah `shiftClosings` setelah `cashDiff` (sekitar app.js:172), berisi 3 baris contoh:
  - `BA-0919-S3`: Sari W., modal 380000, sales 910000, fee 0, fisik 1290000, Belum Diperiksa, `authorizedBy` Taufik Hadi.
  - `BA-0919-S2`: Dimas A., 520000/2780000/40000, fisik 3240000, catatan "Uang receh untuk kembalian kurang", Sudah Diperiksa oleh Rina Pratiwi.
  - `BA-0919-S1`: Ayu Setiani, 450000/2150000/85000, fisik 2515000, Sudah Diperiksa oleh Budi Santoso.
  - Semua memakai `date:'19 Sep 2026'` dan `expected` yang dihitung.
- [x] 1.2 Tambah `shiftTransactions` dengan 8 baris `{no,time,items,method,total}` per shift 1/2/3. Nama menu diambil dari data menu, metode Tunai/QRIS/Kartu debit, jam sesuai rentang `SHIFT_HOURS`. Total transaksi diambil dari `salesRows.harian`.
- [x] 1.3 Hapus `const bas=...` di `renderAdmin()`.

## 2. POS: app.js, alur tutup shift Kasir

- [x] 2.1 Grep `closeShiftRecap`, `closeShiftBA`, `closeShiftAuth`, `verifyLeader`, `toLeader`, `baTable` untuk memastikan definisi/penugasan terakhir (app.js berlapis).
- [x] 2.2 Tulis ulang `closeShiftRecap()`: modal "Tutup Shift n" hanya berisi "Uang di cash register" (`#closingCash`) dan "Catatan (opsional)" (`#closingNote`), dengan tombol "Batal" dan "Lanjut ke Kepala Toko". Hapus `update`, `#recapPhysical`, `#recapDiff`, `#noteRequired`.
- [x] 2.3 Tambah `finishClosing()`. Urutannya:
  - simpan atau ganti record `BA-0920-S<n>` (Belum Diperiksa) di posisi teratas, lalu `renderClosings()`;
  - `openShift=null`, lalu `endSession(\`Shift ${n} berhasil ditutup\`)`;
  - modal "Verifikasi tutup shift berhasil" berisi "Shift n telah diverifikasi oleh <nama> (Kepala Toko). Data tutup shift menunggu pemeriksaan Kepala Toko." dan tombol "Selesai" (`data-close`).
- [x] 2.4 Di handler `#verifyLeader` (`closeShiftAuth`), ganti `closeShiftBA()` dengan `finishClosing()`. Hapus fungsi `closeShiftBA()`.
- [x] 2.5 Verifikasi di browser:
  - Login `ayu.kasir`, mulai shift (modal 450000), lalu "Tutup shift": hanya 2 field, tanpa angka kas dan tanpa "(wajib)".
  - Isi 2490000, Lanjut, Verifikasi: toast "Shift 1 berhasil ditutup" dan modal sukses di atas layar login. "Selesai" kembali ke layar login.
  - Batal di langkah rekap dan di langkah otorisasi tidak menutup shift. Penolakan kredensial (`rina.leader`, `ayu.kasir`) tetap berlaku.

## 3. POS: app.js, panel BA dan pemeriksaan

- [x] 3.1 Tambah `renderClosings()`, yang dipanggil dari `loginAs()`, `finishClosing()`, dan handler tandai (bukan dari `renderAdmin()`, karena TDZ `session`):
  - Tabel `#baTable` dengan kolom NO. BA, PERIODE, KASIR, UANG FISIK, SELISIH, CANCEL, STATUS, AKSI.
  - Pill status `low`/`ok`.
  - Tombol `.review-closing`: "Periksa" bila Kepala Toko dan status Belum, selain itu "Lihat".
  - Mengisi `#baPending` dengan `<n> dokumen`.
- [x] 3.2 Tambah `openClosingReview(id)` (`openModal`):
  - ringkasan kas `.ba-summary` (6 nilai);
  - `.approver-row` pengotorisasi;
  - catatan kasir (`-` bila kosong);
  - transaksi ("Menampilkan 8 dari <total> transaksi" dan tabel dalam `.table-scroll`);
  - histori cancel dari `cancelLog` (tanggal dan shift cocok), atau "Tidak ada pembatalan".
- [x] 3.3 Mode periksa (Kepala Toko dan status Belum): `#baNote`, `#baConfirm` dengan teks konfirmasi, tombol "Batal" dan "Tandai sudah diperiksa" (`#markChecked`).
  - Validasi dengan toast "Lengkapi catatan dan konfirmasi Kepala Toko".
  - Bila sukses: status menjadi Sudah Diperiksa, `ba={note,by:session.name,at:ORDER_NOW}`, lalu `closeModal()`, `renderClosings()`, dan toast "<id> sudah diperiksa". (Diubah oleh 5.3: halaman kembali ke daftar, bukan `closeModal()`.)
- [x] 3.4 Mode baca (status Sudah, atau Administrator): blok "BERITA ACARA" dengan catatan dan "Diperiksa oleh <by> • <at>" bila ada, serta tombol "Tutup".
- [x] 3.5 Verifikasi di browser:
  - Setelah Ayu tutup shift, login `budi.leader` lalu buka Admin: BA-0920-S1 di atas, Belum Diperiksa, selisih "Kurang Rp25.000", cancel 2, metrik "2 dokumen".
  - "Periksa": angka kas, transaksi "Menampilkan 8 dari 87 transaksi", cancel CNL-0920-007/006.
  - Tandai tanpa catatan ditolak. Dengan catatan dan centang berhasil, lalu "Lihat" tampil dalam mode baca.
  - Login `rina.leader`: BA-0919-S3 menampilkan "Periksa".
  - Login `admin.rbt`: semua baris "Lihat", tanpa form.

## 4. POS: index.html, teks statis

- [x] 4.1 Metrik "BA menunggu owner" diganti menjadi "BA belum diperiksa" dengan `<strong id="baPending">`.
- [x] 4.2 Teks kartu "Pengaturan 3 shift": "Kepala Toko memverifikasi tutup shift Kasir, lalu memeriksa berita acaranya di bawah."
- [x] 4.3 Subjudul panel BA: "Kepala Toko memeriksa ulang setiap tutup shift dari Kasir."
- [x] 4.4 Teks panel Hak akses Kepala Toko: "...serta mengotorisasi tutup shift, memeriksa berita acara tutup shift outletnya, dan mengotorisasi pembatalan item order untuk shift yang dipimpinnya."
- [x] 4.5 Verifikasi di browser: teks tab Shift & pengguna dan Hak akses sesuai, tidak ada error di console, dan modal pemeriksaan tidak melebar di lebar 400px.

## 5. POS: detail BA sebagai halaman, item dalam modal

- [x] 5.1 Ubah `shiftTransactions[*].items` menjadi `[[nama, qty], ...]`. Nama harus persis sama dengan `menuData`, dan `total` sama dengan Σ qty×harga. Tambah helper `menuPrice(name)` dari `Object.values(menuData).flat()`, dengan nilai `0` bila nama tidak ditemukan.
- [x] 5.2 Tambah `<section id="closingReview" class="view"></section>` di `index.html` (tanpa `.nav-item`). Tambah `backToClosings()` yang mengaktifkan view `admin` dan memanggil `switchAdminTab('users')`.
- [x] 5.3 Pindahkan `openClosingReview(id)` dari `openModal()` ke render `#closingReview` lalu aktifkan view tersebut:
  - tombol "← Kembali" (`#backToBA`) di header;
  - tabel transaksi `NO. TRANSAKSI, JAM, JUMLAH ITEM, METODE, TOTAL, AKSI` ("<n> item", tombol `.tx-detail` "Detail");
  - tabel cancel `ID, WAKTU, ITEM, KASIR, AKSI` (tombol `.cancel-detail` "Detail");
  - hapus wrapper `.req-modal` di halaman ini;
  - "Batal" dan "Kembali" (mode baca) memanggil `backToClosings()`;
  - setelah tandai sukses: `renderClosings()`, `backToClosings()`, lalu toast "<id> sudah diperiksa".
- [x] 5.4 Tambah `openTxDetail(no)` (`openModal`): judul nomor transaksi, subjudul "Jam • Metode", tabel `ITEM, QTY, HARGA, SUBTOTAL`, baris Total, dan tombol "Tutup".
- [x] 5.5 Tambah `openCancelDetail(id)` (`openModal`): ID, Waktu, Shift, Item, Harga (`menuPrice`), Alasan, Kasir, dan tombol "Tutup".
- [x] 5.6 Verifikasi di browser:
  - "Periksa" pada BA-0920-S1 membuka halaman (tidak ada `.modal` terbuka), dan "← Kembali" kembali ke panel BA dengan status tetap.
  - "Detail" TRX-0920-1081: Paket Favorit 25K 1 Rp25.000, Es teh manis 1 Rp6.000, total Rp31.000. Menutup modal tetap di halaman detail.
  - "Detail" CNL-0920-007: Paket Komplit 23K Rp23.000, "Salah pilih menu", Ayu Setiani.
  - Tandai sukses kembali ke panel, dengan metrik berkurang satu.
  - Ulangi cek role (Rina "Periksa", Admin hanya "Lihat" tanpa form).
  - Lebar 400px dengan halaman detail dan modal terbuka tidak menambah overflow dibanding halaman Admin.
  - Tidak ada error di console.

## 6. POS: paging contoh dan perbaikan form berita acara

- [x] 6.1 Tambah helper `pagerHtml(total,per=8)` sesuai design D5b ("Halaman 1 dari N", `‹ Sebelumnya` disabled, nomor 1 aktif / 2 / 3 / … / N, `Berikutnya ›` disabled bila N=1). Tambah CSS `.table-pager` dan `.pager-btn` (`.active`, `[disabled]`) di `styles.css`.
- [x] 6.2 Di `openClosingReview`, pasang `pagerHtml(salesRows.harian[c.shift-1][3])` di bawah tabel transaksi, dan `pagerHtml(cn.length)` di bawah tabel cancel (hanya bila ada pembatalan). Tombol halaman lain menampilkan toast "Data contoh: hanya halaman 1 yang ditampilkan".
- [x] 6.3 Bungkus form mode periksa dengan `<div class="review-form">`. Perluas selector `.modal label`, `.modal textarea`, dan `.modal input` agar juga berlaku untuk `.review-form`.
- [x] 6.4 Verifikasi di browser:
  - Pager transaksi menampilkan "Halaman 1 dari 11" (Shift 1), 13 (Shift 2), dan 5 (Shift 3). Halaman 1 aktif dan Sebelumnya disabled.
  - Klik "Berikutnya ›" dan halaman 2 menampilkan toast, dengan baris tabel tetap 8 yang sama.
  - Pager cancel BA-0920-S1 "Halaman 1 dari 1" dengan kedua panah disabled. Tidak ada pager di BA-0919-S3 ("Tidak ada pembatalan").
  - Computed style form: label `display:block` 10px, textarea selebar panel dengan font bukan monospace, dan checkbox tetap kecil.
  - Pager tidak menambah overflow di lebar 400px.
  - Suite CDP 73/73 dan regresi 31/31 tetap PASS, tanpa error console.
