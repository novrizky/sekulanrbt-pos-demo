# Spec Delta

## ADDED Requirements

### Requirement: Pembatalan item tersimpan di order memerlukan otorisasi Kepala Toko
Saat sebuah order terpilih di Kasir, item yang sudah tersimpan di order SHALL NOT memiliki tombol −/+. "Batalkan" pada item tersebut SHALL membuka modal "Batalkan item?" dengan alasan, catatan, jumlah yang dibatalkan (1 sampai qty tersimpan), serta username dan kata sandi Kepala Toko. Pembatalan SHALL diterima hanya dengan kredensial Kepala Toko aktif untuk outlet dan shift kasir yang sedang berjalan. Aturan catatan untuk alasan "Lainnya" tetap berlaku.

#### Scenario: Membatalkan sebagian qty dengan otorisasi
- **WHEN** Kasir memilih "ORD-0920-002", membatalkan 5 dari Nasi Box 30K ×30 dengan alasan "Perubahan pesanan pelanggan" dan kredensial `budi.leader` / `demo123` di Shift 1
- **THEN** item order menjadi Nasi Box 30K ×25, total order berkurang Rp150.000, satu baris histori pembatalan bertambah, dan toast "Cancel tercatat. Peringatan dikirim ke owner." tampil

#### Scenario: Kredensial tidak valid
- **WHEN** Kasir mengisi kata sandi selain `demo123`
- **THEN** toast "Kredensial Kepala Toko tidak valid" tampil, modal tetap terbuka, dan item order tidak berubah

#### Scenario: Bukan Kepala Toko shift aktif
- **WHEN** Kasir Shift 1 mengisi kredensial `rina.leader` / `demo123` (Kepala Toko Shift 2)
- **THEN** toast "Hanya Kepala Toko Shift 1 (Budi Santoso) yang dapat menyetujui pembatalan ini" tampil dan item order tidak berubah

#### Scenario: Pembatalan menimbulkan lebih bayar
- **WHEN** Kasir membatalkan item tersimpan dari order yang sudah lunas
- **THEN** status bayar order menjadi "Lebih bayar" dan cart menampilkan baris "Lebih bayar" dengan selisihnya

#### Scenario: Item baru di mode order tidak perlu otorisasi
- **WHEN** Kasir membatalkan item yang baru ditambahkan ke order dan belum disimpan
- **THEN** modal pembatalan biasa (tanpa kredensial Kepala Toko) tampil dan pembatalan tercatat seperti transaksi Umum
