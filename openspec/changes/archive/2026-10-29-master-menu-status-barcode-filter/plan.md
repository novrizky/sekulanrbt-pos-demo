# Master Menu: Status, Barcode, Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Master menu POS mendapat kode tetap, barcode, status aktif/nonaktif yang bisa diubah dari popup Detail (Kepala Toko hanya status), filter Kategori/Status, dan pencarian kode/nama/barcode. Menu nonaktif hilang dari Kasir, form order, dan pemilih fee rokok.

**Architecture:** Item `menuData` diperpanjang menjadi `[nama, harga, desk, label, kode, barcode, aktif]` (indeks 4–6 diisi oleh loop init). Satu helper `menuActive` menyaring tiga titik penjualan. `menuForm({cat,i})` menulis ulang item yang ada alih-alih `push`. `renderMasterMenus` menyaring berdasarkan tiga state global.

**Tech Stack:** JS browser biasa (`app.js`), `index.html`, `styles.css`; tanpa build. Pengujian lewat harness headless Chrome di luar pohon proyek.

**Spec:** `openspec/changes/master-menu-status-barcode-filter/design.md` (D1–D7), `specs/master-menu-management/spec.md`, `specs/pos-access-control/spec.md`, `specs/rokok-multibrand/spec.md`

## Global Constraints

- Hanya aplikasi POS: `app.js`, `index.html`, `styles.css` (bila perlu). `outlet-data.*` tidak disentuh.
- Indeks baru: `x[4]` kode string (`'MNU-PA01'`), `x[5]` barcode string (`''` bila kosong), `x[6]` boolean aktif. Indeks 0–3 tidak berubah artinya.
- Data awal nonaktif persis: `'Seafood 100K'`, `'Jeruk hangat'`. Rokok tetap aktif semua.
- Teks UI persis: "Kode barcode", "Menu aktif", "Simpan item", "Simpan status", "Cari kode, nama, atau barcode...", "Tidak ada menu sesuai filter", label filter "Kategori" / "Status", chip "Semua"/"Aktif"/"Nonaktif", kartu "Jumlah menu"/"Nonaktif"/"Kategori".
- Toast persis: "`<nama>` tersimpan di master menu", "`<nama>` diperbarui", "`<nama>` dinonaktifkan", "`<nama>` diaktifkan", "Nama menu wajib diisi".
- Gaya kode: padat, template literal + `innerHTML`, handler `on*`. Jangan memformat ulang file. Setiap fungsi target hanya punya satu definisi (sudah dicek), jadi ubah di tempat.
- Jangan commit. Commit hanya bila user meminta. Harness di `.superpowers/sdd/plan-master-menu/harness/` (di-ignore oleh `.superpowers/sdd/.gitignore`).

## Review Focus

- Tombol Detail setelah filter membuka item yang salah karena memakai indeks baris tabel, bukan indeks asli di kategori (pin: T3 "detail after filter opens right item").
- Memindah kategori meninggalkan duplikat atau menghilangkan item (pin: T3 "move category").
- Kepala Toko masih bisa mengubah harga lewat input yang lupa di-disable (pin: T3 "KT price input disabled").
- Pencarian Kasir (`renderMenu(filter)`) masih menemukan menu nonaktif karena filter aktif dipasang setelah return/di cabang lain (pin: T2 "kasir search hides inactive").
- Chip kategori kehilangan state `active` atau handler setelah re-render (pin: T4 "chip active after rerender").

---

### Task 1: Data menu + harness

**Files:**
- Modify: `app.js:2-15` (setelah deklarasi `menuData`)
- Test: `.superpowers/sdd/plan-master-menu/harness/run.sh`, `test.js` (buat baru)

**Interfaces:**
- Produces: `const MENU_BARCODES` (objek nama → barcode string); `menuActive(x) -> boolean` (`x[6]!==false`); `canToggleMenu() -> boolean` (subs `ROLE_ACCESS[session?.role]` adalah `'all'` atau memuat `'menus'`; letakkan setelah `ROLE_ACCESS` dideklarasikan, sekitar `app.js:193`); `nextMenuCode(cat) -> string` (`MNU-`+2 huruf kapital kategori+(jumlah item kategori+1) 2 digit).

