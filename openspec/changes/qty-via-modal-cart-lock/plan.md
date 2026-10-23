# Qty via Modal, Keranjang Terkunci Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kasir menentukan qty lewat modal "Tambah ke pesanan" saat memilih menu, dan setelah masuk keranjang barang hanya bisa dibuang lewat "Batalkan".

**Architecture:** Klik kartu menu di `renderMenu` membuka modal baru `qtyModal(item)` (memakai `openModal`), yang memanggil `addToCart(item, qty)` saat "Tambahkan" ditekan. `renderCart` disederhanakan: semua baris hanya `× qty` dan "Batalkan"; cabang `plus`/`minus` dihapus. Hanya POS yang disentuh.

**Tech Stack:** JS browser biasa tanpa module, template literal ke `innerHTML`, handler `.onclick`/`.oninput`/`.onblur`. Tanpa test otomatis; verifikasi manual di browser.

**Spec:** `specs/item-cancellation/spec.md` (delta) dan `design.md` di folder change ini; daftar tugas di `tasks.md`.

## Global Constraints

- Semua teks UI Bahasa Indonesia; Rupiah lewat helper `rupiah` (app.js).
- Tanpa `addEventListener` untuk elemen yang di-render ulang; pakai `.onclick =` / `.oninput =` / `.onblur =`.
- Tanpa alert, confirm, atau toast untuk input yang tidak valid.
- Input jumlah: hanya angka 0-9, maksimal 3 digit (nilai tertinggi 999), minimal 1.
- app.js berlapis: sebelum mengubah handler, cari semua definisi dan penugasannya, ubah yang terakhir.
- Tidak ada framework, dependency, build step, atau localStorage. Pusat Data (`outlet-data.*`) dan `renderOrderDraft` (app.js:217) tidak diubah.

## Review Focus

- Paste teks campuran (`a-5.x`) ke input jumlah: hanya `5` yang tersisa, tanpa pesan.
- Mengetik lebih dari 3 digit (`1234`): tampil `123`.
- Input kosong lalu menekan "Tambahkan" langsung (tanpa blur): jumlah dianggap 1, bukan 0 atau NaN.
- Menambah menu sama saat total sudah dekat 999: total dibatasi 999, tidak lewat.
- Order terjadwal aktif: item baru dari modal berlabel "baru", item tersimpan tidak berubah, keduanya hanya `× qty` dan "Batalkan".

---

## Task 1: Modal qty dan alur tambah ke keranjang

**Files:**
- Modify: `app.js:17` (`renderMenu`, penugasan `onclick` kartu menu)
- Modify: `app.js:18` (`addToCart`)
- Modify: `app.js` (tambah `qtyModal` tepat di bawah `addToCart`)
- Modify: `styles.css` (hanya bila stepper di modal perlu penyesuaian; `.qty-input` sudah ada di styles.css:29)

**Interfaces:**
- Consumes: `openModal(html)`, `closeModal()`, `$`, `rupiah`, `showToast`, `renderCart`, array `cart`, item menu posisional `[nama, harga, deskripsi, ikon]`.
- Produces: `qtyModal(item)` dan `addToCart(item, qty)` (qty bilangan bulat 1-999). Task 2 tidak bergantung pada keduanya, hanya pada bentuk baris `{name, price, qty}`.

- [ ] **Step 1: Cari semua penugasan `.onclick` kartu menu dan semua pemanggil `addToCart`**

Jalankan `Grep` pola `addToCart|menu-card` di `app.js`. Harapan: `addToCart` hanya dipanggil di `renderMenu` (app.js:17); catat penugasan terakhir kartu menu bila ada lebih dari satu.

- [ ] **Step 2: Ubah `addToCart(item)` menjadi `addToCart(item, qty)`**

Bila baris dengan nama sama dan `!saved` ada: `found.qty = Math.min(999, found.qty + qty)`. Bila tidak: `cart.push({name:item[0], price:item[1], qty})`. Lalu `renderCart()`, `closeModal()`, dan `showToast(\`${item[0]} × ${qty} ditambahkan\`)`.

- [ ] **Step 3: Tambah `qtyModal(item)` di bawah `addToCart`**

Memanggil `openModal` dengan: judul "Tambah ke pesanan", `item[0]`, `rupiah(item[1])`, baris stepper `<button id="qtyMinus">−</button><input id="qtyInput" class="qty-input" inputmode="numeric" maxlength="3" value="1"><button id="qtyPlus">+</button>`, tombol "Batal" (atribut `data-close`) dan "Tambahkan" (`id="qtyAdd"`). Tambahkan pembantu lokal `val()` yang mengembalikan `Math.min(999, Math.max(1, +input.value || 1))`.

