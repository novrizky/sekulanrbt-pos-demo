## Context

Aplikasi yang terdampak hanya POS (`index.html`, `app.js`, `styles.css`), di view Persediaan. Pengguna view ini adalah Kepala Toko dan Administrator, sedangkan Kasir tidak bisa mengaksesnya.

Kondisi sekarang:
- Produksi dibuka dari tombol header `#productionIssue` (`index.html:70`, wiring `app.js:112`) → `productionModal()` (`app.js:101-105`). Modal ini memakai satu bahan baku dan satu barang hasil, dengan lebar default `.modal` 440px.
- `#stockIn` di-wire dua kali. Handler di `app.js:113` sudah mati karena ditimpa handler terakhir di `app.js:156` (raw → `stockInModal()`, barang dagangan → toast). Label "+ Stok masuk" / "+ Hasil produksi" diatur di `renderInventory` terakhir (`app.js:66`, baris 70).
- Panel kanan "Riwayat TAT" (`index.html:79`) di-render dari `const tats` yang hard-coded di dalam `renderInventory` terakhir (`app.js:73-74`). Ikon `⚒` dipakai untuk kode `PRD*` dan `⇄` untuk yang lain.
- `renderInventory` versi pertama (`app.js:24`) sudah mati karena ditimpa versi di `app.js:66`.
- Polanya sudah tersedia: `.modal:has(.req-modal){width:min(760px,100%)}` beserta padding tabel `.req-modal .stock-table`, helper `reqNow()` (`20 Sep 2026 HH.MM`), `rupiah`, dan `showToast`.

Batasannya: ini prototipe statis tanpa persistensi, dan validasinya cukup untuk kebutuhan demo.

## Goals / Non-Goals

**Goals:**
- "+ Hasil produksi" di tab LPP barang dagangan membuka modal produksi.
- Tombol header "− Keluarkan untuk produksi" dihapus.
- Modal ±760px dengan baris bahan baku dinamis, total biaya, dan HPP/unit.
- Produksi mengurangi semua bahan, menambah barang hasil, memperbarui `cost` barang hasil, dan muncul di riwayat panel kanan.

**Non-Goals:**
- Data resep/BOM dan auto-isi bahan per menu.
- Lebih dari satu barang hasil per produksi.
- Mencatat transfer (`transferModal`) ke riwayat, dan halaman "Lihat semua".
- Validasi bahan dobel, qty desimal, atau pembulatan HPP.
- Membersihkan `renderInventory` versi pertama yang mati (`app.js:24`), karena tidak memengaruhi perilaku.
- Filter, paging, ekspor, atau modal detail per baris di tabel riwayat produksi.

## Decisions

### D1: Titik masuk produksi di handler `#stockIn` terakhir
- **Choice**: Ubah handler di `app.js:156` menjadi `activeLedger==='raw'?stockInModal():productionModal()`. Hapus handler mati `#stockIn` di `app.js:113`, hapus `$('#productionIssue').onclick=productionModal` di `app.js:112`, dan hapus `<button id="productionIssue">` di `index.html:70`.
- **Rationale**: Handler di :156 yang menang, jadi cukup satu tempat yang diubah. Membuang salinan mati mengurangi jebakan berlapis.
- **Alternatives considered**: Membiarkan tombol header tetap ada sebagai jalan pintas. Ini ditolak karena user meminta tombol itu dihapus.

