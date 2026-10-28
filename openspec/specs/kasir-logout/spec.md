# kasir-logout Specification

## Purpose

Mengatur cara Kasir keluar dari POS di tengah shift tanpa menutup shift: tombol Logout di view Kasir, konfirmasi, pengosongan keranjang, dan shift yang tetap terbuka untuk dilanjutkan saat Kasir yang sama login kembali.

## Requirements

### Requirement: Tombol Logout di view Kasir
Header view Kasir SHALL menampilkan tombol "Logout" di sebelah tombol "Tutup shift", sehingga Kasir dapat keluar dari sistem walaupun sidebar disembunyikan untuk role Kasir.

#### Scenario: Tombol tampil saat shift berjalan
- **WHEN** Ayu Setiani login sebagai Kasir dan memulai Shift 1
- **THEN** header view Kasir menampilkan tombol "Logout", "Tutup shift", dan "+ Pesanan baru"

### Requirement: Konfirmasi logout tanpa tutup shift
Menekan "Logout" di view Kasir SHALL membuka modal "Logout" berisi teks "Yakin logout tanpa tutup shift?" dengan tombol "Batal" dan "Logout". Logout SHALL hanya terjadi setelah Kasir menekan "Logout" di modal tersebut, tanpa memerlukan kata sandi Kepala Toko.

#### Scenario: Konfirmasi logout
- **WHEN** Kasir menekan "Logout" di header view Kasir, lalu menekan "Logout" di modal
- **THEN** modal tertutup, layar login tampil, dan toast "Anda telah keluar dari sistem" tampil

#### Scenario: Batal logout
- **WHEN** Kasir menekan "Logout" di header view Kasir, lalu menekan "Batal"
- **THEN** modal tertutup, view Kasir tetap aktif, dan penanda "Shift 1 berjalan • Modal awal Rp450.000" tetap tampil

### Requirement: Keranjang dikosongkan saat logout
Saat Kasir mengonfirmasi logout, sistem SHALL mengosongkan keranjang, fee driver, dan order terjadwal yang sedang dipilih tanpa memproses pembayaran. Bila keranjang berisi, modal konfirmasi SHALL menambahkan teks "Keranjang yang belum dibayar akan dikosongkan."

#### Scenario: Peringatan keranjang berisi
- **WHEN** keranjang berisi "Paket Spesial 30K" ×2 dan Kasir menekan "Logout"
- **THEN** modal menampilkan "Yakin logout tanpa tutup shift?" dan "Keranjang yang belum dibayar akan dikosongkan."

#### Scenario: Keranjang kosong setelah login ulang
- **WHEN** Kasir logout dengan keranjang berisi, lalu login kembali dengan `ayu.kasir` / `demo123`
- **THEN** keranjang kosong dan baris pelanggan kembali menampilkan "Pelanggan" "Umum"

#### Scenario: Keranjang kosong tanpa peringatan
- **WHEN** keranjang kosong dan Kasir menekan "Logout"
- **THEN** modal hanya menampilkan "Yakin logout tanpa tutup shift?" tanpa teks keranjang

### Requirement: Shift tetap terbuka setelah logout
Logout dari view Kasir SHALL mengakhiri sesi tanpa menutup shift. Shift beserta modal awalnya SHALL tetap tercatat sebagai shift terbuka milik username Kasir tersebut sampai shift ditutup lewat "Tutup shift" atau halaman di-reload.

#### Scenario: Shift tidak ditutup
- **WHEN** Ayu Setiani memulai Shift 1 dengan modal awal 450000 lalu logout dari view Kasir
- **THEN** tidak ada toast "Shift 1 berhasil ditutup", dan login berikutnya oleh `ayu.kasir` melanjutkan Shift 1

#### Scenario: Tutup shift mengakhiri shift terbuka
- **WHEN** Kasir login ulang, melanjutkan Shift 1, lalu menyelesaikan tutup shift
- **THEN** login berikutnya oleh `ayu.kasir` menampilkan layar "Mulai Shift"
