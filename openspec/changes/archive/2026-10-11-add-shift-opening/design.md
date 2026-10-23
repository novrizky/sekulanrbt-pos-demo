# Design

## Context

Login POS ditangani `$('#loginForm').onsubmit` → `loginAs(account)` di `app.js`. `loginAs` (satu-satunya definisi) menutup `#loginScreen`, menghapus `body.auth-locked`, mengisi profil sidebar, memfilter menu berdasarkan `ROLE_ACCESS`, mengaktifkan view `home`, lalu menampilkan toast "Masuk sebagai <role>". Logout ditangani `$('#logoutButton').onclick` (satu-satunya penugasan, di bagian akhir `app.js`). Handler ini membuka kembali `#loginScreen` dan me-reset `session` dan `closingApprover`.

`#loginScreen` adalah overlay layar penuh (`.login-screen`, `position:fixed; inset:0; z-index:100`), dengan panel hijau `.login-visual` di kiri dan `.login-card` di kanan. Toast POS berada di z-index 110, jadi tetap terlihat di atas overlay. Jam shift saat ini hanya ada di array lokal `shifts` di dalam fungsi render Admin (baris ~91) dan di `<option>` filter laporan, sehingga tidak bisa dipakai ulang dari luar.

Aplikasi ini demo untuk stakeholder. Fokusnya tampilan dan alur, bukan integritas data.

## Goals / Non-Goals

**Goals:**
- Kasir melewati layar Mulai Shift layar penuh setelah login, dengan tampilan yang konsisten dengan layar login.
- Modal awal yang diisi muncul kembali di header view Kasir.

**Non-Goals:**
- Kembalian, saldo laci, dan selisih kas.
- Verifikasi kata sandi Kepala Toko yang sebenarnya.
- Menyimpan status shift antar login atau refresh.
- Perubahan di Pusat Data atau paket ZIP.
- Perubahan alur tutup shift dan berita acara (`closeShiftBA`, `#closeShift`). Ini akan dibahas di change terpisah.

## Decisions

### Decision 1: Overlay statis di `index.html` yang memakai ulang gaya layar login

Tambahkan `<div class="login-screen shift-screen closed" id="shiftScreen">` tepat setelah `#loginScreen`. Elemen ini memakai ulang `.login-screen`, `.login-visual`, dan `.login-card`, jadi posisi, z-index 100, transisi `.closed`, dan responsivitasnya ikut dari layar login. Panel kiri berjudul misalnya "Siapkan shift sebelum melayani." Kartu kanan (`.login-card` + modifier `.opening-card`) berisi:

- blok identitas read-only;
- `<input id="openingCash" type="number" min="0" placeholder="0">`;
- tiga `.check-row` checklist kesiapan;
- tombol `#shiftLogout` ("Keluar") dan `#startShift` ("Mulai shift"). Kartu ini hanya memuat isian Kasir. Bagian verifikasi Kepala Toko tidak ada di markup statis (lihat Decision 7).

Isi dinamis (identitas) diisi lewat `innerHTML`/`textContent` saat layar dibuka. Alternatif yang ditolak adalah memakai `openModal()`. Modal hanya menutupi view sebagai popup, sementara yang diminta adalah langkah layar penuh yang mengunci seluruh POS. Lagi pula, klik di backdrop modal akan menutupnya.

`styles.css` hanya menambah gaya kecil untuk `.opening-card` (bukan `.shift-card`, karena nama itu sudah dipakai kartu shift di Admin dengan `display:grid`): lebar sekitar 460px, `max-height` dengan `overflow:auto` karena isinya lebih panjang dari form login, blok identitas, dan kotak serah terima. Juga ditambah `.shift-badge` untuk penanda di header. Komponen baru selain itu tidak diperlukan.

### Decision 2: State shift sebagai satu global, di-reset saat login dan logout

Tambahkan `let openingCash=null,openingNote='';` di samping `let session=null,closingApprover=null;`. `openingNote` disimpan untuk dipakai change tutup shift nanti. Nilai `null` berarti belum ada shift yang dimulai pada sesi ini. Variabel di-reset di `loginAs` dan di `#logoutButton`. Karena reload me-reset semua state, aturan "refresh mengulang alur" terpenuhi tanpa kode tambahan.

### Decision 3: Hook di `loginAs`, bukan di handler form login

Di akhir `loginAs` ditambahkan: `if(account.role==='Kasir')openShiftScreen(account);`. `openShiftScreen(account)` mengisi layar, mengosongkan isian (`openingCash`, centang, sandi), dan menghapus class `closed` dari `#shiftScreen`. Toast "Masuk sebagai Kasir" tetap tampil di atas overlay. Kepala Toko dan Administrator tidak tersentuh.

### Decision 4: Handler tombol

