import fs from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Workbook, SpreadsheetFile } = require('@oai/artifact-tool');
const outputDir = new URL('.', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const wb = Workbook.create();
const summary = wb.worksheets.add('Ringkasan');
const hardware = wb.worksheets.add('Perangkat');
const services = wb.worksheets.add('Jasa');
const schedule = wb.worksheets.add('Jadwal');
const assumptions = wb.worksheets.add('Asumsi');
const font = 'Arial';
const money = '#,##0;(#,##0);–';
const header = '#9F2118';
const orange = '#E85E18';
const pale = '#FFF2E8';

function styleSheet(sh, lastCol, lastRow, widths) {
  sh.showGridLines = false;
  sh.getRange(`A1:${lastCol}${lastRow}`).format.font = {name:font,size:10,color:'#242424'};
  sh.getRange(`A1:${lastCol}${lastRow}`).format.rowHeight = 22;
  for (const [col,width] of Object.entries(widths)) sh.getRange(`${col}:${col}`).format.columnWidth = width;
  sh.getRange(`A2:${lastCol}2`).format.font = {name:font,size:15,bold:true,color:header};
  sh.getRange(`A3:${lastCol}3`).format.font = {name:font,size:10,italic:true,color:'#666666'};
}
function band(sh, range){sh.getRange(range).format={fill:header,font:{name:font,size:10,bold:true,color:'#FFFFFF'},rowHeight:26,verticalAlignment:'center'};}
function total(sh,range){sh.getRange(range).format={fill:pale,font:{name:font,size:10,bold:true,color:header},rowHeight:26};}
function val(sh,cell,value){sh.getRange(cell).values=[[value]];}
function f(sh,cell,formula){sh.getRange(cell).formulas=[[formula]];}

styleSheet(assumptions,'D',22,{A:38,B:18,C:18,D:90});
val(assumptions,'A2','Asumsi anggaran');
val(assumptions,'A3','Ubah angka di kolom B untuk menghitung ulang biaya. Rupiah, per November 2026.');
assumptions.getRange('A5:D5').values=[['Asumsi','Nilai','Satuan','Keterangan']];band(assumptions,'A5:D5');
const ass=[
  ['Jumlah outlet pilot',1,'outlet','Satu outlet untuk uji lapangan'],
  ['Jumlah outlet penerapan',8,'outlet','Sesuai daftar contoh outlet dalam prototipe; ganti sesuai rencana akhir'],
  ['Cadangan anggaran',0.12,'','Diterapkan atas biaya awal sebelum pajak'],
  ['Pemeliharaan software tahunan',0.15,'','Persentase dari biaya pengembangan inti'],
  ['Internet utama per outlet per bulan',600000,'','Asumsi anggaran; cek tarif dan koneksi yang sudah ada'],
  ['Internet cadangan per outlet per bulan',150000,'','Paket data seluler untuk kegagalan provider utama'],
  ['Hosting pusat per bulan',1500000,'','Server pusat dan penerimaan kiriman outlet'],
  ['Cadangan data tahunan',6000000,'','Penyimpanan cadangan dan pemantauan'],
];
assumptions.getRange('A6:D13').values=ass;
assumptions.getRange('B6:B13').format.font={name:font,size:10,color:'#1D4ED8'};
assumptions.getRange('B8:B9').setNumberFormat('0%');
assumptions.getRange('B10:B13').setNumberFormat(money);
assumptions.getRange('A16').values=[['Catatan']];
val(assumptions,'A17','Biaya pengembangan merupakan estimasi perencanaan, bukan penawaran vendor.');
val(assumptions,'A18','Belum termasuk PPN, biaya EDC/QRIS, langganan SMS/WhatsApp, dan renovasi meja kasir.');

styleSheet(hardware,'H',30,{A:32,B:13,C:17,D:17,E:17,F:18,G:18,H:64});
val(hardware,'A2','Biaya perangkat');
val(hardware,'A3','Satu PC utama dan satu tablet Kasir tambahan per outlet. Harga satuan adalah pagu, bukan penawaran final.');
hardware.getRange('A5:H5').values=[['Perangkat','Lokasi','Qty/lokasi','Harga satuan','Biaya','Pilot','Penerapan','Acuan harga / asumsi']];band(hardware,'A5:H5');
const hw=[
['PC Kasir + monitor + keyboard','Outlet',1,6500000,'https://www.blibli.com/jual/komputr-kasir ; https://www.blibli.com/jual/monitor-22-inch'],
['Tablet Kasir 5G 11 inci','Outlet',1,5000000,'https://www.samsung.com/id/tablets/galaxy-tab-a/galaxy-tab-a11-plus-gray-128gb-5g-sm-x236bzaaxid/buy/'],
['Printer thermal 58 mm','Outlet',2,2850000,'https://www.blibli.com/jual/epson-tm-t82x ; model perlu uji pemandu 58 mm'],
['Scanner barcode USB','Outlet',1,1350000,'https://www.blibli.com/jual/barcode-scanner-otomatis'],
['Scanner barcode Bluetooth','Outlet',1,1000000,'https://www.blibli.com/jual/bluetooth-barcode-scanner'],
['UPS PC dan jaringan','Outlet',1,1300000,'https://www.blibli.com/jual/ups'],
['Router / Wi-Fi lokal','Outlet',1,2200000,'https://www.blibli.com/p/mikrotik-hap-ax2-c52ig-5haxd2haxd-tc-router-wireless-wifi-6/ps--CIB-60031-00301'],
['Server lokal mini PC','Outlet',1,6000000,'Asumsi pagu perangkat; spesifikasi akhir mengikuti uji beban'],
['SSD cadangan lokal','Outlet',1,1000000,'Asumsi pagu media cadangan'],
['Laci uang','Outlet',2,600000,'Asumsi pagu; dua laci bila tablet menerima tunai'],
['Kabel, dudukan, aksesori','Outlet',1,1500000,'Asumsi pagu instalasi'],
['Laptop Kepala Toko','Outlet',1,14000000,'https://www.blibli.com/jual/laptop-lenovo-thinkbook-i5-16-gb'],
['Laptop Administrator pusat','Pusat',1,15000000,'https://www.blibli.com/jual/laptop-lenovo-thinkbook-i5-16-gb'],
];
hw.forEach((x,i)=>{const r=6+i;hardware.getRange(`A${r}:D${r}`).values=[[x[0],x[1],x[2],x[3]]];val(hardware,`H${r}`,x[4]);f(hardware,`E${r}`,`=C${r}*D${r}`);f(hardware,`F${r}`,`=IF(B${r}="Outlet",E${r}*Asumsi!B6,E${r})`);f(hardware,`G${r}`,`=IF(B${r}="Outlet",E${r}*Asumsi!B7,E${r})`)});
hardware.getRange('D6:G19').setNumberFormat(money);
hardware.getRange('A20').values=[['Total perangkat']];
for(const col of ['E','F','G'])f(hardware,`${col}20`,`=SUM(${col}6:${col}18)`);
total(hardware,'A20:G20');hardware.getRange('E20:G20').setNumberFormat(money);
hardware.freezePanes.freezeRows(5);

styleSheet(services,'F',25,{A:36,B:18,C:18,D:19,E:19,F:77});
val(services,'A2','Biaya jasa dan implementasi');
val(services,'A3','Pengembangan inti dibayar sekali; pelatihan dan penerapan dihitung berdasarkan outlet.');
services.getRange('A5:F5').values=[['Pekerjaan','Sifat biaya','Biaya satuan','Pilot','Penerapan','Dasar perhitungan']];band(services,'A5:F5');
const svc=[
['Analisis proses dan desain','Tetap',60000000,'2–3 minggu analisis kebutuhan, alur, desain UX'],
['POS PC/tablet dan pembayaran','Tetap',120000000,'Kasir paralel, struk, printer, scanner, identitas terminal'],
['Stok, produksi, master data','Tetap',120000000,'Bahan baku, barang dagangan, SO, transfer, supplier'],
['Shift, setoran, order, laporan','Tetap',100000000,'Tutup shift per Kasir, BA, order Biro/Bus, laporan'],
['Offline, server outlet, sinkron','Tetap',120000000,'Antrean lokal, konflik stok, paket outlet, FTP pusat'],
['QA, keamanan, UAT, dokumentasi','Tetap',80000000,'Pengujian perangkat, data, akses dan serah terima'],
['Pelatihan outlet pertama','Sekali',10000000,'2 hari pelatihan Kasir/Kepala Toko dan panduan'],
['Pelatihan outlet tambahan','Outlet tambahan',6000000,'1–2 hari per outlet tambahan'],
['Instalasi dan uji outlet','Per outlet',3000000,'1–2 hari pemasangan dan uji perangkat per outlet'],
['Konfigurasi pusat','Sekali',8000000,'Pusat data, backup, dan penerimaan kiriman'],
['Perjalanan dan akomodasi','Per outlet',2000000,'Pagu; disesuaikan lokasi nyata'],
];
svc.forEach((x,i)=>{const r=6+i;services.getRange(`A${r}:C${r}`).values=[[x[0],x[1],x[2]]];val(services,`F${r}`,x[3]);const q=x[1]==='Tetap'||x[1]==='Sekali'?'1':x[1]==='Per outlet'?'Asumsi!B6':'MAX(0,Asumsi!B6-1)';const q2=x[1]==='Tetap'||x[1]==='Sekali'?'1':x[1]==='Per outlet'?'Asumsi!B7':'MAX(0,Asumsi!B7-1)';f(services,`D${r}`,`=C${r}*${q}`);f(services,`E${r}`,`=C${r}*${q2}`)});
services.getRange('C6:E16').setNumberFormat(money);
for(const col of ['D','E'])f(services,`${col}17`,`=SUM(${col}6:${col}16)`);
val(services,'A17','Total jasa');total(services,'A17:E17');services.getRange('D17:E17').setNumberFormat(money);
services.freezePanes.freezeRows(5);

styleSheet(summary,'E',26,{A:39,B:21,C:21,D:7,E:80});
val(summary,'A2','Estimasi biaya proyek Sekulan RBT');
val(summary,'A3','Anggaran November 2026. Jumlah outlet dan harga dapat diubah pada tab rincian.');
summary.getRange('A5:C5').values=[['Komponen','Pilot 1 outlet','Penerapan 8 outlet']];band(summary,'A5:C5');
const lines=[
['Jumlah outlet','=Asumsi!B6','=Asumsi!B7'],
['Perangkat',"=Perangkat!F20","=Perangkat!G20"],
['Pengembangan software',"=SUM(Jasa!D6:D11)","=SUM(Jasa!E6:E11)"],
['Pelatihan',"=SUM(Jasa!D12:D13)","=SUM(Jasa!E12:E13)"],
['Instalasi, pusat, perjalanan',"=SUM(Jasa!D14:D16)","=SUM(Jasa!E14:E16)"],
['Subtotal awal','=SUM(B7:B10)','=SUM(C7:C10)'],
['Cadangan anggaran','=B11*Asumsi!B8','=C11*Asumsi!B8'],
['Total investasi awal','=SUM(B11:B12)','=SUM(C11:C12)'],
];
lines.forEach((x,i)=>{const r=6+i;val(summary,`A${r}`,x[0]);f(summary,`B${r}`,x[1]);f(summary,`C${r}`,x[2])});
// Subtotal row is row 11; the formula above intentionally sums rows 7–10.
summary.getRange('B7:C13').setNumberFormat(money);
total(summary,'A11:C11');total(summary,'A13:C13');
val(summary,'A16','Perkiraan biaya rutin per tahun');
summary.getRange('A17:C17').values=[['Komponen','Pilot','Penerapan']];band(summary,'A17:C17');
const recurring=[
['Pemeliharaan software','=SUM(Jasa!D6:D11)*Asumsi!B9','=SUM(Jasa!E6:E11)*Asumsi!B9'],
['Hosting pusat','=Asumsi!B12*12','=Asumsi!B12*12'],
['Internet utama + cadangan','=Asumsi!B6*(Asumsi!B10+Asumsi!B11)*12','=Asumsi!B7*(Asumsi!B10+Asumsi!B11)*12'],
['Cadangan data','=Asumsi!B13','=Asumsi!B13'],
['Total biaya rutin per tahun','=SUM(B18:B21)','=SUM(C18:C21)'],
];
recurring.forEach((x,i)=>{const r=18+i;val(summary,`A${r}`,x[0]);f(summary,`B${r}`,x[1]);f(summary,`C${r}`,x[2])});
summary.getRange('B18:C22').setNumberFormat(money);total(summary,'A22:C22');
val(summary,'A25','Belum termasuk PPN dan biaya transaksi penyedia pembayaran.');
val(summary,'A26','Harga vendor, lokasi outlet, dan kebutuhan server final harus dikonfirmasi sebelum kontrak.');

styleSheet(schedule,'E',20,{A:35,B:16,C:16,D:25,E:77});
val(schedule,'A2','Jadwal pelaksanaan');
val(schedule,'A3','Perkiraan 28 minggu sampai pilot, 34 minggu sampai 8 outlet. Beberapa pekerjaan berjalan bersamaan.');
schedule.getRange('A5:E5').values=[['Tahap','Mulai minggu','Selesai minggu','Durasi kalender','Hasil']];band(schedule,'A5:E5');
const phases=[
['Analisis kebutuhan',1,3,'Kebutuhan final dan proses outlet'],
['Desain UX dan arsitektur',3,6,'Desain aplikasi dan data'],
['Pengembangan modul inti',7,20,'POS, stok, produksi, laporan, master, order'],
['Offline dan integrasi outlet-pusat',12,23,'Server lokal, antrean, FTP, konflik stok'],
['QA dan UAT',21,26,'Uji dua Kasir, cetak, pemutusan jaringan, tutup shift'],
['Instalasi dan pelatihan pilot',27,28,'Satu outlet beroperasi terpantau'],
['Penerapan outlet tambahan',29,34,'Instalasi dan pelatihan 7 outlet, bertahap'],
];
phases.forEach((x,i)=>{const r=6+i;schedule.getRange(`A${r}:C${r}`).values=[[x[0],x[1],x[2]]];f(schedule,`D${r}`,`=C${r}-B${r}+1`);val(schedule,`E${r}`,x[3])});
val(schedule,'A15','Pelatihan per outlet');val(schedule,'B15','1–2 hari');
val(schedule,'A16','Instalasi per outlet');val(schedule,'B16','1–2 hari');
val(schedule,'A17','Pendampingan pilot');val(schedule,'B17','2 minggu');

wb.recalculate();
const originalTotal=summary.getRange('C13').values[0][0];
val(assumptions,'B7',7);
wb.recalculate();
const sevenOutletTotal=summary.getRange('C13').values[0][0];
if(!(sevenOutletTotal<originalTotal))throw new Error('Jumlah outlet tidak mengubah total anggaran');
val(assumptions,'B7',8);
wb.recalculate();
if(summary.getRange('C13').values[0][0]!==originalTotal)throw new Error('Total anggaran tidak kembali setelah asumsi dipulihkan');
const check=await wb.inspect({kind:'table',range:'Ringkasan!A5:C22',include:'values,formulas',tableMaxRows:22,tableMaxCols:3,maxChars:6000});
console.log(check.ndjson);
const errs=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!',options:{useRegex:true,maxResults:100},summary:'Kesalahan rumus',maxChars:1500});
console.log(errs.ndjson);
for(const [sh,range] of [['Ringkasan','A1:C26'],['Perangkat','A1:H20'],['Jasa','A1:F17'],['Jadwal','A1:E17'],['Asumsi','A1:D18']]){
  const preview=await wb.render({sheetName:sh,range,scale:1.3,format:'png'});
  await fs.writeFile(`${outputDir}/${sh.toLowerCase()}-preview.png`,new Uint8Array(await preview.arrayBuffer()));
}
const file=await SpreadsheetFile.exportXlsx(wb);
await file.save(`${outputDir}/Estimasi-Biaya-Sekulan-RBT.xlsx`);
