# raw-material-request Specification

## Purpose
TBD - created by archiving change add-raw-material-request. Update Purpose after archive.

## Requirements

### Requirement: Section Permintaan barang di Persediaan
Halaman Persediaan SHALL menampilkan section "Permintaan barang" di bawah panel "Stok bahan baku" dan "Riwayat TAT". Section ini tampil saat tab "LPP bahan baku" maupun "LPP barang dagangan" aktif. Daftar SHALL memiliki kolom NO. PERMINTAAN, TANGGAL, OUTLET, PEMINTA, ITEM, NO. PO, STATUS, dan AKSI, dengan permintaan terbaru di atas. Daftar SHALL bisa difilter berdasarkan status (Semua, Menunggu persetujuan, Disetujui, PO dicetak, Selesai, Ditolak) dan dicari berdasarkan nomor permintaan atau nama peminta.

Data contoh SHALL berisi: REQ-0920-001 (Budi Santoso, Menunggu persetujuan), REQ-0920-002 (Raka Administrator, Sekulan RBT 519B, Disetujui, PO-0920-002), REQ-0920-003 (Rina Pratiwi, PO dicetak, vendor CV Sumber Pangan), REQ-0920-004 (Taufik Hadi, Selesai, dengan catatan selisih), dan REQ-0920-005 (Budi Santoso, Ditolak).

#### Scenario: Membuka Persediaan
- **WHEN** Administrator membuka menu "Persediaan"
- **THEN** section "Permintaan barang" tampil di bawah panel "Stok bahan baku" dan "Riwayat TAT" dengan lima permintaan contoh

#### Scenario: Section tetap tampil di tab barang dagangan
- **WHEN** pengguna memilih tab "LPP barang dagangan"
- **THEN** section "Permintaan barang" tetap tampil tanpa perubahan

#### Scenario: Filter status
- **WHEN** pengguna memilih filter "Menunggu persetujuan"
- **THEN** hanya REQ-0920-001 yang tampil

#### Scenario: Pencarian peminta
- **WHEN** pengguna mengetik "rina" di kolom pencarian
- **THEN** hanya permintaan dengan peminta Rina Pratiwi yang tampil

### Requirement: Informasi peminta dan visibilitas
Kolom PEMINTA SHALL menampilkan nama dan peran pembuat permintaan (mis. "Budi Santoso" dengan keterangan "Kepala Toko"). Kepala Toko SHALL melihat semua permintaan, termasuk yang dibuat Kepala Toko lain dan Administrator untuk outlet lain. Administrator SHALL melihat semua permintaan.

#### Scenario: Kepala Toko melihat permintaan Kepala Toko lain
- **WHEN** Budi Santoso (Kepala Toko, Sekulan RBT 519A) membuka Persediaan
- **THEN** REQ-0920-003 milik Rina Pratiwi dan REQ-0920-002 untuk Sekulan RBT 519B ikut tampil di daftar

### Requirement: Form buat permintaan dengan pemilihan item bahan baku
Tombol "+ Buat permintaan" SHALL membuka panel form penuh berjudul "Buat permintaan barang" yang menggantikan isi halaman Persediaan sampai form ditutup. Form SHALL menampilkan tabel semua bahan baku dengan kolom pilih, ITEM, STOK, MINIMUM, STATUS, BIAYA / UNIT, dan QTY DIMINTA. Urutan default SHALL menaruh item berstatus Menipis (`stok <= minimum`) di atas, mulai dari rasio stok/minimum terkecil, lalu item Aman urut abjad. Form SHALL menyediakan pencarian nama item dan filter status (Semua, Menipis, Aman). Pilihan dan qty yang sudah diisi SHALL tetap tersimpan saat filter atau pencarian berubah. Field Outlet SHALL berisi outlet akun dan tidak dapat diubah untuk Kepala Toko. Administrator dapat memilih outlet.

#### Scenario: Item menipis di atas dan otomatis tercentang
- **WHEN** Kepala Toko membuka "+ Buat permintaan"
- **THEN** semua item Menipis tampil paling atas dalam keadaan tercentang dengan QTY DIMINTA kosong, dan item Aman tidak tercentang

#### Scenario: Pencarian item
- **WHEN** pengguna mengetik "bawang" di pencarian item
- **THEN** hanya bahan baku yang namanya mengandung "bawang" yang tampil

#### Scenario: Filter Aman
- **WHEN** pengguna memilih filter status "Aman"
- **THEN** hanya bahan baku dengan stok di atas minimum yang tampil, dan centang item Menipis tetap tersimpan saat filter dikembalikan ke "Semua"

#### Scenario: Mengisi qty mencentang item
- **WHEN** pengguna mengisi QTY DIMINTA 10 pada item Aman yang belum dicentang
- **THEN** item itu otomatis tercentang dan ringkasan jumlah item serta estimasi nilai diperbarui

