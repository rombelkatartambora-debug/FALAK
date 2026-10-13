import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Printer,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  Search,
  Filter,
  Edit3,
  Check,
  X,
  CreditCard,
  Building2,
  Sparkles,
  TrendingUp,
  Download,
  Share2,
} from 'lucide-react';
import { KelurahanName, DataOrganisasi, PenyaluranDanaRecord, StatusCairDana } from '../types';
import { DAFTAR_KELURAHAN_TAMBORA, MAP_WILAYAH_TAMBORA } from '../data/wilayah';
import {
  getOrganisasi,
  getPenyaluranDanaList,
  updatePenyaluranDana,
  getKSBForUnit,
  getUKKTList,
} from '../services/storage';
import {
  generateTandaTerimaHtml,
  generateKuitansiSatuanHtml,
  printDocumentHtml,
  renderKopHtml,
} from '../services/pdfExport';

interface TandaTerimaViewProps {
  currentKelurahan: KelurahanName;
}

export const TandaTerimaView: React.FC<TandaTerimaViewProps> = ({ currentKelurahan }) => {
  const org = getOrganisasi();
  const [penyaluranList, setPenyaluranList] = useState<PenyaluranDanaRecord[]>(() =>
    getPenyaluranDanaList()
  );

  // Active Tab: Monitoring Status Penyaluran Uang vs Cetak Tanda Terima Resmi
  const [activeSubTab, setActiveSubTab] = useState<'monitoring' | 'cetak-resmi'>('monitoring');

  // Filter States
  const [filterKelurahan, setFilterKelurahan] = useState<string>('SEMUA');
  const [filterStatusCair, setFilterStatusCair] = useState<string>('SEMUA');
  const [filterStatusLpj, setFilterStatusLpj] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Print Mode States for Tab 2
  const [selectedKelurahanCetak, setSelectedKelurahanCetak] = useState<KelurahanName>(currentKelurahan);
  const [tanggalLaporan, setTanggalLaporan] = useState('01 Oktober 2026');
  const [nominalKelurahan, setNominalKelurahan] = useState(1000000);
  const [nominalRw, setNominalRw] = useState(500000);
  const [modeCetak, setModeCetak] = useState<'per-kelurahan' | 'seluruh-tambora'>('per-kelurahan');

  // Modal Edit Status & Penerima
  const [editingItem, setEditingItem] = useState<PenyaluranDanaRecord | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Re-fetch storage
  const reloadData = () => {
    setPenyaluranList(getPenyaluranDanaList());
  };

  // ==========================================
  // METRICS & STATS KALKULASI UANG REAL-TIME
  // ==========================================
  const totalAlokasi = useMemo(
    () => penyaluranList.reduce((acc, curr) => acc + curr.nominal, 0),
    [penyaluranList]
  );

  const sudahCairList = useMemo(
    () => penyaluranList.filter((p) => p.statusCair === 'Sudah Cair'),
    [penyaluranList]
  );
  const totalSudahCair = useMemo(
    () => sudahCairList.reduce((acc, curr) => acc + curr.nominal, 0),
    [sudahCairList]
  );

  const prosesList = useMemo(
    () => penyaluranList.filter((p) => p.statusCair === 'Dalam Proses'),
    [penyaluranList]
  );
  const totalProses = useMemo(
    () => prosesList.reduce((acc, curr) => acc + curr.nominal, 0),
    [prosesList]
  );

  const belumCairList = useMemo(
    () => penyaluranList.filter((p) => p.statusCair === 'Belum Cair'),
    [penyaluranList]
  );
  const totalBelumCair = useMemo(
    () => belumCairList.reduce((acc, curr) => acc + curr.nominal, 0),
    [belumCairList]
  );

  const persenCair = totalAlokasi > 0 ? Math.round((totalSudahCair / totalAlokasi) * 100) : 0;

  // Filtered List
  const filteredPenyaluran = useMemo(() => {
    return penyaluranList.filter((item) => {
      if (filterKelurahan !== 'SEMUA' && item.kelurahan !== filterKelurahan) return false;
      if (filterStatusCair !== 'SEMUA' && item.statusCair !== filterStatusCair) return false;
      if (filterStatusLpj !== 'SEMUA' && item.statusLpj !== filterStatusLpj) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchKel = item.kelurahan.toLowerCase().includes(q);
        const matchRw = item.nomorRw.includes(q);
        const matchNama = (item.namaPenerima || '').toLowerCase().includes(q);
        const matchRek = (item.nomorRekeningBank || '').toLowerCase().includes(q);
        const matchBukti = (item.nomorBuktiTransfer || '').toLowerCase().includes(q);
        return matchKel || matchRw || matchNama || matchRek || matchBukti;
      }
      return true;
    });
  }, [penyaluranList, filterKelurahan, filterStatusCair, filterStatusLpj, searchQuery]);

  // Quick Toggle Status Cair
  const handleQuickToggleStatus = (item: PenyaluranDanaRecord, nextStatus: StatusCairDana) => {
    const today = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const updated: PenyaluranDanaRecord = {
      ...item,
      statusCair: nextStatus,
      tanggalCair: nextStatus === 'Sudah Cair' ? (item.tanggalCair || today) : undefined,
      nomorBuktiTransfer:
        nextStatus === 'Sudah Cair'
          ? item.nomorBuktiTransfer || `TRF/DKI/2026/${item.nomorRw !== '-' ? `RW-${item.nomorRw}` : item.kelurahan}`
          : item.nomorBuktiTransfer,
    };
    updatePenyaluranDana(updated);
    reloadData();
    showNotification(`Status penyaluran ${item.tingkat === 'Unit RW' ? `RW ${item.nomorRw} ${item.kelurahan}` : item.kelurahan} diubah ke: ${nextStatus}`);
  };

  // Save Modal Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updatePenyaluranDana(editingItem);
    reloadData();
    setEditingItem(null);
    showNotification(`Data penyaluran ${editingItem.tingkat === 'Unit RW' ? `RW ${editingItem.nomorRw} ${editingItem.kelurahan}` : editingItem.kelurahan} berhasil diperbarui!`);
  };

  // Cetak Kuitansi Satuan
  const handlePrintKuitansi = (item: PenyaluranDanaRecord) => {
    const html = generateKuitansiSatuanHtml(
      {
        tingkat: item.tingkat,
        kelurahan: item.kelurahan,
        nomorRw: item.nomorRw,
        nominal: item.nominal,
        namaPenerima: item.namaPenerima,
        jabatanPenerima: item.jabatanPenerima,
        nomorRekeningBank: item.nomorRekeningBank,
        nomorBuktiTransfer: item.nomorBuktiTransfer,
        tanggalCair: item.tanggalCair,
        tahap: item.tahap,
      },
      org
    );
    printDocumentHtml(html, `Kuitansi_Dana_${item.kelurahan}_RW${item.nomorRw}`);
  };

  // Cetak Dokumen Tanda Terima Resmi
  const handlePrintResmi = () => {
    if (modeCetak === 'per-kelurahan') {
      // Buat mapping penerima dari penyaluranList
      const mapPenerima: Record<string, { nama: string; jabatan?: string; status?: string }> = {};
      penyaluranList
        .filter((p) => p.kelurahan === selectedKelurahanCetak)
        .forEach((p) => {
          if (p.tingkat === 'Kelurahan') {
            mapPenerima['KELURAHAN'] = { nama: p.namaPenerima, jabatan: p.jabatanPenerima, status: p.statusCair };
          } else {
            mapPenerima[p.nomorRw] = { nama: p.namaPenerima, jabatan: p.jabatanPenerima, status: p.statusCair };
          }
        });

      const html = generateTandaTerimaHtml(selectedKelurahanCetak, tanggalLaporan, org, mapPenerima);
      printDocumentHtml(html, `Tanda_Terima_Penyaluran_${selectedKelurahanCetak}`);
    } else {
      // Cetak Rekapitulasi 108 Unit se-Tambora
      let rowsHtml = '';
      let noUrut = 1;

      // 1. Kecamatan
      const kecItem = penyaluranList.find((p) => p.tingkat === 'Kecamatan');
      rowsHtml += `
        <tr style="background-color: #e2e8f0; font-weight: bold;">
          <td style="border:1px solid #000; text-align:center;">${noUrut++}</td>
          <td style="border:1px solid #000; padding:6px;">KECAMATAN</td>
          <td style="border:1px solid #000; padding:6px;">PENGURUS KECAMATAN TAMBORA</td>
          <td style="border:1px solid #000; padding:6px;">${kecItem?.namaPenerima || org.namaBendaharaKecamatan}</td>
          <td style="border:1px solid #000; text-align:right; padding:6px;">Rp 2.000.000</td>
          <td style="border:1px solid #000; text-align:center;">1. .........</td>
        </tr>
      `;

      DAFTAR_KELURAHAN_TAMBORA.forEach((kel) => {
        const kelItem = penyaluranList.find((p) => p.tingkat === 'Kelurahan' && p.kelurahan === kel);
        rowsHtml += `
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td style="border:1px solid #000; text-align:center;">${noUrut++}</td>
            <td style="border:1px solid #000; padding:6px;">${kel}</td>
            <td style="border:1px solid #000; padding:6px;">KELURAHAN ${kel}</td>
            <td style="border:1px solid #000; padding:6px;">${kelItem?.namaPenerima || `Bendahara KT Kel. ${kel}`}</td>
            <td style="border:1px solid #000; text-align:right; padding:6px;">Rp ${nominalKelurahan.toLocaleString('id-ID')}</td>
            <td style="border:1px solid #000; text-align:center;">${noUrut - 1}. .........</td>
          </tr>
        `;

        (MAP_WILAYAH_TAMBORA[kel] || []).forEach((rw) => {
          const rwItem = penyaluranList.find((p) => p.tingkat === 'Unit RW' && p.kelurahan === kel && p.nomorRw === rw);
          rowsHtml += `
            <tr style="height: 32px;">
              <td style="border:1px solid #000; text-align:center;">${noUrut++}</td>
              <td style="border:1px solid #000; padding:4px 6px;">${kel}</td>
              <td style="border:1px solid #000; padding:4px 6px;">UKKT RW ${rw}</td>
              <td style="border:1px solid #000; padding:4px 6px;">${rwItem?.namaPenerima || `Pengurus RW ${rw}`}</td>
              <td style="border:1px solid #000; text-align:right; padding:4px 6px;">Rp ${nominalRw.toLocaleString('id-ID')}</td>
              <td style="border:1px solid #000; font-size:9pt; padding-left:15px; color:#475569;">${noUrut - 1}. ........</td>
            </tr>
          `;
        });
      });

      const kopHtml = renderKopHtml('Kecamatan', '', '', org);
      const fullHtml = `
        <div class="page">
          ${kopHtml}
          <div style="text-align:center; font-weight:bold; font-size:12pt; text-decoration:underline; margin-bottom:4px;">
            DAFTAR TANDA TERIMA PENYALURAN DANA STIMULASI
          </div>
          <div style="text-align:center; font-weight:bold; font-size:11pt; margin-bottom:12px;">
            SELURUH 96 UKKT RW & 11 KELURAHAN SE-KECAMATAN TAMBORA
          </div>

          <table class="tbl-resmi">
            <thead>
              <tr>
                <th style="width:35px;">NO</th>
                <th style="width:120px;">KELURAHAN</th>
                <th>UKKT RW / UNIT</th>
                <th style="width:160px;">NAMA PENERIMA</th>
                <th style="width:120px;">JUMLAH (Rp)</th>
                <th style="width:130px;">TANDA TANGAN & STEMPEL</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr style="background-color:#f1f5f9; font-weight:bold;">
                <td colspan="4" style="border:1px solid #000; text-align:right; padding:8px;">TOTAL KESELURUHAN DANA STIMULAN TAMBORA :</td>
                <td style="border:1px solid #000; text-align:right; padding:8px;">Rp ${(totalAlokasi).toLocaleString('id-ID')}</td>
                <td style="border:1px solid #000;"></td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top:20px; text-align:right;">Jakarta, ${tanggalLaporan}</div>
          <div class="ttd-container" style="margin-top:15px;">
            <div class="ttd-box">
              Kepala Suku Dinas Sosial<br>Kota Administrasi Jakarta Barat<br><br><br><br>
              <strong><u>${org.kasudinSosial}</u></strong><br>
              NIP. ${org.nipKasudinSosial}
            </div>
            <div class="ttd-box">
              Bendahara Pengeluaran<br>Suku Dinas Sosial Kota Adm. Jakarta Barat<br><br><br><br>
              <strong><u>${org.bendaharaSudin}</u></strong><br>
              NIP. ${org.nipBendaharaSudin}
            </div>
          </div>
        </div>
      `;
      printDocumentHtml(fullHtml, 'Tanda_Terima_Lengkap_108_Unit_Tambora');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 font-bold text-xs animate-bounce">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[11px] font-black uppercase">
              MODUL KEUANGAN & DANA STIMULAN
            </span>
            <span className="text-xs text-slate-500 font-medium">Suku Dinas Sosial Jakarta Barat</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
            Monitoring Penyaluran Uang & Tanda Terima Dana Stimulasi
          </h1>
          <p className="text-xs text-slate-500">
            Kelola status pencairan uang Rp 500rb per RW, tanda terima penerimaan resmi, kuitansi perorangan, dan rekening Bank DKI untuk 96 UKKT RW se-Tambora.
          </p>
        </div>

        {/* Action Button & Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('monitoring')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'monitoring'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <TrendingUp size={15} />
            <span>Monitoring Penyaluran Uang</span>
          </button>

          <button
            onClick={() => setActiveSubTab('cetak-resmi')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'cetak-resmi'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Printer size={15} />
            <span>Format Cetak Tanda Terima</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Status Dana & Uang Real-Time */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Anggaran Alokasi */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Alokasi Dana
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            Rp {totalAlokasi.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {penyaluranList.length} Unit (96 RW + 11 Kel + 1 Kec)
          </div>
        </div>

        {/* Sudah Cair */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              🟢 Uang Sudah Cair
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            Rp {totalSudahCair.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-[11px] font-semibold text-emerald-600 flex items-center gap-1.5">
            <span>{sudahCairList.length} Unit</span>
            <span className="bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded text-[10px]">
              {persenCair}% Cair
            </span>
          </div>
        </div>

        {/* Dalam Proses */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              🟡 Proses Pencairan
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">
            Rp {totalProses.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-[11px] text-amber-600 font-semibold">
            {prosesList.length} Unit Menunggu Transfer Bank DKI
          </div>
        </div>

        {/* Belum Cair */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              ⚪ Belum Cair
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-300 font-mono">
            Rp {totalBelumCair.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {belumCairList.length} Unit Belum Masuk Berkas
          </div>
        </div>
      </div>

      {/* Progress Bar Penyaluran Uang */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Progres Realisasi Penyaluran Dana Stimulan se-Kecamatan Tambora
          </span>
          <span className="font-mono font-black text-purple-600 dark:text-purple-400">
            {persenCair}% Tercapai (Rp {totalSudahCair.toLocaleString('id-ID')} / Rp {totalAlokasi.toLocaleString('id-ID')})
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${persenCair}%` }}
            title={`Sudah Cair: ${persenCair}%`}
          />
          <div
            className="bg-amber-400 transition-all duration-500"
            style={{ width: `${totalAlokasi > 0 ? (totalProses / totalAlokasi) * 100 : 0}%` }}
            title="Dalam Proses"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUBTAB 1: MONITORING STATUS PENYALURAN UANG REAL-TIME          */}
      {/* ============================================================== */}
      {activeSubTab === 'monitoring' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Daftar Rincian Penyaluran Uang ke 96 Unit RW</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Klik tombol status untuk mengubah status pencairan uang, edit nama penerima, atau cetak kuitansi resmi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setFilterKelurahan('SEMUA');
                  setFilterStatusCair('SEMUA');
                  setFilterStatusLpj('SEMUA');
                  setSearchQuery('');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari RW, nama penerima, rek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
              />
            </div>

            {/* Filter Kelurahan */}
            <div>
              <select
                value={filterKelurahan}
                onChange={(e) => setFilterKelurahan(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
              >
                <option value="SEMUA">Semua Kelurahan (11 Wilayah)</option>
                {DAFTAR_KELURAHAN_TAMBORA.map((k) => (
                  <option key={k} value={k}>
                    Kel. {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Status Cair */}
            <div>
              <select
                value={filterStatusCair}
                onChange={(e) => setFilterStatusCair(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
              >
                <option value="SEMUA">Semua Status Pencairan Uang</option>
                <option value="Sudah Cair">🟢 Hanya Sudah Cair ({sudahCairList.length})</option>
                <option value="Dalam Proses">🟡 Dalam Proses ({prosesList.length})</option>
                <option value="Belum Cair">⚪ Belum Cair ({belumCairList.length})</option>
              </select>
            </div>

            {/* Filter Status LPJ */}
            <div>
              <select
                value={filterStatusLpj}
                onChange={(e) => setFilterStatusLpj(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
              >
                <option value="SEMUA">Semua Status LPJ</option>
                <option value="Sudah LPJ">Sudah Buat LPJ</option>
                <option value="Belum LPJ">Belum Buat LPJ</option>
              </select>
            </div>
          </div>

          {/* Table Monitoring */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] border-b">
                <tr>
                  <th className="p-3 w-10 text-center">No</th>
                  <th className="p-3 w-36">Unit & Wilayah</th>
                  <th className="p-3 w-32 text-right">Nominal Uang</th>
                  <th className="p-3 w-36 text-center">Status Pencairan</th>
                  <th className="p-3 w-48">Penerima & Rek. Bank DKI</th>
                  <th className="p-3 w-28">Tgl Cair / Bukti</th>
                  <th className="p-3 w-24 text-center">Status LPJ</th>
                  <th className="p-3 w-32 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPenyaluran.map((item, idx) => {
                  const isRw = item.tingkat === 'Unit RW';
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>

                      {/* Unit & Wilayah */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {isRw ? `UKKT RW ${item.nomorRw}` : item.tingkat === 'Kelurahan' ? `Kel. ${item.kelurahan}` : 'Kecamatan'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {item.kelurahan}
                        </div>
                      </td>

                      {/* Nominal */}
                      <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        Rp {item.nominal.toLocaleString('id-ID')}
                      </td>

                      {/* Status Cair Badge + Dropdown toggle */}
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <select
                            value={item.statusCair}
                            onChange={(e) =>
                              handleQuickToggleStatus(item, e.target.value as StatusCairDana)
                            }
                            className={`px-2 py-1 rounded-lg text-[10.5px] font-black border-0 cursor-pointer ${
                              item.statusCair === 'Sudah Cair'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : item.statusCair === 'Dalam Proses'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                            }`}
                          >
                            <option value="Sudah Cair">🟢 Sudah Cair</option>
                            <option value="Dalam Proses">🟡 Dalam Proses</option>
                            <option value="Belum Cair">⚪ Belum Cair</option>
                          </select>
                        </div>
                      </td>

                      {/* Penerima & Bank */}
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {item.namaPenerima || 'Pengurus Unit'}
                        </div>
                        <div className="text-[10.5px] font-mono text-slate-500">
                          {item.nomorRekeningBank || 'Bank DKI'}
                        </div>
                      </td>

                      {/* Tgl Cair & Bukti */}
                      <td className="p-3">
                        {item.statusCair === 'Sudah Cair' ? (
                          <div>
                            <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                              {item.tanggalCair || 'Juli 2026'}
                            </div>
                            <div className="text-[9.5px] font-mono text-emerald-600 truncate max-w-[120px]">
                              {item.nomorBuktiTransfer || 'Lunas Transfer'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10.5px] text-slate-400 italic">
                            {item.statusCair === 'Dalam Proses' ? 'Menunggu Transfer' : 'Belum Ada'}
                          </span>
                        )}
                      </td>

                      {/* Status LPJ */}
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.statusLpj === 'Sudah LPJ'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {item.statusLpj}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                            title="Edit data penerima & nomor rekening"
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            onClick={() => handlePrintKuitansi(item)}
                            className="p-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-lg cursor-pointer"
                            title="Cetak Kuitansi Resmi Satuan"
                          >
                            <Receipt size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 2: FORMAT CETAK RESMI DOKUMEN TANDA TERIMA DINAS SOSIAL */}
      {/* ============================================================== */}
      {activeSubTab === 'cetak-resmi' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase">
                  Konfigurasi Dokumen Tanda Terima Resmi
                </h3>
                <p className="text-xs text-slate-500">
                  Dokumen dicetak dengan Kop Surat resmi Karang Taruna dan ditandatangani Kasudin Sosial & Bendahara Sudin Sosial Jakarta Barat.
                </p>
              </div>

              <button
                onClick={handlePrintResmi}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
              >
                <Printer size={16} />
                <span>CETAK DOKUMEN RESMI (PDF)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Mode Laporan
                </label>
                <select
                  value={modeCetak}
                  onChange={(e) => setModeCetak(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option value="per-kelurahan">Per Kelurahan (Sesuai Jumlah RW)</option>
                  <option value="seluruh-tambora">Seluruh Tambora (Lengkap 108 Baris)</option>
                </select>
              </div>

              {modeCetak === 'per-kelurahan' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Pilih Kelurahan
                  </label>
                  <select
                    value={selectedKelurahanCetak}
                    onChange={(e) => setSelectedKelurahanCetak(e.target.value as KelurahanName)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    {DAFTAR_KELURAHAN_TAMBORA.map((k) => (
                      <option key={k} value={k}>
                        Kel. {k} ({(MAP_WILAYAH_TAMBORA[k] || []).length} RW)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Tanggal Dokumen
                </label>
                <input
                  type="text"
                  value={tanggalLaporan}
                  onChange={(e) => setTanggalLaporan(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Nominal Per Unit RW
                </label>
                <input
                  type="number"
                  value={nominalRw}
                  onChange={(e) => setNominalRw(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Official Document Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
                {modeCetak === 'per-kelurahan'
                  ? `Pratinjau Tabel Tanda Terima Kelurahan ${selectedKelurahanCetak} (${(MAP_WILAYAH_TAMBORA[selectedKelurahanCetak] || []).length + 1} Baris)`
                  : 'Pratinjau Tabel Tanda Terima Rekapitulasi 108 Unit se-Tambora'}
              </h3>
              <span className="text-[10.5px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full">
                Format Standar Halaman 4 Dinas Sosial
              </span>
            </div>

            <div className="overflow-x-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 font-sans">
                {/* Header Title */}
                <div className="text-center font-bold text-xs sm:text-sm underline mb-1 uppercase tracking-wide">
                  TANDA TERIMA PENYALURAN DANA STIMULASI
                </div>
                <div className="text-center font-bold text-xs sm:text-xs mb-4 uppercase text-slate-600 dark:text-slate-300">
                  {modeCetak === 'per-kelurahan'
                    ? `KELURAHAN ${selectedKelurahanCetak} KECAMATAN TAMBORA`
                    : 'SELURUH 96 UKKT RW & 11 KELURAHAN KECAMATAN TAMBORA'}
                </div>

                <table className="w-full text-left text-xs border-collapse border border-slate-300 dark:border-slate-700">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="border border-slate-300 dark:border-slate-700 p-2.5 w-10 text-center">No</th>
                      <th className="border border-slate-300 dark:border-slate-700 p-2.5">Nama Karang Taruna</th>
                      <th className="border border-slate-300 dark:border-slate-700 p-2.5 w-48">Nama Penerima & Jabatan</th>
                      <th className="border border-slate-300 dark:border-slate-700 p-2.5 w-36 text-right">Jumlah (Rp)</th>
                      <th className="border border-slate-300 dark:border-slate-700 p-2.5 w-36 text-center">Tanda Tangan & Stempel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs">
                    {/* Baris 1: Kelurahan */}
                    <tr className="bg-slate-50/80 dark:bg-slate-800/40 font-bold">
                      <td className="border border-slate-300 dark:border-slate-700 p-2.5 text-center">1</td>
                      <td className="border border-slate-300 dark:border-slate-700 p-2.5">
                        Karang Taruna Kelurahan {selectedKelurahanCetak}
                      </td>
                      <td className="border border-slate-300 dark:border-slate-700 p-2.5">
                        {penyaluranList.find((p) => p.tingkat === 'Kelurahan' && p.kelurahan === selectedKelurahanCetak)?.namaPenerima || `Bendahara KT Kel. ${selectedKelurahanCetak}`}
                        <div className="text-[9px] text-slate-400 font-normal">Bendahara Kelurahan</div>
                      </td>
                      <td className="border border-slate-300 dark:border-slate-700 p-2.5 text-right font-mono">
                        Rp {nominalKelurahan.toLocaleString('id-ID')}
                      </td>
                      <td className="border border-slate-300 dark:border-slate-700 p-2.5 text-center text-slate-400 font-mono text-[10px]">
                        1. ............
                      </td>
                    </tr>

                    {/* Baris Tiap RW */}
                    {(MAP_WILAYAH_TAMBORA[selectedKelurahanCetak] || []).map((rw, index) => {
                      const rwData = penyaluranList.find(
                        (p) => p.tingkat === 'Unit RW' && p.kelurahan === selectedKelurahanCetak && p.nomorRw === rw
                      );
                      return (
                        <tr key={rw}>
                          <td className="border border-slate-300 dark:border-slate-700 p-2.5 text-center font-bold text-slate-500">
                            {index + 2}
                          </td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2.5 font-medium">
                            Karang Taruna Unit RW {rw}
                          </td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {rwData?.namaPenerima || `Pengurus UKKT RW ${rw}`}
                            </span>
                            <div className="text-[9px] text-slate-400">
                              {rwData?.jabatanPenerima || 'Ketua/Bendahara RW'}
                            </div>
                          </td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2.5 text-right font-mono">
                            Rp {nominalRw.toLocaleString('id-ID')}
                          </td>
                          <td className="border border-slate-300 dark:border-slate-700 p-2.5 text-left pl-6 text-slate-400 font-mono text-[10px]">
                            {index + 2}. ..........
                          </td>
                        </tr>
                      );
                    })}

                    {/* Total Row */}
                    <tr className="bg-purple-50 dark:bg-purple-950/40 font-black">
                      <td colSpan={3} className="border border-slate-300 dark:border-slate-700 p-2.5 text-right uppercase">
                        TOTAL PENYALURAN DANA STIMULASI :
                      </td>
                      <td className="border border-slate-300 dark:border-slate-700 p-2.5 text-right font-mono text-purple-700 dark:text-purple-300">
                        Rp {(nominalKelurahan + (MAP_WILAYAH_TAMBORA[selectedKelurahanCetak] || []).length * nominalRw).toLocaleString('id-ID')}
                      </td>
                      <td className="border border-slate-300 dark:border-slate-700 p-2.5"></td>
                    </tr>
                  </tbody>
                </table>

                {/* Tanda Tangan */}
                <div className="mt-8 flex justify-between text-center text-xs">
                  <div className="w-56">
                    Mengetahui,<br />
                    Kepala Suku Dinas Sosial Kota Adm. Jakarta Barat
                    <div className="h-16"></div>
                    <strong><u>{org.kasudinSosial}</u></strong>
                    <div className="text-[9pt]">NIP. {org.nipKasudinSosial}</div>
                  </div>
                  <div className="w-56">
                    Jakarta, {tanggalLaporan}<br />
                    Bendahara Pengeluaran Sudin Sosial Jakbar
                    <div className="h-16"></div>
                    <strong><u>{org.bendaharaSudin}</u></strong>
                    <div className="text-[9pt]">NIP. {org.nipBendaharaSudin}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL EDIT STATUS PENYALURAN & DATA PENERIMA                   */}
      {/* ============================================================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                  UPDATE PENYALURAN DANA
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  {editingItem.tingkat === 'Unit RW'
                    ? `UKKT RW ${editingItem.nomorRw} Kel. ${editingItem.kelurahan}`
                    : editingItem.tingkat === 'Kelurahan'
                    ? `Karang Taruna Kelurahan ${editingItem.kelurahan}`
                    : 'Pengurus Kecamatan'}
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Status Pencairan Uang
                  </label>
                  <select
                    value={editingItem.statusCair}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        statusCair: e.target.value as StatusCairDana,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    <option value="Sudah Cair">🟢 Sudah Cair</option>
                    <option value="Dalam Proses">🟡 Dalam Proses</option>
                    <option value="Belum Cair">⚪ Belum Cair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Nominal Dana (Rp)
                  </label>
                  <input
                    type="number"
                    value={editingItem.nominal}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, nominal: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Nama Penerima Dana
                  </label>
                  <input
                    type="text"
                    value={editingItem.namaPenerima}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, namaPenerima: e.target.value })
                    }
                    placeholder="Nama Ketua / Bendahara..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Jabatan Penerima
                  </label>
                  <input
                    type="text"
                    value={editingItem.jabatanPenerima}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, jabatanPenerima: e.target.value })
                    }
                    placeholder="Bendahara UKKT / Ketua"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Nomor Rekening Bank DKI
                </label>
                <input
                  type="text"
                  value={editingItem.nomorRekeningBank || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, nomorRekeningBank: e.target.value })
                  }
                  placeholder="Contoh: 503-21-00912-8 (Bank DKI)"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Tanggal Pencairan / Transfer
                  </label>
                  <input
                    type="text"
                    value={editingItem.tanggalCair || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, tanggalCair: e.target.value })
                    }
                    placeholder="Contoh: 15 Juli 2026"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Nomor Bukti Transfer
                  </label>
                  <input
                    type="text"
                    value={editingItem.nomorBuktiTransfer || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, nomorBuktiTransfer: e.target.value })
                    }
                    placeholder="TRF/DKI/2026/..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Status Laporan LPJ
                </label>
                <select
                  value={editingItem.statusLpj}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      statusLpj: e.target.value as 'Sudah LPJ' | 'Belum LPJ',
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option value="Belum LPJ">Belum Buat LPJ</option>
                  <option value="Sudah LPJ">Sudah Buat LPJ</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={15} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
