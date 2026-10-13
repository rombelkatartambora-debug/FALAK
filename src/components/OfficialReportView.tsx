import React, { useState } from 'react';
import {
  Printer,
  FileText,
  Copy,
  Check,
  Download,
  Building2,
  Calendar,
  Sparkles,
  Layers,
  MapPin
} from 'lucide-react';
import {
  ObserverLocation,
  HilalVisibilityResult,
  formatDMSString
} from '../utils/astronomyMath';

interface OfficialReportViewProps {
  hilal: HilalVisibilityResult;
  observer: ObserverLocation;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const OfficialReportView: React.FC<OfficialReportViewProps> = ({
  hilal,
  observer,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);

  const documentNumber = `BA-FLK/${hilal.hijriYear}/${String(hilal.hijriMonthIndex + 1).padStart(2, '0')}`;

  const summaryText = `BERITA ACARA HISAB AWAL BULAN QAMARIYAH
Nomor: ${documentNumber}
Markaz Pengamatan: ${observer.name} (${observer.latitude.toFixed(4)}°, ${observer.longitude.toFixed(4)}°, elevasi ${observer.elevation} mdpl)

1. IJTIMA' HAKIKI (KONJUNGSI):
   - Waktu Ijtima': ${hilal.conjunctionFormatted}

2. PARAMETER HILAL SAAT MATAHARI TERBENAM (GHURUB):
   - Waktu Terbenam Matahari: ${hilal.sunsetTime} (UTC+${observer.timezone})
   - Waktu Terbenam Bulan: ${hilal.moonsetTime}
   - Irtifa' Hilal Hakiki: ${formatDMSString(hilal.moonAltitudeAtSunset, true)}
   - Irtifa' Hilal Mar'i: ${formatDMSString(hilal.moonApparentAltitudeAtSunset, true)}
   - Sudut Elongasi: ${formatDMSString(hilal.elongationAtSunset)}
   - Lama Hilal (Mukuts): ${hilal.lagTimeMinutes} Menit
   - Lebar Nurul Hilal: ${hilal.nurulHilalFinger} Jari (Isba')
   - Beda Azimuth: ${formatDMSString(hilal.relativeAzimuth)}
   - Orientasi Hilal: ${hilal.crescentOrientation}

3. KESIMPULAN STATUS VISIBILITAS:
   - Kriteria MABIMS (2021): ${hilal.mabimsCriteria.passed ? 'MEMENUHI SYARAT (Imkanur Rukyat)' : 'BELUM MEMENUHI SYARAT'}
   - Kriteria Wujudul Hilal: ${hilal.wujudulHilalCriteria.passed ? 'HILAL SUDAH WUJUD' : 'BELUM WUJUD'}
   - Klasifikasi Astronomis Odeh: Zona ${hilal.odehCriteria.code} (${hilal.odehCriteria.description})`;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    onShowToast('Teks Berita Acara berhasil disalin ke clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(hilal, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `Laporan_Hisab_${hilal.targetMonthName}_${hilal.hijriYear}H.json`;
    a.click();
    onShowToast('Data laporan hisab berhasil diunduh dalam format JSON!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Action Bar */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <span className="text-xs font-bold text-white uppercase tracking-wider block">
            Dokumen Resmi Berita Acara Hisab
          </span>
          <span className="text-[11px] text-stone-400">
            Siap cetak atau diekspor ke PDF dengan tata letak dokumen standar lembaga
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Salin Ringkasan</span>
          </button>
          <button
            onClick={handleDownloadJson}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/25 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* DOKUMEN RESMI FORMAT CETAK / KERTAS A4 */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white text-stone-950 border-2 border-stone-200 shadow-2xl max-w-4xl mx-auto space-y-6">
        {/* Kop Surat Resmi */}
        <div className="border-b-4 border-double border-stone-900 pb-5 text-center space-y-1">
          <h2 className="text-2xl font-black tracking-wider uppercase text-stone-900">
            YAYASAN RUANG BELAJAR
          </h2>
          <p className="text-xs font-bold text-stone-700 uppercase tracking-widest">
            LEMBAGA PENDIDIKAN, DAKWAH & PUSAT STUDI FALAK NUSANTARA
          </p>
          <p className="text-[11px] text-stone-600">
            Alamat: Jakarta &bull; Email: yayasanruangbelajar1@gmail.com &bull; Kontak: 085 645 274 534
          </p>
        </div>

        {/* Judul Berita Acara */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-black uppercase tracking-tight underline">
            BERITA ACARA HISAB AWAL BULAN QAMARIYAH
          </h3>
          <p className="text-xs font-bold text-stone-700 font-mono">
            Nomor: {documentNumber}
          </p>
          <p className="text-xs text-stone-600">
            Penetapan Awal Bulan <strong>{hilal.targetMonthName} {hilal.hijriMonthIndex === 11 ? hilal.hijriYear + 1 : hilal.hijriYear} H</strong>
          </p>
        </div>

        {/* Markaz Pengamatan */}
        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-300 text-xs space-y-1">
          <div className="font-bold text-stone-800">DATA MARKAZ PENGAMATAN:</div>
          <div className="grid grid-cols-2 gap-2 text-stone-700">
            <div>Nama Markaz: <strong>{observer.name}</strong></div>
            <div>Elevasi: <strong>{observer.elevation} meter dpl</strong></div>
            <div>Lintang Tempat (): <strong>{formatDMSString(observer.latitude)}</strong></div>
            <div>Bujur Tempat (): <strong>{formatDMSString(observer.longitude)}</strong></div>
          </div>
        </div>

        {/* Tabel Parameter Hisab */}
        <div className="space-y-2">
          <span className="font-bold text-xs uppercase tracking-wider text-stone-800 block">
            I. Rincian Parameter Astronomis Ijtima' & Hilal:
          </span>
          <div className="border border-stone-300 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-stone-100 border-b border-stone-300 font-bold">
                <tr>
                  <th className="p-2.5">Parameter Falak</th>
                  <th className="p-2.5">Nilai Hisab Astronomis</th>
                  <th className="p-2.5">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr>
                  <td className="p-2.5 font-medium">Ijtima' Hakiki (Konjungsi)</td>
                  <td className="p-2.5 font-bold font-mono text-stone-900">{hilal.conjunctionFormatted}</td>
                  <td className="p-2.5 text-stone-600">Bujur Ekliptika Bulan = Matahari</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Tinggi Hilal Hakiki</td>
                  <td className="p-2.5 font-bold font-mono text-stone-900">{formatDMSString(hilal.moonAltitudeAtSunset, true)}</td>
                  <td className="p-2.5 text-stone-600">Geometric Altitude saat Ghurub</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Tinggi Hilal Mar'i (Nampak)</td>
                  <td className="p-2.5 font-bold font-mono text-emerald-800">{formatDMSString(hilal.moonApparentAltitudeAtSunset, true)}</td>
                  <td className="p-2.5 text-stone-600">Terkoreksi Refraksi & Parallax</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Sudut Elongasi</td>
                  <td className="p-2.5 font-bold font-mono text-cyan-800">{formatDMSString(hilal.elongationAtSunset)}</td>
                  <td className="p-2.5 text-stone-600">Jarak busur Matahari ke Bulan</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Lama Hilal (Mukuts)</td>
                  <td className="p-2.5 font-bold font-mono text-stone-900">{hilal.lagTimeMinutes} Menit</td>
                  <td className="p-2.5 text-stone-600">Di atas ufuk setelah matahari terbenam</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Lebar Nurul Hilal</td>
                  <td className="p-2.5 font-bold font-mono text-stone-900">{hilal.nurulHilalFinger} Jari (Isba')</td>
                  <td className="p-2.5 text-stone-600">Lebar: {hilal.crescentWidth.toFixed(2)}'</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Beda Azimuth Bulan - Matahari</td>
                  <td className="p-2.5 font-bold font-mono text-stone-900">{formatDMSString(hilal.relativeAzimuth)}</td>
                  <td className="p-2.5 text-stone-600">Orientasi: {hilal.crescentOrientation}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Kesimpulan Status */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-300 text-xs space-y-2">
          <span className="font-bold text-stone-900 block">II. KESIMPULAN & EVALUASI KRITERIA:</span>
          <div className="space-y-1 text-stone-800">
            <div>
              &bull; <strong>Kriteria MABIMS (2021):</strong>{' '}
              <span className={hilal.mabimsCriteria.passed ? 'font-bold text-emerald-700' : 'font-bold text-rose-700'}>
                {hilal.mabimsCriteria.passed ? 'MEMENUHI SYARAT IMKANUR RUKYAT' : 'BELUM MEMENUHI SYARAT'}
              </span>{' '}
              ({hilal.mabimsCriteria.reason})
            </div>
            <div>
              &bull; <strong>Kriteria Wujudul Hilal:</strong>{' '}
              <span className={hilal.wujudulHilalCriteria.passed ? 'font-bold text-emerald-700' : 'font-bold text-rose-700'}>
                {hilal.wujudulHilalCriteria.passed ? 'HILAL SUDAH WUJUD DI ATAS UFUK' : 'HILAL BELUM WUJUD'}
              </span>
            </div>
            <div>
              &bull; <strong>Klasifikasi Visibilitas Odeh (2006):</strong> {hilal.odehCriteria.description}
            </div>
          </div>
        </div>

        {/* Lembar Tanda Tangan */}
        <div className="pt-8 flex justify-between items-end text-xs">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold">Ketua Lembaga Falakiyah Almansuriyah</p>
            <div className="h-16" />
            <p className="font-bold underline">( Pimpinan Lembaga Falakiyah )</p>
          </div>
          <div className="text-right">
            <p>Ditetapkan di: {observer.name}</p>
            <p className="font-bold">Lajnah Falakiyah Almansuriyah</p>
            <div className="h-16" />
            <p className="font-bold underline">( Ahli Hisab & Falak Sullamun Nayyirain )</p>
          </div>
        </div>
      </div>
    </div>
  );
};
