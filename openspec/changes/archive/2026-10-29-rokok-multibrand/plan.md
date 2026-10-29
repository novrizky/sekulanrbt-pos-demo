# Rokok Multi-merek Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rokok Brand A–E bisa dijual sebagai barang dagangan di Kasir dan Pesanan, dan fee driver rokok bisa memilih beberapa merek dengan pemotongan stok yang benar.

**Architecture:** Rokok menjadi kategori `menuData` biasa dan baris `finishedStock` bernama sama, sehingga jalur jual dan potong stok yang sudah ada langsung bekerja. Fee rokok disimpan sebagai `items:[{name,qty}]`, dipilih lewat satu helper picker bersama, dan dipotong lewat satu helper `cutFinished`.

**Tech Stack:** JS browser biasa (`app.js`, global, `innerHTML` + `.on*`), `index.html`, `styles.css`. Pemeriksaan otomatis memakai harness headless Chrome di folder scratch.

**Spec:** `openspec/changes/rokok-multibrand/specs/rokok-multibrand/spec.md`, `openspec/changes/rokok-multibrand/specs/scheduled-orders/spec.md`, `openspec/changes/rokok-multibrand/design.md` (D1–D10), `openspec/changes/rokok-multibrand/tasks.md`

## Global Constraints

- Hanya POS (`index.html`, `app.js`, `styles.css`). Jangan sentuh `outlet-data.*`.
- Teks UI Bahasa Indonesia, persis: "Pilih minimal satu merek rokok", "Fee rokok dicatat: <feeText>. Stok dipotong saat pembayaran.", "Fee driver tersimpan ke order", "Pembayaran berhasil. LPP barang dagangan diperbarui.", "Stok n bungkus".
- Format fee rokok: `Brand A ×2, Brand C ×1` (nama tanpa awalan "Rokok ", pemisah ", ", tanda `×`).
- Nama merek harus sama persis antara `menuData.Rokok` dan `finishedStock`: `Rokok Brand A` … `Rokok Brand E`.
- Stok tidak pernah minus (`Math.max(0, …)`).
- Gaya kode padat, handler via `.onclick`/`.oninput`/`.onchange`, tanpa `addEventListener`. Ubah definisi/handler TERAKHIR. Handler `#payButton` mati di `app.js:27` tidak diubah.
- Tanpa npm/Playwright. Harness hanya di `.superpowers/sdd/rokok-multibrand/harness/`, tidak pernah di tree proyek.
- Commit hanya bila user meminta. Langkah "Commit" di bawah berarti: tawarkan commit, jangan jalankan otomatis.

## Review Focus

1. Membuka ulang modal fee setelah berganti dari Rokok ke Uang tunai: `feeRokok` harus kosong dan baris Fee driver menampilkan nominal tunai. Diuji di Task 2 (`T2 switch to cash clears rokok`).
2. Kasir memilih order (`selectOrder`) setelah menyimpan fee rokok mode biasa: fee rokok mode biasa harus hilang dan tidak ikut terpotong. Diuji di Task 2 (`T2 selectOrder clears feeRokok`).
3. Order dengan fee tunai diselesaikan: `deductOrderStock` tidak boleh error saat `o.fee.items` tidak ada. Diuji di Task 3 (`T3 cash-fee order completes`).
4. Order dengan `fee:null` diselesaikan. Diuji di Task 3 (`T3 null-fee order completes`).
5. Form Buat order dibuka ulang setelah memilih Rokok: picker tersembunyi dan label nominal tampil lagi. Diuji di Task 3 (`T3 form reset hides picker`).

---

### Task 1: Data rokok + helper bersama

**Files:**
- Modify: `app.js:2-11` (`menuData`), `app.js:35-37` (`finishedStock`), `app.js:225` (data contoh order), `app.js:236` (`feeText`), `app.js:238` (`deductOrderStock`)
- Test: `.superpowers/sdd/rokok-multibrand/harness/run.sh`, `test.js`

