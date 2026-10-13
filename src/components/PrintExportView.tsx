import React from 'react';
import { 
  Printer, 
  FileText, 
  Image as ImageIcon, 
  Calendar, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Download,
  Building2
} from 'lucide-react';
import { CalendarTheme, CalendarKop } from '../types/calendar';

interface PrintExportViewProps {
  kop: CalendarKop;
  month: number;
  year: number;
  theme: CalendarTheme;
  onNavigateToCalendar: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const PrintExportView: React.FC<PrintExportViewProps> = ({
  kop,
  month,
  year,
  theme,
  onNavigateToCalendar,
  onShowToast
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-stone-900 to-indigo-950 text-white border border-purple-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-700/30 shrink-0">
            <Printer className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-400/30">
                Dokumentasi & Percetakan
              </span>
              <span className="text-xs text-stone-300 font-arabic">طباعة وتصدير</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Cetak & Ekspor
            </h2>
            <p className="text-xs text-purple-200/90 mt-0.5">
              Layanan cetak kalender poster resmi, laporan hisab rukyat, dan ekspor dokumen Yayasan Ruang Belajar
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-700/25 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Halaman Sekarang</span>
        </button>
      </div>

      {/* Grid Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Option 1: Cetak Kalender Dinding Poster */}
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              Cetak Kalender Dinding Interaktif (Poster)
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Cetak lembar kalender dinding lengkap dengan Kop Logo Yayasan Ruang Belajar, penanggalan triple (Masehi, Hijriyah, Jawa), jadwal sholat, dan catatan hari libur nasional.
            </p>

            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Kop Yayasan:</span>
                <span className="font-semibold text-amber-400">{kop.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Tema Kalender:</span>
                <span className="font-semibold capitalize text-stone-200">{theme}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToCalendar}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-amber-600/20"
          >
            <Calendar className="w-4 h-4" />
            <span>Buka Kalender Dinding di Portal Publik</span>
          </button>
        </div>

        {/* Option 2: Panduan Setting Cetak Resmi */}
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              Petunjuk Pengaturan Cetak (Print Settings)
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Untuk hasil cetak kalender dinding dan berita acara rukyat yang optimal:
            </p>

            <ul className="text-xs text-stone-400 space-y-1.5 list-disc list-inside">
              <li>Pilih ukuran kertas <strong>A4</strong> atau <strong>A3</strong> (Poster).</li>
              <li>Orientasi: <strong>Potret (Portrait)</strong> untuk kalender dinding.</li>
              <li>Centang opsi <strong>"Background graphics"</strong> (Grafik latar belakang) di dialog printer peramban.</li>
              <li>Margin: Setel ke <strong>Minimum</strong> atau <strong>None</strong> agar kalender pas satu lembar penuh.</li>
            </ul>
          </div>

          <button
            onClick={handlePrint}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-stone-700"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Uji Coba Dialog Printer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
