## Context

Perubahan ini hanya menyentuh POS (`app.js`). Persediaan memakai dua array stok yang terpisah, dan setiap alur membaca salah satunya:

| Array | Pembaca |
|---|---|
| `rawStock` (`app.js:31`) | `stockInModal` (148–150), Permintaan barang: `resetRequestDraft` (305), baris form (307), `updateRequestSummary` (311), `submitRequest` (313); harga master PO di `printPoModal` (323); penerimaan PO `#rcSave` (329); bahan di `productionModal` (108–114) |
| `finishedStock` (`app.js:36`) | `cutFinished` (241), yang dipakai `#finishPay` (130), `deductOrderStock`, dan fee rokok; `rokokPickerHtml` (239); hasil di `productionModal` (108, 114) |
| keduanya | tabel LPP dan kartu ringkasan di `renderInventory` terakhir (70–78) |

Semua pembaca mencari item **berdasarkan objek atau nama** (`find(x=>x.name===...)`) atau berdasarkan indeks array, lalu mengubah `qty` dan `cost` langsung pada objeknya. Rokok Brand A–E saat ini ada di `finishedStock` (baris 38), sedangkan Air mineral hanya ada di `menuData.Jajanan` sebagai `'Air mineral'`.

Keputusan user (lihat brainstorm.md): rokok dan air mineral menjadi item yang tampil di kedua LPP dengan satu stok. Restock dilakukan dari sisi bahan baku, penjualan memotong stok yang sama, item disembunyikan dari modal produksi, dan teks modul tidak diubah.

## Goals / Non-Goals

**Goals:**
- Rokok Brand A–E dan Air mineral punya satu stok yang tampil di LPP bahan baku dan LPP barang dagangan, dengan badge "Tersambung".
- "+ Stok masuk" dan Permintaan barang/PO bisa me-restock item tersebut, dan perubahannya langsung terlihat di LPP barang dagangan.
- Penjualan Kasir, order Selesai, dan fee rokok memotong stok yang sama.
- Kartu "Stok menipis" tidak menghitung dua kali.
- Item bersama tidak bisa dipilih di modal produksi.

**Non-Goals:**
- Konversi satuan (slop/dus).
- Item bersama sebagai bahan atau hasil produksi.
- Tombol stok masuk di tab barang dagangan, maupun perubahan teks modul permintaan dan stok masuk.
- Laporan, rekap tutup shift, paket ZIP, dan Pusat Data.

## Decisions

### D1: Satu objek dimasukkan ke dua array
- **Choice**: tambahkan `const sharedStock=[...]` tepat sebelum `rawStock` (`app.js:31`). Isinya enam objek dengan `shared:true`:
  - Rokok Brand A–E dipindah dari `finishedStock` baris 38, dengan nilai tetap (A 24/29500, B 18/25500, C 12/22500, D 6/32000, E 30/19500, `unit:'bungkus'`, `min:10`).
  - `{name:'Air mineral',qty:48,unit:'botol',min:24,cost:3000,shared:true}`. Nama harus sama persis dengan `menuData.Jajanan`.

  Lalu `rawStock` diakhiri dengan `...sharedStock`, dan `finishedStock` menjadi lima baris lama tanpa rokok plus `...sharedStock`.
- **Rationale**: kedua array memegang referensi ke objek yang sama, jadi semua pembaca yang sudah ada otomatis tersambung tanpa fungsi sinkronisasi. Stok masuk dan `#rcSave` menambah `qty` dan `cost` objek itu, sedangkan `cutFinished` menguranginya. Menaruh item bersama di **akhir** `rawStock` menjaga indeks lama (termasuk baris default produksi `{i:0}` = Beras).
- **Alternatives considered**: dua record terpisah dengan langkah pindah 1:1 (ditolak karena stok ganda harus disinkronkan); tetap di `finishedStock` dengan helper `restockItems()` di lima titik permintaan/PO plus stok masuk (ditolak karena item tidak tampil di tab bahan baku, sedangkan user ingin stoknya "mengikuti" dari sisi bahan baku).

