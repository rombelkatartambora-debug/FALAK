import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Sun, 
  Sunset, 
  Moon, 
  Sunrise, 
  Calendar as CalendarIcon,
  Volume2,
  Table,
  Compass,
  Sparkles
} from 'lucide-react';
import { CalendarTheme, CityLocation } from '../types/calendar';
import { CITIES_INDONESIA, calculatePrayerTimes, getNextPrayerInfo } from '../utils/prayerTimes';
import { playBedugRhythm, playAdzanChime } from '../utils/bedugAudio';

interface PrayerTimesSectionProps {
  currentDate: Date;
  theme: CalendarTheme;
  onOpenImsakiyah?: (city: CityLocation) => void;
  onOpenFalak?: () => void;
}

export const PrayerTimesSection: React.FC<PrayerTimesSectionProps> = ({
  currentDate,
  theme,
  onOpenImsakiyah,
  onOpenFalak
}) => {
  const isDark = theme === 'dark' || theme === 'keraton';

  // Load saved city or default to Jakarta
  const [selectedCityId, setSelectedCityId] = useState<string>(() => {
    return localStorage.getItem('kalender_selected_city') || 'jkt';
  });

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);

  // Update clock every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const currentCity = CITIES_INDONESIA.find((c) => c.id === selectedCityId) || CITIES_INDONESIA[0];

  // Calculate prayer times for the date
  const prayerTimes = calculatePrayerTimes(currentDate, currentCity);
  const nextPrayer = getNextPrayerInfo(prayerTimes, currentTime);

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    localStorage.setItem('kalender_selected_city', cityId);
  };

  const handlePlayBedug = () => {
    setIsPlayingSound(true);
    playBedugRhythm();
    setTimeout(() => {
      playAdzanChime();
      setIsPlayingSound(false);
    }, 3200);
  };

  const prayers = [
    { key: 'imsak', name: 'Imsak', time: prayerTimes.imsak, icon: Moon, isWajib: false },
    { key: 'subuh', name: 'Subuh', time: prayerTimes.subuh, icon: Sunrise, isWajib: true },
    { key: 'terbit', name: 'Terbit', time: prayerTimes.terbit, icon: Sun, isWajib: false },
    { key: 'dzuhur', name: 'Dzuhur', time: prayerTimes.dzuhur, icon: Sun, isWajib: true },
    { key: 'ashar', name: 'Ashar', time: prayerTimes.ashar, icon: Sun, isWajib: true },
    { key: 'maghrib', name: 'Maghrib', time: prayerTimes.maghrib, icon: Sunset, isWajib: true },
    { key: 'isya', name: 'Isya', time: prayerTimes.isya, icon: Moon, isWajib: true }
  ];

  return (
    <section
      id="jadwal-sholat"
      aria-label="Jadwal Waktu Sholat"
      className={`w-full border-t-2 border-stone-900 px-3 sm:px-5 py-3 transition-colors select-none ${
        theme === 'batik'
          ? 'bg-[#f4ebe1] text-[#3d2314]'
          : theme === 'islamic'
          ? 'bg-[#e3f4e8] text-emerald-950'
          : theme === 'keraton'
          ? 'bg-[#261533] text-stone-100'
          : isDark 
          ? 'bg-[#18212d] text-stone-100' 
          : 'bg-[#e8f5e9] text-stone-900'
      }`}
    >
      {/* Baris Atas: Judul, Status Waktu & Pemilih Kota & Aksi Falak */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 pb-2.5 border-b border-stone-300/60 dark:border-stone-700/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-xs sm:text-sm tracking-wide uppercase">
                Jadwal Waktu Sholat Otomatis
              </h4>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/20">
                Kemenag RI
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Menuju {nextPrayer.name}: <strong>{nextPrayer.time}</strong> ({nextPrayer.remainingStr})</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Bedug Audio, Imsakiyah 1 Bulan, Falak & Arah Kiblat, City Selector */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto justify-between md:justify-end">
          {/* Suara Bedug & Adzan */}
          <button
            onClick={handlePlayBedug}
            disabled={isPlayingSound}
            title="Dengarkan Tabuhan Bedug & Chime Waktu Sholat"
            className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isPlayingSound ? 'animate-bounce' : ''}`} />
            <span>{isPlayingSound ? 'Menabuh Bedug...' : 'Suara Bedug'}</span>
          </button>

          {/* Tabel Imsakiyah 1 Bulan Penuh */}
          {onOpenImsakiyah && (
            <button
              onClick={() => onOpenImsakiyah(currentCity)}
              title="Buka & Cetak Jadwal Imsakiyah 1 Bulan Penuh"
              className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabel Imsakiyah 1 Bln</span>
            </button>
          )}

          {/* Hisab Arah Kiblat & Falak */}
          {onOpenFalak && (
            <button
              onClick={onOpenFalak}
              title="Program Hisab Sulam Nayyiroin & Arah Kiblat"
              className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-teal-800 hover:bg-teal-900 text-white flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Hisab Kiblat & Sulam</span>
            </button>
          )}

          {/* Pemilih Kota / Wilayah Indonesia */}
          <div className="flex items-center gap-1.5 bg-white/95 dark:bg-stone-900/95 px-2.5 py-1 rounded-xl border border-stone-300 dark:border-stone-700 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              value={selectedCityId}
              onChange={(e) => handleCityChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-800 dark:text-stone-100 focus:outline-none cursor-pointer max-w-[150px] sm:max-w-[180px] truncate"
            >
              {CITIES_INDONESIA.map((city) => (
                <option key={city.id} value={city.id} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                  {city.name} ({city.province})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid 7 Waktu: Imsak, Subuh, Terbit, Dzuhur, Ashar, Maghrib, Isya */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2 pt-2.5">
        {prayers.map((item) => {
          const isNext = nextPrayer.name.toLowerCase() === item.name.toLowerCase();
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              className={`p-1.5 sm:p-2 rounded-xl border text-center transition-all ${
                isNext
                  ? isDark
                    ? 'bg-emerald-950/80 border-emerald-500/80 ring-2 ring-emerald-500/50 shadow-sm'
                    : 'bg-emerald-100/90 border-emerald-500 ring-2 ring-emerald-500/40 shadow-sm'
                  : isDark
                  ? 'bg-stone-900/60 border-stone-700/60 hover:bg-stone-800/80'
                  : 'bg-white/90 border-stone-200/80 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Icon className={`w-3 h-3 ${isNext ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'}`} />
                <span className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-tight ${
                  isNext ? 'text-emerald-700 dark:text-emerald-300' : 'text-stone-600 dark:text-stone-300'
                }`}>
                  {item.name}
                </span>
                {item.isWajib && (
                  <span className="w-1 h-1 rounded-full bg-emerald-500" title="Sholat Wajib" />
                )}
              </div>
              <div className={`text-xs sm:text-sm md:text-base font-black tracking-tight ${
                isNext ? 'text-emerald-700 dark:text-emerald-300 scale-105' : 'text-stone-900 dark:text-stone-100'
              }`}>
                {item.time}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
