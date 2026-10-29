## Context

Perubahan ini hanya menyentuh POS outlet (`index.html`, `app.js`, `styles.css`). Master menu adalah submenu Persediaan (`article[data-subs="menus"]`) yang dirender oleh `renderMasterMenus()` dan memakai modal `menuForm(edit)`. Data menu ada di `menuData`, sebuah map kategori → array posisional `[nama, harga, deskripsi, labelGambar]`, dan dibaca langsung oleh Kasir (`renderMenu`), form Pesanan (`renderOrderForm`), pemilih fee rokok (`rokokPickerHtml`), dan `menuPrice`.

Masalah yang ada sekarang: kode dihitung dari posisi, status tidak punya data, Simpan pada Detail menambah duplikat, dan tabel tidak punya filter atau pencarian. Kepala Toko punya akses `menus` di `ROLE_ACCESS`, tetapi `menuReadOnly()` mengunci seluruh form.

Fungsi yang diubah masing-masing hanya punya **satu** definisi di `app.js` (sudah diperiksa): `renderMenu` (baris 18), `menuForm` (165), `renderMasterMenus` (181), `rokokPickerHtml` (261), `renderOrderForm` (275), `SUB_CARDS.menus` (34). Handler `#saveMenu` dipasang sekali di dalam `menuForm`. Tidak ada salinan mati yang perlu dihapus.

## Goals / Non-Goals

**Goals:**
- Status aktif/nonaktif per menu yang bisa diubah dari popup Detail, dan menu nonaktif hilang dari tempat penjualan.
- Kode menu tetap (stabil) dan field kode barcode.
- Filter kategori, filter status, dan pencarian (kode, nama, barcode) di tabel Master menu.
- Edit menu benar-benar mengubah item, bukan menambah duplikat.
- Kepala Toko bisa mengubah status aktif; field lain tetap terkunci baginya.

**Non-Goals:**
- Persistensi, backend, status per outlet.
- Pencarian/scan barcode di Kasir.
- Paging nyata (pager tetap contoh).
- Pembersihan data turunan (order lama, fee rokok tersimpan, stok) saat menu dinonaktifkan.

## Decisions

### D1: Kolom baru di akhir array menu
- **Choice**: Setiap item `menuData` menjadi `[nama, harga, deskripsi, labelGambar, kode, barcode, aktif]`. Indeks baru: `x[4]` kode (`'MNU-PA01'`), `x[5]` barcode (string, `''` bila kosong), `x[6]` aktif (boolean). Kolom ini diisi sekali tepat setelah deklarasi `menuData` lewat loop inisialisasi: kode memakai rumus lama `MNU-${cat.slice(0,2).toUpperCase()}${urutan 2 digit}`, barcode dari map kecil `MENU_BARCODES` (nama → barcode), dan aktif `true` kecuali `'Seafood 100K'` dan `'Jeruk hangat'`.
- **Pembaca indeks baru**: `renderMasterMenus` (x[4], x[5], x[6]), `menuForm` (melalui objek edit), `renderMenu`/`renderOrderForm`/`rokokPickerHtml` (x[6]), `SUB_CARDS.menus` (x[6]). Pembaca lama `x[0..3]` tidak berubah.
- **Rationale**: Sesuai konvensi array posisional (tambah di akhir) dan tidak menyentuh pembaca lama.
- **Alternatives considered**: map `menuMeta` berbasis nama (rapuh terhadap rename, satu global lagi); mengubah ke objek (terlalu banyak pembaca yang berubah).

### D2: Helper `menuActive(x)` dan penyaringan di tiga tempat penjualan
- **Choice**: `const menuActive=x=>x[6]!==false;`. `renderMenu` dan `renderOrderForm` menambah `.filter(menuActive)` sebelum filter teks. `rokokPickerHtml` memakai `menuData.Rokok.filter(menuActive)`. Tab kategori tetap tampil walaupun semua isinya nonaktif.
- **Rationale**: `!==false` membuat item yang dibuat tanpa kolom ke-7 tetap dianggap aktif. Satu helper dipakai di semua titik.
- **Alternatives considered**: menyembunyikan tab kategori kosong (logika tambahan, tidak diminta).

### D3: Hak toggle dari `ROLE_ACCESS`
- **Choice**: Tambah `const canToggleMenu=()=>{const s=ROLE_ACCESS[session?.role]?.subs;return s==='all'||!!s?.includes?.('menus')}`. Aturannya:
  - Mode **Detail** (dari tabel Master menu): toggle bisa diubah bila `canToggleMenu()`. Field lain dikunci bila `menuReadOnly()` (Kepala Toko).
  - Mode **Tambah**: toggle selalu bisa diubah oleh siapa pun yang bisa membuka form Tambah (Administrator dari Master menu, Kasir dari tombol "＋ Tambah menu" di Kasir). Default tercentang.
