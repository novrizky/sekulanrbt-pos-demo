# Proposal

## Why

Saat membatalkan item di keranjang, Kasir bisa memilih alasan "Lainnya" tanpa menulis penjelasan apa pun. Isian "Catatan kasir" juga tidak pernah disimpan. Akibatnya, histori pembatalan yang diperiksa Kepala Toko saat berita acara tutup shift tidak menjelaskan *kenapa* item dibatalkan.

## What Changes

- Di modal "Batalkan item?" (POS, view Kasir), "Catatan kasir" **wajib diisi** jika alasan yang dipilih adalah "Lainnya". Jika kosong, pembatalan ditolak dengan toast, modal tetap terbuka, dan item tidak dihapus dari keranjang.
- Untuk alasan lain, catatan tetap opsional.
- Jika catatan diisi (untuk alasan apa pun), catatan ikut tercatat di histori pembatalan pada kolom ALASAN, dengan format `<alasan> — <catatan>`.

**Di luar cakupan:**
- Aplikasi Pusat Data Outlet (`outlet-data.html`) dan isi `cancel.csv` di paket ZIP.
- Nama kasir dan waktu pembatalan yang masih hard-coded di `cancelLog`.
- Menghapus salinan mati `openCancel` di `app.js` baris 21.
- Notifikasi owner yang nyata. Tetap disimulasikan dengan toast.

## Capabilities

### New Capabilities
- `item-cancellation`: aturan pembatalan item di keranjang POS, yaitu alasan, catatan kasir, dan pencatatan ke histori pembatalan.

### Modified Capabilities
<!-- Tidak ada -->

## Impact

- Aplikasi: **POS** (`index.html`) saja.
- `app.js`: fungsi `openCancel` versi terakhir (baris 99), yaitu validasi catatan dan isi kolom ALASAN di `cancelLog`. Bentuk array `cancelLog` tetap 7 kolom, sehingga `renderCancelHistory` tidak berubah.
