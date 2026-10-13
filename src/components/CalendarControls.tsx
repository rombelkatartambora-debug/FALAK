import React from 'react';
import { 
  RotateCcw, 
  Sparkles, 
  Sun, 
  Moon, 
  LogOut,
  StickyNote,
  Building2,
  HeartHandshake,
  Compass,
  Palette,
  LayoutGrid
} from 'lucide-react';
import { User } from 'firebase/auth';
import { CalendarFilters, CalendarTheme } from '../types/calendar';
import { NAMA_BULAN } from '../utils/calendarMath';

interface CalendarControlsProps {
  month: number;
  year: number;
  theme: CalendarTheme;
  hijriAdjustment: number;
  filters: CalendarFilters;
  user: User | null;
  isLoggingIn: boolean;
  notesCount?: number;
  currentMode: 'public' | 'admin';
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onSetToday: () => void;
  onThemeChange: (theme: CalendarTheme) => void;
  onHijriAdjustmentChange: (adj: number) => void;
  onToggleFilter: (key: keyof CalendarFilters) => void;
  onOpenWetonCalculator: () => void;
  onOpenTraditionModal: () => void;
  onOpenFalakModal: () => void;
  onOpenPersonalNotes?: () => void;
  onOpenAdminDashboard: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const CalendarControls: React.FC<CalendarControlsProps> = ({
  month,
  year,
  theme,
  hijriAdjustment,
  user,
  isLoggingIn,
  notesCount = 0,
  currentMode,
  onMonthChange,
  onYearChange,
  onSetToday,
  onThemeChange,
  onHijriAdjustmentChange,
  onOpenTraditionModal,
  onOpenFalakModal,
  onOpenPersonalNotes,
  onOpenAdminDashboard,
  onSignIn,
  onSignOut
}) => {
  return (
    <div className="w-full max-w-[1020px] mb-3 sm:mb-4 print:hidden select-none space-y-2.5">
      {/* Top Header Mode Switcher: Portal Publik vs Dashboard Admin */}
      <div className="flex items-center justify-between bg-[#1a1a1a] text-white px-3 py-2 rounded-xl border border-stone-800 shadow-md">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onThemeChange(theme)}
            className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-amber-400"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Kalender Interaktif Nusantara</span>
          </button>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex items-center gap-1 bg-[#2b2b2b] p-0.5 rounded-lg border border-stone-700 text-xs font-bold">
          <button
            onClick={() => {}}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              currentMode === 'public'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Portal Publik</span>
          </button>

          <button
            onClick={onOpenAdminDashboard}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              currentMode === 'admin'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Dashboard Admin</span>
          </button>
        </div>
      </div>

      {/* Main Controls Box */}
      <div className="bg-[#242424] text-white p-2.5 sm:p-3.5 rounded-2xl border border-stone-700/80 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 sm:gap-3">
        {/* Baris 1 di HP: Pemilih Bulan, Tahun & Tombol Sekarang */}
        <div className="grid grid-cols-[1fr_75px_auto] sm:flex sm:items-center gap-2 sm:gap-2.5">
          {/* Dropdown Bulan */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-stone-400 mb-0.5 sm:hidden">Bulan:</span>
            <select
              value={month}
              onChange={(e) => onMonthChange(parseInt(e.target.value, 10))}
              className="h-9 px-2.5 sm:px-3 bg-[#333] hover:bg-[#3a3a3a] text-white text-xs sm:text-sm font-semibold rounded-xl border border-stone-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-full transition-colors"
            >
              {NAMA_BULAN.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {idx + 1}. {name.charAt(0) + name.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Input Tahun */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-stone-400 mb-0.5 sm:hidden">Tahun:</span>
            <input
              type="number"
              min={1582}
              max={9999}
              value={year}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) onYearChange(val);
              }}
              className="h-9 w-full sm:w-20 px-2 sm:px-2.5 bg-[#333] text-white text-xs sm:text-sm font-bold rounded-xl border border-stone-600 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tombol Sekarang */}
          <div className="flex flex-col justify-end">
            <button
              onClick={onSetToday}
              title="Lompat ke bulan dan tahun sekarang"
              className="h-9 px-2.5 sm:px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sekarang</span>
            </button>
          </div>
        </div>

        {/* Baris 2 di HP: Fitur Budaya Nusantara, Falak, Tema, Catatan & Google Calendar */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pt-1 lg:pt-0 border-t border-stone-700/60 lg:border-t-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Tombol Budaya Nusantara (Petung Jodoh, Hari Baik, Pranata Mangsa) */}
            <button
              onClick={onOpenTraditionModal}
              title="Petung Weton Jodoh, Hari Baik & Pranata Mangsa"
              className="h-9 px-2.5 sm:px-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Budaya & Weton</span>
            </button>

            {/* Tombol Falak & Kiblat (Sulam Nayyiroin & Hisab Kiblat) */}
            <button
              onClick={onOpenFalakModal}
              title="Hisab Kitab Sullamun Nayyirain & Arah Kiblat"
              className="h-9 px-2.5 sm:px-3 bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Compass className="w-3.5 h-3.5 text-teal-200" />
              <span>Hisab Falak</span>
            </button>

            {/* Kalibrasi Hilal */}
            <div className="h-9 flex items-center gap-1 bg-[#333] px-2 sm:px-2.5 rounded-xl border border-stone-600 text-xs text-stone-300">
              <span className="text-[10px] text-stone-400 font-semibold">Hilal:</span>
              <select
                value={hijriAdjustment}
                onChange={(e) => onHijriAdjustmentChange(parseInt(e.target.value, 10))}
                className="bg-transparent text-stone-200 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value={-1} className="bg-[#333]">-1 Hari</option>
                <option value={0} className="bg-[#333]">Standar (0)</option>
                <option value={1} className="bg-[#333]">+1 Hari</option>
              </select>
            </div>

            {/* Desain & Tema Kalender Dinding */}
            <div className="h-9 flex items-center gap-1 bg-[#333] px-2 rounded-xl border border-stone-600 text-xs">
              <Palette className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                value={theme}
                onChange={(e) => onThemeChange(e.target.value as CalendarTheme)}
                className="bg-transparent text-stone-200 font-bold focus:outline-none cursor-pointer text-xs"
                title="Pilih Desain Tema Kalender Dinding"
              >
                <option value="classic" className="bg-[#333]">Tema Klasik</option>
                <option value="batik" className="bg-[#333]">Batik Klasik</option>
                <option value="islamic" className="bg-[#333]">Hijau Islami</option>
                <option value="keraton" className="bg-[#333]">Elegan Keraton</option>
                <option value="dark" className="bg-[#333]">Mode Gelap</option>
              </select>
            </div>
          </div>

          {/* Catatan Pribadi & Google Calendar Sejajar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Tombol Catatan Pribadi (Disamping Google Calendar) */}
            <button
              onClick={onOpenPersonalNotes}
              className="h-9 px-2.5 sm:px-3 bg-amber-600/90 hover:bg-amber-500 active:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border border-amber-500/50"
              title="Kelola Catatan Pribadi & To-Do List Harian"
            >
              <StickyNote className="w-3.5 h-3.5 text-amber-200" />
              <span>Catatan Pribadi</span>
              {notesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-stone-900 text-amber-300 text-[10px] font-black">
                  {notesCount}
                </span>
              )}
            </button>

            {/* Akun Google Calendar */}
            {user ? (
              <div className="h-9 flex items-center gap-2 bg-[#333] px-2 sm:px-2.5 rounded-xl border border-stone-600">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-stone-200 max-w-[85px] sm:max-w-[120px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={onSignOut}
                  title="Keluar dari Google Calendar"
                  className="p-1 hover:text-red-400 text-stone-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                disabled={isLoggingIn}
                className="h-9 flex items-center gap-1.5 sm:gap-2 bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold px-2.5 sm:px-3 rounded-xl border border-stone-300 shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>{isLoggingIn ? '...' : 'Google Calendar'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
