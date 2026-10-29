# Stock Opname Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambah submenu Persediaan › Stok opname di POS: Kepala Toko menghitung stok fisik satu cakupan, mencatat alasan selisih, dan menyesuaikan stok, lalu riwayat dan detailnya bisa dilihat Kepala Toko maupun Administrator (per outlet lewat dropdown).

**Architecture:** Semua perubahan ada di POS (`index.html`, `app.js`, `styles.css`). Riwayat adalah panel `data-subs="opname"` di `#inventory`, form hitung adalah panel inline dengan class `opname-form-open` (pola `req-form-open`), dan detail adalah `section#opnameDetail` (pola `#closingReview`). Data opname disimpan di array objek `stockOpnames`, dan nilai turunan dihitung oleh `opnameStats`.

**Tech Stack:** HTML/CSS/JS browser biasa tanpa module. Verifikasi lewat harness headless Chrome (`--dump-dom`) sesuai CLAUDE.md.

**Spec:** `openspec/changes/stock-opname/specs/stock-opname/spec.md`, `specs/sidebar-submenu-navigation/spec.md`, dan `specs/pos-access-control/spec.md`. Keputusan teknis ada di `design.md` (D1–D12).

## Global Constraints

- Semua teks UI Bahasa Indonesia, persis seperti di spec (toast, label, judul).
- Rupiah via `rupiah()`. Nilai bertanda via `rupiahSigned` baru: `+Rp18.000`, `−Rp34.100` (tanda minus U+2212), `Rp0`.
- Render dengan template literal → `innerHTML`, handler lewat `.onclick`/`.oninput`/`.onchange`, tanpa `addEventListener`. Pertahankan kepadatan kode `app.js`.
- Header tabel KAPITAL melalui `tableHtml(headers, rows)`. Tabel data memakai `setPager(el,total)` dengan `PAGE_SIZE=10`, sedangkan tabel hitung form tanpa paging.
- Jangan menyalin objek stok (`{...x}`). `opnameDraft.lines[i].ref` adalah objek asli ledger.
- Tanpa commit, branch, maupun worktree (aturan proyek). File harness hanya di `.superpowers/sdd/<plan>/harness/`, tidak di tree proyek. Jalankan `sdd-workspace` lalu snapshot `index.html`, `app.js`, `styles.css` ke `base/` sebelum Task 1.
- Tanggal demo 20 Sep 2026. Dokumen baru `SO-0920-<n>` dengan n mulai 1.

## Review Focus

1. **Mengetik di input fisik** → elemen input yang sama tetap ada (tidak dirender ulang), jadi fokus tidak hilang. Diuji di Task 2 (`focus-kept`).
2. **Qty desimal** (Bawang merah 5,5 kg) → diterima. Selisih tampil "−0,5", dan nilainya ikut dihitung. Diuji di Task 2 (`decimal-diff`).
3. **Opname kedua di hari yang sama** → nomor `SO-0920-2`, dan snapshot STOK SISTEM memakai qty hasil opname pertama. Diuji di Task 3 (`second-opname`).
4. **Catatan berisi HTML** (`<b>x</b>`) → tampil sebagai teks di detail, tidak dirender. Diuji di Task 4 (`note-escaped`).
5. **Administrator kembali dari detail** → dropdown tetap di outlet yang dipilih sebelumnya, bukan kembali ke 519A. Diuji di Task 4 (`admin-outlet-kept`).

---

### Task 0: Workspace dan harness

**Files:**
- Create: `.superpowers/sdd/<plan>/harness/kt.html`, `admin.html`, `kt.js`, `admin.js`, `run.sh` (di luar tree proyek, git-ignored)

**Interfaces:**
- Produces: helper harness `ok(name, cond, got)` yang menulis `PASS name` / `FAIL name — got` ke `<pre id="__results">`, `login(user)`, `go(sub)` (klik `.nav-item[data-sub=sub]`), `toast()` (= `$('#toast').textContent`), `rows(sel)` (= `[...document.querySelectorAll(sel+' tbody tr')]`), `setVal(el,v)` (set value + dispatch `input`), `openOpnameDetailFromRow(id)` (klik tombol "Lihat" di baris `#opnameTable` yang sel pertamanya `id`).

