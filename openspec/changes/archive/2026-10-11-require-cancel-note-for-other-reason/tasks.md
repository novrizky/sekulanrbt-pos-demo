# Tasks

## 1. POS — app.js

- [x] 1.1 Di `openCancel` terakhir (baris 99), baca `#cancelReason` dan `#cancelNote` (di-trim) di awal handler `#confirmCancel`. Jika alasan "Lainnya" dan catatan kosong, `return showToast('Catatan kasir wajib diisi untuk alasan Lainnya')` sebelum `cart.splice`. Verifikasi: buka index.html, login `ayu.kasir`/`demo123`, tambah menu ke keranjang, batalkan dengan "Lainnya" tanpa catatan (lalu dengan spasi saja). Toast tampil, modal tetap terbuka, item tetap di keranjang.
- [x] 1.2 Isi kolom ALASAN `cancelLog` dengan `<alasan> — <catatan>` jika catatan diisi, dan alasan saja jika kosong. Verifikasi: batalkan dengan "Lainnya" + "Pelanggan pulang", lalu dengan "Stok tidak tersedia" tanpa catatan. Toast "Cancel tercatat. Peringatan dikirim ke owner." tampil.

## 2. Verifikasi integrasi

- [x] 2.1 Login sebagai Kepala Toko (`budi.leader`/`demo123`), buka Laporan → Histori pembatalan. Baris teratas menampilkan "Stok tidak tersedia" dan "Lainnya — Pelanggan pulang", dan kolom STATUS tetap tampil benar ("Menunggu BA"). _(Diverifikasi dengan menjalankan handler `openCancel` asli memakai DOM tiruan di Node: kelima skenario lulus, baris tetap 7 kolom, STATUS "Menunggu BA". Render `renderCancelHistory` tidak diubah.)_