**Interfaces:**
- Produces:
  - `rokokPickerHtml(items: {name,qty}[]) -> string`: `<div class="rokok-row">` per merek di `menuData.Rokok`, berisi `<strong>` nama, `<small>Stok n bungkus</small>`, dan `<input type="number" min="0" class="rokok-qty" data-name="Rokok Brand X" value="qty|''">`.
  - `readRokokPicker(root: Element) -> {name,qty}[]`: hanya qty > 0, urut sesuai DOM.
  - `cutFinished(lines: {name,qty}[]) -> void`: memotong `finishedStock` per nama dengan lantai 0. Nama yang tidak ada dilewati.
  - `feeText(f)` untuk `type:'stock'` → `Brand A ×2, Brand C ×1`.

- [ ] **Step 1: Siapkan harness.** Salin `.superpowers/sdd/plan/harness/run.sh` ke `.superpowers/sdd/rokok-multibrand/harness/run.sh` (kedalaman path sama). Buat `test.js` dengan helper `ok/eq/fire/setVal/toast` seperti harness lama, login `admin.rbt`/`demo123`, lalu blok `T1`/`T2`/`T3` yang dipilih lewat `location.hash`.
- [ ] **Step 2: Tulis tes T1 yang gagal.**

```js
eq('T1 rokok tab',Object.keys(menuData).includes('Rokok'),true);
eq('T1 5 brands',menuData.Rokok.map(x=>x[0]).join('|'),'Rokok Brand A|Rokok Brand B|Rokok Brand C|Rokok Brand D|Rokok Brand E');
eq('T1 stock A',finishedStock.find(x=>x.name==='Rokok Brand A').qty,24);
eq('T1 stock D unit',finishedStock.find(x=>x.name==='Rokok Brand D').unit,'bungkus');
eq('T1 feeText multi',feeText({type:'stock',items:[{name:'Rokok Brand A',qty:2},{name:'Rokok Brand C',qty:1}]}),'Brand A ×2, Brand C ×1');
eq('T1 feeText cash',feeText({type:'cash',value:50000}),rupiah(50000));
eq('T1 sample migrated',scheduledOrders.find(o=>o.fee?.type==='stock').fee.items[0].name,'Rokok Brand A');
const d=document.createElement('div');d.innerHTML=rokokPickerHtml([{name:'Rokok Brand B',qty:3}]);
eq('T1 picker rows',d.querySelectorAll('.rokok-qty').length,5);
ok('T1 picker stok text',d.textContent.includes('Stok 18 bungkus'),d.textContent);
eq('T1 read picker',JSON.stringify(readRokokPicker(d)),'[{"name":"Rokok Brand B","qty":3}]');
const before=finishedStock.find(x=>x.name==='Rokok Brand D').qty;cutFinished([{name:'Rokok Brand D',qty:99},{name:'Tidak ada',qty:1}]);
eq('T1 cut floor 0',finishedStock.find(x=>x.name==='Rokok Brand D').qty,0);finishedStock.find(x=>x.name==='Rokok Brand D').qty=before;
```

- [ ] **Step 3: Jalankan `bash .superpowers/sdd/rokok-multibrand/harness/run.sh T1`.** Hasil yang diharapkan: FAIL pada `T1 rokok tab` dan seterusnya.
- [ ] **Step 4: Implementasikan.** Tambah data sesuai design D1 dan migrasi `app.js:225` ke `items:[{name:'Rokok Brand A',qty:2}]`. Ubah `feeText` sesuai D4. Tambahkan `rokokPickerHtml`, `readRokokPicker`, dan `cutFinished` di dekat `feeText`. Ubah `deductOrderStock(o)` menjadi `cutFinished(o.items.concat(o.fee?.type==='stock'?o.fee.items:[]));renderInventory()`.
- [ ] **Step 5: Jalankan `run.sh T1`.** Hasil yang diharapkan: semua `T1` PASS.
- [ ] **Step 6: Commit.** Tawarkan ke user: `feat(pos): rokok multi-merek sebagai barang dagangan`.

### Task 2: Fee rokok di Kasir

**Files:**
- Modify: `app.js:13` (state), `app.js:20` (`renderCart`), `app.js:22` (`feeModal`), `app.js:128` (`#finishPay` di handler `#payButton` terakhir), titik reset `fee=0` di `app.js:27` (`#newOrder`), `:209`, `:215`, `:263`, `:264`
- Test: `.superpowers/sdd/rokok-multibrand/harness/test.js` (blok T2)

