# Produksi Multi-Bahan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tombol "+ Hasil produksi" di tab LPP barang dagangan membuka modal produksi lebar dengan banyak bahan baku. Tombol header "− Keluarkan untuk produksi" dihapus, dan produksi tercatat di "Riwayat mutasi stok".

**Architecture:** Hanya POS (`index.html`, `app.js`, `styles.css`). `productionModal()` di-rewrite dengan state baris lokal yang di-render lewat innerHTML + handler `on*`. Riwayat dipindah ke array global `stockMoves` yang dibaca oleh `renderInventory` terakhir.

**Tech Stack:** HTML/CSS/JS browser biasa tanpa build. Tidak ada test otomatis, jadi verifikasi dilakukan manual di browser.

**Spec:** `openspec/changes/production-multi-material/specs/stock-production/spec.md`, `design.md` (D1–D7), dan `tasks.md` di folder yang sama.

## Global Constraints

- Semua teks UI dalam Bahasa Indonesia. Uang memakai `rupiah()`.
- Render memakai template literal → `innerHTML`, dan handler lewat `.onclick` / `.oninput` / `.onchange`. Jangan memakai `addEventListener`.
- Pertahankan kepadatan kode `app.js` (satu baris per fungsi bila memungkinkan). Jangan memformat ulang file.
- Ubah handler `#stockIn` yang **terakhir** (`app.js:156`). Jangan menambah handler baru di tempat lain.
- Teks persis: judul modal "Catat hasil produksi", tombol "+ Tambah bahan" dan "Catat produksi", header tabel `BAHAN BAKU`, `STOK`, `QTY DIPAKAI`, `BIAYA`.
- Toast persis: "Tambahkan minimal satu bahan baku", "Jumlah hasil produksi harus diisi", "Stok <nama> tidak mencukupi (tersedia <qty> <unit>)", dan "Produksi <kode> tercatat. <fq> <unit> <nama hasil> masuk, biaya <rupiah(total)> dibukukan."
- Format ringkasan: "Total biaya bahan <rupiah(total)> · HPP/unit <rupiah(hpp)>", dengan `hpp=fq>0?Math.round(total/fq):0`.
- Commit hanya bila user memintanya.

## Review Focus

1. Input qty bahan dikosongkan (`''` → `NaN`) harus dihitung sebagai 0, sehingga ringkasan tetap angka dan baris tersebut diabaikan saat validasi. Dicek di Task 2 Step 4.
2. "+ Tambah bahan" ditekan saat ke-17 bahan sudah dipakai harus menampilkan toast "Semua bahan baku sudah dipilih" tanpa menambah baris. Dicek di Task 2 Step 4.
3. Membuka ulang modal setelah batal atau setelah sukses harus kembali ke kondisi awal (Beras 8, hasil 40), bukan sisa state lama. Dicek di Task 2 Step 5.
4. Mengganti barang hasil di `#finishedItem` tidak boleh mengubah ringkasan biaya, dan unit di toast sukses harus mengikuti barang hasil yang dipilih (misalnya "gelas" untuk Es teh manis). Dicek di Task 2 Step 5.
5. Setelah produksi sukses, tab yang aktif (barang dagangan) tetap aktif, dan tabel serta jumlah "Stok menipis" ikut diperbarui. Dicek di Task 2 Step 5.

---

### Task 1: Titik masuk, penghapusan tombol header, dan riwayat global

**Files:**
- Modify: `index.html:70` (hapus `#productionIssue`), `index.html:79` (judul dan subjudul panel)
- Modify: `app.js:35-38` (tambah global setelah `finishedStock`), `app.js:73-74` (render riwayat), `app.js:112-113` (hapus wiring mati), `app.js:156` (handler `#stockIn`)

