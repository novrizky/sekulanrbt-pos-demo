# Permintaan Barang Bahan Baku Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambah section "Permintaan barang" di Persediaan POS, mencakup pengajuan, approval Administrator, cetak PO, terima barang ke `rawStock` dengan catatan selisih, dan riwayat per permintaan.

**Architecture:** Satu array objek baru `materialRequests` dan section render baru di akhir `app.js`, mengikuti pola Pesanan (`scheduledOrders`, `showOrderForm`, `openOrderDetail`). Markup baru di `section#inventory` setelah `.inventory-grid`, dan dokumen PO dicetak dari `#poPrint` lewat `body.print-po` + `window.print()`.

**Tech Stack:** HTML/CSS/JS browser biasa, tanpa module, build, test runner, maupun git.

**Spec:** `openspec/changes/add-raw-material-request/specs/raw-material-request/spec.md`, `design.md`, dan `tasks.md` di folder yang sama.

## Global Constraints

- Hanya POS: `index.html`, `app.js`, `styles.css`. Jangan sentuh `outlet-data.*`.
- Semua teks UI dan toast dalam Bahasa Indonesia, persis seperti di spec. Rupiah lewat `rupiah()`.
- Render dengan `innerHTML` + handler `.onclick`/`.oninput`/`.onchange`, tanpa `addEventListener`. Tabel lewat `tableHtml(headers, rows)` dengan header KAPITAL.
- Modal lewat `openModal(html)`/`closeModal()`, dan tombol tutup diberi `[data-close]`.
- Kode padat (satu baris per fungsi bila wajar). Tambahkan section baru di akhir `app.js`.
- Menipis = `qty <= min` di semua tabel.
- Harga PO tidak pernah menulis ke `rawStock.cost`. Hanya simpan penerimaan yang mengubah `cost`.
- Tanggal demo 20 September 2026. Format ID `REQ-0920-00n`, `PO-0920-00n` (sufiks sama dengan REQ), `GRN-0920-0nn` mulai dari 013.
- Tidak ada test otomatis atau commit. Verifikasi = buka `index.html` di browser, login `admin.rbt` / `budi.leader` (sandi `demo123`).

## Review Focus

1. Membuka form lalu Batal, lalu membuka lagi: draft harus di-reset (item Menipis kembali tercentang, qty kosong). Diverifikasi di Task 4 Step 4.
2. Membuka modal Cetak PO, mengubah harga, lalu Batal: harga PO dan vendor tidak boleh tersimpan. Diverifikasi di Task 5 Step 5.
3. Setelah cetak PO selesai, halaman harus kembali normal (class `print-po` dihapus) dan cetak Laporan tetap hanya mencetak Laporan. Diverifikasi di Task 5 Step 5.
4. Logout lalu login dengan peran lain: tombol aksi di daftar/detail mengikuti `session` baru (render ulang setelah login). Diverifikasi di Task 3 Step 4.
5. Qty negatif atau desimal di form permintaan/penerimaan: qty `<=0` di form permintaan dianggap kosong (toast "Isi qty untuk …"), dan QTY DITERIMA 0 masih diperbolehkan tetapi wajib catatan selisih. Diverifikasi di Task 4 Step 4 dan Task 5 Step 5.

---

### Task 1: Data bahan baku, data permintaan contoh, dan summary dinamis

**Files:**
- Modify: `app.js:30-32` (`rawStock`)
- Modify: `app.js:64-71` (`renderInventory` versi terakhir, jangan sentuh salinan mati di `app.js:24`)
- Modify: `index.html:72-73` (beri id `#lowStockCount` dan `#rawItemCount` pada `<strong>` kartu "Stok menipis" dan "Bahan baku")
- Modify: `app.js` (akhir file): `materialRequests`, `grnSeq`

**Interfaces:**
- Produces: `rawStock` (16–18 objek `{name,qty,unit,min,cost}`). `materialRequests: Array<{id,outlet,date,by:{name,role},note,status,items:[{name,unit,qty,price}],rejectReason,po:null|{id,vendor:{name,contact,phone,address},printed},receipt:null|{grn,supplierDoc,lines:[{name,qty,price}],note},history:[{at,by,text}]}>`. `let grnSeq=13`.

