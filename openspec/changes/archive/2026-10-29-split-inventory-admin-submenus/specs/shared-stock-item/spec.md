## MODIFIED Requirements

### Requirement: Item bersama tampil di kedua LPP dengan satu stok
Rokok Brand A–E dan Air mineral SHALL menjadi item bersama yang tampil di tabel stok submenu "Stok bahan baku" dan submenu "Stok barang dagangan" bagi Administrator dan Kepala Toko. Kedua halaman SHALL menampilkan STOK, MINIMUM, BIAYA / UNIT, dan STATUS yang sama untuk item yang sama, dan nama item SHALL diberi badge "Tersambung". Item lain SHALL NOT diberi badge tersebut. Air mineral SHALL memakai satuan botol, dan rokok memakai satuan bungkus. Penyebutan "tab LPP bahan baku" dan "tab LPP barang dagangan" di requirement lain berarti submenu "Stok bahan baku" dan "Stok barang dagangan".

#### Scenario: Item bersama di tab bahan baku
- **WHEN** Administrator membuka submenu "Stok bahan baku" dan memilih Jenis item "Siap jual" (tanpa filter, sebagian item bersama berada di halaman 2 karena tabel dibatasi 10 baris)
- **THEN** tabel menampilkan Rokok Brand A–E dan Air mineral dengan badge "Tersambung", misalnya Rokok Brand A "24 bungkus" dan Air mineral "48 botol"

#### Scenario: Item bersama di tab barang dagangan
- **WHEN** Administrator berpindah ke submenu "Stok barang dagangan" (tanpa filter, Air mineral berada di halaman 2; dengan Jenis item "Siap jual" keenam item bersama tampil)
- **THEN** Rokok Brand A–E dan Air mineral tampil dengan badge "Tersambung" dan stok yang sama seperti di Stok bahan baku, sedangkan Paket Favorit 25K tampil tanpa badge
