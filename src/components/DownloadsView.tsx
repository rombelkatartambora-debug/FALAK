import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Download, 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  BookOpen, 
  Database, 
  Search, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  File, 
  FileCode, 
  Image as ImageIcon, 
  Calendar, 
  Clock, 
  HardDrive, 
  Filter, 
  ArrowDownToLine, 
  X, 
  Sparkles, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { CalendarKop, AdminEvent, PersonalNote } from '../types/calendar';

export type FileCategory = 'semua' | 'falak' | 'excel' | 'laporan' | 'unggahan' | 'cadangan';

export interface RepositoryFileItem {
  id: string;
  name: string;
  category: 'falak' | 'excel' | 'laporan' | 'unggahan' | 'cadangan';
  categoryLabel: string;
  description: string;
  fileType: 'pdf' | 'excel' | 'text' | 'image' | 'json' | 'doc' | 'other';
  sizeFormatted: string;
  sizeBytes: number;
  uploadedAt: string;
  uploader: string;
  isSystemFile?: boolean;
  dataUrl?: string; // Untuk file yang diupload user (base64)
  generateContent?: () => { content: string; mimeType: string }; // Untuk file sistem
}

interface DownloadsViewProps {
  kop: CalendarKop;
  adminEvents: AdminEvent[];
  personalNotes: PersonalNote[];
  onImportBackup: (backup: any) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

const STORAGE_KEY = 'rbi_download_center_files_v1';

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  kop,
  adminEvents,
  personalNotes,
  onImportBackup,
  onShowToast
}) => {
  const [userFiles, setUserFiles] = useState<RepositoryFileItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<FileCategory>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  
  // Upload Form State
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState<string>('');
  const [fileCategory, setFileCategory] = useState<'falak' | 'excel' | 'laporan' | 'unggahan'>('unggahan');
  const [fileDescription, setFileDescription] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonRestoreInputRef = useRef<HTMLInputElement | null>(null);

  // Muat file yang tersimpan dari localStorage saat pertama kali dimuat
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: RepositoryFileItem[] = JSON.parse(stored);
        setUserFiles(parsed);
      }
    } catch (e) {
      console.error('Gagal memuat file unggahan tersimpan:', e);
    }
  }, []);

  // Simpan file unggahan ke localStorage
  const saveUserFiles = (files: RepositoryFileItem[]) => {
    try {
      setUserFiles(files);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } catch (e) {
      console.error('Penyimpanan lokal penuh:', e);
      onShowToast('Penyimpanan browser penuh. Coba hapus beberapa berkas lama.', 'error');
    }
  };

  // Helper untuk menentukan tipe berkas dan ekstensi
  const detectFileType = (fileName: string, mimeType?: string): 'pdf' | 'excel' | 'text' | 'image' | 'json' | 'doc' | 'other' => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'pdf';
    if (['xlsx', 'xls', 'csv'].includes(ext)) return 'excel';
    if (['txt', 'md', 'rtf'].includes(ext)) return 'text';
    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) return 'image';
    if (['json', 'js', 'ts'].includes(ext)) return 'json';
    if (['doc', 'docx'].includes(ext)) return 'doc';
    if (mimeType?.includes('image')) return 'image';
    if (mimeType?.includes('sheet') || mimeType?.includes('csv')) return 'excel';
    if (mimeType?.includes('pdf')) return 'pdf';
    return 'other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // =========================================================================
  // BERKAS SISTEM RESMI YANG SELALU SIAP DIUNDUH KAPAN SAJA
  // =========================================================================
  const systemFiles: RepositoryFileItem[] = useMemo(() => [
    {
      id: 'sys-falak-guide',
      name: 'Panduan_Hisab_Falak_Sullamun_Nayyirain_Lengkap.txt',
      category: 'falak',
      categoryLabel: 'Ilmu Falak',
      description: 'Pedoman lengkap hisab falak Kitab Sullamun Nayyirain karya Syaikh Muhammad Manshur Al-Batawi (7 Sheet, Harokat Ulugh Beg & Formula MABIMS).',
      fileType: 'text',
      sizeBytes: 15420,
      sizeFormatted: '15.4 KB',
      uploadedAt: '2026-01-01T00:00:00.000Z',
      uploader: 'Tim Falakiyah Ruang Belajar',
      isSystemFile: true,
      generateContent: () => {
        const text = `================================================================================
PANDUAN LENGKAP HISAB FALAK: KITAB SULLAMUN NAYYIRAIN
Ruang Belajar &bull; Pusat Khazanah Falak Pesantren Nusantara
================================================================================

Nama Kitab   : Sullamun Nayyirain fi Ma'rifati Ijtima'i wa al-Kusufain
Penyusun     : Al-Allamah Asy-Syaikh Muhammad Manshur bin Abdul Hamid Al-Batawi
Tempat/Tahun : Jembatan Lima, Jakarta Barat &bull; 1344 H / 1925 M
Rujukan Asal : Zij Ulugh Beg (Samarkand) & Zij As-Sultan Al-Battani

--------------------------------------------------------------------------------
1. PETA SHEET HITUNGAN MESIN EXCEL SULLAMUN NAYYIRAIN:
--------------------------------------------------------------------------------
[1] SHEET ISIAN     : Lembar kendali utama penentuan tahun Hijriyah, bulan target,
                      nama markaz pengamatan, lintang (LS/LU), bujur (BT/BB), elevasi mdpl.
[2] SHEET EPOCH     : Konstanta harokat peredaran matahari dan bulan menurut kaidah 
                      Sini Majmu'ah (kelipatan 30 tahun) & Sini Mabtsuthah.
[3] SHEET MUADDALAH : Perataan ta'dil bertingkat (Meqowwam Syams, Meqowwam Qamar,
                      Khossoh Muaddalah, Markaz Muaddalah, Ta'dil Awwal & Tsani).
[4] SHEET DATA MEEUS: Validasi perbandingan astronomi modern Jean Meeus (JDE,
                      elongasi geosentrik, selisih menit Ijtima').
[5] SHEET BULANAN   : Rekapitulasi 12 siklus bulan dalam 1 tahun Hijriyah:
                      Hari, pasaran weton, jam Ijtima' WIB, Irtifa' Hakiki & Mar'i,
                      Mukuts (lama di ufuk), Nurul Hilal (jari cahaya), dan status.
[6] SHEET HASIL     : Naskah resmi hisab dalam Bahasa Indonesia dan Teks Matan Arab.
[7] SHEET RUKYAT    : Blanko Berita Acara penetapan awal bulan siap cetak bertandatangan.

--------------------------------------------------------------------------------
2. KONSTANTA EPOCH HAROKAT PER HARI:
--------------------------------------------------------------------------------
- Al-Alamah (الشمس الوسطى)  : 0° 59' 08" per hari
- Al-Khissoh (القمر الوسطي) : 13° 10' 35" per hari
- Al-Khosoh (خاصة القمر)    : 13° 03' 54" per hari
- Al-Markaz (مركز التعديل)  : 12° 11' 27" per hari
- Al-Auj (أوج القمر)        : 0° 06' 41" per hari

--------------------------------------------------------------------------------
3. KRITERIA VISIBILITAS HILAL MABIMS BARU:
--------------------------------------------------------------------------------
- Tinggi Hilal Mar'i Minimal : 3.0° (Tiga Derajat Busur di atas Ufuk Mar'i)
- Sudut Elongasi Minimal    : 6.4° (Enam Koma Empat Derajat Busur)

Diterbitkan resmi untuk kajian santri, pegiat hisab rukyat, dan masyarakat luas.
Ruang Belajar &bull; Lembaga Falakiyah
================================================================================`;
        return { content: text, mimeType: 'text/plain;charset=utf-8;' };
      }
    },
    {
      id: 'sys-rekap-hisab-csv',
      name: 'Format_Excel_Rekapitulasi_Hisab_12_Bulan_Hijriyah.csv',
      category: 'excel',
      categoryLabel: 'Format Excel',
      description: 'Format lembar kerja spreadsheet (CSV) memuat tabel rekapitulasi waktu Ijtima, pasaran Jawa, Irtifa Hilal, Mukuts, dan status awal bulan untuk Microsoft Excel / Google Sheets.',
      fileType: 'excel',
      sizeBytes: 4210,
      sizeFormatted: '4.2 KB',
      uploadedAt: '2026-01-01T00:00:00.000Z',
      uploader: 'Ruang Belajar',
      isSystemFile: true,
      generateContent: () => {
        let csv = `No,Bulan_Hijriyah,Tahun_H,Hari_Ijtima,Weton_Pasaran,Tanggal_Masehi,Bulan_Masehi,Tahun_M,Waktu_Ijtima_WIB,Irtifa_Hakiki,Irtifa_Mari,Mukuts_Menit,Nurul_Hilal_Jari,Status_Hilal\n`;
        const bulanList = ['Muharram', 'Safar', 'Rabiul Awwal', 'Rabiul Akhir', 'Jumadil Ula', 'Jumadil Akhir', 'Rajab', 'Syaban', 'Ramadhan', 'Syawwal', 'Dzulqadah', 'Dzulhijjah'];
        bulanList.forEach((bln, i) => {
          csv += `${i + 1},${bln},1447,Kamis,Kliwon,26,Juni,2025,10:30,4° 12' 30",3° 55' 10",18,0.35,Imkanur Rukyat (Awal Bulan Baru)\n`;
        });
        return { content: csv, mimeType: 'text/csv;charset=utf-8;' };
      }
    },
    {
      id: 'sys-jadwal-sholat-csv',
      name: 'Format_Excel_Blanko_Jadwal_Imsakiyah_30_Hari.csv',
      category: 'excel',
      categoryLabel: 'Format Excel',
      description: 'Template tabel waktu sholat 5 waktu & jadwal imsakiyah 1 bulan penuh dalam format CSV yang siap diedit, dicetak, atau diimpor.',
      fileType: 'excel',
      sizeBytes: 3150,
      sizeFormatted: '3.1 KB',
      uploadedAt: '2026-01-01T00:00:00.000Z',
      uploader: 'Ruang Belajar',
      isSystemFile: true,
      generateContent: () => {
        let csv = `Tanggal_Masehi,Hari,Tanggal_Hijriyah,Imsak,Subuh,Terbit,Dzuhur,Ashar,Maghrib,Isya\n`;
        for (let d = 1; d <= 30; d++) {
          csv += `${d} Ramadhan 1447 H,Hari-${d},${d},04:28,04:38,05:52,11:58,15:10,18:02,19:12\n`;
        }
        return { content: csv, mimeType: 'text/csv;charset=utf-8;' };
      }
    },
    {
      id: 'sys-berita-acara-doc',
      name: 'Blanko_Resmi_Berita_Acara_Rukyatul_Hilal.txt',
      category: 'laporan',
      categoryLabel: 'Laporan & SK',
      description: 'Format naskah ketetapan dan berita acara hisab rukyatul hilal awal bulan Hijriyah lengkap dengan struktur saksi dan tanda tangan pimpinan lembaga.',
      fileType: 'text',
      sizeBytes: 3820,
      sizeFormatted: '3.8 KB',
      uploadedAt: '2026-01-01T00:00:00.000Z',
      uploader: 'Ruang Belajar',
      isSystemFile: true,
      generateContent: () => {
        const text = `================================================================================
BERITA ACARA HISAB & PENETAPAN AWAL BULAN QAMARIYAH
LEMBAGA FALAKIYAH RUANG BELAJAR
Nomor: 014/LF-RB/BA/2026
================================================================================

Pada hari ini, ...................., tanggal ...................., telah dilaksanakan 
perhitungan hisab hisi taqribi Kitab Sullamun Nayyirain karya Syaikh Muhammad Manshur
Al-Batawi untuk penentuan awal bulan .................... 14.... H.

DATA MARKAZ PENGAMATAN:
1. Lokasi Markaz        : .....................................................
2. Koordinat Lintang    : .........° .........' ........." (LS / LU)
3. Koordinat Bujur      : .........° .........' ........." (BT / BB)
4. Elevasi Tempat       : ......... Meter di atas permukaan laut (mdpl)
5. Zona Waktu           : UTC+7 (WIB)

HASIL HISAB IJTIMA' & POSISI HILAL:
1. Waktu Ijtima'        : Hari ...................., Jam .........:......... WIB
2. Ketinggian Hilal     : Irtifa' Hakiki: .........° | Irtifa' Mar'i: .........°
3. Lama Hilal di Ufuk   : ......... Menit (Mukuts)
4. Lebar Cahaya Hilal   : ......... Jari (Isba')
5. Posisi Hilal         : Miring ke ....................
6. Kesimpulan Status    : (Imkanur Rukyat / Wujudul Hilal / Istikmal 30 Hari)

KETETAPAN:
Berdasarkan hasil hisab di atas, maka tanggal 1 .................... 14.... H
ditetapkan jatuh pada hari ...................., tanggal .................... M.

Demikian berita acara ini dibuat dengan sebenarnya untuk dapat dipergunakan
sebagaimana mestinya oleh segenap pengurus dan masyarakat.

Dihisab oleh,                                Mengetahui & Menyetujui,
Tim Ahli Falakiyah                           Pimpinan Lembaga Ruang Belajar


( .................................... )      ( .................................... )
================================================================================`;
        return { content: text, mimeType: 'text/plain;charset=utf-8;' };
      }
    },
    {
      id: 'sys-backup-json',
      name: `Cadangan_Sistem_Ruang_Belajar_${new Date().toISOString().split('T')[0]}.json`,
      category: 'cadangan',
      categoryLabel: 'Cadangan Sistem',
      description: 'Ekspor seluruh konfigurasi Kop Lembaga, agenda resmi, dan catatan pribadi saat ini ke dalam satu berkas terstruktur JSON.',
      fileType: 'json',
      sizeBytes: 6850,
      sizeFormatted: '6.8 KB',
      uploadedAt: new Date().toISOString(),
      uploader: 'Sistem Ruang Belajar',
      isSystemFile: true,
      generateContent: () => {
        const backupData = {
          institution: 'Ruang Belajar',
          system: 'Sistem Kalender Nusantara & Hisab Sulamun Nayyirain',
          exportDate: new Date().toISOString(),
          kop,
          adminEvents,
          personalNotes
        };
        return {
          content: JSON.stringify(backupData, null, 2),
          mimeType: 'application/json;charset=utf-8;'
        };
      }
    }
  ], [kop, adminEvents, personalNotes]);

  // Gabungkan file sistem dan file yang diupload user
  const allFiles: RepositoryFileItem[] = useMemo(() => {
    return [...systemFiles, ...userFiles];
  }, [systemFiles, userFiles]);

  // Filter & Search
  const filteredFiles = useMemo(() => {
    return allFiles.filter(item => {
      // Filter kategori
      if (activeCategory !== 'semua') {
        if (activeCategory === 'unggahan' && !item.dataUrl) return false;
        if (activeCategory !== 'unggahan' && item.category !== activeCategory) return false;
      }
      // Filter kata kunci pencarian
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchCat = item.categoryLabel.toLowerCase().includes(q);
        return matchName || matchDesc || matchCat;
      }
      return true;
    });
  }, [allFiles, activeCategory, searchQuery]);

  // Handler Download Berkas
  const handleDownloadFile = (file: RepositoryFileItem) => {
    try {
      if (file.isSystemFile && file.generateContent) {
        // Generate content dinamis
        const { content, mimeType } = file.generateContent();
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onShowToast(`Berkas "${file.name}" berhasil diunduh!`);
      } else if (file.dataUrl) {
        // Unduh berkas user (base64)
        const a = document.createElement('a');
        a.href = file.dataUrl;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        onShowToast(`Berkas "${file.name}" berhasil diunduh!`);
      } else {
        onShowToast('Berkas tidak dapat diunduh.', 'error');
      }
    } catch (err) {
      console.error('Gagal mengunduh:', err);
      onShowToast('Terjadi kesalahan saat mengunduh berkas.', 'error');
    }
  };

  // Handler Hapus Berkas User
  const handleDeleteUserFile = (id: string, name: string) => {
    if (window.confirm(`Hapus berkas "${name}" dari pusat unduhan?`)) {
      const updated = userFiles.filter(f => f.id !== id);
      saveUserFiles(updated);
      onShowToast(`Berkas "${name}" berhasil dihapus.`);
    }
  };

  // Handler Upload Berkas Baru
  const handleSelectFileToUpload = (file: File) => {
    // Validasi ukuran (maksimum 6MB untuk localStorage)
    if (file.size > 6 * 1024 * 1024) {
      onShowToast('Ukuran berkas melebihi batas 6 MB untuk penyimpanan lokal.', 'error');
      return;
    }
    setSelectedUploadFile(file);
    if (!customFileName) {
      setCustomFileName(file.name);
    }
  };

  const handleProcessUpload = () => {
    if (!selectedUploadFile) {
      onShowToast('Silakan pilih berkas yang akan diunggah.', 'error');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const base64Data = e.target?.result as string;
        const finalName = customFileName.trim() || selectedUploadFile.name;
        const detectedType = detectFileType(finalName, selectedUploadFile.type);

        const newFileItem: RepositoryFileItem = {
          id: `usr-file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: finalName,
          category: fileCategory,
          categoryLabel: fileCategory === 'falak' 
            ? 'Ilmu Falak' 
            : fileCategory === 'excel' 
            ? 'Format Excel' 
            : fileCategory === 'laporan' 
            ? 'Laporan & SK' 
            : 'Berkas Pengguna',
          description: fileDescription.trim() || `Berkas ${selectedUploadFile.name} diunggah pada ${new Date().toLocaleDateString('id-ID')}`,
          fileType: detectedType,
          sizeBytes: selectedUploadFile.size,
          sizeFormatted: formatFileSize(selectedUploadFile.size),
          uploadedAt: new Date().toISOString(),
          uploader: 'Pengguna / Pengurus',
          dataUrl: base64Data
        };

        const updated = [newFileItem, ...userFiles];
        saveUserFiles(updated);

        // Reset Form
        setSelectedUploadFile(null);
        setCustomFileName('');
        setFileDescription('');
        setIsUploadModalOpen(false);
        setIsUploading(false);
        onShowToast(`Berkas "${finalName}" berhasil diunggah dan siap diunduh!`);
      } catch (err) {
        console.error('Error saat menyimpan unggahan:', err);
        setIsUploading(false);
        onShowToast('Gagal memproses unggahan berkas.', 'error');
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      onShowToast('Gagal membaca berkas.', 'error');
    };

    reader.readAsDataURL(selectedUploadFile);
  };

  // Restore Backup JSON File Handler
  const handleRestoreBackupJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          onImportBackup(parsed);
          onShowToast('Data cadangan sistem berhasil dipulihkan!');
        } catch {
          onShowToast('Format file JSON cadangan tidak valid.', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  // Ikon Berdasarkan Tipe File
  const renderFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        );
      case 'excel':
        return (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        );
      case 'text':
        return (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        );
      case 'image':
        return (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        );
      case 'json':
        return (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <FileCode className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <File className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        );
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. TOP BANNER UTAMA PUSAT UNDUHAN & UNGGAHAN */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-blue-950 via-stone-900 to-indigo-950 text-white border border-blue-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-700/30 shrink-0">
            <Download className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-400/30">
                Pusat Berkas & Dokumen
              </span>
              <span className="text-xs text-stone-300 font-arabic">مركز التحميل والرفع</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Pusat Unduhan & Unggahan Berkas
            </h2>
            <p className="text-xs text-blue-200/90 mt-0.5">
              Kelola dokumen, unggah file baru, dan unduh materi hisab falak, format spreadsheet, blanko SK, serta cadangan sistem Ruang Belajar.
            </p>
          </div>
        </div>

        {/* Tombol Aksi Cepat: Upload Berkas Baru & Pulihkan Backup */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102"
          >
            <Upload className="w-4 h-4" />
            <span>Unggah Berkas Baru</span>
          </button>

          <input
            ref={jsonRestoreInputRef}
            type="file"
            accept=".json"
            onChange={handleRestoreBackupJson}
            className="hidden"
          />
          <button
            onClick={() => jsonRestoreInputRef.current?.click()}
            title="Pulihkan data sistem dari file cadangan JSON"
            className="py-2.5 px-3 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white font-semibold text-xs border border-stone-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Pulihkan JSON</span>
          </button>
        </div>
      </div>

      {/* 2. STATISTIK RINGKAS BERKAS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">Total Berkas</span>
            <span className="text-base sm:text-lg font-black text-white">{allFiles.length} Berkas</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">Unggahan Pengguna</span>
            <span className="text-base sm:text-lg font-black text-emerald-400">{userFiles.length} Berkas</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">Dokumen Resmi</span>
            <span className="text-base sm:text-lg font-black text-amber-400">{systemFiles.length} Berkas</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">Status Akses</span>
            <span className="text-base sm:text-lg font-black text-indigo-300">Siap Unduh</span>
          </div>
        </div>
      </div>

      {/* 3. CONTROLS: PENCARIAN & FILTER KATEGORI */}
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Input Pencarian */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berkas berdasarkan nama, format, atau deskripsi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-blue-500 text-xs sm:text-sm text-white placeholder-stone-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tombol Tambah Berkas Cepat */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="py-2.5 px-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-700 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Upload Berkas</span>
          </button>
        </div>

        {/* Tab Kategori Berkas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold custom-scrollbar">
          {[
            { key: 'semua', label: 'Semua Berkas' },
            { key: 'falak', label: '📖 Modul Falak' },
            { key: 'excel', label: '📊 Format Excel/CSV' },
            { key: 'laporan', label: '📜 Laporan & Blanko' },
            { key: 'unggahan', label: '📁 Berkas Unggahan' },
            { key: 'cadangan', label: '💾 Cadangan Sistem' }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key as FileCategory)}
              className={`py-1.5 px-3 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-stone-400 hover:text-white bg-stone-950/60 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. DAFTAR BERKAS (FILE REPOSITORY LIST) */}
      <div className="space-y-3">
        {filteredFiles.length === 0 ? (
          <div className="p-10 rounded-3xl bg-stone-900 border border-stone-800 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-stone-800 text-stone-500 mx-auto flex items-center justify-center">
              <File className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white">Tidak Ada Berkas yang Ditemukan</h4>
            <p className="text-xs text-stone-400 max-w-md mx-auto">
              {searchQuery 
                ? `Tidak ditemukan berkas yang cocok dengan kata kunci "${searchQuery}". Silakan coba kata kunci lain.`
                : 'Belum ada berkas pada kategori ini. Anda dapat mengunggah berkas baru sekarang.'}
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Unggah Berkas Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition-all flex flex-col justify-between space-y-3.5 shadow-sm group"
              >
                {/* Header File Info */}
                <div className="flex items-start gap-3.5">
                  {renderFileIcon(file.fileType)}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700/80">
                        {file.categoryLabel}
                      </span>
                      {file.isSystemFile ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Resmi
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Unggahan
                        </span>
                      )}
                      <span className="text-[10px] text-stone-500 font-mono ml-auto">
                        {file.sizeFormatted}
                      </span>
                    </div>

                    <h4 
                      title={file.name}
                      className="font-bold text-sm text-white break-words group-hover:text-blue-300 transition-colors"
                    >
                      {file.name}
                    </h4>

                    <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">
                      {file.description}
                    </p>
                  </div>
                </div>

                {/* Footer: Metadata & Tombol Aksi Unduh */}
                <div className="pt-2.5 border-t border-stone-800/80 flex items-center justify-between gap-2 text-[11px] text-stone-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span className="truncate">
                      {new Date(file.uploadedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="text-stone-600">&bull;</span>
                    <span className="truncate text-stone-500">{file.uploader}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Tombol Hapus untuk berkas yang diupload user */}
                    {!file.isSystemFile && (
                      <button
                        onClick={() => handleDeleteUserFile(file.id, file.name)}
                        title="Hapus berkas ini"
                        className="p-2 rounded-xl bg-stone-800/80 hover:bg-red-950/60 text-stone-400 hover:text-red-400 transition-colors cursor-pointer border border-stone-700/60"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Tombol Unduh Berkas */}
                    <button
                      onClick={() => handleDownloadFile(file)}
                      className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-600/20 hover:scale-102"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                      <span>Unduh File</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL FORM UNGGAH BERKAS BARU */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Unggah Berkas Baru</h3>
                  <p className="text-xs text-stone-400">Pilih dokumen, PDF, gambar, atau berkas untuk disimpan dan diunduh</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedUploadFile(null);
                }}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              
              {/* Drag & Drop File Picker Box */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleSelectFileToUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-950/20'
                    : selectedUploadFile
                    ? 'border-emerald-600/70 bg-stone-950'
                    : 'border-stone-700 bg-stone-950/60 hover:border-emerald-500 hover:bg-stone-950'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleSelectFileToUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {selectedUploadFile ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-white text-sm block truncate max-w-xs">
                        {selectedUploadFile.name}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono">
                        {formatFileSize(selectedUploadFile.size)} &bull; {selectedUploadFile.type || 'Berkas'}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 underline mt-1">
                      Klik untuk mengganti berkas lain
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-stone-800 text-stone-400 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm block">
                        Klik untuk memilih berkas atau seret ke sini
                      </span>
                      <span className="text-[11px] text-stone-400 mt-0.5 block">
                        Mendukung PDF, Excel (XLSX, CSV), Word, Gambar, Teks, JSON (Maks. 6 MB)
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Form Input Detail Berkas */}
              <div className="space-y-3">
                {/* Nama File */}
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Nama Tampilan Berkas:
                  </label>
                  <input
                    type="text"
                    value={customFileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                    placeholder="Contoh: SK_Penetapan_Hilal_Ramadhan.pdf"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 focus:border-blue-500 text-white font-mono text-xs outline-none"
                  />
                </div>

                {/* Pilihan Kategori */}
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Kategori Berkas:
                  </label>
                  <select
                    value={fileCategory}
                    onChange={(e) => setFileCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 focus:border-blue-500 text-white text-xs outline-none cursor-pointer"
                  >
                    <option value="unggahan">📁 Berkas Unggahan Umum</option>
                    <option value="falak">📖 Khazanah & Materi Falak</option>
                    <option value="excel">📊 Lembar Kerja Excel / CSV</option>
                    <option value="laporan">📜 Laporan Resmi & Blanko SK</option>
                  </select>
                </div>

                {/* Deskripsi Singkat */}
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Deskripsi / Catatan Keterangan Berkas (Opsional):
                  </label>
                  <textarea
                    rows={2}
                    value={fileDescription}
                    onChange={(e) => setFileDescription(e.target.value)}
                    placeholder="Tuliskan ringkasan isi dokumen atau panduan penggunaan..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 focus:border-blue-500 text-white text-xs outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-800 bg-stone-950/60 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedUploadFile(null);
                }}
                className="py-2 px-4 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 font-semibold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                onClick={handleProcessUpload}
                disabled={!selectedUploadFile || isUploading}
                className="py-2 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                {isUploading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Unggah Berkas Sekarang</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
