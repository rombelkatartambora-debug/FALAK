import React, { useState } from 'react';
import { X, Search, Sparkles, Calendar, Compass, ArrowRight } from 'lucide-react';
import { 
  getHijriDate, 
  getJawaDate, 
  getPasaran, 
  getNeptuInfo, 
  toArabicNumeral 
} from '../utils/calendarMath';

interface WetonCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToDate: (year: number, month: number) => void;
}

export const WetonCalculatorModal: React.FC<WetonCalculatorModalProps> = ({
  isOpen,
  onClose,
  onJumpToDate
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);

  const parsedDate = new Date(selectedDateStr + 'T12:00:00');
  const isValidDate = !isNaN(parsedDate.getTime()) && parsedDate.getFullYear() >= 1582 && parsedDate.getFullYear() <= 9999;

  let pasaran = '';
  let hijri = null;
  let jawa = null;
  let neptu = null;

  if (isValidDate) {
    pasaran = getPasaran(parsedDate);
    hijri = getHijriDate(parsedDate);
    jawa = getJawaDate(parsedDate, hijri);
    neptu = getNeptuInfo(parsedDate, pasaran);
  }

  const handleJump = () => {
    if (isValidDate) {
      onJumpToDate(parsedDate.getFullYear(), parsedDate.getMonth() + 1);
      onClose();
    }
  };

  const setPreset = (dStr: string) => {
    setSelectedDateStr(dStr);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-200" />
            <div>
              <h3 className="font-bold text-lg">Kalkulator Weton & Konversi Kalender</h3>
              <p className="text-xs text-amber-100">Cek weton, pasaran Jawa, dan Hijriyah tahun 1582 - 9999</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-amber-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
              Pilih Tanggal Masehi (1582 - 9999)
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                min="1582-01-01"
                max="9999-12-31"
                value={selectedDateStr}
                onChange={(e) => setSelectedDateStr(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-stone-500 py-0.5">Contoh:</span>
              <button
                type="button"
                onClick={() => setPreset('1945-08-17')}
                className="text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100 hover:text-amber-900 transition-colors cursor-pointer"
              >
                17 Agustus 1945 (Proklamasi)
              </button>
              <button
                type="button"
                onClick={() => setPreset('1928-10-28')}
                className="text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100 hover:text-amber-900 transition-colors cursor-pointer"
              >
                28 Oktober 1928 (Sumpah Pemuda)
              </button>
              <button
                type="button"
                onClick={() => setPreset(todayStr)}
                className="text-[11px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold cursor-pointer"
              >
                Hari Ini
              </button>
            </div>
          </div>

          {/* Result Card */}
          {isValidDate && neptu && hijri && jawa ? (
            <div className="space-y-3 pt-2">
              <div className="bg-amber-50/80 dark:bg-stone-800/80 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 text-stone-900 dark:text-white">
                <div className="text-center pb-3 border-b border-amber-200/60 dark:border-stone-700">
                  <div className="text-xs uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold">
                    Weton Kelahiran / Peristiwa
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-950 dark:text-amber-300 mt-1">
                    {neptu.weton}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 text-xs font-bold">
                    Jumlah Neptu: {neptu.totalNeptu} ({neptu.hari} {neptu.neptuHari} + {neptu.pasaran} {neptu.neptuPasaran})
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                  <div className="p-2.5 bg-white dark:bg-stone-900 rounded-lg border border-amber-100 dark:border-stone-800">
                    <span className="font-bold text-stone-500 uppercase text-[10px] block mb-0.5">Penanggalan Hijriyah</span>
                    <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      {hijri.day} {hijri.monthName} {hijri.year} H
                    </div>
                    <span className="text-sky-700 dark:text-sky-400 font-bold">
                      ({toArabicNumeral(hijri.day)} {hijri.monthName})
                    </span>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-stone-900 rounded-lg border border-amber-100 dark:border-stone-800">
                    <span className="font-bold text-stone-500 uppercase text-[10px] block mb-0.5">Penanggalan Jawa</span>
                    <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      {jawa.day} {jawa.monthName} {jawa.year}
                    </div>
                    <span className="text-amber-700 dark:text-amber-400 font-medium">
                      Windu {jawa.windu}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleJump}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <span>Buka di Kalender</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-xl text-center text-xs text-red-600 dark:text-red-400">
              Rentang tahun yang valid adalah antara 1582 hingga 9999.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
