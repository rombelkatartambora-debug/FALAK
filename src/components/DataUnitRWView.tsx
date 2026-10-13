import React, { useState, useEffect } from 'react';
import {
  Shield,
  User,
  Landmark,
  Calendar,
  Upload,
  Save,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Phone,
  FileCheck,
  Building,
  Check,
  X,
  ExternalLink,
  Eye,
  Trash2,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  Video,
  Share2,
  MapPin,
} from 'lucide-react';
import {
  UnitRWProfile,
  KelurahanName,
  BiodataPengurus,
  JenisKelamin,
  JabatanKSB,
} from '../types';
import { MAP_WILAYAH_TAMBORA, DAFTAR_KELURAHAN_TAMBORA } from '../data/wilayah';
import { getOrCreateUKKT, updateUKKT } from '../services/storage';
import { MembershipCard } from './MembershipCard';

interface DataUnitRWViewProps {
  currentKelurahan: KelurahanName;
  currentRw: string;
  onFilterChange: (kel: KelurahanName, rw: string) => void;
}

export const DataUnitRWView: React.FC<DataUnitRWViewProps> = ({
  currentKelurahan,
  currentRw,
  onFilterChange,
}) => {
  const [activeTab, setActiveTab] = useState<'profil-unit' | 'ksb'>('profil-unit');
  const [selectedKsbRole, setSelectedKsbRole] = useState<'ketua' | 'sekretaris' | 'bendahara'>(
    'ketua'
  );

  // Active unit data state
  const [unit, setUnit] = useState<UnitRWProfile>(() =>
    getOrCreateUKKT(currentKelurahan, currentRw)
  );

  // Modal E-KTA state
  const [ktaMember, setKtaMember] = useState<BiodataPengurus | null>(null);
  const [previewKtpModalUrl, setPreviewKtpModalUrl] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Reload unit when props change
  useEffect(() => {
    const loaded = getOrCreateUKKT(currentKelurahan, currentRw);
    setUnit(loaded);
  }, [currentKelurahan, currentRw]);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Helper to update unit fields
  const handleUnitChange = (field: keyof UnitRWProfile, val: any) => {
    setUnit((prev) => ({ ...prev, [field]: val }));
  };

  // Helper to get or init KSB data
  const getKsbData = (role: 'ketua' | 'sekretaris' | 'bendahara'): BiodataPengurus => {
    return (
      unit.pengurus[role] || {
        id: `P-${currentKelurahan}-${currentRw}-${role}`,
        namaLengkap: role === 'ketua' ? unit.namaKetua || '' : '',
        nik: '',
        jenisKelamin: 'Laki-laki',
        tempatLahir: 'Jakarta',
        tanggalLahir: '1998-01-01',
        jabatan: role === 'ketua' ? 'Ketua' : role === 'sekretaris' ? 'Sekretaris' : 'Bendahara',
        noWhatsapp: '',
        pekerjaan: '',
        alamat: unit.alamatSekretariat || '',
      }
    );
  };

  const handleKsbChange = (
    role: 'ketua' | 'sekretaris' | 'bendahara',
    field: keyof BiodataPengurus,
    val: any
  ) => {
    const current = getKsbData(role);
    const updated = { ...current, [field]: val };
    const updatedPengurus = { ...unit.pengurus, [role]: updated };

    // Jika yang diubah adalah nama ketua, sinkronkan juga namaKetua unit
    let updatedUnit = { ...unit, pengurus: updatedPengurus };
    if (role === 'ketua' && field === 'namaLengkap') {
      updatedUnit.namaKetua = val;
    }

    setUnit(updatedUnit);
  };

  // File Upload Handlers
  const handleFileUpload = (
    field: 'dokumenSkUrl' | 'dokumenNpwpUrl',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUnitChange(field, reader.result as string);
        showNotify(`Dokumen ${field === 'dokumenSkUrl' ? 'SK' : 'NPWP'} berhasil diupload!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFotoKsbUpload = (
    role: 'ketua' | 'sekretaris' | 'bendahara',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleKsbChange(role, 'fotoUrl', reader.result as string);
        showNotify(`Foto profil ${role} berhasil diperbarui!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKtpKsbUpload = (
    role: 'ketua' | 'sekretaris' | 'bendahara',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleKsbChange(role, 'fotoKtpUrl', reader.result as string);
        showNotify(`Foto KTP ${role.toUpperCase()} berhasil diupload!`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simpan seluruh data unit
  const handleSaveAll = () => {
    updateUKKT(unit);
    showNotify(
      `Data UKKT RW ${unit.nomorRw} Kel. ${unit.kelurahan} berhasil disimpan ke database!`
    );
  };

  // Available RWs in selected Kelurahan
  const rwList = MAP_WILAYAH_TAMBORA[currentKelurahan] || ['001'];

  // Current active KSB for form
  const currentOfficer = getKsbData(selectedKsbRole);

  // Validate NIK
  const isNikValid = currentOfficer.nik.length === 16 && /^\d+$/.test(currentOfficer.nik);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle size={20} />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      {/* Top Selector Panel: Pilih Kelurahan & RW */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-black uppercase">
                DATABASE 96 UKKT
              </span>
              <span className="text-xs text-slate-500 font-medium">Kecamatan Tambora</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Manajemen Unit Kerja RW & Biodata Pengurus KSB
            </h1>
          </div>

          {/* Kelurahan & RW Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">
                Pilih Kelurahan
              </label>
              <select
                value={currentKelurahan}
                onChange={(e) => {
                  const kel = e.target.value as KelurahanName;
                  const firstRw = MAP_WILAYAH_TAMBORA[kel][0];
                  onFilterChange(kel, firstRw);
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-blue-500"
              >
                {DAFTAR_KELURAHAN_TAMBORA.map((kel) => (
                  <option key={kel} value={kel}>
                    Kel. {kel} ({MAP_WILAYAH_TAMBORA[kel].length} RW)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">
                Pilih Unit RW
              </label>
              <select
                value={currentRw}
                onChange={(e) => onFilterChange(currentKelurahan, e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-blue-500"
              >
                {rwList.map((rw) => (
                  <option key={rw} value={rw}>
                    RW {rw}
                  </option>
                ))}
              </select>
            </div>

            <div className="self-end">
              <button
                onClick={handleSaveAll}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Save size={15} />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Header Info Unit Badge & SubTabs */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-5 rounded-3xl text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center font-black shadow-inner">
            <span className="text-[10px] text-sky-200 tracking-wider">UNIT</span>
            <span className="text-xl font-mono text-amber-300">RW {currentRw}</span>
          </div>

          <div>
            <div className="text-xs font-bold text-sky-200 uppercase tracking-wider">
              Karang Taruna Kecamatan Tambora
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              UKKT RW {currentRw} KELURAHAN {currentKelurahan}
            </h2>
            <div className="text-xs text-blue-100 mt-0.5 flex flex-wrap gap-x-3">
              <span>Ketua: <strong>{unit.namaKetua || 'Belum diisi'}</strong></span>
              <span>•</span>
              <span>SK: <strong>{unit.nomorSk || 'Belum ada SK'}</strong></span>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-black/20 p-1.5 rounded-2xl border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('profil-unit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profil-unit'
                ? 'bg-white text-blue-950 shadow-md'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            1. Profil & Legalitas Unit RW
          </button>
          <button
            onClick={() => setActiveTab('ksb')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ksb'
                ? 'bg-white text-blue-950 shadow-md'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            2. Biodata Pengurus KSB (3 Orang)
          </button>
        </div>
      </div>

      {/* TAB 1: PROFIL UNIT RW */}
      {activeTab === 'profil-unit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Legalitas SK & Sekretariat */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Shield className="text-red-500" size={20} />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Legalitas & Sekretariat Unit RW
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Alamat Sekretariat Unit RW
                </label>
                <textarea
                  rows={2}
                  value={unit.alamatSekretariat}
                  onChange={(e) => handleUnitChange('alamatSekretariat', e.target.value)}
                  placeholder="Contoh: Balai Warga RW 001, Jl. Tubagus Angke..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Nama Ketua UKKT RW
                </label>
                <input
                  type="text"
                  value={unit.namaKetua}
                  onChange={(e) => {
                    handleUnitChange('namaKetua', e.target.value);
                    handleKsbChange('ketua', 'namaLengkap', e.target.value);
                  }}
                  placeholder="Masukkan nama lengkap ketua..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Nomor SK Penetapan
                  </label>
                  <input
                    type="text"
                    value={unit.nomorSk}
                    onChange={(e) => handleUnitChange('nomorSk', e.target.value)}
                    placeholder="Contoh: 04/SK-KT/PKJ/VIII/2024"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Tanggal Terbit SK
                  </label>
                  <input
                    type="date"
                    value={unit.tanggalSk}
                    onChange={(e) => handleUnitChange('tanggalSk', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Mulai Periode Masa Bakti
                  </label>
                  <input
                    type="date"
                    value={unit.periodeMulai}
                    onChange={(e) => handleUnitChange('periodeMulai', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Sampai Periode (Akhir Jabatan)
                  </label>
                  <input
                    type="date"
                    value={unit.periodeSelesai}
                    onChange={(e) => handleUnitChange('periodeSelesai', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card Perbankan & Upload Dokumen SK / NPWP */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Landmark className="text-blue-600" size={20} />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Rekening Bank Jakarta (DKI) & Berkas
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Nomor Rekening Bank Jakarta / Bank DKI
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={unit.nomorRekeningBank}
                    onChange={(e) => handleUnitChange('nomorRekeningBank', e.target.value)}
                    placeholder="Contoh: 503-21-00912-8 (Bank DKI Tambora)"
                    className="w-full p-2.5 pl-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs font-bold focus:ring-2 focus:ring-blue-500"
                  />
                  <Landmark size={15} className="absolute left-3 top-3 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  * Rekening resmi atas nama Karang Taruna untuk penerimaan Dana Stimulan.
                </p>
              </div>

              {/* Upload SK Dokumen */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <FileCheck size={16} className="text-red-500" />
                    <span>Upload Dokumen SK (PDF / Foto)</span>
                  </div>
                  {unit.dokumenSkUrl && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Terunggah
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5">
                    <Upload size={14} />
                    <span>Pilih Berkas SK</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload('dokumenSkUrl', e)}
                    />
                  </label>
                  {unit.dokumenSkUrl && (
                    <a
                      href={unit.dokumenSkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-blue-600 underline flex items-center gap-1"
                    >
                      Lihat Berkas <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>

              {/* Upload NPWP */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Building size={16} className="text-amber-500" />
                    <span>Upload NPWP Karang Taruna Unit</span>
                  </div>
                  {unit.dokumenNpwpUrl && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <Check size={12} /> Terunggah
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5">
                    <Upload size={14} />
                    <span>Pilih Berkas NPWP</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload('dokumenNpwpUrl', e)}
                    />
                  </label>
                  {unit.dokumenNpwpUrl && (
                    <a
                      href={unit.dokumenNpwpUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-blue-600 underline flex items-center gap-1"
                    >
                      Lihat NPWP <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveAll}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                >
                  SIMPAN PROFIL LEGALITAS UNIT RW
                </button>
              </div>
            </div>
          </div>

          {/* Card Kontak Digital, Media Sosial & Lokasi Google Maps */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="text-pink-600" size={20} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Kontak Digital, Media Sosial & Google Maps Sekretariat
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Digunakan untuk identitas publik dan dibagikan otomatis saat kegiatan diinput
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* email */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Email Resmi Unit RW
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={unit.email || ''}
                    onChange={(e) => handleUnitChange('email', e.target.value)}
                    placeholder="katar.rw01.pekojan@gmail.com"
                    className="w-full p-2.5 pl-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  />
                  <Mail size={14} className="absolute left-2.5 top-3 text-slate-400" />
                </div>
              </div>

              {/* facebook */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Facebook Page / Akun
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={unit.facebook || ''}
                    onChange={(e) => handleUnitChange('facebook', e.target.value)}
                    placeholder="facebook.com/katar.rw01pekojan"
                    className="w-full p-2.5 pl-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  />
                  <Facebook size={14} className="absolute left-2.5 top-3 text-blue-600" />
                </div>
              </div>

              {/* instagram */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Instagram
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={unit.instagram || ''}
                    onChange={(e) => handleUnitChange('instagram', e.target.value)}
                    placeholder="@katar_pekojan01"
                    className="w-full p-2.5 pl-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  />
                  <Instagram size={14} className="absolute left-2.5 top-3 text-pink-500" />
                </div>
              </div>

              {/* youtube */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  YouTube Channel
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={unit.youtube || ''}
                    onChange={(e) => handleUnitChange('youtube', e.target.value)}
                    placeholder="youtube.com/@katarpekojan01"
                    className="w-full p-2.5 pl-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  />
                  <Youtube size={14} className="absolute left-2.5 top-3 text-red-600" />
                </div>
              </div>

              {/* tiktok */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  TikTok
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={unit.tiktok || ''}
                    onChange={(e) => handleUnitChange('tiktok', e.target.value)}
                    placeholder="@katarpekojan01"
                    className="w-full p-2.5 pl-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  />
                  <Video size={14} className="absolute left-2.5 top-3 text-slate-700 dark:text-slate-300" />
                </div>
              </div>

              {/* maps */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Google Maps Sekretariat / Balai Warga
                </label>
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={unit.maps || ''}
                      onChange={(e) => handleUnitChange('maps', e.target.value)}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full p-2.5 pl-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 truncate"
                    />
                    <MapPin size={14} className="absolute left-2.5 top-3 text-red-500" />
                  </div>
                  {unit.maps && (
                    <a
                      href={unit.maps.startsWith('http') ? unit.maps : `https://${unit.maps}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center shrink-0 font-bold"
                      title="Buka Google Maps"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveAll}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Save size={15} />
                <span>Simpan Media Sosial & Lokasi Unit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BIODATA PENGURUS KSB */}
      {activeTab === 'ksb' && (
        <div className="space-y-6">
          {/* Sub Switcher KSB: Ketua, Sekretaris, Bendahara */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['ketua', 'sekretaris', 'bendahara'] as const).map((role) => {
              const data = getKsbData(role);
              const isActive = selectedKsbRole === role;
              return (
                <div
                  key={role}
                  onClick={() => setSelectedKsbRole(role)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 shadow-md ring-2 ring-blue-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        role === 'ketua'
                          ? 'bg-red-100 text-red-700'
                          : role === 'sekretaris'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {role.toUpperCase()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setKtaMember(data);
                      }}
                      className="text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <CreditCard size={12} /> E-KTA
                    </button>
                  </div>

                  <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                    {data.namaLengkap || `(Nama ${role} belum diisi)`}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    NIK: {data.nik || '-'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span
                      className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        data.fotoKtpUrl
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {data.fotoKtpUrl ? '✓ KTP Ada' : 'Belum KTP'}
                    </span>
                    <span
                      className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        data.fotoUrl
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {data.fotoUrl ? '✓ Pas Foto' : 'Belum Foto'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form Biodata Lengkap Pengurus Sesuai Permintaan User */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  <span>
                    Biodata {selectedKsbRole.toUpperCase()} UKKT RW {currentRw}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Data ini akan otomatis tercantum pada Surat Mandat, LPJ Dana Stimulan, dan Kartu Anggota Digital.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setKtaMember(currentOfficer)}
                  className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CreditCard size={14} />
                  <span>Pratinjau E-KTA Digital</span>
                </button>
              </div>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Nama Lengkap */}
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Nama Lengkap (Sesuai KTP) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentOfficer.namaLengkap}
                  onChange={(e) =>
                    handleKsbChange(selectedKsbRole, 'namaLengkap', e.target.value)
                  }
                  placeholder="Contoh: Rifki Al-Farisi"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* NIK 16 Digit dengan Validasi Otomatis */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">
                    NIK (Harus Angka 16 Digit) <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                      isNikValid
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {currentOfficer.nik.length}/16 Digit
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={16}
                  value={currentOfficer.nik}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, '');
                    handleKsbChange(selectedKsbRole, 'nik', onlyNums);
                  }}
                  placeholder="3173xxxxxxxxxxxx"
                  className={`w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-xs font-bold focus:ring-2 ${
                    isNikValid
                      ? 'border-emerald-500 focus:ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                  }`}
                />
                {!isNikValid && currentOfficer.nik.length > 0 && (
                  <p className="text-[10px] text-amber-600 mt-1">
                    NIK harus tepat 16 digit angka kependudukan DKI.
                  </p>
                )}
              </div>

              {/* Jenis Kelamin Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Jenis Kelamin (Dropdown) <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentOfficer.jenisKelamin}
                  onChange={(e) =>
                    handleKsbChange(
                      selectedKsbRole,
                      'jenisKelamin',
                      e.target.value as JenisKelamin
                    )
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              {/* Tempat Lahir */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  value={currentOfficer.tempatLahir}
                  onChange={(e) =>
                    handleKsbChange(selectedKsbRole, 'tempatLahir', e.target.value)
                  }
                  placeholder="Contoh: Jakarta"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tanggal Lahir (date) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Tanggal Lahir (Date) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={currentOfficer.tanggalLahir}
                  onChange={(e) =>
                    handleKsbChange(selectedKsbRole, 'tanggalLahir', e.target.value)
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Jabatan Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Jabatan Organisasi <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentOfficer.jabatan}
                  onChange={(e) =>
                    handleKsbChange(
                      selectedKsbRole,
                      'jabatan',
                      e.target.value as JabatanKSB
                    )
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-blue-600 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Ketua">Ketua</option>
                  <option value="Sekretaris">Sekretaris</option>
                  <option value="Bendahara">Bendahara</option>
                </select>
              </div>

              {/* No WhatsApp */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  No. WhatsApp Aktif <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
                    +62
                  </span>
                  <input
                    type="text"
                    value={currentOfficer.noWhatsapp.replace(/^(\+62|62|0)/, '')}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '');
                      handleKsbChange(selectedKsbRole, 'noWhatsapp', `0${clean}`);
                    }}
                    placeholder="81288990011"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-r-xl font-mono text-xs font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Pas Foto Upload */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Upload Pas Foto E-KTA (2x3)
                </label>
                <div className="flex items-center gap-3">
                  {currentOfficer.fotoUrl ? (
                    <img
                      src={currentOfficer.fotoUrl}
                      alt="Pas Foto"
                      className="w-10 h-12 object-cover rounded-lg border border-slate-300"
                    />
                  ) : (
                    <div className="w-10 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[8px] text-slate-400">
                      Foto
                    </div>
                  )}
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 border border-slate-300 dark:border-slate-700">
                    <Upload size={13} />
                    <span>Pilih Foto</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFotoKsbUpload(selectedKsbRole, e)}
                    />
                  </label>
                </div>
              </div>

              {/* Upload KTP Masing-Masing Pengurus KSB */}
              <div className="md:col-span-2 lg:col-span-3 p-4 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard size={18} className="text-blue-600" />
                    <span>
                      Upload KTP Asli {selectedKsbRole.toUpperCase()} ({currentOfficer.namaLengkap || 'Pengurus'})
                    </span>
                  </div>
                  {currentOfficer.fotoKtpUrl ? (
                    <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                      <Check size={13} /> Dokumen KTP Terunggah
                    </span>
                  ) : (
                    <span className="text-[10.5px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                      <AlertCircle size={13} /> Wajib Unggah KTP untuk Verifikasi
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {currentOfficer.fotoKtpUrl ? (
                    <div className="relative group">
                      <img
                        src={currentOfficer.fotoKtpUrl}
                        alt={`KTP ${selectedKsbRole}`}
                        className="w-36 h-24 object-cover rounded-xl border-2 border-blue-300 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setPreviewKtpModalUrl(currentOfficer.fotoKtpUrl || null)}
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewKtpModalUrl(currentOfficer.fotoKtpUrl || null)}
                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center gap-1 text-[11px] font-bold transition-opacity cursor-pointer"
                      >
                        <Eye size={15} /> Lihat Ukuran Penuh
                      </button>
                    </div>
                  ) : (
                    <div className="w-36 h-24 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-[10.5px] text-slate-400 gap-1.5 p-2 text-center">
                      <CreditCard size={24} className="text-slate-400" />
                      <span>Belum Upload KTP</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs">
                      <Upload size={14} />
                      <span>{currentOfficer.fotoKtpUrl ? 'Ganti Foto KTP' : 'Pilih Foto KTP'}</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleKtpKsbUpload(selectedKsbRole, e)}
                      />
                    </label>

                    {currentOfficer.fotoKtpUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          handleKsbChange(selectedKsbRole, 'fotoKtpUrl', undefined);
                          showNotify(`Foto KTP ${selectedKsbRole.toUpperCase()} berhasil dihapus.`);
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Hapus Berkas KTP</span>
                      </button>
                    )}
                    <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                      Format file: PNG, JPG, JPEG. Pastikan NIK dan nama di foto KTP terbaca jelas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bottom */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500">
                Unit Kerja: <strong>RW {currentRw}</strong> Kelurahan <strong>{currentKelurahan}</strong>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleSaveAll}
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save size={16} />
                  <span>SIMPAN BIODATA PENGURUS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW FOTO KTP FULL SIZE */}
      {previewKtpModalUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-lg w-full shadow-2xl relative border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setPreviewKtpModalUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="mb-3">
              <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                DOKUMEN IDENTITAS
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                KTP Asli {selectedKsbRole.toUpperCase()} UKKT RW {currentRw}
              </h3>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-2">
              <img
                src={previewKtpModalUrl}
                alt="KTP Full Size"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setPreviewKtpModalUrl(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW E-KTA DIGITAL */}
      {ktaMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setKtaMember(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                E-KTA RESMI TAMBORA
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                Kartu Tanda Anggota Digital
              </h3>
            </div>

            <MembershipCard
              member={ktaMember}
              kelurahan={currentKelurahan}
              nomorRw={currentRw}
              periodeSelesai={unit.periodeSelesai}
              onClose={() => setKtaMember(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
