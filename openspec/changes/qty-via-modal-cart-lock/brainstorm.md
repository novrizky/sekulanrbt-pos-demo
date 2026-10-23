# Brainstorm: qty via modal, cart terkunci

Raw capture dari sesi `/opsx:explore` + `superpowers:brainstorming`, 2026-10-22.
Topik sudah dieksplorasi di percakapan; yang ditulis di sini adalah log keputusannya.

## Latar belakang

Permintaan user: saat ini Kasir bisa menghapus pesanan dengan mengurangi qty sampai 0. Ini salah. Yang diinginkan:

- Saat Kasir memilih barang, terbuka modal, dan Kasir memilih qty di modal itu.
- Setelah masuk cart, barang hanya bisa dibuang lewat tombol "Batalkan".

Aplikasi yang terdampak: POS (`index.html`, `app.js`, `styles.css`). Pusat Data (`outlet-data.html`) tidak tersentuh.

## Temuan dari kode (kondisi sekarang)

```
klik kartu menu --> addToCart()  --> qty +1 langsung (app.js:18, tanpa modal)
                                         |
                                         v
                    cart line:  [-] 3 [+]   Batalkan
                                 |
              qty-- sampai 0 --> cart.splice()   <-- lubang: hilang tanpa alasan,
                                                     tanpa histori, tanpa peringatan owner
```

- `renderMenu` (app.js:17) memasang `onclick` kartu menu ke `addToCart(items[i])`.
- `addToCart` (app.js:18): cari baris dengan nama sama dan `!saved`; kalau ada `qty++`, kalau tidak push `{name, price, qty:1}`. Satu definisi saja.
- `renderCart` (app.js:19): markup qty `× N` untuk item `saved`, selain itu `−`/`+`. Handler tombol di baris yang sama: `plus` -> `qty++`, `minus` -> `qty--` lalu `splice` bila `<= 0`, `cancel` -> `openCancel(i)`. Definisi di app.js:228 hanya `renderCartHeader`, jadi handler tombol cart hanya satu.
- Item `saved:true` (dari order terjadwal) sudah benar: tanpa −/+, pembatalan lewat `openCancel` dengan otorisasi Kepala Toko. Yang bocor hanya item baru dan cart Pelanggan Umum.
- `openCancel` (app.js:98): input "Jumlah dibatalkan" hanya muncul untuk item `saved`; item baru dibatalkan seluruh barisnya.
- Spec `item-cancellation` sudah mewajibkan alasan, catatan, histori pembatalan, dan peringatan owner. Aturan baru ini melengkapinya: semua pengurangan harus lewat jalur tersebut.
- `renderOrderDraft` (app.js:217, form "Buat order" Admin/Kepala Toko) juga punya − sampai 0 dan "Hapus". Dipakai Admin/Kepala Toko, bukan Kasir.

Celah tambahan yang ditemukan: tombol − dari 5 ke 1 juga mengurangi tanpa jejak, bukan hanya sampai 0. Karena itu − harus hilang seluruhnya, bukan hanya diblokir di qty 0.

## Keputusan

| # | Keputusan | Status |
|---|---|---|
| 1 | Klik kartu menu (Kasir) membuka modal "Tambah ke pesanan": nama, harga, input jumlah (−/+ dan ketik langsung, minimal 1; aturan input di #6), tombol Batal dan Tambahkan | Dikonfirmasi (permintaan user) |
| 2 | Cart line hanya menampilkan `× qty` dan "Batalkan"; tombol − dan + dihapus | Dikonfirmasi (user memilih A) |
| 3 | Menu sama dan belum `saved`: qty dari modal digabung ke baris yang sudah ada | Default saya, sejalan dengan perilaku `addToCart` sekarang |
| 4 | Form "Buat order" Admin/Kepala Toko di luar lingkup | Default saya, user tidak keberatan |
| 5 | Pembatalan sebagian qty untuk item baru: ditunda, "Batalkan" tetap membatalkan seluruh baris | Default saya (ditunda), belum diputuskan user |
| 6 | Input jumlah di modal: hanya angka 0-9 (karakter lain, termasuk hasil paste, diabaikan tanpa alert/toast), maksimal 3 digit (nilai tertinggi 999). Boleh kosong saat mengetik; saat blur, kosong atau 0 kembali ke 1. Tombol − berhenti di 1, tombol + berhenti di 999 | Dikonfirmasi user (angka saja, 3 digit, tanpa alert, perilaku blur, batas tombol) |

## Pendekatan yang dipertimbangkan

- **A. Hapus − dan +, qty hanya diubah lewat modal (dipilih user, rekomendasi).** Cart sama dengan item saved (`× 3`), aturan satu dan mudah dijelaskan di demo. Menambah qty = klik kartu menu lagi, modal menggabungkan.
- **B. Hapus − saja, + tetap.** Tambah cepat di cart, tetapi cart punya dua perilaku berbeda. Ditolak.

## Rancangan yang divalidasi

```
klik kartu menu --> modal "Tambah ke pesanan"
                    [Nama menu, harga]
                    Jumlah:  [-] [ 1 ] [+]   (min 1, bisa diketik, angka saja, maks 3 digit)
                    [Batal]  [Tambahkan]
                         |
                         v
              masuk cart (menu sama dan belum saved: qty digabung)

cart line:  x 3        Batalkan     <-- tanpa tombol -/+, sama seperti item saved
```

Bagian kode yang tersentuh:

- `renderMenu` / `addToCart`: klik kartu membuka modal, bukan langsung `qty++`.
- `renderCart`: markup qty dan cabang handler `plus`/`minus` dihapus.
- Spec `item-cancellation`: requirement baru, qty cart tidak bisa dikurangi selain lewat "Batalkan".
- Spec `pos-access-control`: mungkin tersentuh; dicek saat propose.

## Ukuran pekerjaan

Perubahan kecil: satu aplikasi (POS), dua fungsi di `app.js`, kemungkinan sedikit CSS untuk modal, satu requirement spec.

## Belum diputuskan / diserahkan ke tahap berikut

- Item 5: pembatalan sebagian qty untuk item baru. Opsi kecil bila dimasukkan: lepas kondisi `saved?` yang membungkus input "Jumlah dibatalkan" di `openCancel`.
- Apakah `pos-access-control` perlu delta spec.
- Teks pasti modal, judul, dan toast ("... ditambahkan") ditentukan di tahap specs.
