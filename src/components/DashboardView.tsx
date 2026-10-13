import React, { useState, useMemo } from 'react';
import {
  Users,
  FileText,
  ClipboardList,
  CheckCircle2,
  Building2,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  AlertCircle,
  PlusCircle,
  CreditCard,
  ShieldAlert,
  Trophy,
  Search,
  Filter,
  UserCheck,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Shield,
  Award,
  Flame,
  Upload,
} from 'lucide-react';
import {
  SuratRecord,
  LpjStimulanRecord,
  UnitRWProfile,
  PendaftaranAnggota,
  KegiatanRecord,
  ActiveTab,
  KelurahanName,
} from '../types';
import {
  MAP_WILAYAH_TAMBORA,
  DAFTAR_KELURAHAN_TAMBORA,
  TOTAL_UNIT_RW,
} from '../data/wilayah';
import { getKegiatanList, getPenyaluranDanaList } from '../services/storage';
import { useLogos } from '../data/logos';

interface DashboardViewProps {
  suratList: SuratRecord[];
  lpjList: LpjStimulanRecord[];
  ukktList: UnitRWProfile[];
  pendaftaranList: PendaftaranAnggota[];
  kegiatanList?: KegiatanRecord[];
  onNavigate: (tab: ActiveTab) => void;
  onSelectUnit: (kelurahan: KelurahanName, rw: string) => void;
  onOpenUploadLogo?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  suratList,
  lpjList,
  ukktList,
  pendaftaranList,
  kegiatanList: propKegiatanList,
  onNavigate,
  onSelectUnit,
  onOpenUploadLogo,
}) => {
  const { logoNasional, logoDki, hasLogoNasional, hasLogoDki, hasAnyLogo } = useLogos();
  const kegiatanList = propKegiatanList || getKegiatanList();

  // State untuk Rincian Pendaftaran Anggota per Kelurahan & RW
  const [selectedKelPendaftaran, setSelectedKelPendaftaran] = useState<string>('SEMUA');
  const [selectedRwPendaftaran, setSelectedRwPendaftaran] = useState<string>('SEMUA');
  const [searchPendaftar, setSearchPendaftar] = useState<string>('');

  // State filter untuk Tabel Keaktifan UKKT RW
  const [filterKelKeaktifan, setFilterKelKeaktifan] = useState<string>('SEMUA');

  const pendingRegistrations = pendaftaranList.filter((p) => p.status === 'Pending').length;
  const diterimaRegistrations = pendaftaranList.filter((p) => p.status === 'Diterima').length;

  // Total stimulan terinput di sistem
  const totalRealisasi = lpjList.reduce((acc, curr) => {
    return acc + curr.pengeluaran.reduce((sum, item) => sum + item.jumlah, 0);
  }, 0);

  // Penyaluran Dana Stimulan Real-Time
  const penyaluranList = useMemo(() => getPenyaluranDanaList(), []);
  const danaSudahCair = useMemo(
    () =>
      penyaluranList
        .filter((p) => p.statusCair === 'Sudah Cair')
        .reduce((acc, curr) => acc + curr.nominal, 0),
    [penyaluranList]
  );
  const totalDanaAlokasi = useMemo(
    () => penyaluranList.reduce((acc, curr) => acc + curr.nominal, 0),
    [penyaluranList]
  );
  const persenDanaCair =
    totalDanaAlokasi > 0 ? Math.round((danaSudahCair / totalDanaAlokasi) * 100) : 0;

  // =========================================================================
  // 1. DATA REKAPITULASI PENDAFTARAN ANGGOTA PER KELURAHAN & RINCIAN TIAP RW
  // =========================================================================
  const rekapAnggotaPerKelurahan = useMemo(() => {
    return DAFTAR_KELURAHAN_TAMBORA.map((kel) => {
      const listDiKel = pendaftaranList.filter((p) => p.kelurahan === kel);
      const diterima = listDiKel.filter((p) => p.status === 'Diterima').length;
      const pending = listDiKel.filter((p) => p.status === 'Pending').length;

      // Group per RW di kelurahan ini
      const rwCountMap: Record<string, number> = {};
      const rwMembersMap: Record<string, PendaftaranAnggota[]> = {};

      listDiKel.forEach((p) => {
        const rwKey = p.rw || '001';
        rwCountMap[rwKey] = (rwCountMap[rwKey] || 0) + 1;
        if (!rwMembersMap[rwKey]) rwMembersMap[rwKey] = [];
        rwMembersMap[rwKey].push(p);
      });

      return {
        kelurahan: kel,
        totalAnggota: listDiKel.length,
        diterima,
        pending,
        totalRw: (MAP_WILAYAH_TAMBORA[kel] || []).length,
        rwTerisiCount: Object.keys(rwCountMap).length,
        rwCountMap,
        rwMembersMap,
      };
    });
  }, [pendaftaranList]);

  // Filter daftar anggota untuk tabel rincian
  const filteredAnggotaList = useMemo(() => {
    return pendaftaranList.filter((p) => {
      if (selectedKelPendaftaran !== 'SEMUA' && p.kelurahan !== selectedKelPendaftaran) {
        return false;
      }
      if (selectedRwPendaftaran !== 'SEMUA' && p.rw !== selectedRwPendaftaran) {
        return false;
      }
      if (searchPendaftar.trim()) {
        const q = searchPendaftar.toLowerCase();
        const matchNama = p.namaLengkap.toLowerCase().includes(q);
        const matchNik = p.nik.includes(q);
        const matchKel = p.kelurahan.toLowerCase().includes(q);
        const matchRw = p.rw.includes(q);
        const matchMinat = (p.minatBidang || '').toLowerCase().includes(q);
        return matchNama || matchNik || matchKel || matchRw || matchMinat;
      }
      return true;
    });
  }, [pendaftaranList, selectedKelPendaftaran, selectedRwPendaftaran, searchPendaftar]);

  // List RW yang tersedia di kelurahan terpilih
  const availableRwsForSelectedKel = useMemo(() => {
    if (selectedKelPendaftaran === 'SEMUA') return [];
    return MAP_WILAYAH_TAMBORA[selectedKelPendaftaran as KelurahanName] || [];
  }, [selectedKelPendaftaran]);

  // =========================================================================
  // 2. TABEL URUTAN KEAKTIFAN UKKT RW: SEMUA UKKT YANG STATUS AKTIF
  // (Peringkat JANGAN HANYA 1, 2, 3 tapi SEMUANYA UKKT yang status Aktif)
  // =========================================================================
  const allActiveUkktLeaderboard = useMemo(() => {
    // Map data profil dari ukktList
    const mapProfile = new Map<string, UnitRWProfile>();
    ukktList.forEach((u) => {
      mapProfile.set(`${u.kelurahan}_${u.nomorRw}`, u);
    });

    // Hitung seluruh 96 RW
    const mapRwKegiatan = new Map<
      string,
      {
        kelurahan: KelurahanName;
        nomorRw: string;
        namaKetua: string;
        isStatusAktif: boolean;
        totalKegiatan: number;
        totalPartisipan: number;
        totalAnggaran: number;
        bidangMap: Record<string, number>;
      }
    >();

    DAFTAR_KELURAHAN_TAMBORA.forEach((kel) => {
      const rwList = MAP_WILAYAH_TAMBORA[kel] || [];
      rwList.forEach((rw) => {
        const key = `${kel}_${rw}`;
        const prof = mapProfile.get(key);

        // Kriteria Status Aktif:
        // 1. Secara eksplisit ditandai statusAktif === 'Aktif'
        // 2. Atau memiliki SK / KSB yang sudah terdata
        // 3. Atau memiliki kegiatan tercatat
        const hasKsb =
          prof?.pengurus?.ketua?.namaLengkap ||
          prof?.namaKetua ||
          prof?.nomorSk;
        const isAktif =
          prof?.statusAktif === 'Aktif' ||
          (!prof?.statusAktif && Boolean(hasKsb)) ||
          prof?.statusAktif !== 'Belum Aktif';

        mapRwKegiatan.set(key, {
          kelurahan: kel,
          nomorRw: rw,
          namaKetua: prof?.pengurus?.ketua?.namaLengkap || prof?.namaKetua || 'Pengurus RW',
          isStatusAktif: Boolean(isAktif),
          totalKegiatan: 0,
          totalPartisipan: 0,
          totalAnggaran: 0,
          bidangMap: {},
        });
      });
    });

    // Akumulasi data kegiatan resmi
    kegiatanList.forEach((keg) => {
      if (keg.tingkat === 'Unit RW' && keg.nomorRw) {
        const key = `${keg.kelurahan}_${keg.nomorRw}`;
        const item = mapRwKegiatan.get(key);
        if (item) {
          item.totalKegiatan += 1;
          item.totalPartisipan += keg.jumlahPartisipan || 0;
          item.totalAnggaran += keg.anggaranBiaya || 0;
          item.bidangMap[keg.bidang] = (item.bidangMap[keg.bidang] || 0) + 1;
          // Unit yang mengadakan kegiatan otomatis berstatus aktif
          item.isStatusAktif = true;
        }
      }
    });

    // Filter HANYA UKKT yang berstatus AKTIF
    const activeOnly = Array.from(mapRwKegiatan.values()).filter((item) => item.isStatusAktif);

    // Hitung skor keaktifan dan bidang populer
    const rankedList = activeOnly.map((rwItem) => {
      let topBidang = 'Pemberdayaan Pemuda';
      let maxCount = 0;
      Object.entries(rwItem.bidangMap).forEach(([bName, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topBidang = bName;
        }
      });

      // Formula skor keaktifan
      const skorAktivitas =
        rwItem.totalKegiatan * 15 + Math.round(rwItem.totalPartisipan * 0.2);

      return {
        ...rwItem,
        topBidang,
        skorAktivitas,
      };
    });

    // Urutkan dari yang paling aktif (kegiatan tertinggi -> skor keaktifan tertinggi)
    rankedList.sort(
      (a, b) =>
        b.totalKegiatan - a.totalKegiatan ||
        b.skorAktivitas - a.skorAktivitas ||
        a.nomorRw.localeCompare(b.nomorRw)
    );

    return rankedList;
  }, [ukktList, kegiatanList]);

  // Filter leaderboard berdasarkan kelurahan jika dipilih
  const filteredActiveLeaderboard = useMemo(() => {
    if (filterKelKeaktifan === 'SEMUA') return allActiveUkktLeaderboard;
    return allActiveUkktLeaderboard.filter((item) => item.kelurahan === filterKelKeaktifan);
  }, [allActiveUkktLeaderboard, filterKelKeaktifan]);

  return (
    <div className="space-y-7">
      {/* 1. Hero Welcome Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800 rounded-3xl p-6 lg:p-8 text-white shadow-xl border border-blue-700/50">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-xs font-bold text-sky-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Sistem Informasi Resmi Karang Taruna Kecamatan Tambora
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Selamat Datang di Portal Layanan Falakiyah
          </h1>

                    <div className="pt-2 flex flex-wrap gap-2.5 sm:gap-3">
            <button
              onClick={() => onNavigate('buat-surat')}
              className="bg-white hover:bg-blue-50 text-blue-900 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <FileText size={16} className="text-blue-600" />
              <span>Buat Surat Baru</span>
            </button>

            <button
              onClick={() => onNavigate('hasil-lpj')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <ClipboardList size={16} />
              <span>Input & Cetak LPJ</span>
            </button>

            <button
              onClick={() => onNavigate('pendaftaran-online')}
              className="bg-sky-400 hover:bg-sky-500 text-slate-950 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Users size={16} />
              <span>+ Form Pendaftaran Anggota</span>
            </button>

            <button
              onClick={() => onNavigate('pengaturan')}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>⚙️ Atur Kop & Logo</span>
            </button>
          </div>
        </div>

        {/* Right: Subtle Architectural Building Illustration Watermark as in screenshot */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block opacity-15 pointer-events-none text-white">
          <svg className="w-56 h-56" viewBox="0 0 100 100" fill="currentColor">
            <path d="M10 85h80v4H10zM14 45h8v36h-8zM28 45h8v36h-8zM42 45h8v36h-8zM56 45h8v36h-8zM70 45h8v36h-8zM8 40h84v4H8zM50 12L8 38h84L50 12zM50 20a6 6 0 100 12 6 6 0 000-12z" />
          </svg>
        </div>

        {/* Background Decorative Rings */}
        <div className="absolute -right-12 -bottom-16 w-80 h-80 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* 2. KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total UKKT RW */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total UKKT RW
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <Building2 size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              96
            </span>
            <span className="text-xs font-bold text-blue-600">Unit RW</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">11 Kelurahan se-Tambora</div>
        </div>

        {/* Anggota Terdaftar (Pendaftaran Online) */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Anggota Terdaftar
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {pendaftaranList.length}
            </span>
            <span className="text-xs font-bold text-sky-600">Kader Pemuda</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <UserCheck size={12} />
            <span>{diterimaRegistrations} Terverifikasi • {pendingRegistrations} Pending</span>
          </div>
        </div>

        {/* Realisasi Dana & Penyaluran Stimulan */}
        <div
          onClick={() => onNavigate('tanda-terima')}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-emerald-500 transition-all group"
          title="Klik untuk membuka Monitoring Penyaluran Uang & Tanda Terima"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
              Penyaluran Uang Stimulan
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
              Rp {danaSudahCair.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
              {persenDanaCair}%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center justify-between">
            <span>{penyaluranList.filter((p) => p.statusCair === 'Sudah Cair').length} Unit Telah Cair</span>
            <span className="text-purple-600 text-[10.5px] font-bold group-hover:underline">Buka &rarr;</span>
          </div>
        </div>

        {/* Verifikasi Berkas Pending */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Verifikasi Masuk
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {pendingRegistrations}
            </span>
            <span className="text-xs font-bold text-amber-600">Pending</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Menunggu E-KTA</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. REKAPITULASI JUMLAH ANGGOTA TIAP KELURAHAN & RINCIAN TIAP RW          */}
      {/* YANG SUDAH ISI PENDAFTARAN ANGGOTA KARANG TARUNA TAMBORA                 */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10.5px] font-black uppercase">
              <Users size={12} />
              <span>REKAPITULASI RESMI PENDAFTARAN ANGGOTA</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <span>Jumlah Anggota Tiap Kelurahan & Rincian Tiap RW</span>
            </h2>
           
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('pendaftaran-online')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>+ Form Pendaftaran</span>
            </button>

            <button
              onClick={() => onNavigate('verifikasi-berkas')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <UserCheck size={14} />
              <span>Verifikasi Berkas ({pendingRegistrations})</span>
            </button>

            <button
              onClick={() => onNavigate('kartu-kta')}
              className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <CreditCard size={14} />
              <span>E-KTA Digital</span>
            </button>
          </div>
        </div>

        {/* 11 Kelurahan Grid Cards: Menampilkan Jumlah Anggota Tiap Kelurahan */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Tampilan 11 Kelurahan: Klik untuk Membuka Rincian Tiap RW
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Total {pendaftaranList.length} Pemuda Terdaftar
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5">
            {/* Tombol Tampilkan Semua */}
            <div
              onClick={() => {
                setSelectedKelPendaftaran('SEMUA');
                setSelectedRwPendaftaran('SEMUA');
              }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                selectedKelPendaftaran === 'SEMUA'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-300'
              }`}
            >
              <div>
                <span
                  className={`text-[9.5px] font-black px-1.5 py-0.5 rounded ${
                    selectedKelPendaftaran === 'SEMUA'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  SEMUA (11)
                </span>
                <div className="font-black text-xs mt-1 truncate">Seluruh Wilayah</div>
              </div>
              <div className="mt-2 pt-2 border-t border-white/10 flex items-baseline justify-between">
                <span className="text-lg font-black font-mono">{pendaftaranList.length}</span>
                <span className="text-[10px] font-bold opacity-80">Anggota</span>
              </div>
            </div>

            {/* 11 Kelurahan */}
            {rekapAnggotaPerKelurahan.map((item) => {
              const isSelected = selectedKelPendaftaran === item.kelurahan;
              return (
                <div
                  key={item.kelurahan}
                  onClick={() => {
                    setSelectedKelPendaftaran(item.kelurahan);
                    setSelectedRwPendaftaran('SEMUA');
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[9.5px] font-black px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {item.totalRw} RW
                      </span>
                      {item.totalAnggota > 0 && (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-emerald-500'
                          }`}
                        />
                      )}
                    </div>
                    <div
                      className={`font-black text-xs truncate ${
                        isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.kelurahan}
                    </div>
                    <div
                      className={`text-[10px] truncate mt-0.5 ${
                        isSelected ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {item.rwTerisiCount} RW terisi
                    </div>
                  </div>

                  <div
                    className={`mt-2 pt-2 border-t flex items-baseline justify-between ${
                      isSelected ? 'border-white/20' : 'border-slate-200/80 dark:border-slate-700'
                    }`}
                  >
                    <span className="text-lg font-black font-mono">{item.totalAnggota}</span>
                    <span
                      className={`text-[10px] font-bold ${
                        isSelected ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      Orang
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel Rincian Tiap RW di Kelurahan Terpilih */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                <MapPin size={14} className="text-red-500" />
                <span>
                  Rincian Anggota Tiap RW: {selectedKelPendaftaran === 'SEMUA' ? 'Semua Kelurahan' : `Kelurahan ${selectedKelPendaftaran}`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pilih nomor RW untuk melihat nama kader pemuda yang mendaftar di masing-masing unit.
              </p>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedKelPendaftaran !== 'SEMUA' && (
                <select
                  value={selectedRwPendaftaran}
                  onChange={(e) => setSelectedRwPendaftaran(e.target.value)}
                  className="p-2 bg-white dark:bg-slate-900 border rounded-xl text-xs font-bold"
                >
                  <option value="SEMUA">Semua RW di Kel. {selectedKelPendaftaran}</option>
                  {availableRwsForSelectedKel.map((rw) => {
                    const countInRw = pendaftaranList.filter(
                      (p) => p.kelurahan === selectedKelPendaftaran && p.rw === rw
                    ).length;
                    return (
                      <option key={rw} value={rw}>
                        RW {rw} ({countInRw} Orang)
                      </option>
                    );
                  })}
                </select>
              )}

              <div className="relative">
                <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchPendaftar}
                  onChange={(e) => setSearchPendaftar(e.target.value)}
                  placeholder="Cari nama / RW / NIK..."
                  className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border rounded-xl text-xs font-medium w-48 sm:w-56"
                />
              </div>
            </div>
          </div>

          {/* Pill Selector Rincian Tiap RW jika Kelurahan dipilih */}
          {selectedKelPendaftaran !== 'SEMUA' && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={() => setSelectedRwPendaftaran('SEMUA')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedRwPendaftaran === 'SEMUA'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border'
                }`}
              >
                Semua RW ({filteredAnggotaList.length})
              </button>
              {availableRwsForSelectedKel.map((rw) => {
                const count = pendaftaranList.filter(
                  (p) => p.kelurahan === selectedKelPendaftaran && p.rw === rw
                ).length;
                return (
                  <button
                    key={rw}
                    onClick={() => setSelectedRwPendaftaran(rw)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      selectedRwPendaftaran === rw
                        ? 'bg-blue-600 text-white shadow-xs'
                        : count > 0
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>RW {rw}</span>
                    <span
                      className={`text-[9.5px] px-1 rounded-full ${
                        count > 0 ? 'bg-emerald-200 text-emerald-950 dark:bg-emerald-800 dark:text-white font-black' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tabel Rincian Anggota yang Sudah Isi Pendaftaran */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10.5px] font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12">No</th>
                    <th className="py-2.5 px-3">Nama Lengkap & NIK</th>
                    <th className="py-2.5 px-3">Wilayah Unit RW</th>
                    <th className="py-2.5 px-3">Minat & Pekerjaan</th>
                    <th className="py-2.5 px-3 text-center">Status Verifikasi</th>
                    <th className="py-2.5 px-3">Waktu Daftar</th>
                    <th className="py-2.5 px-3 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAnggotaList.length > 0 ? (
                    filteredAnggotaList.map((p, idx) => {
                      // Sensor NIK untuk privasi
                      const maskedNik =
                        p.nik && p.nik.length === 16
                          ? `${p.nik.slice(0, 6)}******${p.nik.slice(12)}`
                          : p.nik;

                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-extrabold text-slate-900 dark:text-white">
                              {p.namaLengkap}
                            </div>
                            <div className="font-mono text-[10.5px] text-slate-400">
                              NIK: {maskedNik}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-blue-700 dark:text-blue-300">
                              RW {p.rw} {p.rt ? `• RT ${p.rt}` : ''}
                            </div>
                            <div className="text-[10.5px] text-slate-500 font-medium">
                              Kel. {p.kelurahan}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {p.minatBidang || 'Pemberdayaan Umum'}
                            </div>
                            <div className="text-[10.5px] text-slate-400 truncate max-w-xs">
                              {p.pekerjaan || '-'}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                p.status === 'Diterima'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : p.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-400">
                            {p.waktuDaftar || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => onNavigate('verifikasi-berkas')}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                title="Buka Verifikasi Berkas"
                              >
                                Verifikasi
                              </button>
                              <button
                                onClick={() => onNavigate('kartu-kta')}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                title="Cetak E-KTA"
                              >
                                E-KTA
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                        Belum ada anggota yang terdaftar pada filter RW / Kelurahan ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TABEL URUTAN KEAKTIFAN UKKT RW: SELURUH UKKT YANG STATUS AKTIF         */}
      {/* (Peringkat JANGAN HANYA 1, 2, 3 tapi SEMUANYA UKKT yang status Aktif)     */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10.5px] font-black uppercase">
              <Trophy size={13} className="text-amber-600" />
              <span>PERINGKAT KEAKTIFAN LENGKAP</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <span>Tabel Urutan Keaktifan UKKT RW</span>
            </h2>
            <p className="text-xs text-slate-500">
              Peringkat menampilkan <strong>seluruh UKKT RW berstatus Aktif</strong> ({allActiveUkktLeaderboard.length} Unit Aktif Terdata) berdasarkan volume kegiatan, partisipasi, dan keaktifan pemuda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">Filter Kelurahan:</span>
            <select
              value={filterKelKeaktifan}
              onChange={(e) => setFilterKelKeaktifan(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500"
            >
              <option value="SEMUA">Semua Kelurahan (11)</option>
              {DAFTAR_KELURAHAN_TAMBORA.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>

            <button
              onClick={() => onNavigate('rekap-kegiatan')}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Detail Rekap</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Tabel Lengkap Semua UKKT Berstatus Aktif */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-[10.5px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 text-center w-20">Peringkat</th>
                <th className="py-3 px-4">Unit Kerja RW</th>
                <th className="py-3 px-4">Kelurahan</th>
                <th className="py-3 px-4 text-center">Status UKKT</th>
                <th className="py-3 px-4 text-center">Frekuensi Kegiatan</th>
                <th className="py-3 px-4 text-center">Partisipan Pemuda</th>
                <th className="py-3 px-4 text-right">Anggaran Terserap</th>
                <th className="py-3 px-4">Bidang Paling Sering</th>
                <th className="py-3 px-4 text-center">Skor Keaktifan</th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredActiveLeaderboard.map((item, idx) => (
                <tr
                  key={`${item.kelurahan}_${item.nomorRw}`}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                    idx < 3 ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                  }`}
                >
                  {/* Peringkat Berurutan: 1, 2, 3, 4, 5, 6, ... SEMUANYA */}
                  <td className="py-3.5 px-4 text-center font-black">
                    {idx === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-xs">
                        🥇 1
                      </span>
                    ) : idx === 1 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-300 text-slate-900 text-xs font-black shadow-xs">
                        🥈 2
                      </span>
                    ) : idx === 2 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-600 text-white text-xs font-black shadow-xs">
                        🥉 3
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-black">
                        #{idx + 1}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono text-[11px] font-bold">
                        RW {item.nomorRw}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      Ketua: {item.namaKetua}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                    {item.kelurahan}
                  </td>

                  {/* Status: Badge AKTIF */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      AKTIF
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-black text-xs ${
                        item.totalKegiatan > 0
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}
                    >
                      {item.totalKegiatan} Kegiatan
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600">
                    {item.totalPartisipan} Jiwa
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                    Rp {item.totalAnggaran.toLocaleString('id-ID')}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 truncate max-w-xs font-medium">
                    {item.topBidang}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="font-black text-amber-600 font-mono text-xs">
                      {item.skorAktivitas} Poin
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => {
                        onSelectUnit(item.kelurahan, item.nomorRw);
                        onNavigate('unit-rw');
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer"
                    >
                      Buka RW
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Wilayah 11 Kelurahan Grid Interactive Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin size={18} className="text-red-500" />
              <span>Wilayah Kerja 11 Kelurahan se-Tambora</span>
            </h2>
            <p className="text-xs text-slate-500">
              Pilih kelurahan untuk langsung mengelola data legalitas UKKT RW, SK, dan bendahara bank.
            </p>
          </div>
          <button
            onClick={() => onNavigate('unit-rw')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Buka Semua Unit</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5">
          {(Object.keys(MAP_WILAYAH_TAMBORA) as KelurahanName[]).map((kel) => {
            const listRw = MAP_WILAYAH_TAMBORA[kel];
            return (
              <div
                key={kel}
                onClick={() => {
                  onSelectUnit(kel, listRw[0]);
                  onNavigate('unit-rw');
                }}
                className="group p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/60 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700 hover:border-blue-300 transition-all cursor-pointer text-left"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {listRw.length} RW
                  </span>
                  <ArrowRight
                    size={12}
                    className="text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5"
                  />
                </div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                  {kel}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  RW {listRw[0]} s/d RW {listRw[listRw.length - 1]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Two Column Section: LPJ & Surat Terakhir */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Laporan Pertanggungjawaban Terbaru */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} className="text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Laporan LPJ Dana Stimulan Terbaru
              </h3>
            </div>
            <button
              onClick={() => onNavigate('hasil-lpj')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              Lihat Detail
            </button>
          </div>

          <div className="p-4 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
            {lpjList.length > 0 ? (
              lpjList.slice(0, 3).map((lpj) => {
                const total = lpj.pengeluaran.reduce((s, i) => s + i.jumlah, 0);
                return (
                  <div
                    key={lpj.id}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
                  >
                    <div>
                      <div className="font-black text-xs text-slate-900 dark:text-white">
                        {lpj.tingkat === 'Unit RW' ? `UKKT RW ${lpj.nomorRw}` : lpj.kelurahan} • Kel.{' '}
                        {lpj.kelurahan}
                      </div>
                      <div className="text-[10.5px] text-slate-500 mt-0.5">
                        Bulan {lpj.bulan} {lpj.tahun} • {lpj.pengeluaran.length} Uraian Kegiatan
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-black text-xs text-emerald-600">
                        Rp {total.toLocaleString('id-ID')}
                      </div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {lpj.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada laporan LPJ dana stimulan yang tersimpan.
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => onNavigate('hasil-lpj')}
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600"
            >
              + Input Penggunaan Dana Stimulan Baru
            </button>
          </div>
        </div>

        {/* Arsip Surat Terakhir */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Surat Resmi Terakhir Diterbitkan
              </h3>
            </div>
            <button
              onClick={() => onNavigate('arsip-surat')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Lihat Arsip
            </button>
          </div>

          <div className="p-4 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
            {suratList.slice(0, 3).map((surat) => (
              <div
                key={surat.id}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-mono text-[10.5px] font-black text-blue-600">
                    {surat.nomorSurat}
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {surat.perihal}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                    Kepada: {surat.penerima}
                  </div>
                </div>

                <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {surat.jenisSurat.split(' ')[1] || 'Surat'}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => onNavigate('buat-surat')}
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600"
            >
              + Cetak Surat Dinas Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
