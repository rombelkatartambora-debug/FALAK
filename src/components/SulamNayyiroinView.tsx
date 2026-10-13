import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Calculator, 
  FileText, 
  Layers, 
  Printer, 
  Copy, 
  Check, 
  MapPin, 
  Calendar, 
  Clock, 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Download,
  Info,
  FileSpreadsheet,
  LayoutGrid,
  Table,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  calculateSulamNayyiroinFull, 
  PRESET_MARKAZ_SULAM, 
  MarkazSulamLocation,
  SulamCalculationFullResult
} from '../utils/sulamNayyiroinEngine';
import { BULAN_HIJRIYAH, BULAN_JAWA, NAMA_HARI, getHijriDate } from '../utils/calendarMath';

export type SulamSubTab = 'kalkulator' | 'terjemah';
export type SulamSheetTab = 
  | 'isian'
  | 'epoch'
  | 'muaddalah'
  | 'meeus'
  | 'bulanan'
  | 'hasil'
  | 'rukyat';

export interface SheetItemConfig {
  key: SulamSheetTab;
  label: string;
  shortLabel: string;
}

export const SHEET_ITEMS: SheetItemConfig[] = [
  { key: 'isian', label: '1. ISIAN (Input & Markaz)', shortLabel: 'Isian' },
  { key: 'epoch', label: '2. EPOCH (Harokat)', shortLabel: 'Epoch' },
  { key: 'muaddalah', label: "3. MUADDALAH (Ta'dil)", shortLabel: "Ta'dil" },
  { key: 'meeus', label: '4. DATA MEEUS (Validasi)', shortLabel: 'Meeus' },
  { key: 'bulanan', label: '5. BULANAN (Siklus 12 Bulan)', shortLabel: 'Bulan' },
  { key: 'hasil', label: '6. HASIL (Arab & Indo)', shortLabel: 'Hasil' },
  { key: 'rukyat', label: '7. RUKYAT-CETAK (Berita Acara)', shortLabel: 'Cetak' }
];

