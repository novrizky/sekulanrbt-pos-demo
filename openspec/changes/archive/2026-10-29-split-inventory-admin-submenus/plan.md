# Submenu Persediaan & Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memecah Persediaan dan Admin di POS outlet menjadi submenu sidebar yang selalu terbuka, dengan panel dan kartu ringkasan per submenu serta akses per peran.

**Architecture:** Section `#inventory` dan `#admin` tetap satu `section.view`; item submenu sidebar membawa `data-view` + `data-sub`, dan `openSub(view,sub)` memilih panel di dalamnya (memakai ulang `activeLedger` dan `switchAdminTab`). Panel Persediaan dipilih lewat atribut `data-subs`. Akses submenu ditentukan `ROLE_ACCESS[role].subs`.

**Tech Stack:** HTML + JS browser biasa (tanpa module) + CSS. Tes lewat harness headless Chrome (lihat CLAUDE.md "Automated checks").

**Spec:** `openspec/changes/split-inventory-admin-submenus/` — `design.md` (D1–D10), `specs/*/spec.md`, `tasks.md`.

## Global Constraints

- Hanya `index.html`, `app.js`, `styles.css` yang diubah. `outlet-data.*` tidak disentuh.
- Teks UI Bahasa Indonesia persis seperti di spec: label submenu "Stok barang dagangan", "Stok bahan baku", "Mutasi stok", "Permintaan barang", "Master menu", "Outlet", "Pengguna", "Shift", "Hak akses", "Notifikasi owner".
- Urutan sidebar: Kasir (hanya Kasir), Laporan, Persediaan (grup), Pesanan, Admin (grup). Halaman awal Kepala Toko dan Administrator tetap `reports`.
- Gaya kode: padat, template literal + `innerHTML`, handler lewat `.onclick =`; tidak ada `addEventListener`; tidak ada dependency baru.
- Sebelum mengubah perilaku di `app.js`, cari semua definisi dan penugasan handler terkait; ubah yang terakhir atau hapus salinan mati.
- Tidak ada commit kecuali user meminta. Checkpoint per task = harness PASS.
- File harness hanya di `.superpowers/sdd/split-inventory-admin-submenus/harness/` (sudah di-ignore git), tidak pernah di pohon proyek.

## Review Focus

1. **Logout lalu login peran lain** — submenu yang disembunyikan untuk Kepala Toko harus tampil kembali untuk Administrator, dan grup Admin tidak boleh kosong/terlihat tanpa isi. Tes: T1 `access admin after kepala`.
2. **Form permintaan terbuka lalu pindah submenu** — form harus tertutup dan panel submenu baru tampil normal, bukan form yang menggantung. Tes: T2 `request form closes on sub switch`.
3. **Kembali dari detail BA** — mendarat di Admin › Shift dengan "Shift" aktif, bukan tab lama "users". Tes: T3 `back to shifts`.
4. **Aksi yang mengubah data saat kartu tampil** — kartu harus ikut berubah (stok masuk, tandai BA, setujui permintaan). Tes: T4 `cards update after stock in`, `cards update after BA checked`.
5. **Elemen yang dihapus masih dirujuk kode lama** (`#lowStockCount`, `#rawItemCount`, `#baPending`, `#adminTabs`, `.stock-ledger-tabs`) — tidak boleh ada error di console. Tes: setiap task mengecek `window.__errors` kosong.

---

## Harness (dipakai semua task)

Buat sekali di awal Task 1, lalu tiap task menambah blok `if(run('Tn')){...}` di `test.js`.

- `.superpowers/sdd/split-inventory-admin-submenus/harness/run.sh`: salin dari `.superpowers/sdd/plan-stok-tersambung/harness/run.sh`, ganti nama folder di komentar. Tambahkan sisipan `<script>window.__errors=[];onerror=(m)=>{__errors.push(String(m))}</script>` sebelum `app.js` lewat `sed` yang sama.
- `test.js`: pola yang sama dengan harness stok-tersambung (`ok`, `eq`, `toast`, `fire`, `setVal`, `run`, hasil ditulis ke `<pre id="__results">`), ditambah:
  - `as(u)` → `loginAs(loginAccounts.find(a=>a.username===u))`
  - `nav(view,sub)` → `$(\`.nav-item[data-view="${view}"]${sub?\`[data-sub="${sub}"]\`:''}\`)`
  - `shown(el)` → `!!el && el.offsetParent!==null`
  - `labels()` → teks `.nav-item` dan `.nav-group` yang `shown`, berurutan
  - `cards(id)` → array `[label, nilai]` dari `#${id} article` (`small`, `strong`)
  - di akhir: `eq('no console errors', __errors.join('|'), '')`

