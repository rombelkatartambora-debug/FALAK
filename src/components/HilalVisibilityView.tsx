import React, { useState, useMemo } from 'react';
import {
  Moon,
  Sun,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  MapPin,
  Sparkles,
  BookOpen,
  ArrowRight,
  Info
} from 'lucide-react';
import {
  ObserverLocation,
  calculateHilalVisibility,
  BULAN_HIJRIYAH_NAMES,
  formatDMSString
} from '../utils/astronomyMath';
import { getHijriDate } from '../utils/calendarMath';
import { CrescentVisualizer } from './CrescentVisualizer';

interface HilalVisibilityViewProps {
  observer: ObserverLocation;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const HilalVisibilityView: React.FC<HilalVisibilityViewProps> = ({ observer, onShowToast }) => {
  const [hijriYear, setHijriYear] = useState<number>(() => getHijriDate(new Date()).year);
  const [hijriMonthIdx, setHijriMonthIdx] = useState<number>(8); // 8 = Ramadhan (menentukan 1 Syawal)

  const hilalResult = useMemo(() => {
    return calculateHilalVisibility(hijriYear, hijriMonthIdx, observer);
  }, [hijriYear, hijriMonthIdx, observer]);

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 border border-emerald-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-700/30 shrink-0">
            <Moon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-400/30">
                Hisab Rukyatul Hilal & Visibilitas
              </span>
              <span className="text-xs text-stone-300 font-arabic"> </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Penentuan Awal Bulan Qamariyah
            </h2>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              Hisab persis Ijtima' Hakiki, posisi hilal saat Ghurub, dan evaluasi Kriteria MABIMS, Wujudul Hilal, serta Odeh
            </p>
          </div>
        </div>

        {/* Year & Month Form */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-black/40 rounded-2xl border border-white/10 text-xs">
          <div className="flex items-center gap-1.5 px-2">
            <span className="text-stone-400 font-semibold">Tahun:</span>
            <input
              type="number"
              min={1400}
              max={1550}
              value={hijriYear}
              onChange={(e) => setHijriYear(parseInt(e.target.value, 10) || getHijriDate(new Date()).year)}
              className="w-20 bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="text-stone-400 font-bold">H</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 border-l border-stone-800">
            <span className="text-stone-400 font-semibold">Bulan:</span>
            <select
              value={hijriMonthIdx}
              onChange={(e) => setHijriMonthIdx(parseInt(e.target.value, 10))}
              className="bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-emerald-500"
            >
              {BULAN_HIJRIYAH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {idx + 1}. {name} (Menentukan {BULAN_HIJRIYAH_NAMES[(idx + 1) % 12]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid: Hasil Ijtima' + Kriteria Visibilitas + Visualisasi Sabit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Hasil Ijtima' & Parameter Hilal saat Ghurub (7 Kolom) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card Ijtima' Hakiki */}
          <div className="p-5 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>1. Ijtima' Hakiki (Konjungsi Geosentris)</span>
              </span>
              <span className="text-[11px] font-mono text-stone-500">Meeus Analytical ELP-2000</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800/80 space-y-2">
              <span className="text-xs text-stone-400 block">Waktu Terjadinya Ijtima' Hakiki:</span>
              <div className="text-base sm:text-lg font-black text-white">
                {hilalResult.conjunctionFormatted}
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed pt-1 border-t border-stone-800/80">
                Pada saat ini, bujur ekliptika Matahari dan Bulan berada pada garis bujur yang sama ( = ).
              </p>
            </div>

            {/* Parameter Hilal Saat Matahari Terbenam (Ghurub) */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                2. Posisi Hilal Saat Matahari Terbenam ({observer.name})
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block mb-1">Tinggi Hilal Hakiki:</span>
                  <span className="font-mono font-bold text-white text-sm block">
                    {formatDMSString(hilalResult.moonAltitudeAtSunset, true)}
                  </span>
                  <span className="text-[10px] text-stone-500">Geometric Altitude</span>
                </div>

                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block mb-1">Tinggi Hilal Mar'i:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm block">
                    {formatDMSString(hilalResult.moonApparentAltitudeAtSunset, true)}
                  </span>
                  <span className="text-[10px] text-stone-500">Terkoreksi Refraksi & Parallax</span>
                </div>

                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block mb-1">Sudut Elongasi:</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm block">
                    {formatDMSString(hilalResult.elongationAtSunset)}
                  </span>
                  <span className="text-[10px] text-stone-500">Jarak Busur Matahari-Bulan</span>
                </div>

                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block mb-1">Lama Hilal (Mukuts):</span>
                  <span className="font-mono font-bold text-yellow-400 text-sm block">
                    {hilalResult.lagTimeMinutes} Menit
                  </span>
                  <span className="text-[10px] text-stone-500">Di atas ufuk setelah Ghurub</span>
                </div>

                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block mb-1">Lebar Nurul Hilal:</span>
                  <span className="font-mono font-bold text-white text-sm block">
                    {hilalResult.nurulHilalFinger} Jari (Isba')
                  </span>
                  <span className="text-[10px] text-stone-500">Lebar: {hilalResult.crescentWidth.toFixed(2)}'</span>
                </div>

                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block mb-1">Beda Azimuth:</span>
                  <span className="font-mono font-bold text-white text-sm block">
                    {formatDMSString(hilalResult.relativeAzimuth)}
                  </span>
                  <span className="text-[10px] text-stone-500">Azim Bulan - Matahari</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Evaluasi Kriteria Visibilitas & Visual Sabit (5 Kolom) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Visualisasi Sabit Hilal */}
          <CrescentVisualizer
            phaseFraction={hilalResult.crescentWidth / 60}
            elongationDeg={hilalResult.elongationAtSunset}
            crescentWidthArcMin={hilalResult.crescentWidth}
            orientationName={hilalResult.crescentOrientation}
            positionAngleLimbDeg={
              hilalResult.crescentOrientation.includes('Selatan')
                ? 15
                : hilalResult.crescentOrientation.includes('Utara')
                ? -15
                : 0
            }
          />

          {/* Evaluasi Tiga Kriteria Falakiyah */}
          <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300 block">
              Evaluasi Kriteria Visibilitas Falak
            </span>

            {/* Kriteria 1: MABIMS Baru */}
            <div className={`p-4 rounded-2xl border ${
              hilalResult.mabimsCriteria.passed
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : 'bg-stone-950/60 border-stone-800'
            } space-y-1.5`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  {hilalResult.mabimsCriteria.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-stone-500" />
                  )}
                  <span>Kriteria Baru MABIMS (2021)</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  hilalResult.mabimsCriteria.passed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-stone-800 text-stone-400'
                }`}>
                  {hilalResult.mabimsCriteria.passed ? 'Memenuhi Syarat' : 'Belum Memenuhi'}
                </span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                Syarat: Tinggi hilal mar'i 3° dan sudut elongasi 6.4°.
              </p>
              <p className="text-[10px] text-stone-400 italic">
                {hilalResult.mabimsCriteria.reason}
              </p>
            </div>

            {/* Kriteria 2: Wujudul Hilal */}
            <div className={`p-4 rounded-2xl border ${
              hilalResult.wujudulHilalCriteria.passed
                ? 'bg-amber-950/40 border-amber-500/40'
                : 'bg-stone-950/60 border-stone-800'
            } space-y-1.5`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  {hilalResult.wujudulHilalCriteria.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-stone-500" />
                  )}
                  <span>Kriteria Wujudul Hilal</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  hilalResult.wujudulHilalCriteria.passed
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-stone-800 text-stone-400'
                }`}>
                  {hilalResult.wujudulHilalCriteria.passed ? 'Hilal Wujud' : 'Belum Wujud'}
                </span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                Syarat: Ijtima' terjadi sebelum terbenam matahari dan piringan bulan di atas ufuk (&gt; 0°).
              </p>
            </div>

            {/* Kriteria 3: Odeh (2006) */}
            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-sky-400" />
                  <span>Kriteria Astronomis Odeh (2006)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-sky-300 font-bold">
                  Zona {hilalResult.odehCriteria.code}
                </span>
              </div>
              <p className="text-[11px] text-stone-300">
                {hilalResult.odehCriteria.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
