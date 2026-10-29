## Why

Prototipe POS sudah mencatat stok masuk, produksi, penjualan, dan transfer, tetapi belum punya cara mencocokkan stok sistem dengan hitungan fisik di gudang. Padahal stock opname adalah kontrol yang pasti ditanyakan pemilik saat demo modul Persediaan: siapa yang menghitung, barang apa yang selisih, berapa nilainya dalam Rupiah, dan apa alasannya. Dengan modul ini, Kepala Toko bisa menutup siklus persediaan di outletnya sendiri, dan Administrator bisa memantau hasil opname setiap toko dari satu halaman.

## What Changes

- Submenu baru **Persediaan › Stok opname** (antara "Mutasi stok" dan "Permintaan barang") untuk Kepala Toko dan Administrator.
- **Riwayat stock opname** per outlet: no. dokumen `SO-<MMDD>-<n>`, tanggal, cakupan, petugas, jumlah item, jumlah item selisih, dan nilai selisih dalam Rupiah. Ada chip cakupan (Semua / Bahan baku / Barang dagangan) dan paging contoh.
- **Kepala Toko** menekan "+ Mulai opname" untuk outletnya sendiri, lalu memilih cakupan:
  - Bahan baku: semua bahan baku kecuali item tersambung.
  - Barang dagangan: hasil produksi ditambah item tersambung (Rokok Brand A–E, Air mineral) dengan badge "Siap jual".
- **Form hitung inline** (pola Permintaan barang). Qty sistem di-snapshot, dan kolom fisik terisi dengan qty sistem. Selisih dihitung langsung (+hijau / −merah). Baris yang selisih menampilkan label "Wajib diisi" pada catatan, tanpa validasi, plus chip alasan cepat (Rusak, Kadaluarsa, Hilang, Salah input). Ada tombol "Kembalikan ke stok sistem" dan ringkasan berjalan.
- **Konfirmasi**: setiap kolom fisik wajib terisi (kalau ada yang dikosongkan, konfirmasi ditolak dengan toast). Setelah dikonfirmasi, qty `rawStock`/`finishedStock` diganti dengan qty fisik, entri `SO-…` ditambahkan ke Mutasi stok, dan dokumen masuk riwayat.
- **Detail dokumen** di halaman penuh (pola BA tutup shift): header outlet, petugas dan shift, cakupan, ringkasan selisih lebih/kurang, dan nilai selisih. Tabel item terbuka dengan filter "Hanya yang selisih" aktif.
- **Administrator** hanya melihat. Dropdown outlet di riwayat dengan nilai awal Sekulan RBT 519A, tanpa tombol "+ Mulai opname".
- **Kartu ringkasan** submenu: Opname bulan ini, Opname terakhir, Nilai selisih bulan ini. Kartu mengikuti outlet yang dilihat.
- **Data contoh**: 4 dokumen Sekulan RBT 519A, 3 dokumen RM RBT 519B, 3 dokumen Bawen 445B. Outlet lain menampilkan keadaan kosong.
- Panel "Hak akses" ditambah kalimat bahwa Kepala Toko melakukan stock opname outletnya dan Administrator melihat riwayat semua outlet.

## Capabilities

### New Capabilities
- `stock-opname`: stock opname oleh Kepala Toko (cakupan, form hitung, catatan selisih, konfirmasi yang menyesuaikan stok dan mencatat mutasi), riwayat dan detail dokumen, serta tampilan riwayat per outlet untuk Administrator.

### Modified Capabilities
- `sidebar-submenu-navigation`: urutan submenu Persediaan bertambah "Stok opname", isi panel submenu baru, kartu ringkasan Stok opname, dan daftar tabel yang memakai paging contoh (riwayat dan detail opname berpaging, form hitung tidak).
- `pos-access-control`: Kepala Toko melihat enam submenu Persediaan termasuk "Stok opname", dan panel "Hak akses" menyebut stock opname.

## Impact

- **Aplikasi terdampak**: hanya POS outlet (`index.html`). Pusat Data Outlet (`outlet-data.html`) tidak disentuh.
- **File**:
  - `index.html`: tombol submenu sidebar, panel riwayat `data-subs="opname"`, panel form inline, `section#opnameDetail`, dan teks panel Hak akses.
  - `app.js`: data `stockOpnames`, `INV_TITLES`, `SUB_CARDS.opname`, `ROLE_ACCESS['Kepala Toko'].subs`, render riwayat/form/detail, konfirmasi yang mengubah `rawStock`/`finishedStock`/`stockMoves`, dan ikon `SO` di timeline mutasi.
  - `styles.css`: mode form opname dan gaya selisih/chip catatan, termasuk tampilan di 1000px dan 390px.
- **Alur tutup shift dan format paket ZIP**: tidak berubah. `stock_movement.csv` di paket shift tetap konsep. Entri `SO` hanya tampil di Mutasi stok POS, dan hub tidak diubah.
- **Di luar cakupan**: backend, persistensi (reload menghapus opname baru), persetujuan Administrator, status Draft, pembekuan transaksi Kasir selama opname, opname sebagian, cetak/ekspor dokumen opname, stok terpisah per outlet (stok "hidup" tetap milik Sekulan RBT 519A), dan sinkronisasi ke Pusat Data Outlet.
