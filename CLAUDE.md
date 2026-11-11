# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, clickable **UI prototype** for "Sekulan RBT", a multi-outlet restaurant POS (Indonesian; all UI copy is in Bahasa Indonesia, currency in Rupiah via `toLocaleString('id-ID')`). There is no backend, build step, package manager, linter, or test suite. Every piece of data is a hard-coded in-memory array, and actions only change those arrays and show a toast. Nothing is persisted.

## Running

Open `index.html` or `outlet-data.html` directly in a browser, or serve the folder with any static server (for example `npx serve .` or `python -m http.server`). Reloading resets all state.

### Automated checks (headless Chrome)

There is no test suite, but UI flows can still be checked automatically:

1. Copy `index.html` to a git-ignored scratch folder, for example `.superpowers/sdd/<plan>/harness/harness.html`, with `sed`. Rewrite the `styles.css` / `app.js` paths so they point back to the project, then add `<script src="test.js"></script>` after `app.js`.
2. In `test.js`:
   - Log in by setting `#loginUser` / `#loginPass` and calling `requestSubmit()` on `#loginForm`. All demo passwords are `demo123`.
   - Drive the UI with `.click()` and with `dispatchEvent(new Event('input'|'change'))`. Handlers are `on*` properties, so dispatched events trigger them.
   - Assert exact values (toast text in `#toast`, Rupiah strings, document IDs), then write `PASS`/`FAIL` lines into a `<pre id="__results">` appended to `body`.
3. Run `chrome.exe --headless=new --allow-file-access-from-files --window-size=1440,1000 --dump-dom file:///…/harness.html` and parse the results `<pre>` out of the dumped DOM.

The flows are synchronous, so `--dump-dom` is enough. Do not use Playwright or npm, and never put harness files in the project tree. Top-level `const`/`let` globals in `app.js` (for example `rawStock` or `stockMoves`) can be read directly from `test.js`. Even when the harness passes, recommend one manual click-through in a real browser before a demo.

When a change touches layout or responsive CSS (sidebar, grids, `styles.css` media queries), also take `--screenshot` captures at 1440×1000, 1000×800 and 390×844 and look at them before calling the task done. Harness assertions alone missed a broken ≤1050px icon-mode sidebar that only the 1000px screenshot showed.

## Two independent apps

| Page | Script / styles | Purpose |
|---|---|---|
| `index.html` | `app.js`, `styles.css` | Outlet-side POS: Kasir (cashier, with receipt printing after payment), Laporan (reports, CSV export), Persediaan (submenus Stok barang dagangan, Stok bahan baku, Mutasi stok, Stok opname, Permintaan barang, Master menu), Pesanan (scheduled orders), Admin (submenus Outlet, Pengguna, Shift, Hak akses, Notifikasi owner). Starts behind a login overlay (`body.auth-locked`). Login checks `loginAccounts` (all demo passwords are `demo123`), and the role switch only auto-fills a demo username. There are three roles (Kasir, Kepala Toko, Administrator), and `ROLE_ACCESS` sets the views (`views`), submenus (`subs`, an array or `'all'`) and landing view each one sees: Kasir gets only the Kasir view (the sidebar is hidden through `body.role-kasir`), while Kepala Toko and Administrator get Laporan, Persediaan, Pesanan and Admin and land on Laporan. Kepala Toko sees every Persediaan submenu (Master menu read-only through `menuReadOnly()`) and only Outlet and Shift under Admin. The sidebar groups are always open: a submenu button carries `data-view` + `data-sub`, and `openSub(view,sub)` shows the parent section, then `setInventorySub(sub)` (toggles `#inventory [data-subs]` panels, sets `activeLedger` and the title from `INV_TITLES`) or `switchAdminTab(sub)` (title from `ADMIN_TITLES`). Each submenu has its own summary cards from `SUB_CARDS`, rendered by `renderSubSummary('inv'|'admin')`. Every data table/list shows at most `PAGE_SIZE=10` rows with a dummy pager from `setPager(el,total)`; the stock tables also have Status and "Jenis item" (Bahan/Hasil produksi, Siap jual) filters. Kepala Toko are assigned one per shift. After a Kasir logs in, a full-screen "Mulai Shift" overlay (`#shiftScreen`, styled like the login screen) locks the POS until the shift is started. Pressing "Mulai shift" opens a "Verifikasi Kepala Toko" modal with the handover note from the previous shift (`HANDOVER_NOTES`). The Kepala Toko password there is display-only, and a Kepala Toko note is required when the opening cash differs from the previous shift's remaining cash. Closing a shift ("Tutup shift") happens only from a Kasir session and always requires the credentials of that shift's Kepala Toko. A Kasir can also press "Logout" in the Kasir header, which asks for confirmation, empties the cart and ends the session without closing the shift. The running shift is kept in the `openShift` global, so the same username logging in again skips Mulai Shift and resumes (toast "Melanjutkan Shift n"). Closing the shift or reloading the page clears `openShift`. |
| `outlet-data.html` | `outlet-data.js`, `outlet-data.css` (+ `outlet-data-extra.css`, injected at runtime by the first line of `outlet-data.js`) | Head-office "Pusat Data Outlet" hub. It ingests per-shift ZIP packages that outlets upload over SFTP (`/inbox` → `/processed` or `/failed`), then validates, approves and reports on them. |

