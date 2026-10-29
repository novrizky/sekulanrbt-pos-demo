# stock-opname Specification

## Purpose
TBD - created by archiving change stock-opname. Update Purpose after archive.

## Requirements
### Requirement: Riwayat stock opname per outlet
Submenu Persediaan › "Stok opname" SHALL menampilkan panel "Riwayat stock opname" berisi dokumen opname satu outlet, terbaru di atas, dengan kolom NO. DOKUMEN, TANGGAL, CAKUPAN, PETUGAS, ITEM, SELISIH, NILAI SELISIH, dan AKSI ("Lihat"). Nilai selisih SHALL berupa Σ (fisik − sistem) × biaya per unit dalam Rupiah bertanda. Chip cakupan "Semua", "Bahan baku", dan "Barang dagangan" SHALL memfilter riwayat, dan tabel SHALL memakai paging contoh.

#### Scenario: Kepala Toko membuka riwayat
- **WHEN** Budi Santoso (Kepala Toko Sekulan RBT 519A) membuka submenu "Stok opname"
- **THEN** judul halaman "Stok opname" dan tabel menampilkan 4 dokumen Sekulan RBT 519A dari atas: SO-0919-2, SO-0919-1, SO-0912-1, SO-0905-1, dengan paging "Halaman 1 dari 1"

#### Scenario: Isi baris dokumen dengan selisih
- **WHEN** riwayat Sekulan RBT 519A tampil
- **THEN** baris SO-0919-1 menampilkan "19 Sep 2026 • 13.15", cakupan "Bahan baku", petugas "Budi Santoso • Shift 1", item "17", selisih "3 item (+1 / −2)", dan nilai selisih "−Rp34.100"

#### Scenario: Dokumen tanpa selisih
- **WHEN** riwayat Sekulan RBT 519A tampil
- **THEN** baris SO-0912-1 menampilkan selisih "-" dan nilai selisih "Rp0"

#### Scenario: Filter cakupan
- **WHEN** Kepala Toko memilih chip "Barang dagangan"
- **THEN** hanya SO-0919-2 dan SO-0905-1 yang tampil

### Requirement: Administrator memilih outlet lewat dropdown
Administrator SHALL melihat dropdown outlet di panel riwayat yang berisi semua outlet dari data Outlet, dengan nilai awal "Sekulan RBT 519A". Mengganti pilihan SHALL memperbarui riwayat dan kartu ringkasan ke outlet itu. Kepala Toko MUST NOT melihat dropdown ini, dan riwayatnya SHALL selalu outletnya sendiri.

#### Scenario: Nilai awal dropdown
- **WHEN** `admin.rbt` membuka submenu "Stok opname"
- **THEN** dropdown outlet bernilai "Sekulan RBT 519A" dan tabel berisi 4 dokumen outlet itu

#### Scenario: Mengganti outlet
- **WHEN** Administrator memilih "RM RBT 519B"
- **THEN** tabel menampilkan SO-0918-1, SO-0911-1, dan SO-0904-1, dan kartu "Opname bulan ini" menjadi "3 dokumen"

#### Scenario: Outlet tanpa opname
- **WHEN** Administrator memilih "Salatiga 456B"
- **THEN** tabel menampilkan "Belum ada stock opname untuk outlet ini" dan kartu "Opname terakhir" berisi "-"

#### Scenario: Kepala Toko tidak melihat dropdown
- **WHEN** Kepala Toko membuka submenu "Stok opname"
- **THEN** dropdown outlet tidak tampil

### Requirement: Hanya Kepala Toko yang memulai opname untuk outletnya
Tombol "+ Mulai opname" SHALL tampil hanya untuk Kepala Toko. Opname yang dimulai Kepala Toko SHALL selalu tercatat untuk outlet `session.outlet` dengan petugas nama dan shift akun yang login. Administrator MUST NOT dapat memulai opname.

#### Scenario: Administrator hanya melihat
- **WHEN** `admin.rbt` membuka submenu "Stok opname"
- **THEN** tombol "+ Mulai opname" tidak tampil, sedangkan tombol "Lihat" di setiap baris tetap tampil

