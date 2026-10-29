# Retrospective: production-multi-material

> Written: 2026-10-29 (after verify passed with warnings)
> Commit range: none (implementasi belum di-commit atas keputusan user)
> Worktree: main checkout `D:\WORK\Personal\PAM\SekulanRBT_Resto\application`, branch `develop`

---

## 0. Evidence

- **Commit range**: tidak ada (0 commit untuk change ini; `aedf6a0` di atas `master` milik pekerjaan sebelumnya)
- **Diff size**: +25 / −10 baris di 3 file (`app.js` +15/−8, `index.html` +5/−2, `styles.css` +5/−0), diukur dari snapshot `.superpowers/sdd/plan/base/`. Baris di app.js sangat panjang, jadi jumlah baris kurang mencerminkan ukuran perubahan.
- **Tasks done**: 21/21
- **Active hours**: tidak diukur (dua sesi apply dalam satu percakapan, 2026-10-28 dan 2026-10-29)
- **Subagent dispatches**: 8 (implementer T1/T2/T3, task review T1/T2/T3, re-review T1 fix round 1, final review Opus) + 1 resume implementer untuk fix round
- **New external dependencies**: none. Harness memakai Chrome yang sudah terpasang di mesin dan tidak masuk ke proyek.
- **Bugs encountered post-merge**: n/a (belum di-merge)
- **OpenSpec validate state at archive**: pass (`openspec validate --all` → 9/9 valid, saat verify)
- **Test coverage signal**: 75 asersi acceptance headless-Chrome, PASS 75/75 (`.superpowers/sdd/plan/harness/run.sh all`)

Commit chain (chronological):

```
(tidak ada commit — perubahan masih di working tree)
```

---

## 1. Wins

- Bukti otomatis untuk prototipe tanpa test suite. Harness `harness/run.sh` + `test.js` dibangun dari skenario spec dan menjalankan `index.html` asli di Chrome headless (`--dump-dom`). Siklusnya RED (4/16 lalu 62/2) ke GREEN (62/62 lalu 75/75). Harness ini juga memeriksa nilai persis: toast, Rp, kode PRD, lebar modal ≥700px.
- Review per task menangkap kesalahan nyata. Handler mati `#stockIn` di app.js:113 terlewat oleh implementer Task 1, ditemukan reviewer, lalu diperbaiki dalam fix round 1/5 (§0).
- Jebakan "app.js berlapis" tertangani. Edit dilakukan pada `renderInventory` dan handler `#stockIn` yang terakhir (`app.js:163`), dan final review mengonfirmasi tidak ada referensi tersisa ke `#productionIssue`/`tats` kecuali salinan mati yang memang dibiarkan.
- Pola UI dipakai ulang. Modal memakai `.req-modal` untuk lebar 760px, dan tabel riwayat memakai `tableHtml`, jadi CSS baru hanya 5 aturan `.prod-modal`.

## 2. Misses

- 🟡 [painful | evidence: verify.md §5] Schema superpowers-bridge mengasumsikan worktree, commit per task, dan PR, sedangkan preferensi user adalah tidak commit atau membuat worktree tanpa diminta. Review package harus diganti dengan diff dari snapshot (`pkg.sh`), dan pemeriksaan tanda implementasi di verify tidak bisa terpenuhi.
- 🟡 [painful | evidence: plan.md Task 1 Step 5] Plan meminta `grep "const tats"` mengembalikan kosong, padahal design menyuruh membiarkan `renderInventory` mati yang memuat `const tats`. Akibatnya reviewer dan controller harus membuat keputusan tambahan.
- 📌 [nit | evidence: task-3-report.md] Implementer Task 3 tidak menulis file laporan, jadi controller menyalin hand-back dan bukti RED dicatat oleh controller sendiri.
- 📌 [nit | evidence: verify.md §4] Qty negatif yang sengaja diketik menurunkan total biaya dan HPP tersimpan (`total()` di `productionModal`). Ini dibiarkan sebagai cakupan demo.

## 3. Plan deviations

| Plan task | What changed | Why |
|-----------|--------------|-----|
| Task 1 Step 5 | grep `const tats` diterima masih cocok 1x (app.js:24) | Salinan mati sengaja dibiarkan (design Non-Goals) |
| Task 3 (baru) | Ditambahkan lewat `/opsx:update` setelah Task 1–2 selesai: panel "Riwayat produksi" + `productionLog` | Permintaan user setelah implementasi awal |
| Verifikasi 4.x | Dijalankan otomatis dengan headless Chrome, bukan klik manual | Proyek tidak punya test suite; harness memberi bukti yang bisa diulang |
| Final review | Tidak dijalankan ulang untuk Task 3 | Tambahan kecil dan task review bersih (keputusan di ledger) |

