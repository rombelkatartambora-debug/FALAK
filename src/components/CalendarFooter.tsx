import React from 'react';
import { CalendarTheme, CalendarViewMode } from '../types/calendar';
import { Calendar, Sparkles } from 'lucide-react';

interface CalendarFooterProps {
  events: Array<{ dayNum: number; title: string; isHoliday: boolean; type: string; origin?: string }>;
  theme: CalendarTheme;
  mode?: CalendarViewMode;
}

export const CalendarFooter: React.FC<CalendarFooterProps> = ({
  events,
  theme,
  mode = 'lengkap'
}) => {
  const isDark = theme === 'dark';

  // Konfigurasi teks adaptif sesuai mode kalender
  let sectionTitle = 'Hari Libur & Peringatan Bulan Ini';
  let sectionSubtitle = `${events.length} Peristiwa Tercatat`;
  let emptyMessage = 'Tidak ada hari libur nasional atau peringatan resmi khusus pada bulan ini.';
  let bottomNote = '✦ Panca Wara (Pasaran Jawa): Legi, Pahing, Pon, Wage, Kliwon • Kalender Nusantara 1582 - 9999';

  if (mode === 'hijriyah') {
    sectionTitle = 'Peringatan & Hari Besar Islam (Hijriyah)';
    sectionSubtitle = `${events.length} Hari Besar & Amalan Sunnah`;
    emptyMessage = 'Tidak ada peringatan khusus atau hari besar Hijriyah pada bulan ini.';
    bottomNote = '✦ Hisab Hakiki Kitab Sullamun Nayyirain • Lembaga Falakiyah Almansuriyah Jakarta';
  } else if (mode === 'jawa') {
    sectionTitle = 'Peringatan Tradisi Jawa Sultan Agungan & Hijriyah';
    sectionSubtitle = `${events.length} Hajad Dalem & Upacara Tradisi`;
    emptyMessage = 'Tidak ada upacara tradisi khusus Jawa atau Hijriyah pada bulan ini.';
    bottomNote = '✦ Warsa Jawa Sultan Agungan • Panca Wara: Legi, Pahing, Pon, Wage, Kliwon • Windu Sancaya';
  } else if (mode === 'julian') {
    sectionTitle = 'Peringatan & Penanda Kalender Julian';
    sectionSubtitle = `${events.length} Penanda Kalender Julius`;
    emptyMessage = 'Tidak ada penanda khusus kalender Julian pada bulan ini.';
    bottomNote = '✦ Kalender Julian diresmikan Julius Caesar 45 SM • Selisih 13 Hari dengan Gregorian';
  } else if (mode === 'tionghoa') {
    sectionTitle = 'Perayaan & Festival Tradisi Tionghoa (Imlek)';
    sectionSubtitle = `${events.length} Festival Tradisional Tionghoa`;
    emptyMessage = 'Tidak ada festival besar penanggalan Tionghoa pada bulan ini.';
    bottomNote = '✦ Tradisi Lunisolar Tionghoa Nusantara • Siklus 12 Zodiak Shio & 5 Elemen Batang Langit';
  } else if (mode === 'saka') {
    sectionTitle = 'Hari Suci & Rahina Kalender Saka Bali';
    sectionSubtitle = `${events.length} Rahina & Hari Suci`;
    emptyMessage = 'Tidak ada hari suci khusus kalender Saka pada bulan ini.';
    bottomNote = '✦ Warsa Saka 78 M • Sasih Kasa hingga Asadha • Rahina Purnama & Tilem';
  } else if (mode === 'masehi') {
    sectionTitle = 'Hari Libur Nasional & Peringatan Masehi';
    sectionSubtitle = `${events.length} Hari Libur & Peringatan`;
    emptyMessage = 'Tidak ada hari libur nasional atau peringatan resmi pada bulan ini.';
    bottomNote = '✦ SKB 3 Menteri Hari Libur Nasional & Cuti Bersama Republik Indonesia';
  } else if (mode === 'lengkap') {
    sectionTitle = 'Hari Libur & Peringatan Lintas Budaya Nusantara';
    sectionSubtitle = `${events.length} Peristiwa Lintas Tradisi`;
    emptyMessage = 'Tidak ada hari libur atau peringatan khusus pada bulan ini.';
    bottomNote = '✦ Harmoni 6 Sistem Penanggalan: Masehi • Hijriyah • Jawa • Tionghoa • Saka • Julian';
  }

  return (
    <div
      className={`w-full border-t-2 border-stone-900 p-4 sm:p-5 select-none transition-colors ${
        isDark ? 'bg-[#181818] text-stone-200' : 'bg-white text-stone-800'
      }`}
    >
      <div className="space-y-3 text-xs sm:text-sm">
        {/* Header Bagian Keterangan */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${
              mode === 'hijriyah'
                ? 'text-emerald-500'
                : mode === 'jawa'
                ? 'text-amber-500'
                : mode === 'tionghoa'
                ? 'text-red-500'
                : mode === 'saka'
                ? 'text-purple-500'
                : 'text-red-600'
            }`} />
            <h4 className="font-extrabold uppercase tracking-wider text-xs sm:text-sm text-stone-900 dark:text-stone-100">
              {sectionTitle}
            </h4>
          </div>
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
            {sectionSubtitle}
          </span>
        </div>

        {/* Daftar Hari Libur & Peringatan dalam 2 Kolom Rapi */}
        {events.length === 0 ? (
          <div className="p-3 bg-stone-50 dark:bg-stone-900/50 rounded-lg text-stone-500 text-xs italic text-center">
            {emptyMessage}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {events.map((ev, i) => {
              // Badge asal budaya jika di mode lengkap
              let cultureBadge = '';
              let badgeBg = 'bg-stone-700 text-white';
              if (ev.origin === 'hijriyah' || ev.type === 'islamic' || ev.type === 'puasa') {
                cultureBadge = 'Hijriyah';
                badgeBg = 'bg-emerald-700 text-white';
              } else if (ev.origin === 'jawa' || ev.type === 'jawa') {
                cultureBadge = 'Jawa';
                badgeBg = 'bg-amber-700 text-white';
              } else if (ev.origin === 'tionghoa' || ev.type === 'tionghoa') {
                cultureBadge = 'Tionghoa';
                badgeBg = 'bg-red-700 text-white';
              } else if (ev.origin === 'saka' || ev.type === 'saka') {
                cultureBadge = 'Saka';
                badgeBg = 'bg-purple-700 text-white';
              } else if (ev.origin === 'julian' || ev.type === 'julian') {
                cultureBadge = 'Julian';
                badgeBg = 'bg-blue-700 text-white';
              }

              return (
                <div
                  key={`${ev.dayNum}-${ev.title}-${i}`}
                  className="flex items-start gap-2.5 py-1 px-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
                >
                  <span
                    className={`font-black min-w-[55px] sm:min-w-[65px] shrink-0 ${
                      ev.isHoliday
                        ? isDark ? 'text-red-400 font-extrabold' : 'text-[#d32f2f]'
                        : isDark ? 'text-amber-400' : 'text-stone-700'
                    }`}
                  >
                    Tgl {ev.dayNum} :
                  </span>
                  <div className="flex-1 leading-snug">
                    <span
                      className={`font-semibold ${
                        ev.isHoliday
                          ? isDark ? 'text-red-300 font-bold' : 'text-stone-950 font-bold'
                          : 'text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      {ev.title}
                    </span>
                    {ev.isHoliday && (
                      <span className="ml-1.5 inline-block text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-red-600 text-white">
                        Libur Nasional
                      </span>
                    )}
                    {mode === 'lengkap' && cultureBadge && !ev.isHoliday && (
                      <span className={`ml-1.5 inline-block text-[8.5px] font-bold px-1.5 py-0.2 rounded ${badgeBg}`}>
                        {cultureBadge}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Catatan Kaki */}
        <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400">
          <span>{bottomNote}</span>
        </div>
      </div>
    </div>
  );
};
