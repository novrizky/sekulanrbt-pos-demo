## Why

Restok bahan baku di prototipe saat ini hanya bisa dicatat sebagai stok masuk (GRN) lepas, tanpa jejak siapa yang meminta, siapa yang menyetujui, ke vendor mana barang dipesan, dan apakah yang datang sesuai pesanan. Stakeholder perlu melihat alur pengadaan yang utuh di dalam Persediaan: Kepala Toko mengajukan permintaan, Administrator menyetujui, PO dicetak untuk vendor, lalu penerimaan barang menambah stok dan tercatat di riwayat yang bisa ditelusuri, termasuk selisih penerimaan.

## What Changes

- Section baru **"Permintaan barang"** di halaman Persediaan (POS), di bawah grid "Stok bahan baku" + "Riwayat TAT", tampil di kedua tab LPP. Isinya daftar permintaan dengan filter status, kolom peminta (nama + peran), dan tombol "+ Buat permintaan".
- **Form buat permintaan** berupa panel penuh. Tabel bahan baku dengan pencarian nama dan filter status (Semua/Menipis/Aman), item Menipis di urutan teratas dan otomatis tercentang dengan qty kosong. Item yang dicentang wajib diisi qty.
- **Alur status**: Menunggu persetujuan → Disetujui → PO dicetak → Selesai, dengan cabang Ditolak. Permintaan Kepala Toko menunggu persetujuan Administrator. Permintaan Administrator otomatis Disetujui. Administrator bisa mengoreksi qty sebelum menyetujui, dan alasan wajib diisi saat menolak.
- **Purchase Order**: 1 permintaan → 1 PO → 1 vendor. Saat cetak, identitas vendor dan harga per item bisa diisi atau diubah. Nilai itu disimpan di PO, prefilled saat cetak ulang, dan tidak mengubah harga master bahan baku. Cetak memakai `window.print()`.
- **Terima barang dari PO**: form GRN multi-item yang terisi dari PO. Qty dan harga diterima bisa diubah, catatan selisih wajib bila qty berbeda. Simpan menambah `rawStock`, memperbarui biaya per unit master (perilaku GRN yang sudah ada), dan menandai permintaan Selesai.
- **Riwayat/timeline** per permintaan: diajukan, disetujui/ditolak (dengan koreksi qty), PO dicetak, diterima (nomor GRN + catatan selisih).
- **Hak akses**: Kepala Toko melihat semua permintaan. Cetak PO dan Terima barang hanya untuk outletnya sendiri. Administrator bisa semua aksi.
- **Data contoh**: `rawStock` diperbanyak menjadi sekitar 15–18 bahan baku realistis, ditambah 4 permintaan contoh berstatus beragam (20–21 September 2026).
- Tombol "+ Stok masuk" yang lama tetap ada untuk penerimaan tanpa PO. Definisi Menipis tetap `qty <= min`.

## Capabilities

### New Capabilities
- `raw-material-request`: permintaan barang bahan baku di Persediaan POS, meliputi pembuatan permintaan, persetujuan Administrator, cetak Purchase Order dengan identitas vendor dan harga per PO, penerimaan barang dari PO ke LPP bahan baku beserta catatan selisih, dan riwayat permintaan yang bisa ditelusuri.

### Modified Capabilities
- (tidak ada)

## Impact

- Aplikasi terdampak: **hanya POS** (`index.html`, `app.js`, `styles.css`). Pusat Data Outlet (`outlet-data.*`) tidak tersentuh. Alur tutup shift dan format paket ZIP tidak berubah.
- `app.js`: data `rawStock` diperluas, array baru `materialRequests`, fungsi render/form/modal baru. Panel stok bahan baku langsung menampilkan item tambahan.
- `index.html`: markup section permintaan dan panel form di dalam `section#inventory`.
- `styles.css`: gaya section, pill status, dan blok `@media print` untuk dokumen PO.
- Di luar cakupan: backend/persistensi (reload mengembalikan data contoh), pengiriman PO ke vendor (tetap manual), master vendor lintas PO, penerimaan bertahap, approval bertingkat, PDF sungguhan, notifikasi ke Owner.