The two pages share no JS and no state. They are connected only by links and by the domain concept: closing a shift in the POS produces a data package that the hub later imports.

## Code conventions (match these when editing)

- Plain browser JS with no modules. Globals are shared across the whole file. Helpers are `$` / `$$` (querySelector / querySelectorAll), `rupiah` (app.js) or `rp` (outlet-data.js), and `showToast` / `toast`.
- Rendering works by assigning template-literal HTML to `innerHTML` and then attaching handlers through `.onclick =` assignments. Do not use `addEventListener`, because re-renders replace the elements anyway.
- Navigation toggles an `active` class. In `index.html`, `.nav-item[data-view]` switches `section.view`. In `outlet-data.html`, `aside nav button[data-page]` switches `section.hub-page` through `switchPage()`, which also sets the header title and eyebrow from a `titles` map.
- Modals and drawers are filled with HTML strings: `openModal(html)` / `closeModal()` in app.js, and `#drawer` plus `closeDrawer()` in outlet-data.js. Elements marked `[data-close]` or `.drawer-close` close them.
- Code is dense, often one line per function, especially in `outlet-data.js` and `outlet-data.html`. Keep that density when editing those files.
- Some records are positional arrays rather than objects. For example, `submissions[i][7]` is the status and `[8]` is the filename. Check the table header that renders an array before you index into it.

## Scheduled orders (Pesanan)

Administrator and Kepala Toko create orders in the Pesanan view (`section#orders`). Kepala Toko are limited to their own outlet. Orders live in `scheduledOrders`, an array of objects (not positional) at the end of `app.js`. Payment status is never stored; `orderMoney(o)` derives it from items and payments (Belum bayar, Sebagian, Lunas, Lebih bayar). Driver fee is an expense and does not reduce the bill. Stock is cut only when an order becomes Selesai. In the Kasir view, the "Ubah" button on the customer row sets `activeOrder`, and `renderCart`, `#payButton`, `feeModal` and `openCancel` branch on it. Cart lines loaded from the order carry `saved:true`, and cancelling one needs the current shift's Kepala Toko credentials.

