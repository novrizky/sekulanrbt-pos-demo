# Spec Delta

## Purpose

Mengatur pembatalan item di keranjang POS oleh Kasir: alasan dan catatan pembatalan, serta pencatatannya ke histori pembatalan yang diperiksa Kepala Toko saat berita acara tutup shift.

## ADDED Requirements

### Requirement: Catatan wajib untuk alasan "Lainnya"
Saat Kasir membatalkan item dengan alasan "Lainnya", "Catatan kasir" SHALL wajib diisi (tidak boleh kosong atau hanya berisi spasi). Jika catatan kosong, sistem SHALL menolak pembatalan dengan toast "Catatan kasir wajib diisi untuk alasan Lainnya", modal "Batalkan item?" SHALL tetap terbuka, dan item SHALL tetap ada di keranjang.

#### Scenario: Alasan "Lainnya" tanpa catatan
- **WHEN** Kasir memilih alasan "Lainnya", mengosongkan "Catatan kasir", lalu menekan "Batalkan & beri tahu owner"
- **THEN** toast "Catatan kasir wajib diisi untuk alasan Lainnya" tampil
- **AND** modal "Batalkan item?" tetap terbuka, item tetap ada di keranjang, dan histori pembatalan tidak bertambah

#### Scenario: Alasan "Lainnya" dengan catatan hanya spasi
- **WHEN** Kasir memilih alasan "Lainnya", mengisi "Catatan kasir" dengan spasi saja, lalu menekan "Batalkan & beri tahu owner"
- **THEN** pembatalan ditolak dengan toast "Catatan kasir wajib diisi untuk alasan Lainnya"

#### Scenario: Alasan "Lainnya" dengan catatan
- **WHEN** Kasir memilih alasan "Lainnya", mengisi "Catatan kasir" dengan "Pelanggan pulang", lalu menekan "Batalkan & beri tahu owner"
- **THEN** item dihapus dari keranjang, modal tertutup, dan toast "Cancel tercatat. Peringatan dikirim ke owner." tampil

### Requirement: Catatan opsional untuk alasan lain
Untuk alasan selain "Lainnya", "Catatan kasir" SHALL tetap opsional.

#### Scenario: Alasan baku tanpa catatan
- **WHEN** Kasir memilih alasan "Salah pilih menu", mengosongkan "Catatan kasir", lalu menekan "Batalkan & beri tahu owner"
- **THEN** item dihapus dari keranjang dan toast "Cancel tercatat. Peringatan dikirim ke owner." tampil

### Requirement: Catatan tercatat di histori pembatalan
Setiap pembatalan SHALL menambah satu baris di histori pembatalan (Laporan). Kolom ALASAN SHALL berisi alasan yang dipilih. Jika catatan kasir diisi, kolom ALASAN SHALL berisi `<alasan> — <catatan>` dengan catatan yang sudah dipangkas spasinya di awal dan akhir.

#### Scenario: Catatan muncul di histori
- **WHEN** Kasir membatalkan item dengan alasan "Lainnya" dan catatan "Pelanggan pulang"
- **THEN** baris teratas histori pembatalan memiliki ALASAN "Lainnya — Pelanggan pulang"

#### Scenario: Tanpa catatan
- **WHEN** Kasir membatalkan item dengan alasan "Stok tidak tersedia" tanpa catatan
- **THEN** baris teratas histori pembatalan memiliki ALASAN "Stok tidak tersedia"
