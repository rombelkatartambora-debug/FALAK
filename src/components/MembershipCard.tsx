import React, { useRef, useState } from 'react';
import { Download, Printer, ShieldCheck, QrCode, MapPin, Sparkles, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { BiodataPengurus } from '../types';
import { getActiveLogoNasional, getActiveLogoDki } from '../data/logos';

interface MembershipCardProps {
  member: BiodataPengurus;
  kelurahan: string;
  nomorRw: string;
  periodeSelesai?: string;
  onClose?: () => void;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({
  member,
  kelurahan,
  nomorRw,
  periodeSelesai = '2027',
  onClose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const logoNasional = getActiveLogoNasional();
  const logoDki = getActiveLogoDki();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      const cleanName = (member.namaLengkap || 'Anggota').trim().replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `E-KTA_${cleanName}_RW${nomorRw}_${kelurahan}.png`;
      link.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export card as PNG:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const berlakuTahun = periodeSelesai ? new Date(periodeSelesai).getFullYear() || 2027 : 2027;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Front of E-KTA (Standard ID-1 Ratio 85.6mm x 53.98mm) */}
      <div
        ref={cardRef}
        id="kta-printable-card"
        className="relative w-[360px] h-[225px] rounded-2xl p-4 overflow-hidden shadow-2xl border-2 border-amber-400/40 text-white font-sans select-none"
        style={{
          background: 'linear-gradient(135deg, #09132e 0%, #1e3a8a 50%, #0f172a 100%)',
        }}
      >
        {/* Watermark Logo */}
        {logoNasional && (
          <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12 pointer-events-none">
            <img src={logoNasional} alt="Watermark" className="w-52 h-52 object-contain" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-amber-400/10 pointer-events-none" />

        {/* Card Header with Two Official Logos */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-2 mb-2.5">
          {logoNasional ? (
            <img
              src={logoNasional}
              alt="Logo Karang Taruna Nasional"
              className="w-10 h-10 object-contain drop-shadow"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-[8px] font-black text-amber-300">
              KT
            </div>
          )}
          <div className="text-center px-1">
            <div className="text-[10px] font-black tracking-widest text-white uppercase leading-tight">
              KARTU TANDA ANGGOTA DIGITAL
            </div>
            <div className="text-[8px] font-extrabold text-amber-300 tracking-wider uppercase">
              KARANG TARUNA KECAMATAN TAMBORA
            </div>
            <div className="text-[7px] text-sky-200">KOTA ADMINISTRASI JAKARTA BARAT</div>
          </div>
          {logoDki ? (
            <img
              src={logoDki}
              alt="Logo Karang Taruna Jaya Raya DKI"
              className="w-10 h-10 object-contain drop-shadow"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-[8px] font-black text-sky-300">
              DKI
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="relative z-10 flex gap-3.5 items-center">
          {/* Member Photo Box */}
          <div className="w-20 h-24 rounded-xl bg-slate-800/90 border-2 border-amber-400/60 p-0.5 flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-inner">
            {member.fotoUrl ? (
              <img
                src={member.fotoUrl}
                alt={member.namaLengkap}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-1 bg-gradient-to-b from-blue-900 to-slate-900">
                <span className="text-[9px] font-bold text-slate-300">PAS FOTO</span>
                <span className="text-[7px] text-amber-300 font-mono mt-0.5">2 x 3 cm</span>
              </div>
            )}
          </div>

          {/* Member Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <div>
              <div className="text-[6.5px] font-black text-amber-300 uppercase tracking-widest">
                NAMA LENGKAP
              </div>
              <div className="text-xs font-black uppercase text-white truncate leading-tight">
                {member.namaLengkap || 'Nama Pengurus'}
              </div>
            </div>

            <div>
              <div className="text-[6.5px] font-black text-amber-300 uppercase tracking-widest">
                NIK (KTP)
              </div>
              <div className="text-[10px] font-mono font-bold tracking-tight text-sky-100">
                {member.nik || '3173xxxxxxxxxxxx'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 pt-0.5">
              <div>
                <div className="text-[6.5px] font-black text-amber-300 uppercase tracking-widest">
                  JABATAN
                </div>
                <div className="text-[9.5px] font-extrabold text-amber-400 uppercase leading-none">
                  {member.jabatan || 'Pengurus'}
                </div>
              </div>
              <div>
                <div className="text-[6.5px] font-black text-amber-300 uppercase tracking-widest">
                  MASA BAKTI
                </div>
                <div className="text-[9px] font-bold text-slate-200 leading-none">
                  s.d {berlakuTahun}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Bottom Footer */}
        <div className="absolute bottom-2.5 left-4 right-4 z-10 flex items-center justify-between border-t border-white/10 pt-1.5">
          <div className="flex items-center gap-1.5 text-[8px] font-bold text-sky-200">
            <MapPin size={10} className="text-red-400" />
            <span>
              UKKT RW {nomorRw} • Kel. {kelurahan}
            </span>
          </div>

          {/* QR Code Verification badge */}
          <div className="bg-white p-0.5 rounded-sm shadow-md flex items-center justify-center">
            <QrCode size={22} className="text-slate-900" />
          </div>
        </div>
      </div>

      {/* Action Buttons: Download PNG & Print PDF */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleDownloadPng}
          disabled={isDownloading}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
        >
          {downloadSuccess ? (
            <>
              <Check size={16} />
              <span>Berhasil Diunduh!</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>{isDownloading ? 'Memproses...' : 'Unduh Kartu PNG (HD)'}</span>
            </>
          )}
        </button>

        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Printer size={15} />
          <span>Cetak / PDF</span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
          >
            Tutup
          </button>
        )}
      </div>

      <p className="text-[10.5px] text-slate-500 text-center max-w-xs">
        Format standar kartu digital Karang Taruna DKI Jakarta beresolusi 300 DPI, siap cetak kartu PVC atau disimpan di HP.
      </p>
    </div>
  );
};
