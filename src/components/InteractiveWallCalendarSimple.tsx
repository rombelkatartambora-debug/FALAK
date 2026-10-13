import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  RotateCcw,
  Compass,
  Palette,
  Check,
  CalendarCheck2,
  Moon,
  Sun
} from 'lucide-react';
import { 
  DayData, 
  CalendarTheme, 
  CalendarFilters,
  CalendarViewMode 
} from '../types/calendar';
import { 
  NAMA_BULAN, 
  BULAN_HIJRIYAH,
  BULAN_HIJRIYAH_DETAIL,
  BULAN_JAWA,
  BULAN_JULIAN,
  BULAN_TIONGHOA,
  SASIH_SAKA,
  getHijriDate, 
  getJawaDate, 
  getJulianDate,
  getTionghoaDate,
  getSakaDate,
  getPasaran, 
  getNeptuInfo,
  checkAyyamulBidh,
  checkSeninKamis,
  checkHaramPuasa,
  getEventsForDate,
  getHijriMonthRange,
  getJulianMonthRange,
  getTionghoaMonthRange,
  getSakaMonthRange,
  getChineseDayNameHokkien
} from '../utils/calendarMath';
import { FalakMonthRecord } from '../utils/almansuriyahFalakData';
import { CalendarHeader } from './CalendarHeader';
import { DaysGrid } from './DaysGrid';
import { CalendarFooter } from './CalendarFooter';
import { CalendarExportSection } from './CalendarExportSection';
import { DayDetailModal } from './DayDetailModal';

