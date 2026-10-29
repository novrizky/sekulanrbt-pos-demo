# scheduled-orders Specification

## Purpose

Memungkinkan Administrator dan Kepala Toko mencatat order terjadwal dengan estimasi waktu, pembayaran bertahap, dan fee driver, lalu meneruskannya ke Kasir untuk ditambah item dan dilunasi sampai order dinyatakan selesai.

## Requirements

### Requirement: Halaman Pesanan untuk Administrator dan Kepala Toko
Menu sidebar "Pesanan" SHALL membuka daftar order dengan kolom ESTIMASI, NO, PELANGGAN, OUTLET, TOTAL, BAYAR, dan STATUS, diurutkan berdasarkan estimasi. Daftar SHALL bisa difilter berdasarkan status order (Semua, Open, Selesai) dan dicari berdasarkan nomor atau nama pelanggan.

#### Scenario: Membuka halaman Pesanan
- **WHEN** Administrator membuka menu "Pesanan"
- **THEN** daftar menampilkan order contoh, termasuk "ORD-0920-002" untuk PT Maju Jaya dengan status bayar "Sebagian" dan status order "Open"

#### Scenario: Filter Selesai
- **WHEN** pengguna memilih filter "Selesai"
- **THEN** hanya order dengan status order "Selesai" yang tampil

#### Scenario: Pencarian
- **WHEN** pengguna mengetik "maju" di kolom pencarian
- **THEN** hanya order dengan nama pelanggan atau nomor yang mengandung "maju" yang tampil

### Requirement: Kepala Toko dibatasi ke outlet miliknya
Kepala Toko SHALL hanya melihat order untuk outlet akunnya. Saat membuat order, field Outlet SHALL otomatis berisi outlet akunnya dan tidak dapat diubah. Administrator SHALL melihat order dari semua outlet, dapat memfilter berdasarkan outlet, dan dapat memilih outlet mana pun saat membuat order.

#### Scenario: Daftar order Kepala Toko
- **WHEN** Budi Santoso (Kepala Toko, Sekulan RBT 519A) membuka menu "Pesanan"
- **THEN** hanya order untuk outlet "Sekulan RBT 519A" yang tampil, dan filter outlet tidak tampil

#### Scenario: Form order Kepala Toko
- **WHEN** Kepala Toko membuka form "Buat order"
- **THEN** field Outlet berisi "Sekulan RBT 519A" dan tidak dapat diubah

#### Scenario: Administrator memilih outlet
- **WHEN** Administrator membuka form "Buat order"
- **THEN** field Outlet berupa pilihan berisi semua outlet di data outlet

### Requirement: Form Buat order memuat semua menu
Form "Buat order" SHALL menampilkan semua item dari semua kategori menu, termasuk item yang tidak punya catatan stok atau stoknya 0, tanpa batas qty. Mengklik kartu menu SHALL menambah qty item tersebut sebanyak 1 di ringkasan. Qty di ringkasan SHALL bisa diubah dengan tombol −/+ dan dengan mengetik angka, dan item dengan qty 0 SHALL dihapus.

#### Scenario: Item tanpa stok tetap tampil
- **WHEN** pengguna membuka kategori "Premium" di form order
- **THEN** keempat menu Premium tampil dan dapat dipilih meskipun tidak ada di LPP barang dagangan

#### Scenario: Mengetik qty
- **WHEN** pengguna menambah "Nasi Box 30K" lalu mengetik qty 30 di ringkasan
- **THEN** baris ringkasan menampilkan Rp900.000 dan subtotal diperbarui

### Requirement: Validasi field wajib order
Order SHALL wajib memiliki outlet, nama pelanggan, estimasi tanggal, estimasi jam, dan minimal satu item. Jika ada yang kosong, penyimpanan SHALL ditolak dengan toast, dan form tetap terbuka dengan isinya utuh.

#### Scenario: Nama pelanggan kosong
- **WHEN** pengguna menekan "Simpan order" tanpa mengisi nama pelanggan
- **THEN** toast "Nama pelanggan wajib diisi" tampil dan order tidak tersimpan

#### Scenario: Estimasi kosong
- **WHEN** pengguna menekan "Simpan order" tanpa tanggal atau jam estimasi
- **THEN** toast "Estimasi tanggal dan jam wajib diisi" tampil

#### Scenario: Tanpa item
- **WHEN** pengguna menekan "Simpan order" tanpa memilih item
- **THEN** toast "Pilih minimal satu item" tampil

