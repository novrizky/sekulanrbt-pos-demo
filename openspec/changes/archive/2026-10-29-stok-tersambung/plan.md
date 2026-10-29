# Stok Tersambung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rokok Brand A–E dan Air mineral menjadi item bersama, yaitu satu objek stok yang tampil di LPP bahan baku dan LPP barang dagangan. Item ini di-restock dari sisi bahan baku, dipotong oleh penjualan, dan tidak muncul di modal produksi.

**Architecture:** Objek item bersama ditulis sekali di `sharedStock`, lalu di-spread ke akhir `rawStock` dan `finishedStock`. Karena kedua array memegang referensi yang sama, semua alur yang sudah ada (stok masuk, Permintaan barang/PO, `cutFinished`) otomatis tersambung. Kode yang berubah hanya tampilan LPP (badge dan hitungan unik) dan penyaringan opsi di modal produksi.

**Tech Stack:** JS browser biasa (`app.js`), tanpa build. Pengujian lewat harness headless Chrome di luar pohon proyek.

**Spec:** `openspec/changes/stok-tersambung/design.md` (D1–D5), `specs/shared-stock-item/spec.md`, `specs/raw-material-request/spec.md`

## Global Constraints

- Hanya `app.js` yang diubah. `index.html`, `styles.css`, dan `outlet-data.*` tidak disentuh.
- Teks UI tidak diubah, termasuk teks "bahan baku" di stok masuk dan Permintaan barang.
- Nama item bersama persis: `'Rokok Brand A'` … `'Rokok Brand E'`, `'Air mineral'` (sama dengan `menuData`).
- Nilai data: A 24/29500, B 18/25500, C 12/22500, D 6/32000, E 30/19500 (`unit:'bungkus'`, `min:10`); Air mineral `qty:48,unit:'botol',min:24,cost:3000`. Semuanya `shared:true`.
- Gaya kode: padat, template literal + `innerHTML`, handler `on*`. Jangan memformat ulang file.
- Jangan commit. Commit hanya bila user meminta. Harness tidak boleh berada di pohon proyek: pakai `.superpowers/sdd/plan-stok-tersambung/harness/` (sudah di-ignore oleh `.superpowers/sdd/.gitignore`).

## Review Focus

- Indeks opsi produksi bergeser setelah penyaringan, sehingga bahan atau hasil yang dipotong salah. Opsi `value` harus tetap indeks asli (pin: T3 "prod raw values are original indices").
- Item bersama tidak boleh sampai muncul lewat `#addProdLine` meskipun semua bahan non-bersama sudah dipakai (pin: T3 "addProdLine exhausts with toast").
- Air mineral terjual tetapi tidak terpotong karena nama berbeda dari menu (pin: T1 "air mineral sale cuts shared").
- Kartu "Stok menipis" menghitung item bersama dua kali (pin: T2 "low count unique").
- Penerimaan PO item bersama tidak terlihat di tab barang dagangan (pin: T1 "rcSave path updates shared", lewat mutasi objek dari `rawStock.find`).

---

### Task 1: Data item bersama + harness

**Files:**
- Modify: `app.js:31-39` (`rawStock`, `finishedStock`)
- Test: `.superpowers/sdd/plan-stok-tersambung/harness/run.sh`, `test.js` (buat baru; salin pola dari `.superpowers/sdd/plan-rokok-multibrand/harness/`)

**Interfaces:**
- Produces: global `sharedStock` (array objek `{name,qty,unit,min,cost,shared:true}`). Setiap objeknya identik secara referensi di `rawStock` dan `finishedStock`.

- [ ] **Step 1: Buat harness.** Salin `run.sh` dari harness rokok-multibrand ke `.superpowers/sdd/plan-stok-tersambung/harness/run.sh` apa adanya. `ROOT` dihitung dari `../../../..`, dan kedalamannya sama. Buat `test.js` dengan helper yang sama (`ok`, `eq`, `toast`, `fire`, `setVal`, `SCOPE`/`run`), login `admin.rbt`/`demo123`, lalu tulis hasilnya ke `<pre id="__results">`.

- [ ] **Step 2: Tulis tes T1 yang gagal**