**Interfaces:**
- Produces: `stockMoves` berupa array posisional `[kode, rincian, keterangan, jam]` dengan isi awal empat entri dari `tats` sekarang, dalam urutan yang sama. `let prdSeq=12`. `renderInventory()` merender `#tatList` dari `stockMoves`, dengan ikon `⚒` untuk kode `PRD*` dan `⇄` untuk lainnya.
- Consumes: `productionModal()` (sudah ada, di-rewrite di Task 2).

- [ ] **Step 1:** Hapus `<button class="btn ghost" id="productionIssue">…</button>` di `index.html:70`. Di `index.html:79`, ganti `Riwayat TAT` → `Riwayat mutasi stok` dan `Transfer antar toko terbaru.` → `Transfer, produksi, dan penjualan terbaru.`
- [ ] **Step 2:** Pindahkan literal `tats` di `app.js:73` ke `const stockMoves=[…];let prdSeq=12;` setelah deklarasi `finishedStock`. Ubah `app.js:74` agar memakai `stockMoves.map(...)`.
- [ ] **Step 3:** Di `app.js:112`, hapus `$('#productionIssue').onclick=productionModal;` dan pertahankan `#exportSales` serta `#printReport`. Hapus seluruh baris `app.js:113` (handler `#stockIn` yang mati).
- [ ] **Step 4:** Di `app.js:156`, ganti cabang toast menjadi `productionModal()`, sehingga hasilnya `$('#stockIn').onclick=()=>activeLedger==='raw'?stockInModal():productionModal();`
- [ ] **Step 5 (verifikasi):** Jalankan `grep -n "productionIssue\|const tats" app.js index.html`. Tidak boleh ada hasil.
- [ ] **Step 6 (verifikasi browser):** Buka `index.html`, login `admin.rbt` / `demo123`, lalu buka Persediaan. Yang diharapkan: header hanya berisi "⇄ Transfer antar toko", panel kanan berjudul "Riwayat mutasi stok" dengan 4 entri lama (PRD-0920-011 berikon ⚒), "+ Stok masuk" di tab bahan baku membuka "Stok bahan baku masuk", dan "+ Hasil produksi" di tab barang dagangan membuka modal produksi lama tanpa toast.

### Task 2: Modal produksi multi-bahan

**Files:**
- Modify: `app.js:101-105` (`productionModal`, di-rewrite seluruhnya)
- Modify: `styles.css` (tambah aturan `.prod-modal` setelah blok `.req-modal`, sekitar baris 72)

**Interfaces:**
- Consumes: `rawStock`, `finishedStock`, `stockMoves`, `prdSeq` (Task 1), `reqNow()` (`app.js:274`, dipakai `.slice(-5)` untuk jam), `openModal`, `closeModal`, `renderInventory`, `rupiah`, `showToast`.
- Produces: `productionModal()` tanpa argumen. Elemen yang dihasilkan: `#finishedItem`, `#finishedQty`, `#prodLines` (tbody), `#addProdLine`, `#costPreview`, `#confirmProduction`. Baris tabel memakai `select.prod-raw[data-line]`, `input.prod-qty[data-line]`, dan `button.prod-del[data-line]`.