#### Scenario: Estimasi tanggal lampau diperbolehkan
- **WHEN** pengguna mengisi estimasi 18 September 2026 untuk order yang sudah terjadi lalu menyimpan
- **THEN** order tersimpan

### Requirement: Pembayaran awal saat membuat order
Form order SHALL menyediakan pilihan pembayaran awal "Belum bayar", "Sebagian", atau "Lunas", dengan metode Tunai, QRIS, atau Kartu debit. Nominal "Sebagian" SHALL lebih dari 0 dan kurang dari subtotal. "Lunas" SHALL mencatat pembayaran sebesar subtotal. Setiap pembayaran SHALL tercatat beserta nominal, metode, pencatat, dan waktunya.

#### Scenario: DP sebagian
- **WHEN** pengguna membuat order Rp1.200.000 dengan pembayaran "Sebagian" Rp500.000 via QRIS
- **THEN** order tersimpan dengan status bayar "Sebagian", dibayar Rp500.000, dan sisa Rp700.000

#### Scenario: Nominal sebagian tidak valid
- **WHEN** pengguna memilih "Sebagian" dengan nominal 0 atau sama dengan/lebih dari subtotal lalu menyimpan
- **THEN** toast "Nominal sebagian harus lebih dari 0 dan kurang dari total" tampil dan order tidak tersimpan

#### Scenario: Belum bayar
- **WHEN** pengguna membuat order dengan pilihan "Belum bayar"
- **THEN** order tersimpan dengan status bayar "Belum bayar" dan tanpa riwayat pembayaran

### Requirement: Status bayar dihitung dari total dan pembayaran
Status bayar SHALL dihitung dari total item dikurangi jumlah pembayaran: "Belum bayar" bila belum ada pembayaran dan total > 0, "Sebagian" bila sisa > 0, "Lunas" bila sisa = 0, dan "Lebih bayar" bila pembayaran melebihi total. Status bayar SHALL tampil sebagai pill di daftar order, detail order, modal pilih order, dan header cart.

#### Scenario: Lunas menjadi Sebagian setelah item ditambah
- **WHEN** Kasir menambah item ke order yang berstatus "Lunas" lalu menyimpannya
- **THEN** status bayar order berubah menjadi "Sebagian" dengan sisa sebesar nilai item baru

#### Scenario: Lebih bayar ditampilkan
- **WHEN** total order menjadi lebih kecil dari jumlah pembayaran karena ada item yang dibatalkan
- **THEN** status bayar menjadi "Lebih bayar" dan baris "Lebih bayar" menampilkan selisihnya, tanpa alur pengembalian dana

### Requirement: Fee driver sebagai biaya keluar
Order SHALL dapat menyimpan fee driver opsional, berupa nominal tunai atau rokok. Fee rokok SHALL berupa daftar satu atau lebih merek rokok beserta jumlah bungkusnya, dipilih dari daftar merek kategori Rokok di form "Buat order" maupun di modal fee Kasir. Fee driver SHALL tampil terpisah sebagai biaya keluar, dengan fee rokok ditulis per merek (contoh "Brand A ×2, Brand C ×1"), dan SHALL NOT mengurangi total, dibayar, maupun sisa order.

#### Scenario: Order dengan fee tunai
- **WHEN** pengguna membuat order Rp1.200.000 dengan fee driver tunai Rp50.000 dan pembayaran "Lunas"
- **THEN** pembayaran tercatat Rp1.200.000, status bayar "Lunas", dan detail order menampilkan "Fee driver Rp50.000" terpisah dari total

#### Scenario: Order dengan fee rokok beberapa merek
- **WHEN** pengguna mencentang "Ada fee driver", memilih bentuk "Rokok", mengisi Brand A 2 dan Brand C 1, lalu menyimpan order
- **THEN** order tersimpan dan detail order menampilkan fee driver "Brand A ×2, Brand C ×1" terpisah dari total

#### Scenario: Fee rokok tanpa merek
- **WHEN** pengguna memilih bentuk fee "Rokok" tanpa mengisi jumlah merek mana pun lalu menekan simpan
- **THEN** toast "Pilih minimal satu merek rokok" tampil dan order tidak tersimpan

#### Scenario: Order tanpa fee
- **WHEN** pengguna membuat order tanpa mencentang "Ada fee driver"
- **THEN** order tersimpan tanpa fee driver

### Requirement: Status order ditentukan Administrator dan Kepala Toko
Order SHALL berstatus "Open" atau "Selesai". Status awal dipilih di form, dengan default "Open". Hanya Administrator dan Kepala Toko yang SHALL dapat mengubah order Open menjadi Selesai lewat "Selesaikan order" di detail order, setelah konfirmasi. Order Selesai SHALL boleh belum lunas dan SHALL NOT dapat dibuka kembali.

