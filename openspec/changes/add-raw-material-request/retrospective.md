# Retrospective: add-raw-material-request

> Written: 2026-10-23 (setelah verify: PASS WITH WARNINGS)
> Commit range: N/A (proyek bukan repositori git)
> Worktree: folder proyek langsung (`D:\WORK\Personal\PAM\SekulanRBT_Resto\application`)

---

## 0. Evidence

- **Commit range**: N/A. Tidak ada git, jadi bukti penggantinya adalah daftar file di `verify.md` §5.
- **Diff size**: 3 file POS. `app.js` 235 → 297 baris (+62 baris padat, section baru ±19,8 KB mulai baris 241). `index.html` 181 → 196 baris (+15). `styles.css` +±46 baris di akhir file. `outlet-data.*` tidak disentuh.
- **Tasks done**: 21/21 (`grep -cE '^\s*- \[x\]' tasks.md` → 21)
- **Active hours**: ±1 sesi (explore, propose, apply, dan verify dalam satu percakapan)
- **Subagent dispatches**: 0
- **New external dependencies**: none. Edge headless dan `WebSocket` bawaan Node 24 hanya dipakai skrip uji di scratchpad.
- **Bugs encountered post-merge**: none (belum ada penggunaan setelah selesai)
- **OpenSpec validate state at archive**: pass (`validate --all`: semua valid; 4 peringatan gaya "requirement > 500 karakter")
- **Test coverage signal**: tidak ada test suite di proyek. Uji browser CDP 5 suite: t1 6/6, t2 7/7, t3 15/15, t4 22/22, t5 21/21 = 71/71 PASS, ditambah pemeriksaan visual screenshot 1280px, 390px, dan print PO.

Urutan kerja (pengganti commit chain):

```
explore   brainstorm 8 keputusan (Q1-Q8) bersama user
propose   brainstorm.md, proposal.md, design.md, specs/raw-material-request/spec.md, tasks.md, plan.md
task 1    rawStock 17 item, summary dinamis, materialRequests contoh          -> t1 6/6
task 2    markup section + form panel + #poPrint, CSS + @media print         -> t2 7/7
task 3    daftar, detail, timeline, canActRequest                            -> t3 15/15
task 4    form pilih item + submit                                           -> t4 22/22
task 5    approve/tolak, cetak PO, terima barang                             -> t5 20/21 -> perbaikan chip wrap + po-meta -> 21/21
verify    verify.md (PASS WITH WARNINGS)
```

---

## 1. Wins

- Explore lalu propose menghasilkan spec yang langsung bisa diuji. Setiap skenario punya teks toast persis, misalnya "Isi qty untuk Ayam" dan "Catatan selisih wajib diisi karena qty diterima berbeda dari PO", dan skrip t4/t5 memeriksa string yang sama satu per satu.
- Pola yang sudah ada dipakai ulang sehingga tidak perlu komponen baru: `tableHtml`, `openModal`, `.order-chips`, `.ba-summary`, `.timeline`, `.warning-box`, dan pola panel form `showOrderForm` diterapkan ke `showRequestForm` (`app.js:272`). Screenshot t3/t5 terlihat konsisten dengan halaman lain.
- Cetak PO lewat `body.print-po` + `#poPrint` di luar `.view` tidak merusak cetak Laporan. t2 memastikan media print Laporan tetap menampilkan `#reports` saja.
- Uji CDP menemukan dua cacat tampilan yang tidak terlihat dari kode: chip status melebar ke 473px di viewport 390px, dan "Ref. permintaan" menempel dengan "Tanggal" di dokumen PO. Keduanya diperbaiki sebelum verify (`styles.css:41`, aturan `.po-meta span{display:block}`).
- Pengukuran overflow dengan dan tanpa section baru memisahkan masalah lama (tabel `#rawTable` melebar ke 753px) dari masalah milik change ini, sehingga cakupan tidak melebar diam-diam.

## 2. Misses

