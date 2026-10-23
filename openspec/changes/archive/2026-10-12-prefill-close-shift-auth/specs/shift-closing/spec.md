# Spec Delta

## MODIFIED Requirements

### Requirement: Otorisasi Kepala Toko sebelum tutup shift
Saat Kasir menekan "Tutup shift", sistem SHALL selalu menampilkan langkah otorisasi Kepala Toko sebelum menampilkan form berita acara. Modal otorisasi SHALL menampilkan nama Kepala Toko yang berwenang untuk shift tersebut. Karena ini aplikasi demo, field username SHALL sudah terisi username Kepala Toko shift tersebut dan field kata sandi SHALL sudah terisi kata sandi demo, sehingga Kasir cukup menekan "Verifikasi". Kedua field SHALL tetap dapat diubah.

#### Scenario: Kasir membuka tutup shift
- **WHEN** Ayu Setiani (Kasir, Shift 1) menekan "Tutup shift"
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