- [ ] **Step 1:** Jalankan `sdd-workspace`, lalu salin `index.html`, `app.js`, `styles.css` ke `base/`
- [ ] **Step 2:** Buat `kt.html` dan `admin.html` dari `index.html` dengan `sed` (path `styles.css`/`app.js` mengarah ke proyek, plus `<script src="kt.js">` / `admin.js` setelah `app.js`). `kt.js` login `budi.leader`, `admin.js` login `admin.rbt` (password `demo123`)
- [ ] **Step 3:** `run.sh` menjalankan `chrome.exe --headless=new --allow-file-access-from-files --window-size=1440,1000 --dump-dom file:///…/kt.html` (dan admin), lalu mengambil isi `#__results`
- [ ] **Step 4:** Jalankan. Expected: harness berjalan, dan test pertama (Task 1) FAIL karena submenu belum ada

### Task 1: Navigasi, data contoh, riwayat, kartu

**Files:**
- Modify: `index.html` (sidebar ~baris 25, panel setelah ~baris 83, `#adminAccess`)
- Modify: `app.js` (`INV_TITLES`/`setInventorySub` ~30–31, `SUB_CARDS` ~33, `ROLE_ACCESS` ~199, section baru di akhir file)

**Interfaces:**
- Produces:
  - `rupiahSigned(n:number):string`, `fmtQty(n:number):string` (= `(+n.toFixed(2)).toLocaleString('id-ID')`, dengan prefiks `+`/`−` hanya di sel selisih lewat `signedQty(n)`)
  - `SCOPE_LABEL={raw:'Bahan baku',finished:'Barang dagangan'}`
  - `opnameItems(scope:'raw'|'finished'):object[]` (ref ledger asli; raw = `rawStock.filter(x=>!x.shared)`)
  - `opnameStats(doc):{count,diff,over,under,value}`
  - `soSeed(id,outlet,date,time,scope,name,shift,diffs)` → doc
  - `stockOpnames:doc[]` dengan bentuk doc sesuai design D2
  - state `opnameOutlet`, `opnameScope`, `opnameDetailFilter`, `soSeq`, `opnameDraft`, serta `opnameViewOutlet():string`
  - `renderOpnames():void`

- [ ] **Step 1: Tulis test yang gagal** di `kt.js`/`admin.js`:
  ```js
  // kt.js (budi.leader)
  ok('kt-sidebar-6', [...$$('.nav-item[data-view=inventory]')].filter(x=>!x.classList.contains('role-hidden')).map(x=>x.textContent.trim().slice(2)).join('|')==='Stok barang dagangan|Stok bahan baku|Mutasi stok|Stok opname|Permintaan barang|Master menu');
  go('opname');
  ok('kt-title', $('#inventory .topbar h1').textContent==='Stok opname');
  ok('kt-rows', rows('#opnameTable').map(r=>r.cells[0].textContent).join()==='SO-0919-2,SO-0919-1,SO-0912-1,SO-0905-1');
  const r1=rows('#opnameTable')[1].cells;
  ok('kt-row-diff', r1[2].textContent==='Bahan baku'&&r1[3].textContent==='Budi Santoso • Shift 1'&&r1[4].textContent==='17'&&r1[5].textContent==='3 item (+1 / −2)'&&r1[6].textContent==='−Rp34.100');
  ok('kt-row-nodiff', rows('#opnameTable')[2].cells[5].textContent==='-'&&rows('#opnameTable')[2].cells[6].textContent==='Rp0');
  ok('kt-cards', $('#invSummary').textContent.includes('4 dokumen')&&$('#invSummary').textContent.includes('19 Sep 2026')&&$('#invSummary').textContent.includes('−Rp95.900'));
  ok('kt-no-dropdown', $('#opnameOutletFilter').classList.contains('hidden')&&!$('#startOpname').classList.contains('hidden'));
  $('#opnameScopeFilter [data-scope=finished]').click();
  ok('kt-scope-filter', rows('#opnameTable').map(r=>r.cells[0].textContent).join()==='SO-0919-2,SO-0905-1');
  // admin.js
  go('opname');
  ok('ad-default', $('#opnameOutletFilter').value==='Sekulan RBT 519A'&&rows('#opnameTable').length===4&&$('#startOpname').classList.contains('hidden'));
  const sel=$('#opnameOutletFilter');sel.value='RM RBT 519B';sel.dispatchEvent(new Event('change'));
  ok('ad-519b', rows('#opnameTable').map(r=>r.cells[0].textContent).join()==='SO-0918-1,SO-0911-1,SO-0904-1'&&$('#invSummary').textContent.includes('3 dokumen'));
  sel.value='Salatiga 456B';sel.dispatchEvent(new Event('change'));
  ok('ad-empty', $('#opnameTable').textContent.includes('Belum ada stock opname untuk outlet ini'));
  ok('ad-access-text', $('#adminAccess').textContent.includes('melakukan stock opname outletnya')&&$('#adminAccess').textContent.includes('melihat riwayat stock opname semua outlet'));
  ```
