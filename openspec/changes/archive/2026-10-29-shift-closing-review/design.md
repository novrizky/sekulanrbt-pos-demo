## Context

POS outlet (`index.html` + `app.js`) adalah prototipe statis. Tutup shift sekarang berjalan dalam satu rangkaian modal di perangkat Kasir:

| Langkah | Fungsi | Lokasi | Isi |
|---|---|---|---|
| 1 | `closeShiftRecap()` | app.js:118 | rekap kas lengkap |
| 2 | `closeShiftAuth()` | app.js:120–121 | otorisasi Kepala Toko |
| 3 | `closeShiftBA()` | app.js:119 | form BA, lalu `endSession` |

Panel "Berita acara tutup shift" (`#baTable`, index.html:171) ada di Admin › Shift & pengguna dan dirender oleh `renderAdmin()` (app.js:93–98) dari array posisional statis `bas`.

Data yang sudah ada dan bisa dipakai ulang:
- `CLOSING_CASH` (app.js:170): penjualan tunai dan fee per shift.
- `expectedCash(n)` dan `cashDiff()` (app.js:171–172).
- `cancelLog` (app.js:39): kolom `[id, waktu, shift, item, alasan, kasir, status]`.
- `salesRows.harian` (app.js:60): jumlah transaksi per shift.
- `ORDER_NOW` (app.js:203).

## Goals / Non-Goals

**Goals:**
- Kasir hanya mengisi "Uang di cash register" dan catatan opsional, tanpa melihat angka kas sistem.
- Penutupan hanya membutuhkan otorisasi Kepala Toko, lalu modal "Verifikasi tutup shift berhasil".
- Setiap tutup shift tersimpan sebagai record "Belum Diperiksa" di panel BA.
- Kepala Toko memeriksa detail lengkap dan menandai "Sudah Diperiksa" dengan BA dan centang. Administrator hanya melihat.

**Non-Goals:**
- Menu sidebar baru, alur owner, transaksi nyata dari keranjang, pembatasan per shift Kepala Toko, persistensi, dan Pusat Data Outlet.

## Decisions

### D1: Model data `shiftClosings` (array objek)
- **Choice**: `const shiftClosings=[...]` ditaruh dekat `CLOSING_CASH` (setelah app.js:172). Bentuk record:
  `{id, date, shift, cashier, opening, sales, fee, expected, physical, note, authorizedBy, status, ba}`
  - `status` bernilai `'Belum Diperiksa'` atau `'Sudah Diperiksa'`.
  - `ba` berisi `{note, by, at}` atau `null`.
- **Baris contoh**, urut terbaru di atas:

  | ID | Shift | Kasir | Status | Pemeriksa |
  |---|---|---|---|---|
  | `BA-0919-S3` | 3 | Sari W. | Belum | — |
  | `BA-0919-S2` | 2 | Dimas A. | Sudah | Rina Pratiwi |
  | `BA-0919-S1` | 1 | Ayu Setiani | Sudah | Budi Santoso |

  `date` contoh adalah `'19 Sep 2026'`. Angka kas diambil dari `CLOSING_CASH` dan `HANDOVER_NOTES` dengan selisih yang realistis.
- **Rationale**: record mandiri untuk tabel dan detail. Data baru memakai objek, sama seperti `scheduledOrders` dan `materialRequests`.
- **Alternatives considered**: menambah kolom ke `bas` posisional. Ditolak karena BA bersarang dan sekitar 12 field sulit dibaca lewat indeks. Menghitung detail tanpa menyimpan record juga ditolak, karena uang fisik, catatan, dan BA tidak bisa disimpan.
- `bas` lama dihapus. Tidak ada record posisional lain yang terdampak.

### D2: Data contoh transaksi `shiftTransactions`
- **Choice**: `const shiftTransactions={1:[...],2:[...],3:[...]}`. Setiap shift berisi 8 baris `{no, time, items, method, total}` dengan metode Tunai/QRIS/Kartu debit. Jumlah total transaksi diambil dari `salesRows.harian[n-1][3]` (87 / 102 / 35).
- **`items` berupa array `[[nama, qty], ...]`**, bukan string. Contohnya `TRX-0920-1081`: `[['Paket Favorit 25K',1],['Es teh manis',1]]`. Nama harus persis sama dengan nama di `menuData`, supaya modal detail bisa mencari harganya. `total` sama dengan jumlah `qty × harga`.
- **Helper `menuPrice(name)`** mencari harga dari `Object.values(menuData).flat()` berdasarkan nama, dan mengembalikan `0` bila nama tidak ditemukan. Helper ini dipakai oleh modal transaksi dan modal cancel. Nama item di `cancelLog` sudah cocok dengan `menuData`.
- Data yang sama dipakai untuk record tanggal 19 dan 20 Sep. Ini cukup untuk demo.

