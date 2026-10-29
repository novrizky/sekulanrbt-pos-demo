## ADDED Requirements

### Requirement: Modal ringkasan setelah pembayaran Kasir
Setelah Kasir mengonfirmasi pembayaran tanpa order aktif, proses yang ada (potong stok, kosongkan keranjang, toast) SHALL tetap berjalan, lalu modal "Pembayaran berhasil" SHALL terbuka berisi nomor transaksi, total yang sama dengan modal "Pembayaran", metode, serta tombol "Selesai" dan "Cetak struk". Modal MUST NOT memuat input uang diterima maupun kembalian.

#### Scenario: Modal sukses muncul setelah bayar tunai
- **WHEN** Kasir menambah Paket Favorit 25K ×3 dan Es teh manis ×1, menekan "Bayar sekarang", memilih "Tunai", lalu menekan "Konfirmasi pembayaran"
- **THEN** toast "Pembayaran berhasil. LPP barang dagangan diperbarui." tampil, keranjang kosong, dan modal "Pembayaran berhasil" menampilkan "TRX-0920-1088", "Rp81.000", "Tunai", serta tombol "Selesai" dan "Cetak struk"

#### Scenario: Total modal sukses mengikuti fee driver tunai
- **WHEN** keranjang berisi item senilai Rp81.000 dengan fee driver tunai Rp5.000, lalu pembayaran dikonfirmasi
- **THEN** modal "Pembayaran berhasil" menampilkan total "Rp76.000", sama dengan total di modal "Pembayaran"

#### Scenario: Selesai menutup modal
- **WHEN** Kasir menekan "Selesai" di modal "Pembayaran berhasil"
- **THEN** modal tertutup dan Kasir kembali ke keranjang kosong

### Requirement: Modal ringkasan setelah pembayaran pesanan
Saat pembayaran order aktif dikonfirmasi dengan nominal lebih dari 0, pencatatan dan toast yang ada SHALL tetap berjalan, lalu modal "Pembayaran berhasil" SHALL terbuka berisi nomor transaksi, ID order dan pelanggan, nominal dibayar sekarang, metode, dan sisa tagihan. Bila nominal 0, modal sukses MUST NOT muncul dan nomor transaksi MUST NOT diterbitkan.

#### Scenario: Pembayaran sebagian pesanan
- **WHEN** Kasir memilih "ORD-0920-002" (sisa Rp700.000), menekan "Terima pembayaran", lalu mengonfirmasi Rp200.000 QRIS
- **THEN** toast "Pembayaran order tercatat" tampil dan modal "Pembayaran berhasil" menampilkan "ORD-0920-002 • PT Maju Jaya", dibayar "Rp200.000" (QRIS), dan "Sisa tagihan Rp500.000"

#### Scenario: Nominal 0 tidak memunculkan modal sukses
- **WHEN** Kasir menambah item ke order lalu mengonfirmasi pembayaran dengan nominal 0
- **THEN** toast "Order diperbarui tanpa pembayaran" tampil, modal tertutup, dan modal "Pembayaran berhasil" tidak muncul

### Requirement: Nomor transaksi berurutan
Setiap pembayaran Kasir yang menghasilkan modal sukses SHALL menerima satu nomor transaksi berformat `TRX-0920-<urutan>`, dimulai dari 1088 dan naik satu per transaksi. Nomor ini MUST diterbitkan saat konfirmasi dan MUST tetap sama saat struk dicetak ulang.

#### Scenario: Dua transaksi berturut-turut
- **WHEN** Kasir menyelesaikan dua pembayaran berturut-turut setelah halaman dimuat
- **THEN** modal sukses pertama menampilkan "TRX-0920-1088" dan yang kedua "TRX-0920-1089"

### Requirement: Cetak struk roll 58 mm
Tombol "Cetak struk" SHALL membuka dialog cetak browser yang hanya berisi struk untuk transaksi tersebut. Struk MUST berlebar 58 mm dengan tinggi mengikuti isi (kertas roll thermal), dan MUST NOT memuat sidebar, modal, atau bagian aplikasi lain. Modal "Pembayaran berhasil" MUST tetap terbuka setelah mencetak agar struk bisa dicetak ulang. Cetak Laporan dan cetak PO MUST tetap memakai ukuran kertas sebelumnya.

#### Scenario: Pratinjau cetak hanya berisi struk
- **WHEN** Kasir menekan "Cetak struk" di modal "Pembayaran berhasil"
- **THEN** pratinjau cetak menampilkan satu struk selebar 58 mm tanpa elemen aplikasi lain, dan setelah dialog ditutup modal "Pembayaran berhasil" masih terbuka

#### Scenario: Cetak ulang memakai nomor yang sama
- **WHEN** Kasir menekan "Cetak struk" dua kali untuk transaksi "TRX-0920-1088"
- **THEN** kedua struk menampilkan nomor "TRX-0920-1088"

#### Scenario: Cetak PO tidak terpengaruh
- **WHEN** setelah mencetak struk, Administrator mencetak PO dari Permintaan barang
- **THEN** pratinjau PO tampil dengan ukuran kertas dan tata letak seperti sebelumnya

### Requirement: Isi struk penjualan Kasir
Struk penjualan Kasir biasa SHALL memuat nama outlet "SEKULAN RBT 519A", nomor transaksi, tanggal dan jam, nama kasir, daftar item (nama, `qty x harga`, subtotal baris), TOTAL, metode pembayaran, dan "Terima kasih". TOTAL MUST sama dengan jumlah subtotal item. Fee driver (tunai maupun rokok) MUST NOT tercetak di struk.

#### Scenario: Struk tanpa fee driver
- **WHEN** Kasir mencetak struk transaksi Paket Favorit 25K ×3 dan Es teh manis ×1 yang memakai fee driver tunai Rp5.000
- **THEN** struk menampilkan "3 x 25.000" dengan "75.000", "1 x 6.000" dengan "6.000", TOTAL "81.000", dan tidak ada baris fee driver

### Requirement: Isi struk pembayaran pesanan
Struk pembayaran pesanan SHALL memuat header yang sama dengan struk Kasir ditambah ID order dan nama pelanggan, daftar item order setelah item baru disimpan, lalu baris "Total pesanan", "Sudah dibayar" (pembayaran sebelum transaksi ini), "Bayar sekarang" beserta metodenya, dan "Sisa tagihan". Fee driver MUST NOT tercetak.

#### Scenario: Struk pembayaran sebagian
- **WHEN** Kasir mencetak struk setelah membayar Rp200.000 QRIS untuk "ORD-0920-002" dengan sisa sebelumnya Rp700.000
- **THEN** struk menampilkan "ORD-0920-002 • PT Maju Jaya", "Bayar sekarang 200.000 (QRIS)", "Sisa tagihan 500.000", dan "Sudah dibayar" sama dengan Total pesanan dikurangi 700.000
