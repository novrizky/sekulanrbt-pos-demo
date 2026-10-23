# Design

## Context

Lihat proposal.md untuk motivasi. Kondisi kode yang membentuk pendekatan ini:

- **Cart**: `cart` hanya berisi satu array global berbentuk `{name, price, qty}`.
  - `renderCart` ([app.js:19](../../../app.js)) menghitung `grand = sub - fee`.
  - Handler `#payButton` yang **terakhir** ada di app.js:121 (salinan lama di baris 27 tertimpa). Handler ini memotong `finishedStock` lalu mengosongkan cart.
- **Pembatalan item**: `openCancel` dideklarasikan dua kali, dan yang aktif adalah salinan **terakhir** di app.js:99. Polanya: modal alasan + catatan, `cancelLog.unshift([...7 kolom])`, lalu `renderCancelHistory()`.
- **Tombol Pelanggan**: `.customer-row button` ("Ubah") di index.html belum punya handler.
- **Otorisasi Kepala Toko**: `closeShiftAuth` sudah punya pola `findAccount` + cek role, outlet, dan shift dengan `shiftLeader(n)` / `closingShift()`.
- **Akses menu**: `ROLE_ACCESS` dan `loginAs` menampilkan atau menyembunyikan `.nav-item[data-view]` lewat `access.views`.
- **Data menu dan stok**:
  - `menuData` berisi semua menu dalam bentuk array posisional `[nama, harga, deskripsi, kode]` per kategori.
  - `finishedStock` hanya berisi 5 item.
  - `outlets[].name` berisi nama outlet, dan `session.outlet` memakai nama yang sama (mis. "Sekulan RBT 519A").

## Goals / Non-Goals

**Goals:**
- Satu sumber data order (`scheduledOrders`) dipakai oleh halaman Pesanan dan mode order di Kasir.
- Memakai ulang pola UI yang sudah ada: `openModal`, `tableHtml`, `.status` pill, kelas `.menu-card`, `.cart-item`, `.totals`, dan `.panel`.
- Perilaku transaksi "Umum" tidak berubah.

**Non-Goals:**
- Tidak mengedit header atau item order dari halaman Pesanan setelah order dibuat (kecuali status dan pembayaran).
- Tidak menyimpan perubahan cart yang belum dikonfirmasi saat kasir berpindah order.
- Tidak mengubah `salesRows`, `CLOSING_CASH`, BA, maupun paket shift.

## Decisions

### 1. Model data: array objek `scheduledOrders`, bukan array posisional
Order punya bagian bertingkat (item, pembayaran, fee), jadi objek lebih mudah dibaca daripada array posisional. Bentuknya:
```
{id:'ORD-0920-002', outlet:'Sekulan RBT 519A', customer:'PT Maju Jaya', phone:'0812-...',
 date:'2026-09-20', time:'12:00', note:'Antar ke kantor lt.3',
 items:[{name,price,qty}], payments:[{amount,method,by,at}],
 fee:null | {type:'cash'|'stock', value}, status:'Open'|'Selesai', createdBy:'Raka Administrator'}
```
Nilai turunan dihitung oleh satu helper `orderMoney(o)` → `{total, paid, rest, state}` dengan `state ∈ 'Belum bayar'|'Sebagian'|'Lunas'|'Lebih bayar'`. Status bayar tidak pernah disimpan, sehingga tidak bisa tidak sinkron dengan data pembayarannya.

Data contoh (empat order):

| ID | Outlet | Pelanggan | Estimasi | Item | Bayar | Fee | Status |
|---|---|---|---|---|---|---|---|
| ORD-0920-001 | Sekulan RBT 519A | Bu Sari | 20 Sep 10:30 | Nasi Box 25K ×20 | 500.000 Tunai | – | Open (Lunas) |
| ORD-0920-002 | Sekulan RBT 519A | PT Maju Jaya | 20 Sep 12:00 | Nasi Box 30K ×30, Es teh manis ×50 | 500.000 QRIS | tunai 50.000 | Open (Sebagian) |
| ORD-0920-003 | Sekulan RBT 519A | Pak Dodi | 20 Sep 15:00 | Paket Keluarga 35K ×10 | – | – | Open (Belum bayar) |
| ORD-0919-004 | Sekulan RBT 519B | Pak Anto | 19 Sep 18:00 | Premium 50K ×15 | – | rokok 2 | Selesai (Belum bayar) |

