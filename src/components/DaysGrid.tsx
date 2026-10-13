import React from 'react';
import { DayData, CalendarTheme, CalendarFilters, CalendarViewMode } from '../types/calendar';
import { toArabicNumeral } from '../utils/calendarMath';

interface DaysGridProps {
  days: DayData[];
  theme: CalendarTheme;
  filters: CalendarFilters;
  mode?: CalendarViewMode;
  onSelectDay: (day: DayData) => void;
}

export const DaysGrid: React.FC<DaysGridProps> = ({
  days,
  theme,
  filters,
  mode = 'lengkap',
  onSelectDay
}) => {
  const isDark = theme === 'dark';

  // Label nama hari adaptif sesuai mode kalender
  const weekdayNames = (() => {
    if (mode === 'hijriyah') {
      return [
        { main: 'الأحد', sub: 'Ahad' },
        { main: 'الإثنين', sub: 'Senin' },
        { main: 'الثلاثاء', sub: 'Selasa' },
        { main: 'الأربعاء', sub: 'Rabu' },
        { main: 'الخميس', sub: 'Kamis' },
        { main: 'الجمعة', sub: "Jum'at" },
        { main: 'السبت', sub: 'Sabtu' }
      ];
    }
    if (mode === 'jawa') {
      return [
        { main: 'Radite', sub: 'Ahad' },
        { main: 'Soma', sub: 'Senin' },
        { main: 'Hanggara', sub: 'Selasa' },
        { main: 'Buda', sub: 'Rabu' },
        { main: 'Respati', sub: 'Kamis' },
        { main: 'Sukra', sub: 'Jumat' },
        { main: 'Tumpak', sub: 'Sabtu' }
      ];
    }
    if (mode === 'julian') {
      return [
        { main: 'Dies Solis', sub: 'Ahad' },
        { main: 'Dies Lunae', sub: 'Senin' },
        { main: 'Dies Martis', sub: 'Selasa' },
        { main: 'Dies Mercurii', sub: 'Rabu' },
        { main: 'Dies Iovis', sub: 'Kamis' },
        { main: 'Dies Veneris', sub: 'Jumat' },
        { main: 'Dies Saturni', sub: 'Sabtu' }
      ];
    }
    if (mode === 'tionghoa') {
      return [
        { main: '星期日', sub: 'Ahad (Xingqiri)' },
        { main: '星期一', sub: 'Senin (Xingqiyi)' },
        { main: '星期二', sub: 'Selasa (Xingqier)' },
        { main: '星期三', sub: 'Rabu (Xingqisan)' },
        { main: '星期四', sub: 'Kamis (Xingqisi)' },
        { main: '星期五', sub: 'Jumat (Xingqiwu)' },
        { main: '星期六', sub: 'Sabtu (Xingqiliu)' }
      ];
    }
    if (mode === 'saka') {
      return [
        { main: 'Redite', sub: 'Ahad' },
        { main: 'Coma', sub: 'Senin' },
        { main: 'Anggara', sub: 'Selasa' },
        { main: 'Buda', sub: 'Rabu' },
        { main: 'Wraspati', sub: 'Kamis' },
        { main: 'Sukra', sub: 'Jumat' },
        { main: 'Saniscara', sub: 'Sabtu' }
      ];
    }
    return [
      { main: 'Ahad', sub: 'Minggu' },
      { main: 'Senin', sub: 'Monday' },
      { main: 'Selasa', sub: 'Tuesday' },
      { main: 'Rabu', sub: 'Wednesday' },
      { main: 'Kamis', sub: 'Thursday' },
      { main: 'Jumat', sub: 'Friday' },
      { main: 'Sabtu', sub: 'Saturday' }
    ];
  })();

  return (
    <div className="w-full">
      {/* Weekday Header (7 Columns) */}
      <div className="grid grid-cols-7 text-center font-black text-[10px] sm:text-xs md:text-sm border-b-2 border-stone-900 select-none">
        {weekdayNames.map((w, idx) => {
          let bgHeader = 'bg-[#ffb300] text-stone-950';
          if (idx === 0) bgHeader = 'bg-[#e53935] text-white'; // Ahad Merah
          if (idx === 5) bgHeader = 'bg-[#00897b] text-white'; // Jumat Hijau/Teal

          return (
            <div
              key={idx}
              className={`py-1.5 sm:py-2.5 uppercase tracking-wider border-r border-stone-900 last:border-r-0 truncate flex flex-col items-center justify-center ${bgHeader}`}
            >
              <span className="font-black leading-tight">{w.main}</span>
              <span className="text-[7.5px] sm:text-[9px] opacity-80 normal-case hidden sm:inline-block">
                {w.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* Days Grid */}
      <div
        className={`grid grid-cols-7 gap-[1px] ${
          isDark ? 'bg-stone-800' : 'bg-stone-300'
        }`}
      >
        {days.map((day, idx) => {
          const isAhad = day.dayOfWeek === 0;
          const isJumat = day.dayOfWeek === 5;
          const hasHoliday = day.holidays.some((h) => h.isHoliday);
          const hasObservance = day.holidays.length > 0;
          const hasGoogleEvents = day.googleEvents.length > 0;

          // Determine main text color
          let textColorClass = 'text-stone-900';
          if (!day.isCurrentMonth) {
            textColorClass = isDark ? 'text-stone-600' : 'text-stone-400';
          } else if (hasHoliday || isAhad) {
            textColorClass = isDark ? 'text-red-400' : 'text-[#d32f2f]';
          } else if (isJumat) {
            textColorClass = isDark ? 'text-purple-400' : 'text-[#8e24aa]';
          } else {
            textColorClass = isDark ? 'text-stone-100' : 'text-[#111111]';
          }

          // Background color
          let bgClass = isDark ? 'bg-[#141414]' : 'bg-white';
          if (!day.isCurrentMonth) {
            bgClass = isDark ? 'bg-[#0f0f0f]' : 'bg-[#f7f7f7]';
          } else if (day.isToday) {
            bgClass = isDark ? 'bg-amber-950/30 ring-2 ring-amber-500/80 ring-inset' : 'bg-amber-50/70 ring-2 ring-amber-500/80 ring-inset';
          }

          return (
            <div
              key={`${day.year}-${day.monthIdx}-${day.dayNum}-${idx}`}
              onClick={() => onSelectDay(day)}
              className={`group relative p-1 sm:p-2 md:p-2.5 min-h-[66px] sm:min-h-[105px] md:min-h-[125px] flex flex-col justify-between transition-all select-none cursor-pointer hover:z-10 ${bgClass} ${
                day.isCurrentMonth
                  ? isDark
                    ? 'hover:bg-stone-800/90'
                    : 'hover:bg-sky-50/60'
                  : 'opacity-70'
              }`}
            >
              {/* Top Row: Indicators & Badges */}
              <div className="flex items-start justify-between gap-0.5 sm:gap-1 w-full relative">
                {/* Indicators: Hari Ini, Notes, Admin Events */}
                <div className="flex items-center gap-1">
                  {day.isToday && (
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1 sm:px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 shadow-xs">
                      Hari Ini
                    </span>
                  )}
                  {filters.showGoogleEvents && hasGoogleEvents && day.isCurrentMonth && (
                    <span
                      title={`${day.googleEvents.length} agenda Google Calendar`}
                      className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded bg-blue-600 text-white shadow-xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>{day.googleEvents.length}</span>
                    </span>
                  )}
                  {day.personalNotes && day.personalNotes.length > 0 && day.isCurrentMonth && (
                    <span
                      title={`${day.personalNotes.length} catatan pribadi & to-do`}
                      className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded bg-amber-600 text-white shadow-xs"
                    >
                      <span>📝</span>
                      <span>{day.personalNotes.length}</span>
                    </span>
                  )}
                  {day.adminEvents && day.adminEvents.length > 0 && day.isCurrentMonth && (
                    <span
                      title={`${day.adminEvents.length} agenda lembaga`}
                      className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded bg-emerald-600 text-white shadow-xs"
                    >
                      <span>🏛️</span>
                      <span>{day.adminEvents.length}</span>
                    </span>
                  )}
                </div>

                {/* Badge Kanan Atas Adaptif Sesuai Mode */}
                {day.isCurrentMonth && (
                  <div className="ml-auto">
                    {mode === 'hijriyah' ? (
                      hasHoliday ? (
                        <span className="text-[7.5px] sm:text-[9px] font-bold px-1 py-0.2 rounded bg-red-600 text-white shadow-xs">
                          Hari Besar
                        </span>
                      ) : null
                    ) : mode === 'jawa' ? (
                      <div
                        title={`Neptu: ${day.neptu.hari} (${day.neptu.neptuHari}) + ${day.neptu.pasaran} (${day.neptu.neptuPasaran}) = ${day.neptu.totalNeptu}`}
                        className="text-[8px] sm:text-[10px] md:text-[11px] font-black bg-amber-700 text-white px-1 sm:px-1.5 py-0.2 rounded shadow-xs"
                      >
                        N:{day.neptu.totalNeptu}
                      </div>
                    ) : mode === 'julian' ? (
                      <div
                        title={`Julian Day Number: ${day.julian?.julianDayNumber}`}
                        className="text-[8px] sm:text-[9px] font-black bg-blue-800 text-white px-1 py-0.2 rounded shadow-xs"
                      >
                        JD:{day.julian ? String(day.julian.julianDayNumber).slice(-4) : ''}
                      </div>
                    ) : mode === 'tionghoa' ? (
                      <div
                        title={`Shio: ${day.tionghoa?.shio || ''}`}
                        className="text-[8px] sm:text-[9px] font-black bg-red-800 text-white px-1 py-0.2 rounded shadow-xs"
                      >
                        {day.tionghoa?.shioAnimal || 'Shio'}
                      </div>
                    ) : mode === 'saka' ? (
                      <div
                        title={`Fase Bulan: ${day.saka?.faseBulan || ''}`}
                        className={`text-[8px] sm:text-[9px] font-black px-1 py-0.2 rounded shadow-xs ${
                          day.saka?.faseBulan === 'Purnama'
                            ? 'bg-amber-400 text-stone-950 font-extrabold'
                            : day.saka?.faseBulan === 'Tilem'
                            ? 'bg-stone-900 text-white'
                            : 'bg-purple-800 text-white'
                        }`}
                      >
                        {day.saka?.faseBulan === 'Purnama' ? '🌕 Pur' : day.saka?.faseBulan === 'Tilem' ? '🌑 Til' : day.saka?.faseBulanHari ? `P:${day.saka.faseBulanHari}` : ''}
                      </div>
                    ) : mode === 'masehi' ? (
                      hasHoliday ? (
                        <span className="text-[7.5px] sm:text-[9px] font-bold px-1 py-0.2 rounded bg-red-600 text-white shadow-xs">
                          Libur
                        </span>
                      ) : null
                    ) : (
                      // Mode Lengkap (Default)
                      <div
                        title={`Tanggal ${day.hijri.day} ${day.hijri.monthName} ${day.hijri.year} H`}
                        className="font-serif text-xs sm:text-base md:text-lg font-black bg-[#2e7d32] text-white px-1 sm:px-2 py-0.2 sm:py-0.5 rounded shadow-sm group-hover:scale-110 transition-transform leading-none"
                        style={{ fontFamily: "'Amiri', serif" }}
                      >
                        {toArabicNumeral(day.hijri.day)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Center: Nomor Tanggal Utama Sesuai Mode */}
              <div className="my-auto py-0.5 text-center sm:text-left">
                {mode === 'hijriyah' ? (
                  <div className="flex items-center justify-center sm:justify-start">
                    <span
                      className="font-serif font-black text-2xl sm:text-5xl md:text-6xl tracking-tight leading-none block text-emerald-800 dark:text-emerald-400"
                      style={{ fontFamily: "'Amiri', serif" }}
                    >
                      {toArabicNumeral(day.hijri.day)}
                    </span>
                  </div>
                ) : mode === 'jawa' ? (
                  <div className="flex flex-col items-center sm:items-start leading-none">
                    <span className="font-black text-xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-none block text-amber-900 dark:text-amber-400">
                      {day.jawa.day}
                    </span>
                    <span className="text-[9px] sm:text-xs md:text-sm font-black uppercase text-amber-800 dark:text-amber-300 tracking-wider mt-0.5">
                      {day.pasaran}
                    </span>
                  </div>
                ) : mode === 'julian' ? (
                  <div className="flex flex-col items-center sm:items-start leading-none">
                    <span className="font-black text-xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-none block text-blue-900 dark:text-blue-400">
                      {day.julian?.day ?? day.dayNum}
                    </span>
                    <span className="text-[8px] sm:text-[10px] md:text-xs font-bold text-blue-800 dark:text-blue-300 uppercase mt-0.5">
                      Julius
                    </span>
                  </div>
                ) : mode === 'tionghoa' ? (
                  <div className="flex flex-col items-center sm:items-start leading-none">
                    <span className="font-black text-xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-none block text-red-900 dark:text-red-400">
                      {day.tionghoa?.day ?? day.dayNum}
                    </span>
                    <span className="text-[9px] sm:text-xs md:text-sm font-black text-red-800 dark:text-red-300 tracking-tight mt-0.5">
                      {day.tionghoa?.chineseDayName ? day.tionghoa.chineseDayName.split(' ')[0] : '初一'}
                    </span>
                  </div>
                ) : mode === 'saka' ? (
                  <div className="flex flex-col items-center sm:items-start leading-none">
                    <span className="font-black text-xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-none block text-purple-900 dark:text-purple-400">
                      {day.saka?.day ?? day.dayNum}
                    </span>
                    <span className="text-[8px] sm:text-[10px] md:text-xs font-black uppercase text-purple-800 dark:text-purple-300 tracking-wider mt-0.5">
                      {day.saka?.faseBulan === 'Purnama' ? 'Purnama' : day.saka?.faseBulan === 'Tilem' ? 'Tilem' : day.saka?.sasihName || 'Sasih'}
                    </span>
                  </div>
                ) : (
                  // Mode Masehi & Mode Lengkap
                  <span
                    className={`font-black text-xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-none block ${textColorClass}`}
                  >
                    {day.dayNum}
                  </span>
                )}
              </div>

              {/* Bottom: Keterangan Bawah Sesuai Mode */}
              <div className="mt-auto pt-0.5 sm:pt-1 border-t border-stone-200/50 dark:border-stone-800/80 w-full min-h-[16px] sm:min-h-[18px] flex items-center">
                <div
                  className={`text-[8px] sm:text-xs md:text-sm font-black leading-tight w-full ${
                    !day.isCurrentMonth
                      ? 'text-stone-400 dark:text-stone-600'
                      : hasHoliday || isAhad
                      ? isDark ? 'text-red-400' : 'text-[#d32f2f]'
                      : isJumat
                      ? isDark ? 'text-purple-400' : 'text-[#8e24aa]'
                      : isDark ? 'text-stone-200' : 'text-stone-800'
                  }`}
                >
                  {day.isCurrentMonth ? (
                    mode === 'masehi' ? (
                      hasObservance || hasGoogleEvents || (day.personalNotes && day.personalNotes.length > 0) || (day.adminEvents && day.adminEvents.length > 0) ? (
                        <div className="text-[8px] sm:text-[10px] truncate font-bold text-red-600 dark:text-red-400">
                          {day.holidays[0]?.title || day.googleEvents[0]?.summary || day.adminEvents?.[0]?.title || day.personalNotes?.[0]?.title}
                        </div>
                      ) : null
                    ) : mode === 'hijriyah' ? (
                      // PADA KALENDER HIJRIYAH: HANYA PERISTIWA HIJRIYAH! TIDAK ADA HARI PERS NASIONAL!
                      hasObservance || day.isAyyamulBidh ? (
                        <div className="text-[8px] sm:text-[10px] truncate font-bold text-emerald-800 dark:text-emerald-400">
                          {day.holidays[0]?.title || (day.isAyyamulBidh ? 'Ayyamul Bidh' : '')}
                        </div>
                      ) : null
                    ) : mode === 'jawa' ? (
                      // PADA KALENDER JAWA: HANYA TRADISI JAWA & HIJRIYAH! TIDAK ADA MASEHI SEPERTI HARI PERS NASIONAL!
                      hasObservance ? (
                        <div className="text-[8px] sm:text-[10px] truncate font-bold text-amber-800 dark:text-amber-400">
                          {day.holidays[0]?.title}
                        </div>
                      ) : null
                    ) : mode === 'julian' ? (
                      hasObservance ? (
                        <div className="text-[8px] sm:text-[10px] truncate font-bold text-blue-800 dark:text-blue-400">
                          {day.holidays[0]?.title}
                        </div>
                      ) : null
                    ) : mode === 'tionghoa' ? (
                      hasObservance ? (
                        <div className="text-[8px] sm:text-[10px] truncate font-bold text-red-800 dark:text-red-400">
                          {day.holidays[0]?.title}
                        </div>
                      ) : null
                    ) : mode === 'saka' ? (
                      hasObservance ? (
                        <div className="text-[8px] sm:text-[10px] truncate font-bold text-purple-800 dark:text-purple-400">
                          {day.holidays[0]?.title}
                        </div>
                      ) : null
                    ) : (
                      // Mode Lengkap (Default)
                      <div className="flex flex-col sm:flex-row items-center sm:justify-between w-full text-center sm:text-left gap-0">
                        <span className="sm:inline font-bold opacity-80 sm:mr-1">
                          {day.hijri.day}
                        </span>
                        <span className="block sm:inline font-black tracking-tighter sm:tracking-normal uppercase sm:capitalize">
                          {day.pasaran}
                        </span>
                      </div>
                    )
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
