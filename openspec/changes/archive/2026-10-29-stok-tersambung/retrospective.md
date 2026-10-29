# Retrospective: stok-tersambung

> Written: 2026-10-29 (setelah verify: PASS WITH WARNINGS)
> Commit range: tidak ada commit untuk change ini (HEAD `aedf6a0`, perubahan masih di working tree)
> Worktree: checkout utama, branch `develop` (tanpa worktree; base snapshot di `.superpowers/sdd/plan-stok-tersambung/base/`)

---

## 0. Evidence

- **Commit range**: tidak ada. HEAD `aedf6a0` ("logout role kasir") berasal dari change sebelumnya, bukan dari siklus ini.
- **Diff size**: +13 / -7 baris di 1 file (`app.js`, dibandingkan dengan snapshot `base/app.js`). `index.html` dan `styles.css` tidak berubah, sesuai proposal.
- **Tasks done**: 13/13 (`tasks.md`), plan 4/4 task (`progress.md`).
- **Active hours**: ±1–2 jam (estimasi; satu sesi brainstorm → apply → verify).
- **Subagent dispatches**: 1 (reviewer akhir independen, opus — hasil: Ready, Critical 0, Important 0).
- **New external dependencies**: none.
- **Bugs encountered post-merge**: none (belum di-merge).
- **OpenSpec validate state at archive**: pass (11/11 valid saat verify; archive belum dijalankan).
- **Test coverage signal**: harness headless Chrome `run.sh all` → 40 pass / 0 fail; regresi `rokok-multibrand` → 62 pass / 0 fail; 2 screenshot (`harness/SHOT1.png`, `SHOT2.png`).

Commit chain (chronological):

```
aedf6a0 logout role kasir   (base; belum ada commit untuk stok-tersambung)
```

---

## 1. Wins

- Keputusan D1 (satu objek dimasukkan ke dua array lewat `...sharedStock`) membuat stok masuk, PO, `cutFinished`, fee rokok, dan form permintaan tersambung tanpa satu baris kode sinkronisasi pun. Hasilnya diff hanya +13/-7 di `app.js` (§0), dan D5 ("alur lain tidak diubah") benar-benar terpenuhi.
- Menaruh item bersama di **akhir** `rawStock` menjaga indeks lama (`{i:0}` = Beras), sehingga filter produksi cukup menyaring opsi (`app.js:114`, `116`, `119`) tanpa mengubah logika indeks.
- Badge memakai `.line-tag` yang sudah ada, jadi tidak ada CSS baru (`styles.css` tidak berubah).
- Uji regresi `rokok-multibrand` (62/62) dijalankan ulang setelah rokok dipindah dari `finishedStock`, sehingga perpindahan data terbukti tidak merusak picker dan fee rokok.
- Kandidat retro sebelumnya "Mode dikerjakan sendiri wajib ditutup review independen" **diterapkan** di siklus ini: satu reviewer independen dikirim sebelum verify.

## 2. Misses

- 🟡 [painful | evidence: verify precheck] Precheck verify `git log <merge-base>..HEAD | wc -l` mengembalikan 1, padahal commit itu (`aedf6a0`) bukan milik change ini. Precheck lolos secara kebetulan, bukan karena ada bukti commit.
- 🟡 [painful | evidence: `git status`] Working tree mencampur perubahan dari empat change (`stok-tersambung` dan tiga yang sudah di-archive: `production-multi-material`, `rokok-multibrand`, `shift-closing-review`). Diff per change tidak bisa dibaca dari git; hanya snapshot `base/` yang memisahkannya.
- 📌 [nit | evidence: `progress.md` Final] Badge `.line-tag` berukuran 8px mungkin terlalu kecil di tabel LPP. Belum dicek di browser sungguhan.
- 📌 [nit | evidence: `progress.md` Task 1] Harness harus mem-focus `#stockCost` karena `sync()` mereset harga saat field tidak fokus. Ini artefak cara uji, bukan bug, tetapi sempat menyita waktu.

## 3. Plan deviations

| Plan task | What changed | Why |
|-----------|--------------|-----|
| Task 1 | Ditambah uji UI stok masuk (skenario "Stok masuk tanpa PO") di luar rencana | Skenario spec belum punya uji end-to-end di plan |
| Task 3 | Perbaikan harness: hasil `$$` (NodeList) di-spread sebelum `.some` | Bug di skrip uji, bukan di `app.js` |
| Task 4 (4.1–4.6) | Verifikasi manual diganti harness headless + screenshot; 4.6 (penjualan Kasir + fee) ditutup oleh regresi `rokok-multibrand` dan uji identitas objek bersama | Prototipe tanpa test suite; klik manual tetap disarankan ke user sebelum demo |

## 4. Skill / workflow compliance

| Skill                                            | Used |
|--------------------------------------------------|------|
| superpowers:brainstorming                        | ✓ (`brainstorm.md`) |
| superpowers:writing-plans                        | ✓ (`plan.md`) |
| superpowers:using-git-worktrees                  | ✗ |
| superpowers:subagent-driven-development          | ✗ (pakai `executing-plans`) |
| (transitive) superpowers:test-driven-development | ✓ (uji T2/T3 RED sebelum implementasi, lihat `progress.md` Task 2) |
| (transitive) superpowers:requesting-code-review  | ✓ (reviewer akhir independen) |
| superpowers:finishing-a-development-branch       | ✗ |

