import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  CheckCircle2
} from 'lucide-react';
import { 
  calculateQiblaHisab, 
  QIBLA_CITY_PRESETS, 
  MECCA_LAT, 
  MECCA_LNG,
  formatDMS 
} from '../utils/qiblaMath';

interface QiblaHisabViewProps {
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const QiblaHisabView: React.FC<QiblaHisabViewProps> = ({ onShowToast }) => {
  const [selectedCityName, setSelectedCityName] = useState<string>('DKI Jakarta (Betawi)');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customLat, setCustomLat] = useState<string>('-6.2088');
  const [customLng, setCustomLng] = useState<string>('106.8456');

  const qiblaResult = useMemo(() => {
    if (isCustomMode) {
      const lat = parseFloat(customLat) || -6.2088;
      const lng = parseFloat(customLng) || 106.8456;
      return calculateQiblaHisab('Koordinat Kustom', lat, lng);
    } else {
      const city = QIBLA_CITY_PRESETS.find(c => c.name === selectedCityName) || QIBLA_CITY_PRESETS[0];
      return calculateQiblaHisab(city.name, city.lat, city.lng);
    }
  }, [isCustomMode, selectedCityName, customLat, customLng]);

  const azimuthStr = formatDMS(qiblaResult.azimuthDMS);
  const qiblaAngleStr = formatDMS(qiblaResult.qiblaDMS);

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 text-white border border-amber-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-amber-700/30 shrink-0">
            <Compass className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/30">
                Trigonometri Bola (Spherical Trigonometry)
              </span>
              <span className="text-xs text-stone-300 font-arabic">اتجاه القبلة</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Hisab Arah Kiblat
            </h2>
            <p className="text-xs text-amber-200/90 mt-0.5">
              Penghitungan sudut presisi ke Ka'bah di Makkah Al-Mukarramah ({MECCA_LAT.toFixed(2)}° LU, {MECCA_LNG.toFixed(2)}° BT)
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form & Compass Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Lokasi & Koordinat Markaz</span>
              </h3>
              <div className="flex items-center gap-1 p-0.5 bg-stone-950 rounded-lg border border-stone-800 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    !isCustomMode ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Pilihan Kota
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    isCustomMode ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Kustom Koordinat
                </button>
              </div>
            </div>

