# shift-opening Specification

## Purpose

Mengatur alur Kasir membuka shift di POS outlet: layar Mulai Shift yang mengunci POS setelah login, data pembukaan shift (modal awal kas, serah terima, kesiapan), verifikasi Kepala Toko, dan penanda shift berjalan.

## Requirements

### Requirement: Layar Mulai Shift mengunci POS untuk Kasir
Setiap kali pengguna ber-role Kasir berhasil login, sistem SHALL menampilkan layar penuh "Mulai Shift" yang menutupi seluruh POS, termasuk sidebar, view Kasir, dan Persediaan, kecuali bila username tersebut masih memiliki shift terbuka (lihat requirement "Melanjutkan shift yang masih terbuka"). POS SHALL tidak dapat dipakai sampai Kasir menekan "Mulai shift" dan shift berhasil dimulai.

#### Scenario: Kasir login
- **WHEN** Ayu Setiani login dengan `ayu.kasir` / `demo123` dan tidak ada shift terbuka miliknya
- **THEN** layar "Mulai Shift" tampil menutupi seluruh POS, dan menu maupun tombol POS tidak dapat diklik

#### Scenario: Refresh halaman
- **WHEN** halaman di-refresh setelah shift dimulai, lalu Kasir login kembali
- **THEN** layar "Mulai Shift" tampil lagi dengan isian kosong

### Requirement: Kepala Toko dan Administrator tidak membuka shift
Pengguna ber-role Kepala Toko atau Administrator SHALL langsung masuk ke POS setelah login tanpa melihat layar Mulai Shift.

#### Scenario: Kepala Toko login
- **WHEN** Budi Santoso login dengan `budi.leader` / `demo123`
- **THEN** view Kasir langsung terbuka tanpa layar "Mulai Shift"

#### Scenario: Administrator login
- **WHEN** pengguna login dengan `admin.rbt` / `demo123`
- **THEN** view Admin langsung terbuka tanpa layar "Mulai Shift"

### Requirement: Identitas shift ditampilkan otomatis
Layar Mulai Shift SHALL menampilkan identitas shift dari akun yang login sebagai informasi read-only: outlet, nomor shift beserta jamnya, nama kasir, dan tanggal.

#### Scenario: Identitas Shift 1
- **WHEN** layar "Mulai Shift" tampil untuk Ayu Setiani
- **THEN** layar menampilkan "Sekulan RBT 519A", "Shift 1 • 06.00–14.00", "Ayu Setiani", dan "Minggu, 20 September 2026", tanpa field yang dapat diubah untuk data tersebut

### Requirement: Modal awal kas
Kasir SHALL dapat mengisi modal awal kas dalam Rupiah. Nilai Rp0 SHALL diterima, dan field yang dikosongkan SHALL dianggap Rp0. Modal awal yang berbeda dari sisa uang shift sebelumnya mengikuti requirement "Catatan Kepala Toko wajib saat ada selisih".

#### Scenario: Modal awal diisi
- **WHEN** Kasir mengisi modal awal 450000 dan menekan "Mulai shift", lalu di modal verifikasi serah terima dicentang dan "Verifikasi & mulai shift" ditekan
- **THEN** shift dimulai dengan modal awal Rp450.000

#### Scenario: Modal awal kosong
- **WHEN** Kasir mengosongkan modal awal dan menekan "Mulai shift", lalu di modal verifikasi serah terima dicentang, "Catatan Kepala Toko" diisi, dan "Verifikasi & mulai shift" ditekan
- **THEN** shift dimulai dengan modal awal Rp0

### Requirement: Checklist kesiapan bersifat opsional
Layar Mulai Shift SHALL menampilkan checklist kesiapan "Printer struk siap", "Mesin EDC menyala", dan "QRIS aktif". Kasir SHALL dapat menekan "Mulai shift" walaupun tidak ada item checklist yang dicentang.

#### Scenario: Checklist tidak dicentang
- **WHEN** Kasir mengisi modal awal 450000 tanpa mencentang item checklist kesiapan, lalu menekan "Mulai shift"
- **THEN** modal "Verifikasi Kepala Toko" terbuka

