import React, { useState, useRef } from 'react';
import { 
  FalakMonthRecord, 
  DAFTAR_BULAN_HIJRIYAH,
  createDynamicFalakRecord,
  generateFormatRingkasText,
  generateFormatDetailText,
  generateFormatMatriksText
} from '../utils/almansuriyahFalakData';
import { 
  Edit3, 
  Save, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Image as ImageIcon, 
  Printer, 
  Copy, 
  Check, 
  Loader2, 
  Share2, 
  Smartphone, 
  RotateCcw, 
  BookOpen, 
  Layers, 
  FileCheck2,
  Award
} from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import { getHijriDate } from '../utils/calendarMath';

interface ReportRingkasViewProps {
  currentRecord: FalakMonthRecord;
  onUpdateRecord: (updated: FalakMonthRecord) => void;
  onSelectBulanTahun: (bulanKe: number, tahunH: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
  onOpenHasilLengkap?: () => void;
}

export const ReportRingkasView: React.FC<ReportRingkasViewProps> = ({
  currentRecord,
  onUpdateRecord,
  onSelectBulanTahun,
  onShowToast,
  onOpenHasilLengkap
}) => {
  // Ref Dokumen 1 Lembar Standar A4 Resmi (Sesuai contoh PDF fisik LHFA)
  const singlePageA4Ref = useRef<HTMLDivElement>(null);

  // Refs untuk Format 2 Lembar Terpisah
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const sheet1Ref = useRef<HTMLDivElement>(null);
  const sheet2Ref = useRef<HTMLDivElement>(null);

  // State Pilihan Tampilan: default 'a4' (1 Lembar Standar A4 Resmi), 'keduanya', 'lembar1', 'lembar2'
  const [activeSheetTab, setActiveSheetTab] = useState<'a4' | 'keduanya' | 'lembar1' | 'lembar2'>('a4');

  // State Ekspor HD
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportType, setExportType] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // Mode Ganti Isian (Edit form)
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<FalakMonthRecord>(currentRecord);

  // Sync edit form whenever currentRecord changes and not in middle of unsaved edit
  React.useEffect(() => {
    setEditForm(currentRecord);
  }, [currentRecord]);

  // Handler input manual Bulan Ke & Tahun Ke di bar atas
  const handleBulanKeChange = (valStr: string) => {
    const val = parseInt(valStr, 10);
    if (!isNaN(val) && val >= 1 && val <= 12) {
      onSelectBulanTahun(val, currentRecord.tahunHijriyah);
    }
  };

  const handleTahunKeChange = (valStr: string) => {
    const val = parseInt(valStr, 10);
    if (!isNaN(val) && val > 0 && val < 3000) {
      onSelectBulanTahun(currentRecord.bulanHijriyahKe, val);
    }
  };

