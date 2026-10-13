import React, { useState } from 'react';
import {
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  getHijriDate,
  getJawaDate,
  getJulianDate,
  getTionghoaDate,
  getSakaDate,
  getPasaran,
  toArabicNumeral,
  NAMA_HARI,
  formatIndonesianDateWithAhad
} from '../utils/calendarMath';

export const CalendarTriCultureView: React.FC = () => {
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const parsedDate = new Date(selectedDateStr + 'T12:00:00');
  const isValid = !isNaN(parsedDate.getTime());

  const pasaran = isValid ? getPasaran(parsedDate) : '';
  const hijri = isValid ? getHijriDate(parsedDate) : null;
  const jawa = isValid && hijri ? getJawaDate(parsedDate, hijri) : null;
  const julian = isValid ? getJulianDate(parsedDate) : null;
  const tionghoa = isValid ? getTionghoaDate(parsedDate) : null;
  const saka = isValid && hijri ? getSakaDate(parsedDate, hijri) : null;

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 border border-emerald-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-emerald-700/30 shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-400/30">
                Sistem Penanggalan Falakiyah Nusantara
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Sinkronisasi 6 Sistem Kalender Nusantara & Dunia
            </h2>
            <p className="text-xs text-stone-300 mt-0.5">
              Integrasi Masehi, Hijriyah Qamariyah, Jawa Kasultanan, Julian, Tionghoa Imlek &amp; Saka Bali
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 p-2 bg-black/40 rounded-2xl border border-white/10 text-xs">
          <span className="text-stone-400 font-semibold pl-2">Pilih Tanggal:</span>
          <input
            type="date"
            value={selectedDateStr}
            onChange={(e) => setSelectedDateStr(e.target.value)}
            className="bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Result Cards Grid - 6 Sistem Penanggalan */}
      {isValid && hijri && jawa && julian && tionghoa && saka && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Penanggalan Masehi */}
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-blue-400">
                1. Penanggalan Masehi (Gregorian)
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400 text-xs">Hari &amp; Tanggal:</span>
              <div className="text-xl font-black text-white">
                {formatIndonesianDateWithAhad(parsedDate, { includeWeekday: true, monthFormat: 'long' })}
              </div>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-400 space-y-1">
              <div>Sistem: Solar (Syamsiyah / Matahari)</div>
              <div>Hari Pasaran: {pasaran}</div>
            </div>
          </div>

          {/* Card 2: Penanggalan Hijriyah */}
          <div className="p-6 rounded-3xl bg-stone-900 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                2. Penanggalan Hijriyah (Sullamun Nayyirain)
              </span>
              <span className="text-xs font-serif text-emerald-300 font-bold">
                {toArabicNumeral(hijri.day)} {hijri.monthName} {toArabicNumeral(hijri.year)}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400 text-xs">Tanggal Hijriyah:</span>
              <div className="text-xl font-black text-emerald-300">
                {hijri.day} {hijri.monthName} {hijri.year} H
              </div>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-400 space-y-1">
              <div>Sistem: Lunar Hakiki (Qamariyah)</div>
              <div>Bulan ke-{hijri.month + 1} ({hijri.monthName})</div>
            </div>
          </div>

          {/* Card 3: Penanggalan Tradisional Jawa Kasultanan */}
          <div className="p-6 rounded-3xl bg-stone-900 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-amber-400">
                3. Penanggalan Jawa Sultan Agungan
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400 text-xs">Hari &amp; Pasaran:</span>
              <div className="text-xl font-black text-amber-300">
                {NAMA_HARI[parsedDate.getDay()]} {pasaran}
              </div>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-400 space-y-1">
              <div>Tahun Jawa: {jawa.year} AJ ({jawa.windu})</div>
              <div>Bulan Jawa: {jawa.monthName} ({jawa.day})</div>
            </div>
          </div>

          {/* Card 4: Penanggalan Julian */}
          <div className="p-6 rounded-3xl bg-stone-900 border border-sky-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-sky-400">
                4. Penanggalan Julian (Julius Caesar)
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400 text-xs">Tanggal Julian:</span>
              <div className="text-xl font-black text-sky-300">
                {julian.day} {julian.monthName} {julian.year} Julian
              </div>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-400 space-y-1">
              <div>Julian Day Number (JDN): {julian.julianDayNumber}</div>
              <div>Selisih: -13 Hari dari Kalender Gregorian</div>
            </div>
          </div>

          {/* Card 5: Penanggalan Tionghoa */}
          <div className="p-6 rounded-3xl bg-stone-900 border border-red-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-red-400">
                5. Penanggalan Tionghoa (Imlek &amp; Kongzili)
              </span>
              <span className="text-xs font-bold text-red-300">
                {tionghoa.chineseDayName.split(' ')[0]}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400 text-xs">Tanggal Imlek:</span>
              <div className="text-xl font-black text-red-300">
                {tionghoa.day} {tionghoa.monthName} {tionghoa.year}
              </div>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-400 space-y-1">
              <div>Zodiak Shio: {tionghoa.shio}</div>
              <div>Bulan: {tionghoa.monthName} ({tionghoa.chineseMonthName})</div>
            </div>
          </div>

          {/* Card 6: Penanggalan Saka Bali */}
          <div className="p-6 rounded-3xl bg-stone-900 border border-purple-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-purple-400">
                6. Penanggalan Saka Bali &amp; Hindu
              </span>
              <span className="text-xs font-bold text-purple-300">
                {saka.faseBulan}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400 text-xs">Tanggal Saka:</span>
              <div className="text-xl font-black text-purple-300">
                Sasih {saka.sasihName} ({saka.day}), {saka.year} Saka
              </div>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-400 space-y-1">
              <div>Fase: {saka.faseBulan} {saka.faseBulanHari !== 15 ? saka.faseBulanHari : ''}</div>
              <div>Sasih ke-{saka.sasihIndex + 1} ({saka.sasihName})</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
