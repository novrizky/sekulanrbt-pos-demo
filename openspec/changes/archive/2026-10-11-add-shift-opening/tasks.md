# Tasks

## 1. POS — index.html

- [x] 1.1 Tambahkan overlay `#shiftScreen` (`class="login-screen shift-screen closed"`) tepat setelah `#loginScreen`. Isinya panel `.login-visual` dan kartu `.login-card.opening-card` dengan: blok identitas (diisi JS), `#openingCash`, kotak serah terima + centang `#handoverRead` "Saya sudah membaca catatan serah terima", tiga `.check-row` ("Printer struk siap", "Mesin EDC menyala", "QRIS aktif"), `.approver-row` dengan nama Kepala Toko (diisi JS), `#openingLeaderPass`, `#cashWarning` (tersembunyi), dan textarea `#openingNote` berlabel "Catatan Kepala Toko", serta tombol `#shiftLogout` "Keluar" dan `#startShift` "Mulai shift" — verify: buka index.html, layar login tampil seperti biasa dan overlay baru belum terlihat.
- [x] 1.2 Tambahkan `<span class="shift-badge hidden" id="shiftBadge"></span>` di bawah `<h1>` pada `.topbar` view Kasir — verify: login sebagai Kepala Toko, header view Kasir tidak berubah.

## 2. POS — styles.css

- [x] 2.1 Tambahkan gaya `.opening-card` (lebar sekitar 460px, `max-height` + `overflow:auto`), blok identitas, kotak serah terima, `.cash-warning` (teks peringatan oranye dengan latar lembut), dan `.shift-badge` — verify: setelah tugas 3 selesai, layar Mulai Shift rapi di desktop dan di lebar sekitar 390px, dan isi kartu bisa di-scroll jika tinggi layar kurang.

## 3. POS — app.js

- [x] 3.1 Tambahkan `let openingCash=null,openingNote='';` di samping `session`/`closingApprover`, konstanta `SHIFT_HOURS` dan `HANDOVER_NOTES`, dan fungsi `openShiftScreen(account)`. Fungsi ini mengisi identitas ("Sekulan RBT 519A", "Shift 1 • 06.00–14.00", nama kasir, "Minggu, 20 September 2026"), catatan serah terima ("Dari Shift 3 • Sari W.", catatan kejadian, "Sisa uang di cash register: Rp450.000", tanpa info stok), dan "Kepala Toko: <nama>", mengosongkan semua isian, lalu membuka overlay — verify: dijalankan lewat tugas 3.2.
- [x] 3.2 Di akhir `loginAs`, reset `openingCash=null` dan `openingNote=''` dan panggil `openShiftScreen(account)` hanya untuk role Kasir — verify: login `ayu.kasir`, layar Mulai Shift menutupi POS. Login `budi.leader` dan `admin.rbt`, keduanya langsung masuk tanpa layar ini.
- [x] 3.3 Tambahkan `cashDiff(showEmpty)` dan pasang `#openingCash.oninput=()=>cashDiff(false)` — verify: ketik 400000, peringatan "Modal awal Rp400.000 berbeda dari sisa uang shift sebelumnya Rp450.000 (selisih Rp50.000)." muncul. Ketik 450000, peringatan hilang. Kosongkan, peringatan hilang.
- [x] 3.4 Pasang `#startShift.onclick`. Jika `#handoverRead` belum dicentang, tampilkan toast "Konfirmasi catatan serah terima terlebih dahulu". Jika `cashDiff(true)` dan `#openingNote` kosong, tampilkan toast "Catatan Kepala Toko wajib diisi karena modal awal berbeda". Jika lolos, set `openingCash` (kosong dianggap 0) dan `openingNote`, tutup overlay, tampilkan `#shiftBadge` "Shift 1 berjalan • Modal awal Rp…", dan tampilkan toast "Shift 1 dimulai. Modal awal Rp…" — verify: tanpa centang, toast tampil dan layar tetap terbuka. Dengan centang, modal awal kosong, sandi kosong dan checklist kosong, toast catatan wajib tampil dan peringatan selisih Rp450.000 muncul. Isi catatan, shift dimulai dengan Rp0. Ulangi dengan 400000 tanpa catatan (ditolak), lalu dengan catatan (dimulai Rp400.000). Ulangi dengan 450000 tanpa catatan, sandi kosong dan checklist kosong, shift dimulai dan badge serta toast menampilkan Rp450.000.
- [x] 3.5 Pasang `#shiftLogout.onclick` yang memanggil logout yang ada. Di `#logoutButton.onclick`, tutup `#shiftScreen`, sembunyikan `#shiftBadge`, dan reset `openingCash`/`openingNote` — verify: "Keluar" di layar Mulai Shift kembali ke login dengan toast "Anda telah keluar dari sistem". Logout dari sidebar setelah shift dimulai, lalu login ulang, layar Mulai Shift tampil lagi dan badge tidak tersisa.