### D3: Alur Kasir
- **`closeShiftRecap()` (app.js:118, satu-satunya definisi)** ditulis ulang. Modal "Tutup Shift n" berisi:
  - teks pengantar "Hitung uang di cash register, lalu minta Kepala Toko memverifikasi tutup shift.";
  - `<label>Uang di cash register</label><input id="closingCash" type="number" min="0">`;
  - `<label>Catatan (opsional)</label><textarea id="closingNote">`;
  - tombol "Batal" dan "Lanjut ke Kepala Toko" (`#toLeader`).
  
  Fungsi `update`, `#recapPhysical`, `#recapDiff`, dan `#noteRequired` dihapus. `#toLeader` tetap menyimpan `closingCash` dan `closingNote`, lalu memanggil `closeShiftAuth()`.
- **`closeShiftAuth()` (app.js:120–121)**: semua validasi kredensial tetap sama. Di `$('#verifyLeader').onclick` (satu-satunya penugasan), `closeShiftBA()` diganti dengan `finishClosing()`.
- **Fungsi baru `finishClosing()`** menggantikan `closeShiftBA()` (yang dihapus, tanpa salinan mati). Urutannya:
  1. Buat record `BA-0920-S<n>` berisi `opening=openingCash??HANDOVER_NOTES[n].cash`, `sales`/`fee` dari `CLOSING_CASH[n]`, `expected=expectedCash(n)`, `physical=closingCash||0`, `note=closingNote`, `authorizedBy=closingApprover.name`, `status:'Belum Diperiksa'`, dan `ba:null`.
  2. Buang record dengan ID yang sama bila ada, lalu `unshift` record baru.
  3. `renderClosings()`.
  4. `openShift=null`.
  5. `endSession(\`Shift ${n} berhasil ditutup\`)`.
  6. `openModal` "Verifikasi tutup shift berhasil" dengan teks "Shift n telah diverifikasi oleh <Kepala Toko> (Kepala Toko). Data tutup shift menunggu pemeriksaan Kepala Toko." dan tombol "Selesai" (`data-close`).
- **Rationale**: modal (z-index 105) tampil di atas layar login (100). Karena sesi sudah diakhiri lebih dulu, menutup modal lewat cara apa pun berakhir di layar login. Tidak ada keadaan setengah tertutup.

### D4: Panel BA lewat `renderClosings()`
- **Choice**: `const bas=...` dan `tableHtml` lama di `renderAdmin()` (app.js:93, definisi terakhir dan satu-satunya) dihapus. Penggantinya adalah fungsi mandiri `renderClosings()`, yang dipanggil di akhir `loginAs()`, di `finishClosing()`, dan setelah menandai Sudah Diperiksa.
- **Rationale**: `renderAdmin()` dijalankan di level atas (app.js:125) sebelum `let session` (app.js:167) dideklarasikan. `renderClosings()` membaca `session.role`, jadi memanggilnya dari `renderAdmin()` akan memicu ReferenceError (TDZ). View Admin hanya bisa dibuka setelah login, jadi tabel selalu terisi sesuai role yang sedang login.
- Kolom: `['NO. BA','PERIODE','KASIR','UANG FISIK','SELISIH','CANCEL','STATUS','AKSI']`.
  - PERIODE: `${date} • Shift ${shift}`.
  - SELISIH: `cashDiff(physical, expected).text` dengan class-nya.
  - CANCEL: jumlah baris `cancelLog` yang cocok.
  - STATUS: pill `<span class="low|ok">`.
  - AKSI: `<button class="text-btn review-closing" data-id>`. Labelnya "Periksa" bila `session.role==='Kepala Toko'` dan statusnya Belum, selain itu "Lihat".
- Handler dipasang lewat `$$('.review-closing').forEach(b=>b.onclick=...)`, sesuai pola `renderMasterLogins`.
- **Metrik**: `<strong>` "BA menunggu owner" di index.html diberi `id="baPending"` dan labelnya diganti "BA belum diperiksa". `renderClosings()` mengisinya dengan `${n} dokumen`.
- **Pencocokan cancel**: `cancelLog.filter(r=>r[1].startsWith(c.date)&&r[2]===\`Shift ${c.shift}\`)`. Contohnya, `'20 Sep 2026 12.43'` cocok dengan `date` `'20 Sep 2026'`.

