## Context

Persediaan di POS (`section#inventory`, `index.html`) saat ini menampilkan summary-grid, tab `stock-ledger-tabs`, lalu `.inventory-grid` yang berisi panel "Stok bahan baku" (`#rawTable`, tombol `#stockIn`) dan "Riwayat TAT" (`#tatList`). Restok bahan baku hanya bisa dilakukan lewat `stockInModal()` (app.js:138), yaitu GRN satu item yang langsung menambah `rawStock[i].qty` dan menimpa `cost`. Dokumen GRN tidak tersimpan sama sekali.

Kepala Toko dan Administrator sama-sama sudah punya view `inventory` di `ROLE_ACCESS`. Semua akun Kepala Toko ada di Sekulan RBT 519A (Budi/Rina/Taufik, satu per shift). Info pengguna aktif ada di global `session` (`name`, `role`, `outlet`).

Ini prototipe statis. Data berupa array di memori, aksi hanya mengubah array lalu `showToast`. Perubahan ini hanya menyentuh POS (`index.html`, `app.js`, `styles.css`).

Pilihan alur dan alternatifnya ada di `brainstorm.md`. Dokumen ini menjabarkan cara membangunnya.

## Goals / Non-Goals

**Goals:**
- Section "Permintaan barang" di Persediaan dengan daftar, filter status, dan kolom peminta.
- Form pemilihan item yang menaruh item Menipis di atas, dengan pencarian nama dan filter status.
- Alur status dengan approval Administrator, auto-approve untuk permintaan Administrator, dan koreksi qty.
- Cetak PO dengan identitas vendor dan harga per PO yang tersimpan dan prefilled.
- Terima barang dari PO ke `rawStock` dengan catatan selisih.
- Timeline riwayat per permintaan.

**Non-Goals:**
- Persistensi, backend, dan pengiriman PO ke vendor (tetap manual).
- Master vendor yang dipakai ulang lintas PO.
- Penerimaan bertahap dan approval bertingkat.
- Dimensi outlet pada `rawStock`. Penerimaan dari PO outlet mana pun menambah `rawStock` yang sama.
- PDF sungguhan (cukup `window.print()`).
- Merapikan salinan mati di `app.js`, kecuali yang langsung disentuh.

## Decisions

### D1: Record `materialRequests` berupa objek dengan status tersimpan
- **Choice**: array objek baru `materialRequests` di akhir `app.js`, setelah blok Pesanan:
  ```
  {id:'REQ-0920-001', outlet:'Sekulan RBT 519A', date:'2026-09-20',
   by:{name:'Budi Santoso', role:'Kepala Toko'}, note:'',
   status:'Menunggu persetujuan',   // | 'Disetujui' | 'PO dicetak' | 'Selesai' | 'Ditolak'
   items:[{name:'Ayam', unit:'kg', qty:20, price:38000}],  // price = harga PO (default cost master)
   rejectReason:'',
   po:null | {id:'PO-0920-001', vendor:{name,contact,phone,address}, printed:false},
   receipt:null | {grn:'GRN-0920-013', supplierDoc:'SJ-..', lines:[{name,qty,price}], note:''},
   history:[{at:'20 Sep 2026 09.12', by:'Budi Santoso', text:'Permintaan diajukan'}]}
  ```
- **Rationale**: mengikuti pola `scheduledOrders` (objek, bukan array posisional), sehingga aman ditambah field. Status disimpan karena status ini hasil langkah alur, bukan hasil hitungan.
- **Alternatives considered**: array posisional seperti `cancelLog` ditolak karena terlalu banyak field bersarang. Status turunan seperti `orderMoney` tidak cocok karena status alur ini hasil aksi.

### D2: Harga PO disimpan per item di permintaan, master tidak disentuh
- **Choice**: `items[i].price` diisi dari `rawStock.cost` saat permintaan dibuat. Modal Cetak PO menampilkan HARGA MASTER (read-only, dari `rawStock`) dan HARGA PO (input). Simpan hanya menulis ke `items[i].price` dan `po.vendor`, tanpa menulis ke `rawStock.cost`. Saat barang diterima, harga di form GRN (default = harga PO) ditulis ke `rawStock.cost`, sama seperti perilaku GRN yang ada.
- **Rationale**: keputusan pengguna (Q8 di brainstorm). Biaya master hanya berubah oleh harga beli aktual.

