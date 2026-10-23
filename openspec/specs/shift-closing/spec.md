# shift-closing Specification

## Purpose

Mengatur alur tutup shift di POS outlet: rekap kas yang dipertanggungjawabkan Kasir, siapa yang berwenang menyetujui penutupan, berita acara (BA) yang menyertainya, dan berakhirnya sesi Kasir setelah shift ditutup.

## Requirements

### Requirement: Shift yang ditutup
Shift yang ditutup SHALL sama dengan shift pengguna yang sedang login. Jika akun pengguna tidak terikat shift (misalnya Administrator), shift yang ditutup SHALL adalah shift yang sedang aktif, yaitu Shift 1.

#### Scenario: Kasir Shift 1 menutup shift
- **WHEN** Ayu Setiani (Kasir, Shift 1) menekan "Tutup shift"
- **THEN** modal tutup shift berjudul "Tutup Shift 1"

#### Scenario: Administrator menutup shift
- **WHEN** Administrator menekan "Tutup shift" di view Kasir
- **THEN** modal tutup shift berjudul "Tutup Shift 1"

### Requirement: Otorisasi Kepala Toko sebelum tutup shift
Setelah Kasir menyelesaikan langkah rekap kas, sistem SHALL selalu menampilkan langkah otorisasi Kepala Toko sebelum menampilkan form berita acara. Modal otorisasi SHALL menampilkan nama Kepala Toko yang berwenang untuk shift tersebut. Karena ini aplikasi demo, field username SHALL sudah terisi username Kepala Toko shift tersebut dan field kata sandi SHALL sudah terisi kata sandi demo, sehingga Kasir cukup menekan "Verifikasi". Kedua field SHALL tetap dapat diubah.

#### Scenario: Kasir membuka tutup shift
- **WHEN** Ayu Setiani (Kasir, Shift 1) menekan "Lanjut ke Kepala Toko" di langkah rekap kas
- **THEN** langkah otorisasi tampil dengan keterangan "Shift 1 · Kepala Toko: Budi Santoso", field username sudah berisi `budi.leader`, field kata sandi sudah terisi, dan form berita acara belum tampil

#### Scenario: Verifikasi langsung dengan isian bawaan
- **WHEN** pada langkah otorisasi Shift 1 Kasir langsung menekan "Verifikasi" tanpa mengubah isian
- **THEN** form berita acara tampil dengan keterangan "Diperiksa oleh: Budi Santoso (Kepala Toko)"

#### Scenario: Kredensial Kepala Toko yang benar
- **WHEN** pada langkah otorisasi Shift 1 dimasukkan `budi.leader` / `demo123` lalu "Verifikasi" ditekan
- **THEN** form berita acara tampil dengan keterangan "Diperiksa oleh: Budi Santoso (Kepala Toko)"

#### Scenario: Batal di langkah otorisasi
- **WHEN** pengguna menekan "Batal" di langkah otorisasi
- **THEN** modal tertutup dan shift tidak ditutup

### Requirement: Penolakan kredensial otorisasi
Sistem SHALL menolak otorisasi jika kredensial yang dimasukkan bukan milik Kepala Toko aktif dari shift dan outlet yang ditutup, atau jika kata sandinya salah. Setelah penolakan, pengguna SHALL tetap berada di langkah otorisasi.

#### Scenario: Kepala Toko dari shift lain
- **WHEN** pada langkah otorisasi Shift 1 isian username diganti menjadi `rina.leader` dengan kata sandi `demo123`
- **THEN** otorisasi ditolak dengan toast "Hanya Kepala Toko Shift 1 (Budi Santoso) yang dapat menutup shift ini"

#### Scenario: Akun bukan Kepala Toko
- **WHEN** pada langkah otorisasi isian diganti menjadi `ayu.kasir` / `demo123` atau `admin.rbt` / `demo123`
- **THEN** otorisasi ditolak dengan toast "Akun ini bukan Kepala Toko"

#### Scenario: Kata sandi salah atau username tidak dikenal
- **WHEN** pada langkah otorisasi isian diganti menjadi `budi.leader` dengan kata sandi selain `demo123`, atau username yang tidak terdaftar
- **THEN** otorisasi ditolak dengan toast "Kredensial Kepala Toko tidak valid"

#### Scenario: Field otorisasi kosong
- **WHEN** pengguna mengosongkan username atau kata sandi yang sudah terisi lalu menekan "Verifikasi"
- **THEN** toast "Username dan kata sandi Kepala Toko wajib diisi" tampil

#### Scenario: Akun Kepala Toko nonaktif
- **WHEN** akun Kepala Toko untuk shift yang ditutup berstatus Nonaktif di Master login, lalu "Verifikasi" ditekan dengan kredensialnya
- **THEN** otorisasi ditolak dengan toast "Akun Kepala Toko tidak aktif"

### Requirement: Berita acara wajib dilengkapi Kepala Toko
Form berita acara SHALL menampilkan ringkasan kas dari langkah rekap kas (seharusnya di laci, uang fisik, selisih) beserta catatan kasir, dan SHALL mewajibkan catatan BA serta centang konfirmasi "Saya sebagai Kepala Toko telah memeriksa transaksi dan histori cancel." sebelum shift dapat ditutup. Form BA SHALL tidak lagi menyebut paket data maupun SFTP.

