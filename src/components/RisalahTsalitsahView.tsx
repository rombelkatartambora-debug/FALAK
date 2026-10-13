import React from 'react';
import { 
  BookOpen, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  Compass, 
  Star,
  Globe2
} from 'lucide-react';

interface RisalahTsalitsahViewProps {
  onShowToast?: (msg: string, type?: 'success' | 'error') => void;
}

export const RisalahTsalitsahView: React.FC<RisalahTsalitsahViewProps> = () => {
  return (
    <div className="w-full space-y-6">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-stone-900 text-white border border-emerald-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white font-arabic text-3xl font-black shadow-lg shadow-emerald-700/30 shrink-0">
            ٣
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/30">
                Tahqiq & Digitalisasi Berjalan
              </span>
              <span className="text-xs text-stone-300 font-arabic">سُلَّمُ النَّيِّرَيْن</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-arabic mt-1">
              الرسالة الثالثة
            </h2>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              Fi Ma'rifati Ru'yatil Kawakib wa Manazilil Qamar wat-Taqwim (Bintang, Manazil Bulan & Kalender Tahunan)
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-black/40 border border-white/10 text-right">
          <span className="text-[10px] text-stone-400 uppercase block font-bold">Status Manuskrip</span>
          <span className="text-xs font-mono font-bold text-amber-400">Proses Pengetikan</span>
        </div>
      </div>

      {/* Main Status Tahqiq Container */}
      <div className="p-8 sm:p-14 rounded-3xl bg-stone-900 border border-stone-800 text-center space-y-6 shadow-2xl">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl">
          <Clock className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold text-white font-arabic">
            الرسالة الثالثة
          </h3>
          <p className="text-sm sm:text-base font-semibold text-cyan-300">
            Masih Dalam proses pengetikan tahqiq dan digitalisasi manuskrip asli Kitab Sullamun Nayyirain.
          </p>
          <p className="text-xs text-stone-400 leading-relaxed pt-2">
            Bab ini mencakup kaidah penentuan 28 Manazil al-Qamar (stasiun bintang bulan), hisab perbintangan kawakib as-sayyarah (planet-planet utama), penentuan arah kiblat berpedoman pada bintang kutub (al-Quthb), serta penyusunan takwim hisab tahunan.
          </p>
        </div>

        {/* Outline Bab Risalah 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left pt-4">
          <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <Star className="w-4 h-4" />
              <span>منازل القمر (28 Manazil)</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Kaidah peredaran bulan melintasi 28 rasi bintang manazil dari Asy-Syarthan hingga Ar-Risya' sepanjang tahun.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <Globe2 className="w-4 h-4" />
              <span>التقويم السنوي (Takwim Tahunan)</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Kompilasi penanggalan hisab urfi & hakiki 12 bulan Hijriyah, penentuan tahun kabisat (Kabisat Daulat), dan siklus 30 tahunan.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <Compass className="w-4 h-4" />
              <span>معرفة القبلة بالنجوم</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Pedoman orientasi azimut kiblat dan arah mata angin berpedoman pada bintang Polaris dan rasi bintang Pari (Crux).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
