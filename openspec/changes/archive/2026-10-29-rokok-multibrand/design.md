## Context

Perubahan ini hanya menyentuh POS (`index.html`, `app.js`, `styles.css`). Rokok saat ini hanya ada sebagai pilihan bentuk fee driver:

- `feeModal()` (`app.js:22`, satu-satunya definisi) punya opsi "Rokok" dengan satu input "Jumlah bungkus rokok". Di Kasir mode biasa, opsi ini hanya memunculkan toast dan menyetel `fee=0`, jadi nilainya hilang. Di mode order, nilainya disimpan ke `activeOrder.fee={type:'stock',value:n}`.
- Form Buat order (`index.html:134`) memakai `#ofFeeType` dan `#ofFeeValue`. `saveOrder` (`app.js:252-256`) menyimpan `fee:{type,value}`.
- `feeText(f)` (`app.js:236`) memformat fee untuk detail order dan cart mode order.
- Tidak ada rokok di `menuData`, `rawStock`, maupun `finishedStock`.

Jalur jual yang sudah ada bersifat generik dan berbasis nama:

- Tab kategori Kasir (`renderCategories`, `app.js:16`), tab form Buat order (`renderOrderForm`, `app.js:248`), dan master menu Admin (`app.js:157`) dibangun dari `Object.keys(menuData)`.
- Handler `#payButton` **terakhir** (`app.js:128`) memasang `#finishPay`, yang memotong `finishedStock` per nama item cart. Handler `#payButton` di `app.js:27` sudah mati karena ditimpa.
- `deductOrderStock(o)` (`app.js:238`) dipanggil `completeOrder` dan memotong `finishedStock` per nama item order.

Keputusan user dari brainstorm: rokok bisa dijual, stoknya di barang dagangan, fee rokok bisa multi-merek dan hanya tampil di baris "Fee driver", stok fee dipotong saat bayar (Kasir biasa) atau saat Selesai (order), dan rokok belum masuk alur PO.

## Goals / Non-Goals

**Goals:**
- Kategori menu "Rokok" berisi Rokok Brand A–E yang bisa dijual di Kasir dan Pesanan, dengan stok di LPP barang dagangan.
- Fee driver rokok bisa memilih beberapa merek beserta jumlahnya, di modal fee Kasir dan di form Buat order.
- Stok fee rokok terpotong: saat bayar untuk Kasir biasa, saat Selesai untuk order.

**Non-Goals:**
- Rokok di alur Permintaan barang/PO (`materialRequests` hanya untuk `rawStock`).
- Fee campuran tunai + rokok dalam satu fee.
- Laporan khusus rokok, maupun perubahan rekap tutup shift atau paket ZIP.
- Validasi ketat jumlah fee terhadap stok, selain lantai 0 yang sudah ada.

## Decisions

### D1: Rokok sebagai kategori menu + barang dagangan
- **Choice**: tambahkan `Rokok` di akhir `menuData`, setelah `Jajanan`:
  `['Rokok Brand A',32000,'Isi 16 batang','RA']`, `['Rokok Brand B',28000,'Isi 12 batang','RB']`, `['Rokok Brand C',25000,'Isi 12 batang','RC']`, `['Rokok Brand D',35000,'Isi 20 batang','RD']`, `['Rokok Brand E',22000,'Isi 10 batang','RE']`.
  Tambahkan juga ke `finishedStock` dengan nama persis sama, `unit:'bungkus'`, `min:10`: A qty 24 cost 29500, B 18/25500, C 12/22500, D 6/32000 (sengaja di bawah minimum agar badge stok rendah terlihat di demo), E 30/19500.
- **Rationale**: penjualan di Kasir (`#finishPay`) dan order Selesai (`deductOrderStock`) sudah memotong `finishedStock` berdasarkan nama. Tab dan master menu muncul otomatis. Tidak perlu logika jual baru.
- **Alternatives considered**: rokok di `rawStock` agar ikut PO. Ditolak karena alur jual tidak memotong `rawStock`. Satu item "Rokok" dengan pilihan varian merek di modal qty juga ditolak karena butuh komponen baru, padahal kartu per merek sudah memenuhi "pilih multiple brand".

### D2: Bentuk data fee rokok
- **Choice**: `fee={type:'stock', items:[{name:'Rokok Brand A',qty:2}, ...]}`. Fee tunai tetap `{type:'cash', value}`. Di Kasir mode biasa, tambahkan global `let feeRokok=[]` di samping `let fee=0` (`app.js:13`). `fee` tetap angka tunai. Hanya satu dari keduanya yang terisi.
- **Rationale**: `fee` (angka) dipakai `renderCart` untuk mengurangi total. Menambah array terpisah lebih sedikit sentuhan daripada mengubah `fee` menjadi objek.
- **Alternatives considered**: mengubah `fee` Kasir menjadi objek seperti order. Ditolak karena mengubah semua pembacaan `fee` di `renderCart` dan alur bayar tanpa manfaat untuk demo.

### D3: Pemilih merek bersama
- **Choice**: dua helper global baru di dekat `feeText`:
  - `rokokPickerHtml(items)` merender satu baris per merek dari `menuData.Rokok`. Setiap baris berisi nama merek, keterangan "Stok n bungkus" (dari `finishedStock`), dan `<input type="number" min="0" class="rokok-qty" data-name="...">` yang terisi dari `items`.
  - `readRokokPicker(root)` mengembalikan `[{name,qty}]` untuk qty > 0.
  
  Keduanya dipakai oleh `feeModal` dan form Buat order.
