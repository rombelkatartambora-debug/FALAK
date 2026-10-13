import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Sparkles, 
  Compass, 
  Calendar, 
  TreePine, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  HelpCircle,
  Flame,
  Sun,
  Users
} from 'lucide-react';
import { 
  hitungPetungJodoh, 
  cariHariBaikBulan, 
  LIST_PRANATA_MANGSA, 
  getPranataMangsaCurrent,
  KebutuhanHajatan,
  PetungJodohResult
} from '../utils/javaneseTradition';
import { NAMA_BULAN } from '../utils/calendarMath';

interface TraditionCultureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: number;
  currentYear: number;
  onJumpToDate: (year: number, month: number) => void;
}

export const TraditionCultureModal: React.FC<TraditionCultureModalProps> = ({
  isOpen,
  onClose,
  currentMonth,
  currentYear,
  onJumpToDate
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'jodoh' | 'haribaik' | 'pranatamangsa'>('jodoh');

  // State Petung Jodoh
  const [namaPria, setNamaPria] = useState('Bagus');
  const [tglPria, setTglPria] = useState('1996-05-10');
  const [namaWanita, setNamaWanita] = useState('Ayu');
  const [tglWanita, setTglWanita] = useState('1998-08-17');
  const [hasilJodoh, setHasilJodoh] = useState<PetungJodohResult | null>(() => {
    try {
      return hitungPetungJodoh('Bagus', new Date('1996-05-10'), 'Ayu', new Date('1998-08-17'));
    } catch {
      return null;
    }
  });

  // State Pencari Hari Baik
  const [kebutuhan, setKebutuhan] = useState<KebutuhanHajatan>('nikah');

  // State Pranata Mangsa
  const currentMangsa = getPranataMangsaCurrent(new Date(currentYear, currentMonth - 1, 15));

  const handleHitungJodoh = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tglPria || !tglWanita) return;
    const res = hitungPetungJodoh(
      namaPria,
      new Date(tglPria + 'T12:00:00'),
      namaWanita,
      new Date(tglWanita + 'T12:00:00')
    );
    setHasilJodoh(res);
  };

  const daftarHariBaik = cariHariBaikBulan(currentYear, currentMonth, kebutuhan);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-200" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">Budaya & Tradisi Nusantara</h3>
              <p className="text-xs text-amber-100">Kearifan Petung Weton, Pencari Hari Baik, dan Pranata Mangsa Jawa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-amber-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 shrink-0 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('jodoh')}
            className={`flex-1 py-3 px-2 sm:px-4 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'jodoh'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-white dark:bg-stone-900'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Kalkulator Jodoh Weton</span>
          </button>

          <button
            onClick={() => setActiveTab('haribaik')}
            className={`flex-1 py-3 px-2 sm:px-4 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'haribaik'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-white dark:bg-stone-900'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>Pencari Hari Baik</span>
          </button>

          <button
            onClick={() => setActiveTab('pranatamangsa')}
            className={`flex-1 py-3 px-2 sm:px-4 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'pranatamangsa'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-white dark:bg-stone-900'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <TreePine className="w-4 h-4 text-amber-600" />
            <span>Pranata Mangsa</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* TAB 1: KALKULATOR JODOH / PETUNG WETON */}
          {activeTab === 'jodoh' && (
            <div className="space-y-5">
              <form onSubmit={handleHitungJodoh} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mempelai Pria */}
                <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5" />
                    <span>Calon Mempelai Pria</span>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">Nama Panggilan</label>
                    <input
                      type="text"
                      value={namaPria}
                      onChange={(e) => setNamaPria(e.target.value)}
                      placeholder="Nama Pria"
                      className="w-full mt-1 px-3 py-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={tglPria}
                      onChange={(e) => setTglPria(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                      required
                    />
                  </div>
                </div>

                {/* Mempelai Wanita */}
                <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-bold text-xs uppercase tracking-wider">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Calon Mempelai Wanita</span>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">Nama Panggilan</label>
                    <input
                      type="text"
                      value={namaWanita}
                      onChange={(e) => setNamaWanita(e.target.value)}
                      placeholder="Nama Wanita"
                      className="w-full mt-1 px-3 py-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={tglWanita}
                      onChange={(e) => setTglWanita(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Hitung Kecocokan Petung Weton Pasangan</span>
                  </button>
                </div>
              </form>

              {/* Hasil Petung Jodoh */}
              {hasilJodoh && (
                <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-800/60 pb-3">
                    <div>
                      <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Hasil Primbon 8 Siklus</span>
                      <h4 className="text-xl font-black text-amber-900 dark:text-amber-200 flex items-center gap-2">
                        <span>Kategori: {hasilJodoh.kategori}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                          Sisa {hasilJodoh.kategoriAngka}
                        </span>
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-stone-500">Skor Harmoni:</span>
                      <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {hasilJodoh.tingkatKecocokan}% ({hasilJodoh.statusHarmoni})
                      </p>
                    </div>
                  </div>

                  {/* Rincian Neptu Masing-Masing */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white/70 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
                      <p className="font-bold text-stone-800 dark:text-stone-200">{hasilJodoh.pria.nama}</p>
                      <p className="text-stone-600 dark:text-stone-400 mt-0.5">Weton: <strong className="text-amber-700 dark:text-amber-400">{hasilJodoh.pria.weton}</strong></p>
                      <p className="text-[11px] text-stone-500">Neptu: {hasilJodoh.pria.neptuHari} + {hasilJodoh.pria.neptuPasaran} = <strong>{hasilJodoh.pria.totalNeptu}</strong></p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/70 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
                      <p className="font-bold text-stone-800 dark:text-stone-200">{hasilJodoh.wanita.nama}</p>
                      <p className="text-stone-600 dark:text-stone-400 mt-0.5">Weton: <strong className="text-amber-700 dark:text-amber-400">{hasilJodoh.wanita.weton}</strong></p>
                      <p className="text-[11px] text-stone-500">Neptu: {hasilJodoh.wanita.neptuHari} + {hasilJodoh.wanita.neptuPasaran} = <strong>{hasilJodoh.wanita.totalNeptu}</strong></p>
                    </div>
                  </div>

                  <div className="p-2 text-center bg-amber-100/70 dark:bg-amber-900/40 rounded-lg text-xs font-semibold text-amber-900 dark:text-amber-100">
                    Total Gabungan Neptu: {hasilJodoh.pria.totalNeptu} + {hasilJodoh.wanita.totalNeptu} = {hasilJodoh.totalNeptuGabungan} &rarr; ({hasilJodoh.totalNeptuGabungan} : 8) bersisa {hasilJodoh.kategoriAngka} ({hasilJodoh.kategori})
                  </div>

                  {/* Penjelasan Watak & Makna */}
                  <div className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
                    <div>
                      <strong className="text-amber-800 dark:text-amber-300 block mb-0.5">Makna Tradisi Adat:</strong>
                      <p>{hasilJodoh.penjelasanWatak}</p>
                    </div>
                    <div className="pt-2 border-t border-amber-200 dark:border-amber-800/40">
                      <strong className="text-emerald-700 dark:text-emerald-400 block mb-0.5">Saran & Ikhtiar:</strong>
                      <p>{hasilJodoh.saranTradisi}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PENCARI HARI BAIK (HAJATAN & USAHA) */}
          {activeTab === 'haribaik' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                    Pencari Hari Baik Bulan {NAMA_BULAN[currentMonth - 1]} {currentYear}
                  </h4>
                  <p className="text-xs text-stone-500">
                    Sistem otomatis menyaring Dino Naas/Taliwangke dan mencari weton pembawa rezeki.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'nikah', label: 'Akad Nikah' },
                    { id: 'usaha', label: 'Buka Usaha' },
                    { id: 'pindah_rumah', label: 'Pindah Rumah' },
                    { id: 'khitanan', label: 'Khitanan' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setKebutuhan(btn.id as KebutuhanHajatan)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        kebutuhan === btn.id
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* List Hari Baik */}
              <div className="space-y-2.5">
                {daftarHariBaik.length === 0 ? (
                  <p className="text-xs text-stone-500 p-4 text-center bg-stone-50 dark:bg-stone-800 rounded-xl">
                    Tidak ditemukan hari berefek sangat kuat di bulan ini. Anda dapat berkonsultasi lebih lanjut dengan sesepuh adat.
                  </p>
                ) : (
                  daftarHariBaik.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-500/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex flex-col items-center justify-center font-black shrink-0">
                          <span className="text-sm leading-none">{item.dayNum}</span>
                          <span className="text-[9px] uppercase">{NAMA_BULAN[currentMonth - 1]?.slice(0, 3)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-sm text-stone-900 dark:text-white">
                              {item.hari} {item.pasaran} ({item.dayNum} {NAMA_BULAN[currentMonth - 1]} {currentYear})
                            </h5>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {item.predikat}
                            </span>
                          </div>
                          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                            Watak Hari: {item.pancasuda} &bull; Neptu {item.totalNeptu}
                          </p>
                          <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                            {item.alasan}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onJumpToDate(currentYear, currentMonth);
                          onClose();
                        }}
                        className="self-end sm:self-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-amber-600 hover:text-white transition-colors cursor-pointer shrink-0"
                      >
                        Buka Tanggal
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PRANATA MANGSA */}
          {activeTab === 'pranatamangsa' && (
            <div className="space-y-4">
              {/* Highlight Mangsa Aktif Bulan Ini */}
              <div className="p-4 rounded-xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Siklus Musim Aktif Bulan Ini</span>
                </div>
                <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-100 mt-1">
                  {currentMangsa.nama} ({currentMangsa.rentangTanggal})
                </h4>
                <p className="text-xs italic text-emerald-700 dark:text-emerald-300 font-serif mt-0.5">
                  &ldquo;{currentMangsa.candra}&rdquo; &bull; {currentMangsa.artiCandra}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-stone-700 dark:text-stone-300">
                  <div className="p-2 rounded bg-white/60 dark:bg-stone-900/40">
                    <strong className="text-stone-900 dark:text-white block">Tanda-tanda Alam:</strong>
                    <span>{currentMangsa.tandaAlam}</span>
                  </div>
                  <div className="p-2 rounded bg-white/60 dark:bg-stone-900/40">
                    <strong className="text-stone-900 dark:text-white block">Kearifan Bertani & Cuaca:</strong>
                    <span>{currentMangsa.kearifanTani}</span>
                  </div>
                </div>
              </div>

              {/* Daftar Lengkap 12 Siklus Mangsa */}
              <h5 className="font-bold text-xs uppercase text-stone-500 tracking-wider pt-2">
                Daftar 12 Siklus Pranata Mangsa Lengkap
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {LIST_PRANATA_MANGSA.map((m) => {
                  const isCurrent = m.no === currentMangsa.no;
                  return (
                    <div 
                      key={m.no}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        isCurrent 
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-stone-900 dark:text-stone-100">
                          {m.no}. {m.nama}
                        </strong>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                          {m.musim}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">{m.rentangTanggal}</p>
                      <p className="text-[11px] italic text-stone-600 dark:text-stone-400">&ldquo;{m.candra}&rdquo; ({m.artiCandra})</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
