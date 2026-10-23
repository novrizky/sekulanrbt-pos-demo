# Design

## Context

Pembatalan item di POS ditangani `openCancel(i)` di `app.js`. Fungsi ini dideklarasikan dua kali. Versi yang berlaku adalah deklarasi terakhir di baris 99, sedangkan salinan di baris 21 sudah mati. Handler `#confirmCancel` di dalamnya menambah baris ke `cancelLog` (array posisional 7 kolom: `[ID, WAKTU, SHIFT, ITEM, ALASAN, KASIR, STATUS]`) lalu memanggil `renderCart()`, `renderCancelHistory()`, `closeModal()` dan `showToast(...)`. Nilai `#cancelNote` saat ini tidak dibaca sama sekali.

## Goals / Non-Goals

**Goals:**
- Menolak pembatalan beralasan "Lainnya" tanpa catatan.
- Menyimpan catatan kasir ke histori pembatalan.

**Non-Goals:**
- Mengubah bentuk `cancelLog`, `renderCancelHistory`, atau paket data ZIP di hub.
- Menghapus salinan mati `openCancel` di baris 21 atau mengganti nama kasir dan waktu yang masih hard-coded.

## Decisions

### Decision 1: Ubah hanya `openCancel` terakhir (baris 99)

Validasi ditambahkan di awal handler `$('#confirmCancel').onclick` pada deklarasi terakhir. Handler membaca `const reason=$('#cancelReason').value,note=$('#cancelNote').value.trim()`. Jika `reason==='Lainnya'&&!note`, handler langsung `return showToast('Catatan kasir wajib diisi untuk alasan Lainnya')` sebelum `cart.splice`, sehingga modal tetap terbuka dan keranjang tidak berubah. Pola `return showToast(...)` ini sudah dipakai di handler lain (`#staffName`, `#menuName`). Salinan mati di baris 21 dibiarkan karena di luar cakupan.

### Decision 2: Catatan digabung ke kolom ALASAN, bukan kolom baru

Kolom ALASAN (indeks 4) diisi `note?`${reason} — ${note}`:reason`. Pilihan ini dibandingkan dengan menambah kolom ke-8 di akhir array:
- Penggabungan tidak menyentuh `renderCancelHistory`, header tabel, maupun data contoh.
- Catatan langsung terlihat oleh Kepala Toko di tabel yang sudah ada.

Kolom terpisah baru diperlukan jika nanti catatan harus diekspor tersendiri ke `cancel.csv`, dan itu di luar cakupan perubahan ini.
