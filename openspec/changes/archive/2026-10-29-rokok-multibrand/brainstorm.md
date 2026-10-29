# Brainstorm: rokok-multibrand

## Latar belakang

Permintaan user: "saat ini item rokok hanya 1 jenis, baik di cart maupun di menu persediaan, saya ingin rokok bisa multibrand, buat saja sample Brand A,B,C dan seterusnya. kemudian saat pilih di cart ataupun fitur pesanan bisa pilih multiple brand rokok."

### Temuan di kode (POS, index.html + app.js)

Rokok saat ini **belum menjadi item stok sama sekali**. Kata "rokok" hanya muncul sebagai bentuk fee driver:

```
+---------------------------+       +------------------------------+
| Kasir: feeModal()         |       | Pesanan: form order          |
| app.js:22                 |       | index.html:134, app.js:254   |
|  [Uang tunai] [Rokok]     |       |  select ofFeeType: cash/stock|
|  input: "Jumlah bungkus"  |       |  input: ofFeeValue           |
+-------------+-------------+       +---------------+--------------+
              |                                     |
              v                                     v
   mode biasa: fee=0 + toast saja      order.fee = {type:'stock', value:2}
   (tidak disimpan, stok tidak         feeText() -> "2 bungkus rokok"
    dipotong)                          (stok juga tidak dipotong)
              |                                     |
              +------------------+------------------+
                                 v
                  Persediaan: TIDAK ADA item rokok
```

- `rawStock`, `finishedStock`, dan `menuData` tidak memuat rokok.
- Di Kasir mode biasa, fee rokok hanya memunculkan toast. Jumlahnya tidak disimpan dan stok tidak dipotong.
- Di Pesanan, fee rokok disimpan sebagai `{type:'stock', value:n}` tanpa merek.

### Temuan: jalur jual + potong stok sudah ada dan generik

```
menuData = { Paket, Premium, 'Nasi Box', 'Ala carte', Minuman, Jajanan, + Rokok }
     |
     +--> Tab Kasir        renderCategories()  app.js:16   (Object.keys)
     +--> Tab Pesanan      renderOrderForm()   app.js:248  (Object.keys)
     +--> Admin daftar menu                    app.js:157  (otomatis)
     |
     v  dicocokkan berdasarkan NAMA
finishedStock (LPP barang dagangan)
     ^                                  ^
     | Kasir bayar: #finishPay app.js:128   | Order Selesai: deductOrderStock app.js:238
```

Jadi menambah kategori `Rokok` di `menuData` dan baris bernama sama di `finishedStock` sudah langsung membuat rokok bisa dijual multi-merek di Kasir dan Pesanan, lengkap dengan pemotongan stok, tanpa logika baru.

## Rantai keputusan

**Q1. Apakah rokok hanya dipakai sebagai fee driver, atau juga dijual ke pelanggan?**
→ User: "rokok bisa dijual juga".
Konsekuensi: rokok menjadi kategori menu dengan harga per merek.

**Q2. Rokok disimpan di buku stok mana?**
Opsi:
- (a) `rawStock` (bahan baku). Ikut alur Permintaan barang/PO, tetapi alur jual tidak memotong `rawStock`, jadi perlu logika potong baru.
- (b) `finishedStock` (barang dagangan). Alur jual Kasir dan order Selesai sudah memotong buku ini berdasarkan nama.
→ Usulan: (b). User: "ikuti usulan kamu".

**Q3. Multi-merek di cart dan pesanan dibuat seperti apa?**
→ Setiap merek adalah kartu menu tersendiri (Rokok Brand A…E). Memilih beberapa merek menghasilkan beberapa baris cart atau order. Tidak perlu komponen baru.

**Q4. Fee driver berupa rokok juga multi-merek?**
→ Ya. Fee rokok bisa memilih beberapa merek beserta jumlahnya. Bentuk data: `fee={type:'stock', items:[{name,qty}]}`. Daftar merek diambil dari kategori `Rokok`.

**Q5. Apakah fee rokok tampil sebagai baris di cart?**
→ Usulan: tidak, cukup di baris "Fee driver" dengan teks "Brand A ×2, Brand C ×1". User: "tidak, fee rokok tidak muncul sebagai baris di cart".

**Q6. Kapan stok fee rokok dipotong?**
- Transaksi Kasir biasa: user memilih "saat bayar di kasir".
- Order Pesanan: perlu klarifikasi, karena order bisa langsung di-Selesai-kan dari view Pesanan tanpa lewat Kasir, dan dibayar bertahap (risiko potong ganda).
  - (a) saat order dibayar di Kasir
  - (b) saat order Selesai, bersama stok item, sesuai aturan "stok dipotong hanya saat order Selesai"
  → Usulan: (b). User: "oke, b ikut saran kamu".

**Q7. Apakah rokok ikut alur Permintaan barang/PO?**
→ Usulan: tidak untuk sementara, karena alur itu khusus `rawStock`. User: "sementara ikut usulan kamu".

## Pendekatan yang disepakati

```
               +-------------- Kategori menu "Rokok" --------------+
               |  Brand A  Brand B  Brand C  Brand D  Brand E      |
               +------+-------------------------------+------------+
                      | jual (item cart/order)        | fee driver (multi-merek)
                      v                               v
              baris cart / order              baris "Fee driver" saja
                      |                               |
                      +-----------+-------------------+
                                  v
                finishedStock: Rokok Brand X dipotong
                (Kasir: saat bayar | Pesanan: saat Selesai)
```

Contoh data:

```
Rokok: [['Rokok Brand A',32000,'Isi 16 batang','RA'], ['Rokok Brand B',28000,'Isi 12 batang','RB'],
        ['Rokok Brand C',25000,'Isi 12 batang','RC'], ['Rokok Brand D',35000,'Isi 20 batang','RD'],
        ['Rokok Brand E',22000,'Isi 10 batang','RE']]
finishedStock += {name:'Rokok Brand A',qty:24,unit:'bungkus',min:10,cost:29500}, ...
```

## Trade-off yang diterima

- Rokok di `finishedStock` tidak bisa diminta lewat Permintaan barang/PO. Ini diterima untuk sementara (Q7).
- Nama merek ditulis dua kali (`menuData` dan `finishedStock`), sama seperti pola Paket Favorit 25K yang sudah ada. Pencocokan memakai nama persis.
- Data contoh order lama `{type:'stock', value:2}` perlu dimigrasi ke bentuk `items`.
