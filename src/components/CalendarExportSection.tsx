import React, { useState } from 'react';
import { 
  Download, 
  Image as ImageIcon, 
  FileText, 
  Share2, 
  Sparkles, 
  Loader2, 
  Check, 
  Smartphone 
} from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import { CalendarTheme } from '../types/calendar';
import { NAMA_BULAN } from '../utils/calendarMath';

interface CalendarExportSectionProps {
  month: number;
  year: number;
  theme: CalendarTheme;
  targetRef: React.RefObject<HTMLElement | null>;
  onShowToast: (text: string, type?: 'success' | 'error') => void;
}

export const CalendarExportSection: React.FC<CalendarExportSectionProps> = ({
  month,
  year,
  theme,
  targetRef,
  onShowToast
}) => {
  const isDark = theme === 'dark';
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportType, setExportType] = useState<string | null>(null);

  const monthName = NAMA_BULAN[month - 1] || `Bulan_${month}`;
  const filenameBase = `Kalender_Nusantara_${monthName}_${year}`;

  const triggerDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  const handleExportImage = async (format: 'png' | 'jpg') => {
    if (!targetRef.current || isExporting) return;

    try {
      setIsExporting(true);
      setExportType(format.toUpperCase());

      // Filter function to exclude elements with data-export-ignore during capture
      const filter = (node: HTMLElement) => {
        return !(node.dataset && node.dataset.exportIgnore === 'true');
      };

      const options = {
        filter,
        pixelRatio: 2, // High resolution (2x) for wallpaper & WhatsApp
        cacheBust: true,
        backgroundColor: isDark ? '#121212' : '#ffffff',
        fontEmbedCSS: '',
        skipFonts: true
      };

      let dataUrl = '';
      if (format === 'png') {
        dataUrl = await toPng(targetRef.current, options);
        triggerDownload(dataUrl, `${filenameBase}.png`);
      } else {
        dataUrl = await toJpeg(targetRef.current, { ...options, quality: 0.95 });
        triggerDownload(dataUrl, `${filenameBase}.jpg`);
      }

      onShowToast(`Gambar ${format.toUpperCase()} resolusi tinggi berhasil disimpan! Siap untuk WhatsApp & Wallpaper.`);
      confetti({ particleCount: 60, spread: 65, origin: { y: 0.7 } });
    } catch (err: any) {
      console.error('Export error:', err);
      onShowToast('Gagal memproses ekspor gambar. Silakan coba lagi.', 'error');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleExportPdf = async () => {
    if (!targetRef.current || isExporting) return;

    try {
      setIsExporting(true);
      setExportType('PDF');

      const filter = (node: HTMLElement) => {
        return !(node.dataset && node.dataset.exportIgnore === 'true');
      };

      const dataUrl = await toPng(targetRef.current, {
        filter,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: isDark ? '#121212' : '#ffffff',
        fontEmbedCSS: '',
        skipFonts: true
      });

      // Create PDF in A4 format (210 x 297 mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const printWidth = pageWidth - margin * 2;

      // Calculate proportional height
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const imgAspect = img.width / img.height;
      let printW = printWidth;
      let printH = printW / imgAspect;

      if (printH > pageHeight - margin * 2) {
        printH = pageHeight - margin * 2;
        printW = printH * imgAspect;
      }

      const xPos = (pageWidth - printW) / 2;
      const yPos = margin;

      pdf.addImage(dataUrl, 'PNG', xPos, yPos, printW, printH, undefined, 'FAST');
      pdf.save(`${filenameBase}.pdf`);

      onShowToast(`Dokumen PDF kalender ${monthName} ${year} berhasil diunduh!`);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      console.error('PDF export error:', err);
      onShowToast('Gagal memproses ekspor PDF. Silakan coba lagi.', 'error');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleShare = async () => {
    if (!targetRef.current || isExporting) return;

    if (navigator.share) {
      try {
        setIsExporting(true);
        setExportType('SHARE');

        const filter = (node: HTMLElement) => {
          return !(node.dataset && node.dataset.exportIgnore === 'true');
        };

        const dataUrl = await toPng(targetRef.current, {
          filter,
          pixelRatio: 2,
          backgroundColor: isDark ? '#121212' : '#ffffff',
          fontEmbedCSS: '',
          skipFonts: true
        });

        // Convert base64 dataUrl to File
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `${filenameBase}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Kalender ${monthName} ${year}`,
            text: `Kalender Nusantara ${monthName} ${year} lengkap dengan penanggalan Hijriyah, Pasaran Jawa & Weton`,
            files: [file]
          });
          onShowToast('Berhasil dibagikan!');
        } else {
          await navigator.share({
            title: `Kalender ${monthName} ${year}`,
            text: `Kalender Nusantara ${monthName} ${year}`
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
      // Fallback to downloading PNG for WhatsApp
      handleExportImage('png');
    }
  };

  return (
    <div
      data-export-ignore="true"
      className={`w-full border-t-2 border-stone-900 p-3 sm:p-4 transition-colors select-none print:hidden ${
        isDark ? 'bg-[#1e1e1e] text-stone-100' : 'bg-[#f4f7f6] text-stone-800'
      }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Info & Penjelasan */}
        <div className="flex items-center gap-2.5 text-center md:text-left">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs shrink-0 hidden sm:block">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-stone-100 uppercase tracking-wide flex items-center justify-center md:justify-start gap-1.5">
              <span>Ekspor Kalender ke Gambar & Dokumen</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 font-black">
                HD
              </span>
            </h5>

          </div>
        </div>

        {/* Tombol Ekspor: PNG, JPG, PDF, Share */}
        <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
          {/* PNG HD */}
          <button
            onClick={() => handleExportImage('png')}
            disabled={isExporting}
            className="flex-1 sm:flex-none h-9 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            title="Simpan gambar format PNG resolusi tinggi (Cocok untuk Wallpaper & WhatsApp)"
          >
            {isExporting && exportType === 'PNG' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5" />
            )}
            <span>Simpan PNG (HD)</span>
          </button>

          {/* PDF */}
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex-1 sm:flex-none h-9 px-3 bg-red-700 hover:bg-red-600 active:bg-red-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            title="Unduh dokumen PDF A4 siap cetak"
          >
            {isExporting && exportType === 'PDF' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            <span>Unduh PDF</span>
          </button>

          {/* Bagikan ke WhatsApp / Share */}
          <button
            onClick={handleShare}
            disabled={isExporting}
            className="flex-1 sm:flex-none h-9 px-3 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa51] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            title="Bagikan langsung ke WhatsApp atau media sosial"
          >
            {isExporting && exportType === 'SHARE' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span>Bagi WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
