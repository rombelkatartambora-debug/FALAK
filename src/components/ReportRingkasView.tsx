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
  FileCheck2 
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
  // Refs untuk 2 Lembar Dokumen Resmi
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const sheet1Ref = useRef<HTMLDivElement>(null);
  const sheet2Ref = useRef<HTMLDivElement>(null);

  // State Pilihan Tampilan di Layar: 'keduanya' (default 2 lembar), 'lembar1', 'lembar2'
  const [activeSheetTab, setActiveSheetTab] = useState<'keduanya' | 'lembar1' | 'lembar2'>('keduanya');

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

  // 1. Ekspor Dokumen Resmi HD (PDF) - 2 Lembar Proporsional, Presisi di Tengah & Garis Hijau Utuh Terlihat
  const handleExportPdf = async () => {
    if (!sheet1Ref.current || !sheet2Ref.current || isExporting) return;
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
      const marginSide = 10; // Margin samping 10mm agar bingkai hijau utuh dan simetris
      const marginTop = 10; // Margin atas: Kop surat tepat di bagian atas kertas
      const marginBottom = 10; // Margin bawah aman
      const maxPrintWidth = pageWidth - marginSide * 2;
      const maxPrintHeight = pageHeight - marginTop - marginBottom;

      // Helper untuk memposisikan lembar dokumen tepat di tengah horizontal, dengan Kop Surat di atas (bukan vertikal tengah)
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

      // Halaman 1: Lembar 1 (Ketetapan & Rincian Falak)
      const page1 = await renderPageToPdf(sheet1Ref.current);
      pdf.addImage(page1.dataUrl, 'JPEG', page1.xPos, page1.yPos, page1.printW, page1.printH, undefined, 'FAST');

      // Halaman 2: Lembar 2 (Lampiran Matriks Astronomis)
      pdf.addPage('a4', 'portrait');
      const page2 = await renderPageToPdf(sheet2Ref.current);
      pdf.addImage(page2.dataUrl, 'JPEG', page2.xPos, page2.yPos, page2.printW, page2.printH, undefined, 'FAST');

      // Simpan dokumen PDF 2 Lembar
      pdf.save(`Dokumen_Hisab_Almansuriyah_2Lembar_${currentRecord.namaBulanHijriyah}_${currentRecord.tahunHijriyah}H.pdf`);

      confetti({ particleCount: 45, spread: 70, origin: { y: 0.8 } });
      onShowToast('Dokumen Resmi 2 Lembar (PDF) berhasil diunduh!');
    } catch (err) {
      console.error(err);
      onShowToast('Gagal membuat dokumen PDF 2 lembar', 'error');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // 2. Ekspor Gambar Tunggal per Lembar (Lembar 1 atau Lembar 2)
  const handleExportSingleSheetImage = async (sheetNum: 1 | 2, format: 'png' | 'jpg') => {
    const targetRef = sheetNum === 1 ? sheet1Ref.current : sheet2Ref.current;
    if (!targetRef || isExporting) return;
    try {
      setIsExporting(true);
      setExportType(`L${sheetNum}_${format.toUpperCase()}`);

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
      link.download = `Laporan_Hisab_Lembar${sheetNum}_${currentRecord.namaBulanHijriyah}_${currentRecord.tahunHijriyah}H.${format}`;
      link.href = dataUrl;
      link.click();

      confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
      onShowToast(`Lembar ${sheetNum} (${format.toUpperCase()} HD) berhasil diunduh!`);
    } catch (err) {
      console.error(err);
      onShowToast(`Gagal mengunduh gambar Lembar ${sheetNum}`, 'error');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // 3. Ekspor Gabungan 2 Lembar ke Gambar
  const handleExportBothSheetsImage = async (format: 'png' | 'jpg') => {
    if (!reportContainerRef.current || isExporting) return;
    try {
      setIsExporting(true);
      setExportType(`GABUNGAN_${format.toUpperCase()}`);

      const options = {
        filter: exportFilter,
        pixelRatio: 2.2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        fontEmbedCSS: '',
        skipFonts: true
      };

      const dataUrl = format === 'png'
        ? await toPng(reportContainerRef.current, options)
        : await toJpeg(reportContainerRef.current, { ...options, quality: 0.96 });

      const link = document.createElement('a');
      link.download = `Laporan_Hisab_2Lembar_${currentRecord.namaBulanHijriyah}_${currentRecord.tahunHijriyah}H.${format}`;
      link.href = dataUrl;
      link.click();

      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      onShowToast(`Gambar Lengkap 2 Lembar (${format.toUpperCase()} HD) berhasil diunduh!`);
    } catch (err) {
      console.error(err);
      onShowToast('Gagal mengunduh gambar 2 lembar', 'error');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // 4. Cetak Langsung (Print 2 Lembar)
  const handlePrint = () => {
    window.print();
  };

  // 5. Bagikan ke WhatsApp
  const handleShareWhatsApp = async () => {
    if (!sheet1Ref.current || isExporting) return;
    const filenameBase = `Laporan_Hisab_${currentRecord.namaBulanHijriyah}_${currentRecord.tahunHijriyah}H`;

    if (navigator.share) {
      try {
        setIsExporting(true);
        setExportType('SHARE');
        const dataUrl = await toPng(sheet1Ref.current, {
          filter: exportFilter,
          pixelRatio: 2.2,
          backgroundColor: '#ffffff',
          fontEmbedCSS: '',
          skipFonts: true
        });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `${filenameBase}_Lembar1.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Laporan Hisab ${currentRecord.namaBulanHijriyah} ${currentRecord.tahunHijriyah} H`,
            text: `Ketetapan Lembaga Hisab Falakiyah Almansuriyah: Awal ${currentRecord.namaBulanHijriyah} ${currentRecord.tahunHijriyah} H jatuh pada ${currentRecord.hariPasaranAwalBulan}. Berkas resmi 2 lembar.`,
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
          handleExportSingleSheetImage(1, 'png');
        }
      } finally {
        setIsExporting(false);
        setExportType(null);
      }
    } else {
      handleExportSingleSheetImage(1, 'png');
    }
  };

  // 6. Salin Naskah Teks Resmi
  const handleCopyText = () => {
    const text = `================================================================================
LEMBAGA HISAB FALAKIYAH ALMANSURIYAH JAKARTA
Ketetapan Hisab Kitab Sullamun Nayyirain (Berkas Resmi 2 Lembar)
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
    <div className="border-b-4 border-double border-stone-900 pb-3 sm:pb-4 mb-3 sm:mb-4 relative">
      <div className="relative flex items-center justify-center min-h-[75px] sm:min-h-[85px]">
        {/* 1. Logo Lembaga di Sisi Kiri Mutlak */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center shrink-0">
          <img 
            src="/logo.png" 
            alt="Logo Lembaga" 
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/LOGO.png'; }}
            className="w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow" 
          />
        </div>

        {/* 2. Teks Identitas Resmi 100% Presisi di Tengah Kertas */}
        <div className="text-center w-full px-16 sm:px-24">
          <h1 className="text-xs sm:text-base md:text-xl font-black tracking-tight text-emerald-950 uppercase leading-snug">
            LEMBAGA HISAB FALAKIYAH ALMANSURIYAH
          </h1>
          <h2 className="text-[10px] sm:text-xs font-bold text-amber-800 tracking-wider uppercase mt-0.5">
            BADAN HISAB &amp; RUKYAT HILAL METODE SULLAM AN-NAYYIRAIN
          </h2>
          <p className="text-[9px] sm:text-[10px] text-stone-600 mt-0.5 leading-tight">
            Markaz Falakiyah: Masjid Jami' Al-Mansur Jembatan Lima, Jakarta Barat 11250
          </p>
          <p className="text-[8px] sm:text-[9.5px] text-stone-500 mt-0.5 font-mono">
            Lintang: 06° 09' 00" LS &bull; Bujur: 106° 48' 27" BT &bull; Ketinggian: 7 m DPL
          </p>
        </div>
      </div>
    </div>
  );

  // Komponen Tanda Tangan & Stempel Resmi (Posisi proporsional ke bawah dengan ruang tanda tangan lega)
  const renderOfficialSignatures = (tanggalText: string) => (
    <div className="mt-8 sm:mt-12 pt-4 sm:pt-5 border-t border-stone-300 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-3 text-xs">
      <div className="text-center w-full sm:w-56">
        <p className="font-bold text-[11px] sm:text-xs text-stone-900">Ketua Umum LHFA,</p>
        <div className="h-16 sm:h-20 flex items-center justify-center">
          {/* Ruang tanda tangan resmi yang lega */}
        </div>
        <p className="font-bold underline text-[11px] sm:text-xs text-stone-900">H. xxxxxxxxxxxxx, S.Ag., M.H.</p>
      </div>

      {/* STEMPEL RESMI */}
      <div className="flex flex-col items-center justify-center my-1 sm:my-0">
        <img 
          src="/stempel.png" 
          alt="Stempel Resmi" 
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/STEMPEL.png'; }}
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain rotate-[-8deg] opacity-90 drop-shadow-sm select-none pointer-events-none" 
        />
      </div>

      <div className="text-center w-full sm:w-56">
        <p className="text-stone-500 text-[9px] sm:text-[10px]">Jakarta, {tanggalText}</p>
        <p className="font-bold text-[11px] sm:text-xs text-stone-900 mt-0.5">Sekretaris Lembaga,</p>
        <div className="h-16 sm:h-20 flex items-center justify-center">
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
            margin: 10mm;
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
            border: 2px solid #064e3b !important;
            border-radius: 0 !important;
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
            title="Cetak 2 Lembar ke Printer / PDF"
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

      {/* 2. TAB PEMILIH TAMPILAN LEMBAR DI LAYAR */}
      <div className="flex items-center justify-between bg-stone-900 border border-stone-800 p-1.5 rounded-2xl print:hidden">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSheetTab('keduanya')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSheetTab === 'keduanya'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2 Lembar Sekaligus</span>
          </button>
          <button
            onClick={() => setActiveSheetTab('lembar1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSheetTab === 'lembar1'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lembar 1: Ketetapan &amp; Rincian</span>
          </button>
          <button
            onClick={() => setActiveSheetTab('lembar2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSheetTab === 'lembar2'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Lembar 2: Matriks Astronomis</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-stone-400 pr-2">
          <span>Format:</span>
          <span className="text-amber-400 font-bold">2 Lembar Kop Surat Lengkap</span>
        </div>
      </div>

      {/* MODAL / FORM "GANTI ISIAN" */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-4 sm:p-5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-500" />
                  <span>Ganti Isian Data Hisab (2 Lembar Dokumen)</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Ubah rincian hisab bulan {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah} H secara manual.
                </p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields Scrollable */}
            <form onSubmit={handleSaveEdit} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-stone-200 flex-1">
              {/* Bagian 1: Identitas & Hasil Akhir */}
              <div className="bg-stone-950/70 border border-stone-800 p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  1. Penetapan &amp; Hasil Akhir (Lembar 1)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Nama Bulan Hijriyah</label>
                    <select
                      value={editForm.namaBulanHijriyah}
                      onChange={(e) => {
                        const idx = DAFTAR_BULAN_HIJRIYAH.indexOf(e.target.value);
                        setEditForm({
                          ...editForm,
                          namaBulanHijriyah: e.target.value,
                          bulanHijriyahKe: idx !== -1 ? idx + 1 : editForm.bulanHijriyahKe
                        });
                      }}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white font-semibold"
                    >
                      {DAFTAR_BULAN_HIJRIYAH.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Tahun Hijriyah</label>
                    <input
                      type="number"
                      value={editForm.tahunHijriyah}
                      onChange={(e) => setEditForm({ ...editForm, tahunHijriyah: parseInt(e.target.value, 10) || editForm.tahunHijriyah })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Hari &amp; Pasaran Awal Bulan</label>
                    <input
                      type="text"
                      value={editForm.hariPasaranAwalBulan}
                      onChange={(e) => setEditForm({ ...editForm, hariPasaranAwalBulan: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-emerald-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Rincian 8 Poin Falak */}
              <div className="bg-stone-950/70 border border-stone-800 p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  2. Parameter Rinci Per Bulan (8 Poin Lembar 1)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Hari/Pasaran Ijtima'</label>
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
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Jam Maghrib</label>
                    <input
                      type="text"
                      value={editForm.jamMaghrib}
                      onChange={(e) => setEditForm({ ...editForm, jamMaghrib: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Umur Bulan</label>
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
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Tinggi Hilal (h)</label>
                    <input
                      type="text"
                      value={editForm.tinggiHilal}
                      onChange={(e) => setEditForm({ ...editForm, tinggiHilal: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-red-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Lama Hilal Di Atas Ufuk</label>
                    <input
                      type="text"
                      value={editForm.lamaHilalDiatasUfuk}
                      onChange={(e) => setEditForm({ ...editForm, lamaHilalDiatasUfuk: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 3: Matriks Astronomis Lembar 2 */}
              <div className="bg-stone-950/70 border border-stone-800 p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  3. Matriks Koordinat Astronomis (Lembar 2)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">λ Sun Ijtima</label>
                    <input
                      type="text"
                      value={editForm.matriks.lambdaSunIjtima}
                      onChange={(e) => setEditForm({ ...editForm, matriks: { ...editForm.matriks, lambdaSunIjtima: e.target.value } })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">λ Moon Ijtima</label>
                    <input
                      type="text"
                      value={editForm.matriks.lambdaMoonIjtima}
                      onChange={(e) => setEditForm({ ...editForm, matriks: { ...editForm.matriks, lambdaMoonIjtima: e.target.value } })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">λ Sun Maghrib</label>
                    <input
                      type="text"
                      value={editForm.matriks.lambdaSunMaghrib}
                      onChange={(e) => setEditForm({ ...editForm, matriks: { ...editForm.matriks, lambdaSunMaghrib: e.target.value } })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">λ Moon Maghrib</label>
                    <input
                      type="text"
                      value={editForm.matriks.lambdaMoonMaghrib}
                      onChange={(e) => setEditForm({ ...editForm, matriks: { ...editForm.matriks, lambdaMoonMaghrib: e.target.value } })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-emerald-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">h Tinggi Matahari</label>
                    <input
                      type="text"
                      value={editForm.matriks.hSun}
                      onChange={(e) => setEditForm({ ...editForm, matriks: { ...editForm.matriks, hSun: e.target.value } })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">h Tinggi Hilal</label>
                    <input
                      type="text"
                      value={editForm.matriks.hMoon}
                      onChange={(e) => setEditForm({ ...editForm, matriks: { ...editForm.matriks, hMoon: e.target.value } })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-red-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">A Azimuth Matahari</label>
                    <input
                      type="text"
                      value={editForm.matriks.aSun}
                      onChange={(e) => setEditForm({ ...editForm, matriks: { ...editForm.matriks, aSun: e.target.value } })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">A Azimuth Bulan</label>
                    <input
                      type="text"
                      value={editForm.matriks.aMoon}
                      onChange={(e) => setEditForm({ ...editForm, matriks: { ...editForm.matriks, aMoon: e.target.value } })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-400 block mb-1">Elongasi Bulan-Matahari</label>
                    <input
                      type="text"
                      value={editForm.matriks.elongation}
                      onChange={(e) => setEditForm({ ...editForm, matriks: { ...editForm.matriks, elongation: e.target.value } })}
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

      {/* 3. DOKUMEN RESMI 2 LEMBAR (KEDUANYA PAKAI KOP SURAT RESMI, BEBAS SCROLLBAR) */}
      <div ref={reportContainerRef} id="laporan-hisab-resmi" className="space-y-6 sm:space-y-8 max-w-4xl mx-auto w-full">
        
        {/* ========================================================================= */}
        {/* LEMBAR 1: KETETAPAN & RINCIAN HASIL HISAB FALAKIYAH                        */}
        {/* ========================================================================= */}
        <div 
          ref={sheet1Ref}
          id="lembar-1-ringkas"
          className={`lembar-card bg-white text-stone-900 rounded-2xl shadow-xl border-4 border-emerald-900 overflow-visible sheet-page-break transition-all box-border ${
            !isExporting && activeSheetTab === 'lembar2' ? 'hidden print:block' : 'block'
          }`}
        >
          <div className="p-4 sm:p-7 md:p-10 space-y-4 sm:space-y-6">
            {/* KOP SURAT RESMI LEMBAR 1 (BERSIH TANPA BADGE KOTAK) */}
            {renderOfficialKopSurat()}

            {/* Parameter Bar */}
            <div className="bg-stone-50 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg sm:rounded-xl border border-stone-200 text-center">
              <p className="text-[11px] sm:text-sm md:text-base font-bold text-stone-800 tracking-wide">
                BULAN HIJRIYAH KE = {currentRecord.bulanHijriyahKe} &nbsp;&nbsp;|&nbsp;&nbsp; TAHUN HIJRIYAH = {currentRecord.tahunHijriyah}
              </p>
            </div>

            {/* Judul Merah Utama */}
            <div className="bg-red-700 text-white py-2 sm:py-2.5 px-2.5 sm:px-5 rounded-xl sm:rounded-2xl shadow-md border-2 border-red-800 text-center">
              <h2 className="text-xs sm:text-base md:text-xl font-black tracking-wide uppercase">
                AWAL BULAN {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah} H.
              </h2>
            </div>

            {/* Hasil Akhir Ketetapan */}
            <div className="bg-emerald-50/80 border-2 border-emerald-600 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 text-center">
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">
                Ketetapan Hasil Hisab Akhir
              </span>
              <p className="text-xs sm:text-base md:text-lg font-black text-emerald-950 leading-snug">
                AWAL {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah} &nbsp;&nbsp;|&nbsp;&nbsp; {currentRecord.hariPasaranAwalBulan}
              </p>
            </div>

            {/* Sub-judul Bagian Rincian */}
            <div className="text-center bg-stone-900 text-amber-400 py-1 sm:py-2 px-3 sm:px-6 rounded-xl sm:rounded-2xl shadow-sm">
              <h3 className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wide">
                AWAL {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah}
              </h3>
            </div>

            {/* 8 Poin Rinci Falak */}
            <div className="bg-stone-50/90 border border-stone-300 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 divide-y divide-stone-200 text-[11px] sm:text-sm font-sans">
              <div className="py-1.5 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3">
                <div className="flex items-baseline gap-1.5 sm:w-60 md:w-64 shrink-0 text-stone-800 font-bold">
                  <span className="font-black text-stone-900 w-3.5 shrink-0">1.</span>
                  <span>Ijtima' {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah} :</span>
                </div>
                <div className="pl-5 sm:pl-0 font-semibold text-stone-900 flex-1">
                  {currentRecord.hariPasaranIjtima}, {currentRecord.tanggalMasehiIjtima} &nbsp;
                  <span className="font-mono bg-stone-200 text-stone-950 px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold">
                    {currentRecord.jamIjtima}
                  </span>
                </div>
              </div>

              <div className="py-1.5 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3">
                <div className="flex items-baseline gap-1.5 sm:w-60 md:w-64 shrink-0 text-stone-800 font-bold">
                  <span className="font-black text-stone-900 w-3.5 shrink-0">2.</span>
                  <span>Maghrib :</span>
                </div>
                <div className="pl-5 sm:pl-0 font-mono font-bold text-stone-900 flex-1">
                  {currentRecord.jamMaghrib}
                </div>
              </div>

              <div className="py-1.5 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3">
                <div className="flex items-baseline gap-1.5 sm:w-60 md:w-64 shrink-0 text-stone-800 font-bold">
                  <span className="font-black text-stone-900 w-3.5 shrink-0">3.</span>
                  <span>Umur Bulan :</span>
                </div>
                <div className="pl-5 sm:pl-0 font-semibold text-stone-900 flex-1">
                  {currentRecord.umurBulanLengkap}
                </div>
              </div>

              <div className="py-1.5 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3">
                <div className="flex items-baseline gap-1.5 sm:w-60 md:w-64 shrink-0 text-stone-800 font-bold">
                  <span className="font-black text-stone-900 w-3.5 shrink-0">4.</span>
                  <span>Letak Matahari Terbenam :</span>
                </div>
                <div className="pl-5 sm:pl-0 font-semibold text-stone-900 flex-1">
                  {currentRecord.letakMatahariTerbenam}
                </div>
              </div>

              <div className="py-1.5 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3">
                <div className="flex items-baseline gap-1.5 sm:w-60 md:w-64 shrink-0 text-stone-800 font-bold">
                  <span className="font-black text-stone-900 w-3.5 shrink-0">5.</span>
                  <span>Posisi Hilal :</span>
                </div>
                <div className="pl-5 sm:pl-0 font-semibold text-stone-900 flex-1">
                  {currentRecord.posisiHilal}
                </div>
              </div>

              <div className="py-1.5 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3">
                <div className="flex items-baseline gap-1.5 sm:w-60 md:w-64 shrink-0 text-stone-800 font-bold">
                  <span className="font-black text-stone-900 w-3.5 shrink-0">6.</span>
                  <span>Keadaan Hilal :</span>
                </div>
                <div className="pl-5 sm:pl-0 font-semibold text-stone-900 flex-1">
                  {currentRecord.keadaanHilal}
                </div>
              </div>

              <div className="py-1.5 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3">
                <div className="flex items-baseline gap-1.5 sm:w-60 md:w-64 shrink-0 text-stone-800 font-bold">
                  <span className="font-black text-stone-900 w-3.5 shrink-0">7.</span>
                  <span>Tinggi Hilal :</span>
                </div>
                <div className="pl-5 sm:pl-0 font-mono font-black text-xs sm:text-sm text-red-700 flex-1">
                  <span className="bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                    {currentRecord.tinggiHilal}
                  </span>
                </div>
              </div>

              <div className="py-1.5 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3">
                <div className="flex items-baseline gap-1.5 sm:w-60 md:w-64 shrink-0 text-stone-800 font-bold">
                  <span className="font-black text-stone-900 w-3.5 shrink-0">8.</span>
                  <span>Lama Hilal Diatas Ufuk :</span>
                </div>
                <div className="pl-5 sm:pl-0 font-mono font-semibold text-stone-900 flex-1">
                  {currentRecord.lamaHilalDiatasUfuk}
                </div>
              </div>
            </div>

            {/* Footer Baris Lembar 1 */}
            <div className="bg-stone-900 text-white py-1.5 sm:py-2 px-3 sm:px-6 rounded-xl sm:rounded-2xl text-center shadow-xs">
              <p className="text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-wide text-amber-300">
                AWAL {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah} &nbsp;&nbsp;|&nbsp;&nbsp; {currentRecord.hariPasaranAwalBulan}
              </p>
            </div>

            {/* Tanda Tangan & Stempel Resmi Lembar 1 */}
            {renderOfficialSignatures(currentRecord.tanggalMasehiIjtima)}

            {/* Catatan Kaki Lembar 1 */}
            <div className="pt-2 text-center text-[9px] text-stone-400 font-medium">
              Ketetapan &amp; Rincian Parameter Hisab &bull; Kitab Induk Sullam an-Nayyirain
            </div>
          </div>
        </div>

        {/* PEMISAH ANTAR LEMBAR DI LAYAR (Hanya tampil di browser saat mode 'keduanya') */}
        {activeSheetTab === 'keduanya' && (
          <div data-export-ignore="true" className="flex items-center gap-3 my-2 print:hidden select-none">
            <div className="h-0.5 bg-stone-700/80 flex-1"></div>
            <div className="px-3.5 py-1 rounded-full bg-stone-800 text-amber-400 border border-stone-700 text-xs font-bold shadow-md flex items-center gap-1.5">
              <span>Lampiran Matriks Koordinat Astronomis</span>
            </div>
            <div className="h-0.5 bg-stone-700/80 flex-1"></div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LEMBAR 2: LAMPIRAN RESMI MATRIKS KOORDINAT ASTRONOMIS (BEBAS SCROLLBAR)    */}
        {/* ========================================================================= */}
        <div 
          ref={sheet2Ref}
          id="lembar-2-matriks"
          className={`lembar-card bg-white text-stone-900 rounded-2xl shadow-xl border-4 border-emerald-900 overflow-visible sheet-page-break transition-all box-border ${
            !isExporting && activeSheetTab === 'lembar1' ? 'hidden print:block' : 'block'
          }`}
        >
          <div className="p-4 sm:p-7 md:p-10 space-y-4 sm:space-y-6">
            {/* KOP SURAT RESMI LEMBAR 2 (BERSIH TANPA BADGE KOTAK) */}
            {renderOfficialKopSurat()}

            {/* Header Matriks Penetapan */}
            <div className="text-center space-y-0.5 bg-emerald-950 text-white p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 border-emerald-700 shadow-md">
              <h3 className="text-[9px] sm:text-xs font-bold text-emerald-300 uppercase tracking-widest">
                LEMBAGA HISAB FALAKIYAH ALMANSURIYAH JAKARTA MENETAPKAN
              </h3>
              <p className="text-xs sm:text-sm md:text-base font-black text-amber-300 uppercase tracking-wide">
                AWAL {currentRecord.namaBulanHijriyah} {currentRecord.tahunHijriyah} — {currentRecord.hariPasaranAwalBulan}
              </p>
            </div>

            {/* 3 BLOK TABEL MATRIKS KOORDINAT ASTRONOMIS (LEBAR TETAP 100%, BEBAS SCROLLBAR KANAN/KIRI/ATAS/BAWAH) */}
            <div className="space-y-3.5">
              {/* 1. BLOK EKLIPTIKA */}
              <div className="border border-stone-300 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs">
                <div className="bg-stone-800 text-amber-400 font-black px-2.5 sm:px-4 py-1.5 text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="bg-amber-400 text-stone-900 w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[9px] font-black">
                    1
                  </span>
                  <span>SISTEM KOORDINAT EKLIPTIKA</span>
                </div>
                <div className="w-full overflow-visible">
                  <table className="w-full table-fixed text-[10px] sm:text-xs text-stone-800 divide-y divide-stone-200">
                    <colgroup>
                      <col className="w-[28%]" />
                      <col className="w-[28%]" />
                      <col className="w-[22%]" />
                      <col className="w-[22%]" />
                    </colgroup>
                    <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[9px] sm:text-[11px]">
                      <tr>
                        <th className="px-2 sm:px-3 py-1.5 text-left">Parameter</th>
                        <th className="px-2 sm:px-3 py-1.5 text-left">Kondisi / Waktu</th>
                        <th className="px-2 sm:px-3 py-1.5 text-left">Matahari</th>
                        <th className="px-2 sm:px-3 py-1.5 text-left">Bulan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white font-mono text-[9.5px] sm:text-xs">
                      <tr>
                        <td className="px-2 sm:px-3 py-1.5 font-sans font-bold text-stone-900" rowSpan={2}>
                          λ (Bujur Astronomis)
                        </td>
                        <td className="px-2 sm:px-3 py-1.5 font-sans text-stone-700">Saat Ijtima'</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900">{m.lambdaSunIjtima}</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900">{m.lambdaMoonIjtima}</td>
                      </tr>
                      <tr className="bg-stone-50/60">
                        <td className="px-2 sm:px-3 py-1.5 font-sans text-stone-700">Saat Maghrib (Ghurub)</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900">{m.lambdaSunMaghrib}</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900 font-bold text-emerald-800">{m.lambdaMoonMaghrib}</td>
                      </tr>
                      <tr>
                        <td className="px-2 sm:px-3 py-1.5 font-sans font-bold text-stone-900">
                          β (Lintang Astronomis)
                        </td>
                        <td className="px-2 sm:px-3 py-1.5 font-sans text-stone-700">Posisi Hakiki</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900">{m.betaSun}</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900 font-bold">{m.betaMoon}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. BLOK EKUATOR */}
              <div className="border border-stone-300 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs">
                <div className="bg-stone-800 text-amber-400 font-black px-2.5 sm:px-4 py-1.5 text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="bg-amber-400 text-stone-900 w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[9px] font-black">
                    2
                  </span>
                  <span>SISTEM KOORDINAT EKUATOR</span>
                </div>
                <div className="w-full overflow-visible">
                  <table className="w-full table-fixed text-[10px] sm:text-xs text-stone-800 divide-y divide-stone-200">
                    <colgroup>
                      <col className="w-[28%]" />
                      <col className="w-[28%]" />
                      <col className="w-[22%]" />
                      <col className="w-[22%]" />
                    </colgroup>
                    <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[9px] sm:text-[11px]">
                      <tr>
                        <th className="px-2 sm:px-3 py-1.5 text-left">Parameter</th>
                        <th className="px-2 sm:px-3 py-1.5 text-left">Format / Satuan</th>
                        <th className="px-2 sm:px-3 py-1.5 text-left">Matahari</th>
                        <th className="px-2 sm:px-3 py-1.5 text-left">Bulan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white font-mono text-[9.5px] sm:text-xs">
                      <tr>
                        <td className="px-2 sm:px-3 py-1.5 font-sans font-bold text-stone-900">
                          δ (Deklinasi)
                        </td>
                        <td className="px-2 sm:px-3 py-1.5 font-sans text-stone-700">Derajat (° ' '')</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900">{m.deltaSun}</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900 font-bold">{m.deltaMoon}</td>
                      </tr>
                      <tr className="bg-stone-50/60">
                        <td className="px-2 sm:px-3 py-1.5 font-sans font-bold text-stone-900" rowSpan={2}>
                          α (Asensiorekta)
                        </td>
                        <td className="px-2 sm:px-3 py-1.5 font-sans text-stone-700">Format Derajat (° ' '')</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900">{m.alphaSunDeg}</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900">{m.alphaMoonDeg}</td>
                      </tr>
                      <tr className="bg-stone-50/60">
                        <td className="px-2 sm:px-3 py-1.5 font-sans text-stone-700">Format Jam (H M D)</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900">{m.alphaSunTime}</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900 font-bold text-emerald-800">{m.alphaMoonTime}</td>
                      </tr>
                      <tr>
                        <td className="px-2 sm:px-3 py-1.5 font-sans font-bold text-stone-900" rowSpan={2}>
                          t (Sudut Waktu)
                        </td>
                        <td className="px-2 sm:px-3 py-1.5 font-sans text-stone-700">Format Derajat (° ' '')</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900">{m.tSunDeg}</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900">{m.tMoonDeg}</td>
                      </tr>
                      <tr>
                        <td className="px-2 sm:px-3 py-1.5 font-sans text-stone-700">Format Jam (H M D)</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900">{m.tSunTime}</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900 font-bold">{m.tMoonTime}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. BLOK HORIZON */}
              <div className="border border-stone-300 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs">
                <div className="bg-stone-800 text-amber-400 font-black px-2.5 sm:px-4 py-1.5 text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="bg-amber-400 text-stone-900 w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[9px] font-black">
                    3
                  </span>
                  <span>SISTEM KOORDINAT HORIZON</span>
                </div>
                <div className="w-full overflow-visible">
                  <table className="w-full table-fixed text-[10px] sm:text-xs text-stone-800 divide-y divide-stone-200">
                    <colgroup>
                      <col className="w-[28%]" />
                      <col className="w-[28%]" />
                      <col className="w-[22%]" />
                      <col className="w-[22%]" />
                    </colgroup>
                    <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[9px] sm:text-[11px]">
                      <tr>
                        <th className="px-2 sm:px-3 py-1.5 text-left">Parameter</th>
                        <th className="px-2 sm:px-3 py-1.5 text-left">Keterangan</th>
                        <th className="px-2 sm:px-3 py-1.5 text-left">Matahari</th>
                        <th className="px-2 sm:px-3 py-1.5 text-left">Bulan (Hilal)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white font-mono text-[9.5px] sm:text-xs">
                      <tr>
                        <td className="px-2 sm:px-3 py-1.5 font-sans font-bold text-stone-900">
                          h (Tinggi)
                        </td>
                        <td className="px-2 sm:px-3 py-1.5 font-sans text-stone-700">Tinggi Akhir Saat Ghurub</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900">{m.hSun}</td>
                        <td className="px-2 sm:px-3 py-1.5 font-bold text-red-700">{m.hMoon}</td>
                      </tr>
                      <tr className="bg-stone-50/60">
                        <td className="px-2 sm:px-3 py-1.5 font-sans font-bold text-stone-900">
                          A (Azimuth)
                        </td>
                        <td className="px-2 sm:px-3 py-1.5 font-sans text-stone-700">Sudut Arah Dari Utara</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900">{m.aSun}</td>
                        <td className="px-2 sm:px-3 py-1.5 text-stone-900 font-bold">{m.aMoon}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PARAMETER TAMBAHAN */}
              <div className="bg-stone-100 border border-stone-200 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 grid grid-cols-2 md:grid-cols-4 gap-2 text-stone-800">
                <div>
                  <span className="font-bold text-stone-600 block text-[9px] uppercase">Elongasi Bulan - Mat</span>
                  <span className="font-mono font-bold text-stone-900 text-xs sm:text-sm block">{m.elongation}</span>
                </div>
                <div>
                  <span className="font-bold text-stone-600 block text-[9px] uppercase">Umur Bulan (Derajat)</span>
                  <span className="font-mono font-bold text-stone-900 text-xs sm:text-sm block">{m.umurBulanDeg}</span>
                </div>
                <div>
                  <span className="font-bold text-stone-600 block text-[9px] uppercase">Umur Bulan (Waktu)</span>
                  <span className="font-mono font-bold text-stone-900 text-xs sm:text-sm block">{m.umurBulanTime}</span>
                </div>
                <div>
                  <span className="font-bold text-stone-600 block text-[9px] uppercase">Status Visibilitas</span>
                  <span className="font-bold text-emerald-800 text-xs sm:text-sm block leading-tight">{currentRecord.statusHilal}</span>
                </div>
              </div>
            </div>

            {/* Tanda Tangan & Stempel Resmi Lembar 2 */}
            {renderOfficialSignatures(currentRecord.tanggalMasehiIjtima)}

            {/* Catatan Kaki Lembar 2 */}
            <div className="pt-2 text-center text-[9px] text-stone-400 font-medium">
              Lampiran Matriks Koordinat Astronomis &bull; Kitab Induk Sullam an-Nayyirain
            </div>
          </div>
        </div>

      </div>

      {/* 4. EKSPOR LEMBAR RESMI (PNG, JPG, PDF 2 LEMBAR, WHATSAPP, SALIN TEKS) */}
      <div
        data-export-ignore="true"
        className="w-full border-t-2 sm:border-t-4 border-emerald-900 p-3 sm:p-5 bg-stone-900 text-stone-100 rounded-2xl shadow-xl select-none print:hidden transition-colors"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Info & Penjelasan */}
          <div className="flex items-center gap-3 text-center lg:text-left">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shrink-0 hidden sm:block">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs sm:text-sm text-white uppercase tracking-wide flex items-center justify-center lg:justify-start gap-1.5">
                <span>Ekspor Berkas Resmi 2 Lembar (Kop Surat)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black">
                  2 HALAMAN HD
                </span>
              </h5>
              <p className="text-[10px] sm:text-xs text-stone-400 mt-0.5">
                Unduh PDF multi-halaman resmi A4 (Lembar 1 + Lembar 2 ber-kop surat), simpan gambar HD bebas scrollbar, atau salin teks naskah.
              </p>
            </div>
          </div>

          {/* Tombol Ekspor */}
          <div className="flex flex-wrap items-center justify-center gap-2 w-full lg:w-auto">
            {/* UNDUH PDF 2 LEMBAR */}
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="flex-1 sm:flex-none h-9.5 px-3.5 bg-red-700 hover:bg-red-600 active:bg-red-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              title="Unduh dokumen PDF A4 2 lembar resmi ber-kop surat"
            >
              {isExporting && exportType === 'PDF' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>Unduh PDF (2 Lembar)</span>
            </button>

            {/* SIMPAN GAMBAR LEMBAR 1 */}
            <button
              onClick={() => handleExportSingleSheetImage(1, 'png')}
              disabled={isExporting}
              className="flex-1 sm:flex-none h-9.5 px-3 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              title="Simpan gambar resolusi tinggi Lembar 1 (PNG HD)"
            >
              {isExporting && exportType === 'L1_PNG' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              <span>Lembar 1 (PNG)</span>
            </button>

            {/* SIMPAN GAMBAR LEMBAR 2 */}
            <button
              onClick={() => handleExportSingleSheetImage(2, 'png')}
              disabled={isExporting}
              className="flex-1 sm:flex-none h-9.5 px-3 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              title="Simpan gambar resolusi tinggi Lembar 2 (PNG HD)"
            >
              {isExporting && exportType === 'L2_PNG' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              <span>Lembar 2 (PNG)</span>
            </button>

            {/* SIMPAN GABUNGAN 2 LEMBAR */}
            <button
              onClick={() => handleExportBothSheetsImage('png')}
              disabled={isExporting}
              className="flex-1 sm:flex-none h-9.5 px-3 bg-stone-800 hover:bg-stone-700 active:bg-stone-900 disabled:opacity-50 text-stone-200 font-bold text-xs rounded-xl border border-stone-700 shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              title="Simpan gabungan 2 lembar sekaligus dalam 1 gambar"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Gabungan (PNG)</span>
            </button>

            {/* BAGIKAN WHATSAPP */}
            <button
              onClick={handleShareWhatsApp}
              disabled={isExporting}
              className="flex-1 sm:flex-none h-9.5 px-3 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa51] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              title="Bagikan berkas hisab ke WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* SALIN NASKAH TEKS */}
            <button
              onClick={handleCopyText}
              className="flex-1 sm:flex-none h-9.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl border border-stone-700 shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
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