#### Scenario: Kepala Toko melihat tombol mulai
- **WHEN** Rina Pratiwi (Kepala Toko Shift 2) membuka submenu "Stok opname"
- **THEN** tombol "+ Mulai opname" tampil

### Requirement: Memilih cakupan opname
Menekan "+ Mulai opname" SHALL membuka modal "Mulai stock opname" dengan dua pilihan cakupan: "Bahan baku" dan "Barang dagangan". Cakupan Bahan baku SHALL berisi semua item bahan baku kecuali item tersambung. Cakupan Barang dagangan SHALL berisi semua item barang dagangan termasuk item tersambung (Rokok Brand A–E dan Air mineral). Dengan begitu, setiap item tersambung dihitung tepat di satu cakupan. Tombol "Mulai hitung" SHALL membuka form hitung dengan judul halaman "Stock opname • <cakupan>".

#### Scenario: Pilihan cakupan di modal
- **WHEN** Kepala Toko menekan "+ Mulai opname"
- **THEN** modal menampilkan "Bahan baku" dengan keterangan "17 item • Tidak termasuk item Siap jual" dan "Barang dagangan" dengan keterangan "11 item • Termasuk Rokok & Air mineral (Siap jual)"

#### Scenario: Item tersambung tidak masuk cakupan Bahan baku
- **WHEN** Kepala Toko memilih "Bahan baku" lalu menekan "Mulai hitung"
- **THEN** form hitung berisi 17 item dan tidak memuat Rokok Brand A–E maupun Air mineral

#### Scenario: Item tersambung masuk cakupan Barang dagangan
- **WHEN** Kepala Toko memilih "Barang dagangan" lalu menekan "Mulai hitung"
- **THEN** form hitung berisi 11 item, dan Rokok Brand A–E serta Air mineral tampil dengan badge "Siap jual"

### Requirement: Form hitung stok fisik
Form hitung SHALL tampil di halaman Persediaan menggantikan panel lain, dengan info outlet, petugas, dan tanggal yang tidak dapat diubah, dan tabel berkolom ITEM, STOK SISTEM, STOK FISIK, SELISIH, CATATAN untuk semua item cakupan. STOK SISTEM SHALL berupa qty saat form dibuka, dan input STOK FISIK SHALL terisi nilai itu. SELISIH dan ringkasan di atas tombol SHALL dihitung ulang setiap kali input fisik diubah: hijau "+" bila lebih, merah "−" bila kurang.

#### Scenario: Form terbuka dengan stok sistem
- **WHEN** Kepala Toko membuka form cakupan Bahan baku
- **THEN** baris Beras menampilkan STOK SISTEM "128 kg", input STOK FISIK berisi 128, SELISIH "0", dan ringkasan "17 item dihitung · 0 item selisih (lebih 0 / kurang 0) · Nilai selisih Rp0"

#### Scenario: Mengubah stok fisik menjadi kurang
- **WHEN** Kepala Toko mengubah STOK FISIK Beras menjadi 125
- **THEN** SELISIH Beras menjadi "−3" berwarna merah dan ringkasan menjadi "17 item dihitung · 1 item selisih (lebih 0 / kurang 1) · Nilai selisih −Rp43.500"

#### Scenario: Mengubah stok fisik menjadi lebih
- **WHEN** Kepala Toko mengubah STOK FISIK Gula pasir menjadi 24
- **THEN** SELISIH Gula pasir menjadi "+2" berwarna hijau

#### Scenario: Kembalikan ke stok sistem
- **WHEN** Kepala Toko menekan "Kembalikan ke stok sistem" setelah mengubah beberapa baris
- **THEN** semua STOK FISIK kembali sama dengan STOK SISTEM, semua catatan dikosongkan, dan toast "Isian dikembalikan ke stok sistem" tampil

#### Scenario: Batal opname
- **WHEN** Kepala Toko menekan "Batal" di form hitung
- **THEN** form tertutup, riwayat "Stok opname" tampil lagi, dan tidak ada dokumen baru maupun perubahan stok