### D3: PO terbit saat status menjadi Disetujui
- **Choice**: fungsi `approveRequest(r)` mengisi `r.po={id:'PO-'+…, vendor:{name:'',contact:'',phone:'',address:''}, printed:false}`, mengubah status menjadi Disetujui, dan menambah history. Permintaan Administrator memanggil fungsi ini langsung saat diajukan (history: "Diajukan" lalu "Disetujui otomatis"). Nomor PO memakai sufiks REQ yang sama (REQ-0920-004 → PO-0920-004) agar mudah dilacak.
- **Alternatives considered**: PO terbit saat cetak pertama ditolak, karena nomor PO sebaiknya sudah ada sebelum vendor dihubungi.

### D4: Cetak PO lewat modal isian lalu area cetak khusus
- **Choice**: aksi "Cetak PO" membuka modal berisi field vendor (Nama vendor wajib, Kontak, Telepon, Alamat; prefilled dari `r.po.vendor`) dan tabel item dengan input HARGA PO serta total yang dihitung ulang saat input berubah. "Simpan & cetak PO" melakukan langkah-langkah ini:
  1. Simpan vendor dan harga ke record.
  2. Isi `#poPrint` (elemen baru, tersembunyi di layar) dengan dokumen PO: kop outlet, nomor PO/REQ, tanggal, vendor, tabel item, total, dan kolom tanda tangan.
  3. `document.body.classList.add('print-po')`, panggil `window.print()`, lalu hapus class-nya.
  4. Pada cetak pertama, status menjadi PO dicetak, `po.printed=true`, dan history bertambah "PO dicetak". Cetak ulang hanya menambah history "PO dicetak ulang".
  
  Blok `@media print` baru di `styles.css`: `body.print-po > *:not(#poPrint){display:none!important}` dan `body.print-po #poPrint{display:block}`. Blok ini ditulis setelah aturan print Laporan yang ada agar tidak bentrok.
- **Rationale**: memakai mekanisme `window.print()` yang sudah dipakai Laporan. Isian vendor saat cetak sesuai Q1.
- **Alternatives considered**: jendela baru (`window.open`) ditolak karena butuh styling terpisah.

### D5: Hak aksi dihitung dari `session`
- **Choice**: helper `canActRequest(r)` mengembalikan true jika `session.role==='Administrator'`, atau jika `session.role==='Kepala Toko' && r.outlet===session.outlet`. Setujui/Tolak hanya untuk Administrator. Cetak PO dan Terima barang memakai `canActRequest`. Daftar tidak difilter per outlet untuk Kepala Toko (Q5). Jika tidak berhak, tombol aksi tidak dirender dan detail menampilkan teks "Hanya dapat dilihat".
- **Rationale**: aturan cukup sederhana untuk ditulis di satu helper.

### D6: Penempatan UI dan panel form
- **Choice**: di `index.html`, setelah `.inventory-grid` di dalam `section#inventory`, tambahkan:
  - `article.panel#requestPanel`: panel-head "Permintaan barang" + tombol `#addRequest` "+ Buat permintaan", toolbar `.order-chips#requestStatusFilter` (Semua / Menunggu persetujuan / Disetujui / PO dicetak / Selesai / Ditolak) + pencarian nomor/peminta, lalu `#requestTable` (`.table-scroll`).
  - `div#requestFormPanel.hidden`: panel form penuh.
  
  Saat form dibuka, `section#inventory` diberi class `req-form-open`, dan CSS menyembunyikan semua anak section kecuali topbar dan `#requestFormPanel` (pola `showOrderForm`). Topbar berganti judul menjadi "Buat permintaan barang" dan tombol aksi topbar disembunyikan. Section permintaan tidak dipengaruhi tab LPP (selalu tampil).
- **Kolom daftar**: NO. PERMINTAAN, TANGGAL, OUTLET, PEMINTA (nama + peran kecil di bawahnya), ITEM (mis. "3 item"), NO. PO, STATUS (pill), AKSI ("Detail"). Urutan terbaru di atas. Klik "Detail" membuka modal detail.
- **Alternatives considered**: tab ketiga atau menu sidebar ditolak oleh pengguna.

### D7: Form pemilihan item
- **Choice**: state `requestDraft={query:'', status:'Semua', picks:{[name]:{checked,qty}}, note:''}`. Saat reset, `picks` diisi `checked:true, qty:''` untuk setiap item `qty<=min`. Tabel: centang, ITEM, STOK, MINIMUM, STATUS, BIAYA / UNIT, QTY DIMINTA (input + unit). Urutannya: item Menipis dulu (rasio `qty/min` naik, yang paling kritis di atas), lalu item Aman urut A–Z. Filter dan pencarian hanya menyaring baris, sedangkan `picks` tetap tersimpan. Footer menampilkan jumlah item dipilih dan estimasi nilai (`qty×cost`), field catatan, Outlet (Kepala Toko: outlet akun, disabled; Administrator: select `outlets`), lalu tombol "Batal" dan "Ajukan permintaan".
- **Validasi**: minimal satu item dicentang, dan setiap item tercentang qty>0. Mengetik qty>0 otomatis mencentang item.
- **Rationale**: Q7. Re-render baris memakai `innerHTML` dan handler `.onclick/.oninput`.