### D2: Baris bahan dinamis dengan state lokal modal
- **Choice**: `productionModal()` di-rewrite dan memegang `let lines=[{i:0,qty:8}]`, berisi indeks `rawStock` dan qty. Isi modal: select barang hasil `#finishedItem` + `#finishedQty` (default 40), tabel bahan `#prodLines` (BAHAN BAKU, STOK, QTY DIPAKAI, BIAYA, kolom hapus), tombol "+ Tambah bahan", ringkasan `#costPreview`, serta tombol "Batal" dan "Catat produksi". Fungsi `drawLines()` me-render ulang tbody lewat innerHTML lalu memasang `.onchange` pada select (ganti bahan → re-render baris), `.oninput` pada qty (update state dan ringkasan tanpa re-render supaya fokus input tidak hilang), dan `.onclick` pada tombol hapus. "+ Tambah bahan" menambahkan baris berisi bahan pertama yang belum dipakai, dengan qty 1.
- **Rationale**: Ini mengikuti konvensi template literal + innerHTML + `on*`, tanpa perlu komponen baru.
- **Alternatives considered**: Daftar centang semua bahan (pola Permintaan barang) terlalu berat untuk modal. Auto-isi dari resep butuh data baru. User memilih baris dinamis.

### D3: Lebar modal memakai ulang `.req-modal`
- **Choice**: Bungkus isi modal dengan `<div class="req-modal prod-modal">`. Lebar 760px dan padding tabel ikut dari aturan `.req-modal` yang sudah ada. `styles.css` hanya mendapat tambahan aturan kecil `.prod-modal`: lebar select/input di dalam sel tabel, kolom stok yang redup, dan tombol hapus baris.
- **Rationale**: Ukuran modal lebar jadi konsisten dengan modal Permintaan barang, dan CSS baru tetap minimal.
- **Alternatives considered**: Kelas lebar baru `.modal:has(.prod-modal)` akan menduplikasi aturan yang sudah ada.

### D4: Validasi semua-atau-tidak-sama-sekali
- **Choice**: Saat "Catat produksi" ditekan, urutan pemeriksaannya:
  1. Baris dengan qty > 0 kosong → toast "Tambahkan minimal satu bahan baku".
  2. Jumlah hasil ≤ 0 → toast "Jumlah hasil produksi harus diisi".
  3. Ada bahan dengan qty > stok → toast "Stok <nama> tidak mencukupi (tersedia <qty> <unit>)".

  Kalau salah satu gagal, tidak ada stok yang berubah dan modal tetap terbuka.
- **Rationale**: Ini sesuai aturan domain bahwa stok bahan baku tidak boleh minus. User sudah setuju.

### D5: HPP/unit mengganti `cost` barang hasil
- **Choice**: `total = Σ rawStock[i].cost × qty` dan `hpp = Math.round(total / finishedQty)`. Ringkasan menampilkan "Total biaya bahan Rp… · HPP/unit Rp…". Saat disimpan, `fin.cost = hpp`.
- **Rationale**: Ini konsisten dengan Stok masuk yang mengganti `cost` bahan baku, dan perubahannya langsung terlihat di kolom BIAYA / UNIT.
- **Alternatives considered**: Rata-rata tertimbang dengan stok lama lebih akurat, tapi tidak perlu untuk demo. Tidak mengubah `cost` sama sekali membuat HPP di modal tidak berdampak.

### D6: Riwayat mutasi stok sebagai array global
- **Choice**: Pindahkan isi `tats` ke global `const stockMoves=[...]` di dekat `finishedStock`. Bentuknya tetap array posisional yang sama: `[0]` kode, `[1]` rincian, `[2]` keterangan, `[3]` waktu. Pembacanya hanya `renderInventory` terakhir. Tambahkan `let prdSeq=12`. Saat produksi berhasil, jalankan `stockMoves.unshift([`PRD-0920-${String(prdSeq++).padStart(3,'0')}`, lines.map(l=>`${nama} ${qty} ${unit}`).join(' + '), `Menjadi ${fq} ${fin.name}`, reqNow().slice(-5)])`, lalu `renderInventory()`. Di `index.html:79`, judul diganti "Riwayat mutasi stok" dan subjudul "Transfer, produksi, dan penjualan terbaru".
- **Rationale**: Ini perubahan minimal yang membuat produksi baru langsung terlihat, dengan format yang sama seperti contoh `PRD-0920-011` yang sudah ada.

