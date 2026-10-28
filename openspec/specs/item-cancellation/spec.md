# item-cancellation Specification

## Purpose
Mengatur pembatalan item di keranjang POS oleh Kasir: alasan dan catatan pembatalan, serta pencatatannya ke histori pembatalan yang diperiksa Kepala Toko saat berita acara tutup shift.

## Requirements

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

### Requirement: Pembatalan item tersimpan di order memerlukan otorisasi Kepala Toko
Saat sebuah order terpilih di Kasir, item yang sudah tersimpan di order SHALL NOT memiliki tombol −/+. "Batalkan" pada item tersebut SHALL membuka modal "Batalkan item?" dengan alasan, catatan, jumlah yang dibatalkan (1 sampai qty tersimpan), serta username dan kata sandi Kepala Toko. Pembatalan SHALL diterima hanya dengan kredensial Kepala Toko aktif untuk outlet dan shift kasir yang sedang berjalan. Aturan catatan untuk alasan "Lainnya" tetap berlaku.

#### Scenario: Membatalkan sebagian qty dengan otorisasi
- **WHEN** Kasir memilih "ORD-0920-002", membatalkan 5 dari Nasi Box 30K ×30 dengan alasan "Perubahan pesanan pelanggan" dan kredensial `budi.leader` / `demo123` di Shift 1
- **THEN** item order menjadi Nasi Box 30K ×25, total order berkurang Rp150.000, satu baris histori pembatalan bertambah, dan toast "Cancel tercatat. Peringatan dikirim ke owner." tampil

#### Scenario: Kredensial tidak valid
- **WHEN** Kasir mengisi kata sandi selain `demo123`
- **THEN** toast "Kredensial Kepala Toko tidak valid" tampil, modal tetap terbuka, dan item order tidak berubah

#### Scenario: Bukan Kepala Toko shift aktif
- **WHEN** Kasir Shift 1 mengisi kredensial `rina.leader` / `demo123` (Kepala Toko Shift 2)
- **THEN** toast "Hanya Kepala Toko Shift 1 (Budi Santoso) yang dapat menyetujui pembatalan ini" tampil dan item order tidak berubah

#### Scenario: Pembatalan menimbulkan lebih bayar
- **WHEN** Kasir membatalkan item tersimpan dari order yang sudah lunas
- **THEN** status bayar order menjadi "Lebih bayar" dan cart menampilkan baris "Lebih bayar" dengan selisihnya

#### Scenario: Item baru di mode order tidak perlu otorisasi
- **WHEN** Kasir membatalkan item yang baru ditambahkan ke order dan belum disimpan
- **THEN** modal pembatalan biasa (tanpa kredensial Kepala Toko) tampil dan pembatalan tercatat seperti transaksi Umum

### Requirement: Qty ditentukan lewat modal saat Kasir memilih menu
Saat Kasir mengklik kartu menu, sistem SHALL membuka modal "Tambah ke pesanan" yang menampilkan nama menu, deskripsi menu, harga, input jumlah dengan tombol − dan +, serta tombol "Batal" dan "Tambahkan". Menu SHALL masuk ke keranjang hanya setelah "Tambahkan" ditekan; "Batal" SHALL menutup modal tanpa mengubah keranjang. Bila menu yang sama dan belum tersimpan di order sudah ada di keranjang, jumlah dari modal SHALL digabung ke baris tersebut dengan total tidak melebihi 999.

#### Scenario: Memilih menu dan mengisi qty dengan tombol
- **WHEN** Kasir mengklik kartu "Nasi Box 30K", menekan + dua kali sehingga jumlah menjadi 3, lalu menekan "Tambahkan"
- **THEN** keranjang berisi Nasi Box 30K ×3, modal tertutup, dan toast "Nasi Box 30K × 3 ditambahkan" tampil

#### Scenario: Batal menutup modal
- **WHEN** Kasir menekan "Batal" di modal
- **THEN** modal tertutup dan keranjang tidak berubah

#### Scenario: Menu sama digabung
- **WHEN** keranjang sudah berisi Nasi Box 30K ×3 (belum tersimpan di order) dan Kasir menambahkan Nasi Box 30K dengan jumlah 2 lewat modal
- **THEN** keranjang berisi satu baris Nasi Box 30K ×5

### Requirement: Input jumlah di modal hanya menerima angka 1 sampai 999
Input jumlah di modal "Tambah ke pesanan" SHALL dapat diketik langsung, hanya menerima angka 0-9 dan maksimal 3 digit. Karakter selain angka, termasuk hasil paste, SHALL diabaikan tanpa alert maupun toast. Saat fokus keluar, nilai kosong atau 0 SHALL kembali menjadi 1. Tombol − SHALL berhenti di 1 dan tombol + SHALL berhenti di 999.

#### Scenario: Mengisi qty dengan mengetik
- **WHEN** Kasir mengklik kartu menu, mengosongkan input jumlah, mengetik `12`, lalu menekan "Tambahkan"
- **THEN** menu masuk ke keranjang dengan jumlah 12

#### Scenario: Karakter non-angka diabaikan
- **WHEN** Kasir mengetik atau menempel `a-5.x` di input jumlah
- **THEN** hanya digit yang tersisa (`5`), tidak ada alert atau toast yang tampil

#### Scenario: Maksimal 3 digit
- **WHEN** Kasir mengetik `1234` di input jumlah
- **THEN** input hanya menampilkan `123`

#### Scenario: Kosong atau 0 kembali ke 1
- **WHEN** Kasir mengosongkan input jumlah atau mengisi `0`, lalu fokus keluar dari input
- **THEN** input menampilkan `1` tanpa pesan apa pun

#### Scenario: Batas tombol
- **WHEN** jumlah bernilai 1 dan Kasir menekan −, atau jumlah bernilai 999 dan Kasir menekan +
- **THEN** jumlah tidak berubah

### Requirement: Qty di keranjang tidak dapat dikurangi selain lewat "Batalkan"
Setiap baris keranjang di Kasir, baik item baru maupun item tersimpan dari order, SHALL menampilkan jumlah sebagai `× qty` dan tombol "Batalkan" saja, tanpa tombol − maupun +. Satu-satunya cara membuang atau mengurangi barang dari keranjang SHALL "Batalkan", yang membuka modal "Batalkan item?" dengan alasan wajib, tercatat di histori pembatalan, dan memicu peringatan owner. Menambah jumlah barang SHALL dilakukan dengan mengklik kartu menu lagi dan mengisi modal "Tambah ke pesanan".

#### Scenario: Baris keranjang tanpa tombol −/+
- **WHEN** Kasir menambahkan Nasi Box 30K ×3 ke keranjang
- **THEN** baris keranjang menampilkan "× 3" dan tombol "Batalkan", tanpa tombol − atau +

#### Scenario: Barang tidak bisa dibuang tanpa jejak
- **WHEN** Kasir ingin menghapus baris dari keranjang
- **THEN** satu-satunya cara adalah "Batalkan", yang meminta alasan dan mencatat satu baris di histori pembatalan

#### Scenario: Menambah qty setelah masuk keranjang
- **WHEN** Kasir mengklik kartu menu yang sama lagi dan mengisi jumlah di modal
- **THEN** jumlah baris bertambah sesuai isi modal tanpa tombol + di keranjang