- [ ] **Step 2:** Jalankan `run.sh`. Expected: semua FAIL (`#opnameTable` belum ada)
- [ ] **Step 3: Markup `index.html`:** tasks 1.1, 1.2, 1.5 (chip memakai `data-scope="all|raw|finished"`)
- [ ] **Step 4: `app.js`:** tasks 2.1–2.3 dan 3.1–3.4. TANGGAL di riwayat ditulis `${date} • ${time}`. SELISIH ditulis `${diff} item (+${over} / −${under})` atau `-`. Seed sesuai tabel D3 dengan `diffs` persis (nama item, delta, catatan)
- [ ] **Step 5:** Jalankan `run.sh`. Expected: semua PASS di atas

### Task 2: Form hitung

**Files:**
- Modify: `index.html` (`#opnameFormPanel`, task 1.3), `app.js` (section opname), `styles.css` (task 6.1 agar panel lain tersembunyi)

**Interfaces:**
- Consumes: `opnameItems`, `SCOPE_LABEL`, `rupiahSigned`, `fmtQty`, `signedQty`
- Produces: `openOpnameStart():void` (modal cakupan), `showOpnameForm(scope):void`, `closeOpnameForm():void`, `renderOpnameForm():void`, `updateOpnameRow(i:number):void`, `opnameDraftStats():{count,diff,over,under,value,empty,negative}`. Input fisik `#ofoTable input.ofo-qty[data-i]`, input catatan `input.ofo-note[data-i]`, chip `button.ofo-chip[data-i][data-note]`, sel selisih `.ofo-diff[data-i]`

