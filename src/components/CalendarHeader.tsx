import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarTheme, CalendarViewMode } from '../types/calendar';
import { NAMA_BULAN, toArabicNumeral } from '../utils/calendarMath';

export type { CalendarViewMode };

interface CalendarHeaderProps {
  month: number; // 1-12
  year: number;
  masehiHeaderText?: string;
  hijriHeaderText: string;
  jawaHeaderText: string;
  julianHeaderText?: string;
  tionghoaHeaderText?: string;
  sakaHeaderText?: string;
  theme: CalendarTheme;
  mode?: CalendarViewMode;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

// Skema Warna Khas Kalender Dinding Indonesia Tiap Bulan (1 - 12)
interface MonthHeaderStyle {
  classicNumBg: string;
  classicTitleBg: string;
  classicBorder: string;
  classicHijriBg: string;
  classicHijriBorder: string;
  classicHijriText: string;
  classicJawaText: string;
  darkNumBg: string;
  darkTitleBg: string;
  darkBorder: string;
  darkAccent: string;
}

const MONTH_THEMES: Record<number, MonthHeaderStyle> = {
  1: { // Januari - Biru Langit / Sky Blue
    classicNumBg: '#0288d1',
    classicTitleBg: '#1565c0',
    classicBorder: '#ff9800',
    classicHijriBg: '#e1f5fe',
    classicHijriBorder: '#0288d1',
    classicHijriText: '#01579b',
    classicJawaText: '#0277bd',
    darkNumBg: '#0284c7',
    darkTitleBg: '#0f172a',
    darkBorder: '#38bdf8',
    darkAccent: '#7dd3fc'
  },
  2: { // Februari - Crimson / Rose Magenta
    classicNumBg: '#d81b60',
    classicTitleBg: '#880e4f',
    classicBorder: '#ffd54f',
    classicHijriBg: '#fce4ec',
    classicHijriBorder: '#c2185b',
    classicHijriText: '#880e4f',
    classicJawaText: '#ad1457',
    darkNumBg: '#db2777',
    darkTitleBg: '#210d18',
    darkBorder: '#f472b6',
    darkAccent: '#fbcfe8'
  },
  3: { // Maret - Hijau Zamrud / Emerald
    classicNumBg: '#2e7d32',
    classicTitleBg: '#1b5e20',
    classicBorder: '#ffb300',
    classicHijriBg: '#e8f5e9',
    classicHijriBorder: '#2e7d32',
    classicHijriText: '#1b5e20',
    classicJawaText: '#2e7d32',
    darkNumBg: '#16a34a',
    darkTitleBg: '#0d1f14',
    darkBorder: '#4ade80',
    darkAccent: '#86efac'
  },
  4: { // April - Oranye Senja / Sunset Amber
    classicNumBg: '#ef6c00',
    classicTitleBg: '#bf360c',
    classicBorder: '#ffe082',
    classicHijriBg: '#fff3e0',
    classicHijriBorder: '#e65100',
    classicHijriText: '#bf360c',
    classicJawaText: '#e65100',
    darkNumBg: '#ea580c',
    darkTitleBg: '#24140b',
    darkBorder: '#fb923c',
    darkAccent: '#fed7aa'
  },
  5: { // Mei - Ungu Ningrat / Royal Purple
    classicNumBg: '#7b1fa2',
    classicTitleBg: '#4a148c',
    classicBorder: '#ffab00',
    classicHijriBg: '#f3e5f5',
    classicHijriBorder: '#7b1fa2',
    classicHijriText: '#4a148c',
    classicJawaText: '#6a1b9a',
    darkNumBg: '#9333ea',
    darkTitleBg: '#1c0f2b',
    darkBorder: '#c084fc',
    darkAccent: '#e9d5ff'
  },
  6: { // Juni - Toska Laut / Sea Green Teal
    classicNumBg: '#00897b',
    classicTitleBg: '#004d40',
    classicBorder: '#ffd600',
    classicHijriBg: '#e0f2f1',
    classicHijriBorder: '#00796b',
    classicHijriText: '#004d40',
    classicJawaText: '#00695c',
    darkNumBg: '#0d9488',
    darkTitleBg: '#0b1c19',
    darkBorder: '#2dd4bf',
    darkAccent: '#99f6e4'
  },
  7: { // Juli - Terakota / Rust Terracotta
    classicNumBg: '#e64a19',
    classicTitleBg: '#bf360c',
    classicBorder: '#ffe082',
    classicHijriBg: '#fbe9e7',
    classicHijriBorder: '#d84315',
    classicHijriText: '#bf360c',
    classicJawaText: '#d84315',
    darkNumBg: '#c2410c',
    darkTitleBg: '#24120f',
    darkBorder: '#f97316',
    darkAccent: '#ffedd5'
  },
  8: { // Agustus - Merah Putih Kemerdekaan (HUT RI)
    classicNumBg: '#e53935',
    classicTitleBg: '#b71c1c',
    classicBorder: '#ffffff',
    classicHijriBg: '#ffebee',
    classicHijriBorder: '#c62828',
    classicHijriText: '#b71c1c',
    classicJawaText: '#c62828',
    darkNumBg: '#dc2626',
    darkTitleBg: '#290c0c',
    darkBorder: '#f87171',
    darkAccent: '#fecaca'
  },
  9: { // September - Kuning Emas Nusantara / Warm Ochre
    classicNumBg: '#f57f17',
    classicTitleBg: '#e65100',
    classicBorder: '#ffeb3b',
    classicHijriBg: '#fffde7',
    classicHijriBorder: '#f57f17',
    classicHijriText: '#e65100',
    classicJawaText: '#f57f17',
    darkNumBg: '#d97706',
    darkTitleBg: '#241807',
    darkBorder: '#fcd34d',
    darkAccent: '#fef3c7'
  },
  10: { // Oktober - Biru Kobalt / Deep Cobalt
    classicNumBg: '#1976d2',
    classicTitleBg: '#0d47a1',
    classicBorder: '#ff8f00',
    classicHijriBg: '#e3f2fd',
    classicHijriBorder: '#1565c0',
    classicHijriText: '#0d47a1',
    classicJawaText: '#1565c0',
    darkNumBg: '#2563eb',
    darkTitleBg: '#0c162c',
    darkBorder: '#60a5fa',
    darkAccent: '#bfdbfe'
  },
  11: { // November - Cokelat Hangat / Earth Umber
    classicNumBg: '#6d4c41',
    classicTitleBg: '#3e2723',
    classicBorder: '#ffb74d',
    classicHijriBg: '#efebe9',
    classicHijriBorder: '#5d4037',
    classicHijriText: '#3e2723',
    classicJawaText: '#4e342e',
    darkNumBg: '#78350f',
    darkTitleBg: '#1c1310',
    darkBorder: '#f59e0b',
    darkAccent: '#fde68a'
  },
  12: { // Desember - Hijau Pinus / Pine Evergreen
    classicNumBg: '#00695c',
    classicTitleBg: '#004d40',
    classicBorder: '#ff5252',
    classicHijriBg: '#e0f2f1',
    classicHijriBorder: '#00695c',
    classicHijriText: '#004d40',
    classicJawaText: '#00695c',
    darkNumBg: '#059669',
    darkTitleBg: '#0a1d17',
    darkBorder: '#34d399',
    darkAccent: '#a7f3d0'
  }
};

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  month,
  year,
  masehiHeaderText,
  hijriHeaderText,
  jawaHeaderText,
  julianHeaderText,
  tionghoaHeaderText,
  sakaHeaderText,
  theme,
  mode = 'lengkap',
  onPrevMonth,
  onNextMonth
}) => {
  const monthName = NAMA_BULAN[month - 1] || 'JANUARI';
  const isDark = theme === 'dark';
  const curTheme = MONTH_THEMES[month] || MONTH_THEMES[1];

  // Judul utama dan subtitle adaptif sesuai mode kalender
  let displayTitle = `${monthName} ${year}`;
  let displaySubtitle = 'Masehi • Hijriyah • Jawa • Tionghoa • Saka • Julian';
  let sideLine1 = hijriHeaderText;
  let sideLine2 = jawaHeaderText;

  if (mode === 'masehi') {
    displayTitle = `${monthName} ${year}`;
    displaySubtitle = 'Penanggalan Masehi (Gregorian Standar)';
    sideLine1 = hijriHeaderText;
    sideLine2 = jawaHeaderText;
  } else if (mode === 'hijriyah') {
    displayTitle = hijriHeaderText || `${monthName} ${year}`;
    displaySubtitle = 'Penanggalan Qamariyah Islam (Sullamun Nayyirain)';
    sideLine1 = masehiHeaderText || `${monthName} ${year}`;
    sideLine2 = jawaHeaderText;
  } else if (mode === 'jawa') {
    displayTitle = jawaHeaderText || `${monthName} ${year}`;
    displaySubtitle = 'Penanggalan Jawa Kasultanan Sultan Agungan';
    sideLine1 = masehiHeaderText || `${monthName} ${year}`;
    sideLine2 = hijriHeaderText;
  } else if (mode === 'julian') {
    displayTitle = julianHeaderText || `Kalender Julian ${year}`;
    displaySubtitle = 'Penanggalan Kalender Julius Caesar (Old Style)';
    sideLine1 = masehiHeaderText || `${monthName} ${year}`;
    sideLine2 = hijriHeaderText;
  } else if (mode === 'tionghoa') {
    displayTitle = tionghoaHeaderText || `Imlek ${year}`;
    displaySubtitle = 'Penanggalan Tionghoa & Zodiak Shio';
    sideLine1 = masehiHeaderText || `${monthName} ${year}`;
    sideLine2 = hijriHeaderText;
  } else if (mode === 'saka') {
    displayTitle = sakaHeaderText || `Kalender Saka ${year}`;
    displaySubtitle = 'Penanggalan Saka Bali & Hindu Nusantara';
    sideLine1 = masehiHeaderText || `${monthName} ${year}`;
    sideLine2 = hijriHeaderText;
  }

  // Label kotak angka kiri
  let boxSubLabel = 'BULAN';
  if (mode === 'hijriyah') boxSubLabel = 'شهر';
  else if (mode === 'jawa') boxSubLabel = 'WULAN';
  else if (mode === 'julian') boxSubLabel = 'MENSIS';
  else if (mode === 'tionghoa') boxSubLabel = '月';
  else if (mode === 'saka') boxSubLabel = 'SASIH';

  return (
    <div
      className="w-full overflow-hidden transition-colors border-b-4 select-none"
      style={{
        borderColor: isDark ? curTheme.darkBorder : curTheme.classicBorder,
        backgroundColor: isDark ? curTheme.darkTitleBg : curTheme.classicTitleBg
      }}
    >
      <div className="flex flex-col sm:grid sm:grid-cols-[70px_1fr_auto] md:grid-cols-[85px_1fr_auto] lg:grid-cols-[95px_1fr_auto] items-stretch min-h-[82px] sm:min-h-[96px] md:min-h-[105px]">
        {/* Month Number Box (Left) */}
        <div className="flex items-stretch w-full sm:contents">
          <div
            className="w-[52px] sm:w-auto relative flex items-center justify-center font-black text-3xl sm:text-5xl md:text-6xl tracking-tight border-r-2 sm:border-r-3 select-none text-white drop-shadow-md shrink-0 py-1.5 sm:py-0 px-1 sm:px-2"
            style={{
              backgroundColor: isDark ? curTheme.darkNumBg : curTheme.classicNumBg,
              borderColor: isDark ? '#111' : curTheme.classicTitleBg,
              textShadow: '2px 2px 4px rgba(0,0,0,0.35)'
            }}
          >
            {mode === 'hijriyah' ? (
              <span className="font-serif leading-none" style={{ fontFamily: "'Amiri', serif" }}>
                {toArabicNumeral(month)}
              </span>
            ) : (
              <span>{month}</span>
            )}
            <span className="hidden sm:inline-block text-[10px] md:text-xs font-semibold absolute bottom-1 text-white/80 uppercase tracking-widest">
              {boxSubLabel}
            </span>
          </div>

          {/* Month Title & Year Box (Center) */}
          <div
            className="flex-1 min-w-0 flex items-center justify-between px-2 sm:px-5 md:px-7 select-none text-white py-1.5 sm:py-0"
            style={{
              backgroundColor: isDark ? curTheme.darkTitleBg : curTheme.classicTitleBg
            }}
          >
            <button
              onClick={onPrevMonth}
              title="Bulan Sebelumnya"
              className="p-1 sm:p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all print:hidden cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>

            {/* Judul Bulan dan Tahun */}
            <div className="text-center py-1 px-1.5 min-w-0 flex-1 flex flex-col items-center justify-center">
              <h1 className={`${
                mode === 'hijriyah' || mode === 'jawa' || mode === 'tionghoa' || mode === 'saka' || mode === 'julian'
                  ? 'text-xs sm:text-xl md:text-2xl lg:text-3xl'
                  : 'text-xs sm:text-2xl md:text-3xl lg:text-4xl'
              } font-black uppercase tracking-tight sm:tracking-wide drop-shadow-sm leading-tight text-balance max-w-full px-1`}>
                {displayTitle}
              </h1>
              <p className="text-[7.5px] sm:text-[11px] md:text-xs text-amber-300 font-semibold tracking-wider uppercase mt-0.5 opacity-90 truncate max-w-full">
                {displaySubtitle}
              </p>
            </div>

            <button
              onClick={onNextMonth}
              title="Bulan Berikutnya"
              className="p-1 sm:p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all print:hidden cursor-pointer shrink-0"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Dual Subtitle Side Columns */}
        <div
          className="flex flex-col justify-center px-3 sm:px-5 py-1.5 sm:py-2 border-t sm:border-t-0 sm:border-l-2 text-center sm:text-right select-none sm:min-w-[210px] md:min-w-[260px] lg:min-w-[310px] sm:max-w-[340px] overflow-hidden"
          style={{
            backgroundColor: isDark ? '#141c24' : curTheme.classicHijriBg,
            borderColor: isDark ? '#333' : curTheme.classicHijriBorder
          }}
        >
          {/* Baris 1 */}
          <div
            className="pb-0.5 sm:pb-1 mb-0.5 sm:mb-1 border-b"
            style={{
              borderColor: isDark ? '#334155' : curTheme.classicHijriBorder + '66'
            }}
          >
            <div 
              title={sideLine1}
              className="text-[9.5px] sm:text-xs md:text-sm lg:text-[14.5px] font-black tracking-normal leading-snug break-words"
              style={{
                color: isDark ? curTheme.darkAccent : curTheme.classicHijriText
              }}
            >
              {sideLine1}
            </div>
          </div>

          {/* Baris 2 */}
          <div
            title={sideLine2}
            className="text-[8.5px] sm:text-[11px] md:text-xs lg:text-[13px] font-bold tracking-normal leading-snug break-words"
            style={{
              color: isDark ? '#fcd34d' : curTheme.classicJawaText
            }}
          >
            {sideLine2}
          </div>
        </div>
      </div>
    </div>
  );
};
