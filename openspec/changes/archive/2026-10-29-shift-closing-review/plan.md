# Pemeriksaan Tutup Shift oleh Kepala Toko: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kasir menutup shift hanya dengan mengisi uang di cash register dan catatan opsional, lalu mendapat otorisasi Kepala Toko. Data tutup shift kemudian masuk ke panel BA di Admin, dan Kepala Toko memeriksanya belakangan lewat detail lengkap.

**Architecture:**
- Record tutup shift disimpan sebagai array objek `shiftClosings`. `finishClosing()` menambahkan record baru, lalu `renderClosings()` (dipanggil dari `renderAdmin()`) merender tabel dan metrik.
- `openClosingReview(id)` menampilkan detail lewat `openModal()`, dalam mode periksa atau mode baca.
- Transaksi diambil dari data contoh `shiftTransactions`. Histori cancel diambil dari `cancelLog` yang ada.

**Tech Stack:** HTML + JS browser biasa (tanpa module atau build). Verifikasi lewat skrip CDP Edge headless.

**Spec:** `openspec/changes/shift-closing-review/design.md` dan `specs/shift-closing`, `specs/shift-closing-review`, `specs/pos-access-control`.

## Global Constraints

- **File yang boleh diubah:** hanya POS (`index.html`, `app.js`). `styles.css` tidak diubah, cukup pakai kelas yang ada: `.ba-summary`, `.approver-row`, `.handover-box`, `.table-scroll`, `.check-row`, `.modal-actions`, `.text-btn`, `ok`/`low`. Jangan sentuh `outlet-data.*`.
- **Gaya kode:** padat, satu baris per fungsi. Handler dipasang lewat `.onclick =`. Tabel memakai `tableHtml(headers, rows)` dengan header KAPITAL. Rupiah memakai `rupiah()`.
- **Teks UI persis:**
  - "Uang di cash register", "Catatan (opsional)", "Lanjut ke Kepala Toko"
  - "Verifikasi tutup shift berhasil", "Shift <n> telah diverifikasi oleh <nama> (Kepala Toko).", "Selesai"
  - "Belum Diperiksa", "Sudah Diperiksa", "Periksa", "Lihat", "BA belum diperiksa", "<n> dokumen"
  - "Menampilkan <x> dari <total> transaksi", "Tidak ada pembatalan", "Catatan berita acara"
  - "Saya sebagai Kepala Toko telah memeriksa transaksi dan histori cancel."
  - "Tandai sudah diperiksa", "Lengkapi catatan dan konfirmasi Kepala Toko", "<id> sudah diperiksa"
  - "Diverifikasi saat tutup shift oleh: <nama> (Kepala Toko)", "Diperiksa oleh <by> • <at>"
- **Waktu pemeriksaan:** `ORDER_NOW` (`'20 Sep 2026 13.02'`). Tanggal record baru: `'20 Sep 2026'`.
- **Commit:** hanya bila user meminta.

## Review Focus

- **Modal sukses ditutup lewat klik backdrop.** Hasilnya harus tetap layar login, karena sesi sudah diakhiri sebelum modal dibuka. Diuji di Task 2 Step 3.
- **Shift 1 ditutup dua kali dalam satu sesi demo.** Hanya boleh ada satu baris `BA-0920-S1`. Diuji di Task 2 Step 3.
- **Kepala Toko dari shift lain** (Rina) harus tetap mendapat "Periksa" untuk shift mana pun. Diuji di Task 3 Step 4.
- **Kasir yang tidak mengisi uang:** `physical` bernilai 0 dan selisih "Kurang ...", tanpa error. Diuji di Task 2 Step 3.
- **Modal pemeriksaan di lebar 400px:** tidak boleh ada scroll horizontal di halaman. Diuji di Task 3 Step 4.

---

### Task 1: Data `shiftClosings` dan `shiftTransactions`

**Files:**
- Modify: `app.js`, setelah `cashDiff` (sekitar baris 172). Hapus `const bas` di `renderAdmin()` (sekitar baris 97) beserta `$('#baTable').innerHTML=...` lama.

**Interfaces:**
- Produces:
  - `shiftClosings: Array<{id:string, date:string, shift:number, cashier:string, opening:number, sales:number, fee:number, expected:number, physical:number, note:string, authorizedBy:string, status:'Belum Diperiksa'|'Sudah Diperiksa', ba:null|{note:string, by:string, at:string}}>`, terbaru di indeks 0.
  - `shiftTransactions: {1|2|3: Array<{no:string, time:string, items:string, method:string, total:number}>}`, masing-masing 8 baris.