- [ ] **Step 1: Tulis test yang gagal** (`kt.js`, setelah Task 1):
  ```js
  $('#startOpname').click();
  ok('modal-scopes', $('#modalContent').textContent.includes('17 item • Tidak termasuk item Siap jual')&&$('#modalContent').textContent.includes('11 item • Termasuk Rokok & Air mineral (Siap jual)'));
  // pilih Barang dagangan → cek 11 baris + badge
  $('#modalContent [data-scope=finished]').click();$('#modalContent #ofoStart').click();
  ok('finished-11', rows('#ofoTable').length===11&&rows('#ofoTable').filter(r=>r.textContent.includes('Siap jual')).length===6);
  $('#ofoCancel').click();
  ok('cancel-back', !$('#inventory').classList.contains('opname-form-open')&&rows('#opnameTable').length===4);
  // Bahan baku
  $('#startOpname').click();$('#modalContent [data-scope=raw]').click();$('#modalContent #ofoStart').click();
  ok('raw-17', rows('#ofoTable').length===17&&!$('#ofoTable').textContent.includes('Rokok')&&$('#inventory .topbar h1').textContent==='Stock opname • Bahan baku');
  ok('raw-prefill', $('.ofo-qty[data-i="0"]').value==='128'&&$('#ofoSummary').textContent==='17 item dihitung · 0 item selisih (lebih 0 / kurang 0) · Nilai selisih Rp0');
  const q0=$('.ofo-qty[data-i="0"]');setVal(q0,'125');
  ok('beras-under', $('.ofo-diff[data-i="0"]').textContent==='−3'&&$('.ofo-diff[data-i="0"]').classList.contains('low')&&$('#ofoSummary').textContent==='17 item dihitung · 1 item selisih (lebih 0 / kurang 1) · Nilai selisih −Rp43.500');
  ok('focus-kept', $('.ofo-qty[data-i="0"]')===q0);
  const gi=opnameDraft.lines.findIndex(l=>l.ref.name==='Gula pasir');setVal($(`.ofo-qty[data-i="${gi}"]`),'24');
  ok('gula-over', $(`.ofo-diff[data-i="${gi}"]`).textContent==='+2'&&$(`.ofo-diff[data-i="${gi}"]`).classList.contains('ok'));
  const ti=opnameDraft.lines.findIndex(l=>l.ref.name==='Telur');setVal($(`.ofo-qty[data-i="${ti}"]`),'180');
  ok('note-label', $(`.ofo-qty[data-i="${ti}"]`).closest('tr').textContent.includes('Wajib diisi')&&$$(`.ofo-chip[data-i="${ti}"]`).length===4);
  $(`.ofo-chip[data-i="${ti}"][data-note="Rusak"]`).click();
  ok('chip-fills', $(`.ofo-note[data-i="${ti}"]`).value==='Rusak');
  const bi=opnameDraft.lines.findIndex(l=>l.ref.name==='Bawang merah');setVal($(`.ofo-qty[data-i="${bi}"]`),'5.5');
  ok('decimal-diff', $(`.ofo-diff[data-i="${bi}"]`).textContent==='−0,5');
  setVal($(`.ofo-qty[data-i="${bi}"]`),'6');
  ok('label-hidden-at-zero', !$(`.ofo-qty[data-i="${bi}"]`).closest('tr').textContent.includes('Wajib diisi'));
  $('#ofoReset').click();
  ok('reset', $('.ofo-qty[data-i="0"]').value==='128'&&$(`.ofo-note[data-i="${ti}"]`)?.value!=='Rusak'&&toast()==='Isian dikembalikan ke stok sistem');
  go('moves');ok('switch-closes', !$('#inventory').classList.contains('opname-form-open'));
  ```
- [ ] **Step 2:** Jalankan. Expected: FAIL (`#startOpname` belum membuka modal)
- [ ] **Step 3:** Implementasikan tasks 1.3, 4.1–4.4, dan 6.1. Input fisik `type="number" min="0" step="any"`. `updateOpnameRow(i)` hanya mengganti `innerHTML` sel selisih dan sel catatan-label/chip (input catatan tetap) serta `#ofoSummary`. `fmtQty`/`signedQty` membuat "−0,5". Input catatan `.oninput` dan chip menyimpan ke `opnameDraft.lines[i].note`
- [ ] **Step 4:** Jalankan. Expected: semua PASS

### Task 3: Validasi dan simpan opname

**Files:**
- Modify: `app.js` (handler `#ofoSubmit`, `saveOpname()`), `app.js` `renderInventory` ikon (task 2.4)

**Interfaces:**
- Consumes: `opnameDraft`, `opnameDraftStats`, `closeOpnameForm`, `renderOpnames`
- Produces: `saveOpname():void` (dipanggil dari tombol modal `#ofoConfirm`), entri `stockMoves` `[id,'<Cakupan> • <m> item selisih','Penyesuaian stok opname <rupiahSigned>',time]`

