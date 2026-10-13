import React, { useState, useMemo } from 'react';
import { 
  X, 
  Compass, 
  Moon, 
  Sun, 
  Sparkles, 
  MapPin, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  Info,
  Maximize2
} from 'lucide-react';
import { 
  calculateQiblaHisab, 
  QIBLA_CITY_PRESETS, 
  formatDMS,
  MECCA_LAT,
  MECCA_LNG
} from '../utils/qiblaMath';
import { 
  calculateSulamNayyiroin, 
  LIST_MARKAZ_FALAK, 
  DEFAULT_MARKAZ_JAKARTA 
} from '../utils/sulamNayyiroinMath';
import { BULAN_HIJRIYAH, getHijriDate } from '../utils/calendarMath';

interface FalakHisabModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultHijriYear?: number;
  defaultHijriMonth?: number;
}

export const FalakHisabModal: React.FC<FalakHisabModalProps> = ({
  isOpen,
  onClose,
  defaultHijriYear,
  defaultHijriMonth
}) => {
  if (!isOpen) return null;

  const currentHijri = useMemo(() => getHijriDate(new Date()), []);
  const initialYear = defaultHijriYear ?? currentHijri.year;
  const initialMonth = defaultHijriMonth ?? Math.max(0, Math.min(11, currentHijri.month - 1));

  const [activeTab, setActiveTab] = useState<'sulam' | 'kiblat'>('sulam');

  // STATE: Sullamun Nayyirain
  const [hijriYear, setHijriYear] = useState<number>(initialYear);
  const [hijriMonthIdx, setHijriMonthIdx] = useState<number>(initialMonth);
  const [selectedMarkazName, setSelectedMarkazName] = useState<string>(DEFAULT_MARKAZ_JAKARTA.name);

  const selectedMarkaz = useMemo(() => {
    return LIST_MARKAZ_FALAK.find(m => m.name === selectedMarkazName) || DEFAULT_MARKAZ_JAKARTA;
  }, [selectedMarkazName]);

  const sulamResult = useMemo(() => {
    return calculateSulamNayyiroin(hijriYear, hijriMonthIdx, selectedMarkaz);
  }, [hijriYear, hijriMonthIdx, selectedMarkaz]);

  // STATE: Hisab Arah Kiblat
  const [selectedQiblaCity, setSelectedQiblaCity] = useState<string>('Mataram (Lombok)');
  const [customLat, setCustomLat] = useState<string>('-8.6');
  const [customLng, setCustomLng] = useState<string>('116.1333333');
  const [isCustomCoord, setIsCustomCoord] = useState<boolean>(false);

  const qiblaResult = useMemo(() => {
    if (isCustomCoord) {
      const lat = parseFloat(customLat) || -8.6;
      const lng = parseFloat(customLng) || 116.1333333;
      return calculateQiblaHisab('Koordinat Kustom', lat, lng);
    } else {
      const city = QIBLA_CITY_PRESETS.find(c => c.name === selectedQiblaCity) || QIBLA_CITY_PRESETS[0];
      return calculateQiblaHisab(city.name, city.lat, city.lng);
    }
  }, [isCustomCoord, selectedQiblaCity, customLat, customLng]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-emerald-300" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">Program Falak & Hisab Nusantara</h3>
              <p className="text-xs text-emerald-200">Hisab Kitab Sullamun Nayyirain & Hisab Arah Kiblat Segitiga Bola</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 shrink-0 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('sulam')}
            className={`flex-1 py-3 px-3 sm:px-6 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'sulam'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-stone-900'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Moon className="w-4 h-4 text-emerald-500" />
            <span>Program Hisab Sulam Nayyiroin</span>
          </button>

          <button
            onClick={() => setActiveTab('kiblat')}
            className={`flex-1 py-3 px-3 sm:px-6 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'kiblat'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-stone-900'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-500" />
            <span>Hisab Arah Kiblat (Trigonometri Bola)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* TAB 1: SULLAMUN NAYYIRAIN */}
          {activeTab === 'sulam' && (
            <div className="space-y-4">
              {/* Form Input Sulam Nayyiroin */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Parameter Hisab Sullamun Nayyirain</span>
                  </h4>
                  <span className="text-[11px] text-stone-500">Karya Syaikh Manshur al-Batawi</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Pilihan Bulan Hijriyah */}
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                      Bulan Hijriyah yang Dihisab
                    </label>
                    <select
                      value={hijriMonthIdx}
                      onChange={(e) => setHijriMonthIdx(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-medium"
                    >
                      {BULAN_HIJRIYAH.map((b, idx) => (
                        <option key={idx} value={idx}>{idx + 1}. {b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Pilihan Tahun Hijriyah */}
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                      Tahun Hijriyah (H)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="1300"
                        max="1600"
                        value={hijriYear}
                        onChange={(e) => setHijriYear(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setHijriYear(1455)}
                        title="Tahun 1455 H (Sesuai Contoh Catatan)"
                        className="px-2 py-1 text-[10px] rounded bg-stone-200 dark:bg-stone-700 font-bold hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                      >
                        1455H
                      </button>
                    </div>
                  </div>

                  {/* Pilihan Markaz Falak */}
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                      Markaz Tempat
                    </label>
                    <select
                      value={selectedMarkazName}
                      onChange={(e) => setSelectedMarkazName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-medium"
                    >
                      {LIST_MARKAZ_FALAK.map((m, idx) => (
                        <option key={idx} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                  <span>Lintang: {selectedMarkaz.latDeg}° {selectedMarkaz.latMin}&apos; {selectedMarkaz.isSouth ? 'LS' : 'LU'}</span>
                  <span>Bujur: {selectedMarkaz.lngDeg}° {selectedMarkaz.lngMin}&apos; {selectedMarkaz.isEast ? 'BT' : 'BB'}</span>
                  <span>Ketinggian: {selectedMarkaz.altitudeMeters} mdpl</span>
                  <span>Selisih Betawi: {selectedMarkaz.name.includes('BETAWI') ? '- 0° 0\' 4"' : `${selectedMarkaz.selisihBetawiSec} detik busur`}</span>
                </div>
              </div>

              {/* Rangkuman Hasil Hisab Sullamun Nayyirain */}
              <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 dark:border-emerald-800/60 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                      Hasil Ijtima&apos; & Hilal {sulamResult.hijriMonthName} {sulamResult.hijriYear} H
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-100">
                      {sulamResult.ijtimakDateMasehi}
                    </h4>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-stone-500">Waktu Ijtima&apos; Hakiki:</span>
                    <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                      {sulamResult.waktuIjtimakWIB} ({sulamResult.waktuGhurubiyah} Ghurubiyah)
                    </p>
                  </div>
                </div>

                {/* Grid Rincian Parameter */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white/70 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
                    <span className="text-[10px] text-stone-500 block">Tinggi Hilal Hakiki</span>
                    <strong className="text-sm text-stone-900 dark:text-white font-mono">{sulamResult.irtifaHakikiDMS}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/70 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
                    <span className="text-[10px] text-stone-500 block">Tinggi Hilal Mar&apos;i</span>
                    <strong className="text-sm text-emerald-600 dark:text-emerald-400 font-mono">{sulamResult.irtifaMarI_DMS}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/70 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
                    <span className="text-[10px] text-stone-500 block">Lama Hilal (Mukuts)</span>
                    <strong className="text-sm text-stone-900 dark:text-white">{sulamResult.mukutsMenit} Menit</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/70 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
                    <span className="text-[10px] text-stone-500 block">Cahaya Hilal (Nur)</span>
                    <strong className="text-sm text-stone-900 dark:text-white">{sulamResult.nurulHilalJari} Jari / Isba&apos;</strong>
                  </div>
                </div>

                {/* Status & Penetapan Awal Bulan */}
                <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800 dark:text-stone-200">
                      Status Visibilitas Hilal:
                    </span>
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {sulamResult.statusHilal}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-stone-200 dark:border-stone-800">
                    <span className="text-stone-500 block text-[11px]">Penetapan Awal Bulan Berikutnya:</span>
                    <p className="text-sm font-black text-amber-700 dark:text-amber-400 mt-0.5">
                      {sulamResult.awalBulanMasehi}
                    </p>
                  </div>
                  <p className="text-[11px] text-stone-500 pt-1 italic">
                    {sulamResult.keteranganHisab}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HISAB ARAH KIBLAT (TRIGONOMETRI BOLA) */}
          {activeTab === 'kiblat' && (
            <div className="space-y-4">
              {/* Info Hasib & Rumus */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200">
                <div>
                  <span className="font-bold block">Hisab Falakiyah Arah Kiblat</span>
                  <span className="text-[11px] opacity-80">Hasib : Subhan Azni Bahrul Alam & Tim Falak Nusantara</span>
                </div>
                <div className="text-[11px] opacity-80">
                  Ka&apos;bah Mekah: φm = 21° 25&apos; U, λm = 39° 50&apos; T
                </div>
              </div>

              {/* Selector Lokasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                    Pilih Kota / Markaz Indonesia
                  </label>
                  <select
                    disabled={isCustomCoord}
                    value={selectedQiblaCity}
                    onChange={(e) => setSelectedQiblaCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-medium disabled:opacity-50"
                  >
                    {QIBLA_CITY_PRESETS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.description})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-4 sm:pt-0">
                  <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCustomCoord}
                      onChange={(e) => setIsCustomCoord(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Gunakan Koordinat Kustom</span>
                  </label>
                </div>

                {isCustomCoord && (
                  <div className="sm:col-span-2 grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] font-medium text-stone-500">Lintang Tempat (φ tm)</label>
                      <input
                        type="text"
                        value={customLat}
                        onChange={(e) => setCustomLat(e.target.value)}
                        placeholder="-8.6"
                        className="w-full mt-1 px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-stone-500">Bujur Tempat (λ tm)</label>
                      <input
                        type="text"
                        value={customLng}
                        onChange={(e) => setCustomLng(e.target.value)}
                        placeholder="116.1333333"
                        className="w-full mt-1 px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Rincian Komputasi Spherical Trigonometry persis format user */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Visual Kompas Interaktif */}
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 flex flex-col items-center justify-center text-center">
                  <div className="relative w-44 h-44 rounded-full border-4 border-stone-300 dark:border-stone-700 bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900 shadow-inner flex items-center justify-center">
                    {/* Mata Angin Label */}
                    <span className="absolute top-1 font-black text-xs text-red-600">U (0°)</span>
                    <span className="absolute right-1.5 font-bold text-xs text-stone-600 dark:text-stone-400">T (90°)</span>
                    <span className="absolute bottom-1 font-bold text-xs text-stone-600 dark:text-stone-400">S (180°)</span>
                    <span className="absolute left-1.5 font-bold text-xs text-stone-600 dark:text-stone-400">B (270°)</span>

                    {/* Titik Pusat */}
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-md z-20"></div>

                    {/* Jarum Arah Kiblat */}
                    <div 
                      className="absolute w-full h-full flex items-center justify-center transition-transform duration-500 pointer-events-none"
                      style={{ transform: `rotate(${qiblaResult.azimuthDecimal}deg)` }}
                    >
                      <div className="h-20 w-1.5 bg-gradient-to-t from-transparent via-amber-500 to-amber-600 rounded-t-full shadow-lg relative -top-10 flex flex-col items-center">
                        <div className="w-3 h-3 bg-amber-400 rotate-45 -top-1 absolute shadow-xs"></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs">
                    <span className="text-stone-500 block">Azimut Kiblat:</span>
                    <strong className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                      {formatDMS(qiblaResult.azimuthDMS)}
                    </strong>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {qiblaResult.azimuthDecimal.toFixed(6)}° dari Utara Sejati
                    </p>
                  </div>
                </div>

                {/* Tabel Perhitungan Langkah demi Langkah (Persis Tabel Data Input User) */}
                <div className="md:col-span-2 p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b pb-2 border-stone-200 dark:border-stone-800">
                    <span className="font-bold font-sans text-stone-900 dark:text-white uppercase">
                      Langkah Hisab Spherical Trigonometry: {qiblaResult.locationName}
                    </span>
                    <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                      Presisi Tinggi
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-stone-50 dark:bg-stone-800/50">
                      <span className="text-stone-500">Lintang Tempat (φ tm):</span>
                      <p className="font-bold text-stone-800 dark:text-stone-200">
                        {qiblaResult.latDMS.deg}° {qiblaResult.latDMS.min}&apos; {qiblaResult.latDMS.sec}&quot; {qiblaResult.latDMS.dir} ({qiblaResult.latDecimal.toFixed(4)})
                      </p>
                    </div>

                    <div className="p-2 rounded bg-stone-50 dark:bg-stone-800/50">
                      <span className="text-stone-500">Bujur Tempat (λ tm):</span>
                      <p className="font-bold text-stone-800 dark:text-stone-200">
                        {qiblaResult.lngDMS.deg}° {qiblaResult.lngDMS.min}&apos; {qiblaResult.lngDMS.sec}&quot; {qiblaResult.lngDMS.dir} ({qiblaResult.lngDecimal.toFixed(7)})
                      </p>
                    </div>

                    <div className="p-2 rounded bg-stone-50 dark:bg-stone-800/50">
                      <span className="text-stone-500">Lintang Mekah (φ m):</span>
                      <p className="font-bold text-stone-800 dark:text-stone-200">21° 25&apos; 0&quot; U (21.4166667)</p>
                    </div>

                    <div className="p-2 rounded bg-stone-50 dark:bg-stone-800/50">
                      <span className="text-stone-500">Bujur Mekah (λ m):</span>
                      <p className="font-bold text-stone-800 dark:text-stone-200">39° 50&apos; 0&quot; T (39.8333333)</p>
                    </div>
                  </div>

                  {/* Rumus a, b, c */}
                  <div className="p-2.5 rounded bg-stone-50 dark:bg-stone-800/70 space-y-1 text-[11px]">
                    <div>a = 90 - ({qiblaResult.latDecimal.toFixed(4)}) = <strong>{qiblaResult.a.toFixed(4)}°</strong></div>
                    <div>b = 90 - (21.4167) = <strong>{qiblaResult.b.toFixed(4)}°</strong></div>
                    <div>c = {qiblaResult.lngDecimal.toFixed(4)} - 39.8333 = <strong>{qiblaResult.c.toFixed(4)}°</strong></div>
                  </div>

                  {/* Nilai Trigonometri */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-stone-50 dark:bg-stone-800/50">
                      cotan b = <strong>{qiblaResult.cotB_val.toFixed(10)}</strong>
                    </div>
                    <div className="p-2 rounded bg-stone-50 dark:bg-stone-800/50">
                      cotan c = <strong>{qiblaResult.cotC_val.toFixed(9)}</strong>
                    </div>
                    <div className="p-2 rounded bg-stone-50 dark:bg-stone-800/50">
                      sin a = <strong>{qiblaResult.sinA_val.toFixed(9)}</strong>
                    </div>
                    <div className="p-2 rounded bg-stone-50 dark:bg-stone-800/50">
                      sin c = <strong>{qiblaResult.sinC_val.toFixed(8)}</strong>
                    </div>
                    <div className="p-2 rounded bg-stone-50 dark:bg-stone-800/50">
                      cos a = <strong>{qiblaResult.cosA_val.toFixed(10)}</strong>
                    </div>
                  </div>

                  {/* Hasil Akhir */}
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 font-sans space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Arah Kiblat (Barat ke Utara / BU):</span>
                      <strong className="font-mono text-sm">{formatDMS(qiblaResult.qiblaDMS)} ({qiblaResult.qiblaAngleDecimal.toFixed(6)}°)</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-emerald-200 dark:border-emerald-800 pt-1">
                      <span>Azimut Kiblat (Utara sejati searah jarum jam):</span>
                      <strong className="font-mono text-sm text-emerald-700 dark:text-emerald-400">{formatDMS(qiblaResult.azimuthDMS)} ({qiblaResult.azimuthDecimal.toFixed(6)}°)</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
