/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  DEFAULT_FALAK_DATA_1447H, 
  FalakMonthRecord,
  createDynamicFalakRecord
} from './utils/almansuriyahFalakData';

// 2 Tampilan Utama Sederhana Sesuai Instruksi User:
import { ReportRingkasView } from './components/ReportRingkasView';
import { ReportLengkapView } from './components/ReportLengkapView';
import { InteractiveWallCalendarSimple } from './components/InteractiveWallCalendarSimple';

import { 
  FileText, 
  Calendar, 
  Compass,
  BookOpen
} from 'lucide-react';
import { getHijriDate } from './utils/calendarMath';

export type MainTabKey = 'ringkas' | 'lengkap' | 'kalender';

export default function App() {
  // Hitung tahun & bulan Hijriyah hari ini secara otomatis (default tahun sekarang)
  const currentHijri = useMemo(() => getHijriDate(new Date()), []);

  // 1. Parameter Pilihan Aktif: Bulan Hijriyah Ke (1-12) & Tahun Hijriyah (Default tahun sekarang, bebas diubah)
  const [bulanHijriyahKe, setBulanHijriyahKe] = useState<number>(() => currentHijri.month + 1);
  const [tahunHijriyah, setTahunHijriyah] = useState<number>(() => currentHijri.year);

  // 2. Custom edited records cache (key: `${bulanKe}_${tahunH}`)
  const [customRecords, setCustomRecords] = useState<Record<string, FalakMonthRecord>>(() => {
    try {
      const saved = localStorage.getItem('almansuriyah_custom_records');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // 3. Tab Utama Aktif: 'ringkas' (Hasil Ringkas Gabungan) atau 'kalender' (Kalender Dinding)
  const [activeTab, setActiveTab] = useState<MainTabKey>('ringkas');

  // 4. Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 5. Rekor Falak Aktif berdasarkan bulan ke dan tahun ke
  const currentRecord = useMemo<FalakMonthRecord>(() => {
    const key = `${bulanHijriyahKe}_${tahunHijriyah}`;
    if (customRecords[key]) {
      return customRecords[key];
    }
    // Jika tahun 1447 dan bulan 1..12, ambil dari default Almansuriyah
    if (tahunHijriyah === 1447) {
      const match = DEFAULT_FALAK_DATA_1447H.find(r => r.bulanHijriyahKe === bulanHijriyahKe);
      if (match) return match;
    }
    // Buat data dinamis menggunakan algoritma Sulam Al-Nayyirain
    return createDynamicFalakRecord(bulanHijriyahKe, tahunHijriyah);
  }, [bulanHijriyahKe, tahunHijriyah, customRecords]);

  // Handler update dari form "Ganti Isian"
  const handleUpdateCurrentRecord = (updated: FalakMonthRecord) => {
    const key = `${updated.bulanHijriyahKe}_${updated.tahunHijriyah}`;
    const nextCustom = { ...customRecords, [key]: updated };
    setCustomRecords(nextCustom);
    setBulanHijriyahKe(updated.bulanHijriyahKe);
    setTahunHijriyah(updated.tahunHijriyah);
    try {
      localStorage.setItem('almansuriyah_custom_records', JSON.stringify(nextCustom));
    } catch {}
  };

  // Handler ubah bulan & tahun
  const handleSelectBulanTahun = (bKe: number, tH: number) => {
    setBulanHijriyahKe(bKe);
    setTahunHijriyah(tH);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* HEADER UTAMA: LEMBAGA HISAB FALAKIYAH ALMANSURIYAH */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 shadow-xl print:hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-3">
          {/* Logo & Identitas Resmi (Tanpa dropdown atau tombol berlebihan) */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950 shrink-0 border border-emerald-400/30">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-base md:text-lg font-black tracking-tight text-white uppercase truncate">
                LEMBAGA HISAB FALAKIYAH ALMANSURIYAH
              </h1>
              <p className="text-[9px] sm:text-xs text-amber-400 font-semibold tracking-wide truncate">
                Metode Sulam Al-Nayyirain &bull; Jembatan Lima, Jakarta Barat
              </p>
            </div>
          </div>

          {/* Navigasi Tab Utama */}
          <div className="flex items-center bg-stone-950 p-1 rounded-xl sm:rounded-2xl border border-stone-800 shrink-0">
            <button
              onClick={() => setActiveTab('ringkas')}
              className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs md:text-sm font-bold sm:font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ringkas'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Ringkas</span>
            </button>

            <button
              onClick={() => setActiveTab('lengkap')}
              className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs md:text-sm font-bold sm:font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'lengkap'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950 font-black'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Lengkap</span>
            </button>

            <button
              onClick={() => setActiveTab('kalender')}
              className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs md:text-sm font-bold sm:font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'kalender'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Kalender Dinding</span>
            </button>
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 md:px-6 py-3.5 sm:py-6 space-y-4 sm:space-y-6">
        {/* TAMPILAN 1: HASIL RINGKAS (GABUNGAN RESMI: RINGKAS + DETAIL + MATRIKS + GANTI ISIAN) */}
        {activeTab === 'ringkas' && (
          <ReportRingkasView
            currentRecord={currentRecord}
            onUpdateRecord={handleUpdateCurrentRecord}
            onSelectBulanTahun={handleSelectBulanTahun}
            onShowToast={showToast}
            onOpenHasilLengkap={() => setActiveTab('lengkap')}
          />
        )}

        {/* TAMPILAN 2: HASIL LENGKAP (SURAT RESMI LEMBAGA + SURAT PENETAPAN + 18 LANGKAH SULLAM SEPERTI PDF + BLANKO 38 BARIS) */}
        {activeTab === 'lengkap' && (
          <ReportLengkapView
            currentRecord={currentRecord}
            onShowToast={showToast}
          />
        )}

        {/* TAMPILAN 3: KALENDER DINDING INTERAKTIF (MENYESUAIKAN DENGAN BULAN & TAHUN AKTIF) */}
        {activeTab === 'kalender' && (
          <InteractiveWallCalendarSimple
            currentRecord={currentRecord}
            onOpenReport={() => setActiveTab('ringkas')}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* FOOTER RESMI SEDERHANA */}
      <footer className="bg-stone-900 border-t border-stone-800 text-stone-500 text-xs py-4 px-4 text-center mt-auto print:hidden">
        <p className="font-semibold">
          &copy; {new Date().getFullYear()} LEMBAGA HISAB FALAKIYAH ALMANSURIYAH JAKARTA &bull; Metode Sulam Al-Nayyirain
        </p>
      </footer>
    </div>
  );
}
