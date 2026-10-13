import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Facebook,
  Instagram,
  Youtube,
  Video,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { KegiatanRecord, UnitRWProfile } from '../types';

interface ShareSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  kegiatan: KegiatanRecord | null;
  unit?: UnitRWProfile | null;
}

export const ShareSocialModal: React.FC<ShareSocialModalProps> = ({
  isOpen,
  onClose,
  kegiatan,
  unit,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen || !kegiatan) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Format Teks Broadcast WhatsApp
  const waMessage = `*KABAR PEMUDA KARANG TARUNA* 🇮🇩
📢 *${kegiatan.judulKegiatan.toUpperCase()}*

📌 *Penyelenggara:* ${kegiatan.penyelenggara}
🏛️ *Wilayah:* Kelurahan ${kegiatan.kelurahan}${kegiatan.nomorRw ? ` - RW ${kegiatan.nomorRw}` : ''}
🗓️ *Hari/Tanggal:* ${kegiatan.tanggalPelaksanaan}
⏰ *Waktu:* ${kegiatan.waktuMulai || '08:00 WIB'} s/d ${kegiatan.waktuSelesai || 'Selesai'}
📍 *Lokasi:* ${kegiatan.lokasiKegiatan}
🏷️ *Bidang:* ${kegiatan.bidang}

📝 *Deskripsi Kegiatan:*
${kegiatan.deskripsi}

${unit?.instagram ? `📸 Instagram: ${unit.instagram}` : ''}
${unit?.facebook ? `👥 Facebook: ${unit.facebook}` : ''}
${unit?.tiktok ? `🎵 TikTok: ${unit.tiktok}` : ''}
${unit?.youtube ? `▶️ YouTube: ${unit.youtube}` : ''}
${unit?.maps ? `🗺️ Peta Lokasi: ${unit.maps}` : ''}

_Salam Kesetiakawanan Sosial!_
_Adhitya Karya Mahatva Yodha_`;

  const waShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`;

  // Caption Instagram
  const igCaption = `✨ ${kegiatan.judulKegiatan} ✨

${kegiatan.deskripsi}

🗓️ Tanggal: ${kegiatan.tanggalPelaksanaan}
📍 Lokasi: ${kegiatan.lokasiKegiatan}
🏛️ Penyelenggara: ${kegiatan.penyelenggara}

Tetap solid dan terus berkarya untuk kemajuan pemuda dan lingkungan!

#KarangTaruna #KarangTarunaDKI #KarangTarunaTambora #PemudaPelopor #${kegiatan.kelurahan.replace(/\s+/g, '')} #AdhityaKaryaMahatvaYodha ${unit?.instagram ? `${unit.instagram}` : ''}`;

  // Facebook Caption
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(
    `${kegiatan.judulKegiatan}\n\n${kegiatan.deskripsi}\n\nLokasi: ${kegiatan.lokasiKegiatan}\nPenyelenggara: ${kegiatan.penyelenggara}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Modal */}
        <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <Share2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold uppercase tracking-wider">
                <Sparkles size={13} />
                <span>Publikasi & Bagikan Kegiatan</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                Bagikan ke Media Sosial
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Ringkasan Kegiatan */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-1.5">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Kegiatan Baru Berhasil Diterbitkan
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {kegiatan.judulKegiatan}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-300 pt-1 text-[11px]">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-blue-600" />
                {kegiatan.tanggalPelaksanaan}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-red-500" />
                {kegiatan.lokasiKegiatan}
              </span>
            </div>
          </div>

          {/* Akun Media Sosial Unit Terkait */}
          {unit && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase block mb-2">
                Media Sosial Terdaftar UKKT RW {unit.nomorRw} Kel. {unit.kelurahan}:
              </span>
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                {unit.instagram && (
                  <span className="px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300 font-bold flex items-center gap-1 border border-pink-200 dark:border-pink-900">
                    <Instagram size={12} /> {unit.instagram}
                  </span>
                )}
                {unit.facebook && (
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold flex items-center gap-1 border border-blue-200 dark:border-blue-900">
                    <Facebook size={12} /> {unit.facebook}
                  </span>
                )}
                {unit.tiktok && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 border border-slate-300 dark:border-slate-600">
                    <Video size={12} /> {unit.tiktok}
                  </span>
                )}
                {unit.youtube && (
                  <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 font-bold flex items-center gap-1 border border-red-200 dark:border-red-900">
                    <Youtube size={12} /> {unit.youtube}
                  </span>
                )}
                {unit.maps && (
                  <a
                    href={unit.maps.startsWith('http') ? unit.maps : `https://${unit.maps}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-900 hover:underline"
                  >
                    <MapPin size={12} /> Google Maps
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Tombol Share Cepat ke Berbagai Platform */}
          <div className="space-y-3">
            <span className="font-bold text-slate-900 dark:text-white block">
              Pilih Platform untuk Berbagi:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* WhatsApp Broadcast */}
              <div className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                    <MessageCircle size={18} className="text-emerald-600" />
                    <span>WhatsApp Blast</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">Siap Kirim</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Kirim teks undangan & publikasi lengkap langsung ke grup WA warga dan pengurus.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={waShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    <span>Buka WhatsApp</span>
                  </a>
                  <button
                    onClick={() => handleCopy(waMessage, 'wa')}
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-xl font-bold hover:bg-emerald-50 transition-all flex items-center gap-1"
                  >
                    {copiedType === 'wa' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedType === 'wa' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              {/* Instagram Feed / Story */}
              <div className="p-3.5 rounded-2xl border border-pink-200 dark:border-pink-900 bg-pink-50/40 dark:bg-pink-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-pink-800 dark:text-pink-300">
                    <Instagram size={18} className="text-pink-600" />
                    <span>Instagram Caption</span>
                  </div>
                  <span className="text-[10px] text-pink-600 font-bold">Siap Posting</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Salin caption lengkap dengan tagar resmi untuk posting di feed, reels, atau story.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => handleCopy(igCaption, 'ig')}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-90 text-white py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    {copiedType === 'ig' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedType === 'ig' ? 'Caption IG Tersalin!' : 'Salin Caption Instagram'}</span>
                  </button>
                </div>
              </div>

              {/* Facebook Share */}
              <div className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300">
                    <Facebook size={18} className="text-blue-600" />
                    <span>Facebook Share</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-bold">1-Klik</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Bagikan informasi kegiatan langsung ke halaman atau grup Facebook Karang Taruna.
                </p>
                <div className="pt-1">
                  <a
                    href={fbShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-1.5 block"
                  >
                    <ExternalLink size={13} />
                    <span>Bagikan ke Facebook</span>
                  </a>
                </div>
              </div>

              {/* TikTok / YouTube Shorts */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <Video size={18} className="text-slate-700" />
                    <span>TikTok / YouTube</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">Deskripsi Video</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Salin deskripsi pendek dan tagar video dokumentasi kegiatan Karang Taruna.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() =>
                      handleCopy(
                        `${kegiatan.judulKegiatan} - ${kegiatan.penyelenggara} #KarangTaruna #PemudaTambora #DKIJakarta`,
                        'tt'
                      )
                    }
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    {copiedType === 'tt' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedType === 'tt' ? 'Deskripsi Tersalin!' : 'Salin Deskripsi Video'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-xl font-bold text-xs transition-all"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
