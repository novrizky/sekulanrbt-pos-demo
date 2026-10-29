## 1. POS index.html: markup

- [x] 1.1 Tambah tombol sidebar `<button class="nav-item sub" data-view="inventory" data-sub="opname"><span>☑</span> Stok opname</button>` di antara "Mutasi stok" dan "Permintaan barang"
- [x] 1.2 Tambah `<article class="panel" data-subs="opname" id="opnamePanel">` setelah panel Mutasi stok: panel-head "Riwayat stock opname" dengan tombol `#startOpname` "+ Mulai opname", toolbar dengan chip `#opnameScopeFilter` (Semua / Bahan baku / Barang dagangan) dan `<select id="opnameOutletFilter">`, lalu `<div class="table-scroll" id="opnameTable">`
- [x] 1.3 Tambah `<div id="opnameFormPanel" class="hidden">` di dalam `#inventory` setelah `#requestFormPanel`: panel-head "Hitung stok fisik", info outlet/petugas/tanggal `#ofoInfo`, `#ofoTable` dalam `.table-scroll`, foot dengan `#ofoSummary` dan tombol `#ofoCancel` "Batal", `#ofoReset` "Kembalikan ke stok sistem", `#ofoSubmit` "Simpan opname"
- [x] 1.4 Tambah `<section id="opnameDetail" class="view"></section>` setelah `section#closingReview`
- [x] 1.5 Perbarui teks panel `#adminAccess`: kalimat Kepala Toko ditambah "dan melakukan stock opname outletnya", kalimat Administrator ditambah "dan melihat riwayat stock opname semua outlet"

## 2. POS app.js: navigasi, akses, kartu

- [x] 2.1 Tambah `opname:'Stok opname'` ke `INV_TITLES`. Di `setInventorySub`, tutup form opname bila `#inventory` ber-class `opname-form-open` (seperti `req-form-open`), dan panggil `renderOpnames()` bila `sub==='opname'`
- [x] 2.2 Tambah `'opname'` ke `ROLE_ACCESS['Kepala Toko'].subs`
- [x] 2.3 Tambah `SUB_CARDS.opname` (Opname bulan ini, Opname terakhir, Nilai selisih bulan ini) untuk `opnameViewOutlet()` sesuai D11
- [x] 2.4 Di `renderInventory` (satu-satunya definisi, ~baris 96), ikon `#tatList` menjadi `SO`→`☑`, `PRD`→`⚒`, lainnya `⇄`

## 3. POS app.js: data dan riwayat

- [x] 3.1 Tambah section baru di akhir `app.js`: helper `rupiahSigned`, `opnameItems(scope)` (raw = `rawStock` tanpa `shared`, finished = `finishedStock`), `opnameStats(doc)`, `soSeed(...)`, `SCOPE_LABEL={raw:'Bahan baku',finished:'Barang dagangan'}`, state `opnameOutlet='Sekulan RBT 519A'`, `opnameScope='all'`, `opnameDetailFilter='diff'`, `soSeq=0`, `opnameDraft=null`, dan `opnameViewOutlet()`
- [x] 3.2 Isi `stockOpnames` dengan 10 dokumen seed sesuai tabel D3, lalu cocokkan nilai selisih per dokumen dengan tabel itu
- [x] 3.3 Tulis `renderOpnames()`: dropdown outlet (disembunyikan untuk Kepala Toko), tombol `#startOpname` (hanya Kepala Toko), chip cakupan aktif, tabel riwayat via `tableHtml` + `setPager`, keadaan kosong "Belum ada stock opname untuk outlet ini" / "Tidak ada stock opname sesuai filter", handler "Lihat" → `openOpnameDetail(id)`, dan `renderSubSummary('inv')`
- [x] 3.4 Pasang `.onchange` untuk `#opnameOutletFilter` dan `.onclick` untuk chip `#opnameScopeFilter`
- [x] 3.5 Verifikasi manual: login `admin.rbt` → Persediaan › Stok opname. Cek 4 dokumen 519A, kartu "4 dokumen / 19 Sep 2026 / −Rp95.900", ganti ke RM RBT 519B (3 dokumen) dan Salatiga 456B (kosong), dan pastikan tidak ada tombol "+ Mulai opname"

## 4. POS app.js: form hitung dan simpan

