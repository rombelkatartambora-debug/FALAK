import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  MapPin, 
  Volume2, 
  Sparkles, 
  Sun, 
  Moon, 
  Compass, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { CITIES_INDONESIA, calculatePrayerTimes } from '../utils/prayerTimes';
import { CityLocation } from '../types/calendar';
import { NAMA_BULAN, NAMA_HARI } from '../utils/calendarMath';
import { playBedugRhythm } from '../utils/bedugAudio';

interface PrayerScheduleViewProps {
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const PrayerScheduleView: React.FC<PrayerScheduleViewProps> = ({ onShowToast }) => {
  const [selectedCityId, setSelectedCityId] = useState<string>('jkt');
  const today = useMemo(() => new Date(), []);

  const selectedCity = useMemo(() => {
    return CITIES_INDONESIA.find(c => c.id === selectedCityId) || CITIES_INDONESIA[0];
  }, [selectedCityId]);

  const prayerTimes = useMemo(() => {
    return calculatePrayerTimes(today, selectedCity);
  }, [today, selectedCity]);

  const handlePlayBedug = () => {
    playBedugRhythm();
    onShowToast('Memperdengarkan irama bedug waktu sholat!');
  };

  const dayName = NAMA_HARI[today.getDay()];
  const formattedDate = `${dayName}, ${today.getDate()} ${NAMA_BULAN[today.getMonth()]} ${today.getFullYear()}`;

  const prayersList = [
    { name: 'Imsak', time: prayerTimes.imsak, icon: Moon, note: 'Batas sahur puasa', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { name: 'Subuh', time: prayerTimes.subuh, icon: Moon, note: 'Awal fajar shadiq', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { name: 'Terbit', time: prayerTimes.terbit, icon: Sun, note: 'Matahari terbit (Syuruq)', color: 'text-stone-400 bg-stone-800/40 border-stone-700/40' },
    { name: 'Dzuhur', time: prayerTimes.dzuhur, icon: Sun, note: 'Tergelincir matahari (Zawal)', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
    { name: 'Ashar', time: prayerTimes.ashar, icon: Sun, note: 'Bayangan sama panjang', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
    { name: 'Maghrib', time: prayerTimes.maghrib, icon: Moon, note: 'Matahari terbenam (Buka puasa)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { name: 'Isya', time: prayerTimes.isya, icon: Moon, note: 'Hilang mega merah (Syafaq)', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-950 via-stone-900 to-emerald-950 text-white border border-teal-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-700/30 shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider border border-teal-400/30">
                Waktu Sholat Harian
              </span>
              <span className="text-xs text-stone-300 font-arabic">مواقيت الصلاة</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Jadwal Sholat 5 Waktu
            </h2>
            <p className="text-xs text-teal-200/90 mt-0.5">
              Perhitungan astronomis waktu sholat untuk daerah {selectedCity.name} ({formattedDate})
            </p>
          </div>
        </div>

        <button
          onClick={handlePlayBedug}
          className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/25 transition-all cursor-pointer"
        >
          <Volume2 className="w-4 h-4 text-white" />
          <span>Bunyikan Bedug</span>
        </button>
      </div>

      {/* City Location Filter */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span>Pilih Kota / Kabupaten:</span>
          </label>
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            className="bg-stone-950 border border-stone-800 focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
          >
            {CITIES_INDONESIA.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.province})</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-stone-400 font-mono">
          Koordinat: {selectedCity.lat.toFixed(4)}°, {selectedCity.lng.toFixed(4)}° &bull; UTC+{selectedCity.timezone}
        </div>
      </div>

      {/* Prayer Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {prayersList.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className={`p-4 rounded-2xl border bg-stone-900 text-center flex flex-col items-center justify-between transition-all hover:scale-102 ${item.color}`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-black/30 mb-1">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">{item.name}</span>
              <div className="text-xl sm:text-2xl font-black font-mono my-1 text-white">
                {item.time}
              </div>
              <span className="text-[10px] text-stone-400 leading-tight">
                {item.note}
              </span>
            </div>
          );
        })}
      </div>

      {/* Audio Info Card */}
      <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between gap-4 text-xs text-stone-400">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-stone-200 block">Pengingat Audio Suara Bedug Asli</span>
            <span>Audio disintesis melalui Web Audio API peramban dengan nada dan ketukan ritme bedug khas masjid Nusantara.</span>
          </div>
        </div>
        <button
          onClick={handlePlayBedug}
          className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold cursor-pointer shrink-0 transition-colors"
        >
          Tes Audio
        </button>
      </div>
    </div>
  );
};