interface SulamNayyiroinViewProps {
  initialSubTab?: SulamSubTab;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const SulamNayyiroinView: React.FC<SulamNayyiroinViewProps> = ({
  initialSubTab = 'kalkulator',
  onShowToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SulamSubTab>(initialSubTab);

  // Sync state if prop changes
  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Input Parameter Hisab - Default otomatis sesuai tahun dan bulan Hijriyah hari ini
  const [selectedHijriYear, setSelectedHijriYear] = useState<number>(() => {
    const h = getHijriDate(new Date());
    return h.year;
  });
  const [selectedHijriMonthIdx, setSelectedHijriMonthIdx] = useState<number>(() => {
    const h = getHijriDate(new Date());
    return Math.max(0, Math.min(11, h.month - 1));
  });
  const [selectedMarkazName, setSelectedMarkazName] = useState<string>(PRESET_MARKAZ_SULAM[0].name);
  const [activeSheetTab, setActiveSheetTab] = useState<SulamSheetTab>('isian');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const selectedMarkaz: MarkazSulamLocation = useMemo(() => {
    return PRESET_MARKAZ_SULAM.find(m => m.name === selectedMarkazName) || PRESET_MARKAZ_SULAM[0];
  }, [selectedMarkazName]);

  // Eksekusi Hisab Sullam Lengkap dengan Engine Excel Asli
  const result: SulamCalculationFullResult = useMemo(() => {
    return calculateSulamNayyiroinFull(selectedHijriYear, selectedHijriMonthIdx, selectedMarkaz);
  }, [selectedHijriYear, selectedHijriMonthIdx, selectedMarkaz]);

  // Rekapitulasi 12 Siklus Bulan Hijriyah Lengkap untuk Sheet BULANAN (Persis Excel!)
  const all12MonthsResults = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      return calculateSulamNayyiroinFull(selectedHijriYear, i, selectedMarkaz);
    });
  }, [selectedHijriYear, selectedMarkaz]);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    onShowToast('Naskah hisab berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handlePrintRukyat = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-w-0 space-y-4 sm:space-y-6">
      {/* 1. TOP BANNER UTAMA SULLAMUN NAYYIRAIN */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-stone-900 text-white border border-emerald-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-700/30 shrink-0">
            <BookOpen className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-400/30">
                Khazanah Falak Pesantren Nusantara
              </span>
              <span className="text-xs text-stone-300 font-arabic">سُلَّمُ النَّيِّرَيْن</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-0.5 truncate sm:whitespace-normal">
              Kalkulator Hisab Falak Sullamun Nayyirain
            </h2>
            <p className="text-[11px] sm:text-xs text-emerald-200/90 mt-0.5">
              Al-Allamah Asy-Syaikh Muhammad Manshur Al-Batawi (Jembatan Lima, Jakarta) &bull; Terintegrasi Mesin Excel Lengkap
            </p>
          </div>
        </div>

        {/* Sub-tab Switcher: Kalkulator vs Terjemah */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center p-1 bg-black/40 rounded-2xl border border-white/10 text-xs font-bold w-full sm:w-auto justify-center">
            <button
              onClick={() => setActiveSubTab('kalkulator')}
              className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubTab === 'kalkulator'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-amber-300" />
              <span>Kalkulator Falak</span>
            </button>
            <button
              onClick={() => setActiveSubTab('terjemah')}
              className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubTab === 'terjemah'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-300" />
              <span>Terjemah & Syarah</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUBTAB: KALKULATOR FALAK (INTEGRASI PENUH 8 SHEET EXCEL) */}
      {activeSubTab === 'kalkulator' && (
        <div className="space-y-4 sm:space-y-6 min-w-0">
          
          {/* Top Bar: Sheet Navigation */}
          <div className="flex flex-col gap-2 min-w-0 max-w-full">
            {/* TAMPILAN KHUSUS HP (PAS 100% DI LAYAR - TANPA PERLU GESER KANAN) */}
            <div className="md:hidden space-y-2 w-full">
              {/* Dropdown Pemilih Tahap */}
              <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 p-2 rounded-2xl">
                <span className="text-[11px] font-bold text-amber-400 pl-1 shrink-0">Tahap Sheet:</span>
                <select
                  value={activeSheetTab}
                  onChange={(e) => setActiveSheetTab(e.target.value as SulamSheetTab)}
                  className="w-full bg-stone-950 border border-stone-700 text-white font-bold text-xs rounded-xl px-2.5 py-2 outline-none cursor-pointer"
                >
                  {SHEET_ITEMS.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 7 Tombol Cepat Berjejer Pas di Layar HP (1 s/d 7 Tanpa Geser) */}
              <div className="grid grid-cols-7 gap-1 bg-stone-900 border border-stone-800 p-1.5 rounded-2xl text-center">
                {SHEET_ITEMS.map((item, idx) => {
                  const isActive = activeSheetTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveSheetTab(item.key)}
                      className={`py-1.5 px-0.5 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isActive
                          ? item.key === 'bulanan'
                            ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400 font-black'
                            : 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400 font-black'
                          : 'text-stone-400 hover:text-white hover:bg-stone-800/80 font-medium'
                      }`}
                      title={item.label}
                    >
                      <span className="text-[12px] font-bold leading-none">{idx + 1}</span>
                      <span className="text-[9px] uppercase tracking-tighter truncate max-w-full leading-none mt-1">
                        {item.shortLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAMPILAN DESKTOP & TABLET */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-stone-900 border border-stone-800 rounded-2xl overflow-x-auto text-xs font-semibold custom-scrollbar max-w-full">
              {SHEET_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSheetTab(item.key)}
                  className={`py-2 px-3 rounded-xl whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeSheetTab === item.key
                      ? item.key === 'bulanan'
                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                        : 'bg-amber-600 text-white shadow-sm font-bold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  {item.key === 'bulanan' && <Calendar className="w-3.5 h-3.5" />}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SHEET 1: ISIAN (PARAMETER INPUT) */}
          {/* ========================================================================= */}
          {activeSheetTab === 'isian' && (
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-stone-900 border border-stone-800 space-y-4 sm:space-y-6 min-w-0 max-w-full">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-500" />
                    <span>Sheet "ISIAN" - Lembar Kendali Parameter Utama</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Tentukan bulan dan tahun Hijriyah yang dihisab serta lokasi Markaz pengamatan.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-mono font-bold">
                  Tahap 1 / 7
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Tahun Hijriyah */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Tahun Hijriyah
                  </label>
                  <input
                    type="number"
                    value={selectedHijriYear}
                    onChange={(e) => setSelectedHijriYear(parseInt(e.target.value) || getHijriDate(new Date()).year)}
                    min={1300}
                    max={1600}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">Tahun berjalan: {getHijriDate(new Date()).year} H</span>
                </div>

                {/* Bulan Hijriyah */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Bulan Hijriyah yang Dihisab
                  </label>
                  <select
                    value={selectedHijriMonthIdx}
                    onChange={(e) => setSelectedHijriMonthIdx(parseInt(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                  >
                    {BULAN_HIJRIYAH.map((bln, idx) => (
                      <option key={bln} value={idx}>
                        {idx + 1}. {bln} (Menentukan Awal {BULAN_HIJRIYAH[(idx + 1) % 12]})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    Target Awal Bulan Baru: <strong className="text-amber-400">{BULAN_HIJRIYAH[(selectedHijriMonthIdx + 1) % 12]}</strong>
                  </span>
                </div>

                {/* Pilihan Markaz Lokasi */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Pilihan Markaz Pengamatan
                  </label>
                  <select
                    value={selectedMarkazName}
                    onChange={(e) => setSelectedMarkazName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                  >
                    {PRESET_MARKAZ_SULAM.map(m => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                  <span className="text-[11px] text-stone-500 mt-1 block">Markaz standar Betawi / Nusantara</span>
                </div>
              </div>

              {/* Detail Koordinat Markaz */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-stone-500 block">Lintang Tempat (Φ):</span>
                  <span className="font-mono text-white font-bold">
                    {selectedMarkaz.latDeg}° {selectedMarkaz.latMin}' {selectedMarkaz.latSec}" {selectedMarkaz.isSouth ? 'LS' : 'LU'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Bujur Tempat (λ):</span>
                  <span className="font-mono text-white font-bold">
                    {selectedMarkaz.lngDeg}° {selectedMarkaz.lngMin}' {selectedMarkaz.lngSec}" {selectedMarkaz.isEast ? 'BT' : 'BB'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Ketinggian Tempat:</span>
                  <span className="font-mono text-white font-bold">{selectedMarkaz.altitudeMeters} Meter DPL</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Zona Waktu:</span>
                  <span className="font-mono text-white font-bold">UTC+{selectedMarkaz.timezoneOffsetHours}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setActiveSheetTab('bulanan')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-700/25"
                >
                  <span>Buka Sheet BULANAN (Siklus Hilal)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SHEET 2: EPOCH (KONSTANTA HAROKAT) */}
          {/* ========================================================================= */}
          {activeSheetTab === 'epoch' && (
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-stone-900 border border-stone-800 space-y-4 sm:space-y-6 min-w-0 max-w-full">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-500" />
                    <span>Sheet "EPOCH" - Konstanta Harokat Peredaran Kitab Sullam</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Data harokat dasar peredaran matahari dan bulan menurut Zij Ulugh Beg.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-mono font-bold">
                  Tahap 2 / 7
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                {result.epochItems.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{item.nameLatin}</span>
                      <span className="font-arabic font-bold text-amber-400 text-sm">{item.nameArabic}</span>
                    </div>
                    <div className="text-base font-mono font-black text-emerald-400">
                      {item.sexagesimalDay.formattedTraditional}
                    </div>
                    <span className="text-[11px] text-stone-500 block">
                      Per Jam: {item.sexagesimalHour.formattedTraditional}
                    </span>
                    <p className="text-[10px] text-stone-400 leading-tight pt-1 border-t border-stone-800/60">
                      {item.description}
                    </p>
                  </div>
                ))}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5 flex flex-col justify-center">
                  <span className="text-stone-400 block font-semibold">Tahun Epoch Perhitungan</span>
                  <div className="text-xl font-mono font-black text-amber-300">{selectedHijriYear} H</div>
                  <span className="text-[11px] text-stone-500">Sini Majmu'ah & Mabtsuthah Terkoreksi</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SHEET 3: MUADDALAH (TA'DIL HAKIKI) */}
          {/* ========================================================================= */}
          {activeSheetTab === 'muaddalah' && (
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-stone-900 border border-stone-800 space-y-4 sm:space-y-6 min-w-0 max-w-full">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-500" />
                    <span>Sheet "MUADDALAH" - Koreksi Hakiki Berantai</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Hasil perataan koreksi ta'dil markaz, ta'dil khossoh, dan sabqul khissoh.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-mono font-bold">
                  Tahap 3 / 7
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block mb-1">Meqowwam Syams (Bujur Matahari Hakiki)</span>
                  <div className="text-base font-mono font-bold text-amber-400">{result.muaddalah.bujurMatahariTradisional}</div>
                  <span className="text-[11px] text-stone-500">Derajat: {result.muaddalah.meqowwamSyams.decimal.toFixed(2)}°</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block mb-1">Meqowwam Qamar (Bujur Bulan Hakiki)</span>
                  <div className="text-base font-mono font-bold text-emerald-400">{result.muaddalah.bujurBulanTradisional}</div>
                  <span className="text-[11px] text-stone-500">Derajat: {result.muaddalah.meqowwamQamar.decimal.toFixed(2)}°</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block mb-1">Hisoh Muaddalah (Koreksi Lintang)</span>
                  <div className="text-base font-mono font-bold text-sky-400">{result.muaddalah.hisohMuaddalah.formattedTraditional}</div>
                  <span className="text-[11px] text-stone-500">Nilai: {result.muaddalah.hisohMuaddalah.decimal.toFixed(2)}°</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block mb-1">Khossoh Muaddalah (Koreksi Anomali)</span>
                  <div className="text-base font-mono font-bold text-yellow-400">{result.muaddalah.khossohMuaddalah.formattedTraditional}</div>
                  <span className="text-[11px] text-stone-500">Nilai: {result.muaddalah.khossohMuaddalah.decimal.toFixed(2)}°</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block mb-1">Markaz Muaddalah (Selisih Bujur)</span>
                  <div className="text-base font-mono font-bold text-purple-400">{result.muaddalah.markazMuaddalah.formattedTraditional}</div>
                  <span className="text-[11px] text-stone-500">Nilai: {result.muaddalah.markazMuaddalah.decimal.toFixed(2)}°</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block mb-1">Ta'dil Awwal & Ta'dil Tsani</span>
                  <div className="text-sm font-mono font-bold text-white">
                    T1: {result.muaddalah.taadulAwwalMin}' | T2: {result.muaddalah.taadulTsaniMin}'
                  </div>
                  <span className="text-[11px] text-stone-500">Sabqul Khissoh: {result.muaddalah.sabqulKhissohSec} detik</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SHEET 4: DATA MEEUS (VALIDASI KOMPARASI) */}
          {/* ========================================================================= */}
          {activeSheetTab === 'meeus' && (
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-stone-900 border border-stone-800 space-y-4 sm:space-y-6 min-w-0 max-w-full">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <span>Sheet "DATA MEEUS" - Komparasi Validasi Modern (Jean Meeus)</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Perbandingan hasil konjungsi dan posisi benda langit Sullam vs Algoritma Meeus.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-mono font-bold">
                  Tahap 4 / 7
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block mb-1">Julian Ephemeris Day (JDE)</span>
                  <div className="font-mono text-base font-bold text-white">{result.meeus.jde}</div>
                  <span className="text-[11px] text-stone-500">Saat Konjungsi Astronomis</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block mb-1">Bujur Matahari Hakiki (Meeus)</span>
                  <div className="font-mono text-base font-bold text-amber-400">{result.meeus.sunLongitudeApparent.formattedTraditional}</div>
                  <span className="text-[11px] text-stone-500">Apparent Solar Longitude</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block mb-1">Bujur Bulan Hakiki (Meeus)</span>
                  <div className="font-mono text-base font-bold text-emerald-400">{result.meeus.moonLongitudeApparent.formattedTraditional}</div>
                  <span className="text-[11px] text-stone-500">Apparent Lunar Longitude</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block mb-1">Elongasi Geosentrik (Meeus)</span>
                  <div className="font-mono text-base font-bold text-sky-400">{result.meeus.elongation.formattedTraditional}</div>
                  <span className="text-[11px] text-stone-500">Desimal: {result.meeus.elongation.decimal.toFixed(2)}°</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block mb-1">Selisih Waktu Ijtima' Sullam vs Meeus</span>
                  <div className="font-mono text-base font-bold text-emerald-300">± {result.meeus.selisihIjtimaMenit} Menit</div>
                  <span className="text-[11px] text-stone-500">Akurasi sangat presisi</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block mb-1">Status Validasi</span>
                  <div className="font-bold text-emerald-400 text-sm">Terverifikasi Sesuai Kaidah</div>
                  <span className="text-[11px] text-stone-500">{result.meeus.keteranganValidasi}</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SHEET 5: BULANAN (REKAP DETAIL BULAN INI + TABEL 12 SIKLUS BULAN LENGKAP!) */}
          {/* INI YANG DIMINTA USER: HARUS SAMA PERSIS DENGAN LEMBAR KERJA EXCEL! */}
          {/* ========================================================================= */}
          {activeSheetTab === 'bulanan' && (
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-stone-900 border border-stone-800 space-y-4 sm:space-y-6 min-w-0 max-w-full">
              
              {/* Header Sheet Bulanan */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    <span>Sheet "BULANAN" - Rekapitulasi Ijtima' & Hilal ({result.inputBulanHijriyahName} {result.inputTahunHijriyah} H)</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Markaz: <strong className="text-stone-200">{result.markaz.name}</strong> &bull; Menentukan Awal Bulan 1 {result.targetBulanHijriyahName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                    {result.statusHilal}
                  </span>
                </div>
              </div>

              {/* Status Highlight Banner Bulan yang Sedang Dihisab */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-stone-950 to-stone-900 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 block mb-1">
                    Ketetapan Awal Bulan 1 {result.targetBulanHijriyahName} {result.inputTahunHijriyah} H:
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <span>{result.statusHilal}</span>
                  </div>
                  <p className="text-xs text-stone-300 mt-1 font-semibold">
                    {result.ketetapanAwalBulanString}
                  </p>
                </div>

                <div className="px-4 py-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-right">
                  <span className="text-[10px] text-emerald-300 uppercase block font-bold">Irtifa' Hilal Mar'i</span>
                  <span className="font-mono text-xl font-black text-white">{result.irtifaMarI.formattedTraditional}</span>
                  <span className="text-[10px] text-stone-400 block font-mono">Desimal: {result.irtifaMarI.decimal.toFixed(2)}°</span>
                </div>
              </div>

              {/* Grid 12 Kotak Parameter Teknis Falak Lengkap (Sama Persis Lembar Kerja Excel) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                  <span className="text-stone-400 block mb-0.5">Hari & Weton Ijtima':</span>
                  <span className="font-bold text-white text-sm">{result.wetonIjtima}</span>
                </div>
                <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                  <span className="text-stone-400 block mb-0.5">Tanggal Masehi Ijtima':</span>
                  <span className="font-bold text-white text-sm">
                    {result.tanggalMasehiIjtima} {result.bulanMasehiIjtima} {result.tahunMasehiIjtima} M
                  </span>
                </div>
                <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                  <span className="text-stone-400 block mb-0.5">Jam Ijtima' WIB:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{result.waktuIjtimaWIB}</span>
                </div>
                <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                  <span className="text-stone-400 block mb-0.5">Waktu Ghurubiyah:</span>
                  <span className="font-mono font-bold text-white text-sm">{result.waktuIjtimaGhurubiyah}</span>
                </div>

                <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                  <span className="text-stone-400 block mb-0.5">Irtifa' Hilal Hakiki:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {result.irtifaHakiki.formattedTraditional}
                  </span>
                </div>
                <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                  <span className="text-stone-400 block mb-0.5">Irtifa' Hilal Mar'i:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {result.irtifaMarI.formattedTraditional}
                  </span>
                </div>
                <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                  <span className="text-stone-400 block mb-0.5">Lama Hilal (Mukuts):</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">{result.mukutsMenit} Menit</span>
                </div>
                <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                  <span className="text-stone-400 block mb-0.5">Nurul Hilal (Lebar Cahaya):</span>
                  <span className="font-mono font-bold text-yellow-300 text-sm">{result.nurulHilalJari} Jari (Isba')</span>
                </div>

                <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                  <span className="text-stone-400 block mb-0.5">Posisi / Kemiringan:</span>
                  <span className="font-bold text-white text-xs">{result.kemiringanHilal}</span>
                </div>
                <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                  <span className="text-stone-400 block mb-0.5">Azimuth Matahari:</span>
                  <span className="font-mono font-bold text-stone-300 text-xs">
                    {result.azimuthMatahari.formattedTraditional}
                  </span>
                </div>
                <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                  <span className="text-stone-400 block mb-0.5">Azimuth Bulan:</span>
                  <span className="font-mono font-bold text-stone-300 text-xs">
                    {result.azimuthBulan.formattedTraditional}
                  </span>
                </div>
                <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800">
                  <span className="text-stone-400 block mb-0.5">Beda Azimuth ( - ):</span>
                  <span className="font-mono font-bold text-stone-300 text-xs">
                    {result.bedaAzimuth.formattedTraditional}
                  </span>
                </div>
              </div>

              {/* ===================================================================== */}
              {/* TABEL REKAPITULASI 12 SIKLUS BULAN HIJRIYAH LENGKAP TAHUN INI */}
              {/* ===================================================================== */}
              <div className="space-y-3 pt-3 border-t border-stone-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Table className="w-4 h-4 text-emerald-400" />
                      <span>Tabel Rekapitulasi 12 Siklus Bulan Hijriyah Tahun {selectedHijriYear} H</span>
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Rekap lengkap waktu Ijtima', weton, tanggal masehi, irtifa' hakiki, mukuts, nurul hilal, dan status hilal sepanjang tahun.
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    Klik baris / kartu bulan untuk melihat rincian hisab
                  </span>
                </div>

                {/* Mobile View: Kartu Ringkas Responsif Layar HP (Tidak Perlu Geser) */}
                <div className="block lg:hidden space-y-2.5">
                  {all12MonthsResults.map((mRes, idx) => {
                    const isCurrent = idx === selectedHijriMonthIdx;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedHijriMonthIdx(idx);
                          onShowToast(`Bulan ${BULAN_HIJRIYAH[idx]} dipilih!`);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-950/70 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                            : 'bg-stone-950/80 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-300">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-sm text-white">{BULAN_HIJRIYAH[idx]}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                                Dipilih
                              </span>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            mRes.statusHilal.includes('Imkanur')
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : mRes.statusHilal.includes('Di Atas')
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {mRes.statusHilal}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-stone-300">
                          <div>Ijtima': <strong className="text-white">{mRes.wetonIjtima}</strong></div>
                          <div>Masehi: <strong className="text-white">{mRes.tanggalMasehiIjtima} {mRes.bulanMasehiIjtima}</strong></div>
                          <div>WIB: <strong className="text-amber-400 font-mono">{mRes.waktuIjtimaWIB}</strong></div>
                          <div>Irtifa': <strong className="text-emerald-400 font-mono">{mRes.irtifaHakiki.formattedTraditional}</strong></div>
                          <div>Mukuts: <strong className="text-cyan-400 font-mono">{mRes.mukutsMenit}m</strong></div>
                          <div>Cahaya: <strong className="text-yellow-300 font-mono">{mRes.nurulHilalJari} Jari</strong></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop & Tablet View: Tabel Tabular Lengkap */}
                <div className="hidden lg:block overflow-x-auto rounded-2xl border border-stone-800 shadow-inner">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-950 text-stone-300 font-bold uppercase border-b border-stone-800 text-[11px]">
                      <tr>
                        <th className="p-3 whitespace-nowrap">No</th>
                        <th className="p-3 whitespace-nowrap">Bulan Hijriyah</th>
                        <th className="p-3 whitespace-nowrap">Hari & Weton</th>
                        <th className="p-3 whitespace-nowrap">Tanggal Masehi</th>
                        <th className="p-3 whitespace-nowrap">Jam Ijtima' WIB</th>
                        <th className="p-3 whitespace-nowrap">Irtifa' Hakiki</th>
                        <th className="p-3 whitespace-nowrap">Mukuts</th>
                        <th className="p-3 whitespace-nowrap">Nurul Hilal</th>
                        <th className="p-3 whitespace-nowrap">Kemiringan</th>
                        <th className="p-3 whitespace-nowrap">Status Hilal</th>
                        <th className="p-3 whitespace-nowrap text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/80 font-mono text-stone-300">
                      {all12MonthsResults.map((mRes, idx) => {
                        const isCurrent = idx === selectedHijriMonthIdx;
                        return (
                          <tr
                            key={idx}
                            onClick={() => setSelectedHijriMonthIdx(idx)}
                            className={`transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-emerald-950/50 text-white font-bold border-l-4 border-emerald-500'
                                : 'hover:bg-stone-800/50'
                            }`}
                          >
                            <td className="p-3 text-stone-400">{idx + 1}</td>
                            <td className="p-3 font-sans font-bold text-white flex items-center gap-1.5 whitespace-nowrap">
                              <span>{BULAN_HIJRIYAH[idx]}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono">
                                  Aktif
                                </span>
                              )}
                            </td>
                            <td className="p-3 whitespace-nowrap">{mRes.wetonIjtima}</td>
                            <td className="p-3 whitespace-nowrap">
                              {mRes.tanggalMasehiIjtima} {mRes.bulanMasehiIjtima} {mRes.tahunMasehiIjtima}
                            </td>
                            <td className="p-3 text-amber-400 font-bold whitespace-nowrap">{mRes.waktuIjtimaWIB}</td>
                            <td className="p-3 whitespace-nowrap">{mRes.irtifaHakiki.formattedTraditional}</td>
                            <td className="p-3 text-cyan-400 whitespace-nowrap">{mRes.mukutsMenit}m</td>
                            <td className="p-3 whitespace-nowrap">{mRes.nurulHilalJari} Jari</td>
                            <td className="p-3 font-sans text-[11px] whitespace-nowrap">{mRes.kemiringanHilal}</td>
                            <td className="p-3 font-sans whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  mRes.statusHilal.includes('Imkanur')
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : mRes.statusHilal.includes('Di Atas')
                                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                }`}
                              >
                                {mRes.statusHilal}
                              </span>
                            </td>
                            <td className="p-3 text-center whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedHijriMonthIdx(idx);
                                  onShowToast(`Bulan ${BULAN_HIJRIYAH[idx]} dipilih!`);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-bold transition-colors cursor-pointer ${
                                  isCurrent
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                                }`}
                              >
                                {isCurrent ? 'Dipilih' : 'Pilih'}
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
          {/* SHEET 6: HASIL (HASIL LENGKAP INDONESIA & NASKAH ARAB OTENTIK) */}
          {/* ========================================================================= */}
          {activeSheetTab === 'hasil' && (
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-stone-900 border border-stone-800 space-y-4 sm:space-y-6 min-w-0 max-w-full">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-500" />
                    <span>Sheet "HASIL" - Hasil Ringkasan Hisab & Naskah Arab</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Data akhir hisab untuk penentuan awal bulan Hijriyah (Markaz {result.markaz.name}).
                  </p>
                </div>
                <button
                  onClick={() => handleCopyText(`HASIL HISAB SULLAMUN NAYYIRAIN\nBulan: ${result.inputBulanHijriyahName} ${result.inputTahunHijriyah} H\nIjtima': ${result.wetonIjtima}, ${result.tanggalMasehiIjtima} ${result.bulanMasehiIjtima} ${result.tahunMasehiIjtima} jam ${result.waktuIjtimaWIB}\nIrtifa' Mar'i: ${result.irtifaMarI.formattedTraditional}\nMukuts: ${result.mukutsMenit} Menit\nStatus: ${result.statusHilal}\nKetetapan: ${result.ketetapanAwalBulanString}`)}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-700"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Tersalin' : 'Salin Hasil'}</span>
                </button>
              </div>

              {/* Teks Arab Otentik Kitab Sullamun Nayyirain */}
              <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Matan & Khulasoh Arab Sullamun Nayyirain:
                </span>
                <div className="p-4 rounded-xl bg-black/40 text-right font-arabic text-base sm:text-lg leading-[2.2] text-stone-200 select-text">
                  <p>
                    وقد وقع إجتماع النيرين لشهر {result.inputBulanHijriyahName} سنة {result.inputTahunHijriyah} هـ في يوم {result.hariIjtima} ({result.pasaranIjtima}) الموافق {result.tanggalMasehiIjtima} من شهر {result.bulanMasehiIjtima} سنة {result.tahunMasehiIjtima} م في الساعة {result.waktuIjtimaWIB} بحسب التوقيت الغربي الإندونيسي.
                  </p>
                  <p className="mt-2 text-emerald-300 font-bold">
                    وارتفاع الهلال المرئي عند غروب الشمس قدره {result.irtifaMarI.formattedArabic}، ومكثه في الأفق {result.mukutsMenit} دقيقة، ونوره {result.nurulHilalJari} إصبعا، وهو {result.kemiringanHilal}.
                  </p>
                </div>
              </div>

              {/* Rangkuman Data Bahasa Indonesia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                  <span className="font-bold text-white block">Waktu Ijtima' & Tanggal Masehi:</span>
                  <div className="text-sm font-semibold text-stone-200">
                    {result.wetonIjtima}, {result.tanggalMasehiIjtima} {result.bulanMasehiIjtima} {result.tahunMasehiIjtima} M
                  </div>
                  <div className="text-amber-400 font-mono font-bold">Pukul {result.waktuIjtimaWIB} ({result.waktuIjtimaGhurubiyah})</div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                  <span className="font-bold text-white block">Ketinggian & Keadaan Hilal:</span>
                  <div className="text-sm font-semibold text-emerald-400 font-mono">
                    Irtifa' Mar'i: {result.irtifaMarI.formattedTraditional}
                  </div>
                  <div className="text-stone-300">
                    Lama di ufuk: <strong>{result.mukutsMenit} Menit</strong> | Cahaya: <strong>{result.nurulHilalJari} Jari</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SHEET 7: RUKYAT-CETAK (LAPORAN RESMI BERITA ACARA SIAP CETAK) */}
          {/* ========================================================================= */}
          {activeSheetTab === 'rukyat' && (
            <div className="p-3.5 sm:p-10 rounded-2xl sm:rounded-3xl bg-white text-stone-900 border border-stone-300 space-y-4 sm:space-y-6 shadow-2xl max-w-full overflow-hidden print:p-0 print:border-none print:shadow-none">
              
              {/* Header Cetak Kop Resmi */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-stone-800 pb-3 sm:pb-4">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold text-base sm:text-xl shrink-0 print:border print:border-black">
                    RB
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-lg font-black tracking-wide uppercase text-stone-900 leading-snug">
                      LEMBAGA FALAKIYAH YAYASAN RUANG BELAJAR
                    </h2>
                    <p className="text-[11px] sm:text-xs text-stone-600">
                      Laporan Resmi Berita Acara Hisab Awal Bulan Qamariyah Sullamun Nayyirain
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 print:hidden self-end sm:self-auto">
                  <button
                    onClick={handlePrintRukyat}
                    className="px-3.5 sm:px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Dokumen</span>
                  </button>
                </div>
              </div>

              {/* Isi Surat Berita Acara */}
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-stone-800 break-words">
                <p>
                  Berdasarkan hisab Kitab Sullamun Nayyirain karya Syaikh Muhammad Manshur Al-Batawi untuk Markaz <strong>{result.markaz.name}</strong> (Lintang: {result.markaz.latDeg}° {result.markaz.latMin}' {result.markaz.latSec}" {result.markaz.isSouth ? 'LS' : 'LU'}, Bujur: {result.markaz.lngDeg}° {result.markaz.lngMin}' {result.markaz.lngSec}" {result.markaz.isEast ? 'BT' : 'BB'}, Elevasi: {result.markaz.altitudeMeters} m DPL):
                </p>

                <div className="p-4 rounded-xl bg-stone-100 border border-stone-300 space-y-2 font-mono text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 break-words">
                    <div>1. Ijtima' Akhir Bulan: <strong>{result.inputBulanHijriyahName} {result.inputTahunHijriyah} H</strong></div>
                    <div>2. Hari & Pasaran: <strong>{result.wetonIjtima}</strong></div>
                    <div>3. Tanggal Masehi: <strong>{result.tanggalMasehiIjtima} {result.bulanMasehiIjtima} {result.tahunMasehiIjtima} M</strong></div>
                    <div>4. Jam Ijtima': <strong>{result.waktuIjtimaWIB}</strong></div>
                    <div>5. Irtifa' Hilal Hakiki: <strong>{result.irtifaHakiki.formattedTraditional}</strong></div>
                    <div>6. Irtifa' Hilal Mar'i: <strong>{result.irtifaMarI.formattedTraditional}</strong></div>
                    <div>7. Lama Hilal (Mukuts): <strong>{result.mukutsMenit} Menit</strong></div>
                    <div>8. Nurul Hilal: <strong>{result.nurulHilalJari} Jari (Isba')</strong></div>
                    <div>9. Posisi Hilal: <strong>{result.kemiringanHilal}</strong></div>
                    <div>10. Status Hilal: <strong>{result.statusHilal}</strong></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold break-words">
                  Ketetapan Awal Bulan: {result.ketetapanAwalBulanString}
                </div>

                {/* Tanda Tangan Saksi & Pengurus */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-6 sm:pt-8 text-center text-xs">
                  <div>
                    <p className="text-stone-600">Mengetahui,</p>
                    <p className="font-bold text-stone-900 mt-1">Ketua Lembaga Hisab Falakiyah Almansuriyah</p>
                    <div className="h-16" />
                    <p className="font-bold underline text-stone-900">( ........................................ )</p>
                  </div>
                  <div>
                    <p className="text-stone-600">Dihisab oleh,</p>
                    <p className="font-bold text-stone-900 mt-1">Tim Ahli Falakiyah</p>
                    <div className="h-16" />
                    <p className="font-bold underline text-stone-900">( ........................................ )</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3. SUBTAB: TERJEMAH & SYARAH SULLAMUN NAYYIRAIN */}
      {activeSubTab === 'terjemah' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-stone-900 border border-stone-800 space-y-6 text-stone-200">
          <div className="border-b border-stone-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>Terjemahan & Syarah Kitab Sullamun Nayyirain</span>
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Panduan dasar metode hisab hisi taqribi khas pesantren Nusantara oleh Syaikh Manshur Betawi.
            </p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed">
            <section className="p-5 rounded-2xl bg-stone-950/70 border border-stone-800/80 space-y-3">
              <h4 className="font-bold text-amber-400 flex items-center gap-2">
                <span>1. Muqaddimah (Pengantar Pengarang)</span>
              </h4>
              <p className="text-xs text-stone-300 italic font-serif">
                "Segala puji bagi Allah yang telah menjadikan matahari dan bulan beredar menurut perhitungan yang teliti (bi husban). Sholawat dan salam tercurah atas junjungan Nabi Muhammad SAW beserta keluarga dan sahabatnya penuntun umat..."
              </p>
              <p className="text-xs text-stone-400">
                Kitab ini disusun di Jembatan Lima Jakarta pada tahun 1344 H / 1925 M oleh Syaikh Muhammad Manshur Al-Batawi. Metode yang digunakan adalah hisab urfi-ijtima'i dengan merujuk pada tabel epoch zij astronomi Ulugh Beg dan Al-Battani yang disederhanakan agar mudah dihitung oleh para santri dan ulama pesantren.
              </p>
            </section>

            <section className="p-5 rounded-2xl bg-stone-950/70 border border-stone-800/80 space-y-3">
              <h4 className="font-bold text-emerald-400 flex items-center gap-2">
                <span>2. Istilah Inti Falak Sullamun Nayyirain</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800">
                  <span className="font-bold text-stone-100 block">Al-Ijtima' (الاجتماع):</span>
                  <p className="text-stone-400 mt-0.5">Konjungsi geosentris, saat posisi bujur ekliptika matahari dan bulan berada pada satu garis bujur yang sama.</p>
                </div>
                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800">
                  <span className="font-bold text-stone-100 block">Alamah (العلامة):</span>
                  <p className="text-stone-400 mt-0.5">Waktu ijtima' yang menyatakan hari, jam, dan menit terjadinya pergantian bulan menurut tabel epoch.</p>
                </div>
                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800">
                  <span className="font-bold text-stone-100 block">Irtifa' Hilal (ارتفاع الهلال):</span>
                  <p className="text-stone-400 mt-0.5">Ketinggian sudut busur hilal di atas ufuk pada saat matahari terbenam (Ghurub asy-Syams).</p>
                </div>
                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800">
                  <span className="font-bold text-stone-100 block">Mukuts (مكث الهلال):</span>
                  <p className="text-stone-400 mt-0.5">Lama waktu (durasi menit) hilal masih berada di atas ufuk setelah matahari terbenam sebelum hilal ikut terbenam.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

    </div>
  );
};