- [ ] **Step 1:** Tambahkan 11–13 bahan baku ke `rawStock` (Gula pasir kg, Bawang merah kg, Bawang putih kg, Cabai rawit kg, Kecap manis botol, Tepung terigu kg, Gas LPG 12 kg tabung, Kemasan box nasi pcs, Kantong plastik pack, Teh celup kotak, Garam kg, Santan L). Minimal 3 item baru dibuat `qty<min` dan satu `qty===min` (mis. Cabai rawit 5/5 kg).
- [ ] **Step 2:** Di `renderInventory`, isi `#lowStockCount` dengan jumlah `rawStock`+`finishedStock` yang `qty<=min` ("N item"), dan `#rawItemCount` dengan `rawStock.length` ("N item").
- [ ] **Step 3:** Tambahkan `materialRequests` dengan 5 record di bawah ini. Tanggal `2026-09-20`, waktu history format `'20 Sep 2026 HH.MM'`, harga awal = `cost` master.
  - REQ-0920-001: Budi Santoso/Kepala Toko, Sekulan RBT 519A, Menunggu persetujuan, Ayam 20 kg + Minyak goreng 24 L, `po:null`.
  - REQ-0920-002: Raka Administrator/Administrator, Sekulan RBT 519B, Disetujui, Beras 50 kg, `po:{id:'PO-0920-002',vendor:{name:'',…},printed:false}`, history "Permintaan diajukan" + "Disetujui otomatis (Administrator)".
  - REQ-0920-003: Rina Pratiwi/Kepala Toko, 519A, PO dicetak, Telur 300 butir + Bumbu dasar 10 kg, vendor `CV Sumber Pangan` (kontak, telp, alamat terisi), `printed:true`.
  - REQ-0920-004: Taufik Hadi/Kepala Toko, 519A, Selesai, Minyak goreng 30 L, vendor `PT Minyak Nusantara`, receipt `GRN-0920-010` dengan qty diterima 26 dan catatan "4 L kurang kirim, vendor susulkan minggu depan". History lengkap: diajukan → Disetujui oleh Raka Administrator → PO dicetak → Diterima dengan GRN-0920-010 → Selisih Minyak goreng -4 L: catatan.
  - REQ-0920-005: Budi Santoso/Kepala Toko, 519A, Ditolak, Gas LPG 12 kg 6 tabung, `rejectReason:'Stok gas masih cukup sampai akhir pekan'`.
- [ ] **Step 4: Verifikasi.** Buka `index.html`, login `admin.rbt`, buka Persediaan. Harapan: tabel stok berisi 16–18 item, Cabai rawit (stok = minimum) berstatus "Menipis", dan kartu summary menampilkan jumlah hasil hitungan, bukan "6 item"/"48 item". Console bebas error.

### Task 2: Markup dan gaya section permintaan

**Files:**
- Modify: `index.html:80` (setelah penutup `.inventory-grid` di `section#inventory`)
- Modify: `index.html` (sebelum `#modalBackdrop`): `<div id="poPrint"></div>` sebagai anak langsung `body`
- Modify: `styles.css` (akhir file)

**Interfaces:**
- Produces: id DOM `#requestPanel`, `#addRequest`, `#requestStatusFilter` (button `data-status` = Semua/Menunggu persetujuan/Disetujui/PO dicetak/Selesai/Ditolak), `#requestSearch`, `#requestCount`, `#requestTable`, `#requestFormPanel` (berisi `#rfOutletWrap`, `#rfSearch`, `#rfStatusFilter` dengan button `data-status` Semua/Menipis/Aman, `#rfTable`, `#rfSummary`, `#rfNote`, `#rfCancel`, `#rfSubmit`), `#poPrint`. Class CSS: `section#inventory.req-form-open`, `body.print-po`, `.req-by small`, `.status.wait`/`.approved`/`.printed`/`.done`/`.rejected`, `.diff-neg`.

- [ ] **Step 1:** Tambahkan `article.panel#requestPanel` (panel-head "Permintaan barang" / "Pengajuan bahan baku, persetujuan, PO, dan penerimaan." + `#addRequest` `btn primary` "+ Buat permintaan", toolbar `.order-toolbar` berisi `.order-chips#requestStatusFilter` dan `label.search` `#requestSearch` placeholder "Cari no. permintaan atau peminta", lalu `.table-scroll#requestTable`) dan `div#requestFormPanel.hidden` (struktur id di atas, judul panel "Pilih bahan baku", tombol "Batal" / "Ajukan permintaan").
- [ ] **Step 2:** CSS layar: `#requestPanel{margin-top:…}` mengikuti jarak `.inventory-grid`. `section#inventory.req-form-open>*:not(.topbar):not(#requestFormPanel){display:none}` dan `.req-form-open .top-actions{display:none}`. Pill status memakai `.status` + modifier warna. Input qty di tabel form dibuat sempit (≈70px). `#poPrint{display:none}`.
- [ ] **Step 3:** CSS print, setelah blok `@media print` yang ada: `@media print{body.print-po>*{display:none!important}body.print-po #poPrint{display:block!important}}` beserta gaya dokumen `.po-doc` (kop, grid info, tabel, total, dua kolom tanda tangan).
- [ ] **Step 4: Verifikasi.** Reload, buka Persediaan. Harapan: panel "Permintaan barang" tampil di bawah Stok bahan baku + Riwayat TAT dan tetap tampil setelah klik tab "LPP barang dagangan". Di Laporan, tombol cetak tetap hanya mencetak isi Laporan (pratinjau print).