#### Scenario: Ringkasan kas di BA
- **WHEN** Kasir mengisi sisa uang Rp2.490.000 dengan catatan "Kembalian berlebih ke pelanggan meja 4", lalu otorisasi Shift 1 berhasil
- **THEN** form BA menampilkan seharusnya di laci Rp2.515.000, uang fisik Rp2.490.000, selisih "Kurang Rp25.000", dan catatan kasir tersebut

#### Scenario: BA tanpa catatan kasir
- **WHEN** Kasir tidak mengisi catatan khusus, lalu otorisasi berhasil
- **THEN** form BA menampilkan catatan kasir "-"

#### Scenario: BA belum lengkap
- **WHEN** "Tutup shift" pada form BA ditekan tanpa catatan BA atau tanpa centang konfirmasi
- **THEN** toast "Lengkapi catatan dan konfirmasi Kepala Toko" tampil dan shift tidak ditutup

#### Scenario: BA lengkap
- **WHEN** catatan BA diisi, konfirmasi dicentang, lalu "Tutup shift" pada form BA ditekan
- **THEN** shift ditutup tanpa menampilkan modal paket data

### Requirement: Rekap kas Kasir sebagai langkah pertama tutup shift
Saat Kasir menekan "Tutup shift", sistem SHALL menampilkan langkah rekap kas sebelum langkah otorisasi Kepala Toko. Langkah ini SHALL berisi field "Sisa uang di cash register" (kosong saat dibuka), field "Catatan khusus kasir", dan perbandingan kas: modal awal (dari isian saat Mulai Shift), penjualan tunai dan fee driver tunai (angka contoh per shift), "Seharusnya di laci" = modal awal + penjualan tunai − fee driver tunai, uang fisik, dan selisih.

#### Scenario: Kasir membuka rekap kas
- **WHEN** Ayu Setiani (Kasir, Shift 1, modal awal Rp450.000) menekan "Tutup shift"
- **THEN** modal "Tutup Shift 1" tampil dengan langkah rekap kas yang menampilkan modal awal Rp450.000, penjualan tunai Rp2.150.000, fee driver tunai Rp85.000, dan seharusnya di laci Rp2.515.000, serta field sisa uang yang masih kosong; langkah otorisasi belum tampil

#### Scenario: Lanjut ke otorisasi
- **WHEN** pada langkah rekap kas Kasir menekan "Lanjut ke Kepala Toko"
- **THEN** langkah otorisasi Kepala Toko tampil

#### Scenario: Batal di langkah rekap kas
- **WHEN** Kasir menekan "Batal" di langkah rekap kas
- **THEN** modal tertutup dan shift tidak ditutup

### Requirement: Selisih kas dihitung langsung
Selisih kas SHALL dihitung sebagai uang fisik dikurangi seharusnya di laci, dan diperbarui setiap kali Kasir mengubah isian sisa uang. Selisih positif SHALL diberi label "Lebih", selisih negatif "Kurang", dan selisih nol "Sesuai". Isian sisa uang yang kosong SHALL dihitung sebagai Rp0, tanpa menahan Kasir untuk lanjut.

#### Scenario: Uang di laci lebih
- **WHEN** seharusnya di laci Rp2.515.000 dan Kasir mengisi sisa uang Rp2.550.000
- **THEN** selisih tampil "Lebih Rp35.000"

#### Scenario: Uang di laci kurang
- **WHEN** seharusnya di laci Rp2.515.000 dan Kasir mengisi sisa uang Rp2.490.000
- **THEN** selisih tampil "Kurang Rp25.000"

#### Scenario: Uang di laci sesuai
- **WHEN** seharusnya di laci Rp2.515.000 dan Kasir mengisi sisa uang Rp2.515.000
- **THEN** selisih tampil "Sesuai Rp0"

### Requirement: Catatan kasir ditandai wajib saat ada selisih
Saat selisih kas tidak nol, label field catatan kasir SHALL menampilkan "(wajib)". Ini hanya penanda; sistem SHALL tetap mengizinkan Kasir lanjut ke otorisasi walaupun catatan kosong.

#### Scenario: Ada selisih
- **WHEN** selisih kas tampil "Lebih" atau "Kurang"
- **THEN** label catatan kasir menampilkan "(wajib)"

#### Scenario: Lanjut tanpa catatan meski ada selisih
- **WHEN** selisih kas tidak nol, catatan kasir kosong, lalu Kasir menekan "Lanjut ke Kepala Toko"
- **THEN** langkah otorisasi Kepala Toko tetap tampil tanpa toast peringatan

#### Scenario: Tidak ada selisih
- **WHEN** selisih kas "Sesuai"
- **THEN** label catatan kasir tidak menampilkan "(wajib)"

### Requirement: Sesi Kasir berakhir setelah tutup shift
Setelah berita acara lengkap dan "Tutup shift" ditekan, sistem SHALL menampilkan toast "Shift <n> berhasil ditutup", mengakhiri sesi Kasir, dan kembali ke layar login.

#### Scenario: Shift 1 ditutup
- **WHEN** Ayu Setiani menyelesaikan BA Shift 1 lalu menekan "Tutup shift"
- **THEN** toast "Shift 1 berhasil ditutup" tampil, modal tertutup, dan layar login tampil kembali

#### Scenario: Login lagi setelah tutup shift
- **WHEN** setelah tutup shift Kasir login kembali dengan `ayu.kasir` / `demo123`
- **THEN** layar "Mulai Shift" tampil seperti awal sesi