### Requirement: Catatan untuk item yang selisih
Setiap baris dengan selisih tidak nol SHALL menampilkan label "Wajib diisi" pada kolom CATATAN dan chip alasan cepat "Rusak", "Kadaluarsa", "Hilang", dan "Salah input". Menekan chip SHALL mengisi input catatan baris itu dengan teks chip. Label "Wajib diisi" hanya berupa penanda: catatan yang kosong MUST NOT menghalangi penyimpanan. Baris yang selisihnya kembali 0 SHALL menyembunyikan label dan chip.

#### Scenario: Label muncul saat selisih
- **WHEN** Kepala Toko mengubah STOK FISIK Telur dari 186 menjadi 180
- **THEN** kolom CATATAN Telur menampilkan label "Wajib diisi" dan chip "Rusak", "Kadaluarsa", "Hilang", "Salah input"

#### Scenario: Chip mengisi catatan
- **WHEN** Kepala Toko menekan chip "Rusak" di baris Telur
- **THEN** input catatan Telur berisi "Rusak"

#### Scenario: Catatan kosong tidak menolak simpan
- **WHEN** baris Telur selisih tetapi catatannya kosong, lalu Kepala Toko menekan "Simpan opname"
- **THEN** modal konfirmasi tetap terbuka tanpa toast peringatan

### Requirement: Validasi sebelum menyimpan opname
Saat "Simpan opname" ditekan, setiap STOK FISIK MUST terisi. Bila ada yang kosong, penyimpanan SHALL ditolak dengan toast "Masih ada <k> item belum dihitung". Stok fisik MUST NOT bernilai minus. Bila ada yang minus, penyimpanan SHALL ditolak dengan toast "Stok fisik tidak boleh minus". Bila lolos, modal "Simpan stock opname?" SHALL tampil dengan ringkasan form dan teks "Stok sistem akan disesuaikan dengan hasil hitung fisik", serta tombol "Batal" dan "Simpan & sesuaikan stok".

#### Scenario: Ada kolom fisik dikosongkan
- **WHEN** Kepala Toko mengosongkan STOK FISIK Ayam dan Telur lalu menekan "Simpan opname"
- **THEN** toast "Masih ada 2 item belum dihitung" tampil dan form tetap terbuka

#### Scenario: Stok fisik minus
- **WHEN** Kepala Toko mengisi STOK FISIK Garam dengan -1 lalu menekan "Simpan opname"
- **THEN** toast "Stok fisik tidak boleh minus" tampil dan form tetap terbuka

#### Scenario: Konfirmasi tampil
- **WHEN** semua STOK FISIK terisi dan tidak ada yang minus, lalu Kepala Toko menekan "Simpan opname"
- **THEN** modal "Simpan stock opname?" tampil dengan ringkasan dan tombol "Simpan & sesuaikan stok"

### Requirement: Menyimpan opname menyesuaikan stok sistem
Menekan "Simpan & sesuaikan stok" SHALL mengganti qty setiap item cakupan di buku stok dengan STOK FISIK, menambahkan dokumen `SO-0920-<n>` (n berurutan mulai 1) di paling atas riwayat outlet Kepala Toko dan entri bernomor sama di paling atas "Riwayat mutasi stok", lalu menutup form dengan toast. Item tersambung yang disesuaikan SHALL berubah di kedua halaman stok.

#### Scenario: Stok bahan baku disesuaikan
- **WHEN** Kepala Toko menyimpan opname Bahan baku dengan STOK FISIK Beras 125 dan Telur 180
- **THEN** toast "SO-0920-1 tersimpan, stok disesuaikan" tampil, tabel Stok bahan baku menampilkan Beras "125 kg" dan Telur "180 butir", dan baris SO-0920-1 berada di paling atas riwayat dengan selisih "2 item (+0 / −2)" dan nilai "−Rp56.100"

#### Scenario: Entri di Mutasi stok
- **WHEN** SO-0920-1 baru saja disimpan untuk cakupan Bahan baku dengan 2 item selisih
- **THEN** "Riwayat mutasi stok" menampilkan di paling atas "SO-0920-1" dengan keterangan "Bahan baku • 2 item selisih · Penyesuaian stok opname −Rp56.100" dan ikon "☑", dan kartu "Total mutasi" bertambah 1