#### Scenario: Membuat order langsung Selesai
- **WHEN** pengguna membuat order dengan status "Selesai"
- **THEN** order tersimpan dengan status "Selesai", tidak muncul di Kasir, dan toast "Order tersimpan dan stok dipotong" tampil

#### Scenario: Menyelesaikan order Open
- **WHEN** Administrator membuka detail "ORD-0920-003" lalu menekan "Selesaikan order" dan mengonfirmasi
- **THEN** status order menjadi "Selesai" dan toast "Order selesai. LPP barang dagangan diperbarui." tampil

#### Scenario: Selesai walau belum lunas
- **WHEN** order dengan sisa Rp350.000 diselesaikan
- **THEN** order berstatus "Selesai" dengan status bayar tetap "Belum bayar" dan sisa Rp350.000

### Requirement: Stok dipotong saat order Selesai
Stok barang dagangan SHALL dipotong sesuai item order dan sesuai merek rokok pada fee driver rokok tepat ketika order menjadi Selesai, baik saat dibuat langsung Selesai maupun lewat "Selesaikan order". Item tanpa catatan stok SHALL dilewati, dan stok SHALL NOT menjadi minus (dipotong paling rendah sampai 0). Pembayaran order, baik oleh Admin maupun Kasir, SHALL NOT memotong stok item maupun stok fee rokok.

#### Scenario: Pemotongan stok
- **WHEN** order berisi Nasi Box 30K ×30 dan Paket Keluarga 35K ×10 diselesaikan, dengan stok Nasi Box 30K 48 box
- **THEN** stok Nasi Box 30K di LPP barang dagangan menjadi 18, dan Paket Keluarga 35K yang tidak punya catatan stok dilewati tanpa error

#### Scenario: Pemotongan stok fee rokok
- **WHEN** order dengan fee rokok Brand A ×2 dan Brand C ×1 diselesaikan, dengan stok Rokok Brand A 24 dan Rokok Brand C 12
- **THEN** stok Rokok Brand A menjadi 22 dan Rokok Brand C menjadi 11

#### Scenario: Stok tidak cukup
- **WHEN** order berisi item dengan qty melebihi stoknya diselesaikan
- **THEN** stok item tersebut menjadi 0, bukan minus

#### Scenario: Pembayaran tidak memotong stok
- **WHEN** Kasir menerima pelunasan order Open yang punya fee rokok
- **THEN** LPP barang dagangan tidak berubah

### Requirement: Mencatat pembayaran dari detail order
Detail order SHALL menampilkan item, total, riwayat pembayaran (nominal, metode, pencatat, waktu), dibayar, sisa atau lebih bayar, dan fee driver. Administrator dan Kepala Toko SHALL dapat mencatat pembayaran pada order Open maupun Selesai selama sisa > 0, dengan nominal lebih dari 0 dan paling besar sama dengan sisa.

#### Scenario: Pelunasan order Selesai
- **WHEN** Administrator mencatat pembayaran Rp350.000 Tunai pada order Selesai dengan sisa Rp350.000
- **THEN** riwayat pembayaran bertambah, status bayar menjadi "Lunas", dan toast "Pembayaran tercatat" tampil

#### Scenario: Nominal melebihi sisa
- **WHEN** pengguna memasukkan nominal yang lebih besar dari sisa
- **THEN** toast "Nominal melebihi sisa tagihan" tampil dan pembayaran tidak tercatat

#### Scenario: Order sudah lunas
- **WHEN** pengguna membuka detail order yang sisanya 0 atau lebih bayar
- **THEN** tombol "Catat pembayaran" tidak tersedia

### Requirement: Kasir memilih order lewat baris Pelanggan
Di view Kasir, tombol "Ubah" pada baris Pelanggan SHALL membuka modal "Pilih pelanggan / order" berisi pilihan "Umum" dan semua order Open untuk outlet kasir, diurutkan berdasarkan estimasi, lengkap dengan jam estimasi, nomor, pelanggan, total, dan pill status bayar. Order lunas dan belum lunas SHALL sama-sama tampil.

#### Scenario: Membuka daftar order
- **WHEN** Ayu Setiani (Kasir, Sekulan RBT 519A) menekan "Ubah" di baris Pelanggan
- **THEN** modal menampilkan "Umum" dan order Open outlet Sekulan RBT 519A, termasuk "ORD-0920-001" (Lunas) dan "ORD-0920-002" (Sebagian), tanpa order outlet lain dan tanpa order Selesai

