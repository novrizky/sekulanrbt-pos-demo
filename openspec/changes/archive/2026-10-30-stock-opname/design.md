## Context

Modul Persediaan POS (`index.html` + `app.js`) sudah punya dua buku stok: `rawStock` (bahan baku) dan `finishedStock` (barang dagangan). Item tersambung di `sharedStock` (Rokok Brand A–E, Air mineral) adalah objek yang sama di kedua array. Stok berubah lewat stok masuk, PO, produksi, penjualan, fee driver, dan transfer, tetapi belum ada cara mencocokkannya dengan hitungan fisik.

Batasan yang ditemukan di kode:
- Stok tidak dipisah per outlet. Stok yang "hidup" secara efektif milik Sekulan RBT 519A, dan semua akun Kepala Toko (`budi.leader`, `rina.leader`, `taufik.leader`) ada di sana.
- Submenu Persediaan dikendalikan oleh `openSub` → `setInventorySub(sub)`, yang men-toggle `#inventory [data-subs]`, mengambil judul dari `INV_TITLES`, dan kartu dari `SUB_CARDS` lewat `renderSubSummary('inv')`. Akses per role diatur `ROLE_ACCESS[...].subs`.
- Pola yang bisa dipakai ulang: form inline Permintaan barang (`#requestFormPanel` + class `req-form-open`), detail halaman penuh BA tutup shift (`section#closingReview`, `openClosingReview`), dropdown outlet Pesanan (`#orderOutletFilter`), `tableHtml`, `setPager`/`PAGE_SIZE`, `.fee-options` di modal, `.line-tag`, `.ok`/`.low`, dan `showToast`.
- `rupiah()` memotong nilai negatif ke 0, sehingga nilai selisih bertanda butuh helper sendiri.
- `renderInventory` kini hanya dideklarasikan sekali (`app.js` baris ~96), dan di situlah timeline `#tatList` dirender.

Pemangku kepentingan: Kepala Toko (pelaksana), Administrator (pemantau), dan penonton demo (pemilik usaha).

## Goals / Non-Goals

**Goals:**
- Kepala Toko bisa menjalankan stock opname satu cakupan (Bahan baku atau Barang dagangan) untuk outletnya, mencatat alasan selisih, dan menyesuaikan stok sistem dalam satu alur yang cepat didemokan.
- Riwayat dan detail setiap dokumen opname menunjukkan barang yang dihitung, selisih lebih/kurang, dan nilai Rupiahnya.
- Administrator bisa melihat riwayat opname per outlet lewat dropdown.
- Item tersambung dihitung tepat satu kali.

**Non-Goals:**
- Persetujuan Administrator, status Draft, opname sebagian, atau pembekuan transaksi Kasir selama opname.
- Stok terpisah per outlet. Opname baru selalu menyesuaikan `rawStock`/`finishedStock` yang ada.
- Cetak/ekspor dokumen opname, persistensi, dan sinkronisasi ke Pusat Data Outlet.
- Validasi catatan yang sungguhan.

## Decisions

### D1: Satu submenu baru "Stok opname" di Persediaan
- **Choice**: Tombol `.nav-item.sub` dengan `data-view="inventory" data-sub="opname"`, ikon `☑`, diletakkan setelah "Mutasi stok" dan sebelum "Permintaan barang". `INV_TITLES.opname='Stok opname'`. `ROLE_ACCESS['Kepala Toko'].subs` ditambah `'opname'`, sedangkan Administrator tetap `'all'`. Kasir tidak melihatnya karena view `inventory` tidak termasuk aksesnya.
- **Rationale**: Mengikuti mekanisme submenu yang sudah ada, tanpa view baru untuk riwayat. Posisinya dekat Mutasi stok karena opname menghasilkan mutasi.
- **Alternatives considered**: Tab di dalam halaman stok (pola tab sudah dihapus oleh change split-inventory-admin-submenus), atau menu Admin (opname adalah operasi persediaan, bukan administrasi).