- [ ] **Step 1: Buat harness.** Salin `.superpowers/sdd/plan-stok-tersambung/harness/run.sh` ke `.superpowers/sdd/plan-master-menu/harness/run.sh` dan ganti nama folder di komentar. Buat `test.js` dengan helper yang sama (`ok`, `eq`, `toast`, `fire`, `setVal`, `SCOPE`/`run`), login `admin.rbt`/`demo123`, lalu tulis hasilnya ke `<pre id="__results">`. Tambahkan helper `const item=n=>Object.values(menuData).flat().find(x=>x[0]===n);` dan `const asRole=u=>{session=loginAccounts.find(a=>a.username===u)};`.

- [ ] **Step 2: Tulis tes T1 yang gagal**

```js
eq('T1 code PA01',item('Paket Hemat 20K')[4],'MNU-PA01');
eq('T1 code RO05',item('Rokok Brand E')[4],'MNU-RO05');
eq('T1 inactive seed',Object.values(menuData).flat().filter(x=>!menuActive(x)).map(x=>x[0]).join('|'),'Seafood 100K|Jeruk hangat');
eq('T1 barcode empty',item('Paket Hemat 20K')[5],'');
eq('T1 barcode rokok A set',item('Rokok Brand A')[5].length>0,true);
eq('T1 all 7 cols',Object.values(menuData).flat().every(x=>x.length===7),true);
asRole('budi.leader');eq('T1 KT can toggle',canToggleMenu(),true);asRole('ayu.kasir');eq('T1 kasir cannot toggle',canToggleMenu(),false);asRole('admin.rbt');eq('T1 admin can toggle',canToggleMenu(),true);
eq('T1 next code',nextMenuCode('Paket'),'MNU-PA07');
```

- [ ] **Step 3: Jalankan dan pastikan gagal.** Run: `bash .superpowers/sdd/plan-master-menu/harness/run.sh T1`. Expected: `FAIL` (helper belum ada, atau `FAIL no results`).

- [ ] **Step 4: Implementasi.** Tambah `MENU_BARCODES` (barcode 13 digit realistis untuk Rokok Brand A–E, Air mineral, Keripik singkong, Kacang) dan satu baris loop `Object.entries(menuData).forEach(([cat,items])=>items.forEach((x,i)=>{x[4]=…;x[5]=MENU_BARCODES[x[0]]||'';x[6]=!['Seafood 100K','Jeruk hangat'].includes(x[0])}))` tepat setelah `menuData`. Tambah `menuActive`, `nextMenuCode`, `canToggleMenu`.

- [ ] **Step 5: Jalankan T1.** Expected: semua `PASS`, `fail=0`.

### Task 2: Sembunyikan menu nonaktif dari penjualan

**Files:**
- Modify: `app.js:18` (`renderMenu`), `app.js:261` (`rokokPickerHtml`), `app.js:275` (`renderOrderForm`)
- Test: `test.js` blok T2

**Interfaces:**
- Consumes: `menuActive(x)` dari Task 1.

- [ ] **Step 1: Tulis tes T2 yang gagal**

```js
category='Premium';renderMenu();
eq('T2 kasir premium count',$('#itemCount').textContent,'3 pilihan tersedia');
eq('T2 kasir hides seafood',$('#menuGrid').textContent.includes('Seafood 100K'),false);
category='Minuman';renderMenu('jeruk');
eq('T2 kasir search hides inactive',[...$$('#menuGrid .menu-info strong')].map(x=>x.textContent).join('|'),'Es jeruk');
orderDraft.category='Premium';renderOrderForm();
eq('T2 order form hides seafood',$('#ofGrid').textContent.includes('Seafood 100K'),false);
item('Rokok Brand E')[6]=false;
eq('T2 rokok picker hides E',(rokokPickerHtml([]).match(/rokok-row/g)||[]).length,4);
item('Rokok Brand E')[6]=true;
```

- [ ] **Step 2: Jalankan dan pastikan gagal.** Run: `bash …/run.sh T2`. Expected: `FAIL T2 kasir premium count :: got "4 pilihan tersedia"`.

- [ ] **Step 3: Implementasi.** Di ketiga fungsi, tambahkan `.filter(menuActive)` sebelum filter teks / `.map` (`menuData[category].filter(menuActive).filter(...)`, `menuData.Rokok.filter(menuActive).map(...)`, `menuData[orderDraft.category].filter(menuActive).filter(...)`).