**Interfaces:**
- Consumes: `rokokPickerHtml`, `readRokokPicker`, `cutFinished`, `feeText` dari Task 1.
- Produces: global `let feeRokok=[]` (`{name,qty}[]`). `fee` tetap angka tunai.

- [ ] **Step 1: Tulis tes T2 yang gagal.** Drive DOM Kasir langsung, karena elemennya ada walau view tersembunyi. Siapkan `cart=[{name:'Paket Hemat 20K',price:20000,qty:1}];renderCart()`.

```js
$('#addFee').click();$('.fee-option[data-type="stock"]').click();$('#saveFee').click();
eq('T2 empty rejected',toast(),'Pilih minimal satu merek rokok');ok('T2 modal stays',modalOpen(),'closed');
setVal($('.rokok-qty[data-name="Rokok Brand B"]'),'2');$('#saveFee').click();
eq('T2 saved toast',toast(),'Fee rokok dicatat: Brand B ×2. Stok dipotong saat pembayaran.');
eq('T2 fee line',$('#feeTotal').textContent,'Brand B ×2');ok('T2 fee line shown',!$('#feeLine').classList.contains('hidden'),'hidden');
eq('T2 total unchanged',$('#grandTotal').textContent,rupiah(20000));eq('T2 no cart row',cart.length,1);
$('#addFee').click();eq('T2 prefill',$('.rokok-qty[data-name="Rokok Brand B"]').value,'2');
$('.fee-option[data-type="cash"]').click();setVal($('#feeInput'),'5000');$('#saveFee').click();
eq('T2 switch to cash clears rokok',feeRokok.length,0);eq('T2 cash line',$('#feeTotal').textContent,`-${rupiah(5000)}`);
$('#addFee').click();$('.fee-option[data-type="stock"]').click();setVal($('.rokok-qty[data-name="Rokok Brand B"]'),'2');$('#saveFee').click();
$('#payButton').click();$('#finishPay').click();
eq('T2 stock B cut',finishedStock.find(x=>x.name==='Rokok Brand B').qty,16);eq('T2 feeRokok reset',feeRokok.length,0);
feeRokok=[{name:'Rokok Brand A',qty:1}];$('#newOrder').click();eq('T2 newOrder clears',feeRokok.length,0);
feeRokok=[{name:'Rokok Brand A',qty:1}];selectOrder(scheduledOrders.find(o=>o.status==='Open'));eq('T2 selectOrder clears feeRokok',feeRokok.length,0);
```

- [ ] **Step 2: Jalankan `run.sh T2`.** Hasil yang diharapkan: FAIL pada `T2 empty rejected`.
- [ ] **Step 3: Implementasikan.** Kerjakan sesuai D5 (`feeModal`: wadah `#feeBody` berisi `#feeInput` untuk tunai atau `rokokPickerHtml(...)` untuk rokok, prefill dari `activeOrder?.fee` atau `feeRokok`, validasi, dan toast persis), D6 (`renderCart` mode biasa), D7 (`#finishPay` → `cutFinished(cart.concat(feeRokok))`, reset `fee=0;feeRokok=[]`), dan D9 (tambahkan `feeRokok=[]` di setiap reset). Setelah itu cek `grep -n "fee=0" app.js`: setiap kemunculan selain `app.js:27` `#finishPay` mati dan cabang tunai di `feeModal` harus diikuti `feeRokok=[]`.
- [ ] **Step 4: Jalankan `run.sh T2`, lalu `run.sh T1`.** Hasil yang diharapkan: semua PASS.
- [ ] **Step 5: Commit.** Tawarkan ke user: `feat(pos): fee driver rokok multi-merek di Kasir`.

### Task 3: Fee rokok di form Buat order + potong saat Selesai

**Files:**
- Modify: `index.html:134` (`#ofFeeFields`), `app.js:247` (reset form di `showOrderForm`), `app.js:252-256` (`saveOrder`), `app.js:258` (`#ofFeeType.onchange`)
- Test: blok T3 di `test.js`