## 4. Verifikasi integrasi

- [x] 4.1 Jalankan alur demo lengkap di browser: login Kasir → Mulai Shift (modal awal berbeda + catatan Kepala Toko) → badge shift tampil → tambah menu dan bayar → batalkan item → buka Persediaan. Pastikan alur tutup shift yang ada tetap berjalan seperti sebelumnya. Lalu refresh halaman dan pastikan alur dimulai lagi dari login. Cek juga bahwa toast tampil di atas layar Mulai Shift.

## 5. Revisi: verifikasi Kepala Toko sebagai modal

- [x] 5.1 index.html: hapus `.approver-row` (nama Kepala Toko, `#openingLeaderPass`, `#cashWarning`, `#openingNote`) dari kartu `#shiftScreen`, sehingga kartu hanya berisi isian Kasir — verify: login `ayu.kasir`, layar Mulai Shift tidak memuat kata sandi maupun Catatan Kepala Toko.
- [x] 5.2 styles.css: naikkan `.modal-backdrop` ke z-index 105 dan hapus gaya kartu yang tidak terpakai lagi — verify: modal verifikasi tampil di atas layar Mulai Shift, dan toast tetap di atas modal.
- [x] 5.3 app.js: hapus `cashDiff` dan `#openingCash.oninput`, tambahkan `openVerifyModal()` (nama Kepala Toko, ringkasan Kasir/Modal awal kas/Sisa uang shift sebelumnya, peringatan selisih jika berbeda, kata sandi, Catatan Kepala Toko, "Batal" dan "Verifikasi & mulai shift"), lalu ubah `#startShift.onclick` agar membuka modal setelah centang serah terima — verify: tanpa centang, toast tampil dan modal tidak terbuka. Dengan centang dan modal awal 450000, modal tampil tanpa peringatan.
- [x] 5.4 app.js: `#verifyStart.onclick` mewajibkan catatan jika berbeda, lalu menutup modal dan layar, menampilkan badge dan toast — verify: modal awal 400000 tanpa catatan ditolak dengan toast dan modal tetap terbuka. Dengan catatan, shift dimulai Rp400.000. Modal awal kosong menampilkan peringatan Rp0/selisih Rp450.000. "Batal" kembali ke layar dengan isian utuh.
- [x] 5.5 Ulangi verifikasi integrasi 4.1 dengan alur modal baru (Mulai shift → modal → Verifikasi & mulai shift → transaksi → Persediaan → Tutup shift) dan pastikan tidak ada error JS.

## 6. Revisi: catatan serah terima di modal verifikasi

- [x] 6.1 index.html: hapus `.handover-box` (`#handoverBox`) dan centang `#handoverRead` dari kartu `#shiftScreen` — verify: layar Mulai Shift hanya berisi identitas, modal awal kas, checklist kesiapan, "Keluar", dan "Mulai shift".
- [x] 6.2 app.js: `openShiftScreen` tidak lagi mengisi catatan serah terima. `#startShift` langsung membuka modal. `openVerifyModal()` merender `.handover-box` dan centang `#handoverRead`, dan `#verifyStart` mewajibkan centang itu lebih dulu, baru catatan Kepala Toko jika ada selisih — verify: modal menampilkan "Dari Shift 3 • Sari W." dan "Sisa uang di cash register: Rp450.000". Tanpa centang, muncul toast "Konfirmasi catatan serah terima terlebih dahulu" dan modal tetap terbuka.
- [x] 6.3 Ulangi alur integrasi (Mulai shift → modal → centang + Verifikasi & mulai shift → transaksi → Persediaan → Tutup shift) tanpa error JS, dan pastikan modal tetap terbaca rapi di layar 900px dan 390px.
