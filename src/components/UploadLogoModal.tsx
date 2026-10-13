import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Trash2,
  CheckCircle2,
  FileImage,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  useLogos,
  saveCustomLogoNasional,
  saveCustomLogoDki,
  deleteCustomLogoNasional,
  deleteCustomLogoDki,
  deleteAllLogos,
} from '../data/logos';

interface UploadLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadLogoModal: React.FC<UploadLogoModalProps> = ({ isOpen, onClose }) => {
  const { logoNasional, logoDki, hasLogoNasional, hasLogoDki } = useLogos();

  const [previewNasional, setPreviewNasional] = useState<string | null>(null);
  const [previewDki, setPreviewDki] = useState<string | null>(null);
  const [fileInfoNasional, setFileInfoNasional] = useState<{ name: string; size: string } | null>(null);
  const [fileInfoDki, setFileInfoDki] = useState<{ name: string; size: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [bgMode, setBgMode] = useState<'checker' | 'white' | 'dark'>('checker');

  const fileInputNasionalRef = useRef<HTMLInputElement>(null);
  const fileInputDkiRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'nasional' | 'dki'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (type === 'nasional') {
        saveCustomLogoNasional(base64);
        setPreviewNasional(base64);
        setFileInfoNasional({
          name: file.name,
          size: formatFileSize(file.size),
        });
        showToast('Logo Karang Taruna (Kiri) berhasil diunggah!');
      } else {
        saveCustomLogoDki(base64);
        setPreviewDki(base64);
        setFileInfoDki({
          name: file.name,
          size: formatFileSize(file.size),
        });
        showToast('Logo Karang Taruna Jaya Raya (Kanan) berhasil diunggah!');
      }
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = '';
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    type: 'nasional' | 'dki'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon masukkan file gambar yang valid (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (type === 'nasional') {
        saveCustomLogoNasional(base64);
        setPreviewNasional(base64);
        setFileInfoNasional({
          name: file.name,
          size: formatFileSize(file.size),
        });
        showToast('Logo Karang Taruna berhasil diunggah!');
      } else {
        saveCustomLogoDki(base64);
        setPreviewDki(base64);
        setFileInfoDki({
          name: file.name,
          size: formatFileSize(file.size),
        });
        showToast('Logo Jaya Raya berhasil diunggah!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDeleteNasional = () => {
    deleteCustomLogoNasional();
    setPreviewNasional(null);
    setFileInfoNasional(null);
    showToast('Logo Karang Taruna berhasil dihapus.');
  };

  const handleDeleteDki = () => {
    deleteCustomLogoDki();
    setPreviewDki(null);
    setFileInfoDki(null);
    showToast('Logo Karang Taruna Jaya Raya berhasil dihapus.');
  };

  const handleDeleteAll = () => {
    if (window.confirm('Yakin ingin menghapus semua logo yang tersimpan?')) {
      deleteAllLogos();
      setPreviewNasional(null);
      setPreviewDki(null);
      setFileInfoNasional(null);
      setFileInfoDki(null);
      showToast('Semua logo telah dihapus.');
    }
  };

  const activeNasional = previewNasional || logoNasional;
  const activeDki = previewDki || logoDki;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Upload size={22} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                <span>Upload Logo Organisasi</span>
                <span className="text-[10px] uppercase font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                  Upload Ulang
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Unggah file logo resmi Karang Taruna dan Jaya Raya pilihan Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notice Info */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200">
            <strong>Semua logo lama telah dihapus permanen.</strong> Silakan klik kotak di bawah atau drag & drop file logo asli Anda (PNG transparan / JPG / SVG). Logo yang Anda unggah langsung diterapkan di <strong>Header, Kop Surat, Dokumen Cetak, PDF, E-KTA, dan Dashboard</strong>.
          </div>
        </div>

        {/* Body Upload Boxes */}
        <div className="p-6 space-y-6">
          {/* Background Preview Selector */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
            <span className="font-semibold flex items-center gap-1.5">
              <Eye size={14} /> Mode Latar Belakang Pratinjau Logo:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setBgMode('checker')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  bgMode === 'checker'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Catur (Transparan)
              </button>
              <button
                type="button"
                onClick={() => setBgMode('white')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  bgMode === 'white'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Putih
              </button>
              <button
                type="button"
                onClick={() => setBgMode('dark')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  bgMode === 'dark'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Gelap
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Logo Karang Taruna (Kiri / Nasional) */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      Logo Karang Taruna (Kiri / Nasional)
                    </h3>
                  </div>
                  {activeNasional ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Terpasang
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                      Belum Diunggah
                    </span>
                  )}
                </div>
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                  Adhitya Karya Mahatva Yodha (Bunga Teratai & Obor). Tampil di sisi kiri Kop Surat dan Header.
                </p>

                {/* Dropzone / Preview Area */}
                <div
                  onDrop={(e) => handleDrop(e, 'nasional')}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputNasionalRef.current?.click()}
                  className={`relative rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center min-h-[170px] cursor-pointer transition-all ${
                    activeNasional
                      ? 'border-emerald-400 dark:border-emerald-600 hover:border-emerald-500'
                      : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white/60 dark:bg-slate-900/60'
                  } ${
                    bgMode === 'checker'
                      ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px]'
                      : bgMode === 'white'
                      ? 'bg-white'
                      : 'bg-slate-950'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputNasionalRef}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(e) => handleFileChange(e, 'nasional')}
                    className="hidden"
                  />

                  {activeNasional ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={activeNasional}
                        alt="Logo Karang Taruna Unggahan"
                        className="w-24 h-24 object-contain drop-shadow-md"
                      />
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-500" /> Klik untuk mengganti file
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center p-2">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                        <Upload size={22} />
                      </div>
                      <span className="font-black text-xs text-slate-800 dark:text-slate-200">
                        Klik atau Tarik File Logo ke Sini
                      </span>
                      <span className="text-[10.5px] text-slate-400 mt-1">
                        PNG (Transparan), JPG, SVG, WebP
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Nasional */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputNasionalRef.current?.click()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Upload size={14} />
                  <span>{activeNasional ? 'Ganti File Logo Karang Taruna' : 'Pilih File Logo Karang Taruna'}</span>
                </button>

                {activeNasional && (
                  <button
                    type="button"
                    onClick={handleDeleteNasional}
                    className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-300 font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Hapus Logo Karang Taruna</span>
                  </button>
                )}
              </div>
            </div>

            {/* Box 2: Logo Karang Taruna Jaya Raya (Kanan / DKI Jakarta) */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      Logo Karang Taruna Jaya Raya (Kanan / DKI)
                    </h3>
                  </div>
                  {activeDki ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Terpasang
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                      Belum Diunggah
                    </span>
                  )}
                </div>
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                  Perisai Karang Taruna Jaya Raya Provinsi DKI Jakarta. Tampil di sisi kanan Kop Surat dan Header.
                </p>

                {/* Dropzone / Preview Area */}
                <div
                  onDrop={(e) => handleDrop(e, 'dki')}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputDkiRef.current?.click()}
                  className={`relative rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center min-h-[170px] cursor-pointer transition-all ${
                    activeDki
                      ? 'border-emerald-400 dark:border-emerald-600 hover:border-emerald-500'
                      : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-white/60 dark:bg-slate-900/60'
                  } ${
                    bgMode === 'checker'
                      ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px]'
                      : bgMode === 'white'
                      ? 'bg-white'
                      : 'bg-slate-950'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputDkiRef}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(e) => handleFileChange(e, 'dki')}
                    className="hidden"
                  />

                  {activeDki ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={activeDki}
                        alt="Logo Karang Taruna Jaya Raya Unggahan"
                        className="w-24 h-24 object-contain drop-shadow-md"
                      />
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-500" /> Klik untuk mengganti file
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center p-2">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                        <Upload size={22} />
                      </div>
                      <span className="font-black text-xs text-slate-800 dark:text-slate-200">
                        Klik atau Tarik File Logo ke Sini
                      </span>
                      <span className="text-[10.5px] text-slate-400 mt-1">
                        PNG (Transparan), JPG, SVG, WebP
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for DKI */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputDkiRef.current?.click()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Upload size={14} />
                  <span>{activeDki ? 'Ganti File Logo Jaya Raya' : 'Pilih File Logo Jaya Raya'}</span>
                </button>

                {activeDki && (
                  <button
                    type="button"
                    onClick={handleDeleteDki}
                    className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-300 font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Hapus Logo Jaya Raya</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {(activeNasional || activeDki) && (
              <button
                type="button"
                onClick={handleDeleteAll}
                className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <Trash2 size={14} />
                <span>Hapus Semua Logo (Kosongkan)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>Selesai & Terapkan</span>
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-slide-up">
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
