# Spec Delta

## MODIFIED Requirements

### Requirement: Menu yang dapat diakses Kasir
Pengguna dengan role Kasir SHALL hanya melihat menu Kasir dan Persediaan. Setelah login, layar Mulai Shift SHALL tampil lebih dulu, dan view Kasir SHALL terbuka setelah Kasir memulai shift.

#### Scenario: Kasir login
- **WHEN** Ayu Setiani login sebagai Kasir
- **THEN** layar "Mulai Shift" tampil sebelum POS dapat dipakai

#### Scenario: Kasir memulai shift
- **WHEN** Ayu Setiani memulai shift dari layar "Mulai Shift"
- **THEN** sidebar hanya menampilkan menu "Kasir" dan "Persediaan", dan view Kasir aktif
