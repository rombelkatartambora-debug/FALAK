import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  MapPin, 
  Calendar, 
  Clock, 
  Sparkles,
  Share2
} from 'lucide-react';
import { CityLocation } from '../types/calendar';
import { calculatePrayerTimes } from '../utils/prayerTimes';
import { getHijriDate, getPasaran, NAMA_BULAN, NAMA_HARI } from '../utils/calendarMath';

interface ImsakiyahModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: number;
  year: number;
  city: CityLocation;
}

export const ImsakiyahModal: React.FC<ImsakiyahModalProps> = ({
  isOpen,
  onClose,
  month,
  year,
  city
}) => {
  if (!isOpen) return null;

  const tableRef = useRef<HTMLDivElement>(null);
  const daysInMonth = new Date(year, month, 0).getDate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-emerald-300" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                Jadwal Imsakiyah & Sholat 1 Bulan Penuh
              </h3>
              <p className="text-xs text-emerald-200">
                {city.name} ({city.province}) &bull; {NAMA_BULAN[month - 1]} {year} Masehi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Tabel</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabel Imsakiyah Body */}
        <div ref={tableRef} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="text-center pb-2 border-b border-stone-200 dark:border-stone-800">
            <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white uppercase tracking-wider">
              JADWAL IMSAKIYAH & WAKTU SHOLAT
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
              KOTA / KABUPATEN: {city.name.toUpperCase()} ({city.province.toUpperCase()})
            </p>
            <p className="text-xs text-stone-500">
              Bulan {NAMA_BULAN[month - 1]} Tahun {year} Masehi
            </p>
          </div>

          {/* Tabel Lengkap */}
          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-emerald-800 text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-2 text-center">Tgl</th>
                  <th className="py-2.5 px-3">Hari & Pasaran</th>
                  <th className="py-2.5 px-3">Hijriyah</th>
                  <th className="py-2.5 px-2 text-center bg-emerald-900">Imsak</th>
                  <th className="py-2.5 px-2 text-center">Subuh</th>
                  <th className="py-2.5 px-2 text-center text-emerald-200">Terbit</th>
                  <th className="py-2.5 px-2 text-center">Dzuhur</th>
                  <th className="py-2.5 px-2 text-center">Ashar</th>
                  <th className="py-2.5 px-2 text-center bg-amber-700 text-white">Maghrib</th>
                  <th className="py-2.5 px-2 text-center">Isya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const d = i + 1;
                  const dateObj = new Date(year, month - 1, d, 12, 0, 0);
                  const pasaran = getPasaran(dateObj);
                  const hari = NAMA_HARI[dateObj.getDay()];
                  const hijri = getHijriDate(dateObj);
                  const times = calculatePrayerTimes(dateObj, city);

                  const isJumat = dateObj.getDay() === 5;
                  const isAhad = dateObj.getDay() === 0;

                  return (
                    <tr 
                      key={d}
                      className={`hover:bg-stone-100 dark:hover:bg-stone-800/60 font-mono transition-colors ${
                        isAhad ? 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-200' :
                        isJumat ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'odd:bg-stone-50/40 dark:odd:bg-stone-850/40'
                      }`}
                    >
                      <td className="py-2 px-2 text-center font-bold">{d}</td>
                      <td className="py-2 px-3 font-sans font-medium whitespace-nowrap">
                        {hari} {pasaran}
                      </td>
                      <td className="py-2 px-3 font-sans text-stone-600 dark:text-stone-400 whitespace-nowrap">
                        {hijri.day} {hijri.monthName}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40">
                        {times.imsak}
                      </td>
                      <td className="py-2 px-2 text-center font-bold">{times.subuh}</td>
                      <td className="py-2 px-2 text-center text-stone-500">{times.terbit}</td>
                      <td className="py-2 px-2 text-center font-bold">{times.dzuhur}</td>
                      <td className="py-2 px-2 text-center font-bold">{times.ashar}</td>
                      <td className="py-2 px-2 text-center font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                        {times.maghrib}
                      </td>
                      <td className="py-2 px-2 text-center font-bold">{times.isya}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl text-[11px] text-stone-500 space-y-1">
            <p>
              &bull; Waktu Ihtiyath (pengaman) sebesar +2 menit telah ditambahkan pada jadwal waktu sholat.
            </p>
            <p>
              &bull; Sumber hisab mengacu pada kriteria Kementerian Agama RI & parameter posisi lintang/bujur resmi daerah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