- [x] **Step 1:** Tambahkan `shiftClosings` dengan 3 baris, `date:'19 Sep 2026'`, dan `expected=opening+sales-fee`:

  | ID | Kasir | Opening | Sales | Fee | Fisik | Catatan | Status | BA |
  |---|---|---|---|---|---|---|---|---|
  | `BA-0919-S3` | Sari W. | 380000 | 910000 | 0 | 1290000 | — | Belum | null |
  | `BA-0919-S2` | Dimas A. | 520000 | 2780000 | 40000 | 3240000 | 'Uang receh untuk kembalian kurang' | Sudah | Rina Pratiwi, '19 Sep 2026 22.15' |
  | `BA-0919-S1` | Ayu Setiani | 450000 | 2150000 | 85000 | 2515000 | — | Sudah | Budi Santoso, '19 Sep 2026 14.20' |

  `authorizedBy` diisi Kepala Toko shift masing-masing: Taufik Hadi / Rina Pratiwi / Budi Santoso. Catatan BA ditulis singkat dan realistis.
- [x] **Step 2:** Tambahkan `shiftTransactions`:
  - Format nomor: `TRX-0920-<n><3 digit>`.
  - Jam di dalam `SHIFT_HOURS[n]`.
  - `items` diambil dari nama menu di `menuData`, misalnya "Paket Favorit 25K ×2, Es teh manis ×2".
  - `method` bernilai Tunai, QRIS, atau Kartu debit.
- [x] **Step 3:** Hapus `bas` lama. Verifikasi: `node -e "new Function(require('fs').readFileSync('app.js','utf8'))"` tidak error.

### Task 2: Alur tutup shift Kasir

**Files:** Modify `app.js`: `closeShiftRecap()` (sekitar 118), hapus `closeShiftBA()` (sekitar 119), handler `#verifyLeader` di `closeShiftAuth()` (sekitar 121).

**Interfaces:**
- Consumes: `shiftClosings` (Task 1), `expectedCash(n)`, `CLOSING_CASH`, `HANDOVER_NOTES`, `closingApprover`, `closingCash`, `closingNote`, `openingCash`, `endSession()`.
- Produces: `finishClosing(): void`, yang memanggil `renderAdmin()`. Task 3 memastikan `renderAdmin()` merender ulang tabel.

- [x] **Step 1:** Grep `closeShiftRecap|closeShiftBA|closeShiftAuth|verifyLeader|toLeader|baTable` dan pastikan tiap fungsi hanya punya satu definisi/penugasan.
- [x] **Step 2:** Lakukan tiga perubahan:
  - Tulis ulang `closeShiftRecap()` sesuai design D3. `#toLeader` tetap mengisi `closingCash`/`closingNote` lalu memanggil `closeShiftAuth()`.
  - Tambahkan `finishClosing()` sesuai D3. Urutannya: replace/unshift record, `renderAdmin()`, `openShift=null`, `endSession`, `openModal` sukses.
  - Di `#verifyLeader`, ganti `closeShiftBA()` dengan `finishClosing()`, lalu hapus `closeShiftBA`.
- [x] **Step 3: Verifikasi (CDP).** Alur: login `ayu.kasir`, mulai shift dengan modal 450000, lalu `#closeShift`.
  - Teks modal tidak mengandung "Modal awal", "Seharusnya", "Selisih", maupun "(wajib)". Hanya ada `#closingCash` dan `#closingNote`.
  - Batal: modal tertutup dan `openShift` masih ada.
  - Isi 2490000, lalu `#toLeader` dan `#verifyLeader`. Hasilnya: toast "Shift 1 berhasil ditutup", modal berisi "Verifikasi tutup shift berhasil" dan "Shift 1 telah diverifikasi oleh Budi Santoso (Kepala Toko).", layar login terbuka, dan `shiftClosings[0].id==='BA-0920-S1'` dengan status Belum.
  - Tutup modal lewat klik backdrop: layar login tetap tampil.
  - Ulangi tutup shift tanpa mengisi uang: hanya ada satu `BA-0920-S1`, dengan `physical===0`.
  - Penolakan `rina.leader`: toast "Hanya Kepala Toko Shift 1 (Budi Santoso) yang dapat menutup shift ini".

### Task 3: Panel BA dan modal pemeriksaan

**Files:**
- Modify `app.js`: `renderAdmin()` memanggil `renderClosings()`. Tambahkan juga `openClosingReview(id)`.
- Modify `index.html`:
  - metrik (sekitar 165) diberi `<small>BA belum diperiksa</small><strong id="baPending">`;
  - teks kartu shift (sekitar 168);
  - subjudul panel BA (sekitar 171);
  - teks Hak akses (sekitar 175).

**Interfaces:**
- Consumes: `shiftClosings`, `shiftTransactions` (Task 1), `cancelLog`, `salesRows.harian`, `cashDiff`, `session.role`, `ORDER_NOW`.
- Produces: `renderClosings(): void`, `openClosingReview(id:string): void`.

