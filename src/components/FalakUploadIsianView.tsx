import React, { useState, useRef } from 'react';
import { 
  FalakMonthRecord, 
  parseUploadedFalakFile, 
  generateSampleExcelWorkbook,
  DAFTAR_BULAN_HIJRIYAH 
} from '../utils/almansuriyahFalakData';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  FileText,
  Sliders,
  Database
} from 'lucide-react';

interface FalakUploadIsianViewProps {
  records: FalakMonthRecord[];
  onUpdateRecords: (newRecords: FalakMonthRecord[], sourceName: string) => void;
  activeSourceName: string;
  selectedMonthIdx: number;
  onSelectMonth: (index: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const FalakUploadIsianView: React.FC<FalakUploadIsianViewProps> = ({
  records,
  onUpdateRecords,
  activeSourceName,
  selectedMonthIdx,
  onSelectMonth,
  onShowToast
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [parsingLoading, setParsingLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentRec = records[selectedMonthIdx] || records[0];

  // Local state for editing the current record
  const [editForm, setEditForm] = useState<FalakMonthRecord>(currentRec);

  // Sync if selectedMonthIdx changes
  React.useEffect(() => {
    if (records[selectedMonthIdx]) {
      setEditForm(records[selectedMonthIdx]);
    }
  }, [selectedMonthIdx, records]);

  const handleFileProcess = async (file: File) => {
    if (!file) return;
    setParsingLoading(true);

    try {
      const buffer = await file.arrayBuffer();
      const res = parseUploadedFalakFile(buffer, file.name);

      if (res.success && res.data) {
        onUpdateRecords(res.data, file.name);
        onShowToast(`File "${file.name}" berhasil diproses! Memuat ${res.data.length} data bulan.`);
      } else {
        onShowToast(res.error || 'Gagal memproses file Excel/CSV.', 'error');
      }
    } catch (e: any) {
      onShowToast(`Error saat membaca file: ${e.message}`, 'error');
    } finally {
      setParsingLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadSample = () => {
    try {
      const u8 = generateSampleExcelWorkbook();
      const blob = new Blob([u8 as unknown as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Format_Hisab_Sulam_Almansuriyah_1447H.xlsx';
      a.click();
      URL.revokeObjectURL(url);
      onShowToast('Template Excel berhasil diunduh!');
    } catch (err: any) {
      onShowToast('Gagal mengunduh file template.', 'error');
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = [...records];
    updated[selectedMonthIdx] = { ...editForm };
    onUpdateRecords(updated, `Diedit Manual (${editForm.namaBulanHijriyah})`);
    onShowToast(`Data isian ${editForm.namaBulanHijriyah} berhasil diperbarui!`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* 1. KOTAK UPLOAD EXCEL / CSV */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Pusat Unggah File Excel / CSV Data Hisab
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Unggah file Excel (<code>.xlsx</code>, <code>.xls</code>) atau <code>.csv</code> untuk memproses koordinat falak secara otomatis tanpa mengarang angka.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSample}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Unduh Template Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-amber-500 bg-amber-500/10' 
              : 'border-stone-700 hover:border-emerald-500 bg-stone-950/60 hover:bg-stone-950'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-stone-800 flex items-center justify-center text-amber-400 shadow-md">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {parsingLoading ? 'Memproses Data File...' : 'Klik atau Tarik File Excel / CSV ke Sini'}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                Mendukung format Sheet Sullamun Nayyirain, Matriks Falak, atau tabel hisab 12 bulan
              </p>
            </div>
          </div>
        </div>

        {/* Active Source Banner */}
        <div className="flex items-center justify-between p-3.5 bg-stone-950/80 rounded-2xl border border-stone-800 text-xs">
          <div className="flex items-center gap-2 text-stone-300">
            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Sumber Data Saat Ini:</span>
            <strong className="text-amber-300">{activeSourceName}</strong>
          </div>
          <div className="text-stone-400">
            Total Bulan Terbaca: <strong className="text-white">{records.length}</strong>
          </div>
        </div>
      </div>

      {/* 2. LEMBAR ISIAN PARAMETER & KOORDINAT MANUAL (SESUAI GAMBAR ISIAN) */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <span>Lembar Isian Parameter &amp; Koordinat Bulan</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Periksa dan sesuaikan koordinat astronomis falak per bulan jika diperlukan.
            </p>
          </div>

          {/* Month selector dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-stone-400">Pilih Bulan:</label>
            <select
              value={selectedMonthIdx}
              onChange={(e) => onSelectMonth(parseInt(e.target.value))}
              className="bg-stone-800 text-white border border-stone-700 rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer"
            >
              {records.map((r, i) => (
                <option key={r.bulanHijriyahKe} value={i}>
                  {r.bulanHijriyahKe}. {r.namaBulanHijriyah} ({r.tahunHijriyah} H)
                </option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleSaveForm} className="space-y-6">
          {/* General info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 mb-1">Nama Bulan Hijriyah</label>
              <input
                type="text"
                value={editForm.namaBulanHijriyah}
                onChange={(e) => setEditForm({ ...editForm, namaBulanHijriyah: e.target.value })}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-bold text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 mb-1">Tahun Hijriyah</label>
              <input
                type="number"
                value={editForm.tahunHijriyah}
                onChange={(e) => setEditForm({ ...editForm, tahunHijriyah: parseInt(e.target.value) || 1447 })}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-bold text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 mb-1">Hari &amp; Pasaran Ijtima'</label>
              <input
                type="text"
                value={editForm.hariPasaranIjtima}
                onChange={(e) => setEditForm({ ...editForm, hariPasaranIjtima: e.target.value })}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 mb-1">Waktu Ijtima' [WIB]</label>
              <input
                type="text"
                value={editForm.jamIjtima}
                onChange={(e) => setEditForm({ ...editForm, jamIjtima: e.target.value })}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-blue-400 font-mono"
              />
            </div>
          </div>

          {/* Hilal & Maghrib values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 mb-1">Waktu Maghrib</label>
              <input
                type="text"
                value={editForm.jamMaghrib}
                onChange={(e) => setEditForm({ ...editForm, jamMaghrib: e.target.value })}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 mb-1">Umur Bulan</label>
              <input
                type="text"
                value={editForm.umurBulanLengkap}
                onChange={(e) => setEditForm({ ...editForm, umurBulanLengkap: e.target.value })}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 mb-1">Tinggi Hilal (h)</label>
              <input
                type="text"
                value={editForm.tinggiHilal}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditForm({ 
                    ...editForm, 
                    tinggiHilal: val,
                    matriks: { ...editForm.matriks, hMoon: val }
                  });
                }}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 mb-1">Lama Hilal Di Atas Ufuk</label>
              <input
                type="text"
                value={editForm.lamaHilalDiatasUfuk}
                onChange={(e) => setEditForm({ ...editForm, lamaHilalDiatasUfuk: e.target.value })}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Posisi & Penetapan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 mb-1">Letak Matahari Terbenam</label>
              <input
                type="text"
                value={editForm.letakMatahariTerbenam}
                onChange={(e) => setEditForm({ ...editForm, letakMatahariTerbenam: e.target.value })}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 mb-1">Posisi Hilal</label>
              <input
                type="text"
                value={editForm.posisiHilal}
                onChange={(e) => setEditForm({ ...editForm, posisiHilal: e.target.value })}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 mb-1">Keadaan Hilal</label>
              <input
                type="text"
                value={editForm.keadaanHilal}
                onChange={(e) => setEditForm({ ...editForm, keadaanHilal: e.target.value })}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Penetapan Akhir */}
          <div>
            <label className="block text-xs font-bold text-stone-400 mb-1">Awal Bulan Ditetapkan (Hari Pasaran &amp; Tanggal Masehi)</label>
            <input
              type="text"
              value={editForm.hariPasaranAwalBulan}
              onChange={(e) => setEditForm({ ...editForm, hariPasaranAwalBulan: e.target.value })}
              className="w-full bg-stone-950 border border-amber-600/50 rounded-xl px-3 py-2 text-xs font-black text-amber-300 font-mono"
            />
          </div>

          {/* Matriks Koordinat Falak Langsung */}
          <div className="pt-4 border-t border-stone-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Koordinat Presisi Matriks Falak (Ekliptika, Ekuator, Horizon):
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-stone-400 block font-sans">λ Matahari Ijtima'</span>
                <input
                  type="text"
                  value={editForm.matriks.lambdaSunIjtima}
                  onChange={(e) => setEditForm({ ...editForm, matriks: { ...editForm.matriks, lambdaSunIjtima: e.target.value } })}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-1.5 text-stone-200"
                />
              </div>

              <div>
                <span className="text-[10px] text-stone-400 block font-sans">λ Bulan Ijtima'</span>
                <input
                  type="text"
                  value={editForm.matriks.lambdaMoonIjtima}
                  onChange={(e) => setEditForm({ ...editForm, matriks: { ...editForm.matriks, lambdaMoonIjtima: e.target.value } })}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-1.5 text-stone-200"
                />
              </div>

              <div>
                <span className="text-[10px] text-stone-400 block font-sans">δ Deklinasi Matahari</span>
                <input
                  type="text"
                  value={editForm.matriks.deltaSun}
                  onChange={(e) => setEditForm({ ...editForm, matriks: { ...editForm.matriks, deltaSun: e.target.value } })}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-1.5 text-stone-200"
                />
              </div>

              <div>
                <span className="text-[10px] text-stone-400 block font-sans">δ Deklinasi Bulan</span>
                <input
                  type="text"
                  value={editForm.matriks.deltaMoon}
                  onChange={(e) => setEditForm({ ...editForm, matriks: { ...editForm.matriks, deltaMoon: e.target.value } })}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-1.5 text-stone-200"
                />
              </div>

              <div>
                <span className="text-[10px] text-stone-400 block font-sans">α Asensiorekta (Derajat)</span>
                <input
                  type="text"
                  value={editForm.matriks.alphaSunDeg}
                  onChange={(e) => setEditForm({ ...editForm, matriks: { ...editForm.matriks, alphaSunDeg: e.target.value } })}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-1.5 text-stone-200"
                />
              </div>

              <div>
                <span className="text-[10px] text-stone-400 block font-sans">α Asensiorekta (Waktu)</span>
                <input
                  type="text"
                  value={editForm.matriks.alphaSunTime}
                  onChange={(e) => setEditForm({ ...editForm, matriks: { ...editForm.matriks, alphaSunTime: e.target.value } })}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-1.5 text-stone-200"
                />
              </div>

              <div>
                <span className="text-[10px] text-stone-400 block font-sans">A Azimuth Matahari</span>
                <input
                  type="text"
                  value={editForm.matriks.aSun}
                  onChange={(e) => setEditForm({ ...editForm, matriks: { ...editForm.matriks, aSun: e.target.value } })}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-1.5 text-stone-200"
                />
              </div>

              <div>
                <span className="text-[10px] text-stone-400 block font-sans">A Azimuth Bulan</span>
                <input
                  type="text"
                  value={editForm.matriks.aMoon}
                  onChange={(e) => setEditForm({ ...editForm, matriks: { ...editForm.matriks, aMoon: e.target.value } })}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-1.5 text-stone-200"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Isian</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
