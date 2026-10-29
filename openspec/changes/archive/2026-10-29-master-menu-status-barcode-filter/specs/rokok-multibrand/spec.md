## MODIFIED Requirements

### Requirement: Fee driver rokok multi-merek di Kasir
Pada modal "Tambahkan fee driver", bila Kasir memilih bentuk "Rokok", modal SHALL menampilkan daftar semua merek rokok yang berstatus aktif di Master menu beserta stoknya dan input jumlah bungkus per merek. Merek rokok yang berstatus Nonaktif MUST NOT tampil di daftar ini, kecuali merek yang sudah tersimpan di fee rokok cart atau order tersebut. Kasir SHALL dapat mengisi lebih dari satu merek. Menyimpan tanpa satu pun jumlah lebih dari 0 SHALL ditolak. Fee rokok SHALL hanya tampil di baris "Fee driver" cart (bukan sebagai baris item) dan SHALL NOT mengurangi total pembayaran. Memilih bentuk "Uang tunai" SHALL mengosongkan fee rokok, dan sebaliknya.

#### Scenario: Menyimpan fee rokok beberapa merek
- **WHEN** Kasir pada transaksi biasa memilih "Rokok", mengisi Brand A 2 dan Brand C 1, lalu menekan "Simpan fee"
- **THEN** toast "Fee rokok dicatat: Brand A ×2, Brand C ×1. Stok dipotong saat pembayaran." tampil, baris fee cart berlabel "Fee driver (potong stok)" dan menampilkan "Brand A ×2, Brand C ×1", tidak ada baris item rokok baru, dan total pembayaran tidak berubah

#### Scenario: Merek rokok nonaktif tidak tampil
- **WHEN** Administrator menonaktifkan "Rokok Brand E" di Master menu, lalu Kasir memilih "Rokok" di modal fee driver
- **THEN** daftar merek hanya berisi Rokok Brand A sampai Rokok Brand D

#### Scenario: Fee rokok tanpa merek dipilih
- **WHEN** Kasir memilih "Rokok" dan menekan "Simpan fee" tanpa mengisi jumlah merek mana pun
- **THEN** toast "Pilih minimal satu merek rokok" tampil dan modal tetap terbuka

#### Scenario: Membuka ulang fee rokok
- **WHEN** Kasir sudah menyimpan fee rokok Brand A 2 lalu menekan "+ Tambahkan fee driver" lagi
- **THEN** modal terbuka dengan bentuk "Rokok" terpilih dan Brand A terisi 2

#### Scenario: Isian merek tetap saat berpindah bentuk fee
- **WHEN** Kasir mengisi Brand A 2, menekan "Uang tunai", lalu menekan "Rokok" lagi
- **THEN** Brand A masih terisi 2
