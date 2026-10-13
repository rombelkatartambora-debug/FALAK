import React, { useState } from 'react';
import { FalakMonthRecord, generateFormatDetailText } from '../utils/almansuriyahFalakData';
import { Copy, Check, Printer, ChevronLeft, ChevronRight, Compass, Sun, Moon, Clock } from 'lucide-react';

interface ReportDetailViewProps {
  currentRecord: FalakMonthRecord;
  records: FalakMonthRecord[];
  onSelectMonth: (index: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ReportDetailView: React.FC<ReportDetailViewProps> = ({
  currentRecord,
  records,
  onSelectMonth,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = generateFormatDetailText(currentRecord);
    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast('Format Hasil Detail / Rinci berhasil disalin!');
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Action Bar */}
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
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Naskah Rinci'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-all border border-stone-700 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* TAMPILAN RESMI FORMAT DETAIL (PERSIS SESUAI ATURAN 1.B & GAMBAR 1001300223.jpg) */}
      <div className="bg-white text-stone-900 rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-stone-300 print:shadow-none print:border-none print:p-0">
        {/* Kop Lembaga */}
        <div className="text-center border-b pb-4 mb-6">
          <div className="text-[11px] font-bold text-emerald-800 tracking-widest uppercase">
            LEMBAGA HISAB FALAKIYAH ALMANSURIYAH JAKARTA
          </div>
          <p className="text-xs text-stone-500">
            Laporan Detail Hisab Awal Bulan Berdasarkan Metode Sulam Al-Nayyirain
          </p>
        </div>

        {/* Header: AWAL [NAMA BULAN] [TAHUN] */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 uppercase tracking-tight">
            AWAL {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah} H.
          </h1>
          <div className="w-24 h-1 bg-red-600 mx-auto mt-2 rounded-full"></div>
        </div>

        {/* 8 Poin Berurutan Sesuai Aturan Ketat */}
        <div className="space-y-4 max-w-2xl mx-auto font-mono text-sm sm:text-base leading-relaxed bg-stone-50 p-6 sm:p-8 rounded-2xl border border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-stone-200 pb-2.5">
            <span className="font-bold text-stone-800">
              1. Ijtima' {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah} H. :
            </span>
            <span className="font-semibold text-stone-950 sm:text-right mt-0.5 sm:mt-0">
              {currentRecord.hariPasaranIjtima}, {currentRecord.tanggalMasehiIjtima} &nbsp;
              <strong className="text-blue-700">{currentRecord.jamIjtima}</strong>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-stone-200 pb-2.5">
            <span className="font-bold text-stone-800">2. Maghrib :</span>
            <span className="font-semibold text-stone-950 sm:text-right mt-0.5 sm:mt-0">
              {currentRecord.jamMaghrib}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-stone-200 pb-2.5">
            <span className="font-bold text-stone-800">3. Umur Bulan :</span>
            <span className="font-semibold text-stone-950 sm:text-right mt-0.5 sm:mt-0">
              {currentRecord.umurBulanLengkap}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-stone-200 pb-2.5">
            <span className="font-bold text-stone-800">4. Letak Matahari Terbenam :</span>
            <span className="font-semibold text-stone-950 sm:text-right mt-0.5 sm:mt-0">
              {currentRecord.letakMatahariTerbenam}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-stone-200 pb-2.5">
            <span className="font-bold text-stone-800">5. Posisi Hilal :</span>
            <span className="font-semibold text-stone-950 sm:text-right mt-0.5 sm:mt-0">
              {currentRecord.posisiHilal}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-stone-200 pb-2.5">
            <span className="font-bold text-stone-800">6. Keadaan Hilal :</span>
            <span className="font-semibold text-stone-950 sm:text-right mt-0.5 sm:mt-0">
              {currentRecord.keadaanHilal}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-stone-200 pb-2.5">
            <span className="font-bold text-stone-800">7. Tinggi Hilal :</span>
            <span className={`font-black sm:text-right mt-0.5 sm:mt-0 ${
              currentRecord.tinggiHilal.startsWith('-') ? 'text-red-700' : 'text-emerald-700'
            }`}>
              {currentRecord.tinggiHilal}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-1">
            <span className="font-bold text-stone-800">8. Lama Hilal Diatas Ufuk :</span>
            <span className="font-semibold text-stone-950 sm:text-right mt-0.5 sm:mt-0">
              {currentRecord.lamaHilalDiatasUfuk}
            </span>
          </div>
        </div>

        {/* Footer: AWAL [NAMA BULAN] [TAHUN] | [HARI PASARAN, TANGGAL MASEHI] */}
        <div className="mt-8 pt-6 border-t-2 border-stone-900 text-center">
          <div className="inline-block bg-stone-900 text-amber-400 font-mono font-black text-base sm:text-lg md:text-xl py-3 px-6 rounded-2xl shadow-md">
            AWAL {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah} H. &nbsp;&nbsp;|&nbsp;&nbsp; {currentRecord.hariPasaranAwalBulan}
          </div>
        </div>
      </div>
    </div>
  );
};
