## 1. POS — index.html

- [x] 1.1 Hapus `<button class="btn ghost" id="productionIssue">− Keluarkan untuk produksi</button>` dari header Persediaan (`index.html:70`) dan biarkan "⇄ Transfer antar toko" tetap ada
- [x] 1.2 Ganti judul panel kanan "Riwayat TAT" menjadi "Riwayat mutasi stok" dan subjudul menjadi "Transfer, produksi, dan penjualan terbaru" (`index.html:79`)
- [x] 1.3 Tambahkan panel `<article class="panel hidden" id="productionPanel">` di antara `.inventory-grid` dan `#requestPanel`, dengan judul "Riwayat produksi", subjudul "Konversi bahan baku menjadi barang dagangan beserta biaya dan HPP.", dan `<div class="table-scroll" id="productionTable">`

## 2. POS — app.js

- [x] 2.1 Pindahkan isi `const tats` dari dalam `renderInventory` terakhir (`app.js:73`) ke global `const stockMoves=[...]` di dekat `finishedStock`, lalu tambahkan `let prdSeq=12`. Ubah render `#tatList` agar membaca `stockMoves`
- [x] 2.2 Rewrite `productionModal()` (`app.js:101-105`): bungkus dengan `<div class="req-modal prod-modal">`, judul "Catat hasil produksi", select `#finishedItem` + `#finishedQty` (default 40), tabel `#prodLines` dengan state lokal `lines=[{i:0,qty:8}]`, tombol "+ Tambah bahan" (bahan pertama yang belum dipakai, qty 1), tombol hapus per baris, dan ringkasan `#costPreview` "Total biaya bahan … · HPP/unit …"
- [x] 2.3 Pasang handler baris: `.onchange` select bahan untuk re-render baris, `.oninput` qty untuk update state dan ringkasan tanpa re-render, `.onclick` hapus. `#finishedQty` `.oninput` memperbarui HPP
- [x] 2.4 Implementasikan `#confirmProduction` dengan validasi berurutan, yaitu toast "Tambahkan minimal satu bahan baku", lalu "Jumlah hasil produksi harus diisi", lalu "Stok <nama> tidak mencukupi (tersedia <qty> <unit>)". Setelah lolos, kurangi semua bahan, tambah barang hasil, set `fin.cost=Math.round(total/fq)`, `stockMoves.unshift([...])` dengan kode `PRD-0920-<prdSeq>` dan jam `reqNow().slice(-5)`, lalu `renderInventory()`, `closeModal()`, dan tampilkan toast "Produksi PRD-0920-012 tercatat. <fq> <unit> <nama> masuk, biaya <rupiah> dibukukan."
- [x] 2.5 Ubah handler `#stockIn` terakhir (`app.js:156`) agar tab barang dagangan memanggil `productionModal()`, bukan toast
- [x] 2.6 Hapus wiring `$('#productionIssue').onclick=productionModal` (`app.js:112`) dan handler mati `$('#stockIn').onclick=...` (`app.js:113`). Pastikan `grep productionIssue` tidak lagi menemukan hasil di app.js dan index.html
- [x] 2.7 Tambahkan global `const productionLog=[...]` (3 data contoh sesuai design D8) di dekat `stockMoves`, buat `renderProductionLog()` yang memakai `tableHtml` dengan header KODE, WAKTU, HASIL, JUMLAH, BAHAN BAKU, TOTAL BIAYA, HPP / UNIT, DICATAT OLEH, lalu panggil dari `renderInventory` terakhir bersama `$('#productionPanel').classList.toggle('hidden',activeLedger==='raw')`
- [x] 2.8 Di `#confirmProduction`, saat sukses jalankan `productionLog.unshift({...})` (kode, `reqNow()`, hasil, qty, unit, bahan yang dipakai, total, hpp, `session.name`) sebelum `renderInventory()`

## 3. POS — styles.css

- [x] 3.1 Tambahkan aturan `.prod-modal` yang memakai lebar `.req-modal`: select dan input di sel tabel selebar sel (input qty ±80px), kolom STOK berwarna muted, tombol hapus baris kecil berwarna `var(--red)`, dan tombol "+ Tambah bahan" bergaya `add-note`/ghost

## 4. Verifikasi manual di browser

- [x] 4.1 Buka `index.html`, login sebagai `admin.rbt` / `demo123`, lalu buka Persediaan. Pastikan header tidak lagi menampilkan "− Keluarkan untuk produksi" dan panel kanan berjudul "Riwayat mutasi stok"
- [x] 4.2 Di tab "LPP bahan baku", tekan "+ Stok masuk" dan pastikan modal stok masuk terbuka seperti biasa
- [x] 4.3 Di tab "LPP barang dagangan", tekan "+ Hasil produksi". Pastikan modal lebar terbuka dengan Beras 8, hasil Paket Favorit 25K 40, dan ringkasan "Total biaya bahan Rp116.000 · HPP/unit Rp2.900"
- [x] 4.4 Tambah Ayam 12 dan pastikan ringkasan Rp572.000 · Rp14.300. Hapus lalu tambah baris lagi untuk memastikan perhitungan ulang benar
- [x] 4.5 Isi Ayam 40, tekan "Catat produksi", dan pastikan toast "Stok Ayam tidak mencukupi (tersedia 34 kg)" tampil dengan stok tidak berubah. Uji juga toast "Tambahkan minimal satu bahan baku" dan "Jumlah hasil produksi harus diisi"
- [x] 4.6 Catat Beras 8 + Ayam 12 → 40 Paket Favorit 25K. Pastikan toast sukses tampil, stok Paket Favorit +40 dengan BIAYA / UNIT Rp14.300, dan di tab bahan baku Beras 120 kg dan Ayam 22 kg
- [x] 4.7 Pastikan riwayat teratas menampilkan "PRD-0920-012 · Beras 8 kg + Ayam 12 kg · Menjadi 40 Paket Favorit 25K", dan produksi kedua menghasilkan "PRD-0920-013"
- [x] 4.8 Login sebagai Kepala Toko (`budi.leader`) dan ulangi 4.3 secara singkat untuk memastikan akses sama
- [x] 4.9 Pastikan panel "Riwayat produksi" tersembunyi di tab bahan baku dan tampil di tab barang dagangan dengan 3 baris contoh (teratas PRD-0920-011, Rp6.651, Budi Santoso). Setelah produksi 4.6, baris teratas harus PRD-0920-012, 40 porsi, Rp572.000, Rp14.300, Raka Administrator
