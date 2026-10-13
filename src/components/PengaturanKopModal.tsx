import React, { useState } from 'react';
import {
  X,
  Upload,
  RefreshCw,
  Trash2,
  Check,
  CheckCircle,
  AlertCircle,
  Shield,
  Settings,
  Eye,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';
import { DataOrganisasi, TingkatOrganisasi, KelurahanName } from '../types';
import {
  OFFICIAL_LOGO_NASIONAL,
  OFFICIAL_LOGO_DKI,
  getActiveLogoNasional,
  getActiveLogoDki,
  saveCustomLogoNasional,
  saveCustomLogoDki,
  deleteCustomLogoNasional,
  deleteCustomLogoDki,
  resetCustomLogoNasional,
  resetCustomLogoDki,
  isCustomLogoNasionalActive,
  isCustomLogoDkiActive,
  SVG_LOGO_KATAR_NASIONAL,
  SVG_LOGO_KATAR_DKI,
} from '../data/logos';
import { KopSuratView } from './KopSuratView';

interface PengaturanKopModalProps {
  isOpen: boolean;
  onClose: () => void;
  org: DataOrganisasi;
  onSaveOrg: (updated: DataOrganisasi) => void;
  currentTingkat?: TingkatOrganisasi;
  currentKelurahan?: KelurahanName | string;
  currentRw?: string;
}

export const PengaturanKopModal: React.FC<PengaturanKopModalProps> = ({
  isOpen,
  onClose,
  org,
  onSaveOrg,
  currentTingkat = 'Unit RW',
  currentKelurahan = 'PEKOJAN',
  currentRw = '001',
}) => {
  if (!isOpen) return null;

  // Local state for copy of org settings
  const [formData, setFormData] = useState<DataOrganisasi>({
    ...org,
    judulKopBaris1: org.judulKopBaris1 || 'PENGURUS KARANG TARUNA',
    judulKopBaris3:
      org.judulKopBaris3 ||
      (currentTingkat === 'Unit RW'
        ? `KELURAHAN ${currentKelurahan} - KECAMATAN TAMBORA`
        : 'KECAMATAN TAMBORA'),
    judulKopBaris4: org.judulKopBaris4 || 'KOTA ADMINISTRASI JAKARTA BARAT',
    alamatKopSekretariat:
      org.alamatKopSekretariat ||
      (currentTingkat === 'Unit RW'
        ? `Sekretariat: Balai Warga RW ${currentRw}, Kelurahan ${currentKelurahan}, Kecamatan Tambora, Jakarta Barat 11240`
        : org.alamat),
    kontakKop:
      org.kontakKop ||
      `Telepon/WA: ${org.telepon || '0812-8877-6655'} | Email: ${org.email || 'katar.kec.tambora@gmail.com'}`,
    warnaJudulKop: org.warnaJudulKop || 'hitam',
    ukuranLogoKop: org.ukuranLogoKop || 'sedang',
    tampilkanLogoKanan: org.tampilkanLogoKanan !== false,
  });

  const [activeTab, setActiveTab] = useState<'logo' | 'teks' | 'tampilan'>('logo');
  const [notif, setNotif] = useState<string | null>(null);

  const showNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  };

  // Upload handler for Logo Kiri (Karang Taruna)
  const handleUploadLogoKiri = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Harap pilih file gambar (PNG, JPG, JPEG, SVG, WebP)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        saveCustomLogoNasional(base64);
        setFormData((prev) => ({ ...prev, logoKiriUrl: base64 }));
        showNotif('Logo Karang Taruna (Kiri) berhasil diunggah & diperbarui!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload handler for Logo Kanan (DKI / Instansi)
  const handleUploadLogoKanan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Harap pilih file gambar (PNG, JPG, JPEG, SVG, WebP)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        saveCustomLogoDki(base64);
        setFormData((prev) => ({ ...prev, logoKananUrl: base64 }));
        showNotif('Logo DKI Jakarta (Kanan) berhasil diunggah & diperbarui!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset ke Logo Standar Resmi Karang Taruna
  const handleResetLogoKiri = () => {
    deleteCustomLogoNasional();
    setFormData((prev) => ({
      ...prev,
      logoKiriUrl: OFFICIAL_LOGO_NASIONAL,
    }));
    showNotif('Logo Karang Taruna dikembalikan ke Standar Resmi.');
  };

  // Reset ke Logo Standar Resmi Jaya Raya DKI
  const handleResetLogoKanan = () => {
    deleteCustomLogoDki();
    setFormData((prev) => ({
      ...prev,
      logoKananUrl: OFFICIAL_LOGO_DKI,
    }));
    showNotif('Logo Karang Taruna Jaya Raya dikembalikan ke Standar Resmi.');
  };

  // Save changes
  const handleSave = () => {
    onSaveOrg(formData);
    onClose();
  };

  const isCustomKiri = !!formData.logoKiriUrl || isCustomLogoNasionalActive();
  const isCustomKanan = !!formData.logoKananUrl || isCustomLogoDkiActive();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <Settings className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-blue-950">
                  PENGATURAN KOP RESMI
                </span>
                <span className="text-xs text-blue-200">Format Naskah Dinas Karang Taruna</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                Kustomisasi Kop Surat & Unggah Logo
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notif toast inside modal */}
        {notif && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center gap-2 justify-center flex-shrink-0 animate-fadeIn">
            <CheckCircle size={16} />
            <span>{notif}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-5 pt-3 gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('logo')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'logo'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload size={14} />
            <span>Unggah Logo (Kiri & Kanan)</span>
            {(isCustomKiri || isCustomKanan) && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('teks')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'teks'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders size={14} />
            <span>Teks & Alamat Kop</span>
          </button>
          <button
            onClick={() => setActiveTab('tampilan')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'tampilan'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye size={14} />
            <span>Warna & Tata Letak</span>
          </button>
        </div>

        {/* Body Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: UPLOAD LOGO */}
          {activeTab === 'logo' && (
            <div className="space-y-6">
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900 flex items-start gap-3">
                <Info size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                  <strong>Panduan Logo Karang Taruna:</strong> Anda dapat mengunggah logo resmi dari file komputer Anda (PNG transparan disarankan, JPG, atau SVG). Logo yang diunggah akan <strong>otomatis langsung tampil</strong> pada Kop Surat, formulir LPJ, seluruh berkas cetak PDF, dan Kartu Anggota (E-KTA).
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Logo Kiri (Karang Taruna) */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs uppercase text-slate-800 dark:text-slate-200">
                        1. Logo Kiri (Karang Taruna)
                      </span>
                      {formData.logoKiriUrl || isCustomLogoNasionalActive() ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Logo Terpasang
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          Belum Diunggah
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[140px]">
                      {(formData.logoKiriUrl || getActiveLogoNasional()) ? (
                        <img
                          src={formData.logoKiriUrl || getActiveLogoNasional()}
                          alt="Logo Karang Taruna"
                          className="w-24 h-24 object-contain max-h-[100px]"
                        />
                      ) : (
                        <div className="text-center text-xs text-slate-400 italic flex flex-col items-center gap-1">
                          <Upload size={22} className="text-slate-300 dark:text-slate-600" />
                          <span>Logo Karang Taruna Belum Diunggah</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs">
                      <Upload size={14} />
                      <span>{(formData.logoKiriUrl || getActiveLogoNasional()) ? 'Ganti File Logo Karang Taruna' : 'Unggah Logo Karang Taruna'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadLogoKiri}
                        className="hidden"
                      />
                    </label>

                    {(formData.logoKiriUrl || isCustomLogoNasionalActive()) && (
                      <button
                        onClick={handleResetLogoKiri}
                        type="button"
                        className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-300 py-1.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trash2 size={12} />
                        <span>Hapus Logo Karang Taruna</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Logo Kanan (DKI Jakarta / Jaya Raya / Instansi) */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs uppercase text-slate-800 dark:text-slate-200">
                        2. Logo Kanan (Karang Taruna Jaya Raya DKI Jakarta)
                      </span>
                      {formData.logoKananUrl || isCustomLogoDkiActive() ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Logo Terpasang
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          Belum Diunggah
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[140px]">
                      {formData.tampilkanLogoKanan ? (
                        (formData.logoKananUrl || getActiveLogoDki()) ? (
                          <img
                            src={formData.logoKananUrl || getActiveLogoDki()}
                            alt="Logo Karang Taruna Jaya Raya"
                            className="w-24 h-24 object-contain max-h-[100px]"
                          />
                        ) : (
                          <div className="text-center text-xs text-slate-400 italic flex flex-col items-center gap-1">
                            <Upload size={22} className="text-slate-300 dark:text-slate-600" />
                            <span>Logo Jaya Raya Belum Diunggah</span>
                          </div>
                        )
                      ) : (
                        <div className="text-center text-xs text-slate-400 italic">
                          Logo Kanan dinonaktifkan (Hanya 1 logo kiri)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs">
                      <Upload size={14} />
                      <span>{(formData.logoKananUrl || getActiveLogoDki()) ? 'Ganti File Logo Jaya Raya' : 'Unggah Logo Jaya Raya'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadLogoKanan}
                        className="hidden"
                      />
                    </label>

                    {(formData.logoKananUrl || isCustomLogoDkiActive()) && (
                      <button
                        onClick={handleResetLogoKanan}
                        type="button"
                        className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-300 py-1.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trash2 size={12} />
                        <span>Hapus Logo Jaya Raya</span>
                      </button>
                    )}

                    <div className="flex items-center justify-between pt-1 px-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.tampilkanLogoKanan}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              tampilkanLogoKanan: e.target.checked,
                            }))
                          }
                          className="rounded text-blue-600 w-4 h-4"
                        />
                        <span>Tampilkan Logo Kanan</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEKS KOP SURAT */}
          {activeTab === 'teks' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Baris 1: Judul Utama
                  </label>
                  <input
                    type="text"
                    value={formData.judulKopBaris1}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, judulKopBaris1: e.target.value }))
                    }
                    placeholder="PENGURUS KARANG TARUNA"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Standar resmi: PENGURUS KARANG TARUNA
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Baris 2: Nama Unit (Opsional / Otomatis)
                  </label>
                  <input
                    type="text"
                    value={formData.judulKopBaris2 || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, judulKopBaris2: e.target.value }))
                    }
                    placeholder={`Otomatis: UNIT KERJA KARANG TARUNA (UKKT) RW. ${currentRw}`}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Kosongkan agar otomatis mengikuti pilihan RW / Kelurahan
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Baris 3: Kelurahan & Kecamatan
                  </label>
                  <input
                    type="text"
                    value={formData.judulKopBaris3}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, judulKopBaris3: e.target.value }))
                    }
                    placeholder={`KELURAHAN ${currentKelurahan} - KECAMATAN TAMBORA`}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Baris 4: Kota Administrasi
                  </label>
                  <input
                    type="text"
                    value={formData.judulKopBaris4}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, judulKopBaris4: e.target.value }))
                    }
                    placeholder="KOTA ADMINISTRASI JAKARTA BARAT"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t text-xs">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Alamat Sekretariat Lengkap
                  </label>
                  <textarea
                    rows={2}
                    value={formData.alamatKopSekretariat}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, alamatKopSekretariat: e.target.value }))
                    }
                    placeholder="Alamat lengkap balai sekretariat RW / Kelurahan..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                    Kontak & Komunikasi (Telepon, WA, Email, Web)
                  </label>
                  <input
                    type="text"
                    value={formData.kontakKop}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, kontakKop: e.target.value }))
                    }
                    placeholder="Telepon/WA: 0812-xxxx | Email: katar@gmail.com"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TAMPILAN & WARNA */}
          {activeTab === 'tampilan' && (
            <div className="space-y-5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                  Warna Teks Judul Unit (Baris 2):
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, warnaJudulKop: 'hitam' }))
                    }
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      formData.warnaJudulKop === 'hitam'
                        ? 'border-black bg-slate-100 font-black'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-black mx-auto mb-1.5 shadow-xs"></div>
                    <span>Hitam Resmi</span>
                    <span className="block text-[9.5px] text-slate-500 font-normal mt-0.5">
                      Standar Surat Dinas
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, warnaJudulKop: 'merah' }))
                    }
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      formData.warnaJudulKop === 'merah'
                        ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-700 font-black'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-red-600 mx-auto mb-1.5 shadow-xs"></div>
                    <span>Merah Karang Taruna</span>
                    <span className="block text-[9.5px] text-slate-500 font-normal mt-0.5">
                      Warna Identitas Organisasi
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, warnaJudulKop: 'biru' }))
                    }
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      formData.warnaJudulKop === 'biru'
                        ? 'border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 font-black'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-800 mx-auto mb-1.5 shadow-xs"></div>
                    <span>Biru Karang Taruna</span>
                    <span className="block text-[9.5px] text-slate-500 font-normal mt-0.5">
                      Warna Seragam Resmi
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                  Ukuran Logo Kop:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['kecil', 'sedang', 'besar'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, ukuranLogoKop: sz }))
                      }
                      className={`p-2.5 rounded-xl border text-center capitalize font-bold transition-all cursor-pointer ${
                        formData.ukuranLogoKop === sz
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-700'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      {sz === 'sedang' ? 'Sedang (78px - Standar)' : sz === 'kecil' ? 'Kecil (64px)' : 'Besar (92px)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LIVE PREVIEW BOX */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Eye size={13} />
                Pratinjau Langsung Kop Surat (Live Preview):
              </span>
              <span className="text-[10px] text-slate-400">
                Sesuai tampilan cetak kertas A4
              </span>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-slate-300 shadow-sm overflow-x-auto text-black">
              <div className="min-w-[600px]">
                <KopSuratView
                  tingkat={currentTingkat}
                  kelurahan={currentKelurahan}
                  nomorRw={currentRw}
                  org={formData}
                  showEditButton={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Check size={16} />
            <span>Simpan & Terapkan Kop Surat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