- [ ] **Step 4: Jalankan T1+T2** (`run.sh all`). Expected: semua `PASS`.

### Task 3: Popup Tambah/Detail menu

**Files:**
- Modify: `app.js:164-169` (`menuReadOnly`, `menuForm`, `#saveMenu`)
- Test: `test.js` blok T3

**Interfaces:**
- Consumes: `canToggleMenu()`, `nextMenuCode(cat)` dari Task 1.
- Produces: `menuForm(ref=null)` dengan `ref = {cat: string, i: number}` (null = mode Tambah). Elemen baru: `#menuBarcode` (input), `#menuActive` (checkbox di `label.check-row`). Tombol simpan tetap `#saveMenu`; teksnya "Simpan item", atau "Simpan status" untuk Kepala Toko di mode Detail.

- [ ] **Step 1: Tulis tes T3 yang gagal**

```js
const cnt=()=>Object.values(menuData).flat().length, n0=cnt();
menuForm({cat:'Paket',i:0});setVal($('#menuPrice'),'21000');$('#saveMenu').click();
eq('T3 edit toast',toast(),'Paket Hemat 20K diperbarui');eq('T3 edit no dup',cnt(),n0);eq('T3 edit price',item('Paket Hemat 20K')[1],21000);
const gi=menuData.Jajanan.findIndex(x=>x[0]==='Gorengan');menuForm({cat:'Jajanan',i:gi});setVal($('#menuCategory'),'Ala carte','change');$('#saveMenu').click();
eq('T3 move category',[menuData.Jajanan.some(x=>x[0]==='Gorengan'),menuData['Ala carte'].some(x=>x[0]==='Gorengan'),cnt()].join('|'),`false|true|${n0}`);
menuForm();setVal($('#menuName'),'Kopi susu');setVal($('#menuCategory'),'Minuman','change');setVal($('#menuBarcode'),'8990001112223');$('#saveMenu').click();
eq('T3 add toast',toast(),'Kopi susu tersimpan di master menu');eq('T3 add barcode',item('Kopi susu')[5],'8990001112223');eq('T3 add active',item('Kopi susu')[6],true);eq('T3 add code',item('Kopi susu')[4],'MNU-MI06');
menuForm();$('#saveMenu').click();eq('T3 name required',toast(),'Nama menu wajib diisi');eq('T3 modal stays open',$('#modalBackdrop').classList.contains('open'),true);closeModal();
const bi=menuData['Ala carte'].findIndex(x=>x[0]==='Bakso');menuForm({cat:'Ala carte',i:bi});$('#menuActive').checked=false;$('#saveMenu').click();
eq('T3 admin deactivate',[toast(),item('Bakso')[6]].join('|'),'Bakso diperbarui|false');
asRole('budi.leader');const ji=menuData.Minuman.findIndex(x=>x[0]==='Jeruk hangat');menuForm({cat:'Minuman',i:ji});
eq('T3 KT price input disabled',$('#menuPrice').disabled,true);eq('T3 KT toggle enabled',$('#menuActive').disabled,false);eq('T3 KT button',$('#saveMenu').textContent,'Simpan status');
$('#menuActive').checked=true;$('#saveMenu').click();eq('T3 KT activate',[toast(),item('Jeruk hangat')[6]].join('|'),'Jeruk hangat diaktifkan|true');
menuForm({cat:'Ala carte',i:bi});$('#menuActive').checked=true;$('#saveMenu').click();menuForm({cat:'Ala carte',i:bi});$('#menuActive').checked=false;$('#saveMenu').click();
eq('T3 KT deactivate',toast(),'Bakso dinonaktifkan');asRole('admin.rbt');
```

- [ ] **Step 2: Jalankan dan pastikan gagal.** Run: `bash …/run.sh T3`. Expected: `FAIL T3 edit toast` (masih toast "… tersimpan di master menu") dan `FAIL T3 edit no dup`.