- 🟡 [painful | evidence: dua kegagalan Bash pada heredoc] Heredoc bash yang memuat karakter `→` (U+2192) terpotong di lingkungan Git Bash Windows. Akibatnya append Task 5 ke `app.js` gagal (tidak ada yang tertulis) dan `t5.mjs` terpotong di baris 50. Penggantinya adalah tool Edit/Write.
- 🟡 [painful | evidence: §0 Subagent dispatches 0] Untuk kedua kalinya implementasi selesai tanpa review independen. Kandidat "Mode dikerjakan sendiri wajib ditutup review independen" dari retro `qty-via-modal-cart-lock` belum ditindaklanjuti.
- 📌 [nit | evidence: t4 run pertama 20/22] Skrip uji sempat salah mengasumsikan form Admin tanpa item tercentang, padahal item Menipis otomatis tercentang untuk semua peran. Kodenya benar, skrip yang diperbaiki.
- 📌 [nit | evidence: `openspec validate`] 4 requirement di spec melebihi 500 karakter karena daftar data contoh dan aturan ditulis dalam satu paragraf.

## 3. Plan deviations

| Plan task | What changed | Why |
|-----------|--------------|-----|
| 2.3 | Baris tercentang di form disorot dengan `#rfTable tr:has(input[type=checkbox]:checked)`, bukan class `tr.picked` | `tableHtml` tidak bisa memberi class pada `<tr>`. `:has` sudah dipakai di `styles.css` (`.pick-row:has(...)`). |
| 2.3 | Tambahan `#requestStatusFilter{flex-wrap:wrap}` | Ditemukan t5: 6 chip melebar ke 473px di layar 390px |
| 3.3 | Tambahan teks info "Menunggu persetujuan Administrator" untuk Kepala Toko | Tanpa teks ini, detail permintaan yang menunggu tidak menjelaskan kenapa tidak ada aksi. Dicatat sebagai drift non-blocking di verify §4. |
| 3.x / 5.x | Helper `esc()` untuk teks bebas (catatan, alasan, vendor) di template HTML | Vendor dan catatan diketik user lalu dirender ulang lewat `innerHTML` dan atribut `value="..."` |
| 1.4 / 2.5 / 3.4 / 4.4 / 5.4 (verifikasi manual) | Dijalankan lewat skrip CDP di Edge headless, bukan diklik manual | Tidak ada test suite. Skrip memberi bukti yang bisa diulang (dijalankan ulang penuh sebagai regresi). |

## 4. Skill / workflow compliance

| Skill                                            | Used |
|--------------------------------------------------|------|
| superpowers:brainstorming                        | ✓ (sesi explore; brainstorm.md merekam log keputusan) |
| superpowers:writing-plans                        | ✓ |
| superpowers:using-git-worktrees                  | ✗ |
| superpowers:subagent-driven-development          | ✗ |
| (transitive) superpowers:test-driven-development | ✗ |
| (transitive) superpowers:requesting-code-review  | ✗ |
| superpowers:finishing-a-development-branch       | ✗ |

### Deliberately Skipped Skills

- **`superpowers:using-git-worktrees`** dan **`superpowers:finishing-a-development-branch`**
  - **What was skipped**: seluruh skill.
  - **Why this cycle**: `Is a git repository: false` di environment. Memori `no-git-local-project` mencatat user sengaja tidak memakai git, jadi worktree, branch, dan PR tidak bisa dibuat.
  - **How to prevent recurrence**: `schema graph fix`. Instruksi `apply` di `schema.yaml` superpowers-bridge (langkah 1 dan 6) sebaiknya bersyarat "hanya bila repositori git". Kandidat ini sudah ada di retro sebelumnya, dan sekarang dua siklus berturut-turut, lihat §6.
- **`superpowers:subagent-driven-development`**
  - **What was skipped**: eksekusi per task oleh subagent dan review per task; implementasi dikerjakan langsung di sesi utama.
  - **Why this cycle**: mengikuti precedent `qty-via-modal-cart-lock`. Semua kode baru berada di satu section `app.js` dan saling memanggil fungsi (`openRequestDetail` → `approveFromDetail`/`printPoModal`/`receiveModal`), sehingga konteks bersama lebih murah daripada subagent per task.
  - **How to prevent recurrence**: `scope-judgment rule`. Kalau dikerjakan sendiri, tetap kirim satu reviewer independen di akhir untuk seluruh perubahan. Ini sudah jadi kandidat terbuka dan kini terulang (§6).
