import React, { useState } from 'react';
import { FalakMonthRecord, generateFormatMatriksText } from '../utils/almansuriyahFalakData';
import { Copy, Check, Printer, ChevronLeft, ChevronRight, Layers, Table, Grid } from 'lucide-react';

interface ReportMatriksViewProps {
  currentRecord: FalakMonthRecord;
  records: FalakMonthRecord[];
  onSelectMonth: (index: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ReportMatriksView: React.FC<ReportMatriksViewProps> = ({
  currentRecord,
  records,
  onSelectMonth,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const handleCopy = () => {
    const text = generateFormatMatriksText(currentRecord);
    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast('Format Matriks Falak Lengkap berhasil disalin!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentIdx = records.findIndex(r => r.bulanHijriyahKe === currentRecord.bulanHijriyahKe);

  const handlePrev = () => {
    const nextIdx = currentIdx > 0 ? currentIdx - 1 : records.length - 1;
    onSelectMonth(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = currentIdx < records.length - 1 ? currentIdx + 1 : 0;
    onSelectMonth(nextIdx);
  };

  const m = currentRecord.matriks;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/90 border border-stone-800 p-3 sm:p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-amber-400">
            {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah} H
          </span>
          <button
            onClick={handleNext}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle View Mode for Mobile */}
          <div className="flex bg-stone-800 p-0.5 rounded-xl border border-stone-700 sm:hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs ${viewMode === 'table' ? 'bg-amber-600 text-white' : 'text-stone-400'}`}
              title="Tabel"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg text-xs ${viewMode === 'card' ? 'bg-amber-600 text-white' : 'text-stone-400'}`}
              title="Kartu Blok"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Tersalin!' : 'Salin Matriks'}</span>
            <span className="sm:hidden">{copied ? 'OK' : 'Salin'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-all border border-stone-700 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* DOKUMEN MATRIKS LENGKAP (PERSIS GAMBAR 1001300220.jpg) */}
      <div className="bg-white text-stone-900 rounded-3xl p-4 sm:p-8 md:p-10 shadow-2xl border-2 border-stone-300 print:shadow-none print:border-none print:p-0">
        {/* Header & Sub-Header */}
        <div className="text-center border-b-2 border-stone-900 pb-5 mb-6">
          <h1 className="text-base sm:text-xl md:text-2xl font-black text-stone-900 uppercase tracking-tight">
            LEMBAGA HISAB FALAKIYAH ALMANSURIYAH JAKARTA MENETAPKAN
          </h1>
          <p className="text-xs sm:text-sm md:text-base font-bold text-emerald-800 uppercase mt-1 tracking-wide">
            AWAL {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah} H — {currentRecord.hariPasaranAwalBulan}
          </p>
          <div className="text-[11px] text-stone-500 mt-0.5">
            Metode Kitab Sullamun Nayyirain &bull; Markaz Betawi (Jakarta)
          </div>
        </div>

        {/* TABEL MATRIKS 3 BLOK UTAMA */}
        <div className="space-y-6">
          {/* 1. BLOK EKLIPTIKA */}
          <div className="border border-stone-300 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-emerald-800 text-white px-4 py-2.5 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-between">
              <span>1. SISTEM KOORDINAT EKLIPTIKA</span>
              <span className="text-[11px] font-mono opacity-80">λ &amp; β</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-stone-100 text-stone-700 border-b border-stone-300 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 sm:px-4">Parameter Falak</th>
                    <th className="py-2.5 px-3 sm:px-4">Benda Langit</th>
                    <th className="py-2.5 px-3 sm:px-4 text-right">Saat Ijtima'</th>
                    <th className="py-2.5 px-3 sm:px-4 text-right">Saat Maghrib (Ghurub)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-mono">
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 sm:px-4 font-sans font-bold text-stone-800" rowSpan={2}>
                      Bujur Astronomis (λ)
                    </td>
                    <td className="py-2 px-3 sm:px-4 text-stone-700">Matahari (الشمس)</td>
                    <td className="py-2 px-3 sm:px-4 text-right font-bold text-amber-900">{m.lambdaSunIjtima}</td>
                    <td className="py-2 px-3 sm:px-4 text-right font-bold text-amber-900">{m.lambdaSunMaghrib}</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 sm:px-4 text-stone-700">Bulan (القمر)</td>
                    <td className="py-2 px-3 sm:px-4 text-right font-bold text-blue-900">{m.lambdaMoonIjtima}</td>
                    <td className="py-2 px-3 sm:px-4 text-right font-bold text-blue-900">{m.lambdaMoonMaghrib}</td>
                  </tr>
                  <tr className="hover:bg-stone-50 bg-stone-50/50">
                    <td className="py-2 px-3 sm:px-4 font-sans font-bold text-stone-800" rowSpan={2}>
                      Lintang Astronomis (β)
                    </td>
                    <td className="py-2 px-3 sm:px-4 text-stone-700">Matahari (الشمس)</td>
                    <td className="py-2 px-3 sm:px-4 text-right text-stone-600" colSpan={2}>
                      {m.betaSun} (Nol / Ekliptika)
                    </td>
                  </tr>
                  <tr className="hover:bg-stone-50 bg-stone-50/50">
                    <td className="py-2 px-3 sm:px-4 text-stone-700">Bulan (القمر)</td>
                    <td className="py-2 px-3 sm:px-4 text-right font-bold text-blue-900" colSpan={2}>
                      {m.betaMoon}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. BLOK EKUATOR */}
          <div className="border border-stone-300 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-sky-800 text-white px-4 py-2.5 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-between">
              <span>2. SISTEM KOORDINAT EKUATOR</span>
              <span className="text-[11px] font-mono opacity-80">δ, α &amp; t</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-stone-100 text-stone-700 border-b border-stone-300 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 sm:px-4">Parameter Falak</th>
                    <th className="py-2.5 px-3 sm:px-4">Matahari (الشمس)</th>
                    <th className="py-2.5 px-3 sm:px-4 text-right">Bulan / Hilal (القمر)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-mono">
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 sm:px-4 font-sans font-bold text-stone-800">
                      Deklinasi (δ / Inhiraf)
                    </td>
                    <td className="py-2 px-3 sm:px-4 font-bold text-amber-900">{m.deltaSun}</td>
                    <td className="py-2 px-3 sm:px-4 text-right font-bold text-blue-900">{m.deltaMoon}</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 sm:px-4 font-sans font-bold text-stone-800">
                      Asensiorekta Derajat (α)
                    </td>
                    <td className="py-2 px-3 sm:px-4">{m.alphaSunDeg}</td>
                    <td className="py-2 px-3 sm:px-4 text-right">{m.alphaMoonDeg}</td>
                  </tr>
                  <tr className="hover:bg-stone-50 bg-stone-50/50">
                    <td className="py-2 px-3 sm:px-4 font-sans font-bold text-stone-800">
                      Asensiorekta Waktu (α)
                    </td>
                    <td className="py-2 px-3 sm:px-4 text-stone-700">{m.alphaSunTime}</td>
                    <td className="py-2 px-3 sm:px-4 text-right text-stone-700">{m.alphaMoonTime}</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 sm:px-4 font-sans font-bold text-stone-800">
                      Sudut Waktu Derajat (t)
                    </td>
                    <td className="py-2 px-3 sm:px-4">{m.tSunDeg}</td>
                    <td className="py-2 px-3 sm:px-4 text-right">{m.tMoonDeg}</td>
                  </tr>
                  <tr className="hover:bg-stone-50 bg-stone-50/50">
                    <td className="py-2 px-3 sm:px-4 font-sans font-bold text-stone-800">
                      Sudut Waktu Jam (t)
                    </td>
                    <td className="py-2 px-3 sm:px-4 text-stone-700">{m.tSunTime}</td>
                    <td className="py-2 px-3 sm:px-4 text-right text-stone-700">{m.tMoonTime}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. BLOK HORIZON */}
          <div className="border border-stone-300 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-amber-800 text-white px-4 py-2.5 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-between">
              <span>3. SISTEM KOORDINAT HORIZON (UFUK)</span>
              <span className="text-[11px] font-mono opacity-80">h &amp; A</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-stone-100 text-stone-700 border-b border-stone-300 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 sm:px-4">Parameter Falak</th>
                    <th className="py-2.5 px-3 sm:px-4">Matahari (Ghurub)</th>
                    <th className="py-2.5 px-3 sm:px-4 text-right">Bulan (Tinggi Hilal Akhir)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-mono">
                  <tr className="hover:bg-stone-50">
                    <td className="py-2.5 px-3 sm:px-4 font-sans font-bold text-stone-800">
                      Ketinggian (h / Irtifa')
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-bold text-amber-900">
                      {m.hSun} <span className="text-[11px] text-stone-500 font-normal">(Ghurub Ufuk)</span>
                    </td>
                    <td className={`py-2.5 px-3 sm:px-4 text-right font-black text-sm sm:text-base ${
                      m.hMoon.startsWith('-') ? 'text-red-700' : 'text-emerald-700'
                    }`}>
                      {m.hMoon}
                    </td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="py-2.5 px-3 sm:px-4 font-sans font-bold text-stone-800">
                      Azimuth (A / As-Samti)
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-bold text-amber-900">{m.aSun}</td>
                    <td className="py-2.5 px-3 sm:px-4 text-right font-bold text-blue-900">{m.aMoon}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* PARAMETER TAMBAHAN DI BAGIAN BAWAH TABEL (SESUAI ATURAN 1.C) */}
          <div className="bg-stone-100 border border-stone-300 rounded-2xl p-4 sm:p-5 font-mono text-xs sm:text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-200">
                <span className="font-sans font-bold text-stone-800">Elongasi Bulan - Matahari :</span>
                <span className="font-bold text-stone-900">{m.elongation}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-200">
                <span className="font-sans font-bold text-stone-800">Umur Bulan :</span>
                <span className="font-bold text-stone-900">{m.umurBulanDeg} ({m.umurBulanTime})</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-200">
                <span className="font-sans font-bold text-stone-800">Lama Hilal (Mukuts) :</span>
                <span className="font-bold text-stone-900">{currentRecord.lamaHilalDiatasUfuk}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-200">
                <span className="font-sans font-bold text-stone-800">Status Visibilitas :</span>
                <span className={`font-bold ${
                  currentRecord.statusHilal.includes('Bawah') ? 'text-red-700' : 'text-emerald-700'
                }`}>
                  {currentRecord.statusHilal}
                </span>
              </div>
            </div>

            {/* Kesimpulan Penetapan */}
            <div className="mt-4 pt-3 border-t border-stone-300 text-center font-sans">
              <p className="text-xs sm:text-sm font-semibold text-stone-800">
                {currentRecord.keteranganPenetapan}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
