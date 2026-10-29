# Brainstorm: Stock opname

Catatan mentah dari sesi `/opsx:explore` (29 Okt 2026) yang dilanjutkan ke `/opsx:propose`. Keputusan "apa" diambil bersama pengguna di sesi explore; keputusan "bagaimana" yang ditandai *(usulan Claude)* belum dikoreksi pengguna dan dicatat sebagai pilihan Claude.

## Permintaan awal pengguna

1. Stock opname bisa untuk bahan baku dan barang jadi (termasuk barang siap jual).
2. Dilakukan oleh Kepala Toko di tokonya sendiri.
3. Ada riwayat aktivitas stock opname, dan detailnya bisa dilihat (barang apa saja yang di-opname).
4. Setiap barang yang selisih (lebih atau kurang) wajib diberi catatan, cukup label tanpa validasi sungguhan.
5. Administrator bisa melihat riwayat stock opname tiap toko lewat dropdown toko. Toko awal boleh apa saja.

Target pengguna: fitur tetap masuk akal dan lengkap, tapi dalam cakupan demo.

## Temuan di kode yang membentuk desain

- `rawStock` dan `finishedStock` hanya satu set, tidak per outlet. Secara efektif itu stok Sekulan RBT 519A.
- `sharedStock` (Rokok Brand A–E, Air mineral) adalah objek yang sama di kedua ledger. Kalau opname bahan baku dan opname barang dagangan sama-sama memuatnya, hitungan kedua menimpa yang pertama.
- Semua akun Kepala Toko (`budi.leader`, `rina.leader`, `taufik.leader`) ada di Sekulan RBT 519A. Riwayat outlet lain harus berupa data contoh.
- Pola filter outlet untuk Administrator sudah ada di Pesanan (`#orderOutletFilter` disembunyikan untuk Kepala Toko, terkunci ke `session.outlet`).
- Pola form inline sudah ada (`#requestFormPanel` + class `req-form-open` di `#inventory`), begitu juga halaman detail penuh (`section#closingReview` untuk BA tutup shift).
- `rupiah()` memotong nilai negatif ke 0 (`Math.max(0,n)`), jadi nilai selisih bertanda butuh formatter sendiri.
- Tabel data memakai `PAGE_SIZE=10` dengan pager dummy.

## Rantai keputusan

**Q1. Satu sesi opname mencakup apa?**
Satu jenis per sesi: Bahan baku atau Barang dagangan, sejajar dengan dua submenu stok. *(usulan Claude, tidak dikoreksi)*

**Q2. Item tersambung masuk cakupan mana?**
Hanya Barang dagangan, dengan badge "Siap jual". Dikeluarkan dari daftar Bahan baku saat opname supaya tidak dihitung dua kali. Karena objeknya sama, penyesuaian otomatis terlihat di kedua halaman stok. *(usulan Claude, tidak dikoreksi)*

**Q3. Apakah stok sistem berubah setelah opname?**
**Ya** (keputusan pengguna). Saat dikonfirmasi, qty ledger diganti dengan qty fisik, dan entri `SO-…` dicatat di Mutasi stok.

**Q4. Perlu persetujuan Administrator sebelum stok disesuaikan?**
Tidak (pengguna mengikuti rekomendasi). Persetujuan, status Draft, pembekuan Kasir selama opname, dan opname sebagian berada di luar cakupan.

**Q5. Kolom fisik kosong atau terisi?**
Awalnya pengguna memilih kosong (hitung buta). Setelah Claude menunjukkan konsekuensinya (17 baris bahan baku harus diisi manual saat demo), pengguna **mengubah keputusan: kolom fisik terisi dari qty sistem** supaya demo tidak repot.

**Q6. Bagaimana kalau ada kolom fisik yang kosong saat konfirmasi?**
**Semua baris wajib diisi** (keputusan pengguna). Karena kolom sudah terisi, ini hanya terjadi kalau pengguna sengaja mengosongkan sebuah kolom. Konfirmasi ditolak dengan toast.

**Q7. Catatan selisih.**
Label "Wajib diisi" muncul di baris yang selisihnya tidak nol, tanpa validasi (keputusan pengguna). Ditambah chip alasan cepat (Rusak, Kadaluarsa, Hilang, Salah input) yang mengisi kolom catatan. *(chip: usulan Claude)*

**Q8. Administrator.**
Hanya melihat, dengan dropdown outlet. Nilai awal Sekulan RBT 519A karena hanya outlet itu yang punya stok "hidup". *(nilai awal: usulan Claude, dalam kebebasan yang diberikan pengguna)*

