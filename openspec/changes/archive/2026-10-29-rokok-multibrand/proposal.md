## Why

Rokok saat ini hanya dikenal sebagai satu bentuk fee driver tanpa merek. Rokok tidak bisa dijual, tidak punya stok di Persediaan, dan fee rokok di Kasir bahkan tidak tersimpan. Untuk demo, outlet perlu terlihat menjual beberapa merek rokok dan memberi fee driver berupa rokok dari merek tertentu, dengan stok barang dagangan yang ikut berkurang.

## What Changes

**Rokok sebagai barang dagangan**
- From: tidak ada item rokok di `menuData` maupun `finishedStock`.
- To: kategori menu baru "Rokok" berisi Rokok Brand A–E (harga per merek), plus baris stok bernama sama di LPP barang dagangan (satuan bungkus).
- Reason: rokok bisa dijual di Kasir dan Pesanan lewat alur jual yang sudah ada. Setiap merek dipilih sebagai kartu atau baris tersendiri.
- Impact: non-breaking. Tab "Rokok" otomatis muncul di Kasir, form Buat order, dan master menu Admin.

**Fee driver rokok multi-merek**
- From: fee rokok berupa satu angka "Jumlah bungkus rokok" (`{type:'stock', value:n}`). Di Kasir mode biasa nilainya tidak disimpan.
- To: fee rokok berupa daftar merek dan jumlah (`{type:'stock', items:[{name,qty}]}`), dipilih dari kategori Rokok, baik di modal fee Kasir maupun di form Buat order. Fee hanya tampil di baris "Fee driver" (contoh "Brand A ×2, Brand C ×1") dan tidak menjadi baris cart.
- Reason: fee driver bisa berupa beberapa merek sekaligus, dan stoknya harus tercatat.
- Impact: bentuk data `fee` untuk tipe stok berubah. Data contoh order yang memakai `value` dimigrasi.

**Pemotongan stok fee rokok**
- From: fee rokok tidak pernah memotong stok.
- To: transaksi Kasir biasa memotong stok fee rokok saat pembayaran dikonfirmasi. Order Pesanan memotong stok fee rokok saat order menjadi Selesai, bersama stok item.
- Reason: sesuai aturan stok yang ada (bayar Kasir dan order Selesai).
- Impact: LPP barang dagangan untuk merek rokok berkurang.

## Capabilities

### New Capabilities
- `rokok-multibrand`: rokok multi-merek sebagai barang dagangan (kategori menu Rokok, stok di LPP barang dagangan, penjualan di Kasir) dan fee driver rokok multi-merek di Kasir mode biasa, termasuk pemotongan stoknya saat bayar.

### Modified Capabilities
- `scheduled-orders`: requirement "Fee driver sebagai biaya keluar" berubah dari jumlah bungkus menjadi daftar merek rokok. Requirement "Stok dipotong saat order Selesai" kini juga memotong stok fee rokok.

## Impact

- Aplikasi: hanya POS (`index.html`, `app.js`, `styles.css`). Pusat Data (`outlet-data.html`) tidak tersentuh. Alur tutup shift dan format paket ZIP tidak berubah, karena rekap kas hanya menghitung fee tunai.
- `app.js`: `menuData`, `finishedStock`, global state fee Kasir, `feeModal`, `feeText`, `renderCart` (baris fee mode biasa), handler `#finishPay` terakhir, `deductOrderStock`, form Buat order (`renderOrderForm`/`saveOrder`/reset form), data contoh `scheduledOrders`, dan semua titik reset `fee=0`.
- `index.html`: field fee di form Buat order (`#ofFeeFields`).
- `styles.css`: gaya daftar pemilih merek rokok.
- Di luar cakupan: backend dan persistensi; rokok di alur Permintaan barang/PO; master stok/harga rokok yang bisa diedit terpisah dari master menu; fee campuran tunai + rokok dalam satu fee; laporan atau rekap khusus rokok.
