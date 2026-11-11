# Rekomendasi perangkat Sekulan RBT POS

Tanggal: 5 November 2026  
Status: rancangan kebutuhan pengadaan, untuk diuji kembali pada aplikasi produksi.

## Lingkup dan asumsi

Aplikasi yang ada di folder ini adalah prototipe web yang dijalankan melalui browser. Rekomendasi berikut disusun untuk satu terminal Kasir utama dan satu tablet Kasir tambahan yang dapat bekerja bersamaan di outlet yang sama, satu perangkat Kepala Toko, dan perangkat Administrator yang dapat menangani beberapa outlet. Angka RAM, prosesor, dan penyimpanan di bawah adalah rekomendasi operasional, bukan hasil uji beban prototipe. Jumlah terminal dan kapasitas server perlu ditetapkan setelah rancangan aplikasi produksi serta volume transaksi diketahui.

## Spesifikasi perangkat per peran

| Peran | Perangkat utama | Batas pengadaan | Dianjurkan | Layar dan penggunaan |
| --- | --- | --- | --- | --- |
| Kasir POS | PC all-in-one POS, mini PC, atau PC desktop | Prosesor Intel N100/setara, RAM 8 GB, SSD 256 GB, Windows 11 yang didukung | Intel Core i3 generasi modern/Ryzen 3 setara atau lebih baik, RAM 8–16 GB, SSD 256–512 GB, LAN Gigabit, minimal 3 port USB | Layar sentuh 15 inci atau monitor 15–22 inci; resolusi minimal 1366 × 768, dianjurkan 1920 × 1080. Gunakan keyboard dan mouse bila layar bukan layar sentuh. |
| Kasir tambahan | Tablet Android | Layar 10–11 inci, RAM 6 GB, penyimpanan 128 GB, Wi-Fi 5 GHz | Layar 11 inci, RAM 8 GB, penyimpanan 128 GB atau lebih, Wi-Fi dan koneksi seluler cadangan | Akun Kasir berbeda pada outlet yang sama; printer struk 58 mm, scanner, dan tempat penyimpanan uang terpisah. Uji cetak dan pemindaian pada unit pilihan. |
| Kepala Toko | Laptop/PC; tablet untuk pemeriksaan dan persetujuan | Prosesor kelas Core i3/Ryzen 3/setara, RAM 8 GB, SSD 256 GB pada PC; tablet RAM 6 GB dan penyimpanan 128 GB | Laptop Core i5/Ryzen 5 setara, RAM 16 GB, SSD 512 GB; atau tablet 10–11 inci, RAM 8 GB, penyimpanan 128 GB | Layar laptop 14 inci ke atas atau tablet 10–11 inci. Keyboard tambahan membantu saat mengisi berita acara, stok opname, dan laporan. |
| Administrator | Laptop/PC kantor | Prosesor kelas Core i3/Ryzen 3/setara, RAM 8 GB, SSD 256 GB | Core i5/Ryzen 5 setara atau lebih baik, RAM 16 GB, SSD 512 GB, monitor 22–24 inci Full HD, LAN Gigabit | PC/laptop lebih sesuai untuk tabel lintas outlet, master data, ekspor CSV/Excel, dan pengaturan sumber data. Tablet hanya sebagai perangkat pendamping. |

Untuk pembelian perangkat Windows baru, pilih unit yang secara resmi memenuhi syarat Windows 11, termasuk TPM 2.0 dan Secure Boot. Persyaratan minimum Windows 11 dari Microsoft adalah CPU dua inti 1 GHz, RAM 4 GB, dan penyimpanan 64 GB; angka tersebut adalah syarat sistem operasi, bukan rekomendasi untuk terminal POS yang digunakan setiap hari.

## Perangkat pendukung Kasir

