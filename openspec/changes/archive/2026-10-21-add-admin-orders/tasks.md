# Tasks

Semua tugas ada di aplikasi **POS outlet** (`index.html`, `app.js`, `styles.css`). Verifikasi dilakukan manual di browser dengan membuka `index.html`.

## 1. Data dan helper order (app.js)

- [x] 1.1 Tambahkan global `scheduledOrders` berisi empat order contoh sesuai tabel di design.md, serta `let activeOrder=null`. Verifikasi di console: `scheduledOrders.length===4`.
- [x] 1.2 Tambahkan helper berikut, lalu verifikasi di console bahwa `orderMoney` untuk ORD-0920-002 menghasilkan `{total:1200000, paid:500000, rest:700000, state:'Sebagian'}`:
  - `orderMoney(o)` → `{total, paid, rest, state}`;
  - `payPill(o)` / `orderPill(o)` (HTML `.status`);
  - `fmtEta(o)` (mis. "20 Sep 2026 12.00");
  - `nextOrderId()`;
  - `deductOrderStock(o)` dan `completeOrder(o)` (pola `Math.max(0,…)` + `renderInventory()`).

## 2. Akses menu Pesanan (index.html, app.js)

- [x] 2.1 Tambahkan `<button class="nav-item" data-view="orders"><span>☰</span> Pesanan</button>` di antara Persediaan dan Laporan, serta kerangka `<section id="orders" class="view">` (topbar "Pesanan" + tombol "+ Buat order", `#orderListPanel`, `#orderFormPanel.hidden`). Verifikasi: section ada di DOM dan tidak tampil sebelum menu diklik.
- [x] 2.2 Tambahkan `'orders'` ke `ROLE_ACCESS` untuk Kepala Toko dan Administrator. Verifikasi dengan login `budi.leader` dan `admin.rbt`: sidebar menampilkan Persediaan, Pesanan, Laporan, Admin, dan landing tetap Laporan. Login `ayu.kasir`: tidak ada perubahan.
- [x] 2.3 Perbarui teks panel `#adminAccess` sesuai spec `pos-access-control`. Verifikasi: tab "Hak akses" memuat Pesanan untuk Kepala Toko (outletnya) dan Administrator.

## 3. Daftar dan detail order (app.js, styles.css)

- [x] 3.1 Implementasikan `renderOrders()` dengan:
  - chip filter Semua/Open/Selesai;
  - `<select>` outlet (hanya Administrator);
  - pencarian;
  - `tableHtml(['ESTIMASI','NO','PELANGGAN','OUTLET','TOTAL','BAYAR','STATUS'],…)` diurutkan berdasarkan estimasi;
  - data dari `visibleOrders()`.

  Panggil fungsi ini saat startup dan setelah `loginAs`. Verifikasi:
  - Administrator melihat 4 order dan filter outlet bekerja;
  - Kepala Toko hanya melihat 3 order 519A tanpa filter outlet;
  - filter "Selesai" dan pencarian "maju" sesuai spec.
- [x] 3.2 Implementasikan `openOrderDetail(id)` (modal: ringkasan, item, riwayat bayar, fee, dibayar, sisa/lebih bayar) yang dipasang ke klik baris tabel. Verifikasi: detail ORD-0920-002 menampilkan DP Rp500.000 QRIS, sisa Rp700.000, dan "Fee driver Rp50.000" terpisah.
- [x] 3.3 Implementasikan "Catat pembayaran" (nominal + metode Tunai/QRIS/Kartu debit, validasi `0<n≤sisa`, toast "Pembayaran tercatat" / "Nominal melebihi sisa tagihan") dan sembunyikan tombolnya bila sisa ≤ 0. Verifikasi: lunasi ORD-0919-004 yang berstatus Selesai, maka statusnya menjadi Lunas.
- [x] 3.4 Implementasikan "Selesaikan order" dengan konfirmasi → `completeOrder` → toast "Order selesai. LPP barang dagangan diperbarui.". Verifikasi: selesaikan ORD-0920-002, maka stok Nasi Box 30K di Persediaan turun 30 (48→18), Es teh manis turun 50, dan order hilang dari filter Open.
- [x] 3.5 Tambahkan CSS `.status.over`, chip filter, dan toolbar daftar order. Verifikasi: pill keempat status bayar terbaca jelas.

## 4. Form Buat order (index.html, app.js, styles.css)

- [x] 4.1 Buat markup `#orderFormPanel` dua kolom:
  - kiri: informasi order (outlet, pelanggan, HP, tanggal, jam, catatan) + tab kategori `#ofTabs` + pencarian + `#ofGrid`;
  - kanan: `#ofSummary`, pembayaran awal, fee driver opsional, status awal, tombol "Batal" / "Simpan order".

  Verifikasi: "+ Buat order" membuka form, dan "Batal" kembali ke daftar.
- [x] 4.2 Isi grid dari `menuData` (semua kategori, tanpa cek stok). Klik kartu menambah qty 1 ke `orderDraft`. Ringkasan menyediakan −/+ dan input qty yang bisa diketik (qty 0 menghapus item), serta subtotal. Verifikasi: kategori Premium menampilkan 4 menu, dan Nasi Box 30K qty 30 menghasilkan Rp900.000.
- [x] 4.3 Tampilkan field outlet per peran (Kepala Toko: terkunci ke `session.outlet`; Administrator: select dari `outlets`). Tambahkan pilihan pembayaran awal (Belum bayar / Sebagian + nominal / Lunas, + metode), checkbox fee (tunai nominal / rokok bungkus), dan status awal (Open default / Selesai + catatan "Stok akan dipotong saat disimpan"). Verifikasi secara visual untuk kedua peran.
- [x] 4.4 Simpan order dengan validasi sesuai spec ("Nama pelanggan wajib diisi", "Estimasi tanggal dan jam wajib diisi", "Pilih minimal satu item", "Nominal sebagian harus lebih dari 0 dan kurang dari total"). Order tersimpan dengan `id=nextOrderId()`, `payments`, `fee`, `status`, dan `createdBy`. Bila Selesai, jalankan `deductOrderStock` dan tampilkan toast "Order tersimpan dan stok dipotong". Bila Open, toast "Order tersimpan". Form lalu kembali ke daftar. Verifikasi setiap toast validasi, lalu buat order DP dan order Selesai dan cek daftar serta stok.

