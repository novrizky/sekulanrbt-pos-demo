# Retrospective: split-inventory-admin-submenus

> Written: 2026-10-29 (after verify passed with warnings)
> Commit range: `de67dd5..(belum di-commit)`
> Worktree: checkout utama, branch `develop` (tanpa worktree)

---

## 0. Evidence

- **Commit range**: `de67dd5..` (0 commit; perubahan masih di working tree karena aturan proyek "commit hanya atas permintaan")
- **Diff size**: +80 / -59 baris di 3 file (`index.html`, `app.js`, `styles.css`; baris `app.js` sangat panjang, jadi jumlah baris meremehkan besar perubahan)
- **Tasks done**: 41/41 (35 awal + 6 tambahan paging/filter; 9.2 dicek manual oleh user)
- **Active hours**: ±1 sesi panjang (explore → propose → apply → 2 tambahan scope → verify)
- **Subagent dispatches**: 1 (review akhir menyeluruh, Opus)
- **New external dependencies**: none
- **Bugs encountered post-merge**: n/a (belum di-merge)
- **OpenSpec validate state at archive**: pass (`openspec validate --all`), 2 peringatan panjang requirement
- **Test coverage signal**: harness headless Chrome `run.sh all` 95/95, `T6` (390px) 5/5, `T6M` (1000px) 3/3; regresi harness lama yang diadaptasi: stok-tersambung 39/39, rokok-multibrand 62/62

Commit chain (chronological):

```
de67dd5 Produksi multi-bahan, rokok multi-merek, BA tutup shift, dan stok tersambung   (base)
(belum ada commit untuk change ini)
```

---

## 1. Wins

- Pendekatan B (section induk tetap, submenu memilih panel lewat `data-subs` + `openSub`) membuat diff kecil (+80/-59) dan memakai ulang `activeLedger`, `switchAdminTab`, `renderInventory`, `tableHtml`, `pagerHtml`.
- TDD per task dengan harness headless Chrome: setiap task dimulai RED (mis. T1 "T1 order" gagal, T4 20 kegagalan) lalu GREEN; regresi antar task langsung terlihat di `run.sh all`.
- Masalah TDZ diantisipasi sebelum terjadi: `renderSubSummary(scope)` dipisah per scope karena `renderInventory()` berjalan sebelum `const outlets`/`materialRequests` (ledger Task 4).
- Review akhir oleh subagent menemukan 2 masalah Important yang lolos dari harness (judul Admin, kartu Master menu); keduanya diperbaiki dengan tes `FIX admin titles` dan `FIX menu card updates` RED→GREEN.
- Penambahan scope di tengah jalan (paging, filter, lalu 20→10 baris) masuk ke change yang sama dengan artefak tetap sinkron dan validate lolos.

## 2. Misses