- [ ] **Step 1: Kerangka modal.** `openModal` dengan `<div class="req-modal prod-modal">`, berisi `<h2>Catat hasil produksi</h2>`, paragraf "Bahan baku berkurang dan nilainya dibukukan sebagai biaya bahan baku. Hasil produksi masuk ke LPP barang dagangan.", `form-grid` (label "Hasil barang dagangan" `#finishedItem` dan "Jumlah hasil" `#finishedQty` value 40), tabel `stock-table` dengan thead `BAHAN BAKU | STOK | QTY DIPAKAI | BIAYA | ''` dan `<tbody id="prodLines">`, tombol `#addProdLine` "+ Tambah bahan", `.cost-preview#costPreview`, serta `modal-actions` (Batal `[data-close]`, `#confirmProduction` "Catat produksi"). State lokal `let lines=[{i:0,qty:8}]` dideklarasikan di dalam fungsi, sehingga setiap pembukaan modal mulai dari kondisi awal.
- [ ] **Step 2: `draw()` dan `sum()` lokal.** `sum()` menghitung `total=Σ rawStock[l.i].cost*(l.qty||0)`, membaca `fq=+$('#finishedQty').value||0`, lalu menulis ringkasan sesuai format di Global Constraints. `draw()` merender tbody. Isi tiap baris: select semua `rawStock` (selected = `l.i`), sel STOK `${qty} ${unit}`, input number qty, sel biaya `rupiah(cost*qty)`, dan tombol `×`. Setelah render, pasang `.onchange` select (`l.i=+value; draw()`), `.oninput` qty (`l.qty=+value||0`, update sel biaya baris itu, panggil `sum()`, tanpa re-render), dan `.onclick` hapus (`lines.splice(n,1); draw()`). `draw()` diakhiri dengan `sum()`. `#finishedQty.oninput=sum`.
- [ ] **Step 3: Tambah baris.** `#addProdLine.onclick` mencari indeks `rawStock` pertama yang tidak ada di `lines`. Kalau tidak ditemukan, tampilkan toast "Semua bahan baku sudah dipilih". Kalau ditemukan, `lines.push({i,qty:1}); draw()`.
- [ ] **Step 4: Simpan.** `#confirmProduction.onclick`: `use=lines.filter(l=>l.qty>0)`. Kalau kosong, tampilkan "Tambahkan minimal satu bahan baku". Kalau `fq<=0`, tampilkan "Jumlah hasil produksi harus diisi". Kalau ada `bad=use.find(l=>l.qty>rawStock[l.i].qty)`, tampilkan "Stok ${nama} tidak mencukupi (tersedia ${qty} ${unit})". Ketiga kasus itu `return` tanpa mengubah apa pun. Kalau semua lolos: kurangi tiap bahan, lalu `fin.qty+=fq; fin.cost=hpp`. Buat `kode=`PRD-0920-${String(prdSeq++).padStart(3,'0')}``, lalu `stockMoves.unshift([kode, use.map(l=>`${nama} ${qty} ${unit}`).join(' + '), `Menjadi ${fq} ${fin.name}`, reqNow().slice(-5)])`, dan jalankan `renderInventory(); closeModal()` serta toast sukses.
- [ ] **Step 5: CSS.** Di `styles.css`: `.prod-modal td select,.prod-modal td input{width:100%;padding:7px}`, `.prod-modal td input.prod-qty{width:80px}`, `.prod-modal td.muted{color:var(--muted)}` (beri kelas `muted` pada sel STOK), `.prod-del{border:0;background:none;color:var(--red);font-size:15px;cursor:pointer}`, dan `#addProdLine{margin-top:8px}` dengan kelas `btn ghost`. Lebar 760px sudah datang dari `.modal:has(.req-modal)`, jadi tidak perlu aturan lebar baru.
- [ ] **Step 6 (verifikasi browser, dari reload):** Ikuti `tasks.md` 4.3–4.8. Yang diharapkan:
  - Kondisi awal: "Total biaya bahan Rp116.000 · HPP/unit Rp2.900".
  - Tambah Ayam 12: "Rp572.000 · HPP/unit Rp14.300".
  - Ayam 40: toast "Stok Ayam tidak mencukupi (tersedia 34 kg)".
  - Sukses: toast "Produksi PRD-0920-012 tercatat. 40 porsi Paket Favorit 25K masuk, biaya Rp572.000 dibukukan.", Paket Favorit 126 porsi dengan BIAYA / UNIT Rp14.300, Beras 120 kg, Ayam 22 kg, dan entri teratas riwayat PRD-0920-012. Produksi kedua menghasilkan PRD-0920-013.
