## 1. POS — app.js: data rokok

- [x] 1.1 Tambahkan kategori `Rokok` di akhir `menuData` (`app.js:2-11`, setelah `Jajanan`) dengan 5 baris sesuai design D1 (Rokok Brand A–E, harga, keterangan isi batang, kode RA–RE)
- [x] 1.2 Tambahkan 5 baris `finishedStock` (`app.js:35-37`) dengan nama persis sama, `unit:'bungkus'`, `min:10`, qty/cost sesuai D1 (A 24/29500, B 18/25500, C 12/22500, D 6/32000, E 30/19500)
- [x] 1.3 Migrasi data contoh order di `app.js:225` dari `fee:{type:'stock',value:2}` ke `fee:{type:'stock',items:[{name:'Rokok Brand A',qty:2}]}`

## 2. POS — app.js: helper bersama

- [x] 2.1 Ubah `feeText` (`app.js:236`) agar tipe stok menulis `items` sebagai "Brand A ×2, Brand C ×1" (D4)
- [x] 2.2 Tambahkan `rokokPickerHtml(items)` dan `readRokokPicker(root)` di dekat `feeText` (D3): baris per merek dari `menuData.Rokok`, keterangan "Stok n bungkus" dari `finishedStock`, input `.rokok-qty[data-name]` min 0
- [x] 2.3 Tambahkan `cutFinished(lines)` yang memotong `finishedStock` per `{name,qty}` dengan lantai 0, lalu ubah `deductOrderStock` (`app.js:238`) agar memotong `o.items` plus `o.fee.items` bila `o.fee?.type==='stock'` (D7)

## 3. POS — app.js: Kasir

- [x] 3.1 Tambahkan `let feeRokok=[]` di `app.js:13` (D2)
- [x] 3.2 Rewrite `feeModal` (`app.js:22`) sesuai D5: tab Uang tunai menampilkan input nominal, tab Rokok menampilkan `rokokPickerHtml`, prefill dari `feeRokok` (mode biasa) atau `activeOrder.fee` (mode order). Validasi "Pilih minimal satu merek rokok", lalu simpan ke `activeOrder.fee` atau `feeRokok`/`fee` dengan toast sesuai spec
- [x] 3.3 Ubah `renderCart` (`app.js:20`) mode biasa: `#feeLine` tampil bila `fee||feeRokok.length`, dan `#feeTotal` menampilkan `feeText` rokok tanpa minus bila `feeRokok` terisi (D6)
- [x] 3.4 Ubah `#finishPay` di handler `#payButton` terakhir (`app.js:128`) agar memakai `cutFinished(cart.concat(feeRokok))` dan reset `feeRokok=[]` (D7). Jangan ubah handler mati di `app.js:27`
- [x] 3.5 Tambahkan `feeRokok=[]` di setiap titik reset `fee=0` (D9): `#newOrder` (`app.js:27`), `app.js:209`, `#confirmLogout` (`app.js:215`), `selectOrder` (`app.js:263`), pembayaran order (`app.js:264`). Cek dengan `grep -n "fee=0" app.js`

## 4. POS — index.html + app.js: form Buat order

- [x] 4.1 Di `#ofFeeFields` (`index.html:134`), tambahkan `<div id="ofRokokPicker" class="rokok-picker hidden"></div>` setelah `#ofFeeLabel` (D8)
- [x] 4.2 Ubah handler `#ofFeeType` `.onchange` (`app.js:258`) agar menukar `#ofFeeLabel` dan `#ofRokokPicker`, serta mengisi picker dengan `rokokPickerHtml([])`. Ubah juga reset form (`app.js:247`) agar picker tersembunyi dan label nominal tampil
- [x] 4.3 Ubah `saveOrder` (`app.js:252-256`): untuk tipe stok, baca `readRokokPicker($('#ofRokokPicker'))`, tolak dengan toast "Pilih minimal satu merek rokok" bila kosong, simpan `fee:{type:'stock',items}`. Validasi nominal tunai yang ada hanya berlaku untuk tipe tunai

## 5. POS — styles.css

- [x] 5.1 Tambahkan gaya `.rokok-picker` (D10): baris grid nama | stok (muted) | input qty ±80px, memakai variabel warna yang ada, rapi di dalam modal fee dan di `#ofFeeFields`

## 6. Verifikasi manual di browser

- [x] 6.1 Buka `index.html`, login Kasir (`demo123`), dan mulai shift. Buka tab "Rokok", tambahkan Brand A ×2 dan Brand C ×1, lalu pastikan ada dua baris cart terpisah _(diverifikasi lewat harness headless Chrome + screenshot; klik manual di browser tetap disarankan sebelum demo)_
- [x] 6.2 Tekan "+ Tambahkan fee driver", pilih Rokok, lalu tekan Simpan tanpa isian. Pastikan toast "Pilih minimal satu merek rokok" tampil. Isi Brand B 2 lalu simpan. Pastikan toast fee rokok tampil, baris "Fee driver" menampilkan "Brand B ×2", dan total tidak berubah. Buka ulang modal dan pastikan Brand B terisi 2 _(diverifikasi lewat harness headless Chrome + screenshot; klik manual di browser tetap disarankan sebelum demo)_
- [x] 6.3 Bayar. Logout, lalu login `admin.rbt` dan buka Persediaan "LPP barang dagangan". Pastikan Rokok Brand A 22, Brand B 16, Brand C 11, dan Brand D ditandai stok rendah _(diverifikasi lewat harness headless Chrome + screenshot; klik manual di browser tetap disarankan sebelum demo)_
- [x] 6.4 Sebagai Administrator, buka Pesanan → "Buat order" dan pastikan tab "Rokok" ada. Centang fee, pilih Rokok, lalu pastikan picker merek muncul menggantikan input nominal. Simpan tanpa merek dan pastikan toast tampil. Isi Brand A 2 + Brand C 1, simpan sebagai Open, lalu pastikan detail order menampilkan "Brand A ×2, Brand C ×1" _(diverifikasi lewat harness headless Chrome + screenshot; klik manual di browser tetap disarankan sebelum demo)_
- [x] 6.5 Pastikan stok rokok tidak berubah, lalu "Selesaikan order" dan pastikan stok Brand A dan Brand C berkurang sesuai fee. Pastikan juga order contoh Selesai lama menampilkan fee "Brand A ×2" _(diverifikasi lewat harness headless Chrome + screenshot; klik manual di browser tetap disarankan sebelum demo)_
- [x] 6.6 Sebagai Kasir, pilih order Open tanpa fee lewat "Ubah", isi fee rokok, dan pastikan cart menampilkan "... (dari order)". Uji juga bahwa "Pesanan baru" dan logout mengosongkan fee rokok _(diverifikasi lewat harness headless Chrome + screenshot; klik manual di browser tetap disarankan sebelum demo)_