- 🟡 [painful | evidence: shot-1000.png, tes T6M] Bug mode ikon (≤1050px: label submenu tampil, item bawah terpotong) tidak tertangkap T6/T6D; baru ketahuan dari tangkapan layar 1000px. Breakpoint tengah tidak punya tes sampai T6M ditambahkan.
- 🟡 [painful | evidence: `openspec validate` pertama] Lima error validate karena MODIFIED requirement mengganti nama skenario lama; perlu kerja ulang (kembalikan nama skenario, pakai REMOVED+ADDED untuk yang maknanya berbalik).
- 🟡 [painful | evidence: ledger Task 8, spec shared-stock-item] Paging contoh membuat item demo (Rokok Brand D "Menipis", Air mineral) berada di halaman yang tidak bisa dibuka; skenario spec harus dialihkan ke filter "Siap jual".
- 🟡 [painful | evidence: verify.md §4] design.md D5/D8 tertinggal dari implementasi (signature `renderSubSummary(scope)`, `ADMIN_TITLES`, panggilan di `renderMasterMenus`) sampai verify; diperbarui setelahnya.
- 📌 [nit | evidence: harness run.sh] `sed` global ikut mengganti pola di dalam `run.sh` sendiri; file ditulis ulang manual.
- 📌 [nit | evidence: spec sidebar awal] Skenario Master menu awalnya menyebut 6 kategori; data sebenarnya 7 (Rokok), dikoreksi sebelum tasks.
- 📌 [nit | evidence: review Minor #3] Kartu "Produksi hari ini" berbeda nilai antara Stok barang dagangan dan Mutasi stok (sumber data berbeda per D8); ditunda.

## 3. Plan deviations

| Plan task | What changed | Why |
|-----------|--------------|-----|
| Harness (semua) | Lokasi `.superpowers/sdd/plan-split-inventory-admin-submenus/harness` alih-alih `.../split-inventory-admin-submenus/harness` | Mengikuti direktori workspace dari `sdd-workspace` |
| Task 4 | `renderSubSummary(scope)` alih-alih tanpa argumen; Hak akses/Notifikasi tanpa kartu | TDZ saat startup; spec tidak mendefinisikan kartu untuk dua submenu itu |
| Task 6 | T6 hanya jalan bila dipanggil eksplisit; ditambah T6D (desktop) dan T6M (1000px) | T6 khusus 390px; bug mode ikon butuh tes sendiri |
| Task 7 | Harness lama dijalankan lewat salinan yang diadaptasi di `regress/` | Harness asli berhenti di klik tab LPP yang memang dihapus |
| Final review | Tambah `ADMIN_TITLES` dan panggilan kartu di `renderMasterMenus` | Temuan Important reviewer |
| Task 8–9 (baru) | Paging contoh + filter Status/Jenis item, lalu `PAGE_SIZE` 20 → 10 | Permintaan user setelah implementasi awal |

## 4. Skill / workflow compliance

| Skill                                            | Used |
|--------------------------------------------------|------|
| superpowers:brainstorming                        | ✓ |
| superpowers:writing-plans                        | ✓ |
| superpowers:using-git-worktrees                  | ✗ |
| superpowers:subagent-driven-development          | ✗ (diganti executing-plans) |
| (transitive) superpowers:test-driven-development | ✓ (RED→GREEN per task lewat harness) |
| (transitive) superpowers:requesting-code-review  | ✓ (satu review akhir, bukan per task) |
| superpowers:finishing-a-development-branch       | ✗ (belum; menunggu archive dan permintaan commit) |

### Deliberately Skipped Skills

- **`superpowers:using-git-worktrees`**
  - **What was skipped**: seluruh skill; implementasi langsung di checkout `develop`.
  - **Why this cycle**: memori proyek "Git: commit only on request — commit/worktree only when asked; SDD apply uses snapshot diffs, no worktree", dan user tidak meminta worktree. Snapshot `base/` di workspace dipakai sebagai pengganti titik awal diff (`review.diff`).
  - **How to prevent recurrence**: `CLAUDE.md trigger` — tambahkan ke CLAUDE.md proyek bahwa apply schema `superpowers-bridge` di repo ini memakai snapshot `base/` tanpa worktree, supaya instruksi schema dan aturan proyek tidak tampak bertentangan setiap siklus.

- **`superpowers:subagent-driven-development`**
  - **What was skipped**: eksekutor subagent per task beserta review per task; diganti `superpowers:executing-plans` (native) dengan satu review akhir oleh subagent Opus.
  - **Why this cycle**: user memilih eksplisit "eksekusi secara native" pada `/opsx:apply`, mengikuti rekomendasi di handoff plan (7 task saling bergantung pada `openSub`/`activeInvSub`/`renderSubSummary` di 3 file yang sama).
  - **How to prevent recurrence**: `schema graph fix` — instruksi apply schema `superpowers-bridge` menyatakan executing-plans tidak didukung, padahal skill executing-plans sudah memuat TDD dan review akhir. Ubah teks apply.instruction agar menerima executing-plans bila user memilihnya, dengan syarat harness TDD per task dan satu review akhir.

- **`superpowers:finishing-a-development-branch`**
  - **What was skipped**: belum dijalankan.
  - **Why this cycle**: urutan schema menempatkannya setelah retrospective dan archive; archive belum dijalankan dan user belum meminta commit.
  - **How to prevent recurrence**: `one-off — schema boundary case`: bukan pelewatan, hanya belum sampai langkahnya; dijalankan setelah `/opsx:archive` bila user meminta commit/PR.

## 5. Surprises

- Tool Read di lingkungan ini mengembalikan HTML yang sudah dilucuti tag-nya (hook kompresi); markup harus dibaca lewat `caveman_retrieve` atau `sed`/`grep`.
- Harness lama (stok-tersambung, rokok-multibrand) bergantung pada tab LPP, jadi setiap perubahan navigasi mematahkan harness lama walau perilakunya tetap benar.
- Validator OpenSpec menolak MODIFIED yang membuang nama skenario lama, bahkan bila isinya sengaja diganti.
- Precheck commit di instruksi verify lolos karena menghitung commit lama di branch (2 commit di depan `origin/master`), bukan commit change ini.
- Paging "contoh" yang tidak bisa berpindah halaman punya dampak nyata pada demo: data di halaman 2+ tidak terlihat sama sekali tanpa filter.

## 6. Promote candidates → long-term learning

- [x] 🟡 **MODIFIED delta harus mempertahankan nama skenario lama; bila makna skenario berbalik, pakai REMOVED + ADDED** → **Promote to memory** (type: feedback)
  > **Why**: siklus ini kena 5 error `openspec validate` karena skenario MODIFIED diganti nama.
  > **How to apply**: saat menulis delta spec MODIFIED di proyek ini, salin nama skenario lama apa adanya; jika skenario lama kini salah, hapus requirement lewat REMOVED dan tulis ulang lewat ADDED.

- [x] 🟡 **Setiap perubahan CSS responsif dicek dengan tangkapan layar di 1440, 1000, dan 390px, bukan hanya tes** → **Promote to project CLAUDE.md** (bagian "Automated checks (headless Chrome)")
  > **Why**: bug mode ikon di 1000px lolos dari T6/T6D dan hanya terlihat di screenshot.
  > **How to apply**: ketika menyentuh `styles.css` atau markup sidebar/layout, ambil `--screenshot` di tiga lebar itu dan lihat hasilnya sebelum menandai task selesai.

- [x] 🟡 **Paging contoh menyembunyikan data demo; pertimbangkan urutan (mis. Menipis di atas) atau filter saat menambah paging** → **Promote to memory** (type: project)
  > **Why**: dengan 10 baris, Rokok Brand D (contoh Menipis) dan item siap jual hanya ada di halaman yang tidak bisa dibuka.
  > **How to apply**: saat mengubah batas baris atau menambah tabel berpaging, cek apakah item yang dipakai di skenario demo masih tampil di halaman 1.

- [x] 📌 **Apply schema superpowers-bridge di repo ini memakai snapshot `base/` tanpa worktree dan eksekusi native atas pilihan user** → **Promote to project CLAUDE.md** (bagian OpenSpec workflow)
  > **Why**: instruksi schema (worktree + subagent-driven) bertentangan dengan aturan proyek dan pilihan user setiap siklus.
  > **How to apply**: saat `/opsx:apply`, langsung pakai workspace `sdd-workspace` + snapshot `base/`; laporkan perbedaan dengan instruksi schema sekali saja.

- [ ] 📌 **Tool Read melucuti tag HTML di proyek ini; baca markup dengan `sed`/`grep` atau `caveman_retrieve`** → **One-off** (record it, don't promote)
  > **Why**: perilaku hook lingkungan, bukan aturan proyek; bisa berubah bila hook diganti.

- [x] 🟡 **Verify dan retrospective tidak wajib di proyek ini kecuali user meminta** → **Promoted to memory + project CLAUDE.md** (ditambahkan atas permintaan user, 2026-10-29)
  > **Why**: user menilai keduanya overhead untuk prototipe demo; tes harness saat apply ditambah klik manual sudah cukup.
  > **How to apply**: setelah `/opsx:apply`, jangan mulai verify/retro sendiri; tawarkan sebagai opsional satu baris saja.

> **Update 2026-10-29**: kandidat 1–4 dan aturan verify/retro opsional sudah dipromosikan: memori `openspec-modified-keep-scenario-names`, `dummy-paging-hides-demo-items`, `verify-retro-optional`, pembaruan `no-git-local-project`, dan CLAUDE.md (bagian Automated checks + OpenSpec workflow).