### D2: Model data `stockOpnames` (array objek, bukan posisional)
- **Choice**: Global baru di akhir `app.js`, setelah `rawStock`/`finishedStock` dideklarasikan:
  ```
  {id:'SO-0919-2', outlet:'Sekulan RBT 519A', date:'19 Sep 2026', time:'21.40',
   scope:'raw'|'finished', by:{name:'Rina Pratiwi', shift:'Shift 2'},
   items:[{name, unit, system, physical, cost, note}]}
  ```
  Urutan terbaru di depan (`unshift`). Tidak ada field status, karena semua dokumen Selesai. Turunan seperti jumlah item selisih, lebih/kurang, dan nilai selisih dihitung oleh helper `opnameStats(doc)` → `{count, diff, over, under, value}`, dengan `value=Σ(physical−system)×cost`.
- **Rationale**: Objek lebih aman daripada array posisional untuk record yang punya daftar item. Nilai turunan tidak disimpan, sama seperti `orderMoney(o)` di Pesanan.
- **Alternatives considered**: Menyimpan total di record (bisa tidak sinkron, dan tidak ada manfaatnya untuk demo).

### D3: Data contoh dibangun oleh helper seed
- **Choice**: `soSeed(id,outlet,date,time,scope,name,shift,diffs)` membangun `items` dari ledger saat ini: `rawStock` tanpa item `shared` untuk `'raw'`, atau seluruh `finishedStock` untuk `'finished'`. Nilainya `system=qty`, `physical=qty+delta`, dengan `diffs={'Telur':[-6,'Rusak: pecah saat bongkar'], …}`. Isi seed:

  | ID | Outlet | Tanggal | Cakupan | Petugas | Selisih | Nilai |
  |---|---|---|---|---|---|---|
  | SO-0919-2 | Sekulan RBT 519A | 19 Sep 2026 21.40 | Barang dagangan | Rina Pratiwi • Shift 2 | Paket Hemat 20K −2 "Rusak: box penyok"; Rokok Brand D −1 "Hilang" | −Rp54.600 |
  | SO-0919-1 | Sekulan RBT 519A | 19 Sep 2026 13.15 | Bahan baku | Budi Santoso • Shift 1 | Telur −6 "Rusak: pecah saat bongkar"; Bawang merah −1 "Kadaluarsa"; Gula pasir +1 "Salah input penerimaan" | −Rp34.100 |
  | SO-0912-1 | Sekulan RBT 519A | 12 Sep 2026 23.05 | Bahan baku | Taufik Hadi • Shift 3 | tidak ada | Rp0 |
  | SO-0905-1 | Sekulan RBT 519A | 5 Sep 2026 13.30 | Barang dagangan | Budi Santoso • Shift 1 | Es teh manis −4 "Tumpah saat penyajian" | −Rp7.200 |
  | SO-0918-1 | RM RBT 519B | 18 Sep 2026 13.20 | Bahan baku | Dimas Arif • Shift 1 | Ayam −2 "Kadaluarsa"; Minyak goreng −1 "Hilang" | −Rp93.500 |
  | SO-0911-1 | RM RBT 519B | 11 Sep 2026 13.10 | Barang dagangan | Dimas Arif • Shift 1 | Air mineral +6 "Salah input penerimaan" | +Rp18.000 |
  | SO-0904-1 | RM RBT 519B | 4 Sep 2026 13.25 | Bahan baku | Dimas Arif • Shift 1 | tidak ada | Rp0 |
  | SO-0917-1 | Bawen 445B | 17 Sep 2026 13.40 | Barang dagangan | Agus N. • Shift 1 | Rokok Brand A −2 "Hilang"; Nasi Box 30K −3 "Rusak" | −Rp111.200 |
  | SO-0910-1 | Bawen 445B | 10 Sep 2026 13.15 | Bahan baku | Agus N. • Shift 1 | Beras −5 "Kadaluarsa: berkutu"; Kemasan box nasi +20 "Salah input penerimaan" | −Rp48.500 |
  | SO-0903-1 | Bawen 445B | 3 Sep 2026 13.05 | Barang dagangan | Agus N. • Shift 1 | tidak ada | Rp0 |

  Seed untuk outlet lain memakai nama item dari ledger 519A. Itu bisa diterima untuk demo.