### Task 3: Daftar dan detail permintaan

**Files:**
- Modify: `app.js` (akhir file, setelah data Task 1)
- Modify: `app.js:174-178` (setelah login: panggil `renderMaterialRequests()`)

**Interfaces:**
- Consumes: `materialRequests`, `session`, `tableHtml`, `openModal`, `rupiah`.
- Produces: `let reqFilter='Semua', reqQuery=''`. `function renderMaterialRequests()`, `function canActRequest(r) -> boolean`, `function reqPill(status) -> string`, `function logReq(r, text)` (push `{at:'20 Sep 2026 '+jam sekarang HH.MM, by:session.name, text}`), `function reqTotal(r) -> number` (Σ qty×price), `function openRequestDetail(id)`. Aksi detail memanggil `approveRequest`, `rejectRequestModal`, `printPoModal`, `receiveModal` dari Task 5. Sebelum Task 5 selesai, tombol-tombol ini menampilkan toast sementara.

- [ ] **Step 1:** `renderMaterialRequests()`: filter `reqFilter`/`reqQuery` (cocok ke `id` atau `by.name`, case-insensitive), urut `id` turun, `#requestCount` = "N permintaan • klik Detail untuk riwayat". Kolom: NO. PERMINTAAN, TANGGAL ("20 Sep 2026"), OUTLET, PEMINTA (`<span class="req-by">Nama<small>Peran</small></span>`), ITEM ("2 item"), NO. PO (atau "-"), STATUS (`reqPill`), AKSI (`<button class="text-btn" data-req="id">Detail</button>`). Jika kosong, tampilkan `empty-cart` "Tidak ada permintaan". Pasang `.onclick` untuk chip, `.oninput` untuk pencarian, `.onclick` untuk Detail.
- [ ] **Step 2:** `openRequestDetail(id)`: `<h2>id</h2>` + `reqPill`, `.ba-summary` (Outlet, Peminta "Nama • Peran", Tanggal, No. PO, Vendor atau "Belum diisi", Total `rupiah(reqTotal)`), tabel ITEM/QTY/HARGA PO/SUBTOTAL, `.warning-box` alasan jika Ditolak, tabel penerimaan (ITEM/QTY PO/DITERIMA/SELISIH + catatan) jika Selesai, `.timeline` dari `history` (`<time>` = jam), lalu tombol aksi sesuai design D8. Jika tidak berhak, tampilkan teks "Hanya dapat dilihat" dan tombol "Tutup" `[data-close]`.
- [ ] **Step 3:** Panggil `renderMaterialRequests()` sekali saat file dimuat dan sekali di handler login (setelah `session` diset).
- [ ] **Step 4: Verifikasi.** Sebagai `admin.rbt`: chip "Menunggu persetujuan" hanya menampilkan REQ-0920-001. Mengetik "rina" hanya menampilkan REQ-0920-003. Detail REQ-0920-004 menampilkan timeline Taufik → disetujui → PO dicetak → GRN-0920-010 + selisih. Detail REQ-0920-005 menampilkan alasan. Logout, login `budi.leader`: kelima REQ tampil, dan detail REQ-0920-002 menampilkan "Hanya dapat dilihat" tanpa "Cetak PO". Detail REQ-0920-001 tidak punya tombol Setujui/Tolak.

### Task 4: Form buat permintaan

**Files:**
- Modify: `app.js` (akhir file)

**Interfaces:**
- Consumes: `rawStock`, `outlets`, `session`, `materialRequests`, `logReq`, `renderMaterialRequests`, `approveRequest(r, auto)` (Task 5; sebelum Task 5 selesai, cukup set status Disetujui).
- Produces: `let requestDraft={query:'',status:'Semua',picks:{}}`. `function showRequestForm(on)`, `function resetRequestDraft()`, `function renderRequestForm()`, `function submitRequest()`, `function nextReqId() -> 'REQ-0920-00n'` (n = `materialRequests.length+1`, zero-pad 3).

