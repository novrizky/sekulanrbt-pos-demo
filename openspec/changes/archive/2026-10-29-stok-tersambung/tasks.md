## 1. POS — app.js: data item bersama

- [x] 1.1 Tambahkan `const sharedStock=[...]` tepat sebelum `const rawStock` (`app.js:31`) berisi Rokok Brand A–E (nilai dipindah dari `finishedStock` baris 38: A 24/29500, B 18/25500, C 12/22500, D 6/32000, E 30/19500, `unit:'bungkus'`, `min:10`) dan `{name:'Air mineral',qty:48,unit:'botol',min:24,cost:3000}`, semuanya dengan `shared:true` (D1)
- [x] 1.2 Akhiri `rawStock` dengan `...sharedStock`. Hapus baris rokok dari `finishedStock`, lalu akhiri `finishedStock` dengan `...sharedStock` (D1). Pastikan nama `'Air mineral'` sama persis dengan `menuData.Jajanan`

## 2. POS — app.js: tampilan LPP

- [x] 2.1 Di `renderInventory` terakhir (`app.js:71`), tampilkan nama item bersama sebagai `${x.name}<em class="line-tag">Tersambung</em>` untuk kedua tab (D2). Jangan ubah `renderInventory` lama yang sudah mati di `app.js:25`
- [x] 2.2 Ubah hitungan `#lowStockCount` (`app.js:75`) menjadi `[...new Set([...rawStock,...finishedStock])].filter(x=>x.qty<=x.min).length`. `#rawItemCount` tetap `rawStock.length` (D3)

## 3. POS — app.js: modal produksi

- [x] 3.1 Di `productionModal` (`app.js:108`), render opsi `#finishedItem` hanya untuk `!x.shared` dengan `value` indeks asli (D4)
- [x] 3.2 Di `draw` (`app.js:110`), lewati `r.shared` saat me-render opsi `.prod-raw`, dengan `value` tetap indeks asli (D4)
- [x] 3.3 Ubah `#addProdLine` (`app.js:113`) menjadi `rawStock.findIndex((r,k)=>!r.shared&&!lines.some(l=>l.i===k))` agar item bersama tidak pernah ditambahkan, dan toast "Semua bahan baku sudah dipilih" tetap muncul saat habis (D4)

## 4. Verifikasi manual di browser (index.html)

- [x] 4.1 Login `admin.rbt` (`demo123`) dan buka Persediaan. Pastikan tab "LPP bahan baku" memuat Rokok Brand A–E dan Air mineral dengan badge "Tersambung", kartu "Bahan baku" "23 item", dan Rokok Brand D dihitung sekali di "Stok menipis" _(diverifikasi lewat harness headless Chrome + screenshot; klik manual di browser tetap disarankan sebelum demo)_
- [x] 4.2 Pindah ke tab "LPP barang dagangan". Pastikan item bersama tampil dengan stok dan badge yang sama, dan Paket Favorit 25K tanpa badge _(diverifikasi lewat harness headless Chrome + screenshot; klik manual di browser tetap disarankan sebelum demo)_
- [x] 4.3 "+ Stok masuk" pada Rokok Brand D, jumlah 12, harga 32500. Pastikan toast "12 bungkus Rokok Brand D berhasil diterima", lalu di tab barang dagangan Rokok Brand D "18 bungkus", Rp32.500, dan "Aman" _(diverifikasi lewat harness headless Chrome + screenshot; klik manual di browser tetap disarankan sebelum demo)_
- [x] 4.4 "+ Buat permintaan": pastikan item bersama ada di tabel. Ajukan Air mineral 48 sebagai Administrator, cetak PO, lalu terima barang. Pastikan Air mineral "96 botol" di kedua tab _(diverifikasi lewat harness headless Chrome + screenshot; klik manual di browser tetap disarankan sebelum demo)_
- [x] 4.5 Tab barang dagangan → "+ Hasil produksi": pastikan item bersama tidak ada di pilihan hasil maupun bahan, dan "+ Tambah bahan" berulang berakhir dengan toast "Semua bahan baku sudah dipilih". Catat produksi Paket Favorit dari Beras dan pastikan tetap berhasil _(diverifikasi lewat harness headless Chrome + screenshot; klik manual di browser tetap disarankan sebelum demo)_
- [x] 4.6 Logout, login Kasir, dan mulai shift. Jual Air mineral ×3 dan catat fee rokok Brand B ×2, lalu bayar. Login kembali sebagai `admin.rbt` dan pastikan Air mineral berkurang 3 dan Rokok Brand B berkurang 2 di kedua tab _(diverifikasi lewat harness headless Chrome + screenshot; klik manual di browser tetap disarankan sebelum demo)_