- **`superpowers:test-driven-development`**
  - **What was skipped**: siklus RED-GREEN berbasis test suite.
  - **Why this cycle**: proyek tidak punya test runner, dan `config.yaml` melarang tugas test/instalasi dependency. Sebagai pengganti, skrip CDP dijalankan per task (t1–t5) dan ulang penuh di akhir.
  - **How to prevent recurrence**: `one-off — schema boundary case`. Prototipe statis tanpa test suite memang berada di luar asumsi TDD di skema. Skrip CDP adalah pengganti yang konsisten di dua siklus terakhir.
- **`superpowers:requesting-code-review`**
  - **What was skipped**: review per task dan review akhir oleh reviewer terpisah.
  - **Why this cycle**: turunan dari tidak dipakainya subagent-driven-development, dan tidak ada review mandiri yang dijalankan sebagai pengganti.
  - **How to prevent recurrence**: `scope-judgment rule`, sama dengan subagent-driven-development di atas.

## 5. Surprises

- Tabel stok lama `#rawTable` sudah membuat halaman Persediaan melebar ke 753px di layar 390px sebelum change ini (`.data-table{min-width:720px}` tanpa `.table-scroll`).
- Heredoc Git Bash di Windows tidak aman untuk konten yang memuat karakter non-ASCII tertentu (`→`). Konten panjang lebih aman ditulis lewat Write/Edit.
- `window.print()` di Edge headless bisa di-stub dari skrip, sehingga urutan "class `print-po` dipasang saat print, lalu dilepas" bisa dibuktikan tanpa dialog print sungguhan.

## 6. Promote candidates → long-term learning

Carry-forward dari retro `qty-via-modal-cart-lock` (`grep -A 5 '^- \[ \]'`):

- [ ] 🟡 **Langkah git di schema superpowers-bridge harus bersyarat** → **Promote to schema** (`schema.yaml`: instruksi `apply` langkah 1/6, `verify` precheck, `retrospective` evidence)
  > **Why**: dua siklus berturut-turut (`qty-via-modal-cart-lock`, `add-raw-material-request`) menandai worktree, finishing, dan commit evidence sebagai N/A di proyek tanpa git.
  > **How to apply**: saat schema berikutnya diubah, jadikan langkah git bersyarat dengan bukti pengganti berupa daftar file dan hasil uji.

- [ ] 🟡 **Mode "dikerjakan sendiri" wajib ditutup review independen** → **Promote to memory** (type: feedback)
  > **Why**: terulang di siklus ini (0 subagent, 0 reviewer). Uji CDP menangkap cacat tampilan, tetapi tidak menilai kualitas kode.
  > **How to apply**: di akhir `/opsx:apply` proyek ini, sebelum verify, kirim satu reviewer (`/code-review` atau subagent) untuk file yang diubah.

- [ ] 📌 **Uji UI di proyek ini: Edge headless + CDP lewat Node 24** → **Promote to memory** (type: reference)
  > **Why**: dipakai dua siklus berturut-turut; harness `cdp.mjs` (ev / check / shot / send) dan emulasi media print bekerja tanpa dependency.
  > **How to apply**: setiap langkah "Verifikasi di browser" pada tasks.md proyek ini.

- [ ] 📌 **Perubahan setelah apply harus ikut memperbarui design dan tasks** → **One-off** (dicatat, tidak dipromosikan)
  > **Why**: dari siklus sebelumnya; di siklus ini deviasi kecil cukup dicatat di §3 dan verify §4, bukan dengan menulis ulang design.

Kandidat baru:

- [ ] 🟡 **Jangan pakai heredoc Bash untuk konten yang memuat karakter non-ASCII di proyek Windows ini** → **Promote to memory** (type: feedback)
  > **Why**: dua kali di siklus ini konten terpotong diam-diam karena `→`, sehingga satu append kode gagal dan satu file uji terpotong.
  > **How to apply**: untuk menulis atau menambah blok kode/skrip panjang, gunakan tool Write/Edit; heredoc hanya untuk teks ASCII pendek.

- [ ] 📌 **Bungkus `#rawTable` dengan `.table-scroll` agar Persediaan tidak melebar di layar HP** → **One-off** (calon change terpisah)
  > **Why**: masalah lama yang ditemukan saat uji 390px, di luar cakupan change ini.
  > **How to apply**: usulkan sebagai change kecil bila stakeholder mendemokan tampilan mobile.
