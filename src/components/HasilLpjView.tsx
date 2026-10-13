import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Trash2,
  Camera,
  Printer,
  Save,
  CheckCircle2,
  Receipt,
  FileCheck2,
  FileText,
  Building,
  Image as ImageIcon,
  DollarSign,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  LpjStimulanRecord,
  PengeluaranLpjItem,
  DataOrganisasi,
  KelurahanName,
  TingkatOrganisasi,
} from '../types';
import {
  BIDANG_KEGIATAN_KATAR,
  MASTER_SUB_KEGIATAN_KATAR,
  DAFTAR_KELURAHAN_TAMBORA,
  MAP_WILAYAH_TAMBORA,
} from '../data/wilayah';
import { getOrganisasi, saveOrganisasi, getKSBForUnit, addOrUpdateLpj } from '../services/storage';
import {
  generateLpjHtml,
  generateTandaTerimaHtml,
  printDocumentHtml,
} from '../services/pdfExport';
import { getActiveLogoNasional, getActiveLogoDki } from '../data/logos';
import { KopSuratView } from './KopSuratView';
import { PengaturanKopModal } from './PengaturanKopModal';
import { Settings } from 'lucide-react';

export const DAFTAR_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const DAFTAR_TAHUN = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

// Menghitung tanggal terakhir di bulan dan tahun secara presisi (otomatis)
export function hitungTanggalAkhirBulan(namaBulan: string, tahunNum: number): string {
  const index = DAFTAR_BULAN.indexOf(namaBulan);
  const m = index >= 0 ? index : 6;
  const lastDate = new Date(tahunNum, m + 1, 0).getDate();
  return `${lastDate} ${namaBulan} ${tahunNum}`;
}

// Konversi teks tanggal Indonesia "15 Juli 2026" ke format ISO "YYYY-MM-DD" untuk <input type="date">
export function toDateInputValue(tglStr: string, fallbackTahun: number, fallbackBulan: string): string {
  if (!tglStr) {
    const mIdx = DAFTAR_BULAN.indexOf(fallbackBulan);
    const mStr = String(mIdx >= 0 ? mIdx + 1 : 7).padStart(2, '0');
    return `${fallbackTahun}-${mStr}-15`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(tglStr)) return tglStr;
  const parts = tglStr.trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parts[0].replace(/\D/g, '').padStart(2, '0');
    const monthName = parts[1];
    const year = parts[2].replace(/\D/g, '') || String(fallbackTahun);
    const mIdx = DAFTAR_BULAN.findIndex((b) => b.toLowerCase() === monthName.toLowerCase());
    if (mIdx >= 0 && day) {
      return `${year}-${String(mIdx + 1).padStart(2, '0')}-${day}`;
    }
  }
  const mIdx = DAFTAR_BULAN.indexOf(fallbackBulan);
  const mStr = String(mIdx >= 0 ? mIdx + 1 : 7).padStart(2, '0');
  return `${fallbackTahun}-${mStr}-15`;
}

// Konversi nilai ISO "YYYY-MM-DD" dari input type="date" ke format resmi Indonesia "15 Juli 2026"
export function fromDateInputValue(isoStr: string): string {
  if (!isoStr) return '';
  const [y, m, d] = isoStr.split('-');
  const mIdx = parseInt(m, 10) - 1;
  const bName = DAFTAR_BULAN[mIdx] || 'Juli';
  return `${parseInt(d, 10)} ${bName} ${y}`;
}

interface HasilLpjViewProps {
  currentKelurahan: KelurahanName;
  currentRw: string;
  lpjList: LpjStimulanRecord[];
  onRefresh: () => void;
}

