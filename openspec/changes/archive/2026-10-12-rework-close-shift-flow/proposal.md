# Proposal

## Why

Tutup shift saat ini langsung meminta kredensial Kepala Toko, tanpa langkah bagi Kasir untuk menghitung uang di laci dan mempertanggungjawabkan selisihnya. Selisih kas adalah tanggung jawab Kasir: lebih berarti ada transaksi yang tidak diinput di POS, kurang bisa karena lupa input fee driver, kembalian berlebih, atau salah input menu. Selain itu, arah aplikasi sudah berubah menjadi aplikasi cloud, sehingga langkah membuat dan mengirim paket data ZIP via SFTP di akhir tutup shift tidak relevan lagi.

## What Changes

- Aplikasi terdampak: **POS outlet** saja (`app.js`, kemungkinan `styles.css`). Pusat Data Outlet (`outlet-data.html`) tidak disentuh.
- **Langkah baru "Rekap kas"** sebagai langkah pertama tutup shift, sebelum otorisasi Kepala Toko:
  - Kasir mengisi sisa uang di cash register dan catatan khusus.
  - Tampilan perbandingan: modal awal + penjualan tunai − fee driver tunai = seharusnya di laci, dibandingkan dengan uang fisik yang diinput, beserta selisihnya.
  - Selisih dihitung langsung saat mengetik dan diberi label "Lebih" (plus), "Kurang" (minus), atau "Sesuai" (nol).
  - Saat ada selisih, label catatan kasir menjadi "(wajib)", tetapi tidak ada validasi yang menahan Kasir untuk lanjut.
  - Penjualan tunai dan fee driver tunai memakai angka contoh hard-coded per shift; modal awal diambil dari isian saat Mulai Shift.
- **Form BA** menampilkan ringkasan kas (seharusnya di laci, uang fisik, selisih) dan catatan kasir, sehingga Kepala Toko melihat selisih sebelum menyetujui.
- **BREAKING (alur demo):** langkah "Paket data siap dikirim" dan unggah ke pusat dihapus. Tombol akhir form BA menjadi "Tutup shift"; setelah BA lengkap, muncul toast "Shift <n> berhasil ditutup", sesi Kasir berakhir, dan layar login tampil kembali.
- Teks form BA tidak lagi menyebut paket data maupun SFTP.

**Di luar cakupan:**
- Pusat Data Outlet (`outlet-data.html`) yang masih memakai konsep paket ZIP/SFTP; dibahas di change terpisah. Karena POS tidak lagi menghasilkan paket, hub untuk sementara tidak punya padanan di POS.
- Pembaruan `CLAUDE.md` dan `openspec/config.yaml` yang masih menjelaskan paket data/SFTP.
- Pencatatan penjualan tunai yang sebenarnya dari transaksi POS, dan meneruskan sisa uang sebagai modal shift berikutnya.
- Backend, persistensi, atau integrasi cloud nyata.

## Capabilities

### New Capabilities

(tidak ada)

### Modified Capabilities

- `shift-closing`: tutup shift diawali langkah rekap kas Kasir; otorisasi Kepala Toko menjadi langkah kedua; form BA menampilkan ringkasan kas dan diakhiri dengan menutup shift serta mengakhiri sesi; requirement paket data dihapus.

## Impact

- `app.js`: `closeShiftAuth()`, `closeShiftBA()`, handler `#closeShift`, handler `#submitBA`/`#uploadFTP` di `document.addEventListener('click', …)`, dan reset sesi di `#logoutButton`.
- `styles.css`: kemungkinan satu-dua kelas untuk warna selisih, bila kelas yang ada (`.ok`, `.low`, `.ba-summary`, `.cash-warning`) belum cukup.
- Data contoh baru: angka penjualan tunai dan fee driver tunai per shift.