  // Simpan hasil "Ganti Isian"
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRecord(editForm);
    setIsEditing(false);
    onShowToast('Perubahan isian data hisab berhasil disimpan!');
  };

  const handleOpenEdit = () => {
    setEditForm(JSON.parse(JSON.stringify(currentRecord)));
    setIsEditing(true);
  };

  // Reset ke Bulan & Tahun Hijriyah Hari Ini / Sekarang
  const handleResetHariIni = () => {
    const todayHijri = getHijriDate(new Date());
    onSelectBulanTahun(todayHijri.month + 1, todayHijri.year);
    setIsEditing(false);
    onShowToast(`Reset ke bulan ${todayHijri.month + 1} (${todayHijri.monthName}) ${todayHijri.year} H (Hari Ini)`);
  };

  // Filter untuk mengecualikan elemen bertanda data-export-ignore saat ekspor gambar/PDF
  const exportFilter = (node: HTMLElement) => {
    return !(node.dataset && node.dataset.exportIgnore === 'true');
  };

  // 1. Ekspor Dokumen Resmi HD (PDF) - Mendukung 1 Lembar Standar A4 Resmi & Opsi 2 Lembar
  const handleExportPdf = async (forceMode?: 'a4' | '2lembar') => {
    if (isExporting) return;
    const mode = forceMode || (activeSheetTab === 'a4' ? 'a4' : '2lembar');

    try {
      setIsExporting(true);
      setExportType('PDF');

      const options = {
        filter: exportFilter,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        quality: 0.96,
        fontEmbedCSS: '',
        skipFonts: true
      };

      // Buat PDF A4 Potret standar (210 x 297 mm)
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const marginSide = 8; // Margin samping 8mm agar bingkai hijau utuh dan simetris
      const marginTop = 8; // Margin atas: Kop surat tepat di bagian atas kertas
      const marginBottom = 8; // Margin bawah aman
      const maxPrintWidth = pageWidth - marginSide * 2;
      const maxPrintHeight = pageHeight - marginTop - marginBottom;

      // Helper untuk memposisikan lembar dokumen tepat di tengah horizontal, dengan Kop Surat di atas
      const renderPageToPdf = async (element: HTMLElement) => {
        const dataUrl = await toJpeg(element, options);
        const img = new Image();
        img.src = dataUrl;
        await new Promise((r) => { img.onload = r; });

        const imgAspect = img.width / img.height;
        let printW = maxPrintWidth;
        let printH = printW / imgAspect;

        if (printH > maxPrintHeight) {
          printH = maxPrintHeight;
          printW = printH * imgAspect;
        }

        const xPos = (pageWidth - printW) / 2; // Tepat di tengah horizontal
        const yPos = marginTop;                 // Di atas kertas: Kop surat berada di atas

        return { dataUrl, xPos, yPos, printW, printH };
      };

      if (mode === 'a4' && singlePageA4Ref.current) {
        // EKSPOR 1 LEMBAR UTUH STANDAR A4 RESMI (Sesuai contoh pdf.png)
        const page = await renderPageToPdf(singlePageA4Ref.current);
        pdf.addImage(page.dataUrl, 'JPEG', page.xPos, page.yPos, page.printW, page.printH, undefined, 'FAST');
        pdf.save(`Dokumen_Hisab_Resmi_A4_${currentRecord.namaBulanHijriyah}_${currentRecord.tahunHijriyah}H.pdf`);
        onShowToast('Dokumen Resmi A4 (1 Lembar Lengkap) berhasil diunduh!');
      } else if (sheet1Ref.current && sheet2Ref.current) {
        // EKSPOR 2 LEMBAR TERPISAH
        const page1 = await renderPageToPdf(sheet1Ref.current);
        pdf.addImage(page1.dataUrl, 'JPEG', page1.xPos, page1.yPos, page1.printW, page1.printH, undefined, 'FAST');

        pdf.addPage('a4', 'portrait');
        const page2 = await renderPageToPdf(sheet2Ref.current);
        pdf.addImage(page2.dataUrl, 'JPEG', page2.xPos, page2.yPos, page2.printW, page2.printH, undefined, 'FAST');
        pdf.save(`Dokumen_Hisab_Almansuriyah_2Lembar_${currentRecord.namaBulanHijriyah}_${currentRecord.tahunHijriyah}H.pdf`);
        onShowToast('Dokumen Resmi 2 Lembar (PDF) berhasil diunduh!');
      }

      confetti({ particleCount: 45, spread: 70, origin: { y: 0.8 } });
    } catch (err) {
      console.error(err);
      onShowToast('Gagal membuat dokumen PDF', 'error');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // 2. Ekspor Gambar (PNG / JPG)
  const handleExportImage = async (format: 'png' | 'jpg') => {
    let targetRef: HTMLElement | null = null;
    if (activeSheetTab === 'a4') {
      targetRef = singlePageA4Ref.current;
    } else if (activeSheetTab === 'lembar1') {
      targetRef = sheet1Ref.current;
    } else if (activeSheetTab === 'lembar2') {
      targetRef = sheet2Ref.current;
    } else {
      targetRef = reportContainerRef.current;
    }

    if (!targetRef || isExporting) return;

    try {
      setIsExporting(true);
      setExportType(`IMG_${format.toUpperCase()}`);

      const options = {
        filter: exportFilter,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        cacheBust: true,
        fontEmbedCSS: '',
        skipFonts: true
      };

      const dataUrl = format === 'png'
        ? await toPng(targetRef, options)
        : await toJpeg(targetRef, { ...options, quality: 0.96 });

      const link = document.createElement('a');
      link.download = `Dokumen_Hisab_Resmi_${currentRecord.namaBulanHijriyah}_${currentRecord.tahunHijriyah}H.${format}`;
      link.href = dataUrl;
      link.click();

      confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
      onShowToast(`Gambar Dokumen Resmi (${format.toUpperCase()} HD) berhasil diunduh!`);
    } catch (err) {
      console.error(err);
      onShowToast('Gagal mengunduh gambar dokumen', 'error');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // 3. Cetak Langsung (Print)
  const handlePrint = () => {
    window.print();
  };

  // 4. Bagikan ke WhatsApp
  const handleShareWhatsApp = async () => {
    const targetRef = singlePageA4Ref.current || sheet1Ref.current;
    if (!targetRef || isExporting) return;
    const filenameBase = `Laporan_Hisab_${currentRecord.namaBulanHijriyah}_${currentRecord.tahunHijriyah}H`;

    if (navigator.share) {
      try {
        setIsExporting(true);
        setExportType('SHARE');
        const dataUrl = await toPng(targetRef, {
          filter: exportFilter,
          pixelRatio: 2.2,
          backgroundColor: '#ffffff',
          fontEmbedCSS: '',
          skipFonts: true
        });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `${filenameBase}_Resmi.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Laporan Hisab ${currentRecord.namaBulanHijriyah} ${currentRecord.tahunHijriyah} H`,
            text: `Ketetapan Lembaga Hisab Falakiyah Almansuriyah: Awal ${currentRecord.namaBulanHijriyah} ${currentRecord.tahunHijriyah} H jatuh pada ${currentRecord.hariPasaranAwalBulan}. Berkas resmi standar A4.`,
            files: [file]
          });
          onShowToast('Berhasil dibagikan ke WhatsApp!');
        } else {
          await navigator.share({
            title: `Laporan Hisab ${currentRecord.namaBulanHijriyah} ${currentRecord.tahunHijriyah} H`,
            text: `Ketetapan Lembaga Hisab Falakiyah Almansuriyah: Awal ${currentRecord.namaBulanHijriyah} ${currentRecord.tahunHijriyah} H jatuh pada ${currentRecord.hariPasaranAwalBulan}.`
          });
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleExportImage('png');
        }
      } finally {
        setIsExporting(false);
        setExportType(null);
      }
    } else {
      handleExportImage('png');
    }
  };

  // 5. Salin Naskah Teks Resmi
  const handleCopyText = () => {
    const text = `================================================================================
LEMBAGA HISAB FALAKIYAH ALMANSURIYAH JAKARTA
Ketetapan Hisab Kitab Sullamun Nayyirain (Dokumen Resmi Standar A4)
================================================================================
BAGIAN 1: KETETAPAN & HASIL RINGKAS
--------------------------------------------------------------------------------
${generateFormatRingkasText(currentRecord)}

RINCIAN 8 PARAMETER FALAK:
${generateFormatDetailText(currentRecord)}

================================================================================
BAGIAN 2: LAMPIRAN MATRIKS KOORDINAT ASTRONOMIS
--------------------------------------------------------------------------------
${generateFormatMatriksText(currentRecord)}
`;
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    onShowToast('Teks naskah hisab resmi berhasil disalin!');
    setTimeout(() => setHasCopied(false), 3000);
  };

  // Navigasi Cepat Bulan Hijriyah
  const handlePrevBulan = () => {
    if (currentRecord.bulanHijriyahKe > 1) {
      onSelectBulanTahun(currentRecord.bulanHijriyahKe - 1, currentRecord.tahunHijriyah);
    } else {
      onSelectBulanTahun(12, currentRecord.tahunHijriyah - 1);
    }
  };

  const handleNextBulan = () => {
    if (currentRecord.bulanHijriyahKe < 12) {
      onSelectBulanTahun(currentRecord.bulanHijriyahKe + 1, currentRecord.tahunHijriyah);
    } else {
      onSelectBulanTahun(1, currentRecord.tahunHijriyah + 1);
    }
  };

  const m = currentRecord.matriks;

  // Komponen Kop Surat Resmi Lembaga Hisab Falakiyah Almansuriyah (Presisi 100% Tepat di Tengah Kertas)
  const renderOfficialKopSurat = () => (
    <div className="border-b-4 border-double border-stone-800 pb-2.5 mb-2.5 relative">
      <div className="relative flex items-center justify-center min-h-[70px] sm:min-h-[82px]">
        {/* 1. Logo Lembaga di Sisi Kiri Mutlak */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center shrink-0">
          <img 
            src="/logo.png" 
            alt="Logo Lembaga" 
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/LOGO.png'; }}
            className="w-14 h-14 sm:w-18 sm:h-18 object-contain drop-shadow" 
          />
        </div>

        {/* 2. Teks Identitas Resmi 100% Presisi di Tengah Kertas */}
        <div className="text-center w-full px-16 sm:px-20">
          <h1 className="text-xs sm:text-base md:text-lg lg:text-xl font-black tracking-tight text-[#064e3b] uppercase leading-tight">
            LEMBAGA HISAB FALAKIYAH ALMANSURIYAH
          </h1>
          <h2 className="text-[10px] sm:text-xs font-bold text-[#92400e] tracking-wider uppercase mt-0.5">
            BADAN HISAB &amp; RUKYAT HILAL METODE SULLAM AN-NAYYIRAIN
          </h2>
          <p className="text-[8.5px] sm:text-[9.5px] text-stone-600 mt-0.5 leading-tight">
            Markaz Falakiyah: Masjid Jami' Al-Mansur Jembatan Lima, Jakarta Barat 11250
          </p>
          <p className="text-[8px] sm:text-[9px] text-stone-500 mt-0.5 font-mono">
            Lintang: 06° 09' 00" LS &bull; Bujur: 106° 48' 27" BT &bull; Ketinggian: 7 m DPL
          </p>
        </div>
      </div>
    </div>
  );

  // Komponen Tanda Tangan & Stempel Resmi
  const renderOfficialSignatures = (tanggalText: string) => (
    <div className="pt-2 flex items-end justify-between gap-2 text-xs">
      <div className="text-center w-48 sm:w-56">
        <p className="font-bold text-[11px] sm:text-xs text-stone-900">Ketua Umum LHFA,</p>
        <div className="h-14 sm:h-16 flex items-center justify-center">
          {/* Ruang tanda tangan resmi yang lega */}
        </div>
        <p className="font-bold underline text-[11px] sm:text-xs text-stone-900">H. xxxxxxxxxxxxx, S.Ag., M.H.</p>
      </div>

      {/* STEMPEL RESMI */}
      <div className="flex flex-col items-center justify-center mb-1">
        <img 
          src="/stempel.png" 
          alt="Stempel Resmi" 
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/STEMPEL.png'; }}
          className="w-18 h-18 sm:w-22 sm:h-22 object-contain opacity-90 drop-shadow-sm select-none pointer-events-none" 
        />
      </div>

      <div className="text-center w-48 sm:w-56">
        <p className="text-stone-500 text-[9px] sm:text-[10px]">Jakarta, {tanggalText}</p>
        <p className="font-bold text-[11px] sm:text-xs text-stone-900 mt-0.5">Sekretaris Lembaga,</p>
        <div className="h-14 sm:h-16 flex items-center justify-center">
          {/* Ruang tanda tangan resmi yang lega */}
        </div>
        <p className="font-bold underline text-[11px] sm:text-xs text-stone-900">KH. xxxxxxxxxxxxx, S.Ag., M.H.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* CSS Khusus Print & Hilangkan Scrollbar Secara Menyeluruh */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .sheet-page-break {
            page-break-after: always !important;
            break-after: page !important;
          }
          .lembar-card {
            box-shadow: none !important;
            border: 4px solid #064e3b !important;
            border-radius: 16px !important;
            margin-bottom: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
        /* Mencegah scrollbar muncul di lembar card & tabel saat ekspor gambar atau di layar */
        .lembar-card, .lembar-card * {
          box-sizing: border-box !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .lembar-card::-webkit-scrollbar, .lembar-card *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>

      {/* 1. BAR KONTROL BULAN, TAHUN & AKSI CEPAT */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 print:hidden">
        {/* Pemilihan Bulan & Tahun */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 w-full md:w-auto">
          {/* Tombol Prev Bulan */}
          <button
            onClick={handlePrevBulan}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Input Nomor Bulan Ke (1-12) */}
          <div className="flex items-center gap-1.5 bg-stone-950 px-2.5 py-1 rounded-xl border border-stone-800">
            <span className="text-[11px] font-bold text-stone-400">Bulan Ke:</span>
            <input
              type="number"
              min="1"
              max="12"
              value={currentRecord.bulanHijriyahKe}
              onChange={(e) => handleBulanKeChange(e.target.value)}
              className="w-12 bg-transparent text-amber-400 font-mono font-bold text-center text-sm outline-none"
              title="Bulan Hijriyah ke 1 s.d. 12"
            />
            <span className="text-stone-300 font-bold text-xs truncate max-w-[100px] sm:max-w-none">
              ({currentRecord.namaBulanHijriyah})
            </span>
          </div>

          {/* Input Tahun Hijriyah */}
          <div className="flex items-center gap-1.5 bg-stone-950 px-2.5 py-1 rounded-xl border border-stone-800">
            <span className="text-[11px] font-bold text-stone-400">Tahun:</span>
            <input
              type="number"
              value={currentRecord.tahunHijriyah}
              onChange={(e) => handleTahunKeChange(e.target.value)}
              className="w-16 bg-transparent text-emerald-400 font-mono font-bold text-center text-sm outline-none"
              title="Tahun Hijriyah"
            />
            <span className="text-stone-400 text-xs font-bold">H</span>
          </div>

          {/* Tombol Next Bulan */}
          <button
            onClick={handleNextBulan}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Tombol Hari Ini / Sekarang */}
          <button
            onClick={handleResetHariIni}
            className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset ke Bulan & Tahun Hijriyah Sekarang"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hari Ini</span>
          </button>
        </div>

        {/* Tombol Aksi Tambahan: Ganti Isian, Cetak, Lihat Lembar Lengkap */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Tombol Ganti Isian */}
          <button
            onClick={handleOpenEdit}
            className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950 transition-all cursor-pointer"
            title="Edit nilai falak dan koordinat secara manual"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Ganti Isian</span>
          </button>

          {/* Tombol Cetak Langsung */}
          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Cetak Dokumen ke Printer / PDF"
          >
            <Printer className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          {/* Shortcut ke Hasil Lengkap jika ada */}
          {onOpenHasilLengkap && (
            <button
              onClick={onOpenHasilLengkap}
              className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Buka Lembar Lengkap Surat Keputusan & Blanko 38 Baris"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Berkas Lengkap</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. TAB PEMILIH FORMAT TAMPILAN DI LAYAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-900 border border-stone-800 p-1.5 rounded-2xl print:hidden">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* TAB DEFAULT: 1 LEMBAR STANDAR A4 RESMI (SESUAI CONTOH PDF) */}
          <button
            onClick={() => setActiveSheetTab('a4')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSheetTab === 'a4'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>1 Lembar Standar A4 (Format Resmi)</span>
          </button>

          {/* TAB OPSIONAL: FORMAT 2 LEMBAR TERPISAH */}
          <button
            onClick={() => setActiveSheetTab('keduanya')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSheetTab === 'keduanya'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Format 2 Lembar</span>
          </button>

          <button
            onClick={() => setActiveSheetTab('lembar1')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSheetTab === 'lembar1'
                ? 'bg-stone-700 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lembar 1 Saja</span>
          </button>

          <button
            onClick={() => setActiveSheetTab('lembar2')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSheetTab === 'lembar2'
                ? 'bg-stone-700 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Lembar 2 Saja</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-stone-400 pr-2">
          <span>Standar:</span>
          <span className="text-emerald-400 font-bold">A4 Potret Tunggal (Ketetapan &amp; Matriks Lengkap)</span>
        </div>
      </div>

      {/* MODAL / FORM "GANTI ISIAN" */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Form */}
            <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-white text-base">Ganti Isian Parameter Hisab &amp; Matriks</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Isi Form */}
            <form onSubmit={handleSaveEdit} className="p-4 sm:p-6 overflow-y-auto space-y-6">
              {/* Bagian 1: Data Pokok */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Ketetapan &amp; Waktu Awal Bulan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Hari &amp; Pasaran Awal Bulan</label>
                    <input
                      type="text"
                      value={editForm.hariPasaranAwalBulan}
                      onChange={(e) => setEditForm({ ...editForm, hariPasaranAwalBulan: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Hari &amp; Pasaran Ijtima'</label>
                    <input
                      type="text"
                      value={editForm.hariPasaranIjtima}
                      onChange={(e) => setEditForm({ ...editForm, hariPasaranIjtima: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Tanggal Masehi Ijtima'</label>
                    <input
                      type="text"
                      value={editForm.tanggalMasehiIjtima}
                      onChange={(e) => setEditForm({ ...editForm, tanggalMasehiIjtima: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Jam Ijtima' (WIB)</label>
                    <input
                      type="text"
                      value={editForm.jamIjtima}
                      onChange={(e) => setEditForm({ ...editForm, jamIjtima: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Jam Maghrib (WIB)</label>
                    <input
                      type="text"
                      value={editForm.jamMaghrib}
                      onChange={(e) => setEditForm({ ...editForm, jamMaghrib: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Tinggi Hilal</label>
                    <input
                      type="text"
                      value={editForm.tinggiHilal}
                      onChange={(e) => setEditForm({ ...editForm, tinggiHilal: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-red-400 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: 8 Parameter Rinci */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Parameter Lanjutan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Umur Bulan Lengkap</label>
                    <input
                      type="text"
                      value={editForm.umurBulanLengkap}
                      onChange={(e) => setEditForm({ ...editForm, umurBulanLengkap: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Letak Matahari Terbenam</label>
                    <input
                      type="text"
                      value={editForm.letakMatahariTerbenam}
                      onChange={(e) => setEditForm({ ...editForm, letakMatahariTerbenam: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Posisi Hilal</label>
                    <input
                      type="text"
                      value={editForm.posisiHilal}
                      onChange={(e) => setEditForm({ ...editForm, posisiHilal: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Keadaan Hilal</label>
                    <input
                      type="text"
                      value={editForm.keadaanHilal}
                      onChange={(e) => setEditForm({ ...editForm, keadaanHilal: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Lama Hilal Diatas Ufuk</label>
                    <input
                      type="text"
                      value={editForm.lamaHilalDiatasUfuk}
                      onChange={(e) => setEditForm({ ...editForm, lamaHilalDiatasUfuk: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Status Visibilitas</label>
                    <input
                      type="text"
                      value={editForm.statusHilal}
                      onChange={(e) => setEditForm({ ...editForm, statusHilal: e.target.value as any })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-emerald-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Tombol Simpan Form */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs sm:text-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-950 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan Isian</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3A. DOKUMEN RESMI STANDAR A4 (1 LEMBAR UTUH LENGKAP - SESUAI CONTOH PDF)    */}
      {/* ========================================================================= */}
      <div 
        className={activeSheetTab === 'a4' ? 'block' : 'hidden print:hidden'}
      >
        <div 
          ref={singlePageA4Ref}
          id="dokumen-resmi-a4-lhfa"
          className="lembar-card bg-white text-stone-900 rounded-2xl shadow-xl border-4 border-[#064e3b] overflow-visible transition-all box-border p-4 sm:p-6 md:p-7 space-y-3 max-w-[840px] mx-auto w-full"
        >
          {/* 1. KOP SURAT RESMI */}
          {renderOfficialKopSurat()}

          {/* 2. BANNER PENETAPAN (HIJAU GELAP TEKS KUNING SESUAI CONTOH PDF) */}
          <div className="bg-[#062e1c] text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl text-center border border-emerald-800 shadow-xs">
            <span className="text-emerald-300 font-bold text-[8.5px] sm:text-[10px] uppercase tracking-widest block leading-tight">
              LEMBAGA HISAB FALAKIYAH ALMANSURIYAH JAKARTA MENETAPKAN
            </span>
            <span className="text-amber-300 font-black text-xs sm:text-sm md:text-base uppercase tracking-wide block mt-0.5 leading-tight">
              AWAL {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah} — {currentRecord.hariPasaranAwalBulan}
            </span>
          </div>

          {/* 3. DAFTAR 8 PARAMETER FALAK (KOMPAK & BERSIH) */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 text-[9.5px] sm:text-[11px] leading-tight">
            {/* 1. Ijtima' */}
            <div className="py-1 px-3 flex items-baseline gap-2">
              <span className="font-bold text-stone-900 w-44 sm:w-56 shrink-0">
                1. Ijtima' {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah} :
              </span>
              <span className="font-semibold text-stone-800 flex-1">
                {currentRecord.hariPasaranIjtima}, {currentRecord.tanggalMasehiIjtima}&nbsp;
                <span className="font-mono bg-stone-200 text-stone-900 px-1 py-0.2 rounded text-[9px] font-bold">
                  [{currentRecord.jamIjtima} WIB]
                </span>
              </span>
            </div>

            {/* 2. Maghrib */}
            <div className="py-1 px-3 flex items-baseline gap-2 bg-stone-50/50">
              <span className="font-bold text-stone-900 w-44 sm:w-56 shrink-0">2. Maghrib :</span>
              <span className="font-mono font-bold text-stone-800">{currentRecord.jamMaghrib} WIB</span>
            </div>

            {/* 3. Umur Bulan */}
            <div className="py-1 px-3 flex items-baseline gap-2">
              <span className="font-bold text-stone-900 w-44 sm:w-56 shrink-0">3. Umur Bulan :</span>
              <span className="font-semibold text-stone-800">{m.umurBulanDeg} / {m.umurBulanTime}</span>
            </div>

            {/* 4. Letak Matahari Terbenam */}
            <div className="py-1 px-3 flex items-baseline gap-2 bg-stone-50/50">
              <span className="font-bold text-stone-900 w-44 sm:w-56 shrink-0">4. Letak Matahari Terbenam :</span>
              <span className="font-semibold text-stone-800">{currentRecord.letakMatahariTerbenam}</span>
            </div>

            {/* 5. Posisi Hilal */}
            <div className="py-1 px-3 flex items-baseline gap-2">
              <span className="font-bold text-stone-900 w-44 sm:w-56 shrink-0">5. Posisi Hilal :</span>
              <span className="font-semibold text-stone-800">{currentRecord.posisiHilal}</span>
            </div>

            {/* 6. Keadaan Hilal */}
            <div className="py-1 px-3 flex items-baseline gap-2 bg-stone-50/50">
              <span className="font-bold text-stone-900 w-44 sm:w-56 shrink-0">6. Keadaan Hilal :</span>
              <span className="font-semibold text-stone-800">{currentRecord.keadaanHilal}</span>
            </div>

            {/* 7. Tinggi Hilal */}
            <div className="py-1 px-3 flex items-baseline gap-2">
              <span className="font-bold text-stone-900 w-44 sm:w-56 shrink-0">7. Tinggi Hilal :</span>
              <span className="font-mono font-black text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded text-[10px]">
                {currentRecord.tinggiHilal}
              </span>
            </div>

            {/* 8. Lama Hilal Diatas Ufuk */}
            <div className="py-1 px-3 flex items-baseline gap-2 bg-stone-50/50">
              <span className="font-bold text-stone-900 w-44 sm:w-56 shrink-0">8. Lama Hilal Diatas Ufuk :</span>
              <span className="font-mono font-semibold text-stone-800">{currentRecord.lamaHilalDiatasUfuk}</span>
            </div>
          </div>

          {/* 4. 3 BLOK MATRIKS KOORDINAT ASTRONOMIS (KOMPAK A4) */}
          <div className="space-y-2.5">
            {/* 1. BLOK EKLIPTIKA */}
            <div className="border border-stone-300 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-[#292524] text-amber-400 font-black px-3 py-1 text-[9.5px] sm:text-[10.5px] uppercase tracking-wider flex items-center gap-1.5">
                <span className="bg-amber-400 text-stone-900 w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[9px] font-black shrink-0">
                  1
                </span>
                <span>SISTEM KOORDINAT EKLIPTIKA</span>
              </div>
              <table className="w-full table-fixed text-[9.5px] sm:text-[10.5px] text-stone-800 divide-y divide-stone-200">
                <colgroup>
                  <col className="w-[28%]" />
                  <col className="w-[28%]" />
                  <col className="w-[22%]" />
                  <col className="w-[22%]" />
                </colgroup>
                <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[9px]">
                  <tr>
                    <th className="px-2 sm:px-3 py-1 text-left">Parameter</th>
                    <th className="px-2 sm:px-3 py-1 text-left">Kondisi / Waktu</th>
                    <th className="px-2 sm:px-3 py-1 text-left">Matahari</th>
                    <th className="px-2 sm:px-3 py-1 text-left">Bulan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white font-mono text-[9px] sm:text-[10px]">
                  <tr>
                    <td className="px-2 sm:px-3 py-1 font-sans font-bold text-stone-900" rowSpan={2}>
                      λ (Bujur Astronomis)
                    </td>
                    <td className="px-2 sm:px-3 py-1 font-sans text-stone-700">Saat Ijtima'</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900">{m.lambdaSunIjtima}</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900">{m.lambdaMoonIjtima}</td>
                  </tr>
                  <tr className="bg-stone-50/60">
                    <td className="px-2 sm:px-3 py-1 font-sans text-stone-700">Saat Maghrib (Ghurub)</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900">{m.lambdaSunMaghrib}</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900 font-bold text-emerald-800">{m.lambdaMoonMaghrib}</td>
                  </tr>
                  <tr>
                    <td className="px-2 sm:px-3 py-1 font-sans font-bold text-stone-900">
                      β (Lintang Astronomis)
                    </td>
                    <td className="px-2 sm:px-3 py-1 font-sans text-stone-700">Posisi Hakiki</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900">{m.betaSun}</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900 font-bold">{m.betaMoon}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 2. BLOK EKUATOR */}
            <div className="border border-stone-300 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-[#292524] text-amber-400 font-black px-3 py-1 text-[9.5px] sm:text-[10.5px] uppercase tracking-wider flex items-center gap-1.5">
                <span className="bg-amber-400 text-stone-900 w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[9px] font-black shrink-0">
                  2
                </span>
                <span>SISTEM KOORDINAT EKUATOR</span>
              </div>
              <table className="w-full table-fixed text-[9.5px] sm:text-[10.5px] text-stone-800 divide-y divide-stone-200">
                <colgroup>
                  <col className="w-[28%]" />
                  <col className="w-[28%]" />
                  <col className="w-[22%]" />
                  <col className="w-[22%]" />
                </colgroup>
                <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[9px]">
                  <tr>
                    <th className="px-2 sm:px-3 py-1 text-left">Parameter</th>
                    <th className="px-2 sm:px-3 py-1 text-left">Format / Satuan</th>
                    <th className="px-2 sm:px-3 py-1 text-left">Matahari</th>
                    <th className="px-2 sm:px-3 py-1 text-left">Bulan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white font-mono text-[9px] sm:text-[10px]">
                  <tr>
                    <td className="px-2 sm:px-3 py-1 font-sans font-bold text-stone-900">
                      δ (Deklinasi)
                    </td>
                    <td className="px-2 sm:px-3 py-1 font-sans text-stone-700">Derajat (° ' '')</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900">{m.deltaSun}</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900 font-bold">{m.deltaMoon}</td>
                  </tr>
                  <tr className="bg-stone-50/60">
                    <td className="px-2 sm:px-3 py-1 font-sans font-bold text-stone-900" rowSpan={2}>
                      α (Asensiorekta)
                    </td>
                    <td className="px-2 sm:px-3 py-1 font-sans text-stone-700">Format Derajat (° ' '')</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900">{m.alphaSunDeg}</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900">{m.alphaMoonDeg}</td>
                  </tr>
                  <tr className="bg-stone-50/60">
                    <td className="px-2 sm:px-3 py-1 font-sans text-stone-700">Format Jam (H M D)</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900">{m.alphaSunTime}</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900 font-bold text-emerald-800">{m.alphaMoonTime}</td>
                  </tr>
                  <tr>
                    <td className="px-2 sm:px-3 py-1 font-sans font-bold text-stone-900" rowSpan={2}>
                      t (Sudut Waktu)
                    </td>
                    <td className="px-2 sm:px-3 py-1 font-sans text-stone-700">Format Derajat (° ' '')</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900">{m.tSunDeg}</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900">{m.tMoonDeg}</td>
                  </tr>
                  <tr>
                    <td className="px-2 sm:px-3 py-1 font-sans text-stone-700">Format Jam (H M D)</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900">{m.tSunTime}</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900 font-bold">{m.tMoonTime}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3. BLOK HORIZON */}
            <div className="border border-stone-300 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-[#292524] text-amber-400 font-black px-3 py-1 text-[9.5px] sm:text-[10.5px] uppercase tracking-wider flex items-center gap-1.5">
                <span className="bg-amber-400 text-stone-900 w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[9px] font-black shrink-0">
                  3
                </span>
                <span>SISTEM KOORDINAT HORIZON</span>
              </div>
              <table className="w-full table-fixed text-[9.5px] sm:text-[10.5px] text-stone-800 divide-y divide-stone-200">
                <colgroup>
                  <col className="w-[28%]" />
                  <col className="w-[28%]" />
                  <col className="w-[22%]" />
                  <col className="w-[22%]" />
                </colgroup>
                <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[9px]">
                  <tr>
                    <th className="px-2 sm:px-3 py-1 text-left">Parameter</th>
                    <th className="px-2 sm:px-3 py-1 text-left">Keterangan</th>
                    <th className="px-2 sm:px-3 py-1 text-left">Matahari</th>
                    <th className="px-2 sm:px-3 py-1 text-left">Bulan (Hilal)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white font-mono text-[9px] sm:text-[10px]">
                  <tr>
                    <td className="px-2 sm:px-3 py-1 font-sans font-bold text-stone-900">
                      h (Tinggi)
                    </td>
                    <td className="px-2 sm:px-3 py-1 font-sans text-stone-700">Tinggi Akhir Saat Ghurub</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900">{m.hSun}</td>
                    <td className="px-2 sm:px-3 py-1 font-bold text-red-700">{m.hMoon}</td>
                  </tr>
                  <tr className="bg-stone-50/60">
                    <td className="px-2 sm:px-3 py-1 font-sans font-bold text-stone-900">
                      A (Azimuth)
                    </td>
                    <td className="px-2 sm:px-3 py-1 font-sans text-stone-700">Sudut Arah Dari Utara</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900">{m.aSun}</td>
                    <td className="px-2 sm:px-3 py-1 text-stone-900 font-bold">{m.aMoon}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. 4 PARAMETER TAMBAHAN */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-2 grid grid-cols-4 gap-2 text-center text-stone-800">
            <div>
              <span className="font-bold text-stone-500 block text-[8px] sm:text-[9px] uppercase">ELONGASI BULAN - MAT</span>
              <span className="font-mono font-black text-stone-900 text-[10.5px] sm:text-xs block mt-0.5">{m.elongation}</span>
            </div>
            <div>
              <span className="font-bold text-stone-500 block text-[8px] sm:text-[9px] uppercase">UMUR BULAN (DERAJAT)</span>
              <span className="font-mono font-black text-stone-900 text-[10.5px] sm:text-xs block mt-0.5">{m.umurBulanDeg}</span>
            </div>
            <div>
              <span className="font-bold text-stone-500 block text-[8px] sm:text-[9px] uppercase">UMUR BULAN (WAKTU)</span>
              <span className="font-mono font-black text-stone-900 text-[10.5px] sm:text-xs block mt-0.5">{m.umurBulanTime}</span>
            </div>
            <div>
              <span className="font-bold text-stone-500 block text-[8px] sm:text-[9px] uppercase">STATUS VISIBILITAS</span>
              <span className="font-bold text-emerald-700 text-[10.5px] sm:text-xs block leading-tight mt-0.5">{currentRecord.statusHilal}</span>
            </div>
          </div>

          {/* 6. TANDA TANGAN & STEMPEL RESMI */}
          {renderOfficialSignatures(currentRecord.tanggalMasehiIjtima)}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3B. FORMAT 2 LEMBAR TERPISAH (OPSIONAL JIKA USER MEMILIH TAB 2 LEMBAR)    */}
      {/* ========================================================================= */}
      <div 
        ref={reportContainerRef} 
        id="laporan-hisab-resmi" 
        className={`space-y-6 sm:space-y-8 max-w-4xl mx-auto w-full ${
          activeSheetTab === 'a4' ? 'hidden print:block' : 'block'
        }`}
      >
        {/* LEMBAR 1: KETETAPAN & RINCIAN HASIL HISAB FALAKIYAH */}
        <div 
          ref={sheet1Ref}
          id="lembar-1-ringkas"
          className={`lembar-card bg-white text-stone-900 rounded-2xl shadow-xl border-4 border-emerald-900 overflow-visible sheet-page-break transition-all box-border ${
            !isExporting && activeSheetTab === 'lembar2' ? 'hidden print:block' : 'block'
          }`}
        >
          <div className="p-4 sm:p-7 md:p-8 space-y-4">
            {renderOfficialKopSurat()}

            {/* Parameter Bar */}
            <div className="bg-stone-50 py-1.5 px-3 rounded-xl border border-stone-200 text-center">
              <p className="text-xs sm:text-sm font-bold text-stone-800 tracking-wide">
                BULAN HIJRIYAH KE = {currentRecord.bulanHijriyahKe} &nbsp;&nbsp;|&nbsp;&nbsp; TAHUN HIJRIYAH = {currentRecord.tahunHijriyah}
              </p>
            </div>

            {/* Judul Merah Utama */}
            <div className="bg-red-700 text-white py-2 px-4 rounded-xl shadow-md border-2 border-red-800 text-center">
              <h2 className="text-xs sm:text-base md:text-lg font-black tracking-wide uppercase">
                AWAL BULAN {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah} H.
              </h2>
            </div>

            {/* Hasil Akhir Ketetapan */}
            <div className="bg-emerald-50/80 border-2 border-emerald-600 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">
                Ketetapan Hasil Hisab Akhir
              </span>
              <p className="text-xs sm:text-base font-black text-emerald-950 leading-snug">
                AWAL {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah} &nbsp;&nbsp;|&nbsp;&nbsp; {currentRecord.hariPasaranAwalBulan}
              </p>
            </div>

            {/* Sub-judul Bagian Rincian */}
            <div className="text-center bg-stone-900 text-amber-400 py-1.5 px-4 rounded-xl shadow-sm">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide">
                AWAL {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah}
              </h3>
            </div>

            {/* 8 Poin Rinci Falak */}
            <div className="bg-stone-50/90 border border-stone-300 rounded-xl p-3 divide-y divide-stone-200 text-xs font-sans">
              <div className="py-1.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <div className="flex items-baseline gap-1.5 sm:w-60 shrink-0 text-stone-800 font-bold">
                  <span className="font-black text-stone-900 w-3.5 shrink-0">1.</span>
                  <span>Ijtima' {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah} :</span>
                </div>
                <div className="pl-5 sm:pl-0 font-semibold text-stone-900 flex-1">
                  {currentRecord.hariPasaranIjtima}, {currentRecord.tanggalMasehiIjtima} &nbsp;
                  <span className="font-mono bg-stone-200 text-stone-950 px-1.5 py-0.5 rounded text-xs font-bold">
                    {currentRecord.jamIjtima}
                  </span>
                </div>
              </div>

              <div className="py-1.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <div className="flex items-baseline gap-1.5 sm:w-60 shrink-0 text-stone-800 font-bold">
                  <span className="font-black text-stone-900 w-3.5 shrink-0">2.</span>
                  <span>Maghrib :</span>
                </div>
                <div className="pl-5 sm:pl-0 font-mono font-bold text-stone-900 flex-1">
                  {currentRecord.jamMaghrib}
                </div>
              </div>

              <div className="py-1.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <div className="flex items-baseline gap-1.5 sm:w-60 shrink-0 text-stone-800 font-bold">
                  <span className="font-black text-stone-900 w-3.5 shrink-0">3.</span>
                  <span>Umur Bulan :</span>
                </div>
                <div className="pl-5 sm:pl-0 font-semibold text-stone-900 flex-1">
                  {currentRecord.umurBulanLengkap}
                </div>
              </div>

              <div className="py-1.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <div className="flex items-baseline gap-1.5 sm:w-60 shrink-0 text-stone-800 font-bold">
                  <span className="font-black text-stone-900 w-3.5 shrink-0">4.</span>
                  <span>Letak Matahari Terbenam :</span>
                </div>
                <div className="pl-5 sm:pl-0 font-semibold text-stone-900 flex-1">
                  {currentRecord.letakMatahariTerbenam}
                </div>
              </div>

              <div className="py-1.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <div className="flex items-baseline gap-1.5 sm:w-60 shrink-0 text-stone-800 font-bold">
                  <span className="font-black text-stone-900 w-3.5 shrink-0">5.</span>
                  <span>Posisi Hilal :</span>
                </div>
                <div className="pl-5 sm:pl-0 font-semibold text-stone-900 flex-1">
                  {currentRecord.posisiHilal}
                </div>
              </div>

              <div className="py-1.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <div className="flex items-baseline gap-1.5 sm:w-60 shrink-0 text-stone-800 font-bold">
                  <span className="font-black text-stone-900 w-3.5 shrink-0">6.</span>
                  <span>Keadaan Hilal :</span>
                </div>
                <div className="pl-5 sm:pl-0 font-semibold text-stone-900 flex-1">
                  {currentRecord.keadaanHilal}
                </div>
              </div>

              <div className="py-1.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <div className="flex items-baseline gap-1.5 sm:w-60 shrink-0 text-stone-800 font-bold">
                  <span className="font-black text-stone-900 w-3.5 shrink-0">7.</span>
                  <span>Tinggi Hilal :</span>
                </div>
                <div className="pl-5 sm:pl-0 font-mono font-black text-xs sm:text-sm text-red-700 flex-1">
                  <span className="bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                    {currentRecord.tinggiHilal}
                  </span>
                </div>
              </div>

              <div className="py-1.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <div className="flex items-baseline gap-1.5 sm:w-60 shrink-0 text-stone-800 font-bold">
                  <span className="font-black text-stone-900 w-3.5 shrink-0">8.</span>
                  <span>Lama Hilal Diatas Ufuk :</span>
                </div>
                <div className="pl-5 sm:pl-0 font-mono font-semibold text-stone-900 flex-1">
                  {currentRecord.lamaHilalDiatasUfuk}
                </div>
              </div>
            </div>

            {/* Tanda Tangan Lembar 1 */}
            {renderOfficialSignatures(currentRecord.tanggalMasehiIjtima)}
          </div>
        </div>

        {/* LEMBAR 2: LAMPIRAN RESMI MATRIKS KOORDINAT ASTRONOMIS */}
        <div 
          ref={sheet2Ref}
          id="lembar-2-matriks"
          className={`lembar-card bg-white text-stone-900 rounded-2xl shadow-xl border-4 border-emerald-900 overflow-visible sheet-page-break transition-all box-border ${
            !isExporting && activeSheetTab === 'lembar1' ? 'hidden print:block' : 'block'
          }`}
        >
          <div className="p-4 sm:p-7 md:p-8 space-y-4">
            {renderOfficialKopSurat()}

            {/* Header Matriks Penetapan */}
            <div className="text-center space-y-0.5 bg-emerald-950 text-white p-2.5 rounded-xl border border-emerald-700 shadow-sm">
              <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
                LEMBAGA HISAB FALAKIYAH ALMANSURIYAH JAKARTA MENETAPKAN
              </h3>
              <p className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide">
                AWAL {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah} — {currentRecord.hariPasaranAwalBulan}
              </p>
            </div>

            {/* 3 BLOK TABEL MATRIKS KOORDINAT */}
            <div className="space-y-3">
              {/* 1. BLOK EKLIPTIKA */}
              <div className="border border-stone-300 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-stone-800 text-amber-400 font-black px-3 py-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="bg-amber-400 text-stone-900 w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] font-black">
                    1
                  </span>
                  <span>SISTEM KOORDINAT EKLIPTIKA</span>
                </div>
                <table className="w-full table-fixed text-xs text-stone-800 divide-y divide-stone-200">
                  <colgroup>
                    <col className="w-[28%]" />
                    <col className="w-[28%]" />
                    <col className="w-[22%]" />
                    <col className="w-[22%]" />
                  </colgroup>
                  <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-1.5 text-left">Parameter</th>
                      <th className="px-3 py-1.5 text-left">Kondisi / Waktu</th>
                      <th className="px-3 py-1.5 text-left">Matahari</th>
                      <th className="px-3 py-1.5 text-left">Bulan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 bg-white font-mono text-[11px]">
                    <tr>
                      <td className="px-3 py-1.5 font-sans font-bold text-stone-900" rowSpan={2}>
                        λ (Bujur Astronomis)
                      </td>
                      <td className="px-3 py-1.5 font-sans text-stone-700">Saat Ijtima'</td>
                      <td className="px-3 py-1.5 text-stone-900">{m.lambdaSunIjtima}</td>
                      <td className="px-3 py-1.5 text-stone-900">{m.lambdaMoonIjtima}</td>
                    </tr>
                    <tr className="bg-stone-50/60">
                      <td className="px-3 py-1.5 font-sans text-stone-700">Saat Maghrib (Ghurub)</td>
                      <td className="px-3 py-1.5 text-stone-900">{m.lambdaSunMaghrib}</td>
                      <td className="px-3 py-1.5 text-stone-900 font-bold text-emerald-800">{m.lambdaMoonMaghrib}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 font-sans font-bold text-stone-900">
                        β (Lintang Astronomis)
                      </td>
                      <td className="px-3 py-1.5 font-sans text-stone-700">Posisi Hakiki</td>
                      <td className="px-3 py-1.5 text-stone-900">{m.betaSun}</td>
                      <td className="px-3 py-1.5 text-stone-900 font-bold">{m.betaMoon}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2. BLOK EKUATOR */}
              <div className="border border-stone-300 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-stone-800 text-amber-400 font-black px-3 py-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="bg-amber-400 text-stone-900 w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] font-black">
                    2
                  </span>
                  <span>SISTEM KOORDINAT EKUATOR</span>
                </div>
                <table className="w-full table-fixed text-xs text-stone-800 divide-y divide-stone-200">
                  <colgroup>
                    <col className="w-[28%]" />
                    <col className="w-[28%]" />
                    <col className="w-[22%]" />
                    <col className="w-[22%]" />
                  </colgroup>
                  <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-1.5 text-left">Parameter</th>
                      <th className="px-3 py-1.5 text-left">Format / Satuan</th>
                      <th className="px-3 py-1.5 text-left">Matahari</th>
                      <th className="px-3 py-1.5 text-left">Bulan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 bg-white font-mono text-[11px]">
                    <tr>
                      <td className="px-3 py-1.5 font-sans font-bold text-stone-900">
                        δ (Deklinasi)
                      </td>
                      <td className="px-3 py-1.5 font-sans text-stone-700">Derajat (° ' '')</td>
                      <td className="px-3 py-1.5 text-stone-900">{m.deltaSun}</td>
                      <td className="px-3 py-1.5 text-stone-900 font-bold">{m.deltaMoon}</td>
                    </tr>
                    <tr className="bg-stone-50/60">
                      <td className="px-3 py-1.5 font-sans font-bold text-stone-900" rowSpan={2}>
                        α (Asensiorekta)
                      </td>
                      <td className="px-3 py-1.5 font-sans text-stone-700">Format Derajat (° ' '')</td>
                      <td className="px-3 py-1.5 text-stone-900">{m.alphaSunDeg}</td>
                      <td className="px-3 py-1.5 text-stone-900">{m.alphaMoonDeg}</td>
                    </tr>
                    <tr className="bg-stone-50/60">
                      <td className="px-3 py-1.5 font-sans text-stone-700">Format Jam (H M D)</td>
                      <td className="px-3 py-1.5 text-stone-900">{m.alphaSunTime}</td>
                      <td className="px-3 py-1.5 text-stone-900 font-bold text-emerald-800">{m.alphaMoonTime}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 font-sans font-bold text-stone-900" rowSpan={2}>
                        t (Sudut Waktu)
                      </td>
                      <td className="px-3 py-1.5 font-sans text-stone-700">Format Derajat (° ' '')</td>
                      <td className="px-3 py-1.5 text-stone-900">{m.tSunDeg}</td>
                      <td className="px-3 py-1.5 text-stone-900">{m.tMoonDeg}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 font-sans text-stone-700">Format Jam (H M D)</td>
                      <td className="px-3 py-1.5 text-stone-900">{m.tSunTime}</td>
                      <td className="px-3 py-1.5 text-stone-900 font-bold">{m.tMoonTime}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3. BLOK HORIZON */}
              <div className="border border-stone-300 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-stone-800 text-amber-400 font-black px-3 py-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="bg-amber-400 text-stone-900 w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] font-black">
                    3
                  </span>
                  <span>SISTEM KOORDINAT HORIZON</span>
                </div>
                <table className="w-full table-fixed text-xs text-stone-800 divide-y divide-stone-200">
                  <colgroup>
                    <col className="w-[28%]" />
                    <col className="w-[28%]" />
                    <col className="w-[22%]" />
                    <col className="w-[22%]" />
                  </colgroup>
                  <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-1.5 text-left">Parameter</th>
                      <th className="px-3 py-1.5 text-left">Keterangan</th>
                      <th className="px-3 py-1.5 text-left">Matahari</th>
                      <th className="px-3 py-1.5 text-left">Bulan (Hilal)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 bg-white font-mono text-[11px]">
                    <tr>
                      <td className="px-3 py-1.5 font-sans font-bold text-stone-900">
                        h (Tinggi)
                      </td>
                      <td className="px-3 py-1.5 font-sans text-stone-700">Tinggi Akhir Saat Ghurub</td>
                      <td className="px-3 py-1.5 text-stone-900">{m.hSun}</td>
                      <td className="px-3 py-1.5 font-bold text-red-700">{m.hMoon}</td>
                    </tr>
                    <tr className="bg-stone-50/60">
                      <td className="px-3 py-1.5 font-sans font-bold text-stone-900">
                        A (Azimuth)
                      </td>
                      <td className="px-3 py-1.5 font-sans text-stone-700">Sudut Arah Dari Utara</td>
                      <td className="px-3 py-1.5 text-stone-900">{m.aSun}</td>
                      <td className="px-3 py-1.5 text-stone-900 font-bold">{m.aMoon}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Parameter Tambahan */}
            <div className="bg-stone-100 border border-stone-200 rounded-xl p-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-stone-800">
              <div>
                <span className="font-bold text-stone-600 block text-[9px] uppercase">Elongasi Bulan - Mat</span>
                <span className="font-mono font-bold text-stone-900 text-xs block">{m.elongation}</span>
              </div>
              <div>
                <span className="font-bold text-stone-600 block text-[9px] uppercase">Umur Bulan (Derajat)</span>
                <span className="font-mono font-bold text-stone-900 text-xs block">{m.umurBulanDeg}</span>
              </div>
              <div>
                <span className="font-bold text-stone-600 block text-[9px] uppercase">Umur Bulan (Waktu)</span>
                <span className="font-mono font-bold text-stone-900 text-xs block">{m.umurBulanTime}</span>
              </div>
              <div>
                <span className="font-bold text-stone-600 block text-[9px] uppercase">Status Visibilitas</span>
                <span className="font-bold text-emerald-800 text-xs block">{currentRecord.statusHilal}</span>
              </div>
            </div>

            {/* Tanda Tangan Lembar 2 */}
            {renderOfficialSignatures(currentRecord.tanggalMasehiIjtima)}
          </div>
        </div>
      </div>

      {/* 4. EKSPOR RESMI STANDAR A4 (PDF, PNG HD, PRINT, WHATSAPP, SALIN TEKS) */}
      <div
        data-export-ignore="true"
        className="w-full border-t-2 sm:border-t-4 border-emerald-900 p-3 sm:p-5 bg-stone-900 text-stone-100 rounded-2xl shadow-xl select-none print:hidden transition-colors"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Info & Penjelasan */}
          <div className="flex items-center gap-3 text-center lg:text-left">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shrink-0 hidden sm:block">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs sm:text-sm text-white uppercase tracking-wide flex items-center justify-center lg:justify-start gap-1.5">
                <span>Unduh Berkas Resmi Standar A4 (Kop Surat &amp; Matriks)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black">
                  STANDAR RESMI LHFA
                </span>
              </h5>
              <p className="text-[10px] sm:text-xs text-stone-400 mt-0.5">
                Unduh PDF resmi standar A4 (1 Lembar Lengkap ber-bingkai hijau utuh), simpan gambar PNG resolusi tinggi, atau bagikan langsung.
              </p>
            </div>
          </div>

          {/* Tombol Ekspor */}
          <div className="flex flex-wrap items-center justify-center gap-2 w-full lg:w-auto">
            {/* UNDUH PDF UTAMA STANDAR A4 */}
            <button
              onClick={() => handleExportPdf('a4')}
              disabled={isExporting}
              className="flex-1 sm:flex-none h-10 px-4 bg-red-700 hover:bg-red-600 active:bg-red-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              title="Unduh dokumen PDF A4 1 lembar resmi sesuai contoh resmi LHFA"
            >
              {isExporting && exportType === 'PDF' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>Unduh PDF A4 (1 Lembar)</span>
            </button>

            {/* SIMPAN GAMBAR PNG HD */}
            <button
              onClick={() => handleExportImage('png')}
              disabled={isExporting}
              className="flex-1 sm:flex-none h-10 px-3.5 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              title="Simpan gambar resolusi tinggi PNG HD"
            >
              {isExporting && exportType?.startsWith('IMG_') ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              <span>Simpan Gambar (PNG)</span>
            </button>

            {/* CETAK LANGSUNG */}
            <button
              onClick={handlePrint}
              disabled={isExporting}
              className="flex-1 sm:flex-none h-10 px-3 bg-stone-800 hover:bg-stone-700 active:bg-stone-900 disabled:opacity-50 text-stone-200 font-bold text-xs rounded-xl border border-stone-700 shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              title="Cetak dokumen langsung ke printer"
            >
              <Printer className="w-3.5 h-3.5 text-stone-400" />
              <span>Cetak (A4)</span>
            </button>

            {/* BAGIKAN WHATSAPP */}
            <button
              onClick={handleShareWhatsApp}
              disabled={isExporting}
              className="flex-1 sm:flex-none h-10 px-3.5 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa51] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              title="Bagikan berkas hisab ke WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* SALIN NASKAH TEKS */}
            <button
              onClick={handleCopyText}
              className="flex-1 sm:flex-none h-10 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl border border-stone-700 shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              title="Salin Naskah Teks Lengkap"
            >
              {hasCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{hasCopied ? 'Tersalin' : 'Salin Teks'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