Jalankan: `bash .superpowers/sdd/split-inventory-admin-submenus/harness/run.sh T1` → keluaran `pass=N fail=0`.

---

### Task 1: Sidebar, navigasi, dan akses per peran

**Files:**
- Modify: `index.html:20-24` (nav), `index.html:162-164` (topbar Admin, `#adminTabs`)
- Modify: `app.js:27` (handler `.nav-item`), `app.js:169-170` (`switchAdminTab`, handler `#adminTabs`), `app.js:173-177` (`ROLE_ACCESS`), `app.js:208-213` (`loginAs`)
- Test: harness `test.js` blok T1

**Interfaces:**
- Produces: `openSub(view:string, sub:string):void` — tampilkan `section#view`, tandai aktif tombol `.nav-item[data-view=view][data-sub=sub]` saja, lalu `view==='inventory'?setInventorySub(sub):switchAdminTab(sub)`. Di task ini `setInventorySub` belum ada: definisikan stub `function setInventorySub(sub){activeInvSub=sub}` + `let activeInvSub='finished'` yang diganti Task 2.
- Produces: `ROLE_ACCESS[role] = {views:string[], subs:'all'|string[], home:string}`; Kepala Toko `subs:['finished','raw','moves','requests','menus','outlets','shifts']`.
- Produces: markup `<p class="nav-group" data-group="inventory|admin">` dan `<button class="nav-item sub" data-view=".." data-sub="..">`.

- [ ] **Step 1: Buat harness (lihat bagian Harness) dan tulis tes T1**

```js
as('admin.rbt');
eq('T1 order', labels().join(','), 'Laporan,Persediaan,Stok barang dagangan,Stok bahan baku,Mutasi stok,Permintaan barang,Master menu,Pesanan,Admin,Outlet,Pengguna,Shift,Hak akses,Notifikasi owner');
eq('T1 landing', $('.nav-item.active').dataset.view+'/'+$('section.view.active').id, 'reports/reports');
nav('admin','shifts').click();
eq('T1 one active', $$('.nav-item.active').length, 1);
eq('T1 shifts active', $('.nav-item.active').dataset.sub, 'shifts');
eq('T1 admin view', $('section.view.active').id, 'admin');
eq('T1 no admin tabs', !!$('#adminTabs'), false);
$('.nav-group[data-group="inventory"]').click?.();
eq('T1 group not clickable', $('section.view.active').id, 'admin');
as('budi.leader');
eq('T1 kepala order', labels().join(','), 'Laporan,Persediaan,Stok barang dagangan,Stok bahan baku,Mutasi stok,Permintaan barang,Master menu,Pesanan,Admin,Outlet,Shift');
as('admin.rbt');
eq('T1 access admin after kepala', ['users','access','notifications'].every(s=>shown(nav('admin',s))), true);
as('ayu.kasir');
eq('T1 kasir sidebar hidden', shown($('.sidebar')), false);
```

- [ ] **Step 2: Jalankan `run.sh T1`** — Expected: FAIL pada `T1 order` (sidebar lama).
- [ ] **Step 3: Ubah `index.html` nav** sesuai tabel D2 (ikon kecil per submenu, mis. ◫ ▤ ⇄ ✎ ☷ untuk Persediaan, ⌂ ☺ ◷ ⚿ ✉ untuk Admin); hapus `#adminTabs`.
- [ ] **Step 4: Ubah `app.js`**: `ROLE_ACCESS` (hapus `admin`, tambah `subs`); `openSub` + stub; handler `app.js:27` memanggil `openSub` bila `b.dataset.sub`, selain itu perilaku lama tetapi penanda aktif hanya tombol yang diklik; `loginAs` menyembunyikan `.nav-item` dengan `!access.views.includes(view) || (sub && access.subs!=='all' && !access.subs.includes(sub))`, menyembunyikan `.nav-group` yang semua submenunya tersembunyi, menghapus baris `#adminTabs` dan `switchAdminTab('users')`; `switchAdminTab` memakai peta D5 (`shifts:'#adminShifts'` boleh menunjuk elemen yang dibuat Task 3 — sementara jaga dengan `$(map[name])?.classList.add`) dan menghapus toggle `#addUser`; hapus handler `app.js:170`.
- [ ] **Step 5: Jalankan `run.sh T1`** — Expected: `fail=0`.