#### Scenario: Batal
- **WHEN** pengguna menekan "Batal" di form
- **THEN** form ditutup tanpa membuat permintaan dan halaman Persediaan tampil kembali

### Requirement: Validasi pengajuan permintaan
Pengajuan SHALL ditolak jika tidak ada item yang dicentang atau jika ada item tercentang yang qty-nya kosong atau 0.

#### Scenario: Tidak ada item
- **WHEN** pengguna menekan "Ajukan permintaan" tanpa item tercentang
- **THEN** muncul toast "Pilih minimal satu bahan baku" dan permintaan tidak dibuat

#### Scenario: Qty kosong
- **WHEN** item Ayam tercentang dengan QTY DIMINTA kosong lalu pengguna menekan "Ajukan permintaan"
- **THEN** muncul toast "Isi qty untuk Ayam" dan permintaan tidak dibuat

### Requirement: Persetujuan berdasarkan peran pembuat
Permintaan yang diajukan Kepala Toko SHALL berstatus "Menunggu persetujuan". Permintaan yang diajukan Administrator SHALL langsung berstatus "Disetujui" dan menerbitkan nomor PO. Nomor PO SHALL memakai sufiks yang sama dengan nomor permintaan (REQ-0920-006 menjadi PO-0920-006). Harga PO setiap item SHALL diisi awal dari biaya per unit bahan baku saat permintaan dibuat.

#### Scenario: Kepala Toko mengajukan
- **WHEN** Budi Santoso mengajukan permintaan berisi Ayam 20 kg
- **THEN** permintaan REQ-0920-006 dibuat dengan status "Menunggu persetujuan", muncul toast "Permintaan REQ-0920-006 diajukan, menunggu persetujuan Administrator", dan form ditutup

#### Scenario: Administrator mengajukan
- **WHEN** Raka Administrator mengajukan permintaan
- **THEN** permintaan dibuat dengan status "Disetujui" dan nomor PO, history mencatat "Permintaan diajukan" dan "Disetujui otomatis (Administrator)", dan muncul toast "Permintaan REQ-0920-006 disetujui otomatis, PO-0920-006 siap dicetak"

### Requirement: Approval dan penolakan oleh Administrator
Pada permintaan "Menunggu persetujuan", detail SHALL menampilkan qty yang dapat dikoreksi serta tombol "Tolak" dan "Setujui", hanya untuk Administrator. Setujui SHALL mengubah status menjadi "Disetujui", menerbitkan nomor PO, dan mencatat setiap koreksi qty di history. Tolak SHALL meminta alasan yang wajib diisi dan mengubah status menjadi "Ditolak". Kepala Toko SHALL tidak melihat tombol Setujui atau Tolak.

#### Scenario: Setujui dengan koreksi qty
- **WHEN** Administrator membuka REQ-0920-001, mengubah qty Ayam dari 20 menjadi 15, lalu menekan "Setujui"
- **THEN** status menjadi "Disetujui" dengan PO-0920-001, history mencatat "Qty Ayam dikoreksi 20 → 15 kg" dan "Disetujui oleh Raka Administrator", dan muncul toast "REQ-0920-001 disetujui, PO-0920-001 siap dicetak"

#### Scenario: Tolak tanpa alasan
- **WHEN** Administrator menekan "Tolak" lalu mengonfirmasi tanpa mengisi alasan
- **THEN** muncul toast "Alasan penolakan wajib diisi" dan status tidak berubah

#### Scenario: Tolak dengan alasan
- **WHEN** Administrator menolak REQ-0920-001 dengan alasan "Stok masih cukup"
- **THEN** status menjadi "Ditolak", alasan tampil di detail dan history, dan muncul toast "REQ-0920-001 ditolak"

#### Scenario: Kepala Toko tidak bisa menyetujui
- **WHEN** Budi Santoso membuka detail REQ-0920-001
- **THEN** tombol "Setujui" dan "Tolak" tidak tampil dan qty tidak dapat diubah

### Requirement: Hak aksi Kepala Toko terbatas pada outletnya
Aksi "Cetak PO" dan "Terima barang" SHALL tersedia untuk Administrator di semua permintaan, dan untuk Kepala Toko hanya pada permintaan outlet akunnya. Pada permintaan outlet lain, detail SHALL tetap bisa dibuka tanpa tombol aksi.

#### Scenario: Kepala Toko membuka permintaan outlet lain
- **WHEN** Budi Santoso (Sekulan RBT 519A) membuka detail REQ-0920-002 (Sekulan RBT 519B)
- **THEN** detail dan riwayat tampil, tetapi tombol "Cetak PO" tidak tampil

