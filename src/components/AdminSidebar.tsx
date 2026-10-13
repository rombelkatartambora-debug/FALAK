import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  StickyNote, 
  BookOpen, 
  Compass, 
  Table, 
  Clock, 
  Download, 
  Printer, 
  Building2, 
  LogOut, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft, 
  X, 
  Sparkles, 
  ShieldCheck, 
  User as UserIcon,
  Globe,
  FileSpreadsheet,
  Calculator
} from 'lucide-react';
import { AdminMenuKey, AuthSession } from '../types/calendar';
import { RbiLogo } from './RbiLogo';

export interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeMenu: AdminMenuKey;
  onSelectMenu: (menu: AdminMenuKey) => void;
  authSession: AuthSession;
  onLogout: () => void;
  onSwitchToPublic: () => void;
  notesCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  activeMenu,
  onSelectMenu,
  authSession,
  onLogout,
  onSwitchToPublic,
  notesCount
}) => {
  // Accordion for Kitab Sulam Nayyiroin submenus
  const [isSulamExpanded, setIsSulamExpanded] = useState<boolean>(true);

  const isSulamActive = [
    'kalkulator_falak',
    'koordinat_astronomi',
    'risalah_1',
    'risalah_2',
    'risalah_3',
    'terjemah_sulam'
  ].includes(activeMenu);

  const handleMenuClick = (key: AdminMenuKey) => {
    onSelectMenu(key);
    // On mobile close sidebar upon selection
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

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
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out border-r bg-[#18181b] border-stone-800 text-stone-200 select-none print:hidden ${
          isCollapsed ? 'lg:w-20' : 'lg:w-72'
        } ${
          isOpen ? 'translate-x-0 w-72 sm:w-80' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* TOP BRAND: NAMA YAYASAN RUANG BELAJAR HARUS DIATAS */}
        <div className="flex flex-col border-b border-stone-800 bg-black/40">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3 overflow-hidden">
              <RbiLogo className="w-10 h-10 shrink-0 drop-shadow-md" />
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black tracking-wider uppercase text-amber-400 truncate leading-tight">
                    YAYASAN RUANG BELAJAR
                  </span>
                  <span className="text-[10px] text-stone-400 truncate font-medium">
                    Pusat Falak & Khazanah Nusantara
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onToggleCollapse}
                title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
                className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Badge Info Bar */}
          {!isCollapsed && (
            <div className="px-4 py-2 bg-stone-950/70 border-t border-stone-800/60 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 min-w-0">
                {authSession.role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <span className="font-semibold text-stone-300 truncate">
                  {authSession.displayName}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                authSession.role === 'admin' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {authSession.role}
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Menu List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-stone-800">
          
          {/* GROUP 1: UTAMA */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block mb-1">
                MENU UTAMA
              </span>
            )}

            {/* Koordinat Astronomis */}
            <button
              onClick={() => handleMenuClick('koordinat_astronomi')}
              title="Koordinat Astronomis"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMenu === 'koordinat_astronomi'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <Globe className="w-4 h-4 shrink-0 text-cyan-400" />
              {!isCollapsed && <span>Koordinat Astronomis</span>}
            </button>

            {/* Catatan Pribadi */}
            <button
              onClick={() => handleMenuClick('catatan_pribadi')}
              title="Catatan Pribadi"
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMenu === 'catatan_pribadi'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <StickyNote className="w-4 h-4 shrink-0 text-yellow-400" />
                {!isCollapsed && <span>Catatan Pribadi</span>}
              </div>
              {!isCollapsed && notesCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-stone-800 text-amber-300 border border-stone-700">
                  {notesCount}
                </span>
              )}
            </button>
          </div>

          {/* GROUP 2: ILMU FALAK & IBADAH */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block mb-1">
                ILMU FALAK & IBADAH
              </span>
            )}

            {/* Kitab Sulam Nayyiroin (Parent) */}
            <div>
              <button
                onClick={() => {
                  if (isCollapsed) {
                    handleMenuClick('kalkulator_falak');
                  } else {
                    setIsSulamExpanded(!isSulamExpanded);
                  }
                }}
                title="Kitab Sulam Nayyiroin"
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSulamActive && !isSulamExpanded
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <BookOpen className="w-4 h-4 shrink-0 text-emerald-400" />
                  {!isCollapsed && <span>Kitab Sulam Nayyiroin</span>}
                </div>
                {!isCollapsed && (
                  isSulamExpanded ? <ChevronDown className="w-3.5 h-3.5 text-stone-400" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                )}
              </button>

              {/* Sub-menu Kitab Sulam Nayyiroin */}
              {!isCollapsed && isSulamExpanded && (
                <div className="ml-4 pl-3 border-l-2 border-emerald-800/50 space-y-1 mt-1">
                  {/* Risalah 1 (Tahqiq Lengkap) */}
                  <button
                    onClick={() => handleMenuClick('risalah_1')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-arabic transition-all cursor-pointer ${
                      activeMenu === 'risalah_1'
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'text-stone-300 hover:text-white hover:bg-stone-800/50'
                    }`}
                  >
                    <span>الرسالة الأولى</span>
                    <span className="text-[9px] font-sans px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                      Tahqiq
                    </span>
                  </button>

                  {/* Risalah 2 */}
                  <button
                    onClick={() => handleMenuClick('risalah_2')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-arabic transition-all cursor-pointer ${
                      activeMenu === 'risalah_2'
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                    }`}
                  >
                    <span>الرسالة الثانية</span>
                    <span className="text-[9px] font-sans px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-400 border border-amber-600/40">
                      Proses
                    </span>
                  </button>

                  {/* Risalah 3 */}
                  <button
                    onClick={() => handleMenuClick('risalah_3')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-arabic transition-all cursor-pointer ${
                      activeMenu === 'risalah_3'
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                    }`}
                  >
                    <span>الرسالة الثالثة</span>
                    <span className="text-[9px] font-sans px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-600/40">
                      Proses
                    </span>
                  </button>

                  {/* Kalkulator Falak Terpadu (Semua fitur Excel terintegrasi penuh) */}
                  <button
                    onClick={() => handleMenuClick('kalkulator_falak')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      activeMenu === 'kalkulator_falak'
                        ? 'bg-amber-600 text-white font-bold shadow-sm'
                        : 'text-amber-300 hover:text-amber-200 hover:bg-stone-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Calculator className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">Kalkulator Hisab Falak</span>
                    </div>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700/50">
                      Lengkap
                    </span>
                  </button>

                  {/* Terjemah Sulam Nayyiroin */}
                  <button
                    onClick={() => handleMenuClick('terjemah_sulam')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                      activeMenu === 'terjemah_sulam'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                    }`}
                  >
                    Terjemah Sulam Nayyiroin
                  </button>
                </div>
              )}
            </div>

            {/* Hisab Arah Kiblat */}
            <button
              onClick={() => handleMenuClick('hisab_kiblat')}
              title="Hisab Arah Kiblat"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMenu === 'hisab_kiblat'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0 text-amber-400" />
              {!isCollapsed && <span>Hisab Arah Kiblat</span>}
            </button>

            {/* Tabel Imsakiyah */}
            <button
              onClick={() => handleMenuClick('tabel_imsakiyah')}
              title="Tabel Imsakiyah"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMenu === 'tabel_imsakiyah'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <Table className="w-4 h-4 shrink-0 text-emerald-400" />
              {!isCollapsed && <span>Tabel Imsakiyah</span>}
            </button>
          </div>

          {/* GROUP 3: PRODUKTIVITAS */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-blue-400 block mb-1">
                PRODUKTIVITAS
              </span>
            )}

            {/* Download / Pusat Unduhan */}
            <button
              onClick={() => handleMenuClick('download')}
              title="Pusat Unduhan & Upload Berkas"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMenu === 'download'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <Download className="w-4 h-4 shrink-0 text-blue-400" />
              {!isCollapsed && <span>Pusat Unduhan</span>}
            </button>

            {/* Cetak & Ekspor */}
            <button
              onClick={() => handleMenuClick('cetak_ekspor')}
              title="Cetak & Ekspor"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMenu === 'cetak_ekspor'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
            >
              <Printer className="w-4 h-4 shrink-0 text-purple-400" />
              {!isCollapsed && <span>Cetak & Ekspor</span>}
            </button>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="p-3 border-t border-stone-800/80 bg-black/40 space-y-2">
          {/* Switch to Public Portal */}
          <button
            onClick={onSwitchToPublic}
            title="Lihat Portal Publik"
            className="w-full py-2 px-3 rounded-xl bg-stone-800/70 hover:bg-stone-700/80 text-stone-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-stone-700/60"
          >
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isCollapsed && <span>Ke Portal Publik</span>}
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Keluar dari Akun"
            className="w-full py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-100 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-red-900/40"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Keluar (Logout)</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