interface InteractiveWallCalendarSimpleProps {
  currentRecord: FalakMonthRecord;
  onOpenReport: (tabKey: 'ringkas' | 'detail' | 'matriks') => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const InteractiveWallCalendarSimple: React.FC<InteractiveWallCalendarSimpleProps> = ({
  currentRecord,
  onOpenReport,
  onShowToast
}) => {
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  // Default tanggal saat ini
  const today = useMemo(() => new Date(), []);
  const todayHijri = useMemo(() => getHijriDate(today), [today]);
  const todayJulian = useMemo(() => getJulianDate(today), [today]);
  const todayTionghoa = useMemo(() => getTionghoaDate(today), [today]);
  const todaySaka = useMemo(() => getSakaDate(today, todayHijri), [today, todayHijri]);
  
  // State Bulan & Tahun Masehi (1-12)
  const [month, setMonth] = useState<number>(() => today.getMonth() + 1);
  const [year, setYear] = useState<number>(() => today.getFullYear());

  // State Bulan & Tahun Hijriyah (1-12)
  const [hijriMonth, setHijriMonth] = useState<number>(() => todayHijri.month + 1);
  const [hijriYear, setHijriYear] = useState<number>(() => todayHijri.year);

  // State Bulan & Tahun Jawa (1-12)
  const [jawaMonth, setJawaMonth] = useState<number>(() => todayHijri.month + 1);
  const [jawaYear, setJawaYear] = useState<number>(() => todayHijri.year + 512);

  // State Bulan & Tahun Julian (1-12)
  const [julianMonth, setJulianMonth] = useState<number>(() => todayJulian.month);
  const [julianYear, setJulianYear] = useState<number>(() => todayJulian.year);

  // State Bulan & Tahun Tionghoa (1-12)
  const [tionghoaMonth, setTionghoaMonth] = useState<number>(() => todayTionghoa.month);
  const [tionghoaYear, setTionghoaYear] = useState<number>(() => todayTionghoa.year);

  // State Bulan & Tahun Saka (1-12)
  const [sakaMonth, setSakaMonth] = useState<number>(() => todaySaka.sasihIndex + 1);
  const [sakaYear, setSakaYear] = useState<number>(() => todaySaka.year);

  // State 7 Mode Kalender Dinding (Lengkap, Masehi, Hijriyah, Jawa, Julian, Tionghoa, Saka)
  const [viewMode, setViewMode] = useState<CalendarViewMode>('lengkap');

  // State Tema Kalender Dinding Asli
  const [theme, setTheme] = useState<CalendarTheme>('classic');

  // State Filter Kalender
  const [filters, setFilters] = useState<CalendarFilters>({
    showAyyamulBidh: true,
    showSeninKamis: true,
    showHolidays: true,
    showGoogleEvents: false
  });

  // State Modal Detail Hari
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState<boolean>(false);

  // Sinkronisasi otomatis bulan dengan data hisab aktif saat currentRecord berubah
  useEffect(() => {
    if (currentRecord?.bulanHijriyahKe && currentRecord?.tahunHijriyah) {
      setHijriMonth(currentRecord.bulanHijriyahKe);
      setHijriYear(currentRecord.tahunHijriyah);
      setJawaMonth(currentRecord.bulanHijriyahKe);
      setJawaYear(currentRecord.tahunHijriyah + 512);
    }
    if (currentRecord?.tanggalMasehiIjtima) {
      const raw = currentRecord.tanggalMasehiIjtima.toUpperCase();
      const monthNames = [
        'JANUARI', 'FEBRUARI', 'PEBRUARI', 'MARET', 'APRIL', 'MEI', 
        'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
      ];
      let mIdx = -1;
      for (let i = 0; i < monthNames.length; i++) {
        if (raw.includes(monthNames[i])) {
          mIdx = i === 2 ? 2 : i > 2 ? i : i + 1;
          break;
        }
      }
      const yearMatch = raw.match(/(\d{4})/);
      const parsedYear = yearMatch ? parseInt(yearMatch[1], 10) : null;
      if (mIdx !== -1 && parsedYear) {
        setMonth(mIdx);
        setYear(parsedYear);
      }
    }
  }, [currentRecord.bulanHijriyahKe, currentRecord.tahunHijriyah, currentRecord.tanggalMasehiIjtima]);

  // Navigasi Bulan adaptif sesuai mode aktif
  const handlePrevMonth = () => {
    if (viewMode === 'hijriyah') {
      if (hijriMonth === 1) {
        setHijriMonth(12);
        setHijriYear(prev => prev - 1);
      } else {
        setHijriMonth(prev => prev - 1);
      }
    } else if (viewMode === 'jawa') {
      if (jawaMonth === 1) {
        setJawaMonth(12);
        setJawaYear(prev => prev - 1);
      } else {
        setJawaMonth(prev => prev - 1);
      }
    } else if (viewMode === 'julian') {
      if (julianMonth === 1) {
        setJulianMonth(12);
        setJulianYear(prev => prev - 1);
      } else {
        setJulianMonth(prev => prev - 1);
      }
    } else if (viewMode === 'tionghoa') {
      if (tionghoaMonth === 1) {
        setTionghoaMonth(12);
        setTionghoaYear(prev => prev - 1);
      } else {
        setTionghoaMonth(prev => prev - 1);
      }
    } else if (viewMode === 'saka') {
      if (sakaMonth === 1) {
        setSakaMonth(12);
        setSakaYear(prev => prev - 1);
      } else {
        setSakaMonth(prev => prev - 1);
      }
    } else {
      if (month === 1) {
        setMonth(12);
        setYear(prev => prev - 1);
      } else {
        setMonth(prev => prev - 1);
      }
    }
  };

  const handleNextMonth = () => {
    if (viewMode === 'hijriyah') {
      if (hijriMonth === 12) {
        setHijriMonth(1);
        setHijriYear(prev => prev + 1);
      } else {
        setHijriMonth(prev => prev + 1);
      }
    } else if (viewMode === 'jawa') {
      if (jawaMonth === 12) {
        setJawaMonth(1);
        setJawaYear(prev => prev + 1);
      } else {
        setJawaMonth(prev => prev + 1);
      }
    } else if (viewMode === 'julian') {
      if (julianMonth === 12) {
        setJulianMonth(1);
        setJulianYear(prev => prev + 1);
      } else {
        setJulianMonth(prev => prev + 1);
      }
    } else if (viewMode === 'tionghoa') {
      if (tionghoaMonth === 12) {
        setTionghoaMonth(1);
        setTionghoaYear(prev => prev + 1);
      } else {
        setTionghoaMonth(prev => prev + 1);
      }
    } else if (viewMode === 'saka') {
      if (sakaMonth === 12) {
        setSakaMonth(1);
        setSakaYear(prev => prev + 1);
      } else {
        setSakaMonth(prev => prev + 1);
      }
    } else {
      if (month === 12) {
        setMonth(1);
        setYear(prev => prev + 1);
      } else {
        setMonth(prev => prev + 1);
      }
    }
  };

  const handleSetToday = () => {
    const now = new Date();
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
    const h = getHijriDate(now);
    setHijriMonth(h.month + 1);
    setHijriYear(h.year);
    setJawaMonth(h.month + 1);
    setJawaYear(h.year + 512);
    const jul = getJulianDate(now);
    setJulianMonth(jul.month);
    setJulianYear(jul.year);
    const tiong = getTionghoaDate(now);
    setTionghoaMonth(tiong.month);
    setTionghoaYear(tiong.year);
    const sk = getSakaDate(now, h);
    setSakaMonth(sk.sasihIndex + 1);
    setSakaYear(sk.year);
    onShowToast('Menampilkan kalender hari ini');
  };

  const handleSyncToHisabRecord = () => {
    if (currentRecord?.bulanHijriyahKe && currentRecord?.tahunHijriyah) {
      setHijriMonth(currentRecord.bulanHijriyahKe);
      setHijriYear(currentRecord.tahunHijriyah);
      setJawaMonth(currentRecord.bulanHijriyahKe);
      setJawaYear(currentRecord.tahunHijriyah + 512);
    }
    if (currentRecord?.tanggalMasehiIjtima) {
      const raw = currentRecord.tanggalMasehiIjtima.toUpperCase();
      const monthNames = [
        'JANUARI', 'FEBRUARI', 'PEBRUARI', 'MARET', 'APRIL', 'MEI', 
        'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
      ];
      let mIdx = -1;
      for (let i = 0; i < monthNames.length; i++) {
        if (raw.includes(monthNames[i])) {
          mIdx = i === 2 ? 2 : i > 2 ? i : i + 1;
          break;
        }
      }
      const yearMatch = raw.match(/(\d{4})/);
      const parsedYear = yearMatch ? parseInt(yearMatch[1], 10) : null;
      if (mIdx !== -1 && parsedYear) {
        setMonth(mIdx);
        setYear(parsedYear);
      }
    }
    onShowToast(`Kalender disinkronkan ke hisab ${currentRecord.namaBulanHijriyah} ${currentRecord.tahunHijriyah} H`);
  };

  // Kalkulasi Kotak Tanggal Kalender Sesuai Mode
  const calendarDays = useMemo<DayData[]>(() => {
    const days: DayData[] = [];

    // Helper untuk membuat objek DayData lengkap
    const createDayData = (dDate: Date, isCurrent: boolean, overrideDayNum?: number): DayData => {
      const dayOfWeek = dDate.getDay();
      const hijri = getHijriDate(dDate, 0);
      const jawa = getJawaDate(dDate, hijri);
      const julian = getJulianDate(dDate);
      const tionghoa = getTionghoaDate(dDate);
      const saka = getSakaDate(dDate, hijri);
      const pasaran = getPasaran(dDate);
      const neptu = getNeptuInfo(dDate, pasaran);
      const isAyyam = checkAyyamulBidh(hijri);
      const isHaram = checkHaramPuasa(hijri);
      const isSk = checkSeninKamis(dayOfWeek, isHaram);
      
      // KRUSIAL: Filter events strictly according to viewMode!
      // In 'hijriyah': ONLY Hijriyah events (No Hari Pers Nasional)
      // In 'jawa': ONLY Jawa and Hijriyah events (No Hari Pers Nasional)
      const holidays = getEventsForDate(dDate, hijri, viewMode);

      const isToday = 
        today.getFullYear() === dDate.getFullYear() && 
        today.getMonth() === dDate.getMonth() && 
        today.getDate() === dDate.getDate();

      return {
        date: dDate,
        dayNum: overrideDayNum ?? dDate.getDate(),
        monthIdx: dDate.getMonth(),
        year: dDate.getFullYear(),
        isCurrentMonth: isCurrent,
        isToday,
        dayOfWeek,
        pasaran,
        hijri,
        jawa,
        julian,
        tionghoa,
        saka,
        neptu,
        isAyyamulBidh: isAyyam,
        isSeninKamis: isSk,
        isHaramPuasa: isHaram,
        holidays,
        googleEvents: [],
        personalNotes: []
      };
    };

    if (viewMode === 'hijriyah' || viewMode === 'jawa') {
      // PENANGGALAN BULAN HIJRIYAH / JAWA: AWAL BULAN DIMULAI TANGGAL 1
      const activeHMonthIdx = viewMode === 'hijriyah' ? hijriMonth - 1 : jawaMonth - 1;
      const activeHYear = viewMode === 'hijriyah' ? hijriYear : (jawaYear - 512);
      const { startDate, daysInMonth } = getHijriMonthRange(activeHYear, activeHMonthIdx);

      const firstDayIndex = startDate.getDay(); // 0 = Ahad .. 6 = Sabtu

      // Hari pelengkap sebelum tanggal 1
      for (let i = firstDayIndex - 1; i >= 0; i--) {
        const prevDate = new Date(startDate.getTime() - (i + 1) * 86400000);
        days.push(createDayData(prevDate, false));
      }

      // Tanggal 1 s.d. Akhir Bulan Hijriyah/Jawa (Aktif)
      for (let d = 1; d <= daysInMonth; d++) {
        const curDate = new Date(startDate.getTime() + (d - 1) * 86400000);
        const dayObj = createDayData(curDate, true);
        days.push({
          ...dayObj,
          hijri: { ...dayObj.hijri, day: d },
          jawa: { ...dayObj.jawa, day: d }
        });
      }

      // Hari pelengkap setelah akhir bulan
      const remaining = (7 - (days.length % 7)) % 7;
      for (let nextDay = 1; nextDay <= remaining; nextDay++) {
        const nextDate = new Date(startDate.getTime() + (daysInMonth - 1 + nextDay) * 86400000);
        days.push(createDayData(nextDate, false));
      }

      return days;
    } else if (viewMode === 'julian') {
      // PENANGGALAN BULAN JULIAN: AWAL BULAN DIMULAI DARI TANGGAL 1 JULIAN
      const { startDate, daysInMonth } = getJulianMonthRange(julianYear, julianMonth);
      const firstDayIndex = startDate.getDay(); // 0 = Ahad .. 6 = Sabtu

      // Hari pelengkap sebelum tanggal 1 Julian
      for (let i = firstDayIndex - 1; i >= 0; i--) {
        const prevDate = new Date(startDate.getTime() - (i + 1) * 86400000);
        days.push(createDayData(prevDate, false));
      }

      // Tanggal 1 s.d. Akhir Bulan Julian (28, 29, 30, atau 31 Hari)
      for (let d = 1; d <= daysInMonth; d++) {
        const curDate = new Date(startDate.getTime() + (d - 1) * 86400000);
        const dayObj = createDayData(curDate, true, d);
        days.push({
          ...dayObj,
          julian: dayObj.julian ? { ...dayObj.julian, day: d } : undefined
        });
      }

      // Hari pelengkap setelah akhir bulan Julian
      const remaining = (7 - (days.length % 7)) % 7;
      for (let nextDay = 1; nextDay <= remaining; nextDay++) {
        const nextDate = new Date(startDate.getTime() + (daysInMonth - 1 + nextDay) * 86400000);
        days.push(createDayData(nextDate, false));
      }

      return days;
    } else if (viewMode === 'tionghoa') {
      // PENANGGALAN BULAN TIONGHOA: AWAL BULAN DIMULAI DARI TANGGAL 1 (初一 / CE IT)
      const { startDate, daysInMonth } = getTionghoaMonthRange(tionghoaYear, tionghoaMonth);
      const firstDayIndex = startDate.getDay(); // 0 = Ahad .. 6 = Sabtu

      // Hari pelengkap sebelum tanggal 1 (初一)
      for (let i = firstDayIndex - 1; i >= 0; i--) {
        const prevDate = new Date(startDate.getTime() - (i + 1) * 86400000);
        days.push(createDayData(prevDate, false));
      }

      // Tanggal 1 s.d. Akhir Bulan Tionghoa (29 atau 30 Hari, Cap Go di Tgl 15)
      for (let d = 1; d <= daysInMonth; d++) {
        const curDate = new Date(startDate.getTime() + (d - 1) * 86400000);
        const dayObj = createDayData(curDate, true, d);
        days.push({
          ...dayObj,
          tionghoa: dayObj.tionghoa ? { 
            ...dayObj.tionghoa, 
            day: d,
            chineseDayName: getChineseDayNameHokkien(d)
          } : undefined
        });
      }

      // Hari pelengkap setelah akhir bulan Tionghoa
      const remaining = (7 - (days.length % 7)) % 7;
      for (let nextDay = 1; nextDay <= remaining; nextDay++) {
        const nextDate = new Date(startDate.getTime() + (daysInMonth - 1 + nextDay) * 86400000);
        days.push(createDayData(nextDate, false));
      }

      return days;
    } else if (viewMode === 'saka') {
      // PENANGGALAN BULAN SAKA: AWAL BULAN DIMULAI DARI TANGGAL 1 (PENANGGAL 1)
      const { startDate, daysInMonth } = getSakaMonthRange(sakaYear, sakaMonth - 1);
      const firstDayIndex = startDate.getDay(); // 0 = Ahad .. 6 = Sabtu

      // Hari pelengkap sebelum tanggal 1 (Penanggal 1)
      for (let i = firstDayIndex - 1; i >= 0; i--) {
        const prevDate = new Date(startDate.getTime() - (i + 1) * 86400000);
        days.push(createDayData(prevDate, false));
      }

      // Tanggal 1 s.d. Akhir Sasih Saka (Tgl 15 = Purnama, Tgl Akhir = Tilem)
      for (let d = 1; d <= daysInMonth; d++) {
        const curDate = new Date(startDate.getTime() + (d - 1) * 86400000);
        const dayObj = createDayData(curDate, true, d);

        let faseBulan: 'Penanggal' | 'Panglong' | 'Purnama' | 'Tilem' = 'Penanggal';
        let faseBulanHari = d;
        if (d === 15) {
          faseBulan = 'Purnama';
          faseBulanHari = 15;
        } else if (d === daysInMonth) {
          faseBulan = 'Tilem';
          faseBulanHari = 15;
        } else if (d > 15) {
          faseBulan = 'Panglong';
          faseBulanHari = d - 15;
        }

        days.push({
          ...dayObj,
          saka: dayObj.saka ? { 
            ...dayObj.saka, 
            day: d,
            faseBulan,
            faseBulanHari
          } : undefined
        });
      }

      // Hari pelengkap setelah akhir Sasih Saka
      const remaining = (7 - (days.length % 7)) % 7;
      for (let nextDay = 1; nextDay <= remaining; nextDay++) {
        const nextDate = new Date(startDate.getTime() + (daysInMonth - 1 + nextDay) * 86400000);
        days.push(createDayData(nextDate, false));
      }

      return days;
    }

    // PENANGGALAN MASEHI / LENGKAP (GREGORIAN): AWAL BULAN DIMULAI TANGGAL 1
    const monthIdx = month - 1; // 0-indexed for Date
    const firstDayIndex = new Date(year, monthIdx, 1).getDay(); // 0 = Ahad .. 6 = Sabtu
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysInPrevMonth = new Date(year, monthIdx, 0).getDate();

    // Hari dari bulan sebelumnya
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, monthIdx - 1, dayNum);
      days.push(createDayData(prevDate, false));
    }

    // Hari dari bulan aktif
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(year, monthIdx, d);
      days.push(createDayData(curDate, true, d));
    }