- **Rationale**: satu sumber daftar merek, dan satu UI untuk kedua tempat.

### D4: `feeText` multi-merek
- **Choice**: untuk tipe stok, `f.items.map(x=>`${x.name.replace('Rokok ','')} ×${x.qty}`).join(', ')`, contohnya "Brand A ×2, Brand C ×1". Tipe tunai tidak berubah.
- **Rationale**: detail order (`app.js:242`) dan cart mode order (`app.js:261`) sudah memakai `feeText`, jadi otomatis ikut.

### D5: Modal fee Kasir
- **Choice**: `feeModal` mengganti `#feeInput` dengan wadah dua isi. Tipe tunai menampilkan input nominal seperti sekarang. Tipe Rokok menampilkan `rokokPickerHtml(...)`. Saat dibuka di mode biasa dengan `feeRokok` terisi, modal dibuka di tab Rokok dengan nilai terisi.
  Simpan:
  - Rokok tanpa qty > 0 → toast "Pilih minimal satu merek rokok", modal tetap terbuka.
  - Mode order → `activeOrder.fee={type:'stock',items}`, toast "Fee driver tersimpan ke order" (tidak berubah).
  - Mode biasa rokok → `feeRokok=items; fee=0`, toast `Fee rokok dicatat: ${feeText(...)}. Stok dipotong saat pembayaran.`
  - Mode biasa tunai → `fee=nominal; feeRokok=[]`.
- **Rationale**: aturan "fee rokok tidak menjadi baris cart". Fee hanya menyimpan pilihan, dan stok dipotong saat bayar.

### D6: Baris "Fee driver" di cart mode biasa
- **Choice**: di `renderCart` (`app.js:20`, satu-satunya definisi), bila `feeRokok.length`, `#feeTotal` berisi `feeText({type:'stock',items:feeRokok})` tanpa tanda minus, dan `#feeLine` ditampilkan bila `fee||feeRokok.length`. `grand=sub-fee` tidak berubah, karena rokok tidak mengurangi total.

### D7: Pemotongan stok bersama
- **Choice**: helper `cutFinished(lines)` memotong `finishedStock` per `{name,qty}` dengan lantai 0, mengikuti pola yang ada. `deductOrderStock(o)` menjadi `cutFinished(o.items.concat(o.fee?.type==='stock'?o.fee.items:[]))` lalu `renderInventory()`. `#finishPay` di handler `#payButton` terakhir (`app.js:128`) menjadi `cutFinished(cart.concat(feeRokok))`, lalu reset `fee=0;feeRokok=[]`.
- **Rationale**: satu tempat untuk aturan "tidak minus". Waktu potong mengikuti aturan yang ada (bayar Kasir, Selesai order). Pembayaran order tidak memotong stok.
- **Dead copy**: handler `#payButton` di `app.js:27` (berisi `#finishPay` lama) sudah ditimpa dan tidak diubah, agar diff tetap kecil.

### D8: Form Buat order
- **Choice**: di `#ofFeeFields` (`index.html:134`), tambahkan `<div id="ofRokokPicker" class="rokok-picker hidden"></div>` setelah `#ofFeeLabel`. Handler `#ofFeeType` `.onchange` (`app.js:258`) menukar visibilitas `#ofFeeLabel` dan `#ofRokokPicker`, dan mengisi picker dengan `rokokPickerHtml([])`. Teks "Jumlah bungkus rokok" dihapus. Reset form (`app.js:247`) menyembunyikan picker dan menampilkan `#ofFeeLabel`.
  Di `saveOrder`, untuk tipe stok: `items=readRokokPicker($('#ofRokokPicker'))`. Tanpa item → toast "Pilih minimal satu merek rokok". Jika ada, `fee:{type:'stock',items}`. Validasi tunai yang ada ("Isi nominal fee driver atau hapus centang fee") tetap berlaku untuk tipe tunai.

### D9: Titik reset fee
- **Choice**: setiap `fee=0` yang mengosongkan sesi cart juga mengosongkan `feeRokok=[]`: `#newOrder` (`app.js:27`), `app.js:209`, konfirmasi logout (`app.js:215`), `selectOrder` (`app.js:263`), pembayaran order (`app.js:264`), dan `#finishPay` terakhir (`app.js:128`).

### D10: Gaya
- **Choice**: `.rokok-picker` di `styles.css` berupa daftar baris grid (nama | stok muted | input qty ±80px), memakai variabel warna yang ada.

## Risks / Trade-offs

- [Risk] Nama di `menuData` dan `finishedStock` harus sama persis, jika tidak stok tidak terpotong → Mitigation: nama ditulis sekali di design D1, dan verifikasi manual mengecek pengurangan stok per merek.
- [Risk] Order Selesai lama (`ORD` di `app.js:225`) memakai `value:2` → Mitigation: migrasi data contoh ke `items:[{name:'Rokok Brand A',qty:2}]`. Order ini sudah Selesai, jadi stok tidak dipotong lagi.
- [Trade-off] Jumlah fee bisa melebihi stok, dan stok berhenti di 0, bukan minus → diterima, karena konsisten dengan aturan order Selesai yang ada dan prototipe tidak fokus pada integritas data.
- [Trade-off] Rokok tidak bisa di-restock lewat Permintaan barang/PO → diterima sementara, sesuai keputusan user.

## Migration Plan

N/A. Perubahan ini tidak melibatkan deployment. Satu-satunya migrasi adalah data contoh `scheduledOrders` dari `value` ke `items`.

## Open Questions

- Tidak ada untuk cakupan ini. Rokok di alur PO bisa diangkat sebagai change terpisah nanti.
