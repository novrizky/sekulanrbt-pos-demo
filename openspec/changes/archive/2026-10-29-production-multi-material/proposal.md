## Why

Produksi di Persediaan sekarang dimulai dari tombol header "− Keluarkan untuk produksi", padahal pengguna mencarinya lewat "+ Hasil produksi" di tab LPP barang dagangan. Tombol itu hanya memunculkan toast. Modalnya juga sempit dan hanya menerima satu bahan baku, sementara satu hasil produksi (misalnya Paket Favorit) nyatanya memakai beberapa bahan. Perubahan ini membuat alur produksi di demo sesuai dengan cara kerja dapur outlet yang sebenarnya.

## What Changes

**Titik masuk produksi**
- From: tombol header `#productionIssue` "− Keluarkan untuk produksi" membuka modal, sedangkan "+ Hasil produksi" (`#stockIn` di tab barang dagangan) hanya menampilkan toast.
- To: "+ Hasil produksi" membuka modal produksi, dan tombol header dihapus. "+ Stok masuk" di tab bahan baku tidak berubah.
- Reason: produksi menambah barang dagangan, jadi tombolnya diletakkan di buku stok barang dagangan.
- Impact: non-breaking. Kepala Toko dan Administrator (pengguna Persediaan) terdampak.

**Modal produksi**
- From: satu bahan baku, satu barang hasil, lebar 440px.
- To: lebar ±760px, satu barang hasil + jumlah hasil, dan baris bahan baku dinamis ("+ Tambah bahan", hapus per baris) dengan kolom stok, qty dipakai, dan biaya. Ringkasan menampilkan total biaya bahan dan HPP/unit. Kalau ada satu bahan yang stoknya kurang, seluruh produksi ditolak.
- Impact: non-breaking.

**Biaya/unit barang hasil**
- From: produksi tidak mengubah `cost` barang dagangan.
- To: `cost` barang hasil diganti dengan HPP/unit produksi terakhir.

**Panel riwayat Persediaan**
- From: "Riwayat TAT" dengan data hard-coded di dalam `renderInventory`, sehingga produksi baru tidak muncul.
- To: "Riwayat mutasi stok", datanya array global, dan setiap produksi baru tampil di paling atas (`PRD-0920-012`, dst.).

**Tabel riwayat produksi**
- From: belum ada tempat untuk melihat produksi beserta biaya, HPP, dan pencatatnya. Timeline riwayat mutasi stok hanya menampilkan ringkasan.
- To: panel "Riwayat produksi" berisi tabel KODE, WAKTU, HASIL, JUMLAH, BAHAN BAKU, TOTAL BIAYA, HPP / UNIT, DICATAT OLEH. Panel ini tampil di bawah grid stok hanya saat tab LPP barang dagangan aktif, dengan 3 data contoh, dan setiap produksi baru masuk di baris teratas.
- Reason: Kepala Toko dan Administrator perlu menelusuri produksi dan HPP-nya.
- Impact: non-breaking, tampilan baru.

## Capabilities

### New Capabilities
- `stock-production`: pencatatan hasil produksi multi-bahan di LPP barang dagangan, meliputi titik masuk, modal, validasi stok, biaya/HPP, dan pencatatan ke riwayat mutasi stok.

### Modified Capabilities
(tidak ada)

## Impact

- Aplikasi: **POS saja** (`index.html`, `app.js`, `styles.css`). Pusat Data `outlet-data.*` tidak disentuh.
- `index.html`: hapus `#productionIssue`, ganti judul dan subjudul panel riwayat, tambah panel `#productionPanel` "Riwayat produksi".
- `app.js`: rewrite `productionModal()`, ubah handler `#stockIn` terakhir, hapus wiring `#productionIssue` dan handler `#stockIn` yang mati, pindahkan data riwayat ke global, tambah `productionLog` + `renderProductionLog()`.
- `styles.css`: aturan lebar modal produksi dan tata letak baris bahan.
- Alur tutup shift dan format paket ZIP tidak berubah.
- Di luar cakupan: backend dan persistensi (reload tetap mereset state), data resep/BOM dan auto-isi bahan, banyak barang hasil per produksi, pencatatan transfer ke riwayat, halaman "Lihat semua", filter/paging/detail per baris di tabel riwayat produksi, dan validasi ketat (bahan dobel, pembulatan HPP).
