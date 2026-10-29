## Why

Saat ini Kasir menyelesaikan pembayaran tanpa melihat ringkasan dan tanpa bisa memberi struk ke pelanggan. Konfirmasi hanya menutup modal dan menampilkan toast. Demo POS perlu menunjukkan alur kasir yang lengkap: bayar, lihat ringkasan, lalu cetak struk di printer thermal 58 mm. Ini berlaku untuk penjualan biasa maupun pembayaran pesanan.

## What Changes

**Setelah konfirmasi pembayaran Kasir biasa**
- From: modal ditutup, cart dikosongkan, dan hanya toast yang tampil.
- To: proses lama tetap berjalan (potong stok, kosongkan cart, toast), lalu muncul modal "Pembayaran berhasil" berisi nomor transaksi, total transaksi, dan metode, beserta tombol "Cetak struk" dan "Selesai".
- Reason: Kasir butuh konfirmasi visual dan cara mencetak struk.
- Impact: non-breaking. Toast dan potong stok tidak berubah.

**Setelah konfirmasi pembayaran pesanan (`activeOrder`) dengan nominal > 0**
- From: modal ditutup, dan hanya toast "Pembayaran order tercatat" yang tampil.
- To: proses lama tetap berjalan, lalu muncul modal "Pembayaran berhasil" berisi nomor transaksi, ID order, nominal dibayar sekarang, metode, dan sisa tagihan, beserta tombol "Cetak struk" dan "Selesai". Nominal 0 tetap hanya menampilkan toast.
- Impact: non-breaking.

**Struk 58 mm (baru)**
- Desain struk roll thermal lebar 58 mm, tinggi mengikuti isi, dicetak lewat `window.print()`.
- Nomor transaksi `TRX-0920-####` dari counter demo (mulai 1088).
- Fee driver tidak dicetak. TOTAL struk Kasir biasa = jumlah item.
- Tidak ada input uang diterima atau kembalian.

## Capabilities

### New Capabilities
- `kasir-receipt-print`: modal ringkasan setelah pembayaran Kasir (biasa dan pesanan) dan cetak struk roll thermal 58 mm.

### Modified Capabilities
(tidak ada; toast dan perilaku pembayaran yang sudah di-spec tidak berubah)

## Impact

- Aplikasi: **POS saja** (`index.html`). Pusat Data `outlet-data.html` tidak disentuh.
- `index.html`: tambah container tersembunyi `#receiptPrint` di samping `#poPrint`.
- `app.js`: handler `#finishPay` di `#payButton` terakhir (baris 156) dan `#kpSave` di `openOrderPayment()`; tambah counter TRX, builder HTML struk, dan modal sukses.
- `styles.css`: gaya modal sukses, gaya struk `.receipt`, dan aturan `@media print` untuk `body.print-receipt` (`@page` 58 mm).
- Tidak ada efek ke alur tutup shift atau format paket ZIP. Transaksi baru tidak masuk ke `shiftTransactions` atau BA.

**Di luar cakupan:** integrasi printer thermal nyata (ESC/POS, driver, cetak otomatis tanpa dialog), persistensi atau riwayat struk, cetak ulang struk dari Laporan, input uang diterima atau kembalian, logo atau QR di struk, dan struk dari halaman Pesanan (admin).
