# Retrospective: rokok-multibrand

> Ditulis: 2026-10-29 (setelah verify: PASS WITH WARNINGS)
> Commit range: tidak ada. Baseline `aedf6a0` (HEAD, "logout role kasir"), dan perubahan masih uncommitted.
> Worktree: checkout utama `develop`, tanpa worktree. Baseline berupa snapshot di `.superpowers/sdd/plan-rokok-multibrand/base/`.

---

## 0. Evidence

- **Commit range**: `aedf6a0..(working tree)`, 0 commit untuk change ini. Commit hanya dibuat atas permintaan user.
- **Diff size**: +38 / -26 baris di 3 file (diff terhadap snapshot base): `app.js` +36/-25, `index.html` +1/-1, `styles.css` +1/-0
- **Tasks done**: 21/21 (`grep -cE '^\s*- \[x\]' tasks.md` → 21)
- **Active hours**: tidak terukur. Artefak perencanaan ditulis pukul 00:42–00:57, dan verify pukul 21:11.
- **Subagent dispatches**: 1 (reviewer akhir yang baru, opus: "Ready to merge: Yes; Critical 0, Important 0")
- **New external dependencies**: tidak ada
- **Bugs encountered post-merge**: belum di-merge. 3 cacat UX ditemukan saat review akhir dan diperbaiki sebelum verify (lihat §2).
- **OpenSpec validate state at archive**: lolos (11/11 valid, change ini 0 issue). Archive belum dijalankan.
- **Test coverage signal**: harness headless Chrome dengan 62 assertion (T1 14, T2 30, T3 18), 62/62 PASS saat verify. Ada juga 3 screenshot (`SHOT1-3.png`).

Commit chain:

```
aedf6a0 logout role kasir   (baseline, tidak terkait change ini)
(belum ada commit rokok-multibrand)
```

Urutan ledger (`progress.md`): Task 1 lolos 11/0 → Task 2 lolos 38/0 → Task 3 lolos 54/0 → Task 4 lolos 57/0 → review akhir → 3 perbaikan → 62/0.

---

## 1. Wins

- Keputusan D1 (rokok sebagai `finishedStock` dengan nama yang sama dengan `menuData`) membuat jalur jual dan potong stok yang sudah ada langsung bekerja. Tab Kasir, tab Buat order, dan master menu Admin muncul tanpa kode baru. Seluruh diff hanya +38/-26 baris.
- Satu helper `cutFinished` (`app.js:247`) dipakai oleh `#finishPay` (`app.js:136`) dan `deductOrderStock` (`app.js:249`), sehingga aturan "stok tidak minus" hanya ada di satu tempat.
- Picker bersama `rokokPickerHtml`/`readRokokPicker` (`app.js:245-246`) dipakai modal fee Kasir dan form Buat order, jadi tidak ada UI ganda.
- Rantai keputusan di brainstorm (Q1–Q7) menutup ambiguitas risiko potong ganda pada order (Q6) sebelum desain ditulis, dan implementasi tidak perlu diubah karena hal itu.
- Kandidat carry-forward "mode dikerjakan sendiri wajib ditutup review independen" dari `add-raw-material-request` dijalankan di siklus ini: reviewer baru dikirim sebelum verify, dan menemukan 3 cacat UX.
- Review Focus di plan (5 butir, masing-masing dengan nama tes) membuat edge case `selectOrder`, fee tunai, dan `fee:null` diuji sejak awal.

## 2. Misses

