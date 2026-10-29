## MODIFIED Requirements

### Requirement: Titik masuk produksi di LPP barang dagangan
Di submenu "Stok barang dagangan", Kepala Toko dan Administrator SHALL membuka modal produksi melalui tombol "+ Hasil produksi" di panel stok. Tombol header "− Keluarkan untuk produksi" MUST NOT ada. Di submenu "Stok bahan baku", tombol yang sama SHALL berlabel "+ Stok masuk" dan membuka form stok masuk seperti sebelumnya. Tombol "⇄ Transfer antar toko" SHALL berada di submenu "Mutasi stok", bukan di header halaman stok.

#### Scenario: Membuka modal dari tab barang dagangan
- **WHEN** Administrator membuka submenu "Stok barang dagangan", lalu menekan "+ Hasil produksi"
- **THEN** modal "Catat hasil produksi" terbuka dan toast "Gunakan proses produksi untuk menambah barang dagangan" tidak tampil

#### Scenario: Tombol header sudah dihapus
- **WHEN** Kepala Toko membuka submenu "Stok barang dagangan" atau "Stok bahan baku"
- **THEN** tidak ada tombol "− Keluarkan untuk produksi" maupun "⇄ Transfer antar toko" di halaman itu

#### Scenario: Tab bahan baku tidak berubah
- **WHEN** Administrator membuka submenu "Stok bahan baku" lalu menekan "+ Stok masuk"
- **THEN** modal "Stok bahan baku masuk" terbuka

### Requirement: Riwayat mutasi stok
Submenu "Mutasi stok" SHALL menampilkan panel berjudul "Riwayat mutasi stok" dengan subjudul "Transfer, produksi, dan penjualan terbaru". Setiap produksi yang berhasil SHALL ditambahkan di urutan teratas dengan ikon ⚒, kode PRD berurutan (dimulai dari PRD-0920-012), rincian bahan, keterangan "Menjadi <jumlah> <nama hasil>", dan jam pencatatan. Entri contoh yang sudah ada SHALL tetap tampil di bawahnya. Panel ini MUST NOT tampil di submenu Persediaan lainnya.

#### Scenario: Produksi muncul di riwayat
- **WHEN** produksi Beras 8 kg + Ayam 12 kg menjadi 40 Paket Favorit 25K berhasil dicatat pada pukul 10.15, lalu pengguna membuka submenu "Mutasi stok"
- **THEN** entri teratas riwayat berbunyi "PRD-0920-012", "Beras 8 kg + Ayam 12 kg · Menjadi 40 Paket Favorit 25K", "10.15", dan entri berikutnya adalah "TAT-0920-003"

#### Scenario: Kode produksi berurutan
- **WHEN** produksi kedua berhasil dicatat pada sesi yang sama
- **THEN** entri teratas riwayat berkode "PRD-0920-013"

### Requirement: Tabel riwayat produksi
Submenu "Stok barang dagangan" SHALL menampilkan panel "Riwayat produksi" di bawah tabel stok. Panel ini MUST NOT tampil di submenu Persediaan lainnya. Panel ini SHALL memuat tabel berkolom KODE, WAKTU, HASIL, JUMLAH, BAHAN BAKU, TOTAL BIAYA, HPP / UNIT, dan DICATAT OLEH, berisi produksi dari yang terbaru. Setiap produksi yang berhasil dicatat Kepala Toko atau Administrator SHALL langsung masuk di baris teratas.

#### Scenario: Panel hanya di tab barang dagangan
- **WHEN** Administrator membuka submenu "Stok bahan baku", lalu berpindah ke submenu "Stok barang dagangan"
- **THEN** panel "Riwayat produksi" tidak tampil di Stok bahan baku dan tampil di Stok barang dagangan

#### Scenario: Data contoh awal
- **WHEN** Administrator membuka submenu "Stok barang dagangan" setelah halaman dimuat
- **THEN** tabel menampilkan 3 baris PRD-0920-011, PRD-0920-010, dan PRD-0920-009, dan baris teratas berisi "PRD-0920-011", "20 Sep 2026 09.05", "Paket Favorit 25K", "86 porsi", "Beras 8 kg + Ayam 12 kg", "Rp572.000", "Rp6.651", "Budi Santoso"

#### Scenario: Produksi baru masuk ke tabel
- **WHEN** Raka Administrator mencatat produksi Beras 8 kg + Ayam 12 kg menjadi 40 Paket Favorit 25K
- **THEN** baris teratas tabel berisi "PRD-0920-012", waktu "20 Sep 2026 <jam>", "Paket Favorit 25K", "40 porsi", "Beras 8 kg + Ayam 12 kg", "Rp572.000", "Rp14.300", "Raka Administrator", dan tabel menjadi 4 baris