- **Rationale**: Menulis 10 dokumen × 11–17 item secara manual akan sangat panjang. Helper menjaga data tetap padat dan realistis. Setiap outlet punya ≤10 dokumen, jadi semuanya muat di halaman 1.
- **Alternatives considered**: Seed hanya berisi item yang selisih (detail jadi tidak menunjukkan "apa saja yang dihitung", padahal itu permintaan poin 3).

### D4: Outlet yang dilihat
- **Choice**: `opnameOutlet='Sekulan RBT 519A'` (dropdown Administrator) dan `const opnameViewOutlet=()=>session?.role==='Kepala Toko'?session.outlet:opnameOutlet`. Dropdown `#opnameOutletFilter` berisi `outlets.map(x=>x.name)` (tanpa "Semua outlet") dan disembunyikan untuk Kepala Toko, mengikuti pola `renderOrders`. Kartu ringkasan dan riwayat sama-sama memakai `opnameViewOutlet()`.
- **Rationale**: Permintaan pengguna adalah "filter toko berupa dropdown". Tanpa opsi "Semua outlet", riwayat selalu bermakna per toko. Nilai awal 519A karena hanya outlet itu yang bisa menerima opname baru.
- **Alternatives considered**: Opsi "Semua outlet" (tidak diminta, dan menambah kolom Outlet).

### D5: Riwayat di panel `data-subs="opname"`
- **Choice**: `<article class="panel" data-subs="opname" id="opnamePanel">` dengan panel-head "Riwayat stock opname" dan tombol `#startOpname` "+ Mulai opname" (disembunyikan untuk non-Kepala Toko). Toolbar berisi chip cakupan `#opnameScopeFilter` (Semua / Bahan baku / Barang dagangan) dan `#opnameOutletFilter`. Tabelnya `tableHtml(['NO. DOKUMEN','TANGGAL','CAKUPAN','PETUGAS','ITEM','SELISIH','NILAI SELISIH','AKSI'], …)`. SELISIH berisi misalnya "3 item (+1 / −2)" atau "-". AKSI berisi `.text-btn` "Lihat". Ada `setPager`. Keadaan kosong: "Belum ada stock opname untuk outlet ini" atau "Tidak ada stock opname sesuai filter". Fungsi `renderOpnames()` dipanggil dari `setInventorySub` bila `sub==='opname'`, sama seperti `renderMasterMenus`.

### D6: Memilih cakupan lewat modal, menghitung di form inline
- **Choice**: "+ Mulai opname" membuka `openModal` "Mulai stock opname" dengan dua `.fee-option`:
  - "Bahan baku" (n item, "Tidak termasuk item Siap jual").
  - "Barang dagangan" (n item, "Termasuk Rokok & Air mineral (Siap jual)").

  Tombol "Mulai hitung" lalu membuka `#opnameFormPanel` di dalam `#inventory` dengan class `opname-form-open` (aturan CSS sama seperti `req-form-open`). Judul topbar menjadi "Stock opname • Bahan baku" atau "Stock opname • Barang dagangan". Panel berisi info outlet, petugas, dan tanggal (read-only), tabel hitung, `#ofoSummary`, serta tombol "Batal", "Kembalikan ke stok sistem", dan "Simpan opname". `setInventorySub` menutup form ini sama seperti form permintaan.
- **Rationale**: Modal sudah cukup untuk pilihan biner. Form hitung butuh lebar penuh (pendekatan A di brainstorm). Pola `req-form-open` sudah teruji di semua lebar layar.
- **Alternatives considered**: Semua di modal (440px terlalu sempit untuk 6 kolom × 17 baris), atau view baru (merusak status aktif submenu).