Rokok (Rokok Brand A–E) is a normal `menuData` category whose items have stock rows with exactly the same names. Matching is by name, so a rename must change both places. Those rows, plus `'Air mineral'`, live in `sharedStock` (marked `shared:true`), which is spread into the end of both `rawStock` and `finishedStock`. Both arrays therefore hold the same objects: restocking via "+ Stok masuk" or a PO and cutting via sales or fees change one stock that shows in both stock submenus (Stok bahan baku and Stok barang dagangan) with a "Tersambung" badge, and the "Jenis item" filter calls them "Siap jual". Shared items are filtered out of `productionModal`, and each stock page's "Stok menipis" card counts its own ledger, so a low shared item counts on both pages. Never copy these objects (`{...x}`), or the link breaks. A driver fee is `{type:'cash',value}` or `{type:'stock',items:[{name,qty}]}`. In normal Kasir mode the fee is held in the two globals `fee` (cash) and `feeRokok` (rokok items). Every cart reset must clear both. `rokokPickerHtml`/`readRokokPicker` provide the brand picker, and `cutFinished(lines)` cuts `finishedStock` with a floor of 0. Fee rokok stock is cut at Kasir payment, or when an order becomes Selesai.

## Master menu

Each `menuData` item is a positional array `[name, price, desc, artLabel, code, barcode, active]`. Indexes 4–6 are filled by an init loop right after `menuData`: `code` is a fixed `MNU-PA01`-style code (new codes come from `nextMenuCode(cat)`), `barcode` comes from `MENU_BARCODES`, and `active` is a boolean. `menuActive(x)` filters out inactive items in the Kasir grid (`renderMenu`), the order form (`renderOrderForm`) and the rokok fee picker (`rokokPickerHtml`, which still shows a brand already saved in the fee). `menuForm({cat,i})` edits an item in place and moves it when the category changes; `menuForm()` adds one. Kepala Toko may change only the "Menu aktif" toggle (`canToggleMenu()`, derived from `ROLE_ACCESS`). The Master menu table (`renderMasterMenus`) filters by `menuCatFilter` (dropdown), `menuStatusFilter` (chips) and `menuQuery` (code, name or barcode).

## Shift closing review (Berita acara tutup shift)

The Kasir closing flow is short: cash amount and an optional note, then Kepala Toko authorization, then a success modal. The Kasir never sees the expected cash or the difference. `finishClosing()` adds a record to `shiftClosings`, an array of objects in `app.js` (one row per `BA-0920-S<n>`, replaced if that shift closes again), with status "Belum Diperiksa". The Admin › Shift submenu (`#adminShifts`, `renderClosings()`, `#baTable`) lists them. `openClosingReview(id)` renders a full detail page into `section#closingReview`: cash recap, transactions, cancel history, and paging that is only an example. Any Kepala Toko of the outlet can mark a record "Sudah Diperiksa" with a BA note and a confirmation checkbox. Administrator can only view.

## Raw material requests (Permintaan barang)

Persediaan › Permintaan barang is the submenu for restocking raw materials. Requests live in `materialRequests`, an array of objects in `app.js`, rendered by `renderMaterialRequests()`. Flow: Menunggu persetujuan → Disetujui (PO issued, `REQ-0920-n` → `PO-0920-n`) → PO dicetak → Selesai, with a Ditolak branch. Kepala Toko requests wait for Administrator approval; Administrator requests are approved automatically. Receiving goods against a PO adds to `rawStock` and updates its unit cost; editing the PO price does not. Every step is logged to the request's history timeline. "+ Stok masuk" still records receipts without a PO.

## Stock opname (Stok opname)

