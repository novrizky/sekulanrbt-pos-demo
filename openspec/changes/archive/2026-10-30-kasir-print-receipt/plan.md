# Cetak Struk Kasir Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Setelah konfirmasi bayar (Kasir biasa dan pesanan), tampilkan modal "Pembayaran berhasil" dengan tombol "Cetak struk" yang mencetak struk roll thermal 58 mm.

**Architecture:** Helper global di `app.js` (`nextTrx`, `receiptHtml`, `printReceipt`, `openReceiptModal`) dipanggil dari `#finishPay` (handler `#payButton` terakhir, `app.js:156`) dan `#kpSave` (`openOrderPayment`, `app.js:303`). Cetak meniru pola `#poPrint`: container tersembunyi `#receiptPrint`, class `body.print-receipt`, `window.print()`, dan named page `@page receipt`.

**Tech Stack:** HTML/CSS/JS browser biasa (tanpa module), headless Chrome untuk harness.

**Spec:** `openspec/changes/kasir-print-receipt/specs/kasir-receipt-print/spec.md`, `design.md` (D1–D7), dan `tasks.md` di folder yang sama.

## Global Constraints

- Semua teks UI berbahasa Indonesia. Teks persis: "Pembayaran berhasil", "Cetak struk", "Selesai", "Sisa tagihan", "Total pesanan", "Sudah dibayar", "Bayar sekarang", "TOTAL", "Terima kasih", "SEKULAN RBT 519A".
- Toast lama tidak berubah: "Pembayaran berhasil. LPP barang dagangan diperbarui.", "Pembayaran order tercatat", "Order diperbarui tanpa pembayaran".
- Nomor `TRX-0920-<n>` mulai 1088. Tanggal struk `20/09/2026`.
- Angka di struk memakai `toLocaleString('id-ID')` tanpa "Rp". Modal memakai `rupiah()`.
- Fee driver tidak pernah tercetak. Tidak ada input uang diterima atau kembalian.
- Gaya kode: padat, template literal + `innerHTML`, handler `.onclick=`. Jangan memformat ulang file.
- Tanpa commit, branch, atau worktree (commit hanya atas permintaan user). Snapshot `index.html`, `app.js`, `styles.css` ke `.superpowers/sdd/<plan>/base/` sebelum mulai. Harness di `.superpowers/sdd/<plan>/harness/` sesuai CLAUDE.md, tidak boleh di tree proyek.
- Salinan mati `#payButton` di `app.js:47` tidak disentuh.

## Review Focus

1. **Cetak PO/Laporan setelah cetak struk.** `@page` global atau class `print-receipt` yang tertinggal akan merusak cetak lain. Ekspektasi: class dilepas setelah print dan `@page` hanya named. Dites di Task 1 (class dilepas) dan Task 4 (screenshot/preview).
2. **Snapshot sebelum reset.** Bila `r` dibangun setelah `cart=[]`, struk akan kosong. Dites di Task 2 (item struk ada setelah cart kosong).
3. **Fee rokok** (`feeRokok`) tidak boleh muncul di struk, sama seperti fee tunai. Dites di Task 2.
4. **Pembayaran pesanan nominal 0** tidak boleh menghabiskan nomor TRX. Dites di Task 3 (transaksi berikutnya tetap berurutan).
5. **Nama item panjang** (mis. "Ayam geprek + nasi", "Paket Keluarga 35K") harus terbungkus dalam lebar 58 mm, tidak terpotong. Cek di screenshot Task 4.

---

### Task 1: Container, gaya struk, dan helper cetak

**Files:**
- Modify: `index.html` (setelah `<div id="poPrint"></div>`, ±baris 201)
- Modify: `styles.css` (dekat `#poPrint{display:none}` baris 71 dan blok `@media print` baris 78)
- Modify: `app.js` (tambah helper di akhir file)
- Test: `.superpowers/sdd/<plan>/harness/test.js`

**Interfaces:**
- Produces:
  - `let trxSeq=1088`; `nextTrx()` → `string` (`'TRX-0920-1088'`, lalu naik)
  - Objek struk `r`: `{no, time /* 'HH.MM' */, cashier, items:[{name,price,qty}], method, total /* number, Σ item */, shown /* string Rupiah untuk angka besar modal */, order? : {id, customer, total, paidBefore, paidNow, rest}}`
  - `receiptHtml(r)` → `string` HTML berakar `<div class="receipt">`
  - `printReceipt(r)` → `void`: isi `#receiptPrint`, `body.classList.add('print-receipt')`, `window.print()`, `remove('print-receipt')`
  - `openReceiptModal(r)` → `void`: `openModal()` berisi `h2` "Pembayaran berhasil", nomor TRX dan waktu, angka besar `r.shown`, metode, baris `${order.id} • ${order.customer}` dan "Sisa tagihan ${rupiah(order.rest)}" bila `r.order`, tombol `[data-close]` "Selesai" dan `#printReceipt` "Cetak struk" (onclick → `printReceipt(r)`, modal tidak ditutup)