### D7: Draft hitung dan snapshot
- **Choice**: `opnameDraft={scope, lines:[{ref, system, physical:String(ref.qty), note:''}]}`, dengan `ref` = objek ledger asli (tidak disalin, agar item tersambung tetap tersambung). `system` di-snapshot saat form dibuka. Kolom tabel: ITEM (plus `.line-tag` "Siap jual" untuk `ref.shared`), STOK SISTEM, STOK FISIK (`<input type="number" min="0">`), SELISIH, CATATAN. Input fisik memakai `.oninput` yang hanya memperbarui sel selisih baris itu, sel catatan, dan ringkasan, tanpa merender ulang seluruh tabel, supaya fokus input tidak hilang. Baris dengan selisih ≠ 0 mendapat class `diff-row`, selisih berwarna `.ok` (+) atau `.low` (−), dan catatan menampilkan label "Wajib diisi" serta chip alasan (Rusak, Kadaluarsa, Hilang, Salah input). Chip mengisi input catatan. Tabel tanpa paging.
- **Rationale**: Kolom fisik terisi dari sistem adalah keputusan pengguna (Q5) agar demo cepat. Merender per baris menjaga input tetap bisa diketik.

### D8: Ringkasan berjalan dan helper Rupiah bertanda
- **Choice**: `rupiahSigned=n=>n?`${n>0?'+':'−'}${rupiah(Math.abs(n))}`:rupiah(0)` dipakai di form, riwayat, detail, kartu, dan mutasi. Ringkasan form: "17 item dihitung · 2 item selisih (lebih 0 / kurang 2) · Nilai selisih −Rp34.100".
- **Rationale**: `rupiah()` memotong negatif, dan mengubahnya akan berdampak ke semua tampilan lain.

### D9: Simpan opname
- **Choice**: `#ofoSubmit` menjalankan urutan berikut:
  1. Kalau ada `physical===''`, toast "Masih ada <k> item belum dihitung" dan berhenti.
  2. Kalau ada nilai < 0, toast "Stok fisik tidak boleh minus" dan berhenti.
  3. Buka modal konfirmasi "Simpan stock opname?" berisi ringkasan dan teks "Stok sistem akan disesuaikan dengan hasil hitung fisik", dengan tombol "Batal" dan "Simpan & sesuaikan stok".

  Saat disetujui: setiap `line.ref.qty=+line.physical`, lalu `stockOpnames.unshift(doc)` dengan id `SO-0920-${++soSeq}` (`soSeq` mulai 0), `date:'20 Sep 2026'`, dan `time` = `new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})`. Berikutnya `stockMoves.unshift([id, '<Cakupan> • <m> item selisih', 'Penyesuaian stok opname <rupiahSigned>', time])`. Form ditutup, kembali ke riwayat, dan toast "<id> tersimpan, stok disesuaikan" (atau "<id> tersimpan, tidak ada selisih" bila m=0). Catatan kosong pada baris selisih tidak menolak penyimpanan.
- **Rationale**: Validasi hanya yang dibutuhkan alur (Q6) dan aturan proyek bahwa stok tidak minus. Catatan sengaja tidak divalidasi (poin 4 permintaan).

### D10: Detail di `section#opnameDetail`
- **Choice**: `<section id="opnameDetail" class="view"></section>` setelah `#closingReview`. `openOpnameDetail(id)` merender topbar (eyebrow "STOCK OPNAME", h1 id, baris "outlet • tanggal jam • cakupan", tombol "← Kembali" → `openSub('inventory','opname')`), lalu panel `.ba-summary` (Outlet, Petugas, Cakupan, Item dihitung, Selisih lebih, Selisih kurang, Nilai selisih), lalu panel "Daftar item" dengan chip `Hanya yang selisih` (aktif secara default) / `Semua item`. Tabelnya `['ITEM','SISTEM','FISIK','SELISIH','NILAI SELISIH','CATATAN']` dengan `setPager`, dan keadaan kosong "Tidak ada item selisih". View di-toggle seperti `openClosingReview`, dan submenu "Stok opname" tetap ditandai aktif.
- **Rationale**: Memakai pola BA. Filter default "selisih" membuat baris penting tampil di halaman 1 meskipun paging hanya contoh.

