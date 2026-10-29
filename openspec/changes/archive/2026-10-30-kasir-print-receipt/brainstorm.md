# Brainstorm: kasir-print-receipt

Hasil diskusi explore dengan user (30 Okt 2026), dicatat apa adanya sebagai log keputusan.

## Latar belakang

User ingin Kasir bisa mencetak struk setelah transaksi. Setelah Kasir menekan "Konfirmasi pembayaran", muncul modal baru berisi ringkasan transaksi dan tombol untuk mencetak struk. Struk harus langsung bisa dicetak.

Kondisi kode saat ini (diamati):
- Handler `#payButton` yang berlaku adalah yang terakhir di `app.js:156`. Salinan di baris 47 sudah mati. Modal "Pembayaran" hanya menampilkan total dan `<select>` metode, tanpa input uang diterima. `#finishPay` memotong stok (`cutFinished`), menutup modal, mengosongkan cart, lalu menampilkan toast "Pembayaran berhasil. LPP barang dagangan diperbarui."
- Bila `activeOrder` aktif, `#payButton` memanggil `openOrderPayment()` (`app.js:303`). Modal ini punya input "Nominal diterima" dan metode. `#kpSave` mencatat pembayaran (bila > 0) lalu menampilkan toast "Pembayaran order tercatat" atau "Order diperbarui tanpa pembayaran".
- Pola cetak sudah ada untuk PO: `#poPrint` (disembunyikan) diisi HTML, `body.print-po` ditambahkan, `window.print()`, lalu class dilepas. `@media print` menyembunyikan semua anak `body` kecuali `#poPrint` (`styles.css:78`).
- Belum ada penomoran `TRX-` untuk penjualan baru. Data demo `shiftTransactions` Shift 1 berakhir di `TRX-0920-1087`.
- Total Kasir biasa = subtotal − fee driver tunai (`grand=sub-fee`).

## Rantai keputusan

**Q1. Ukuran kertas 58 × 30 mm itu label atau roll?**
Ukuran 30 mm hanya memuat sekitar 7–8 baris, jadi daftar item tidak akan muat.
→ User: **roll thermal 58 mm**. Tinggi struk mengikuti isi (`@page{size:58mm auto}`).

**Q2. Perlu input uang diterima dan kembalian?**
→ User: **tidak untuk sekarang**. Modal sukses cukup menampilkan total transaksi dan metode.

**Q3. Apakah pembayaran pesanan (`activeOrder`) juga menghasilkan struk?**
→ User: **ya**.

**Q4. Nomor transaksi?**
→ Disetujui: counter global demo `TRX-0920-####`, melanjutkan data shift (mulai 1088).

**Q5. Fee driver dicetak di struk?**
→ User: **tidak**.

**Q6. Karena fee tidak dicetak, TOTAL struk berapa?**
- (a) TOTAL = jumlah item. Struk konsisten dengan daftar item, tapi berbeda dari total di modal bila ada fee.
- (b) TOTAL = subtotal − fee. Sama dengan modal, tapi daftar item tidak menjumlah ke total.
→ User setuju dengan rekomendasi **(a)**. Fee driver adalah urusan internal outlet dan driver, jadi struk pelanggan mencerminkan harga menu. Modal sukses tetap menampilkan total yang sama dengan modal bayar.

**Q7. Isi struk pesanan?**
→ User setuju dengan usulan ini: header outlet, nomor TRX, waktu, nama kasir, ID ORD dan nama pelanggan, daftar item order, lalu Total pesanan, Sudah dibayar (sebelum pembayaran ini), Bayar sekarang (+ metode), dan Sisa tagihan. Modal sukses pesanan menampilkan nominal yang dibayar sekarang dan sisa tagihan.

## Pendekatan cetak

1. **Elemen tersembunyi + class body + `@media print`** (pola `#poPrint` yang sudah ada). Tidak butuh dependency, konsisten dengan kode, bisa diulang dari modal yang sama.
2. Membuka `window.open` berisi HTML struk lalu memanggil print. Butuh CSS terpisah di jendela baru dan bisa diblokir popup blocker.
3. Iframe tersembunyi. Lebih rumit tanpa manfaat berarti untuk prototipe.

→ Pendekatan **1** dipakai (disetujui user di explore: "Cetak memakai pola #poPrint/body.print-po").

## Keputusan tambahan (keputusan saya, bisa dikoreksi)

- Modal sukses tetap terbuka setelah "Cetak struk" agar bisa cetak ulang. Tombol "Selesai" menutup modal.
- Toast lama tetap tampil seperti sekarang supaya skenario spec yang ada tidak berubah. Modal sukses muncul bersamaan.
- Pembayaran pesanan dengan nominal 0 ("Order diperbarui tanpa pembayaran") tidak menampilkan modal sukses dan tidak menerbitkan nomor TRX, karena tidak ada transaksi.
- Nomor TRX diterbitkan saat konfirmasi, bukan saat cetak, sehingga cetak ulang memakai nomor yang sama.
- Waktu struk memakai tanggal demo 20 Sep 2026 dan jam lokal saat konfirmasi.
- Kasir biasa: struk tidak mencetak baris "Subtotal" terpisah. Cukup TOTAL (= jumlah item) dan metode.
