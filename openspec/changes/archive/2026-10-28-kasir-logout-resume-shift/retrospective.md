# Retrospective: kasir-logout-resume-shift

> Tanggal: 2026-10-28
> Worktree: folder proyek langsung (`D:\WORK\Personal\PAM\SekulanRBT_Resto\application`), branch `develop`
> Skema: superpowers-bridge

## 0. Evidence

- **Commit count**: 0. Perubahan belum di-commit karena user belum meminta.
- **Diff size**: `git diff --stat -- app.js index.html`: 2 file, 8 baris ditambah, 5 dihapus. Kode ditulis padat, jadi jumlah baris tidak mencerminkan ukuran perubahan.
- **Tasks**: 12/12 selesai (`openspec instructions apply`: `all_done`).
- **Active hours**: satu sesi (explore → propose → apply → verify → archive).
- **Subagent dispatches**: 1 (review independen, kode saja). Hasilnya 0 defect dan 1 temuan lama di luar cakupan.
- **New external dependencies**: 0.
- **Post-merge bugs**: N/A (belum di-merge).
- **OpenSpec validate**: 7/7 valid saat verify.
- **Test signal**: skrip CDP Edge headless 30/30 PASS, 0 error console.
- **Commit chain**: tidak ada.

## 1. Wins

- Sesi explore menemukan akar masalah sebelum merancang: `#logoutButton` sudah ada tetapi tersembunyi oleh `body.role-kasir .sidebar{display:none}` (styles.css:15). Perubahannya jadi kecil, cukup satu tombol di header, tanpa CSS baru.
- D2 (memulihkan `openingCash` alih-alih mengubah `expectedCash`) membuat alur tutup shift tidak tersentuh sama sekali. Uji "4 expectedCash sama" membuktikan rekap tetap benar.
- Review independen dijalankan kali ini. Ini menindaklanjuti kandidat yang muncul di dua retro sebelumnya ("Mode dikerjakan sendiri wajib ditutup review independen").
- Skrip CDP dari change sebelumnya bisa dipakai ulang polanya. Menulis skrip baru untuk 30 cek memakan waktu kurang dari 15 menit.

## 2. Misses

- 🟡 Precheck verify menganggap proyek tanpa git berdasarkan memori `no-git-local-project`, padahal folder ini sekarang repo git (remote `sekulanrbt-pos-demo`, 3 commit). Memori itu usang. Bukti: `git status` menunjukkan `M app.js`, `M index.html`.
- 📌 Run pertama skrip uji gagal karena helper bernama `closed` bertabrakan dengan `window.closed` bawaan browser (read-only). Kesalahan ada di skrip uji, bukan di aplikasi.
- 📌 Spec `shift-opening` sudah usang di dua tempat (bukan dari change ini): skenario "Kepala Toko login" masih menyebut view Kasir, dan validasi serah terima/catatan di `#verifyStart` tidak diterapkan di kode.

## 3. Plan deviations

| Plan task | What changed | Why |
|-----------|--------------|-----|
| 1.2 / 2.6 / 3.4 (verifikasi manual) | Dijalankan lewat skrip CDP di Edge headless, bukan diklik manual | Tidak ada test suite. Skrip memberi bukti yang bisa diulang. |
| Spec `kasir-logout` | Skenario "Pelanggan Umum" diganti menjadi "Pelanggan" "Umum" | Saat propose, grep `renderCartHeader` menunjukkan label UI yang sebenarnya |

## 4. Skill / workflow compliance

| Skill                                            | Used |
|--------------------------------------------------|------|
| superpowers:brainstorming                        | ✓ (explore + approach A/B/C dipilih user) |
| superpowers:writing-plans                        | ✓ |
| superpowers:using-git-worktrees                  | ✗ |
| superpowers:subagent-driven-development          | ✗ |
| (transitive) superpowers:test-driven-development | ✗ |
| (transitive) superpowers:requesting-code-review  | ~ (1 review independen di akhir, bukan per task) |
| superpowers:finishing-a-development-branch       | ✗ |

### Deliberately Skipped Skills

- **What was skipped**: using-git-worktrees dan finishing-a-development-branch.
  - **Why this cycle**: memori `no-git-local-project` mengarahkan untuk mengerjakan langsung di folder proyek. Fakta bahwa folder ini kini repo git baru terlihat saat precheck verify. Working tree juga sudah berisi perubahan dari change sebelumnya yang belum di-commit, jadi worktree dari `HEAD` tidak akan memuat kondisi terbaru.
  - **How to prevent recurrence**: `scope-judgment rule`. Perbarui memori: proyek kini repo git, dan commit/branch hanya dilakukan atas permintaan user. Setelah working tree bersih, worktree bisa dipakai lagi.
- **What was skipped**: subagent-driven-development (dan TDD transitif).
  - **Why this cycle**: plan hanya 2 task yang saling bergantung pada global `openShift`, dengan diff 13 baris. User menerima rekomendasi "Native" saat propose. Tidak ada test suite untuk TDD, dan skrip CDP menggantikan siklus red-green.
  - **How to prevent recurrence**: `one-off — schema boundary case`. Prototipe statis tanpa test runner, untuk perubahan di bawah sekitar 3 task. Review independen di akhir tetap dijalankan.

## 5. Surprises

- `#logoutButton` sudah ada sejak awal. Masalahnya ada di visibilitas, bukan fitur yang hilang.
- Repo yang dianggap tanpa git ternyata punya remote GitHub.

## 6. Promote candidates → long-term learning

- [ ] 🟡 **Memori no-git sudah usang** → **Promote to** memory (perbarui `no-git-local-project`)
  > **Why**: precheck verify dan langkah worktree mengambil keputusan dari memori yang salah.
  > **How to apply**: saat verify/retro/apply membutuhkan git, cek `git status` dulu. Jangan langsung menandai N/A.
- [ ] 📌 **Hindari nama global bawaan browser di skrip CDP** (`closed`, `name`, `status`, `open`) → **Promote to** one-off
  > **Why**: assignment ke `window.closed` diam-diam diabaikan, lalu skrip gagal dengan "is not a function".
  > **How to apply**: beri awalan helper skrip uji, misalnya `isClosed`, `tName`.
- [ ] 🟡 **Validasi `#verifyStart` belum sesuai spec `shift-opening`** → **Promote to** change baru
  > **Why**: spec mewajibkan centang serah terima dan catatan saat ada selisih, tetapi kode tidak memeriksanya.
  > **How to apply**: saat menyentuh alur Mulai Shift lagi, atau sebagai change kecil terpisah.