- [ ] **Step 1:** `showRequestForm(on)`: toggle `#inventory.req-form-open` dan `#requestFormPanel.hidden`. Judul `h1` Persediaan = "Buat permintaan barang" atau "Persediaan". Bila `on`, panggil `resetRequestDraft()` lalu `renderRequestForm()`. `resetRequestDraft()`: `picks[name]={checked:qty<=min, qty:''}` untuk tiap `rawStock`, kosongkan pencarian dan catatan, `#rfOutletWrap` = input disabled `session.outlet` untuk Kepala Toko, select `outlets` untuk Administrator. Pasang `#addRequest.onclick`, `#rfCancel.onclick=()=>showRequestForm(false)`.
- [ ] **Step 2:** `renderRequestForm()`: urutan memakai algoritma berikut (tidak ditentukan oleh signature):
  ```js
  const low=x=>x.qty<=x.min;
  rows.sort((a,b)=>low(b)-low(a)||(low(a)?a.qty/a.min-b.qty/b.min:a.name.localeCompare(b.name)));
  ```
  Filter `requestDraft.status` (Menipis/Aman) dan `query` (nama, case-insensitive). Kolom: checkbox `data-name`, ITEM, STOK, MINIMUM, STATUS (pill ok/low), BIAYA / UNIT, QTY DIMINTA (`<input type="number" min="1">` + unit). Checkbox `.onchange` mengubah `picks[name].checked`. Input `.oninput` menyimpan `qty`, dan bila `+value>0` mencentang checkbox baris itu. Perbarui `#rfSummary` ("N item dipilih • Estimasi Rp X") tanpa render ulang tabel agar fokus input tidak hilang.
- [ ] **Step 3:** `submitRequest()` (`#rfSubmit.onclick`): `sel` = picks yang checked. Jika kosong, toast "Pilih minimal satu bahan baku". Jika ada `!(+qty>0)`, toast `Isi qty untuk ${name}` untuk item pertama. Lalu buat record (`items` dengan `price=cost` master, `by={name:session.name,role:session.role}`, outlet dari form), `logReq(r,'Permintaan diajukan')`, lalu `unshift`/`push`. Kepala Toko: status "Menunggu persetujuan", toast `Permintaan ${id} diajukan, menunggu persetujuan Administrator`. Administrator: `approveRequest(r,true)`, toast `Permintaan ${id} disetujui otomatis, ${po.id} siap dicetak`. Setelah itu `showRequestForm(false)` dan `renderMaterialRequests()`.
- [ ] **Step 4: Verifikasi.** Sebagai `budi.leader`: buka form, dan item Menipis tampil di atas dalam keadaan tercentang dengan qty kosong. Ketik "bawang", hanya baris bawang yang tampil. Filter "Aman" lalu "Semua", centang tetap ada. Isi 10 pada item Aman, item itu tercentang. Klik Ajukan dengan qty kosong, muncul toast "Isi qty untuk …". Isi qty -2, toast yang sama. Uncheck semua lalu Ajukan, muncul toast "Pilih minimal satu bahan baku". Isi semua lalu Ajukan, REQ-0920-006 "Menunggu persetujuan". Buka form lagi, draft ter-reset. Batal mengembalikan halaman Persediaan. Sebagai `admin.rbt`: ajukan, status "Disetujui", PO-0920-007 (atau sesuai urutan), dan toast disetujui otomatis.

### Task 5: Approval, cetak PO, dan terima barang

**Files:**
- Modify: `app.js` (akhir file)

**Interfaces:**
- Consumes: `openRequestDetail`, `logReq`, `reqTotal`, `renderMaterialRequests`, `renderInventory`, `rawStock`, `grnSeq`.
- Produces: `function approveRequest(r, auto)`, `function rejectRequestModal(r)`, `function printPoModal(r)`, `function poDocHtml(r) -> string`, `function receiveModal(r)`.