| Komponen | Kebutuhan yang dianjurkan |
| --- | --- |
| Printer struk | Printer thermal roll **58 mm** dengan driver Windows dan sambungan USB atau Ethernet. Uji hasil cetak logo, barcode, panjang struk, dan pemotongan kertas pada model yang akan dibeli. |
| Pemindai barcode | Scanner USB mode keyboard (HID); pilih 1D/2D agar dapat membaca barcode produk dan QR bila diperlukan. |
| Laci uang | Cash drawer yang kompatibel dengan printer POS, atau laci manual bila belum ada integrasi pembuka otomatis. |
| Jaringan | LAN kabel untuk terminal tetap; internet outlet yang stabil serta jalur cadangan seluler untuk pengiriman data dan pemulihan gangguan. |
| Daya | UPS sekitar 650–850 VA untuk PC, printer, dan perangkat jaringan; kapasitas akhir dihitung dari konsumsi listrik perangkat yang dipilih. |
| Pembayaran | EDC debit/kredit dan QRIS mengikuti penyedia pembayaran. Integrasi otomatis dengan aplikasi perlu spesifikasi terpisah; pada prototipe metode pembayaran dipilih oleh Kasir. |

## Tablet: batas penggunaan

- Tablet cocok bagi Kepala Toko untuk memeriksa tutup shift, pesanan, stok opname, dan laporan. Pilih layar minimal 10 inci, RAM 6 GB (8 GB dianjurkan), penyimpanan 128 GB, Wi-Fi stabil, serta versi Android/iPadOS yang masih mendapat pembaruan keamanan dari produsennya.
- Tablet Kasir tambahan perlu uji perangkat nyata lebih dulu: sambungan printer 58 mm, scanner barcode, laci uang, dan dialog cetak browser dapat berbeda antar tablet dan browser. Tablet dioperasikan dengan akun Kasir yang berbeda dari PC utama.
- Administrator sebaiknya memakai PC/laptop karena tabel dan formulir lintas outlet memerlukan ruang layar dan input teks yang lebih besar.

## Kebutuhan aplikasi dan jaringan sebelum operasional

1. Jalankan aplikasi produksi melalui alamat HTTPS yang tetap; jangan menjadikan file `index.html` lokal atau data demo browser sebagai penyimpanan transaksi operasional.
2. Pastikan data outlet disimpan pada basis data produksi, dengan pencadangan otomatis dan prosedur pemulihan yang diuji.
3. Jika kiriman outlet ke pusat memakai folder FTP, sediakan proses pengirim dan penerima di sisi server/agen lokal, penamaan paket yang unik, pemeriksaan kelengkapan, antrean kirim ulang, serta riwayat impor. Browser saja tidak cukup untuk menjamin pengiriman otomatis ketika aplikasi ditutup atau jaringan terputus.
4. Batasi akses per peran: Kasir pada outletnya, Kepala Toko pada outletnya, dan Administrator sesuai wewenang lintas outlet. Akun demo dan kata sandi demo pada prototipe harus diganti sebelum dipakai operasional.
5. Lakukan uji penerimaan pada perangkat yang dibeli: login, transaksi dan barcode, cetak struk 58 mm, tutup shift, ekspor laporan, stok opname, serta pengiriman dan pemrosesan paket outlet.

## Syarat dua Kasir bekerja bersamaan

1. **Identitas terpisah.** PC utama dan tablet memakai akun Kasir berbeda, tetapi keduanya terikat pada outlet yang sama. Setiap transaksi menyimpan ID Kasir, ID perangkat/terminal, shift, waktu, dan nomor transaksi yang unik.
2. **Data transaksi dan stok bersama.** Kedua perangkat membaca dan menyimpan ke basis data outlet yang sama. Stok dikurangi satu kali secara atomik pada saat transaksi berhasil; pembatalan dan transaksi Free juga dicatat dengan identitas Kasir dan terminal. Perubahan dari satu perangkat harus tampak pada perangkat lain tanpa impor manual.
3. **Kas dan tutup shift terpisah.** Bila kedua Kasir menerima tunai, masing-masing perlu laci uang, modal awal, uang fisik, deposit, dan rekap tutup shift sendiri. Kepala Toko dapat melihat rekap per Kasir serta gabungan outlet/shift. Jika tablet hanya menerima pembayaran nontunai, aturan tersebut harus ditetapkan pada hak akses terminal.
4. **Periferal terpisah.** Masing-masing terminal memilih printer dan scanner miliknya. Nomor struk harus tetap unik meskipun kedua Kasir menekan Bayar pada waktu yang sama. Uji cetak ulang serta kegagalan printer pada kedua terminal.
5. **Gangguan jaringan.** Kasir tetap dapat bertransaksi saat internet provider putus selama PC/tablet masih dapat mengakses server lokal outlet melalui LAN/Wi-Fi lokal. Jika Wi-Fi atau server lokal ikut putus, perangkat hanya boleh bertransaksi melalui mode offline yang menyimpan transaksi secara aman di perangkat, menampilkan antrean belum tersinkron, dan mengirim ulang saat koneksi pulih. Mode ini perlu dibuat dan diuji pada aplikasi produksi; prototipe saat ini belum menyediakannya.
6. **Pengiriman ke pusat.** Paket penutupan harian outlet menggabungkan transaksi kedua Kasir sekali saja, namun rincian laporan tetap dapat difilter per Kasir dan terminal. Pengiriman FTP ke pusat dilakukan dari layanan outlet, bukan masing-masing tablet.

