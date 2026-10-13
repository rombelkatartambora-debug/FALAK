import React, { useState } from 'react';
import {
  Globe,
  Building,
  Users,
  Shield,
  Key,
  LogIn,
  LogOut,
  CheckCircle2,
  Calendar,
  MapPin,
  Share2,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  UserCheck,
  FileText,
  CreditCard,
  ClipboardList,
  Sparkles,
  Lock,
  AlertCircle,
  HelpCircle,
  Send,
} from 'lucide-react';
import {
  PortalRole,
  UserSession,
  KelurahanName,
  UnitRWProfile,
  KegiatanRecord,
  PendaftaranAnggota,
} from '../types';
import { DAFTAR_KELURAHAN_TAMBORA, MAP_WILAYAH_TAMBORA } from '../data/wilayah';
import { getOrganisasi, saveUserSession } from '../services/storage';
import { getActiveLogoNasional } from '../data/logos';
import { ShareSocialModal } from './ShareSocialModal';

interface PortalsViewProps {
  currentSession: UserSession;
  onUpdateSession: (newSession: UserSession) => void;
  ukktList: UnitRWProfile[];
  kegiatanList: KegiatanRecord[];
  pendaftaranList: PendaftaranAnggota[];
  onNavigateToTab: (tab: any) => void;
  onSelectUnit: (kel: KelurahanName, rw: string) => void;
}

