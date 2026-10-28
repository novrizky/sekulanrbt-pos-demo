## 1. POS: modal qty (app.js)

- [x] 1.1 Tambah fungsi `qtyModal(item)` di dekat `addToCart` (app.js:18) yang memanggil `openModal` dengan judul "Tambah ke pesanan", nama menu, harga (`rupiah`), stepper `−` / `<input class="qty-input" inputmode="numeric" maxlength="3" value="1">` / `+`, tombol "Batal" (`data-close`) dan "Tambahkan"
- [x] 1.2 Pasang handler `.oninput` pada input jumlah: `value=value.replace(/\D/g,'').slice(0,3)` (tanpa alert/toast); `.onblur`: kosong atau 0 menjadi `1`
- [x] 1.3 Handler tombol `−` (`Math.max(1,n-1)`) dan `+` (`Math.min(999,n+1)`) membaca nilai input terkini (kosong dianggap 1)
- [x] 1.4 Ubah `addToCart(item)` menjadi `addToCart(item,qty)`: gabungkan ke baris sama yang belum `saved` dengan total maksimal 999, atau push `{name,price,qty}`; toast menjadi `${nama} × ${qty} ditambahkan`; tutup modal
- [x] 1.5 Ubah penugasan `onclick` kartu menu di `renderMenu` (app.js:17) dari `addToCart(items[i])` menjadi `qtyModal(items[i])`; cari dulu semua penugasan `.onclick` kartu menu dan ubah yang terakhir
- [x] 1.6 Verifikasi manual: login Kasir, mulai shift, klik kartu menu, cek modal (ketik `a-5.x` jadi `5`, ketik `1234` jadi `123`, kosong/0 jadi 1 saat blur, batas 1 dan 999, Batal tidak mengubah keranjang, menu sama digabung)

## 2. POS: keranjang terkunci (app.js)

- [x] 2.1 Di `renderCart` (app.js:19) ganti markup `.qty` menjadi `<span>× ${x.qty}</span>` untuk semua item (hapus cabang `x.saved?...:...` dan tombol `−`/`+`)
- [x] 2.2 Hapus cabang `plus` dan `minus` (termasuk `splice`) dari handler tombol cart; sisakan `cancel` -> `openCancel(i)`
- [x] 2.3 Verifikasi manual: baris keranjang hanya `× qty` dan "Batalkan"; "Batalkan" tetap membuka modal alasan dan tercatat di histori; pilih order terjadwal (tab Pesanan lalu Kasir) dan cek item tersimpan serta item baru berperilaku sama

## 3. POS: gaya (styles.css)

- [x] 3.1 Pakai `.qty-input` (styles.css:29) dan gaya `.qty button` untuk stepper di modal; tambah aturan kecil hanya bila lebar atau tata letak di modal perlu disesuaikan
- [x] 3.2 Verifikasi manual: tampilan modal rapi dan konsisten dengan modal lain di desktop dan lebar sempit

## 4. Verifikasi akhir

- [x] 4.1 Jalankan alur lengkap di index.html: pilih menu, isi qty di modal, bayar; pastikan total, fee driver, dan pembayaran tetap benar
- [x] 4.2 Pastikan form "Buat order" Admin/Kepala Toko tidak berubah dan outlet-data.html tidak tersentuh