Prototipe web yang tersedia saat ini belum menyediakan jaminan sinkronisasi transaksi PC dan tablet secara langsung. Syarat di atas adalah kebutuhan aplikasi produksi sebelum dua Kasir melayani transaksi bersamaan.

## Kelanjutan pelayanan saat jaringan terganggu

| Kondisi | Kasir PC | Kasir tablet | Catatan |
| --- | --- | --- | --- |
| Internet provider putus; LAN dan Wi-Fi outlet hidup | Terus bertransaksi ke server lokal | Terus bertransaksi ke server lokal | Data pusat menunggu antrean pengiriman; pembayaran QRIS/EDC tetap bergantung pada layanan penyedia pembayaran. |
| Wi-Fi outlet putus; LAN PC dan server lokal hidup | Terus bertransaksi | Gunakan koneksi cadangan yang dapat menjangkau server, atau mode offline perangkat | Hotspot seluler tidak otomatis dapat mengakses server lokal outlet. |
| Server lokal atau seluruh jaringan outlet putus | Mode offline PC jika sudah dibuat | Mode offline tablet jika sudah dibuat | Transaksi disimpan pada masing-masing perangkat dan belum menjadi stok bersama sampai sinkronisasi berhasil. |

Pada mode offline, struk diberi **ID unik per transaksi** serta penanda **Belum sinkron**; transaksi yang sudah tersimpan lokal tidak boleh dikirim dua kali. Saat jaringan pulih, aplikasi mengirim berdasarkan ID tersebut, menerima konfirmasi server, lalu mengubah status menjadi **Tersinkron**. Selisih stok akibat dua Kasir menjual item terakhir secara bersamaan harus masuk daftar pengecualian untuk diperiksa Kepala Toko; aplikasi tidak boleh diam-diam menimpa jumlah stok.

Modal awal, uang laci, setoran, dan tutup shift tetap terpisah menurut akun Kasir dan terminal. Tutup shift atau paket harian outlet baru boleh dinyatakan lengkap setelah antrean transaksi tiap terminal kosong, atau selisih yang belum tersinkron dinyatakan secara jelas dalam laporan. Untuk QRIS, debit, dan kredit, keberhasilan pembayaran harus mengikuti bukti dari penyedia pembayaran; status jaringan aplikasi sendiri tidak membuktikan pembayaran berhasil.

## Rekomendasi pengadaan singkat

Untuk satu outlet, mulai dengan **satu PC POS Kasir (RAM 8–16 GB, SSD 256 GB, Windows 11), satu tablet Kasir tambahan, dua printer thermal 58 mm, dua scanner barcode, UPS, dan jaringan outlet yang stabil**. Sediakan laci uang kedua bila tablet menerima pembayaran tunai. Kepala Toko dapat memakai laptop RAM 16 GB atau tablet 10–11 inci sebagai perangkat pemeriksaan. Administrator memakai laptop/PC RAM 16 GB dengan monitor Full HD. Pilih merek dan model setelah uji langsung terhadap struk, scanner, dan alur kerja aplikasi produksi.

## Rujukan teknis

- Microsoft, Windows 11 requirements: https://learn.microsoft.com/en-us/windows/whats-new/windows-11-requirements
- Google, Chrome browser system requirements: https://support.google.com/chrome/a/answer/7100626
- Epson, contoh spesifikasi printer POS yang mendukung kertas 58 mm serta sambungan USB/Ethernet: https://epson.com/For-Work/Point-of-Sale/POS-Printers/OmniLink-TM-T88VI-i-Intelligent-Thermal-Receipt-Printer/p/C31CE94731
- Spesifikasi cetak struk dalam proyek ini: `openspec/specs/kasir-receipt-print/spec.md`.
