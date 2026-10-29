## MODIFIED Requirements

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