### D2: Badge "Tersambung" di tabel LPP
- **Choice**: di `renderInventory` terakhir (`app.js:71`), kolom nama menjadi `x.shared?`${x.name}<em class="line-tag">Tersambung</em>`:x.name`. Badge berlaku untuk kedua tab, karena baris dibangun dari array tab yang aktif. Definisi `renderInventory` lama di `app.js:25` sudah mati (ditimpa) dan tidak diubah.
- **Rationale**: `.line-tag` (`styles.css:31`) sudah ada sebagai pil kecil hijau (dipakai untuk tag "tersimpan" di cart), jadi tidak perlu CSS baru.
- **Alternatives considered**: kelas baru `.shared-tag`. Tidak perlu, karena gaya yang ada sudah cocok.

### D3: Hitungan stok menipis unik
- **Choice**: `app.js:75` menjadi `[...new Set([...rawStock,...finishedStock])].filter(x=>x.qty<=x.min).length`. `#rawItemCount` tetap `rawStock.length` (17 + 6 = 23 item).
- **Rationale**: `Set` membuang duplikat referensi objek. Rokok Brand D (6/10) tetap terhitung sekali.

### D4: Item bersama disembunyikan dari modal produksi
- **Choice**: di `productionModal` (`app.js:106-115`, satu-satunya definisi):
  - opsi `#finishedItem` (108) hanya me-render item `!x.shared`, tetapi tetap memakai indeks asli sebagai `value`;
  - opsi `.prod-raw` di `draw` (110) melewati `r.shared`, dengan indeks asli tetap sebagai `value`;
  - `#addProdLine` (113) memakai `findIndex((r,k)=>!r.shared&&!lines.some(l=>l.i===k))`.
- **Rationale**: semua kode produksi lain memakai `rawStock[l.i]` dan `finishedStock[+value]` berdasarkan indeks asli, jadi cukup opsinya yang disaring. Baris default `{i:0}` adalah Beras, dan opsi `#finishedItem` pertama adalah Paket Favorit (indeks 0). Keduanya bukan item bersama.

### D5: Alur lain tidak diubah
- **Choice**: `stockInModal`, form dan pengajuan Permintaan barang, `printPoModal`, `#rcSave`, `cutFinished`, `deductOrderStock`, `#finishPay`, dan `rokokPickerHtml` tidak diubah.
- **Rationale**: semuanya sudah bekerja lewat D1. Item bersama muncul di dropdown stok masuk dan di form permintaan, lengkap dengan status Menipis (Rokok Brand D tercentang otomatis). Harga master PO diambil dari `cost` objek bersama. Teks "bahan baku" dibiarkan sesuai keputusan user.

## Risks / Trade-offs

- [Risk] Nama item bersama berbeda dari `menuData`, sehingga penjualan tidak memotong stok → Mitigation: nama ditulis persis (`'Air mineral'`, `'Rokok Brand A'` dst.), dan verifikasi manual menjual air mineral lalu mengecek kedua tab.
- [Risk] Penyaringan opsi produksi menggeser indeks → Mitigation: `value` opsi tetap memakai indeks asli array, dan item bersama berada di akhir `rawStock`.
- [Trade-off] Biaya per unit item bersama hanya diperbarui oleh pembelian (stok masuk atau PO), bukan HPP produksi → diterima, karena item ini tidak diproduksi.
- [Trade-off] Kartu "Bahan baku" bertambah 6 item dan melewati kisaran 15–18 di spec lama → diterima, dan requirement diperbarui lewat delta spec `raw-material-request`.
- [Trade-off] Tidak ada riwayat pergerakan stok untuk penjualan item bersama di `stockMoves` → sama dengan perilaku penjualan yang ada sekarang.

## Migration Plan

N/A. Perubahan ini tidak melibatkan deployment, hanya data contoh di `app.js`. Rollback cukup dengan mengembalikan rokok ke `finishedStock` dan menghapus `sharedStock`.

## Open Questions

Tidak ada.
