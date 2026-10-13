import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Printer,
  FileSpreadsheet,
  Building,
  CreditCard,
  Phone,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Layers,
  Check,
  X,
  FileCheck2,
} from 'lucide-react';
import { UnitRWProfile, KelurahanName, DataOrganisasi } from '../types';
import { DAFTAR_KELURAHAN_TAMBORA, MAP_WILAYAH_TAMBORA } from '../data/wilayah';
import { getUKKTList, updateUKKT, getOrganisasi } from '../services/storage';
import { getActiveLogoNasional, getActiveLogoDki } from '../data/logos';

interface RekapDataViewProps {
  ukktList: UnitRWProfile[];
  onRefresh: () => void;
  onNavigateToUnit: (kelurahan: KelurahanName, nomorRw: string) => void;
}

type FilterCategory =
  | 'semua'
  | 'sudah-isi'
  | 'belum-isi'
  | 'aktif'
  | 'belum-aktif'
  | 'sk-berlaku'
  | 'sk-mendekati-habis'
  | 'sk-habis'
  | 'ktp-lengkap'
  | 'ktp-belum-lengkap';

export const RekapDataView: React.FC<RekapDataViewProps> = ({
  ukktList,
  onRefresh,
  onNavigateToUnit,
}) => {
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>('SEMUA');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'unit' | 'kelurahan'>('unit');
  const [notification, setNotification] = useState<string | null>(null);

  const org = getOrganisasi();
  const today = new Date();

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Gabungkan seluruh 96 RW se-Kecamatan Tambora
  const full96Units = useMemo(() => {
    const list: Array<{
      unit: UnitRWProfile;
      kelengkapanSkor: number;
      isSudahIsi: boolean;
      statusAktif: 'Aktif' | 'Belum Aktif';
      statusPeriode: 'Berlaku' | 'Mendekati Habis' | 'Habis' | 'Tanpa SK';
      sisaHariSk: number | null;
      ktpCount: number;
    }> = [];

    // Map existing UKKT by kelurahan + rw
    const mapExisting = new Map<string, UnitRWProfile>();
    ukktList.forEach((u) => {
      mapExisting.set(`${u.kelurahan}_${u.nomorRw}`, u);
    });

    DAFTAR_KELURAHAN_TAMBORA.forEach((kel) => {
      const rwList = MAP_WILAYAH_TAMBORA[kel] || [];
      rwList.forEach((rw) => {
        const key = `${kel}_${rw}`;
        const existing = mapExisting.get(key) || {
          id: `UKKT-${kel.replace(/\s+/g, '-')}-${rw}`,
          kelurahan: kel,
          nomorRw: rw,
          alamatSekretariat: `Sekretariat RW ${rw}, Kel. ${kel}`,
          namaKetua: '',
          nomorSk: '',
          tanggalSk: '',
          periodeMulai: '2024-01-01',
          periodeSelesai: '2027-01-01',
          nomorRekeningBank: '',
          statusAktif: 'Belum Aktif',
          pengurus: {},
        };

        // 1. Evaluasi Kelengkapan (0 - 100%)
        let score = 0;
        const ketua = existing.pengurus?.ketua;
        const sekre = existing.pengurus?.sekretaris;
        const bdh = existing.pengurus?.bendahara;

        if (ketua?.namaLengkap && ketua.namaLengkap.trim().length > 2) score += 20;
        if (ketua?.nik && ketua.nik.length === 16) score += 10;
        if (ketua?.noWhatsapp && ketua.noWhatsapp.length > 8) score += 5;
        if (sekre?.namaLengkap && sekre.namaLengkap.trim().length > 2) score += 15;
        if (bdh?.namaLengkap && bdh.namaLengkap.trim().length > 2) score += 15;
        if (existing.nomorSk && existing.nomorSk.trim().length > 3) score += 15;
        if (existing.nomorRekeningBank && existing.nomorRekeningBank.trim().length > 3) score += 10;
        if (existing.dokumenSkUrl) score += 5;
        if (ketua?.fotoKtpUrl || sekre?.fotoKtpUrl || bdh?.fotoKtpUrl) score += 5;

        const isSudahIsi = score >= 50;

        // 2. Evaluasi Status Aktif
        const statusAktif: 'Aktif' | 'Belum Aktif' =
          existing.statusAktif || (score >= 40 ? 'Aktif' : 'Belum Aktif');

        // 3. Evaluasi Periode SK
        let statusPeriode: 'Berlaku' | 'Mendekati Habis' | 'Habis' | 'Tanpa SK' = 'Tanpa SK';
        let sisaHariSk: number | null = null;

        if (existing.periodeSelesai) {
          const endDate = new Date(existing.periodeSelesai);
          if (!isNaN(endDate.getTime())) {
            const diffTime = endDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            sisaHariSk = diffDays;

            if (diffDays < 0) {
              statusPeriode = 'Habis';
            } else if (diffDays <= 90) {
              statusPeriode = 'Mendekati Habis';
            } else {
              statusPeriode = 'Berlaku';
            }
          }
        }

        // 4. Evaluasi KTP KSB (maksimal 3 pengurus)
        let ktpCount = 0;
        if (ketua?.fotoKtpUrl) ktpCount++;
        if (sekre?.fotoKtpUrl) ktpCount++;
        if (bdh?.fotoKtpUrl) ktpCount++;

        list.push({
          unit: existing,
          kelengkapanSkor: score,
          isSudahIsi,
          statusAktif,
          statusPeriode,
          sisaHariSk,
          ktpCount,
        });
      });
    });

    return list;
  }, [ukktList, today]);

  // Statistik Ringkasan Cerdas
  const stats = useMemo(() => {
    const total = full96Units.length; // 96
    const sudahIsi = full96Units.filter((u) => u.isSudahIsi).length;
    const belumIsi = total - sudahIsi;

    const aktif = full96Units.filter((u) => u.statusAktif === 'Aktif').length;
    const belumAktif = total - aktif;

    const skBerlaku = full96Units.filter((u) => u.statusPeriode === 'Berlaku').length;
    const skMendekati = full96Units.filter((u) => u.statusPeriode === 'Mendekati Habis').length;
    const skHabis = full96Units.filter((u) => u.statusPeriode === 'Habis').length;

    const ktpLengkap = full96Units.filter((u) => u.ktpCount === 3).length;
    const ktpParsial = full96Units.filter((u) => u.ktpCount > 0 && u.ktpCount < 3).length;
    const ktpKosong = full96Units.filter((u) => u.ktpCount === 0).length;

    const totalKtpUploaded = full96Units.reduce((acc, u) => acc + u.ktpCount, 0);

    return {
      total,
      sudahIsi,
      belumIsi,
      persenIsi: Math.round((sudahIsi / total) * 100),
      aktif,
      belumAktif,
      persenAktif: Math.round((aktif / total) * 100),
      skBerlaku,
      skMendekati,
      skHabis,
      ktpLengkap,
      ktpParsial,
      ktpKosong,
      totalKtpUploaded,
    };
  }, [full96Units]);

  // Toggle status aktif langsung dari tabel
  const handleToggleAktif = (item: (typeof full96Units)[0]) => {
    const newStatus: 'Aktif' | 'Belum Aktif' =
      item.statusAktif === 'Aktif' ? 'Belum Aktif' : 'Aktif';
    const updatedUnit: UnitRWProfile = {
      ...item.unit,
      statusAktif: newStatus,
    };
    updateUKKT(updatedUnit);
    onRefresh();
    showNotify(
      `Status RW ${item.unit.nomorRw} Kel. ${item.unit.kelurahan} diubah menjadi "${newStatus}"`
    );
  };

  // Data Terfilter untuk Tabel Unit
  const filteredUnits = useMemo(() => {
    return full96Units.filter((item) => {
      // Filter Kelurahan
      if (selectedKelurahan !== 'SEMUA' && item.unit.kelurahan !== selectedKelurahan) {
        return false;
      }

      // Filter Kategori
      if (activeCategory === 'sudah-isi' && !item.isSudahIsi) return false;
      if (activeCategory === 'belum-isi' && item.isSudahIsi) return false;
      if (activeCategory === 'aktif' && item.statusAktif !== 'Aktif') return false;
      if (activeCategory === 'belum-aktif' && item.statusAktif !== 'Belum Aktif') return false;
      if (activeCategory === 'sk-berlaku' && item.statusPeriode !== 'Berlaku') return false;
      if (activeCategory === 'sk-mendekati-habis' && item.statusPeriode !== 'Mendekati Habis')
        return false;
      if (activeCategory === 'sk-habis' && item.statusPeriode !== 'Habis') return false;
      if (activeCategory === 'ktp-lengkap' && item.ktpCount < 3) return false;
      if (activeCategory === 'ktp-belum-lengkap' && item.ktpCount === 3) return false;

      // Filter Pencarian Teks
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const ketuaNama = item.unit.pengurus?.ketua?.namaLengkap || '';
        const matchRw = item.unit.nomorRw.includes(q);
        const matchKel = item.unit.kelurahan.toLowerCase().includes(q);
        const matchKetua = ketuaNama.toLowerCase().includes(q);
        const matchSk = (item.unit.nomorSk || '').toLowerCase().includes(q);
        return matchRw || matchKel || matchKetua || matchSk;
      }

      return true;
    });
  }, [full96Units, selectedKelurahan, activeCategory, searchQuery]);

  // Rekap Agregat per 11 Kelurahan
  const kelurahanSummary = useMemo(() => {
    return DAFTAR_KELURAHAN_TAMBORA.map((kel) => {
      const unitsInKel = full96Units.filter((u) => u.unit.kelurahan === kel);
      const total = unitsInKel.length;
      const sudah = unitsInKel.filter((u) => u.isSudahIsi).length;
      const belum = total - sudah;
      const aktif = unitsInKel.filter((u) => u.statusAktif === 'Aktif').length;
      const belumAktif = total - aktif;
      const skBerlaku = unitsInKel.filter((u) => u.statusPeriode === 'Berlaku').length;
      const skHabis = unitsInKel.filter((u) => u.statusPeriode === 'Habis').length;
      const ktpLengkap = unitsInKel.filter((u) => u.ktpCount === 3).length;
      const persen = Math.round((sudah / total) * 100);

      return {
        kelurahan: kel,
        total,
        sudah,
        belum,
        aktif,
        belumAktif,
        skBerlaku,
        skHabis,
        ktpLengkap,
        persen,
      };
    });
  }, [full96Units]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'No',
      'Kelurahan',
      'RW',
      'Status Keterisian',
      'Skor Kelengkapan (%)',
      'Status Aktif',
      'Status Masa Bhakti SK',
      'Sisa Hari SK',
      'Nama Ketua',
      'NIK Ketua',
      'WhatsApp Ketua',
      'Nama Sekretaris',
      'Nama Bendahara',
      'Jumlah KTP KSB Terunggah',
      'Nomor SK',
      'Periode Mulai',
      'Periode Selesai',
      'Rekening Bank',
    ];

    const rows = filteredUnits.map((item, idx) => {
      const ketua = item.unit.pengurus?.ketua;
      const sekre = item.unit.pengurus?.sekretaris;
      const bdh = item.unit.pengurus?.bendahara;
      return [
        idx + 1,
        `"${item.unit.kelurahan}"`,
        `"RW ${item.unit.nomorRw}"`,
        `"${item.isSudahIsi ? 'Sudah Isi' : 'Belum Isi'}"`,
        item.kelengkapanSkor,
        `"${item.statusAktif}"`,
        `"${item.statusPeriode}"`,
        item.sisaHariSk ?? '-',
        `"${ketua?.namaLengkap || ''}"`,
        `"${ketua?.nik || ''}"`,
        `"${ketua?.noWhatsapp || ''}"`,
        `"${sekre?.namaLengkap || ''}"`,
        `"${bdh?.namaLengkap || ''}"`,
        `"${item.ktpCount} dari 3 KSB"`,
        `"${item.unit.nomorSk || ''}"`,
        `"${item.unit.periodeMulai || ''}"`,
        `"${item.unit.periodeSelesai || ''}"`,
        `"${item.unit.nomorRekeningBank || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekapitulasi_96_UKKT_Tambora_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cetak Dokumen Rekapitulasi Resmi
  const handlePrintRekap = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Izinkan popup untuk mencetak laporan rekapitulasi.');
      return;
    }

    const rowsHtml = filteredUnits
      .map(
        (item, idx) => `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td><b>${item.unit.kelurahan}</b></td>
          <td style="text-align: center;"><b>RW ${item.unit.nomorRw}</b></td>
          <td style="text-align: center;">
            <span style="font-weight: bold; color: ${item.isSudahIsi ? '#059669' : '#dc2626'};">
              ${item.isSudahIsi ? 'SUDAH ISI' : 'BELUM ISI'} (${item.kelengkapanSkor}%)
            </span>
          </td>
          <td style="text-align: center;">
            <span style="font-weight: bold; color: ${item.statusAktif === 'Aktif' ? '#0284c7' : '#9ca3af'};">
              ${item.statusAktif.toUpperCase()}
            </span>
          </td>
          <td style="text-align: center;">
            <span style="font-weight: bold; color: ${
              item.statusPeriode === 'Berlaku'
                ? '#059669'
                : item.statusPeriode === 'Mendekati Habis'
                ? '#d97706'
                : '#dc2626'
            };">
              ${item.statusPeriode} ${item.sisaHariSk !== null ? `(${item.sisaHariSk > 0 ? `+${item.sisaHariSk} hr` : `${item.sisaHariSk} hr`})` : ''}
            </span>
          </td>
          <td>${item.unit.pengurus?.ketua?.namaLengkap || '-'}</td>
          <td style="text-align: center; font-size: 11px;">${item.ktpCount}/3 KTP</td>
          <td style="font-size: 11px;">${item.unit.nomorSk || '-'}</td>
        </tr>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rekapitulasi 96 UKKT RW Kecamatan Tambora</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          body { font-family: 'Arial', sans-serif; font-size: 11px; color: #111; line-height: 1.3; }
          .kop-container { border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }
          .kop-logo { width: 65px; height: 65px; object-fit: contain; }
          .kop-center { text-align: center; flex: 1; padding: 0 10px; }
          .kop-t1 { font-size: 13px; font-weight: bold; letter-spacing: 0.5px; }
          .kop-t2 { font-size: 15px; font-weight: 900; }
          .kop-t3 { font-size: 12px; font-weight: bold; }
          .kop-sub { font-size: 9.5px; margin-top: 4px; color: #333; }
          .title-doc { text-align: center; font-size: 14px; font-weight: 900; text-transform: uppercase; margin-bottom: 12px; }
          .meta-info { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 10.5px; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          th, td { border: 1px solid #333; padding: 4.5px 6px; }
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
            <div class="kop-sub">${org.alamatKopSekretariat || org.alamat} | ${org.kontakKop}</div>
          </div>
          ${
            (org.logoKananUrl || getActiveLogoDki())
              ? `<img src="${org.logoKananUrl || getActiveLogoDki()}" class="kop-logo" />`
              : `<div style="width: 70px; height: 70px;"></div>`
          }
        </div>

        <div class="title-doc">
          LAPORAN REKAPITULASI RESMI DATABASE 96 UNIT KERJA KARANG TARUNA (UKKT) RW<br>
          <span style="font-size: 11px; font-weight: normal; text-transform: none;">
            Status Keterisian Data, Keaktifan Pengurus, Masa Bhakti SK, dan Berkas KTP KSB
          </span>
        </div>

        <div class="meta-info">
          <div><b>Wilayah:</b> Seluruh 11 Kelurahan se-Kecamatan Tambora (Total: 96 RW)</div>
          <div><b>Tanggal Cetak:</b> ${today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 25px;">No</th>
              <th>Kelurahan</th>
              <th style="width: 55px;">RW</th>
              <th style="width: 110px;">Pengisian Data</th>
              <th style="width: 75px;">Status</th>
              <th style="width: 110px;">Masa Bhakti SK</th>
              <th>Ketua KSB</th>
              <th style="width: 65px;">KTP KSB</th>
              <th>Nomor SK Legalitas</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="ttd-box">
          <div class="ttd-col">
            <div>Jakarta, ${today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div style="font-weight: bold; margin-top: 3px;">Ketua Karang Taruna Kecamatan Tambora</div>
            <div style="height: 55px;"></div>
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
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={20} />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-black uppercase">
              MODUL KHUSUS REKAPITULASI
            </span>
            <span className="text-xs text-slate-500 font-medium">Kecamatan Tambora • 96 UKKT RW</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>Rekapitulasi Cerdas 96 Unit Kerja Karang Taruna</span>
          </h1>
    
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet size={15} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrintRekap}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Printer size={15} />
            <span>Cetak Rekap Resmi (PDF)</span>
          </button>
        </div>
      </div>

      {/* 5 SMART SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Unit RW */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Unit RW</span>
            <Building size={18} className="text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.total}
            </span>
            <span className="text-xs text-slate-400 font-bold">RW di 11 Kel.</span>
          </div>
          <div className="mt-2 text-[10.5px] text-slate-500">
            Total 288 Pengurus KSB se-Kecamatan
          </div>
        </div>

        {/* Card 2: Rekap Keterisian (Sudah Isi vs Belum) */}
        <div
          onClick={() => setActiveCategory(activeCategory === 'sudah-isi' ? 'semua' : 'sudah-isi')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase">
              1. Pengisian Data
            </span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-emerald-600">{stats.sudahIsi}</span>
              <span className="text-xs text-slate-400 font-bold"> / {stats.total}</span>
            </div>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
              {stats.persenIsi}%
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10.5px]">
            <span className="text-emerald-600 font-bold">Sudah Isi: {stats.sudahIsi}</span>
            <span className="text-red-500 font-bold">Belum: {stats.belumIsi}</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${stats.persenIsi}%` }}
            />
          </div>
        </div>

        {/* Card 3: Rekap Status Keaktifan (Aktif vs Belum) */}
        <div
          onClick={() => setActiveCategory(activeCategory === 'aktif' ? 'semua' : 'aktif')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-blue-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-600 uppercase">
              2. Status Keaktifan
            </span>
            <Users size={18} className="text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-blue-600">{stats.aktif}</span>
              <span className="text-xs text-slate-400 font-bold"> / {stats.total}</span>
            </div>
            <span className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
              {stats.persenAktif}%
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10.5px]">
            <span className="text-blue-600 font-bold">Aktif: {stats.aktif}</span>
            <span className="text-slate-400 font-bold">Belum Aktif: {stats.belumAktif}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${stats.persenAktif}%` }}
            />
          </div>
        </div>

        {/* Card 4: Rekap Masa Bhakti SK (Periode Habis vs Belum) */}
        <div
          onClick={() => setActiveCategory(activeCategory === 'sk-habis' ? 'semua' : 'sk-habis')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 uppercase">
              3. Masa Bhakti SK
            </span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-emerald-600">{stats.skBerlaku}</span>
              <span className="text-xs text-slate-400 font-bold"> Berlaku</span>
            </div>
            <span className="text-xs font-black text-red-600 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded-md">
              {stats.skHabis} Habis
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10.5px]">
            <span className="text-amber-600 font-bold">Mendekati: {stats.skMendekati}</span>
            <span className="text-red-500 font-bold">Kedaluwarsa: {stats.skHabis}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 flex overflow-hidden">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${(stats.skBerlaku / stats.total) * 100}%` }}
            />
            <div
              className="bg-amber-400 h-full"
              style={{ width: `${(stats.skMendekati / stats.total) * 100}%` }}
            />
            <div
              className="bg-red-500 h-full"
              style={{ width: `${(stats.skHabis / stats.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Card 5: Dokumen KTP KSB (Ketua, Sekre, Bendahara) */}
        <div
          onClick={() =>
            setActiveCategory(activeCategory === 'ktp-lengkap' ? 'semua' : 'ktp-lengkap')
          }
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-purple-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-600 uppercase">
              4. Berkas KTP KSB
            </span>
            <CreditCard size={18} className="text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-purple-600">{stats.totalKtpUploaded}</span>
              <span className="text-xs text-slate-400 font-bold"> / 288 KTP</span>
            </div>
            <span className="text-xs font-black text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">
              {stats.ktpLengkap} RW Full
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10.5px]">
            <span className="text-purple-600 font-bold">Full 3 KTP: {stats.ktpLengkap}</span>
            <span className="text-slate-400 font-bold">0 KTP: {stats.ktpKosong}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all"
              style={{ width: `${Math.round((stats.totalKtpUploaded / 288) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* FILTER & CONTROL BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Row 1: Search, Kelurahan Selector, Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setViewMode('unit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'unit'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              📋 Rincian 96 UKKT RW
            </button>
            <button
              onClick={() => setViewMode('kelurahan')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kelurahan'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              📊 Matriks 11 Kelurahan
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Kelurahan Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-bold">Kelurahan:</span>
              <select
                value={selectedKelurahan}
                onChange={(e) => setSelectedKelurahan(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500"
              >
                <option value="SEMUA">Semua Kelurahan (11)</option>
                {DAFTAR_KELURAHAN_TAMBORA.map((k) => (
                  <option key={k} value={k}>
                    {k} ({MAP_WILAYAH_TAMBORA[k].length} RW)
                  </option>
                ))}
              </select>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari RW / Ketua / No SK..."
                className="pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium w-48 sm:w-56 focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          <span className="text-slate-400 text-[11px] mr-1 flex items-center gap-1">
            <Filter size={12} /> Filter:
          </span>

          <button
            onClick={() => setActiveCategory('semua')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === 'semua'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Semua ({stats.total})
          </button>

          <button
            onClick={() => setActiveCategory('sudah-isi')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategory === 'sudah-isi'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Sudah Isi ({stats.sudahIsi})</span>
          </button>

          <button
            onClick={() => setActiveCategory('belum-isi')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategory === 'belum-isi'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300'
            }`}
          >
            <AlertCircle size={13} />
            <span>Belum Isi ({stats.belumIsi})</span>
          </button>

          <button
            onClick={() => setActiveCategory('aktif')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategory === 'aktif'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300'
            }`}
          >
            <Users size={13} />
            <span>Status Aktif ({stats.aktif})</span>
          </button>

          <button
            onClick={() => setActiveCategory('belum-aktif')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategory === 'belum-aktif'
                ? 'bg-slate-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <span>Belum Aktif ({stats.belumAktif})</span>
          </button>

          <button
            onClick={() => setActiveCategory('sk-berlaku')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategory === 'sk-berlaku'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            <Clock size={13} />
            <span>SK Berlaku ({stats.skBerlaku})</span>
          </button>

          <button
            onClick={() => setActiveCategory('sk-mendekati-habis')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategory === 'sk-mendekati-habis'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
            }`}
          >
            <span>SK Segera Berakhir ({stats.skMendekati})</span>
          </button>

          <button
            onClick={() => setActiveCategory('sk-habis')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategory === 'sk-habis'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300'
            }`}
          >
            <ShieldAlert size={13} />
            <span>SK Habis ({stats.skHabis})</span>
          </button>

          <button
            onClick={() => setActiveCategory('ktp-lengkap')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategory === 'ktp-lengkap'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300'
            }`}
          >
            <CreditCard size={13} />
            <span>KTP Full 3 KSB ({stats.ktpLengkap})</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: TABEL RINCIAN 96 UKKT RW */}
      {viewMode === 'unit' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-slate-900 dark:text-white uppercase">
                Tabel Rincian Unit Kerja RW
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                (Menampilkan {filteredUnits.length} dari {stats.total} RW)
              </span>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <span>Klik toggle status untuk mengubah aktif / belum aktif secara instan.</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10.5px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3.5 text-center w-12">No</th>
                  <th className="py-3 px-3.5">Kelurahan & RW</th>
                  <th className="py-3 px-3.5 text-center">1. Pengisian Data</th>
                  <th className="py-3 px-3.5 text-center">2. Status Aktif</th>
                  <th className="py-3 px-3.5">3. Masa Bhakti SK</th>
                  <th className="py-3 px-3.5">Pengurus KSB</th>
                  <th className="py-3 px-3.5 text-center">4. Berkas KTP</th>
                  <th className="py-3 px-3.5 text-center w-28">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Tidak ada data UKKT RW yang sesuai dengan filter atau kata kunci pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredUnits.map((item, index) => {
                    const ketua = item.unit.pengurus?.ketua;
                    const sekre = item.unit.pengurus?.sekretaris;
                    const bdh = item.unit.pengurus?.bendahara;

                    return (
                      <tr
                        key={item.unit.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* No */}
                        <td className="py-3.5 px-3.5 text-center font-mono text-slate-400 font-bold">
                          {index + 1}
                        </td>

                        {/* Kelurahan & RW */}
                        <td className="py-3.5 px-3.5">
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[11px] font-mono font-bold">
                              RW {item.unit.nomorRw}
                            </span>
                            <span>{item.unit.kelurahan}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                            {item.unit.alamatSekretariat}
                          </div>
                        </td>

                        {/* 1. Pengisian Data */}
                        <td className="py-3.5 px-3.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black ${
                              item.isSudahIsi
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                            }`}
                          >
                            {item.isSudahIsi ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <AlertCircle size={12} />
                            )}
                            <span>{item.isSudahIsi ? 'Sudah Isi' : 'Belum Isi'}</span>
                          </span>
                          <div className="text-[10px] font-bold text-slate-400 mt-1">
                            Skor: {item.kelengkapanSkor}%
                          </div>
                        </td>

                        {/* 2. Status Aktif + Toggle Langsung */}
                        <td className="py-3.5 px-3.5 text-center">
                          <button
                            onClick={() => handleToggleAktif(item)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black transition-all cursor-pointer ${
                              item.statusAktif === 'Aktif'
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-950/80 dark:text-blue-300'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                            title="Klik untuk mengubah status aktif / belum aktif"
                          >
                            {item.statusAktif === 'Aktif' ? (
                              <ToggleRight size={14} className="text-blue-600" />
                            ) : (
                              <ToggleLeft size={14} className="text-slate-400" />
                            )}
                            <span>{item.statusAktif}</span>
                          </button>
                        </td>

                        {/* 3. Masa Bhakti SK */}
                        <td className="py-3.5 px-3.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                item.statusPeriode === 'Berlaku'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : item.statusPeriode === 'Mendekati Habis'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : item.statusPeriode === 'Habis'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.statusPeriode}
                            </span>
                            {item.sisaHariSk !== null && (
                              <span className="text-[10px] font-mono text-slate-500 font-bold">
                                {item.sisaHariSk > 0
                                  ? `${item.sisaHariSk} hari lagi`
                                  : `Habis ${Math.abs(item.sisaHariSk)} hari lalu`}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            {item.unit.nomorSk ? `SK: ${item.unit.nomorSk}` : '(Belum ada SK)'}
                          </div>
                        </td>

                        {/* Pengurus KSB */}
                        <td className="py-3.5 px-3.5">
                          <div className="space-y-0.5">
                            <div className="font-extrabold text-slate-800 dark:text-slate-200">
                              K: {ketua?.namaLengkap || <span className="text-slate-400 italic">Belum diisi</span>}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              S: {sekre?.namaLengkap || '-'} | B: {bdh?.namaLengkap || '-'}
                            </div>
                            {ketua?.noWhatsapp && (
                              <div className="text-[10px] font-mono text-emerald-600 flex items-center gap-1">
                                <Phone size={10} /> {ketua.noWhatsapp}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 4. Berkas KTP KSB */}
                        <td className="py-3.5 px-3.5 text-center">
                          <div className="inline-flex items-center gap-1 font-mono font-bold text-[11px]">
                            <span
                              className={`px-2 py-0.5 rounded-full ${
                                item.ktpCount === 3
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                  : item.ktpCount > 0
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                              }`}
                            >
                              {item.ktpCount}/3 KTP
                            </span>
                          </div>
                          <div className="text-[9.5px] text-slate-400 mt-0.5">
                            {item.ktpCount === 3
                              ? 'Lengkap 3 KSB'
                              : item.ktpCount > 0
                              ? 'Sebagian diupload'
                              : 'Belum diupload'}
                          </div>
                        </td>

                        {/* Tindakan */}
                        <td className="py-3.5 px-3.5 text-center">
                          <button
                            onClick={() => onNavigateToUnit(item.unit.kelurahan, item.unit.nomorRw)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl font-bold text-[10.5px] flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer"
                          >
                            <span>Lengkapi</span>
                            <ChevronRight size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: TABEL MATRIKS 11 KELURAHAN */}
      {viewMode === 'kelurahan' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase">
                Rekapitulasi Agregat 11 Kelurahan Se-Kecamatan Tambora
              </h3>
              <p className="text-xs text-slate-500">
                Tinjauan komprehensif tingkat kelurahan untuk laporan koordinasi Camat & Sudin Sosial.
              </p>
            </div>
            <span className="text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-xl">
              11 Kelurahan • 96 RW
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10.5px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 text-center w-12">No</th>
                  <th className="py-3 px-4">Nama Kelurahan</th>
                  <th className="py-3 px-4 text-center">Total UKKT RW</th>
                  <th className="py-3 px-4 text-center">1. Sudah Isi</th>
                  <th className="py-3 px-4 text-center">Belum Isi</th>
                  <th className="py-3 px-4 text-center">2. Status Aktif</th>
                  <th className="py-3 px-4 text-center">Belum Aktif</th>
                  <th className="py-3 px-4 text-center">3. SK Berlaku</th>
                  <th className="py-3 px-4 text-center">SK Habis</th>
                  <th className="py-3 px-4 text-center">4. KTP Full</th>
                  <th className="py-3 px-4">Persentase Keterisian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {kelurahanSummary.map((item, idx) => (
                  <tr
                    key={item.kelurahan}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-bold">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      KELURAHAN {item.kelurahan}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-extrabold text-blue-600">
                      {item.total} RW
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600">
                      {item.sudah}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-red-500">
                      {item.belum}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-600">
                      {item.aktif}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                      {item.belumAktif}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600">
                      {item.skBerlaku}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-red-500">
                      {item.skHabis}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-purple-600">
                      {item.ktpLengkap}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.persen >= 75
                                ? 'bg-emerald-500'
                                : item.persen >= 40
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${item.persen}%` }}
                          />
                        </div>
                        <span className="font-mono font-black text-xs w-10 text-right">
                          {item.persen}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xs border-t-2 border-slate-300 dark:border-slate-700">
                <tr>
                  <td colSpan={2} className="py-3.5 px-4 text-center uppercase tracking-wider">
                    TOTAL KECAMATAN TAMBORA
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-blue-700 dark:text-blue-300">
                    {stats.total} RW
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-emerald-700 dark:text-emerald-300">
                    {stats.sudahIsi}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-red-600 dark:text-red-400">
                    {stats.belumIsi}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-blue-700 dark:text-blue-300">
                    {stats.aktif}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                    {stats.belumAktif}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-emerald-700 dark:text-emerald-300">
                    {stats.skBerlaku}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-red-600 dark:text-red-400">
                    {stats.skHabis}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-purple-700 dark:text-purple-300">
                    {stats.ktpLengkap}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-700 dark:text-emerald-300">
                    {stats.persenIsi}% Keterisian Total
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