Persediaan › Stok opname lets a Kepala Toko count physical stock for their own outlet. One session covers one scope: Bahan baku (`rawStock` without shared items) or Barang dagangan (`finishedStock`, shared items included as "Siap jual"), so each shared item is counted exactly once. Documents live in `stockOpnames`, an array of objects at the end of `app.js` (`{id,outlet,date,time,scope,by,items:[{name,unit,system,physical,cost,note}]}`); seeds are built by `soSeed()` from the current ledgers, and derived numbers come from `opnameStats()`. "+ Mulai opname" picks the scope in a modal, then opens the inline form `#opnameFormPanel` (`#inventory.opname-form-open`, same pattern as the request form). Physical qty is prefilled with the system qty; `updateOpnameRow(i)` updates one row without re-rendering, so inputs keep focus. A row with a difference shows a "Wajib diisi" label and reason chips, but the note is never validated. Saving (`saveOpname()`) sets each `ref.qty` to the counted qty, adds `SO-0920-n`, and pushes the same id onto `stockMoves` (☑ icon). The detail page is `section#opnameDetail` (`openOpnameDetail(id)`). Administrator only views, choosing the outlet with `#opnameOutletFilter` (default Sekulan RBT 519A); `loginAs` resets that and the scope chip. Use `rupiahSigned()` for signed Rupiah, because `rupiah()` clamps negatives to 0.

## Receipt printing (Cetak struk)

After the Kasir confirms a payment (`#finishPay` in the last `#payButton` handler, or `#kpSave` in `openOrderPayment()` when the amount is above 0), the old toast still shows, and then `openReceiptModal(r)` opens a "Pembayaran berhasil" modal. The record `r` is snapshotted before the cart is reset: `{no,time,cashier,items,method,total,shown,order?}`. `no` comes from `nextTrx()` (`TRX-0920-1088` onward, page-load counter). `receiptHtml(r)` builds a 58 mm `.receipt`. The receipt TOTAL is the sum of the items, and the driver fee is never printed, so it can differ from the modal amount `shown`. `printReceipt(r)` follows the PO print pattern: fill `#receiptPrint`, add `body.print-receipt`, `window.print()`, remove the class. CSS `@page size` cannot take `auto` as a height, so `fitReceiptPage()` measures the receipt and writes `@page receipt{size:58mm <h>mm}` into `<style id="receiptPage">`. It is a named page, so PO and report prints keep their own paper size.

## Gotcha: app.js is layered

`app.js` was built by appending new sections onto earlier ones. `renderInventory` and `renderReports` are each declared **twice**, and the later function declaration silently wins. Later sections also reassign `.onclick` on elements that earlier code already wired up. Before editing a behavior, search for every definition and handler assignment of it, and change the last one, or remove the dead earlier copy.

## OpenSpec workflow

The repo is set up for OpenSpec (`openspec/config.yaml`, schema `superpowers-bridge`). Specs go in `openspec/specs/`, in-flight changes go in `openspec/changes/`, and finished ones are moved to `openspec/changes/archive/`. Use the `/opsx:propose`, `/opsx:apply`, `/opsx:sync` and `/opsx:archive` commands (or the matching `openspec-*` skills in `.claude/skills/`) when you plan and implement feature changes.

Project rules that override the schema's default flow:

- **Apply without worktree or commits.** Commit, branch or create a worktree only when the user asks. Run `sdd-workspace` to get `.superpowers/sdd/<plan>/`, snapshot the touched files into its `base/` folder, keep the headless-Chrome harness there, and build review diffs against that snapshot. If the user picks native execution (`superpowers:executing-plans`) instead of subagent-driven development, follow that choice: TDD per task with the harness, then one fresh-subagent review at the end. Mention the deviation from the schema's apply instruction once.
- **Verify and retrospective are optional.** Produce `verify.md` or `retrospective.md` only when the user asks (for example by running `/opsx:verify`). Don't start them after apply, and don't present them as required before archive.
- **MODIFIED delta specs keep the old scenario names.** `openspec validate` rejects a MODIFIED requirement that drops or renames a scenario from the main spec. When an old scenario's meaning flips, move the requirement to REMOVED (with Reason and Migration) and write the new one under ADDED.
- **Dummy paging can hide demo rows.** POS tables show at most `PAGE_SIZE=10` rows, and the pager is a dummy. When a spec scenario or a demo depends on a specific row, check that it appears on page 1 or can be reached with a filter.
