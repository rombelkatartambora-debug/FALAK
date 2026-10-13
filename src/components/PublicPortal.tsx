import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  BookOpen, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  LogIn, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  CheckCircle2, 
  GraduationCap, 
  HeartHandshake, 
  Compass, 
  ShieldCheck,
  ArrowRight,
  Palette,
  Printer,
  RotateCcw,
  Download,
  FileSpreadsheet,
  FileText,
  Upload
} from 'lucide-react';
import { 
  DayData, 
  AdminEvent, 
  CalendarKop, 
  CityLocation, 
  CalendarTheme, 
  CalendarFilters 
} from '../types/calendar';
import { 
  NAMA_BULAN, 
  BULAN_HIJRIYAH, 
  BULAN_JAWA,
  getHijriDate
} from '../utils/calendarMath';
import { calculatePrayerTimes, CITIES_INDONESIA } from '../utils/prayerTimes';
import { playBedugRhythm } from '../utils/bedugAudio';
import { detectLongWeekendsAndHarpitnas } from '../utils/longWeekendDetector';
import { CalendarHeader } from './CalendarHeader';
import { DaysGrid } from './DaysGrid';
import { CalendarExportSection } from './CalendarExportSection';
import { PrayerScheduleView } from './PrayerScheduleView';
import { LongWeekendBanner } from './LongWeekendBanner';
import { TraditionCultureModal } from './TraditionCultureModal';
import { FalakHisabModal } from './FalakHisabModal';
import { RbiLogo } from './RbiLogo';