export const PortalsView: React.FC<PortalsViewProps> = ({
  currentSession,
  onUpdateSession,
  ukktList,
  kegiatanList,
  pendaftaranList,
  onNavigateToTab,
  onSelectUnit,
}) => {
  const [activePortalTab, setActivePortalTab] = useState<'publik' | 'kelurahan' | 'rw' | 'hak-akses'>(
    currentSession.role === 'kelurahan' && currentSession.isLoggedIn
      ? 'kelurahan'
      : currentSession.role === 'rw' && currentSession.isLoggedIn
      ? 'rw'
      : 'publik'
  );

  // Selector role switcher / login state
  const [tempRole, setTempRole] = useState<PortalRole>(currentSession.role);
  const [tempKelurahan, setTempKelurahan] = useState<KelurahanName>(
    currentSession.kelurahan || 'PEKOJAN'
  );
  const [tempRw, setTempRw] = useState<string>(currentSession.nomorRw || '001');
  const [loginPin, setLoginPin] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Modal Share Medsos
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedKegiatanForShare, setSelectedKegiatanForShare] = useState<KegiatanRecord | null>(null);

  // Form aspirasi publik
  const [aspirasiNama, setAspirasiNama] = useState('');
  const [aspirasiPesan, setAspirasiPesan] = useState('');
  const [aspirasiTerkirim, setAspirasiTerkirim] = useState(false);

  const org = getOrganisasi();

  // Evaluasi Hak Akses & Status Login
  const isKelurahanLoggedIn =
    currentSession.isLoggedIn && (currentSession.role === 'kelurahan' || currentSession.role === 'kecamatan');
  const isRwLoggedIn =
    currentSession.isLoggedIn && (currentSession.role === 'rw' || currentSession.role === 'kecamatan');
  const isAdminLoggedIn =
    currentSession.isLoggedIn && currentSession.role === 'kecamatan';

  // Handler Login Form
  const handlePerformLogin = (targetRole: PortalRole, targetKel?: KelurahanName, targetRwNumber?: string) => {
    setLoginError('');
    const kel = targetKel || tempKelurahan;
    const rw = targetRwNumber || tempRw;

    let nama = '';
    if (targetRole === 'kecamatan') {
      nama = 'Pengurus Kecamatan Tambora (Admin)';
    } else if (targetRole === 'kelurahan') {
      nama = `Pengurus Karang Taruna Kel. ${kel}`;
    } else if (targetRole === 'rw') {
      nama = `Pengurus UKKT RW ${rw} Kel. ${kel}`;
    } else {
      nama = 'Warga / Pemuda (Akses Publik)';
    }

    const newSession: UserSession = {
      role: targetRole,
      namaUser: nama,
      kelurahan: targetRole === 'kelurahan' || targetRole === 'rw' ? kel : undefined,
      nomorRw: targetRole === 'rw' ? rw : undefined,
      isLoggedIn: targetRole !== 'public',
    };

    saveUserSession(newSession);
    onUpdateSession(newSession);

    if (targetRole === 'kelurahan') setActivePortalTab('kelurahan');
    else if (targetRole === 'rw') setActivePortalTab('rw');
    else if (targetRole === 'kecamatan') setActivePortalTab('kelurahan');
  };

  // Handler Logout
  const handleLogout = () => {
    const publicSession: UserSession = {
      role: 'public',
      namaUser: 'Warga / Pemuda (Akses Publik)',
      isLoggedIn: false,
    };
    saveUserSession(publicSession);
    onUpdateSession(publicSession);
    setActivePortalTab('publik');
    setLoginPin('');
  };

  // Data unit aktif untuk portal RW
  const activeRwUnit = ukktList.find(
    (u) =>
      u.kelurahan === (currentSession.kelurahan || tempKelurahan) &&
      u.nomorRw === (currentSession.nomorRw || tempRw)
  );

  // Filter kegiatan untuk kelurahan terpilih
  const currentKel = currentSession.kelurahan || tempKelurahan;
  const kegiatanKelurahan = kegiatanList.filter((k) => k.kelurahan === currentKel);
  const rwListInKel = ukktList.filter((u) => u.kelurahan === currentKel);

  return (
    <div className="space-y-6">
      {/* Modal Share Medsos */}
      <ShareSocialModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        kegiatan={selectedKegiatanForShare}
        unit={activeRwUnit}
      />

      {/* TOP HEADER: STATUS HAK AKSES AKTIF */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 p-1 flex items-center justify-center shrink-0 shadow-md shadow-blue-700/20">
            {getActiveLogoNasional() ? (
              <img
                src={getActiveLogoNasional()}
                alt="Logo Karang Taruna"
                className="w-9 h-9 object-contain"
              />
            ) : (
              <Shield className="w-7 h-7 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                SISTEM MULTI-PORTAL & HAK AKSES
              </span>
              <span className="text-xs text-slate-400 font-medium">Kecamatan Tambora</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
              <span>{currentSession.isLoggedIn ? currentSession.namaUser : 'Portal Publik Warga & Pemuda'}</span>
              {currentSession.isLoggedIn && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Terotentikasi"></span>
              )}
            </h1>
          </div>
        </div>

        {/* Status Akses & Tombol Login/Logout */}
        <div className="flex items-center gap-2">
          {currentSession.isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Keluar / Logout</span>
            </button>
          ) : (
            <button
              onClick={() => setActivePortalTab('hak-akses')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <LogIn size={14} />
              <span>Login Pengurus</span>
            </button>
          )}

          <button
            onClick={() => setActivePortalTab('hak-akses')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Key size={14} className="text-amber-500" />
            <span>Kelola Akses</span>
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS 3 PORTAL + 1 HAK AKSES */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit overflow-x-auto text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActivePortalTab('publik')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activePortalTab === 'publik'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-black'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Globe size={15} />
          <span>1. Portal Publik (Warga & Pemuda)</span>
          <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded font-normal">Tanpa Login</span>
        </button>

        <button
          onClick={() => setActivePortalTab('kelurahan')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activePortalTab === 'kelurahan'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-black'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Building size={15} />
          <span>2. Portal Per Kelurahan</span>
          {!isKelurahanLoggedIn && <Lock size={12} className="text-amber-500" />}
        </button>

        <button
          onClick={() => setActivePortalTab('rw')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activePortalTab === 'rw'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-black'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Users size={15} />
          <span>3. Portal Per UKKT RW</span>
          {!isRwLoggedIn && <Lock size={12} className="text-amber-500" />}
        </button>

        <button
          onClick={() => setActivePortalTab('hak-akses')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activePortalTab === 'hak-akses'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-black'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Shield size={15} />
          <span>Login & Hak Akses</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. PORTAL PUBLIK (WARGA & PEMUDA UMUM)                   */}
      {/* TIDAK HARUS LOGIN & HANYA MENAMPILKAN YANG UMUM          */}
      {/* (DIREKTORI KONTAK & MEDSOS 96 RW SUDAH DIHAPUS)          */}
      {/* ======================================================== */}
      {activePortalTab === 'publik' && (
        <div className="space-y-6">
          {/* Hero Banner Publik */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
            <div className="max-w-2xl space-y-3">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold border border-blue-400/30 inline-flex items-center gap-1.5">
                <Globe size={13} />
                <span>Portal Informasi Publik • Terbuka Untuk Umum</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Pusat Aktivitas & Wadah Kreativitas Pemuda Kecamatan Tambora
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Wadah kebersamaan generasi muda di 11 Kelurahan se-Kecamatan Tambora, Jakarta Barat.
                Temukan informasi kegiatan sosial, pembinaan kepemudaan, olahraga, seni budaya, serta daftarkan diri Anda sebagai kader pemuda pelopor.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigateToTab('pendaftaran-online')}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Users size={15} />
                  <span>Daftar Jadi Kader Pemuda</span>
                </button>
                <button
                  onClick={() => onNavigateToTab('kegiatan')}
                  className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar size={14} />
                  <span>Agenda Kegiatan</span>
                </button>
              </div>
            </div>
          </div>

          {/* 9 Bidang Gerakan Karang Taruna (Informasi Umum) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-wider">
                9 Bidang Program Kerja Kepemudaan Karang Taruna
              </h3>
              <p className="text-xs text-slate-500">
                Pilar pembinaan dan pengabdian sosial pemuda sesuai standar resmi Karang Taruna Provinsi DKI Jakarta.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              {[
                { title: 'i. Kesekretariatan & Organisasi', desc: 'Tata kelola kelembagaan, administrasi persuratan, dan konsolidasi kader di tingkat RW & Kelurahan.' },
                { title: 'ii. Pendidikan & Pelatihan', desc: 'Pengembangan soft skills, pelatihan vokasi kerja, beasiswa, dan kepemimpinan pemuda.' },
                { title: 'iii. Usaha Kesejahteraan Sosial (UKS)', desc: 'Bantuan sosial warga prasejahtera, santunan anak yatim, dan tanggap darurat bencana.' },
                { title: 'iv. Kerohanian & Pembinaan Mental', desc: 'Kajian keagamaan, pembentukan karakter luhur, dan toleransi kerukunan umat beragama.' },
                { title: 'v. Olahraga & Seni Budaya', desc: 'Turnamen futsal, bulutangkis, pembinaan sanggar seni Betawi, dan kreativitas musikal.' },
                { title: 'vi. Lingkungan Hidup & Kebersihan', desc: 'Aksi kerja bakti gotong royong, bank sampah pemuda, dan penghijauan pemukiman padat.' },
                { title: 'vii. Hubungan Masyarakat & Kemitraan', desc: 'Komunikasi publik, sinergi dengan Tiga Pilar (Kelurahan, Babinsa, Bhabinkamtibmas), dan RT/RW.' },
                { title: 'viii. Kelompok Usaha Bersama (KUBE/UEP)', desc: 'Inkubasi bisnis UMKM muda, festival kuliner kreatif, dan pemberdayaan ekonomi pemuda.' },
                { title: 'ix. Pemberdayaan Perempuan & Remaja', desc: 'Pencegahan kenakalan remaja, sosialisasi kesehatan reproduksi, dan peranan pemudi pelopor.' },
              ].map((bid, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-1"
                >
                  <div className="font-black text-blue-700 dark:text-blue-300">
                    {bid.title}
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    {bid.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Feed Kegiatan Pemuda Publik Terbaru */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-wider">
                  Kabar & Agenda Kegiatan Pemuda Terkini
                </h3>
                <p className="text-xs text-slate-500">
                  Aktivitas gotong royong, olahraga, pembinaan mental, dan aksi sosial se-Kecamatan Tambora.
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('kegiatan')}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Semua Kegiatan</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kegiatanList.slice(0, 3).map((keg) => (
                <div
                  key={keg.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                      {keg.kelurahan} {keg.nomorRw ? `RW ${keg.nomorRw}` : ''}
                    </span>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white mt-1 leading-snug">
                      {keg.judulKegiatan}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{keg.deskripsi}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar size={12} className="text-blue-600" />
                      {keg.tanggalPelaksanaan}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedKegiatanForShare(keg);
                        setShareModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Share2 size={12} /> Bagikan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panduan Pendaftaran & Alur Kaderisasi */}
          <div className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-4">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold text-sky-200 uppercase tracking-wider">
                Gerakan Regenerasi Pemuda
              </span>
              <h3 className="text-xl sm:text-2xl font-black">
                Tertarik Bergabung Menjadi Kader Karang Taruna?
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                Pendaftaran terbuka untuk seluruh pemuda-pemudi berdomisili di Kecamatan Tambora usia 13 s/d 45 tahun. Dapatkan pengalaman berorganisasi, jaringan pertemanan luas, sertifikat resmi, dan kartu anggota E-KTA Digital.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <div className="font-black text-amber-300">1. Isi Formulir Online</div>
                <p className="text-[11px] text-blue-100 mt-1">Lengkapi identitas diri, NIK, alamat domisili RT/RW, dan minat bidang bakat.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <div className="font-black text-amber-300">2. Verifikasi Dokumen</div>
                <p className="text-[11px] text-blue-100 mt-1">Admin pengurus memvalidasi kelengkapan berkas KTP/KTA dalam 1x24 jam.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <div className="font-black text-amber-300">3. Penerbitan E-KTA</div>
                <p className="text-[11px] text-blue-100 mt-1">Kartu Tanda Anggota Digital resmi dengan QR Code siap dicetak dan digunakan.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigateToTab('pendaftaran-online')}
                className="bg-white hover:bg-blue-50 text-blue-950 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Buka Formulir Pendaftaran Sekarang</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Statistik Umum & Informasi Kontak Layanan Publik */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profil Umum 11 Kelurahan */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Ringkasan Wilayah Kerja Tambora
              </h3>
              <p className="text-xs text-slate-500">
                Kecamatan Tambora memiliki 11 Kelurahan dengan total 96 Rukun Warga (RW):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                {DAFTAR_KELURAHAN_TAMBORA.map((kel) => (
                  <div key={kel} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-center">
                    <div className="font-bold text-slate-900 dark:text-white truncate">{kel}</div>
                    <div className="text-[10px] text-blue-600 font-mono mt-0.5">
                      {MAP_WILAYAH_TAMBORA[kel].length} RW
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kotak Aspirasi Warga */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Layanan Aspirasi Pemuda & Warga
              </h3>
              <p className="text-xs text-slate-500">
                Punya ide kegiatan positif atau pertanyaan untuk pengurus Karang Taruna Tambora? Kirimkan pesan Anda:
              </p>

              {aspirasiTerkirim ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs text-center space-y-1">
                  <CheckCircle2 size={24} className="mx-auto text-emerald-600" />
                  <div className="font-bold">Terima kasih atas aspirasi Anda!</div>
                  <p className="text-[11px]">Pesan Anda telah diterima oleh pengurus Kecamatan Tambora.</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (aspirasiPesan.trim()) {
                      setAspirasiTerkirim(true);
                      setTimeout(() => {
                        setAspirasiTerkirim(false);
                        setAspirasiNama('');
                        setAspirasiPesan('');
                      }, 4000);
                    }
                  }}
                  className="space-y-2.5 text-xs"
                >
                  <input
                    type="text"
                    required
                    value={aspirasiNama}
                    onChange={(e) => setAspirasiNama(e.target.value)}
                    placeholder="Nama Anda / Perwakilan Warga..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                  <textarea
                    rows={2}
                    required
                    value={aspirasiPesan}
                    onChange={(e) => setAspirasiPesan(e.target.value)}
                    placeholder="Tuliskan aspirasi, ide program, atau masukan..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Send size={13} />
                    <span>Kirimkan Aspirasi</span>
                  </button>
                </form>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                Sekretariat: Jl. Tubagus Angke No. 1, Tambora • Email: karangtaruna.tambora@jakarta.go.id
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PORTAL PER KELURAHAN (PENGURUS TINGKAT KELURAHAN)     */}
      {/* HARUS LOGIN DULU                                         */}
      {/* ======================================================== */}
      {activePortalTab === 'kelurahan' && (
        <div>
          {!isKelurahanLoggedIn ? (
            /* Login Gate Pengurus Kelurahan */
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-xl mx-auto space-y-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                <Lock size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Login Pengurus Kelurahan Diperlukan
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Portal Per Kelurahan khusus diperuntukkan bagi pengurus Karang Taruna tingkat Kelurahan se-Kecamatan Tambora. Silakan masuk terlebih dahulu.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePerformLogin('kelurahan', tempKelurahan);
                }}
                className="space-y-4 text-xs text-left"
              >
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Pilih Kelurahan Anda
                  </label>
                  <select
                    value={tempKelurahan}
                    onChange={(e) => setTempKelurahan(e.target.value as KelurahanName)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    {DAFTAR_KELURAHAN_TAMBORA.map((k) => (
                      <option key={k} value={k}>
                        Kelurahan {k} ({MAP_WILAYAH_TAMBORA[k].length} RW)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    PIN / Kata Sandi Pengurus
                  </label>
                  <input
                    type="password"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    placeholder="Masukkan PIN (default: 123456)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Gunakan PIN pengurus atau klik tombol masuk cepat di bawah.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn size={15} />
                    <span>Masuk ke Portal Kel. {tempKelurahan}</span>
                  </button>
                </div>
              </form>

              {/* Tombol Demo Cepat */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[11px] text-slate-400">Pilihan cepat demonstrasi:</span>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => handlePerformLogin('kelurahan', 'PEKOJAN')}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Masuk Cepat: Kel. PEKOJAN
                  </button>
                  <button
                    onClick={() => handlePerformLogin('kelurahan', 'ANGKE')}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Masuk Cepat: Kel. ANGKE
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Dashboard Portal Kelurahan (Sudah Login) */
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-white/20">
                    PORTAL RESMI PENGURUS KELURAHAN
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black mt-1">
                    Karang Taruna Kelurahan {currentKel}
                  </h2>
                  <p className="text-xs text-indigo-200 mt-1">
                    Mengkoordinasikan seluruh {rwListInKel.length} Unit Kerja RW di wilayah Kelurahan {currentKel}.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onNavigateToTab('unit-rw')}
                    className="bg-white text-indigo-900 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-black cursor-pointer"
                  >
                    Kelola Database RW
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>

              {/* Ringkasan Unit RW di Bawah Kelurahan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Unit RW Terbina</span>
                  <div className="mt-2 text-2xl font-black text-indigo-600">
                    {rwListInKel.length} <span className="text-xs font-normal text-slate-400">RW</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase">Kegiatan Terdata</span>
                  <div className="mt-2 text-2xl font-black text-emerald-600">
                    {kegiatanKelurahan.length} <span className="text-xs font-normal text-slate-400">Kegiatan</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-blue-600 uppercase">Pendaftaran Kader</span>
                  <div className="mt-2 text-2xl font-black text-blue-600">
                    {pendaftaranList.filter((p) => p.kelurahan === currentKel).length}{' '}
                    <span className="text-xs font-normal text-slate-400">Warga</span>
                  </div>
                </div>
              </div>

              {/* Daftar RW di Kelurahan Ini */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Daftar Unit Kerja RW di Bawah Kelurahan {currentKel}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {(MAP_WILAYAH_TAMBORA[currentKel] || []).map((rw) => {
                    const unitRw = rwListInKel.find((u) => u.nomorRw === rw);
                    return (
                      <div
                        key={rw}
                        onClick={() => {
                          onSelectUnit(currentKel, rw);
                          onNavigateToTab('unit-rw');
                        }}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-blue-400 transition-all cursor-pointer space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black font-mono text-xs text-blue-600">
                            RW {rw}
                          </span>
                          <span
                            className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                              unitRw?.namaKetua ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {unitRw?.namaKetua ? 'Terisi' : 'Kosong'}
                          </span>
                        </div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {unitRw?.namaKetua || '(Belum isi data)'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Klik untuk kelola & verifikasi
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. PORTAL PER UKKT RW (PENGURUS UNIT RW KHUSUS)          */}
      {/* HARUS LOGIN DULU                                         */}
      {/* ======================================================== */}
      {activePortalTab === 'rw' && (
        <div>
          {!isRwLoggedIn ? (
            /* Login Gate Pengurus RW */
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-xl mx-auto space-y-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Lock size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Login Pengurus UKKT RW Diperlukan
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Portal Unit Kerja RW diperuntukkan bagi pengurus KSB (Ketua, Sekretaris, Bendahara) RW terkait. Silakan autentikasi akun Anda.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePerformLogin('rw', tempKelurahan, tempRw);
                }}
                className="space-y-4 text-xs text-left"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Pilih Kelurahan
                    </label>
                    <select
                      value={tempKelurahan}
                      onChange={(e) => {
                        const k = e.target.value as KelurahanName;
                        setTempKelurahan(k);
                        setTempRw(MAP_WILAYAH_TAMBORA[k][0]);
                      }}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                    >
                      {DAFTAR_KELURAHAN_TAMBORA.map((k) => (
                        <option key={k} value={k}>
                          Kel. {k}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Pilih Nomor RW
                    </label>
                    <select
                      value={tempRw}
                      onChange={(e) => setTempRw(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold"
                    >
                      {(MAP_WILAYAH_TAMBORA[tempKelurahan] || ['001']).map((rw) => (
                        <option key={rw} value={rw}>
                          RW {rw}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    PIN / Kata Sandi UKKT RW
                  </label>
                  <input
                    type="password"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    placeholder="Masukkan PIN (default: 123456)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-xs"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn size={15} />
                    <span>Masuk ke Portal UKKT RW {tempRw} ({tempKelurahan})</span>
                  </button>
                </div>
              </form>

              {/* Tombol Demo Cepat */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[11px] text-slate-400">Pilihan cepat demonstrasi:</span>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => handlePerformLogin('rw', 'PEKOJAN', '001')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Masuk Cepat: RW 001 Pekojan
                  </button>
                  <button
                    onClick={() => handlePerformLogin('rw', 'ANGKE', '009')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Masuk Cepat: RW 009 Angke
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Dashboard Portal RW (Sudah Login) */
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                    PORTAL RESMI UNIT KERJA RW
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black mt-1">
                    UKKT RW {activeRwUnit?.nomorRw || tempRw} Kelurahan {activeRwUnit?.kelurahan || tempKelurahan}
                  </h2>
                  <p className="text-xs text-emerald-200 mt-1">
                    {activeRwUnit?.alamatSekretariat || 'Sekretariat Karang Taruna Unit RW'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectUnit(activeRwUnit?.kelurahan || tempKelurahan, activeRwUnit?.nomorRw || tempRw);
                      onNavigateToTab('unit-rw');
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-black cursor-pointer"
                  >
                    Edit Profil & Medsos RW
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>

              {/* Quick Action Hub Pengurus RW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                {/* Action 1: Catat Kegiatan */}
                <div
                  onClick={() => onNavigateToTab('kegiatan')}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition-all cursor-pointer space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                    <Calendar size={20} />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white">Input Kegiatan RW</h4>
                  <p className="text-[11px] text-slate-500">
                    Publikasikan kegiatan warga dan bagikan langsung ke media sosial RW.
                  </p>
                </div>

                {/* Action 2: Biodata KSB & Upload KTP */}
                <div
                  onClick={() => {
                    onSelectUnit(activeRwUnit?.kelurahan || tempKelurahan, activeRwUnit?.nomorRw || tempRw);
                    onNavigateToTab('unit-rw');
                  }}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition-all cursor-pointer space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600">
                    <CreditCard size={20} />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white">Biodata KSB & KTP</h4>
                  <p className="text-[11px] text-slate-500">
                    Lengkapi NIK, WA, dan upload foto KTP 3 pengurus utama (Ketua, Sekre, Bendahara).
                  </p>
                </div>

                {/* Action 3: Cetak LPJ Dana Stimulan */}
                <div
                  onClick={() => onNavigateToTab('hasil-lpj')}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition-all cursor-pointer space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                    <ClipboardList size={20} />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white">LPJ Dana Stimulan RW</h4>
                  <p className="text-[11px] text-slate-500">
                    Cetak otomatis 4 lembar pertanggungjawaban dana stimulan dengan tanggal akhir bulan.
                  </p>
                </div>

                {/* Action 4: Buat Surat Resmi */}
                <div
                  onClick={() => onNavigateToTab('buat-surat')}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition-all cursor-pointer space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                    <FileText size={20} />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white">Surat Resmi RW</h4>
                  <p className="text-[11px] text-slate-500">
                    Buat surat undangan, mandat, atau permohonan dengan kop surat resmi otomatis.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. PENGATURAN USER & HAK AKSES (RBAC)                    */}
      {/* ======================================================== */}
      {activePortalTab === 'hak-akses' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="text-amber-500" size={22} />
                <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-wider">
                  Manajemen Pengguna & Hak Akses Portal (RBAC)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Pilih peran Anda untuk autentikasi dan masuk ke Portal Publik, Portal Kelurahan, Portal Unit Kerja RW, atau Admin Kecamatan.
              </p>
            </div>

            {currentSession.isLoggedIn && (
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePerformLogin(tempRole, tempKelurahan, tempRw);
            }}
            className="space-y-5 text-xs"
          >
            {/* Pilihan Peran */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">
                Tingkat Hak Akses Pengguna
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'kecamatan' as PortalRole,
                    label: 'Admin Kecamatan (Tambora)',
                    desc: 'Akses penuh ke seluruh 11 Kelurahan dan 96 UKKT RW se-Kecamatan Tambora.',
                    icon: Shield,
                    color: 'text-amber-500',
                  },
                  {
                    id: 'kelurahan' as PortalRole,
                    label: 'Pengurus Kelurahan',
                    desc: 'Akses koordinasi untuk memantau RW di kelurahan yang dipilih.',
                    icon: Building,
                    color: 'text-indigo-500',
                  },
                  {
                    id: 'rw' as PortalRole,
                    label: 'Pengurus UKKT RW',
                    desc: 'Akses mengelola data RW, biodata KSB, medsos, dan kegiatan RW sendiri.',
                    icon: Users,
                    color: 'text-emerald-500',
                  },
                  {
                    id: 'public' as PortalRole,
                    label: 'Warga / Pemuda (Publik)',
                    desc: 'Akses pengunjung umum untuk melihat informasi publik, berita, dan pendaftaran anggota.',
                    icon: Globe,
                    color: 'text-blue-500',
                  },
                ].map((r) => (
                  <label
                    key={r.id}
                    onClick={() => setTempRole(r.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      tempRole === r.id
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.id}
                      checked={tempRole === r.id}
                      onChange={() => setTempRole(r.id)}
                      className="mt-1 text-blue-600"
                    />
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <r.icon size={15} className={r.color} />
                        <span>{r.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {r.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Jika Kelurahan / RW, Pilih Wilayah */}
            {(tempRole === 'kelurahan' || tempRole === 'rw') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Pilih Kelurahan Anda
                  </label>
                  <select
                    value={tempKelurahan}
                    onChange={(e) => {
                      const k = e.target.value as KelurahanName;
                      setTempKelurahan(k);
                      setTempRw(MAP_WILAYAH_TAMBORA[k][0]);
                    }}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                  >
                    {DAFTAR_KELURAHAN_TAMBORA.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                {tempRole === 'rw' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Pilih Nomor RW
                    </label>
                    <select
                      value={tempRw}
                      onChange={(e) => setTempRw(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border rounded-xl font-bold font-mono"
                    >
                      {(MAP_WILAYAH_TAMBORA[tempKelurahan] || ['001']).map((rw) => (
                        <option key={rw} value={rw}>
                          RW {rw}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Input PIN Pengurus jika bukan public */}
            {tempRole !== 'public' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  PIN / Kata Sandi Pengurus
                </label>
                <input
                  type="password"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  placeholder="Masukkan PIN (default: 123456)"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  * Untuk kebutuhan demonstrasi, PIN standar adalah 123456 atau admin.
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <LogIn size={15} />
                <span>Masuk & Terapkan Hak Akses</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
