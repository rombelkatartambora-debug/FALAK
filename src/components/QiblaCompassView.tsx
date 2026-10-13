import React, { useMemo } from 'react';
import {
  Compass,
  MapPin,
  Clock,
  Sun,
  Globe,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ObserverLocation,
  calculateComprehensiveQibla,
  calculateSolarCoordinates,
  getJulianDay,
  formatDMSString
} from '../utils/astronomyMath';
import { CompassQibla } from './CompassQibla';

interface QiblaCompassViewProps {
  observer: ObserverLocation;
  currentDate: Date;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const QiblaCompassView: React.FC<QiblaCompassViewProps> = ({
  observer,
  currentDate,
  onShowToast
}) => {
  const qiblaResult = useMemo(() => {
    return calculateComprehensiveQibla(observer);
  }, [observer]);

  // Current sun azimuth for shadow alignment
  const sunCoordinates = useMemo(() => {
    const jd = getJulianDay(currentDate);
    return calculateSolarCoordinates(jd, observer);
  }, [currentDate, observer]);

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border border-amber-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-amber-700/30 shrink-0">
            <Compass className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/30">
                Trigonometri Bola (Spherical Trigonometry)
              </span>
              <span className="text-xs text-stone-300 font-arabic"> </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Hisab Arah Kiblat & Rashdul Qiblah
            </h2>
            <p className="text-xs text-amber-200/90 mt-0.5">
              Perhitungan sudut presisi ke Ka'bah Baitullah ({qiblaResult.meccaCoordinates.dms}) dan kalibrasi bayangan matahari
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Compass Visualizer (Left) + Mathematical Parameters & Rashdul Qiblah (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Compass (5 Kolom) */}
        <div className="lg:col-span-5 space-y-5">
          <CompassQibla qibla={qiblaResult} sunAzimuth={sunCoordinates.azimuth} />

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-stone-900 border border-stone-800 rounded-2xl">
              <span className="text-stone-400 block mb-0.5">Jarak ke Ka'bah:</span>
              <span className="font-mono text-base font-black text-white">
                {qiblaResult.greatCircleDistanceKm.toLocaleString('id-ID')} km
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">Garis Lengkung Bumi</span>
            </div>
            <div className="p-3.5 bg-stone-900 border border-stone-800 rounded-2xl">
              <span className="text-stone-400 block mb-0.5">Sudut dari Barat:</span>
              <span className="font-mono text-base font-black text-emerald-400">
                {qiblaResult.qiblaAngleFromWestDMS}
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">Condong ke Utara (B-U)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Detail Perhitungan & Rashdul Qiblah (7 Kolom) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Detail Langkah Perhitungan Segitiga Bola */}
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Parameter Astronomis Segitiga Bola (Ka'bah - Kutub - Markaz)</span>
              </span>
              <span className="text-[11px] font-mono text-stone-500">Kemenag RI</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-stone-400 block mb-0.5">Lintang Markaz ( ):</span>
                <span className="font-mono font-bold text-white text-sm">{qiblaResult.latitudeDMS}</span>
                <span className="text-[10px] text-stone-500">Desimal: {qiblaResult.latitude.toFixed(6)}°</span>
              </div>
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-stone-400 block mb-0.5">Bujur Markaz ( ):</span>
                <span className="font-mono font-bold text-white text-sm">{qiblaResult.longitudeDMS}</span>
                <span className="text-[10px] text-stone-500">Desimal: {qiblaResult.longitude.toFixed(6)}°</span>
              </div>
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-stone-400 block mb-0.5">Lintang Ka'bah ( K):</span>
                <span className="font-mono font-bold text-white text-sm">21° 25' 21.04" LU</span>
                <span className="text-[10px] text-stone-500">Desimal: {qiblaResult.meccaCoordinates.lat.toFixed(6)}°</span>
              </div>
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-stone-400 block mb-0.5">Bujur Ka'bah ( K):</span>
                <span className="font-mono font-bold text-white text-sm">39° 49' 34.33" BT</span>
                <span className="text-[10px] text-stone-500">Desimal: {qiblaResult.meccaCoordinates.lng.toFixed(6)}°</span>
              </div>
            </div>

            <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 space-y-1.5 text-xs text-stone-300">
              <span className="font-mono text-emerald-400 text-xs block">
                Rumus: tan(Q) = sin() / [cos()  tan(K) - sin()  cos()]
              </span>
              <p className="text-[11px] text-stone-400">
                Azimuth Kiblat sejati untuk markaz <strong>{observer.name}</strong> adalah{' '}
                <strong className="text-white font-mono">{qiblaResult.qiblaAzimuthDMS}</strong> ({qiblaResult.qiblaAzimuthFromNorth.toFixed(4)}° diukur dari arah Utara sejati searah jarum jam).
              </p>
            </div>
          </div>

          {/* Card Rashdul Qiblah (Istiwa A'zham & Harian Lokal) */}
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Rashdul Qiblah (Kalibrasi Bayangan Matahari)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                Akurat & Praktis
              </span>
            </div>

            {/* Rashdul Qiblah Harian Lokal Hari Ini */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rashdul Qiblah Harian Lokal (Hari Ini):</span>
                </span>
                <span className="font-mono font-bold text-white text-sm">
                  {qiblaResult.localDailyRashdulQiblahTime || 'Tidak terjadi hari ini'}
                </span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                Pada jam di atas, bayangan setiap tiang atau tongkat tegak lurus di lokasi Anda akan sejajar tepat ke arah kiblat.
              </p>
            </div>

            {/* Rashdul Qiblah Global Tahunan (Istiwa A'zham) */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Rashdul Qiblah Global (Matahari di Atas Ka'bah):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {qiblaResult.rashdulQiblahGlobalDates.map((item, idx) => (
                  <div key={idx} className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
                    <span className="font-bold text-white block text-sm">{item.dateStr}</span>
                    <span className="font-mono text-emerald-400 font-bold block">{item.timeWIB}</span>
                    <p className="text-[10px] text-stone-400 leading-snug">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
