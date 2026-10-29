# stock-production Specification

## Purpose

TBD - created by archiving change production-multi-material. Update Purpose after archive.

## Requirements

### Requirement: Titik masuk produksi di LPP barang dagangan
Di view Persediaan, Kepala Toko dan Administrator SHALL membuka modal produksi melalui tombol "+ Hasil produksi" di panel stok saat tab "LPP barang dagangan" aktif. Tombol header "− Keluarkan untuk produksi" MUST NOT ada lagi. Saat tab "LPP bahan baku" aktif, tombol yang sama SHALL tetap berlabel "+ Stok masuk" dan membuka form stok masuk seperti sebelumnya.

#### Scenario: Membuka modal dari tab barang dagangan
- **WHEN** Administrator membuka Persediaan, memilih tab "LPP barang dagangan", lalu menekan "+ Hasil produksi"
- **THEN** modal "Catat hasil produksi" terbuka dan toast "Gunakan proses produksi untuk menambah barang dagangan" tidak tampil

#### Scenario: Tombol header sudah dihapus
- **WHEN** Kepala Toko membuka view Persediaan
- **THEN** header hanya menampilkan tombol "⇄ Transfer antar toko" dan tidak ada tombol "− Keluarkan untuk produksi"

#### Scenario: Tab bahan baku tidak berubah
- **WHEN** Administrator memilih tab "LPP bahan baku" lalu menekan "+ Stok masuk"
- **THEN** modal "Stok bahan baku masuk" terbuka

### Requirement: Modal produksi dengan banyak bahan baku
Modal "Catat hasil produksi" SHALL tampil lebar (±760px). Modal ini SHALL memuat pilihan satu barang dagangan hasil dan jumlah hasil, serta tabel bahan baku berkolom BAHAN BAKU, STOK, QTY DIPAKAI, dan BIAYA yang setiap barisnya bisa dihapus. Tombol "+ Tambah bahan" SHALL menambah baris berisi bahan baku yang belum dipakai di baris lain. Ringkasan SHALL menampilkan total biaya bahan dan HPP per unit, dan SHALL diperbarui setiap kali bahan, qty, atau jumlah hasil berubah.

#### Scenario: Kondisi awal modal
- **WHEN** modal "Catat hasil produksi" terbuka
- **THEN** modal menampilkan satu baris bahan "Beras" dengan stok "128 kg" dan qty 8, barang hasil "Paket Favorit 25K" dengan jumlah hasil 40, serta ringkasan "Total biaya bahan Rp116.000 · HPP/unit Rp2.900"

#### Scenario: Menambah bahan kedua
- **WHEN** pengguna menekan "+ Tambah bahan", memilih "Ayam", lalu mengisi qty 12
- **THEN** tabel menampilkan dua baris (Beras 8, Ayam 12, biaya Ayam Rp456.000) dan ringkasan menjadi "Total biaya bahan Rp572.000 · HPP/unit Rp14.300"

#### Scenario: Menghapus baris bahan
- **WHEN** pengguna menekan tombol hapus pada baris "Ayam"
- **THEN** baris tersebut hilang dan ringkasan dihitung ulang tanpa biaya Ayam

### Requirement: Validasi stok bahan baku saat produksi
Sistem MUST menolak seluruh produksi jika ada bahan baku dengan qty dipakai melebihi stoknya, sehingga tidak ada stok bahan baku yang menjadi minus. Sistem MUST juga menolak produksi tanpa bahan ber-qty lebih dari 0 dan produksi dengan jumlah hasil 0 atau kosong. Saat ditolak, tidak ada stok yang berubah dan modal tetap terbuka.

#### Scenario: Salah satu bahan kurang
- **WHEN** pengguna mengisi Beras 8 dan Ayam 40 (stok Ayam 34 kg), lalu menekan "Catat produksi"
- **THEN** toast "Stok Ayam tidak mencukupi (tersedia 34 kg)" tampil, modal tetap terbuka, dan stok Beras tetap 128 kg

#### Scenario: Tidak ada bahan
- **WHEN** pengguna menghapus semua baris bahan lalu menekan "Catat produksi"
- **THEN** toast "Tambahkan minimal satu bahan baku" tampil dan tidak ada stok yang berubah