### Deliberately Skipped Skills

- **`superpowers:using-git-worktrees`**
  - **What was skipped**: seluruh skill.
  - **Why this cycle**: memori `no-git-local-project` menetapkan "commit/worktree hanya atas permintaan; SDD apply memakai snapshot diff, tanpa worktree". Working tree saat mulai sudah berisi perubahan belum di-commit dari tiga change lain (lihat `git status` di awal sesi), sehingga worktree baru dari `HEAD` tidak akan memuat data rokok dari `rokok-multibrand` yang menjadi dependensi change ini (proposal §Impact).
  - **How to prevent recurrence**: `scope-judgment rule` — selama perubahan change sebelumnya belum di-commit, worktree tidak bisa dipakai. Solusinya commit tiap change setelah archive (lihat §6), bukan memaksa worktree.

- **`superpowers:subagent-driven-development`**
  - **What was skipped**: eksekusi per task oleh subagent; diganti `executing-plans` inline.
  - **Why this cycle**: plan hanya 4 task kecil yang saling bergantung secara berurutan (T2 dan T3 memakai `sharedStock` dan flag `shared` dari T1, lihat `progress.md` Pre-flight), dengan total diff +13/-7. User memilih eksekusi inline saat handoff.
  - **How to prevent recurrence**: `scope-judgment rule` — untuk plan ≤4 task berurutan di satu file, `executing-plans` + satu reviewer independen di akhir sudah memenuhi tujuan review subagent. Di atas itu, pakai subagent.

- **`superpowers:finishing-a-development-branch`**
  - **What was skipped**: seluruh skill (merge/PR/commit).
  - **Why this cycle**: memori "commit hanya atas permintaan"; user belum meminta commit (`progress.md` Final ruling).
  - **How to prevent recurrence**: `CLAUDE.md trigger` — setelah `/opsx:archive`, tawarkan satu commit per change yang di-archive (tanpa langsung commit), agar working tree tidak menumpuk lintas change.

## 5. Surprises

- Precheck commit di schema `superpowers-bridge` bisa lolos oleh commit yang tidak berhubungan (lihat §2). Asumsi "jumlah commit > 0 berarti implementasi sudah di-commit" salah di repo ini.
- Satu objek di dua array ternyata cukup untuk semua alur; tidak ada pembaca yang menyalin objek (`{...x}`) sehingga referensinya tidak pernah putus. Ini sempat dianggap risiko di design, tetapi tidak muncul.

## 6. Promote candidates → long-term learning

Carry-forward dari retro sebelumnya:

- [x] 🟡 **Mode "dikerjakan sendiri" wajib ditutup review independen** → sudah diterapkan di siklus ini (reviewer opus di akhir apply). Bisa dipromosikan ke memori bila terulang sekali lagi.
- [ ] 🟡 **Langkah git di schema superpowers-bridge harus bersyarat** → **Promote to schema** (`schema.yaml`: precheck `verify` dan evidence `retrospective`)
  > **Why**: siklus ini menambah bukti baru — repo sudah punya git, tetapi precheck tetap lolos oleh commit milik change lain (`aedf6a0`).
  > **How to apply**: precheck sebaiknya memeriksa bahwa file yang disebut di proposal §Impact punya perubahan (commit atau diff terhadap snapshot), bukan sekadar menghitung commit.
- [ ] 🟡 **Memori no-git sudah usang** → **Promote to memory** (perbarui `no-git-local-project`)
  > **Why**: memori sudah berjudul "Git: commit only on request" dan isinya cocok dengan kondisi sekarang; kandidat ini kemungkinan sudah selesai.
  > **How to apply**: cek isi memori sekali lagi; jika sudah benar, tandai kandidat ini selesai di retro berikutnya.
- Kandidat lain (CDP harness, heredoc non-ASCII, `.table-scroll`, validasi `#verifyStart`, nama global browser) tidak tersentuh siklus ini; tetap dibawa.

Kandidat baru:

- [ ] 🟡 **Commit satu change setelah archive agar working tree tidak menumpuk** → **Promote to memory** (type: feedback, gabung dengan `no-git-local-project`)
  > **Why**: di siklus ini working tree mencampur empat change, worktree jadi mustahil dan diff per change hanya terbaca lewat snapshot `base/`.
  > **How to apply**: setelah `/opsx:archive`, tawarkan commit untuk change itu (tetap menunggu persetujuan user).
- [ ] 📌 **Item yang dibagi antar buku stok: satu referensi objek di dua array** → **One-off** (dicatat di design D1)
  > **Why**: pola ini hanya aman karena tidak ada kode yang menyalin objek stok; tidak perlu jadi aturan umum.
- [ ] 📌 **Cek ukuran badge `.line-tag` di tabel LPP pada browser sungguhan** → **One-off** (cek sebelum demo)
  > **Why**: reviewer menandainya sebagai minor; harness headless tidak menilai keterbacaan.
