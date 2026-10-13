import React from 'react';
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  Moon, 
  Compass, 
  Heart, 
  CheckSquare, 
  Palmtree, 
  Building2, 
  Palette, 
  Download, 
  Volume2, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  BookmarkCheck, 
  Search, 
  Clock, 
  Table, 
  FileText, 
  ExternalLink,
  ChevronLeft,
  Smartphone,
  LogOut,
  LogIn
} from 'lucide-react';
import { User } from 'firebase/auth';
import { CalendarTheme } from '../types/calendar';
import { RbiLogo } from './RbiLogo';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentMode: 'public' | 'admin';
  onSelectMode: (mode: 'public' | 'admin') => void;
  notesCount: number;
  adminEventsCount: number;
  theme: CalendarTheme;
  onThemeChange: (theme: CalendarTheme) => void;
  onOpenWeton: () => void;
  onOpenTradition: (tabIndex?: number) => void;
  onOpenFalak: (tabIndex?: number) => void;
  onOpenImsakiyah: () => void;
  onOpenPersonalNotes: () => void;
  onScrollToSection: (sectionId: string) => void;
  onPlayBedug: () => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  currentMode,
  onSelectMode,
  notesCount,
  adminEventsCount,
  theme,
  onThemeChange,
  onOpenWeton,
  onOpenTradition,
  onOpenFalak,
  onOpenImsakiyah,
  onOpenPersonalNotes,
  onScrollToSection,
  onPlayBedug,
  user,
  onSignIn,
  onSignOut
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out border-r print:hidden select-none ${
          /* Desktop Width */
          isCollapsed ? 'lg:w-20' : 'lg:w-72'
        } ${
          /* Mobile Slide in/out */
          isOpen ? 'translate-x-0 w-72 sm:w-80' : '-translate-x-full lg:translate-x-0'
        } ${
          theme === 'dark'
            ? 'bg-[#18181b] border-stone-800 text-stone-200'
            : theme === 'batik'
            ? 'bg-[#21120b] border-amber-950 text-amber-100'
            : theme === 'islamic'
            ? 'bg-[#042013] border-emerald-950 text-emerald-100'
            : theme === 'keraton'
            ? 'bg-[#14081e] border-purple-950 text-purple-100'
            : 'bg-[#1c1917] border-stone-800 text-stone-200'
        }`}
      >
        {/* Top Header / Brand Logo */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-800/80 bg-black/20">
          <div className="flex items-center gap-3 overflow-hidden">
            <RbiLogo className="w-9 h-9 shrink-0 drop-shadow-md" />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black tracking-tight text-amber-400 truncate leading-tight">
                  Kalender Nusantara
                </span>
                <span className="text-[10px] text-stone-400 truncate font-medium">
                 Ruang Belajar
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop Collapse Toggle */}
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
              className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Portal & Admin Mode Switcher Bar */}
        <div className="p-3 border-b border-stone-800/60">
          {!isCollapsed ? (
            <div className="grid grid-cols-2 gap-1 p-1 bg-black/40 rounded-xl border border-white/5 text-xs font-bold">
              <button
                onClick={() => {
                  onSelectMode('public');
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  currentMode === 'public'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Portal Publik</span>
              </button>
              <button
                onClick={() => {
                  onSelectMode('admin');
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  currentMode === 'admin'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => onSelectMode('public')}
                title="Portal Publik"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  currentMode === 'public'
                    ? 'bg-amber-600 text-white'
                    : 'text-stone-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <CalendarIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onSelectMode('admin')}
                title="Dashboard Admin"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  currentMode === 'admin'
                    ? 'bg-amber-600 text-white'
                    : 'text-stone-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Building2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 custom-scrollbar text-xs">
          {/* GROUP 1: UTAMA */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Menu Utama
              </span>
            )}
            <button
              onClick={() => {
                onSelectMode('public');
                onScrollToSection('kalender-utama');
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors font-medium ${
                currentMode === 'public'
                  ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/20'
                  : 'text-stone-300 hover:bg-white/5'
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-amber-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Kalender Dinding Interaktif</span>}
            </button>

            <button
              onClick={() => {
                onOpenWeton();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-stone-300 hover:bg-white/5 transition-colors font-medium"
            >
              <Search className="w-4 h-4 text-emerald-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Cari Tanggal & Weton Cepat</span>}
            </button>
          </div>

          {/* GROUP 2: BUDAYA & TRADISI NUSANTARA */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Budaya & Tradisi
              </span>
            )}
            <button
              onClick={() => {
                onOpenTradition(0);
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-stone-300 hover:bg-white/5 transition-colors font-medium"
            >
              <Heart className="w-4 h-4 text-rose-400 shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">Petung Jodoh Pasangan</span>
                  <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold">Adat</span>
                </div>
              )}
            </button>

            <button
              onClick={() => {
                onOpenTradition(1);
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-stone-300 hover:bg-white/5 transition-colors font-medium"
            >
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Pencari Hari Baik Hajatan</span>}
            </button>

            <button
              onClick={() => {
                onOpenTradition(2);
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-stone-300 hover:bg-white/5 transition-colors font-medium"
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Siklus Pranata Mangsa</span>}
            </button>
          </div>

          {/* GROUP 3: ILMU FALAK & IBADAH */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Falak & Ibadah
              </span>
            )}
            <button
              onClick={() => {
                onOpenFalak(0);
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-stone-300 hover:bg-white/5 transition-colors font-medium"
            >
              <Moon className="w-4 h-4 text-cyan-400 shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">Hisab Sulam Nayyiroin</span>
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-bold">Kitab</span>
                </div>
              )}
            </button>

            <button
              onClick={() => {
                onOpenFalak(1);
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-stone-300 hover:bg-white/5 transition-colors font-medium"
            >
              <Compass className="w-4 h-4 text-teal-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Hisab Arah Kiblat Kota</span>}
            </button>

            <button
              onClick={() => {
                onOpenImsakiyah();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-stone-300 hover:bg-white/5 transition-colors font-medium"
            >
              <Table className="w-4 h-4 text-sky-400 shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">Tabel Imsakiyah 1 Bulan</span>
                  <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-bold">PDF</span>
                </div>
              )}
            </button>
          </div>

          {/* GROUP 4: PRODUKTIVITAS */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Produktivitas
              </span>
            )}
            <button
              onClick={() => {
                onOpenPersonalNotes();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-stone-300 hover:bg-white/5 transition-colors font-medium"
            >
              <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">Catatan Pribadi & To-Do</span>
                  {notesCount > 0 && (
                    <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                      {notesCount}
                    </span>
                  )}
                </div>
              )}
            </button>

            <button
              onClick={() => {
                onSelectMode('public');
                onScrollToSection('long-weekend');
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-stone-300 hover:bg-white/5 transition-colors font-medium"
            >
              <Palmtree className="w-4 h-4 text-green-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Libur Panjang & Harpitnas</span>}
            </button>

            <button
              onClick={() => {
                onSelectMode('public');
                onScrollToSection('ekspor-kalender');
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-stone-300 hover:bg-white/5 transition-colors font-medium"
            >
              <Download className="w-4 h-4 text-blue-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Cetak & Ekspor Gambar</span>}
            </button>
          </div>

          {/* GROUP 5: DASHBOARD ADMIN */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Administrasi Yayasan
              </span>
            )}
            <button
              onClick={() => {
                onSelectMode('admin');
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors font-medium ${
                currentMode === 'admin'
                  ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/20'
                  : 'text-stone-300 hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">Dashboard Yayasan</span>
                  {adminEventsCount > 0 && (
                    <span className="text-[10px] bg-amber-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                      {adminEventsCount}
                    </span>
                  )}
                </div>
              )}
            </button>
          </div>

          {/* QUICK SOUND / BEDUG TESTER */}
          <div className="pt-2">
            {!isCollapsed ? (
              <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    Bedug & Adzan
                  </span>
                  <button
                    onClick={onPlayBedug}
                    className="px-2 py-1 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Tabuh Bedug
                  </button>
                </div>
                <p className="text-[10px] text-stone-400 leading-tight">
                  Audio bedug disintesis langsung melalui Web Audio API peramban.
                </p>
              </div>
            ) : (
              <button
                onClick={onPlayBedug}
                title="Bunyikan Suara Bedug"
                className="w-10 h-10 mx-auto rounded-xl bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom User & PWA Status Bar */}
        <div className="p-3 border-t border-stone-800/80 bg-black/30 space-y-2">
          {/* User Status / Google Auth */}
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || 'U'}`}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full border border-amber-500/40 shrink-0"
                />
                {!isCollapsed && (
                  <div className="min-w-0 flex flex-col">
                    <span className="text-xs font-semibold text-stone-200 truncate leading-tight">
                      {user.displayName || 'Pengguna'}
                    </span>
                    <span className="text-[10px] text-emerald-400 truncate">
                      Google Kalender Aktif
                    </span>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <button
                  onClick={onSignOut}
                  title="Keluar dari Google Calendar"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div>
              {!isCollapsed ? (
                <button
                  onClick={onSignIn}
                  className="w-full py-1.5 px-2 bg-stone-800 hover:bg-stone-700 active:bg-stone-900 text-stone-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-700"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-400" />
                  <span>Sambung Google Calendar</span>
                </button>
              ) : (
                <button
                  onClick={onSignIn}
                  title="Sambungkan Google Calendar"
                  className="w-10 h-10 mx-auto rounded-xl bg-stone-800 text-stone-200 hover:bg-stone-700 flex items-center justify-center transition-colors"
                >
                  <LogIn className="w-4 h-4 text-blue-400" />
                </button>
              )}
            </div>
          )}

          {/* Quick Info & PWA Ready */}
          {!isCollapsed && (
            <div className="pt-1 flex items-center justify-between text-[10px] text-stone-500">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-amber-500" />
                PWA Siap Install
              </span>
              <span>v2.5 Falak</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