### Task 2: Panel Persediaan per submenu

**Files:**
- Modify: `index.html:69-98` (`section#inventory`), `index.html:176` (pindah panel Master menu)
- Modify: `app.js:25` (hapus `renderInventory` mati), `app.js:76-85` (`renderInventory` aktif), `app.js:126` (hapus handler `.stock-ledger-tabs`), `app.js:310` (`showRequestForm`)
- Test: harness blok T2

**Interfaces:**
- Consumes: `openSub`, `activeInvSub` (Task 1).
- Produces: `setInventorySub(sub:'finished'|'raw'|'moves'|'requests'|'menus'):void` menggantikan stub; `INV_TITLES={finished:'Stok barang dagangan',raw:'Stok bahan baku',moves:'Mutasi stok',requests:'Permintaan barang',menus:'Master menu'}`; memanggil `showRequestForm(false)` bila form terbuka, lalu `renderInventory()` dan `renderSubSummary?.()` (didefinisikan Task 4).

- [ ] **Step 1: Tulis tes T2**

```js
as('admin.rbt');
nav('inventory','raw').click();
eq('T2 raw title', $('#inventory .topbar h1').textContent, 'Stok bahan baku');
eq('T2 raw panels', [shown($('#rawTable')),shown($('#productionPanel')),shown($('#tatList')),shown($('#requestPanel'))].join(), 'true,false,false,false');
eq('T2 raw button', $('#stockIn').textContent, '+ Stok masuk');
nav('inventory','finished').click();
eq('T2 finished', [$('#stockIn').textContent, shown($('#productionPanel'))].join(), '+ Hasil produksi,true');
nav('inventory','moves').click();
eq('T2 moves', [shown($('#tatList')),shown($('#transferStock')),shown($('#rawTable'))].join(), 'true,true,false');
$('#transferStock').click(); eq('T2 transfer modal', $('#modalContent h2').textContent, 'Transfer stok antar toko'); closeModal();
nav('inventory','requests').click();
$('#addRequest').click(); $('#rfCancel').click();
eq('T2 request cancel title', $('#inventory .topbar h1').textContent, 'Permintaan barang');
$('#addRequest').click(); nav('inventory','raw').click();
eq('T2 request form closes on sub switch', [shown($('#requestFormPanel')),shown($('#rawTable'))].join(), 'false,true');
nav('inventory','menus').click();
eq('T2 menus', [shown($('#masterMenuTable')),shown($('#rawTable'))].join(), 'true,false');
eq('T2 no ledger tabs', !!$('.stock-ledger-tabs'), false);
```



- [ ] **Step 2: Jalankan `run.sh T2`** — Expected: FAIL.
- [ ] **Step 3: Ubah `index.html`**: kosongkan `.summary-grid` menjadi `<div class="summary-grid" id="invSummary"></div>`; hapus `.stock-ledger-tabs` dan pembungkus `.inventory-grid`; tambah `data-subs` per D4; pindahkan `#transferStock` ke `panel-head` panel mutasi; pindahkan `<article>` Master menu ke `#inventory` dengan `data-subs="menus"` dan hapus `#adminMenus`. Pertahankan semua ID.
- [ ] **Step 4: Ubah `app.js`**: `setInventorySub` (set `activeLedger` bila raw/finished, `$$('#inventory [data-subs]').forEach(el=>el.classList.toggle('hidden',!el.dataset.subs.split(' ').includes(sub)))`, judul dari `INV_TITLES`); di `renderInventory` hapus toggle `#productionPanel` dan penulisan `#lowStockCount`/`#rawItemCount`; hapus `renderInventory` di `app.js:25` dan handler `app.js:126`; `showRequestForm(false)` mengatur judul ke `INV_TITLES[activeInvSub]`; pastikan `renderMasterMenus()` tetap dipanggil saat sub `menus` dibuka.
- [ ] **Step 5: Jalankan `run.sh T1` dan `T2`** — Expected: `fail=0`.

### Task 3: Panel Admin per submenu

**Files:**
- Modify: `index.html:162-179` (`section#admin`)
- Modify: `app.js:198` (`backToClosings`), `app.js:200` (`renderClosings`, hapus tulis `#baPending`)
- Test: harness blok T3

**Interfaces:**
- Consumes: `openSub`, `switchAdminTab` peta D5 (Task 1).
- Produces: elemen `#adminSummary`, `#adminShifts`; `#adminUsers` berisi `#userList`, `#addUser`, `#masterLoginTable`, `#addLogin`.