Nomor order baru dibuat dengan `ORD-0920-${String(n).padStart(3,'0')}` mengikuti pola `<PREFIX>-<MMDD>-<urutan>` (tanggal demo tetap 20 Sep).

Alternatif lain adalah array posisional seperti `cancelLog`. Pilihan ini ditolak karena item dan pembayaran bersarang dan rawan salah indeks.

### 2. Halaman Pesanan = `section#orders.view` baru dengan dua mode (daftar ↔ form)
- Tambahkan `<button class="nav-item" data-view="orders">` di antara Persediaan dan Laporan.
- `ROLE_ACCESS['Kepala Toko'].views` dan `['Administrator'].views` mendapat `'orders'`. `home` tetap `reports`.
- Handler nav di app.js:26 sudah generik, jadi tidak perlu diubah.
- Isi section:
  - `#orderListPanel`: filter chip status, `<select>` outlet (disembunyikan untuk Kepala Toko), pencarian, dan tabel dari `tableHtml`.
  - `#orderFormPanel`: form dua kolom.
- Fungsi `showOrderForm(bool)` menukar kelas `hidden`.
- Form memakai ulang kelas `.pos-layout`, `.menu-pane`, `.category-tabs`, `.menu-grid`, `.menu-card`, dan `.cart-pane` dengan **ID sendiri** (`#ofTabs`, `#ofGrid`, `#ofSummary`, dst.) agar tidak bentrok dengan `#menuGrid` atau `#categoryTabs` milik Kasir.
- State form disimpan di global `orderDraft` (`{category, items:[]}`), lalu dirender oleh `renderOrderForm()` / `renderOrderDraft()`.
- Item diambil langsung dari `menuData[kategori]` tanpa melihat `finishedStock`.

Alternatif lain adalah tab di Admin atau modal. Keduanya ditolak: user memilih menu sidebar, dan modal selebar 440px terlalu sempit untuk grid menu.

### 3. Pembatasan per peran dibaca dari `session`
- `visibleOrders()` mengembalikan `scheduledOrders` yang difilter:
  - Kepala Toko → `o.outlet === session.outlet`;
  - Administrator → semua, lalu filter outlet pilihan.
- Field Outlet di form:
  - Kepala Toko → `<input disabled value=session.outlet>`;
  - Administrator → `<select>` dari `outlets.map(x=>x.name)`.

### 4. Detail order = `openModal` dengan aksi
Klik baris tabel membuka `openOrderDetail(id)`. Isinya:
- ringkasan (`.ba-summary`);
- daftar item;
- riwayat pembayaran;
- fee;
- tombol "Catat pembayaran" (bila `rest > 0`) dan "Selesaikan order" (bila Open).

"Catat pembayaran" membuka modal nominal + metode dengan validasi `0 < n ≤ rest`. "Selesaikan order" meminta konfirmasi lalu memanggil `completeOrder(o)`, yang mengatur `status='Selesai'` dan menjalankan `deductOrderStock(o)`. Fungsi `deductOrderStock(o)` memakai pola yang sama dengan pembayaran: `finishedStock.find` → `Math.max(0, qty - n)`, lalu `renderInventory()`. Fungsi yang sama dipakai saat order dibuat langsung Selesai.

### 5. Mode order di Kasir: global `activeOrder` + cart berisi baris bertanda
- `let activeOrder = null`.
- Saat order dipilih, `cart` diisi ulang dari `activeOrder.items` dengan baris `{name, price, qty, saved:true}`. Item yang ditambah lewat `addToCart` masuk sebagai baris `saved:false` terpisah, walaupun namanya sama dengan item tersimpan.
- `addToCart` hanya menggabungkan qty dengan baris yang `!x.saved`.
- **`renderCart` (satu-satunya definisi, app.js:19) diubah:**
  - Baris tersimpan tidak punya −/+ dan diberi label "tersimpan".
  - Bila `activeOrder` ada, totals menampilkan Total (`saved+baru`), Dibayar, dan Sisa atau Lebih bayar.
  - Fee tampil sebagai info dan tidak dikurangkan.
  - Label tombol bayar dan kondisi `disabled` mengikuti nilai sisa.
  - Header cart (`.cart-head h2`, `.customer-row strong/small`) dan `.stock-note` diperbarui.
  - Saat `activeOrder` kosong, perilakunya sama persis seperti sekarang.