- [x] **Step 1:** Implementasikan `renderClosings()` sesuai design D4.
  - Kolom tabel dan label aksi diambil dari spec "Hanya Kepala Toko yang memeriksa".
  - Jumlah cancel dihitung dengan `cancelLog.filter(r=>r[1].startsWith(c.date)&&r[2]===\`Shift ${c.shift}\`).length`.
- [x] **Step 2:** Implementasikan `openClosingReview(id)` sesuai design D5.
  - Mode periksa hanya berlaku bila `session.role==='Kepala Toko'&&c.status==='Belum Diperiksa'`.
  - Total transaksi diambil dari `salesRows.harian[c.shift-1][3]`.
- [x] **Step 3:** Ubah teks statis di `index.html` sesuai design D6 dan tasks 4.1–4.4.
- [x] **Step 4: Verifikasi (CDP).** Lanjutan dari Task 2. Login `budi.leader`, lalu `view('admin')`:
  - Baris 1 adalah `BA-0920-S1`: "20 Sep 2026 • Shift 1", "Ayu Setiani", "Rp2.490.000", "Kurang Rp25.000", cancel "2", "Belum Diperiksa", aksi "Periksa". `#baPending` berisi "2 dokumen". Tidak ada teks "Menunggu kepala toko", "Dikirim owner", maupun "Disetujui".
  - Klik "Periksa": muncul "Rp450.000", "Rp2.150.000", "Rp85.000", "Rp2.515.000", "Rp2.490.000", "Kurang Rp25.000", "Diverifikasi saat tutup shift oleh: Budi Santoso (Kepala Toko)", "Menampilkan 8 dari 87 transaksi", "CNL-0920-007", dan "CNL-0920-006".
  - `#markChecked` tanpa catatan: toast "Lengkapi catatan dan konfirmasi Kepala Toko" dan status tetap Belum.
  - Isi catatan dan centang, lalu `#markChecked`: toast "BA-0920-S1 sudah diperiksa", status Sudah, `#baPending` menjadi "1 dokumen".
  - Klik "Lihat" pada `BA-0920-S1`: muncul "Diperiksa oleh Budi Santoso • 20 Sep 2026 13.02", tanpa `#baNote` dan tanpa `#markChecked`.
  - Login `rina.leader`: `BA-0919-S3` menampilkan "Periksa", dan detailnya berisi "Tidak ada pembatalan".
  - Login `admin.rbt`: semua aksi "Lihat". Detail `BA-0919-S3` tanpa `#baNote`. Tab Hak akses memuat "memeriksa berita acara tutup shift outletnya".
  - Lebar 400px dengan modal periksa terbuka: `document.documentElement.scrollWidth<=400`.
  - Tidak ada error di console.

### Task 4: Detail BA sebagai halaman, item dalam modal (revisi)

> Ditambahkan lewat `/opsx:update` setelah Task 1–3 selesai. User meminta detail berita acara dipindah ke halaman sendiri karena datanya terlalu banyak untuk modal, dan item transaksi serta cancel ditampilkan per item dalam modal. Lihat design D2, D5, D5a dan tasks 5.1–5.6.

**Files:**
- Modify `app.js`: data `shiftTransactions` (sekitar 175–178), helper baru `menuPrice`, `openClosingReview` (sekitar 182), serta fungsi baru `backToClosings`, `openTxDetail`, dan `openCancelDetail`.
- Modify `index.html`: tambah `<section id="closingReview" class="view"></section>` setelah `section#admin` (sekitar 159).

**Interfaces:**
- Consumes: `shiftClosings`, `closingCancels(c)`, `menuData`, `cashDiff`, `esc`, `tableHtml`, `rupiah`, `switchAdminTab`, `renderClosings`, `session`, `ORDER_NOW`.
- Produces: `menuPrice(name):number`, `backToClosings():void`, `openTxDetail(no:string):void`, `openCancelDetail(id:string):void`. `openClosingReview(id)` sekarang merender ke `#closingReview`, bukan `openModal`.
- `shiftTransactions[n][i].items` berubah menjadi `Array<[string, number]>`.

- [ ] **Step 1:** Ubah data `items` ke `[[nama,qty],...]` untuk ke-24 transaksi. Cek: semua nama ditemukan oleh `menuPrice` (>0), dan Σ qty×harga === `total`. Verifikasi dengan `node -e` (eval app.js di stub DOM, atau salin data ke skrip) atau lewat CDP.
- [ ] **Step 2:** Tambah `section#closingReview` dan `backToClosings()`. Ubah `openClosingReview()` sesuai D5:
  - render ke section, lalu toggle `.view`;
  - kolom baru, tombol `.tx-detail` / `.cancel-detail`;
  - `#backToBA`, "Batal", dan "Kembali" memanggil `backToClosings()`;
  - setelah tandai sukses: `renderClosings()`, `backToClosings()`, lalu toast.
