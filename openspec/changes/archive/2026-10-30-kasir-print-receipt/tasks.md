## 1. POS – index.html

- [x] 1.1 Tambah `<div id="receiptPrint"></div>` tepat setelah `<div id="poPrint"></div>`

## 2. POS – styles.css

- [x] 2.1 Sembunyikan `#receiptPrint` di layar (`display:none`), sama seperti `#poPrint`
- [x] 2.2 Tambah gaya struk `.receipt`: lebar 58 mm, padding ±3 mm, font monospace ±9px, warna hitam di atas putih, header rata tengah, garis putus-putus pemisah, baris item dua tingkat (nama, lalu `qty x harga` kiri dan subtotal kanan), baris total tebal, footer rata tengah. Pasang `page:receipt`
- [x] 2.3 Di `@media print`: `body.print-receipt>*{display:none!important}`, `body.print-receipt #receiptPrint{display:block!important}`, dan `body.print-receipt{background:#fff}`. Named page `receipt` (jangan ubah `@page` global). Catatan apply: `size:58mm auto` tidak valid, jadi tinggi halaman ditulis oleh `fitReceiptPage()` di app.js
- [x] 2.4 Tambah gaya kecil untuk isi modal sukses (baris TRX/waktu, angka besar, baris metode dan sisa) dengan memakai pola modal yang ada
- [x] 2.5 Verifikasi manual: buka `index.html`, pastikan tampilan layar tidak berubah dan `#receiptPrint` tidak terlihat

## 3. POS – app.js: helper struk

- [x] 3.1 Tambah global `let trxSeq=1088` dan `nextTrx()` yang mengembalikan `` `TRX-0920-${trxSeq++}` ``
- [x] 3.2 Tambah `receiptHtml(r)` yang membangun HTML `.receipt` sesuai design D3: header outlet, no, `20/09/2026 <jam>`, kasir, baris ORD bila `r.order`, item, lalu blok total (Kasir biasa: TOTAL = Σ item + metode; pesanan: Total pesanan, Sudah dibayar, Bayar sekarang (metode), Sisa tagihan), dan "Terima kasih". Angka memakai `toLocaleString('id-ID')` tanpa "Rp"
- [x] 3.3 Tambah `printReceipt(r)`: isi `#receiptPrint`, tambah `body.print-receipt`, `window.print()`, lalu lepas class (meniru alur `#poPrint`)
- [x] 3.4 Tambah `openReceiptModal(r)`: `openModal()` "Pembayaran berhasil" dengan nomor TRX dan waktu, angka besar (`r.shown`), metode, baris "ORD • pelanggan" dan "Sisa tagihan" bila pesanan, serta tombol "Selesai" (`data-close`) dan "Cetak struk" (`#printReceipt`, tidak menutup modal)

## 4. POS – app.js: sambungkan ke alur bayar

- [x] 4.1 Di handler `#payButton` TERAKHIR (`app.js:156`), pada `#finishPay.onclick`: sebelum reset, snapshot `r={no:nextTrx(),time,cashier:session.name,items:cart.map(x=>({...x})),method,total:Σ item,shown:$('#grandTotal').textContent}` (beri `id` pada `<select>` metode). Setelah proses lama dan toast, panggil `openReceiptModal(r)`. Salinan mati di baris 47 tidak disentuh
- [x] 4.2 Di `#kpSave.onclick` dalam `openOrderPayment()` (`app.js:303`): ambil `paidBefore=orderMoney(o).paid` sebelum push. Bila `n>0`, setelah item dan pembayaran tersimpan, bangun `r` dengan `items:o.items` (salinan), `order:{id,customer,total:orderMoney(o).total,paidBefore,paidNow:n,rest:orderMoney(o).rest}`, dan `shown:rupiah(n)`. Panggil `openReceiptModal(r)` setelah toast. Bila `n===0`, perilaku tidak berubah
- [x] 4.3 Pastikan `closeModal()` lama tetap dipanggil sebelum `openReceiptModal` (modal sukses menggantikan isi `#modalContent`)

## 5. Verifikasi

- [x] 5.1 Harness headless Chrome (di `.superpowers/sdd/<plan>/harness/`): login `ayu.kasir`, mulai shift, tambah Paket Favorit 25K ×3 + Es teh manis ×1, bayar Tunai. Cek toast, modal "Pembayaran berhasil", "TRX-0920-1088", dan "Rp81.000". Klik "Cetak struk" dengan stub `window.print` lalu cek isi `#receiptPrint` (TOTAL 81.000, tanpa fee). Transaksi kedua harus "TRX-0920-1089"
- [x] 5.2 Harness: dengan fee tunai Rp5.000 modal menampilkan "Rp76.000" dan struk tetap TOTAL 81.000. Pesanan ORD-0920-002 dibayar Rp200.000 QRIS: modal menampilkan sisa Rp500.000. Nominal 0: modal sukses tidak muncul
- [ ] 5.3 Manual di Chrome: buka `index.html`, lakukan pembayaran, tekan "Cetak struk", dan pastikan print preview hanya berisi struk selebar 58 mm (pilih ukuran kertas 58 mm / printer thermal bila ada), lalu modal tetap terbuka setelah dialog ditutup. Cetak PO dan Laporan, lalu pastikan ukuran kertasnya tidak berubah