- [ ] **Step 1: Buat harness dan tulis tes yang gagal**

Salin `index.html` ke `harness/harness.html` dengan `sed` (path `styles.css`/`app.js` mengarah ke proyek, lalu tambah `<script src="test.js"></script>`). Di `test.js`, stub `window.print=()=>printed.push({html:$('#receiptPrint').innerHTML,cls:document.body.className})`. Tes:
- `nextTrx()==='TRX-0920-1088'` lalu `'TRX-0920-1089'` (reset `trxSeq=1088` setelahnya)
- `receiptHtml(rKasir)` dengan `rKasir={no:'TRX-0920-1088',time:'14.32',cashier:'Ayu Setiani',items:[{name:'Paket Favorit 25K',price:25000,qty:3},{name:'Es teh manis',price:6000,qty:1}],method:'Tunai',total:81000,shown:'Rp76.000'}` memuat `SEKULAN RBT 519A`, `TRX-0920-1088`, `20/09/2026 14.32`, `Ayu Setiani`, `3 x 25.000`, `75.000`, `1 x 6.000`, `TOTAL`, `81.000`, `Tunai`, `Terima kasih`, dan TIDAK memuat `fee`/`Fee`
- `receiptHtml(rOrder)` dengan `order:{id:'ORD-0920-002',customer:'PT Maju Jaya',total:900000,paidBefore:200000,paidNow:200000,rest:500000}` memuat `ORD-0920-002 • PT Maju Jaya`, `Total pesanan`, `900.000`, `Sudah dibayar`, `Bayar sekarang`, `(QRIS)`, `Sisa tagihan`, `500.000`
- `openReceiptModal(rKasir)`: `#modalContent h2` = "Pembayaran berhasil", teks memuat `Rp76.000` dan `Tunai`, ada `#printReceipt`. Klik `#printReceipt`: `printed.length===1`, `printed[0].cls` memuat `print-receipt`, `printed[0].html` memuat `81.000`, setelah itu `document.body.classList.contains('print-receipt')===false`, dan `#modalBackdrop` masih `.open`

- [ ] **Step 2: Jalankan harness, pastikan FAIL**

Run: `chrome.exe --headless=new --allow-file-access-from-files --window-size=1440,1000 --dump-dom file:///…/harness/harness.html`
Expected: baris `FAIL` (`nextTrx is not defined`)

- [ ] **Step 3: Implementasi**

`index.html`: `<div id="receiptPrint"></div>`. `styles.css`: `#poPrint,#receiptPrint{display:none}` (atau aturan terpisah); `.receipt{page:receipt;width:58mm;padding:3mm;box-sizing:border-box;font:9px/1.35 "Courier New",monospace;color:#000;background:#fff}`, header rata tengah, pemisah `border-top:1px dashed #000`, baris `display:flex;justify-content:space-between`, nama item `word-break:break-word`, TOTAL tebal. Di `@media print`: `body.print-receipt>*{display:none!important}`, `body.print-receipt #receiptPrint{display:block!important}`, `body.print-receipt{background:#fff}`, `@page receipt{size:58mm auto;margin:0}`. Gaya modal sukses: pakai pola angka besar yang sama dengan modal "Pembayaran" (`font:700 34px 'Fraunces'`) dan `.modal-actions`. `app.js`: empat helper sesuai Interfaces.

- [ ] **Step 4: Jalankan harness, pastikan PASS**

Expected: semua baris Task 1 `PASS`

### Task 2: Sambungkan ke pembayaran Kasir biasa

**Files:**
- Modify: `app.js:156` (`$('#payButton').onclick` terakhir, bagian `#finishPay`)
- Test: `harness/test.js`

**Interfaces:**
- Consumes: `nextTrx`, `openReceiptModal` (Task 1)
- Produces: tidak ada API baru. `<select>` metode di modal "Pembayaran" mendapat `id="payMethod"`

- [ ] **Step 1: Tulis tes yang gagal**

Login `ayu.kasir`/`demo123` dan lewati Mulai Shift (`#startShift` → isi `#openingCash` dengan kas sebelumnya → `#verifyStart`). Set `cart=[{name:'Paket Favorit 25K',price:25000,qty:3},{name:'Es teh manis',price:6000,qty:1}];fee=0;feeRokok=[];renderCart()`, klik `#payButton`, set `#payMethod`='Tunai', klik `#finishPay`. Assert: `#toast` = "Pembayaran berhasil. LPP barang dagangan diperbarui."; `cart.length===0`; `#modalContent h2`="Pembayaran berhasil"; teks memuat `TRX-0920-1088`, `Rp81.000`, `Tunai`. Klik `#printReceipt` → html struk memuat `81.000`, `3 x 25.000`.
Tes kedua: `fee=5000` dan item yang sama → modal memuat `Rp76.000` dan `TRX-0920-1089`, struk memuat `TOTAL` `81.000` dan tidak memuat `5.000`.
Tes ketiga (Review Focus 3): `feeRokok=[{name:'Rokok Brand A',qty:2}]` → struk tidak memuat `Rokok Brand A`.
Klik `[data-close]` "Selesai" → `#modalBackdrop` tidak `.open`.

