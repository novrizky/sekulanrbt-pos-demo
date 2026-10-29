## MODIFIED Requirements

### Requirement: Data bahan baku dan definisi Menipis konsisten
Data bahan baku SHALL berisi sekitar 15–18 item bahan baku realistis, ditambah item bersama (Rokok Brand A–E dan Air mineral) yang juga tercatat sebagai barang dagangan. Beberapa item berstatus Menipis. Status Menipis SHALL memakai aturan `stok <= minimum` di tabel stok bahan baku, tabel stok barang dagangan, maupun form permintaan. Kartu ringkasan "Bahan baku" SHALL menghitung semua item di LPP bahan baku, termasuk item bersama. Kartu "Stok menipis" SHALL menghitung setiap item Menipis tepat satu kali, walaupun item bersama tampil di kedua LPP. Tombol "+ Stok masuk" yang lama SHALL tetap berfungsi untuk penerimaan tanpa PO, termasuk untuk item bersama.

#### Scenario: Status konsisten
- **WHEN** sebuah bahan baku punya stok sama dengan minimumnya
- **THEN** item itu berstatus "Menipis" di tabel stok dan di form permintaan

#### Scenario: Stok masuk tanpa PO
- **WHEN** pengguna menekan "+ Stok masuk" di tab LPP bahan baku
- **THEN** form stok bahan baku masuk yang lama terbuka seperti sebelumnya, dan pilihan bahan baku juga memuat item bersama

#### Scenario: Item bersama Menipis dihitung sekali
- **WHEN** Rokok Brand D (stok 6, minimum 10) berstatus Menipis dan tampil di kedua LPP
- **THEN** kartu "Stok menipis" menambah 1 untuk Rokok Brand D, bukan 2

#### Scenario: Kartu Bahan baku memuat item bersama
- **WHEN** Administrator membuka Persediaan
- **THEN** kartu "Bahan baku" menampilkan "23 item" (17 bahan baku ditambah 6 item bersama)
