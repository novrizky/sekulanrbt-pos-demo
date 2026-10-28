# Logout Kasir & Lanjut Shift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kasir bisa logout dari view Kasir tanpa tutup shift. Login ulang dengan username yang sama langsung melanjutkan shift.

**Architecture:** Global baru `openShift = {username, n, cash, note}` menyimpan shift yang berjalan di luar `session`. `#verifyStart` mengisinya, `closeShiftBA()` mengosongkannya, dan `loginAs()` membacanya untuk melewati layar Mulai Shift. Tombol Logout baru di header Kasir memakai `openModal()` lalu `endSession()` yang sudah ada.

**Tech Stack:** HTML + JS browser biasa (tanpa module, build, atau test suite). Verifikasi manual di browser.

**Spec:** `openspec/changes/kasir-logout-resume-shift/design.md`, `specs/kasir-logout/spec.md`, `specs/shift-opening/spec.md`, `specs/pos-access-control/spec.md`

## Global Constraints

- Hanya POS: `index.html`, `app.js`. Jangan sentuh `outlet-data.*` dan `styles.css` (tombol memakai kelas `btn ghost` yang sudah ada).
- Gaya kode: padat, satu baris per fungsi, handler lewat `.onclick =`, modal lewat `openModal(html)`/`closeModal()`, toast lewat `showToast`.
- Teks UI persis: tombol "Logout". Modal: judul "Logout", isi "Yakin logout tanpa tutup shift?", tambahan "Keranjang yang belum dibayar akan dikosongkan.", tombol "Batal" dan "Logout". Toast "Anda telah keluar dari sistem" dan "Melanjutkan Shift <n>". Badge "Shift <n> berjalan • Modal awal <rupiah>".
- Tanpa localStorage atau persistensi. Reload mereset `openShift`.
- Proyek diperlakukan tanpa git workflow, jadi tidak ada langkah commit.

## Review Focus

- Kasir menekan "Logout" saat sedang mengedit order terjadwal (`activeOrder` terisi). Logout harus mengosongkan order aktif, dan login ulang menampilkan pelanggan "Umum". Dicek di Task 2 Step 4.
- Klik backdrop modal Logout (`#modalBackdrop` menutup modal) harus sama dengan Batal: tidak logout. Dicek di Task 2 Step 4.
- Kepala Toko/Administrator login setelah Kasir logout tanpa tutup shift: toast "Masuk sebagai ..." biasa, sidebar tampil, tanpa badge shift. Dicek di Task 2 Step 4.
- `#shiftBadge` tidak boleh tersisa di sesi Kepala Toko setelah logout Kasir. `endSession` sudah menyembunyikannya, cukup dipastikan. Dicek di Task 2 Step 4.
- Uang seharusnya di rekap tutup shift setelah login ulang harus sama dengan sebelum logout (bergantung pada `openingCash` yang dipulihkan). Dicek di Task 2 Step 4.

---

### Task 1: Status shift terbuka (`openShift`) dan lanjut shift saat login

**Files:**
- Modify: `app.js:167` (deklarasi global sesi)
- Modify: `app.js:174` (`openVerifyModal`, handler `#verifyStart`)
- Modify: `app.js:119` (`closeShiftBA`, sebelum `endSession`)
- Modify: `app.js:182` (`loginAs`, baris toast/reset shift)

**Interfaces:**
- Produces: global `openShift` (`null` atau `{username:string, n:number, cash:number, note:string}`). Task 2 tidak boleh mengubahnya.

