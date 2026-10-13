import React from 'react';
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Sparkles, 
  Palette, 
  LayoutGrid, 
  Building2, 
  LogIn, 
  LogOut,
  StickyNote,
  Compass,
  Volume2
} from 'lucide-react';
import { User } from 'firebase/auth';
import { CalendarTheme } from '../types/calendar';
import { NAMA_BULAN } from '../utils/calendarMath';
import { RbiLogo } from './RbiLogo';

export interface NavbarProps {
  onToggleSidebar: () => void;
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onSetToday: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  theme: CalendarTheme;
  onThemeChange: (theme: CalendarTheme) => void;
  currentMode: 'public' | 'admin';
  onSelectMode: (mode: 'public' | 'admin') => void;
  notesCount: number;
  onOpenPersonalNotes: () => void;
  onOpenTradition: () => void;
  onOpenFalak: () => void;
  onPlayBedug: () => void;
  user: User | null;
  isLoggingIn: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  month,
  year,
  onMonthChange,
  onYearChange,
  onSetToday,
  onPrevMonth,
  onNextMonth,
  theme,
  onThemeChange,
  currentMode,
  onSelectMode,
  notesCount,
  onOpenPersonalNotes,
  onOpenTradition,
  onOpenFalak,
  onPlayBedug,
  user,
  isLoggingIn,
  onSignIn,
  onSignOut
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#1c1917]/95 backdrop-blur-md border-b border-stone-800 text-stone-100 shadow-md print:hidden">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Sidebar Toggle & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            title="Buka Menu Sidebar"
            className="p-2 -ml-1 sm:ml-0 rounded-xl hover:bg-white/10 active:bg-white/15 text-stone-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="flex items-center gap-2.5">
            <RbiLogo className="w-8 h-8 shrink-0 drop-shadow-md" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-tight">
                  Kalender
                </span>
                <span className="text-amber-400 font-extrabold text-sm sm:text-base leading-tight">
                  Nusantara
                </span>
              </div>
              <span className="hidden sm:inline text-[10px] text-stone-400 font-medium leading-none">
                Masehi &bull; Hijriyah &bull; Jawa &bull; Falak
              </span>
            </div>
          </div>
        </div>

        {/* Center: Month Navigation Quick Selector */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onPrevMonth}
            title="Bulan Sebelumnya"
            className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-1 sm:gap-1.5 bg-black/40 px-2 py-1 rounded-xl border border-white/5">
            <select
              value={month}
              onChange={(e) => onMonthChange(parseInt(e.target.value, 10))}
              className="bg-transparent text-amber-300 text-xs sm:text-sm font-bold focus:outline-none cursor-pointer"
            >
              {NAMA_BULAN.map((name, idx) => (
                <option key={name} value={idx + 1} className="bg-[#1c1917] text-white">
                  {name.charAt(0) + name.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            <input
              type="number"
              min={1582}
              max={9999}
              value={year}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) onYearChange(val);
              }}
              className="w-14 sm:w-16 bg-transparent text-stone-100 text-xs sm:text-sm font-black text-center focus:outline-none border-b border-transparent focus:border-amber-400"
            />
          </div>

          <button
            onClick={onNextMonth}
            title="Bulan Berikutnya"
            className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onSetToday}
            title="Bulan Ini (Hari Ini)"
            className="hidden md:flex items-center gap-1 px-2 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Hari Ini</span>
          </button>
        </div>

        {/* Right: Quick Actions, Mode Switch, User */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick Sound Bedug */}
          <button
            onClick={onPlayBedug}
            title="Bunyikan Suara Bedug Tradisional"
            className="p-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 hover:text-white border border-amber-500/30 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Theme Selector */}
          <div className="hidden lg:flex items-center gap-1 bg-black/40 px-2 py-1 rounded-xl border border-white/5 text-xs">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={theme}
              onChange={(e) => onThemeChange(e.target.value as CalendarTheme)}
              className="bg-transparent text-stone-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="classic" className="bg-[#1c1917]">Tema Klasik</option>
              <option value="batik" className="bg-[#1c1917]">Batik Klasik</option>
              <option value="islamic" className="bg-[#1c1917]">Hijau Islami</option>
              <option value="keraton" className="bg-[#1c1917]">Elegan Keraton</option>
              <option value="dark" className="bg-[#1c1917]">Mode Gelap</option>
            </select>
          </div>

          {/* Catatan Button */}
          <button
            onClick={onOpenPersonalNotes}
            title="Catatan Pribadi & To-Do"
            className="relative p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
          >
            <StickyNote className="w-4 h-4 text-amber-400" />
            {notesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-stone-900 rounded-full text-[9px] font-black flex items-center justify-center">
                {notesCount}
              </span>
            )}
          </button>

          {/* Portal Mode Switcher */}
          <div className="hidden sm:flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => onSelectMode('public')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                currentMode === 'public'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Publik</span>
            </button>
            <button
              onClick={() => onSelectMode('admin')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                currentMode === 'admin'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Admin</span>
            </button>
          </div>

          {/* Google Auth status */}
          {user ? (
            <div className="flex items-center gap-1.5 pl-1">
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || 'U'}`}
                alt="Avatar"
                className="w-7 h-7 rounded-full border border-amber-500/40"
              />
              <button
                onClick={onSignOut}
                title="Keluar Google Calendar"
                className="hidden md:block p-1 text-stone-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              disabled={isLoggingIn}
              title="Sambungkan Google Calendar"
              className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-800 rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-600" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