- **Rationale**: Mengikuti permintaan "jika memiliki akses ke master menu" tanpa mengikat ke nama role.
- **Rationale**: Mengikuti permintaan "jika memiliki akses ke master menu" tanpa mengikat ke nama role.
- **Alternatives considered**: cek `session.role==='Kepala Toko'` (mengikat ke nama role, tidak mengikuti perubahan akses).

### D4: `menuForm` dengan mode Tambah / Detail
- **Choice**: `menuForm(edit)` menerima `{cat, i}` (bukan objek salinan) lalu membaca `menuData[cat][i]`. Form menambah field "Kode barcode" (`#menuBarcode`, placeholder "Contoh: 8991234567890") di `form-grid` setelah "Kode menu", dan baris `label.check-row` dengan `#menuActive` ("Menu aktif — tampil di Kasir dan form order"). Simpan:
  - **Tambah**: `push([nama, harga, desk, label, kode, barcode, aktif])`. Kode yang dibiarkan `'MNU-'` diganti otomatis dengan kode berikutnya di kategori itu. Toast tetap "`<nama>` tersimpan di master menu".
  - **Detail, Administrator**: tulis ulang item. Bila kategori berubah, `splice` dari array lama lalu `push` ke array baru. Toast "`<nama>` diperbarui".
  - **Detail, Kepala Toko**: semua field kecuali `#menuActive` disabled. Tombol "Batal" + "Simpan status". Simpan hanya mengubah `x[6]`. Toast "`<nama>` dinonaktifkan" atau "`<nama>` diaktifkan".
  Setelah simpan: `renderCategories(); renderMenu(); renderMasterMenus(); closeModal()`.
- **Rationale**: Memperbaiki bug duplikat dengan perubahan sekecil mungkin; satu modal untuk semua mode.

### D5: Toolbar filter & pencarian
- **Choice**: Di `index.html`, sisipkan di antara `.panel-head` dan `#masterMenuTable` sebuah `div.order-toolbar.stock-filter` berisi: `span.filter-label` "Kategori" + dropdown `select#menuCatFilter` (opsi "Semua" + `Object.keys(menuData)`, `.onchange` dipasang sekali di blok handler global), `span.filter-label` "Status" + `div.order-chips#menuStatusFilter` (Semua/Aktif/Nonaktif, statis di HTML), dan `label.search` dengan `input#masterMenuSearch` placeholder "Cari kode, nama, atau barcode...". State global: `let menuCatFilter='Semua',menuStatusFilter='Semua',menuQuery='';`. `renderMasterMenus` menyaring baris lalu memasang `.onclick` chip; `#masterMenuSearch.oninput` dipasang sekali di bagian handler global. Hasil kosong → `<div class="empty-cart">Tidak ada menu sesuai filter</div>` (pola sama dengan tabel stok).
- **Rationale**: Memakai ulang gaya chip/label/search yang sudah ada.
- **Alternatives considered**: chip kategori seperti filter stok (awalnya dipilih, lalu diganti dropdown atas permintaan pengguna agar toolbar lebih ringkas).

### D6: Kolom tabel & ringkasan
- **Choice**: Header tabel menjadi `['KODE','NAMA MENU','KATEGORI','BARCODE','HARGA','STATUS','AKSI']`. Status memakai `<span class="ok">Aktif</span>` / `<span class="low">Nonaktif</span>` (badge yang sama dengan tabel stok). `setPager` memakai jumlah hasil filter. `SUB_CARDS.menus` menjadi tiga kartu: "Jumlah menu" (jumlah aktif, keterangan "Aktif"), "Nonaktif" (jumlah nonaktif, keterangan "Tidak tampil di Kasir"), dan "Kategori".
- **Rationale**: Badge dan kartu ringkasan sudah ada polanya.

### D7: Teks panel Hak akses
- **Choice**: Ganti "Persediaan (Master menu hanya dapat dilihat)" menjadi "Persediaan (Master menu hanya dapat dilihat, kecuali mengubah status aktif menu)" di `#adminAccess` `index.html`.

## Risks / Trade-offs

- [Risk] `menuData` global untuk semua outlet, jadi nonaktif di satu outlet berlaku di semua → Mitigation: diterima untuk demo, dicatat sebagai non-goal.
- [Risk] Kode baru yang diketik manual bisa sama dengan kode lain → Mitigation: tidak divalidasi (validasi ketat di luar fokus demo).
- [Risk] Fee rokok tersimpan untuk merek yang lalu dinonaktifkan tidak tampil saat modal dibuka ulang → Mitigation: diterima, edge case data.
- [Trade-off] Kategori yang semua menunya nonaktif tetap tampil sebagai tab kosong di Kasir → Alasan: lebih sederhana, jarang terjadi di demo.
- [Trade-off] Pager tetap contoh → Alasan: konsisten dengan tabel lain.

## Migration Plan

N/A. Prototipe statis tanpa deployment; reload mengembalikan data awal.

## Open Questions

Tidak ada. Semua keputusan sudah dikonfirmasi atau dicatat sebagai keputusan Claude di brainstorm.md.