- [ ] **Step 3:** Tambah `openTxDetail(no)` dan `openCancelDetail(id)` sesuai D5a. Pasang handler setiap kali halaman dirender.
- [ ] **Step 4: Verifikasi (CDP).** Jalankan ulang suite Task 2–3 setelah disesuaikan (klik "Periksa" kini berpindah view, tidak membuka modal), lalu tambahkan:
  - Setelah "Periksa" BA-0920-S1: `#closingReview.active`, `.modal` tidak terbuka, dan nav "Admin" tetap aktif.
  - `#backToBA`: `#admin.active`, tab `#adminUsers` aktif, status BA-0920-S1 tetap Belum.
  - `.tx-detail[data-no="TRX-0920-1081"]`: modal berisi "Paket Favorit 25K", "Rp25.000", "Es teh manis", "Rp6.000", "Rp31.000". Setelah ditutup lewat backdrop, `#closingReview.active` tetap.
  - `.cancel-detail[data-id="CNL-0920-007"]`: modal berisi "Paket Komplit 23K", "Rp23.000", "Salah pilih menu", "Ayu Setiani".
  - Tandai sukses: `#admin.active`, toast "BA-0920-S1 sudah diperiksa", dan `#baPending` "1 dokumen".
  - Role: Rina mendapat "Periksa" pada BA-0919-S3 dengan "Tidak ada pembatalan". Admin hanya mendapat "Lihat" tanpa `#baNote`.
  - Lebar 400px: `scrollWidth` halaman detail ≤ `scrollWidth` halaman Admin (452px di HEAD), dan modal detail item tidak melebihi viewport.
  - Logout lalu login ulang saat halaman detail terbuka: view `home` aktif dan `#closingReview` tidak aktif.
  - Suite regresi `kasir-logout-resume-shift` tetap PASS, dan tidak ada error di console.

### Task 5: Paging contoh dan perbaikan form berita acara (revisi)

> Ditambahkan lewat `/opsx:update` setelah Task 4 selesai. User meminta paging contoh di tabel transaksi dan histori cancel, dan melaporkan CSS field berita acara rusak. Penyebabnya: gaya label/textarea hanya berlaku di `.modal`, sedangkan form sudah pindah ke halaman. Lihat design D5b, D5c dan tasks 6.1–6.4.

**Files:**
- Modify `app.js`: helper baru `pagerHtml`. `openClosingReview` (sekitar 185) memasang pager, membungkus form dengan `.review-form`, dan memasang handler toast `.pager-btn`.
- Modify `styles.css`: selector `.modal label`, `.modal textarea`, `.modal input,.modal select` diperluas ke `.review-form`. Ditambah aturan `.table-pager` dan `.pager-btn`.

**Interfaces:**
- Consumes: `salesRows.harian`, `closingCancels(c)`, `showToast`.
- Produces: `pagerHtml(total:number, per?:number):string`.

- [ ] **Step 1:** Tambah `pagerHtml` dan CSS pager sesuai D5b. Untuk N≤4 semua nomor tampil, untuk N>4 tampil `1 2 3 … N`.
- [ ] **Step 2:** Pasang pager di dua tabel, lalu pasang handler toast di `#closingReview .pager-btn:not([disabled]):not(.active)`.
- [ ] **Step 3:** Bungkus form dengan `.review-form` dan perluas selector CSS sesuai D5c. Grep dulu definisi `.modal label` / `.modal textarea` / `.modal input` di `styles.css` untuk memastikan baris mana yang diubah.
- [ ] **Step 4: Verifikasi (CDP).** Tambahkan ke suite `e2e3.mjs`:
  - Teks pager per shift: 11 / 13 / 5. `.pager-btn.active` berisi "1". Tombol "‹ Sebelumnya" `disabled`.
  - Klik "Berikutnya ›": toast sesuai dan `tbody tr` transaksi tetap 8 dengan nomor yang sama.
  - Pager cancel "Halaman 1 dari 1" dengan kedua panah disabled. BA-0919-S3 tidak punya `.table-pager` di bagian cancel.
  - `getComputedStyle`: label `display:block` dan `font-size:10px`; textarea `width` ≥ 90% lebar panel dan `font-family` tidak memuat "monospace"; checkbox `width` < 30px.
  - Lebar 400px: `scrollWidth` tidak melebihi halaman Admin.
  - Screenshot form dan pager, lalu jalankan ulang suite regresi.
