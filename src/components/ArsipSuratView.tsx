import React, { useState } from 'react';
import {
  Archive,
  Search,
  Filter,
  Printer,
  Calendar,
  FileText,
  Building,
  CheckCircle,
} from 'lucide-react';
import { SuratRecord, DataOrganisasi } from '../types';
import { getOrganisasi } from '../services/storage';
import { generateSuratHtml, printDocumentHtml } from '../services/pdfExport';

interface ArsipSuratViewProps {
  suratList: SuratRecord[];
}

export const ArsipSuratView: React.FC<ArsipSuratViewProps> = ({ suratList }) => {
  const org = getOrganisasi();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState('Semua');

  const filtered = suratList.filter((s) => {
    const matchSearch =
      s.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.perihal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.penerima.toLowerCase().includes(searchTerm.toLowerCase());
    const matchJenis = filterJenis === 'Semua' || s.jenisSurat === filterJenis;
    return matchSearch && matchJenis;
  });

  const handlePrintSurat = (surat: SuratRecord) => {
    const html = generateSuratHtml(surat, org);
    printDocumentHtml(html, `${surat.jenisSurat}_${surat.nomorSurat.replace(/[\/\\]/g, '_')}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-black uppercase">
              ARSIP DOKUMEN DIGITAL
            </span>
            <span className="text-xs text-slate-500 font-medium">Buku Agenda Surat Masuk & Keluar</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
            Arsip Surat Resmi Karang Taruna
          </h1>
          <p className="text-xs text-slate-500">
            Seluruh surat dinas yang telah dibuat tersimpan secara rapi dan dapat dicetak ulang sewaktu-waktu.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-950 px-4 py-2 rounded-2xl">
          Total: {suratList.length} Surat
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nomor surat, perihal, atau tujuan..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
          />
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold"
          >
            <option value="Semua">Semua Jenis Surat</option>
            <option value="Surat Undangan Rapat">Surat Undangan Rapat</option>
            <option value="Surat Mandat (Tugas)">Surat Mandat (Tugas)</option>
            <option value="Surat Keputusan (SK) Pengesahan UKKT">Surat Keputusan (SK)</option>
            <option value="Surat Permohonan Dana & Sarpras">Surat Permohonan</option>
            <option value="Surat Keterangan Aktif Organisasi">Surat Keterangan</option>
          </select>
        </div>
      </div>

      {/* Table of Letters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">Nomor & Tanggal</th>
                <th className="p-4">Perihal & Jenis</th>
                <th className="p-4">Tujuan / Penerima</th>
                <th className="p-4">Unit Kerja</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Cetak Ulang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filtered.length > 0 ? (
                filtered.map((surat) => (
                  <tr
                    key={surat.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-mono font-black text-blue-600 dark:text-blue-400">
                        {surat.nomorSurat}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar size={11} />
                        <span>{surat.tanggalSurat}</span>
                      </div>
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {surat.perihal}
                      </div>
                      <span className="inline-block mt-1 text-[9.5px] px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {surat.jenisSurat}
                      </span>
                    </td>

                    <td className="p-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                      {surat.penerima}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {surat.tingkat === 'Unit RW' ? `RW ${surat.nomorRw}` : surat.tingkat}
                      </div>
                      <div className="text-[10px] text-slate-500">Kel. {surat.kelurahan || 'Tambora'}</div>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {surat.status}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handlePrintSurat(surat)}
                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-xs cursor-pointer inline-flex items-center gap-1 text-xs font-bold"
                        title="Cetak Dokumen PDF"
                      >
                        <Printer size={14} />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 italic">
                    Tidak ada surat yang sesuai dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
