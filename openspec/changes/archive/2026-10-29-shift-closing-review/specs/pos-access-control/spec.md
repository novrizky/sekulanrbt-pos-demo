## MODIFIED Requirements

### Requirement: Penjelasan hak akses
Panel "Hak akses" di Admin SHALL menjelaskan akses ketiga role sesuai perilaku sistem: Kasir, Kepala Toko, dan Administrator.

#### Scenario: Membuka panel Hak akses
- **WHEN** Administrator membuka tab "Hak akses"
- **THEN** panel menjelaskan bahwa:
  - Kasir hanya mengakses Kasir untuk transaksi penjualan, termasuk memproses order Open outletnya.
  - Kepala Toko mengakses Persediaan, Pesanan (hanya outletnya), Laporan, dan Admin terbatas (shift & pengguna, outlet), serta mengotorisasi tutup shift, memeriksa berita acara tutup shift outletnya, dan mengotorisasi pembatalan item order.
  - Administrator mengakses Persediaan, Pesanan, Laporan, dan seluruh Admin untuk semua outlet.
  
  Panel tidak lagi menyebut Kasir mengakses Persediaan, maupun Kepala Toko atau Administrator mengakses menu Kasir.
