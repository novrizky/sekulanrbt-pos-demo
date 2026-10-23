# Proposal

## Why

Outlet sering menerima pesanan terjadwal, seperti nasi box, catering, dan pesanan rombongan, yang dicatat oleh Administrator atau Kepala Toko di luar meja kasir. Pesanan seperti ini biasanya dibayar dengan DP atau dibayar di muka dan sering melibatkan fee driver. Saat ini POS hanya mengenal satu keranjang yang langsung dibayar penuh lalu hilang, sehingga pesanan seperti ini belum bisa dicatat, dilunasi bertahap, atau diteruskan ke kasir.

## What Changes

Aplikasi yang terdampak hanya **POS outlet** (`index.html`, `app.js`, `styles.css`). Pusat Data Outlet (`outlet-data.html`) tidak diubah.

- **Menu sidebar baru "Pesanan"** untuk Administrator dan Kepala Toko, berisi:
  - Daftar order dengan filter status (Semua, Open, Selesai), filter outlet, dan pencarian nomor atau pelanggan.
  - Form "Buat order" sehalaman dengan layout dua kolom yang meniru POS. Isinya:
    - informasi order (outlet, pelanggan, no. HP, estimasi tanggal dan jam, catatan);
    - pilihan item yang memuat **semua** menu tanpa melihat stok;
    - pembayaran awal (belum bayar, sebagian, atau lunas);
    - fee driver opsional (tunai atau rokok);
    - status awal (Open atau Selesai).
  - Detail order berisi item, riwayat pembayaran, sisa, dan fee driver, dengan aksi "Catat pembayaran" dan "Selesaikan order".
- **Status bayar dihitung dari total dan pembayaran**: Belum bayar, Sebagian, Lunas, atau **Lebih bayar**. Lebih bayar hanya ditampilkan, tanpa alur refund.
- **Status order (Open atau Selesai) hanya ditentukan oleh Administrator atau Kepala Toko.** Order boleh langsung dibuat sebagai Selesai, dan order Selesai boleh belum lunas. Stok barang dagangan dipotong saat order menjadi Selesai, dan item tanpa catatan stok dilewati.
- **Fee driver adalah biaya keluar** dan tidak mengurangi tagihan pelanggan.
- **Kepala Toko dibatasi ke outlet miliknya**, baik untuk melihat maupun membuat order. Administrator bisa mengakses semua outlet.
- **Kasir: tombol "Ubah" di baris Pelanggan** (yang sekarang belum berfungsi) membuka modal untuk memilih "Umum" atau salah satu order Open di outlet kasir, diurutkan berdasarkan estimasi. Order yang dipilih tampil di header cart. Setelah itu kasir bisa:
  - menambah item;
  - menerima pembayaran, maksimal sebesar sisa;
  - mengisi fee driver hanya kalau order belum punya fee. Fee yang sudah terisi terkunci.
- **Membatalkan item yang sudah tersimpan di order** memerlukan kredensial Kepala Toko shift aktif dan tetap tercatat di histori pembatalan. Pembatalan bisa membuat order berstatus Lebih bayar.
- Pembayaran order oleh kasir **tidak** memotong stok. Transaksi "Umum" tetap berjalan seperti sekarang.

## Capabilities

### New Capabilities
- `scheduled-orders`: pembuatan dan pengelolaan order oleh Administrator dan Kepala Toko (data order, pembayaran bertahap, status bayar, status Open/Selesai, fee driver, pemotongan stok saat Selesai) serta pemrosesan order tersebut di Kasir (memilih order, menambah item, menerima pembayaran, mengisi fee yang masih kosong).

### Modified Capabilities
- `pos-access-control`: menu yang dapat diakses Kepala Toko dan Administrator bertambah "Pesanan", dan panel "Hak akses" menjelaskannya.
- `item-cancellation`: pembatalan item yang sudah tersimpan di order terjadwal memerlukan otorisasi Kepala Toko dan dapat membatalkan sebagian qty.

## Impact

- `index.html`: nav-item `data-view="orders"` dan `section#orders` (daftar dan form), serta penanda di baris pelanggan cart.
- `app.js`:
  - data `scheduledOrders` hard-coded;
  - render daftar, form, dan detail order;
  - `ROLE_ACCESS`;
  - mode order di cart (`renderCart`, `#payButton`, `feeModal`, `openCancel`, tombol "Ubah", `#newOrder`).
- `styles.css`: layout form order, pill status bayar dan status order, serta baris info order di cart.
- **Di luar cakupan:**
  - backend, persistensi, dan notifikasi nyata ke kasir;
  - rekonsiliasi kas per shift untuk DP atau pelunasan, termasuk dampak pada rekap atau paket tutup shift;
  - pembaruan angka `salesRows` dan laporan;
  - edit atau hapus order oleh Admin di luar perubahan status dan pencatatan pembayaran;
  - alur refund lebih bayar;
  - perubahan pada Pusat Data Outlet maupun format paket ZIP.