#### Scenario: Memilih order
- **WHEN** Kasir memilih "ORD-0920-002" lalu menekan "Pilih"
- **THEN** header cart menampilkan nomor "ORD-0920-002", nama "PT Maju Jaya", estimasi, dan pill "Sebagian", dan keranjang berisi item tersimpan order tersebut

#### Scenario: Kembali ke Umum
- **WHEN** Kasir memilih "Umum", atau menekan "+ Pesanan baru", saat sebuah order terpilih
- **THEN** keranjang kosong, baris Pelanggan menampilkan "Umum", dan item baru yang belum disimpan ke order dibuang

### Requirement: Kasir menambah item ke order
Saat order terpilih, item yang ditambahkan dari grid menu SHALL tampil sebagai item baru di bawah item tersimpan. Totals SHALL menampilkan Total, Dibayar, dan Sisa atau Lebih bayar. Bila sisa ≤ 0, tombol bayar SHALL nonaktif dan berbunyi "Lunas" atau "Lebih bayar".

#### Scenario: Sisa naik saat item ditambah
- **WHEN** Kasir memilih "ORD-0920-002" (sisa Rp700.000) lalu menambah Es jeruk ×1
- **THEN** item Es jeruk tampil sebagai item baru dan Sisa menjadi Rp708.000

#### Scenario: Order lunas tanpa perubahan
- **WHEN** Kasir memilih "ORD-0920-001" yang sudah lunas tanpa menambah item
- **THEN** tombol bayar nonaktif dan berbunyi "Lunas"

#### Scenario: Catatan stok di mode order
- **WHEN** sebuah order terpilih di cart
- **THEN** catatan di bawah tombol bayar berbunyi "Stok dipotong saat order diselesaikan Admin/Kepala Toko."

### Requirement: Kasir menerima pembayaran order
Bila sisa > 0, tombol bayar SHALL berbunyi "Terima pembayaran" dengan nominal sisa dan membuka modal nominal (default sisa, 0 sampai sisa) beserta metode. Konfirmasi SHALL menyimpan item baru ke order, mencatat pembayaran bila nominal > 0, lalu mengembalikan cart ke "Umum".

#### Scenario: Menambah item lalu melunasi
- **WHEN** Kasir memilih "ORD-0920-002" (sisa Rp700.000), menambah Es jeruk ×5 (Rp40.000), menekan "Terima pembayaran", lalu mengonfirmasi Rp740.000 Tunai
- **THEN** order menyimpan Es jeruk ×5, status bayar menjadi "Lunas", toast "Pembayaran order tercatat" tampil, dan keranjang kembali ke "Umum"

#### Scenario: Pembayaran sebagian oleh Kasir
- **WHEN** Kasir mengonfirmasi Rp200.000 untuk order dengan sisa Rp700.000
- **THEN** status bayar tetap "Sebagian" dengan sisa Rp500.000

#### Scenario: Simpan item tanpa pembayaran
- **WHEN** Kasir menambah item ke order lalu mengonfirmasi pembayaran dengan nominal 0
- **THEN** item baru tersimpan ke order, tidak ada pembayaran tercatat, dan toast "Order diperbarui tanpa pembayaran" tampil

#### Scenario: Nominal melebihi sisa di Kasir
- **WHEN** Kasir memasukkan nominal lebih besar dari sisa
- **THEN** toast "Nominal melebihi sisa tagihan" tampil dan modal tetap terbuka

### Requirement: Fee driver order di Kasir
Saat order terpilih, bila order sudah punya fee driver, cart SHALL menampilkan fee tersebut sebagai info "(dari order)" dan tombol "+ Tambahkan fee driver" SHALL tidak tersedia. Bila order belum punya fee, Kasir SHALL dapat mengisinya lewat modal fee yang sama. Fee langsung tersimpan ke order dan terkunci. Di mode order, fee SHALL NOT mengurangi total maupun sisa.

#### Scenario: Fee sudah diisi admin
- **WHEN** Kasir memilih "ORD-0920-002" yang punya fee tunai Rp50.000
- **THEN** cart menampilkan "Fee driver Rp50.000 (dari order)", tombol tambah fee tidak tampil, dan sisa tetap Rp700.000

#### Scenario: Kasir mengisi fee yang kosong
- **WHEN** Kasir memilih "ORD-0920-003" yang tidak punya fee lalu menyimpan fee tunai Rp20.000
- **THEN** fee tersimpan ke order, tampil di detail order Admin, dan saat order dipilih lagi tombol tambah fee tidak tersedia
