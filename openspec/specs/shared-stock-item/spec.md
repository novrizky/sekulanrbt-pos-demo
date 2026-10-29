# shared-stock-item Specification

## Purpose

Memungkinkan Administrator dan Kepala Toko mengelola Rokok Brand A–E dan Air mineral sebagai item bersama dengan satu stok yang tampil di LPP bahan baku dan LPP barang dagangan: di-restock dari sisi bahan baku (stok masuk dan PO), dipotong oleh penjualan Kasir, order Selesai, dan fee rokok, serta dikecualikan dari produksi.

## Requirements

### Requirement: Item bersama tampil di kedua LPP dengan satu stok
Rokok Brand A–E dan Air mineral SHALL menjadi item bersama yang tampil di tabel stok submenu "Stok bahan baku" dan submenu "Stok barang dagangan" bagi Administrator dan Kepala Toko. Kedua halaman SHALL menampilkan STOK, MINIMUM, BIAYA / UNIT, dan STATUS yang sama untuk item yang sama, dan nama item SHALL diberi badge "Tersambung". Item lain SHALL NOT diberi badge tersebut. Air mineral SHALL memakai satuan botol, dan rokok memakai satuan bungkus. Penyebutan "tab LPP bahan baku" dan "tab LPP barang dagangan" di requirement lain berarti submenu "Stok bahan baku" dan "Stok barang dagangan".

#### Scenario: Item bersama di tab bahan baku
- **WHEN** Administrator membuka submenu "Stok bahan baku" dan memilih Jenis item "Siap jual" (tanpa filter, sebagian item bersama berada di halaman 2 karena tabel dibatasi 10 baris)
- **THEN** tabel menampilkan Rokok Brand A–E dan Air mineral dengan badge "Tersambung", misalnya Rokok Brand A "24 bungkus" dan Air mineral "48 botol"

#### Scenario: Item bersama di tab barang dagangan
- **WHEN** Administrator berpindah ke submenu "Stok barang dagangan" (tanpa filter, Air mineral berada di halaman 2; dengan Jenis item "Siap jual" keenam item bersama tampil)
- **THEN** Rokok Brand A–E dan Air mineral tampil dengan badge "Tersambung" dan stok yang sama seperti di Stok bahan baku, sedangkan Paket Favorit 25K tampil tanpa badge

### Requirement: Restock dari sisi bahan baku mengikuti ke barang dagangan
Administrator dan Kepala Toko SHALL dapat me-restock item bersama lewat "+ Stok masuk" di tab LPP bahan baku dan lewat form "Buat permintaan barang". Penerimaan stok masuk maupun penerimaan barang dari PO SHALL menambah stok dan memperbarui biaya per unit item bersama, dan perubahan itu SHALL langsung terlihat di tab LPP barang dagangan. Tab LPP barang dagangan SHALL NOT mendapat tombol stok masuk tambahan.

#### Scenario: Stok masuk tanpa PO
- **WHEN** Administrator menekan "+ Stok masuk", memilih Rokok Brand D (stok 6), mengisi jumlah 12 dan harga 32500, lalu menyimpan
- **THEN** muncul toast "12 bungkus Rokok Brand D berhasil diterima", dan di tab "LPP barang dagangan" Rokok Brand D menjadi "18 bungkus" dengan BIAYA / UNIT Rp32.500 dan status "Aman"

#### Scenario: Item bersama di form permintaan
- **WHEN** Kepala Toko membuka "+ Buat permintaan"
- **THEN** Rokok Brand A–E dan Air mineral ada di tabel bahan baku, dan Rokok Brand D yang stoknya di bawah minimum sudah tercentang di urutan atas

#### Scenario: Penerimaan PO menambah stok item bersama
- **WHEN** permintaan berisi Air mineral 48 botol disetujui, PO-nya dicetak, lalu barangnya diterima penuh
- **THEN** stok Air mineral bertambah 48 botol di tab bahan baku maupun tab barang dagangan

### Requirement: Penjualan memotong stok item bersama
Pembayaran Kasir yang dikonfirmasi, order Pesanan yang menjadi Selesai, dan fee driver rokok SHALL memotong stok item bersama yang sama, sehingga stok di tab LPP bahan baku ikut berkurang. Stok SHALL NOT menjadi minus (dipotong paling rendah sampai 0). Waktu pemotongan SHALL mengikuti aturan yang sudah ada.

#### Scenario: Kasir menjual air mineral
- **WHEN** Kasir menjual Air mineral ×3 dari kategori Jajanan dan mengonfirmasi pembayaran, dengan stok Air mineral 48 botol
- **THEN** muncul toast "Pembayaran berhasil. LPP barang dagangan diperbarui.", dan Air mineral menjadi "45 botol" di tab LPP barang dagangan maupun LPP bahan baku

#### Scenario: Fee rokok memotong stok bersama
- **WHEN** Kasir mencatat fee driver rokok Brand B ×2 lalu mengonfirmasi pembayaran, dengan stok Rokok Brand B 18
- **THEN** Rokok Brand B menjadi "16 bungkus" di kedua tab LPP

#### Scenario: Stok tidak minus
- **WHEN** Kasir menjual Rokok Brand D ×8 dengan stok 6 bungkus lalu mengonfirmasi pembayaran
- **THEN** Rokok Brand D menjadi "0 bungkus" di kedua tab, bukan minus

### Requirement: Item bersama dikecualikan dari produksi
Modal "Catat hasil produksi" SHALL NOT menampilkan item bersama, baik di pilihan "Hasil barang dagangan" maupun di pilihan bahan baku pada setiap baris bahan. Tombol "+ Tambah bahan" SHALL NOT menambahkan baris item bersama. Pencatatan produksi untuk item lain SHALL tetap berjalan seperti sebelumnya.

#### Scenario: Pilihan produksi tanpa item bersama
- **WHEN** Administrator membuka tab "LPP barang dagangan" dan menekan "+ Hasil produksi"
- **THEN** pilihan "Hasil barang dagangan" dan pilihan bahan pada baris bahan tidak memuat Rokok Brand A–E maupun Air mineral

#### Scenario: Tambah bahan sampai habis
- **WHEN** Administrator menekan "+ Tambah bahan" sampai semua bahan baku non-bersama sudah dipilih, lalu menekan sekali lagi
- **THEN** muncul toast "Semua bahan baku sudah dipilih" dan tidak ada baris item bersama yang ditambahkan

#### Scenario: Produksi tetap berjalan
- **WHEN** Administrator mencatat produksi Paket Favorit 25K dari Beras 8 kg
- **THEN** stok Beras berkurang 8 kg, stok Paket Favorit 25K bertambah, dan stok item bersama tidak berubah
