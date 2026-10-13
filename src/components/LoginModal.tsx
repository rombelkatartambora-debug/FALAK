import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  User as UserIcon, 
  ShieldCheck, 
  KeyRound, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Building2,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { AuthSession, UserRole } from '../types/calendar';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (session: AuthSession) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  onShowToast
}) => {
  if (!isOpen) return null;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    setTimeout(() => {
      setIsLoading(false);
      // Validasi akun:
      // 1. Akun Admin: username "admin", password "admin" (atau yayasan123 / admin123)
      if (cleanUser === 'admin' && (cleanPass === 'admin' || cleanPass === 'admin123' || cleanPass === 'yayasan123')) {
        const session: AuthSession = {
          role: 'admin',
          username: 'admin',
          displayName: 'Administrator Yayasan',
          loggedAt: Date.now()
        };
        onSuccessLogin(session);
        onShowToast('Selamat datang kembali, Administrator Yayasan!');
        onClose();
        return;
      }

      // 2. Akun User / Pengguna Biasa: username "user" / "santri" / "guru", password "user" / "santri" / "user123"
      if (
        (cleanUser === 'user' || cleanUser === 'santri' || cleanUser === 'guru') &&
        (cleanPass === 'user' || cleanPass === 'santri' || cleanPass === 'user123' || cleanPass === 'guru')
      ) {
        const session: AuthSession = {
          role: 'user',
          username: cleanUser,
          displayName: cleanUser === 'santri' ? 'Santri / Pelajar' : 'Pengguna Terdaftar',
          loggedAt: Date.now()
        };
        onSuccessLogin(session);
        onShowToast(`Selamat datang, ${session.displayName}!`);
        onClose();
        return;
      }

      // Jika kredensial salah
      setErrorMsg('Username atau password tidak sesuai. Silakan gunakan kredensial yang tersedia.');
    }, 300);
  };

  const handleQuickLogin = (role: UserRole) => {
    setErrorMsg('');
    if (role === 'admin') {
      const session: AuthSession = {
        role: 'admin',
        username: 'admin',
        displayName: 'Administrator Yayasan',
        loggedAt: Date.now()
      };
      onSuccessLogin(session);
      onShowToast('Masuk berhasil sebagai Administrator Yayasan!');
      onClose();
    } else {
      const session: AuthSession = {
        role: 'user',
        username: 'user',
        displayName: 'Pengguna / Santri Terdaftar',
        loggedAt: Date.now()
      };
      onSuccessLogin(session);
      onShowToast('Masuk berhasil sebagai Pengguna Yayasan!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-stone-100"
        role="dialog"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 p-6 border-b border-stone-800 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-amber-600/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Yayasan Ruang Belajar
              </span>
              <h3 className="text-xl font-black text-white">Login Portal Internal</h3>
            </div>
          </div>
        </div>

        {/* Content & Form */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-stone-400 leading-relaxed">
            Silakan masukkan username dan password untuk mengakses Dashboard Admin atau Portal Pengguna dengan hak akses resmi.
          </p>

          {errorMsg && (
            <div className="p-3 bg-red-950/70 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-start gap-2">
              <span className="font-bold">Galat:</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin atau user"
                  required
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-stone-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password..."
                  required
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-stone-600 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-600 hover:from-amber-500 to-amber-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Masuk Sekarang</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Access Info & One-click test */}
          <div className="pt-3 border-t border-stone-800/80 space-y-3">
            <span className="text-[11px] font-semibold text-stone-400 block text-center">
              Pilihan Masuk Cepat (Akun Uji Coba):
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-amber-600/40 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer group"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Masuk Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('user')}
                className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-emerald-600/40 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer group"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Masuk User</span>
              </button>
            </div>

            <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 text-[11px] text-stone-400 space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-300 font-medium">Akun Admin:</span>
                <span className="font-mono text-amber-300">user: admin | pass: admin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-300 font-medium">Akun User:</span>
                <span className="font-mono text-emerald-300">user: user | pass: user</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
