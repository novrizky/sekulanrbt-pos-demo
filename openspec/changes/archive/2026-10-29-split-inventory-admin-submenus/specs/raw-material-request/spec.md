## REMOVED Requirements

### Requirement: Section Permintaan barang di Persediaan

**Reason**: Permintaan barang tidak lagi tampil sebagai section di bawah kedua tab LPP; sekarang menjadi submenu tersendiri di grup Persediaan.

**Migration**: Digantikan requirement "Submenu Permintaan barang" di bawah. Kolom, filter, pencarian, dan data contoh tidak berubah.

### Requirement: Data bahan baku dan definisi Menipis konsisten

**Reason**: Kartu "Stok menipis" tidak lagi dihitung sekali untuk gabungan dua LPP, dan kartu "Bahan baku" diganti kartu "Jumlah item" di submenu Stok bahan baku.

**Migration**: Digantikan requirement "Data bahan baku dan Menipis per buku stok" di bawah. Data bahan baku, aturan Menipis, dan "+ Stok masuk" tidak berubah.

## ADDED Requirements

### Requirement: Submenu Permintaan barang
Submenu "Permintaan barang" di grup Persediaan SHALL menampilkan section "Permintaan barang" sebagai isi halaman, dan section ini MUST NOT tampil di submenu Persediaan lainnya. Daftar SHALL memiliki kolom NO. PERMINTAAN, TANGGAL, OUTLET, PEMINTA, ITEM, NO. PO, STATUS, dan AKSI, terbaru di atas, dapat difilter berdasarkan status (Semua, Menunggu persetujuan, Disetujui, PO dicetak, Selesai, Ditolak), dan dapat dicari berdasarkan nomor permintaan atau nama peminta.

Data contoh SHALL berisi: REQ-0920-001 (Budi Santoso, Menunggu persetujuan), REQ-0920-002 (Raka Administrator, Sekulan RBT 519B, Disetujui, PO-0920-002), REQ-0920-003 (Rina Pratiwi, PO dicetak, vendor CV Sumber Pangan), REQ-0920-004 (Taufik Hadi, Selesai, dengan catatan selisih), dan REQ-0920-005 (Budi Santoso, Ditolak).

#### Scenario: Membuka Permintaan barang
- **WHEN** Administrator menekan submenu "Permintaan barang"
- **THEN** section "Permintaan barang" tampil dengan lima permintaan contoh, tanpa tabel stok di halaman itu

#### Scenario: Tidak tampil di submenu stok
- **WHEN** pengguna membuka submenu "Stok bahan baku" atau "Stok barang dagangan"
- **THEN** section "Permintaan barang" tidak tampil

#### Scenario: Menutup form permintaan
- **WHEN** pengguna membuka "+ Buat permintaan" lalu menekan "Batal"
- **THEN** form tertutup dan halaman kembali ke daftar dengan judul "Permintaan barang"

#### Scenario: Filter status
- **WHEN** pengguna memilih filter "Menunggu persetujuan"
- **THEN** hanya REQ-0920-001 yang tampil

#### Scenario: Pencarian peminta
- **WHEN** pengguna mengetik "rina" di kolom pencarian
- **THEN** hanya permintaan dengan peminta Rina Pratiwi yang tampil

### Requirement: Data bahan baku dan Menipis per buku stok
Data bahan baku SHALL berisi sekitar 15–18 item bahan baku realistis, ditambah item bersama (Rokok Brand A–E dan Air mineral). Status Menipis SHALL memakai aturan `stok <= minimum` di tabel stok bahan baku, tabel stok barang dagangan, maupun form permintaan. Kartu "Jumlah item" di submenu Stok bahan baku SHALL menghitung semua item bahan baku termasuk item bersama. Kartu "Stok menipis" di setiap submenu stok SHALL menghitung item Menipis di buku stok halaman itu. Tombol "+ Stok masuk" SHALL tetap berfungsi untuk penerimaan tanpa PO, termasuk untuk item bersama.

#### Scenario: Status konsisten
- **WHEN** sebuah bahan baku punya stok sama dengan minimumnya
- **THEN** item itu berstatus "Menipis" di tabel stok dan di form permintaan

#### Scenario: Stok masuk tanpa PO
- **WHEN** pengguna menekan "+ Stok masuk" di submenu Stok bahan baku
- **THEN** form stok bahan baku masuk yang lama terbuka seperti sebelumnya, dan pilihan bahan baku juga memuat item bersama

#### Scenario: Item bersama Menipis dihitung per halaman stok
- **WHEN** Rokok Brand D (stok 6, minimum 10) berstatus Menipis
- **THEN** kartu "Stok menipis" di Stok bahan baku dan di Stok barang dagangan masing-masing menghitung Rokok Brand D satu kali

#### Scenario: Kartu Jumlah item memuat item bersama
- **WHEN** Administrator membuka submenu Stok bahan baku
- **THEN** kartu "Jumlah item" menampilkan "23 item" (17 bahan baku ditambah 6 item bersama)