            {!isCustomMode ? (
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Pilih Kota / Kabupaten di Indonesia
                </label>
                <select
                  value={selectedCityName}
                  onChange={(e) => setSelectedCityName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                >
                  {QIBLA_CITY_PRESETS.map(c => (
                    <option key={c.name} value={c.name}>{c.name} ({c.description})</option>
                  ))}
                </select>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Termasuk markaz Jakarta, Surabaya, Mataram, Bandung, Yogyakarta, Medan, dll.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Lintang Tempat (Latitude desimal, minus untuk LS)
                  </label>
                  <input
                    type="text"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    placeholder="-6.2088"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Bujur Tempat (Longitude desimal, plus untuk BT)
                  </label>
                  <input
                    type="text"
                    value={customLng}
                    onChange={(e) => setCustomLng(e.target.value)}
                    placeholder="106.8456"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none"
                  />
                </div>
              </div>
            )}

            {/* Rumus Matematika Falak Segitiga Bola */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800/80 space-y-2 text-xs">
              <span className="font-bold text-amber-400 block uppercase tracking-wider text-[11px]">
                Kaidah Segitiga Bola (Spherical Triangle Cotangent):
              </span>
              <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 font-mono text-[11px] text-stone-300 leading-relaxed overflow-x-auto">
                cotan(Q) = [tan(Φ_Ka'bah) × cos(Φ_Tempat) - sin(Φ_Tempat) × cos(Δλ)] / sin(Δλ)
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Di mana <strong>Φ_Ka'bah = 21° 25' 21.04" LU</strong> dan <strong>λ_Ka'bah = 39° 49' 34.33" BT</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Right Compass & Result (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Compass Visualizer Card */}
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <h3 className="text-sm font-bold text-white mb-4">
              Visualisasi Arah Kiblat: {qiblaResult.locationName}
            </h3>

            {/* Kompas Interaktif Dial */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2">
              {/* Lingkaran Luar Kompas */}
              <div className="absolute inset-0 rounded-full border-4 border-stone-700 bg-gradient-to-b from-stone-950 to-stone-900 shadow-2xl flex items-center justify-center">
                {/* Garis Arah Kardinal */}
                <span className="absolute top-2 text-xs font-black text-red-500">U (0°)</span>
                <span className="absolute bottom-2 text-xs font-black text-stone-400">S (180°)</span>
                <span className="absolute right-3 text-xs font-black text-stone-400">T (90°)</span>
                <span className="absolute left-3 text-xs font-black text-stone-400">B (270°)</span>

                {/* Lingkaran Dalam */}
                <div className="w-48 h-48 rounded-full border border-stone-800 border-dashed flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border border-amber-500/20 bg-amber-500/5 flex flex-col items-center justify-center text-center p-2">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">Azimuth Kiblat</span>
                    <span className="text-base font-black font-mono text-amber-400">{azimuthStr}</span>
                    <span className="text-[10px] text-stone-400">({qiblaResult.azimuthDecimal.toFixed(2)}°)</span>
                  </div>
                </div>

                {/* Jarum Penunjuk Kiblat (Diputar sesuai sudut azimuth) */}
                <div 
                  className="absolute inset-0 flex items-center justify-center transition-transform duration-700 pointer-events-none"
                  style={{ transform: `rotate(${qiblaResult.compassBearing}deg)` }}
                >
                  <div className="w-1.5 h-full relative flex flex-col items-center">
                    {/* Kepala Jarum (Menunjuk Ka'bah) */}
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[24px] border-b-emerald-400 -mt-1 drop-shadow-md" />
                    <div className="w-1.5 h-1/2 bg-gradient-to-b from-emerald-400 to-transparent" />
                  </div>
                </div>

                {/* Titik Poros Tengah */}
                <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-stone-950 shadow-md z-10" />
              </div>
            </div>

            <p className="text-xs text-stone-400 mt-2 max-w-sm">
              Jarum hijau menunjuk langsung ke arah kiblat Ka'bah Makkah sebesar <strong>{qiblaAngleStr}</strong> diukur dari arah Barat condong ke Utara.
            </p>
          </div>

          {/* Tabel Detail Hisab Kiblat */}
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Rekapitulasi Parameter Hisab Kiblat</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-stone-500 block mb-0.5">Azimuth dari Utara Sejati (UTS):</span>
                <span className="font-mono text-base font-bold text-amber-400">{azimuthStr}</span>
                <span className="text-[11px] text-stone-500 block mt-0.5">({qiblaResult.azimuthDecimal.toFixed(3)}°)</span>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-stone-500 block mb-0.5">Sudut dari Barat condong ke Utara (UB):</span>
                <span className="font-mono text-base font-bold text-emerald-400">{qiblaAngleStr}</span>
                <span className="text-[11px] text-stone-500 block mt-0.5">Condong {qiblaResult.qiblaAngleDecimal.toFixed(3)}° ke Utara</span>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-stone-500 block mb-0.5">Jarak Geodesik ke Ka'bah:</span>
                <span className="font-mono text-base font-bold text-white">± 7.900 - 8.500 km</span>
                <span className="text-[11px] text-stone-500 block mt-0.5">Garis lengkung lingkaran besar</span>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-stone-500 block mb-0.5">Jadwal Rashdul Qiblah (Matahari di atas Ka'bah):</span>
                <span className="font-mono text-sm font-bold text-yellow-300">28 Mei & 16 Juli (16:18 WIB)</span>
                <span className="text-[11px] text-stone-500 block mt-0.5">Bayangan matahari tepat mengarah ke kiblat</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