### D7: Toast sukses
- **Choice**: Setelah berhasil, `closeModal()` dan tampilkan toast "Produksi PRD-0920-012 tercatat. <fq> <unit> <nama hasil> masuk, biaya <rupiah(total)> dibukukan."

### D8: Tabel riwayat produksi di tab LPP barang dagangan
- **Choice**: Di `index.html`, tambahkan panel `<article class="panel hidden" id="productionPanel">` di antara `.inventory-grid` dan `#requestPanel`. Isinya judul "Riwayat produksi", subjudul "Konversi bahan baku menjadi barang dagangan beserta biaya dan HPP.", dan `<div class="table-scroll" id="productionTable">`. Di `app.js`, tambahkan array objek global `const productionLog=[...]` di dekat `stockMoves` dengan bentuk `{id, at, product, qty, unit, lines:[{name,qty,unit}], total, hpp, by}`. Isi contohnya:
  - PRD-0920-011, `20 Sep 2026 09.05`, Paket Favorit 25K 86 porsi, Beras 8 kg + Ayam 12 kg, total 572000, hpp 6651, Budi Santoso.
  - PRD-0920-010, `20 Sep 2026 07.40`, Ayam geprek + nasi 30 porsi, Ayam 6 kg + Tepung terigu 3 kg + Minyak goreng 4 L, total 332500, hpp 11083, Budi Santoso.
  - PRD-0920-009, `19 Sep 2026 21.10`, Es teh manis 120 gelas, Teh celup 2 kotak + Gula pasir 3 kg, total 86500, hpp 721, Rina Pratiwi.

  `renderProductionLog()` mengisi `#productionTable` dengan `tableHtml(['KODE','WAKTU','HASIL','JUMLAH','BAHAN BAKU','TOTAL BIAYA','HPP / UNIT','DICATAT OLEH'], …)`. `renderInventory` terakhir memanggilnya dan menjalankan `$('#productionPanel').classList.toggle('hidden',activeLedger==='raw')`. Saat produksi sukses, `#confirmProduction` menjalankan `productionLog.unshift({id:kode, at:reqNow(), product:fin.name, qty:fq, unit:fin.unit, lines:…, total:t, hpp, by:session.name})` sebelum `renderInventory()`.
- **Rationale**: Panel ini memakai pola panel + `tableHtml` seperti Permintaan barang. Datanya berupa objek, bukan array posisional, mengikuti `materialRequests`/`scheduledOrders`, karena satu produksi punya daftar bahan. Panel muncul di tab tempat produksi dilakukan.
- **Alternatives considered**: Menaruh tabel di Laporan memisahkannya dari alur produksi. Memperluas timeline "Riwayat mutasi stok" membuatnya terlalu sempit untuk 8 kolom. Menampilkan panel di kedua tab kurang relevan untuk tab bahan baku.

## Risks / Trade-offs

- [Risk] Bahan yang sama dipilih di dua baris bisa lolos dari cek stok per baris → Mitigation: tidak ditangani karena ini demo. "+ Tambah bahan" sudah memilih bahan yang belum dipakai, jadi kasus ini jarang terjadi.
- [Risk] Re-render baris saat bahan diganti bisa menghilangkan fokus → Mitigation: re-render hanya dilakukan di `onchange` select, sedangkan input qty hanya memperbarui state.
- [Trade-off] `cost` barang hasil ditimpa tanpa rata-rata → diterima demi kesederhanaan dan efek visual saat demo.
- [Trade-off] Judul panel berubah menjadi "Riwayat mutasi stok", padahal transfer baru tetap tidak tercatat → diterima karena di luar cakupan. Data contoh TAT tetap tampil.

## Migration Plan

N/A. Ini prototipe statis tanpa deployment. Rollback cukup dengan mengembalikan `index.html`, `app.js`, dan `styles.css` lewat git.

## Open Questions

(tidak ada) D5–D6 adalah keputusan Claude yang belum dikonfirmasi eksplisit oleh user, dan bisa dikoreksi saat review.
