import React from 'react';
import { QiblaComprehensiveResult } from '../utils/astronomyMath';

interface CompassQiblaProps {
  qibla: QiblaComprehensiveResult;
  sunAzimuth?: number;
}

export const CompassQibla: React.FC<CompassQiblaProps> = ({ qibla, sunAzimuth }) => {
  const { qiblaAzimuthFromNorth, qiblaAngleFromWest, locationName } = qibla;

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-stone-900 border border-stone-800 rounded-2xl relative select-none">
      <div className="w-full flex items-center justify-between mb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Kompas Falakiyah Arah Kiblat
          </span>
          <p className="text-[10px] text-stone-400">Markaz: {locationName}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-stone-400 block">Azimuth Sejati</span>
          <span className="font-mono text-xs font-bold text-emerald-400">
            {qibla.qiblaAzimuthDMS}
          </span>
        </div>
      </div>

      {/* Dial Kompas 360 Derajat */}
      <div className="relative w-64 h-64 my-2 flex items-center justify-center">
        {/* Lingkaran Luar */}
        <div className="absolute inset-0 rounded-full border-4 border-stone-700 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 shadow-2xl flex items-center justify-center">
          {/* Garis-garis Derajat Kompas (Tiap 30 Derajat) */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <div
              key={deg}
              className="absolute w-full h-full flex justify-center pointer-events-none"
              style={{ transform: `rotate(${deg}deg)` }}
            >
              <div className="w-0.5 h-2 bg-stone-600 mt-1" />
            </div>
          ))}

          {/* Label Kardinal Arah Mata Angin */}
          <span className="absolute top-2 text-xs font-black text-red-500">U (0°)</span>
          <span className="absolute bottom-2 text-xs font-black text-stone-400">S (180°)</span>
          <span className="absolute right-3 text-xs font-black text-stone-400">T (90°)</span>
          <span className="absolute left-3 text-xs font-black text-stone-400">B (270°)</span>

          {/* Lingkaran Tengah */}
          <div className="w-44 h-44 rounded-full border border-stone-800 border-dashed flex flex-col items-center justify-center text-center p-3">
            <span className="text-[10px] text-stone-400 uppercase font-semibold">
              Sudut Ka'bah (B-U)
            </span>
            <span className="text-base font-black font-mono text-emerald-400">
              {qibla.qiblaAngleFromWestDMS}
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5">
              Condong {qiblaAngleFromWest.toFixed(2)}° ke Utara
            </span>
          </div>

          {/* Garis Azimuth Matahari Saat Ini (Jika tersedia) */}
          {sunAzimuth !== undefined && (
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-700 pointer-events-none"
              style={{ transform: `rotate(${sunAzimuth}deg)` }}
            >
              <div className="w-0.5 h-full relative flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80 -mt-1" />
                <div className="w-0.5 h-1/2 bg-amber-400/40 border-l border-dashed border-amber-300" />
              </div>
            </div>
          )}

          {/* Jarum Arah Kiblat (Kiblah Needle) */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-700 pointer-events-none"
            style={{ transform: `rotate(${qiblaAzimuthFromNorth}deg)` }}
          >
            <div className="w-2 h-full relative flex flex-col items-center">
              {/* Kepala Panah Hijau Menunjuk Ka'bah */}
              <div className="w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[28px] border-b-emerald-400 -mt-1 drop-shadow-md" />
              <div className="w-1.5 h-1/2 bg-gradient-to-b from-emerald-400 to-transparent" />
              {/* Ekor Panah */}
              <div className="w-1 h-1/3 bg-stone-600/30" />
            </div>
          </div>

          {/* Titik Poros Poros Tengah */}
          <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-stone-950 shadow-md z-10" />
        </div>
      </div>

      <div className="w-full mt-3 p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Jarum Hijau = Arah Kiblat ({qiblaAzimuthFromNorth.toFixed(2)}°)
        </span>
        {sunAzimuth !== undefined && (
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Matahari ({sunAzimuth.toFixed(1)}°)
          </span>
        )}
      </div>
    </div>
  );
};
