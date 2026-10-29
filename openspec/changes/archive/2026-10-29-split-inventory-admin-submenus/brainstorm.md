# Brainstorm: pisahkan Persediaan dan Admin menjadi submenu sidebar

Aplikasi: POS outlet (`index.html`, `app.js`, `styles.css`). Pusat Data Outlet tidak tersentuh.

## Latar belakang

Saat ini Persediaan dan Admin masing-masing adalah satu halaman yang menumpuk banyak modul:

- **Persediaan** (`section#inventory`): 3 kartu ringkasan (Stok menipis, Bahan baku, Transfer hari ini), tab "LPP bahan baku / LPP barang dagangan" yang mengganti isi satu tabel `#rawTable` lewat `activeLedger`, panel Riwayat mutasi (selalu tampil), panel Riwayat produksi (hanya di tab dagangan), panel Permintaan barang (selalu tampil), dan tombol "Transfer antar toko" di topbar.
- **Admin** (`section#admin`): 6 tab lewat `switchAdminTab()`, yaitu Shift & pengguna (kartu 3 shift + daftar pengguna + tabel BA tutup shift), Outlet, Master menu, Master login, Hak akses, dan Notifikasi owner. Kepala Toko hanya melihat tab `users` dan `outlets` (`ROLE_ACCESS`).

User ingin tiap modul punya submenu sendiri di navigasi, supaya halamannya tidak menumpuk dan aksesnya jelas per peran (Kepala Toko dan Administrator).

## Rantai keputusan

**Q1. Submenu Persediaan?**
Stok barang dagangan, Stok bahan baku, Mutasi stok, Permintaan barang (dari user).

**Q2. Submenu Admin?**
Outlet, Pengguna, Shift (dari user).

**Q3. Ke mana 4 tab Admin lain?**
- Master login digabung ke **Pengguna** (isinya tumpang tindih dengan daftar "Pengguna & akses outlet").
- Master menu **pindah ke Persediaan** sebagai submenu ke-5.
- Hak akses dan Notifikasi owner menjadi **submenu Admin**.

**Q4. Kartu ringkasan?**
Dibagi ke halaman yang relevan dan ditambah kartu lain yang relevan:

| Halaman | Kartu |
|---|---|
| Stok barang dagangan | Stok menipis, Jumlah item, Produksi hari ini, Item tersambung |
| Stok bahan baku | Stok menipis, Jumlah item, Nilai persediaan (qty x biaya), Stok masuk hari ini |
| Mutasi stok | Transfer hari ini, Produksi hari ini, Total mutasi |
| Permintaan barang | Menunggu persetujuan, PO belum diterima (Disetujui + PO dicetak), Selesai |
| Master menu | Jumlah menu, Kategori ("Menu dengan resep" dibuang atas permintaan user) |
| Outlet | Outlet terdaftar, Outlet aktif |
| Pengguna | Jumlah akun, Aktif / nonaktif, Per peran |
| Shift | Shift aktif, BA belum diperiksa, BA sudah diperiksa |

Kartu "Stok menipis" sekarang menghitung item tersambung sekali (lewat `Set`). Setelah dipisah, tiap halaman stok menghitung buku stoknya sendiri, jadi rokok/air mineral yang menipis muncul di kedua halaman. Ini disetujui.

**Q5. Riwayat produksi?**
Masuk ke Stok barang dagangan saja.

**Q6. Item tersambung (rokok, air mineral)?**
Tetap tampil di kedua halaman stok dengan badge "Tersambung". Tidak berubah.

**Q7. Akses Kepala Toko?**
- Tidak melihat submenu Pengguna (juga tidak melihat Hak akses dan Notifikasi owner, sama seperti sekarang).
- Master menu: **hanya lihat**, tanpa tambah/edit.
- Shift: tetap memeriksa BA tutup shift outletnya. Administrator hanya melihat BA.

**Q8. Bentuk navigasi?**
Submenu tampil di sidebar dan **selalu terbuka** (tanpa tombol buka-tutup). User menulis "B – sidebar yang terbuka"; ditafsirkan sebagai grup yang selalu terbuka di sidebar, dan tafsiran ini tidak dikoreksi user.

**Q9. Urutan sidebar dan halaman awal?**
Laporan dipindah ke posisi **paling atas**, lalu Persediaan, Pesanan, Admin. Halaman awal Kepala Toko dan Administrator tetap Laporan. Kasir tidak berubah (sidebar tetap tersembunyi).

Struktur akhir:

```
SIDEBAR                          Kepala Toko     Administrator
Laporan          <- landing           v                v
Persediaan
  Stok barang dagangan                v                v
  Stok bahan baku                     v                v
  Mutasi stok                         v                v
  Permintaan barang                   v                v
  Master menu                     lihat saja         kelola
Pesanan                               v                v
Admin
  Outlet                              v                v
  Pengguna (+ Master login)           x                v
  Shift (+ BA tutup shift)        periksa BA      lihat saja
  Hak akses                           x                v
  Notifikasi owner                    x                v
```

## Pendekatan

**A. Satu `section.view` per submenu.** Sekitar 10 section baru, tiap item sidebar punya `data-view` sendiri, `ROLE_ACCESS.views` langsung berisi submenu.
Paling bersih, tetapi perubahan HTML besar, `activeLedger` dan `switchAdminTab` dihapus, render stok/admin yang memakai elemen bersama harus dipecah, dan risiko regresi di `app.js` yang berlapis lebih tinggi.

**B. Section induk tetap, submenu memilih panel di dalamnya. (DIPILIH)**
`#inventory` dan `#admin` tetap ada. Item submenu sidebar membawa `data-view` + `data-sub`. Klik menampilkan section induk lalu memilih panel: untuk stok memakai `activeLedger` ('raw'/'finished') yang sudah ada, untuk admin memakai `switchAdminTab()`. Tab LPP dan tab Admin di halaman disembunyikan. Kartu ringkasan dirender per submenu ke satu `summary-grid`.
Perubahan paling kecil dan paling aman untuk demo; ID, render, dan handler yang ada dipakai ulang. Kekurangannya ada lapisan "submenu aktif" di atas view.

User memilih B mengikuti rekomendasi: logika yang dibutuhkan sudah ada, prototipe ini mengutamakan tampilan dan alur, dan hasil yang dilihat pengguna sama dengan A.

## Catatan untuk pembangun

- Detail BA tutup shift (`section#closingReview`) tetap halaman terpisah; tombol kembali (`backToClosings`) harus mendarat di Admin › Shift.
- Form "Buat permintaan barang" (`showRequestForm`) tetap di dalam submenu Permintaan barang.
- Daftar `staffUsers` (`#userList`) pindah dari tab Shift & pengguna ke submenu Pengguna, bersama tabel Master login. Tombol "+ Tambah pengguna" ikut ke Pengguna.
- Di Master menu, Kepala Toko tidak melihat tombol "+ Tambah menu" dan form detail menu tidak bisa disimpan.
- Di layar sempit (<=1050px dan <=760px) sidebar sudah punya mode ikon/bar bawah; submenu perlu tetap bisa dipakai di sana (penyelesaian diserahkan ke desain).
