# Spec Delta

## Purpose

Mengatur alur tutup shift di POS outlet: siapa yang berwenang menyetujui penutupan, berita acara (BA) yang menyertainya, dan pembuatan paket data shift untuk dikirim ke pusat.

## ADDED Requirements

### Requirement: Shift yang ditutup
Shift yang ditutup SHALL sama dengan shift pengguna yang sedang login. Jika akun pengguna tidak terikat shift (misalnya Administrator), shift yang ditutup SHALL adalah shift yang sedang aktif, yaitu Shift 1.

#### Scenario: Kasir Shift 1 menutup shift
- **WHEN** Ayu Setiani (Kasir, Shift 1) menekan "Tutup shift"
- **THEN** modal tutup shift berjudul "Tutup Shift 1"

#### Scenario: Administrator menutup shift
- **WHEN** Administrator menekan "Tutup shift" di view Kasir
- **THEN** modal tutup shift berjudul "Tutup Shift 1"

### Requirement: Otorisasi Kepala Toko sebelum tutup shift
Jika pengguna yang login bukan Kepala Toko dari shift yang ditutup, sistem SHALL meminta username dan kata sandi Kepala Toko sebelum menampilkan form berita acara. Modal otorisasi SHALL menampilkan nama Kepala Toko yang berwenang untuk shift tersebut.

#### Scenario: Kasir membuka tutup shift
- **WHEN** Ayu Setiani (Kasir, Shift 1) menekan "Tutup shift"
- **THEN** langkah otorisasi tampil dengan keterangan "Shift 1 · Kepala Toko: Budi Santoso" serta field username dan kata sandi, dan form berita acara belum tampil

#### Scenario: Kredensial Kepala Toko yang benar
- **WHEN** pada langkah otorisasi Shift 1 dimasukkan `budi.leader` / `demo123` lalu "Verifikasi" ditekan
- **THEN** form berita acara tampil dengan keterangan "Diperiksa oleh: Budi Santoso (Kepala Toko)"

#### Scenario: Batal di langkah otorisasi
- **WHEN** pengguna menekan "Batal" di langkah otorisasi
- **THEN** modal tertutup dan shift tidak ditutup

### Requirement: Penolakan kredensial otorisasi
Sistem SHALL menolak otorisasi jika kredensial yang dimasukkan bukan milik Kepala Toko aktif dari shift dan outlet yang ditutup, atau jika kata sandinya salah. Setelah penolakan, pengguna SHALL tetap berada di langkah otorisasi.

#### Scenario: Kepala Toko dari shift lain
- **WHEN** pada langkah otorisasi Shift 1 dimasukkan `rina.leader` / `demo123`
- **THEN** otorisasi ditolak dengan toast "Hanya Kepala Toko Shift 1 (Budi Santoso) yang dapat menutup shift ini"

#### Scenario: Akun bukan Kepala Toko
- **WHEN** pada langkah otorisasi dimasukkan `ayu.kasir` / `demo123` atau `admin.rbt` / `demo123`
- **THEN** otorisasi ditolak dengan toast "Akun ini bukan Kepala Toko"

#### Scenario: Kata sandi salah atau username tidak dikenal
- **WHEN** pada langkah otorisasi dimasukkan `budi.leader` dengan kata sandi selain `demo123`, atau username yang tidak terdaftar
- **THEN** otorisasi ditolak dengan toast "Kredensial Kepala Toko tidak valid"

#### Scenario: Field otorisasi kosong
- **WHEN** "Verifikasi" ditekan dengan username atau kata sandi kosong
- **THEN** toast "Username dan kata sandi Kepala Toko wajib diisi" tampil

#### Scenario: Akun Kepala Toko nonaktif
- **WHEN** akun Kepala Toko untuk shift yang ditutup berstatus Nonaktif di Master login, lalu kredensialnya dimasukkan
- **THEN** otorisasi ditolak dengan toast "Akun Kepala Toko tidak aktif"

### Requirement: Kepala Toko shift sendiri tidak perlu otorisasi ulang
Jika pengguna yang login adalah Kepala Toko dari shift yang ditutup, sistem SHALL melewati langkah otorisasi dan langsung menampilkan form berita acara dengan nama pengguna tersebut sebagai pemeriksa.

#### Scenario: Budi menutup Shift 1
- **WHEN** Budi Santoso (Kepala Toko, Shift 1) menekan "Tutup shift"
- **THEN** form berita acara langsung tampil dengan "Diperiksa oleh: Budi Santoso (Kepala Toko)" tanpa meminta kredensial

### Requirement: Berita acara wajib dilengkapi Kepala Toko
Form berita acara SHALL mewajibkan catatan BA dan centang konfirmasi "Saya sebagai Kepala Toko telah memeriksa transaksi dan histori cancel." sebelum paket data dapat dibuat.

#### Scenario: BA belum lengkap
- **WHEN** "Buat paket data" ditekan tanpa catatan BA atau tanpa centang konfirmasi
- **THEN** toast "Lengkapi catatan dan konfirmasi Kepala Toko" tampil dan paket tidak dibuat

#### Scenario: BA lengkap
- **WHEN** catatan BA diisi, konfirmasi dicentang, lalu "Buat paket data" ditekan
- **THEN** modal "Paket data siap dikirim" tampil

### Requirement: Paket data mencantumkan pemeriksa
Ringkasan paket data shift SHALL menampilkan nama Kepala Toko yang mengotorisasi tutup shift. Nama paket SHALL mengikuti nomor shift yang ditutup.

#### Scenario: Ringkasan paket setelah otorisasi Budi
- **WHEN** tutup Shift 1 diotorisasi oleh Budi Santoso dan BA dilengkapi
- **THEN** modal paket menampilkan "Diperiksa oleh: Budi Santoso" dan nama paket berbentuk `RBT_519A-S_<tanggal>_SHIFT1_<urutan>.zip`

#### Scenario: Ringkasan paket Shift 2
- **WHEN** Rina Pratiwi (Kepala Toko, Shift 2) login lalu menyelesaikan tutup shift
- **THEN** modal tutup shift berjudul "Tutup Shift 2", dan nama paket mengandung `SHIFT2`