- [ ] **Step 7 (verifikasi Review Focus):**
  - Kosongkan qty Beras: ringkasan tetap angka, dan "Catat produksi" dengan satu-satunya baris kosong menampilkan "Tambahkan minimal satu bahan baku".
  - Tekan "+ Tambah bahan" 17 kali: toast "Semua bahan baku sudah dipilih" muncul.
  - Batal lalu buka lagi: modal kembali ke Beras 8 dan hasil 40.
  - Pilih "Es teh manis": ringkasan biaya tidak berubah dan toast sukses memakai "gelas".
  - Setelah sukses: tab barang dagangan tetap aktif.

### Task 3: Tabel riwayat produksi

**Files:**
- Modify: `index.html`, di antara penutup `.inventory-grid` dan `<article class="panel" id="requestPanel">`
- Modify: `app.js`, yaitu global setelah `stockMoves`, `renderInventory` terakhir, dan cabang sukses `#confirmProduction` di dalam `productionModal()`

**Interfaces:**
- Consumes: `stockMoves`, `prdSeq`, `productionModal()` (Task 1–2), `tableHtml(headers, rows)` (kolom pertama otomatis `<strong>`), `rupiah`, `reqNow()`, dan global `session` (akun yang sedang login, `session.name`).
- Produces: `const productionLog` berisi objek `{id, at, product, qty, unit, lines:[{name,qty,unit}], total, hpp, by}`, urut dari yang terbaru, serta `renderProductionLog()` tanpa argumen yang mengisi `#productionTable`.

- [ ] **Step 1:** Tambahkan panel `<article class="panel hidden" id="productionPanel">` di `index.html`. Isi `panel-head`-nya `<h2>Riwayat produksi</h2><p>Konversi bahan baku menjadi barang dagangan beserta biaya dan HPP.</p>`, lalu `<div class="table-scroll" id="productionTable"></div>`.
- [ ] **Step 2:** Tambahkan `const productionLog=[…]` dengan 3 data contoh persis seperti design D8, dengan urutan 011, 010, 009.
- [ ] **Step 3:** Tulis `renderProductionLog()` yang memanggil `tableHtml(['KODE','WAKTU','HASIL','JUMLAH','BAHAN BAKU','TOTAL BIAYA','HPP / UNIT','DICATAT OLEH'], productionLog.map(p=>[p.id,p.at,p.product,`${p.qty} ${p.unit}`,p.lines.map(l=>`${l.name} ${l.qty} ${l.unit}`).join(' + '),rupiah(p.total),rupiah(p.hpp),p.by]))`. Di akhir `renderInventory` terakhir, panggil `renderProductionLog();$('#productionPanel').classList.toggle('hidden',activeLedger==='raw')`.
- [ ] **Step 4:** Di cabang sukses `#confirmProduction`, jalankan `productionLog.unshift({id:kode,at:reqNow(),product:fin.name,qty:fq,unit:fin.unit,lines:use.map(l=>({name,qty,unit})),total:t,hpp,by:session.name})` sebelum `renderInventory()`. Gunakan kode yang sama dengan entri `stockMoves`, jangan memanggil `prdSeq++` dua kali.
- [ ] **Step 5 (verifikasi):** Tambahkan blok T3 ke harness `.superpowers/sdd/plan/harness/test.js` dan jalankan `bash .superpowers/sdd/plan/harness/run.sh all`.
  - Tab raw: `#productionPanel` punya class `hidden`.
  - Tab finished: panel tampil, ada 3 baris, dan baris teratas berisi `PRD-0920-011 | 20 Sep 2026 09.05 | Paket Favorit 25K | 86 porsi | Beras 8 kg + Ayam 12 kg | Rp572.000 | Rp6.651 | Budi Santoso`.
  - Setelah produksi Beras 8 + Ayam 12 → 40 Paket Favorit 25K oleh admin: ada 4 baris dan baris teratas berisi `PRD-0920-012 … 40 porsi … Rp572.000 | Rp14.300 | Raka Administrator`.
  - Semua tes T1/T2 tetap PASS.
