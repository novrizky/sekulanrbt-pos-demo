# Spec Delta

## MODIFIED Requirements

### Requirement: Otorisasi Kepala Toko sebelum tutup shift
Saat Kasir menekan "Tutup shift", sistem SHALL selalu meminta username dan kata sandi Kepala Toko sebelum menampilkan form berita acara. Modal otorisasi SHALL menampilkan nama Kepala Toko yang berwenang untuk shift tersebut.

#### Scenario: Kasir membuka tutup shift
- **WHEN** Ayu Setiani (Kasir, Shift 1) menekan "Tutup shift"
- **THEN** langkah otorisasi tampil dengan keterangan "Shift 1 · Kepala Toko: Budi Santoso" serta field username dan kata sandi, dan form berita acara belum tampil

#### Scenario: Kredensial Kepala Toko yang benar
- **WHEN** pada langkah otorisasi Shift 1 dimasukkan `budi.leader` / `demo123` lalu "Verifikasi" ditekan
- **THEN** form berita acara tampil dengan keterangan "Diperiksa oleh: Budi Santoso (Kepala Toko)"

#### Scenario: Batal di langkah otorisasi
- **WHEN** pengguna menekan "Batal" di langkah otorisasi
- **THEN** modal tertutup dan shift tidak ditutup

## REMOVED Requirements

### Requirement: Kepala Toko shift sendiri tidak perlu otorisasi ulang
**Reason**: Kepala Toko tidak lagi dapat membuka view Kasir, tempat tombol "Tutup shift" berada. Tutup shift hanya dilakukan dari sesi Kasir, dan Kepala Toko memverifikasi lewat modal otorisasi.
**Migration**: Kepala Toko memasukkan username dan kata sandinya di modal otorisasi yang tampil saat Kasir menekan "Tutup shift".
