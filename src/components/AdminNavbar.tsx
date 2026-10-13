import React from 'react';
import { 
  Menu, 
  Globe, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { AuthSession, AdminMenuKey } from '../types/calendar';
import { RbiLogo } from './RbiLogo';

interface AdminNavbarProps {
  onToggleSidebar: () => void;
  authSession: AuthSession;
  activeMenu: AdminMenuKey;
  onSwitchToPublic: () => void;
  onLogout: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  onToggleSidebar,
  authSession,
  activeMenu,
  onSwitchToPublic,
  onLogout
}) => {
  const getMenuTitle = (key: AdminMenuKey): string => {
    switch (key) {
      case 'catatan_pribadi':
        return 'Catatan Pribadi & Agenda Harian';
      case 'koordinat_astronomi':
        return 'Koordinat Astronomis & Kubah Langit 3D/4D (Jean Meeus)';
      case 'risalah_1':
        return 'الرسالة الأولى (Manuskrip Tahqiq Sullamun Nayyirain)';
      case 'risalah_2':
        return 'الرسالة الثانية (Kitab Sullamun Nayyirain)';
      case 'risalah_3':
        return 'الرسالة الثالثة (Kitab Sullamun Nayyirain)';
      case 'terjemah_sulam':
        return 'Terjemah & Syarah Kitab Sullamun Nayyirain';
      case 'kalkulator_falak':
        return 'Kalkulator Hisab Falak Terpadu (Sullamun Nayyirain)';
      case 'hisab_kiblat':
        return 'Hisab Arah Kiblat (Trigonometri Bola)';
      case 'tabel_imsakiyah':
        return 'Tabel Jadwal Imsakiyah 1 Bulan Penuh';
      case 'download':
        return 'Pusat Unduhan (Download) Dokumen & Cadangan';
      case 'cetak_ekspor':
        return 'Cetak & Ekspor Kalender Dinding';
      default:
        return 'Dashboard Pengurus';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100 shadow-md print:hidden">
      <div className="w-full px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Left: Sidebar Toggle & Brand Yayasan Ruang Belajar */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            title="Buka Menu Sidebar"
            className="p-2 -ml-1 rounded-xl hover:bg-white/10 active:bg-white/15 text-stone-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* NAMA YAYASAN RUANG BELAJAR HARUS DIATAS */}
          <div className="flex items-center gap-3">
            <RbiLogo className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 drop-shadow-md" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-wider text-amber-400 uppercase leading-none">
                  YAYASAN RUANG BELAJAR
                </span>
                <span className="hidden md:inline px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                  Dashboard
                </span>
              </div>
              <span className="text-[11px] text-stone-400 font-medium leading-tight mt-0.5 hidden sm:inline">
                {getMenuTitle(activeMenu)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: User Role Badge & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs">
            {authSession.role === 'admin' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="font-semibold text-stone-200">
              {authSession.displayName}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
              authSession.role === 'admin'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {authSession.role}
            </span>
          </div>

          {/* Switch to Public Portal */}
          <button
            onClick={onSwitchToPublic}
            className="py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-700"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Lihat Portal Publik</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            title="Keluar"
            className="p-2 sm:py-1.5 sm:px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-red-900/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
