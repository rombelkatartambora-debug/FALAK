import React, { useState, useMemo, useRef } from 'react';
import {
  Copy,
  Check,
  Download,
  BookOpen,
  Loader2
} from 'lucide-react';
import {
  generateSullamCompleteReport,
  BLANKO_IJTIMA_38_ITEMS,
  SullamCompleteReportData
} from '../utils/sullamPdfEngine';
import { FalakMonthRecord } from '../utils/almansuriyahFalakData';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import { getHijriDate, NAMA_BULAN } from '../utils/calendarMath';

interface ReportLengkapViewProps {
  currentRecord: FalakMonthRecord;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

// Konversi angka latin ke Angka Arab-India Timur (٠، ١، ٢، ٣، ٤، ٥، ٦، ٧، ٨، ٩)
function toArabicDigits(strOrNum: number | string | undefined): string {
  if (strOrNum === undefined || strOrNum === null || strOrNum === '-' || strOrNum === '') return '-';
  const s = String(strOrNum);
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return s.replace(/[0-9]/g, (d) => arabicNumbers[parseInt(d, 10)] ?? d);
}

// Operasi dalam Bahasa Arab
function getArabicOperasi(op?: string, qaidah?: string): string {
  if (op === '+') return '+ (جمع)';
  if (op === '-') return '- (طرح)';
  if (op === 'x') return `× (ضرب ${toArabicDigits(qaidah)})`;
  if (op === 'خ') return 'خ (خاص)';
  if (op === 'م') return 'م (معدل)';
  if (qaidah) return `[قاعدة ${toArabicDigits(qaidah)}]`;
  return '-';
}

// Operasi dalam Bahasa Indonesia
function getLatinOperasi(op?: string, qaidah?: string): string {
  if (op === '+') return '+ (Tambah)';
  if (op === '-') return '- (Kurang)';
  if (op === 'x') return `× (Kali ${qaidah || ''})`;
  if (op === 'خ') return 'Koreksi Khusus';
  if (op === 'م') return 'Koreksi Jam';
  if (qaidah) return `[Qaidah ${qaidah}]`;
  return '-';
}

// Format ringkas nilai falak latin untuk tampilan mobile bebas geser
function formatBlankoValueLatin(val: {
  buruj?: number | string;
  darajah?: number | string;
  daqiqah?: number | string;
  tsaniyah?: number | string;
  tsalitsah?: number | string;
  catatan?: string;
}): string {
  if (val.catatan) {
    return val.buruj !== undefined ? `#${val.buruj} ${val.catatan}` : val.catatan;
  }
  const parts: string[] = [];
  if (val.buruj !== undefined && val.buruj !== '-') {
    parts.push(`${val.buruj}j`);
  }
  if (val.darajah !== undefined && val.darajah !== '-') {
    parts.push(typeof val.darajah === 'number' ? `${val.darajah}°` : `${val.darajah}`);
  }
  if (val.daqiqah !== undefined && val.daqiqah !== '-') {
    parts.push(`${val.daqiqah}'`);
  }
  if (val.tsaniyah !== undefined && val.tsaniyah !== '-') {
    parts.push(`${val.tsaniyah}"`);
  }
  if (val.tsalitsah !== undefined && val.tsalitsah !== '-') {
    parts.push(`${val.tsalitsah}‴`);
  }
  return parts.length > 0 ? parts.join(' ') : '-';
}

// Format ringkas nilai falak arab untuk tampilan mobile bebas geser
function formatBlankoValueArabic(val: {
  buruj?: number | string;
  darajah?: number | string;
  daqiqah?: number | string;
  tsaniyah?: number | string;
  tsalitsah?: number | string;
  catatan?: string;
}): string {
  if (val.catatan) {
    return val.buruj !== undefined ? `${toArabicDigits(val.buruj)} ${val.catatan}` : val.catatan;
  }
  const parts: string[] = [];
  if (val.buruj !== undefined && val.buruj !== '-') {
    parts.push(`${toArabicDigits(val.buruj)}ج`);
  }
  if (val.darajah !== undefined && val.darajah !== '-') {
    parts.push(typeof val.darajah === 'number' ? `${toArabicDigits(val.darajah)}°` : `${val.darajah}`);
  }
  if (val.daqiqah !== undefined && val.daqiqah !== '-') {
    parts.push(`${toArabicDigits(val.daqiqah)}'`);
  }
  if (val.tsaniyah !== undefined && val.tsaniyah !== '-') {
    parts.push(`${toArabicDigits(val.tsaniyah)}"`);
  }
  if (val.tsalitsah !== undefined && val.tsalitsah !== '-') {
    parts.push(`${toArabicDigits(val.tsalitsah)}‴`);
  }
  return parts.length > 0 ? parts.join(' ') : '-';
}

// Pemetaan nama bulan hijriyah ke bahasa Arab resmi naskah falak
const NAMA_BULAN_HIJRIYAH_ARAB: Record<string, string> = {
  'MUHARRAM': 'المحرم',
  'SHAFAR': 'صفر',
  'RABIUL AWAL': 'ربيع الأول',
  'RABIUL AKHIR': 'ربيع الآخر',
  'JUMADIL AWAL': 'جمادى الأولى',
  'JUMADIL AKHIR': 'جمادى الآخرة',
  'JUMADAL ULA': 'جمادى الأولى',
  'JUMADAT TSANIYAH': 'جمادى الآخرة',
  'RAJAB': 'رجب',
  'SYA\'BAN': 'شعبان',
  'SYABAN': 'شعبان',
  'RAMADHAN': 'رمضان',
  'SYAWAL': 'شوال',
  'DZULQA\'DAH': 'ذو القعدة',
  'DZULQADAH': 'ذو القعدة',
  'DZULHIJJAH': 'ذو الحجة'
};

function getNamaBulanArab(namaBulanLatin?: string): string {
  if (!namaBulanLatin) return 'جمادى الأولى';
  const clean = namaBulanLatin.trim().toUpperCase();
  return NAMA_BULAN_HIJRIYAH_ARAB[clean] || clean;
}

function getMarkazArab(markazLatin?: string): string {
  if (!markazLatin) return 'جاكرتا';
  const clean = markazLatin.trim().toUpperCase();
  if (clean.includes('JAKARTA') || clean.includes('BETAWI')) {
    return 'جاكرتا';
  }
  return 'جاكرتا';
}

// Fungsi pemetaan data autentik ke 38 baris Blanko Sullamun Nayyiroin
function getBlankoItemData(no: number, data: SullamCompleteReportData): {
  buruj?: number | string;
  darajah?: number | string;
  daqiqah?: number | string;
  tsaniyah?: number | string;
  tsalitsah?: number | string;
  catatan?: string;
} {
  switch (no) {
    case 1: // Ta'dil al-Khashshah
      return {
        darajah: data.kotak1_tadilKhashshah.hasilAkhir.ja,
        daqiqah: data.kotak1_tadilKhashshah.hasilAkhir.qa,
        tsaniyah: data.kotak1_tadilKhashshah.hasilAkhir.ny ?? 0
      };
    case 2: // Ta'dil al-Markaz
      return {
        darajah: data.kotak2_tadilMarkaz.hasilAkhir.ja,
        daqiqah: data.kotak2_tadilMarkaz.hasilAkhir.qa,
        tsaniyah: data.kotak2_tadilMarkaz.hasilAkhir.ny ?? 0
      };
    case 3: // Al-Bu'du bainan Nayyirain
      return {
        darajah: data.kotak3_budNayyirainGhayr.hasil.ja,
        daqiqah: data.kotak3_budNayyirainGhayr.hasil.qa,
        tsaniyah: data.kotak3_budNayyirainGhayr.hasil.ny
      };
    case 4: // Qaidah 5
      return { darajah: 5 };
    case 5: // Hasil ad-Dharb
      return {
        darajah: data.kotak4_tadilSyams.hasilDharb.ja,
        daqiqah: data.kotak4_tadilSyams.hasilDharb.qa,
        tsaniyah: data.kotak4_tadilSyams.hasilDharb.ny,
        tsalitsah: data.kotak4_tadilSyams.hasilDharb.lts
      };
    case 6: // Ta'dil al-Markaz
      return {
        darajah: data.kotak4_tadilSyams.tadilMarkaz.ja,
        daqiqah: data.kotak4_tadilSyams.tadilMarkaz.qa,
        tsaniyah: data.kotak4_tadilSyams.tadilMarkaz.ny
      };
    case 7: // Ta'dil asy-Syams
      return {
        darajah: data.kotak4_tadilSyams.hasil.ja,
        daqiqah: data.kotak4_tadilSyams.hasil.qa,
        tsaniyah: data.kotak4_tadilSyams.hasil.ny,
        tsalitsah: data.kotak4_tadilSyams.hasil.lts
      };
    case 8: // Al-Markaz
      return {
        buruj: data.kotak5_wasathSyams.markaz.j,
        darajah: data.kotak5_wasathSyams.markaz.ja,
        daqiqah: data.kotak5_wasathSyams.markaz.qa
      };
    case 9: // Al-Awj
      return {
        buruj: data.kotak5_wasathSyams.awj.j,
        darajah: data.kotak5_wasathSyams.awj.ja,
        daqiqah: data.kotak5_wasathSyams.awj.qa
      };
    case 10: // Al-Wasath
      return {
        buruj: data.kotak5_wasathSyams.hasil.j,
        darajah: data.kotak5_wasathSyams.hasil.ja,
        daqiqah: data.kotak5_wasathSyams.hasil.qa
      };
    case 11: // Ta'dil asy-Syams (-)
      return {
        darajah: data.kotak4_tadilSyams.hasil.ja,
        daqiqah: data.kotak4_tadilSyams.hasil.qa,
        tsaniyah: data.kotak4_tadilSyams.hasil.ny
      };
    case 12: // Muqawwam asy-Syams
      return {
        buruj: data.kotak6_muqawwamSyams.hasil.j,
        darajah: data.kotak6_muqawwamSyams.hasil.ja,
        daqiqah: data.kotak6_muqawwamSyams.hasil.qa,
        tsaniyah: data.kotak6_muqawwamSyams.hasil.ny
      };
    case 13: // Ta'dil al-Ayyam
      return {
        darajah: data.kotak7_tadilAyyam.hasil.ja,
        daqiqah: data.kotak7_tadilAyyam.hasil.qa
      };
    case 14: // Al-Bu'd bainan Nayyirain
      return {
        darajah: data.kotak8_budNayyirainMuaddal.budGhayr.ja,
        daqiqah: data.kotak8_budNayyirainMuaddal.budGhayr.qa,
        tsaniyah: data.kotak8_budNayyirainMuaddal.budGhayr.ny
      };
    case 15: // Al-Bu'dul Mu'addal
      return {
        darajah: data.kotak8_budNayyirainMuaddal.hasil.ja,
        daqiqah: data.kotak8_budNayyirainMuaddal.hasil.qa,
        tsaniyah: data.kotak8_budNayyirainMuaddal.hasil.ny
      };
    case 16: // Hishshah as-Sa'ah
      return {
        darajah: data.kotak9_hishshahSaah.hasil.ja,
        daqiqah: data.kotak9_hishshahSaah.hasil.qa
      };
    case 17: // Ta'dil al-'Alamah
      return {
        darajah: data.kotak10_tadilAlamah.hasil.h,
        daqiqah: data.kotak10_tadilAlamah.hasil.m,
        tsaniyah: data.kotak10_tadilAlamah.hasil.s,
        tsalitsah: data.kotak10_tadilAlamah.hasil.lts
      };
    case 18: // Al-'Alamah Ghayr
      return {
        buruj: data.kotak11_alamahJakarta.alamahGhayr.m,
        darajah: data.kotak11_alamahJakarta.alamahGhayr.h,
        daqiqah: data.kotak11_alamahJakarta.alamahGhayr.mnt
      };
    case 19: // Al-Ijtima'
      return {
        buruj: data.kotak11_alamahJakarta.hasil.m,
        darajah: data.kotak11_alamahJakarta.hasil.h,
        daqiqah: data.kotak11_alamahJakarta.hasil.mnt,
        tsaniyah: data.kotak11_alamahJakarta.hasil.s,
        tsalitsah: data.kotak11_alamahJakarta.hasil.lts
      };
    case 20: // Qaidah Tathbiq 1
      return { darajah: 1 };
    case 21: // Al-Ijtima' "Al-Batawi"
      return {
        buruj: data.kotak11_alamahJakarta.hasil.m,
        darajah: data.kotak11_alamahJakarta.hasil.h,
        daqiqah: data.kotak11_alamahJakarta.hasil.mnt,
        tsaniyah: data.kotak11_alamahJakarta.hasil.s
      };
    case 22: // Tafawut al-Balad (Selisih Bujur)
      return {
        darajah: data.kotak12_fadhlThulain.hasil.h,
        daqiqah: data.kotak12_fadhlThulain.hasil.m,
        tsaniyah: data.kotak12_fadhlThulain.hasil.s,
        tsalitsah: data.kotak12_fadhlThulain.hasil.lts
      };
    case 23: // Al-Ijtima' "Al-Balad"
      return {
        buruj: data.kotak13_alamahBalad.hasil.m,
        darajah: data.kotak13_alamahBalad.hasil.h,
        daqiqah: data.kotak13_alamahBalad.hasil.mnt,
        tsaniyah: data.kotak13_alamahBalad.hasil.s,
        tsalitsah: data.kotak13_alamahBalad.hasil.lts
      };
    case 24: // Qaidah 24 Jam
      return { darajah: 24 };
    case 25: // 'Adad as-Sa'ah
      return {
        darajah: data.kotak14_irtifaHilal.adadSaah.h,
        daqiqah: data.kotak14_irtifaHilal.adadSaah.m,
        tsaniyah: data.kotak14_irtifaHilal.adadSaah.s,
        tsalitsah: data.kotak14_irtifaHilal.adadSaah.lts
      };
    case 26: // Qaidah 30
      return { darajah: 30 };
    case 27: // Irtifa' al-Hilal
      return {
        darajah: data.kotak14_irtifaHilal.hasil.ja,
        daqiqah: data.kotak14_irtifaHilal.hasil.qa,
        tsaniyah: data.kotak14_irtifaHilal.hasil.ny,
        tsalitsah: data.kotak14_irtifaHilal.hasil.lts
      };
    case 28: // Qaidah 4
      return { darajah: 4 };
    case 29: // Mukts al-Hilal
      return {
        darajah: data.kotak15_muktsHilal.hasil.h,
        daqiqah: data.kotak15_muktsHilal.hasil.m,
        tsaniyah: data.kotak15_muktsHilal.hasil.s
      };
    case 30: // 'Ardh al-Qamar
      return {
        darajah: data.kotak16_ardhQamar.hasil.ja,
        daqiqah: data.kotak16_ardhQamar.hasil.qa,
        tsaniyah: data.kotak16_ardhQamar.hasil.ny
      };
    case 31: // Qaidah 4
      return { darajah: 4 };
    case 32: // 'Ardh al-Qamar al-Mu'addal
      return {
        darajah: data.kotak17_qawsNurHilal.hasilDharb.h,
        daqiqah: data.kotak17_qawsNurHilal.hasilDharb.m,
        tsaniyah: data.kotak17_qawsNurHilal.hasilDharb.s
      };
    case 33: // Mukts al-Hilal
      return {
        darajah: data.kotak17_qawsNurHilal.muktsHilal.h,
        daqiqah: data.kotak17_qawsNurHilal.muktsHilal.m,
        tsaniyah: data.kotak17_qawsNurHilal.muktsHilal.s
      };
    case 34: // Nur al-Hilal (Qaws Nur)
      return {
        darajah: data.kotak17_qawsNurHilal.hasil.ja,
        daqiqah: data.kotak17_qawsNurHilal.hasil.qa,
        tsaniyah: data.kotak17_qawsNurHilal.hasil.ny
      };
    case 35: // Jihatu al-Hilal
      return {
        darajah: data.kotak16_ardhQamar.hasil.ja >= 0 ? 'شمال' : 'جنوب'
      };
    case 36: // Mail al-Hilal
      return {
        darajah: Math.abs(data.kotak16_ardhQamar.hasil.ja),
        daqiqah: data.kotak16_ardhQamar.hasil.qa
      };
    case 37: // Manazil al-Hilal
      return {
        buruj: data.kotak18_manzilatQamar.manzilahNomor,
        catatan: data.kotak18_manzilatQamar.manzilahNama
      };
    case 38: // Irtifa' Hilal Derajat/Busur
      return {
        darajah: data.kotak14_irtifaHilal.hasil.ja,
        daqiqah: data.kotak14_irtifaHilal.hasil.qa,
        tsaniyah: data.kotak14_irtifaHilal.hasil.ny
      };
    default:
      return {};
  }
}

type ActiveReportSection = 
  | 'semua' 
  | 'surat' 
  | 'penetapan' 
  | 'lembar1' 
  | 'lembar2' 
  | 'lembar3' 
  | 'lembar4';

export const ReportLengkapView: React.FC<ReportLengkapViewProps> = ({
  currentRecord,
  onShowToast
}) => {
  // Pilihan Tab internal dalam Laporan Lengkap
  const [activeSection, setActiveSection] = useState<ActiveReportSection>('semua');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Referensi kontainer laporan lengkap per lembar A4 untuk ekspor PDF
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const refSurat = useRef<HTMLElement>(null);
  const refPenetapan = useRef<HTMLElement>(null);
  const refPerhitunganPart1 = useRef<HTMLElement>(null);
  const refPerhitunganPart2 = useRef<HTMLElement>(null);
  const refBlankoIndo = useRef<HTMLElement>(null);
  const refBlankoArab = useRef<HTMLElement>(null);

  // Tanggal Hari Ini Sebagai Default Tanggal Surat (Sesuai Permintaan User)
  const today = useMemo(() => new Date(), []);
  const defaultTanggalMasehi = useMemo(() => {
    return `${today.getDate()} ${NAMA_BULAN[today.getMonth()]} ${today.getFullYear()} M`;
  }, [today]);

  const defaultTanggalHijriyah = useMemo(() => {
    const h = getHijriDate(today);
    return `${h.day} ${h.monthName} ${h.year} H`;
  }, [today]);

  // State tanggal surat pengantar & penetapan (Keduanya independen & default hari ini)
  const [tanggalSuratMasehi, setTanggalSuratMasehi] = useState<string>(defaultTanggalMasehi);
  const [tanggalSuratHijriyah, setTanggalSuratHijriyah] = useState<string>(defaultTanggalHijriyah);
  const [tanggalPenetapanMasehi, setTanggalPenetapanMasehi] = useState<string>(defaultTanggalMasehi);

  // Generate data komprehensif hisab secara otomatis mengikuti bulan & tahun aktif saat ini
  const data: SullamCompleteReportData = useMemo(() => {
    return generateSullamCompleteReport(
      currentRecord.bulanHijriyahKe,
      currentRecord.tahunHijriyah,
      'JAKARTA'
    );
  }, [currentRecord.bulanHijriyahKe, currentRecord.tahunHijriyah]);

  const handleCopySurat = () => {
    const text = `LEMBAGA HISAB FALAKIYAH ALMANSURIYAH JAKARTA
Metode Hisab Sullam An-Nayyirain
No: ${data.nomorSuratKetetapan}

SURAT KEPUTUSAN PENETAPAN FALAKIYAH
AWAL BULAN ${data.namaBulanHijriyah} ${data.tahunHijriyah} H

Berdasarkan hasil hisab qath'i Kitab Sullamun Nayyirain karya KH. Muhammad Manshur Jembatan Lima:
1. Ijtima' Terjadi pada: ${data.kesimpulan.ijtimaHari}, Pukul ${data.kesimpulan.ijtimaJamWIB}
2. Tinggi Hilal Mar'i: ${data.kesimpulan.tinggiHilal}
3. Lama Hilal di Atas Ufuk: ${data.kesimpulan.lamaHilalUfuk}
4. KETETAPAN RESMI: 1 ${data.namaBulanHijriyah} ${data.tahunHijriyah} H jatuh pada ${data.hariPasaranKetetapan}, ${data.tanggalMasehiKetetapan}.

Tertanda,
Pimpinan Lembaga Hisab Falakiyah Almansuriyah`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast('Naskah Surat Resmi Penetapan berhasil disalin!');
    setTimeout(() => setCopied(false), 2500);
  };

  // 1. FUNGSI CETAK DOKUMEN RESMI (A4)
  const handlePrint = () => {
    onShowToast('Membuka dialog cetak... Silakan pilih ukuran kertas A4 pada jendela pencetakan.');
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // 2. FUNGSI EKSPOR PDF HD (A4 Multi-Halaman Nyata & Berfungsi)
  const handleExportPdf = async () => {
    if (isExportingPdf) return;
    try {
      setIsExportingPdf(true);
      onShowToast('Memproses berkas PDF A4 kualitas tinggi...');

      // Buat dokumen PDF A4 (Portrait, 210 x 297 mm)
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Kumpulkan section yang aktif untuk diekspor
      const sectionsToExport: { ref: React.RefObject<HTMLElement | null>; name: string }[] = [];
      if (activeSection === 'semua' || activeSection === 'surat') {
        sectionsToExport.push({ ref: refSurat, name: 'Surat Pengantar' });
      }
      if (activeSection === 'semua' || activeSection === 'penetapan') {
        sectionsToExport.push({ ref: refPenetapan, name: 'Surat Keputusan (SK)' });
      }
      if (activeSection === 'semua' || activeSection === 'lembar1') {
        sectionsToExport.push({ ref: refPerhitunganPart1, name: 'Lampiran Lembar 1: Al-Mustakhrajat & Kotak 1-9' });
      }
      if (activeSection === 'semua' || activeSection === 'lembar2') {
        sectionsToExport.push({ ref: refPerhitunganPart2, name: 'Lampiran Lembar 2: Kotak 10-18 & Komparasi' });
      }
      if (activeSection === 'semua' || activeSection === 'lembar3') {
        sectionsToExport.push({ ref: refBlankoIndo, name: 'Lampiran Lembar 3: Blanko Indonesia (38 Baris)' });
      }
      if (activeSection === 'semua' || activeSection === 'lembar4') {
        sectionsToExport.push({ ref: refBlankoArab, name: 'Lampiran Lembar 4: Blanko Arab (٣٨ مرتبة)' });
      }

      let pageCount = 0;
      for (const item of sectionsToExport) {
        if (!item.ref.current) continue;

        const dataUrl = await toJpeg(item.ref.current, {
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          quality: 0.95,
          fontEmbedCSS: '',
          skipFonts: true
        });

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        if (pageCount > 0) {
          pdf.addPage('a4', 'p');
        }

        const imgRatio = img.height / img.width;
        let renderWidth = pdfWidth - 14; // 7mm margin kiri-kanan
        let renderHeight = renderWidth * imgRatio;

        if (renderHeight > pdfHeight - 14) {
          renderHeight = pdfHeight - 14;
          renderWidth = renderHeight / imgRatio;
        }

        const xPos = (pdfWidth - renderWidth) / 2;
        const yPos = (pdfHeight - renderHeight) / 2;

        pdf.addImage(dataUrl, 'JPEG', xPos, yPos, renderWidth, renderHeight);
        pageCount++;
      }

      if (pageCount > 0) {
        const filename = `Dokumen_Lengkap_Hisab_Sullam_${data.namaBulanHijriyah}_${data.tahunHijriyah}H.pdf`;
        pdf.save(filename);
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 } });
        onShowToast(`Dokumen A4 (${pageCount} Halaman) berhasil diunduh!`);
      } else {
        onShowToast('Tidak ada halaman yang dipilih untuk diekspor', 'error');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Gagal membuat dokumen PDF HD', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* TOOLBAR NAVIGASI & KONTROL ATAS (A4 RESMI) */}
      <div className="bg-stone-900 border border-stone-800 p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Hisab Resmi Kitab Sullam An-Nayyirain &bull; </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs font-bold text-stone-300">
            Bulan Aktif: <span className="text-amber-400">{data.namaBulanHijriyah} {data.tahunHijriyah} H</span>
          </div>
        </div>

        {/* Tombol Bagian & Aksi Ekspor Resmi */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleCopySurat}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-700"
            title="Salin Naskah Teks Surat Keputusan"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span>{copied ? 'Tersalin' : 'Salin Surat'}</span>
          </button>

          {/* Tombol Ekspor PDF HD */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all cursor-pointer disabled:opacity-50"
            title="Unduh berkas PDF A4 multi-halaman kualitas tinggi"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Ekspor PDF HD (A4)</span>
          </button>
        </div>
      </div>

      {/* FILTER SUB-SECTION NAVIGASI */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-stone-800 text-xs print:hidden">
        <button
          onClick={() => setActiveSection('semua')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'semua'
              ? 'bg-stone-800 text-amber-400 border border-amber-500/30'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Semua Dokumen (Surat & 4 Lembar Lampiran)
        </button>
        <button
          onClick={() => setActiveSection('surat')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'surat'
              ? 'bg-stone-800 text-amber-400 border border-amber-500/30'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          1. Surat Pengantar
        </button>
        <button
          onClick={() => setActiveSection('penetapan')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'penetapan'
              ? 'bg-stone-800 text-amber-400 border border-amber-500/30'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          2. Surat Keputusan (SK)
        </button>
        <button
          onClick={() => setActiveSection('lembar1')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'lembar1'
              ? 'bg-stone-800 text-amber-400 border border-amber-500/30'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Lembar 1: Mustakhrajat & Kotak 1-9
        </button>
        <button
          onClick={() => setActiveSection('lembar2')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'lembar2'
              ? 'bg-stone-800 text-amber-400 border border-amber-500/30'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Lembar 2: Kotak 10-18 & Komparasi
        </button>
        <button
          onClick={() => setActiveSection('lembar3')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'lembar3'
              ? 'bg-stone-800 text-amber-400 border border-amber-500/30'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Lembar 3: Blanko Indonesia (38 Baris)
        </button>
        <button
          onClick={() => setActiveSection('lembar4')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'lembar4'
              ? 'bg-stone-800 text-amber-400 border border-amber-500/30'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Lembar 4: Blanko Arab (٣٨ مرتبة)
        </button>
      </div>

      {/* CONTAINER DOKUMEN LAPORAN LENGKAP A4 */}
      <div ref={reportContainerRef} className="space-y-6">
        {/* ========================================================================= */}
        {/* 1. SURAT RESMI PENGANTAR DARI LEMBAGA */}
        {/* ========================================================================= */}
        {(activeSection === 'semua' || activeSection === 'surat') && (
          <section
            ref={refSurat}
            className="bg-white text-stone-900 rounded-2xl p-4 sm:p-8 md:p-10 shadow-xl border border-stone-200 print:border-none print:shadow-none print:p-0 print:my-0 print-page-break max-w-[210mm] mx-auto"
          >
            {/* KOP RESMI LEMBAGA DENGAN LOGO YANG DIUPLOAD */}
            <div className="border-b-4 border-double border-stone-900 pb-4 mb-5">
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <img 
                  src="/logo.png" 
                  alt="Logo Lembaga" 
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/LOGO.png'; }}
                  className="w-16 h-16 sm:w-22 sm:h-22 shrink-0 object-contain drop-shadow" 
                />
                <div className="text-center flex-1">
                  <h2 className="text-sm sm:text-lg md:text-xl font-black tracking-tight text-emerald-900 uppercase">
                    LEMBAGA HISAB FALAKIYAH ALMANSURIYAH
                  </h2>
                  <h3 className="text-[11px] sm:text-xs md:text-sm font-bold text-amber-800 tracking-wider uppercase mt-0.5">
                    PUSAT PENGEMBANGAN HISAB & RUKYAT METODE SULLAM AN-NAYYIRAIN
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-stone-600 mt-1 leading-tight">
                    Karya Al-Allamah Asy-Syaikh Muhammad Manshur bin Abdul Hamid bin Muhammad Damiri Al-Batawi
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-stone-500 mt-0.5">
                    Sekretariat: Jl. Jembatan Lima No. 12, Tambora, Jakarta Barat 11250 | Markaz Falak: 106° 45' 10" BT / 06° 49' 00" LS
                  </p>
                </div>
                {/* Spacer Penyeimbang Kanan (Ukuran Sama Logo Kiri) untuk Menjamin Teks 100% Center */}
                <div className="w-16 h-16 sm:w-22 sm:h-22 shrink-0 invisible pointer-events-none select-none" aria-hidden="true" />
              </div>
            </div>

            {/* NOMOR & PERIHAL SURAT (TANGGAL DEFAULT HARI INI & DAPAT DIUBAH) */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 text-xs sm:text-sm mb-5 leading-relaxed">
              <div>
                <p><span className="font-bold inline-block w-20">Nomor</span>: {data.nomorSuratPengantar}</p>
                <p><span className="font-bold inline-block w-20">Lampiran</span>: 1 (satu) Berkas Hisab Lengkap Sullamun Nayyiroin</p>
                <p><span className="font-bold inline-block w-20">Perihal</span>: <strong>Penyampaian Hasil Hisab Awal Bulan {data.namaBulanHijriyah} {data.tahunHijriyah} H</strong></p>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                <div className="flex items-center justify-start sm:justify-end gap-1">
                  <span>Jakarta, </span>
                  <input
                    type="text"
                    value={tanggalSuratMasehi}
                    onChange={(e) => setTanggalSuratMasehi(e.target.value)}
                    className="font-bold text-stone-900 border-b border-stone-300 focus:border-amber-600 outline-none text-left sm:text-right w-44 bg-transparent print:border-none print:w-auto"
                    title="Klik untuk ubah tanggal surat pengantar Masehi"
                  />
                </div>
                <div className="flex items-center justify-start sm:justify-end gap-1">
                  <input
                    type="text"
                    value={tanggalSuratHijriyah}
                    onChange={(e) => setTanggalSuratHijriyah(e.target.value)}
                    className="text-stone-600 font-semibold border-b border-stone-300 focus:border-amber-600 outline-none text-left sm:text-right w-44 bg-transparent print:border-none print:w-auto text-xs"
                    title="Klik untuk ubah tanggal surat pengantar Hijriyah"
                  />
                </div>
              </div>
            </div>

            {/* TUJUAN SURAT */}
            <div className="text-xs sm:text-sm mb-5">
              <p>Kepada Yang Terhormat:</p>
              <p className="font-bold">1. Para Ulama, Habaib, dan Asatidz Pengasuh Pondok Pesantren</p>
              <p className="font-bold">2. Pengurus Masjid, Musholla, dan Majelis Ta'lim</p>
              <p className="font-bold">3. Seluruh Kaum Muslimin & Muslimat</p>
              <p className="text-stone-600">di Tempat</p>
            </div>

            {/* ISI SURAT PENGANTAR */}
            <div className="text-xs sm:text-sm text-stone-800 space-y-2.5 text-justify leading-relaxed">
              <p className="font-arabic text-center text-lg text-emerald-900 py-0.5">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <p className="font-arabic text-center text-sm text-stone-700">
                السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ
              </p>
              <p>
                Segala puji bagi Allah Subhanahu wa Ta'ala yang telah menjadikan matahari dan bulan sebagai perhitungan waktu bagi hamba-hamba-Nya. Shalawat dan salam semoga senantiasa tercurah kepada junjungan kita Nabi Muhammad Shallallahu 'Alaihi Wasallam, keluarga, sahabat, serta para pengikutnya hingga akhir zaman.
              </p>
              <p>
                Bersama ini Lembaga Hisab Falakiyah Almansuriyah Jakarta menyampaikan berkas resmi hasil hisab qath'i penentuan awal bulan <strong>{data.namaBulanHijriyah} {data.tahunHijriyah} H</strong>, yang dihitung dengan merujuk secara teliti pada kaidah matan dan tabel-tabel falak kitab induk <em>Sullam an-Nayyirain</em> karya maha guru falak Indonesia, Al-Allamah KH. Muhammad Manshur Jembatan Lima.
              </p>
              <p>
                Perhitungan dilakukan dengan markaz hisab acuan induk Jakarta/Betawi serta verifikasi markaz regional, meliputi perhitungan tabel <em>Al-Mustakhrajat</em>, 18 kotak koreksi berantai (<em>Ta'dilat</em>), penentuan waktu Ijtima' Hakiki, Irtifa' Hilal, Mukts al-Hilal, hingga status kenampakan hilal (<em>Imkanur Rukyat / Wujudul Hilal</em>).
              </p>
              <p>
                Demikian surat pengantar ini kami sampaikan agar dapat dipergunakan sebagai pedoman syar'i dan rujukan falakiyah yang sah. Atas perhatian serta kerjasamanya, kami haturkan terima kasih.
              </p>
              <p className="font-arabic text-center text-sm text-stone-700 pt-1">
                وَالسَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ
              </p>
            </div>

            {/* TANDA TANGAN RESMI PENGANTAR (PENEMPATAN TERBALIK: SEKRETARIS LEMBAGA DI KIRI, KETUA UMUM DI KANAN, STEMPEL ASLI UPLOAD) */}
            <div className="mt-6 pt-5 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 text-xs sm:text-sm">
              <div className="text-center w-full sm:w-56">
                <p className="font-bold text-xs sm:text-sm text-stone-900">Sekretaris Lembaga,</p>
                <p className="text-[11px] sm:text-xs text-stone-600 font-medium">Lembaga Hisab Falakiyah</p>
                <div className="h-14 sm:h-16 flex items-center justify-center">
                  {/* Area tanda tangan bersih tanpa teks bracket */}
                </div>
                <p className="font-bold underline text-xs sm:text-sm text-stone-900">H. xxxxxxxxxxxxx, S.Ag., M.H.</p>

              </div>

              {/* STEMPEL RESMI UPLOAD */}
              <div className="flex flex-col items-center justify-center my-2 sm:my-0">
                <img 
                  src="/stempel.png" 
                  alt="Stempel Resmi" 
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/STEMPEL.png'; }}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain rotate-[-8deg] opacity-90 drop-shadow-sm select-none pointer-events-none" 
                />
              </div>

              <div className="text-center w-full sm:w-56">
                <p className="font-bold text-xs sm:text-sm text-stone-900">Ketua Umum,</p>
                <p className="text-[11px] sm:text-xs text-stone-600 font-medium">Lembaga Hisab Falakiyah</p>
                <div className="h-14 sm:h-16 flex items-center justify-center">
                  {/* Area tanda tangan bersih tanpa teks bracket */}
                </div>
                <p className="font-bold underline text-xs sm:text-sm text-stone-900">KH. xxxxxxxxxxxxx, S.Ag., M.H.</p>
  
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 2. SURAT KEPUTUSAN PENETAPAN FALAKIYAH (LENGKAP DENGAN KOP SURAT) */}
        {/* ========================================================================= */}
        {(activeSection === 'semua' || activeSection === 'penetapan') && (
          <section
            ref={refPenetapan}
            className="bg-white text-stone-900 rounded-2xl p-4 sm:p-8 md:p-10 shadow-xl border-2 border-amber-600/30 print:border-none print:shadow-none print:p-0 print:my-0 print-page-break max-w-[210mm] mx-auto"
          >
            {/* KOP RESMI LEMBAGA DENGAN LOGO YANG DIUPLOAD */}
            <div className="border-b-4 border-double border-stone-900 pb-4 mb-4">
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <img 
                  src="/logo.png" 
                  alt="Logo Lembaga" 
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/LOGO.png'; }}
                  className="w-16 h-16 sm:w-22 sm:h-22 shrink-0 object-contain drop-shadow" 
                />
                <div className="text-center flex-1">
                  <h2 className="text-sm sm:text-lg md:text-xl font-black tracking-tight text-emerald-900 uppercase">
                    LEMBAGA HISAB FALAKIYAH ALMANSURIYAH
                  </h2>
                  <h3 className="text-[11px] sm:text-xs md:text-sm font-bold text-amber-800 tracking-wider uppercase mt-0.5">
                    PUSAT PENGEMBANGAN HISAB & RUKYAT METODE SULLAM AN-NAYYIRAIN
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-stone-600 mt-1 leading-tight">
                    Karya Al-Allamah Asy-Syaikh Muhammad Manshur bin Abdul Hamid bin Muhammad Damiri Al-Batawi
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-stone-500 mt-0.5">
                    Sekretariat: Jl. Jembatan Lima No. 12, Tambora, Jakarta Barat 11250 | Markaz Falak: 106° 45' 10" BT / 06° 49' 00" LS
                  </p>
                </div>
                {/* Spacer Penyeimbang Kanan (Ukuran Sama Logo Kiri) untuk Menjamin Teks 100% Center */}
                <div className="w-16 h-16 sm:w-22 sm:h-22 shrink-0 invisible pointer-events-none select-none" aria-hidden="true" />
              </div>
            </div>

            {/* JUDUL RESMI SURAT KEPUTUSAN */}
            <div className="text-center border-b pb-3 mb-4">
              <h2 className="text-sm sm:text-lg font-black uppercase tracking-tight text-emerald-950">
                SURAT KEPUTUSAN PENETAPAN FALAKIYAH
              </h2>
              <h3 className="text-xs sm:text-sm font-extrabold text-amber-900 uppercase mt-0.5">
                TENTANG AWAL BULAN {data.namaBulanHijriyah} {data.tahunHijriyah} HIJRIYAH
              </h3>
              <p className="text-[11px] font-bold text-stone-600 mt-0.5">
                Nomor: {data.nomorSuratKetetapan}
              </p>
            </div>

            <div className="text-xs sm:text-sm text-stone-800 space-y-3 leading-relaxed">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5">
                <div className="font-bold text-stone-900">MENIMBANG</div>
                <div className="sm:col-span-3 text-stone-700 space-y-1">
                  <p>a. Bahwa penetapan awal bulan Qamariyah menyangkut pelaksanaan ibadah kaum muslimin yang memerlukan kepastian syar'i dan landasan hisab yang mutamad;</p>
                  <p>b. Bahwa metode hisab <em>Sullam an-Nayyirain</em> telah menjadi rujukan turun-temurun para ulama Nusantara yang teruji akurasinya secara ilmiah dan amaliyah.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5">
                <div className="font-bold text-stone-900">MENGINGAT</div>
                <div className="sm:col-span-3 text-stone-700 space-y-1">
                  <p>1. Kaidah hisab falakiyah kitab <em>Sullam an-Nayyirain</em> bab Hisab Ijtima' dan Irtifa' al-Hilal;</p>
                  <p>2. Hasil hisab hisab qath'i yang dilakukan oleh Tim Ahli Falak Lembaga Hisab Falakiyah Almansuriyah Jakarta terhadap posisi hilal untuk awal bulan {data.namaBulanHijriyah} {data.tahunHijriyah} H.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5">
                <div className="font-bold text-stone-900">MEMPERHATIKAN</div>
                <div className="sm:col-span-3 text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <p className="font-bold text-emerald-900 mb-1">Hasil Perhitungan Falakiyah Markaz Betawi/Jakarta:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-stone-700">
                    <li>Hari & Tanggal Ijtima' Hakiki: <strong>{data.kesimpulan.ijtimaHari}</strong></li>
                    <li>Waktu Ijtima' (Konjungsi): <strong>{data.kesimpulan.ijtimaJamWIB}</strong></li>
                    <li>Tinggi Hilal saat Ghurub: <strong>{data.kesimpulan.tinggiHilal}</strong></li>
                    <li>Lama Hilal di Atas Ufuk: <strong>{data.kesimpulan.lamaHilalUfuk}</strong></li>
                    <li>Status Hilal: <strong>{data.kesimpulan.statusPenetapan}</strong></li>
                  </ul>
                </div>
              </div>

              {/* KEPUTUSAN */}
              <div className="pt-1 text-center">
                <span className="px-4 py-1 rounded-full bg-emerald-900 text-amber-300 font-black text-xs uppercase tracking-widest inline-block shadow">
                  MEMUTUSKAN & MENETAPKAN:
                </span>
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-600/50 p-3 sm:p-4 rounded-xl text-center space-y-1">
                <p className="text-[11px] uppercase font-bold text-emerald-900 tracking-wider">
                  1 {data.namaBulanHijriyah} {data.tahunHijriyah} HIJRIYAH
                </p>
                <div className="text-lg sm:text-2xl font-black text-emerald-950 tracking-tight">
                  {data.hariPasaranKetetapan}, {data.tanggalMasehiKetetapan}
                </div>
                <p className="text-[11px] text-emerald-800 font-semibold italic">
                  (Ditetapkan secara resmi dan mengikat berdasarkan kaidah hisab qath'i Sullam Al-Nayyirain)
                </p>
              </div>
            </div>

            {/* TTD PENETAPAN RESMI (PENEMPATAN TERBALIK: SEKRETARIS LEMBAGA DI KIRI, KETUA UMUM DI KANAN, STEMPEL RESMI UPLOAD) */}
            <div className="mt-6 pt-5 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 text-xs sm:text-sm">
              <div className="text-center w-full sm:w-56">
                <p className="font-bold text-xs sm:text-sm text-stone-900 mt-2">Sekretaris Lembaga,</p>
                <div className="h-14 sm:h-16 flex items-center justify-center">
                  {/* Area tanda tangan bersih tanpa teks bracket */}
                </div>
                <p className="font-bold underline text-xs sm:text-sm text-stone-900">H. xxxxxxxxxxxxx, S.Ag., M.H.</p>
                <p className="text-[10px] text-stone-500">Dewan Sidang Falak</p>
              </div>

              {/* STEMPEL RESMI UPLOAD */}
              <div className="flex flex-col items-center justify-center my-2 sm:my-0">
                <img 
                  src="/stempel.png" 
                  alt="Stempel Resmi Penetapan" 
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/STEMPEL.png'; }}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain rotate-[-8deg] opacity-90 drop-shadow-sm select-none pointer-events-none" 
                />
              </div>

              <div className="text-center w-full sm:w-56">
                <p className="text-stone-500 text-[10px]">Ditetapkan di: Jakarta</p>
                <div className="flex items-center justify-center gap-1 text-[10px] text-stone-500 mb-1">
                  <span>Pada tanggal: </span>
                  <input
                    type="text"
                    value={tanggalPenetapanMasehi}
                    onChange={(e) => setTanggalPenetapanMasehi(e.target.value)}
                    className="font-bold text-stone-800 border-b border-stone-300 focus:border-amber-600 outline-none text-center w-36 bg-transparent print:border-none print:w-auto"
                    title="Klik untuk ubah tanggal penetapan Masehi"
                  />
                </div>
                <p className="font-bold text-xs sm:text-sm text-stone-900 mt-2">Ketua Umum LHFA,</p>
                <div className="h-14 sm:h-16 flex items-center justify-center">
                  {/* Area tanda tangan bersih tanpa teks bracket */}
                </div>
                <p className="font-bold underline text-xs sm:text-sm text-stone-900">KH. xxxxxxxxxxxxx, S.Ag., M.H.</p>
                <p className="text-[10px] text-stone-500">Pimpinan Lembaga</p>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 3A. LEMBAR HISAB BAGIAN 1: KOTAK 1 S/D KOTAK 9 (LEMBAR A4 SENDIRI) */}
        {/* ========================================================================= */}
        {(activeSection === 'semua' || activeSection === 'lembar1') && (
          <section
            ref={refPerhitunganPart1}
            className="bg-white text-stone-900 rounded-2xl p-4 sm:p-8 shadow-xl border border-stone-300 space-y-5 print:border-none print:shadow-none print:p-0 print:my-0 print-page-break max-w-[210mm] mx-auto"
          >
            {/* JUDUL DOKUMEN BAGIAN 1 */}
            <div className="border-b pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
              <div>
                <span className="text-[9px] sm:text-[10px] text-amber-900 font-semibold tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mb-1">
                  Lampiran Berkas Resmi Falakiyah &bull; Lembar 1 dari 4
                </span>
                <h2 className="text-sm sm:text-xl font-black text-stone-900 uppercase">
                  Hisab Awal Bulan {data.namaBulanHijriyah} {data.tahunHijriyah} H 
                </h2>
                <p className="text-[11px] text-emerald-800 font-bold">
                  Metode: Sullam an-Nayyirain &bull; Markaz: {data.markazName}
                </p>
              </div>
            </div>

            {/* 1. TABEL AL-MUSTAKHRAJAT */}
            <div className="space-y-2">
              <h3 className="text-xs sm:text-sm font-black text-emerald-900 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>1. Tabel Al-Mustakhrajat (المستخرجات)</span>
              </h3>

              {/* TAMPILAN KHUSUS PONSEL (HP): 100% Responsif, Tanpa Geser Kanan */}
              <div className="md:hidden space-y-2.5 print:hidden">
                {[
                  { data: data.mustakhrajat.majmuah, title: "السنين المجموعة (Tahun Majmu'ah)", badge: "Majmu'ah", bg: 'bg-stone-50 border-stone-300' },
                  { data: data.mustakhrajat.mabsuthah, title: "السنين المبسوطة (Tahun Mabsuthah)", badge: "Mabsuthah", bg: 'bg-stone-50 border-stone-300' },
                  { data: data.mustakhrajat.syahr, title: "جدول الشهور (Bulan Arab)", badge: "Syahr", bg: 'bg-stone-50 border-stone-300' },
                  { data: data.mustakhrajat.jumlahHarakat, title: "مجموع الحركات (Jumlah Harakat / Total)", badge: "Total", bg: 'bg-amber-50 border-amber-400 font-bold' }
                ].map((row, idx) => (
                  <div key={idx} className={`p-2.5 rounded-xl border ${row.bg} text-xs space-y-1.5 shadow-sm`}>
                    <div className="flex items-center justify-between border-b border-stone-200/80 pb-1">
                      <span className="font-bold text-stone-900 text-[11px]">{row.title}</span>
                      <span className="font-arabic text-xs text-stone-700 font-bold" dir="rtl">{row.data.labelArab}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {/* Alamah */}
                      <div className="bg-white/90 p-1.5 rounded-lg border border-amber-200/70">
                        <span className="text-[10px] text-amber-900 font-bold block">العلامة (Alamah):</span>
                        <span className="font-mono text-stone-900 font-semibold">{row.data.alamahM}m {row.data.alamahH}j {row.data.alamahMnt}m</span>
                      </div>
                      {/* Hishshah */}
                      <div className="bg-white/90 p-1.5 rounded-lg border border-emerald-200/70">
                        <span className="text-[10px] text-emerald-900 font-bold block">الحصة (Hishshah):</span>
                        <span className="font-mono text-stone-900 font-semibold">{row.data.hishshahJ}j {row.data.hishshahJa}° {row.data.hishshahQa}'</span>
                      </div>
                      {/* Khashshah */}
                      <div className="bg-white/90 p-1.5 rounded-lg border border-blue-200/70">
                        <span className="text-[10px] text-blue-900 font-bold block">الخاصة (Khashshah):</span>
                        <span className="font-mono text-stone-900 font-semibold">{row.data.khashshahJ}j {row.data.khashshahJa}° {row.data.khashshahQa}'</span>
                      </div>
                      {/* Markaz */}
                      <div className="bg-white/90 p-1.5 rounded-lg border border-purple-200/70">
                        <span className="text-[10px] text-purple-900 font-bold block">المركز (Markaz):</span>
                        <span className="font-mono text-stone-900 font-semibold">{row.data.markazJ}j {row.data.markazJa}° {row.data.markazQa}'</span>
                      </div>
                      {/* Awj */}
                      <div className="bg-white/90 p-1.5 rounded-lg border border-rose-200/70 col-span-2">
                        <span className="text-[10px] text-rose-900 font-bold block">الأوج (Awj):</span>
                        <span className="font-mono text-stone-900 font-semibold">{row.data.awjJ}j {row.data.awjJa}° {row.data.awjQa}'</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* TAMPILAN TABEL STANDAR DESKTOP & CETAK A4 */}
              <div className="hidden md:block print:block overflow-x-auto -mx-1 px-1 rounded-xl border border-stone-800 bg-white">
                <table className="w-full text-center text-xs border-collapse min-w-[580px]">
                  <thead>
                    <tr className="bg-stone-100 border-b border-stone-800 font-bold text-stone-900">
                      <th rowSpan={2} className="border-r border-stone-800 p-1.5 text-right font-sans">المستخرجات / Baris</th>
                      <th colSpan={3} className="border-r border-stone-800 p-1 bg-amber-50">العلامة</th>
                      <th colSpan={3} className="border-r border-stone-800 p-1 bg-emerald-50">الحصة</th>
                      <th colSpan={3} className="border-r border-stone-800 p-1 bg-blue-50">الخاصة</th>
                      <th colSpan={3} className="border-r border-stone-800 p-1 bg-purple-50">المركز</th>
                      <th colSpan={3} className="p-1 bg-rose-50">الأوج</th>
                    </tr>
                    <tr className="bg-stone-50 border-b border-stone-800 text-[10px] font-semibold text-stone-700">
                      <th className="border-r border-stone-400 p-1 w-7">م</th>
                      <th className="border-r border-stone-400 p-1 w-7">عة</th>
                      <th className="border-r border-stone-800 p-1 w-7">قة</th>
                      <th className="border-r border-stone-400 p-1 w-7">ج</th>
                      <th className="border-r border-stone-400 p-1 w-7">جة</th>
                      <th className="border-r border-stone-800 p-1 w-7">قة</th>
                      <th className="border-r border-stone-400 p-1 w-7">ج</th>
                      <th className="border-r border-stone-400 p-1 w-7">جة</th>
                      <th className="border-r border-stone-800 p-1 w-7">قة</th>
                      <th className="border-r border-stone-400 p-1 w-7">ج</th>
                      <th className="border-r border-stone-400 p-1 w-7">جة</th>
                      <th className="border-r border-stone-800 p-1 w-7">قة</th>
                      <th className="border-r border-stone-400 p-1 w-7">ج</th>
                      <th className="border-r border-stone-400 p-1 w-7">جة</th>
                      <th className="p-1 w-7">قة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-300 font-mono text-[11px]">
                    <tr className="hover:bg-stone-50">
                      <td className="p-1 border-r border-stone-800 font-bold text-right font-sans text-stone-800">{data.mustakhrajat.majmuah.labelArab}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.majmuah.alamahM}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.majmuah.alamahH}</td>
                      <td className="border-r border-stone-800 p-0.5">{data.mustakhrajat.majmuah.alamahMnt}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.majmuah.hishshahJ}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.majmuah.hishshahJa}</td>
                      <td className="border-r border-stone-800 p-0.5">{data.mustakhrajat.majmuah.hishshahQa}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.majmuah.khashshahJ}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.majmuah.khashshahJa}</td>
                      <td className="border-r border-stone-800 p-0.5">{data.mustakhrajat.majmuah.khashshahQa}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.majmuah.markazJ}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.majmuah.markazJa}</td>
                      <td className="border-r border-stone-800 p-0.5">{data.mustakhrajat.majmuah.markazQa}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.majmuah.awjJ}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.majmuah.awjJa}</td>
                      <td className="p-0.5">{data.mustakhrajat.majmuah.awjQa}</td>
                    </tr>
                    <tr className="hover:bg-stone-50">
                      <td className="p-1 border-r border-stone-800 font-bold text-right font-sans text-stone-800">{data.mustakhrajat.mabsuthah.labelArab}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.mabsuthah.alamahM}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.mabsuthah.alamahH}</td>
                      <td className="border-r border-stone-800 p-0.5">{data.mustakhrajat.mabsuthah.alamahMnt}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.mabsuthah.hishshahJ}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.mabsuthah.hishshahJa}</td>
                      <td className="border-r border-stone-800 p-0.5">{data.mustakhrajat.mabsuthah.hishshahQa}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.mabsuthah.khashshahJ}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.mabsuthah.khashshahJa}</td>
                      <td className="border-r border-stone-800 p-0.5">{data.mustakhrajat.mabsuthah.khashshahQa}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.mabsuthah.markazJ}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.mabsuthah.markazJa}</td>
                      <td className="border-r border-stone-800 p-0.5">{data.mustakhrajat.mabsuthah.markazQa}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.mabsuthah.awjJ}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.mabsuthah.awjJa}</td>
                      <td className="p-0.5">{data.mustakhrajat.mabsuthah.awjQa}</td>
                    </tr>
                    <tr className="hover:bg-stone-50">
                      <td className="p-1 border-r border-stone-800 font-bold text-right font-sans text-stone-800">{data.mustakhrajat.syahr.labelArab}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.syahr.alamahM}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.syahr.alamahH}</td>
                      <td className="border-r border-stone-800 p-0.5">{data.mustakhrajat.syahr.alamahMnt}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.syahr.hishshahJ}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.syahr.hishshahJa}</td>
                      <td className="border-r border-stone-800 p-0.5">{data.mustakhrajat.syahr.hishshahQa}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.syahr.khashshahJ}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.syahr.khashshahJa}</td>
                      <td className="border-r border-stone-800 p-0.5">{data.mustakhrajat.syahr.khashshahQa}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.syahr.markazJ}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.syahr.markazJa}</td>
                      <td className="border-r border-stone-800 p-0.5">{data.mustakhrajat.syahr.markazQa}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.syahr.awjJ}</td>
                      <td className="border-r border-stone-400 p-0.5">{data.mustakhrajat.syahr.awjJa}</td>
                      <td className="p-0.5">{data.mustakhrajat.syahr.awjQa}</td>
                    </tr>
                    <tr className="bg-amber-50/70 font-bold border-t-2 border-stone-800">
                      <td className="p-1 border-r border-stone-800 text-right font-sans text-amber-950">{data.mustakhrajat.jumlahHarakat.labelArab}</td>
                      <td className="border-r border-stone-400 p-0.5 text-amber-950">{data.mustakhrajat.jumlahHarakat.alamahM}</td>
                      <td className="border-r border-stone-400 p-0.5 text-amber-950">{data.mustakhrajat.jumlahHarakat.alamahH}</td>
                      <td className="border-r border-stone-800 p-0.5 text-amber-950">{data.mustakhrajat.jumlahHarakat.alamahMnt}</td>
                      <td className="border-r border-stone-400 p-0.5 text-emerald-950">{data.mustakhrajat.jumlahHarakat.hishshahJ}</td>
                      <td className="border-r border-stone-400 p-0.5 text-emerald-950">{data.mustakhrajat.jumlahHarakat.hishshahJa}</td>
                      <td className="border-r border-stone-800 p-0.5 text-emerald-950">{data.mustakhrajat.jumlahHarakat.hishshahQa}</td>
                      <td className="border-r border-stone-400 p-0.5 text-blue-950">{data.mustakhrajat.jumlahHarakat.khashshahJ}</td>
                      <td className="border-r border-stone-400 p-0.5 text-blue-950">{data.mustakhrajat.jumlahHarakat.khashshahJa}</td>
                      <td className="border-r border-stone-800 p-0.5 text-blue-950">{data.mustakhrajat.jumlahHarakat.khashshahQa}</td>
                      <td className="border-r border-stone-400 p-0.5 text-purple-950">{data.mustakhrajat.jumlahHarakat.markazJ}</td>
                      <td className="border-r border-stone-400 p-0.5 text-purple-950">{data.mustakhrajat.jumlahHarakat.markazJa}</td>
                      <td className="border-r border-stone-800 p-0.5 text-purple-950">{data.mustakhrajat.jumlahHarakat.markazQa}</td>
                      <td className="border-r border-stone-400 p-0.5 text-rose-950">{data.mustakhrajat.jumlahHarakat.awjJ}</td>
                      <td className="border-r border-stone-400 p-0.5 text-rose-950">{data.mustakhrajat.jumlahHarakat.awjJa}</td>
                      <td className="p-0.5 text-rose-950">{data.mustakhrajat.jumlahHarakat.awjQa}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* KOTAK 1 S/D 9 */}
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-black text-stone-900 uppercase">
                Perhitungan Tahap 1 sampai 9 (Koreksi Sudut & Kecepatan)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* KOTAK 1: Ta'dil Khashshah */}
                <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-stone-900 px-3 py-2 flex items-center justify-between border-b border-stone-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">1</span>
                      <span className="font-bold text-xs text-stone-100">Ta'dil al-Khashshah</span>
                    </div>
                    <span className="font-arabic font-bold text-sm text-amber-300" dir="rtl">تعديل الخاصة ﴿١﴾</span>
                  </div>
                  <div className="p-2.5 space-y-1.5 text-stone-800">
                    <div className="overflow-x-auto rounded-lg border border-stone-200">
                      <table className="w-full text-[11px] font-mono text-center">
                        <thead className="bg-stone-100 text-stone-700 font-sans text-[10px]">
                          <tr>
                            <th className="p-1 text-left">Tahap / Satr</th>
                            <th className="p-1">Buruj</th>
                            <th className="p-1">Derajat</th>
                            <th className="p-1">Menit</th>
                            <th className="p-1">Detik</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          <tr>
                            <td className="p-1 text-left font-sans font-semibold">الأصل (Asli)</td>
                            <td className="p-1 font-bold">{data.kotak1_tadilKhashshah.asli.j}</td>
                            <td className="p-1 font-bold">{data.kotak1_tadilKhashshah.asli.ja}°</td>
                            <td className="p-1 font-bold">{data.kotak1_tadilKhashshah.asli.qa}'</td>
                            <td className="p-1 text-stone-400">-</td>
                          </tr>
                          <tr className="bg-stone-50">
                            <td className="p-1 text-left font-sans font-semibold">المدخول (Madkhul)</td>
                            <td className="p-1">{data.kotak1_tadilKhashshah.madkhul.j}</td>
                            <td className="p-1">{data.kotak1_tadilKhashshah.madkhul.ja}°</td>
                            <td className="p-1 text-stone-500">Kasr: {data.kotak1_tadilKhashshah.kasr}'</td>
                            <td className="p-1 text-stone-400">-</td>
                          </tr>
                          <tr>
                            <td className="p-1 text-left font-sans font-semibold">السطر الأول (Satr 1)</td>
                            <td className="p-1 text-stone-400">-</td>
                            <td className="p-1">{data.kotak1_tadilKhashshah.satr1.ja}°</td>
                            <td className="p-1">{data.kotak1_tadilKhashshah.satr1.qa}'</td>
                            <td className="p-1 text-stone-400">-</td>
                          </tr>
                          <tr className="bg-stone-50">
                            <td className="p-1 text-left font-sans font-semibold">السطر الثاني (Satr 2)</td>
                            <td className="p-1 text-stone-400">-</td>
                            <td className="p-1">{data.kotak1_tadilKhashshah.satr2.ja}°</td>
                            <td className="p-1">{data.kotak1_tadilKhashshah.satr2.qa}'</td>
                            <td className="p-1 text-stone-500">Fadhl: {data.kotak1_tadilKhashshah.fadhl}'</td>
                          </tr>
                          <tr>
                            <td className="p-1 text-left font-sans font-semibold">حاصل الضرب (Dharb)</td>
                            <td className="p-1 text-stone-400">-</td>
                            <td className="p-1 text-stone-400">-</td>
                            <td className="p-1">{data.kotak1_tadilKhashshah.hasilDharb.qa}'</td>
                            <td className="p-1">{data.kotak1_tadilKhashshah.hasilDharb.ny}"</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-amber-50 p-1.5 rounded-lg border border-amber-300 flex justify-between items-center text-amber-950 font-bold">
                      <span className="font-sans text-[11px]">Hasil Akhir (الحاصل الأخير):</span>
                      <span className="font-mono text-xs">{data.kotak1_tadilKhashshah.hasilAkhir.ja}° {data.kotak1_tadilKhashshah.hasilAkhir.qa}' {data.kotak1_tadilKhashshah.hasilAkhir.ny ?? 0}"</span>
                    </div>
                  </div>
                </div>

                {/* KOTAK 2: Ta'dil Markaz */}
                <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-stone-900 px-3 py-2 flex items-center justify-between border-b border-stone-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">2</span>
                      <span className="font-bold text-xs text-stone-100">Ta'dil al-Markaz</span>
                    </div>
                    <span className="font-arabic font-bold text-sm text-amber-300" dir="rtl">تعديل المركز ﴿٢﴾</span>
                  </div>
                  <div className="p-2.5 space-y-1.5 text-stone-800">
                    <div className="overflow-x-auto rounded-lg border border-stone-200">
                      <table className="w-full text-[11px] font-mono text-center">
                        <thead className="bg-stone-100 text-stone-700 font-sans text-[10px]">
                          <tr>
                            <th className="p-1 text-left">Tahap / Satr</th>
                            <th className="p-1">Buruj</th>
                            <th className="p-1">Derajat</th>
                            <th className="p-1">Menit</th>
                            <th className="p-1">Detik</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          <tr>
                            <td className="p-1 text-left font-sans font-semibold">الأصل (Asli)</td>
                            <td className="p-1 font-bold">{data.kotak2_tadilMarkaz.asli.j}</td>
                            <td className="p-1 font-bold">{data.kotak2_tadilMarkaz.asli.ja}°</td>
                            <td className="p-1 font-bold">{data.kotak2_tadilMarkaz.asli.qa}'</td>
                            <td className="p-1 text-stone-400">-</td>
                          </tr>
                          <tr className="bg-stone-50">
                            <td className="p-1 text-left font-sans font-semibold">المدخول (Madkhul)</td>
                            <td className="p-1">{data.kotak2_tadilMarkaz.madkhul.j}</td>
                            <td className="p-1">{data.kotak2_tadilMarkaz.madkhul.ja}°</td>
                            <td className="p-1 text-stone-500">Kasr: {data.kotak2_tadilMarkaz.kasr}'</td>
                            <td className="p-1 text-stone-400">-</td>
                          </tr>
                          <tr>
                            <td className="p-1 text-left font-sans font-semibold">السطر الأول (Satr 1)</td>
                            <td className="p-1 text-stone-400">-</td>
                            <td className="p-1">{data.kotak2_tadilMarkaz.satr1.ja}°</td>
                            <td className="p-1">{data.kotak2_tadilMarkaz.satr1.qa}'</td>
                            <td className="p-1 text-stone-400">-</td>
                          </tr>
                          <tr className="bg-stone-50">
                            <td className="p-1 text-left font-sans font-semibold">السطر الثاني (Satr 2)</td>
                            <td className="p-1 text-stone-400">-</td>
                            <td className="p-1">{data.kotak2_tadilMarkaz.satr2.ja}°</td>
                            <td className="p-1">{data.kotak2_tadilMarkaz.satr2.qa}'</td>
                            <td className="p-1 text-stone-500">Fadhl: {data.kotak2_tadilMarkaz.fadhl}'</td>
                          </tr>
                          <tr>
                            <td className="p-1 text-left font-sans font-semibold">حاصل الضرب (Dharb)</td>
                            <td className="p-1 text-stone-400">-</td>
                            <td className="p-1 text-stone-400">-</td>
                            <td className="p-1">{data.kotak2_tadilMarkaz.hasilDharb.qa}'</td>
                            <td className="p-1">{data.kotak2_tadilMarkaz.hasilDharb.ny}"</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-amber-50 p-1.5 rounded-lg border border-amber-300 flex justify-between items-center text-amber-950 font-bold">
                      <span className="font-sans text-[11px]">Hasil Akhir (الحاصل الأخير):</span>
                      <span className="font-mono text-xs">{data.kotak2_tadilMarkaz.hasilAkhir.ja}° {data.kotak2_tadilMarkaz.hasilAkhir.qa}' {data.kotak2_tadilMarkaz.hasilAkhir.ny ?? 0}"</span>
                    </div>
                  </div>
                </div>

                {/* KOTAK 3: Bu'd Nayyirain Ghayr */}
                <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-stone-900 px-3 py-2 flex items-center justify-between border-b border-stone-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">3</span>
                      <span className="font-bold text-xs text-stone-100">Bu'd Nayyirain Ghayr</span>
                    </div>
                    <span className="font-arabic font-bold text-sm text-amber-300" dir="rtl">البُعد بين النيرين غير المعدل ﴿٣﴾</span>
                  </div>
                  <div className="p-2.5 space-y-1.5 font-mono text-[11px]">
                    <div className="bg-stone-50 p-2 rounded-lg border border-stone-200 space-y-1">
                      <div className="flex justify-between"><span>تعديل الخاصة (Kotak 1)</span><span>{data.kotak3_budNayyirainGhayr.tadilKhashshah.ja}° {data.kotak3_budNayyirainGhayr.tadilKhashshah.qa}' {data.kotak3_budNayyirainGhayr.tadilKhashshah.ny}"</span></div>
                      <div className="flex justify-between"><span>تعديل المركز (Kotak 2) [+]</span><span>{data.kotak3_budNayyirainGhayr.tadilMarkaz.ja}° {data.kotak3_budNayyirainGhayr.tadilMarkaz.qa}' {data.kotak3_budNayyirainGhayr.tadilMarkaz.ny}"</span></div>
                    </div>
                    <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-300 flex justify-between items-center text-emerald-950 font-bold">
                      <span className="font-sans">Hasil (البُعد غير المعدل):</span>
                      <span>{data.kotak3_budNayyirainGhayr.hasil.ja}° {data.kotak3_budNayyirainGhayr.hasil.qa}' {data.kotak3_budNayyirainGhayr.hasil.ny}"</span>
                    </div>
                  </div>
                </div>

                {/* KOTAK 4: Ta'dil Syams */}
                <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-stone-900 px-3 py-2 flex items-center justify-between border-b border-stone-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">4</span>
                      <span className="font-bold text-xs text-stone-100">Ta'dil asy-Syams</span>
                    </div>
                    <span className="font-arabic font-bold text-sm text-amber-300" dir="rtl">تعديل الشمس ﴿٤﴾</span>
                  </div>
                  <div className="p-2.5 space-y-1.5 font-mono text-[11px]">
                    <div className="bg-stone-50 p-2 rounded-lg border border-stone-200 space-y-1">
                      <div className="flex justify-between"><span>Bu'd Nayyirain × 5</span><span>{data.kotak4_tadilSyams.hasilDharb.ja}° {data.kotak4_tadilSyams.hasilDharb.qa}' {data.kotak4_tadilSyams.hasilDharb.ny}"</span></div>
                      <div className="flex justify-between"><span>Ta'dil Markaz [+]</span><span>{data.kotak4_tadilSyams.tadilMarkaz.ja}° {data.kotak4_tadilSyams.tadilMarkaz.qa}' {data.kotak4_tadilSyams.tadilMarkaz.ny}"</span></div>
                    </div>
                    <div className="bg-amber-50 p-1.5 rounded-lg border border-amber-300 flex justify-between items-center text-amber-950 font-bold">
                      <span className="font-sans">Hasil (تعديل الشمس):</span>
                      <span>{data.kotak4_tadilSyams.hasil.ja}° {data.kotak4_tadilSyams.hasil.qa}' {data.kotak4_tadilSyams.hasil.ny}"</span>
                    </div>
                  </div>
                </div>

                {/* KOTAK 5: Wasath Syams */}
                <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-stone-900 px-3 py-2 flex items-center justify-between border-b border-stone-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">5</span>
                      <span className="font-bold text-xs text-stone-100">Wasath asy-Syams</span>
                    </div>
                    <span className="font-arabic font-bold text-sm text-amber-300" dir="rtl">وسط الشمس ﴿٥﴾</span>
                  </div>
                  <div className="p-2.5 space-y-1.5 font-mono text-[11px]">
                    <div className="bg-stone-50 p-2 rounded-lg border border-stone-200 space-y-1">
                      <div className="flex justify-between"><span>الأوج (Al-Awj)</span><span>{data.kotak5_wasathSyams.awj.j}s {data.kotak5_wasathSyams.awj.ja}° {data.kotak5_wasathSyams.awj.qa}'</span></div>
                      <div className="flex justify-between"><span>المركز (Al-Markaz) [+]</span><span>{data.kotak5_wasathSyams.markaz.j}s {data.kotak5_wasathSyams.markaz.ja}° {data.kotak5_wasathSyams.markaz.qa}'</span></div>
                    </div>
                    <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-300 flex justify-between items-center text-emerald-950 font-bold">
                      <span className="font-sans">Hasil (وسط الشمس):</span>
                      <span>{data.kotak5_wasathSyams.hasil.j}s {data.kotak5_wasathSyams.hasil.ja}° {data.kotak5_wasathSyams.hasil.qa}'</span>
                    </div>
                  </div>
                </div>

                {/* KOTAK 6: Muqawwam Syams */}
                <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-stone-900 px-3 py-2 flex items-center justify-between border-b border-stone-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">6</span>
                      <span className="font-bold text-xs text-stone-100">Muqawwam asy-Syams</span>
                    </div>
                    <span className="font-arabic font-bold text-sm text-amber-300" dir="rtl">مقوم الشمس ﴿٦﴾</span>
                  </div>
                  <div className="p-2.5 space-y-1.5 font-mono text-[11px]">
                    <div className="bg-stone-50 p-2 rounded-lg border border-stone-200 space-y-1">
                      <div className="flex justify-between"><span>وسط الشمس</span><span>{data.kotak6_muqawwamSyams.wasathSyams.j}s {data.kotak6_muqawwamSyams.wasathSyams.ja}° {data.kotak6_muqawwamSyams.wasathSyams.qa}'</span></div>
                      <div className="flex justify-between"><span>تعديل الشمس [-]</span><span>{data.kotak6_muqawwamSyams.tadilSyams.ja}° {data.kotak6_muqawwamSyams.tadilSyams.qa}' {data.kotak6_muqawwamSyams.tadilSyams.ny}"</span></div>
                    </div>
                    <div className="bg-amber-50 p-1.5 rounded-lg border border-amber-300 flex justify-between items-center text-amber-950 font-bold">
                      <span className="font-sans">Hasil (مقوم الشمس):</span>
                      <span>{data.kotak6_muqawwamSyams.hasil.j}s {data.kotak6_muqawwamSyams.hasil.ja}° {data.kotak6_muqawwamSyams.hasil.qa}' {data.kotak6_muqawwamSyams.hasil.ny}"</span>
                    </div>
                  </div>
                </div>

                {/* KOTAK 7: Ta'dil Ayyam */}
                <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-stone-900 px-3 py-2 flex items-center justify-between border-b border-stone-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">7</span>
                      <span className="font-bold text-xs text-stone-100">Ta'dil al-Ayyam</span>
                    </div>
                    <span className="font-arabic font-bold text-sm text-amber-300" dir="rtl">تعديل الأيام ﴿٧﴾</span>
                  </div>
                  <div className="p-2.5 space-y-1.5 font-mono text-[11px]">
                    <div className="bg-stone-50 p-2 rounded-lg border border-stone-200 flex justify-between">
                      <span>Satr 1: {data.kotak7_tadilAyyam.satr1}'</span>
                      <span>Satr 2: {data.kotak7_tadilAyyam.satr2}'</span>
                    </div>
                    <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-300 flex justify-between items-center text-emerald-950 font-bold">
                      <span className="font-sans">Hasil (تعديل الأيام):</span>
                      <span>{data.kotak7_tadilAyyam.hasil.ja}° {data.kotak7_tadilAyyam.hasil.qa}'</span>
                    </div>
                  </div>
                </div>

                {/* KOTAK 8: Bu'd Nayyirain Mu'addal */}
                <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-stone-900 px-3 py-2 flex items-center justify-between border-b border-stone-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">8</span>
                      <span className="font-bold text-xs text-stone-100">Bu'd Nayyirain Mu'addal</span>
                    </div>
                    <span className="font-arabic font-bold text-sm text-amber-300" dir="rtl">البُعد بين النيرين المعدل ﴿٨﴾</span>
                  </div>
                  <div className="p-2.5 space-y-1.5 font-mono text-[11px]">
                    <div className="bg-stone-50 p-2 rounded-lg border border-stone-200 space-y-1">
                      <div className="flex justify-between"><span>البعد غير المعدل</span><span>{data.kotak8_budNayyirainMuaddal.budGhayr.ja}° {data.kotak8_budNayyirainMuaddal.budGhayr.qa}' {data.kotak8_budNayyirainMuaddal.budGhayr.ny}"</span></div>
                      <div className="flex justify-between"><span>تعديل الأيام [-]</span><span>{data.kotak8_budNayyirainMuaddal.tadilAyyam.ja}° {data.kotak8_budNayyirainMuaddal.tadilAyyam.qa}'</span></div>
                    </div>
                    <div className="bg-amber-50 p-1.5 rounded-lg border border-amber-300 flex justify-between items-center text-amber-950 font-bold">
                      <span className="font-sans">Hasil (البعد المعدل):</span>
                      <span>{data.kotak8_budNayyirainMuaddal.hasil.ja}° {data.kotak8_budNayyirainMuaddal.hasil.qa}' {data.kotak8_budNayyirainMuaddal.hasil.ny}"</span>
                    </div>
                  </div>
                </div>

                {/* KOTAK 9: Hishshah Sa'ah */}
                <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-sm md:col-span-2">
                  <div className="bg-stone-900 px-3 py-2 flex items-center justify-between border-b border-stone-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">9</span>
                      <span className="font-bold text-xs text-stone-100">Hishshah as-Sa'ah (Kecepatan Bulan Per Jam)</span>
                    </div>
                    <span className="font-arabic font-bold text-sm text-amber-300" dir="rtl">حصة الساعة ﴿٩﴾</span>
                  </div>
                  <div className="p-2.5 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono text-[11px]">
                    <span className="text-stone-600 font-sans">Gerak relatif dari Khashshah (Satr 1: {data.kotak9_hishshahSaah.satr1.ja}° {data.kotak9_hishshahSaah.satr1.qa}')</span>
                    <div className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-950 font-bold">
                      Hasil: {data.kotak9_hishshahSaah.hasil.ja}° {data.kotak9_hishshahSaah.hasil.qa}'
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 3B. LEMBAR HISAB BAGIAN 2: KOTAK 10 S/D 18 & PENETAPAN (LEMBAR A4 SENDIRI) */}
        {/* ========================================================================= */}
        {(activeSection === 'semua' || activeSection === 'lembar2') && (
          <section
            ref={refPerhitunganPart2}
            className="bg-white text-stone-900 rounded-2xl p-4 sm:p-8 shadow-xl border border-stone-300 space-y-5 print:border-none print:shadow-none print:p-0 print:my-0 print-page-break max-w-[210mm] mx-auto"
          >
            {/* JUDUL DOKUMEN BAGIAN 2 */}
            <div className="border-b pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
              <div>
                <span className="text-[9px] sm:text-[10px] text-amber-900 font-semibold tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mb-1">
                  Lampiran Berkas Resmi Falakiyah &bull; Lembar 2 dari 4
                </span>
                <h2 className="text-sm sm:text-xl font-black text-stone-900 uppercase">
                  Hisab Awal Bulan {data.namaBulanHijriyah} {data.tahunHijriyah} H
                </h2>
                <p className="text-[11px] text-emerald-800 font-bold">
                  Penentuan Ijtima', Irtifa' Hilal & Rekonsiliasi Ephemeris
                </p>
              </div>
            </div>

            {/* KOTAK 10 S/D 18 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* KOTAK 10: Ta'dil Alamah */}
              <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-stone-900 px-3 py-2 flex items-center justify-between border-b border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">10</span>
                    <span className="font-bold text-xs text-stone-100">Ta'dil al-'Alamah</span>
                  </div>
                  <span className="font-arabic font-bold text-sm text-amber-300" dir="rtl">تعديل العلامة ﴿١٠﴾</span>
                </div>
                <div className="p-2.5 space-y-1.5 text-stone-800 font-mono text-[11px]">
                  <p className="text-[10px] text-stone-500 font-sans">Durasi Ijtima' = Bu'd Mu'addal × Hishshah Sa'ah:</p>
                  <div className="bg-amber-50 p-2 rounded-lg border border-amber-300 flex justify-between items-center text-amber-950 font-bold">
                    <span className="font-sans">Hasil (تعديل العلامة):</span>
                    <span>{data.kotak10_tadilAlamah.hasil.h}j {data.kotak10_tadilAlamah.hasil.m}m {data.kotak10_tadilAlamah.hasil.s}d</span>
                  </div>
                </div>
              </div>

              {/* KOTAK 11: Ijtima' Jakarta */}
              <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-stone-900 px-3 py-2 flex items-center justify-between border-b border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">11</span>
                    <span className="font-bold text-xs text-stone-100">Ijtima' li Jakarta (Betawi)</span>
                  </div>
                  <span className="font-arabic font-bold text-sm text-amber-300" dir="rtl">الإجتماع لجاكرتا ﴿١١﴾</span>
                </div>
                <div className="p-2.5 space-y-1.5 text-stone-800 font-mono text-[11px]">
                  <p className="text-[10px] text-stone-500 font-sans">Waktu Ijtima' Acuan Betawi ('Alamah Ghayr + Ta'dil):</p>
                  <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-300 flex justify-between items-center text-emerald-950 font-bold">
                    <span className="font-sans">Hasil:</span>
                    <span>Hari {data.kotak11_alamahJakarta.hasil.m}, {data.kotak11_alamahJakarta.hasil.h}:{String(data.kotak11_alamahJakarta.hasil.mnt).padStart(2, '0')}:{String(data.kotak11_alamahJakarta.hasil.s).padStart(2, '0')}</span>
                  </div>
                </div>
              </div>

              {/* KOTAK 12: Fadhl Thulain */}
              <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-stone-900 px-3 py-2 flex items-center justify-between border-b border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">12</span>
                    <span className="font-bold text-xs text-stone-100">Fadhl ath-Thulain</span>
                  </div>
                  <span className="font-arabic font-bold text-sm text-amber-300" dir="rtl">فضل الطولين ﴿١٢﴾</span>
                </div>
                <div className="p-2.5 space-y-1.5 text-stone-800 font-mono text-[11px]">
                  <p className="text-[10px] text-stone-500 font-sans">Selisih Bujur Markaz Terhadap Jakarta ({data.kotak12_fadhlThulain.selisih} × 4m):</p>
                  <div className="bg-amber-50 p-2 rounded-lg border border-amber-300 flex justify-between items-center text-amber-950 font-bold">
                    <span className="font-sans">Hasil Koreksi:</span>
                    <span>{data.kotak12_fadhlThulain.hasil.h}j {data.kotak12_fadhlThulain.hasil.m}m {data.kotak12_fadhlThulain.hasil.s}d</span>
                  </div>
                </div>
              </div>

              {/* KOTAK 13: Ijtima' Balad */}
              <div className="border-2 border-emerald-600 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-emerald-900 px-3 py-2 flex items-center justify-between border-b border-emerald-800 text-white">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">13</span>
                    <span className="font-bold text-xs">Al-Ijtima' lil-Balad</span>
                  </div>
                  <span className="font-arabic font-bold text-sm text-amber-300" dir="rtl">الإجتماع للبلد ﴿١٣﴾</span>
                </div>
                <div className="p-2.5 space-y-1 font-mono text-[11px]">
                  <p className="text-[10px] text-stone-500 font-sans">Waktu Ijtima' Hakiki Markaz Lokal (Ijtima' Jakarta + Fadhl Thulain):</p>
                  <div className="bg-emerald-100/80 p-2 rounded-lg border border-emerald-400 text-center font-black">
                    <span className="font-sans text-xs text-stone-700 block">{data.kotak13_alamahBalad.hariIjtimaText}</span>
                    <span className="text-sm sm:text-base text-emerald-950">{data.kotak13_alamahBalad.jamIjtimaText}</span>
                  </div>
                </div>
              </div>

              {/* KOTAK 14: Irtifa' Hilal */}
              <div className="border-2 border-amber-600 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-amber-900 px-3 py-2 flex items-center justify-between border-b border-amber-800 text-white">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-white text-amber-950 font-black text-xs flex items-center justify-center shrink-0">14</span>
                    <span className="font-bold text-xs">Irtifa' al-Hilal al-Mar'i</span>
                  </div>
                  <span className="font-arabic font-bold text-sm text-amber-200" dir="rtl">إرتفاع الهلال المرئي ﴿١٤﴾</span>
                </div>
                <div className="p-2.5 space-y-1 font-mono text-[11px]">
                  <p className="text-[10px] text-stone-500 font-sans">Tinggi Hilal Hakiki saat Terbenam Matahari:</p>
                  <div className="bg-amber-100/80 p-2 rounded-lg border border-amber-400 text-center font-black">
                    <span className="text-sm sm:text-base text-amber-950">
                      {data.kotak14_irtifaHilal.hasil.ja}° {data.kotak14_irtifaHilal.hasil.qa}' {data.kotak14_irtifaHilal.hasil.ny}"
                    </span>
                  </div>
                </div>
              </div>

              {/* KOTAK 15: Mukts Hilal */}
              <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-stone-900 px-3 py-2 flex items-center justify-between border-b border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">15</span>
                    <span className="font-bold text-xs text-stone-100">Mukts al-Hilal</span>
                  </div>
                  <span className="font-arabic font-bold text-sm text-amber-300" dir="rtl">مكث الهلال ﴿١٥﴾</span>
                </div>
                <div className="p-2.5 space-y-1 text-stone-800 font-mono text-[11px]">
                  <p className="text-[10px] text-stone-500 font-sans">Lama Hilal di Atas Ufuk Barat Sebelum Ghurub (Irtifa' × 4m):</p>
                  <div className="bg-blue-50 p-2 rounded-lg border border-blue-300 flex justify-between items-center text-blue-950 font-bold">
                    <span className="font-sans">Durasi:</span>
                    <span>{data.kotak15_muktsHilal.hasil.h}j {data.kotak15_muktsHilal.hasil.m}m {data.kotak15_muktsHilal.hasil.s}d</span>
                  </div>
                </div>
              </div>

              {/* KOTAK 16: 'Ardh al-Qamar */}
              <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-stone-900 px-3 py-2 flex items-center justify-between border-b border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">16</span>
                    <span className="font-bold text-xs text-stone-100">'Ardh al-Qamar</span>
                  </div>
                  <span className="font-arabic font-bold text-sm text-amber-300" dir="rtl">عرض القمر ﴿١٦﴾</span>
                </div>
                <div className="p-2.5 space-y-1 text-stone-800 font-mono text-[11px]">
                  <p className="text-[10px] text-stone-500 font-sans">Lintang Posisi Bulan Terhadap Garis Ekliptika:</p>
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-200 flex justify-between items-center font-bold">
                    <span className="font-sans">Lintang:</span>
                    <span>{data.kotak16_ardhQamar.hasil.ja}° {data.kotak16_ardhQamar.hasil.qa}' {data.kotak16_ardhQamar.hasil.ny}"</span>
                  </div>
                </div>
              </div>

              {/* KOTAK 17: Qaws Nur al-Hilal */}
              <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-stone-900 px-3 py-2 flex items-center justify-between border-b border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">17</span>
                    <span className="font-bold text-xs text-stone-100">Qaws Nur al-Hilal</span>
                  </div>
                  <span className="font-arabic font-bold text-sm text-amber-300" dir="rtl">قوس نور الهلال ﴿١٧﴾</span>
                </div>
                <div className="p-2.5 space-y-1 text-stone-800 font-mono text-[11px]">
                  <p className="text-[10px] text-stone-500 font-sans">Lebar Busur Cahaya Sinar Sabit Bulan:</p>
                  <div className="bg-amber-50 p-2 rounded-lg border border-amber-300 flex justify-between items-center text-amber-950 font-bold">
                    <span className="font-sans">Tebal Nur:</span>
                    <span>{data.kotak17_qawsNurHilal.hasil.ja}° {data.kotak17_qawsNurHilal.hasil.qa}' {data.kotak17_qawsNurHilal.hasil.ny}"</span>
                  </div>
                </div>
              </div>

              {/* KOTAK 18: Manzilat al-Qamar */}
              <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-sm md:col-span-2">
                <div className="bg-stone-900 px-3 py-2 flex items-center justify-between border-b border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">18</span>
                    <span className="font-bold text-xs text-stone-100">Manzilat al-Qamar (Gugusan Bintang Kedudukan Bulan)</span>
                  </div>
                  <span className="font-arabic font-bold text-sm text-amber-300" dir="rtl">منزلة القمر ﴿١٨﴾</span>
                </div>
                <div className="p-2.5 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono text-[11px]">
                  <span className="text-stone-600 font-sans">Gugusan bintang ke-{data.kotak18_manzilatQamar.manzilahNomor} berdasarkan Muqawwam Syams:</span>
                  <div className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-950 font-bold flex items-center gap-1">
                    <span>Manzilah {data.kotak18_manzilatQamar.manzilahNomor}:</span>
                    <span className="font-arabic text-sm ml-1">{data.kotak18_manzilatQamar.manzilahNama}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* KESIMPULAN HASIL HISAB */}
            <div className="bg-stone-50 border-2 border-stone-400 p-3.5 rounded-xl space-y-1 text-xs sm:text-sm">
              <h4 className="font-bold text-stone-900 uppercase border-b border-stone-300 pb-1">
                Kesimpulan Hasil Hisab Sullamun Nayyiroin:
              </h4>
              <p>a. Ijtima' : <strong className="font-sans text-emerald-900">{data.kesimpulan.ijtimaHari}, pukul {data.kesimpulan.ijtimaJamWIB}</strong></p>
              <p>b. Tinggi Hilal : <strong className="text-amber-900">{data.kesimpulan.tinggiHilal}</strong></p>
              <p>c. Lama Hilal di atas Ufuk : <strong className="text-blue-900">{data.kesimpulan.lamaHilalUfuk}</strong></p>
            </div>

            {/* PERBANDINGAN HISAB SULLAM & EPHEMERIS */}
            <div className="space-y-1.5">
              <h4 className="text-xs sm:text-sm font-black text-stone-900 uppercase">
                Komparasi Hisab Kitab Sullamun Nayyiroin vs Ephemeris Kontemporer
              </h4>

              {/* TAMPILAN KHUSUS PONSEL (HP): 100% Responsif, Tanpa Geser Kanan */}
              <div className="md:hidden space-y-2 print:hidden">
                {[
                  {
                    param: "Waktu Ijtima' (Konjungsi)",
                    sullam: data.komparasiEphemeris.sullam.ijtima,
                    ephemeris: data.komparasiEphemeris.ephemeris.ijtima
                  },
                  {
                    param: "Tinggi Hilal saat Ghurub",
                    sullam: data.komparasiEphemeris.sullam.tinggi,
                    ephemeris: data.komparasiEphemeris.ephemeris.tinggi
                  },
                  {
                    param: "Lama Hilal di Atas Ufuk",
                    sullam: data.komparasiEphemeris.sullam.lama,
                    ephemeris: data.komparasiEphemeris.ephemeris.lama
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/80 text-xs space-y-1 shadow-sm">
                    <span className="font-bold text-stone-900 text-[11px] block">{item.param}</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-amber-50 p-1.5 rounded-lg border border-amber-300/70">
                        <span className="text-[10px] text-amber-900 font-bold block">Sullam Nayyiroin:</span>
                        <span className="font-mono text-amber-950 font-black">{item.sullam}</span>
                      </div>
                      <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-300/70">
                        <span className="text-[10px] text-emerald-900 font-bold block">Ephemeris:</span>
                        <span className="font-mono text-emerald-950 font-black">{item.ephemeris}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* TAMPILAN TABEL STANDAR DESKTOP & CETAK A4 */}
              <div className="hidden md:block print:block overflow-x-auto -mx-1 px-1 rounded-xl border border-stone-300">
                <table className="w-full text-center text-xs min-w-[420px]">
                  <thead className="bg-stone-100 text-stone-800 font-bold border-b border-stone-300">
                    <tr>
                      <th className="border-r border-stone-300 p-1.5">Parameter</th>
                      <th className="border-r border-stone-300 p-1.5 bg-amber-50">Hisab Sullamun Nayyiroin</th>
                      <th className="p-1.5 bg-emerald-50">Hisab Ephemeris</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-mono text-xs">
                    <tr>
                      <td className="p-1.5 border-r border-stone-300 font-sans font-bold text-left">Waktu Ijtima'</td>
                      <td className="p-1.5 border-r border-stone-300 text-amber-900 font-bold">{data.komparasiEphemeris.sullam.ijtima}</td>
                      <td className="p-1.5 text-emerald-900 font-bold">{data.komparasiEphemeris.ephemeris.ijtima}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border-r border-stone-300 font-sans font-bold text-left">Tinggi Hilal</td>
                      <td className="p-1.5 border-r border-stone-300">{data.komparasiEphemeris.sullam.tinggi}</td>
                      <td className="p-1.5">{data.komparasiEphemeris.ephemeris.tinggi}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 border-r border-stone-300 font-sans font-bold text-left">Lama Hilal di Ufuk</td>
                      <td className="p-1.5 border-r border-stone-300">{data.komparasiEphemeris.sullam.lama}</td>
                      <td className="p-1.5">{data.komparasiEphemeris.ephemeris.lama}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* LEMBAR 3: BLANKO FORMULIR FALAKIYAH SULLAMUN NAYYIROIN (38 BARIS) - INDONESIA */}
        {/* ========================================================================= */}
        {(activeSection === 'semua' || activeSection === 'lembar3') && (
          <section
            ref={refBlankoIndo}
            className="bg-white text-stone-900 rounded-2xl p-4 sm:p-8 shadow-xl border border-stone-300 space-y-4 print:border-none print:shadow-none print:p-0 print:my-0 print-page-break max-w-[210mm] mx-auto"
          >
            <div className="border-b pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="text-[9px] sm:text-[10px] text-amber-900 font-semibold tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mb-1">
                  Lampiran Berkas Resmi Falakiyah &bull; Lembar 3 dari 4
                </span>
                <h3 className="text-sm sm:text-lg font-black text-stone-900 uppercase">
                  Blanko Formulir Falakiyah Sullamun Nayyiroin (38 Baris Terisi)
                </h3>
                <p className="text-[11px] text-stone-500">
                  Awal Bulan {data.namaBulanHijriyah} {data.tahunHijriyah} H &bull; Markaz: {data.markazName}
                </p>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold shrink-0">
                Versi Bahasa Indonesia (Angka Latin)
              </div>
            </div>

            {/* TAMPILAN KHUSUS PONSEL (HP): 100% Responsif, Tanpa Geser Kanan */}
            <div className="md:hidden space-y-1.5 print:hidden">
              <div className="bg-stone-100 p-2 rounded-lg border border-stone-300 text-[10px] font-bold text-stone-700 flex justify-between items-center">
                <span>No & Langkah Hisab</span>
                <span>Nilai Terisi (j / ° / ' / ")</span>
              </div>
              {BLANKO_IJTIMA_38_ITEMS.map((item) => {
                const val = getBlankoItemData(item.no, data);
                const operasiDisplay = getLatinOperasi(item.operasi, item.qaidah);
                const nilaiFormatted = formatBlankoValueLatin(val);

                return (
                  <div 
                    key={`indo-mobile-${item.no}`}
                    className="p-2 rounded-xl border border-stone-200 bg-stone-50/60 flex items-center justify-between gap-2 text-xs hover:bg-amber-50/40 transition-colors"
                  >
                    <div className="flex items-start gap-1.5 flex-1 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {item.no}
                      </span>
                      <div className="min-w-0">
                        <span className="font-semibold text-stone-900 text-[11px] block leading-tight">
                          {item.namaLatin}
                        </span>
                        {operasiDisplay !== '-' && (
                          <span className="text-[9px] text-amber-800 font-bold block mt-0.5">
                            {operasiDisplay}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="px-2 py-1 rounded-md bg-white border border-stone-300 font-mono text-[11px] font-black text-amber-950 block shadow-sm">
                        {nilaiFormatted}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TAMPILAN TABEL STANDAR DESKTOP & CETAK A4 */}
            <div className="hidden md:block print:block overflow-x-auto -mx-1 px-1 rounded-xl border-2 border-stone-900">
              <table className="w-full text-center border-collapse min-w-[580px] font-sans">
                <thead>
                  <tr className="bg-stone-200 border-b-2 border-stone-900 font-bold text-stone-900 text-xs">
                    <th className="border-r border-stone-400 p-1.5 w-10">No</th>
                    <th className="border-r border-stone-400 p-1.5 text-left">Nama Langkah Hisab</th>
                    <th className="border-r border-stone-400 p-1.5 w-14">Operasi</th>
                    <th className="border-r border-stone-400 p-1.5 w-12 bg-stone-100">Buruj (j)</th>
                    <th className="border-r border-stone-400 p-1.5 w-14 bg-amber-100">Derajat (°)</th>
                    <th className="border-r border-stone-400 p-1.5 w-14 bg-emerald-100">Menit (')</th>
                    <th className="border-r border-stone-400 p-1.5 w-14 bg-blue-100">Detik (")</th>
                    <th className="p-1.5 w-12 bg-stone-100">Tsalitsah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-300 text-xs">
                  {BLANKO_IJTIMA_38_ITEMS.map((item) => {
                    const val = getBlankoItemData(item.no, data);
                    const operasiDisplay = getLatinOperasi(item.operasi, item.qaidah);

                    return (
                      <tr key={`indo-desktop-${item.no}`} className="hover:bg-amber-50/50">
                        <td className="p-1 border-r border-stone-400 font-bold text-stone-600 text-center">
                          {item.no}
                        </td>
                        <td className="p-1 border-r border-stone-400 text-left font-semibold text-xs text-stone-900">
                          {item.namaLatin}
                        </td>
                        <td className="p-1 border-r border-stone-400 font-bold text-amber-800 text-center text-[11px]">
                          {operasiDisplay}
                        </td>
                        <td className="p-1 border-r border-stone-400 bg-stone-50/40 font-bold text-stone-900">
                          {val.buruj ?? '-'}
                        </td>
                        <td className="p-1 border-r border-stone-400 bg-amber-50/40 font-bold text-amber-950">
                          {val.darajah ?? '-'}
                        </td>
                        <td className="p-1 border-r border-stone-400 bg-emerald-50/40 font-bold text-emerald-950">
                          {val.daqiqah ?? '-'}
                        </td>
                        <td className="p-1 border-r border-stone-400 bg-blue-50/40 font-mono text-blue-950">
                          {val.tsaniyah ?? '-'}
                        </td>
                        <td className="p-1 bg-stone-50/40 font-mono text-stone-700">
                          {val.tsalitsah ?? '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-[11px] text-stone-500 italic text-center border-t border-stone-200">
              * Lampiran ini merupakan formulir isian hisab resmi 38 kaidah Kitab Sullamun Nayyiroin (Versi Bahasa Indonesia) untuk penetapan awal bulan {data.namaBulanHijriyah} {data.tahunHijriyah} H.
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* LEMBAR 4: جدول بياض الإجتماع على قواعد سلم النيرين (٣٨ مرتبة) - HANYA ARAB */}
        {/* ========================================================================= */}
        {(activeSection === 'semua' || activeSection === 'lembar4') && (
          <section
            ref={refBlankoArab}
            className="bg-white text-stone-900 rounded-2xl p-4 sm:p-8 shadow-xl border border-stone-300 space-y-4 print:border-none print:shadow-none print:p-0 print:my-0 print-page-break max-w-[210mm] mx-auto font-arabic"
          >
            <div className="border-b pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" dir="rtl">
              <div>
                <span className="text-[9px] sm:text-[10px] text-emerald-900 font-semibold tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mb-1">
                  ملحق الوثيقة الرسمية الفلكية &bull; الورقة ٤ من ٤
                </span>
                <h3 className="text-sm sm:text-lg font-black text-stone-900">
                  جدول بياض الإجتماع على قواعد سلم النيرين (٣٨ مرتبة)
                </h3>
                <p className="text-[11px] text-stone-500">
                  غرة شهر {getNamaBulanArab(data.namaBulanHijriyah)} سنة {toArabicDigits(data.tahunHijriyah)} هـ &bull; المركز: {getMarkazArab(data.markazName)}
                </p>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold shrink-0 font-sans">
                مخطوط عربي (أرقام مشرقية أصيلة)
              </div>
            </div>

            {/* TAMPILAN KHUSUS PONSEL (HP): 100% Responsif, Tanpa Geser Kanan (RTL) */}
            <div className="md:hidden space-y-1.5 print:hidden" dir="rtl">
              <div className="bg-stone-100 p-2 rounded-lg border border-stone-300 text-[10px] font-bold text-stone-700 flex justify-between items-center">
                <span>الرقم واسم العمل الفلكي</span>
                <span>المقدار المحسوب (ج / جة / قة / ث)</span>
              </div>
              {BLANKO_IJTIMA_38_ITEMS.map((item) => {
                const val = getBlankoItemData(item.no, data);
                const operasiDisplay = getArabicOperasi(item.operasi, item.qaidah);
                const nilaiFormatted = formatBlankoValueArabic(val);

                return (
                  <div 
                    key={`arab-mobile-${item.no}`}
                    className="p-2 rounded-xl border border-stone-200 bg-stone-50/60 flex items-center justify-between gap-2 text-xs hover:bg-emerald-50/40 transition-colors"
                  >
                    <div className="flex items-start gap-1.5 flex-1 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-sans">
                        {toArabicDigits(item.no)}
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-stone-900 text-xs block leading-tight">
                          {item.namaArab}
                        </span>
                        {operasiDisplay !== '-' && (
                          <span className="text-[9px] text-amber-800 font-bold block mt-0.5">
                            {operasiDisplay}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-left">
                      <span className="px-2 py-1 rounded-md bg-white border border-stone-300 font-bold text-xs text-emerald-950 block shadow-sm" dir="ltr">
                        {nilaiFormatted}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TAMPILAN TABEL STANDAR DESKTOP & CETAK A4 (RTL ARAB) */}
            <div className="hidden md:block print:block overflow-x-auto -mx-1 px-1 rounded-xl border-2 border-stone-900">
              <table className="w-full text-center border-collapse min-w-[580px]" dir="rtl">
                <thead>
                  <tr className="bg-stone-200 border-b-2 border-stone-900 font-bold text-stone-900 text-xs">
                    <th className="border-l border-stone-400 p-1.5 w-10">الرقم</th>
                    <th className="border-l border-stone-400 p-1.5 text-right">اسم العمل الفلكي</th>
                    <th className="border-l border-stone-400 p-1.5 w-14">العمل</th>
                    <th className="border-l border-stone-400 p-1.5 w-12 bg-stone-100">البروج (ج)</th>
                    <th className="border-l border-stone-400 p-1.5 w-14 bg-amber-100">الدرجة (جة)</th>
                    <th className="border-l border-stone-400 p-1.5 w-14 bg-emerald-100">الدقيقة (قة)</th>
                    <th className="border-l border-stone-400 p-1.5 w-14 bg-blue-100">الثانية (ث)</th>
                    <th className="p-1.5 w-12 bg-stone-100">الثالثة (لث)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-300 text-xs">
                  {BLANKO_IJTIMA_38_ITEMS.map((item) => {
                    const val = getBlankoItemData(item.no, data);
                    const operasiDisplay = getArabicOperasi(item.operasi, item.qaidah);

                    return (
                      <tr key={`arab-desktop-${item.no}`} className="hover:bg-emerald-50/50">
                        <td className="p-1 border-l border-stone-400 font-bold text-stone-700 text-center font-sans">
                          {toArabicDigits(item.no)}
                        </td>
                        <td className="p-1 border-l border-stone-400 text-right font-bold text-sm text-stone-900">
                          {item.namaArab}
                        </td>
                        <td className="p-1 border-l border-stone-400 font-bold text-amber-800 text-center text-[11px]">
                          {operasiDisplay}
                        </td>
                        <td className="p-1 border-l border-stone-400 bg-stone-50/40 font-bold text-stone-900">
                          {toArabicDigits(val.buruj)}
                        </td>
                        <td className="p-1 border-l border-stone-400 bg-amber-50/40 font-bold text-amber-950">
                          {toArabicDigits(val.darajah)}
                        </td>
                        <td className="p-1 border-l border-stone-400 bg-emerald-50/40 font-bold text-emerald-950">
                          {toArabicDigits(val.daqiqah)}
                        </td>
                        <td className="p-1 border-l border-stone-400 bg-blue-50/40 font-mono text-blue-950">
                          {toArabicDigits(val.tsaniyah)}
                        </td>
                        <td className="p-1 bg-stone-50/40 font-mono text-stone-700">
                          {toArabicDigits(val.tsalitsah)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-[11px] text-stone-500 italic text-center border-t border-stone-200" dir="rtl">
              * هذا الملحق هو جدول بياض الإجتماع على قواعد كتاب سلم النيرين الأصلي لثبوت أوائل الشهور العربية لعام {toArabicDigits(data.tahunHijriyah)} هـ.
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