### D5: Halaman pemeriksaan `openClosingReview(id)`
- **Choice**: detail tampil sebagai view tersendiri, bukan modal, karena datanya terlalu banyak untuk modal. Di `index.html` ditambahkan `<section id="closingReview" class="view">` tanpa `.nav-item` sendiri, sehingga nav "Admin" tetap aktif. `openClosingReview(id)` mengisi `#closingReview` lewat `innerHTML`, lalu menjalankan `$$('.view').forEach(v=>v.classList.toggle('active',v.id==='closingReview'))`.
- **Alternatif yang ditolak**: file HTML terpisah. State hanya ada di memori, jadi membuka halaman lain akan reload dan menghapus record BA baru serta sesi login.
- **Navigasi kembali**: helper `backToClosings()` mengaktifkan view `admin` dan memanggil `switchAdminTab('users')`. Tombol "← Kembali" di header halaman (`#backToBA`), "Batal" di form, dan "Kembali" di mode baca memanggil helper ini.
- Isi halaman:
  - judul `${id}` dan subjudul `Shift n • tanggal • Kasir • status`;
  - `.ba-summary` (pola yang sudah ada) berisi Modal awal, Penjualan tunai, Fee driver tunai, Seharusnya di laci, Uang fisik, dan Selisih;
  - `.approver-row` "Diverifikasi saat tutup shift oleh: <authorizedBy> (Kepala Toko)";
  - `.handover-box` "CATATAN KASIR" berisi `esc(note)||'-'`;
  - bagian "Transaksi" dengan teks "Menampilkan 8 dari 87 transaksi" dan `tableHtml(['NO. TRANSAKSI','JAM','JUMLAH ITEM','METODE','TOTAL','AKSI'], ...)`. JUMLAH ITEM berisi `${jumlah qty} item`, dan AKSI berisi `<button class="text-btn tx-detail" data-no>Detail</button>`;
  - bagian "Histori cancel" berisi `tableHtml(['ID','WAKTU','ITEM','KASIR','AKSI'], ...)` dengan `<button class="text-btn cancel-detail" data-id>Detail</button>`, atau teks "Tidak ada pembatalan".
  - Kedua tabel dibungkus `.table-scroll`. Wrapper `.req-modal` tidak dipakai lagi di sini. Aturan `styles.css` `.req-modal .data-table{min-width:600px}` tetap dipertahankan karena modal PO juga memakainya.
- **Mode periksa** (Kepala Toko dan status Belum): `<label>Catatan berita acara</label><textarea id="baNote">`, centang `#baConfirm` "Saya sebagai Kepala Toko telah memeriksa transaksi dan histori cancel.", serta tombol "Batal" dan "Tandai sudah diperiksa" (`#markChecked`).
  - Validasi: bila catatan BA kosong atau centang belum dipilih, tampil toast "Lengkapi catatan dan konfirmasi Kepala Toko".
  - Sukses: `c.status='Sudah Diperiksa'`, `c.ba={note,by:session.name,at:ORDER_NOW}`, lalu `renderClosings()`, `backToClosings()`, dan toast `${id} sudah diperiksa`.
- **Mode baca** (status Sudah, atau Administrator): blok "BERITA ACARA" berisi `esc(ba.note)` dan "Diperiksa oleh <by> • <at>" bila ada, ditambah tombol "Kembali".
- Catatan kasir dan catatan BA selalu di-escape dengan helper `esc()` yang sudah ada.

### D5a: Modal detail item `openTxDetail(no)` dan `openCancelDetail(id)`
- **Choice**: kedua modal memakai `openModal()`. Halaman detail tetap terbuka di belakang modal, jadi menutup modal (`data-close`, backdrop) kembali ke halaman itu. Handler dipasang lewat `$$('.tx-detail').forEach(b=>b.onclick=...)` dan `$$('.cancel-detail')...` setiap kali halaman dirender.
- **Modal transaksi**:
  - judul nomor transaksi dan subjudul `Jam • Metode`;
  - `tableHtml(['ITEM','QTY','HARGA','SUBTOTAL'], items.map(([n,q])=>[n,q,rupiah(menuPrice(n)),rupiah(q*menuPrice(n))]))`;
  - baris "Total" `rupiah(t.total)`;
  - tombol "Tutup".
  - **Penyesuaian saat implementasi:** tabel dibungkus `.table-scroll.item-table`, dan `styles.css` mendapat satu aturan tambahan `.item-table .data-table{min-width:0}`. Tanpa aturan ini, `min-width:720px` bawaan `.data-table` membuat tabel 4 kolom terpotong dan harus di-scroll ke samping di modal selebar sekitar 440px, bahkan di desktop.
- **Modal cancel**: baris label-nilai (pola `.ba-summary`) berisi ID, Waktu, Shift, Item, Harga (`menuPrice(r[3])`), Alasan, dan Kasir, ditambah tombol "Tutup". `cancelLog` tetap positional: `[0]` ID, `[1]` waktu, `[2]` shift, `[3]` item, `[4]` alasan, `[5]` kasir.

