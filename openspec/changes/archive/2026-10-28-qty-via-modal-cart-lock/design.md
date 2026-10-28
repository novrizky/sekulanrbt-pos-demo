## Context

Aplikasi terdampak: POS outlet (`index.html`, `app.js`, `styles.css`). Pusat Data (`outlet-data.html`) tidak tersentuh.

Kondisi sekarang (hasil baca kode):

- `renderMenu` (app.js:17) memasang `onclick` kartu menu ke `addToCart(items[i])`. Item menu berupa array posisional: `[0]` nama, `[1]` harga, `[2]` deskripsi, `[3]` ikon.
- `addToCart` (app.js:18), satu-satunya definisi: cari baris dengan nama sama dan `!saved`; bila ada `qty++`, bila tidak push `{name, price, qty:1}`, lalu `renderCart()` dan toast "... ditambahkan".
- `renderCart` (app.js:19), satu-satunya definisi dengan handler tombol cart (app.js:228 hanya `renderCartHeader`). Item `saved` sudah menampilkan `× qty`; item baru menampilkan `−`/`+`. Handler: `plus` -> `qty++`, `minus` -> `qty--` dan `splice` bila `<= 0`, `cancel` -> `openCancel(i)`.
- `openCancel` (app.js:98) sudah menjadi jalur pembatalan resmi: alasan wajib, histori, peringatan owner.
- `openModal(html)` / `closeModal()` (app.js:20) dan CSS `.qty-input` (styles.css:29) sudah ada.

Masalahnya: tombol `−` di keranjang mengurangi qty (bahkan sampai 0 dan menghapus baris) tanpa melewati `openCancel`.

## Goals / Non-Goals

**Goals:**
- Qty ditentukan lewat modal "Tambah ke pesanan" saat Kasir memilih menu.
- Input jumlah di modal bisa diketik langsung: hanya angka, maksimal 3 digit, tanpa alert.
- Setelah di keranjang, baris hanya menampilkan `× qty` dan "Batalkan"; tidak ada cara mengurangi qty selain "Batalkan".

**Non-Goals:**
- Form "Buat order" Admin/Kepala Toko (`renderOrderDraft`, app.js:217) tidak diubah.
- Pembatalan sebagian qty untuk item baru ditunda; "Batalkan" tetap membatalkan seluruh baris.
- Tidak ada backend, persistensi, atau komponen/library baru.

## Decisions

### D1: Klik kartu menu membuka modal, `addToCart` menerima qty
- **Choice**: `onclick` kartu di `renderMenu` memanggil fungsi baru `qtyModal(item)` yang memakai `openModal`. Tombol "Tambahkan" memanggil `addToCart(item, qty)`. `addToCart` diberi parameter `qty`: bila baris sama dan belum `saved` ada, `found.qty+=qty`; bila tidak, push dengan `qty`. Batas 999 per baris dijaga dengan `Math.min(999, ...)` agar penggabungan tidak melewati 3 digit. Toast menjadi `${nama} × ${qty} ditambahkan`.
- **Rationale**: Memakai pola modal yang sudah ada; perubahan `addToCart` kecil. Penggabungan ke baris yang ada mempertahankan perilaku lama (#3 di brainstorm).
- **Alternatives considered**: Modal dengan baris baru terpisah untuk menu sama, ditolak karena membuat keranjang berisi baris duplikat.

### D2: Aturan input jumlah di modal
- **Choice**: Satu `<input class="qty-input" inputmode="numeric" maxlength="3">` di antara tombol `−` dan `+`. `oninput` mengganti nilai dengan `value.replace(/\D/g,'').slice(0,3)` (menangani ketikan dan paste, karakter lain hilang diam-diam, tanpa alert/toast). Kosong diizinkan saat mengetik. `onblur` (dan saat klik "Tambahkan") mengubah kosong atau `0` menjadi `1`. Tombol `−` memakai `Math.max(1, n-1)`, tombol `+` memakai `Math.min(999, n+1)`; keduanya membaca nilai input terkini (kosong dianggap 1).
- **Rationale**: `oninput` + regex menyederhanakan validasi dan konsisten dengan konvensi `.oninput =`. Tidak perlu `type=number` (yang menerima `e`, `-`, `.`) sehingga validasi "hanya angka" lebih tegas.
- **Alternatives considered**: `type="number"` dengan `min`/`max`, ditolak karena tetap menerima karakter `e`/`-` dan memunculkan spinner bawaan browser. Menonaktifkan tombol Tambahkan saat kosong, ditolak karena lebih rumit daripada kembali ke 1.

### D3: Keranjang hanya `× qty` dan "Batalkan"
- **Choice**: Di `renderCart` (app.js:19, definisi terakhir dan satu-satunya), markup `.qty` menjadi `<span>× ${x.qty}</span>` untuk semua item (cabang `x.saved?...:...` dihapus), dan cabang `plus`/`minus` di handler `host.querySelectorAll('button')` dihapus; tersisa `cancel`. Tidak ada salinan lama yang mati yang perlu dihapus untuk fungsi ini.
- **Rationale**: Item baru dan item `saved` memakai tampilan dan aturan yang sama; semua pengurangan lewat `openCancel`.
- **Alternatives considered**: Menghapus `−` saja dan mempertahankan `+` (pendekatan B di brainstorm), ditolak karena keranjang punya dua perilaku berbeda.

### D4: CSS minimal
- **Choice**: Pakai `.qty-input` yang sudah ada (styles.css:29) dan gaya `.qty button` yang sudah ada untuk stepper di modal; tambah aturan kecil di `styles.css` hanya bila lebar 46px atau tata letak stepper di modal perlu disesuaikan.
- **Rationale**: Gunakan pola UI yang sudah ada sebelum membuat komponen baru.

## Risks / Trade-offs

- [Menambah qty kini butuh klik kartu menu lagi dan modal muncul tiap kali] → Mitigasi: modal ringan dengan fokus otomatis ke input jumlah; ini trade-off yang disetujui user.
- [Handler `onclick` kartu menu atau `#menuSearch` bisa ditimpa section akhir app.js] → Mitigasi: cari semua penugasan `.onclick` kartu menu sebelum mengubah (hasil pencarian saat ini: hanya `renderMenu`); ubah penugasan terakhir.
- [Order terjadwal aktif (`activeOrder`): item baru yang ditambah lewat modal tetap berlabel "baru" dan masih bisa dibatalkan] → Tidak ada perubahan; alur `openCancel` untuk item baru tetap membatalkan seluruh baris.
- [Pengurangan qty sebagian untuk item baru tidak tersedia] → Diterima untuk lingkup ini (ditunda).

## Migration Plan

N/A — perubahan hanya pada prototipe statis; tidak ada deployment, data, atau migrasi. Rollback: kembalikan `renderMenu`, `addToCart`, dan `renderCart` ke versi sebelumnya.

## Open Questions

- Teks pasti judul modal, label tombol, dan toast diputuskan di artifact `specs` (usulan: judul "Tambah ke pesanan", tombol "Batal" dan "Tambahkan").
- Apakah pembatalan sebagian qty untuk item baru dimasukkan (opsi kecil: lepas kondisi `saved?` yang membungkus input "Jumlah dibatalkan" di `openCancel`). Saat ini ditunda.