- [ ] **Step 1: Tulis test yang gagal** (`kt.js`, lanjutan):
  ```js
  go('opname');$('#startOpname').click();$('#modalContent [data-scope=raw]').click();$('#modalContent #ofoStart').click();
  const idx=n=>opnameDraft.lines.findIndex(l=>l.ref.name===n);
  setVal($(`.ofo-qty[data-i="${idx('Ayam')}"]`),'');setVal($(`.ofo-qty[data-i="${idx('Telur')}"]`),'');$('#ofoSubmit').click();
  ok('empty-blocked', toast()==='Masih ada 2 item belum dihitung'&&$('#inventory').classList.contains('opname-form-open'));
  setVal($(`.ofo-qty[data-i="${idx('Ayam')}"]`),'34');setVal($(`.ofo-qty[data-i="${idx('Telur')}"]`),'180');setVal($(`.ofo-qty[data-i="${idx('Garam')}"]`),'-1');$('#ofoSubmit').click();
  ok('negative-blocked', toast()==='Stok fisik tidak boleh minus');
  setVal($(`.ofo-qty[data-i="${idx('Garam')}"]`),'7');setVal($(`.ofo-qty[data-i="0"]`),'125');$('#ofoSubmit').click();
  ok('confirm-modal', $('#modalContent h2').textContent==='Simpan stock opname?'&&$('#modalContent').textContent.includes('Stok sistem akan disesuaikan dengan hasil hitung fisik'));
  $('#ofoConfirm').click();
  ok('saved-toast', toast()==='SO-0920-1 tersimpan, stok disesuaikan');
  ok('stock-adjusted', rawStock.find(x=>x.name==='Beras').qty===125&&rawStock.find(x=>x.name==='Telur').qty===180);
  const top=rows('#opnameTable')[0].cells;
  ok('history-top', top[0].textContent==='SO-0920-1'&&top[5].textContent==='2 item (+0 / −2)'&&top[6].textContent==='−Rp56.100');
  ok('cards-updated', $('#invSummary').textContent.includes('5 dokumen')&&$('#invSummary').textContent.includes('20 Sep 2026'));
  ok('move-entry', stockMoves[0][0]==='SO-0920-1'&&stockMoves[0][1]==='Bahan baku • 2 item selisih'&&stockMoves[0][2]==='Penyesuaian stok opname −Rp56.100');
  go('moves');ok('move-icon', $('#tatList .timeline-item .timeline-dot').textContent==='☑');
  // opname kedua: Barang dagangan, Rokok Brand D 5
  go('opname');$('#startOpname').click();$('#modalContent [data-scope=finished]').click();$('#modalContent #ofoStart').click();
  setVal($(`.ofo-qty[data-i="${idx('Rokok Brand D')}"]`),'5');$('#ofoSubmit').click();$('#ofoConfirm').click();
  ok('second-opname', toast()==='SO-0920-2 tersimpan, stok disesuaikan');
  ok('shared-once', rawStock.find(x=>x.name==='Rokok Brand D').qty===5&&finishedStock.find(x=>x.name==='Rokok Brand D').qty===5);
  // opname ketiga tanpa selisih, snapshot memakai qty baru
  $('#startOpname').click();$('#modalContent [data-scope=raw]').click();$('#modalContent #ofoStart').click();
  ok('snapshot-updated', $('.ofo-qty[data-i="0"]').value==='125');
  $('#ofoSubmit').click();$('#ofoConfirm').click();
  ok('no-diff-toast', toast()==='SO-0920-3 tersimpan, tidak ada selisih'&&rows('#opnameTable')[0].cells[5].textContent==='-');
  ```
- [ ] **Step 2:** Jalankan. Expected: FAIL mulai `empty-blocked`
- [ ] **Step 3:** Implementasikan tasks 2.4, 4.5, dan 4.6. `#ofoConfirm` adalah tombol "Simpan & sesuaikan stok" di modal. Time memakai `new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})`
- [ ] **Step 4:** Jalankan. Expected: semua PASS

### Task 4: Detail dokumen

**Files:**
- Modify: `index.html` (`section#opnameDetail`, task 1.4), `app.js`

**Interfaces:**
- Consumes: `stockOpnames`, `opnameStats`, `opnameDetailFilter`, `esc`
- Produces: `openOpnameDetail(id:string):void`, `renderOpnameDetailItems(doc):void`. Chip detail `#opnameDetailFilter [data-f=diff|all]`, tabel `#opnameDetailTable`, tombol `#backToOpname`

