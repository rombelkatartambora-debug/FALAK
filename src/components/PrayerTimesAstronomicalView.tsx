import React, { useState, useMemo } from 'react';
import {
  Clock,
  Volume2,
  Calendar,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  Sparkles,
  Download,
  Settings,
  Table
} from 'lucide-react';
import {
  ObserverLocation,
  calculateSolarCoordinates,
  getJulianDay,
  toRad,
  toDeg,
  normalizeHours,
  formatHoursToHMS
} from '../utils/astronomyMath';

interface PrayerTimesAstronomicalViewProps {
  observer: ObserverLocation;
  currentDate: Date;
  onPlayBedug: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export interface ComputedPrayers {
  imsak: string;
  subuh: string;
  terbit: string;
  duha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export const computeAstronomicalPrayerTimes = (
  date: Date,
  observer: ObserverLocation,
  ihtiyatMinutes = 2
): ComputedPrayers => {
  // Midnight UTC of date
  const baseUtc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
  const jdNoon = getJulianDay(baseUtc);

  const solarData = calculateSolarCoordinates(jdNoon, observer);
  const delta = solarData.declination;
  const eotMinutes = solarData.equationOfTimeMinutes;

  // Dip of horizon in degrees: d = 0.0293 * sqrt(elevation)
  const dipDeg = 0.0293 * Math.sqrt(Math.max(0, observer.elevation));

  // Transit time (Dzuhur) in decimal hours local time:
  // Transit = 12 + (Timezone * 15 - Longitude) / 15 - EoT / 60
  const transitHours = 12 + (observer.timezone * 15 - observer.longitude) / 15 - eotMinutes / 60;

  const phiRad = toRad(observer.latitude);
  const deltaRad = toRad(delta);

  // Hour angle helper for solar altitude alpha (in degrees)
  const calcHourAngleHours = (alphaDeg: number): number => {
    const alphaRad = toRad(alphaDeg);
    const cosH = (Math.sin(alphaRad) - Math.sin(phiRad) * Math.sin(deltaRad)) / (Math.cos(phiRad) * Math.cos(deltaRad));
    if (cosH > 1) return 0; // Never rises
    if (cosH < -1) return 12; // Never sets
    return toDeg(Math.acos(cosH)) / 15.0; // hours
  };

  // 1. Subuh: alpha = -20° (Kemenag RI)
  const hSubuh = calcHourAngleHours(-20.0);
  const subuhDec = transitHours - hSubuh + ihtiyatMinutes / 60;

  // 2. Imsak: 10 menit sebelum Subuh
  const imsakDec = subuhDec - 10 / 60;

  // 3. Terbit (Sunrise): alpha = -0.833° - dipDeg
  const hSunrise = calcHourAngleHours(-0.833 - dipDeg);
  const terbitDec = transitHours - hSunrise - ihtiyatMinutes / 60;

  // 4. Duha: alpha = +4.5°
  const hDuha = calcHourAngleHours(4.5);
  const duhaDec = transitHours - hDuha + ihtiyatMinutes / 60;

  // 5. Dzuhur: Transit + ihtiyat
  const dzuhurDec = transitHours + ihtiyatMinutes / 60;

  // 6. Ashar: Shafi'i shadow ratio 1 (alt = arc cot(1 + tan|phi - delta|))
  const phiMinusDelta = Math.abs(toRad(observer.latitude) - toRad(delta));
  const asrAlt = toDeg(Math.atan(1 / (1 + Math.tan(phiMinusDelta))));
  const hAshar = calcHourAngleHours(asrAlt);
  const asharDec = transitHours + hAshar + ihtiyatMinutes / 60;

  // 7. Maghrib: Sunset alpha = -0.833° - dipDeg + ihtiyat
  const maghribDec = transitHours + hSunrise + ihtiyatMinutes / 60;

  // 8. Isya: alpha = -18° + ihtiyat
  const hIsya = calcHourAngleHours(-18.0);
  const isyaDec = transitHours + hIsya + ihtiyatMinutes / 60;

  return {
    imsak: formatHoursToHMS(imsakDec).slice(0, 5),
    subuh: formatHoursToHMS(subuhDec).slice(0, 5),
    terbit: formatHoursToHMS(terbitDec).slice(0, 5),
    duha: formatHoursToHMS(duhaDec).slice(0, 5),
    dzuhur: formatHoursToHMS(dzuhurDec).slice(0, 5),
    ashar: formatHoursToHMS(asharDec).slice(0, 5),
    maghrib: formatHoursToHMS(maghribDec).slice(0, 5),
    isya: formatHoursToHMS(isyaDec).slice(0, 5)
  };
};

export const PrayerTimesAstronomicalView: React.FC<PrayerTimesAstronomicalViewProps> = ({
  observer,
  currentDate,
  onPlayBedug,
  onShowToast
}) => {
  const [ihtiyat, setIhtiyat] = useState<number>(2); // Default +2 menit (Standar Kemenag)
  const [showMonthlyTable, setShowMonthlyTable] = useState<boolean>(false);

  const prayersToday = useMemo(() => {
    return computeAstronomicalPrayerTimes(currentDate, observer, ihtiyat);
  }, [currentDate, observer, ihtiyat]);

  // Current minutes of the day to detect next prayer
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const prayerScheduleList = [
    { key: 'imsak', name: 'Imsak', time: prayersToday.imsak, icon: Moon, angle: 'Subuh - 10 mnt', wajib: false },
    { key: 'subuh', name: 'Subuh', time: prayersToday.subuh, icon: Sunrise, angle: 'Sudut -20°', wajib: true },
    { key: 'terbit', name: 'Terbit', time: prayersToday.terbit, icon: Sun, angle: '-0.833° - Dip', wajib: false },
    { key: 'duha', name: 'Duha', time: prayersToday.duha, icon: Sun, angle: 'Tinggi +4.5°', wajib: false },
    { key: 'dzuhur', name: 'Dzuhur', time: prayersToday.dzuhur, icon: Sun, angle: 'Transit Zawal', wajib: true },
    { key: 'ashar', name: 'Ashar', time: prayersToday.ashar, icon: Sun, angle: 'Bayangan 1:1', wajib: true },
    { key: 'maghrib', name: 'Maghrib', time: prayersToday.maghrib, icon: Sunset, angle: 'Terbenam -0.833°', wajib: true },
    { key: 'isya', name: 'Isya', time: prayersToday.isya, icon: Moon, angle: 'Sudut -18°', wajib: true }
  ];

  // Cari waktu sholat berikutnya
  const nextPrayer = useMemo(() => {
    const parseM = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    for (const p of prayerScheduleList) {
      if (p.wajib && parseM(p.time) > currentMinutes) {
        const diff = parseM(p.time) - currentMinutes;
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        return {
          name: p.name,
          time: p.time,
          countdown: hours > 0 ? `${hours} jam ${mins} menit lagi` : `${mins} menit lagi`
        };
      }
    }
    // Jika lewat Isya, menuju Subuh besok
    return {
      name: 'Subuh',
      time: prayersToday.subuh,
      countdown: 'Esok hari'
    };
  }, [prayerScheduleList, currentMinutes, prayersToday]);

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-950 via-stone-900 to-emerald-950 border border-teal-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-700/30 shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider border border-teal-400/30">
                Hisab Waktu Sholat Hakiki
              </span>
              <span className="text-xs text-stone-300 font-arabic"> </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Jadwal Sholat & Waktu Astronomis
            </h2>
            <p className="text-xs text-teal-200/90 mt-0.5">
              Perhitungan astronomis sudut zenith Matahari berdasar lintang, bujur, dan elevasi {observer.name}
            </p>
          </div>
        </div>

        {/* Action: Bedug Sound & Ihtiyat Settings */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10 text-xs">
            <span className="text-stone-400 pl-1 text-[11px]">Ihtiyath:</span>
            {[0, 1, 2].map((min) => (
              <button
                key={min}
                onClick={() => setIhtiyat(min)}
                className={`px-2 py-0.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  ihtiyat === min ? 'bg-teal-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                +{min} mnt
              </button>
            ))}
          </div>

          <button
            onClick={onPlayBedug}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/25 transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Tabuh Bedug</span>
          </button>
        </div>
      </div>

      {/* Countdown Card Menuju Sholat Berikutnya */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 to-teal-950 border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <span className="text-xs text-stone-400 block">Menuju Waktu Sholat Berikutnya:</span>
            <div className="text-lg font-black text-white flex items-center gap-2">
              <span>{nextPrayer.name}</span>
              <span className="font-mono text-emerald-400">({nextPrayer.time})</span>
            </div>
          </div>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
          {nextPrayer.countdown}
        </div>
      </div>

      {/* Grid 8 Kartu Waktu Sholat */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {prayerScheduleList.map((item) => {
          const Icon = item.icon;
          const isNext = item.name === nextPrayer.name;
          return (
            <div
              key={item.key}
              className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                isNext
                  ? 'bg-teal-950/80 border-teal-500 ring-2 ring-teal-500/30 shadow-lg'
                  : 'bg-stone-900 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-stone-950 mb-1">
                <Icon className={`w-4 h-4 ${isNext ? 'text-teal-400' : 'text-stone-400'}`} />
              </div>
              <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">{item.name}</span>
              <div
                className={`text-xl sm:text-2xl font-black font-mono my-1 ${
                  isNext ? 'text-teal-300' : 'text-white'
                }`}
              >
                {item.time}
              </div>
              <span className="text-[10px] text-stone-400 leading-tight">{item.angle}</span>
            </div>
          );
        })}
      </div>

      {/* Penjelasan Parameter Falak Kemenag */}
      <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3 text-xs text-stone-300">
        <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
          Dasar Perhitungan Falakiyah Kementerian Agama RI:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
            <strong className="text-teal-400 block mb-0.5">Subuh & Isya:</strong>
            <p className="text-[11px] text-stone-400">
              Subuh dihitung saat pusat piringan matahari berada pada sudut <strong>-20°</strong> di bawah horizon. Isya pada sudut <strong>-18°</strong> (hilangnya mega merah / syafaq).
            </p>
          </div>
          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
            <strong className="text-amber-400 block mb-0.5">Terbit & Maghrib:</strong>
            <p className="text-[11px] text-stone-400">
              Dihitung saat piringan atas matahari menyentuh ufuk mar'i (<strong>-0.833°</strong> koreksi semi-diameter 16' + refraksi 34' + kerendahan ufuk dip).
            </p>
          </div>
          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
            <strong className="text-emerald-400 block mb-0.5">Elevasi & Ihtiyath:</strong>
            <p className="text-[11px] text-stone-400">
              Ketinggian markaz <strong>{observer.elevation} mdpl</strong> menghasilkan koreksi kerendahan ufuk (dip). Tambahan pengaman ihtiyath <strong>+{ihtiyat} menit</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