### D8: Modal detail dan aksi per status
- **Choice**: `openRequestDetail(id)` memakai `openModal` dengan header (nomor, pill status), `.ba-summary` (Outlet, Peminta + peran, Tanggal, No. PO, Vendor, Total estimasi), tabel item, dan `.timeline` dari `history`. Aksi:
  - Menunggu persetujuan + Administrator: kolom qty jadi input (koreksi), tombol "Tolak" dan "Setujui". Koreksi qty dicatat di history ("Qty Ayam dikoreksi 20 → 15 kg").
  - Tolak: modal alasan (wajib), lalu status Ditolak dan history berisi alasannya.
  - Disetujui / PO dicetak + `canActRequest`: tombol "Cetak PO" (D4).
  - PO dicetak + `canActRequest`: tombol "Terima barang" (D9).
  - Selesai: ringkasan penerimaan (GRN, qty diterima per item, catatan selisih).
- **Rationale**: memakai pola detail order (`openOrderDetail`) dan pindah antar-modal lewat tombol Kembali.

### D9: Terima barang dari PO
- **Choice**: modal "Terima barang dari PO-…": No. penerimaan (`GRN-0920-0nn` dari counter `grnSeq`, mulai 13 karena stockInModal memakai 012), tanggal, pemasok (dari `po.vendor.name`, read-only), No. surat jalan, lalu tabel ITEM / QTY PO / QTY DITERIMA (input) / HARGA (input, default harga PO) / SELISIH (dihitung ulang langsung, mis. "-4 L"). Bila ada selisih qty, field "Catatan selisih" ditandai wajib. Simpan: untuk tiap baris, cari `rawStock` berdasarkan nama, tambah `qty`, set `cost=price`. Lalu isi `receipt`, ubah status menjadi Selesai, tambah history ("Diterima GRN-0920-013" + "Selisih: …"), panggil `renderInventory()` dan render daftar, dan tampilkan toast.
- **Rationale**: Q3. Penerimaan sekali dengan selisih tercatat.

### D10: Perubahan pada kode lama
- Tambah item `rawStock` menjadi sekitar 15–18 (gula pasir, bawang merah, bawang putih, cabai rawit, kecap manis, tepung terigu, gas LPG 12 kg, kemasan box nasi, kantong plastik, teh, dan lain-lain), beberapa dalam kondisi Menipis.
- Kartu summary "Stok menipis" dan "Bahan baku" di-update dari data di dalam `renderInventory` versi terakhir (app.js:64) supaya angkanya konsisten dengan data yang lebih banyak. Salinan `renderInventory` mati di app.js:24 tidak disentuh.
- `#stockIn` dan `stockInModal` tidak diubah (handler terakhir di app.js:156 tetap).
- `renderMaterialRequests()` dipanggil saat inisialisasi dan setelah setiap aksi. Handler tombol baru dipasang di section baru di akhir `app.js`.

## Risks / Trade-offs

- [Risk] `window.print()` mencetak seluruh halaman jika class `print-po` gagal dipasang → Mitigation: pasang class sebelum print, hapus sesudahnya. Aturan print dibatasi selector `body.print-po`.
- [Risk] Aturan print Laporan yang ada (`.view{display:none}`, `.view#reports{display:block}`) bisa ikut tercetak → Mitigation: `#poPrint` ditaruh sebagai anak langsung `body`, di luar `.view`, dan aturan `body.print-po` menyembunyikan saudaranya.
- [Trade-off] `rawStock` tanpa dimensi outlet: penerimaan PO outlet 519B ikut menambah stok yang tampil → diterima sebagai penyederhanaan demo.
- [Trade-off] Selisih hanya dihitung dari qty, harga yang berbeda tidak wajib dicatat → harga baru tetap terekam di `receipt.lines` dan di master.
- [Risk] Kartu summary yang tadinya statis menjadi dinamis dan angkanya berubah dari "6 item"/"48 item" → angka baru justru konsisten dengan tabel.

## Migration Plan

N/A — prototipe statis tanpa deployment. Rollback cukup dengan mengembalikan tiga file POS.

## Open Questions

- (tidak ada; semua keputusan dikonfirmasi pengguna di sesi explore)