interface PublicPortalProps {
  kop: CalendarKop;
  month: number;
  year: number;
  theme: CalendarTheme;
  onThemeChange: (t: CalendarTheme) => void;
  filters: CalendarFilters;
  onFilterChange: (f: CalendarFilters) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectMonthYear: (m: number, y: number) => void;
  calendarDays: DayData[];
  adminEvents: AdminEvent[];
  monthlyEvents: Array<{ dayNum: number; title: string; isHoliday: boolean; type: string }>;
  calendarContainerRef: React.RefObject<HTMLDivElement | null>;
  onSelectDay: (day: DayData) => void;
  onOpenLogin: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  kop,
  month,
  year,
  theme,
  onThemeChange,
  filters,
  onFilterChange,
  onPrevMonth,
  onNextMonth,
  onSelectMonthYear,
  calendarDays,
  adminEvents,
  monthlyEvents,
  calendarContainerRef,
  onSelectDay,
  onOpenLogin,
  onShowToast
}) => {
  const today = useMemo(() => new Date(), []);
  const [selectedCity, setSelectedCity] = useState<CityLocation>(CITIES_INDONESIA[0]); // Jakarta
  const [isTraditionModalOpen, setIsTraditionModalOpen] = useState<boolean>(false);
  const [isFalakModalOpen, setIsFalakModalOpen] = useState<boolean>(false);

  const longWeekends = useMemo(() => {
    return detectLongWeekendsAndHarpitnas(year, month);
  }, [year, month]);

  const prayerTimesToday = useMemo(() => {
    return calculatePrayerTimes(today, selectedCity);
  }, [today, selectedCity]);

  const handlePlayBedug = () => {
    playBedugRhythm();
    onShowToast('Memperdengarkan irama bedug waktu sholat!');
  };

  const currentHijriHeader = useMemo(() => {
    const currentMonthDays = calendarDays.filter(d => d.isCurrentMonth);
    if (!currentMonthDays.length) return '';
    const hMonths = Array.from(new Set(currentMonthDays.map(d => d.hijri.monthName)));
    const hYears = Array.from(new Set(currentMonthDays.map(d => d.hijri.year)));
    return `${hMonths.join(' - ')} ${hYears.join(' / ')} H`;
  }, [calendarDays]);

  const currentJawaHeader = useMemo(() => {
    const currentMonthDays = calendarDays.filter(d => d.isCurrentMonth);
    if (!currentMonthDays.length) return '';
    const jMonths = Array.from(new Set(currentMonthDays.map(d => d.jawa.monthName)));
    const jYears = Array.from(new Set(currentMonthDays.map(d => d.jawa.year)));
    return `${jMonths.join(' - ')} ${jYears.join(' / ')} Jawa`;
  }, [calendarDays]);

  const handleDownloadPublicDoc = (type: string, name: string) => {
    let content = '';
    let mime = 'text/plain;charset=utf-8;';
    if (type === 'falak') {
      content = `================================================================================
PANDUAN LENGKAP HISAB FALAK: KITAB SULLAMUN NAYYIRAIN
Ruang Belajar • Pusat Khazanah Falak Pesantren Nusantara
================================================================================
Pengarang: Syaikh Muhammad Manshur bin Abdul Hamid Al-Batawi (Jembatan Lima, Jakarta)
Tahun: 1344 H / 1925 M • Rujukan: Zij Ulugh Beg

1. STRUKTUR 7 SHEET HITUNGAN FALAK:
- ISIAN: Form parameter tahun H, bulan, dan koordinat Markaz.
- EPOCH: Harokat harian & jam peredaran matahari dan bulan.
- MUADDALAH: Koreksi ta'dil berantai bujur hakiki.
- DATA MEEUS: Komparasi algoritma astronomis Jean Meeus.
- BULANAN: Rekapitulasi Ijtima', pasaran, Irtifa' Mar'i, dan Mukuts.
- HASIL: Teks naskah resmi Bahasa Indonesia & Arab.
- RUKYAT: Berita Acara siap cetak.

2. KRITERIA HILAL MABIMS:
- Ketinggian Hilal Mar'i Minimal 3°
- Elongasi Bulan-Matahari Minimal 6.4°
================================================================================`;
    } else if (type === 'excel_hisab') {
      mime = 'text/csv;charset=utf-8;';
      content = `No,Bulan_Hijriyah,Tahun_H,Hari_Ijtima,Weton_Pasaran,Tanggal_Masehi,Bulan_Masehi,Tahun_M,Waktu_Ijtima_WIB,Irtifa_Hakiki,Irtifa_Mari,Mukuts_Menit,Nurul_Hilal_Jari,Status_Hilal\n`;
      const bulanList = ['Muharram', 'Safar', 'Rabiul Awwal', 'Rabiul Akhir', 'Jumadil Ula', 'Jumadil Akhir', 'Rajab', 'Syaban', 'Ramadhan', 'Syawwal', 'Dzulqadah', 'Dzulhijjah'];
      bulanList.forEach((bln, i) => {
        content += `${i + 1},${bln},${year},Kamis,Kliwon,26,Juni,2025,10:30,4° 12' 30",3° 55' 10",18,0.35,Imkanur Rukyat (Awal Bulan Baru)\n`;
      });
    } else if (type === 'excel_sholat') {
      mime = 'text/csv;charset=utf-8;';
      content = `Tanggal_Masehi,Hari,Tanggal_Hijriyah,Imsak,Subuh,Terbit,Dzuhur,Ashar,Maghrib,Isya\n`;
      for (let d = 1; d <= 30; d++) {
        content += `${d} Ramadhan 1447 H,Hari-${d},${d},04:28,04:38,05:52,11:58,15:10,18:02,19:12\n`;
      }
    } else {
      content = `BERITA ACARA RESMI HISAB & PENETAPAN AWAL BULAN QAMARIYAH\nLEMBAGA FALAKIYAH RUANG BELAJAR\n\nNomor: 014/LF-RB/BA/${year}\nMarkaz: ${selectedCity.name}\nKetetapan: Sesuai Kaidah Kitab Sullamun Nayyirain karya Syaikh Manshur Al-Batawi.\n\nDihisab oleh Tim Falakiyah Ruang Belajar.`;
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast(`Berkas "${name}" berhasil diunduh!`);
  };

  return (
    <div className="w-full min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* 1. TOP HEADER RESMI YAYASAN */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo & Identitas Lembaga */}
          <div className="flex items-center gap-3.5">
            <RbiLogo className="w-11 h-11 sm:w-13 sm:h-13 shrink-0 drop-shadow-md" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-lg tracking-wider text-white uppercase leading-none">
                  RUANG BELAJAR
                </h1>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Portal Resmi
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1 hidden sm:block">
                Lembaga Pendidikan, Dakwah & Khazanah Ilmu Falak Nusantara
              </p>
            </div>
          </div>

          {/* Navigasi Publik & Tombol Login */}
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-stone-300">
              <a href="#profil" className="hover:text-amber-400 transition-colors">Profil</a>
              <a href="#jadwal-sholat" className="hover:text-amber-400 transition-colors">Jadwal Sholat</a>
              <a href="#kalender-publik" className="hover:text-amber-400 transition-colors text-amber-300 font-bold">Kalender</a>
              <a href="#unduhan" className="hover:text-amber-400 transition-colors">Pusat Unduhan</a>
              <a href="#agenda" className="hover:text-amber-400 transition-colors">Agenda</a>
              <a href="#kontak" className="hover:text-amber-400 transition-colors">Kontak</a>
            </nav>

            {/* Tombol Masuk Portal Pengurus/Admin */}
            <button
              onClick={onOpenLogin}
              className="py-2.5 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-amber-600 hover:from-amber-500 to-amber-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
            >
              <LogIn className="w-4 h-4" />
              <span>Login Portal Pengurus</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION LEMBAGA */}
      <section className="relative overflow-hidden py-14 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-stone-900 via-stone-900/80 to-stone-950 border-b border-stone-800">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Selamat Datang di Portal Resmi Yayasan Ruang Belajar</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Menebar Cahaya Pendidikan, Kebajikan <br className="hidden sm:inline" />
            & Menjaga Warisan Falak Nusantara
          </h2>

          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Wadah khidmah pendidikan generasi bangsa, kajian literasi keislaman, serta pusat pengembangan hisab falak kontemporer berbasis Kitab Kuning Sullamun Nayyirain.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#kalender-publik"
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-102"
            >
              <CalendarIcon className="w-4 h-4 text-white" />
              <span>Buka Kalender Dinding Interaktif</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. TIGA PILAR UTAMA YAYASAN */}
      <section id="profil" className="py-14 px-4 sm:px-6 border-b border-stone-800 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Tiga Pilar Yayasan
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Khidmah & Nilai Luhur Lembaga
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto">
            Komitmen terpadu Yayasan Ruang Belajar dalam memadukan ilmu pengetahuan, akhlak, dan tradisi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-3 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">1. Pendidikan & Literasi</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Membangun ruang belajar yang inspiratif bagi santri dan generasi muda melalui pembinaan keilmuan, karakter berakhlak, dan penguasaan sains.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-3 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">2. Khazanah Falak Nusantara</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Menjaga warisan ilmu falak hisab Sullamun Nayyirain karya Syaikh Manshur Betawi serta kalkulasi astronomi penentuan arah kiblat dan awal bulan qamariyah.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-3 hover:border-sky-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-sky-600/20 text-sky-400 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">3. Kebajikan & Kemasyarakatan</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Pemberdayaan sosial, santunan yatim dhuafa, dan program kemaslahatan bersama untuk kemajuan umat di lingkungan yayasan.
            </p>
          </div>
        </div>
      </section>

      {/* 4. JADWAL SHOLAT 5 WAKTU LEMBAGA */}
      <section id="jadwal-sholat" className="py-14 px-4 sm:px-6 border-b border-stone-800 max-w-6xl mx-auto w-full">
        <PrayerScheduleView onShowToast={onShowToast} />
      </section>

      {/* 5. KALENDER DINDING LENGKAP & INTERAKTIF (NUSANTARA) */}
      <section id="kalender-publik" className="py-14 px-4 sm:px-6 border-b border-stone-800 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Penanggalan Masehi, Hijriyah & Jawa
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Kalender Dinding Interaktif Lembaga
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto">
            Disusun rapi untuk pedoman warga yayasan, jamaah, santri, dan masyarakat umum dengan tiga sistem penanggalan serentak (Masehi, Hijriyah Qamariyah, dan Kalender Jawa).
          </p>
        </div>

        {/* Controls Bar: Navigasi Bulan, Tahun, Weton, Falak, Tema, Cetak & Filter */}
        <div className="mb-6 p-3 sm:p-5 rounded-3xl bg-stone-900 border border-stone-800 shadow-xl space-y-3 sm:space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Navigasi Bulan & Tahun */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={onPrevMonth}
                title="Bulan Sebelumnya"
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={month}
                onChange={(e) => onSelectMonthYear(parseInt(e.target.value, 10), year)}
                className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-bold outline-none cursor-pointer"
              >
                {NAMA_BULAN.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {idx + 1}. {name.charAt(0) + name.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={1582}
                max={9999}
                value={year}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) onSelectMonthYear(month, val);
                }}
                className="w-20 bg-stone-950 border border-stone-700 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-white font-mono font-bold text-center outline-none"
              />

              <button
                onClick={onNextMonth}
                title="Bulan Berikutnya"
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectMonthYear(today.getMonth() + 1, today.getFullYear())}
                title="Lompat ke bulan dan tahun sekarang"
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Sekarang</span>
              </button>
            </div>

            {/* Fitur Budaya Weton, Hisab Falak, Tema & Cetak */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsTraditionModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Budaya & Weton</span>
              </button>

              <button
                onClick={() => setIsFalakModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <Compass className="w-3.5 h-3.5 text-teal-200" />
                <span>Hisab Falak Sullam</span>
              </button>

              <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-700 rounded-xl px-2.5 py-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <select
                  value={theme}
                  onChange={(e) => onThemeChange(e.target.value as CalendarTheme)}
                  className="bg-transparent text-xs text-stone-200 font-semibold outline-none cursor-pointer"
                >
                  <option value="classic" className="bg-stone-900">Klasik Nusantara</option>
                  <option value="batik" className="bg-stone-900">Nuansa Batik</option>
                  <option value="islamic" className="bg-stone-900">Hijau Islami</option>
                  <option value="dark" className="bg-stone-900">Dark Elegan</option>
                  <option value="keraton" className="bg-stone-900">Keraton Ungu</option>
                  <option value="print" className="bg-stone-900">Mode Cetak Putih</option>
                </select>
              </div>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak</span>
              </button>
            </div>
          </div>

          {/* Filter Toggles Bar */}
          <div className="pt-2 border-t border-stone-800 flex items-center justify-between flex-wrap gap-2 text-xs text-stone-400">
            <span className="font-semibold text-[11px] text-stone-500">Tampilkan Penanda:</span>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-stone-200 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.showAyyamulBidh}
                  onChange={(e) => onFilterChange({ ...filters, showAyyamulBidh: e.target.checked })}
                  className="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>Ayyamul Bidh</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-stone-200 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.showSeninKamis}
                  onChange={(e) => onFilterChange({ ...filters, showSeninKamis: e.target.checked })}
                  className="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>Puasa Senin-Kamis</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-stone-200 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.showHolidays}
                  onChange={(e) => onFilterChange({ ...filters, showHolidays: e.target.checked })}
                  className="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>Hari Libur Nasional</span>
              </label>
            </div>
          </div>
        </div>

        {/* Long Weekend & Harpitnas Banner */}
        <LongWeekendBanner items={longWeekends} />

        {/* Kerangka Kalender Dinding Interaktif (Poster Style Lengkap) */}
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
          {/* Header Atas: Angka Bulan Besar, Nama Bulan & Banner Hijriyah/Jawa */}
          <CalendarHeader
            month={month}
            year={year}
            hijriHeaderText={currentHijriHeader}
            jawaHeaderText={currentJawaHeader}
            theme={theme}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
          />

          {/* Grid Kotak Tanggal */}
          <DaysGrid
            days={calendarDays}
            theme={theme}
            filters={filters}
            onSelectDay={onSelectDay}
          />

          {/* EKSPOR KALENDER KE GAMBAR (PNG / JPG / PDF) */}
          <CalendarExportSection
            month={month}
            year={year}
            theme={theme}
            targetRef={calendarContainerRef}
            onShowToast={onShowToast}
          />
        </div>
      </section>

      {/* 6. PUSAT UNDUHAN BERKAS & DOKUMEN RESMI */}
      <section id="unduhan" className="py-14 px-4 sm:px-6 border-b border-stone-800 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Pusat Unduhan & Dokumen
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Unduh Materi & Format Lembar Kerja
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Dokumen resmi kajian hisab falak Sullamun Nayyirain, format lembar kerja Excel, blanko jadwal sholat, dan surat keputusan.
            </p>
          </div>
          <button
            onClick={onOpenLogin}
            className="self-start sm:self-auto py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-bold text-xs border border-stone-700 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Upload Berkas Baru (Login)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Panduan Falak */}
          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white leading-snug">
                Panduan Hisab Falak Sullamun Nayyirain
              </h4>
              <p className="text-[11px] text-stone-400 leading-relaxed line-clamp-3">
                Kaidah hisab hisi taqribi 7 sheet, konstanta epoch harokat Ulugh Beg, dan rumus ta'dil muaddalah.
              </p>
            </div>
            <button
              onClick={() => handleDownloadPublicDoc('falak', 'Panduan_Hisab_Falak_Sullamun_Nayyirain.txt')}
              className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-amber-600 text-stone-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-stone-700"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Unduh TXT (15 KB)</span>
            </button>
          </div>

          {/* Card 2: Format Excel Hisab 12 Bulan */}
          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white leading-snug">
                Format Excel Rekapitulasi Hisab 12 Bulan
              </h4>
              <p className="text-[11px] text-stone-400 leading-relaxed line-clamp-3">
                Tabel spreadsheet CSV siap buka di Microsoft Excel memuat siklus Ijtima', pasaran, dan Irtifa' Hilal tahunan.
              </p>
            </div>
            <button
              onClick={() => handleDownloadPublicDoc('excel_hisab', `Format_Excel_Rekap_Hisab_${year}H.csv`)}
              className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-emerald-600 text-stone-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-stone-700"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unduh CSV (Excel)</span>
            </button>
          </div>

          {/* Card 3: Format Excel Jadwal Imsakiyah */}
          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white leading-snug">
                Blanko Jadwal Imsakiyah & Sholat 30 Hari
              </h4>
              <p className="text-[11px] text-stone-400 leading-relaxed line-clamp-3">
                Format tabel waktu sholat 5 waktu & Imsakiyah bulanan dalam file CSV yang dapat diedit dan dicetak.
              </p>
            </div>
            <button
              onClick={() => handleDownloadPublicDoc('excel_sholat', `Blanko_Jadwal_Imsakiyah_Sholat_${selectedCity.name}.csv`)}
              className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-blue-600 text-stone-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-stone-700"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Unduh CSV (Excel)</span>
            </button>
          </div>

          {/* Card 4: Blanko Berita Acara SK */}
          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white leading-snug">
                Blanko Berita Acara Rukyatul Hilal
              </h4>
              <p className="text-[11px] text-stone-400 leading-relaxed line-clamp-3">
                Format surat penetapan resmi hisab awal bulan Qamariyah siap isi dengan kolom tanda tangan pimpinan lembaga.
              </p>
            </div>
            <button
              onClick={() => handleDownloadPublicDoc('sk_hilal', 'Blanko_Berita_Acara_Rukyatul_Hilal.txt')}
              className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-purple-600 text-stone-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-stone-700"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>Unduh Blanko SK</span>
            </button>
          </div>
        </div>
      </section>

      {/* 7. AGENDA LEMBAGA */}
      <section id="agenda" className="py-14 px-4 sm:px-6 border-b border-stone-800 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Agenda & Pengumuman
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Kegiatan Resmi Ruang Belajar
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminEvents.length > 0 ? (
            adminEvents.map((evt) => (
              <div key={evt.id} className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase border border-amber-500/30">
                    {evt.category}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">{evt.dateStr}</span>
                </div>
                <h4 className="text-base font-bold text-white">{evt.title}</h4>
                {evt.description && (
                  <p className="text-xs text-stone-400 leading-relaxed">{evt.description}</p>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-2 p-8 text-center rounded-2xl bg-stone-900 border border-stone-800 text-stone-400 text-xs">
              Belum ada agenda publik yang dijadwalkan untuk bulan ini.
            </div>
          )}
        </div>
      </section>

      {/* 8. KONTAK & FOOTER */}
      <footer id="kontak" className="bg-stone-950 border-t border-stone-800 py-12 px-4 sm:px-6 text-xs text-stone-400">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-stone-800">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <RbiLogo className="w-8 h-8 shrink-0 drop-shadow-md" />
              <span className="font-bold text-sm text-white uppercase tracking-wider">
                RUANG BELAJAR
              </span>
            </div>
            <p className="leading-relaxed text-stone-400">
              Lembaga Pendidikan, Dakwah, Sosial & Pusat Kajian Hisab Falak Nusantara berbasis Kitab Sullamun Nayyirain.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider">Kontak Resmi</h5>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <a href="mailto:yayasanruangbelajar1@gmail.com" className="hover:text-white transition-colors">
                  yayasanruangbelajar1@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>085 645 274 534</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider">Akses Khusus Pengurus</h5>
            <p className="leading-relaxed text-stone-400">
              Portal internal untuk pengurus dan santri dalam mengakses modul falak hisab Sullam, pengaturan kalender dinding, dan catatan yayasan.
            </p>
            <button
              onClick={onOpenLogin}
              className="py-2 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-semibold text-xs border border-stone-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Masuk Portal Pengurus</span>
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} Ruang Belajar. Seluruh Hak Cipta Dilindungi.
          </div>
          <div>
            Sistem Falakiyah Kitab Sullamun Nayyirain &bull; Edisi Kalender Dinding Nusantara
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION BAR (KHUSUS PENGGUNA HP DI PORTAL PUBLIK) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 px-2 py-1.5 flex items-center justify-around text-[10px] text-stone-400 print:hidden shadow-2xl safe-area-pb">
        <a
          href="#kalender-publik"
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl hover:text-amber-400 transition-colors cursor-pointer"
        >
          <CalendarIcon className="w-4 h-4 text-amber-400" />
          <span>Kalender</span>
        </a>
        <a
          href="#profil"
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl hover:text-amber-400 transition-colors cursor-pointer"
        >
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>Profil</span>
        </a>
        <a
          href="#jadwal-sholat"
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Sholat</span>
        </a>
        <a
          href="#agenda"
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl hover:text-amber-400 transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Agenda</span>
        </a>
        <button
          onClick={onOpenLogin}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl hover:text-amber-400 transition-colors cursor-pointer"
        >
          <LogIn className="w-4 h-4 text-amber-400" />
          <span>Masuk</span>
        </button>
      </nav>

      {/* MODAL BUDAYA NUSANTARA & WETON */}
      <TraditionCultureModal
        isOpen={isTraditionModalOpen}
        onClose={() => setIsTraditionModalOpen(false)}
        currentMonth={month}
        currentYear={year}
        onJumpToDate={(y, m) => onSelectMonthYear(m, y)}
      />

      {/* MODAL HISAB FALAK SULLAMUN NAYYIRAIN & ARAH KIBLAT */}
      <FalakHisabModal
        isOpen={isFalakModalOpen}
        onClose={() => setIsFalakModalOpen(false)}
        defaultHijriYear={getHijriDate(new Date()).year}
      />
    </div>
  );
};