#### Scenario: Item tersambung disesuaikan sekali
- **WHEN** Kepala Toko menyimpan opname Barang dagangan dengan STOK FISIK Rokok Brand D 5 (sistem 6)
- **THEN** Rokok Brand D menampilkan "5 bungkus" di Stok barang dagangan maupun Stok bahan baku

#### Scenario: Opname tanpa selisih
- **WHEN** Kepala Toko menyimpan opname tanpa mengubah STOK FISIK
- **THEN** toast "SO-0920-1 tersimpan, tidak ada selisih" tampil, dokumen baru ditambahkan dengan selisih "-", dan stok tidak berubah

### Requirement: Detail dokumen stock opname
Menekan "Lihat" pada baris riwayat SHALL membuka halaman detail dokumen (eyebrow "STOCK OPNAME", judul nomor dokumen, tombol "← Kembali") berisi ringkasan Outlet, Petugas, Cakupan, Item dihitung, Selisih lebih, Selisih kurang, Nilai selisih, dan panel "Daftar item" berkolom ITEM, SISTEM, FISIK, SELISIH, NILAI SELISIH, CATATAN dengan chip "Hanya yang selisih" (aktif saat dibuka) dan "Semua item". Detail MUST NOT memiliki aksi ubah.

#### Scenario: Membuka detail
- **WHEN** Kepala Toko menekan "Lihat" pada SO-0919-1
- **THEN** halaman detail berjudul "SO-0919-1" tampil dengan baris "Sekulan RBT 519A • 19 Sep 2026 13.15 • Bahan baku", petugas "Budi Santoso • Shift 1", item dihitung 17, selisih lebih 1, selisih kurang 2, dan nilai selisih "−Rp34.100"

#### Scenario: Hanya yang selisih
- **WHEN** detail SO-0919-1 baru dibuka
- **THEN** tabel hanya berisi Telur ("−6", "−Rp12.600", "Rusak: pecah saat bongkar"), Bawang merah ("−1", "−Rp38.000", "Kadaluarsa"), dan Gula pasir ("+1", "+Rp16.500", "Salah input penerimaan")

#### Scenario: Semua item
- **WHEN** pengguna menekan chip "Semua item" di detail SO-0919-1
- **THEN** tabel menampilkan 10 baris pertama dari 17 item dengan paging "Halaman 1 dari 2"

#### Scenario: Detail tanpa selisih
- **WHEN** pengguna membuka detail SO-0912-1
- **THEN** tabel menampilkan "Tidak ada item selisih", dan chip "Semua item" menampilkan item yang dihitung

#### Scenario: Kembali ke riwayat
- **WHEN** pengguna menekan "← Kembali" di halaman detail
- **THEN** submenu "Stok opname" tampil dan ditandai aktif di sidebar

#### Scenario: Administrator melihat detail outlet lain
- **WHEN** Administrator memilih "Bawen 445B" lalu menekan "Lihat" pada SO-0917-1
- **THEN** detail menampilkan outlet "Bawen 445B", petugas "Agus N. • Shift 1", dan nilai selisih "−Rp111.200" tanpa tombol ubah

### Requirement: Kartu ringkasan Stok opname
Submenu "Stok opname" SHALL menampilkan tiga kartu untuk outlet yang sedang dilihat: "Opname bulan ini" (jumlah dokumen September 2026), "Opname terakhir" (tanggal dokumen terbaru dengan cakupannya, atau "-" bila belum ada), dan "Nilai selisih bulan ini" (jumlah nilai selisih dokumen September 2026 dalam Rupiah bertanda). Kartu SHALL diperbarui setelah opname disimpan.

#### Scenario: Kartu Sekulan RBT 519A
- **WHEN** Kepala Toko Sekulan RBT 519A membuka submenu "Stok opname" dengan data contoh
- **THEN** kartu menampilkan Opname bulan ini "4 dokumen", Opname terakhir "19 Sep 2026" (Barang dagangan), dan Nilai selisih bulan ini "−Rp95.900"

#### Scenario: Kartu berubah setelah opname
- **WHEN** Kepala Toko menyimpan SO-0920-1
- **THEN** kartu Opname bulan ini menjadi "5 dokumen" dan Opname terakhir menjadi "20 Sep 2026"
