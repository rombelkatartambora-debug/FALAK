import React from 'react';
import { Phone, Sparkles, MapPin } from 'lucide-react';
import { CalendarKop, CalendarTheme } from '../types/calendar';
import { AlmansuriyahLogo } from './AlmansuriyahLogo';

interface CustomKopHeaderProps {
  kop: CalendarKop;
  theme: CalendarTheme;
}

export const CustomKopHeader: React.FC<CustomKopHeaderProps> = ({ kop, theme }) => {
  if (!kop.enabled) return null;

  return (
    <div className={`w-full border-b-2 px-4 py-3 sm:px-6 sm:py-4 transition-colors ${
      theme === 'dark'
        ? 'bg-stone-900 border-amber-600/40 text-stone-100'
        : theme === 'batik'
        ? 'bg-[#2b1810] border-amber-500 text-amber-100'
        : theme === 'islamic'
        ? 'bg-emerald-950 border-emerald-600 text-emerald-100'
        : theme === 'keraton'
        ? 'bg-[#1e1026] border-amber-400 text-amber-200'
        : 'bg-stone-50 border-stone-800 text-stone-900'
    }`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        {/* Logo / Foto */}
        <div className="flex items-center gap-3.5">
          {kop.logoUrl ? (
            <img 
              src={kop.logoUrl} 
              alt={kop.title} 
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg border border-amber-500/30 bg-white/10 p-1 shrink-0 shadow-md"
            />
          ) : (
            <img 
              src="/logo.png" 
              alt="Logo Lembaga" 
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/LOGO.png'; }}
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg border border-amber-500/30 bg-white/10 p-1 shrink-0 shadow-md"
            />
          )}

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-base sm:text-xl font-black uppercase tracking-wider">
                {kop.title || 'LEMBAGA HISAB FALAKIYAH ALMANSURIYAH'}
              </h2>
            </div>
            {kop.subtitle && (
              <p className="text-xs sm:text-sm font-medium opacity-90 mt-0.5">
                {kop.subtitle}
              </p>
            )}
            {kop.tagline && (
              <p className="text-[11px] italic opacity-75">
                {kop.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Kontak / Keterangan */}
        {kop.contactInfo && (
          <div className="text-xs sm:text-right shrink-0 opacity-80 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{kop.contactInfo}</span>
          </div>
        )}
      </div>
    </div>
  );
};
