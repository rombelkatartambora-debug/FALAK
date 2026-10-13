import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Save,
  Send,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  User,
  Shield,
  Eye,
  CheckCircle,
} from 'lucide-react';
import {
  SuratRecord,
  JenisSuratKatar,
  TingkatOrganisasi,
  KelurahanName,
  DataOrganisasi,
} from '../types';
import { DAFTAR_KELURAHAN_TAMBORA, MAP_WILAYAH_TAMBORA } from '../data/wilayah';
import { getOrganisasi, saveOrganisasi, addSurat, getKSBForUnit } from '../services/storage';
import { generateSuratHtml, printDocumentHtml } from '../services/pdfExport';
import { getActiveLogoNasional, getActiveLogoDki, isCustomLogoNasionalActive } from '../data/logos';
import { KopSuratView } from './KopSuratView';
import { PengaturanKopModal } from './PengaturanKopModal';
import { Settings } from 'lucide-react';

interface BuatSuratViewProps {
  currentKelurahan: KelurahanName;
  currentRw: string;
  onLetterCreated: () => void;
}

export const BuatSuratView: React.FC<BuatSuratViewProps> = ({
  currentKelurahan,
  currentRw,
  onLetterCreated,
}) => {
  const [orgState, setOrgState] = useState<DataOrganisasi>(() => getOrganisasi());
  const [isKopModalOpen, setIsKopModalOpen] = useState(false);

  const [jenisSurat, setJenisSurat] = useState<JenisSuratKatar>('Surat Undangan Rapat');
  const [tingkat, setTingkat] = useState<TingkatOrganisasi>('Unit RW');
  const [kelurahan, setKelurahan] = useState<KelurahanName>(currentKelurahan);
  const [nomorRw, setNomorRw] = useState<string>(currentRw);

  const [nomorSurat, setNomorSurat] = useState<string>(`012/UKKT-RW.${currentRw}/PKJ/X/2026`);
  const [tanggalSurat, setTanggalSurat] = useState<string>('07 Oktober 2026');
  const [penerima, setPenerima] = useState<string>(
    'Seluruh Pengurus dan Anggota Karang Taruna Unit RW 001'
  );
  const [perihal, setPerihal] = useState<string>(
    'Undangan Rapat Pleno Koordinasi Kegiatan Pemuda & Evaluasi LPJ'
  );
  const [lampiran, setLampiran] = useState<string>('1 (satu) Berkas');
  const [isiSurat, setIsiSurat] = useState<string>(
    'Sehubungan dengan pelaksanaan program kerja Karang Taruna tahun 2026 serta penyusunan laporan pertanggungjawaban (LPJ) pemanfaatan dana stimulan, kami mengharapkan kehadiran rekan-rekan pengurus dalam pertemuan yang akan dilaksanakan pada:'
  );

  // Jadwal kegiatan
  const [tanggalKegiatan, setTanggalKegiatan] = useState<string>('Minggu, 12 Oktober 2026');
  const [waktuKegiatan, setWaktuKegiatan] = useState<string>('19.30 WIB s.d Selesai');
  const [tempatKegiatan, setTempatKegiatan] = useState<string>(
    'Balai Warga RW 001, Jl. Pengukir Raya, Pekojan'
  );

  // Mandat Petugas
  const [namaPetugasMandat, setNamaPetugasMandat] = useState<string>('Dimas Kurniawan, S.Kom');
  const [nikPetugasMandat, setNikPetugasMandat] = useState<string>('3173031809980002');
  const [jabatanPetugasMandat, setJabatanPetugasMandat] = useState<string>(
    'Sekretaris UKKT RW 001'
  );

  // Notification
  const [notification, setNotification] = useState<string | null>(null);

  // Load KSB signatories
  const ksb = getKSBForUnit(tingkat, kelurahan, nomorRw);

  // Auto-generator nomor surat helper
  const handleGenerateNomor = (jenis: JenisSuratKatar, tkt: TingkatOrganisasi, rw: string) => {
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][
      new Date().getMonth()
    ];
    const year = new Date().getFullYear();
    const randNo = String(Math.floor(Math.random() * 80) + 10).padStart(3, '0');

    let code = 'KT-TB';
    if (jenis === 'Surat Mandat (Tugas)') code = 'SM-KT';
    if (jenis === 'Surat Keputusan (SK) Pengesahan UKKT') code = 'SK-KT';

    if (tkt === 'Unit RW') {
      return `${randNo}/${code}/RW.${rw}/${kelurahan.substring(0, 3)}/${roman}/${year}`;
    } else if (tkt === 'Kelurahan') {
      return `${randNo}/${code}/KEL-${kelurahan.substring(0, 3)}/${roman}/${year}`;
    }
    return `${randNo}/${code}/${roman}/${year}`;
  };

  // Preset Template Loader
  const handlePilihTemplate = (jenis: JenisSuratKatar) => {
    setJenisSurat(jenis);
    setNomorSurat(handleGenerateNomor(jenis, tingkat, nomorRw));

    if (jenis === 'Surat Undangan Rapat') {
      setPerihal('Undangan Rapat Pleno Koordinasi Kegiatan Pemuda');
      setIsiSurat(
        'Sehubungan dengan pelaksanaan program kerja Karang Taruna serta persiapan kegiatan kepemudaan di wilayah, kami mengharapkan kehadiran rekan-rekan pengurus dalam pertemuan yang akan diselenggarakan pada:'
      );
    } else if (jenis === 'Surat Mandat (Tugas)') {
      setPerihal('Pemberian Mandat Mengikuti Pelatihan Kader Pemuda Pelopor');
      setIsiSurat(
        'Memberikan mandat penuh kepada pengurus yang bersangkutan untuk mewakili organisasi Karang Taruna dalam kegiatan kepemudaan tingkat kota dengan penuh rasa tanggung jawab.'
      );
    } else if (jenis === 'Surat Keputusan (SK) Pengesahan UKKT') {
      setPerihal(`Pengesahan Susunan Pengurus Unit Kerja Karang Taruna RW ${nomorRw}`);
      setIsiSurat(
        `Menetapkan dan mengesahkan kepengurusan Unit Kerja Karang Taruna (UKKT) RW ${nomorRw} Kelurahan ${kelurahan} Kecamatan Tambora Masa Bakti 2024-2027 untuk menjalankan fungsi pembinaan kesejahteraan sosial pemuda di tingkat rukun warga.`
      );
    } else if (jenis === 'Surat Permohonan Dana & Sarpras') {
      setPerihal('Permohonan Bantuan Sarana Prasarana & Dukungan Kegiatan Pemuda');
      setIsiSurat(
        'Dalam rangka mempererat silaturahmi pemuda dan meningkatkan keterampilan generasi muda di lingkungan RW, kami bermaksud memohon bantuan dan dukungan sarana prasarana penunjang kegiatan tersebut.'
      );
    } else if (jenis === 'Surat Keterangan Aktif Organisasi') {
      setPerihal('Surat Keterangan Keaktifan Kader Karang Taruna');
      setIsiSurat(
        'Menerangkan bahwa nama yang bersangkutan adalah benar kader aktif kepengurusan Karang Taruna di wilayah Kecamatan Tambora dan senantiasa berkontribusi positif dalam kegiatan sosial kemasyarakatan.'
      );
    }
  };

  // Save to archive
  const handleSaveSurat = () => {
    const newSurat: SuratRecord = {
      id: `SRT-${Date.now()}`,
      nomorSurat,
      jenisSurat,
      tanggalSurat,
      tingkat,
      kelurahan,
      nomorRw,
      penerima,
      perihal,
      lampiran,
      isiSurat,
      tempatKegiatan,
      waktuKegiatan,
      tanggalKegiatan,
      namaPetugasMandat,
      nikPetugasMandat,
      jabatanPetugasMandat,
      status: 'Tercatat',
      waktuDibuat: new Date().toISOString(),
    };

    addSurat(newSurat);
    onLetterCreated();
    setNotification('Surat resmi berhasil disimpan ke Arsip Surat!');
    setTimeout(() => setNotification(null), 3000);
  };

  // Direct Vector Print / Save PDF
  const handlePrint = () => {
    const suratData: SuratRecord = {
      id: `SRT-${Date.now()}`,
      nomorSurat,
      jenisSurat,
      tanggalSurat,
      tingkat,
      kelurahan,
      nomorRw,
      penerima,
      perihal,
      lampiran,
      isiSurat,
      tempatKegiatan,
      waktuKegiatan,
      tanggalKegiatan,
      namaPetugasMandat,
      nikPetugasMandat,
      jabatanPetugasMandat,
      status: 'Tercatat',
      waktuDibuat: new Date().toISOString(),
    };

    const html = generateSuratHtml(suratData, orgState);
    printDocumentHtml(html, `${jenisSurat}_${nomorSurat.replace(/[\/\\]/g, '_')}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle size={20} />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-black uppercase">
              GENERATOR PERSURATAN RESMI
            </span>
            <span className="text-xs text-slate-500 font-medium">Standar Aditya Karya Mahatva Yodha</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
            Pembuatan Surat Dinas Karang Taruna
          </h1>
          <p className="text-xs text-slate-500">
            Penomoran otomatis, Kop berkembar (Nasional & Jaya Raya), dan tanda tangan KSB dinamis.
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
            {isCustomLogoNasionalActive() && (
              <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
            )}
          </button>

          <button
            onClick={handleSaveSurat}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Save size={15} />
            <span>Simpan ke Arsip</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Printer size={16} />
            <span>CETAK SURAT RESMI (PDF)</span>
          </button>
        </div>
      </div>

      {/* Preset Jenis Surat Buttons */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
          Pilih Template Cepat Karang Taruna
        </label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              'Surat Undangan Rapat',
              'Surat Mandat (Tugas)',
              'Surat Keputusan (SK) Pengesahan UKKT',
              'Surat Permohonan Dana & Sarpras',
              'Surat Keterangan Aktif Organisasi',
            ] as JenisSuratKatar[]
          ).map((j) => (
            <button
              key={j}
              onClick={() => handlePilihTemplate(j)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                jenisSurat === j
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {j}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Workspace: Form (Left) & Live A4 Preview (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Form Editor (5 Cols on XL) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">
              Parameter & Atribut Surat
            </h3>

            {/* Tingkat & Unit */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Tingkat
                </label>
                <select
                  value={tingkat}
                  onChange={(e) => {
                    const t = e.target.value as TingkatOrganisasi;
                    setTingkat(t);
                    setNomorSurat(handleGenerateNomor(jenisSurat, t, nomorRw));
                  }}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option value="Unit RW">Unit RW</option>
                  <option value="Kelurahan">Kelurahan</option>
                  <option value="Kecamatan">Kecamatan</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Kelurahan
                </label>
                <select
                  value={kelurahan}
                  onChange={(e) => setKelurahan(e.target.value as KelurahanName)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  {DAFTAR_KELURAHAN_TAMBORA.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Nomor RW
                </label>
                <select
                  value={nomorRw}
                  onChange={(e) => {
                    setNomorRw(e.target.value);
                    setNomorSurat(handleGenerateNomor(jenisSurat, tingkat, e.target.value));
                  }}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold font-mono"
                >
                  {(MAP_WILAYAH_TAMBORA[kelurahan] || ['001']).map((rw) => (
                    <option key={rw} value={rw}>
                      RW {rw}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nomor Surat & Tanggal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Nomor Surat Resmi
                  </label>
                  <button
                    onClick={() => setNomorSurat(handleGenerateNomor(jenisSurat, tingkat, nomorRw))}
                    className="text-[9px] font-bold text-blue-600 hover:underline"
                  >
                    Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Tanggal Surat
                </label>
                <input
                  type="text"
                  value={tanggalSurat}
                  onChange={(e) => setTanggalSurat(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                />
              </div>
            </div>

            {/* Penerima / Tujuan */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Tujuan / Penerima Surat
              </label>
              <input
                type="text"
                value={penerima}
                onChange={(e) => setPenerima(e.target.value)}
                placeholder="Contoh: Yth. Lurah Pekojan / Pengurus RW..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
              />
            </div>

            {/* Perihal & Lampiran */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Perihal / Hal
                </label>
                <input
                  type="text"
                  value={perihal}
                  onChange={(e) => setPerihal(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Lampiran
                </label>
                <input
                  type="text"
                  value={lampiran}
                  onChange={(e) => setLampiran(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                />
              </div>
            </div>

            {/* Narasi Isi Surat */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Isi Surat / Redaksional
              </label>
              <textarea
                rows={4}
                value={isiSurat}
                onChange={(e) => setIsiSurat(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium leading-relaxed"
              />
            </div>

            {/* Bagian Khusus Mandat vs Undangan */}
            {jenisSurat === 'Surat Mandat (Tugas)' ? (
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900 space-y-3">
                <span className="font-bold text-[11px] text-blue-900 dark:text-blue-300 uppercase">
                  Data Kader Penerima Mandat:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-500 uppercase">Nama</label>
                    <input
                      type="text"
                      value={namaPetugasMandat}
                      onChange={(e) => setNamaPetugasMandat(e.target.value)}
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded-lg font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-500 uppercase">NIK</label>
                    <input
                      type="text"
                      value={nikPetugasMandat}
                      onChange={(e) => setNikPetugasMandat(e.target.value)}
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded-lg font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-500 uppercase">Jabatan</label>
                    <input
                      type="text"
                      value={jabatanPetugasMandat}
                      onChange={(e) => setJabatanPetugasMandat(e.target.value)}
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded-lg font-bold text-xs"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 uppercase">
                  Waktu & Tempat Pelaksanaan Kegiatan:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-500 uppercase">
                      Hari & Tgl
                    </label>
                    <input
                      type="text"
                      value={tanggalKegiatan}
                      onChange={(e) => setTanggalKegiatan(e.target.value)}
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-500 uppercase">Waktu</label>
                    <input
                      type="text"
                      value={waktuKegiatan}
                      onChange={(e) => setWaktuKegiatan(e.target.value)}
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-500 uppercase">Tempat</label>
                    <input
                      type="text"
                      value={tempatKegiatan}
                      onChange={(e) => setTempatKegiatan(e.target.value)}
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handlePrint}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer size={16} />
              <span>CETAK SURAT KE PDF SEKARANG</span>
            </button>
          </div>
        </div>

        {/* Right Live A4 Sheet Preview (7 Cols on XL) */}
        <div className="xl:col-span-7 flex justify-center overflow-x-auto bg-slate-100 dark:bg-slate-950 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-[210mm] min-w-[210mm] min-h-[297mm] bg-white text-black p-[20mm] rounded-sm shadow-2xl font-serif text-[11pt] leading-relaxed relative select-text border border-slate-300">
            {/* Kop Surat Resmi */}
            <KopSuratView
              tingkat={tingkat}
              kelurahan={kelurahan}
              nomorRw={nomorRw}
              org={orgState}
              onEditKop={() => setIsKopModalOpen(true)}
              showEditButton={true}
            />

            {/* Body Surat Live Simulation */}
            {jenisSurat === 'Surat Mandat (Tugas)' ? (
              <div className="space-y-4 pt-2">
                <div className="text-center font-bold underline text-[13pt]">SURAT MANDAT</div>
                <div className="text-center font-bold text-[10.5pt]">Nomor : {nomorSurat}</div>

                <p className="text-justify leading-relaxed mt-4">
                  Yang bertanda tangan di bawah ini, Pengurus Karang Taruna{' '}
                  {tingkat === 'Unit RW' ? `Unit Kerja RW ${nomorRw} Kelurahan ${kelurahan}` : kelurahan},
                  dengan ini memberikan <strong>MANDAT PENUH</strong> kepada:
                </p>

                <table className="w-full border-none ml-6 leading-relaxed text-[11pt]">
                  <tbody>
                    <tr>
                      <td className="w-36 font-semibold">Nama Lengkap</td>
                      <td className="w-4">:</td>
                      <td className="font-bold">{namaPetugasMandat}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">NIK</td>
                      <td>:</td>
                      <td className="font-bold">{nikPetugasMandat}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Jabatan</td>
                      <td>:</td>
                      <td className="font-bold">{jabatanPetugasMandat}</td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-justify leading-relaxed">
                  Untuk menghadiri dan melaksanakan tugas organisasi:{' '}
                  <strong>{perihal}</strong> pada:
                </p>

                <table className="w-full border-none ml-6 leading-relaxed text-[11pt]">
                  <tbody>
                    <tr>
                      <td className="w-36 font-semibold">Hari / Tanggal</td>
                      <td className="w-4">:</td>
                      <td>{tanggalKegiatan}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Waktu</td>
                      <td>:</td>
                      <td>{waktuKegiatan}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Tempat</td>
                      <td>:</td>
                      <td>{tempatKegiatan}</td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-justify leading-relaxed">
                  Demikian Surat Mandat ini diberikan agar dapat dipergunakan sebagaimana mestinya
                  dengan penuh tanggung jawab.
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {/* Atribut Header */}
                <div className="flex justify-between items-start text-[11pt]">
                  <table className="border-none leading-relaxed">
                    <tbody>
                      <tr>
                        <td className="w-24">Nomor</td>
                        <td className="w-4">:</td>
                        <td className="font-bold">{nomorSurat}</td>
                      </tr>
                      <tr>
                        <td>Lampiran</td>
                        <td>:</td>
                        <td>{lampiran}</td>
                      </tr>
                      <tr>
                        <td>Perihal</td>
                        <td>:</td>
                        <td className="font-bold">{perihal}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="text-right">Jakarta, {tanggalSurat}</div>
                </div>

                {/* Kepada */}
                <div className="pt-2 leading-relaxed">
                  Kepada Yth.<br />
                  <strong>{penerima}</strong><br />
                  di -<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<u>Tempat</u>
                </div>

                {/* Narasi */}
                <div className="pt-3 text-justify leading-relaxed space-y-3">
                  <p className="italic">Salam Aditya Karya Mahatva Yodha,</p>
                  <p>{isiSurat}</p>

                  {tempatKegiatan && (
                    <table className="border-none ml-6 leading-relaxed">
                      <tbody>
                        <tr>
                          <td className="w-36">Hari / Tanggal</td>
                          <td className="w-4">:</td>
                          <td className="font-bold">{tanggalKegiatan}</td>
                        </tr>
                        <tr>
                          <td>Waktu</td>
                          <td>:</td>
                          <td className="font-bold">{waktuKegiatan}</td>
                        </tr>
                        <tr>
                          <td>Tempat</td>
                          <td>:</td>
                          <td className="font-bold">{tempatKegiatan}</td>
                        </tr>
                      </tbody>
                    </table>
                  )}

                  <p>
                    Demikian surat ini kami sampaikan, atas perhatian dan kehadiran rekan-rekan kami
                    ucapkan terima kasih.
                  </p>
                </div>
              </div>
            )}

            {/* Tanda Tangan Karang Taruna */}
            <div className="pt-12 flex justify-between text-center text-[10.5pt]">
              <div className="w-56">
                Sekretaris,<br />
                {tingkat === 'Unit RW' ? `RW ${nomorRw}` : kelurahan}
                <div className="h-16"></div>
                <strong><u>{ksb.namaSekretaris}</u></strong>
                <div className="text-[9.5pt]">NIK: {ksb.nikSekretaris}</div>
              </div>

              <div className="w-56">
                Ketua,<br />
                {tingkat === 'Unit RW' ? `RW ${nomorRw}` : kelurahan}
                <div className="h-16"></div>
                <strong><u>{ksb.namaKetua}</u></strong>
                <div className="text-[9.5pt]">NIK: {ksb.nikKetua}</div>
              </div>
            </div>
          </div>
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
          setNotification('Pengaturan Kop Surat & Logo berhasil disimpan!');
          setTimeout(() => setNotification(null), 3000);
        }}
        currentTingkat={tingkat}
        currentKelurahan={kelurahan}
        currentRw={nomorRw}
      />
    </div>
  );
};