**Interfaces:**
- Consumes: `rokokPickerHtml`, `readRokokPicker`, dan `deductOrderStock` hasil Task 1.
- Produces: elemen `#ofRokokPicker.rokok-picker` (tersembunyi secara default).

- [ ] **Step 1: Tulis tes T3 yang gagal.** Buka Pesanan → `$('#addOrder').click()`, isi outlet/pelanggan/tanggal/jam, lalu tambah satu kartu dari `#ofGrid`.

```js
$('#ofFeeOn').checked=true;fire($('#ofFeeOn'),'change');setVal($('#ofFeeType'),'stock','change');
ok('T3 picker shown',!$('#ofRokokPicker').classList.contains('hidden'),'hidden');ok('T3 nominal hidden',$('#ofFeeLabel').classList.contains('hidden'),'shown');
$('#ofSave').click();eq('T3 empty rejected',toast(),'Pilih minimal satu merek rokok');
setVal($('#ofRokokPicker .rokok-qty[data-name="Rokok Brand A"]'),'2');setVal($('#ofRokokPicker .rokok-qty[data-name="Rokok Brand C"]'),'1');$('#ofSave').click();
const o=scheduledOrders.at(-1);eq('T3 fee saved',JSON.stringify(o.fee),'{"type":"stock","items":[{"name":"Rokok Brand A","qty":2},{"name":"Rokok Brand C","qty":1}]}');
const a=()=>finishedStock.find(x=>x.name==='Rokok Brand A').qty,c=()=>finishedStock.find(x=>x.name==='Rokok Brand C').qty;const a0=a(),c0=c();
completeOrder(o);eq('T3 A cut',a(),a0-2);eq('T3 C cut',c(),c0-1);
ok('T3 cash-fee order completes',(()=>{try{completeOrder({items:[],fee:{type:'cash',value:1}});return true}catch(e){return false}})(),'threw');
ok('T3 null-fee order completes',(()=>{try{completeOrder({items:[],fee:null});return true}catch(e){return false}})(),'threw');
$('#addOrder').click();ok('T3 form reset hides picker',$('#ofRokokPicker').classList.contains('hidden')&&!$('#ofFeeLabel').classList.contains('hidden'),'not reset');
```

- [ ] **Step 2: Jalankan `run.sh T3`.** Hasil yang diharapkan: FAIL pada `T3 picker shown`.
- [ ] **Step 3: Implementasikan sesuai D8.** Tambahkan `<div id="ofRokokPicker" class="rokok-picker hidden"></div>` setelah `#ofFeeLabel`. `#ofFeeType.onchange` menukar class `hidden` pada `#ofFeeLabel`/`#ofRokokPicker` dan mengisi picker. Reset form mengembalikan keduanya. `saveOrder` memvalidasi dan menyimpan `fee:{type:'stock',items}` untuk tipe stok, dan validasi nominal tunai hanya berlaku untuk `cash`. Hapus teks "Jumlah bungkus rokok".
- [ ] **Step 4: Jalankan `run.sh all`.** Hasil yang diharapkan: semua T1–T3 PASS, `fail=0`.
- [ ] **Step 5: Commit.** Tawarkan ke user: `feat(pos): fee rokok multi-merek di form Pesanan`.

### Task 4: Gaya picker + verifikasi manual

**Files:**
- Modify: `styles.css` (tambahkan di akhir file)

- [ ] **Step 1: Tambahkan `.rokok-picker`.** Kolom `.rokok-row` dibuat `display:grid;grid-template-columns:1fr auto 80px;gap:10px;align-items:center`, `small` memakai warna muted variabel yang ada, dan input selebar kolom. Pastikan tampil rapi di modal fee dan di `#ofFeeFields`.
- [ ] **Step 2: Jalankan `run.sh all`.** Hasil yang diharapkan: tetap `fail=0`.
- [ ] **Step 3: Verifikasi manual di browser.** Jalankan tasks.md bagian 6 (6.1–6.6) secara berurutan di browser sungguhan, termasuk cek visual picker di modal fee dan di form Buat order.
- [ ] **Step 4: Commit.** Tawarkan ke user: `style(pos): picker merek rokok`.