### Requirement: Verifikasi Kepala Toko dalam modal terpisah
Layar Mulai Shift SHALL hanya memuat isian Kasir (identitas shift, modal awal kas, checklist kesiapan). Menekan "Mulai shift" SHALL membuka modal "Verifikasi Kepala Toko" di atas layar Mulai Shift. Modal SHALL menampilkan nama Kepala Toko shift Kasir, ringkasan (Kasir, Modal awal kas, Sisa uang shift sebelumnya, Selisih), catatan serah terima, field kata sandi Kepala Toko, kolom "Catatan Kepala Toko", serta tombol "Batal" dan "Verifikasi & mulai shift".

#### Scenario: Layar Kasir tanpa bagian verifikasi
- **WHEN** layar "Mulai Shift" tampil untuk Ayu Setiani
- **THEN** layar tidak menampilkan catatan serah terima, field kata sandi Kepala Toko, maupun kolom "Catatan Kepala Toko"

#### Scenario: Isi modal verifikasi Shift 1
- **WHEN** Ayu Setiani mengisi modal awal 450000 lalu menekan "Mulai shift"
- **THEN** modal menampilkan "Kepala Toko: Budi Santoso", ringkasan Kasir Ayu Setiani, Modal awal kas Rp450.000, Sisa uang shift sebelumnya Rp450.000, catatan serah terima, field kata sandi, dan kolom "Catatan Kepala Toko"

#### Scenario: Batal di modal verifikasi
- **WHEN** "Batal" ditekan di modal verifikasi
- **THEN** modal tertutup, layar "Mulai Shift" tetap tampil dengan isian Kasir tidak berubah, dan shift belum dimulai

### Requirement: Catatan serah terima di modal verifikasi
Modal verifikasi SHALL menampilkan catatan serah terima dari kasir shift sebelumnya beserta centang "Saya sudah membaca catatan serah terima". Catatan SHALL hanya berisi catatan kejadian dan sisa uang di cash register, tanpa informasi stok. Centang SHALL wajib sebelum shift dapat dimulai.

#### Scenario: Isi catatan serah terima Shift 1
- **WHEN** modal verifikasi tampil untuk Ayu Setiani (Shift 1)
- **THEN** catatan serah terima menampilkan pengirim "Dari Shift 3 • Sari W.", satu catatan kejadian, dan "Sisa uang di cash register: Rp450.000", tanpa menyebut stok barang

#### Scenario: Belum dicentang
- **WHEN** modal awal 450000 dan "Verifikasi & mulai shift" ditekan tanpa mencentang "Saya sudah membaca catatan serah terima"
- **THEN** toast "Konfirmasi catatan serah terima terlebih dahulu" tampil dan modal verifikasi tetap terbuka

#### Scenario: Sudah dicentang
- **WHEN** modal awal 450000, "Saya sudah membaca catatan serah terima" dicentang, lalu "Verifikasi & mulai shift" ditekan
- **THEN** shift dimulai

### Requirement: Kata sandi Kepala Toko hanya tampilan
Isian kata sandi di modal verifikasi SHALL tidak diperiksa. Isian apa pun, termasuk kosong, SHALL diterima.

#### Scenario: Kata sandi kosong atau sembarang
- **WHEN** modal awal 450000, serah terima dicentang, field kata sandi dikosongkan atau diisi teks sembarang, lalu "Verifikasi & mulai shift" ditekan
- **THEN** shift dimulai tanpa pesan kesalahan

### Requirement: Peringatan selisih modal awal
Jika modal awal (kosong dianggap Rp0) berbeda dari sisa uang di cash register pada catatan serah terima, modal verifikasi SHALL menampilkan peringatan selisih. Jika nilainya sama, peringatan SHALL tidak tampil.

#### Scenario: Modal awal berbeda
- **WHEN** Ayu Setiani (Shift 1, sisa uang Rp450.000) mengisi modal awal 400000 lalu menekan "Mulai shift"
- **THEN** modal verifikasi menampilkan "Modal awal Rp400.000 berbeda dari sisa uang shift sebelumnya Rp450.000 (selisih Rp50.000)."

#### Scenario: Modal awal sama
- **WHEN** modal awal 450000 lalu "Mulai shift" ditekan
- **THEN** modal verifikasi tidak menampilkan peringatan selisih

