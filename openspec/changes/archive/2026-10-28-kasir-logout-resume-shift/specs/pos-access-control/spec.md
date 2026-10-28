## MODIFIED Requirements

### Requirement: Menu yang dapat diakses Kasir
Pengguna dengan role Kasir SHALL hanya dapat mengakses view Kasir. Sidebar SHALL disembunyikan untuk role Kasir sehingga view Kasir memakai lebar penuh layar. Setelah login, layar Mulai Shift SHALL tampil lebih dulu, dan view Kasir SHALL terbuka setelah Kasir memulai shift. Bila Kasir masih memiliki shift terbuka, view Kasir SHALL langsung terbuka tanpa layar Mulai Shift.

#### Scenario: Kasir login
- **WHEN** Ayu Setiani login sebagai Kasir tanpa shift terbuka
- **THEN** layar "Mulai Shift" tampil sebelum POS dapat dipakai

#### Scenario: Kasir memulai shift
- **WHEN** Ayu Setiani memulai shift dari layar "Mulai Shift"
- **THEN** view Kasir aktif dan sidebar tidak tampil, termasuk menu "Persediaan", "Laporan", dan "Admin"

#### Scenario: Kasir melanjutkan shift
- **WHEN** Ayu Setiani logout tanpa tutup shift lalu login kembali sebagai Kasir
- **THEN** view Kasir langsung aktif dan sidebar tidak tampil

#### Scenario: Sidebar tampil kembali untuk role lain
- **WHEN** sesi Kasir diakhiri, lalu Budi Santoso login sebagai Kepala Toko
- **THEN** sidebar tampil kembali dengan menu sesuai role Kepala Toko
