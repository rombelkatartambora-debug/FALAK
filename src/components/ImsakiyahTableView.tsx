import React, { useState, useMemo } from 'react';
import { 
  Table, 
  MapPin, 
  Printer, 
  Calendar, 
  Clock, 
  Download, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CITIES_INDONESIA, calculatePrayerTimes } from '../utils/prayerTimes';
import { CityLocation } from '../types/calendar';
import { NAMA_BULAN, NAMA_HARI } from '../utils/calendarMath';

interface ImsakiyahTableViewProps {
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ImsakiyahTableView: React.FC<ImsakiyahTableViewProps> = ({ onShowToast }) => {
  const [selectedCityId, setSelectedCityId] = useState<string>('jkt');
  const [month, setMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(() => new Date().getFullYear());

  const selectedCity = useMemo(() => {
    return CITIES_INDONESIA.find(c => c.id === selectedCityId) || CITIES_INDONESIA[0];
  }, [selectedCityId]);

  // Generate prayer times for each day of the month
  const daysInMonth = useMemo(() => {
    const days = new Date(year, month, 0).getDate();
    const rows = [];
    for (let day = 1; day <= days; day++) {
      const date = new Date(year, month - 1, day);
      const dayName = NAMA_HARI[date.getDay()];
      const times = calculatePrayerTimes(date, selectedCity);
      rows.push({
        day,
        dayName,
        dateStr: `${day} ${NAMA_BULAN[month - 1]} ${year}`,
        times
      });
    }
    return rows;
  }, [selectedCity, month, year]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    let csv = `Tanggal,Hari,Imsak,Subuh,Terbit,Dzuhur,Ashar,Maghrib,Isya\n`;
    daysInMonth.forEach(row => {
      csv += `${row.dateStr},${row.dayName},${row.times.imsak},${row.times.subuh},${row.times.terbit},${row.times.dzuhur},${row.times.ashar},${row.times.maghrib},${row.times.isya}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Jadwal_Imsakiyah_${selectedCity.name}_${month}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Jadwal Imsakiyah berhasil diunduh dalam format CSV!');
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-stone-900 to-teal-950 text-white border border-emerald-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-700/30 shrink-0">
            <Table className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-400/30">
                1 Bulan Penuh
              </span>
              <span className="text-xs text-stone-300 font-arabic">جدول الإمساكية</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Tabel Jadwal Imsakiyah
            </h2>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              Jadwal lengkap Imsakiyah dan sholat 5 waktu selama satu bulan penuh untuk {selectedCity.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-700/25 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Tabel</span>
          </button>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-stone-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kota / Wilayah:</span>
          </label>
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            className="bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
          >
            {CITIES_INDONESIA.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.province})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonth(m => m === 1 ? 12 : m - 1)}
            className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-white px-2">
            {NAMA_BULAN[month - 1]} {year}
          </span>
          <button
            onClick={() => setMonth(m => m === 12 ? 1 : m + 1)}
            className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-3xl bg-stone-900 border border-stone-800 overflow-hidden shadow-xl print:bg-white print:text-black print:border-stone-400">
        <div className="p-5 border-b border-stone-800 bg-stone-950/60 print:bg-white text-center space-y-1">
          <h3 className="font-black text-base uppercase tracking-wider text-white print:text-black">
            JADWAL IMSAKIYAH & SHOLAT - YAYASAN RUANG BELAJAR
          </h3>
          <p className="text-xs text-stone-400 print:text-stone-700">
            Wilayah: {selectedCity.name} ({selectedCity.province}) &bull; Bulan: {NAMA_BULAN[month - 1]} {year} &bull; Zona: UTC+{selectedCity.timezone}
          </p>
        </div>

        {/* TAMPILAN KHUSUS HP (PAS DI LAYAR - TANPA PERLU GESER KANAN) */}
        <div className="block lg:hidden p-3 space-y-2.5 print:hidden">
          {daysInMonth.map((row) => (
            <div
              key={row.day}
              className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-2"
            >
              <div className="flex items-center justify-between border-b border-stone-850 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-700/50 flex items-center justify-center font-bold text-xs">
                    {row.day}
                  </span>
                  <div>
                    <span className="font-bold text-white text-xs block">{row.dayName}</span>
                    <span className="text-[10px] text-stone-400">{row.dateStr}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-amber-400 block">Imsak & Buka</span>
                  <span className="font-mono text-xs font-black text-amber-300">
                    {row.times.imsak} &bull; {row.times.maghrib}
                  </span>
                </div>
              </div>

              {/* Grid 6 Waktu Sholat Pas 100% di HP */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[9px] text-amber-400 uppercase font-bold block">Imsak</span>
                  <span className="font-mono font-bold text-amber-300 text-[11px]">{row.times.imsak}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[9px] text-emerald-400 uppercase font-bold block">Subuh</span>
                  <span className="font-mono font-bold text-emerald-300 text-[11px]">{row.times.subuh}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-stone-900 border border-stone-800">
                  <span className="text-[9px] text-stone-400 uppercase font-bold block">Terbit</span>
                  <span className="font-mono font-semibold text-stone-300 text-[11px]">{row.times.terbit}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-stone-900 border border-stone-800">
                  <span className="text-[9px] text-stone-400 uppercase font-bold block">Dzuhur</span>
                  <span className="font-mono font-semibold text-stone-300 text-[11px]">{row.times.dzuhur}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-stone-900 border border-stone-800">
                  <span className="text-[9px] text-stone-400 uppercase font-bold block">Ashar</span>
                  <span className="font-mono font-semibold text-stone-300 text-[11px]">{row.times.ashar}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[9px] text-amber-400 uppercase font-bold block">Maghrib</span>
                  <span className="font-mono font-bold text-amber-300 text-[11px]">{row.times.maghrib}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TAMPILAN DESKTOP & CETAK (TABEL TABULAR PENUH) */}
        <div className="hidden lg:block overflow-x-auto print:block">
          <table className="w-full text-xs text-center">
            <thead className="bg-stone-950 text-stone-300 print:bg-stone-100 print:text-stone-900 font-bold uppercase border-b border-stone-800 print:border-stone-300">
              <tr>
                <th className="p-3 text-left">Tgl & Hari</th>
                <th className="p-3 text-amber-400 print:text-amber-800 font-black">Imsak</th>
                <th className="p-3 text-emerald-400 print:text-emerald-800">Subuh</th>
                <th className="p-3 text-stone-400">Terbit</th>
                <th className="p-3">Dzuhur</th>
                <th className="p-3">Ashar</th>
                <th className="p-3 text-amber-400 print:text-amber-800 font-black">Maghrib (Buka)</th>
                <th className="p-3">Isya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 print:divide-stone-200 font-mono text-stone-300 print:text-stone-800">
              {daysInMonth.map((row) => (
                <tr key={row.day} className="hover:bg-stone-800/40 print:hover:bg-transparent transition-colors">
                  <td className="p-2.5 text-left font-sans">
                    <span className="font-bold text-white print:text-black">{row.day}</span>{' '}
                    <span className="text-stone-400 text-[11px] print:text-stone-600">({row.dayName})</span>
                  </td>
                  <td className="p-2.5 font-bold text-amber-400 print:text-amber-800 bg-amber-500/5">{row.times.imsak}</td>
                  <td className="p-2.5 font-semibold text-emerald-400 print:text-emerald-800">{row.times.subuh}</td>
                  <td className="p-2.5 text-stone-500">{row.times.terbit}</td>
                  <td className="p-2.5">{row.times.dzuhur}</td>
                  <td className="p-2.5">{row.times.ashar}</td>
                  <td className="p-2.5 font-bold text-amber-400 print:text-amber-800 bg-amber-500/5">{row.times.maghrib}</td>
                  <td className="p-2.5">{row.times.isya}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