### Requirement: Cetak Purchase Order dengan identitas vendor dan harga per PO
Pada permintaan "Disetujui" atau "PO dicetak", tombol "Cetak PO" SHALL membuka modal berisi field Nama vendor (wajib), Kontak, Telepon, dan Alamat, serta tabel item dengan kolom HARGA MASTER (tidak dapat diubah) dan HARGA PO (dapat diubah) beserta subtotal dan total. Field vendor dan harga PO SHALL terisi dari nilai yang terakhir disimpan pada PO itu. "Simpan & cetak PO" SHALL menyimpan vendor dan harga ke PO tersebut, mencetak dokumen PO yang berisi nomor PO, nomor permintaan, outlet, tanggal, identitas vendor, item, harga, dan total, lalu mengubah status menjadi "PO dicetak" pada cetak pertama. Perubahan harga PO SHALL tidak mengubah biaya per unit di stok bahan baku.

#### Scenario: Cetak pertama tanpa vendor
- **WHEN** Administrator menekan "Cetak PO" pada REQ-0920-002 lalu menekan "Simpan & cetak PO" dengan Nama vendor kosong
- **THEN** muncul toast "Nama vendor wajib diisi" dan dokumen tidak dicetak

#### Scenario: Cetak dengan harga vendor
- **WHEN** Administrator mengisi vendor "UD Beras Makmur", mengubah HARGA PO Beras dari 14.500 menjadi 15.000, lalu menekan "Simpan & cetak PO"
- **THEN** dialog cetak browser menampilkan dokumen PO-0920-002 dengan harga Beras Rp 15.000, status menjadi "PO dicetak", history mencatat "PO dicetak", dan biaya per unit Beras di tabel stok tetap Rp 14.500

#### Scenario: Cetak ulang prefilled
- **WHEN** pengguna menekan "Cetak PO" lagi pada REQ-0920-003
- **THEN** field vendor terisi "CV Sumber Pangan" dan HARGA PO terisi harga yang tersimpan, semuanya masih dapat diubah, dan setelah dicetak history mencatat "PO dicetak ulang"

### Requirement: Terima barang dari PO menambah stok bahan baku
Pada permintaan "PO dicetak", tombol "Terima barang" SHALL membuka form penerimaan dengan nomor GRN otomatis, pemasok dari vendor PO, field nomor surat jalan, dan tabel ITEM, QTY PO, QTY DITERIMA, HARGA, SELISIH. QTY DITERIMA terisi qty PO dan HARGA terisi harga PO. Keduanya dapat diubah, dan SELISIH dihitung langsung. Menyimpan penerimaan SHALL menambah stok setiap bahan baku sebesar qty diterima, memperbarui biaya per unit bahan baku dengan harga yang diterima, mengubah status menjadi "Selesai", dan mencatat nomor GRN di history.

#### Scenario: Diterima sesuai PO
- **WHEN** Administrator menerima REQ-0920-003 tanpa mengubah qty
- **THEN** stok Telur dan Bumbu dasar bertambah sesuai qty PO, status menjadi "Selesai", history mencatat "Diterima dengan GRN-0920-013", dan muncul toast "Barang PO-0920-003 diterima, stok bahan baku diperbarui"

#### Scenario: Harga diterima memperbarui biaya master
- **WHEN** HARGA Telur di form penerimaan diubah menjadi 2.200 lalu disimpan
- **THEN** BIAYA / UNIT Telur di tabel stok bahan baku menjadi Rp 2.200

### Requirement: Catatan selisih penerimaan
Jika ada QTY DITERIMA yang berbeda dari QTY PO, form penerimaan SHALL mewajibkan "Catatan selisih". Selisih per item dan catatannya SHALL tersimpan di riwayat penerimaan dan tampil di detail permintaan.

#### Scenario: Selisih tanpa catatan
- **WHEN** QTY DITERIMA Telur diubah dari 300 menjadi 270 lalu penerimaan disimpan dengan catatan kosong
- **THEN** muncul toast "Catatan selisih wajib diisi karena qty diterima berbeda dari PO" dan stok tidak berubah

#### Scenario: Selisih dengan catatan
- **WHEN** QTY DITERIMA Telur 270 dengan catatan "30 butir pecah, dikembalikan ke vendor"
- **THEN** stok Telur bertambah 270, kolom SELISIH menampilkan "-30 butir", dan history mencatat selisih beserta catatannya

### Requirement: Riwayat permintaan yang dapat ditelusuri
Detail permintaan SHALL menampilkan ringkasan (outlet, peminta dan perannya, tanggal, nomor PO, vendor, total) serta timeline berurutan yang mencatat setiap langkah: diajukan, koreksi qty, disetujui/disetujui otomatis/ditolak beserta alasan, PO dicetak/dicetak ulang, dan diterima (nomor GRN dan selisih), lengkap dengan waktu dan nama pelaku.

#### Scenario: Riwayat permintaan selesai
- **WHEN** pengguna membuka detail REQ-0920-004
- **THEN** timeline menampilkan urutan diajukan oleh Taufik Hadi, disetujui oleh Raka Administrator, PO dicetak, dan diterima dengan nomor GRN beserta catatan selisih Minyak goreng

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