- [x] 4.1 `#startOpname` membuka modal "Mulai stock opname" dengan dua `.fee-option` (Bahan baku 17 item / Barang dagangan 11 item) dan tombol "Mulai hitung"
- [x] 4.2 `showOpnameForm(scope)`: bangun `opnameDraft` dari `opnameItems(scope)` (ref asli, `system` snapshot, `physical=String(qty)`), set class `opname-form-open`, judul "Stock opname • <cakupan>", isi `#ofoInfo`, dan render tabel
- [x] 4.3 `renderOpnameForm()` + `updateOpnameRow(i)`: input fisik `.oninput` memperbarui sel selisih (+hijau / −merah), sel catatan (label "Wajib diisi" + chip Rusak/Kadaluarsa/Hilang/Salah input hanya bila selisih ≠ 0), dan `#ofoSummary`, tanpa merender ulang tabel. Chip mengisi input catatan. Badge "Siap jual" untuk item `shared`
- [x] 4.4 `#ofoReset`: kembalikan semua fisik ke sistem, kosongkan catatan, render ulang, dan tampilkan toast "Isian dikembalikan ke stok sistem". `#ofoCancel`: tutup form dan kembali ke riwayat
- [x] 4.5 `#ofoSubmit`: tolak dengan toast "Masih ada <k> item belum dihitung" atau "Stok fisik tidak boleh minus". Jika lolos, buka modal "Simpan stock opname?" dengan tombol "Simpan & sesuaikan stok"
- [x] 4.6 Saat disetujui: set `ref.qty`, `stockOpnames.unshift` (id `SO-0920-${++soSeq}`, 20 Sep 2026, jam sekarang, petugas `session.name`/`session.shift`), `stockMoves.unshift([...])` sesuai D9, tutup form, `renderOpnames()`, dan toast "<id> tersimpan, stok disesuaikan" / "<id> tersimpan, tidak ada selisih"
- [x] 4.7 Verifikasi manual: login `budi.leader`, opname Bahan baku Beras 125 + Telur 180 → toast SO-0920-1, Stok bahan baku Beras 125 kg, Mutasi stok berisi SO-0920-1 dengan ikon ☑. Opname Barang dagangan Rokok Brand D 5 → terlihat di kedua halaman stok. Coba kosongkan kolom dan isi minus

## 5. POS app.js: detail dokumen

- [x] 5.1 `openOpnameDetail(id)`: render `#opnameDetail` (topbar + `.ba-summary` + panel "Daftar item" dengan chip "Hanya yang selisih"/"Semua item", `tableHtml` + `setPager`, dan kosong "Tidak ada item selisih"), aktifkan view itu, dan biarkan submenu "Stok opname" tetap aktif
- [x] 5.2 Tombol "← Kembali" → `openSub('inventory','opname')`. Reset `opnameDetailFilter='diff'` setiap kali detail dibuka
- [x] 5.3 Verifikasi manual: detail SO-0919-1 (3 baris selisih, nilai −Rp34.100), "Semua item" 10 baris dengan "Halaman 1 dari 2", SO-0912-1 kosong, dan Administrator membuka SO-0917-1 Bawen 445B

## 6. POS styles.css

- [x] 6.1 `section#inventory.opname-form-open>*:not(.topbar):not(#opnameFormPanel){display:none}` dan sembunyikan `.top-actions`, sama seperti aturan `req-form-open`
- [x] 6.2 Gaya form hitung: lebar input fisik, `.diff-row`, label "Wajib diisi" (mis. `.line-tag.new`), chip alasan kecil, rata kiri kolom CATATAN (menimpa `td:last-child{text-align:right}` hanya untuk tabel ini), dan ringkasan foot
- [x] 6.3 Verifikasi manual: screenshot 1440×1000, 1000×800, dan 390×844 untuk riwayat, form hitung, dan detail. Pastikan tabel bisa digulir horizontal di 390px dan ikon submenu ☑ tampil di sidebar mode ikon

## 7. Verifikasi akhir

- [x] 7.1 Harness headless Chrome (di `.superpowers/sdd/<plan>/harness/`, di luar tree proyek) mengecek skenario utama spec: riwayat 519A, dropdown Administrator, cakupan 17/11 item, validasi kosong/minus, simpan SO-0920-1 beserta efek ke `rawStock`/`stockMoves`, item tersambung, detail, dan sidebar Kepala Toko dengan 6 submenu Persediaan
- [x] 7.2 Click-through manual di browser sungguhan sebelum demo: alur Kepala Toko dari mulai sampai detail, lalu alur Administrator berganti outlet