- [ ] **Step 1: Tulis test yang gagal** (`kt.js` dilanjutkan setelah Task 3. Dokumen seed tidak berubah, dan riwayat kini 7 baris sehingga masih di halaman 1. `admin.js` untuk Administrator):
  ```js
  openOpnameDetailFromRow('SO-0919-1'); // helper harness: klik tombol Lihat di baris berisi id
  ok('detail-head', $('#opnameDetail h1').textContent==='SO-0919-1'&&$('#opnameDetail .topbar').textContent.includes('Sekulan RBT 519A • 19 Sep 2026 13.15 • Bahan baku'));
  ok('detail-summary', ['Budi Santoso • Shift 1','17','−Rp34.100'].every(s=>$('#opnameDetail .ba-summary').textContent.includes(s)));
  ok('detail-diff-only', rows('#opnameDetailTable').map(r=>r.cells[0].textContent+'|'+r.cells[3].textContent+'|'+r.cells[4].textContent+'|'+r.cells[5].textContent).join()==='Telur|−6|−Rp12.600|Rusak: pecah saat bongkar,Bawang merah|−1|−Rp38.000|Kadaluarsa,Gula pasir|+1|+Rp16.500|Salah input penerimaan');
  $('#opnameDetailFilter [data-f=all]').click();
  ok('detail-all', rows('#opnameDetailTable').length===10&&$('#opnameDetail .table-pager').textContent.includes('Halaman 1 dari 2'));
  $('#backToOpname').click();
  ok('back', $('#inventory').classList.contains('active')&&$('.nav-item[data-sub=opname]').classList.contains('active'));
  openOpnameDetailFromRow('SO-0912-1');
  ok('detail-empty', $('#opnameDetailTable').textContent.includes('Tidak ada item selisih'));
  // note-escaped: opname Bahan baku, Garam 6 dengan catatan '<b>x</b>' (setVal pada .ofo-note), simpan → SO-0920-4, lalu openOpnameDetailFromRow('SO-0920-4')
  ok('note-escaped', $('#opnameDetailTable').textContent.includes('<b>x</b>')&&!$('#opnameDetailTable b'));
  // admin.js
  sel.value='Bawen 445B';sel.dispatchEvent(new Event('change'));openOpnameDetailFromRow('SO-0917-1');
  ok('ad-detail', ['Bawen 445B','Agus N. • Shift 1','−Rp111.200'].every(s=>$('#opnameDetail').textContent.includes(s))&&!$('#opnameDetail input,#opnameDetail textarea'));
  $('#backToOpname').click();
  ok('admin-outlet-kept', $('#opnameOutletFilter').value==='Bawen 445B'&&rows('#opnameTable')[0].cells[0].textContent==='SO-0917-1');
  ```
- [ ] **Step 2:** Jalankan. Expected: FAIL (`#opnameDetail` kosong)
- [ ] **Step 3:** Implementasikan tasks 1.4, 5.1, dan 5.2. Catatan dirender lewat `esc()`. Pengaktifan view mengikuti `openClosingReview` sambil mempertahankan `.nav-item[data-sub=opname]` aktif
- [ ] **Step 4:** Jalankan. Expected: semua PASS, dan semua test Task 1–3 tetap PASS

### Task 5: Gaya, responsif, dan verifikasi akhir

**Files:**
- Modify: `styles.css`

- [ ] **Step 1:** Implementasikan task 6.2. Selisih memakai `.ok`/`.low`, label "Wajib diisi" memakai `.line-tag.new`, chip alasan kecil bergaya `.order-chips button`, dan tabel `#ofoTable` dengan kolom CATATAN rata kiri
- [ ] **Step 2:** Ambil screenshot `--screenshot` di 1440×1000, 1000×800, dan 390×844 untuk riwayat, form hitung (Bahan baku dengan 2 baris selisih), dan detail SO-0919-1. Expected: tidak ada overflow halaman, tabel menggulir horizontal di 390px, dan ikon ☑ tampil di sidebar mode ikon (≤1050px) serta bar bawah (≤760px)
- [ ] **Step 3:** Jalankan seluruh harness (`kt.js`, `admin.js`). Expected: semua PASS
- [ ] **Step 4:** Centang tasks.md 1.x–7.1. Laporkan langkah 7.2 (click-through manual di browser sungguhan) sebagai rekomendasi ke pengguna