- [ ] **Step 2: Jalankan harness, pastikan FAIL** (modal sukses tidak muncul)

- [ ] **Step 3: Implementasi**

Di `#finishPay.onclick`, sebelum `cutFinished`: `const r={no:nextTrx(),time:<jam lokal 'HH.MM'>,cashier:session.name,items:cart.map(x=>({name:x.name,price:x.price,qty:x.qty})),method:$('#payMethod').value,total:Σ price*qty,shown:$('#grandTotal').textContent}`. Setelah toast yang ada, panggil `openReceiptModal(r)`.

- [ ] **Step 4: Jalankan harness, pastikan PASS**

### Task 3: Sambungkan ke pembayaran pesanan

**Files:**
- Modify: `app.js:303` (`openOrderPayment`, `#kpSave.onclick`)
- Test: `harness/test.js`

**Interfaces:**
- Consumes: `nextTrx`, `openReceiptModal`, `orderMoney(o)` → `{total,paid,rest}`

- [ ] **Step 1: Tulis tes yang gagal**

Login sebagai Kasir. `const o=scheduledOrders.find(x=>x.id==='ORD-0920-002');activeOrder=o;cart=o.items.map(x=>({...x,saved:true}));renderCart()`. Simpan `before=orderMoney(o)` (asumsi sisa 700.000; pakai `before.rest` di assertion). Klik `#payButton`, set `#kpAmount`=200000 (dispatch `input`), `#kpMethod`='QRIS', klik `#kpSave`. Assert: toast "Pembayaran order tercatat"; modal "Pembayaran berhasil" memuat `ORD-0920-002 • PT Maju Jaya`, `Rp200.000`, `QRIS`, `Sisa tagihan ${rupiah(before.rest-200000)}`. Struk memuat `Total pesanan`, `Sudah dibayar` dengan `before.paid.toLocaleString('id-ID')`, `Bayar sekarang`, `(QRIS)`.
Tes nominal 0 (Review Focus 4): pilih order lagi, `#kpAmount`=0, `#kpSave` → toast "Order diperbarui tanpa pembayaran", `#modalBackdrop` tidak `.open`. Lalu satu pembayaran Kasir biasa → nomor = nomor sebelumnya + 1 (tidak terlewat).

- [ ] **Step 2: Jalankan harness, pastikan FAIL**

- [ ] **Step 3: Implementasi**

Di `#kpSave.onclick`, setelah validasi nominal: `const paidBefore=orderMoney(o).paid`. Setelah item dan pembayaran tersimpan dan sebelum reset cart: bila `n>0`, `const m=orderMoney(o),r={no:nextTrx(),time,cashier:session.name,items:o.items.map(x=>({name:x.name,price:x.price,qty:x.qty})),method:$('#kpMethod').value,total:m.total,shown:rupiah(n),order:{id:o.id,customer:o.customer,total:m.total,paidBefore,paidNow:n,rest:m.rest}}`. Setelah toast, `if(r)openReceiptModal(r)`.

- [ ] **Step 4: Jalankan harness, pastikan PASS** (termasuk semua tes Task 1–2)

### Task 4: Verifikasi tampilan cetak

**Files:** tidak ada perubahan kode (kecuali perbaikan dari temuan)

- [ ] **Step 1: Screenshot struk**

Buat `harness/receipt.html` yang memuat `styles.css` + `app.js`, lalu langsung `document.body.className='print-receipt'` dan isi `#receiptPrint` dengan `receiptHtml` dua contoh (Kasir dan pesanan, termasuk item panjang "Paket Keluarga 35K" dan "Ayam geprek + nasi"). Jalankan `chrome.exe --headless=new --print-to-pdf=…/receipt.pdf --no-pdf-header-footer file:///…/receipt.html` dan buka PDF tersebut. Expected: halaman selebar 58 mm, hanya struk, teks tidak terpotong.

- [ ] **Step 2: Cek cetak lain tidak berubah**

Print-to-pdf `harness.html` dengan `body.print-po` + `#poPrint` berisi `poDocHtml(materialRequests[0])`. Expected: ukuran halaman default (A4/Letter), bukan 58 mm.

- [ ] **Step 3: Laporkan ke user**

Laporkan hasil harness dan PDF, lalu sarankan satu kali klik manual di Chrome nyata: bayar, "Cetak struk", print preview (pilih printer/kertas 58 mm), dan pastikan modal tetap terbuka setelah dialog ditutup.
