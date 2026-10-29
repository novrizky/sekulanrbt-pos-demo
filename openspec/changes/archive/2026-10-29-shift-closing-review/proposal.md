## Why

Saat ini Kasir melihat seluruh angka kas, termasuk "Seharusnya di laci" dan selisih, ketika menutup shift. Hitungan fisiknya jadi bisa terpengaruh angka sistem. Kepala Toko juga harus mengisi berita acara (BA) langsung di perangkat Kasir saat itu juga. Perubahan ini memisahkan tanggung jawab: Kasir hanya menghitung dan menyerahkan uang, Kepala Toko memvalidasi penutupan, lalu memeriksa ulang setiap tutup shift belakangan dengan detail lengkap.

## What Changes

**Modal tutup shift Kasir**
- From: rekap kas lengkap (modal awal, penjualan tunai, fee, seharusnya, selisih), field "Sisa uang di cash register", dan "Catatan khusus kasir" dengan penanda "(wajib)".
- To: hanya field "Uang di cash register" dan "Catatan (opsional)".
- Reason: Kasir tidak perlu dan tidak boleh melihat detail uang.
- Impact: perilaku Kasir berubah. Spec `shift-closing` berubah.

**Akhir alur tutup shift**
- From: otorisasi Kepala Toko, lalu form BA di perangkat Kasir, lalu shift ditutup.
- To: otorisasi Kepala Toko, lalu shift ditutup dan record tutup shift tersimpan dengan status "Belum Diperiksa", lalu modal "Verifikasi tutup shift berhasil" dengan tombol "Selesai".
- Reason: BA diisi belakangan oleh Kepala Toko, bukan di perangkat Kasir.
- Impact: form BA hilang dari alur Kasir.

**Panel "Berita acara tutup shift" (Admin › Shift & pengguna)**
- From: tabel statis (NO. BA, PERIODE, CANCEL, SELISIH / FEE, STATUS) dengan status "Menunggu kepala toko", "Dikirim owner", dan "Disetujui".
- To: daftar tutup shift dengan status "Belum Diperiksa" / "Sudah Diperiksa". Kepala Toko membuka "Periksa" ke **halaman detail tersendiri** (bukan modal) yang berisi rekap kas lengkap, catatan kasir, daftar transaksi, dan histori cancel, lalu menandai "Sudah Diperiksa" dengan catatan BA dan centang konfirmasi. Item setiap transaksi dan detail setiap pembatalan dibuka lewat tombol "Detail" dalam modal, tidak ditulis dalam satu baris tabel. Kedua tabel memiliki paging contoh ("Halaman 1 dari N"). Administrator hanya bisa melihat.
- Reason: tempat Kepala Toko memverifikasi ulang data tutup shift. Datanya terlalu banyak untuk satu modal.
- Impact: metrik "BA menunggu owner" menjadi "BA belum diperiksa", dan teks pembantu di tab ini serta panel Hak akses diperbarui.

**Data contoh baru**
- Daftar transaksi per shift (sekitar 8 baris) untuk detail pemeriksaan, ditampilkan sebagai "Menampilkan 8 dari 87 transaksi". Setiap transaksi menyimpan item beserta qty, dan harganya diambil dari menu.

## Capabilities

### New Capabilities
- `shift-closing-review`: daftar tutup shift di panel BA, status Belum/Sudah Diperiksa, detail pemeriksaan (kas, catatan, transaksi, cancel), dan penandaan oleh Kepala Toko.

### Modified Capabilities
- `shift-closing`:
  - Rekap kas Kasir disederhanakan.
  - Otorisasi berakhir di modal sukses, bukan di form BA.
  - Requirement BA, selisih kas langsung, dan catatan wajib dihapus dari alur Kasir (BA dan selisih pindah ke `shift-closing-review`).
  - Sesi berakhir lewat modal sukses.
- `pos-access-control`: penjelasan hak akses Kepala Toko menyebut pemeriksaan berita acara tutup shift.

## Impact

- **Aplikasi yang terdampak:** hanya POS (`index.html`, `app.js`, `styles.css`). Pusat Data Outlet (`outlet-data.html`) tidak tersentuh.
- **`index.html`:**
  - Metrik dan teks di tab Shift & pengguna (sekitar baris 163–171).
  - Teks panel Hak akses (baris 175).
  - View baru `section#closingReview` untuk halaman detail, tanpa menu sidebar.
- **`styles.css`:** satu aturan `.req-modal .data-table{min-width:600px}` (juga dipakai modal PO).
- **`app.js`:**
  - `closeShiftRecap()` disederhanakan.
  - `closeShiftBA()` dihapus.
  - Handler `#verifyLeader` di `closeShiftAuth()` diarahkan ke penyimpanan record dan modal sukses.
  - `renderClosings()` merender tabel dari data baru.
  - Data baru: `shiftClosings`, `shiftTransactions`, dan helper `menuPrice()`.
  - Halaman pemeriksaan `openClosingReview()`, serta modal detail transaksi dan pembatalan.
- **Tutup shift dan paket data:** perilaku penutupan dari sisi POS tetap sama (sesi berakhir, `openShift` dikosongkan). Tidak ada perubahan pada paket ZIP maupun sisi hub.
- **Di luar cakupan:**
  - Menu sidebar baru (halaman detail dibuka dari panel BA).
  - Alur persetujuan atau pengiriman ke owner.
  - Pencatatan transaksi nyata dari keranjang.
  - Pembatasan pemeriksaan per shift Kepala Toko.
  - Backend dan persistensi lintas reload.
