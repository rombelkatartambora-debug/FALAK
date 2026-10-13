import React from 'react';
import { Settings, Image as ImageIcon, Upload } from 'lucide-react';
import { DataOrganisasi, TingkatOrganisasi, KelurahanName } from '../types';
import { getActiveLogoNasional, getActiveLogoDki } from '../data/logos';

interface KopSuratViewProps {
  tingkat: TingkatOrganisasi;
  kelurahan: KelurahanName | string;
  nomorRw: string;
  org: DataOrganisasi;
  onEditKop?: () => void;
  showEditButton?: boolean;
}

export const KopSuratView: React.FC<KopSuratViewProps> = ({
  tingkat,
  kelurahan,
  nomorRw,
  org,
  onEditKop,
  showEditButton = true,
}) => {
  const logoKiri = org.logoKiriUrl || getActiveLogoNasional();
  const logoKanan = org.logoKananUrl || getActiveLogoDki();
  const tampilkanLogoKanan = org.tampilkanLogoKanan !== false;

  // Title line 1
  const baris1 = org.judulKopBaris1 || 'PENGURUS KARANG TARUNA';

  // Title line 2 (Unit)
  let baris2 = '';
  if (org.judulKopBaris2) {
    baris2 = org.judulKopBaris2;
  } else if (tingkat === 'Unit RW') {
    baris2 = `UNIT KERJA KARANG TARUNA (UKKT) RW. ${nomorRw || '001'}`;
  } else if (tingkat === 'Kelurahan') {
    baris2 = `PENGURUS KARANG TARUNA KELURAHAN ${kelurahan || 'PEKOJAN'}`;
  } else {
    baris2 = 'PENGURUS KARANG TARUNA KECAMATAN TAMBORA';
  }

  // Title line 3
  let baris3 = '';
  if (tingkat === 'Unit RW') {
    baris3 = `KELURAHAN ${kelurahan || 'PEKOJAN'} - KECAMATAN TAMBORA`;
  } else if (tingkat === 'Kelurahan') {
    baris3 = 'KECAMATAN TAMBORA';
  } else {
    baris3 = 'KECAMATAN TAMBORA';
  }

  // Title line 4
  const baris4 = org.judulKopBaris4 || 'KOTA ADMINISTRASI JAKARTA BARAT';

  // Address
  let alamat = org.alamatKopSekretariat;
  if (!alamat) {
    if (tingkat === 'Unit RW') {
      alamat = `Sekretariat: Balai Warga RW ${nomorRw || '001'}, Kelurahan ${kelurahan || 'Pekojan'}, Kecamatan Tambora, Jakarta Barat 11240`;
    } else if (tingkat === 'Kelurahan') {
      alamat = `Sekretariat: Kantor Kelurahan ${kelurahan || 'Pekojan'}, Kecamatan Tambora, Jakarta Barat 11240`;
    } else {
      alamat = org.alamat || 'Jl. Tubagus Angke No. 1, Kelurahan Angke, Kecamatan Tambora, Jakarta Barat 11330';
    }
  }

  // Contact
  const kontak = org.kontakKop || `Telepon/WA: ${org.telepon || '0812-8877-6655'} | Email: ${org.email || 'katar.kec.tambora@gmail.com'}`;

  // Color selection
  let unitColor = 'text-black';
  if (org.warnaJudulKop === 'merah') {
    unitColor = 'text-red-700';
  } else if (org.warnaJudulKop === 'biru') {
    unitColor = 'text-blue-900';
  }

  // Logo size
  let logoSizeClass = 'w-20 h-20 max-w-[80px] max-h-[80px]';
  if (org.ukuranLogoKop === 'kecil') {
    logoSizeClass = 'w-16 h-16 max-w-[65px] max-h-[65px]';
  } else if (org.ukuranLogoKop === 'besar') {
    logoSizeClass = 'w-24 h-24 max-w-[95px] max-h-[95px]';
  }

  return (
    <div className="relative group mb-4">
      {/* Quick Edit Overlay / Tooltip */}
      {showEditButton && onEditKop && (
        <button
          onClick={onEditKop}
          type="button"
          className="absolute -top-3 -right-3 z-20 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transition-all cursor-pointer opacity-90 group-hover:opacity-100 group-hover:scale-105"
          title="Ubah format teks Kop Surat atau ganti Logo Karang Taruna & DKI"
        >
          <Settings size={13} className="animate-spin-slow" />
          <span>Atur Kop & Logo</span>
        </button>
      )}

      {/* Kop Content */}
      <div className="flex items-center justify-between gap-3 pb-2 pt-1">
        {/* Logo Kiri (Karang Taruna) */}
        <div className="flex-shrink-0 flex items-center justify-center">
          {logoKiri ? (
            <img
              src={logoKiri}
              alt="Logo Karang Taruna"
              className={`${logoSizeClass} object-contain transition-all`}
            />
          ) : (
            <button
              type="button"
              onClick={onEditKop}
              className={`${logoSizeClass} border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-xl flex flex-col items-center justify-center p-1 bg-amber-50/50 hover:bg-amber-50 text-amber-700 cursor-pointer transition-all`}
              title="Klik untuk upload Logo Karang Taruna"
            >
              <Upload size={16} />
              <span className="text-[7.5px] font-bold text-center leading-tight mt-0.5">
                + Upload Logo
              </span>
            </button>
          )}
        </div>

        {/* Center Text Hierarchy */}
        <div className="text-center flex-1 px-2">
          <h2 className="text-[13pt] font-sans font-extrabold uppercase tracking-wide leading-tight text-black m-0">
            {baris1}
          </h2>
          <h1
            className={`text-[14.5pt] font-sans font-black uppercase tracking-wide leading-tight my-0.5 ${unitColor}`}
          >
            {baris2}
          </h1>
          <h3 className="text-[11.5pt] font-sans font-bold uppercase tracking-wider leading-tight text-black m-0">
            {baris3}
          </h3>
          <h3 className="text-[11.5pt] font-sans font-bold uppercase tracking-wider leading-tight text-black m-0">
            {baris4}
          </h3>
          <p className="text-[8.5pt] font-serif text-slate-800 leading-tight mt-1.5 mb-0">
            {alamat}
          </p>
          <p className="text-[8pt] font-serif text-slate-800 leading-tight m-0">
            {kontak}
          </p>
        </div>

        {/* Logo Kanan (DKI Jakarta / Jaya Raya / Instansi) */}
        <div className="flex-shrink-0 flex items-center justify-center">
          {tampilkanLogoKanan ? (
            logoKanan ? (
              <img
                src={logoKanan}
                alt="Logo Karang Taruna Jaya Raya"
                className={`${logoSizeClass} object-contain transition-all`}
              />
            ) : (
              <button
                type="button"
                onClick={onEditKop}
                className={`${logoSizeClass} border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center p-1 bg-blue-50/50 hover:bg-blue-50 text-blue-700 cursor-pointer transition-all`}
                title="Klik untuk upload Logo Karang Taruna Jaya Raya"
              >
                <Upload size={16} />
                <span className="text-[7.5px] font-bold text-center leading-tight mt-0.5">
                  + Upload Logo
                </span>
              </button>
            )
          ) : (
            <div className={`${logoSizeClass}`} />
          )}
        </div>
      </div>

      {/* Double Border Resmi Kop Surat Dinas / Organisasi */}
      <div className="w-full mt-1.5">
        <div className="w-full border-t-[2.5px] border-black"></div>
        <div className="w-full border-t-[0.8px] border-black mt-[2px]"></div>
      </div>
    </div>
  );
};
