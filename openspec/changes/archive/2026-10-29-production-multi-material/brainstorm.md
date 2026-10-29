<!--
Raw capture of superpowers:brainstorming output.
-->

# Brainstorm: Produksi multi-bahan dari "+ Hasil produksi"

## Latar belakang (permintaan user)

1. Fungsi tombol header "− Keluarkan untuk produksi" dipindah ke tombol "+ Hasil produksi" di tab **LPP barang dagangan** (panel stok, Persediaan). Sekarang tombol itu hanya memunculkan toast "Gunakan proses produksi untuk menambah barang dagangan".
2. Fungsinya: menambah barang dagangan hasil konversi dari bahan baku. Modal saat ini hanya bisa memilih **satu** bahan baku, jadi harus bisa memilih **banyak** bahan baku.
3. Modal kurang lebar, jadi dibuat lebih lebar.
4. Tombol "− Keluarkan untuk produksi" dihapus.
5. Modul lain yang relevan dengan perubahan ini ikut disesuaikan.

## Temuan di kode (kondisi sekarang)

- Tombol header `#productionIssue` ada di `index.html:70`, di-wire di `app.js:112` → `productionModal()` (`app.js:101-105`).
- `productionModal()`: satu `<select id="rawItem">` + `rawQty`, satu `finishedItem` + `finishedQty`, preview biaya, cek stok, lalu `raw.qty-=q; fin.qty+=fq`. Lebar modal memakai default `.modal` `min(440px)`.
- `#stockIn` di-wire **dua kali**. `app.js:113` (mati) ditimpa oleh `app.js:156` (aktif), yang menjalankan `stockInModal()` untuk tab raw dan menampilkan toast untuk tab barang dagangan.
- Label tombol `#stockIn` diatur di `renderInventory` terakhir (`app.js:70`): "+ Stok masuk" / "+ Hasil produksi".
- Panel kanan "Riwayat TAT" (`index.html:79`). Isinya array `tats` yang hard-coded **di dalam** `renderInventory` (`app.js:73`), sudah berisi contoh `PRD-0920-011 · Beras 8 kg + Ayam 12 kg · Menjadi 86 Paket Favorit` dan `TRX-...`. Akibatnya produksi baru tidak pernah muncul di riwayat, dan subjudul "Transfer antar toko terbaru" tidak akurat.
- Biaya/unit barang dagangan (`finishedStock[].cost`) tidak pernah diubah oleh produksi. Pembandingnya, "Stok masuk" langsung mengganti `cost` bahan baku (`app.js:141`).
- Pola modal lebar yang sudah ada: `.modal:has(.req-modal){width:min(760px,100%)}` (`styles.css:55`).
- Helper waktu `reqNow()` (`app.js:274`) menghasilkan `20 Sep 2026 HH.MM`.
- Akses: Kasir tidak melihat Persediaan, sedangkan Kepala Toko dan Administrator bisa. Tidak ada perubahan akses.
- Laporan, BA tutup shift, dan hub outlet-data tidak membaca data produksi, jadi tidak perlu disentuh.

## Rantai keputusan

- **Q1 Cara memilih bahan baku?** Tiga opsi:
  - A. Baris dinamis: "+ Tambah bahan" dan tombol hapus per baris.
  - B. Daftar centang ke-17 bahan, mirip form Permintaan barang.
  - C. Auto-isi dari resep per menu (butuh data resep baru dan menyentuh Master menu).
  → **User memilih A.** Alasannya, tidak perlu data baru, biasanya hanya 2–4 bahan yang dipakai, dan modal tetap ringkas. B terlalu berat untuk modal. C memperluas cakupan.
- **Q2 Validasi stok?** Usulannya: kalau ada satu baris bahan yang qty-nya melebihi stok, seluruh produksi ditolak dan tidak ada stok yang berubah. → **User: OK.**
- **Q3 Biaya/unit barang hasil?** (*usulan Claude; user melanjutkan ke propose tanpa keberatan*) Modal menampilkan total biaya bahan dan HPP/unit = total biaya ÷ jumlah hasil. Saat disimpan, `cost` barang hasil **diganti** dengan HPP/unit itu, tanpa rata-rata tertimbang. Ini konsisten dengan perilaku Stok masuk dan kolom BIAYA / UNIT langsung berubah saat demo.
- **Q4 Riwayat di panel kanan?** (*usulan Claude*) Data riwayat dipindah ke array global `stockMoves`, dan setiap produksi baru disisipkan di paling atas (`PRD-0920-012`, dst.). Judul panel diganti "Riwayat mutasi stok" dengan subjudul "Transfer, produksi, dan penjualan terbaru".
- **Q5 Transfer ikut dicatat ke riwayat?** (*keputusan Claude, tidak dijawab user*) **Tidak**, karena di luar permintaan. `transferModal` tetap seperti sekarang.

- **Q6 Tabel riwayat produksi** (permintaan user setelah implementasi awal: "buatkan tabel riwayat produksi, tentukan saja tempat yang tepat"). Claude memilih panel baru "Riwayat produksi" di bawah grid stok yang **hanya tampil di tab LPP barang dagangan**, di atas "Permintaan barang". Alasannya: produksi menambah barang dagangan dan tombolnya ada di tab itu, sedangkan panel "Riwayat mutasi stok" hanya timeline ringkas yang tidak memuat biaya, HPP, atau nama pencatat. Data disimpan di array objek global `productionLog` dengan 3 contoh (PRD-0920-011 sesuai timeline, lalu 010 dan 009). Setiap produksi sukses ditambahkan di urutan teratas. Kolomnya: KODE, WAKTU, HASIL, JUMLAH, BAHAN BAKU, TOTAL BIAYA, HPP / UNIT, DICATAT OLEH. Filter, paging, dan detail per baris tidak dibuat.

## Bentuk modal yang disepakati

```
+------------------------------------------------------------------+
| Catat hasil produksi                                             |
| Bahan baku berkurang, hasil masuk ke LPP barang dagangan.        |
| Hasil barang dagangan        Jumlah hasil                        |
| [Paket Favorit 25K      v]   [ 40 ]                              |
| BAHAN BAKU          STOK        QTY DIPAKAI   BIAYA             |
| [Beras          v]  128 kg      [  8 ]        Rp116.000    [x]  |
| [Ayam           v]   34 kg      [ 12 ]        Rp456.000    [x]  |
| [+ Tambah bahan]                                                 |
| Total biaya bahan Rp572.000 · HPP/unit Rp14.300                  |
|                                       [Batal] [Catat produksi]   |
+------------------------------------------------------------------+
```

## Ukuran kerja

Perubahan kecil: satu modal di-rewrite, satu tombol dihapus, satu handler dipindah, dan satu panel riwayat dibuat live. Cukup memakai desain pendek.

## Non-goal

- Data resep / BOM per menu dan auto-isi bahan.
- Banyak barang hasil dalam satu produksi (hasil tetap satu item).
- Mencatat transfer ke riwayat dan halaman "Lihat semua".
- Validasi ketat seperti bahan dobel, qty desimal, atau pembulatan HPP (proyek ini demo).
