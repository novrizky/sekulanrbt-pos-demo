# Retrospective: shift-closing-review

> Tanggal: 2026-10-28
> Worktree: folder proyek langsung (`D:\WORK\Personal\PAM\SekulanRBT_Resto\application`), branch `develop`
> Skema: superpowers-bridge

## 0. Evidence

- **Commit count**: 0. Perubahan belum di-commit karena user belum meminta.
- **Diff size**: `git diff --stat -- app.js index.html styles.css` = 3 file, +22/−10. Angka ini termasuk change `kasir-logout-resume-shift` yang juga belum di-commit. Bagian change ini: `app.js` 5 fungsi atau data baru dan 1 fungsi dihapus (`closeShiftBA`), `index.html` 4 teks, `styles.css` 1 baris. Kode ditulis padat, jadi jumlah baris tidak mencerminkan ukuran perubahan.
- **Tasks**: 18/18 (`all_done`).
- **Active hours**: satu sesi (explore → artefak → apply → verify).
- **Subagent dispatches**: 1 review independen. Hasil: 0 defect, 1 catatan escaping yang langsung diperbaiki.
- **New external dependencies**: 0.
- **Post-merge bugs**: N/A.
- **OpenSpec validate**: 8/8 valid saat verify.
- **Test signal**: suite CDP baru 47/47 PASS dan suite regresi `kasir-logout-resume-shift` 31/31 PASS, tanpa error console.
- **Commit chain**: tidak ada.

## 1. Wins

- Permintaan 11 poin dipecah jadi keputusan Q1–Q14 di sesi explore. Dengan begitu, semua artefak bisa dibuat sekaligus tanpa bolak-balik.
- Pola yang sudah ada dipakai ulang, bukan membuat komponen baru: `.req-modal`, `.ba-summary`, `.approver-row`, `.handover-box`, `tableHtml`, `esc()`, dan validasi toast lama.
- Urutan "akhiri sesi dulu, baru modal sukses" (D3) menghilangkan keadaan setengah tertutup. Ini dibuktikan oleh uji "2 backdrop -> login".
- Suite regresi dari change sebelumnya ikut dijalankan dan menangkap integrasi: record BA memakai modal awal yang dipulihkan setelah logout dan lanjut shift.
- Review independen kembali dijalankan, sesuai kandidat dari retro sebelumnya.

## 2. Misses

- 🟡 **Lokasi panel BA salah sebut di sesi explore.** Saya menyebut panel ada di "Laporan (app.js:96–98)", padahal baris itu ada di `renderAdmin()` dan HTML-nya di tab Admin › Shift & pengguna (index.html:171). Kesalahan baru ketahuan saat propose, sehingga user perlu ditanya ulang. Bukti: pertanyaan "Lokasi" di percakapan.
- 🟡 **Risiko TDZ tidak terlihat di design D4.** D4 merencanakan `renderClosings()` (yang membaca `session`) dipanggil dari `renderAdmin()`, padahal `renderAdmin()` dijalankan di level atas (app.js:125) sebelum `let session` (app.js:167). Ditemukan saat apply sebelum ada kode yang ditulis, lalu dicatat di design.
- 📌 **Asumsi uji lebar 400px salah.** Uji awal mengasumsikan halaman Admin muat di 400px, padahal versi HEAD sudah 452px. Butuh dua iterasi skrip, salah satunya karena elemen diukur setelah modal ditutup.
- 📌 **Validator menolak spec delta pertama.** Blok MODIFIED harus mempertahankan semua nama skenario lama.
- 📌 **Heredoc Git Bash gagal dua kali** untuk isi panjang (spec dan body uji), lalu diganti dengan tool Write. Penyebab pastinya tidak diselidiki.

## 3. Plan deviations

| Plan task | What changed | Why |
|-----------|--------------|-----|
| 3.1 (`renderClosings` dari `renderAdmin`) | Dipanggil dari `loginAs()`, `finishClosing()`, dan handler tandai | TDZ pada `session` (lihat Misses) |
| Global constraint "styles.css tidak diubah" | Ditambah `.req-modal .data-table{min-width:600px}`, dan modal dibungkus `.req-modal` | Kolom TOTAL terpotong di desktop (screenshot `3-review.png`) |
| 3.2 | Catatan kasir dan BA di-escape dengan `esc()` | Temuan review independen |
| Langkah verifikasi | Dijalankan lewat skrip CDP, dan suite regresi lama disesuaikan di langkah 5 | Tidak ada test suite. Form BA memang dihapus dari alur Kasir |