```js
const sh=n=>rawStock.find(x=>x.name===n), fs=n=>finishedStock.find(x=>x.name===n);
eq('T1 shared count',sharedStock.length,6);
['Rokok Brand A','Rokok Brand B','Rokok Brand C','Rokok Brand D','Rokok Brand E','Air mineral'].forEach(n=>eq(`T1 same object ${n}`,sh(n)===fs(n)&&!!sh(n),true));
eq('T1 rawStock length',rawStock.length,23);
eq('T1 finishedStock length',finishedStock.length,11);
eq('T1 rokok A values',JSON.stringify([sh('Rokok Brand A').qty,sh('Rokok Brand A').cost,sh('Rokok Brand A').unit]),'[24,29500,"bungkus"]');
eq('T1 air mineral values',JSON.stringify([sh('Air mineral').qty,sh('Air mineral').min,sh('Air mineral').cost,sh('Air mineral').unit]),'[48,24,3000,"botol"]');
eq('T1 rawStock starts with Beras',rawStock[0].name,'Beras');
// air mineral sale cuts shared
cutFinished([{name:'Air mineral',qty:3}]);eq('T1 air mineral sale cuts shared',sh('Air mineral').qty,45);
// rcSave path updates shared (same mutation #rcSave does)
const s=rawStock.find(y=>y.name==='Air mineral');s.qty+=48;s.cost=3100;eq('T1 rcSave path updates shared',[fs('Air mineral').qty,fs('Air mineral').cost].join('|'),'93|3100');
```

- [ ] **Step 3: Jalankan dan pastikan gagal.** Run: `bash .superpowers/sdd/plan-stok-tersambung/harness/run.sh T1`. Expected: `FAIL`, karena `sharedStock` belum ada (halaman error atau `FAIL no results`).

- [ ] **Step 4: Implementasi (design D1).** Tambahkan `const sharedStock=[...]` tepat sebelum `const rawStock` dengan enam objek sesuai Global Constraints. Akhiri `rawStock` dengan `...sharedStock`. Hapus baris rokok (baris 38) dari `finishedStock`, lalu akhiri `finishedStock` dengan `...sharedStock`.

- [ ] **Step 5: Jalankan dan pastikan lulus.** Run: `bash .superpowers/sdd/plan-stok-tersambung/harness/run.sh T1`. Expected: semua `PASS`, `fail=0`.

- [ ] **Step 6: Regresi rokok.** Run: `bash .superpowers/sdd/plan-rokok-multibrand/harness/run.sh all`. Expected: `fail=0`, karena alur fee dan jual rokok tidak berubah. Kalau tes lama gagal hanya karena mengandalkan urutan atau panjang `finishedStock`, laporkan sebagai temuan dan jangan ubah perilaku.

### Task 2: Tampilan LPP (badge + hitungan unik)

**Files:**
- Modify: `app.js:71` dan `app.js:75` (`renderInventory` **terakhir**. Salinan mati di `app.js:25` tidak diubah)

**Interfaces:**
- Consumes: `x.shared` dari Task 1.

- [ ] **Step 1: Tulis tes T2 yang gagal**

```js
$('.nav-item[data-view="inventory"]').click();
$('[data-stock="raw"]').click();
eq('T2 raw badges',$('#rawTable').querySelectorAll('.line-tag').length,6);
eq('T2 raw item count',$('#rawItemCount').textContent,'23 item');
const uniq=[...new Set([...rawStock,...finishedStock])].filter(x=>x.qty<=x.min).length;
eq('T2 low count unique',$('#lowStockCount').textContent,`${uniq} item`);
ok('T2 low count not doubled',uniq<[...rawStock,...finishedStock].filter(x=>x.qty<=x.min).length,'Rokok Brand D harus terhitung sekali');
$('[data-stock="finished"]').click();
eq('T2 finished badges',$('#rawTable').querySelectorAll('.line-tag').length,6);
ok('T2 badge text',$('#rawTable').textContent.includes('Rokok Brand ATersambung'),'badge Tersambung tidak menempel di nama');
ok('T2 no badge on Paket',![...$('#rawTable').querySelectorAll('tr')].find(r=>r.textContent.startsWith('Paket Favorit 25K'))?.querySelector('.line-tag'),'Paket Favorit tidak boleh ber-badge');
```