#### Scenario: Modal awal kosong
- **WHEN** modal awal dikosongkan lalu "Mulai shift" ditekan
- **THEN** modal verifikasi menampilkan "Modal awal Rp0 berbeda dari sisa uang shift sebelumnya Rp450.000 (selisih Rp450.000)."

### Requirement: Catatan Kepala Toko wajib saat ada selisih
Jika modal awal berbeda dari sisa uang shift sebelumnya, "Catatan Kepala Toko" di modal verifikasi SHALL wajib diisi sebelum shift dapat dimulai. Jika nilainya sama, catatan SHALL opsional.

#### Scenario: Berbeda tanpa catatan
- **WHEN** modal awal 400000, serah terima dicentang, "Catatan Kepala Toko" kosong, lalu "Verifikasi & mulai shift" ditekan
- **THEN** toast "Catatan Kepala Toko wajib diisi karena modal awal berbeda" tampil dan modal verifikasi tetap terbuka

#### Scenario: Berbeda dengan catatan
- **WHEN** modal awal 400000, serah terima dicentang, "Catatan Kepala Toko" diisi "Uang Rp50.000 dipakai untuk belanja gas", lalu "Verifikasi & mulai shift" ditekan
- **THEN** shift dimulai dengan modal awal Rp400.000

#### Scenario: Sama tanpa catatan
- **WHEN** modal awal 450000, serah terima dicentang, "Catatan Kepala Toko" kosong, lalu "Verifikasi & mulai shift" ditekan
- **THEN** shift dimulai dengan modal awal Rp450.000

### Requirement: Memulai shift membuka POS
Saat "Verifikasi & mulai shift" berhasil, sistem SHALL menutup modal verifikasi dan layar Mulai Shift, membuka view Kasir, dan menampilkan toast "Shift <n> dimulai. Modal awal <nominal>". View Kasir SHALL menampilkan penanda "Shift <n> berjalan • Modal awal <nominal>".

#### Scenario: Shift 1 dimulai
- **WHEN** Ayu Setiani memulai shift dengan modal awal 450000, lalu serah terima dicentang dan "Verifikasi & mulai shift" ditekan
- **THEN** modal dan layar "Mulai Shift" tertutup, view Kasir aktif, toast "Shift 1 dimulai. Modal awal Rp450.000" tampil, dan header view Kasir menampilkan "Shift 1 berjalan • Modal awal Rp450.000"

### Requirement: Keluar dari layar Mulai Shift
Layar Mulai Shift SHALL menyediakan tombol "Keluar" yang mengakhiri sesi dan mengembalikan pengguna ke layar login tanpa memulai shift.

#### Scenario: Kasir keluar
- **WHEN** Kasir menekan "Keluar" di layar "Mulai Shift"
- **THEN** layar login tampil dan toast "Anda telah keluar dari sistem" tampil

### Requirement: Melanjutkan shift yang masih terbuka
Bila Kasir login dengan username yang sama dengan pemilik shift yang masih terbuka (sudah dimulai, belum ditutup, lalu logout), sistem SHALL melewati layar "Mulai Shift" dan modal "Verifikasi Kepala Toko", langsung membuka view Kasir, menampilkan penanda "Shift <n> berjalan • Modal awal <nominal>" dengan modal awal yang sama, dan menampilkan toast "Melanjutkan Shift <n>". Rekap tutup shift SHALL memakai modal awal tersebut.

#### Scenario: Ayu login ulang
- **WHEN** Ayu Setiani memulai Shift 1 dengan modal awal 450000, logout dari view Kasir, lalu login kembali dengan `ayu.kasir` / `demo123`
- **THEN** layar "Mulai Shift" tidak tampil, view Kasir aktif, toast "Melanjutkan Shift 1" tampil, dan header view Kasir menampilkan "Shift 1 berjalan • Modal awal Rp450.000"

#### Scenario: Rekap tutup shift setelah login ulang
- **WHEN** setelah melanjutkan Shift 1, Kasir menekan "Tutup shift"
- **THEN** rekap kas menghitung uang seharusnya dari modal awal Rp450.000, sama seperti bila Kasir tidak pernah logout
