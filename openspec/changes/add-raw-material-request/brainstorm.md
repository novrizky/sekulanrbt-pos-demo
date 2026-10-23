<!--
Raw capture of superpowers:brainstorming output (dijalankan sebagai sesi /opsx:explore).
design.md diturunkan dari file ini.
-->

# Brainstorm: Permintaan barang bahan baku

## Latar belakang

Permintaan awal pengguna: modul permintaan barang untuk bahan baku yang terintegrasi dengan Persediaan, bisa diakses Administrator dan Kepala Toko, punya riwayat permintaan yang bisa di-tracking, dan terhubung dengan stok masuk LPP bahan baku.

Kondisi kode saat eksplorasi (POS, `app.js` / `index.html`):

- `section#inventory` berisi summary-grid, tab `stock-ledger-tabs` (LPP bahan baku / LPP barang dagangan), lalu `.inventory-grid` dengan panel "Stok bahan baku" (`#rawTable`, tombol `#stockIn`) dan panel "Riwayat TAT" (`#tatList`, isinya hard-coded).
- `rawStock` hanya punya 5 item `{name,qty,unit,min,cost}`, sedangkan kartu ringkasan menulis "48 item". Status `Menipis` dihitung dengan `qty<=min` (app.js:65).
- `stockInModal()` (app.js:138) adalah GRN satu item: pemasok, surat jalan, qty, harga. Saat disimpan, `item.qty+=qty; item.cost=cost`. Riwayat GRN tidak disimpan. Handler terakhir `#stockIn` ada di app.js:156 (app.js:112 adalah salinan mati yang tertimpa).
- `ROLE_ACCESS`: Kepala Toko dan Administrator sama-sama sudah punya view `inventory`.
- Pola yang bisa dipakai ulang: `scheduledOrders` (record objek, status turunan), `#orderFormPanel` (panel form penuh menggantikan daftar), `order-chips` (filter status), `openModal`, `tableHtml`, `showToast`. Cetak saat ini memakai `window.print()` dengan `@media print` yang hanya menampilkan `#reports`.
- Semua akun Kepala Toko ada di Sekulan RBT 519A (Budi Shift 1, Rina Shift 2, Taufik Shift 3).

## Rantai keputusan

**Q1. Permintaan ditujukan ke siapa?** Opsi yang ditawarkan: gudang pusat (approval internal), pemasok (purchase order), outlet lain (bertumpang tindih dengan TAT).
→ Jawaban pengguna: gabungan. Permintaan Kepala Toko perlu disetujui Admin. Permintaan Admin otomatis disetujui. Permintaan yang sudah disetujui menghasilkan **dokumen Purchase Order** yang dikirim ke vendor secara manual. Identitas vendor diisi saat PO akan dicetak, lalu prefilled di cetak berikutnya dan tetap bisa diubah.

**Q2. Approval per permintaan, per item, atau bertingkat?**
→ Per permintaan (opsi A). Kata "fully approved" sebelumnya hanya berarti "sudah disetujui". 1 REQ → 1 PO (jadi 1 vendor per PO). Rekomendasi tambahan yang diterima: Admin boleh mengoreksi qty sebelum menyetujui. Alasan wajib saat menolak.

**Q3. Bagaimana PO tersambung ke stok masuk: sekali terima atau bertahap?**
→ Sekali terima (opsi A). Qty dan harga yang diterima boleh berbeda dari PO. **Jika ada selisih, catatan selisihnya masuk ke riwayat penerimaan.** Usulan "catatan selisih wajib bila ada selisih qty" (mengikuti pola catatan wajib saat kas berbeda di buka shift) diterima tanpa koreksi.

**Q4. Penempatan UI: tab ketiga di Persediaan atau menu sidebar sendiri?**
→ Bukan keduanya. Pengguna memilih **section sendiri di bawah grid "Stok bahan baku" + "Riwayat TAT"** di halaman Persediaan. Section ini tetap tampil saat tab LPP barang dagangan aktif.

**Q5. Visibilitas antar Kepala Toko?**
→ Kepala Toko bisa melihat **semua** permintaan, termasuk milik Kepala Toko lain. Informasi Kepala Toko yang meminta (nama + peran) ditampilkan. Default yang diusulkan dan tidak dikoreksi: aksi Cetak PO dan Terima barang oleh Kepala Toko hanya untuk outletnya sendiri, sedangkan Admin bisa semua aksi.

**Q6. Default lain yang diusulkan dan disetujui pengguna ("ok"):**
- Status: Menunggu persetujuan → Disetujui (PO terbit) → PO dicetak → Selesai, dengan cabang Ditolak.
- Tombol "+ Stok masuk" yang lama tetap ada untuk penerimaan tanpa PO.
- Data contoh 3–4 permintaan dengan status beragam, tanggal 20–21 September 2026.

**Q7. Cara memilih item (diangkat pengguna):** tabel bahan baku dengan sort default yang menaruh item menipis di atas, pencarian berdasarkan nama item, dan filter status.
- Definisi Menipis disamakan di semua tabel: `qty <= min` (pengguna memilih definisi yang sudah ada di kode).
- Data `rawStock` boleh diperbanyak agar pencarian dan filter terlihat berguna.
- Form berupa panel penuh menggantikan daftar (pola `#orderFormPanel`).
- Qty default: item Menipis **otomatis tercentang, tetapi qty kosong** dan diisi manual. Saran rumus `min×2−stok` ditolak.

**Q8. Harga di PO (diangkat pengguna):** harga per item di PO default dari biaya master bahan baku (estimasi) dan bisa diubah sebelum cetak, agar sesuai harga vendor saat transaksi. Perubahan ini **hanya berlaku pada PO itu**. Harga master tidak berubah.
- Konfirmasi lanjutan: saat barang diterima lewat GRN, harga master **tetap diperbarui** dengan harga di form penerimaan (perilaku GRN yang sudah ada dipertahankan). Default harga di form penerimaan = harga PO.

## Pendekatan yang dipertimbangkan

| Topik | Opsi | Dipilih | Alasan |
|---|---|---|---|
| Tujuan permintaan | Gudang pusat / Pemasok (PO) / Outlet lain | Approval internal + PO ke pemasok | Peran Kepala Toko dan Admin berbeda. Outlet lain sudah ditangani TAT. |
| Granularitas approval | Per REQ / per item / bertingkat | Per REQ + koreksi qty | Paling sederhana. 1 REQ → 1 PO. |
| Penerimaan | Sekali terima / bertahap | Sekali terima + catatan selisih | Alur demo pendek. Selisih tetap terlacak. |
| Penempatan | Tab / menu sidebar / section | Section di bawah grid Persediaan | Pilihan pengguna. Terlihat menyatu dengan stok. |
| Qty default | Saran otomatis / kosong | Auto-centang Menipis, qty kosong | Pilihan pengguna. |

## Cakupan

- Aplikasi: hanya POS (`index.html`, `app.js`, `styles.css`). Pusat Data (`outlet-data.*`) tidak tersentuh.
- Di luar cakupan: pengiriman PO ke vendor (manual), master vendor lintas PO, penerimaan bertahap, approval bertingkat, persistensi, PDF sungguhan (cukup `window.print()`).
- Penyederhanaan demo: `rawStock` tidak punya dimensi outlet, jadi penerimaan dari PO outlet mana pun menambah `rawStock` yang sama.