- [ ] **Step 1: Tulis tes T3**

```js
as('admin.rbt');
nav('admin','users').click();
eq('T3 users', [shown($('#userList')),shown($('#masterLoginTable')),shown($('#addUser')),shown($('#addLogin')),shown($('#baTable'))].join(), 'true,true,true,true,false');
nav('admin','shifts').click();
eq('T3 shifts', [shown($('#shiftCards')),shown($('#baTable')),shown($('#userList'))].join(), 'true,true,false');
nav('admin','outlets').click(); eq('T3 outlets', shown($('#outletGrid')), true);
eq('T3 access text', $('#adminAccess').textContent.includes('Admin terbatas (Outlet dan Shift)'), true);
as('budi.leader');
nav('admin','shifts').click();
$('#baTable button')?.click();
eq('T3 detail open', $('section.view.active').id, 'closingReview');
$('#backToBA').click();
eq('T3 back to shifts', [$('section.view.active').id, $('.nav-item.active').dataset.sub, shown($('#baTable'))].join(), 'admin,shifts,true');
```

- [ ] **Step 2: Jalankan `run.sh T3`** — Expected: FAIL.
- [ ] **Step 3: Ubah `index.html`**: `<div class="summary-grid" id="adminSummary"></div>` di bawah topbar Admin; hapus `#addUser` dari topbar; `#adminUsers` = panel daftar pengguna (judul "Pengguna", `#addUser` di `panel-head`) + panel Master login (dipindah dari `#adminLogins`, yang dihapus); buat `#adminShifts` berisi panel "Pengaturan 3 shift" dan panel "Berita acara tutup shift"; teks `#adminAccess` sesuai skenario "Membuka panel Hak akses" di `specs/pos-access-control/spec.md`.
- [ ] **Step 4: Ubah `app.js`**: `backToClosings` → `openSub('admin','shifts')`; hapus penulisan `#baPending` dan semua rujukan lain ke elemen yang dihapus.
- [ ] **Step 5: Jalankan `run.sh all`** — Expected: `fail=0`.

### Task 4: Kartu ringkasan per submenu

**Files:**
- Modify: `app.js` (tambah `stockInToday`, `SUB_CARDS`, `renderSubSummary` dekat `setInventorySub`; panggilan di akhir `renderInventory`, `renderMaterialRequests` `app.js:297`, `renderClosings` `app.js:200`, `renderMasterLogins` `app.js:168`, `renderOutlets` `app.js:161`; increment di `#saveStockIn` `app.js:156` dan `#rcSave` `app.js:335`)
- Modify: `styles.css` (`.summary-grid.cols-2`, `.cols-4`)
- Test: harness blok T4

**Interfaces:**
- Consumes: `activeInvSub` (Task 2), sub admin aktif — simpan `let activeAdminSub='outlets'` yang diisi `switchAdminTab`.
- Produces: `renderSubSummary():void` — isi `#invSummary` dari `SUB_CARDS[activeInvSub]()` dan `#adminSummary` dari `SUB_CARDS[activeAdminSub]()`; tiap fungsi mengembalikan array `[icon,color,label,value,trend,trendClass]`; kelas `cols-2`/`cols-4` dari panjang array.

Label dan nilai persis (D8): finished `Stok menipis`, `Jumlah item`, `Produksi hari ini`, `Item tersambung`; raw `Stok menipis`, `Jumlah item`, `Nilai persediaan` (`rupiah(Σ qty*cost)`), `Stok masuk hari ini`; moves `Transfer hari ini`, `Produksi hari ini`, `Total mutasi`; requests `Menunggu persetujuan`, `PO belum diterima`, `Selesai`; menus `Jumlah menu`, `Kategori`; outlets `Outlet terdaftar`, `Outlet aktif`; users `Jumlah akun`, `Aktif / nonaktif`, `Per peran`; shifts `Shift aktif`, `BA belum diperiksa`, `BA sudah diperiksa`. Nilai jumlah berformat `"<n> item"` untuk stok, `"<n> dokumen"` untuk BA, angka polos lainnya.

- [ ] **Step 1: Tulis tes T4**