- [ ] **Step 3: Implementasi `menuForm(ref)`.** `const x=ref?menuData[ref.cat][ref.i]:null`. Field diisi dari `x` (kode `x[4]`, barcode `x[5]`, nama, kategori `ref.cat`, harga, desk); "Kode barcode" (`#menuBarcode`, placeholder "Contoh: 8991234567890") ditaruh tepat setelah "Kode menu" di `form-grid`; `label.check-row` dengan `<input type="checkbox" id="menuActive">` dan teks "Menu aktif — tampil di Kasir dan form order" sebelum `.modal-actions`, `checked` bila `!x||x[6]`. Mode Detail + `menuReadOnly()`: disable semua input/select di `#modalContent` kecuali `#menuActive` (yang disabled bila `!canToggleMenu()`; bila disabled, kembalikan perilaku lama: hanya tombol "Tutup"), dan teks `#saveMenu` = "Simpan status".

- [ ] **Step 4: Implementasi `#saveMenu`.** Cabang Kepala Toko: `x[6]=$('#menuActive').checked`, toast "`${x[0]} dinonaktifkan`"/"`diaktifkan`". Cabang Tambah: validasi nama, kode = input bila bukan `''`/`'MNU-'` selain itu `nextMenuCode(cat)`, label lama (`kode.replace('MNU-','')||'NEW'`), `push` 7 kolom, toast lama. Cabang Detail Administrator: tulis ulang `x[0],x[1],x[2],x[4],x[5],x[6]`; bila `cat!==ref.cat`, `menuData[ref.cat].splice(ref.i,1)` lalu `menuData[cat].push(x)`; toast "`${nama} diperbarui`". Akhiri semua cabang dengan `renderCategories();renderMenu();renderMasterMenus();closeModal()`.

- [ ] **Step 5: Jalankan T1–T3** (`run.sh all`). Expected: semua `PASS`.

### Task 4: Tabel, filter, pencarian, ringkasan

**Files:**
- Modify: `index.html:92` (panel `data-subs="menus"`), `app.js:34` (`SUB_CARDS.menus`), `app.js:181-183` (`renderMasterMenus`), blok handler global `app.js:187` (tambahkan handler setelah `$('#adminAddMenu').onclick`), `styles.css` hanya bila toolbar perlu penyesuaian
- Test: `test.js` blok T4

**Interfaces:**
- Consumes: `menuActive`, `menuForm({cat,i})`.
- Produces: globals `menuCatFilter='Semua'`, `menuStatusFilter='Semua'`, `menuQuery=''`; elemen `#menuCatFilter` (chip `button[data-cat]`), `#menuStatusFilter` (chip `button[data-status]`: Semua/Aktif/Nonaktif), `#masterMenuSearch`.

- [ ] **Step 1: Tulis tes T4 yang gagal**

```js
openSub('inventory','menus');
const names=()=>[...$$('#masterMenuTable tbody tr td:nth-child(2)')].map(x=>x.textContent);
eq('T4 headers',[...$$('#masterMenuTable th')].map(x=>x.textContent).join('|'),'KODE|NAMA MENU|KATEGORI|BARCODE|HARGA|STATUS|AKSI');
eq('T4 barcode dash',$('#masterMenuTable tbody tr td:nth-child(4)').textContent,'-');
eq('T4 nonaktif card',$('#invSummary').textContent.includes('Nonaktif'),true);
$('#menuCatFilter [data-cat="Premium"]').click();$('#menuStatusFilter [data-status="Nonaktif"]').click();
eq('T4 premium nonaktif',names().join('|'),'Seafood 100K');
eq('T4 chip active after rerender',$('#menuCatFilter [data-cat="Premium"]').classList.contains('active'),true);
$$('#masterMenuTable .edit-menu')[0].click();eq('T4 detail after filter opens right item',$('#menuName').value,'Seafood 100K');closeModal();
$('#menuCatFilter [data-cat="Semua"]').click();$('#menuStatusFilter [data-status="Semua"]').click();
setVal($('#masterMenuSearch'),'mnu-pa01');eq('T4 search code',names().join('|'),'Paket Hemat 20K');
setVal($('#masterMenuSearch'),'nasi box');eq('T4 search name',names().length>0&&names().every(n=>n.startsWith('Nasi Box')),true);
setVal($('#masterMenuSearch'),'zzz');eq('T4 empty',$('#masterMenuTable').textContent,'Tidak ada menu sesuai filter');
setVal($('#masterMenuSearch'),'');
```

Catatan: T4 dijalankan sendiri (`run.sh T4`) pada data awal, jadi kartu Nonaktif = 2. Tambahkan `eq('T4 nonaktif count',…,'2')` dengan membaca nilai kartu "Nonaktif" dari `#invSummary` sesuai markup `renderSubSummary`.