## 4. Skill / workflow compliance

| Skill                                            | Used |
|--------------------------------------------------|------|
| superpowers:brainstorming                        | ✓ (explore + brainstorm.md; user meminta semua artefak, sehingga pendekatan A ditetapkan sebagai keputusan perancang) |
| superpowers:writing-plans                        | ✓ |
| superpowers:using-git-worktrees                  | ✗ |
| superpowers:subagent-driven-development          | ✗ |
| (transitive) superpowers:test-driven-development | ✗ |
| (transitive) superpowers:requesting-code-review  | ~ (1 review independen di akhir) |
| superpowers:finishing-a-development-branch       | ✗ |

### Deliberately Skipped Skills

- **What was skipped**: using-git-worktrees dan finishing-a-development-branch.
  - **Why this cycle**: working tree masih berisi perubahan `kasir-logout-resume-shift` yang belum di-commit (`git status`: `M app.js`, `M index.html`), dan change ini dibangun di atasnya (`openShift`). Worktree dari `HEAD` tidak akan memuat fondasi itu. Memori `no-git-local-project` juga menetapkan commit dan worktree hanya atas permintaan user.
  - **How to prevent recurrence**: `scope-judgment rule`. Sama seperti siklus sebelumnya. Bila user mulai commit per change, worktree bisa dipakai lagi.
- **What was skipped**: subagent-driven-development (dan TDD transitif).
  - **Why this cycle**: 3 task di plan saling bergantung pada data dan fungsi yang sama (`shiftClosings` dipakai `finishClosing` dan `renderClosings`). Tidak ada test runner untuk siklus red-green. User menerima rekomendasi "Native".
  - **How to prevent recurrence**: `one-off — schema boundary case`, prototipe tanpa test runner. Pola ini muncul ketiga kalinya (lihat §6).

## 5. Surprises

- Panel yang dianggap "di Laporan" ternyata ada di Admin.
- `renderAdmin()` dijalankan saat load, sebelum deklarasi `session`.
- Overflow horizontal di 400px (Admin 452px, Persediaan 753px) sudah ada sejak HEAD.
- Setelah `endSession`, modal tetap bisa tampil di atas layar login (z-index 105 > 100). Ini menjadi dasar alur sukses yang aman.

## 6. Promote candidates → long-term learning

- [ ] 🟡 **Pastikan lokasi UI dari HTML sebelum menyebutnya ke user** → **Promote to** one-off (kebiasaan kerja)
  > **Why**: salah sebut lokasi panel membuat user memutuskan berdasarkan asumsi yang keliru.
  > **How to apply**: saat menyebut "panel X ada di view Y", cek `section#<view>` yang memuat elemennya di index.html.
- [ ] 🟡 **Fungsi render yang dipanggil di level atas app.js tidak boleh membaca `session`** → **Promote to** CLAUDE.md (bagian "Gotcha: app.js is layered")
  > **Why**: `renderAdmin()`, `renderInventory()`, dan `renderReports()` dijalankan saat load (app.js:125) sebelum `let session` (app.js:167), sehingga membaca `session` di dalamnya menyebabkan TDZ.
  > **How to apply**: render yang bergantung pada role dipanggil dari `loginAs()`, bukan dari render awal.
- [ ] 📌 **Delta MODIFIED wajib mempertahankan semua nama skenario lama** → **Promote to** memory (project)
  > **Why**: `openspec validate` menolak blok MODIFIED yang mengganti nama skenario.
  > **How to apply**: saat menulis MODIFIED, salin nama skenario lama, lalu ubah isinya. Skenario yang memang tidak relevan lagi dipindah ke REMOVED atau requirement baru.
- [ ] 🟡 **Overflow horizontal Admin dan Persediaan di layar sempit** → **Promote to** change baru
  > **Why**: halaman melebar ke 452px dan 753px pada lebar 400px, sudah ada di HEAD.
  > **How to apply**: change kecil terpisah untuk tampilan mobile.
- [ ] 🟡 **Validasi `#verifyStart` belum sesuai spec `shift-opening`** (dibawa dari retro `kasir-logout-resume-shift`) → **Promote to** change baru
  > **Why**: masih terbuka. Centang serah terima dan catatan saat ada selisih tidak divalidasi.
  > **How to apply**: change kecil terpisah.