```js
as('admin.rbt');
const lab=id=>cards(id).map(c=>c[0]).join(','), val=(id,l)=>(cards(id).find(c=>c[0]===l)||[])[1];
nav('inventory','requests').click();
eq('T4 requests', [val('invSummary','Menunggu persetujuan'),val('invSummary','PO belum diterima'),val('invSummary','Selesai')].join(), '1,2,1');
nav('inventory','menus').click();
eq('T4 menus', lab('invSummary')+'='+val('invSummary','Kategori'), 'Jumlah menu,Kategori=7');
nav('inventory','raw').click();
eq('T4 raw items', val('invSummary','Jumlah item'), '23 item');
const low=n=>n.filter(x=>x.qty<=x.min).length;
eq('T4 raw low', val('invSummary','Stok menipis'), `${low(rawStock)} item`);
nav('inventory','finished').click();
eq('T4 finished low', val('invSummary','Stok menipis'), `${low(finishedStock)} item`);
nav('inventory','raw').click();
const before=val('invSummary','Stok masuk hari ini');
$('#stockIn').click(); setVal($('#stockQty'),'5'); $('#saveStockIn').click();
eq('T4 cards update after stock in', val('invSummary','Stok masuk hari ini'), String(+before+1));
nav('admin','outlets').click();
eq('T4 outlets', [val('adminSummary','Outlet terdaftar'),val('adminSummary','Outlet aktif')].join(), '8,7');
nav('admin','shifts').click();
eq('T4 shifts', [val('adminSummary','Shift aktif'),val('adminSummary','BA belum diperiksa'),val('adminSummary','BA sudah diperiksa')].join(), '3,1 dokumen,2 dokumen');
as('budi.leader'); nav('admin','shifts').click();
const c=shiftClosings.find(x=>x.status==='Belum Diperiksa'); openClosingReview(c.id);
setVal($('#baNote'),'Sudah dicek'); $('#baConfirm').checked=true; $('#markChecked').click();
eq('T4 cards update after BA checked', val('adminSummary','BA belum diperiksa'), '0 dokumen');
```

(Jika form stok masuk membutuhkan field lain diisi agar tersimpan, isi sesuai `stockInModal`.)

- [ ] **Step 2: Jalankan `run.sh T4`** — Expected: FAIL.
- [ ] **Step 3: Implementasikan** `stockInToday`, `SUB_CARDS`, `renderSubSummary`, panggilan render dan increment di atas, serta kelas CSS kolom.
- [ ] **Step 4: Jalankan `run.sh all`** — Expected: `fail=0`.

### Task 5: Master menu hanya lihat untuk Kepala Toko

**Files:**
- Modify: `app.js:164-166` (`renderMasterMenus`), `menuForm` (`app.js:149`)
- Test: harness blok T5

**Interfaces:**
- Produces: `menuReadOnly():boolean` → `session?.role==='Kepala Toko'`.

- [ ] **Step 1: Tulis tes T5**

```js
as('budi.leader'); nav('inventory','menus').click();
eq('T5 no add button', shown($('#adminAddMenu')), false);
$('.edit-menu').click();
eq('T5 read only fields', [...$$('#modalContent input, #modalContent select')].every(x=>x.disabled), true);
eq('T5 only close', [...$$('#modalContent .modal-actions button')].map(b=>b.textContent).join(), 'Tutup');
closeModal();
as('admin.rbt'); nav('inventory','menus').click();
eq('T5 admin add button', shown($('#adminAddMenu')), true);
$('.edit-menu').click();
eq('T5 admin editable', [...$$('#modalContent input')].some(x=>!x.disabled), true); closeModal();
as('ayu.kasir'); eq('T5 kasir add menu untouched', !!$('#addMenu'), true);
```



- [ ] **Step 2: Jalankan `run.sh T5`** — Expected: FAIL.
- [ ] **Step 3: Implementasikan** `menuReadOnly`; `renderMasterMenus` menyembunyikan `#adminAddMenu`; `menuForm` dalam mode hanya lihat memberi `disabled` pada field dan mengganti tombol aksi dengan `<button class="btn ghost" data-close>Tutup</button>`.
- [ ] **Step 4: Jalankan `run.sh all`** — Expected: `fail=0`.

### Task 6: Gaya sidebar dan layar sempit

**Files:**
- Modify: `styles.css` (dekat aturan `.sidebar nav`/`.nav-item` baris 2–4 dan media query baris 8, 36)
- Test: harness blok T6 + tangkapan layar

- [ ] **Step 1: Tulis tes T6** (dijalankan dengan `--window-size=390,844`; tambahkan argumen ukuran opsional ke `run.sh`)

