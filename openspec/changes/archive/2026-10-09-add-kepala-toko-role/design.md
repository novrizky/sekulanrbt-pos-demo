# Design

## Context

Motivasi ada di proposal.md (bagian Why). Kondisi kode saat ini:

- `loginAs(role)` ([app.js:147](../../../app.js)) bersifat biner (`isAdmin = role==='admin'`). Nama, label profil, dan avatar di-hard-code untuk dua orang. Satu-satunya pembatasan akses adalah menyembunyikan menu Admin lewat `.role-hidden`.
- Handler `#loginForm` hanya mengecek apakah field kosong, lalu memanggil `loginAs(loginRole)`. Username yang diketik tidak dipakai.
- `loginAccounts` ([app.js:135](../../../app.js)) tidak menyimpan kata sandi. Peran "Leader" hanya ada di data: `budi.leader` ada, sedangkan Rina dan Taufik belum punya akun, dan Taufik juga tidak ada di `staffUsers`.
- Tutup shift dipasang dua kali. Yang efektif adalah handler `#closeShift` kedua ([app.js:103](../../../app.js)) beserta `document.addEventListener('click', …)` yang menangani `#submitBA` dan `#uploadFTP`. Handler `#closeShift` pertama di [app.js:27](../../../app.js) sudah mati. Judul "Tutup Shift 1" dan nama paket `…_SHIFT1_…` di-hard-code.
- Data shift (`shifts`) adalah array lokal di `renderAdmin()` yang menyimpan nama pendek kasir dan kepala toko sebagai teks.

## Goals / Non-Goals

**Goals:**
- Satu sumber kebenaran untuk identitas sesi dan hak akses per role, sehingga penambahan role berikutnya cukup dengan menambah entri data.
- Otorisasi tutup shift memakai aturan validasi kredensial yang sama dengan login.

**Non-Goals:**
- Tidak menyimpan kata sandi per akun. Semua akun demo memakai `demo123`.
- Tidak mengubah outlet aktif. Semua akun yang dipakai di POS tetap untuk Sekulan RBT 519A.
- Tidak merapikan duplikasi lain di app.js yang tidak terkait (`renderInventory`, `renderReports`, `openCancel`).

## Decisions

### 1. Objek `session` dan peta `ROLE_ACCESS`
Tambahkan state global `let session=null` yang berisi akun hasil login (`{username,name,role,outlet,shift}`), serta konstanta peta akses berdasarkan nama role di `loginAccounts`:

```
ROLE_ACCESS = {
  'Kasir':         {views:['pos','inventory'],                     admin:[],                  home:'pos'},
  'Kepala Toko':   {views:['pos','inventory','reports','admin'],   admin:['users','outlets'], home:'pos'},
  'Administrator': {views:['pos','inventory','reports','admin'],   admin:'all',               home:'admin'}
}
```

`loginAs(account)` dibangun ulang dengan alur berikut:
1. Set `session`.
2. Isi profil sidebar: nama, `"<role> • <shift>"` (atau `• Semua outlet` jika shift `-`), dan inisial avatar.
3. Toggle `.role-hidden` untuk setiap `.nav-item` dan setiap tombol `#adminTabs`.
4. Aktifkan view `home`. Untuk Administrator, panggil `switchAdminTab('users')`.

Alternatif yang ditolak adalah menambah cabang `if` untuk role ketiga di `loginAs`. Cara itu tetap rapuh dan menduplikasi logika tampil/sembunyi.

Role pada tombol `.role-switch` (`data-role`) hanya dipakai untuk auto-fill username. Role sesi diambil dari akun. Ini menjawab skenario "login `rina.leader` → Shift 2" walaupun tombol yang aktif adalah Kepala Toko dengan auto-fill Budi.

### 2. Satu fungsi verifikasi kredensial: `findAccount(username, password)`
Fungsi ini mengembalikan `{account}` atau `{error}`, dengan urutan pemeriksaan:
1. Username tidak ditemukan atau kata sandi bukan `demo123` → `'invalid'`.
2. Status bukan `Aktif` → `'inactive'`.

`findAccount` tetap mengembalikan akun pada error `'inactive'`. Login memakai fungsi ini apa adanya. Otorisasi tutup shift memeriksa dengan urutan:
1. `'invalid'` → "Kredensial Kepala Toko tidak valid".
2. Role bukan `Kepala Toko` → "Akun ini bukan Kepala Toko".
3. `'inactive'` → "Akun Kepala Toko tidak aktif".
4. `outlet` atau `shift` tidak sama dengan shift yang ditutup → "Hanya Kepala Toko Shift N (Nama) yang dapat menutup shift ini".

Pesan toast untuk setiap error mengikuti spec. Pemeriksaan role sengaja diletakkan sebelum pemeriksaan status, agar akun non-Kepala Toko yang nonaktif (misalnya `sari.kasir`) mendapat pesan "bukan Kepala Toko", bukan "Akun Kepala Toko tidak aktif".

