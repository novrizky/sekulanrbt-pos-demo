## Why

Rokok dan air mineral dibeli dari pemasok lalu dijual utuh. Sekarang rokok hanya ada di LPP barang dagangan, sehingga tidak bisa di-restock lewat "+ Stok masuk" maupun Permintaan barang/PO. Air mineral bahkan tidak punya stok sama sekali, jadi penjualannya tidak memotong apa pun. Untuk demo, barang seperti ini perlu terlihat dibeli lewat jalur bahan baku dan dijual lewat Kasir, dengan satu angka stok yang sama di kedua tab LPP.

## What Changes

**Item bersama (stok tersambung)**
- From: rokok Brand A–E hanya ada di `finishedStock`, dan air mineral tidak punya baris stok.
- To: Rokok Brand A–E dan Air mineral menjadi item bersama. Setiap item tampil di LPP bahan baku dan LPP barang dagangan dengan stok, minimum, dan biaya per unit yang sama, ditandai badge "Tersambung".
- Reason: satu barang fisik harus punya satu angka stok, apa pun perannya.
- Impact: non-breaking. Tab bahan baku bertambah 6 item.

**Restock lewat jalur bahan baku**
- From: "+ Stok masuk" dan Permintaan barang/PO hanya untuk bahan baku murni.
- To: item bersama bisa dipilih di "+ Stok masuk" dan di form Permintaan barang. Penerimaan stok masuk maupun penerimaan PO menambah stok dan memperbarui biaya per unit yang juga terlihat di LPP barang dagangan. Tidak ada tombol stok masuk baru di tab barang dagangan, dan teks modul tidak diubah.
- Reason: rokok dan air mineral dibeli dari pemasok seperti bahan baku.
- Impact: non-breaking.

**Penjualan memotong stok yang sama**
- From: penjualan rokok hanya memotong LPP barang dagangan, dan penjualan air mineral tidak memotong apa pun.
- To: Kasir bayar, order Selesai, dan fee rokok memotong item bersama, sehingga stok di tab bahan baku ikut turun.
- Impact: non-breaking. Aturan waktu potong stok tidak berubah.

**Penyesuaian ringkasan dan produksi**
- Kartu "Stok menipis" menghitung item bersama satu kali.
- Item bersama tidak muncul di modal "Catat hasil produksi", baik sebagai bahan maupun sebagai hasil.

## Capabilities

### New Capabilities
- `shared-stock-item`: item bersama yang tercatat sekaligus sebagai bahan baku dan barang dagangan dengan satu stok. Mencakup tampilan di kedua tab LPP dengan badge "Tersambung", restock lewat stok masuk dan PO, pemotongan oleh penjualan dan fee rokok, serta pengecualian dari modal produksi.

### Modified Capabilities
- `raw-material-request`: requirement "Data bahan baku dan definisi Menipis konsisten" berubah. Data bahan baku kini juga berisi item bersama, dan kartu "Stok menipis" menghitung setiap item satu kali walaupun item tampil di kedua LPP.

## Impact

- Aplikasi: hanya POS, dan hanya `app.js` yang berubah (badge memakai kelas `.line-tag` yang sudah ada, jadi `index.html` dan `styles.css` tidak berubah). Pusat Data (`outlet-data.html`) tidak tersentuh. Alur tutup shift dan format paket ZIP tidak berubah.
- `app.js`: data `rawStock` / `finishedStock` (item bersama, termasuk memindahkan rokok dari `finishedStock`), `renderInventory` terakhir (badge dan hitungan stok menipis), dan `productionModal` (penyaringan item bersama). Alur stok masuk, Permintaan barang/PO, `cutFinished`, dan `rokokPickerHtml` tidak perlu diubah.
- Bergantung pada data rokok dari change `rokok-multibrand` (belum di-archive).
- Di luar cakupan: backend dan persistensi; konversi satuan (slop/dus ke bungkus/botol); item bersama sebagai komponen produksi; laporan khusus item bersama; tombol stok masuk di tab barang dagangan; perubahan teks modul permintaan dan stok masuk.