- **Tombol "Ubah"**: `$('.customer-row button').onclick = openOrderPicker`. Modal berisi radio Umum + order Open dengan `outlet === session.outlet`, diurutkan `date+time`.
- **`#newOrder`** (handler di app.js:27, satu-satunya): ditambah `activeOrder=null`.
- **`#payButton`**: penugasan **terakhir** di app.js:121 diubah menjadi `if(activeOrder) return openOrderPayment(); …perilaku lama…`. Fungsi `openOrderPayment` memvalidasi `0 ≤ n ≤ rest`, lalu:
  1. memindahkan baris `saved:false` ke `activeOrder.items` (gabung qty bila nama sama);
  2. menambah pembayaran bila `n > 0` (`by: session.name`);
  3. melepas order (`activeOrder=null; cart=[]`) dan menampilkan toast.
  Stok tidak dipotong.
- **`feeModal`** (satu definisi, app.js:22, dipasang ke `#addFee` di app.js:27): bila `activeOrder` ada, hasil simpan masuk ke `activeOrder.fee = {type, value}` dan global `fee` tidak disentuh. `#addFee` disembunyikan saat `activeOrder?.fee` sudah ada.

### 6. Pembatalan item tersimpan: perluas `openCancel` terakhir (app.js:99)
Bila `cart[i].saved`, modal mendapat tambahan input "Jumlah dibatalkan" (default qty), username Kepala Toko (diisi otomatis `shiftLeader(closingShift())?.username`), dan kata sandi. Validasinya meniru `closeShiftAuth`: `findAccount`, role `Kepala Toko`, aktif, outlet `Sekulan RBT 519A`, dan shift = `Shift ${closingShift()}`. Setelah valid:
- qty di `activeOrder.items` dan di `cart[i]` dikurangi (baris dihapus bila 0);
- baris `cancelLog` ditambahkan dengan nama item, ditambah ` ×n` bila sebagian;
- `renderCart()` dan `renderCancelHistory()` dijalankan.

Salinan `openCancel` yang lama di app.js:21 sudah mati, jadi **dihapus** sekalian agar tidak membingungkan.

Alternatif lain adalah membuat modal pembatalan terpisah untuk order. Pilihan ini ditolak karena alasan, catatan, dan aturan "Lainnya" akan terduplikasi.

### 7. Penanda status
- Pill status bayar memakai `.status`:
  - Lunas → `.status.live`;
  - Sebagian/Belum bayar → `.status.alert`;
  - Lebih bayar → kelas baru `.status.over` (amber/merah).
- Status order Selesai → `.status` default; Open → `.status.live`.
- Baris "Lebih bayar" di totals memakai kelas baru `.over-line`.

## Risks / Trade-offs

- [Kasir menambah item lalu memilih order lain atau "Umum" tanpa konfirmasi, sehingga item baru hilang] → Ini perilaku yang disengaja untuk demo dan tertulis di spec ("item baru yang belum disimpan dibuang").
- [Fee yang diisi kasir langsung tersimpan ke order sebelum pembayaran dikonfirmasi] → Pilihan ini disengaja agar fee tidak tercatat ganda di shift lain, sesuai keputusan explore.
- [`renderCart` menjadi bercabang dua mode] → Cabang order dibuat dalam fungsi helper `renderOrderTotals()` sehingga cabang Umum tetap terbaca seperti sekarang.
- [Selector global seperti `$('.fee-options')` dan `#feeInput` dipakai ulang di dua konteks] → Form order memakai ID sendiri (`#ofFeeType`, `#ofFeeValue`), sedangkan fee di Kasir tetap memakai `feeModal` yang sama.
- [Order Selesai di outlet lain memotong `finishedStock` yang sebenarnya stok satu outlet] → Untuk demo hal ini diterima, karena prototipe hanya punya satu buku stok.
