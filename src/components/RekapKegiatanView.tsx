import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Award,
  TrendingUp,
  BarChart3,
  Calendar,
  Building,
  Users,
  DollarSign,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Filter,
  Flame,
  Star,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { KegiatanRecord, KelurahanName, UnitRWProfile } from '../types';
import { DAFTAR_KELURAHAN_TAMBORA, MAP_WILAYAH_TAMBORA, BIDANG_KEGIATAN_KATAR } from '../data/wilayah';
import { getOrganisasi, getUKKTList } from '../services/storage';
import { getActiveLogoNasional, getActiveLogoDki } from '../data/logos';

interface RekapKegiatanViewProps {
  kegiatanList: KegiatanRecord[];
  onNavigateToUnit?: (kelurahan: KelurahanName, nomorRw: string) => void;
  onNavigateToKegiatan?: () => void;
}

export const RekapKegiatanView: React.FC<RekapKegiatanViewProps> = ({
  kegiatanList,
  onNavigateToUnit,
  onNavigateToKegiatan,
}) => {
  const [filterKelurahan, setFilterKelurahan] = useState<string>('SEMUA');
  const [filterOnlyActive, setFilterOnlyActive] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'rw' | 'kelurahan' | 'bidang'>('rw');

  const org = getOrganisasi();
  const allUkkt = getUKKTList();

  // 1. Leaderboard Ranking UKKT RW Paling Sering Mengadakan Kegiatan (Semua UKKT Status Aktif)
  const rwLeaderboard = useMemo(() => {
    // Map profil untuk mengecek status aktif & nama ketua
    const mapProfile = new Map<string, UnitRWProfile>();
    allUkkt.forEach((u) => {
      mapProfile.set(`${u.kelurahan}_${u.nomorRw}`, u);
    });

    // Kumpulkan seluruh 96 RW
    const mapRw = new Map<
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
        kegiatanIds: string[];
      }
    >();

    DAFTAR_KELURAHAN_TAMBORA.forEach((kel) => {
      const rwList = MAP_WILAYAH_TAMBORA[kel] || [];
      rwList.forEach((rw) => {
        const key = `${kel}_${rw}`;
        const prof = mapProfile.get(key);

        const hasKsb =
          prof?.pengurus?.ketua?.namaLengkap ||
          prof?.namaKetua ||
          prof?.nomorSk;
        const isAktif =
          prof?.statusAktif === 'Aktif' ||
          (!prof?.statusAktif && Boolean(hasKsb)) ||
          prof?.statusAktif !== 'Belum Aktif';

        mapRw.set(key, {
          kelurahan: kel,
          nomorRw: rw,
          namaKetua: prof?.pengurus?.ketua?.namaLengkap || prof?.namaKetua || 'Pengurus RW',
          isStatusAktif: Boolean(isAktif),
          totalKegiatan: 0,
          totalPartisipan: 0,
          totalAnggaran: 0,
          bidangMap: {},
          kegiatanIds: [],
        });
      });
    });

    // Hitung kegiatan yang tercatat
    kegiatanList.forEach((keg) => {
      if (keg.tingkat === 'Unit RW' && keg.nomorRw) {
        const key = `${keg.kelurahan}_${keg.nomorRw}`;
        const item = mapRw.get(key);
        if (item) {
          item.totalKegiatan += 1;
          item.totalPartisipan += keg.jumlahPartisipan || 0;
          item.totalAnggaran += keg.anggaranBiaya || 0;
          item.bidangMap[keg.bidang] = (item.bidangMap[keg.bidang] || 0) + 1;
          item.kegiatanIds.push(keg.id);
          item.isStatusAktif = true; // Jika ada kegiatan tercatat, pasti aktif
        }
      }
    });

    // Array dan hitung skor keaktifan
    const arr = Array.from(mapRw.values()).map((rwItem) => {
      let topBidang = 'Pemberdayaan Pemuda';
      let maxCount = 0;
      Object.entries(rwItem.bidangMap).forEach(([bName, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topBidang = bName;
        }
      });

      // Hitung skor aktivitas (Bobot: frekuensi x 15 + partisipan x 0.2)
      const skorAktivitas = rwItem.totalKegiatan * 15 + Math.round(rwItem.totalPartisipan * 0.2);

      return {
        ...rwItem,
        topBidang,
        skorAktivitas,
      };
    });

    // Sort by totalKegiatan descending, then by skorAktivitas, then by RW
    arr.sort(
      (a, b) =>
        b.totalKegiatan - a.totalKegiatan ||
        b.skorAktivitas - a.skorAktivitas ||
        a.nomorRw.localeCompare(b.nomorRw)
    );

    return arr;
  }, [kegiatanList, allUkkt]);

  // 2. Leaderboard Kelurahan Paling Sering Mengadakan Kegiatan
  const kelurahanLeaderboard = useMemo(() => {
    return DAFTAR_KELURAHAN_TAMBORA.map((kel) => {
      const kegsInKel = kegiatanList.filter((k) => k.kelurahan === kel);
      const totalKegiatan = kegsInKel.length;
      const totalPartisipan = kegsInKel.reduce((sum, k) => sum + (k.jumlahPartisipan || 0), 0);
      const totalAnggaran = kegsInKel.reduce((sum, k) => sum + (k.anggaranBiaya || 0), 0);

      return {
        kelurahan: kel,
        totalKegiatan,
        totalPartisipan,
        totalAnggaran,
        totalRw: (MAP_WILAYAH_TAMBORA[kel] || []).length,
      };
    }).sort((a, b) => b.totalKegiatan - a.totalKegiatan || b.totalPartisipan - a.totalPartisipan);
  }, [kegiatanList]);

  // 3. Rekap Berdasarkan 9 Bidang Karang Taruna
  const bidangStats = useMemo(() => {
    return BIDANG_KEGIATAN_KATAR.map((bid) => {
      const kegsInBid = kegiatanList.filter((k) => k.bidang === bid);
      const totalKegiatan = kegsInBid.length;
      const totalPartisipan = kegsInBid.reduce((sum, k) => sum + (k.jumlahPartisipan || 0), 0);
      const totalAnggaran = kegsInBid.reduce((sum, k) => sum + (k.anggaranBiaya || 0), 0);

      return {
        bidang: bid,
        totalKegiatan,
        totalPartisipan,
        totalAnggaran,
        persen: kegiatanList.length > 0 ? Math.round((totalKegiatan / kegiatanList.length) * 100) : 0,
      };
    }).sort((a, b) => b.totalKegiatan - a.totalKegiatan);
  }, [kegiatanList]);

  // Filter RW Leaderboard: Peringkat SEMUA UKKT yang status Aktif
  const filteredRwLeaderboard = useMemo(() => {
    let list = rwLeaderboard;
    if (filterOnlyActive) {
      list = list.filter((r) => r.isStatusAktif);
    }
    if (filterKelurahan !== 'SEMUA') {
      list = list.filter((r) => r.kelurahan === filterKelurahan);
    }
    return list;
  }, [rwLeaderboard, filterKelurahan, filterOnlyActive]);

  // Cetak Dokumen Rekap Keaktifan Resmi
  const handlePrintRekap = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Izinkan popup untuk mencetak laporan rekapitulasi.');
      return;
    }

    const rowsHtml = filteredRwLeaderboard
      .map(
        (item, idx) => `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td><b>RW ${item.nomorRw}</b></td>
          <td>${item.kelurahan}</td>
          <td style="text-align: center;"><span style="background: #dcfce7; color: #166534; font-weight: bold; font-size: 9px; padding: 2px 6px; border-radius: 4px;">AKTIF</span></td>
          <td style="text-align: center; font-weight: bold; font-size: 11px; color: #1d4ed8;">${item.totalKegiatan} Kali</td>
          <td style="text-align: center;">${item.totalPartisipan} Jiwa</td>
          <td style="text-align: right;">Rp ${item.totalAnggaran.toLocaleString('id-ID')}</td>
          <td>${item.topBidang}</td>
          <td style="text-align: center; font-weight: bold;">${item.skorAktivitas} Poin</td>
        </tr>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rekapitulasi Keaktifan Kegiatan Karang Taruna Tambora</title>
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: 'Arial', sans-serif; font-size: 11px; color: #111; line-height: 1.3; }
          .kop-container { border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }
          .kop-logo { width: 65px; height: 65px; object-fit: contain; }
          .kop-center { text-align: center; flex: 1; padding: 0 10px; }
          .kop-t1 { font-size: 13px; font-weight: bold; }
          .kop-t2 { font-size: 15px; font-weight: 900; }
          .kop-t3 { font-size: 12px; font-weight: bold; }
          .title-doc { text-align: center; font-size: 14px; font-weight: 900; text-transform: uppercase; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          th, td { border: 1px solid #333; padding: 5px 7px; }
          th { background: #f1f5f9; font-weight: bold; text-align: center; }
          .ttd-box { margin-top: 25px; display: flex; justify-content: flex-end; }
          .ttd-col { text-align: center; width: 220px; }
        </style>
      </head>
      <body>
        <div class="kop-container">
          ${
            (org.logoKiriUrl || getActiveLogoNasional())
              ? `<img src="${org.logoKiriUrl || getActiveLogoNasional()}" class="kop-logo" />`
              : `<div style="width: 70px; height: 70px;"></div>`
          }
          <div class="kop-center">
            <div class="kop-t1">PENGURUS KARANG TARUNA</div>
            <div class="kop-t2">KECAMATAN TAMBORA</div>
            <div class="kop-t3">KOTA ADMINISTRASI JAKARTA BARAT</div>
            <div style="font-size: 9.5px; margin-top: 3px;">${org.alamatKopSekretariat || org.alamat}</div>
          </div>
          ${
            (org.logoKananUrl || getActiveLogoDki())
              ? `<img src="${org.logoKananUrl || getActiveLogoDki()}" class="kop-logo" />`
              : `<div style="width: 70px; height: 70px;"></div>`
          }
        </div>

        <div class="title-doc">
          LAPORAN REKAPITULASI KEAKTIFAN & FREKUENSI KEGIATAN UKKT RW<br>
          <span style="font-size: 10.5px; font-weight: normal; text-transform: none;">
            Peringkat Unit Kerja Karang Taruna Paling Aktif Melaksanakan Kegiatan Pemuda
          </span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Peringkat</th>
              <th>Unit RW</th>
              <th>Kelurahan</th>
              <th>Total Kegiatan</th>
              <th>Partisipan Pemuda</th>
              <th>Anggaran Terserap</th>
              <th>Bidang Terbanyak</th>
              <th>Skor Keaktifan</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="ttd-box">
          <div class="ttd-col">
            <div>Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div style="font-weight: bold; margin-top: 3px;">Ketua Karang Taruna Kecamatan Tambora</div>
            <div style="height: 50px;"></div>
            <div style="font-weight: bold; text-decoration: underline;">${org.namaKetuaKecamatan}</div>
            <div style="font-size: 9.5px;">NIK: ${org.nikKetuaKecamatan}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-black uppercase">
              LEADERBOARD & REKAPITULASI
            </span>
            <span className="text-xs text-slate-500 font-medium">Kecamatan Tambora • 96 UKKT RW</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Trophy className="text-amber-500" size={24} />
            <span>Peringkat keaktifan UKKT RW dan Kelurahan</span>
          </h1>
                  </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToKegiatan && (
            <button
              onClick={onNavigateToKegiatan}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Lihat Feed Kegiatan
            </button>
          )}

          <button
            onClick={handlePrintRekap}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Printer size={15} />
            <span>Cetak Ranking Resmi (PDF)</span>
          </button>
        </div>
      </div>

      {/* TOP 3 PODIUM JUARA RW TERAKTIF */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Juara 2 (Perak) */}
        {rwLeaderboard[1] && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-slate-300 dark:border-slate-700 shadow-xs flex flex-col justify-between order-2 md:order-1 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-400">#2 PERAK</span>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-lg text-slate-600">
                🥈
              </div>
            </div>
            <div className="my-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                {rwLeaderboard[1].kelurahan}
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                UKKT RW {rwLeaderboard[1].nomorRw}
              </h3>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-700 dark:text-slate-200">
                  {rwLeaderboard[1].totalKegiatan}
                </span>
                <span className="text-xs font-bold text-slate-500">Kegiatan Terlaksana</span>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>{rwLeaderboard[1].totalPartisipan} Pemuda</span>
              <span>Skor: {rwLeaderboard[1].skorAktivitas}</span>
            </div>
          </div>
        )}

        {/* Juara 1 (Emas) - Paling Menonjol */}
        {rwLeaderboard[0] && (
          <div className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900 p-6 rounded-3xl border-2 border-amber-400 shadow-xl flex flex-col justify-between order-1 md:order-2 relative overflow-hidden scale-102">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-400/20 rounded-full blur-xl" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-800 dark:text-amber-300 bg-amber-200 dark:bg-amber-900/60 px-3 py-1 rounded-full uppercase tracking-wider">
                👑 JUARA 1 TERAKTIF
              </span>
              <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center font-black text-2xl text-slate-950 shadow-md shadow-amber-400/40">
                🥇
              </div>
            </div>
            <div className="my-4">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">
                KELURAHAN {rwLeaderboard[0].kelurahan}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                UKKT RW {rwLeaderboard[0].nomorRw}
              </h3>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-black text-amber-600">
                  {rwLeaderboard[0].totalKegiatan}
                </span>
                <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Kegiatan Terlaksana
                </span>
              </div>
            </div>
            <div className="pt-3 border-t border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
              <span>👥 {rwLeaderboard[0].totalPartisipan} Pemuda Terlibat</span>
              <span>⭐ {rwLeaderboard[0].skorAktivitas} Poin</span>
            </div>
          </div>
        )}

        {/* Juara 3 (Perunggu) */}
        {rwLeaderboard[2] && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-amber-700/40 shadow-xs flex flex-col justify-between order-3 md:order-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-amber-700">#3 PERUNGGU</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center font-black text-lg text-amber-800">
                🥉
              </div>
            </div>
            <div className="my-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                {rwLeaderboard[2].kelurahan}
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                UKKT RW {rwLeaderboard[2].nomorRw}
              </h3>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-700 dark:text-slate-200">
                  {rwLeaderboard[2].totalKegiatan}
                </span>
                <span className="text-xs font-bold text-slate-500">Kegiatan Terlaksana</span>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>{rwLeaderboard[2].totalPartisipan} Pemuda</span>
              <span>Skor: {rwLeaderboard[2].skorAktivitas}</span>
            </div>
          </div>
        )}
      </div>

      {/* SWITCHER TAB MODE */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('rw')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'rw'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          🏆 Peringkat 96 UKKT RW
        </button>
        <button
          onClick={() => setActiveTab('kelurahan')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'kelurahan'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          🏛️ Peringkat 11 Kelurahan
        </button>
        <button
          onClick={() => setActiveTab('bidang')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'bidang'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          📊 Distribusi 9 Bidang KT
        </button>
      </div>

      {/* TAB 1: TABEL LEADERBOARD UKKT RW AKTIF */}
      {activeTab === 'rw' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10.5px] font-black uppercase mb-1">
                <Trophy size={12} className="text-amber-600" />
                <span>PERINGKAT LENGKAP SEMUA UKKT STATUS AKTIF</span>
              </div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase">
                Tabel Urutan Keaktifan UKKT RW
              </h3>
              <p className="text-xs text-slate-500">
                Peringkat menampilkan <strong>seluruh UKKT yang berstatus Aktif</strong> ({filteredRwLeaderboard.length} Unit Terdata)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Toggle Hanya Status Aktif vs Semua */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setFilterOnlyActive(true)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    filterOnlyActive
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Hanya Status Aktif ({rwLeaderboard.filter((r) => r.isStatusAktif).length})
                </button>
                <button
                  onClick={() => setFilterOnlyActive(false)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    !filterOnlyActive
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Semua 96 RW
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-bold">Kelurahan:</span>
                <select
                  value={filterKelurahan}
                  onChange={(e) => setFilterKelurahan(e.target.value)}
                  className="p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SEMUA">Semua (11 Kel.)</option>
                  {DAFTAR_KELURAHAN_TAMBORA.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10.5px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 text-center w-20">Peringkat</th>
                  <th className="py-3 px-4">Unit Kerja RW</th>
                  <th className="py-3 px-4">Kelurahan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Frekuensi Kegiatan</th>
                  <th className="py-3 px-4 text-center">Partisipan Pemuda</th>
                  <th className="py-3 px-4 text-right">Anggaran Terserap</th>
                  <th className="py-3 px-4">Bidang Paling Sering</th>
                  <th className="py-3 px-4 text-center">Skor Keaktifan</th>
                  <th className="py-3 px-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRwLeaderboard.map((item, idx) => (
                  <tr
                    key={`${item.kelurahan}_${item.nomorRw}`}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      idx < 3 ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                    }`}
                  >
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

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                          item.isStatusAktif
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}
                      >
                        {item.isStatusAktif && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                        {item.isStatusAktif ? 'AKTIF' : 'BELUM AKTIF'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-black text-xs ${
                          item.totalKegiatan > 0
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
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
                      {onNavigateToUnit && (
                        <button
                          onClick={() => onNavigateToUnit(item.kelurahan, item.nomorRw)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer"
                        >
                          Buka RW
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TABEL LEADERBOARD 11 KELURAHAN */}
      {activeTab === 'kelurahan' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase">
              Peringkat Keaktifan 11 Kelurahan Se-Kecamatan Tambora
            </h3>
            <p className="text-xs text-slate-500">
              Total agregat kegiatan pemuda yang diselenggarakan di masing-masing kelurahan.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10.5px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 text-center w-16">Peringkat</th>
                  <th className="py-3 px-4">Nama Kelurahan</th>
                  <th className="py-3 px-4 text-center">Total UKKT RW</th>
                  <th className="py-3 px-4 text-center">Total Kegiatan</th>
                  <th className="py-3 px-4 text-center">Partisipan Pemuda</th>
                  <th className="py-3 px-4 text-right">Total Anggaran</th>
                  <th className="py-3 px-4">Persentase Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {kelurahanLeaderboard.map((item, idx) => (
                  <tr key={item.kelurahan} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 text-center font-black">
                      {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      KELURAHAN {item.kelurahan}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">
                      {item.totalRw} RW
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-black text-blue-600 text-sm">
                      {item.totalKegiatan}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600">
                      {item.totalPartisipan} Jiwa
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      Rp {item.totalAnggaran.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{
                            width: `${
                              kegiatanList.length > 0
                                ? Math.round((item.totalKegiatan / kegiatanList.length) * 100)
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DISTRIBUSI 9 BIDANG KEGIATAN */}
      {activeTab === 'bidang' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase">
              Distribusi Frekuensi Berdasarkan 9 Bidang Karang Taruna
            </h3>
            <p className="text-xs text-slate-500">
              Evaluasi bidang kegiatan mana yang paling sering diselenggarakan dan bidang yang perlu ditingkatkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {bidangStats.map((item, idx) => (
              <div
                key={item.bidang}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-mono text-slate-400 font-bold">
                    Peringkat #{idx + 1}
                  </span>
                  <span className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                    {item.persen}%
                  </span>
                </div>
                <h4 className="font-black text-xs text-slate-900 dark:text-white leading-snug">
                  {item.bidang}
                </h4>
                <div className="flex items-baseline justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-black text-slate-900 dark:text-white">
                    {item.totalKegiatan} Kali Kegiatan
                  </span>
                  <span className="text-[11px] font-mono text-emerald-600 font-bold">
                    {item.totalPartisipan} Pemuda
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
