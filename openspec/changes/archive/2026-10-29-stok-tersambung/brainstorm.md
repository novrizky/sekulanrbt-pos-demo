# Brainstorm: stok-tersambung

Hasil sesi explore (`/opsx:explore`) dengan user, 2026-10-29. Ukuran: perubahan kecil (short design).

## Latar belakang

User ingin ada item yang berperan sebagai bahan baku sekaligus barang dagangan, contohnya rokok dan air mineral.

Kondisi kode saat ini (POS, `app.js`):
- Persediaan punya dua buku stok terpisah: `rawStock` (bahan baku) dan `finishedStock` (barang dagangan). Setiap alur hanya membaca satu buku.
  - `rawStock` dibaca oleh: `stockInModal` (148–150), Permintaan barang (`resetRequestDraft` 305, baris form 307, `updateRequestSummary` 311, `submitRequest` 313), harga PO di `printPoModal` (323), penerimaan PO `#rcSave` (329), dan modal produksi (108–114).
  - `finishedStock` dibaca oleh: `cutFinished` (241, Kasir bayar, order Selesai, fee rokok), `rokokPickerHtml` (239), hasil produksi (108/114).
- Rokok Brand A–E (dari change `rokok-multibrand`) hanya ada di `finishedStock`. Rokok bisa dijual tapi tidak bisa di-restock lewat Permintaan barang/PO (sebelumnya dicatat sebagai non-goal).
- Air mineral ada di `menuData.Jajanan` tetapi tidak punya baris stok sama sekali, sehingga penjualannya tidak memotong apa pun.

## Rantai keputusan

**Q1. Peran "bahan baku" yang dimaksud apa?** Pilihan: (1) hanya restock lewat Permintaan barang/PO, (2) juga dipakai sebagai komponen produksi, (3) dipakai per satuan lebih kecil (konversi slop/dus).
→ **(1).** Rokok tetap dianggap barang dagangan, tetap bisa dijual, bisa di-restock lewat Permintaan barang, dan **stoknya menjadi satu**.

**Q2. Air mineral ikut?** → **Ya.**

**Q3. "+ Stok masuk" (penerimaan tanpa PO) juga berlaku?** → **Ya**, tetap bisa lewat stok masuk.

**Q4. Tambah tombol "+ Stok masuk" di tab barang dagangan?** → **Tidak.** User ingin barang ini ditambahkan lewat sisi bahan baku, lalu stok di barang dagangan **mengikuti**. Stok bahan baku dan barang dagangan tersambung untuk jenis item ini, dan item tampil di kedua tab LPP.

**Q5. Ganti teks "bahan baku" menjadi "barang" di modul permintaan/stok masuk?** → **Tidak perlu diubah.**

**Q6. Hitungan stok menipis dibuat unik dan item bersama diberi badge "Tersambung" di LPP?** → **Oke.**

**Q7. Item bersama di modal produksi?** → **Disembunyikan** dari dropdown bahan maupun hasil produksi.

## Pendekatan yang dipertimbangkan

| Pendekatan | Ringkasan | Trade-off |
|---|---|---|
| A. Satu objek, dua daftar (**dipilih**) | Objek item ditulis sekali, lalu objek yang sama dimasukkan ke `rawStock` dan `finishedStock`. | Satu angka stok tanpa sinkronisasi. Semua alur `rawStock` (stok masuk, permintaan, PO) dan `finishedStock` (jual, fee) langsung bekerja. Perlu dedupe hitungan stok menipis dan penyaringan di modal produksi. |
| B. Dua record + pindah 1:1 | Item ada di kedua buku sebagai record terpisah, dengan langkah "pindah ke barang dagangan". | Paling rapi secara akuntansi, tapi stok ganda harus disinkronkan, dan kasir bisa menjual barang yang stoknya 0 karena lupa dipindah. Bertentangan dengan "stok menjadi satu". |
| C. Tetap di barang dagangan, perluas PO dan stok masuk | Permintaan barang/PO dan stok masuk dibuat bisa membaca `finishedStock` bertanda restock, lewat satu helper. | Satu stok, tapi item tidak tampil di tab bahan baku dan restock dari tab bahan baku tidak terasa "tersambung". Ditolak setelah Q4. |

Mula-mula C disarankan setelah Q1, karena item tidak dipakai di produksi. Setelah Q4 (stok mengikuti dari sisi bahan baku, dan item tampil di kedua tab), A menjadi paling sederhana, karena referensi objek bersama di JS membuat kedua tab otomatis sinkron.

## Desain yang disepakati

- Rokok Brand A–E dan Air mineral menjadi **item bersama**: satu objek yang tercantum di `rawStock` dan `finishedStock`.
- Air mineral ditambahkan sebagai stok baru (satuan botol) dan tetap dijual dari menu Jajanan (nama harus sama persis dengan `menuData`: `'Air mineral'`).
- Restock lewat "+ Stok masuk" dan Permintaan barang/PO dari sisi bahan baku. Qty dan biaya per unit di sisi barang dagangan otomatis ikut.
- Penjualan Kasir, order Selesai, dan fee rokok memotong objek yang sama, sehingga stok di tab bahan baku ikut turun.
- Tidak ada tombol stok masuk baru di tab barang dagangan.
- Teks modul permintaan dan stok masuk tidak diubah.
- Hitungan "stok menipis" (`#lowStockCount`) menghitung item bersama satu kali, dan item bersama diberi badge "Tersambung" di kedua tab LPP.
- Item bersama disembunyikan dari dropdown bahan dan hasil di modal produksi.

## Di luar cakupan

- Konversi satuan (slop → bungkus, dus → botol).
- Pemakaian item bersama sebagai komponen produksi.
- Laporan khusus item bersama, maupun perubahan pada rekap tutup shift atau paket ZIP.
- Pusat Data (`outlet-data.html`).

## Catatan untuk builder

- Modal produksi memakai **indeks** `rawStock` (`rawStock[l.i]`) dan indeks `finishedStock` di `#finishedItem`. Penyaringan item bersama harus tetap memakai indeks asli sebagai `value`, dan baris default `{i:0}` maupun `#addProdLine` tidak boleh memilih item bersama.
- Hitungan `#rawItemCount` (jumlah item bahan baku) ikut bertambah karena item bersama masuk `rawStock`. Ini diterima.
- Change `rokok-multibrand` belum di-archive. Change ini dibangun di atas data rokok dari change tersebut.