- `#startShift.onclick=openVerifyModal`: tidak ada validasi di layar Kasir. Checklist tidak dibaca.
- `#shiftLogout.onclick=()=>$('#logoutButton').onclick()`: memakai ulang logout yang sudah ada. `#logoutButton.onclick` ditambah dua hal, yaitu menutup `#shiftScreen` (menambahkan `closed`) dan menyembunyikan `#shiftBadge`.

### Decision 5: Data contoh sebagai konstanta baru

- `SHIFT_HOURS={1:'06.00–14.00',2:'14.00–22.00',3:'22.00–06.00'}` dipakai untuk identitas shift. Array `shifts` yang lokal di render Admin tidak disentuh, karena di luar cakupan.
- `HANDOVER_NOTES`, dengan key nomor shift penerima, berisi `{from, note, cash}` dari kasir shift sebelumnya (`n===1?3:n-1`). Nama kasir mengikuti data contoh di render Admin (Shift 1 Ayu Setiani, Shift 2 Dimas A., Shift 3 Sari W.). Isinya hanya catatan kejadian dan sisa uang di cash register, tanpa informasi stok. Contoh untuk Shift 1: from "Dari Shift 3 • Sari W.", note "Printer struk sempat macet pukul 03.10, sudah normal kembali.", cash 450000, yang ditampilkan sebagai "Sisa uang di cash register: Rp450.000" lewat `rupiah`.
- Tanggal "Minggu, 20 September 2026" mengikuti eyebrow view Kasir.

### Decision 6: Penanda shift di header view Kasir

Di `index.html`, `<span class="shift-badge hidden" id="shiftBadge"></span>` ditambahkan di bawah `<h1>Selamat pagi, Ayu</h1>` pada `.topbar` view Kasir. Class `hidden` sudah dipakai di app (`#clearSearch`). Penanda ini hanya tampil setelah Kasir memulai shift.

### Decision 7: Verifikasi Kepala Toko sebagai modal terpisah

Verifikasi memakai `openModal(html)`/`closeModal()` yang sudah ada, supaya tampilannya jelas berbeda dari layar isian Kasir dan mudah dibaca sebagai langkah milik Kepala Toko. `openVerifyModal()` menghitung `cash=Math.max(0,+$('#openingCash').value||0)` dan `prev=HANDOVER_NOTES[n].cash`, lalu merender:

- judul "Verifikasi Kepala Toko" dan `.approver-row` "Kepala Toko: <nama>" dari `shiftLeader(n)`;
- `.ba-summary` berisi Kasir, Modal awal kas, Sisa uang shift sebelumnya, dan Selisih;
- `.handover-box` catatan serah terima (`HANDOVER_NOTES[n]`: pengirim, catatan, "Sisa uang di cash register") dan `.check-row` `#handoverRead` "Saya sudah membaca catatan serah terima";
- `<p class="cash-warning">` berisi `Modal awal ${rupiah(cash)} berbeda dari sisa uang shift sebelumnya ${rupiah(prev)} (selisih ${rupiah(Math.abs(cash-prev))}).`, hanya jika `cash!==prev`;
- field kata sandi `#openingLeaderPass`, textarea `#openingNote` "Catatan Kepala Toko", serta tombol "Batal" (`data-close`) dan `#verifyStart` "Verifikasi & mulai shift".

`#verifyStart.onclick`: jika `#handoverRead` belum dicentang, jalankan `return showToast('Konfirmasi catatan serah terima terlebih dahulu')`. Lalu, jika `cash!==prev` dan `#openingNote` kosong (di-trim), jalankan `return showToast('Catatan Kepala Toko wajib diisi karena modal awal berbeda')`. Jika lolos, set `openingCash`/`openingNote`, panggil `closeModal()`, tutup `#shiftScreen`, tampilkan `#shiftBadge`, dan tampilkan toast `Shift ${n} dimulai. Modal awal ${rupiah(openingCash)}`.

Peringatan selisih dihitung sekali saat modal dibuka, tidak live saat Kasir mengetik, karena layar Kasir tidak lagi memuat bagian verifikasi. Fungsi `cashDiff` dan `#openingCash.oninput` dihapus. `.modal-backdrop` dinaikkan dari z-index 20 ke 105, supaya modal tampil di atas `#shiftScreen` (100) dan tetap di bawah toast (110). Modal lain tidak pernah dibuka saat layar login tampil, jadi kenaikan ini aman. Klik di backdrop atau "Batal" hanya menutup modal, dan isian Kasir tetap utuh. Karena isi modal ini cukup panjang, `.modal` diberi `max-height:calc(100vh - 40px);overflow:auto` agar tidak terpotong di layar pendek. Ini berlaku juga untuk modal lain.

## Risks / Trade-offs

- Toast "Masuk sebagai Kasir" dan layar Mulai Shift tampil bersamaan. Hal ini disengaja dan tidak mengganggu, karena toast berada di atas overlay.
- `openingCash` disimpan tetapi belum dipakai di luar penanda header. Change tutup shift nanti dapat membacanya.