export const HasilLpjView: React.FC<HasilLpjViewProps> = ({
  currentKelurahan,
  currentRw,
  lpjList,
  onRefresh,
}) => {
  const [orgState, setOrgState] = useState<DataOrganisasi>(() => getOrganisasi());
  const [isKopModalOpen, setIsKopModalOpen] = useState(false);

  // Active form configuration
  const [tingkat, setTingkat] = useState<TingkatOrganisasi>('Unit RW');
  const [kelurahan, setKelurahan] = useState<KelurahanName>(currentKelurahan);
  const [nomorRw, setNomorRw] = useState<string>(currentRw);
  const [bulan, setBulan] = useState<string>('Juli');
  const [tahun, setTahun] = useState<number>(2026);
  const [tanggalLaporan, setTanggalLaporan] = useState<string>(() =>
    hitungTanggalAkhirBulan('Juli', 2026)
  );

  // Helper ketika Bulan Laporan dipilih: otomatis tanggal cetak menjadi tanggal terakhir bulan tersebut
  const handleBulanChange = (newBulan: string) => {
    setBulan(newBulan);
    const tglAkhir = hitungTanggalAkhirBulan(newBulan, tahun);
    setTanggalLaporan(tglAkhir);
  };

  // Helper ketika Tahun Laporan diubah: otomatis tanggal cetak dihitung ulang
  const handleTahunChange = (newTahun: number) => {
    setTahun(newTahun);
    const tglAkhir = hitungTanggalAkhirBulan(bulan, newTahun);
    setTanggalLaporan(tglAkhir);
  };

  // Keuangan
  const [saldoLalu, setSaldoLalu] = useState<number>(0);
  const [penerimaanDana, setPenerimaanDana] = useState<number>(500000); // 500rb standar RW DKI

  const handleTingkatChange = (newTingkat: TingkatOrganisasi) => {
    setTingkat(newTingkat);
    if (newTingkat === 'Unit RW') {
      setPenerimaanDana(500000);
    } else if (newTingkat === 'Kelurahan') {
      setPenerimaanDana(1000000);
    } else if (newTingkat === 'Kecamatan') {
      setPenerimaanDana(2000000);
    }
  };

  // Default pengeluaran items
  const [pengeluaran, setPengeluaran] = useState<PengeluaranLpjItem[]>([
    {
      id: 'item-1',
      no: 1,
      bidang: 'i. Kesekretariatan & Organisasi',
      uraian: 'Penggandaan materi rapat formatur & ATK pembukuan kas bulanan',
      jumlah: 150000,
      tanggal: '10 Juli 2026',
      adaNota: true,
      status: 'Terlaksana',
    },
    {
      id: 'item-2',
      no: 2,
      bidang: 'iv. Kerohanian & Pembinaan Mental',
      uraian: 'Konsumsi kegiatan Tahsin Al-Qur\'an & Santunan Ramadhan / Yatim RW',
      jumlah: 200000,
      tanggal: '18 Juli 2026',
      adaNota: true,
      status: 'Terlaksana',
    },
    {
      id: 'item-3',
      no: 3,
      bidang: 'vi. Lingkungan Hidup & Kebersihan Wilayah',
      uraian: 'Kerja bakti pembersihan saluran air (got) dan kantong sampah pilah',
      jumlah: 150000,
      tanggal: '26 Juli 2026',
      adaNota: true,
      status: 'Terlaksana',
    },
  ]);

  // Preview Mode
  const [previewSheet, setPreviewSheet] = useState<
    'keuangan' | 'bidang' | 'dokumentasi' | 'sptjm' | 'tanda-terima'
  >('keuangan');

  // Load KSB for current chosen unit
  const ksb = getKSBForUnit(tingkat, kelurahan, nomorRw);

  // Auto calculate total
  const totalKeluar = pengeluaran.reduce((sum, item) => sum + item.jumlah, 0);
  const sisaSaldo = saldoLalu + penerimaanDana - totalKeluar;

  // Add Row dengan default sub-kegiatan resmi karangtaruna.jakarta.go.id
  const handleAddRow = () => {
    const nextNo = pengeluaran.length + 1;
    const defaultBidang = BIDANG_KEGIATAN_KATAR[0];
    const subList = MASTER_SUB_KEGIATAN_KATAR[defaultBidang] || [];
    const defaultUraian = subList[0] || 'Kegiatan Kepemudaan Karang Taruna RW';

    const newItem: PengeluaranLpjItem = {
      id: `item-${Date.now()}`,
      no: nextNo,
      bidang: defaultBidang,
      uraian: defaultUraian,
      jumlah: 0,
      tanggal: `15 ${bulan} ${tahun}`,
      adaNota: true,
      status: 'Terlaksana',
    };
    setPengeluaran([...pengeluaran, newItem]);
  };

  // Remove Row
  const handleRemoveRow = (id: string) => {
    setPengeluaran(pengeluaran.filter((p) => p.id !== id));
  };

  // Update item field (otomatis uraian berubah saat bidang kegiatan di klik)
  const handleItemChange = (id: string, field: keyof PengeluaranLpjItem, val: any) => {
    setPengeluaran(
      pengeluaran.map((item) => {
        if (item.id !== id) return item;

        // Jika Bidang Kegiatan diganti, otomatis Uraian Kegiatan berganti sesuai standar resmi karangtaruna.jakarta.go.id
        if (field === 'bidang') {
          const subKegiatanList = MASTER_SUB_KEGIATAN_KATAR[val] || [];
          const autoUraian = subKegiatanList[0] || item.uraian;
          return {
            ...item,
            bidang: val,
            uraian: autoUraian,
          };
        }

        return { ...item, [field]: val };
      })
    );
  };

  // Upload Foto Kegiatan langsung masuk ke tabel dokumentasi
  const handleUploadFoto = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleItemChange(id, 'fotoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save current LPJ
  const handleSaveLpj = () => {
    const record: LpjStimulanRecord = {
      id: `LPJ-${tahun}-${bulan}-${kelurahan}-${nomorRw}`,
      tingkat,
      kelurahan,
      nomorRw,
      bulan,
      tahun,
      tanggalLaporan,
      saldoBulanLalu: saldoLalu,
      penerimaanDana,
      pengeluaran,
      namaKetua: ksb.namaKetua,
      nikKetua: ksb.nikKetua,
      namaBendahara: ksb.namaBendahara,
      nikBendahara: ksb.nikBendahara,
      status: 'Final',
      waktuDibuat: new Date().toISOString(),
    };
    addOrUpdateLpj(record);
    onRefresh();
    alert('Laporan Pertanggungjawaban (LPJ) berhasil disimpan!');
  };

  // Print Complete LPJ 4 Lembar
  const handlePrintFull = () => {
    const record: LpjStimulanRecord = {
      id: `LPJ-${tahun}-${bulan}-${kelurahan}-${nomorRw}`,
      tingkat,
      kelurahan,
      nomorRw,
      bulan,
      tahun,
      tanggalLaporan,
      saldoBulanLalu: saldoLalu,
      penerimaanDana,
      pengeluaran,
      namaKetua: ksb.namaKetua,
      nikKetua: ksb.nikKetua,
      namaBendahara: ksb.namaBendahara,
      nikBendahara: ksb.nikBendahara,
      status: 'Final',
      waktuDibuat: new Date().toISOString(),
    };
    const html = generateLpjHtml(record, orgState);
    printDocumentHtml(
      html,
      `LPJ_Dana_Stimulan_${kelurahan}_RW${nomorRw}_${bulan}_${tahun}`
    );
  };

  // Print Tanda Terima Penyaluran RW Dinamis
  const handlePrintTandaTerima = () => {
    const html = generateTandaTerimaHtml(kelurahan, tanggalLaporan, orgState);
    printDocumentHtml(html, `Tanda_Terima_Penyaluran_Dana_${kelurahan}`);
  };

  // RWs for selected Kelurahan
  const listRw = MAP_WILAYAH_TAMBORA[kelurahan] || ['001'];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase">
              MODUL LPJ DANA STIMULAN
            </span>
            <span className="text-xs text-slate-500 font-medium">Standar Dinas Sosial DKI Jakarta</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
            Pelaporan Penggunaan Dana Stimulan Karang Taruna
          </h1>
          <p className="text-xs text-slate-500">
            Mencetak otomatis 4 lembar resmi: Keuangan, Pemanfaatan Bidang, Dokumentasi Foto Kegiatan, dan SPTJM Bermaterai.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsKopModalOpen(true)}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Ubah teks Kop Surat atau ganti Logo Karang Taruna & DKI Jakarta"
          >
            <Settings size={15} />
            <span>Atur Kop & Logo</span>
          </button>

          <button
            onClick={handleSaveLpj}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Save size={15} />
            <span>Simpan Draft</span>
          </button>

          <button
            onClick={handlePrintFull}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Printer size={16} />
            <span>CETAK LPJ 4 LEMBAR (PDF)</span>
          </button>
        </div>
      </div>

      {/* Form Setup: Tingkat, Bulan, Penerimaan Dana */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">
          Pengaturan Laporan & Identitas Unit
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Tingkat Organisasi
            </label>
            <select
              value={tingkat}
              onChange={(e) => handleTingkatChange(e.target.value as TingkatOrganisasi)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
            >
              <option value="Unit RW">Unit RW (UKKT)</option>
              <option value="Kelurahan">Kelurahan</option>
              <option value="Kecamatan">Kecamatan</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Kelurahan
            </label>
            <select
              value={kelurahan}
              onChange={(e) => {
                const k = e.target.value as KelurahanName;
                setKelurahan(k);
                setNomorRw(MAP_WILAYAH_TAMBORA[k][0]);
              }}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
            >
              {DAFTAR_KELURAHAN_TAMBORA.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Nomor RW
            </label>
            <select
              value={nomorRw}
              onChange={(e) => setNomorRw(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold font-mono"
            >
              {listRw.map((rw) => (
                <option key={rw} value={rw}>
                  RW {rw}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Bulan & Tahun Laporan <span className="text-emerald-600 font-bold text-[10px] lowercase">(pilih otomatis)</span>
            </label>
            <div className="flex gap-1.5">
              <select
                value={bulan}
                onChange={(e) => handleBulanChange(e.target.value)}
                className="w-1/2 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-xs"
              >
                {DAFTAR_BULAN.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <select
                value={tahun}
                onChange={(e) => handleTahunChange(Number(e.target.value))}
                className="w-1/2 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold font-mono text-xs"
              >
                {DAFTAR_TAHUN.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">
                Tanggal Cetak Laporan
              </label>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                ⚡ Otomatis Akhir Bulan
              </span>
            </div>
            <input
              type="text"
              value={tanggalLaporan}
              onChange={(e) => setTanggalLaporan(e.target.value)}
              placeholder="31 Juli 2026"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-xs"
            />
          </div>
        </div>

        {/* Saldo & Penerimaan Dana */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              (I) Saldo Bulan Lalu
            </span>
            <div className="mt-1 flex items-center">
              <span className="font-bold mr-1">Rp</span>
              <input
                type="number"
                value={saldoLalu}
                onChange={(e) => setSaldoLalu(Number(e.target.value))}
                className="w-full p-1 bg-transparent font-mono font-bold text-sm"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">
                (II) Penerimaan Dana Stimulasi
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPenerimaanDana(500000)}
                  className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold ${
                    penerimaanDana === 500000
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  }`}
                  title="Standar Unit RW (Rp 500rb)"
                >
                  500rb
                </button>
                <button
                  type="button"
                  onClick={() => setPenerimaanDana(1000000)}
                  className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold ${
                    penerimaanDana === 1000000
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  }`}
                  title="Standar Kelurahan (Rp 1jt)"
                >
                  1jt
                </button>
                <button
                  type="button"
                  onClick={() => setPenerimaanDana(2000000)}
                  className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold ${
                    penerimaanDana === 2000000
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  }`}
                  title="Standar Kecamatan (Rp 2jt)"
                >
                  2jt
                </button>
              </div>
            </div>
            <div className="mt-1 flex items-center text-blue-800 dark:text-blue-200">
              <span className="font-bold mr-1">Rp</span>
              <input
                type="number"
                value={penerimaanDana}
                onChange={(e) => setPenerimaanDana(Number(e.target.value))}
                className="w-full p-1 bg-transparent font-mono font-black text-sm"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                Sisa Saldo Kas Akhir
              </span>
              <div className="font-mono font-black text-base text-emerald-800 dark:text-emerald-200 mt-0.5">
                Rp {sisaSaldo.toLocaleString('id-ID')}
              </div>
            </div>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                sisaSaldo === 0
                  ? 'bg-emerald-200 text-emerald-900'
                  : sisaSaldo > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-200 text-red-900'
              }`}
            >
              {sisaSaldo === 0 ? 'NIHIL (LUNAS)' : sisaSaldo > 0 ? 'ADA SISA SALDO' : 'DEFISIT'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabel Uraian Pengeluaran & Upload Dokumentasi Kegiatan */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <ClipboardList size={18} className="text-emerald-600" />
              <span>Daftar Pengeluaran & Upload Foto Dokumentasi</span>
            </h3>
            <p className="text-xs text-slate-500">
              Foto yang diupload otomatis masuk dan proporsional ke Lembar 3 (Dokumentasi).
            </p>
          </div>

          <button
            onClick={handleAddRow}
            className="self-start sm:self-auto bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah Baris Kegiatan</span>
          </button>
        </div>

        {/* List of items */}
        <div className="space-y-4">
          {pengeluaran.map((item, index) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                  {index + 1}
                </span>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.adaNota}
                      onChange={(e) => handleItemChange(item.id, 'adaNota', e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Nota Terlampir</span>
                  </label>

                  {pengeluaran.length > 1 && (
                    <button
                      onClick={() => handleRemoveRow(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Hapus baris"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                {/* Bidang */}
                <div className="md:col-span-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                      Bidang Kegiatan
                    </label>
                  </div>
                  <select
                    value={item.bidang}
                    onChange={(e) => handleItemChange(item.id, 'bidang', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border rounded-xl font-bold text-blue-700 dark:text-blue-400"
                  >
                    {BIDANG_KEGIATAN_KATAR.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <span className="text-[9.5px] text-slate-400 mt-1 block">
                    ⚡ Auto-update uraian kegiatan
                  </span>
                </div>

                {/* Uraian */}
                <div className="md:col-span-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                      Uraian Kegiatan / Pengeluaran
                    </label>
                    <span className="text-[9.5px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                      karangtaruna.jakarta.go.id
                    </span>
                  </div>

                  {/* Dropdown Rekomendasi Resmi Standar Karang Taruna DKI */}
                  <select
                    value={item.uraian}
                    onChange={(e) => handleItemChange(item.id, 'uraian', e.target.value)}
                    className="w-full p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300"
                    title="Pilih Sub Kegiatan Resmi Standar DKI Jakarta"
                  >
                    {(MASTER_SUB_KEGIATAN_KATAR[item.bidang] || []).map((sub, sIdx) => (
                      <option key={sIdx} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>

                  <textarea
                    rows={2}
                    value={item.uraian}
                    onChange={(e) => handleItemChange(item.id, 'uraian', e.target.value)}
                    placeholder="Uraian kegiatan atau pengeluaran..."
                    className="w-full p-2 bg-white dark:bg-slate-900 border rounded-xl font-medium text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Jumlah Biaya */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Jumlah (Rp)
                  </label>
                  <input
                    type="number"
                    value={item.jumlah}
                    onChange={(e) => handleItemChange(item.id, 'jumlah', Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-900 border rounded-xl font-mono font-bold"
                  />
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Rp {item.jumlah.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Tanggal Pelaksanaan: Format Tanggal Date Picker */}
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Tgl Pelaksanaan
                  </label>
                  <input
                    type="date"
                    value={toDateInputValue(item.tanggal, tahun, bulan)}
                    onChange={(e) =>
                      handleItemChange(item.id, 'tanggal', fromDateInputValue(e.target.value))
                    }
                    className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded-xl text-xs font-mono font-semibold"
                  />
                  <div className="text-[9.5px] font-medium text-slate-500 mt-1 truncate" title={item.tanggal}>
                    {item.tanggal || `${bulan} ${tahun}`}
                  </div>
                </div>

                {/* Foto Dokumentasi Upload */}
                <div className="md:col-span-2 flex flex-col items-center justify-center border-l border-slate-200 dark:border-slate-700 pl-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 text-center">
                    Foto Dokumentasi
                  </label>
                  {item.fotoUrl ? (
                    <div className="relative group">
                      <img
                        src={item.fotoUrl}
                        alt="Foto Kegiatan"
                        className="w-20 h-16 object-cover rounded-lg border-2 border-emerald-500 shadow-xs"
                      />
                      <button
                        onClick={() => handleItemChange(item.id, 'fotoUrl', '')}
                        className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700"
                        title="Hapus foto"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-24 h-16 bg-blue-50 dark:bg-blue-950/40 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors">
                      <Camera size={18} className="text-blue-500" />
                      <span className="text-[9px] font-black text-blue-600 uppercase mt-0.5">
                        UPLOAD FOTO
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleUploadFoto(item.id, e)}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Summary Row */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-bold text-xs">
          <div>
            Total Pengeluaran Dilaporkan: <strong>Rp {totalKeluar.toLocaleString('id-ID')}</strong>
          </div>
          <div className="flex items-center gap-3">
            <span>Sisa Saldo: Rp {sisaSaldo.toLocaleString('id-ID')}</span>
            <button
              onClick={handlePrintFull}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer size={15} />
              <span>Cetak LPJ Lengkap</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIVE PREVIEW TABS OF THE 5 OFFICIAL DOCUMENT SHEETS */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <FileCheck2 size={18} className="text-blue-600" />
              <span>Pratinjau Lembar Dokumen Resmi</span>
            </h3>
            <p className="text-xs text-slate-500">
              Lihat format cetak A4 sesuai layout dinas sosial sebelum dicetak.
            </p>
          </div>

          {/* Sub Tabs for sheets */}
          <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setPreviewSheet('keuangan')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                previewSheet === 'keuangan' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              1. Keuangan
            </button>
            <button
              onClick={() => setPreviewSheet('bidang')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                previewSheet === 'bidang' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              2. Pemanfaatan Bidang
            </button>
            <button
              onClick={() => setPreviewSheet('dokumentasi')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                previewSheet === 'dokumentasi'
                  ? 'bg-white dark:bg-slate-700 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              3. Dokumentasi Foto
            </button>
            <button
              onClick={() => setPreviewSheet('sptjm')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                previewSheet === 'sptjm' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              4. SPTJM Materai
            </button>
            <button
              onClick={() => setPreviewSheet('tanda-terima')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                previewSheet === 'tanda-terima'
                  ? 'bg-white dark:bg-slate-700 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              5. Tanda Terima RW
            </button>
          </div>
        </div>

        {/* Live A4 Paper Box Simulation */}
        <div className="bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 rounded-2xl flex justify-center overflow-x-auto">
          <div className="w-[210mm] min-w-[210mm] min-h-[297mm] bg-white text-black p-[20mm] rounded-sm shadow-xl font-serif text-[11pt] leading-relaxed relative select-text border border-slate-300">
            {/* Kop Surat Karang Taruna Resmi */}
            <KopSuratView
              tingkat={tingkat}
              kelurahan={kelurahan}
              nomorRw={nomorRw}
              org={orgState}
              onEditKop={() => setIsKopModalOpen(true)}
              showEditButton={true}
            />

            {/* PREVIEW SHEET 1: KEUANGAN */}
            {previewSheet === 'keuangan' && (
              <div className="space-y-4">
                <div className="text-center font-bold underline text-[12pt]">
                  LAPORAN KEADAAN KEUANGAN DANA STIMULAN
                </div>
                <div className="text-center font-bold text-[11pt]">
                  {tingkat === 'Unit RW' ? `UKKT RW ${nomorRw}` : `KELURAHAN ${kelurahan}`} KELURAHAN{' '}
                  {kelurahan}
                </div>
                <div className="text-[10.5pt]">
                  Bulan : <strong>{bulan}</strong> &nbsp;|&nbsp; Tahun : <strong>{tahun}</strong>
                </div>

                <table className="w-full border-collapse border border-black text-[10pt]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-black p-2 w-12 text-center">NO</th>
                      <th className="border border-black p-2 text-left">KEGIATAN</th>
                      <th className="border border-black p-2 text-right w-36">JUMLAH (Rp)</th>
                      <th className="border border-black p-2 text-center w-28">KETERANGAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 text-center font-bold">I</td>
                      <td className="border border-black p-2 font-bold">SALDO BULAN LALU</td>
                      <td className="border border-black p-2 text-right font-bold">
                        {saldoLalu.toLocaleString('id-ID')}
                      </td>
                      <td className="border border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center font-bold">II</td>
                      <td className="border border-black p-2 font-bold">
                        PENERIMA UANG DANA STIMULASI
                      </td>
                      <td className="border border-black p-2 text-right font-bold">
                        {penerimaanDana.toLocaleString('id-ID')}
                      </td>
                      <td className="border border-black p-2 text-center text-xs">STIMULAN</td>
                    </tr>
                    {pengeluaran.map((p, idx) => (
                      <tr key={p.id}>
                        <td className="border border-black p-2 text-center">{idx + 1}</td>
                        <td className="border border-black p-2">
                          {p.uraian || 'Kegiatan Karang Taruna'}
                          <div className="text-[8.5pt] text-slate-500 font-sans">({p.bidang})</div>
                        </td>
                        <td className="border border-black p-2 text-right">
                          {p.jumlah.toLocaleString('id-ID')}
                        </td>
                        <td className="border border-black p-2 text-center text-xs">
                          {p.status}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-slate-50">
                      <td colSpan={2} className="border border-black p-2 text-right">
                        TOTAL PENGELUARAN :
                      </td>
                      <td className="border border-black p-2 text-right">
                        {totalKeluar.toLocaleString('id-ID')}
                      </td>
                      <td className="border border-black p-2"></td>
                    </tr>
                    <tr className="font-bold bg-slate-100">
                      <td colSpan={2} className="border border-black p-2 text-right">
                        SISA SALDO KAS :
                      </td>
                      <td className="border border-black p-2 text-right">
                        {sisaSaldo.toLocaleString('id-ID')}
                      </td>
                      <td className="border border-black p-2 text-center">
                        {sisaSaldo === 0 ? 'NIHIL' : 'SALDO'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-right text-[10.5pt] pt-4">Jakarta, {tanggalLaporan}</div>

                <div className="flex justify-between text-center text-[10.5pt] pt-4">
                  <div className="w-56">
                    Bendahara Karang Taruna<br />
                    {tingkat === 'Unit RW' ? `RW ${nomorRw}` : kelurahan}
                    <div className="h-16"></div>
                    <strong><u>{ksb.namaBendahara}</u></strong>
                    <div className="text-[9.5pt]">NIK: {ksb.nikBendahara}</div>
                  </div>
                  <div className="w-56">
                    Ketua Karang Taruna<br />
                    {tingkat === 'Unit RW' ? `RW ${nomorRw}` : kelurahan}
                    <div className="h-16"></div>
                    <strong><u>{ksb.namaKetua}</u></strong>
                    <div className="text-[9.5pt]">NIK: {ksb.nikKetua}</div>
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW SHEET 2: PEMANFAATAN BIDANG */}
            {previewSheet === 'bidang' && (
              <div className="space-y-4">
                <div className="text-center font-bold underline text-[12pt]">
                  LAPORAN KEGIATAN PEMANFAATAN DANA STIMULASI
                </div>
                <div className="text-center font-bold text-[11pt]">
                  UKKT RW {nomorRw} KELURAHAN {kelurahan}
                </div>
                <div className="text-[10.5pt]">Periode : Bulan {bulan} {tahun}</div>

                <table className="w-full border-collapse border border-black text-[10pt]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-black p-2 w-10 text-center">NO</th>
                      <th className="border border-black p-2 w-44 text-left">BIDANG</th>
                      <th className="border border-black p-2 text-left">URAIAN KEGIATAN</th>
                      <th className="border border-black p-2 text-center w-28">WAKTU</th>
                      <th className="border border-black p-2 text-right w-28">ANGGARAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pengeluaran.map((p, idx) => (
                      <tr key={p.id}>
                        <td className="border border-black p-2 text-center">{idx + 1}</td>
                        <td className="border border-black p-2 font-bold">{p.bidang}</td>
                        <td className="border border-black p-2">{p.uraian}</td>
                        <td className="border border-black p-2 text-center text-xs">
                          {p.tanggal}
                        </td>
                        <td className="border border-black p-2 text-right">
                          Rp {p.jumlah.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PREVIEW SHEET 3: DOKUMENTASI FOTO KEGIATAN */}
            {previewSheet === 'dokumentasi' && (
              <div className="space-y-4">
                <div className="text-center font-bold underline text-[12pt]">
                  DOKUMENTASI KEGIATAN DAN PENGELUARAN DANA STIMULASI
                </div>
                <div className="text-center font-bold text-[11pt]">
                  BULAN {bulan.toUpperCase()} TAHUN {tahun} • UKKT RW {nomorRw}
                </div>

                <table className="w-full border-collapse border border-black text-[10pt]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-black p-2 w-10 text-center">NO</th>
                      <th className="border border-black p-2 w-24 text-center">TANGGAL</th>
                      <th className="border border-black p-2 text-left">KEGIATAN</th>
                      <th className="border border-black p-2 text-center w-52">
                        FOTO DOKUMENTASI
                      </th>
                      <th className="border border-black p-2 text-center w-20">NOTA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pengeluaran.map((p, idx) => (
                      <tr key={p.id}>
                        <td className="border border-black p-2 text-center">{idx + 1}</td>
                        <td className="border border-black p-2 text-center text-xs">
                          {p.tanggal}
                        </td>
                        <td className="border border-black p-2">
                          <strong>{p.uraian}</strong>
                          <div className="text-[8.5pt] text-slate-500">{p.bidang}</div>
                        </td>
                        <td className="border border-black p-2 text-center">
                          {p.fotoUrl ? (
                            <img
                              src={p.fotoUrl}
                              alt="Dokumentasi"
                              className="w-40 h-28 object-cover mx-auto rounded border border-slate-400"
                            />
                          ) : (
                            <div className="h-20 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                              Foto Dokumentasi
                            </div>
                          )}
                        </td>
                        <td className="border border-black p-2 text-center font-bold text-xs text-emerald-700">
                          {p.adaNota ? 'TERLAMPIR' : 'ADA'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PREVIEW SHEET 4: SPTJM MATERAI */}
            {previewSheet === 'sptjm' && (
              <div className="space-y-4">
                <div className="text-center font-bold underline text-[12.5pt]">
                  SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK (SPTJM)
                </div>

                <p className="text-justify leading-relaxed">
                  Yang bertanda tangan di bawah ini:
                </p>

                <table className="w-full border-none text-[10.5pt] ml-4 leading-relaxed">
                  <tbody>
                    <tr>
                      <td className="w-40">Nama Lengkap</td>
                      <td className="w-4">:</td>
                      <td className="font-bold">{ksb.namaKetua}</td>
                    </tr>
                    <tr>
                      <td>NIK (No. KTP)</td>
                      <td>:</td>
                      <td className="font-bold">{ksb.nikKetua}</td>
                    </tr>
                    <tr>
                      <td>Jabatan</td>
                      <td>:</td>
                      <td>Ketua UKKT RW {nomorRw} Kelurahan {kelurahan}</td>
                    </tr>
                    <tr>
                      <td>Wilayah Kerja</td>
                      <td>:</td>
                      <td>Kecamatan Tambora, Kota Adm. Jakarta Barat</td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-justify leading-relaxed">
                  Menyatakan dengan sesungguhnya bahwa Dana Stimulan Karang Taruna Bulan{' '}
                  <strong>{bulan} Tahun {tahun}</strong> sebesar{' '}
                  <strong>Rp {penerimaanDana.toLocaleString('id-ID')}</strong> telah dipergunakan
                  sesuai peruntukannya secara tertib dan transparan.
                </p>

                <div className="pt-8 flex justify-end text-center">
                  <div className="w-60">
                    Jakarta, {tanggalLaporan}<br />
                    Yang Membuat Pernyataan,<br />
                    <div className="w-24 h-14 border border-dashed border-slate-400 my-3 mx-auto flex items-center justify-center text-[8.5pt] text-slate-500 font-sans">
                      MATERAI<br />Rp 10.000
                    </div>
                    <strong><u>{ksb.namaKetua}</u></strong>
                    <div className="text-[9.5pt]">NIK: {ksb.nikKetua}</div>
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW SHEET 5: TANDA TERIMA DINAMIS PER-RW */}
            {previewSheet === 'tanda-terima' && (
              <div className="space-y-4">
                <div className="text-center font-bold underline text-[12pt]">
                  TANDA TERIMA PENYALURAN DANA STIMULASI
                </div>
                <div className="text-center font-bold text-[11pt]">
                  KEPADA UKKT RW KELURAHAN {kelurahan}
                </div>

                <table className="w-full border-collapse border border-black text-[10pt]">
                  <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                      <th className="border border-black p-2 w-10">No</th>
                      <th className="border border-black p-2 text-left">NAMA KARANG TARUNA</th>
                      <th className="border border-black p-2 text-left w-36">PENERIMA</th>
                      <th className="border border-black p-2 text-right w-28">JUMLAH</th>
                      <th className="border border-black p-2 text-center w-36">TTD & STEMPEL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-slate-50">
                      <td className="border border-black p-2 text-center font-bold">1</td>
                      <td className="border border-black p-2 font-bold">
                        Karang Taruna Kelurahan {kelurahan}
                      </td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2 text-right font-bold">Rp 1.000.000</td>
                      <td className="border border-black p-2 text-center text-xs">1. .........</td>
                    </tr>
                    {listRw.map((rw, idx) => (
                      <tr key={rw} className="h-10">
                        <td className="border border-black p-2 text-center">{idx + 2}</td>
                        <td className="border border-black p-2">Karang Taruna Unit RW {rw}</td>
                        <td className="border border-black p-2"></td>
                        <td className="border border-black p-2 text-right">Rp 500.000</td>
                        <td className="border border-black p-2 text-xs text-slate-500 pl-3">
                          {idx + 2}. ........
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-slate-100">
                      <td colSpan={3} className="border border-black p-2 text-right">
                        TOTAL PENYALURAN :
                      </td>
                      <td className="border border-black p-2 text-right">
                        Rp {(1000000 + listRw.length * 500000).toLocaleString('id-ID')}
                      </td>
                      <td className="border border-black p-2"></td>
                    </tr>
                  </tbody>
                </table>

                {/* Pejabat Sudin Sosial */}
                <div className="flex justify-between text-center text-[10pt] pt-6">
                  <div className="w-60">
                    Mengetahui,<br />
                    Kepala Suku Dinas Sosial<br />
                    Kota Adm. Jakarta Barat
                    <div className="h-14"></div>
                    <strong><u>{orgState.kasudinSosial}</u></strong>
                    <div className="text-[9pt]">NIP. {orgState.nipKasudinSosial}</div>
                  </div>
                  <div className="w-60">
                    Lunas Dibayar Oleh,<br />
                    Bendahara Pengeluaran<br />
                    Sudin Sosial Kota Adm. Jakarta Barat
                    <div className="h-14"></div>
                    <strong><u>{orgState.bendaharaSudin}</u></strong>
                    <div className="text-[9pt]">NIP. {orgState.nipBendaharaSudin}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Bottom */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handlePrintTandaTerima}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt size={15} />
            <span>Cetak Khusus Lembar Tanda Terima RW (Kel. {kelurahan})</span>
          </button>

          <button
            onClick={handlePrintFull}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Printer size={16} />
            <span>CETAK LENGKAP SEMUA LEMBAR (PDF)</span>
          </button>
        </div>
      </div>

      {/* Modal Pengaturan Kop Surat & Upload Logo */}
      <PengaturanKopModal
        isOpen={isKopModalOpen}
        onClose={() => setIsKopModalOpen(false)}
        org={orgState}
        onSaveOrg={(updated) => {
          setOrgState(updated);
          saveOrganisasi(updated);
          onRefresh();
        }}
        currentTingkat={tingkat}
        currentKelurahan={kelurahan}
        currentRw={nomorRw}
      />
    </div>
  );
};
