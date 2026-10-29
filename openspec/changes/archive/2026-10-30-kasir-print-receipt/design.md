## Context

POS (`index.html` + `app.js` + `styles.css`) adalah prototipe statis. Pembayaran Kasir punya dua jalur:

- **Kasir biasa**: `#payButton` terakhir di `app.js:156` membuka modal "Pembayaran" (total + `<select>` metode). `#finishPay` menjalankan `cutFinished(cart.concat(feeRokok))`, `closeModal()`, mengosongkan `cart`/`fee`/`feeRokok`, lalu `renderCart()`, `renderInventory()`, dan toast "Pembayaran berhasil. LPP barang dagangan diperbarui.". Salinan `#payButton` di baris 47 sudah mati karena ditimpa.
- **Pesanan**: bila `activeOrder` aktif, `#payButton` memanggil `openOrderPayment()` (`app.js:303`). `#kpSave` memvalidasi nominal, menyimpan item baru ke order, mendorong `o.payments` bila nominal > 0, menutup modal, mereset cart, lalu menampilkan toast "Pembayaran order tercatat" / "Order diperbarui tanpa pembayaran".

Pola cetak sudah ada: `#poPrint` (disembunyikan `#poPrint{display:none}`) diisi HTML, `document.body.classList.add('print-po')`, `window.print()`, lalu class dilepas. `@media print{body.print-po>*{display:none!important} body.print-po #poPrint{display:block!important}}` (`styles.css:78`).

Data yang tersedia untuk struk: nama outlet "Sekulan RBT 519A" (hard-coded di sidebar), `session.name` (kasir), `cart` (`{name,price,qty}`), `orderMoney(o)` (`total`, `paid`), `PAY_METHODS`, `rupiah()`.

## Goals / Non-Goals

**Goals:**
- Modal ringkasan "Pembayaran berhasil" setelah konfirmasi bayar, untuk Kasir biasa dan pesanan (nominal > 0).
- Tombol "Cetak struk" mencetak struk roll thermal 58 mm yang langsung siap cetak dari dialog print browser.
- Struk bisa dicetak ulang dari modal yang sama dengan nomor TRX yang sama.

**Non-Goals:**
- Integrasi printer nyata (ESC/POS, cetak tanpa dialog).
- Input uang diterima atau kembalian.
- Menyimpan transaksi baru ke `shiftTransactions`, laporan, atau BA.
- Menampilkan fee driver di struk.
- Membersihkan salinan mati `#payButton` di baris 47. Tidak disentuh agar diff tetap fokus.

## Decisions

### D1: Mekanisme cetak memakai pola `#poPrint`
- **Choice**: tambah `<div id="receiptPrint"></div>` di `index.html` setelah `#poPrint`. Helper `printReceipt(r)` mengisi `#receiptPrint` dengan `receiptHtml(r)`, menambah `body.print-receipt`, memanggil `window.print()`, lalu melepas class.
- **Rationale**: pola yang sama dengan cetak PO, tanpa dependency, dan konsisten dengan kode yang ada.
- **Alternatives considered**: `window.open` + print (bisa terblokir popup blocker dan perlu CSS terpisah); iframe tersembunyi (lebih rumit tanpa manfaat untuk prototipe).

### D2: Ukuran kertas roll 58 mm, tinggi auto
- **Choice**: named page `@page receipt{size:58mm <tinggi>mm;margin:0}`. Tinggi dihitung saat cetak oleh `fitReceiptPage()`, yang mengukur `#receiptPrint` lalu menulis `<style id="receiptPage">`. Catatan apply: `size:58mm auto` ternyata CSS tidak valid dan diabaikan browser (PDF jadi Letter). Elemen `.receipt` selebar 58 mm dengan padding ±3 mm (area cetak efektif ±48–52 mm), font monospace ±9px, dan satu kolom. Baris item terdiri dari nama di baris pertama, lalu `qty x harga` di kiri dan subtotal di kanan.
- **Rationale**: user mengonfirmasi kertas roll, bukan label 58 × 30 mm. Tinggi auto mencegah struk terpecah ke beberapa halaman.
- **Alternatives considered**: `size:58mm 30mm` ditolak karena hanya memuat 7–8 baris. Catatan: `@page` hanya berlaku saat `body.print-receipt` aktif secara visual, tetapi aturan `@page` bersifat global. Karena cetak Laporan dan PO juga memakai `@media print`, `@page` struk ditulis dengan named page (`.receipt{page:receipt}` + `@page receipt{size:58mm auto;margin:0}`) agar tidak mengubah ukuran cetak Laporan/PO. Lihat Risiko.