    // Hari pelengkap bulan berikutnya agar kelipatan 7
    const remaining = (7 - (days.length % 7)) % 7;
    for (let nextDay = 1; nextDay <= remaining; nextDay++) {
      const nextDate = new Date(year, monthIdx + 1, nextDay);
      days.push(createDayData(nextDate, false, nextDay));
    }

    return days;
  }, [
    viewMode, 
    year, 
    month, 
    hijriYear, 
    hijriMonth, 
    jawaYear, 
    jawaMonth, 
    julianYear, 
    julianMonth, 
    tionghoaYear, 
    tionghoaMonth, 
    sakaYear, 
    sakaMonth, 
    today
  ]);

  // Header Teks Hijriyah
  const currentHijriHeader = useMemo(() => {
    if (viewMode === 'hijriyah') {
      return `${BULAN_HIJRIYAH[hijriMonth - 1] || 'Hijriyah'} ${hijriYear} H`;
    }
    const currentMonthDays = calendarDays.filter(d => d.isCurrentMonth);
    if (!currentMonthDays.length) return '';
    const hMonths = Array.from(new Set(currentMonthDays.map(d => d.hijri.monthName)));
    const hYears = Array.from(new Set(currentMonthDays.map(d => d.hijri.year)));
    return `${hMonths.join(' - ')} ${hYears.join(' / ')} H`;
  }, [calendarDays, viewMode, hijriMonth, hijriYear]);

  // Header Teks Jawa Kasultanan
  const currentJawaHeader = useMemo(() => {
    if (viewMode === 'jawa') {
      return `${BULAN_JAWA[jawaMonth - 1] || 'Jawa'} ${jawaYear} Jawa`;
    }
    const currentMonthDays = calendarDays.filter(d => d.isCurrentMonth);
    if (!currentMonthDays.length) return '';
    const jMonths = Array.from(new Set(currentMonthDays.map(d => d.jawa.monthName)));
    const jYears = Array.from(new Set(currentMonthDays.map(d => d.jawa.year)));
    return `${jMonths.join(' - ')} ${jYears.join(' / ')} Jawa`;
  }, [calendarDays, viewMode, jawaMonth, jawaYear]);

  // Header Teks Julian
  const currentJulianHeader = useMemo(() => {
    if (viewMode === 'julian') {
      return `${BULAN_JULIAN[julianMonth - 1] || 'Julian'} ${julianYear} Julian`;
    }
    const currentMonthDays = calendarDays.filter(d => d.isCurrentMonth && d.julian);
    if (!currentMonthDays.length) return '';
    const julMonths = Array.from(new Set(currentMonthDays.map(d => d.julian?.monthName)));
    const julYears = Array.from(new Set(currentMonthDays.map(d => d.julian?.year)));
    return `${julMonths.join(' - ')} ${julYears.join(' / ')} Julian`;
  }, [calendarDays, viewMode, julianMonth, julianYear]);

  // Header Teks Tionghoa
  const currentTionghoaHeader = useMemo(() => {
    if (viewMode === 'tionghoa') {
      const curT = BULAN_TIONGHOA[tionghoaMonth - 1] || BULAN_TIONGHOA[0];
      return `${curT.nama} (${curT.hanzi}) ${tionghoaYear} Kongzili`;
    }
    const currentMonthDays = calendarDays.filter(d => d.isCurrentMonth && d.tionghoa);
    if (!currentMonthDays.length) return '';
    const tMonths = Array.from(new Set(currentMonthDays.map(d => d.tionghoa?.monthName)));
    const tYears = Array.from(new Set(currentMonthDays.map(d => d.tionghoa?.year)));
    const shio = currentMonthDays[0]?.tionghoa?.shio || '';
    return `${tMonths.join(' - ')} ${tYears.join(' / ')} (${shio})`;
  }, [calendarDays, viewMode, tionghoaMonth, tionghoaYear]);

  // Header Teks Saka
  const currentSakaHeader = useMemo(() => {
    if (viewMode === 'saka') {
      const curS = SASIH_SAKA[sakaMonth - 1] || SASIH_SAKA[0];
      return `Sasih ${curS.nama} ${sakaYear} Saka`;
    }
    const currentMonthDays = calendarDays.filter(d => d.isCurrentMonth && d.saka);
    if (!currentMonthDays.length) return '';
    const sMonths = Array.from(new Set(currentMonthDays.map(d => d.saka?.sasihName)));
    const sYears = Array.from(new Set(currentMonthDays.map(d => d.saka?.year)));
    return `Sasih ${sMonths.join(' - ')} ${sYears.join(' / ')} Saka`;
  }, [calendarDays, viewMode, sakaMonth, sakaYear]);

  // Header Teks Masehi
  const currentMasehiHeader = useMemo(() => {
    const currentMonthDays = calendarDays.filter(d => d.isCurrentMonth);
    if (!currentMonthDays.length) return `${NAMA_BULAN[month - 1]} ${year}`;
    const mMonths = Array.from(new Set(currentMonthDays.map(d => NAMA_BULAN[d.date.getMonth()])));
    const mYears = Array.from(new Set(currentMonthDays.map(d => d.date.getFullYear())));
    return `${mMonths.join(' - ')} ${mYears.join(' / ')}`;
  }, [calendarDays, month, year]);

  // Daftar Events Bulan Ini untuk Footer Kalender
  const currentMonthEvents = useMemo(() => {
    const currentMonthDays = calendarDays.filter(d => d.isCurrentMonth);
    const list: Array<{ dayNum: number; title: string; isHoliday: boolean; type: string; origin?: string }> = [];
    for (const d of currentMonthDays) {
      for (const h of d.holidays) {
        list.push({
          dayNum: viewMode === 'hijriyah' 
            ? d.hijri.day 
            : viewMode === 'jawa' 
            ? d.jawa.day 
            : viewMode === 'julian' && d.julian
            ? d.julian.day
            : viewMode === 'tionghoa' && d.tionghoa
            ? d.tionghoa.day
            : viewMode === 'saka' && d.saka
            ? d.saka.day
            : d.dayNum,
          title: h.title,
          isHoliday: !!h.isHoliday,
          type: h.type,
          origin: h.origin
        });
      }
    }
    return list;
  }, [calendarDays, viewMode]);

  // Handler klik tanggal di grid
  const handleSelectDay = (day: DayData) => {
    setSelectedDay(day);
    setIsDayDetailOpen(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* 1. TOOLBAR KONTROL KALENDER & PEMILIH SISTEM PENANGGALAN */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
        {/* PILIHAN 7 VARIASI KALENDER DINDING */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-800">
          <div className="flex flex-wrap items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 w-full sm:w-auto">
            {[
              { id: 'lengkap', label: 'Lengkap', icon: '🌟' },
              { id: 'masehi', label: 'Masehi', icon: '📅' },
              { id: 'hijriyah', label: 'Hijriyah', icon: '🌙' },
              { id: 'jawa', label: 'Jawa', icon: '🌾' },
              { id: 'julian', label: 'Julian', icon: '🏛️' },
              { id: 'tionghoa', label: 'Tionghoa', icon: '🏮' },
              { id: 'saka', label: 'Saka', icon: '🪷' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setViewMode(m.id as CalendarViewMode);
                  onShowToast(`Menampilkan ${m.label}`);
                }}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  viewMode === m.id
                    ? m.id === 'hijriyah'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                      : m.id === 'jawa'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                      : m.id === 'tionghoa'
                      ? 'bg-red-600 text-white shadow-md shadow-red-950'
                      : m.id === 'saka'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                      : m.id === 'julian'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                      : 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Baris Atas: Pemilih Bulan/Tahun & Tombol Cepat */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Pemilih Bulan & Tahun Adaptif Sesuai Mode */}
          <div className="flex items-center gap-2">
            {viewMode === 'hijriyah' ? (
              <>
                <select
                  value={hijriMonth}
                  onChange={(e) => setHijriMonth(parseInt(e.target.value, 10))}
                  className="bg-stone-800 border border-stone-700 text-white font-bold text-xs sm:text-sm rounded-xl px-2.5 sm:px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {BULAN_HIJRIYAH_DETAIL.map((b) => (
                    <option key={b.no} value={b.no}>
                      {b.displayName}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={hijriYear}
                    onChange={(e) => setHijriYear(parseInt(e.target.value, 10) || hijriYear)}
                    className="w-20 sm:w-24 bg-stone-800 border border-stone-700 text-white font-mono font-bold text-xs sm:text-sm rounded-xl px-2.5 py-1.5 text-center focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-xs font-bold text-emerald-400">H</span>
                </div>
              </>
            ) : viewMode === 'jawa' ? (
              <>
                <select
                  value={jawaMonth}
                  onChange={(e) => setJawaMonth(parseInt(e.target.value, 10))}
                  className="bg-stone-800 border border-stone-700 text-white font-bold text-xs sm:text-sm rounded-xl px-2.5 sm:px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {BULAN_JAWA.map((nama, idx) => (
                    <option key={nama} value={idx + 1}>
                      {idx + 1}. {nama}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={jawaYear}
                    onChange={(e) => setJawaYear(parseInt(e.target.value, 10) || jawaYear)}
                    className="w-20 sm:w-24 bg-stone-800 border border-stone-700 text-white font-mono font-bold text-xs sm:text-sm rounded-xl px-2.5 py-1.5 text-center focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-xs font-bold text-amber-400">Jawa</span>
                </div>
              </>
            ) : viewMode === 'julian' ? (
              <>
                <select
                  value={julianMonth}
                  onChange={(e) => setJulianMonth(parseInt(e.target.value, 10))}
                  className="bg-stone-800 border border-stone-700 text-white font-bold text-xs sm:text-sm rounded-xl px-2.5 sm:px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {BULAN_JULIAN.map((nama, idx) => (
                    <option key={nama} value={idx + 1}>
                      {idx + 1}. {nama}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={julianYear}
                    onChange={(e) => setJulianYear(parseInt(e.target.value, 10) || julianYear)}
                    className="w-20 sm:w-24 bg-stone-800 border border-stone-700 text-white font-mono font-bold text-xs sm:text-sm rounded-xl px-2.5 py-1.5 text-center focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-xs font-bold text-blue-400">Julian</span>
                </div>
              </>
            ) : viewMode === 'tionghoa' ? (
              <>
                <select
                  value={tionghoaMonth}
                  onChange={(e) => setTionghoaMonth(parseInt(e.target.value, 10))}
                  className="bg-stone-800 border border-stone-700 text-white font-bold text-xs sm:text-sm rounded-xl px-2.5 sm:px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {BULAN_TIONGHOA.map((b) => (
                    <option key={b.no} value={b.no}>
                      {b.desc}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={tionghoaYear}
                    onChange={(e) => setTionghoaYear(parseInt(e.target.value, 10) || tionghoaYear)}
                    className="w-24 sm:w-28 bg-stone-800 border border-stone-700 text-white font-mono font-bold text-xs sm:text-sm rounded-xl px-2.5 py-1.5 text-center focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-xs font-bold text-red-400">Kongzili</span>
                </div>
              </>
            ) : viewMode === 'saka' ? (
              <>
                <select
                  value={sakaMonth}
                  onChange={(e) => setSakaMonth(parseInt(e.target.value, 10))}
                  className="bg-stone-800 border border-stone-700 text-white font-bold text-xs sm:text-sm rounded-xl px-2.5 sm:px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {SASIH_SAKA.map((s) => (
                    <option key={s.no} value={s.no}>
                      {s.desc}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={sakaYear}
                    onChange={(e) => setSakaYear(parseInt(e.target.value, 10) || sakaYear)}
                    className="w-20 sm:w-24 bg-stone-800 border border-stone-700 text-white font-mono font-bold text-xs sm:text-sm rounded-xl px-2.5 py-1.5 text-center focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-xs font-bold text-purple-400">Saka</span>
                </div>
              </>
            ) : (
              <>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                  className="bg-stone-800 border border-stone-700 text-white font-bold text-xs sm:text-sm rounded-xl px-2.5 sm:px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {NAMA_BULAN.map((nama, idx) => (
                    <option key={nama} value={idx + 1}>
                      {nama}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10) || year)}
                  className="w-20 sm:w-24 bg-stone-800 border border-stone-700 text-white font-mono font-bold text-xs sm:text-sm rounded-xl px-2.5 py-1.5 text-center focus:outline-none focus:border-amber-500"
                />
              </>
            )}

            <button
              onClick={handleSetToday}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Hari Ini</span>
            </button>
          </div>

          {/* Pemilih Tema Kalender Dinding Asli */}
          <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
            <span className="text-[11px] font-bold text-stone-400 px-1.5 flex items-center gap-1 hidden md:flex">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Tema:</span>
            </span>

            {[
              { id: 'classic', label: 'Klasik', icon: '🏛️' },
              { id: 'dark', label: 'Dark', icon: '🌙' },
              { id: 'batik', label: 'Batik', icon: '🍂' },
              { id: 'islamic', label: 'Islamic', icon: '🕌' },
              { id: 'keraton', label: 'Keraton', icon: '👑' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as CalendarTheme)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  theme === t.id
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title={`Tema ${t.label}`}
              >
                <span>{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Baris Bawah: Banner Sinkronisasi Hisab Falak */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-black uppercase tracking-wider">
              Hisab Almansuriyah
            </span>
            <span className="text-stone-300 font-medium">
              Bulan ke-{currentRecord.bulanHijriyahKe} ({currentRecord.namaBulanHijriyah}) {currentRecord.tahunHijriyah} H
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncToHisabRecord}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold border border-amber-600/30 transition-colors cursor-pointer flex items-center gap-1"
            >
              <CalendarCheck2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Lihat Bulan Hisab Ini</span>
            </button>

            <button
              onClick={() => onOpenReport('ringkas')}
              className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Buka Hasil Ringkas &amp; Matriks</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. POSTER KALENDER DINDING */}
      <div
        id="kalender-utama"
        ref={calendarContainerRef}
        className={`calendar-container w-full rounded-2xl overflow-hidden shadow-2xl border-2 transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-[#121212] border-stone-700 shadow-stone-950/80'
            : theme === 'batik'
            ? 'bg-[#faf6f0] border-amber-900 shadow-stone-950/80'
            : theme === 'islamic'
            ? 'bg-[#f0fbf4] border-emerald-900 shadow-stone-950/80'
            : theme === 'keraton'
            ? 'bg-[#211130] border-amber-600 shadow-stone-950/80'
            : 'bg-white border-stone-800 shadow-black/70'
        }`}
      >
        {/* HEADER ATAS: ANGKA BULAN BESAR, NAMA BULAN & MULTI BANNER PENANGGALAN */}
        <CalendarHeader
          month={
            viewMode === 'hijriyah' 
              ? hijriMonth 
              : viewMode === 'jawa' 
              ? jawaMonth 
              : viewMode === 'julian'
              ? julianMonth
              : viewMode === 'tionghoa'
              ? tionghoaMonth
              : viewMode === 'saka'
              ? sakaMonth
              : month
          }
          year={
            viewMode === 'hijriyah' 
              ? hijriYear 
              : viewMode === 'jawa' 
              ? jawaYear 
              : viewMode === 'julian'
              ? julianYear
              : viewMode === 'tionghoa'
              ? tionghoaYear
              : viewMode === 'saka'
              ? sakaYear
              : year
          }
          masehiHeaderText={currentMasehiHeader}
          hijriHeaderText={currentHijriHeader}
          jawaHeaderText={currentJawaHeader}
          julianHeaderText={currentJulianHeader}
          tionghoaHeaderText={currentTionghoaHeader}
          sakaHeaderText={currentSakaHeader}
          theme={theme}
          mode={viewMode}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {/* GRID KOTAK TANGGAL MULTI-CULTURE */}
        <DaysGrid
          days={calendarDays}
          theme={theme}
          filters={filters}
          mode={viewMode}
          onSelectDay={handleSelectDay}
        />

        {/* TABEL FOOTER RESMI: HARI LIBUR & PERINGATAN (DI-FILTER SESUAI MODE) */}
        <CalendarFooter
          events={currentMonthEvents}
          theme={theme}
          mode={viewMode}
        />

        {/* EKSPOR POSTER KALENDER KE GAMBAR (PNG / JPG / PDF) */}
        <CalendarExportSection
          month={
            viewMode === 'hijriyah' 
              ? hijriMonth 
              : viewMode === 'jawa' 
              ? jawaMonth 
              : viewMode === 'julian'
              ? julianMonth
              : viewMode === 'tionghoa'
              ? tionghoaMonth
              : viewMode === 'saka'
              ? sakaMonth
              : month
          }
          year={
            viewMode === 'hijriyah' 
              ? hijriYear 
              : viewMode === 'jawa' 
              ? jawaYear 
              : viewMode === 'julian'
              ? julianYear
              : viewMode === 'tionghoa'
              ? tionghoaYear
              : viewMode === 'saka'
              ? sakaYear
              : year
          }
          theme={theme}
          targetRef={calendarContainerRef}
          onShowToast={onShowToast}
        />
      </div>

      {/* 3. MODAL POPUP INTERAKTIF KETIKA TANGGAL DIKLIK */}
      <DayDetailModal
        dayData={selectedDay}
        isOpen={isDayDetailOpen}
        onClose={() => setIsDayDetailOpen(false)}
        mode={viewMode}
        onOpenAddEvent={() => {}}
        onRequestDeleteEvent={() => {}}
        isAuthenticated={false}
        onSignInPrompt={() => {}}
        onAddPersonalNote={() => {}}
        onTogglePersonalNote={() => {}}
        onDeletePersonalNote={() => {}}
      />
    </div>
  );
};
