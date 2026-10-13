import { LpjStimulanRecord, DataOrganisasi, SuratRecord } from '../types';
import { getActiveLogoNasional, getActiveLogoDki } from '../data/logos';
import { MAP_WILAYAH_TAMBORA } from '../data/wilayah';

/**
 * Membuka jendela print resmi beresolusi tinggi (vector-crisp)
 * yang otomatis menghasilkan PDF sempurna tanpa buram.
 */
export function printDocumentHtml(htmlContent: string, title: string = 'Dokumen Karang Taruna') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Harap izinkan popup browser untuk mencetak dokumen!');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <base href="${window.location.origin}/">
      <title>${title}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 15mm 12mm 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 10pt;
          line-height: 1.3;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 0;
        }
        .page {
          page-break-after: always;
          break-after: page;
          position: relative;
          box-sizing: border-box;
          padding-bottom: 4px;
        }
        .page:last-child {
          page-break-after: avoid;
          break-after: avoid;
        }
        .kop-container {
          margin-bottom: 12px;
        }
        .kop-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 3px;
        }
        .kop-logo {
          width: 76px;
          height: 76px;
          max-width: 76px;
          max-height: 76px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .kop-center {
          text-align: center;
          flex: 1;
          padding: 0 10px;
        }
        .kop-title-1 {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13pt;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin: 0;
          line-height: 1.2;
          color: #000;
        }
        .kop-title-unit {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 14pt;
          font-weight: 900;
          margin: 2px 0;
          letter-spacing: 0.5px;
          line-height: 1.2;
        }
        .kop-title-sub {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11pt;
          font-weight: 800;
          margin: 1px 0;
          line-height: 1.2;
          color: #000;
        }
        .kop-desc {
          font-size: 8.5pt;
          margin-top: 3px;
          line-height: 1.25;
          font-family: 'Times New Roman', Times, serif;
          color: #111;
        }
        .kop-line-double {
          border-top: 2.5px solid #000;
          border-bottom: 0.8px solid #000;
          height: 3px;
          margin-top: 4px;
          width: 100%;
        }
        table.tbl-resmi {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          font-size: 9.5pt;
        }
        table.tbl-resmi th, table.tbl-resmi td {
          border: 1px solid #000;
          padding: 4px 6px;
          vertical-align: middle;
        }
        table.tbl-resmi th {
          background-color: #f1f5f9;
          text-align: center;
          font-weight: bold;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-bold { font-weight: bold; }
        .ttd-container {
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          text-align: center;
          font-size: 10pt;
        }
        .ttd-box {
          width: 240px;
        }
        .materai-box {
          border: 1px dashed #666;
          width: 80px;
          height: 44px;
          font-size: 8pt;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 8px auto;
          color: #555;
        }
        img.foto-dokumentasi {
          max-width: 170px;
          max-height: 105px;
          object-fit: cover;
          border: 1px solid #94a3b8;
          border-radius: 4px;
          display: block;
          margin: 0 auto;
        }
      </style>
    </head>
    <body>
      ${htmlContent}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Render Kop Surat Karang Taruna Standar DKI
 */
export function renderKopHtml(
  tingkat: 'Kecamatan' | 'Kelurahan' | 'Unit RW',
  kelurahan: string,
  nomorRw: string,
  org: DataOrganisasi
): string {
  const logoKiri = org.logoKiriUrl || getActiveLogoNasional();
  const logoKanan = org.logoKananUrl || getActiveLogoDki();
  const tampilkanLogoKanan = org.tampilkanLogoKanan !== false;

  const baris1 = org.judulKopBaris1 || 'PENGURUS KARANG TARUNA';

  let baris2 = '';
  if (org.judulKopBaris2) {
    baris2 = org.judulKopBaris2;
  } else if (tingkat === 'Unit RW') {
    baris2 = `UNIT KERJA KARANG TARUNA (UKKT) RW. ${nomorRw || '001'}`;
  } else if (tingkat === 'Kelurahan') {
    baris2 = `PENGURUS KARANG TARUNA KELURAHAN ${kelurahan || 'PEKOJAN'}`;
  } else {
    baris2 = 'PENGURUS KARANG TARUNA KECAMATAN TAMBORA';
  }

  let baris3 = '';
  if (tingkat === 'Unit RW') {
    baris3 = `KELURAHAN ${kelurahan || 'PEKOJAN'} - KECAMATAN TAMBORA`;
  } else if (tingkat === 'Kelurahan') {
    baris3 = 'KECAMATAN TAMBORA';
  } else {
    baris3 = 'KECAMATAN TAMBORA';
  }

  const baris4 = org.judulKopBaris4 || 'KOTA ADMINISTRASI JAKARTA BARAT';

  let alamat = org.alamatKopSekretariat;
  if (!alamat) {
    if (tingkat === 'Unit RW') {
      alamat = `Sekretariat: Balai Warga RW ${nomorRw || '001'}, Kelurahan ${kelurahan || 'Pekojan'}, Kecamatan Tambora, Jakarta Barat 11240`;
    } else if (tingkat === 'Kelurahan') {
      alamat = `Sekretariat: Kantor Kelurahan ${kelurahan || 'Pekojan'}, Kecamatan Tambora, Jakarta Barat 11240`;
    } else {
      alamat = org.alamat || 'Jl. Tubagus Angke No. 1, Kelurahan Angke, Kecamatan Tambora, Jakarta Barat 11330';
    }
  }

  const kontak =
    org.kontakKop ||
    `Telepon/WA: ${org.telepon || '0812-8877-6655'} | Email: ${org.email || 'katar.kec.tambora@gmail.com'}`;

  let unitColor = '#000000';
  if (org.warnaJudulKop === 'merah') {
    unitColor = '#b91c1c';
  } else if (org.warnaJudulKop === 'biru') {
    unitColor = '#1e3a8a';
  }

  let logoPx = '76px';
  if (org.ukuranLogoKop === 'kecil') logoPx = '65px';
  if (org.ukuranLogoKop === 'besar') logoPx = '90px';

  return `
    <div class="kop-container">
      <div class="kop-wrapper">
        ${
          logoKiri
            ? `<img src="${logoKiri}" class="kop-logo" style="width: ${logoPx}; height: ${logoPx};" alt="Logo Karang Taruna" />`
            : `<div style="width: ${logoPx}; height: ${logoPx};"></div>`
        }
        <div class="kop-center">
          <div class="kop-title-1">${baris1}</div>
          <div class="kop-title-unit" style="color: ${unitColor};">${baris2}</div>
          <div class="kop-title-sub">${baris3}</div>
          <div class="kop-title-sub">${baris4}</div>
          <div class="kop-desc">
            ${alamat}<br>
            ${kontak}
          </div>
        </div>
        ${
          tampilkanLogoKanan && logoKanan
            ? `<img src="${logoKanan}" class="kop-logo" style="width: ${logoPx}; height: ${logoPx};" alt="Logo Karang Taruna Jaya Raya" />`
            : `<div style="width: ${logoPx}; height: ${logoPx};"></div>`
        }
      </div>
      <div class="kop-line-double"></div>
    </div>
  `;
}

/**
 * Menghasilkan HTML Lengkap Laporan Pertanggungjawaban (LPJ) 4-5 Lembar
 */
export function generateLpjHtml(lpj: LpjStimulanRecord, org: DataOrganisasi): string {
  const totalKeluar = lpj.pengeluaran.reduce((sum, item) => sum + item.jumlah, 0);
  const saldoAkhir = lpj.saldoBulanLalu + lpj.penerimaanDana - totalKeluar;

  const kop = renderKopHtml(lpj.tingkat, lpj.kelurahan, lpj.nomorRw, org);

  // Lembar 1: Laporan Keadaan Keuangan
  const page1 = `
    <div class="page">
      ${kop}
      <div class="text-center text-bold" style="text-decoration: underline; font-size: 12pt; margin-bottom: 4px;">
        LAPORAN KEADAAN KEUANGAN DANA STIMULAN
      </div>
      <div class="text-center text-bold" style="font-size: 11pt; margin-bottom: 12px;">
        ${lpj.tingkat === 'Unit RW' ? 'UNIT KERJA KARANG TARUNA (UKKT) RW ' + lpj.nomorRw : 'KARANG TARUNA KELURAHAN ' + lpj.kelurahan}<br>
        KELURAHAN ${lpj.kelurahan} KECAMATAN TAMBORA
      </div>
      <div style="margin-bottom: 8px; font-size: 10.5pt;">
        <strong>Bulan :</strong> ${lpj.bulan} &nbsp;|&nbsp; <strong>Tahun :</strong> ${lpj.tahun}
      </div>

      <table class="tbl-resmi">
        <thead>
          <tr>
            <th style="width: 45px;">NO</th>
            <th>KEGIATAN / URAIAN</th>
            <th style="width: 140px;">JUMLAH (Rp)</th>
            <th style="width: 110px;">KETERANGAN</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center text-bold">I</td>
            <td class="text-bold">SALDO BULAN LALU</td>
            <td class="text-right text-bold">${lpj.saldoBulanLalu.toLocaleString('id-ID')}</td>
            <td></td>
          </tr>
          <tr>
            <td class="text-center text-bold">II</td>
            <td class="text-bold">PENERIMA UANG DANA STIMULASI</td>
            <td class="text-right text-bold">${lpj.penerimaanDana.toLocaleString('id-ID')}</td>
            <td>DANA STIMULAN</td>
          </tr>
          ${lpj.pengeluaran
            .map(
              (p, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td>${p.uraian} <br><span style="font-size: 8.5pt; color: #475569;">(${p.bidang})</span></td>
              <td class="text-right">${p.jumlah.toLocaleString('id-ID')}</td>
              <td class="text-center">${p.status || 'TERLAKSANA'}</td>
            </tr>
          `
            )
            .join('')}
          <tr style="background-color: #f8fafc; font-weight: bold;">
            <td colspan="2" class="text-right">TOTAL PENGELUARAN :</td>
            <td class="text-right text-bold">${totalKeluar.toLocaleString('id-ID')}</td>
            <td></td>
          </tr>
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td colspan="2" class="text-right">SISA SALDO AKHIR :</td>
            <td class="text-right text-bold">${saldoAkhir.toLocaleString('id-ID')}</td>
            <td class="text-center">${saldoAkhir === 0 ? 'NIHIL' : 'SALDO KAS'}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 24px; text-align: right; font-size: 10.5pt;">
        Jakarta, ${lpj.tanggalLaporan}
      </div>

      <div class="ttd-container">
        <div class="ttd-box">
          Bendahara Karang Taruna<br>
          ${lpj.tingkat === 'Unit RW' ? 'RW ' + lpj.nomorRw : 'Kelurahan ' + lpj.kelurahan}<br><br><br><br>
          <strong><u>${lpj.namaBendahara || '................................'}</u></strong><br>
          NIK: ${lpj.nikBendahara || '................................'}
        </div>
        <div class="ttd-box">
          Ketua Karang Taruna<br>
          ${lpj.tingkat === 'Unit RW' ? 'RW ' + lpj.nomorRw : 'Kelurahan ' + lpj.kelurahan}<br><br><br><br>
          <strong><u>${lpj.namaKetua || '................................'}</u></strong><br>
          NIK: ${lpj.nikKetua || '................................'}
        </div>
      </div>
    </div>
  `;

  // Lembar 2: Laporan Kegiatan Pemanfaatan Dana
  const page2 = `
    <div class="page">
      ${kop}
      <div class="text-center text-bold" style="text-decoration: underline; font-size: 12pt; margin-bottom: 4px;">
        LAPORAN KEGIATAN PEMANFAATAN DANA STIMULASI
      </div>
      <div class="text-center text-bold" style="font-size: 11pt; margin-bottom: 14px;">
        ${lpj.tingkat === 'Unit RW' ? 'UNIT KERJA KARANG TARUNA (UKKT) RW ' + lpj.nomorRw : 'KARANG TARUNA KELURAHAN ' + lpj.kelurahan}<br>
        KELURAHAN ${lpj.kelurahan} KECAMATAN TAMBORA
      </div>
      <div style="margin-bottom: 8px; font-size: 10.5pt;">
        <strong>Periode :</strong> Bulan ${lpj.bulan} ${lpj.tahun}
      </div>

      <table class="tbl-resmi">
        <thead>
          <tr>
            <th style="width: 40px;">NO</th>
            <th style="width: 170px;">BIDANG KEGIATAN</th>
            <th>URAIAN KEGIATAN</th>
            <th style="width: 90px;">WAKTU</th>
            <th style="width: 110px;">ANGGARAN</th>
          </tr>
        </thead>
        <tbody>
          ${lpj.pengeluaran
            .map(
              (p, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td class="text-bold">${p.bidang}</td>
              <td>${p.uraian}</td>
              <td class="text-center">${p.tanggal || lpj.bulan}</td>
              <td class="text-right">Rp ${p.jumlah.toLocaleString('id-ID')}</td>
            </tr>
          `
            )
            .join('')}
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td colspan="4" class="text-right">TOTAL REALISASI :</td>
            <td class="text-right">Rp ${totalKeluar.toLocaleString('id-ID')}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 30px; text-align: right; font-size: 10.5pt;">
        Jakarta, ${lpj.tanggalLaporan}
      </div>

      <div class="ttd-container">
        <div class="ttd-box">
          Mengetahui,<br>
          Ketua Karang Taruna ${lpj.tingkat === 'Unit RW' ? 'RW ' + lpj.nomorRw : 'Kelurahan ' + lpj.kelurahan}<br><br><br><br>
          <strong><u>${lpj.namaKetua || '................................'}</u></strong><br>
          NIK: ${lpj.nikKetua || '................................'}
        </div>
        <div class="ttd-box">
          Dibuat Oleh,<br>
          Bendahara Karang Taruna ${lpj.tingkat === 'Unit RW' ? 'RW ' + lpj.nomorRw : 'Kelurahan ' + lpj.kelurahan}<br><br><br><br>
          <strong><u>${lpj.namaBendahara || '................................'}</u></strong><br>
          NIK: ${lpj.nikBendahara || '................................'}
        </div>
      </div>
    </div>
  `;

  // Lembar 3: Dokumentasi Kegiatan & Pengeluaran
  const page3 = `
    <div class="page">
      ${kop}
      <div class="text-center text-bold" style="text-decoration: underline; font-size: 12pt; margin-bottom: 4px;">
        DOKUMENTASI KEGIATAN DAN PENGELUARAN DANA STIMULASI
      </div>
      <div class="text-center text-bold" style="font-size: 11pt; margin-bottom: 14px;">
        BULAN ${lpj.bulan.toUpperCase()} TAHUN ${lpj.tahun}<br>
        ${lpj.tingkat === 'Unit RW' ? 'UNIT KERJA KARANG TARUNA (UKKT) RW ' + lpj.nomorRw : 'KARANG TARUNA KELURAHAN ' + lpj.kelurahan}
      </div>

      <table class="tbl-resmi">
        <thead>
          <tr>
            <th style="width: 35px;">NO</th>
            <th style="width: 85px;">TANGGAL</th>
            <th style="width: 160px;">KEGIATAN</th>
            <th>DOKUMENTASI FOTO KEGIATAN</th>
            <th style="width: 75px;">NOTA</th>
          </tr>
        </thead>
        <tbody>
          ${lpj.pengeluaran
            .map(
              (p, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td class="text-center" style="font-size: 9pt;">${p.tanggal || lpj.bulan + ' ' + lpj.tahun}</td>
              <td><strong>${p.uraian}</strong><br><small style="color: #64748b;">${p.bidang}</small></td>
              <td class="text-center" style="padding: 10px;">
                ${
                  p.fotoUrl
                    ? `<img src="${p.fotoUrl}" class="foto-dokumentasi" alt="Dokumentasi ${idx + 1}"/>`
                    : `<div style="height: 90px; border: 1px dashed #cbd5e1; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:8.5pt;">Foto Dokumentasi Terlampir</div>`
                }
              </td>
              <td class="text-center text-bold" style="font-size: 9pt; color: #15803d;">
                ${p.adaNota ? 'TERLAMPIR' : 'ADA'}
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <div class="ttd-container" style="margin-top: 25px;">
        <div class="ttd-box">
          Ketua Karang Taruna ${lpj.tingkat === 'Unit RW' ? 'RW ' + lpj.nomorRw : 'Kelurahan ' + lpj.kelurahan}<br><br><br><br>
          <strong><u>${lpj.namaKetua || '................................'}</u></strong><br>
          NIK: ${lpj.nikKetua || '................................'}
        </div>
        <div class="ttd-box">
          Bendahara Karang Taruna ${lpj.tingkat === 'Unit RW' ? 'RW ' + lpj.nomorRw : 'Kelurahan ' + lpj.kelurahan}<br><br><br><br>
          <strong><u>${lpj.namaBendahara || '................................'}</u></strong><br>
          NIK: ${lpj.nikBendahara || '................................'}
        </div>
      </div>
    </div>
  `;

  // Lembar 4: SPTJM (Surat Pernyataan Tanggung Jawab Mutlak)
  const page4 = `
    <div class="page">
      ${kop}
      <div class="text-center text-bold" style="text-decoration: underline; font-size: 12.5pt; margin-bottom: 20px;">
        SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK (SPTJM)
      </div>

      <p style="text-align: justify; line-height: 1.6;">
        Yang bertanda tangan di bawah ini:
      </p>

      <table style="width: 100%; border: none; margin-left: 10px; font-size: 10.5pt; line-height: 1.6;">
        <tr><td style="width: 160px;">Nama Lengkap</td><td style="width: 15px;">:</td><td><strong>${lpj.namaKetua || '................................'}</strong></td></tr>
        <tr><td>NIK (No. KTP)</td><td>:</td><td><strong>${lpj.nikKetua || '................................'}</strong></td></tr>
        <tr><td>Jabatan</td><td>:</td><td>Ketua Karang Taruna ${lpj.tingkat === 'Unit RW' ? 'Unit Kerja RW ' + lpj.nomorRw : 'Kelurahan ' + lpj.kelurahan}</td></tr>
        <tr><td>Wilayah Kerja</td><td>:</td><td>Kelurahan ${lpj.kelurahan}, Kecamatan Tambora, Jakarta Barat</td></tr>
      </table>

      <p style="text-align: justify; line-height: 1.6; margin-top: 15px;">
        Menyatakan dengan sesungguhnya bahwa:
      </p>

      <ol style="text-align: justify; line-height: 1.6; padding-left: 20px;">
        <li>Dana Stimulan Karang Taruna Bulan <strong>${lpj.bulan} Tahun ${lpj.tahun}</strong> sebesar <strong>Rp ${lpj.penerimaanDana.toLocaleString('id-ID')}</strong> telah diterima dan dipergunakan secara penuh serta tertib administrasi untuk menunjang kegiatan kepemudaan Karang Taruna.</li>
        <li>Seluruh bukti pengeluaran dan nota transaksi dalam laporan pertanggungjawaban ini adalah sah, benar adanya, serta dapat dipertanggungjawabkan sesuai peraturan perundang-undangan.</li>
        <li>Apabila di kemudian hari terdapat penyimpangan penggunaan anggaran atau ketidaksesuaian bukti pengeluaran, saya bersedia bertanggung jawab penuh secara hukum dan mengembalikan kerugian negara.</li>
      </ol>

      <p style="text-align: justify; line-height: 1.6;">
        Demikian Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) ini saya buat dengan sadar, sungguh-sungguh, dan tanpa adanya paksaan dari pihak manapun.
      </p>

      <div style="margin-top: 30px; display: flex; justify-content: flex-end; text-align: center;">
        <div style="width: 250px;">
          Jakarta, ${lpj.tanggalLaporan}<br>
          Yang Membuat Pernyataan,<br>
          <div class="materai-box">MATERAI<br>Rp 10.000</div>
          <strong><u>${lpj.namaKetua || '................................'}</u></strong><br>
          NIK: ${lpj.nikKetua || '................................'}
        </div>
      </div>
    </div>
  `;

  return page1 + page2 + page3 + page4;
}

/**
 * Menghasilkan HTML Khusus 1 Lembar Spesifik (Keuangan, Bidang, Dokumentasi, atau SPTJM)
 * Agar cetak tepat 1 lembar tanpa halaman tambahan
 */
export function generateSingleSheetLpjHtml(
  sheet: 'keuangan' | 'bidang' | 'dokumentasi' | 'sptjm',
  lpj: LpjStimulanRecord,
  org: DataOrganisasi
): string {
  const totalKeluar = lpj.pengeluaran.reduce((sum, item) => sum + item.jumlah, 0);
  const saldoAkhir = lpj.saldoBulanLalu + lpj.penerimaanDana - totalKeluar;
  const kop = renderKopHtml(lpj.tingkat, lpj.kelurahan, lpj.nomorRw, org);

  if (sheet === 'keuangan') {
    return `
      <div class="page">
        ${kop}
        <div class="text-center text-bold" style="text-decoration: underline; font-size: 12pt; margin-bottom: 4px;">
          LAPORAN KEADAAN KEUANGAN DANA STIMULAN
        </div>
        <div class="text-center text-bold" style="font-size: 11pt; margin-bottom: 12px;">
          ${lpj.tingkat === 'Unit RW' ? 'UNIT KERJA KARANG TARUNA (UKKT) RW ' + lpj.nomorRw : 'KARANG TARUNA KELURAHAN ' + lpj.kelurahan}<br>
          KELURAHAN ${lpj.kelurahan} KECAMATAN TAMBORA
        </div>
        <div style="margin-bottom: 8px; font-size: 10.5pt;">
          <strong>Bulan :</strong> ${lpj.bulan} &nbsp;|&nbsp; <strong>Tahun :</strong> ${lpj.tahun}
        </div>

        <table class="tbl-resmi">
          <thead>
            <tr>
              <th style="width: 45px;">NO</th>
              <th>KEGIATAN / URAIAN</th>
              <th style="width: 140px;">JUMLAH (Rp)</th>
              <th style="width: 110px;">KETERANGAN</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-center text-bold">I</td>
              <td class="text-bold">SALDO BULAN LALU</td>
              <td class="text-right text-bold">${lpj.saldoBulanLalu.toLocaleString('id-ID')}</td>
              <td></td>
            </tr>
            <tr>
              <td class="text-center text-bold">II</td>
              <td class="text-bold">PENERIMA UANG DANA STIMULASI</td>
              <td class="text-right text-bold">${lpj.penerimaanDana.toLocaleString('id-ID')}</td>
              <td>DANA STIMULAN</td>
            </tr>
            ${lpj.pengeluaran
              .map(
                (p, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td>${p.uraian} <br><span style="font-size: 8.5pt; color: #475569;">(${p.bidang})</span></td>
                <td class="text-right">${p.jumlah.toLocaleString('id-ID')}</td>
                <td class="text-center">${p.status || 'TERLAKSANA'}</td>
              </tr>
            `
              )
              .join('')}
            <tr style="background-color: #f8fafc; font-weight: bold;">
              <td colspan="2" class="text-right">TOTAL PENGELUARAN :</td>
              <td class="text-right text-bold">${totalKeluar.toLocaleString('id-ID')}</td>
              <td></td>
            </tr>
            <tr style="background-color: #f1f5f9; font-weight: bold;">
              <td colspan="2" class="text-right">SISA SALDO AKHIR :</td>
              <td class="text-right text-bold">${saldoAkhir.toLocaleString('id-ID')}</td>
              <td class="text-center">${saldoAkhir === 0 ? 'NIHIL' : 'SALDO KAS'}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 24px; text-align: right; font-size: 10.5pt;">
          Jakarta, ${lpj.tanggalLaporan}
        </div>

        <div class="ttd-container">
          <div class="ttd-box">
            Bendahara Karang Taruna<br>
            ${lpj.tingkat === 'Unit RW' ? 'RW ' + lpj.nomorRw : 'Kelurahan ' + lpj.kelurahan}<br><br><br><br>
            <strong><u>${lpj.namaBendahara || '................................'}</u></strong><br>
            NIK: ${lpj.nikBendahara || '................................'}
          </div>
          <div class="ttd-box">
            Ketua Karang Taruna<br>
            ${lpj.tingkat === 'Unit RW' ? 'RW ' + lpj.nomorRw : 'Kelurahan ' + lpj.kelurahan}<br><br><br><br>
            <strong><u>${lpj.namaKetua || '................................'}</u></strong><br>
            NIK: ${lpj.nikKetua || '................................'}
          </div>
        </div>
      </div>
    `;
  }

  if (sheet === 'bidang') {
    return `
      <div class="page">
        ${kop}
        <div class="text-center text-bold" style="text-decoration: underline; font-size: 12pt; margin-bottom: 4px;">
          LAPORAN KEGIATAN PEMANFAATAN DANA STIMULASI
        </div>
        <div class="text-center text-bold" style="font-size: 11pt; margin-bottom: 14px;">
          ${lpj.tingkat === 'Unit RW' ? 'UNIT KERJA KARANG TARUNA (UKKT) RW ' + lpj.nomorRw : 'KARANG TARUNA KELURAHAN ' + lpj.kelurahan}<br>
          KELURAHAN ${lpj.kelurahan} KECAMATAN TAMBORA
        </div>
        <div style="margin-bottom: 8px; font-size: 10.5pt;">
          <strong>Periode :</strong> Bulan ${lpj.bulan} ${lpj.tahun}
        </div>

        <table class="tbl-resmi">
          <thead>
            <tr>
              <th style="width: 40px;">NO</th>
              <th style="width: 170px;">BIDANG KEGIATAN</th>
              <th>URAIAN KEGIATAN</th>
              <th style="width: 90px;">WAKTU</th>
              <th style="width: 110px;">ANGGARAN</th>
            </tr>
          </thead>
          <tbody>
            ${lpj.pengeluaran
              .map(
                (p, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td class="text-bold">${p.bidang}</td>
                <td>${p.uraian}</td>
                <td class="text-center">${p.tanggal || lpj.bulan}</td>
                <td class="text-right">Rp ${p.jumlah.toLocaleString('id-ID')}</td>
              </tr>
            `
              )
              .join('')}
            <tr style="background-color: #f1f5f9; font-weight: bold;">
              <td colspan="4" class="text-right">TOTAL REALISASI :</td>
              <td class="text-right">Rp ${totalKeluar.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 30px; text-align: right; font-size: 10.5pt;">
          Jakarta, ${lpj.tanggalLaporan}
        </div>

        <div class="ttd-container">
          <div class="ttd-box">
            Mengetahui,<br>
            Ketua Karang Taruna ${lpj.tingkat === 'Unit RW' ? 'RW ' + lpj.nomorRw : 'Kelurahan ' + lpj.kelurahan}<br><br><br><br>
            <strong><u>${lpj.namaKetua || '................................'}</u></strong><br>
            NIK: ${lpj.nikKetua || '................................'}
          </div>
          <div class="ttd-box">
            Dibuat Oleh,<br>
            Bendahara Karang Taruna ${lpj.tingkat === 'Unit RW' ? 'RW ' + lpj.nomorRw : 'Kelurahan ' + lpj.kelurahan}<br><br><br><br>
            <strong><u>${lpj.namaBendahara || '................................'}</u></strong><br>
            NIK: ${lpj.nikBendahara || '................................'}
          </div>
        </div>
      </div>
    `;
  }

  if (sheet === 'dokumentasi') {
    return `
      <div class="page">
        ${kop}
        <div class="text-center text-bold" style="text-decoration: underline; font-size: 12pt; margin-bottom: 4px;">
          DOKUMENTASI KEGIATAN DAN PENGELUARAN DANA STIMULASI
        </div>
        <div class="text-center text-bold" style="font-size: 11pt; margin-bottom: 14px;">
          BULAN ${lpj.bulan.toUpperCase()} TAHUN ${lpj.tahun}<br>
          ${lpj.tingkat === 'Unit RW' ? 'UNIT KERJA KARANG TARUNA (UKKT) RW ' + lpj.nomorRw : 'KARANG TARUNA KELURAHAN ' + lpj.kelurahan}
        </div>

        <table class="tbl-resmi">
          <thead>
            <tr>
              <th style="width: 35px;">NO</th>
              <th style="width: 85px;">TANGGAL</th>
              <th style="width: 160px;">KEGIATAN</th>
              <th>DOKUMENTASI FOTO KEGIATAN</th>
              <th style="width: 75px;">NOTA</th>
            </tr>
          </thead>
          <tbody>
            ${lpj.pengeluaran
              .map(
                (p, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td class="text-center" style="font-size: 9pt;">${p.tanggal || lpj.bulan + ' ' + lpj.tahun}</td>
                <td><strong>${p.uraian}</strong><br><small style="color: #64748b;">${p.bidang}</small></td>
                <td class="text-center" style="padding: 8px;">
                  ${
                    p.fotoUrl
                      ? `<img src="${p.fotoUrl}" class="foto-dokumentasi" alt="Dokumentasi ${idx + 1}"/>`
                      : `<div style="height: 90px; border: 1px dashed #cbd5e1; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:8.5pt;">Foto Dokumentasi Terlampir</div>`
                  }
                </td>
                <td class="text-center text-bold" style="font-size: 9pt; color: #15803d;">
                  ${p.adaNota ? 'TERLAMPIR' : 'ADA'}
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="ttd-container" style="margin-top: 25px;">
          <div class="ttd-box">
            Ketua Karang Taruna ${lpj.tingkat === 'Unit RW' ? 'RW ' + lpj.nomorRw : 'Kelurahan ' + lpj.kelurahan}<br><br><br><br>
            <strong><u>${lpj.namaKetua || '................................'}</u></strong><br>
            NIK: ${lpj.nikKetua || '................................'}
          </div>
          <div class="ttd-box">
            Bendahara Karang Taruna ${lpj.tingkat === 'Unit RW' ? 'RW ' + lpj.nomorRw : 'Kelurahan ' + lpj.kelurahan}<br><br><br><br>
            <strong><u>${lpj.namaBendahara || '................................'}</u></strong><br>
            NIK: ${lpj.nikBendahara || '................................'}
          </div>
        </div>
      </div>
    `;
  }

  // SPTJM
  return `
    <div class="page">
      ${kop}
      <div class="text-center text-bold" style="text-decoration: underline; font-size: 12.5pt; margin-bottom: 20px;">
        SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK (SPTJM)
      </div>

      <p style="text-align: justify; line-height: 1.6;">
        Yang bertanda tangan di bawah ini:
      </p>

      <table style="width: 100%; border: none; margin-left: 10px; font-size: 10.5pt; line-height: 1.6;">
        <tr><td style="width: 160px;">Nama Lengkap</td><td style="width: 15px;">:</td><td><strong>${lpj.namaKetua || '................................'}</strong></td></tr>
        <tr><td>NIK (No. KTP)</td><td>:</td><td><strong>${lpj.nikKetua || '................................'}</strong></td></tr>
        <tr><td>Jabatan</td><td>:</td><td>Ketua Karang Taruna ${lpj.tingkat === 'Unit RW' ? 'Unit Kerja RW ' + lpj.nomorRw : 'Kelurahan ' + lpj.kelurahan}</td></tr>
        <tr><td>Wilayah Kerja</td><td>:</td><td>Kelurahan ${lpj.kelurahan}, Kecamatan Tambora, Jakarta Barat</td></tr>
      </table>

      <p style="text-align: justify; line-height: 1.6; margin-top: 15px;">
        Menyatakan dengan sesungguhnya bahwa:
      </p>

      <ol style="text-align: justify; line-height: 1.6; padding-left: 20px;">
        <li>Dana Stimulan Karang Taruna Bulan <strong>${lpj.bulan} Tahun ${lpj.tahun}</strong> sebesar <strong>Rp ${lpj.penerimaanDana.toLocaleString('id-ID')}</strong> telah diterima dan dipergunakan secara penuh serta tertib administrasi untuk menunjang kegiatan kepemudaan Karang Taruna.</li>
        <li>Seluruh bukti pengeluaran dan nota transaksi dalam laporan pertanggungjawaban ini adalah sah, benar adanya, serta dapat dipertanggungjawabkan sesuai peraturan perundang-undangan.</li>
        <li>Apabila di kemudian hari terdapat penyimpangan penggunaan anggaran atau ketidaksesuaian bukti pengeluaran, saya bersedia bertanggung jawab penuh secara hukum dan mengembalikan kerugian negara.</li>
      </ol>

      <p style="text-align: justify; line-height: 1.6;">
        Demikian Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) ini saya buat dengan sadar, sungguh-sungguh, dan tanpa adanya paksaan dari pihak manapun.
      </p>

      <div style="margin-top: 30px; display: flex; justify-content: flex-end; text-align: center;">
        <div style="width: 250px;">
          Jakarta, ${lpj.tanggalLaporan}<br>
          Yang Membuat Pernyataan,<br>
          <div class="materai-box">MATERAI<br>Rp 10.000</div>
          <strong><u>${lpj.namaKetua || '................................'}</u></strong><br>
          NIK: ${lpj.nikKetua || '................................'}
        </div>
      </div>
    </div>
  `;
}

/**
 * Menghasilkan HTML Lembar Tanda Terima Penyaluran Dinamis
 * Disesuaikan otomatis dengan jumlah RW di Kelurahan yang dipilih
 */
export function generateTandaTerimaHtml(
  kelurahan: string,
  tanggal: string,
  org: DataOrganisasi,
  penerimaMap?: Record<string, { nama: string; jabatan?: string; status?: string }>
): string {
  const rwList: string[] =
    (MAP_WILAYAH_TAMBORA as Record<string, string[]>)[kelurahan] || [
      '001',
      '002',
      '003',
      '004',
      '005',
    ];
  const nominalKelurahan = 1000000;
  const nominalRW = 500000;
  const totalDana = nominalKelurahan + rwList.length * nominalRW;

  const kop = renderKopHtml('Kelurahan', kelurahan, '', org);
  const penerimaKel = penerimaMap?.['KELURAHAN']?.nama || `Bendahara KT Kel. ${kelurahan}`;

  return `
    <div class="page">
      ${kop}
      <div class="text-center text-bold" style="text-decoration: underline; font-size: 12pt; margin-bottom: 4px;">
        TANDA TERIMA PENYALURAN DANA STIMULASI
      </div>
      <div class="text-center text-bold" style="font-size: 11pt; margin-bottom: 14px;">
        KEPADA PENGURUS KARANG TARUNA KELURAHAN DAN UNIT KERJA RW (UKKT)<br>
        KELURAHAN ${kelurahan} KECAMATAN TAMBORA
      </div>

      <table class="tbl-resmi">
        <thead>
          <tr>
            <th style="width: 35px;">NO</th>
            <th>NAMA KARANG TARUNA</th>
            <th style="width: 160px;">NAMA PENERIMA</th>
            <th style="width: 120px;">JUMLAH (Rp)</th>
            <th style="width: 150px;">TANDA TANGAN & STEMPEL</th>
          </tr>
        </thead>
        <tbody>
          <tr style="height: 38px; background-color: #f8fafc;">
            <td class="text-center text-bold">1</td>
            <td class="text-bold">Karang Taruna Kelurahan ${kelurahan}</td>
            <td style="font-size: 9.5pt;"><strong>${penerimaKel}</strong><br><span style="font-size: 8pt; color: #475569;">Bendahara Kelurahan</span></td>
            <td class="text-right text-bold">Rp ${nominalKelurahan.toLocaleString('id-ID')}</td>
            <td class="text-center" style="font-size: 9pt; color: #64748b;">1. ..............</td>
          </tr>
          ${rwList
            .map(
              (rw: string, idx: number) => {
                const info = penerimaMap?.[rw];
                const namaPenerima = info?.nama || `Pengurus UKKT RW ${rw}`;
                const jabatan = info?.jabatan || 'Ketua/Bendahara RW';
                return `
            <tr style="height: 38px;">
              <td class="text-center">${idx + 2}</td>
              <td>Karang Taruna Unit RW ${rw}</td>
              <td style="font-size: 9.5pt;"><strong>${namaPenerima}</strong><br><span style="font-size: 8pt; color: #475569;">${jabatan}</span></td>
              <td class="text-right">Rp ${nominalRW.toLocaleString('id-ID')}</td>
              <td style="font-size: 9pt; color: #64748b; padding-left: ${idx % 2 === 0 ? '10px' : '40px'};">
                ${idx + 2}. .............
              </td>
            </tr>
          `;
              }
            )
            .join('')}
          <tr style="height: 40px; background-color: #f1f5f9; font-weight: bold;">
            <td colspan="3" class="text-right">TOTAL DANA STIMULAN DISALURKAN :</td>
            <td class="text-right">Rp ${totalDana.toLocaleString('id-ID')}</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 20px; text-align: right; font-size: 10pt;">
        Jakarta, ${tanggal || 'Oktober 2026'}
      </div>

      <!-- Tanda Tangan Pejabat Suku Dinas Sosial Sesuai Format Resmi DKI -->
      <div style="margin-top: 15px; display: flex; justify-content: space-between; text-align: center; font-size: 10pt;">
        <div style="width: 45%;">
          Mengetahui,<br>
          Kepala Suku Dinas Sosial<br>
          Kota Administrasi Jakarta Barat<br><br><br><br>
          <strong><u>${org.kasudinSosial}</u></strong><br>
          NIP. ${org.nipKasudinSosial}
        </div>
        <div style="width: 45%;">
          Lunas Dibayarkan Oleh,<br>
          Bendahara Pengeluaran<br>
          Suku Dinas Sosial Kota Adm. Jakarta Barat<br><br><br><br>
          <strong><u>${org.bendaharaSudin}</u></strong><br>
          NIP. ${org.nipBendaharaSudin}
        </div>
      </div>
    </div>
  `;
}

/**
 * Menghasilkan HTML Kuitansi Penyaluran Satuan Resmi
 */
export function generateKuitansiSatuanHtml(
  data: {
    tingkat: string;
    kelurahan: string;
    nomorRw: string;
    nominal: number;
    namaPenerima: string;
    jabatanPenerima: string;
    nomorRekeningBank?: string;
    nomorBuktiTransfer?: string;
    tanggalCair?: string;
    tahap?: string;
  },
  org: DataOrganisasi
): string {
  const kop = renderKopHtml('Kecamatan', '', '', org);
  const terbilang = (nominal: number) => {
    if (nominal === 500000) return 'Lima Ratus Ribu Rupiah';
    if (nominal === 1000000) return 'Satu Juta Rupiah';
    if (nominal === 2000000) return 'Dua Juta Rupiah';
    return `${nominal.toLocaleString('id-ID')} Rupiah`;
  };

  const namaUnit =
    data.tingkat === 'Unit RW'
      ? `UKKT RW ${data.nomorRw} Kelurahan ${data.kelurahan}`
      : data.tingkat === 'Kelurahan'
      ? `Karang Taruna Kelurahan ${data.kelurahan}`
      : `Pengurus Karang Taruna Kecamatan Tambora`;

  return `
    <div class="page">
      ${kop}
      <div class="text-center text-bold" style="text-decoration: underline; font-size: 13pt; margin-bottom: 2px;">
        KUITANSI PENERIMAAN DANA STIMULASI
      </div>
      <div class="text-center" style="font-size: 10pt; color: #475569; margin-bottom: 20px;">
        Nomor Bukti : ${data.nomorBuktiTransfer || 'KWT/DINSOS-JB/2026/STIMULAN'}
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 11pt; line-height: 1.8;">
        <tr>
          <td style="width: 220px; font-weight: bold;">Sudah Terima Dari</td>
          <td style="width: 20px;">:</td>
          <td>Bendahara Pengeluaran Suku Dinas Sosial Kota Administrasi Jakarta Barat</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Uang Sejumlah</td>
          <td>:</td>
          <td style="background-color: #f1f5f9; padding: 6px 10px; font-weight: bold; font-style: italic;">
            " ${terbilang(data.nominal)} "
          </td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Untuk Pembayaran</td>
          <td>:</td>
          <td>
            Penyaluran Dana Stimulasi Karang Taruna ${data.tahap || 'Tahun Anggaran 2026'} bagi <strong>${namaUnit}</strong>
          </td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Nama Penerima & Jabatan</td>
          <td>:</td>
          <td><strong>${data.namaPenerima}</strong> (${data.jabatanPenerima})</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Nomor Rekening Bank</td>
          <td>:</td>
          <td style="font-family: monospace; font-weight: bold;">${data.nomorRekeningBank || 'Bank DKI'}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Jumlah Nominal</td>
          <td>:</td>
          <td>
            <span style="font-size: 14pt; font-weight: 900; font-family: monospace; background-color: #e2e8f0; padding: 4px 12px; border-radius: 4px;">
              Rp ${data.nominal.toLocaleString('id-ID')},-
            </span>
          </td>
        </tr>
      </table>

      <div style="margin-top: 35px; display: flex; justify-content: space-between; text-align: center; font-size: 10.5pt;">
        <div style="width: 45%;">
          Mengetahui / Menyetujui,<br>
          Kepala Suku Dinas Sosial Kota Adm. Jakarta Barat<br><br><br><br>
          <strong><u>${org.kasudinSosial}</u></strong><br>
          NIP. ${org.nipKasudinSosial}
        </div>
        <div style="width: 45%;">
          Jakarta, ${data.tanggalCair || 'Oktober 2026'}<br>
          Penerima Dana,<br><br><br><br>
          <strong><u>${data.namaPenerima}</u></strong><br>
          ${data.jabatanPenerima} ${namaUnit}
        </div>
      </div>
    </div>
  `;
}

/**
 * Menghasilkan HTML Surat Resmi Karang Taruna
 */
export function generateSuratHtml(surat: SuratRecord, org: DataOrganisasi): string {
  const kop = renderKopHtml(surat.tingkat, surat.kelurahan || '', surat.nomorRw || '', org);

  let body = '';

  if (surat.jenisSurat === 'Surat Mandat (Tugas)') {
    body = `
      <div class="text-center text-bold" style="text-decoration: underline; font-size: 13pt; margin-bottom: 2px;">
        SURAT MANDAT
      </div>
      <div class="text-center text-bold" style="font-size: 10.5pt; margin-bottom: 20px;">
        Nomor : ${surat.nomorSurat}
      </div>

      <p style="text-align: justify; line-height: 1.6;">
        Yang bertanda tangan di bawah ini, Pengurus Karang Taruna ${
          surat.tingkat === 'Unit RW'
            ? 'Unit Kerja RW ' + (surat.nomorRw || '001') + ' Kelurahan ' + (surat.kelurahan || 'Pekojan')
            : 'Kecamatan Tambora'
        }, dengan ini memberikan <strong>MANDAT PENUH</strong> kepada:
      </p>

      <table style="width: 100%; border: none; margin-left: 20px; font-size: 11pt; line-height: 1.7;">
        <tr><td style="width: 150px;">Nama Lengkap</td><td style="width: 15px;">:</td><td><strong>${surat.namaPetugasMandat || '........................'}</strong></td></tr>
        <tr><td>NIK</td><td style="width: 15px;">:</td><td><strong>${surat.nikPetugasMandat || '........................'}</strong></td></tr>
        <tr><td>Jabatan</td><td style="width: 15px;">:</td><td><strong>${surat.jabatanPetugasMandat || 'Pengurus Karang Taruna'}</strong></td></tr>
      </table>

      <p style="text-align: justify; line-height: 1.6; margin-top: 15px;">
        Untuk menghadiri dan/atau melaksanakan tugas organisasi: <strong>${surat.perihal}</strong> yang diselenggarakan pada:
      </p>

      <table style="width: 100%; border: none; margin-left: 20px; font-size: 11pt; line-height: 1.7;">
        <tr><td style="width: 150px;">Hari / Tanggal</td><td style="width: 15px;">:</td><td>${surat.tanggalKegiatan || surat.tanggalSurat}</td></tr>
        <tr><td>Waktu</td><td style="width: 15px;">:</td><td>${surat.waktuKegiatan || '09.00 WIB s.d Selesai'}</td></tr>
        <tr><td>Tempat</td><td style="width: 15px;">:</td><td>${surat.tempatKegiatan || 'Sesuai Undangan'}</td></tr>
      </table>

      <p style="text-align: justify; line-height: 1.6; margin-top: 15px;">
        Demikian Surat Mandat ini diberikan agar dapat dipergunakan sebagaimana mestinya dengan penuh rasa tanggung jawab.
      </p>
    `;
  } else {
    // Format Surat Dinas Karang Taruna Standar
    body = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
        <table style="border: none; font-size: 11pt; line-height: 1.5;">
          <tr><td style="width: 90px;">Nomor</td><td style="width: 15px;">:</td><td><strong>${surat.nomorSurat}</strong></td></tr>
          <tr><td>Lampiran</td><td>:</td><td>${surat.lampiran || '-'}</td></tr>
          <tr><td>Perihal</td><td>:</td><td><strong>${surat.perihal}</strong></td></tr>
        </table>
        <div style="text-align: right; font-size: 11pt;">
          Jakarta, ${surat.tanggalSurat}
        </div>
      </div>

      <div style="margin-top: 15px; line-height: 1.5;">
        Kepada Yth.<br>
        <strong>${surat.penerima}</strong><br>
        di -<br>
        &nbsp;&nbsp;&nbsp;&nbsp;<u>Tempat</u>
      </div>

      <div style="margin-top: 20px; text-align: justify; line-height: 1.65;">
        <p style="margin-bottom: 10px;">
          <em>Salam Aditya Karya Mahatva Yodha,</em>
        </p>
        <p>
          ${surat.isiSurat}
        </p>

        ${
          surat.tempatKegiatan
            ? `
          <table style="width: 100%; border: none; margin-left: 20px; margin-top: 10px; margin-bottom: 10px; font-size: 11pt; line-height: 1.6;">
            <tr><td style="width: 140px;">Hari / Tanggal</td><td style="width: 15px;">:</td><td><strong>${surat.tanggalKegiatan || '-'}</strong></td></tr>
            <tr><td>Waktu</td><td>:</td><td><strong>${surat.waktuKegiatan || '-'}</strong></td></tr>
            <tr><td>Tempat</td><td>:</td><td><strong>${surat.tempatKegiatan || '-'}</strong></td></tr>
          </table>
        `
            : ''
        }

        <p style="margin-top: 12px;">
          Demikian surat ini kami sampaikan, atas perhatian dan kerja sama yang baik kami ucapkan terima kasih.
        </p>
      </div>
    `;
  }

  return `
    <div class="page">
      ${kop}
      ${body}

      <div class="ttd-container" style="margin-top: 40px;">
        <div class="ttd-box">
          Sekretaris,<br><br><br><br>
          <strong><u>${org.namaSekretarisKecamatan}</u></strong><br>
          NIK: ${org.nikSekretarisKecamatan}
        </div>
        <div class="ttd-box">
          Ketua,<br><br><br><br>
          <strong><u>${org.namaKetuaKecamatan}</u></strong><br>
          NIK: ${org.nikKetuaKecamatan}
        </div>
      </div>
    </div>
  `;
}
