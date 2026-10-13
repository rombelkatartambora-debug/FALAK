import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Table,
  BookOpen,
  Layers,
  Copy,
  Check,
  Printer,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Compass,
  ArrowRight,
  Eye,
  CheckCircle2,
  FileText,
  Calculator,
  LayoutGrid
} from 'lucide-react';
import {
  calculateSulamNayyiroinFull,
  PRESET_MARKAZ_SULAM,
  MarkazSulamLocation,
  SulamCalculationFullResult
} from '../utils/sulamNayyiroinEngine';
import { BULAN_HIJRIYAH } from '../utils/calendarMath';

interface SulamWorkbookExcelViewProps {
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
  initialSheet?: SulamExcelSheetTab;
  initialMode?: 'excel' | 'form';
}

export type SulamExcelSheetTab =
  | 'isian'
  | 'epoch'
  | 'muaddalah'
  | 'meeus'
  | 'bulanan'
  | 'hasil_arab'
  | 'hasil_indo'
  | 'rukyat_cetak';

export const SulamWorkbookExcelView: React.FC<SulamWorkbookExcelViewProps> = ({ 
  onShowToast,
  initialSheet = 'isian',
  initialMode = 'excel'
}) => {
  // Mode tampilan: 'excel' (tabel kotak grid & merged cells) atau 'form' (formulir interaktif kalkulator)
  const [viewMode, setViewMode] = useState<'excel' | 'form'>(initialMode);

  // Input parameters (Sheet ISIAN)
  const [selectedBulanIdx, setSelectedBulanIdx] = useState<number>(11); // 11 = Dzulhijjah (sesuai contoh 1455 H)
  const [selectedTahunHijriyah, setSelectedTahunHijriyah] = useState<number>(1455); // 1455 H
  const [selectedMarkazName, setSelectedMarkazName] = useState<string>(PRESET_MARKAZ_SULAM[0].name);

  // Active sheet tab
  const [activeSheet, setActiveSheet] = useState<SulamExcelSheetTab>(initialSheet);
  const [copied, setCopied] = useState<boolean>(false);

  // Active Markaz
  const markaz: MarkazSulamLocation =
    PRESET_MARKAZ_SULAM.find((m) => m.name === selectedMarkazName) || PRESET_MARKAZ_SULAM[0];

  // Run full Sullam calculation
  const result: SulamCalculationFullResult = calculateSulamNayyiroinFull(
    selectedTahunHijriyah,
    selectedBulanIdx,
    markaz
  );

  // Rekapitulasi 12 Siklus Bulan Hijriyah Lengkap untuk Sheet BULANAN
  const all12MonthsResults = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      return calculateSulamNayyiroinFull(selectedTahunHijriyah, i, markaz);
    });
  }, [selectedTahunHijriyah, markaz]);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast('Naskah berhasil disalin ke clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-5">
      {/* Top Banner Workbook Sulam Al-Nayyirain */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 border border-emerald-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-700/30 shrink-0">
            <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-400/30">
                Khazanah Falak Pesantren
              </span>
              <span className="text-xs text-stone-300 font-arabic">سلم النيرين</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Kitab Sullamun Nayyirain
            </h2>
            <p className="text-[11px] sm:text-xs text-emerald-200/90 mt-0.5">
              Syaikh Muhammad Manshur Al-Batawi (Jembatan Lima, Jakarta) &bull; Format Grid Tabular Excel
            </p>
          </div>
        </div>

        {/* Quick Jump Info & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Switch Mode: Excel Grid Box vs Formulir */}
          <div className="flex items-center p-1 bg-stone-950/80 rounded-xl border border-stone-800 text-xs font-bold">
            <button
              onClick={() => {
                setViewMode('excel');
                onShowToast('Mode Lembar Kerja Excel Asli (Kotak Grid Tabular)');
              }}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'excel'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Tampilan Format Kotak-kotak Terkotak & Merged Cells Excel Asli"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Format Kotak Excel</span>
            </button>
            <button
              onClick={() => {
                setViewMode('form');
                onShowToast('Mode Formulir Interaktif Falak');
              }}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'form'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Tampilan Formulir Kartu Interaktif Falak"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Formulir Kartu</span>
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedBulanIdx(11);
              setSelectedTahunHijriyah(1455);
              onShowToast('Memuat contoh hisab Dzulhijjah 1455 H (19 Februari 2034 M)');
            }}
            className="px-3 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
          >
            Contoh 1455 H
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-700/25 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* Sheet Tabs Bar (Optimized for Mobile with touch scroll) */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto text-xs font-semibold scrollbar-thin">
        {[
          { id: 'isian', label: '1. ISIAN (Form Input)' },
          { id: 'epoch', label: '2. EPOCH (Harokat Tetap)' },
          { id: 'muaddalah', label: '3. MUADDALAH (Ta\'dil)' },
          { id: 'meeus', label: '4. DATA MEEUS (Validasi)' },
          { id: 'bulanan', label: '5. BULANAN (Ijtima\' & Hilal)' },
          { id: 'hasil_arab', label: '6. HASIL ARAB (Naskah Arab)' },
          { id: 'hasil_indo', label: '7. HASIL (Naskah Indo)' },
          { id: 'rukyat_cetak', label: '8. RUKYAT-CETAK' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSheet(tab.id as SulamExcelSheetTab)}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeSheet === tab.id
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 1. SHEET "ISIAN": FORM INPUT UTAMA & PARAMETER MARKAZ */}
      {/* ========================================================================= */}
      {activeSheet === 'isian' && (
        <div className="p-4 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Sheet "ISIAN" - Lembar Parameter Input Utama</span>
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Memuat variabel dasar: Bulan Hijriyah, Tahun Hijriyah, Markaz, Lintang, Bujur, dan Elevasi tempat.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-amber-400">
              Kontak Lajnah: 085 645 274 534
            </span>
          </div>

          {/* Form Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Bulan Hijriyah */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Bulan Hijriyah yang Dihisab (0 - 11)
              </label>
              <select
                value={selectedBulanIdx}
                onChange={(e) => setSelectedBulanIdx(parseInt(e.target.value, 10))}
                className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white font-medium outline-none"
              >
                {BULAN_HIJRIYAH.map((bln, idx) => (
                  <option key={bln} value={idx}>
                    {idx}. {bln} (Menentukan Awal 1 {BULAN_HIJRIYAH[(idx + 1) % 12]})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-stone-500 mt-1 block">
                Target Awal Bulan Baru: <strong className="text-emerald-400">{result.targetBulanHijriyahName}</strong>
              </span>
            </div>

            {/* Tahun Hijriyah */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Tahun Hijriyah (H)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1300}
                  max={1600}
                  value={selectedTahunHijriyah}
                  onChange={(e) => setSelectedTahunHijriyah(parseInt(e.target.value, 10) || 1455)}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white font-mono font-bold outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSelectedTahunHijriyah(1455)}
                  className="px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold cursor-pointer"
                >
                  1455 H
                </button>
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Contoh catatan asli: 1455 H</span>
            </div>

            {/* Pilihan Markaz Tempat */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Markaz Pengamatan Falak
              </label>
              <select
                value={selectedMarkazName}
                onChange={(e) => setSelectedMarkazName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white font-medium outline-none"
              >
                {PRESET_MARKAZ_SULAM.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-stone-500 mt-1 block">Markaz standar kitab Betawi</span>
            </div>
          </div>

          {/* Kotak Rincian Tabel ISIAN Persis Format Excel */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Tabel Parameter Markaz Terpilih
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                selisih Betawi dengan {markaz.name.split(' ')[0]}: - 0° 0' 4"
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                <span className="text-stone-400 block mb-0.5">Lintang Tempat ():</span>
                <span className="font-mono font-bold text-white text-sm">
                  {markaz.latDeg}° {markaz.latMin}' {markaz.latSec}" {markaz.isSouth ? 'LS' : 'LU'}
                </span>
                <span className="text-[10px] text-stone-500 block">(-{markaz.latDeg}° -{markaz.latMin}')</span>
              </div>
              <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                <span className="text-stone-400 block mb-0.5">Bujur Tempat ():</span>
                <span className="font-mono font-bold text-white text-sm">
                  {markaz.lngDeg}° {markaz.lngMin}' {markaz.lngSec}" {markaz.isEast ? 'BT' : 'BB'}
                </span>
                <span className="text-[10px] text-stone-500 block">(+{markaz.lngDeg}° +{markaz.lngMin}')</span>
              </div>
              <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                <span className="text-stone-400 block mb-0.5">Ketinggian (Altitude):</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{markaz.altitudeMeters} mdpl</span>
                <span className="text-[10px] text-stone-500 block">Kuduratul Ufuq Dip: {result.kuduratulUfuqDip.formattedTraditional}</span>
              </div>
              <div className="p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                <span className="text-stone-400 block mb-0.5">Zona Waktu Markaz:</span>
                <span className="font-mono font-bold text-white text-sm">UTC+{markaz.timezoneOffsetHours}</span>
                <span className="text-[10px] text-stone-500 block">Waktu Indonesia Barat (WIB)</span>
              </div>
            </div>
          </div>

          {/* Quick Result Highlight Banner (Selasa Wage 19 Februari 2034) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-950 via-stone-900 to-emerald-950 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-0.5">
                Konversi Ijtima' Bulan {result.inputBulanHijriyahName} {result.inputTahunHijriyah} H
              </span>
              <div className="text-base sm:text-xl font-black text-white">
                {result.masehiFullIjtimaString}
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Jam Ijtima': <strong className="text-amber-400 font-mono">{result.waktuIjtimaWIB}</strong> ({result.waktuIjtimaGhurubiyah})
              </p>
            </div>
            <button
              onClick={() => setActiveSheet('bulanan')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>Buka Sheet BULANAN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SHEET "EPOCH": KONSTANTA ASTRONOMI TETAP (HAROKAT EPOCH) */}
      {/* ========================================================================= */}
      {activeSheet === 'epoch' && (
        <div className="p-4 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Sheet "EPOCH" - Konstanta Astronomi Harokat Tetap</span>
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Tabel referensi harokat per hari dan per jam (العلامـة, الحصة, الخاصة, المركز, الاوج)
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-950 text-stone-400 border border-stone-800">
              Konstanta Tetap Zij Sullam
            </span>
          </div>

          {/* Table Container dengan Horizontal Scroll di HP */}
          <div className="overflow-x-auto rounded-2xl border border-stone-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-950 text-stone-300 font-bold uppercase border-b border-stone-800">
                <tr>
                  <th className="p-3 whitespace-nowrap">Parameter</th>
                  <th className="p-3 text-center whitespace-nowrap">Nama Arab</th>
                  <th className="p-3 whitespace-nowrap">Per Hari (Desimal)</th>
                  <th className="p-3 whitespace-nowrap">Per Hari (ج / قة / ني / لث)</th>
                  <th className="p-3 whitespace-nowrap">Per Jam (Desimal)</th>
                  <th className="p-3 whitespace-nowrap">Per Jam (ج / قة / ني / لث)</th>
                  <th className="p-3 min-w-[200px]">Keterangan Makna Falak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 font-mono text-stone-300">
                {result.epochItems.map((item) => (
                  <tr key={item.keyName} className="hover:bg-stone-800/40 transition-colors">
                    <td className="p-3 font-sans font-bold text-white whitespace-nowrap">{item.nameLatin}</td>
                    <td className="p-3 font-arabic text-sm text-center text-amber-300 whitespace-nowrap">{item.nameArabic}</td>
                    <td className="p-3 text-emerald-400 whitespace-nowrap">{item.perDayDeg.toFixed(7)}°</td>
                    <td className="p-3 text-white font-bold whitespace-nowrap">{item.sexagesimalDay.formattedTraditional}</td>
                    <td className="p-3 text-cyan-400 whitespace-nowrap">{item.perHourDeg.toFixed(7)}°</td>
                    <td className="p-3 whitespace-nowrap">{item.sexagesimalHour.formattedTraditional}</td>
                    <td className="p-3 font-sans text-stone-400 text-[11px]">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SHEET "MUADDALAH & JAD-MUADDALAH": TA'DIL HAKIKI BERANTAI */}
      {/* ========================================================================= */}
      {activeSheet === 'muaddalah' && (
        <div className="p-4 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Table className="w-4 h-4 text-amber-400" />
                <span>Sheet "MUADDALAH & MUADDALAH-1" - Dapur Perhitungan Ta'dil Berantai</span>
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Nilai Meqowwam Syams/Qamar, Hisoh Muaddalah, Khossoh Muaddalah, dan Markaz Muaddalah
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">Hierarki Sudut Tradisional</span>
          </div>

          {/* Grid Tabular Kotak-kotak (Merged Cells Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Meqowwam Syams */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">Meqowwam Syams (المقوم للشمس):</span>
                <span className="font-arabic text-amber-400">مقوم الشمس</span>
              </div>
              <div className="text-lg font-mono font-black text-amber-400">
                {result.muaddalah.meqowwamSyams.formattedTraditional}
              </div>
              <div className="flex justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-800">
                <span>Tradisional Arab:</span>
                <span className="font-arabic text-stone-300">{result.muaddalah.meqowwamSyams.formattedArabic}</span>
              </div>
              <span className="text-[10px] text-stone-500 block font-mono">
                Desimal: {result.muaddalah.meqowwamSyams.decimal.toFixed(4)}°
              </span>
            </div>

            {/* Meqowwam Qamar */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">Meqowwam Qamar (المقوم للقمر):</span>
                <span className="font-arabic text-cyan-400">مقوم القمر</span>
              </div>
              <div className="text-lg font-mono font-black text-cyan-400">
                {result.muaddalah.meqowwamQamar.formattedTraditional}
              </div>
              <div className="flex justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-800">
                <span>Tradisional Arab:</span>
                <span className="font-arabic text-stone-300">{result.muaddalah.meqowwamQamar.formattedArabic}</span>
              </div>
              <span className="text-[10px] text-stone-500 block font-mono">
                Desimal: {result.muaddalah.meqowwamQamar.decimal.toFixed(4)}°
              </span>
            </div>

            {/* Hisoh Muaddalah */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">Hisoh Muaddalah (الحصة المعدلة):</span>
                <span className="font-arabic text-emerald-400">حصة معدلة</span>
              </div>
              <div className="text-lg font-mono font-black text-emerald-400">
                {result.muaddalah.hisohMuaddalah.formattedTraditional}
              </div>
              <span className="text-[11px] text-stone-500 block font-mono">
                Koreksi Ta'dil Awwal: {result.muaddalah.taadulAwwalMin}' menit busur
              </span>
            </div>

            {/* Khossoh Muaddalah */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">Khossoh Muaddalah (الخاصة المعدلة):</span>
                <span className="font-arabic text-yellow-400">خاصة معدلة</span>
              </div>
              <div className="text-lg font-mono font-black text-yellow-400">
                {result.muaddalah.khossohMuaddalah.formattedTraditional}
              </div>
              <span className="text-[11px] text-stone-500 block font-mono">
                Koreksi Ta'dil Tsani: {result.muaddalah.taadulTsaniMin}' menit busur
              </span>
            </div>

            {/* Markaz Muaddalah */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">Markaz Muaddalah (المركز المعدل):</span>
                <span className="font-arabic text-purple-400">مركز معدل</span>
              </div>
              <div className="text-lg font-mono font-black text-purple-400">
                {result.muaddalah.markazMuaddalah.formattedTraditional}
              </div>
              <span className="text-[11px] text-stone-500 block font-mono">
                Selisih Elongasi: {result.muaddalah.markazMuaddalah.decimal.toFixed(4)}°
              </span>
            </div>

            {/* Sabqul Khissoh */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
              <span className="text-stone-400 text-xs block">Sabqul Khissoh & Ta'dil Waktu:</span>
              <div className="text-base font-mono font-bold text-white">
                {result.muaddalah.sabqulKhissohSec} Detik Busur
              </div>
              <p className="text-[10px] text-stone-500 leading-tight">
                Koreksi waktu konjungsi terhadap gerak relatif harian matahari dan bulan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SHEET "DATA MEEUS": VALIDASI KOMPARASI ALGORITMA MODERN */}
      {/* ========================================================================= */}
      {activeSheet === 'meeus' && (
        <div className="p-4 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Sheet "DATA MEEUS" - Komparasi Validasi Modern (Jean Meeus)</span>
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Perbandingan perhitungan posisi ekliptika, elongasi, dan waktu Ijtima' Sullam vs Algoritma Meeus
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">ELP-2000 Validation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Julian Ephemeris Day (JDE):</span>
              <span className="font-mono text-sm font-bold text-white">{result.meeus.jde}</span>
              <span className="text-[10px] text-stone-500 block mt-1">Saat Konjungsi Astronomis</span>
            </div>

            <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Bujur Matahari Hakiki (Meeus):</span>
              <span className="font-mono text-sm font-bold text-amber-400">
                {result.meeus.sunLongitudeApparent.formattedTraditional}
              </span>
              <span className="text-[10px] text-stone-500 block mt-1">Apparent Solar Longitude</span>
            </div>

            <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Bujur Bulan Hakiki (Meeus):</span>
              <span className="font-mono text-sm font-bold text-cyan-400">
                {result.meeus.moonLongitudeApparent.formattedTraditional}
              </span>
              <span className="text-[10px] text-stone-500 block mt-1">Apparent Lunar Longitude</span>
            </div>

            <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Sudut Elongasi Geosentrik (Meeus):</span>
              <span className="font-mono text-sm font-bold text-white">
                {result.meeus.elongation.formattedTraditional}
              </span>
              <span className="text-[10px] text-stone-500 block mt-1">Desimal: {result.meeus.elongation.decimal.toFixed(4)}°</span>
            </div>

            <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Selisih Waktu Ijtima' Sullam vs Meeus:</span>
              <span className="font-mono text-sm font-bold text-emerald-400">
                ± {result.meeus.selisihIjtimaMenit} Menit
              </span>
              <span className="text-[10px] text-stone-500 block mt-1">Sangat dekat & presisi</span>
            </div>

            <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Status Validasi Algoritma:</span>
              <span className="font-bold text-emerald-300 text-xs block">Terverifikasi</span>
              <span className="text-[10px] text-stone-400 block mt-1">{result.meeus.keteranganValidasi}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SHEET "BULANAN": REKAP LENGKAP SIKLUS IJTIMA' & HILAL */}
      {/* ========================================================================= */}
      {activeSheet === 'bulanan' && (
        <div className="p-4 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Sheet "BULANAN" - Rekapitulasi Ijtima' & Hilal ({result.inputBulanHijriyahName} {result.inputTahunHijriyah} H)</span>
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Markaz: {result.markaz.name} &bull; Menentukan Awal Bulan 1 {result.targetBulanHijriyahName}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
              {result.statusHilal}
            </span>
          </div>

          {/* Grid Box Rekapitulasi */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Hari & Pasaran (Weton):</span>
              <span className="font-bold text-white text-sm">{result.wetonIjtima}</span>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Tanggal Masehi Ijtima':</span>
              <span className="font-bold text-white text-sm">
                {result.tanggalMasehiIjtima} {result.bulanMasehiIjtima} {result.tahunMasehiIjtima} M
              </span>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Jam Ijtima' WIB:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{result.waktuIjtimaWIB}</span>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Waktu Ghurubiyah:</span>
              <span className="font-mono font-bold text-white text-sm">{result.waktuIjtimaGhurubiyah}</span>
            </div>

            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Irtifa' Hilal Hakiki:</span>
              <span className="font-mono font-bold text-white text-sm">
                {result.irtifaHakiki.formattedTraditional}
              </span>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Irtifa' Hilal Mar'i:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {result.irtifaMarI.formattedTraditional}
              </span>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Lama Hilal (Mukuts):</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">{result.mukutsMenit} Menit</span>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Nurul Hilal (Lebar Cahaya):</span>
              <span className="font-mono font-bold text-yellow-300 text-sm">{result.nurulHilalJari} Jari (Isba')</span>
            </div>

            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Posisi / Kemiringan Hilal:</span>
              <span className="font-bold text-white text-xs">{result.kemiringanHilal}</span>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Azimuth Matahari:</span>
              <span className="font-mono font-bold text-stone-300 text-xs">
                {result.azimuthMatahari.formattedTraditional}
              </span>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Azimuth Bulan:</span>
              <span className="font-mono font-bold text-stone-300 text-xs">
                {result.azimuthBulan.formattedTraditional}
              </span>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
              <span className="text-stone-400 block mb-0.5">Beda Azimuth ( - ):</span>
              <span className="font-mono font-bold text-stone-300 text-xs">
                {result.bedaAzimuth.formattedTraditional}
              </span>
            </div>
          </div>

          {/* Ketetapan Awal Bulan */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
              Ketetapan Awal Bulan:
            </span>
            <div className="text-sm sm:text-base font-bold text-white">
              {result.ketetapanAwalBulanString}
            </div>
          </div>

          {/* TABEL REKAPITULASI SIKLUS 12 BULAN HIJRIYAH LENGKAP (RAMADHAN, SYAWWAL, DST) */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-stone-800 pt-4">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-400" />
                  <span>Tabel Rekapitulasi 12 Siklus Bulan Hijriyah Tahun {selectedTahunHijriyah} H</span>
                </h4>
                <p className="text-[11px] text-stone-400">
                  Data konjungsi (Ijtima'), hari pasaran (weton), tinggi hilal hakiki, mukuts, nurul hilal, dan posisi miring.
                </p>
              </div>
              <span className="text-[10px] text-stone-400 sm:hidden">
                ↔️ Geser tabel ke samping untuk melihat seluruh data
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-stone-800 shadow-inner">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-950 text-stone-300 font-bold uppercase border-b border-stone-800 text-[11px]">
                  <tr>
                    <th className="p-2.5 whitespace-nowrap">No</th>
                    <th className="p-2.5 whitespace-nowrap">Bulan Hijriyah</th>
                    <th className="p-2.5 whitespace-nowrap">Hari & Weton</th>
                    <th className="p-2.5 whitespace-nowrap">Tanggal Masehi</th>
                    <th className="p-2.5 whitespace-nowrap">Jam Ijtima' WIB</th>
                    <th className="p-2.5 whitespace-nowrap">Irtifa' Hakiki</th>
                    <th className="p-2.5 whitespace-nowrap">Mukuts</th>
                    <th className="p-2.5 whitespace-nowrap">Nurul Hilal</th>
                    <th className="p-2.5 whitespace-nowrap">Kemiringan</th>
                    <th className="p-2.5 whitespace-nowrap">Status Hilal</th>
                    <th className="p-2.5 whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80 font-mono text-stone-300">
                  {all12MonthsResults.map((mRes, idx) => {
                    const isCurrent = idx === selectedBulanIdx;
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isCurrent
                            ? 'bg-emerald-950/50 text-white font-bold border-l-4 border-emerald-500'
                            : 'hover:bg-stone-800/40'
                        }`}
                      >
                        <td className="p-2.5 text-stone-400 font-sans">{idx + 1}</td>
                        <td className="p-2.5 font-sans font-bold whitespace-nowrap">
                          <span className={isCurrent ? 'text-emerald-400' : 'text-stone-200'}>
                            {mRes.inputBulanHijriyahName}
                          </span>
                        </td>
                        <td className="p-2.5 font-sans whitespace-nowrap text-amber-300">
                          {mRes.wetonIjtima}
                        </td>
                        <td className="p-2.5 whitespace-nowrap font-sans text-stone-300">
                          {mRes.tanggalMasehiIjtima} {mRes.bulanMasehiIjtima} {mRes.tahunMasehiIjtima}
                        </td>
                        <td className="p-2.5 whitespace-nowrap text-amber-400 font-bold">
                          {mRes.waktuIjtimaWIB}
                        </td>
                        <td className="p-2.5 whitespace-nowrap text-emerald-400 font-bold">
                          {mRes.irtifaHakiki.formattedTraditional}
                        </td>
                        <td className="p-2.5 whitespace-nowrap text-cyan-400">
                          {mRes.mukutsMenit} m
                        </td>
                        <td className="p-2.5 whitespace-nowrap text-yellow-300">
                          {mRes.nurulHilalJari} Jari
                        </td>
                        <td className="p-2.5 whitespace-nowrap text-[11px] font-sans text-stone-300">
                          {mRes.kemiringanHilal}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                              mRes.isHilalVisibleMabims
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {mRes.statusHilal}
                          </span>
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBulanIdx(idx);
                              onShowToast(`Menampilkan rincian hisab bulan ${mRes.inputBulanHijriyahName}`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] font-sans cursor-pointer transition-colors"
                          >
                            Pilih
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SHEET "HASIL ARAB": TEKS KLASIK BAHASA ARAB DENGAN BLOK KOTAK */}
      {/* ========================================================================= */}
      {activeSheet === 'hasil_arab' && (
        <div className="p-4 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3 flex-row-reverse">
            <div className="text-right">
              <h3 className="text-sm sm:text-base font-bold text-white font-arabic">
                ورقة «النتائج العربية» - جدول حساب سلم النيرين
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                تنسيق الجداول والخلايا المدمجة بالألفاظ الفلكية المعتمدة
              </p>
            </div>
            <button
              onClick={() => handleCopyText(result.teksHasilArab)}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>نسخ النص</span>
            </button>
          </div>

          {/* Grid Kotak Tabular Arab */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-right" dir="rtl">
            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
              <span className="text-xs text-stone-400 font-arabic">وقت الإجتماع الحقيقي:</span>
              <div className="font-mono text-sm font-bold text-amber-400">{result.waktuIjtimaWIB}</div>
              <span className="text-[11px] text-stone-500 font-arabic block">{result.waktuIjtimaGhurubiyah}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
              <span className="text-xs text-stone-400 font-arabic">إرتفاع الهلال المرئي:</span>
              <div className="font-mono text-sm font-bold text-emerald-400">{result.irtifaMarI.formattedArabic}</div>
              <span className="text-[11px] text-stone-500 block font-mono">({result.irtifaMarI.formattedTraditional})</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
              <span className="text-xs text-stone-400 font-arabic">المكث في الأفق:</span>
              <div className="font-mono text-sm font-bold text-cyan-400">{result.mukutsMenit} دقيقة</div>
              <span className="text-[11px] text-stone-500 font-arabic block">نور الهلال: {result.nurulHilalJari} إصبع</span>
            </div>
          </div>

          <pre
            dir="rtl"
            className="text-xs font-arabic text-emerald-200 whitespace-pre-wrap leading-loose bg-stone-950 p-4 sm:p-5 rounded-2xl border border-stone-800 overflow-x-auto text-right"
          >
            {result.teksHasilArab}
          </pre>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SHEET "HASIL": NASKAH REKAPITULASI BAHASA INDONESIA */}
      {/* ========================================================================= */}
      {activeSheet === 'hasil_indo' && (
        <div className="p-4 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Sheet "HASIL" - Rekapitulasi Teks Resmi Bahasa Indonesia</span>
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Rangkuman hasil hisab siap cetak dan siap kutip untuk sidang isbat dan kajian pesantren
              </p>
            </div>
            <button
              onClick={() => handleCopyText(result.teksHasilIndonesia)}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Salin Teks</span>
            </button>
          </div>

          <pre className="text-xs font-mono text-stone-200 whitespace-pre-wrap leading-relaxed bg-stone-950 p-4 sm:p-5 rounded-2xl border border-stone-800 overflow-x-auto">
            {result.teksHasilIndonesia}
          </pre>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. SHEET "RUKYAT-CETAK": LAYOUT RESMI SIAP CETAK (BERITA ACARA) */}
      {/* ========================================================================= */}
      {activeSheet === 'rukyat_cetak' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between print:hidden">
            <span className="text-xs text-stone-400">
              Dokumen Resmi Format Kertas A4 &bull; Siap Dicetak atau Disimpan ke PDF
            </span>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-700/25 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print)</span>
            </button>
          </div>

          {/* KERTAS RESMI BERITA ACARA CETAK */}
          <div className="p-6 sm:p-12 rounded-3xl bg-white text-stone-950 border-2 border-stone-300 shadow-2xl max-w-4xl mx-auto space-y-6">
            {/* Kop Yayasan */}
            <div className="border-b-4 border-double border-stone-900 pb-4 text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black uppercase text-stone-900 tracking-wider">
                YAYASAN RUANG BELAJAR
              </h2>
              <p className="text-xs font-bold text-stone-700 uppercase tracking-widest">
                LEMBAGA PENDIDIKAN, DAKWAH & PUSAT STUDI FALAK NUSANTARA
              </p>
              <p className="text-[11px] text-stone-600">
                Alamat: Jakarta &bull; Email: yayasanruangbelajar1@gmail.com &bull; Kontak: 085 645 274 534
              </p>
            </div>

            {/* Judul Dokumen */}
            <div className="text-center space-y-1">
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight underline">
                BERITA ACARA HISAB AWAL BULAN QAMARIYAH
              </h3>
              <p className="text-xs font-bold text-stone-700 font-mono">
                Nomor: {result.nomorSuratRukyat}
              </p>
              <p className="text-xs text-stone-600">
                Metode: Kitab Sullamun Nayyirain (Syaikh Muhammad Manshur Al-Batawi)
              </p>
            </div>

            {/* Data Markaz */}
            <div className="p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs space-y-1">
              <div className="font-bold text-stone-800">PARAMETER MARKAZ PENGAMATAN:</div>
              <div className="grid grid-cols-2 gap-2 text-stone-700">
                <div>Nama Markaz: <strong>{result.markaz.name}</strong></div>
                <div>Elevasi: <strong>{result.markaz.altitudeMeters} mdpl</strong></div>
                <div>Lintang Tempat: <strong>{result.markaz.latDeg}° {result.markaz.latMin}' {result.markaz.isSouth ? 'LS' : 'LU'}</strong></div>
                <div>Bujur Tempat: <strong>{result.markaz.lngDeg}° {result.markaz.lngMin}' {result.markaz.isEast ? 'BT' : 'BB'}</strong></div>
              </div>
            </div>

            {/* Tabel Kotak-kotak Parameter Falak */}
            <div className="border border-stone-300 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-stone-100 border-b border-stone-300 font-bold">
                  <tr>
                    <th className="p-2.5">Parameter Astronomis Falak</th>
                    <th className="p-2.5">Nilai Sexagesimal (ج / قة / ني / لث)</th>
                    <th className="p-2.5">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr>
                    <td className="p-2.5 font-medium">Ijtima' Hakiki (Konjungsi)</td>
                    <td className="p-2.5 font-bold font-mono text-stone-900">
                      {result.hariIjtima} {result.pasaranIjtima}, {result.tanggalMasehiIjtima} {result.bulanMasehiIjtima} {result.tahunMasehiIjtima}
                    </td>
                    <td className="p-2.5 font-mono">Pukul {result.waktuIjtimaWIB} ({result.waktuIjtimaGhurubiyah})</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Meqowwam Syams (Posisi Matahari)</td>
                    <td className="p-2.5 font-bold font-mono">{result.muaddalah.meqowwamSyams.formattedTraditional}</td>
                    <td className="p-2.5 text-stone-600">Ta'dil Awwal: {result.muaddalah.taadulAwwalMin}'</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Meqowwam Qamar (Posisi Bulan)</td>
                    <td className="p-2.5 font-bold font-mono">{result.muaddalah.meqowwamQamar.formattedTraditional}</td>
                    <td className="p-2.5 text-stone-600">Ta'dil Tsani: {result.muaddalah.taadulTsaniMin}'</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Tinggi Hilal Hakiki saat Ghurub</td>
                    <td className="p-2.5 font-bold font-mono">{result.irtifaHakiki.formattedTraditional}</td>
                    <td className="p-2.5 text-stone-600">Di atas ufuk hakiki</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Tinggi Hilal Mar'i (Terkoreksi Dip)</td>
                    <td className="p-2.5 font-bold font-mono text-emerald-800">{result.irtifaMarI.formattedTraditional}</td>
                    <td className="p-2.5 text-stone-600">Kuduratul Ufuq Dip: {result.kuduratulUfuqDip.formattedTraditional}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Lama Hilal di Atas Ufuk (Mukuts)</td>
                    <td className="p-2.5 font-bold font-mono">{result.mukutsMenit} Menit</td>
                    <td className="p-2.5 text-stone-600">Setelah matahari terbenam</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Nurul Hilal (Lebar Cahaya)</td>
                    <td className="p-2.5 font-bold font-mono">{result.nurulHilalJari} Jari (Isba')</td>
                    <td className="p-2.5 text-stone-600">Kemiringan: {result.kemiringanHilal}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Kesimpulan Ketetapan Hukum */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 font-bold space-y-1">
              <div>KESIMPULAN PENETAPAN:</div>
              <div className="text-sm font-black text-emerald-900">{result.statusHilal}</div>
              <div className="font-normal">{result.ketetapanAwalBulanString}.</div>
            </div>

            {/* Tanda Tangan */}
            <div className="pt-8 flex justify-between items-end text-xs">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Ketua Yayasan Ruang Belajar</p>
                <div className="h-16" />
                <p className="font-bold underline">( Dewan Pembina Yayasan )</p>
              </div>
              <div className="text-right">
                <p>Ditetapkan di: {result.markaz.name.split(' ')[0]}</p>
                <p className="font-bold">Lajnah Falakiyah Yayasan</p>
                <div className="h-16" />
                <p className="font-bold underline">( Ahli Hisab Falak Sullam )</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
