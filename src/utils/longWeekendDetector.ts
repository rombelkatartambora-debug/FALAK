/**
 * Deteksi Long Weekend & Harpitnas (Hari Kejepit Nasional)
 * Menganalisis kalender libur nasional bulan aktif dan memberikan rekomendasi cuti
 */

import { LongWeekendItem } from '../types/calendar';
import { getEventsForDate, getHijriDate } from './calendarMath';

export function detectLongWeekendsAndHarpitnas(year: number, month: number): LongWeekendItem[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const items: LongWeekendItem[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(year, month - 1, d, 12, 0, 0);
    const dayOfWeek = curDate.getDay(); // 0 = Ahad, 1 = Senin, ..., 5 = Jumat, 6 = Sabtu
    const hijri = getHijriDate(curDate);
    const events = getEventsForDate(curDate, hijri);
    const holiday = events.find((e) => e.isHoliday);

    if (!holiday) continue;

    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${year}-${pad(month)}-${pad(d)}`;

    // 1. Libur jatuh di hari Jumat: Long Weekend 3 Hari (Jumat, Sabtu, Ahad)
    if (dayOfWeek === 5) {
      const endSunday = Math.min(daysInMonth, d + 2);
      items.push({
        type: 'long_weekend',
        startDate: dateStr,
        endDate: `${year}-${pad(month)}-${pad(endSunday)}`,
        daysCount: 3,
        holidayTitle: holiday.title,
        holidayDayName: 'Jumat',
        recommendation: `Libur panjang 3 hari (Jumat s/d Ahad)! Cocok untuk mudik singkat, liburan keluarga, atau istirahat total tanpa perlu ambil cuti kerja.`
      });
    }

    // 2. Libur jatuh di hari Senin: Long Weekend 3 Hari (Sabtu, Ahad, Senin)
    else if (dayOfWeek === 1) {
      const startSat = Math.max(1, d - 2);
      items.push({
        type: 'long_weekend',
        startDate: `${year}-${pad(month)}-${pad(startSat)}`,
        endDate: dateStr,
        daysCount: 3,
        holidayTitle: holiday.title,
        holidayDayName: 'Senin',
        recommendation: `Libur panjang 3 hari (Sabtu s/d Senin)! Nikmati liburan akhir pekan yang lebih santai tanpa tergesa-gesa.`
      });
    }

    // 3. Libur jatuh di hari Kamis: Harpitnas (Jumat Hari Kejepit)
    else if (dayOfWeek === 4) {
      const jumatDate = d + 1;
      const jumatStr = `${year}-${pad(month)}-${pad(jumatDate)}`;
      const sunDate = Math.min(daysInMonth, d + 3);
      items.push({
        type: 'harpitnas',
        startDate: dateStr,
        endDate: `${year}-${pad(month)}-${pad(sunDate)}`,
        daysCount: 4,
        holidayTitle: holiday.title,
        holidayDayName: 'Kamis',
        cutiDate: jumatStr,
        recommendation: `Harpitnas Emas! Cukup ambil 1 hari cuti di hari Jumat (${jumatDate} ${getMonthName(month)}), Anda mendapatkan 4 hari libur berturut-turut (Kamis s/d Ahad).`
      });
    }

    // 4. Libur jatuh di hari Selasa: Harpitnas (Senin Hari Kejepit)
    else if (dayOfWeek === 2) {
      const seninDate = d - 1;
      const seninStr = `${year}-${pad(month)}-${pad(seninDate)}`;
      const satDate = Math.max(1, d - 3);
      items.push({
        type: 'harpitnas',
        startDate: `${year}-${pad(month)}-${pad(satDate)}`,
        endDate: dateStr,
        daysCount: 4,
        holidayTitle: holiday.title,
        holidayDayName: 'Selasa',
        cutiDate: seninStr,
        recommendation: `Harpitnas Strategis! Ambil 1 hari cuti di hari Senin (${seninDate} ${getMonthName(month)}), langsung dapat libur 4 hari (Sabtu s/d Selasa).`
      });
    }
  }

  // Hilangkan duplikasi jika ada
  return items;
}

function getMonthName(m: number): string {
  const names = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return names[m - 1] || '';
}