- [ ] **Step 1:** `approveRequest(r,auto)`: `r.po={id:r.id.replace('REQ','PO'),vendor:{name:'',contact:'',phone:'',address:''},printed:false}`, `r.status='Disetujui'`, `logReq(r, auto?'Disetujui otomatis (Administrator)':'Disetujui oleh '+session.name)`. Di detail (status Menunggu + Administrator), kolom QTY menjadi input. "Setujui" membandingkan tiap input dengan qty lama, menambah `logReq` `Qty ${name} dikoreksi ${old} → ${new} ${unit}` bila berbeda (qty `<=0` → toast `Isi qty untuk ${name}`), lalu memanggil `approveRequest(r,false)`, toast `${id} disetujui, ${po.id} siap dicetak`, render ulang, dan membuka ulang detail.
- [ ] **Step 2:** `rejectRequestModal(r)`: modal "Tolak permintaan" dengan textarea alasan, tombol "Kembali" (`openRequestDetail`) dan "Tolak permintaan". Alasan kosong → toast "Alasan penolakan wajib diisi". Jika terisi: `rejectReason`, status Ditolak, `logReq('Ditolak: '+alasan)`, toast `${id} ditolak`.
- [ ] **Step 3:** `printPoModal(r)`: field `#poVendor` (Nama vendor), `#poContact`, `#poPhone`, `#poAddress` prefilled dari `r.po.vendor`, lalu tabel ITEM/QTY/HARGA MASTER (`rawStock` find by name)/HARGA PO (`input.po-price` value `item.price`)/SUBTOTAL. `#poTotal` dihitung ulang via `.oninput`. Tombol "Batal" `[data-close]` (tanpa menyimpan apa pun) dan "Simpan & cetak PO". Simpan: nama vendor kosong → toast "Nama vendor wajib diisi". Selain itu tulis `r.po.vendor` dan `r.items[i].price`, isi `#poPrint.innerHTML=poDocHtml(r)`, `document.body.classList.add('print-po')`, `window.print()`, `classList.remove('print-po')`. Jika `!r.po.printed`: `printed=true`, status "PO dicetak", `logReq('PO dicetak')`. Selain itu `logReq('PO dicetak ulang')`. Lalu `closeModal()`, render ulang, dan toast `${po.id} dicetak`. `poDocHtml(r)` berisi kop "PURCHASE ORDER", outlet, No. PO, No. permintaan, tanggal, blok vendor, tabel item+harga+subtotal, total `rupiah`, dan tanda tangan "Dibuat oleh" (peminta) / "Disetujui oleh".
- [ ] **Step 4:** `receiveModal(r)`: `grn='GRN-0920-'+String(grnSeq).padStart(3,'0')`, pemasok read-only = vendor PO, `#rcDoc` surat jalan, tabel ITEM/QTY PO/QTY DITERIMA (`input.rc-qty`, value qty PO)/HARGA (`input.rc-price`, value harga PO)/SELISIH (sel diperbarui `.oninput`, `-30 butir` dengan class `diff-neg`, `+5 kg`, atau "-"), `#rcNote` "Catatan selisih". Simpan: jika ada qty berbeda dan catatan kosong → toast "Catatan selisih wajib diisi karena qty diterima berbeda dari PO". Selain itu untuk tiap baris `rawStock` find by name: `qty+=diterima`, `cost=harga`. Isi `r.receipt`, `grnSeq++`, status Selesai, `logReq('Diterima dengan '+grn)`, dan bila ada selisih `logReq('Selisih '+daftar+': '+catatan)`. Lalu `renderInventory()`, `renderMaterialRequests()`, `closeModal()`, toast `Barang ${po.id} diterima, stok bahan baku diperbarui`.
- [ ] **Step 5: Verifikasi.** Sebagai `admin.rbt`:
  1. REQ-0920-001: ubah Ayam 20→15, Setujui. Status Disetujui PO-0920-001, history berisi koreksi.
  2. Buat REQ baru sebagai Budi, lalu Tolak tanpa alasan (toast), lalu dengan alasan "Stok masih cukup" (status Ditolak).
  3. REQ-0920-002 Cetak PO dengan vendor kosong (toast). Buka lagi, ubah harga Beras ke 15000, lalu Batal, dan buka lagi: harga kembali 14.500. Isi "UD Beras Makmur" + 15000, lalu Simpan & cetak. Pratinjau print hanya berisi dokumen PO dengan Rp 15.000, setelah dialog ditutup halaman normal, dan tabel stok Beras tetap Rp 14.500.
  4. REQ-0920-003 Cetak PO: prefilled CV Sumber Pangan, history "PO dicetak ulang".
  5. REQ-0920-003 Terima barang: Telur 300→270, harga 2200, catatan kosong (toast), lalu isi "30 butir pecah, dikembalikan ke vendor" dan simpan. Stok Telur +270, biaya Telur Rp 2.200, status Selesai, GRN-0920-013 dan selisih "-30 butir" muncul di detail.
  6. Klik "+ Stok masuk" di tab LPP bahan baku, form lama terbuka.
  7. Buka Laporan dan cetak, pratinjau hanya berisi Laporan.