- 🟡 [painful | evidence: progress.md "Final: fixed (user request)" ×3] Tiga cacat UX lolos dari plan dan harness awal: isian merek hilang saat berpindah Rokok→Tunai→Rokok di modal fee (`app.js:23`), hal yang sama di `#ofFeeType` form order (`app.js:263`), dan baris fee rokok tanpa petunjuk "(potong stok)" (`app.js:21`). Ketiganya ditemukan reviewer, bukan oleh tes yang direncanakan.
- 🟡 [painful | evidence: verify §5] Implementasi tidak di-commit dan bercampur di worktree dengan tiga change lain yang juga uncommitted (`stok-tersambung`, `production-multi-material`, `shift-closing-review`). Commit per change sekarang perlu staging selektif per hunk di `app.js`.
- 📌 [nit | evidence: verify precheck] Precheck verify `git log <merge-base>..HEAD | wc -l` mengembalikan 1, tetapi commit itu (`aedf6a0`) tidak terkait change ini. Precheck lolos secara formal tanpa bukti yang berarti.
- 📌 [nit | evidence: plan.md] Checkbox langkah di `plan.md` tetap `- [ ]`. Progres dicatat di `progress.md` dan `tasks.md`, sehingga plan.md tidak mencerminkan status.

## 3. Plan deviations

| Plan task | What changed | Why |
|-----------|--------------|-----|
| Global Constraints (path harness) | Harness ada di `.superpowers/sdd/plan-rokok-multibrand/harness/`, bukan `.superpowers/sdd/rokok-multibrand/harness/` | sdd-workspace menentukan folder plan di sana. Kedalamannya sama, jadi `run.sh` tidak berubah. |
| Task 4 Step 3 / tasks 6.1–6.6 | Verifikasi manual di browser diganti harness headless + screenshot | Dicatat sebagai ruling di `progress.md`. Klik manual tetap disarankan sebelum demo. |
| Task 2 (D5) & Task 3 (D8) | Ditambah: isian merek tetap saat berpindah bentuk fee, dan label "Fee driver (potong stok)" | Temuan review akhir atas permintaan user. Spec diperbarui (skenario "Isian merek tetap saat berpindah bentuk fee"), tes T2/T3 ditambah dari merah ke hijau (57 → 62 assertion). |
| Langkah "Commit" di setiap task | Tidak dijalankan | Preferensi user: commit hanya atas permintaan. |

## 4. Skill / workflow compliance

| Skill                                            | Used |
|--------------------------------------------------|------|
| superpowers:brainstorming                        | ✓ (`brainstorm.md`, Q1–Q7) |
| superpowers:writing-plans                        | ✓ (`plan.md`, 4 task + Review Focus) |
| superpowers:using-git-worktrees                  | ✗ |
| superpowers:subagent-driven-development          | ✗ (diganti `executing-plans` atas pilihan user) |
| (transitive) superpowers:test-driven-development | ✓ (setiap task: tes merah → implementasi → hijau; perbaikan akhir juga RED→GREEN) |
| (transitive) superpowers:requesting-code-review  | ✓ (1 reviewer baru, opus) |
| superpowers:finishing-a-development-branch       | ✗ |

### Deliberately Skipped Skills

- **`superpowers:using-git-worktrees`**
  - **What was skipped**: seluruh skill. Pekerjaan dilakukan di checkout utama `develop` dengan snapshot `base/` sebagai baseline diff.
  - **Why this cycle**: memori `no-git-local-project` ("commit/worktree only when asked; SDD apply uses snapshot diffs, no worktree") dan `progress.md` baris "No worktree/commits".
  - **How to prevent recurrence**: `scope-judgment rule`. Di proyek ini worktree hanya dipakai bila user meminta. Namun karena worktree utama sekarang menampung 4 change uncommitted (§2), tanyakan ke user di awal apply apakah change ini sebaiknya di-commit terpisah sebelum mulai.

- **`superpowers:subagent-driven-development`**
  - **What was skipped**: eksekusi task oleh subagent per task. Task dijalankan inline dengan `executing-plans`.
  - **Why this cycle**: `progress.md` baris "Executor: executing-plans (native, user choice)". User yang memilih.
  - **How to prevent recurrence**: `one-off — schema boundary case`. Plan sendiri menawarkan kedua opsi, dan pilihan user lebih diutamakan daripada skill. Risiko utama mode inline (tidak ada mata independen) ditutup oleh reviewer akhir.

