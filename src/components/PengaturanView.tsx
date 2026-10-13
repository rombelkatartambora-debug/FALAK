import React, { useState } from 'react';
import {
  Settings,
  Save,
  Shield,
  UserCheck,
  Building,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle,
  Image as ImageIcon,
  Sliders,
  Check,
} from 'lucide-react';
import { DataOrganisasi } from '../types';
import { getOrganisasi, saveOrganisasi } from '../services/storage';
import {
  OFFICIAL_LOGO_NASIONAL,
  OFFICIAL_LOGO_DKI,
  getActiveLogoNasional,
  getActiveLogoDki,
  saveCustomLogoNasional,
  saveCustomLogoDki,
  deleteCustomLogoNasional,
  deleteCustomLogoDki,
  isCustomLogoNasionalActive,
  isCustomLogoDkiActive,
} from '../data/logos';
import { KopSuratView } from './KopSuratView';

interface PengaturanViewProps {
  onRefresh: () => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({ onRefresh }) => {
  const [org, setOrg] = useState<DataOrganisasi>(() => getOrganisasi());
  const [notification, setNotification] = useState<string | null>(null);

  const handleChange = (field: keyof DataOrganisasi, val: any) => {
    setOrg((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = () => {
    saveOrganisasi(org);
    onRefresh();
    setNotification('Data organisasi, pejabat, dan kop surat berhasil disimpan!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUploadLogoKiri = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        saveCustomLogoNasional(base64);
        setOrg((prev) => {
          const updated = { ...prev, logoKiriUrl: base64 };
          saveOrganisasi(updated);
          return updated;
        });
        onRefresh();
        setNotification('Logo Karang Taruna (Kiri) berhasil diunggah & disimpan!');
        setTimeout(() => setNotification(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadLogoKanan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        saveCustomLogoDki(base64);
        setOrg((prev) => {
          const updated = { ...prev, logoKananUrl: base64 };
          saveOrganisasi(updated);
          return updated;
        });
        onRefresh();
        setNotification('Logo DKI Jakarta (Kanan) berhasil diunggah & disimpan!');
        setTimeout(() => setNotification(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetKiri = () => {
    deleteCustomLogoNasional();
    setOrg((prev) => {
      const c = { ...prev, logoKiriUrl: OFFICIAL_LOGO_NASIONAL };
      saveOrganisasi(c);
      return c;
    });
    onRefresh();
    setNotification('Logo Karang Taruna dikembalikan ke Standar Resmi.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleResetKanan = () => {
    deleteCustomLogoDki();
    setOrg((prev) => {
      const c = { ...prev, logoKananUrl: OFFICIAL_LOGO_DKI };
      saveOrganisasi(c);
      return c;
    });
    onRefresh();
    setNotification('Logo Karang Taruna Jaya Raya dikembalikan ke Standar Resmi.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportBackup = () => {
    const backupData = {
      org,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_Data_Karang_Taruna_Tambora_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle size={20} />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-black uppercase">
              KONFIGURASI SISTEM
            </span>
            <span className="text-xs text-slate-500 font-medium">Data Organisasi & Pejabat Dinas</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
            Pengaturan Profil & Pejabat Penandatangan
          </h1>
          <p className="text-xs text-slate-500">
            Nama pejabat ini akan otomatis terisi pada seluruh dokumen LPJ, SPTJM, Tanda Terima, dan Surat Dinas.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Save size={16} />
          <span>Simpan Perubahan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pejabat Suku Dinas Sosial Jakarta Barat */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Shield className="text-red-600" size={20} />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Pejabat Suku Dinas Sosial Jakarta Barat
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Kepala Suku Dinas Sosial Kota Adm. Jakarta Barat
              </label>
              <input
                type="text"
                value={org.kasudinSosial}
                onChange={(e) => handleChange('kasudinSosial', e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                NIP Kepala Suku Dinas Sosial
              </label>
              <input
                type="text"
                value={org.nipKasudinSosial}
                onChange={(e) => handleChange('nipKasudinSosial', e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-xs"
              />
            </div>

            <div className="pt-2 border-t">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Bendahara Pengeluaran Suku Dinas Sosial
              </label>
              <input
                type="text"
                value={org.bendaharaSudin}
                onChange={(e) => handleChange('bendaharaSudin', e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                NIP Bendahara Pengeluaran Sudin
              </label>
              <input
                type="text"
                value={org.nipBendaharaSudin}
                onChange={(e) => handleChange('nipBendaharaSudin', e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Pejabat Karang Taruna Kecamatan Tambora */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building className="text-blue-600" size={20} />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Pengurus Kecamatan Tambora
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Nama Ketua Karang Taruna Kecamatan Tambora
              </label>
              <input
                type="text"
                value={org.namaKetuaKecamatan}
                onChange={(e) => handleChange('namaKetuaKecamatan', e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                NIK Ketua Kecamatan
              </label>
              <input
                type="text"
                value={org.nikKetuaKecamatan}
                onChange={(e) => handleChange('nikKetuaKecamatan', e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Nama Sekretaris Kecamatan
              </label>
              <input
                type="text"
                value={org.namaSekretarisKecamatan}
                onChange={(e) => handleChange('namaSekretarisKecamatan', e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Camat Tambora
              </label>
              <input
                type="text"
                value={org.namaCamat}
                onChange={(e) => handleChange('namaCamat', e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Konfigurasi Kop Surat & Unggah Logo Resmi */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="text-amber-500" size={22} />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Konfigurasi Kop Surat & Unggah Logo Resmi
              </h3>
              <p className="text-xs text-slate-500">
                Ubah logo Karang Taruna, logo DKI Jakarta, dan sesuaikan teks naskah dinas resmi.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Logo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Logo Kiri (Karang Taruna) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase text-slate-800 dark:text-slate-200">
                1. Logo Kiri (Karang Taruna)
              </span>
              {isCustomLogoNasionalActive() || org.logoKiriUrl ? (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Logo Kustom Aktif
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  Belum Diunggah
                </span>
              )}
            </div>

            <div className="flex items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[120px]">
              {(org.logoKiriUrl || getActiveLogoNasional()) ? (
                <img
                  src={org.logoKiriUrl || getActiveLogoNasional()}
                  alt="Logo Karang Taruna"
                  className="w-20 h-20 object-contain"
                />
              ) : (
                <div className="text-center text-xs text-slate-400 italic flex flex-col items-center gap-1.5">
                  <Upload size={22} className="text-slate-300 dark:text-slate-600" />
                  <span>Logo Karang Taruna Belum Diunggah</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs">
                <Upload size={14} />
                <span>{(org.logoKiriUrl || getActiveLogoNasional()) ? 'Ganti File Logo Karang Taruna' : 'Unggah Logo Karang Taruna (PNG/JPG)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLogoKiri}
                  className="hidden"
                />
              </label>

              {(isCustomLogoNasionalActive() || org.logoKiriUrl) && (
                <button
                  onClick={handleResetKiri}
                  type="button"
                  className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-300 py-1.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Hapus Logo Karang Taruna</span>
                </button>
              )}
            </div>
          </div>

          {/* Logo Kanan (DKI / Jaya Raya) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase text-slate-800 dark:text-slate-200">
                2. Logo Kanan (Karang Taruna Jaya Raya DKI Jakarta)
              </span>
              {isCustomLogoDkiActive() || org.logoKananUrl ? (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Logo Kustom Aktif
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  Belum Diunggah
                </span>
              )}
            </div>

            <div className="flex items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[120px]">
              {org.tampilkanLogoKanan !== false ? (
                (org.logoKananUrl || getActiveLogoDki()) ? (
                  <img
                    src={org.logoKananUrl || getActiveLogoDki()}
                    alt="Logo Karang Taruna Jaya Raya"
                    className="w-20 h-20 object-contain"
                  />
                ) : (
                  <div className="text-center text-xs text-slate-400 italic flex flex-col items-center gap-1.5">
                    <Upload size={22} className="text-slate-300 dark:text-slate-600" />
                    <span>Logo Jaya Raya Belum Diunggah</span>
                  </div>
                )
              ) : (
                <div className="text-center text-xs text-slate-400 italic">
                  Logo Kanan Dinonaktifkan
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs">
                <Upload size={14} />
                <span>{(org.logoKananUrl || getActiveLogoDki()) ? 'Ganti File Logo Jaya Raya' : 'Unggah Logo Kanan (PNG/JPG)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLogoKanan}
                  className="hidden"
                />
              </label>

              {(isCustomLogoDkiActive() || org.logoKananUrl) && (
                <button
                  onClick={handleResetKanan}
                  type="button"
                  className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-300 py-1.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Hapus Logo Jaya Raya</span>
                </button>
              )}

              <div className="flex items-center justify-between pt-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={org.tampilkanLogoKanan !== false}
                    onChange={(e) => handleChange('tampilkanLogoKanan', e.target.checked)}
                    className="rounded text-blue-600 w-4 h-4"
                  />
                  <span>Tampilkan Logo Kanan</span>
                </label>

                {(isCustomLogoDkiActive() || org.logoKananUrl) && (
                  <button
                    onClick={handleResetKanan}
                    type="button"
                    className="text-[11px] text-slate-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Teks Kop Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Baris 1: Judul Utama Kop
            </label>
            <input
              type="text"
              value={org.judulKopBaris1 || 'PENGURUS KARANG TARUNA'}
              onChange={(e) => handleChange('judulKopBaris1', e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Baris 3: Kecamatan & Wilayah
            </label>
            <input
              type="text"
              value={org.judulKopBaris3 || 'KECAMATAN TAMBORA KOTA ADMINISTRASI JAKARTA BARAT'}
              onChange={(e) => handleChange('judulKopBaris3', e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Alamat Lengkap Sekretariat Kop
            </label>
            <input
              type="text"
              value={org.alamatKopSekretariat || org.alamat}
              onChange={(e) => handleChange('alamatKopSekretariat', e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Kontak Kop Surat (Telp/WA/Email)
            </label>
            <input
              type="text"
              value={org.kontakKop || `Telepon/WA: ${org.telepon} | Email: ${org.email}`}
              onChange={(e) => handleChange('kontakKop', e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Warna Teks Judul Unit (Baris 2)
            </label>
            <select
              value={org.warnaJudulKop || 'hitam'}
              onChange={(e) => handleChange('warnaJudulKop', e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
            >
              <option value="hitam">Hitam Resmi (Standar Tata Naskah Dinas)</option>
              <option value="merah">Merah Karang Taruna</option>
              <option value="biru">Biru Karang Taruna</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Ukuran Logo Kop
            </label>
            <select
              value={org.ukuranLogoKop || 'sedang'}
              onChange={(e) => handleChange('ukuranLogoKop', e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
            >
              <option value="kecil">Kecil (65px)</option>
              <option value="sedang">Sedang (78px - Standar Resmi)</option>
              <option value="besar">Besar (90px)</option>
            </select>
          </div>
        </div>

        {/* Live Preview Kop Surat di Pengaturan */}
        <div className="pt-3 border-t">
          <span className="block text-xs font-bold text-slate-500 uppercase mb-2">
            Pratinjau Hasil Kop Surat Terkini:
          </span>
          <div className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-slate-300 shadow-sm overflow-x-auto text-black">
            <div className="min-w-[550px]">
              <KopSuratView
                tingkat="Unit RW"
                kelurahan="PEKOJAN"
                nomorRw="001"
                org={org}
                showEditButton={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Backup and Data Tools */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            Cadangan & Pemulihan Data
          </h4>
          <p className="text-xs text-slate-500">
            Ekspor seluruh konfigurasi data pengurus dan pengaturan ke file JSON.
          </p>
        </div>

        <button
          onClick={handleExportBackup}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
        >
          <Download size={15} />
          <span>Unduh Backup JSON</span>
        </button>
      </div>
    </div>
  );
};