## 5. Mode order di Kasir (index.html, app.js, styles.css)

- [x] 5.1 Buat `openOrderPicker()`, dipasang ke `.customer-row button`: modal radio "Umum" + order Open dengan `outlet===session.outlet`, diurutkan berdasarkan estimasi, lengkap dengan jam, no, pelanggan, total, dan pill. Saat "Pilih", isi `activeOrder` dan `cart` dari item tersimpan (`saved:true`). Saat Umum, lepaskan order. Verifikasi dengan login `ayu.kasir`: modal menampilkan ORD-0920-001/002/003, tanpa ORD-0919-004.
- [x] 5.2 Ubah `addToCart` (tidak menggabung ke baris `saved`) dan `renderCart` (satu-satunya definisi):
  - header cart dan baris pelanggan menampilkan no, nama, estimasi, dan pill;
  - baris tersimpan tanpa −/+;
  - totals Total/Dibayar/Sisa atau baris `.over-line` "Lebih bayar";
  - fee sebagai info;
  - label tombol bayar "Terima pembayaran" / "Lunas" / "Lebih bayar" + `disabled`;
  - `.stock-note` mode order.

  Mode Umum tidak berubah. Verifikasi: pilih ORD-0920-002 lalu tambah Es jeruk, maka sisa naik Rp8.000 per item. Pilih ORD-0920-001, maka tombol menjadi "Lunas" nonaktif.
- [x] 5.3 Tambahkan `activeOrder=null` ke handler `#newOrder` (app.js:27). Verifikasi: "+ Pesanan baru" mengembalikan baris Pelanggan ke "Umum".
- [x] 5.4 Ubah penugasan `#payButton` **terakhir** (app.js:121): bila ada `activeOrder`, panggil `openOrderPayment()`. Fungsi ini menampilkan modal nominal (default sisa, 0..sisa) + metode, dengan validasi "Nominal melebihi sisa tagihan". Saat konfirmasi: simpan baris baru ke order, catat pembayaran bila n>0, lepas order, lalu tampilkan toast "Pembayaran order tercatat" / "Order diperbarui tanpa pembayaran". Stok tidak dipotong. Verifikasi alur skenario ORD-0920-002 + Es jeruk ×5 = Rp740.000 → Lunas di halaman Pesanan, dan LPP tidak berubah.
- [x] 5.5 Ubah `feeModal` dan visibilitas `#addFee`: di mode order, fee yang sudah ada tampil "(dari order)" dan tombol disembunyikan. Bila belum ada fee, simpan ke `activeOrder.fee` tanpa mengubah total. Verifikasi: ORD-0920-002 tidak menampilkan tombol fee. ORD-0920-003 bisa diisi Rp20.000, terlihat di detail Admin, lalu terkunci saat dipilih lagi.
- [x] 5.6 Tambahkan CSS untuk info order di header cart, label baris "tersimpan" / "baru", `.over-line`, dan tombol bayar `disabled`. Verifikasi secara visual di mode order dan Umum.

## 6. Pembatalan item order (app.js)

- [x] 6.1 Perluas `openCancel` **terakhir** (app.js:99): untuk baris `saved`, tambahkan input "Jumlah dibatalkan", username Kepala Toko (otomatis `shiftLeader(closingShift())`), dan kata sandi, dengan validasi seperti `closeShiftAuth` (toast "Kredensial Kepala Toko tidak valid", "Hanya Kepala Toko Shift n (nama) yang dapat menyetujui pembatalan ini"). Setelah valid, kurangi qty di `activeOrder.items` dan `cart`, tambah baris `cancelLog`, lalu jalankan `renderCart()` dan `renderCancelHistory()`. Baris baru tetap memakai alur lama. Verifikasi skenario `item-cancellation`: batalkan 5 dari 30 Nasi Box di ORD-0920-002, lalu coba `rina.leader` dan kata sandi salah.
- [x] 6.2 Hapus salinan `openCancel` lama yang sudah mati (app.js:21). Verifikasi: pembatalan di transaksi Umum masih berjalan dan histori pembatalan bertambah.
- [x] 6.3 Verifikasi lebih bayar: pilih ORD-0920-001 (lunas) lalu batalkan 2 Nasi Box 25K dengan otorisasi. Cart dan daftar Pesanan harus menampilkan "Lebih bayar Rp50.000".

## 7. Verifikasi alur lengkap

- [x] 7.1 Jalankan alur end-to-end di browser:
  1. Administrator membuat order untuk Sekulan RBT 519A dengan DP dan tanpa fee.
  2. Logout, lalu Kasir `ayu.kasir` memulai shift, memilih order tersebut, menambah item, mengisi fee, dan melunasi sebagian.
  3. Logout, lalu Kepala Toko `budi.leader` membuka Pesanan, mencatat sisa, dan menyelesaikan order.

  Cek pill di setiap langkah, LPP yang terpotong hanya saat Selesai, dan tidak ada error di console.
