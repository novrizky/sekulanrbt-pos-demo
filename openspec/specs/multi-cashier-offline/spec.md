# Kasir paralel dan ketahanan jaringan

## Requirement: Identitas Kasir dan terminal

- Setiap Kasir MUST login dengan akun pribadi yang terikat pada satu outlet dan terminal.
- PC utama dan tablet tambahan MUST dapat melayani pada shift dan outlet yang sama dengan akun berbeda.
- Setiap transaksi dan struk MUST memuat ID transaksi unik, outlet, shift, ID Kasir, ID terminal, waktu, dan metode pembayaran.
- Server outlet MUST menolak ID transaksi yang sudah pernah diterima agar pengiriman ulang tidak mencatat penjualan atau memotong stok dua kali.

### Scenario: Dua Kasir membayar bersamaan

- **WHEN** PC dan tablet mengonfirmasi pembayaran pada waktu yang hampir sama
- **THEN** kedua struk memiliki ID berbeda dan masing-masing transaksi tercatat tepat sekali pada Kasir dan terminal asalnya.

## Requirement: Kas, deposit, dan tutup shift per Kasir

- Modal awal, transaksi tunai, fee tunai, uang laci, deposit, dan selisih kas MUST dihitung per akun Kasir dan terminal.
- Kasir tablet yang menerima tunai MUST memiliki laci uang dan catatan setoran sendiri.
- Kepala Toko dan Administrator MUST dapat melihat rincian per Kasir/terminal serta total gabungan outlet per shift, hari, bulan, dan tahun sesuai hak akses.
- Tutup shift satu Kasir MUST NOT menutup sesi atau kas Kasir lain.

### Scenario: Kasir tablet menutup shift lebih awal

- **WHEN** Kasir tablet menutup shiftnya sementara PC utama masih melayani
- **THEN** laporan tablet hanya memuat transaksi dan kas miliknya, sedangkan Kasir PC tetap dapat bertransaksi.

## Requirement: Operasi saat internet provider putus

- Jika LAN/Wi-Fi outlet dan server lokal hidup, transaksi MUST tetap diproses oleh server lokal meskipun internet ke pusat terputus.
- Paket data outlet MUST mengantre sampai jalur ke pusat pulih dan kemudian dikirim ulang tanpa duplikasi.

### Scenario: Internet putus tetapi jaringan outlet hidup

- **WHEN** koneksi provider terputus dan kedua Kasir masih dapat menjangkau server lokal
- **THEN** PC dan tablet tetap bertransaksi dengan stok bersama dan kiriman pusat berstatus mengantre.

## Requirement: Operasi saat jaringan lokal atau server putus

- Jika mode offline perangkat diaktifkan, katalog dan data minimum yang diperlukan MUST tersedia secara lokal sebelum gangguan terjadi.
- Transaksi offline MUST tersimpan tahan tutup aplikasi/restart perangkat dengan ID global unik, identitas Kasir/terminal, waktu, item, harga, pembayaran, dan status **Belum sinkron**.
- Aplikasi MUST menampilkan jumlah transaksi belum sinkron dan MUST menjaga setiap transaksi sampai server mengakui penerimaannya.
- Sinkronisasi MUST idempoten: pengiriman ulang ID yang sama tidak boleh menduplikasi penjualan, stok, atau pembayaran.
- Konflik stok MUST muncul sebagai pengecualian untuk Kepala Toko dan MUST NOT diselesaikan dengan menimpa stok diam-diam.
- Transaksi QRIS, debit, atau kredit MUST dinyatakan berhasil hanya setelah ada konfirmasi dari penyedia pembayaran. Gangguan aplikasi tidak boleh mengubah pembayaran yang belum terkonfirmasi menjadi lunas.
- Jika mode offline belum tersedia atau penyimpanan lokal gagal, Kasir MUST diberi pesan jelas bahwa transaksi tidak dapat diselesaikan.

### Scenario: Tablet kehilangan Wi-Fi

- **WHEN** tablet kehilangan Wi-Fi saat PC masih terhubung ke server
- **THEN** PC tetap melayani; tablet menggunakan mode offline yang telah diaktifkan atau berhenti menerima transaksi sampai koneksi pulih.

### Scenario: Sinkronisasi setelah jaringan pulih

- **WHEN** tablet kembali terhubung setelah menyimpan transaksi offline
- **THEN** antrean dikirim dengan ID asli, status berubah menjadi **Tersinkron** hanya setelah pengakuan server, dan laporan outlet menghitungnya satu kali.

## Requirement: Tutupan harian outlet

- Paket tutupan harian MUST menggabungkan transaksi seluruh Kasir di outlet tepat sekali sambil mempertahankan rincian per Kasir dan terminal.
- Paket MUST menunjukkan jumlah transaksi yang masih belum sinkron. Status **Siap dikirim** hanya diberikan jika seluruh terminal sudah sinkron atau pengecualian disahkan Kepala Toko dan dicantumkan pada berita acara.

## Batas prototipe saat ini

Prototipe HTML/JavaScript yang tersedia belum memiliki basis data bersama, server outlet, antrean transaksi offline, atau sinkronisasi lintas perangkat. Requirement ini menjadi dasar implementasi dan uji penerimaan aplikasi produksi; tampilan demo tidak boleh dipakai sebagai bukti bahwa transaksi offline sudah aman.