### 3. Kepala Toko berwenang diambil dari `loginAccounts`
`shiftLeader(n)` adalah akun pertama dengan `role==='Kepala Toko'`, `outlet==='Sekulan RBT 519A'`, dan `shift==='Shift n'`. Nama ini dipakai di keterangan langkah otorisasi dan di kartu shift. Kartu shift di `renderAdmin` tidak lagi menyimpan teks "Leader: Budi S." sendiri, tetapi menampilkan `Kepala Toko: <nama pendek>` dari `shiftLeader`, dengan fallback `-` jika tidak ada. Dengan begitu, mengedit Master login langsung tercermin di kartu shift dan aturan otorisasi.

Alternatif yang ditolak adalah menyimpan kolom kepala toko di data shift. Cara itu menghasilkan dua sumber data yang bisa tidak sinkron, seperti yang sudah terjadi pada Rina.

### 4. Shift yang ditutup
`closingShift()` mengembalikan nomor shift dari `session.shift` (`'Shift 2'` → `2`). Jika nilainya `-` (Administrator), kembalikan `1`, yaitu shift berstatus "Aktif" di kartu shift. Judul modal, keterangan otorisasi, dan nama paket (`RBT_519A-S_20260921_SHIFT<n>_000088.zip`) memakai nilai ini.

### 5. Alur modal tutup shift sebagai tiga langkah lewat `openModal`
- **Langkah 1, otorisasi:** hanya tampil jika `!(session.role==='Kepala Toko' && session.shift==='Shift '+n)`. Isinya: keterangan shift dan Kepala Toko berwenang, input `#authUser`, input `#authPass` (type password), `[data-close]` "Batal", dan `#verifyLeader` "Verifikasi".
- **Langkah 2, BA:** modal tutup shift yang sudah ada, ditambah baris "Diperiksa oleh: <nama> (Kepala Toko)" dan teks checkbox baru.
- **Langkah 3, paket:** modal paket yang sudah ada, ditambah baris "Diperiksa oleh".

Pemeriksa yang terverifikasi disimpan di variabel `closingApprover` agar langkah 2 dan 3 bisa membacanya.

Handler langkah baru (`#verifyLeader`) dipasang dengan `.onclick =` setelah `openModal`, sesuai konvensi proyek. Delegasi `document.addEventListener('click', …)` yang sudah ada untuk `#submitBA` dan `#uploadFTP` dibiarkan, karena mengubahnya di luar kebutuhan. Hanya pesan toast dan isi modalnya yang diubah.

### 6. Pembersihan kode mati yang langsung terkait
Handler `#closeShift` pertama di [app.js:27](../../../app.js) dihapus karena selalu tertimpa dan memuat teks lama ("Tutup shift pagi"). Pembersihan lain di luar cakupan.

### 7. Rename istilah
Ganti string `'Leader'` menjadi `'Kepala Toko'` di data (`staffUsers`, `loginAccounts`), di dropdown `staffForm` dan `loginForm`, dan di status BA ("Menunggu leader" → "Menunggu kepala toko"). Di `index.html`, panel shift ("Kepala Toko wajib menyelesaikan berita acara…") dan panel Hak akses juga diperbarui. Kunci data `outlets[].leader` tidak diganti karena merupakan nama properti internal dan labelnya tetap "Penanggung jawab".

### 8. Logout
Logout mengosongkan `session` dan `closingApprover`, lalu mengembalikan field login ke akun dari role yang sedang dipilih. Visibilitas menu dihitung ulang pada login berikutnya, sehingga tidak ada sisa `.role-hidden` dari sesi sebelumnya.

## Risks / Trade-offs

- [Login kini menolak username sembarang, padahal sebelumnya apa pun diterima] → Tombol role tetap mengisi akun valid secara otomatis, jadi alur demo tidak berubah bagi pengguna yang tidak mengetik manual.
- [Administrator bisa mengubah atau menonaktifkan akun Kepala Toko di Master login, sehingga sebuah shift kehilangan pemeriksa yang berwenang] → Ini perilaku yang diharapkan. Otorisasi menampilkan `-` dan menolak dengan pesan yang jelas. Tidak ada mekanisme cadangan.
- [Akun dengan role Owner yang dibuat lewat Master login tidak ada di `ROLE_ACCESS`] → `findAccount` menolaknya di login dengan toast "Peran ini belum dapat masuk ke POS".
- [`$('.avatar')` memilih avatar pertama di DOM, yaitu avatar profil sidebar] → Gunakan selektor `.profile .avatar` agar tidak bergantung pada urutan DOM.
- [Delegasi `document.addEventListener` berbeda dari konvensi `.onclick`] → Sudah ada sebelumnya. Dibiarkan untuk meminimalkan perubahan dan dicatat di sini.