- **`superpowers:finishing-a-development-branch`**
  - **What was skipped**: seluruh skill (merge/PR/cleanup).
  - **Why this cycle**: `progress.md` baris "finishing-a-development-branch skipped — user commits only on request". Tidak ada branch maupun commit untuk diselesaikan.
  - **How to prevent recurrence**: `schema graph fix`. Ini kandidat carry-forward "Langkah git di schema superpowers-bridge harus bersyarat", yang kini muncul di siklus ketiga. Lihat §6.

## 5. Surprises

- Precheck commit verify bisa lolos karena commit yang tidak terkait (`aedf6a0`). Di repo dengan beberapa change uncommitted, angka commit di atas merge-base tidak membuktikan apa pun tentang change yang sedang diverifikasi.
- Bug "isian hilang saat berpindah bentuk fee" muncul di dua tempat sekaligus (modal Kasir dan form order). Asumsi bahwa picker bersama otomatis menyamakan perilaku ternyata salah, karena pemicu render ulangnya berbeda di tiap tempat (`show()` di modal, `.onchange` di form).
- Handler `#payButton` mati di `app.js:28` masih memuat `#finishPay` lama dengan `fee=0` tanpa `feeRokok=[]`. Ini tidak berbahaya karena ditimpa `app.js:136`, tetapi tetap muncul di setiap `grep "fee=0"` dan menyesatkan audit reset.

## 6. Promote candidates → long-term learning

Carry-forward dari retro sebelumnya:

- [ ] 🟡 **Langkah git di schema superpowers-bridge harus bersyarat** → **Promote to schema** (`schema.yaml`: precheck `verify`, evidence `retrospective`, langkah worktree/finishing)
  > **Why**: siklus ketiga yang menandai worktree/finishing sebagai ✗. Di siklus ini precheck commit lolos karena commit yang tidak terkait (§5).
  > **How to apply**: saat schema diubah, ganti precheck commit dengan "ada diff pada file yang disebut proposal Impact" (snapshot diff atau `git diff --stat`) ditambah hasil uji.

- [x] 🟡 **Mode "dikerjakan sendiri" wajib ditutup review independen** → sudah dijalankan di siklus ini (1 reviewer opus, 3 temuan diperbaiki). Masih layak dijadikan memori feedback.
  > **Why**: reviewer menemukan 3 cacat UX yang lolos dari 57 assertion yang direncanakan.
  > **How to apply**: di akhir `/opsx:apply` proyek ini, sebelum verify, kirim satu reviewer untuk file yang diubah.

Kandidat baru:

- [ ] 🟡 **Satu change, satu commit sebelum memulai change berikutnya** → **Promote to memory** (type: feedback, perbarui `no-git-local-project`)
  > **Why**: 4 change uncommitted bercampur di `app.js`, sehingga commit per change kini butuh staging per hunk (verify §5).
  > **How to apply**: saat `/opsx:apply` selesai atau saat verify lolos, tawarkan commit untuk file change itu sebelum change lain disentuh.

- [ ] 🟡 **Review Focus untuk input yang dirender ulang: uji "isian tetap saat berpindah tab/opsi"** → **Promote to memory** (type: feedback)
  > **Why**: bug yang sama lolos di dua tempat (`app.js:23`, `app.js:263`) karena tes hanya menguji simpan dan buka ulang, bukan berpindah opsi di tengah pengisian.
  > **How to apply**: saat plan proyek ini menambah form dengan opsi yang menukar isi (`innerHTML` ulang), tambahkan butir Review Focus "isi → ganti opsi → kembali → isian masih ada".

- [ ] 📌 **Hapus handler `#payButton` mati di `app.js:28`** → **One-off** (calon change kecil terpisah)
  > **Why**: kode mati yang menimpa audit `grep "fee=0"` dan bertentangan dengan peringatan "app.js berlapis" di CLAUDE.md.
  > **How to apply**: saat change berikutnya menyentuh alur bayar Kasir.
