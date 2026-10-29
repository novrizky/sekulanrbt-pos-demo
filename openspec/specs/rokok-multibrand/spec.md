# rokok-multibrand Specification

## Purpose

Memungkinkan Kasir menjual rokok multi-merek sebagai barang dagangan, Administrator dan Kepala Toko memantau stoknya per merek di LPP barang dagangan, serta Kasir mencatat fee driver berupa beberapa merek rokok yang stoknya dipotong saat pembayaran.

## Requirements

### Requirement: Kategori menu Rokok multi-merek
Kasir SHALL melihat kategori menu "Rokok" yang berisi Rokok Brand A, Rokok Brand B, Rokok Brand C, Rokok Brand D, dan Rokok Brand E, masing-masing dengan harga sendiri. Kategori ini SHALL juga muncul di tab form "Buat order" dan di master menu Admin. Setiap merek SHALL dipilih sebagai item tersendiri, sehingga beberapa merek dapat berada di cart atau order yang sama sebagai baris terpisah.

#### Scenario: Menjual beberapa merek dalam satu transaksi
- **WHEN** Kasir membuka tab "Rokok", menambahkan Rokok Brand A ×2, lalu menambahkan Rokok Brand C ×1
- **THEN** cart menampilkan dua baris terpisah, "Rokok Brand A" ×2 Rp64.000 dan "Rokok Brand C" ×1 Rp25.000

#### Scenario: Rokok di form Buat order
- **WHEN** Administrator membuka form "Buat order" dan memilih tab "Rokok"
- **THEN** kartu Rokok Brand A sampai Rokok Brand E tampil dan bisa ditambahkan ke ringkasan order

### Requirement: Stok rokok di LPP barang dagangan
Administrator dan Kepala Toko SHALL melihat stok setiap merek rokok sebagai baris tersendiri di "LPP barang dagangan" dengan satuan bungkus. Merek dengan stok di bawah minimum SHALL ditandai seperti barang dagangan lain.

#### Scenario: Stok per merek tampil
- **WHEN** Administrator membuka Persediaan tab "LPP barang dagangan"
- **THEN** tabel menampilkan Rokok Brand A 24 bungkus, Rokok Brand B 18, Rokok Brand C 12, Rokok Brand D 6, dan Rokok Brand E 30, dengan Rokok Brand D ditandai stok rendah

### Requirement: Penjualan rokok memotong stok saat bayar
Saat Kasir mengonfirmasi pembayaran transaksi biasa, stok setiap merek rokok di cart SHALL berkurang sesuai qty-nya. Stok SHALL NOT menjadi minus (dipotong paling rendah sampai 0).

#### Scenario: Pemotongan stok penjualan
- **WHEN** Kasir membayar cart berisi Rokok Brand A ×2 dan Rokok Brand C ×1
- **THEN** toast "Pembayaran berhasil. LPP barang dagangan diperbarui." tampil, dan stok Rokok Brand A menjadi 22 serta Rokok Brand C menjadi 11

#### Scenario: Stok rokok tidak minus
- **WHEN** Kasir membayar Rokok Brand D ×8 saat stoknya 6 bungkus
- **THEN** stok Rokok Brand D menjadi 0, bukan minus

### Requirement: Fee driver rokok multi-merek di Kasir
Pada modal "Tambahkan fee driver", bila Kasir memilih bentuk "Rokok", modal SHALL menampilkan daftar semua merek rokok beserta stoknya dan input jumlah bungkus per merek. Kasir SHALL dapat mengisi lebih dari satu merek. Menyimpan tanpa satu pun jumlah lebih dari 0 SHALL ditolak. Fee rokok SHALL hanya tampil di baris "Fee driver" cart (bukan sebagai baris item) dan SHALL NOT mengurangi total pembayaran. Memilih bentuk "Uang tunai" SHALL mengosongkan fee rokok, dan sebaliknya.

#### Scenario: Menyimpan fee rokok beberapa merek
- **WHEN** Kasir pada transaksi biasa memilih "Rokok", mengisi Brand A 2 dan Brand C 1, lalu menekan "Simpan fee"
- **THEN** toast "Fee rokok dicatat: Brand A ×2, Brand C ×1. Stok dipotong saat pembayaran." tampil, baris fee cart berlabel "Fee driver (potong stok)" dan menampilkan "Brand A ×2, Brand C ×1", tidak ada baris item rokok baru, dan total pembayaran tidak berubah

#### Scenario: Fee rokok tanpa merek dipilih
- **WHEN** Kasir memilih "Rokok" dan menekan "Simpan fee" tanpa mengisi jumlah merek mana pun
- **THEN** toast "Pilih minimal satu merek rokok" tampil dan modal tetap terbuka

#### Scenario: Membuka ulang fee rokok
- **WHEN** Kasir sudah menyimpan fee rokok Brand A 2 lalu menekan "+ Tambahkan fee driver" lagi
- **THEN** modal terbuka dengan bentuk "Rokok" terpilih dan Brand A terisi 2

#### Scenario: Isian merek tetap saat berpindah bentuk fee
- **WHEN** Kasir mengisi Brand A 2, menekan "Uang tunai", lalu menekan "Rokok" lagi
- **THEN** Brand A masih terisi 2

### Requirement: Fee rokok Kasir memotong stok saat bayar
Pada transaksi Kasir biasa, stok merek rokok dalam fee driver SHALL dipotong saat pembayaran dikonfirmasi, bersama stok item cart, dengan lantai 0. Setelah pembayaran, membuat pesanan baru, memilih order, atau logout, fee rokok SHALL dikosongkan.

#### Scenario: Pemotongan stok fee rokok
- **WHEN** Kasir membayar cart berisi Paket Hemat 20K ×1 dengan fee rokok Brand B ×2
- **THEN** stok Rokok Brand B berkurang 2 menjadi 16 dan baris "Fee driver" hilang dari cart

#### Scenario: Fee rokok dikosongkan tanpa bayar
- **WHEN** Kasir menyimpan fee rokok lalu menekan "Pesanan baru"
- **THEN** baris "Fee driver" hilang dan stok rokok tidak berubah