- [x] **Step 1:** Grep `endSession(`, `openShiftScreen(`, `verifyStart`, `closeShift` di `app.js`. Pastikan yang diubah adalah definisi/penugasan terakhir (per design D3, masing-masing hanya satu).
- [x] **Step 2:** Tambahkan `openShift=null` ke `let session=null,...` di app.js:167.
- [x] **Step 3:** Di `$('#verifyStart').onclick`, setelah `openingCash=cash;openingNote=note;`, set `openShift={username:session.username,n,cash,note};`.
- [x] **Step 4:** Di `closeShiftBA()`, set `openShift=null;` tepat sebelum `endSession(\`Shift ${n} berhasil ditutup\`)`.
- [x] **Step 5:** Di `loginAs()` baris 182, ganti `showToast(...);openingCash=null;openingNote='';$('#shiftBadge').classList.add('hidden');if(account.role==='Kasir')openShiftScreen(account);` dengan cabang:
  - `const resume=account.role==='Kasir'&&openShift?.username===account.username;`
  - Kalau `resume`: `openingCash=openShift.cash; openingNote=openShift.note;`, isi `#shiftBadge` dengan `Shift ${openShift.n} berjalan • Modal awal ${rupiah(openShift.cash)}`, hapus `hidden`, lalu `showToast(\`Melanjutkan Shift ${openShift.n}\`)`.
  - Kalau tidak: perilaku lama apa adanya (toast "Masuk sebagai ...", reset, badge hidden, `openShiftScreen` untuk Kasir).
- [x] **Step 6: Verifikasi.** Buka `index.html`, login `ayu.kasir`/`demo123`, modal 450000, centang serah terima, isi catatan bila diminta, lalu "Verifikasi & mulai shift". Hasil yang diharapkan: toast "Shift 1 dimulai. Modal awal Rp450.000", tanpa error di console. Buka "Tutup shift", catat uang seharusnya, lalu batal.

### Task 2: Tombol & modal Logout Kasir

**Files:**
- Modify: `index.html:38` (`.top-actions` header `section#pos`)
- Modify: `app.js:188` (di bawah `$('#logoutButton').onclick`)

**Interfaces:**
- Consumes: `endSession(message)`, `openModal(html)`, `closeModal()`, `renderCart()`, globals `cart`, `fee`, `activeOrder`, dan `openShift` dari Task 1 (hanya dibaca secara tidak langsung, tidak diubah).

- [x] **Step 1:** Di index.html:38, sisipkan `<button class="btn ghost" id="kasirLogout">Logout</button>` sebagai anak pertama `.top-actions`, sebelum `#closeShift`.
- [x] **Step 2:** Di app.js setelah baris 188, pasang `$('#kasirLogout').onclick`. Handler membuka `openModal` berisi `<h2>Logout</h2><p>Yakin logout tanpa tutup shift?</p>`, ditambah `<p>Keranjang yang belum dibayar akan dikosongkan.</p>` hanya bila `cart.length`, dan `.modal-actions` dengan `<button class="btn ghost" data-close>Batal</button><button class="btn primary" id="confirmLogout">Logout</button>`.
- [x] **Step 3:** `$('#confirmLogout').onclick` menjalankan `closeModal();activeOrder=null;cart=[];fee=0;renderCart();endSession('Anda telah keluar dari sistem')`. Jangan mengubah `#shiftLogout` maupun `#logoutButton`.
- [x] **Step 4: Verifikasi (lanjutan dari Task 1 Step 6, shift berjalan):**
  - Header menampilkan "Logout", "Tutup shift", "+ Pesanan baru", rapi di desktop dan di lebar ±400px.
  - "Logout" lalu "Batal" (dan sekali lagi lewat klik backdrop): view Kasir tetap, badge tetap.
  - Pilih order lewat "Ubah" di baris pelanggan, tambahkan menu, "Logout": modal menampilkan teks keranjang. "Logout": layar login dan toast "Anda telah keluar dari sistem".
  - Login `ayu.kasir`: tanpa layar Mulai Shift, toast "Melanjutkan Shift 1", badge "Shift 1 berjalan • Modal awal Rp450.000", keranjang kosong, pelanggan "Umum".
  - "Tutup shift": uang seharusnya sama dengan catatan Task 1 Step 6. Selesaikan tutup shift sampai toast "Shift 1 berhasil ditutup".
  - Login `ayu.kasir`: layar "Mulai Shift" tampil kembali. Tekan "Keluar": langsung ke login tanpa modal.
  - Mulai shift lagi, logout lewat "Logout", lalu login `budi.leader`: toast "Masuk sebagai Kepala Toko", sidebar tampil, badge shift tidak tampil. Logout sidebar: langsung tanpa modal.
  - Tidak ada error di console sepanjang alur.
