# Tasks

## 1. POS outlet — app.js

- [x] 1.1 Di `closeShiftAuth()` (satu-satunya definisi, dipanggil dari handler terakhir `$('#closeShift').onclick`), beri `value="${leader?.username||''}"` pada input `#authUser` dan `value="demo123"` pada input `#authPass`; validasi di `#verifyLeader` tidak diubah. Verifikasi: cari `closeShiftAuth` dan pastikan tidak ada definisi lain.
- [x] 1.2 Verifikasi manual di browser: buka `index.html`, login `ayu.kasir` / `demo123`, mulai shift, tekan "Tutup shift" → modal menampilkan "Shift 1 · Kepala Toko: Budi Santoso" dengan username `budi.leader` dan kata sandi terisi; tekan "Verifikasi" langsung → form BA tampil dengan "Diperiksa oleh: Budi Santoso (Kepala Toko)".
- [x] 1.3 Verifikasi manual penolakan masih jalan: ganti username menjadi `rina.leader` → toast "Hanya Kepala Toko Shift 1 (Budi Santoso) yang dapat menutup shift ini"; kosongkan kata sandi → toast "Username dan kata sandi Kepala Toko wajib diisi".