Handler: `input.oninput` mengganti `value` dengan `value.replace(/\D/g,'').slice(0,3)`; `input.onblur` mengisi `val()` bila kosong atau 0; `#qtyMinus` mengisi `Math.max(1, val()-1)`; `#qtyPlus` mengisi `Math.min(999, val()+1)`; `#qtyAdd` memanggil `addToCart(item, val())`. Fokuskan dan pilih isi input setelah modal terbuka.

- [ ] **Step 4: Ubah penugasan `onclick` kartu menu di `renderMenu` (app.js:17)**

Ganti `addToCart(items[i])` dengan `qtyModal(items[i])`.

- [ ] **Step 5: Verifikasi manual di browser**

Buka `index.html`, login `Ayu Setiani` (Kasir, kata sandi `demo123`), mulai shift, klik kartu "Nasi Box 30K".
Harapan: modal "Tambah ke pesanan" terbuka dengan jumlah 1; ketik/paste `a-5.x` menjadi `5`; ketik `1234` menjadi `123`; kosongkan atau isi `0` lalu klik di luar input menjadi `1`; `−` berhenti di 1 dan `+` berhenti di 999; "Batal" menutup modal tanpa mengubah keranjang; "Tambahkan" dengan jumlah 3 menutup modal, keranjang berisi ×3, toast "Nasi Box 30K × 3 ditambahkan"; menambah menu sama jumlah 2 menggabung jadi ×5; mengosongkan input lalu langsung menekan "Tambahkan" menambah 1.

---

## Task 2: Keranjang terkunci (tanpa − dan +)

**Files:**
- Modify: `app.js:19` (`renderCart`, markup `.qty` dan handler tombol)

**Interfaces:**
- Consumes: bentuk baris keranjang `{name, price, qty, saved?}` dari Task 1 dan dari `selectOrder` (app.js:231), `openCancel(i)`.
- Produces: tidak ada fungsi baru; perilaku akhir: setiap baris hanya `× qty` dan "Batalkan".

- [ ] **Step 1: Ganti markup `.qty` di `renderCart` (app.js:19)**

Ganti ekspresi `x.saved ? <span>× qty</span> : <tombol −/qty/+>` dengan `<span>× ${x.qty}</span>` untuk semua baris.

- [ ] **Step 2: Hapus cabang `plus` dan `minus` dari handler `host.querySelectorAll('button')`**

Tinggalkan hanya `if(b.dataset.act==='cancel')openCancel(i);renderCart()`.

- [ ] **Step 3: Verifikasi manual di browser**

Dengan keranjang dari Task 1: setiap baris hanya `× qty` dan "Batalkan", tanpa − atau +; "Batalkan" membuka modal "Batalkan item?" dan, setelah dikonfirmasi, baris hilang dan satu baris histori pembatalan tercatat (cek di Laporan setelah login Administrator). Untuk order terjadwal: login Administrator, buka Pesanan, pilih order, lalu pastikan item tersimpan dan item baru yang ditambah lewat modal berlabel "tersimpan"/"baru" sama-sama hanya `× qty` dan "Batalkan".

---

## Task 3: Verifikasi akhir

**Files:**
- Tidak ada perubahan kode (hanya bila Task 1 atau 2 menemukan regresi).

**Interfaces:**
- Consumes: hasil Task 1 dan Task 2.
- Produces: konfirmasi bahwa alur pembayaran dan area di luar cakupan tidak berubah.

- [ ] **Step 1: Alur lengkap**

Pilih beberapa menu lewat modal (jumlah berbeda), tambah fee driver, tekan "Bayar sekarang". Harapan: subtotal, fee, dan total sesuai jumlah dari modal; pembayaran berjalan seperti sebelumnya.

- [ ] **Step 2: Area di luar cakupan**

Login Administrator atau Kepala Toko dan buka form "Buat order" di Pesanan: tombol −/+ dan "Hapus" tetap seperti semula. Buka `outlet-data.html`: tidak berubah.

---

## Self-review

- **Spec coverage:** modal + aturan input + penggabungan (Task 1), `× qty` dan "Batalkan" saja untuk semua baris (Task 2), tidak ada pengurangan lain; "Batal" menutup modal (Task 1 step 5). Tidak ada kebutuhan spec tanpa task.
- **Konsistensi tanda tangan:** `addToCart(item, qty)` dan `qtyModal(item)` konsisten antar Task 1 step 2-4.
- **Proporsi:** plan sengaja pendek; tubuh fungsi tidak ditulis, hanya tanda tangan, nilai spec, dan hasil yang diharapkan.
