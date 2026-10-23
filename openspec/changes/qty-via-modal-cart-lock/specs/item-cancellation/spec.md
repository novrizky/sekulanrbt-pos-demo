## ADDED Requirements

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