### D3: Isi struk
- **Choice**: objek `r` dibangun saat konfirmasi: `{no, time, cashier, items:[{name,price,qty}], method, order?:{id,customer,total,paidBefore,paidNow,rest}}`.
  - Header: "SEKULAN RBT 519A", `no`, `20/09/2026 <jam>`, dan nama kasir; bila pesanan, ditambah `ORD id • pelanggan`.
  - Daftar item.
  - Kasir biasa: `TOTAL` = Σ harga×qty item cart (tanpa fee), lalu metode.
  - Pesanan: Total pesanan, Sudah dibayar (`paidBefore`), Bayar sekarang (`paidNow`, metode), dan Sisa tagihan.
  - Footer: "Terima kasih".
- **Rationale**: sesuai Q6(a) dan Q7 di brainstorm. Fee driver adalah urusan internal sehingga tidak masuk struk.
- **Alternatives considered**: TOTAL = subtotal − fee (Q6(b)) ditolak karena daftar item tidak menjumlah ke total.

### D4: Snapshot data sebelum cart di-reset
- **Choice**: di `#finishPay` dan `#kpSave`, susun `r` (salinan item `cart.map(x=>({...x}))`, total, dan metode dari `<select>`) **sebelum** cart dikosongkan dan modal ditutup. Untuk pesanan, `paidBefore` diambil dari `orderMoney(o).paid` sebelum push, dan `total` serta `rest` dihitung setelah item baru disimpan dan pembayaran dicatat.
- **Rationale**: cart dan modal sudah direset di handler yang sama, jadi data harus diambil lebih dulu. Menyalin item cart aman karena objek cart bukan objek `sharedStock`.

### D5: Nomor transaksi
- **Choice**: global `let trxSeq=1088` dan `nextTrx()` mengembalikan `` `TRX-0920-${trxSeq++}` ``. Nomor diterbitkan saat konfirmasi.
- **Rationale**: melanjutkan nomor terakhir data Shift 1 (`TRX-0920-1087`), dan cetak ulang memakai nomor yang sama.

### D6: Modal sukses
- **Choice**: `openReceiptModal(r)` memanggil `openModal()` dengan judul "Pembayaran berhasil", baris nomor TRX dan waktu, angka besar (Kasir biasa: total yang sama dengan modal bayar, yaitu `#grandTotal` = subtotal − fee tunai; pesanan: `paidNow`), metode, dan untuk pesanan juga baris "Sisa tagihan". Tombolnya: "Selesai" (`data-close`) dan "Cetak struk" (primary, `#printReceipt`). `#printReceipt.onclick=()=>printReceipt(r)` tidak menutup modal. Toast lama tetap dipanggil.
- **Rationale**: user ingin ringkasan sederhana tanpa uang diterima atau kembalian, dan modal tetap terbuka agar bisa cetak ulang.
- **Alternatives considered**: tutup otomatis setelah cetak ditolak karena tidak bisa cetak ulang bila printer gagal.

### D7: Nominal 0 pada pesanan
- **Choice**: bila `n===0`, alur tetap seperti sekarang (toast "Order diperbarui tanpa pembayaran") tanpa modal sukses dan tanpa nomor TRX.
- **Rationale**: tidak ada transaksi pembayaran yang bisa distrukkan.

## Risks / Trade-offs

- [Risk] `@page` global bisa mengubah ukuran kertas cetak Laporan dan PO. → Mitigation: pakai named page `@page receipt` yang hanya dipakai `.receipt`. Verifikasi di print preview bahwa cetak Laporan dan PO tetap A4/default.
- [Risk] Dukungan `size:58mm auto` berbeda antar browser; sebagian browser memperlakukan `auto` sebagai ukuran default. → Mitigation: lebar elemen `.receipt` tetap 58 mm, jadi hasilnya tetap benar di printer thermal yang lebar kertasnya 58 mm. Verifikasi manual di Chrome print preview.
- [Trade-off] Total di modal sukses (subtotal − fee) bisa berbeda dari TOTAL struk (jumlah item) bila ada fee driver. → Diterima sesuai keputusan user Q6(a).
- [Trade-off] Transaksi baru tidak tercatat di laporan atau BA. → Diterima karena ini prototipe dan di luar cakupan.

## Migration Plan

N/A. Prototipe statis tanpa deployment. Rollback cukup dengan mengembalikan `index.html`, `app.js`, dan `styles.css`.

## Open Questions

Tidak ada yang memblokir. Teks header struk (alamat, NPWP, dll.) bisa ditambah nanti bila user meminta.
