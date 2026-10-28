## Why

Saat ini Kasir bisa menghapus barang dari keranjang dengan menekan tombol − sampai qty 0, dan juga mengurangi qty (mis. 5 ke 1) tanpa jejak. Pengurangan ini lolos dari jalur pembatalan: tanpa alasan, tanpa histori pembatalan, tanpa peringatan owner. Spec `item-cancellation` sudah mewajibkan semua itu, tetapi keranjang punya jalan pintas yang melewatinya. Perubahan ini menutup celah tersebut: qty ditentukan sekali lewat modal saat barang dipilih, dan setelah masuk keranjang barang hanya bisa dibuang lewat "Batalkan".

## What Changes

**Pemilihan menu di view Kasir**
- From: klik kartu menu langsung menambah qty +1 ke keranjang.
- To: klik kartu menu membuka modal "Tambah ke pesanan" berisi nama, harga, input jumlah (−/+ dan bisa diketik langsung; hanya angka, maksimal 3 digit, minimal 1, tanpa alert), tombol Batal dan Tambahkan.
- Reason: Kasir memilih qty di satu tempat, sebelum barang masuk keranjang.
- Impact: non-breaking, hanya alur Kasir. Menu sama yang belum `saved` digabung ke baris yang sudah ada. Karakter non-angka diabaikan diam-diam saat diketik atau ditempel (tanpa `alert`/toast), nilai tertinggi 999, dan kosong atau 0 kembali ke 1 saat fokus keluar. Tombol − berhenti di 1, tombol + berhenti di 999.

**Baris keranjang**
- From: baris item baru menampilkan tombol − dan +, dan − sampai 0 menghapus baris.
- To: baris menampilkan `× qty` dan tombol "Batalkan" saja, sama seperti item `saved` dari order terjadwal. Tombol − dan + dihapus.
- Reason: semua pengurangan wajib lewat jalur pembatalan yang sudah ada.
- Impact: Kasir tidak lagi bisa mengurangi qty di keranjang. Menambah qty dilakukan dengan klik kartu menu lagi.

## Capabilities

### New Capabilities
<!-- Tidak ada capability baru. -->

### Modified Capabilities
- `item-cancellation`: ditambah requirement bahwa qty barang di keranjang tidak dapat dikurangi selain lewat "Batalkan", dan qty ditentukan lewat modal saat barang dipilih.

## Impact

- Aplikasi terdampak: POS (`index.html`, `app.js`, `styles.css`). Pusat Data (`outlet-data.html`) tidak tersentuh. Alur tutup shift dan format paket ZIP tidak berubah.
- Kode: `renderMenu` / `addToCart` (klik kartu membuka modal) dan `renderCart` (hapus markup dan handler `plus`/`minus`) di `app.js`; kemungkinan sedikit CSS untuk modal di `styles.css`.
- Spec: delta untuk `item-cancellation`. `pos-access-control` tidak berubah (hak akses menu tidak terpengaruh).
- Di luar cakupan: form "Buat order" Admin/Kepala Toko (`renderOrderDraft`) tetap seperti sekarang; pembatalan sebagian qty untuk item baru ditunda ("Batalkan" tetap membatalkan seluruh baris); backend, persistensi, dan integrasi nyata.