- [ ] **Step 2: Jalankan dan pastikan gagal.** Run: `bash …/run.sh T4`. Expected: `FAIL T4 headers` (masih tanpa BARCODE).

- [ ] **Step 3: Implementasi HTML.** Di `index.html:92`, antara `.panel-head` dan `#masterMenuTable`, sisipkan `<div class="order-toolbar stock-filter"><span class="filter-label">Kategori</span><div class="order-chips" id="menuCatFilter"></div><span class="filter-label">Status</span><div class="order-chips" id="menuStatusFilter"><button class="active" data-status="Semua">Semua</button><button data-status="Aktif">Aktif</button><button data-status="Nonaktif">Nonaktif</button></div><label class="search"><span>⌕</span><input id="masterMenuSearch" placeholder="Cari kode, nama, atau barcode..." /></label></div>`.

- [ ] **Step 4: Implementasi `renderMasterMenus`.** Render chip `#menuCatFilter` dari `['Semua',...Object.keys(menuData)]` dengan `active` sesuai `menuCatFilter` dan `.onclick` yang men-set state lalu re-render. Toggle `active` chip status serta pasang `.onclick`-nya. Baris dibangun dari `Object.entries(menuData)` dengan `data-cat`/`data-i` = indeks asli, disaring kategori/status/query (`[x[4],x[0],x[5]].join(' ').toLowerCase().includes(q)`). Kolom: `x[4], x[0], cat, x[5]||'-', rupiah(x[1]), <span class="ok">Aktif</span>|<span class="low">Nonaktif</span>, tombol Detail`. Hasil kosong → `<div class="empty-cart">Tidak ada menu sesuai filter</div>`. `setPager` dengan jumlah hasil; Detail → `menuForm({cat:b.dataset.cat,i:+b.dataset.i})`. Pertahankan `#adminAddMenu` hidden untuk `menuReadOnly()` dan `renderSubSummary('inv')`.

- [ ] **Step 5: Handler & ringkasan.** `$('#masterMenuSearch').oninput=e=>{menuQuery=e.target.value;renderMasterMenus()}` di blok handler global. `SUB_CARDS.menus` → tiga kartu: `['☷','green','Jumlah menu',<jumlah aktif>,'Aktif','']`, `['⊘','orange','Nonaktif',<jumlah nonaktif>,'Tidak tampil di Kasir','']` (pakai warna kartu yang sudah ada di `SUB_CARDS`; periksa nilai warna lain sebelum memilih), `['▦','blue','Kategori',…]`. Cek tampilan 3 kartu di `renderSubSummary` (kelas `cols-…`); tambah CSS hanya bila 3 kartu tampil rusak.

- [ ] **Step 6: Jalankan `run.sh T4`, lalu `run.sh all`.** Expected: semua `PASS`. (T4 di `all` berjalan setelah T3 mengubah data. Bila ada asersi T4 yang bergantung pada data awal, jalankan blok T4 sebelum T3 di `test.js`.)

### Task 5: Teks Hak akses + verifikasi manual

**Files:**
- Modify: `index.html:178` (`#adminAccess`)
- Test: `test.js` blok T5

- [ ] **Step 1: Tulis tes T5 yang gagal**

```js
eq('T5 access text',$('#adminAccess').textContent.includes('Persediaan (Master menu hanya dapat dilihat, kecuali mengubah status aktif menu)'),true);
```

- [ ] **Step 2: Jalankan dan pastikan gagal** (`run.sh T5`).
- [ ] **Step 3: Ganti teks** "Persediaan (Master menu hanya dapat dilihat)" → "Persediaan (Master menu hanya dapat dilihat, kecuali mengubah status aktif menu)".
- [ ] **Step 4: Jalankan `run.sh all`.** Expected: `fail=0`.
- [ ] **Step 5: Klik manual di browser** (`index.html`): login `admin.rbt` → Persediaan › Master menu (filter, cari, Detail edit, nonaktifkan); login `budi.leader` → Detail hanya toggle + "Simpan status"; login `ayu.kasir` → Mulai shift, cek Premium tanpa Seafood 100K dan fee rokok. Laporkan hasilnya ke user. Jangan commit.