### D5b: Paging contoh `pagerHtml(total, per)`
- **Choice**: helper baru `pagerHtml(total,per=8)` mengembalikan `<div class="table-pager">` yang berisi:
  - kiri: `<span>Halaman 1 dari ${N}</span>`, dengan `N=Math.max(1,Math.ceil(total/per))`;
  - kanan: tombol `‹ Sebelumnya` (selalu `disabled`), nomor halaman, dan `Berikutnya ›` (`disabled` bila `N===1`).
  - Nomor halaman: `1` (class `active`) `2` `3` bila ada, `…`, lalu `N`. Bila `N<=4`, semua nomor ditampilkan tanpa `…`.
- Semua tombol non-aktif memakai class `.pager-btn`. Setelah halaman dirender, `$$('#closingReview .pager-btn:not([disabled]):not(.active)').forEach(b=>b.onclick=()=>showToast('Data contoh: hanya halaman 1 yang ditampilkan'))`.
- **Pemakaian**:
  - tabel transaksi: `pagerHtml(salesRows.harian[c.shift-1][3])`, sehingga 11 / 13 / 5 halaman untuk Shift 1 / 2 / 3;
  - tabel cancel: `pagerHtml(cn.length)`, ditambahkan hanya bila `cn.length>0`.
- **CSS baru** di `styles.css`:
  - `.table-pager{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px;font-size:11px;color:var(--muted)}`;
  - `.table-pager div{display:flex;gap:4px}`;
  - `.pager-btn{border:1px solid var(--line);background:#fff;border-radius:6px;padding:5px 9px;font:inherit;cursor:pointer}`;
  - `.pager-btn.active{background:var(--green);color:#fff;border-color:var(--green)}`;
  - `.pager-btn[disabled]{opacity:.45;cursor:default}`.
  - `--muted`, `--line`, dan `--green` sudah ada di `:root`.
- **Alternatif yang ditolak**: tombol halaman memindahkan status aktif sambil tetap menampilkan 8 baris yang sama. Ditolak karena terlihat seolah data berubah. Toast lebih jujur untuk data contoh.

### D5c: Perbaikan gaya form berita acara
- **Masalah**: aturan `label`, `textarea`, dan `input` di `styles.css` hanya berlaku di dalam `.modal` (`.modal label{display:block;font-size:10px;...}`, `.modal textarea{width:100%;...}`). Sejak D5 memindahkan form ke halaman, label tampil inline 16px dan textarea memakai gaya bawaan browser (sekitar 168px, monospace, tanpa radius).
- **Choice**: form di mode periksa dibungkus `<div class="review-form">`, dan selector yang ada diperluas:
  - `.modal label` → `.modal label,.review-form label`;
  - `.modal textarea` → `.modal textarea,.review-form textarea`;
  - `.modal input,.modal select` → ditambah `.review-form input`, lalu `.check-row input{width:auto}` yang sudah ada menjaga checkbox tetap kecil.
- **Rationale**: gaya form tetap satu sumber dan tidak ada aturan duplikat. Centang `.check-row` otomatis mengikuti skala label (10px).

### D6: Teks statis yang ikut diperbarui (index.html)
- Kartu shift (`Pengaturan 3 shift`): "Kepala Toko memverifikasi tutup shift Kasir, lalu memeriksa berita acaranya di bawah."
- Subjudul panel BA: "Kepala Toko memeriksa ulang setiap tutup shift dari Kasir."
- Hak akses: "...serta mengotorisasi tutup shift, memeriksa berita acara tutup shift outletnya, dan mengotorisasi pembatalan item order untuk shift yang dipimpinnya."

## Risks / Trade-offs

- [Risk] Detail pemeriksaan panjang (dua tabel ditambah form). → Mitigation: detail tampil sebagai halaman yang bisa di-scroll, bukan modal. Item per transaksi dan detail cancel dipindah ke modal kecil, tabel dibungkus `.table-scroll`, dan baris transaksi dibatasi 8.
- [Risk] Pengguna logout atau login ulang saat halaman detail terbuka. → Mitigation: `loginAs()` sudah mengaktifkan view `home` role tersebut, jadi `#closingReview` otomatis tersembunyi.
- [Risk] Kepala Toko login saat tab Admin bukan `users`. → Mitigation: `loginAs` sudah memanggil `switchAdminTab('users')`, jadi panel langsung terlihat saat membuka Admin.
- [Trade-off] Transaksi berupa data contoh dan tidak mencerminkan pembayaran di keranjang. → Diterima karena prototipe ini mengutamakan tampilan dan alur demo.
- [Trade-off] Spec lama di `shift-closing` tentang BA dan selisih dihapus dari capability tersebut dan ditulis ulang di `shift-closing-review`. → Diterima supaya setiap capability mencerminkan pemiliknya yang baru.

## Migration Plan

N/A. Perubahan ini tidak melibatkan deployment. Cukup buka `index.html` di browser.

## Open Questions

Tidak ada.