```js
as('admin.rbt');
const n=$('.sidebar nav');
eq('T6 nav scrolls', n.scrollWidth>n.clientWidth && getComputedStyle(n).overflowX==='auto', true);
eq('T6 groups hidden narrow', [...$$('.nav-group')].some(shown), false);
nav('inventory','moves').click(); eq('T6 click works', shown($('#tatList')), true);
```

- [ ] **Step 2: Jalankan `run.sh T6` dengan lebar 390** — Expected: FAIL.
- [ ] **Step 3: Implementasikan** `.nav-group` (huruf kecil kapital, warna `#7fa392`, padding atas, `cursor:default`) dan `.nav-item.sub` (indentasi kiri, font 13px); di `@media(max-width:1050px)` sembunyikan `.nav-group`; di `@media(max-width:760px)` `.sidebar nav{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(64px,auto);grid-template-columns:none;overflow-x:auto}` — hapus/override aturan `repeat(3,1fr)` dan `repeat(4,1fr)` di baris 8 dan 36.
- [ ] **Step 4: Jalankan `run.sh all` di 1440 dan `T6` di 390** — Expected: `fail=0`. Ambil `--screenshot` di 1440, 1000, 390 dan periksa sidebar terbaca.

### Task 7: Verifikasi akhir

- [ ] **Step 1:** `run.sh all` di 1440 → `fail=0`.
- [ ] **Step 2:** Jalankan ulang harness lama `.superpowers/sdd/plan-stok-tersambung/harness/run.sh all` untuk regresi; tes yang gagal hanya karena selektor tab LPP lama (`.stock-ledger-tabs`) dicatat, bukan diperbaiki di harness lama.
- [ ] **Step 3:** Centang `tasks.md` sesuai pekerjaan yang selesai, dan minta user satu kali klik-manual di browser (alur 9.1–9.3 di `tasks.md`) sebelum demo.

---

## Tambahan (permintaan user setelah implementasi awal)

### Task 8: Paging contoh pada tabel dan daftar

**Files:** Modify `app.js` (render `#rawTable`, `#tatList` di `renderInventory`; `renderProductionLog`; `renderSalesDetail`; `renderCancelHistory`; `renderStaffUsers`; `renderMasterMenus`; `renderMasterLogins`; `renderClosings`; render `#orderTable`; `renderMaterialRequests`). Test: harness blok T8.

**Interfaces:** Produces `PAGE_SIZE=10`, `setPager(el:Element,total:number):void` (D11).

- [ ] **Step 1: Tes T8** — Master menu: 10 `tbody tr`, pager "Halaman 1 dari 5"; klik "Berikutnya ›" → toast "Data contoh: hanya halaman 1 yang ditampilkan", tetap 20 baris; Permintaan barang "Halaman 1 dari 1" dengan "Berikutnya ›" disabled; tiap wadah D11 punya tepat satu `.table-pager` sesudahnya setelah render ulang; `#rfTable` tanpa pager; "Detail" pada baris master menu ke-10 tetap membuka menu yang benar.
- [ ] **Step 2:** `run.sh T8` → FAIL.
- [ ] **Step 3:** Implementasi D11.
- [ ] **Step 4:** `run.sh all` → `fail=0`.

### Task 9: Filter status dan jenis item di halaman stok

**Files:** Modify `index.html` (panel stok), `app.js` (`renderInventory`, `setInventorySub`). Test: harness blok T9.

**Interfaces:** Produces globals `stockStatus:'Semua'|'Aman'|'Menipis'`, `stockType:'all'|'own'|'shared'` (D12).

- [ ] **Step 1: Tes T9** — Stok bahan baku: label Jenis item "Semua,Bahan produksi,Siap jual"; Menipis → semua baris berstatus Menipis, jumlah = `rawStock` qty<=min, kartu tetap; Siap jual → 6 baris rokok/air, "Halaman 1 dari 1"; Stok barang dagangan: label "Semua,Hasil produksi,Siap jual", Hasil produksi → tanpa badge Tersambung, jumlah = `finishedStock` non-shared; Menipis+Siap jual tanpa hasil → "Tidak ada item sesuai filter" (bila kombinasi itu kosong; pilih kombinasi yang dijamin kosong dengan data); pindah halaman → chip aktif kembali "Semua".
- [ ] **Step 2:** `run.sh T9` → FAIL.
- [ ] **Step 3:** Implementasi D12.
- [ ] **Step 4:** `run.sh all` → `fail=0`.