**Q9. Isi riwayat dan detail.**
Riwayat menampilkan nilai selisih dalam Rupiah (qty selisih × `cost`). Detail adalah halaman penuh dengan filter "Hanya yang selisih". *(usulan Claude, tidak dikoreksi)*

**Q10. Tombol bantu di form.**
"Samakan semua dengan sistem" tidak dibutuhkan lagi setelah Q5. Diganti "Kembalikan ke stok sistem" untuk membatalkan isian saat demo. Baris yang diubah ditonjolkan (selisih +hijau / −merah), dan ada ringkasan berjalan di atas tombol konfirmasi. *(usulan Claude)*

**Q11. Kartu ringkasan.**
Submenu Stok opname mendapat kartu sendiri: jumlah opname bulan ini, opname terakhir, nilai selisih bulan ini. Entri `SO` ikut terhitung di "Total mutasi" pada Mutasi stok tanpa kartu baru. *(usulan Claude; di explore sempat disebut "kartu Mutasi stok mendapat hitungan SO", lalu dipersempit ke "ikut Total mutasi" supaya tidak menambah kartu)*

## Pendekatan yang dipertimbangkan (cara membangun)

**A. Form inline di dalam `#inventory` (pola Permintaan barang) + detail halaman penuh (pola BA tutup shift).** *(dipilih)*
Form hitung butuh lebar untuk 11–17 baris berkolom banyak. Pola `req-form-open` sudah menyembunyikan panel lain dan mengganti judul. Detail memakai `section.view` sendiri dengan tombol "← Kembali" seperti `#closingReview`. Biayanya: satu class CSS baru untuk mode form dan satu section baru.

**B. Form dan detail dalam modal (`openModal`).**
Paling sedikit markup, tapi `.modal` lebarnya maksimal 440px. Tabel 6 kolom × 17 baris jadi sempit dan perlu scroll di dua arah. Ditolak.

**C. Form dan detail sebagai section view baru di luar `#inventory`.**
Lebih bebas, tapi submenu sidebar harus menjaga status aktif saat berpindah view, dan pola `openSub` tidak mendukungnya untuk form. Ditolak, karena A sudah memakai pola yang terbukti.

Pengguna menyetujui ringkasan cakupan final yang memuat "Form opname (inline, pola Permintaan barang)" dan "Detail SO-0920-n (halaman penuh, pola BA tutup shift)", lalu menjalankan `/opsx:propose`.

## Cakupan final yang disetujui

```
Persediaan > Stok opname  (submenu 'opname'; Kepala Toko + Administrator)

Riwayat
  Kepala Toko : outlet sendiri, tombol "+ Mulai opname"
  Admin       : dropdown outlet (awal 519A), hanya lihat
  Kolom       : No. dok | Tanggal | Cakupan | Petugas | Item | Item selisih | Nilai selisih

Form opname (inline, pola Permintaan barang)
  Cakupan     : Bahan baku | Barang dagangan (+ item tersambung, badge Siap jual)
  Baris       : Item | Sistem (snapshot) | Fisik [terisi = sistem] | Selisih | Catatan
  Catatan     : label "Wajib diisi" bila selisih != 0, chip alasan cepat, tanpa validasi
  Tombol      : Kembalikan ke stok sistem | Konfirmasi
  Validasi    : kolom fisik kosong -> toast, konfirmasi ditolak

Konfirmasi
  -> qty rawStock/finishedStock = fisik (item tersambung cukup sekali)
  -> stockMoves += SO-0920-n
  -> riwayat += dokumen (Selesai)

Detail SO-0920-n (halaman penuh, pola BA tutup shift)
  Header: outlet, petugas, shift, cakupan, total nilai selisih
  Tabel : semua item + filter "Hanya yang selisih"

Data contoh: 3-5 dokumen per outlet untuk 2-3 outlet (dicek muat di halaman 1)

Di luar cakupan: persetujuan Admin, Draft, pembekuan Kasir, opname sebagian
```

## Pilihan kecil yang diserahkan ke builder (dicatat sebagai keputusan Claude)

- Posisi submenu "Stok opname" di sidebar: setelah "Mutasi stok", sebelum "Permintaan barang".
- Outlet dengan data contoh: Sekulan RBT 519A (4 dokumen), RM RBT 519B (3), Bawen 445B (3). Outlet lain menampilkan keadaan kosong, yang sekaligus memperlihatkan bahwa dropdown benar-benar memfilter.
- Detail terbuka dengan filter "Hanya yang selisih" aktif, supaya baris penting berada di halaman 1 meskipun pager dummy.
- Riwayat diberi chip cakupan (Semua / Bahan baku / Barang dagangan).
- Form menampilkan semua baris tanpa paging, karena setiap baris wajib dihitung.