### D11: Kartu ringkasan dan Mutasi stok
- **Choice**: `SUB_CARDS.opname` menghitung dokumen outlet yang dilihat dengan tanggal berakhiran "Sep 2026":
  - `['☑','blue','Opname bulan ini','<n> dokumen','September 2026','']`
  - `['◷','green','Opname terakhir','<tanggal dok terbaru>' atau '-','<cakupan>' atau 'Belum ada','']`
  - `['Rp','amber','Nilai selisih bulan ini',rupiahSigned(Σ),'Lebih − kurang',Σ<0?'warn':'']`

  Dengan seed, 519A menunjukkan 4 dokumen, opname terakhir 19 Sep 2026 (Barang dagangan), dan −Rp95.900. Di `renderInventory`, ikon timeline `#tatList` menjadi `PRD`→`⚒`, `SO`→`☑`, lainnya `⇄`. "Total mutasi" ikut bertambah karena menghitung `stockMoves.length`, tanpa kartu baru.
- **Rationale**: Kartu mengikuti outlet yang dilihat agar dropdown Administrator terasa hidup.

### D12: Teks panel Hak akses
- **Choice**: Kalimat Kepala Toko di `#adminAccess` (`index.html`) ditambah "melakukan stock opname outletnya". Kalimat Administrator ditambah "dan melihat riwayat stock opname semua outlet".

### Lokasi edit di app.js (definisi terakhir)
- `INV_TITLES` dan `setInventorySub` (baris ~30–31): satu-satunya definisi. Tambah key `opname`, tutup `opname-form-open`, panggil `renderOpnames()`.
- `SUB_CARDS` (baris ~33): tambah `opname`.
- `ROLE_ACCESS` (baris ~199): tambah `'opname'` ke subs Kepala Toko.
- `renderInventory` (baris ~96, satu-satunya definisi aktif): ubah ikon timeline.
- Semua kode baru (data seed, state, render, handler `#startOpname`, `#opnameOutletFilter`, `#opnameScopeFilter`, tombol form) ditambahkan sebagai section baru di akhir `app.js`, setelah `stockMoves`, `outlets`, dan `session` dideklarasikan. Tidak ada salinan mati yang perlu dihapus.

## Risks / Trade-offs

- [Risk] Seed outlet lain memakai nama item dan qty milik 519A → Mitigation: dapat diterima untuk demo. Pemirsa tidak membandingkan stok antar outlet.
- [Risk] Qty sistem seed dibangun dari ledger saat halaman dimuat, sehingga dokumen lama tampak "sistem = stok sekarang" → Mitigation: dapat diterima. Detail dokumen tetap konsisten di dalam dirinya.
- [Risk] Kolom fisik terisi dari sistem melemahkan prinsip hitung buta → Reason for accepting: keputusan eksplisit pengguna demi kelancaran demo.
- [Risk] `oninput` per baris yang tidak merender ulang bisa membuat ringkasan tidak sinkron → Mitigation: satu fungsi `updateOpnameRow(i)` memperbarui baris dan ringkasan, dan dipanggil dari input fisik maupun dari "Kembalikan ke stok sistem" (yang merender ulang tabel).
- [Trade-off] Opname tidak memblokir penjualan Kasir selama form terbuka → Reason for accepting: di luar cakupan (Q4). Snapshot sistem tetap dipakai, dan penyesuaian menimpa qty dengan nilai fisik.
- [Risk] Tata letak tabel hitung di 390px → Mitigation: `.table-scroll` horizontal seperti form permintaan, dicek lewat screenshot 1440/1000/390.

## Migration Plan

N/A. Prototipe statis tanpa deployment. Rollback cukup dengan membuang perubahan pada `index.html`, `app.js`, dan `styles.css`.

## Open Questions

Tidak ada yang memblokir. Keputusan kecil yang diambil Claude (posisi submenu, outlet seed, filter default detail, chip cakupan, isi kartu) tercatat di brainstorm.md dan bisa dikoreksi saat review.
