## 1. Data contoh (app.js)

- [x] 1.1 Perluas `rawStock` menjadi sekitar 15–18 bahan baku realistis (gula pasir, bawang merah, bawang putih, cabai rawit, kecap manis, tepung terigu, gas LPG 12 kg, kemasan box nasi, kantong plastik, teh, dll.). Beberapa item dibuat `qty<=min`, termasuk satu yang `qty===min`.
- [x] 1.2 Tambahkan array `materialRequests` (bentuk record sesuai design D1) di akhir `app.js` dengan REQ-0920-001 s.d. REQ-0920-005: status, peminta, vendor/harga PO, receipt dengan selisih, dan history sesuai spec. Tambahkan counter `grnSeq=13`.
- [x] 1.3 Di `renderInventory` versi terakhir (app.js:64), hitung kartu summary "Stok menipis" dan "Bahan baku" dari data (beri id pada elemen `<strong>` di index.html bila perlu). Salinan mati di app.js:24 tidak disentuh.
- [x] 1.4 Verifikasi di browser: buka index.html, login admin.rbt/demo123, buka Persediaan. Tabel stok menampilkan item baru, status Menipis untuk `qty<=min`, dan angka kartu summary sesuai.

## 2. Markup dan gaya section (index.html, styles.css)

- [x] 2.1 Di `section#inventory` setelah `.inventory-grid`, tambahkan `article.panel#requestPanel` (judul, tombol `#addRequest` "+ Buat permintaan", chip `#requestStatusFilter`, input `#requestSearch`, `#requestTable`) dan `div#requestFormPanel.hidden`.
- [x] 2.2 Tambahkan `div#poPrint` sebagai anak langsung `body` (di luar `.view`), tersembunyi di layar.
- [x] 2.3 Di styles.css: gaya toolbar/tabel section permintaan, kolom PEMINTA dua baris, pill status per status, `section#inventory.req-form-open` yang menyembunyikan anak selain topbar dan `#requestFormPanel`, tabel form item, dan baris selisih.
- [x] 2.4 Di styles.css: tambahkan blok `@media print` untuk `body.print-po` (sembunyikan semua anak `body` selain `#poPrint`) beserta tata letak dokumen PO (kop, info vendor, tabel, total, tanda tangan). Taruh setelah aturan print Laporan.
- [x] 2.5 Verifikasi di browser: section tampil di bawah Stok bahan baku + Riwayat TAT, tetap tampil di tab LPP barang dagangan, dan cetak Laporan tidak berubah.

## 3. Daftar dan detail permintaan (app.js)

- [x] 3.1 Buat `renderMaterialRequests()`: filter status + pencarian nomor/peminta, urut terbaru, `tableHtml` dengan kolom NO. PERMINTAAN, TANGGAL, OUTLET, PEMINTA, ITEM, NO. PO, STATUS, AKSI. Pasang handler chip dan pencarian lewat `.onclick`/`.oninput`. Panggil saat inisialisasi dan setelah login.
- [x] 3.2 Buat helper `canActRequest(r)` dan `reqPill(status)`, serta helper history `logReq(r,text)` yang mencatat waktu dan `session.name`.
- [x] 3.3 Buat `openRequestDetail(id)`: `.ba-summary` (outlet, peminta+peran, tanggal, No. PO, vendor, total), tabel item, ringkasan penerimaan/selisih bila Selesai, alasan bila Ditolak, `.timeline` dari history, dan tombol aksi sesuai status serta hak (D8). Tampilkan "Hanya dapat dilihat" jika tidak berhak.
- [x] 3.4 Verifikasi di browser: filter "Menunggu persetujuan" hanya menampilkan REQ-0920-001, pencarian "rina" berfungsi, detail REQ-0920-004 menampilkan timeline lengkap, dan login budi.leader masih melihat REQ-0920-002 tanpa tombol aksi.

## 4. Form buat permintaan (app.js)

- [x] 4.1 Buat `showRequestForm(on)` (toggle class `req-form-open`, judul topbar "Buat permintaan barang", sembunyikan aksi topbar) dan `resetRequestDraft()` yang mencentang item Menipis dengan qty kosong. Outlet terkunci untuk Kepala Toko, select `outlets` untuk Administrator.
- [x] 4.2 Buat `renderRequestForm()`: urutan Menipis dulu (rasio `qty/min` naik), lalu Aman A–Z. Pencarian nama dan filter Semua/Menipis/Aman tidak mengubah `picks`. Mengisi qty>0 otomatis mencentang. Ringkasan jumlah item + estimasi nilai.
- [x] 4.3 Buat handler "Ajukan permintaan": validasi (toast "Pilih minimal satu bahan baku" / "Isi qty untuk <item>"), buat REQ dengan harga = `cost` master. Kepala Toko → "Menunggu persetujuan" + toast menunggu. Administrator → panggil `approveRequest` + toast disetujui otomatis. Tutup form dan render daftar. "Batal" menutup form.
- [x] 4.4 Verifikasi di browser sebagai budi.leader dan admin.rbt: item Menipis di atas dan tercentang, pencarian "bawang", filter Aman mempertahankan centang, kedua toast validasi muncul, dan status awal sesuai peran.

## 5. Approval, cetak PO, dan terima barang (app.js)

- [x] 5.1 Buat `approveRequest(r, auto)` (terbitkan `po` dengan sufiks sama, status Disetujui, history), aksi Setujui dengan koreksi qty tercatat di history, dan modal Tolak dengan alasan wajib.
- [x] 5.2 Buat modal Cetak PO: field vendor prefilled, tabel HARGA MASTER/HARGA PO dengan total yang dihitung ulang langsung, validasi "Nama vendor wajib diisi". Simpan ke `r.po.vendor` dan `r.items[].price` tanpa menyentuh `rawStock.cost`. Isi `#poPrint`, lalu `body.print-po` → `window.print()` → hapus class. Cetak pertama: status PO dicetak + history "PO dicetak". Cetak berikutnya: history "PO dicetak ulang".
- [x] 5.3 Buat modal Terima barang: nomor `GRN-0920-0nn` dari `grnSeq`, pemasok dari vendor PO, surat jalan, tabel QTY PO/QTY DITERIMA/HARGA/SELISIH yang dihitung langsung, dan catatan selisih wajib bila qty berbeda. Simpan: tambah `rawStock.qty`, set `cost`, isi `receipt`, status Selesai, history GRN + selisih, `renderInventory()` + `renderMaterialRequests()`, dan toast.
- [x] 5.4 Verifikasi di browser: setujui REQ-0920-001 dengan koreksi qty, tolak tanpa/dengan alasan, cetak PO REQ-0920-002 dengan harga diubah (biaya master tetap), cetak ulang REQ-0920-003 prefilled, terima REQ-0920-003 dengan selisih (stok dan biaya per unit bertambah/berubah di tabel), dan pastikan "+ Stok masuk" lama tetap berfungsi.