#### Scenario: Jumlah hasil kosong
- **WHEN** jumlah hasil diisi 0 lalu pengguna menekan "Catat produksi"
- **THEN** toast "Jumlah hasil produksi harus diisi" tampil dan tidak ada stok yang berubah

### Requirement: Pembukuan hasil produksi
Saat produksi valid dicatat, sistem SHALL mengurangi stok setiap bahan baku sebesar qty dipakai dan menambah stok barang hasil sebesar jumlah hasil. Sistem SHALL juga mengganti biaya per unit barang hasil dengan HPP per unit produksi tersebut (total biaya bahan ÷ jumlah hasil, dibulatkan ke rupiah terdekat), menutup modal, dan menampilkan toast sukses.

#### Scenario: Produksi dua bahan berhasil
- **WHEN** Administrator mencatat produksi Beras 8 kg + Ayam 12 kg menjadi 40 Paket Favorit 25K
- **THEN** stok Beras menjadi 120 kg, stok Ayam menjadi 22 kg, stok Paket Favorit 25K bertambah 40 porsi, BIAYA / UNIT Paket Favorit 25K menjadi Rp14.300, modal tertutup, dan toast "Produksi PRD-0920-012 tercatat. 40 porsi Paket Favorit 25K masuk, biaya Rp572.000 dibukukan." tampil

### Requirement: Riwayat mutasi stok
Panel kanan Persediaan SHALL berjudul "Riwayat mutasi stok" dengan subjudul "Transfer, produksi, dan penjualan terbaru". Setiap produksi yang berhasil SHALL ditambahkan di urutan teratas dengan ikon ⚒, kode PRD berurutan (dimulai dari PRD-0920-012), rincian bahan, keterangan "Menjadi <jumlah> <nama hasil>", dan jam pencatatan. Entri contoh yang sudah ada SHALL tetap tampil di bawahnya.

#### Scenario: Produksi muncul di riwayat
- **WHEN** produksi Beras 8 kg + Ayam 12 kg menjadi 40 Paket Favorit 25K berhasil dicatat pada pukul 10.15
- **THEN** entri teratas riwayat berbunyi "PRD-0920-012", "Beras 8 kg + Ayam 12 kg · Menjadi 40 Paket Favorit 25K", "10.15", dan entri berikutnya adalah "TAT-0920-003"

#### Scenario: Kode produksi berurutan
- **WHEN** produksi kedua berhasil dicatat pada sesi yang sama
- **THEN** entri teratas riwayat berkode "PRD-0920-013"

### Requirement: Tabel riwayat produksi
View Persediaan SHALL menampilkan panel "Riwayat produksi" di bawah grid stok, tetapi hanya saat tab "LPP barang dagangan" aktif. Panel ini SHALL memuat tabel berkolom KODE, WAKTU, HASIL, JUMLAH, BAHAN BAKU, TOTAL BIAYA, HPP / UNIT, dan DICATAT OLEH, berisi produksi dari yang terbaru. Setiap produksi yang berhasil dicatat Kepala Toko atau Administrator SHALL langsung masuk di baris teratas.

#### Scenario: Panel hanya di tab barang dagangan
- **WHEN** Administrator membuka Persediaan dengan tab "LPP bahan baku" aktif, lalu berpindah ke tab "LPP barang dagangan"
- **THEN** panel "Riwayat produksi" tersembunyi di tab bahan baku dan tampil di tab barang dagangan

#### Scenario: Data contoh awal
- **WHEN** Administrator membuka tab "LPP barang dagangan" setelah halaman dimuat
- **THEN** tabel menampilkan 3 baris PRD-0920-011, PRD-0920-010, dan PRD-0920-009, dan baris teratas berisi "PRD-0920-011", "20 Sep 2026 09.05", "Paket Favorit 25K", "86 porsi", "Beras 8 kg + Ayam 12 kg", "Rp572.000", "Rp6.651", "Budi Santoso"

#### Scenario: Produksi baru masuk ke tabel
- **WHEN** Raka Administrator mencatat produksi Beras 8 kg + Ayam 12 kg menjadi 40 Paket Favorit 25K
- **THEN** baris teratas tabel berisi "PRD-0920-012", waktu "20 Sep 2026 <jam>", "Paket Favorit 25K", "40 porsi", "Beras 8 kg + Ayam 12 kg", "Rp572.000", "Rp14.300", "Raka Administrator", dan tabel menjadi 4 baris