- [ ] **Step 2: Jalankan dan pastikan gagal.** Run: `bash .../run.sh T2`. Expected: `FAIL T2 raw badges` (0 vs 6) dan `FAIL T2 low count unique`.

- [ ] **Step 3: Implementasi (D2, D3).** Di `app.js:71`, kolom nama menjadi `x.shared?`${x.name}<em class="line-tag">Tersambung</em>`:x.name`. Di `app.js:75`, `#lowStockCount` dihitung dari `[...new Set([...rawStock,...finishedStock])]`.

- [ ] **Step 4: Jalankan dan pastikan lulus.** Run: `bash .../run.sh T1` lalu `T2`. Expected: `fail=0` untuk keduanya.

### Task 3: Item bersama disembunyikan dari modal produksi

**Files:**
- Modify: `app.js:108` (`#finishedItem`), `app.js:110` (opsi `.prod-raw` di `draw`), `app.js:113` (`#addProdLine`). `productionModal` hanya didefinisikan sekali.

**Interfaces:**
- Consumes: `x.shared` dari Task 1.

- [ ] **Step 1: Tulis tes T3 yang gagal**

```js
const SH=['Rokok Brand A','Rokok Brand B','Rokok Brand C','Rokok Brand D','Rokok Brand E','Air mineral'];
$('[data-stock="finished"]').click();$('#stockIn').click();
const opt=sel=>[...$$(sel+' option')];
ok('T3 no shared in hasil',!opt('#finishedItem').some(o=>SH.includes(o.textContent)),'item bersama muncul di Hasil');
ok('T3 no shared in bahan',!opt('.prod-raw').some(o=>SH.includes(o.textContent)),'item bersama muncul di bahan');
ok('T3 prod raw values are original indices',opt('.prod-raw').every(o=>rawStock[+o.value].name===o.textContent),'value opsi bukan indeks asli');
ok('T3 hasil values are original indices',opt('#finishedItem').every(o=>finishedStock[+o.value].name===o.textContent),'value hasil bukan indeks asli');
for(let k=0;k<30;k++)$('#addProdLine').click();
eq('T3 addProdLine exhausts with toast',toast(),'Semua bahan baku sudah dipilih');
eq('T3 lines = non-shared raw',$$('.prod-raw').length,rawStock.filter(x=>!x.shared).length);
closeModal();
// produksi tetap jalan
$('#stockIn').click();const beras=rawStock[0].qty,ab=SH.map(n=>rawStock.find(x=>x.name===n).qty).join();
setVal($('#finishedItem'),'0','change');setVal($('#finishedQty'),'40');$('#confirmProduction').click();
eq('T3 beras cut',rawStock[0].qty,beras-8);eq('T3 shared untouched',SH.map(n=>rawStock.find(x=>x.name===n).qty).join(),ab);
```

- [ ] **Step 2: Jalankan dan pastikan gagal.** Run: `bash .../run.sh T3`. Expected: `FAIL T3 no shared in hasil` dan `FAIL T3 no shared in bahan`.

- [ ] **Step 3: Implementasi (D4).** Pada `#finishedItem` dan opsi `.prod-raw`, kembalikan `''` untuk `x.shared`, dengan `value` tetap indeks dari `map((x,i)=>…)`. Ubah `#addProdLine` menjadi `rawStock.findIndex((r,k)=>!r.shared&&!lines.some(l=>l.i===k))`.

- [ ] **Step 4: Jalankan dan pastikan lulus.** Run: `bash .../run.sh all`. Expected: `fail=0` untuk T1–T3. Lalu jalankan regresi rokok-multibrand (`all`), expected `fail=0`.

### Task 4: Verifikasi manual di browser

- [ ] **Step 1:** Jalankan tasks.md 4.1–4.6 di `index.html` pada browser nyata (alur stok masuk Rokok Brand D, PO Air mineral end-to-end, penjualan Kasir + fee rokok). Laporkan hasilnya per langkah dan tandai checkbox di `tasks.md`. Kalau ada langkah yang hanya terverifikasi lewat harness, catat di checkbox tersebut, seperti di change rokok-multibrand.