## 4. Skill / workflow compliance

| Skill                                            | Used |
|--------------------------------------------------|------|
| superpowers:brainstorming                        | ✓ |
| superpowers:writing-plans                        | ✓ |
| superpowers:using-git-worktrees                  | ✗ |
| superpowers:subagent-driven-development          | ✓ |
| (transitive) superpowers:test-driven-development | ✓ (harness acceptance, RED→GREEN) |
| (transitive) superpowers:requesting-code-review  | ✓ (task review ×3, final review ×1) |
| superpowers:finishing-a-development-branch       | ✗ |

### Deliberately Skipped Skills

- **`superpowers:using-git-worktrees`**
  - **What was skipped**: seluruh skill. Pekerjaan dilakukan langsung di checkout utama, branch `develop`.
  - **Why this cycle**: memory user "Git: commit only on request — commit/worktree only when asked". Selain itu, `git status` di awal apply menunjukkan `app.js`/`index.html`/`styles.css` sudah berisi perubahan `shift-closing-review` yang belum di-commit. Worktree dari HEAD tidak akan memuat perubahan itu, padahal change ini dibangun di atasnya.
  - **How to prevent recurrence**: `CLAUDE.md trigger`. Tambahkan aturan di CLAUDE.md proyek: "Repo ini tidak memakai worktree/commit per task; apply bekerja di checkout utama dan review memakai diff snapshot". Dengan begitu skip menjadi aturan tertulis, bukan keputusan per siklus.
- **`superpowers:finishing-a-development-branch`**
  - **What was skipped**: seluruh skill, termasuk merge, PR, dan push.
  - **Why this cycle**: tidak ada commit untuk di-merge. User secara eksplisit meminta "buat saja verify-nya tanpa commit" (2026-10-29).
  - **How to prevent recurrence**: `CLAUDE.md trigger` yang sama. Finishing baru dijalankan setelah user meminta commit.

## 5. Surprises

- Asumsi bahwa label tombol "+ Hasil produksi" berarti fiturnya sudah ada ternyata salah. Tombol itu hanya menampilkan toast, dan logika produksinya ada di tombol header.
- Contoh `PRD-0920-011` di timeline lama sudah multi-bahan ("Beras 8 kg + Ayam 12 kg"), padahal modalnya hanya mendukung satu bahan. Data contoh mendahului fiturnya.
- `--dump-dom` Chrome headless cukup untuk menjalankan alur klik sinkron penuh di prototipe ini tanpa Playwright/npm.

## 6. Promote candidates → long-term learning

- [x] 🟡 **Prototipe ini bisa diuji otomatis lewat Chrome headless `--dump-dom` dengan script uji yang disisipkan setelah app.js** → **Promote to project CLAUDE.md** (bagian "Running")
  > **Why**: tidak ada test suite, dan klik manual tidak bisa diulang. Harness di siklus ini menangkap regresi dan memberi bukti RED/GREEN dengan nilai persis.
  > **How to apply**: saat apply/verify perubahan UI di `index.html`, bangun `harness.html` dari `index.html` + `test.js` di folder scratch yang di-ignore git, jangan di dalam proyek.

- [x] 🟡 **Schema superpowers-bridge bentrok dengan aturan "commit hanya bila diminta"** → **Promote to memory** (type: feedback, perbarui [[no-git-local-project]])
  > **Why**: siklus ini harus mengganti commit-range dengan diff snapshot dan menulis verify §5 sebagai tidak terpenuhi.
  > **How to apply**: saat apply dengan schema ini, langsung pakai snapshot `.superpowers/sdd/<plan>/base/` + `git diff --no-index` untuk review package, tanpa bertanya ulang soal worktree/commit.

- [ ] 📌 **Acceptance check di plan tidak boleh bertentangan dengan Non-Goals design** (mis. grep yang mencakup kode mati yang sengaja dibiarkan) → **One-off**
  > **Why**: kesalahan penulisan plan di siklus ini saja. Self-review writing-plans seharusnya menangkapnya.

- [ ] 📌 **Dispatch implementer harus menyatakan bahwa file laporan wajib ditulis meski ada larangan menyentuh `.superpowers/`** → **One-off**
  > **Why**: implementer Task 3 menafsirkan "jangan edit `.superpowers/`" sebagai larangan menulis laporannya sendiri. Penyebabnya kata-kata di prompt, bukan pola berulang.
