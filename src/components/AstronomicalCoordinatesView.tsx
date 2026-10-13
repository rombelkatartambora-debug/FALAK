import React, { useState, useEffect, useRef } from 'react';
import {
  Sun,
  Moon,
  Compass,
  Clock,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Globe,
  Info,
  FastForward,
  Rewind,
  Crosshair,
  Move3d
} from 'lucide-react';
import {
  ObserverLocation,
  SolarSystemEphemeris,
  formatDMSString,
  formatHoursToHMS,
  calculateEphemeris,
  PRESET_OBSERVERS
} from '../utils/astronomyMath';
import { CelestialSkyDome } from './CelestialSkyDome';

interface AstronomicalCoordinatesViewProps {
  ephemeris?: SolarSystemEphemeris;
  observer?: ObserverLocation;
  currentDate?: Date;
  isLiveTime?: boolean;
  onToggleLiveTime?: () => void;
  onDateChange?: (date: Date) => void;
  onResetToNow?: () => void;
  onTimeSliderChange?: (minutes: number) => void;
}

export const AstronomicalCoordinatesView: React.FC<AstronomicalCoordinatesViewProps> = ({
  ephemeris: propEphemeris,
  observer: propObserver,
  currentDate: propCurrentDate,
  isLiveTime: propIsLiveTime,
  onToggleLiveTime: propOnToggleLiveTime,
  onDateChange: propOnDateChange,
  onResetToNow: propOnResetToNow,
  onTimeSliderChange: propOnTimeSliderChange
}) => {
  // Internal state if props are not provided
  const [internalDate, setInternalDate] = useState<Date>(() => new Date());
  const [internalIsLive, setInternalIsLive] = useState<boolean>(true);
  const [internalObserver, setInternalObserver] = useState<ObserverLocation>(PRESET_OBSERVERS[0]); // Jakarta

  // 4D Time Playback State
  const [isPlaying4D, setIsPlaying4D] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(60); // default: 1 second real = 1 minute simulation
  const [activeDomeMode, setActiveDomeMode] = useState<'3d_dome' | '2d_radar' | 'telescope'>('3d_dome');
  const [selectedCoordinateTab, setSelectedCoordinateTab] = useState<'all' | 'horizontal' | 'equatorial' | 'ecliptic'>('all');

  const currentDate = propCurrentDate ?? internalDate;
  const observer = propObserver ?? internalObserver;
  const isLiveTime = propIsLiveTime ?? internalIsLive;

  // Real-time ticking if isLiveTime is true and not playing 4D simulation
  useEffect(() => {
    if (!isLiveTime || isPlaying4D) return;
    const timer = setInterval(() => {
      setInternalDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [isLiveTime, isPlaying4D]);

  // 4D Simulation Animation Loop
  useEffect(() => {
    if (!isPlaying4D) return;
    const interval = setInterval(() => {
      setInternalDate((prev) => {
        // Advance time by speedMultiplier seconds
        return new Date(prev.getTime() + (speedMultiplier * 1000) / 10);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying4D, speedMultiplier]);

  const ephemeris = calculateEphemeris(currentDate, observer);

  const { sun, moon, elongationDeg, elongationDMS, moonPhaseName, moonPhaseFraction, crescentWidthArcMin } = ephemeris;

  // Minutes since midnight (0 - 1439)
  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mins = parseInt(e.target.value);
    const next = new Date(currentDate);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    next.setHours(hrs, remMins, 0, 0);
    setInternalDate(next);
    setInternalIsLive(false);
    setIsPlaying4D(false);
  };

  const handleQuickJump = (hours: number, minutes: number) => {
    const next = new Date(currentDate);
    next.setHours(hours, minutes, 0, 0);
    setInternalDate(next);
    setInternalIsLive(false);
    setIsPlaying4D(false);
  };

  const handleTogglePlay4D = () => {
    if (isPlaying4D) {
      setIsPlaying4D(false);
    } else {
      setIsPlaying4D(true);
      setInternalIsLive(false);
    }
  };

  const handleResetToNow = () => {
    setInternalDate(new Date());
    setInternalIsLive(true);
    setIsPlaying4D(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. TOP 4D TIME SIMULATION CONTROL BANNER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-cyan-700/30 shrink-0">
              <Move3d className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-cyan-400/30">
                  Simulasi Horison 3D & 4D Dimensi Waktu
                </span>
                {isLiveTime && !isPlaying4D && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Waktu Real-time
                  </span>
                )}
                {isPlaying4D && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 animate-pulse">
                    4D Memutar ({speedMultiplier}x)
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Peredaran Matahari & Bulan (Toposentris Jean Meeus)
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {currentDate.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }).replace(/Minggu/g, 'Ahad')}{' '}
                &bull;{' '}
                <span className="font-mono font-bold text-amber-300">
                  {currentDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>{' '}
                WIB (Markaz: {observer.name})
              </p>
            </div>
          </div>

          {/* Markaz Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="p-1 bg-stone-950 rounded-xl border border-stone-800 flex items-center gap-2 text-xs">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 ml-2" />
              <select
                value={observer.name}
                onChange={(e) => {
                  const found = PRESET_OBSERVERS.find(m => m.name === e.target.value);
                  if (found) setInternalObserver(found);
                }}
                className="bg-transparent text-white font-semibold outline-none pr-3 py-1.5 text-xs"
              >
                {PRESET_OBSERVERS.map(m => (
                  <option key={m.name} value={m.name} className="bg-stone-900 text-white">
                    {m.name} ({m.latitude >= 0 ? '+' : ''}{m.latitude.toFixed(2)}°, {m.longitude.toFixed(2)}°)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4D TIME SLIDER & SCRUBBER (00:00 - 23:59) */}
        <div className="space-y-3 pt-2 border-t border-stone-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-400 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Dimensi Waktu (4D Scrubber):</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black text-amber-400 bg-black/40 px-3 py-1 rounded-xl border border-white/10">
                {String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:
                {String(currentMinutes % 60).padStart(2, '0')}
              </span>
              <button
                onClick={handleResetToNow}
                className="px-2.5 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer transition-colors"
                title="Kembali ke waktu saat ini"
              >
                Waktu Ini
              </button>
            </div>
          </div>

          {/* Range Slider */}
          <input
            type="range"
            min={0}
            max={1439}
            step={1}
            value={currentMinutes}
            onChange={handleSliderChange}
            className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />

          {/* Quick Jump Buttons for Key Astronomical Moments */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleQuickJump(4, 30)}
                className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                🌅 Fajar (04:30)
              </button>
              <button
                onClick={() => handleQuickJump(5, 50)}
                className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                ☀️ Terbit (05:50)
              </button>
              <button
                onClick={() => handleQuickJump(11, 55)}
                className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                🌞 Zawal / Dzuhur (11:55)
              </button>
              <button
                onClick={() => handleQuickJump(17, 50)}
                className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 font-bold border border-amber-500/30 transition-colors cursor-pointer text-[11px]"
                title="Waktu Maghrib / Terbenam Matahari: Kritis untuk Pengamatan Rukyat Hilal!"
              >
                🌇 Ghurub / Hilal (17:50)
              </button>
              <button
                onClick={() => handleQuickJump(19, 10)}
                className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                🌙 Malam (19:10)
              </button>
            </div>

            {/* Play/Pause & Speed Controller */}
            <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10">
              <button
                onClick={handleTogglePlay4D}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                  isPlaying4D
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                }`}
              >
                {isPlaying4D ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying4D ? 'Jeda' : 'Putar 4D'}</span>
              </button>

              <div className="flex items-center gap-1 text-[11px] font-mono px-1">
                {[10, 60, 300].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeedMultiplier(s)}
                    className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                      speedMultiplier === s
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE 3D CELESTIAL SKY DOME VISUALIZER */}
      <CelestialSkyDome
        ephemeris={ephemeris}
        observerName={observer.name}
        viewMode={activeDomeMode}
        onViewModeChange={setActiveDomeMode}
        currentDate={currentDate}
      />

      {/* 3. COORDINATE TABLES & EPHEMERIS DETAIL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* SUN (MATAHARI) CARD */}
        <div className="p-5 sm:p-6 rounded-3xl bg-stone-900 border border-amber-900/40 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Matahari (Ash-Syams)</span>
                  <span className="text-xs text-stone-400 font-arabic">الشمس</span>
                </h3>
                <span className="text-[11px] text-stone-400">Pusat Tata Surya & Standar Siang/Malam</span>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              sun.altitudeApparent >= 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-stone-800 text-stone-400 border-stone-700'
            }`}>
              {sun.altitudeApparent >= 0 ? 'Di Atas Ufuk' : 'Di Bawah Ufuk'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800/80">
              <span className="text-stone-400 block mb-1">Tinggi Hakiki (Altitude)</span>
              <div className="text-base font-mono font-black text-amber-400">{sun.altitudeDMS}</div>
              <span className="text-[10px] text-stone-500">Geometris: {sun.altitudeGeometric.toFixed(4)}°</span>
            </div>

            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800/80">
              <span className="text-stone-400 block mb-1">Tinggi Mar'i (Refraksi)</span>
              <div className="text-base font-mono font-black text-white">{sun.altitudeApparent.toFixed(2)}°</div>
              <span className="text-[10px] text-stone-500">Refraksi: {(sun.altitudeApparent - sun.altitudeGeometric).toFixed(4)}°</span>
            </div>

            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800/80">
              <span className="text-stone-400 block mb-1">Azimuth Matahari (Arah)</span>
              <div className="text-base font-mono font-black text-white">{sun.azimuthDMS}</div>
              <span className="text-[10px] text-stone-500">Desimal: {sun.azimuth.toFixed(4)}°</span>
            </div>

            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800/80">
              <span className="text-stone-400 block mb-1">Deklinasi (Mail Asy-Syams)</span>
              <div className="text-base font-mono font-black text-amber-300">{sun.declinationDMS}</div>
              <span className="text-[10px] text-stone-500">Desimal: {sun.declination.toFixed(4)}°</span>
            </div>

            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800/80">
              <span className="text-stone-400 block mb-1">Asensio Rekta (RA)</span>
              <div className="text-sm font-mono font-bold text-white">{sun.rightAscensionHM}</div>
              <span className="text-[10px] text-stone-500">Derajat: {(sun.rightAscensionHours * 15).toFixed(2)}°</span>
            </div>

            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800/80">
              <span className="text-stone-400 block mb-1">Bujur Ekliptika (Thul Syams)</span>
              <div className="text-sm font-mono font-bold text-white">{sun.eclipticLongitudeDMS}</div>
              <span className="text-[10px] text-stone-500">Jarak: {sun.distanceAU ? `${sun.distanceAU.toFixed(5)} AU` : `${sun.distanceKm.toLocaleString('id-ID')} km`}</span>
            </div>
          </div>
        </div>

        {/* MOON (BULAN & HILAL) CARD */}
        <div className="p-5 sm:p-6 rounded-3xl bg-stone-900 border border-cyan-900/40 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Bulan (Al-Qamar & Hilal)</span>
                  <span className="text-xs text-stone-400 font-arabic">القمر</span>
                </h3>
                <span className="text-[11px] text-stone-400">Fase: <strong>{moonPhaseName}</strong></span>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              moon.altitudeApparent >= 0
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-stone-800 text-stone-400 border-stone-700'
            }`}>
              {moon.altitudeApparent >= 0 ? 'Di Atas Ufuk' : 'Di Bawah Ufuk'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800/80">
              <span className="text-stone-400 block mb-1">Tinggi Hakiki (Altitude)</span>
              <div className="text-base font-mono font-black text-cyan-400">{moon.altitudeDMS}</div>
              <span className="text-[10px] text-stone-500">Geometris: {moon.altitudeGeometric.toFixed(4)}°</span>
            </div>

            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800/80">
              <span className="text-stone-400 block mb-1">Tinggi Mar'i (Toposentris)</span>
              <div className="text-base font-mono font-black text-white">{moon.altitudeApparent.toFixed(2)}°</div>
              <span className="text-[10px] text-stone-500">Paralaks & Refraksi Terhitung</span>
            </div>

            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800/80">
              <span className="text-stone-400 block mb-1">Azimuth Bulan (Arah)</span>
              <div className="text-base font-mono font-black text-white">{moon.azimuthDMS}</div>
              <span className="text-[10px] text-stone-500">Desimal: {moon.azimuth.toFixed(4)}°</span>
            </div>

            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800/80">
              <span className="text-stone-400 block mb-1">Deklinasi (Mail Al-Qamar)</span>
              <div className="text-base font-mono font-black text-cyan-300">{moon.declinationDMS}</div>
              <span className="text-[10px] text-stone-500">Desimal: {moon.declination.toFixed(4)}°</span>
            </div>

            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800/80">
              <span className="text-stone-400 block mb-1">Sudut Elongasi ke Matahari</span>
              <div className="text-base font-mono font-black text-yellow-400">{elongationDMS}</div>
              <span className="text-[10px] text-stone-500">MABIMS: Min 6.4° (Sekarang: {elongationDeg.toFixed(2)}°)</span>
            </div>

            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800/80">
              <span className="text-stone-400 block mb-1">Iluminasi & Lebar Sabit</span>
              <div className="text-base font-mono font-black text-white">{(moonPhaseFraction * 100).toFixed(1)}%</div>
              <span className="text-[10px] text-stone-500">Lebar: {crescentWidthArcMin.toFixed(2)} menit busur</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
