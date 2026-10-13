import { 
  HijriDate, 
  JawaDate, 
  JulianDate, 
  TionghoaDate, 
  SakaDate, 
  NeptuInfo, 
  CalendarEventItem, 
  CalendarViewMode 
} from '../types/calendar';

export const NAMA_BULAN = [
  "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
  "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
];

export const BULAN_HIJRIYAH = [
  "Muharram",
  "Safar",
  "Rabiul Awal",
  "Rabiul Akhir",
  "Jumadil Awal",
  "Jumadil Akhir",
  "Rajab",
  "Syaban",
  "Ramadhan",
  "Syawal",
  "Zulqadah",
  "Zulhijah"
];

export interface BulanHijriyahItem {
  no: number;
  nama: string;
  arab: string;
  displayName: string;
}

export const BULAN_HIJRIYAH_DETAIL: BulanHijriyahItem[] = [
  { no: 1, nama: "Muharram", arab: "مُحَرَّم", displayName: "1. Muharram (مُحَرَّم)" },
  { no: 2, nama: "Safar", arab: "صَفَر", displayName: "2. Safar (صَفَر)" },
  { no: 3, nama: "Rabiul Awal", arab: "رَبِيْع الأَوَّل", displayName: "3. Rabiul Awal (رَبِيْع الأَوَّل)" },
  { no: 4, nama: "Rabiul Akhir", arab: "رَبِيْع الآخِر", displayName: "4. Rabiul Akhir (رَبِيْع الآخِر)" },
  { no: 5, nama: "Jumadil Awal", arab: "جُمَادَى الْأُولَى", displayName: "5. Jumadil Awal (جُمَادَى الْأُولَى)" },
  { no: 6, nama: "Jumadil Akhir", arab: "جُمَادَى الْآخِرَة", displayName: "6. Jumadil Akhir (جُمَادَى الْآخِرَة)" },
  { no: 7, nama: "Rajab", arab: "رَجَب", displayName: "7. Rajab (رَجَب)" },
  { no: 8, nama: "Syaban", arab: "شَعْبَان", displayName: "8. Syaban (شَعْبَان)" },
  { no: 9, nama: "Ramadhan", arab: "رَمَضَان", displayName: "9. Ramadhan (رَمَضَان)" },
  { no: 10, nama: "Syawal", arab: "شَوَّال", displayName: "10. Syawal (شَوَّال)" },
  { no: 11, nama: "Zulqadah", arab: "ذُو الْقَعْدَة", displayName: "11. Zulqadah (ذُو الْقَعْدَة)" },
  { no: 12, nama: "Zulhijah", arab: "ذُو الْحِجَّة", displayName: "12. Zulhijah (ذُو الْحِجَّة)" }
];

export const BULAN_JAWA = [
  "Suro", "Sapar", "Mulud", "Bakda Mulud",
  "Jumadilawal", "Jumadilakhir", "Rejeb", "Ruwah",
  "Pasa", "Sawal", "Sela", "Besar"
];

export const PASARAN_LIST = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];

export const WINDU_LIST = ["Adi (Kuntara)", "Kencana (Sengara)", "Maju (Sancaya)", "Kuntara (Adi)"];

export const NAMA_HARI = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function getIndonesianDayName(date: Date): string {
  return NAMA_HARI[date.getDay()];
}

export function replaceMingguWithAhad(text: string): string {
  return text.replace(/\bMinggu\b/g, 'Ahad').replace(/\bminggu\b/g, 'ahad');
}

export function formatIndonesianDateWithAhad(
  date: Date, 
  options?: { includeWeekday?: boolean; monthFormat?: 'long' | 'short' }
): string {
  const dayName = NAMA_HARI[date.getDay()];
  const day = date.getDate();
  const monthName = options?.monthFormat === 'short' 
    ? NAMA_BULAN[date.getMonth()].substring(0, 3) 
    : NAMA_BULAN[date.getMonth()];
  const year = date.getFullYear();
  if (options?.includeWeekday !== false) {
    return `${dayName}, ${day} ${monthName} ${year}`;
  }
  return `${day} ${monthName} ${year}`;
}

export const NEPTU_HARI: Record<number, number> = {
  0: 5, // Ahad
  1: 4, // Senin
  2: 3, // Selasa
  3: 7, // Rabu
  4: 8, // Kamis
  5: 6, // Jumat
  6: 9  // Sabtu
};

export const NEPTU_PASARAN: Record<string, number> = {
  "Legi": 5,
  "Pahing": 9,
  "Pon": 7,
  "Wage": 4,
  "Kliwon": 8
};

export function toArabicNumeral(n: number): string {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return n.toString().split('').map(digit => arabicNumbers[parseInt(digit, 10)] ?? digit).join('');
}

// ==========================================
// 1. KALENDER JULIAN (JULIUS CAESAR)
// ==========================================
export const BULAN_JULIAN = [
  "Januarius", "Februarius", "Martius", "Aprilis", "Maius", "Junius",
  "Julius", "Augustus", "September", "October", "November", "December"
];

export function getJulianDate(date: Date): JulianDate {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const a = Math.floor((14 - m) / 12);
  const y_greg = y + 4800 - a;
  const m_greg = m + 12 * a - 3;

  const jdn = d + Math.floor((153 * m_greg + 2) / 5) + 365 * y_greg + Math.floor(y_greg / 4) - Math.floor(y_greg / 100) + Math.floor(y_greg / 400) - 32045;

  const b_jul = jdn + 32082;
  const d_jul = Math.floor((4 * b_jul + 3) / 1461);
  const e_jul = b_jul - Math.floor((1461 * d_jul) / 4);
  const m_jul = Math.floor((5 * e_jul + 2) / 153);

  const dayJulian = e_jul - Math.floor((153 * m_jul + 2) / 5) + 1;
  const monthJulian = m_jul + 3 - 12 * Math.floor(m_jul / 10);
  const yearJulian = d_jul - 4800 + Math.floor(m_jul / 10);

  return {
    day: dayJulian,
    month: monthJulian,
    year: yearJulian,
    monthName: BULAN_JULIAN[monthJulian - 1] || `Bulan_${monthJulian}`,
    julianDayNumber: jdn
  };
}

export const JULIAN_EVENTS: Array<{ julianMonth: number; julianDay: number; title: string; isHoliday: boolean }> = [
  { julianMonth: 1, julianDay: 1, title: "Tahun Baru Kalender Julian (Old Style New Year)", isHoliday: false },
  { julianMonth: 1, julianDay: 6, title: "Epifani / Teofani Kalender Julian", isHoliday: false },
  { julianMonth: 3, julianDay: 21, title: "Ekuinoks Musim Semi Kalender Julius", isHoliday: false },
  { julianMonth: 12, julianDay: 25, title: "Hari Raya Natal Kalender Julian (Natal Ortodoks)", isHoliday: false }
];

// ==========================================
// 2. KALENDER TIONGHOA (IMLEK & KONGZILI)
// ==========================================
export const BULAN_TIONGHOA = [
  { no: 1, nama: "Cia Gwee", hanzi: "正月", desc: "1. Cia Gwee (正月)" },
  { no: 2, nama: "Ji Gwee", hanzi: "二月", desc: "2. Ji Gwee (二月)" },
  { no: 3, nama: "Sa Gwee", hanzi: "三月", desc: "3. Sa Gwee (三月)" },
  { no: 4, nama: "Si Gwee", hanzi: "四月", desc: "4. Si Gwee (四月)" },
  { no: 5, nama: "Go Gwee", hanzi: "五月", desc: "5. Go Gwee (五月)" },
  { no: 6, nama: "Lak Gwee", hanzi: "六月", desc: "6. Lak Gwee (六月)" },
  { no: 7, nama: "Cit Gwee", hanzi: "七月", desc: "7. Cit Gwee (七月)" },
  { no: 8, nama: "Pe Gwee", hanzi: "八月", desc: "8. Pe Gwee (八月)" },
  { no: 9, nama: "Kauw Gwee", hanzi: "九月", desc: "9. Kauw Gwee (九月)" },
  { no: 10, nama: "Cap Gwee", hanzi: "十月", desc: "10. Cap Gwee (十月)" },
  { no: 11, nama: "Cap It Gwee", hanzi: "十一月", desc: "11. Cap It Gwee (十一月)" },
  { no: 12, nama: "Cap Ji Gwee", hanzi: "十二月", desc: "12. Cap Ji Gwee (十二月)" }
];

export const SHIO_ANIMALS = [
  "Tikus", "Kerbau", "Harimau", "Kelinci",
  "Naga", "Ular", "Kuda", "Kambing",
  "Monyet", "Ayam", "Anjing", "Babi"
];

export const CHINESE_ELEMENTS = ["Kayu", "Api", "Tanah", "Logam", "Air"];

interface ChineseMonthAnchor {
  kongziliYear: number;
  monthNum: number;
  monthName: string;
  chineseMonthName: string;
  isLeap?: boolean;
  startYearM: number;
  startMonthM: number;
  startDayM: number;
  shio: string;
  shioAnimal: string;
  element: string;
}

const CHINESE_MONTH_ANCHORS: ChineseMonthAnchor[] = [
  // 2575 Kongzili (2024 - Naga Kayu)
  { kongziliYear: 2575, monthNum: 1, monthName: "Cia Gwee", chineseMonthName: "正月", startYearM: 2024, startMonthM: 2, startDayM: 10, shio: "Naga Kayu (Jia Chen)", shioAnimal: "Naga", element: "Kayu" },
  { kongziliYear: 2575, monthNum: 2, monthName: "Ji Gwee", chineseMonthName: "二月", startYearM: 2024, startMonthM: 3, startDayM: 10, shio: "Naga Kayu (Jia Chen)", shioAnimal: "Naga", element: "Kayu" },
  { kongziliYear: 2575, monthNum: 3, monthName: "Sa Gwee", chineseMonthName: "三月", startYearM: 2024, startMonthM: 4, startDayM: 9, shio: "Naga Kayu (Jia Chen)", shioAnimal: "Naga", element: "Kayu" },
  { kongziliYear: 2575, monthNum: 4, monthName: "Si Gwee", chineseMonthName: "四月", startYearM: 2024, startMonthM: 5, startDayM: 8, shio: "Naga Kayu (Jia Chen)", shioAnimal: "Naga", element: "Kayu" },
  { kongziliYear: 2575, monthNum: 5, monthName: "Go Gwee", chineseMonthName: "五月", startYearM: 2024, startMonthM: 6, startDayM: 6, shio: "Naga Kayu (Jia Chen)", shioAnimal: "Naga", element: "Kayu" },
  { kongziliYear: 2575, monthNum: 6, monthName: "Lak Gwee", chineseMonthName: "六月", startYearM: 2024, startMonthM: 7, startDayM: 6, shio: "Naga Kayu (Jia Chen)", shioAnimal: "Naga", element: "Kayu" },
  { kongziliYear: 2575, monthNum: 7, monthName: "Cit Gwee", chineseMonthName: "七月", startYearM: 2024, startMonthM: 8, startDayM: 4, shio: "Naga Kayu (Jia Chen)", shioAnimal: "Naga", element: "Kayu" },
  { kongziliYear: 2575, monthNum: 8, monthName: "Pe Gwee", chineseMonthName: "八月", startYearM: 2024, startMonthM: 9, startDayM: 3, shio: "Naga Kayu (Jia Chen)", shioAnimal: "Naga", element: "Kayu" },
  { kongziliYear: 2575, monthNum: 9, monthName: "Kauw Gwee", chineseMonthName: "九月", startYearM: 2024, startMonthM: 10, startDayM: 3, shio: "Naga Kayu (Jia Chen)", shioAnimal: "Naga", element: "Kayu" },
  { kongziliYear: 2575, monthNum: 10, monthName: "Cap Gwee", chineseMonthName: "十月", startYearM: 2024, startMonthM: 11, startDayM: 1, shio: "Naga Kayu (Jia Chen)", shioAnimal: "Naga", element: "Kayu" },
  { kongziliYear: 2575, monthNum: 11, monthName: "Cap It Gwee", chineseMonthName: "十一月", startYearM: 2024, startMonthM: 12, startDayM: 1, shio: "Naga Kayu (Jia Chen)", shioAnimal: "Naga", element: "Kayu" },
  { kongziliYear: 2575, monthNum: 12, monthName: "Cap Ji Gwee", chineseMonthName: "十二月", startYearM: 2024, startMonthM: 12, startDayM: 31, shio: "Naga Kayu (Jia Chen)", shioAnimal: "Naga", element: "Kayu" },

  // 2576 Kongzili (2025 - Ular Kayu)
  { kongziliYear: 2576, monthNum: 1, monthName: "Cia Gwee", chineseMonthName: "正月", startYearM: 2025, startMonthM: 1, startDayM: 29, shio: "Ular Kayu (Yi Si)", shioAnimal: "Ular", element: "Kayu" },
  { kongziliYear: 2576, monthNum: 2, monthName: "Ji Gwee", chineseMonthName: "二月", startYearM: 2025, startMonthM: 2, startDayM: 28, shio: "Ular Kayu (Yi Si)", shioAnimal: "Ular", element: "Kayu" },
  { kongziliYear: 2576, monthNum: 3, monthName: "Sa Gwee", chineseMonthName: "三月", startYearM: 2025, startMonthM: 3, startDayM: 29, shio: "Ular Kayu (Yi Si)", shioAnimal: "Ular", element: "Kayu" },
  { kongziliYear: 2576, monthNum: 4, monthName: "Si Gwee", chineseMonthName: "四月", startYearM: 2025, startMonthM: 4, startDayM: 28, shio: "Ular Kayu (Yi Si)", shioAnimal: "Ular", element: "Kayu" },
  { kongziliYear: 2576, monthNum: 5, monthName: "Go Gwee", chineseMonthName: "五月", startYearM: 2025, startMonthM: 5, startDayM: 27, shio: "Ular Kayu (Yi Si)", shioAnimal: "Ular", element: "Kayu" },
  { kongziliYear: 2576, monthNum: 6, monthName: "Lak Gwee (Run)", chineseMonthName: "闰六月", isLeap: true, startYearM: 2025, startMonthM: 6, startDayM: 25, shio: "Ular Kayu (Yi Si)", shioAnimal: "Ular", element: "Kayu" },
  { kongziliYear: 2576, monthNum: 7, monthName: "Cit Gwee", chineseMonthName: "七月", startYearM: 2025, startMonthM: 7, startDayM: 25, shio: "Ular Kayu (Yi Si)", shioAnimal: "Ular", element: "Kayu" },
  { kongziliYear: 2576, monthNum: 8, monthName: "Pe Gwee", chineseMonthName: "八月", startYearM: 2025, startMonthM: 8, startDayM: 23, shio: "Ular Kayu (Yi Si)", shioAnimal: "Ular", element: "Kayu" },
  { kongziliYear: 2576, monthNum: 9, monthName: "Kauw Gwee", chineseMonthName: "九月", startYearM: 2025, startMonthM: 9, startDayM: 22, shio: "Ular Kayu (Yi Si)", shioAnimal: "Ular", element: "Kayu" },
  { kongziliYear: 2576, monthNum: 10, monthName: "Cap Gwee", chineseMonthName: "十月", startYearM: 2025, startMonthM: 10, startDayM: 21, shio: "Ular Kayu (Yi Si)", shioAnimal: "Ular", element: "Kayu" },
  { kongziliYear: 2576, monthNum: 11, monthName: "Cap It Gwee", chineseMonthName: "十一月", startYearM: 2025, startMonthM: 11, startDayM: 20, shio: "Ular Kayu (Yi Si)", shioAnimal: "Ular", element: "Kayu" },
  { kongziliYear: 2576, monthNum: 12, monthName: "Cap Ji Gwee", chineseMonthName: "十二月", startYearM: 2025, startMonthM: 12, startDayM: 20, shio: "Ular Kayu (Yi Si)", shioAnimal: "Ular", element: "Kayu" },

  // 2577 Kongzili (2026 - Kuda Api)
  { kongziliYear: 2577, monthNum: 1, monthName: "Cia Gwee", chineseMonthName: "正月", startYearM: 2026, startMonthM: 2, startDayM: 17, shio: "Kuda Api (Bing Wu)", shioAnimal: "Kuda", element: "Api" },
  { kongziliYear: 2577, monthNum: 2, monthName: "Ji Gwee", chineseMonthName: "二月", startYearM: 2026, startMonthM: 3, startDayM: 19, shio: "Kuda Api (Bing Wu)", shioAnimal: "Kuda", element: "Api" },
  { kongziliYear: 2577, monthNum: 3, monthName: "Sa Gwee", chineseMonthName: "三月", startYearM: 2026, startMonthM: 4, startDayM: 17, shio: "Kuda Api (Bing Wu)", shioAnimal: "Kuda", element: "Api" },
  { kongziliYear: 2577, monthNum: 4, monthName: "Si Gwee", chineseMonthName: "四月", startYearM: 2026, startMonthM: 5, startDayM: 17, shio: "Kuda Api (Bing Wu)", shioAnimal: "Kuda", element: "Api" },
  { kongziliYear: 2577, monthNum: 5, monthName: "Go Gwee", chineseMonthName: "五月", startYearM: 2026, startMonthM: 6, startDayM: 15, shio: "Kuda Api (Bing Wu)", shioAnimal: "Kuda", element: "Api" },
  { kongziliYear: 2577, monthNum: 6, monthName: "Lak Gwee", chineseMonthName: "六月", startYearM: 2026, startMonthM: 7, startDayM: 14, shio: "Kuda Api (Bing Wu)", shioAnimal: "Kuda", element: "Api" },
  { kongziliYear: 2577, monthNum: 7, monthName: "Cit Gwee", chineseMonthName: "七月", startYearM: 2026, startMonthM: 8, startDayM: 13, shio: "Kuda Api (Bing Wu)", shioAnimal: "Kuda", element: "Api" },
  { kongziliYear: 2577, monthNum: 8, monthName: "Pe Gwee", chineseMonthName: "八月", startYearM: 2026, startMonthM: 9, startDayM: 11, shio: "Kuda Api (Bing Wu)", shioAnimal: "Kuda", element: "Api" },
  { kongziliYear: 2577, monthNum: 9, monthName: "Kauw Gwee", chineseMonthName: "九月", startYearM: 2026, startMonthM: 10, startDayM: 11, shio: "Kuda Api (Bing Wu)", shioAnimal: "Kuda", element: "Api" },
  { kongziliYear: 2577, monthNum: 10, monthName: "Cap Gwee", chineseMonthName: "十月", startYearM: 2026, startMonthM: 11, startDayM: 10, shio: "Kuda Api (Bing Wu)", shioAnimal: "Kuda", element: "Api" },
  { kongziliYear: 2577, monthNum: 11, monthName: "Cap It Gwee", chineseMonthName: "十一月", startYearM: 2026, startMonthM: 12, startDayM: 9, shio: "Kuda Api (Bing Wu)", shioAnimal: "Kuda", element: "Api" },
  { kongziliYear: 2577, monthNum: 12, monthName: "Cap Ji Gwee", chineseMonthName: "十二月", startYearM: 2027, startMonthM: 1, startDayM: 8, shio: "Kuda Api (Bing Wu)", shioAnimal: "Kuda", element: "Api" },

  // 2578 Kongzili (2027 - Kambing Api)
  { kongziliYear: 2578, monthNum: 1, monthName: "Cia Gwee", chineseMonthName: "正月", startYearM: 2027, startMonthM: 2, startDayM: 6, shio: "Kambing Api (Ding Wei)", shioAnimal: "Kambing", element: "Api" },
  { kongziliYear: 2578, monthNum: 2, monthName: "Ji Gwee", chineseMonthName: "二月", startYearM: 2027, startMonthM: 3, startDayM: 8, shio: "Kambing Api (Ding Wei)", shioAnimal: "Kambing", element: "Api" },
  { kongziliYear: 2578, monthNum: 3, monthName: "Sa Gwee", chineseMonthName: "三月", startYearM: 2027, startMonthM: 4, startDayM: 7, shio: "Kambing Api (Ding Wei)", shioAnimal: "Kambing", element: "Api" },
  { kongziliYear: 2578, monthNum: 4, monthName: "Si Gwee", chineseMonthName: "四月", startYearM: 2027, startMonthM: 5, startDayM: 6, shio: "Kambing Api (Ding Wei)", shioAnimal: "Kambing", element: "Api" },
  { kongziliYear: 2578, monthNum: 5, monthName: "Go Gwee", chineseMonthName: "五月", startYearM: 2027, startMonthM: 6, startDayM: 5, shio: "Kambing Api (Ding Wei)", shioAnimal: "Kambing", element: "Api" },
  { kongziliYear: 2578, monthNum: 6, monthName: "Lak Gwee", chineseMonthName: "六月", startYearM: 2027, startMonthM: 7, startDayM: 4, shio: "Kambing Api (Ding Wei)", shioAnimal: "Kambing", element: "Api" },
  { kongziliYear: 2578, monthNum: 7, monthName: "Cit Gwee", chineseMonthName: "七月", startYearM: 2027, startMonthM: 8, startDayM: 3, shio: "Kambing Api (Ding Wei)", shioAnimal: "Kambing", element: "Api" },
  { kongziliYear: 2578, monthNum: 8, monthName: "Pe Gwee", chineseMonthName: "八月", startYearM: 2027, startMonthM: 9, startDayM: 1, shio: "Kambing Api (Ding Wei)", shioAnimal: "Kambing", element: "Api" },
  { kongziliYear: 2578, monthNum: 9, monthName: "Kauw Gwee", chineseMonthName: "九月", startYearM: 2027, startMonthM: 10, startDayM: 1, shio: "Kambing Api (Ding Wei)", shioAnimal: "Kambing", element: "Api" },
  { kongziliYear: 2578, monthNum: 10, monthName: "Cap Gwee", chineseMonthName: "十月", startYearM: 2027, startMonthM: 10, startDayM: 30, shio: "Kambing Api (Ding Wei)", shioAnimal: "Kambing", element: "Api" },
  { kongziliYear: 2578, monthNum: 11, monthName: "Cap It Gwee", chineseMonthName: "十一月", startYearM: 2027, startMonthM: 11, startDayM: 29, shio: "Kambing Api (Ding Wei)", shioAnimal: "Kambing", element: "Api" },
  { kongziliYear: 2578, monthNum: 12, monthName: "Cap Ji Gwee", chineseMonthName: "十二月", startYearM: 2027, startMonthM: 12, startDayM: 28, shio: "Kambing Api (Ding Wei)", shioAnimal: "Kambing", element: "Api" }
];

const CHINESE_ANCHOR_TIMES = CHINESE_MONTH_ANCHORS.map(a => ({
  ...a,
  startTime: Date.UTC(a.startYearM, a.startMonthM - 1, a.startDayM)
})).sort((a, b) => a.startTime - b.startTime);

export function getChineseDayNameHokkien(dayNum: number): string {
  const dayNames: Record<number, string> = {
    1: "初一 (Ce It)", 2: "初二 (Ce Ji)", 3: "初三 (Ce Sa)", 4: "初四 (Ce Si)", 5: "初五 (Ce Go)",
    6: "初六 (Ce Lak)", 7: "初七 (Ce Cit)", 8: "初八 (Ce Pe)", 9: "初九 (Ce Kauw)", 10: "初十 (Ce Cap)",
    11: "十一 (Cap It)", 12: "十二 (Cap Ji)", 13: "十三 (Cap Sa)", 14: "十四 (Cap Si)", 15: "十五 (Cap Go)",
    16: "十六 (Cap Lak)", 17: "十七 (Cap Cit)", 18: "十八 (Cap Pe)", 19: "十九 (Cap Kauw)", 20: "二十 (Ji Cap)",
    21: "廿一 (Ji It)", 22: "廿二 (Ji Ji)", 23: "廿三 (Ji Sa)", 24: "廿四 (Ji Si)", 25: "廿五 (Ji Go)",
    26: "廿六 (Ji Lak)", 27: "廿七 (Ji Cit)", 28: "廿八 (Ji Pe)", 29: "廿九 (Ji Kauw)", 30: "三十 (Sa Cap)"
  };
  return dayNames[dayNum] || `Hari ${dayNum}`;
}

export function getTionghoaDate(date: Date): TionghoaDate {
  const targetMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

  let foundIdx = -1;
  for (let i = CHINESE_ANCHOR_TIMES.length - 1; i >= 0; i--) {
    if (targetMidnight >= CHINESE_ANCHOR_TIMES[i].startTime) {
      foundIdx = i;
      break;
    }
  }

  if (foundIdx !== -1) {
    const anchor = CHINESE_ANCHOR_TIMES[foundIdx];
    const diffDays = Math.floor((targetMidnight - anchor.startTime) / 86400000);
    const day = diffDays + 1;
    return {
      day,
      month: anchor.monthNum,
      monthName: anchor.monthName,
      chineseMonthName: anchor.chineseMonthName,
      chineseDayName: getChineseDayNameHokkien(day),
      year: anchor.kongziliYear,
      shio: anchor.shio,
      shioAnimal: anchor.shioAnimal,
      element: anchor.element,
      isLeapMonth: anchor.isLeap
    };
  }

  // Fallback lunisolar formula
  const yearM = date.getFullYear();
  const kongziliYear = yearM + 551;
  const shioIdx = Math.abs((yearM - 4) % 12);
  const shioAnimal = SHIO_ANIMALS[shioIdx] || "Kuda";
  const elementIdx = Math.floor(((yearM - 4) % 10) / 2);
  const element = CHINESE_ELEMENTS[elementIdx] || "Api";

  const approxSynodic = 29.530588;
  const baseTime = Date.UTC(2026, 1, 17);
  const diffDays = Math.floor((targetMidnight - baseTime) / 86400000);
  const lunation = Math.floor(diffDays / approxSynodic);
  const dayInMonth = Math.floor(diffDays - (lunation * approxSynodic)) + 1;
  const normDay = Math.max(1, Math.min(30, ((dayInMonth % 30) + 30) % 30 || 30));
  const normMonth = Math.max(1, Math.min(12, (((lunation % 12) + 12) % 12) + 1));

  const bTiong = BULAN_TIONGHOA[normMonth - 1] || BULAN_TIONGHOA[0];

  return {
    day: normDay,
    month: normMonth,
    monthName: bTiong.nama,
    chineseMonthName: bTiong.hanzi,
    chineseDayName: getChineseDayNameHokkien(normDay),
    year: kongziliYear,
    shio: `${shioAnimal} ${element}`,
    shioAnimal,
    element
  };
}

export const TIONGHOA_EVENTS: Record<number, Array<{ day: number; title: string; isHoliday: boolean }>> = {
  1: [ // Cia Gwee
    { day: 1, title: "Tahun Baru Imlek (Gong Xi Fa Cai / 春节)", isHoliday: true },
    { day: 2, title: "Hari Kedua Tahun Baru Imlek (Kai Nian)", isHoliday: false },
    { day: 9, title: "Sembahyang Thian Kong (Pai Tian Gong / Hari Lahir Giok Hong Siang Te)", isHoliday: false },
    { day: 15, title: "Festival Cap Go Meh / Yuan Xiao Jie (Pesta Lampion)", isHoliday: false }
  ],
  5: [ // Go Gwee
    { day: 5, title: "Hari Peh Cun / Duanwu Jie (Festival Bakcang & Perahu Naga)", isHoliday: false }
  ],
  7: [ // Cit Gwee
    { day: 7, title: "Festival Qixi (Hari Kasih Sayang Tradisi Tionghoa / Bintang Penggembala & Gadis Penenun)", isHoliday: false },
    { day: 15, title: "Festival Ulambana / Zhongyuan Jie (Sembahyang Rebutan / Bulan Arwah)", isHoliday: false }
  ],
  8: [ // Pe Gwee
    { day: 15, title: "Festival Kue Bulan / Zhongqiu Jie (Tiong Ciu / Mid-Autumn Festival)", isHoliday: false }
  ],
  9: [ // Kauw Gwee
    { day: 9, title: "Festival Double Ninth / Chongyang Jie (Hari Penghormatan Orang Tua)", isHoliday: false }
  ],
  12: [ // Cap Ji Gwee
    { day: 24, title: "Sembahyang Dewa Dapur Naik ke Langit (Song Shen / Zao Jun)", isHoliday: false }
  ]
};

// ==========================================
// 3. KALENDER SAKA (BALI & HINDU NUSANTARA)
// ==========================================
export const SASIH_SAKA = [
  { no: 1, nama: "Kasa", desc: "1. Sasih Kasa (Kartika / Sravana)" },
  { no: 2, nama: "Karo", desc: "2. Sasih Karo (Posya / Bhadrapada)" },
  { no: 3, nama: "Katiga", desc: "3. Sasih Katiga (Magha / Asvina)" },
  { no: 4, nama: "Kapat", desc: "4. Sasih Kapat (Phalguna / Kartika)" },
  { no: 5, nama: "Kalima", desc: "5. Sasih Kalima (Caitra / Margasirsa)" },
  { no: 6, nama: "Kanem", desc: "6. Sasih Kanem (Vaisakha / Pousa)" },
  { no: 7, nama: "Kapitu", desc: "7. Sasih Kapitu (Jyaistha / Magha)" },
  { no: 8, nama: "Kawolu", desc: "8. Sasih Kawolu (Asadha / Phalguna)" },
  { no: 9, nama: "Kasanga", desc: "9. Sasih Kasanga (Caitra - Tawur Kesanga)" },
  { no: 10, nama: "Kadasa", desc: "10. Sasih Kadasa (Vaisakha - Nyepi 1 Kadasa)" },
  { no: 11, nama: "Jyestha", desc: "11. Sasih Jyestha / Desta" },
  { no: 12, nama: "Asadha", desc: "12. Sasih Asadha / Sada" }
];

interface SakaNyepiAnchor {
  sakaYear: number;
  yearM: number;
  monthM: number; // 1-12
  dayM: number;
}

const SAKA_NYEPI_ANCHORS: SakaNyepiAnchor[] = [
  { sakaYear: 1946, yearM: 2024, monthM: 3, dayM: 11 },
  { sakaYear: 1947, yearM: 2025, monthM: 3, dayM: 29 },
  { sakaYear: 1948, yearM: 2026, monthM: 3, dayM: 19 },
  { sakaYear: 1949, yearM: 2027, monthM: 3, dayM: 8 },
  { sakaYear: 1950, yearM: 2028, monthM: 3, dayM: 26 }
];

export function getSakaDate(date: Date, hijri?: HijriDate): SakaDate {
  const targetMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

  // Cari anchor Nyepi terdekat
  let closestNyepi = SAKA_NYEPI_ANCHORS[2]; // Default 2026
  let minDiff = Infinity;
  for (const anchor of SAKA_NYEPI_ANCHORS) {
    const nyepiUtc = Date.UTC(anchor.yearM, anchor.monthM - 1, anchor.dayM);
    const diff = targetMidnight - nyepiUtc;
    if (diff >= -86400000 * 30 && diff < 86400000 * 365) {
      closestNyepi = anchor;
      break;
    }
  }

  const nyepiUtc = Date.UTC(closestNyepi.yearM, closestNyepi.monthM - 1, closestNyepi.dayM);
  const diffDaysFromNyepi = Math.floor((targetMidnight - nyepiUtc) / 86400000);

  // Nyepi adalah tanggal 1 Sasih Kadasa (indeks ke-9 dari 0..11)
  const approxSasihDays = 29.53;
  let sasihOffset = Math.floor(diffDaysFromNyepi / approxSasihDays);
  let rawSasihIdx = 9 + sasihOffset; // 9 = Kadasa
  let yearSaka = closestNyepi.sakaYear;

  while (rawSasihIdx < 0) {
    rawSasihIdx += 12;
    yearSaka -= 1;
  }
  while (rawSasihIdx >= 12) {
    rawSasihIdx -= 12;
    if (rawSasihIdx >= 9) {
      yearSaka += 1;
    }
  }

  const sasihIndex = rawSasihIdx;
  const sasihObj = SASIH_SAKA[sasihIndex] || SASIH_SAKA[9];

  // Hari dalam Sasih (1 - 30)
  const daysInSasihRaw = Math.floor(diffDaysFromNyepi - (sasihOffset * approxSasihDays));
  const dayInSasih = (((daysInSasihRaw % 30) + 30) % 30) + 1;

  // Fase Bulan: Suklapaksa (Penanggal 1-15) & Kresnapaksa (Panglong 1-15)
  let faseBulan: 'Penanggal' | 'Panglong' | 'Purnama' | 'Tilem' = 'Penanggal';
  let faseBulanHari = dayInSasih;

  if (dayInSasih === 15) {
    faseBulan = 'Purnama';
    faseBulanHari = 15;
  } else if (dayInSasih === 30) {
    faseBulan = 'Tilem';
    faseBulanHari = 15;
  } else if (dayInSasih > 15) {
    faseBulan = 'Panglong';
    faseBulanHari = dayInSasih - 15;
  } else {
    faseBulan = 'Penanggal';
    faseBulanHari = dayInSasih;
  }

  return {
    day: dayInSasih,
    sasihIndex,
    sasihName: sasihObj.nama,
    year: yearSaka,
    faseBulan,
    faseBulanHari
  };
}

export const SAKA_EVENTS: Record<number, Array<{ day: number; title: string; isHoliday: boolean }>> = {
  8: [ // Sasih Kasanga (Bulan ke-9)
    { day: 29, title: "Tawur Agung Kesanga & Pawai Ogoh-Ogoh (Pengerupukan)", isHoliday: false },
    { day: 30, title: "Hari Pengerupukan / Tilem Kasanga (Pembersihan Alam Semesta)", isHoliday: false }
  ],
  9: [ // Sasih Kadasa (Bulan ke-10)
    { day: 1, title: "Hari Raya Nyepi (Tahun Baru Saka 1 Kadasa)", isHoliday: true },
    { day: 2, title: "Ngembak Geni (Hari Silaturahmi & Dharma Santi Nyepi)", isHoliday: false },
    { day: 15, title: "Purnama Kadasa (Piodalan Pura Penataran Agung)", isHoliday: false }
  ]
};

// ==========================================
// 4. ANCHORS FALAK SULLAMUN NAYYIRAIN
// ==========================================
interface FalakMonthAnchor {
  yearH: number;
  monthIdx: number;
  monthName: string;
  startYearM: number;
  startMonthM: number;
  startDayM: number;
}

const SULAM_MONTH_ANCHORS: FalakMonthAnchor[] = [
  // 1446 H
  { yearH: 1446, monthIdx: 0, monthName: "Muharram", startYearM: 2024, startMonthM: 7, startDayM: 7 },
  { yearH: 1446, monthIdx: 1, monthName: "Safar", startYearM: 2024, startMonthM: 8, startDayM: 6 },
  { yearH: 1446, monthIdx: 2, monthName: "Rabiul Awal", startYearM: 2024, startMonthM: 9, startDayM: 5 },
  { yearH: 1446, monthIdx: 3, monthName: "Rabiul Akhir", startYearM: 2024, startMonthM: 10, startDayM: 5 },
  { yearH: 1446, monthIdx: 4, monthName: "Jumadil Awal", startYearM: 2024, startMonthM: 11, startDayM: 3 },
  { yearH: 1446, monthIdx: 5, monthName: "Jumadil Akhir", startYearM: 2024, startMonthM: 12, startDayM: 3 },
  { yearH: 1446, monthIdx: 6, monthName: "Rajab", startYearM: 2025, startMonthM: 1, startDayM: 1 },
  { yearH: 1446, monthIdx: 7, monthName: "Syaban", startYearM: 2025, startMonthM: 1, startDayM: 31 },
  { yearH: 1446, monthIdx: 8, monthName: "Ramadhan", startYearM: 2025, startMonthM: 3, startDayM: 1 },
  { yearH: 1446, monthIdx: 9, monthName: "Syawal", startYearM: 2025, startMonthM: 3, startDayM: 31 },
  { yearH: 1446, monthIdx: 10, monthName: "Zulqadah", startYearM: 2025, startMonthM: 4, startDayM: 29 },
  { yearH: 1446, monthIdx: 11, monthName: "Zulhijah", startYearM: 2025, startMonthM: 5, startDayM: 28 },

  // 1447 H - Autentik Almansuriyah
  { yearH: 1447, monthIdx: 0, monthName: "Muharram", startYearM: 2025, startMonthM: 6, startDayM: 26 },
  { yearH: 1447, monthIdx: 1, monthName: "Safar", startYearM: 2025, startMonthM: 7, startDayM: 26 },
  { yearH: 1447, monthIdx: 2, monthName: "Rabiul Awal", startYearM: 2025, startMonthM: 8, startDayM: 24 },
  { yearH: 1447, monthIdx: 3, monthName: "Rabiul Akhir", startYearM: 2025, startMonthM: 9, startDayM: 23 },
  { yearH: 1447, monthIdx: 4, monthName: "Jumadil Awal", startYearM: 2025, startMonthM: 10, startDayM: 22 },
  { yearH: 1447, monthIdx: 5, monthName: "Jumadil Akhir", startYearM: 2025, startMonthM: 11, startDayM: 21 },
  { yearH: 1447, monthIdx: 6, monthName: "Rajab", startYearM: 2025, startMonthM: 12, startDayM: 21 },
  { yearH: 1447, monthIdx: 7, monthName: "Syaban", startYearM: 2026, startMonthM: 1, startDayM: 19 },
  { yearH: 1447, monthIdx: 8, monthName: "Ramadhan", startYearM: 2026, startMonthM: 2, startDayM: 18 },
  { yearH: 1447, monthIdx: 9, monthName: "Syawal", startYearM: 2026, startMonthM: 3, startDayM: 20 },
  { yearH: 1447, monthIdx: 10, monthName: "Zulqadah", startYearM: 2026, startMonthM: 4, startDayM: 18 },
  { yearH: 1447, monthIdx: 11, monthName: "Zulhijah", startYearM: 2026, startMonthM: 5, startDayM: 17 },

  // 1448 H - Autentik Hisab Kitab Sullamun Nayyirain
  { yearH: 1448, monthIdx: 0, monthName: "Muharram", startYearM: 2026, startMonthM: 6, startDayM: 16 },
  { yearH: 1448, monthIdx: 1, monthName: "Safar", startYearM: 2026, startMonthM: 7, startDayM: 15 },
  { yearH: 1448, monthIdx: 2, monthName: "Rabiul Awal", startYearM: 2026, startMonthM: 8, startDayM: 13 },
  { yearH: 1448, monthIdx: 3, monthName: "Rabiul Akhir", startYearM: 2026, startMonthM: 9, startDayM: 12 },
  { yearH: 1448, monthIdx: 4, monthName: "Jumadil Awal", startYearM: 2026, startMonthM: 10, startDayM: 12 },
  { yearH: 1448, monthIdx: 5, monthName: "Jumadil Akhir", startYearM: 2026, startMonthM: 11, startDayM: 10 },
  { yearH: 1448, monthIdx: 6, monthName: "Rajab", startYearM: 2026, startMonthM: 12, startDayM: 10 },
  { yearH: 1448, monthIdx: 7, monthName: "Syaban", startYearM: 2027, startMonthM: 1, startDayM: 8 },
  { yearH: 1448, monthIdx: 8, monthName: "Ramadhan", startYearM: 2027, startMonthM: 2, startDayM: 7 },
  { yearH: 1448, monthIdx: 9, monthName: "Syawal", startYearM: 2027, startMonthM: 3, startDayM: 9 },
  { yearH: 1448, monthIdx: 10, monthName: "Zulqadah", startYearM: 2027, startMonthM: 4, startDayM: 8 },
  { yearH: 1448, monthIdx: 11, monthName: "Zulhijah", startYearM: 2027, startMonthM: 5, startDayM: 7 },

  // 1449 H
  { yearH: 1449, monthIdx: 0, monthName: "Muharram", startYearM: 2027, startMonthM: 6, startDayM: 5 },
  { yearH: 1449, monthIdx: 1, monthName: "Safar", startYearM: 2027, startMonthM: 7, startDayM: 5 },
  { yearH: 1449, monthIdx: 2, monthName: "Rabiul Awal", startYearM: 2027, startMonthM: 8, startDayM: 3 },
  { yearH: 1449, monthIdx: 3, monthName: "Rabiul Akhir", startYearM: 2027, startMonthM: 9, startDayM: 1 },
  { yearH: 1449, monthIdx: 4, monthName: "Jumadil Awal", startYearM: 2027, startMonthM: 10, startDayM: 1 },
  { yearH: 1449, monthIdx: 5, monthName: "Jumadil Akhir", startYearM: 2027, startMonthM: 10, startDayM: 30 },
  { yearH: 1449, monthIdx: 6, monthName: "Rajab", startYearM: 2027, startMonthM: 11, startDayM: 29 },
  { yearH: 1449, monthIdx: 7, monthName: "Syaban", startYearM: 2027, startMonthM: 12, startDayM: 29 },
  { yearH: 1449, monthIdx: 8, monthName: "Ramadhan", startYearM: 2028, startMonthM: 1, startDayM: 27 },
  { yearH: 1449, monthIdx: 9, monthName: "Syawal", startYearM: 2028, startMonthM: 2, startDayM: 26 },
  { yearH: 1449, monthIdx: 10, monthName: "Zulqadah", startYearM: 2028, startMonthM: 3, startDayM: 27 },
  { yearH: 1449, monthIdx: 11, monthName: "Zulhijah", startYearM: 2028, startMonthM: 4, startDayM: 26 },

  // 1450 H
  { yearH: 1450, monthIdx: 0, monthName: "Muharram", startYearM: 2028, startMonthM: 5, startDayM: 26 }
];

const SULAM_ANCHOR_TIMES = SULAM_MONTH_ANCHORS.map(a => ({
  ...a,
  startTime: Date.UTC(a.startYearM, a.startMonthM - 1, a.startDayM)
})).sort((a, b) => a.startTime - b.startTime);

export function getHijriDate(date: Date, adjustmentDays: number = 0): HijriDate {
  const targetMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) + (adjustmentDays * 86400000);

  let foundIdx = -1;
  for (let i = SULAM_ANCHOR_TIMES.length - 1; i >= 0; i--) {
    if (targetMidnight >= SULAM_ANCHOR_TIMES[i].startTime) {
      foundIdx = i;
      break;
    }
  }

  if (foundIdx !== -1) {
    const anchor = SULAM_ANCHOR_TIMES[foundIdx];
    const diffDays = Math.floor((targetMidnight - anchor.startTime) / 86400000);
    const day = diffDays + 1;
    return {
      day: day,
      month: anchor.monthIdx,
      year: anchor.yearH,
      monthName: BULAN_HIJRIYAH[anchor.monthIdx] || anchor.monthName
    };
  }

  const jd = Math.floor((targetMidnight / 86400000) + 2440587.5);
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l) / 5316)) * (Math.floor(50 * l / 17719)) + (Math.floor(l / 5670)) * (Math.floor(43 * l / 15238));
  l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = Math.floor(30 * n + j - 30);
  const normalizedMonth = Math.max(0, Math.min(11, month - 1));

  return {
    day: day,
    month: normalizedMonth,
    year: year,
    monthName: BULAN_HIJRIYAH[normalizedMonth] || BULAN_HIJRIYAH[0]
  };
}

export function getJawaDate(date: Date, hijri: HijriDate): JawaDate {
  const jawaYear = hijri.year + 512;
  const monthIdx = Math.max(0, Math.min(11, hijri.month));
  const jawaMonth = BULAN_JAWA[monthIdx] || BULAN_JAWA[0];
  const winduIdx = Math.abs(jawaYear % 4);
  return {
    day: hijri.day,
    monthName: jawaMonth,
    year: jawaYear,
    windu: WINDU_LIST[winduIdx]
  };
}

export function getPasaran(date: Date): string {
  const dUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const baseUtc = Date.UTC(1900, 0, 1);
  const diffDays = Math.floor((dUtc - baseUtc) / 86400000);
  const pasaranIndex = (((diffDays + 1) % 5) + 5) % 5;
  return PASARAN_LIST[pasaranIndex];
}

export function getNeptuInfo(date: Date, pasaran: string): NeptuInfo {
  const dayOfWeek = date.getDay();
  const namaHari = NAMA_HARI[dayOfWeek];
  const neptuHari = NEPTU_HARI[dayOfWeek] ?? 5;
  const neptuPasaran = NEPTU_PASARAN[pasaran] ?? 5;
  const totalNeptu = neptuHari + neptuPasaran;
  const weton = `${namaHari} ${pasaran}`;

  return {
    hari: namaHari,
    pasaran: pasaran,
    neptuHari,
    neptuPasaran,
    totalNeptu,
    weton
  };
}

export function checkAyyamulBidh(hijri: HijriDate): boolean {
  if (hijri.month === 11 && hijri.day === 13) {
    return false; // 13 Dzulhijjah is Hari Tasyrik
  }
  return hijri.day === 13 || hijri.day === 14 || hijri.day === 15;
}

export function checkHaramPuasa(hijri: HijriDate): boolean {
  if (hijri.month === 9 && hijri.day === 1) return true; // 1 Syawal (Idul Fitri)
  if (hijri.month === 11 && [10, 11, 12, 13].includes(hijri.day)) return true; // 10 Dzulhijjah & Tasyrik
  return false;
}

export function checkSeninKamis(dayOfWeek: number, isHaramPuasa: boolean): boolean {
  if (isHaramPuasa) return false;
  return dayOfWeek === 1 || dayOfWeek === 4;
}

// ==========================================
// 5. DATABASE HARI BESAR & PERINGATAN RESMI
// ==========================================

// Peringatan Nasional & Internasional Masehi
export const EVENT_DATABASE_MASEHI: Record<number, Array<{ day: number; title: string; isHoliday: boolean }>> = {
  1: [
    { day: 1, title: "Tahun Baru Masehi", isHoliday: true },
    { day: 10, title: "Hari Gerakan Satu Juta Pohon", isHoliday: false },
    { day: 25, title: "Hari Gizi Nasional", isHoliday: false }
  ],
  2: [
    { day: 9, title: "Hari Pers Nasional", isHoliday: false },
    { day: 14, title: "Hari Kasih Sayang (Valentine)", isHoliday: false },
    { day: 21, title: "Hari Peduli Sampah Nasional", isHoliday: false }
  ],
  3: [
    { day: 8, title: "Hari Perempuan Internasional", isHoliday: false },
    { day: 9, title: "Hari Musik Nasional", isHoliday: false },
    { day: 22, title: "Hari Air Sedunia", isHoliday: false },
    { day: 30, title: "Hari Film Nasional", isHoliday: false }
  ],
  4: [
    { day: 21, title: "Hari Kartini", isHoliday: false },
    { day: 22, title: "Hari Bumi", isHoliday: false },
    { day: 28, title: "Hari Puisi Nasional", isHoliday: false }
  ],
  5: [
    { day: 1, title: "Hari Buruh Internasional (May Day)", isHoliday: true },
    { day: 2, title: "Hari Pendidikan Nasional (Hardiknas)", isHoliday: false },
    { day: 20, title: "Hari Kebangkitan Nasional (Harkitnas)", isHoliday: false }
  ],
  6: [
    { day: 1, title: "Hari Lahir Pancasila", isHoliday: true },
    { day: 5, title: "Hari Lingkungan Hidup Sedunia", isHoliday: false },
    { day: 21, title: "Hari Krida Pertanian", isHoliday: false }
  ],
  7: [
    { day: 22, title: "Hari Kejaksaan", isHoliday: false },
    { day: 23, title: "Hari Anak Nasional", isHoliday: false }
  ],
  8: [
    { day: 10, title: "Hari Veteran Nasional", isHoliday: false },
    { day: 14, title: "Hari Pramuka", isHoliday: false },
    { day: 17, title: "Hari Kemerdekaan RI (HUT RI)", isHoliday: true }
  ],
  9: [
    { day: 9, title: "Hari Olahraga Nasional (Haornas)", isHoliday: false },
    { day: 17, title: "Hari Palang Merah Indonesia (PMI)", isHoliday: false },
    { day: 24, title: "Hari Tani Nasional", isHoliday: false },
    { day: 28, title: "Hari Kereta Api", isHoliday: false }
  ],
  10: [
    { day: 1, title: "Hari Kesaktian Pancasila", isHoliday: false },
    { day: 2, title: "Hari Batik Nasional", isHoliday: false },
    { day: 5, title: "Hari Tentara Nasional Indonesia (TNI)", isHoliday: false },
    { day: 22, title: "Hari Santri Nasional", isHoliday: false },
    { day: 28, title: "Hari Sumpah Pemuda", isHoliday: false }
  ],
  11: [
    { day: 10, title: "Hari Pahlawan", isHoliday: false },
    { day: 12, title: "Hari Kesehatan Nasional / Hari Ayah", isHoliday: false },
    { day: 25, title: "Hari Guru Nasional", isHoliday: false },
    { day: 28, title: "Hari Menanam Pohon Indonesia", isHoliday: false }
  ],
  12: [
    { day: 1, title: "Hari AIDS Sedunia", isHoliday: false },
    { day: 4, title: "Hari Artileri", isHoliday: false },
    { day: 9, title: "Hari Anti Korupsi Sedunia", isHoliday: false },
    { day: 13, title: "Hari Nusantara", isHoliday: false },
    { day: 22, title: "Hari Ibu Nasional", isHoliday: false },
    { day: 25, title: "Hari Raya Natal", isHoliday: true }
  ]
};

// Peringatan Resmi Islam Hijriyah (0-11)
export const ISLAMIC_EVENTS: Record<number, Array<{ day: number; title: string; isHoliday: boolean }>> = {
  0: [ // Muharram
    { day: 1, title: "Tahun Baru Islam (1 Muharram)", isHoliday: true },
    { day: 9, title: "Puasa Tasu'a (9 Muharram)", isHoliday: false },
    { day: 10, title: "Hari Asyura (10 Muharram)", isHoliday: false }
  ],
  1: [ // Safar
    { day: 28, title: "Rebo Wekasan / Doa Tolak Bala Akhir Safar", isHoliday: false }
  ],
  2: [ // Rabiul Awal
    { day: 12, title: "Maulid Nabi Muhammad SAW", isHoliday: true }
  ],
  6: [ // Rajab
    { day: 27, title: "Isra' Mi'raj Nabi Muhammad SAW", isHoliday: true }
  ],
  7: [ // Sya'ban
    { day: 15, title: "Malam Nisfu Sya'ban", isHoliday: false }
  ],
  8: [ // Ramadhan
    { day: 1, title: "Awal Puasa Ramadhan", isHoliday: false },
    { day: 17, title: "Nuzulul Qur'an (17 Ramadhan)", isHoliday: false },
    { day: 21, title: "Malam Lailatul Qadar (21 Ramadhan)", isHoliday: false },
    { day: 23, title: "Malam Lailatul Qadar (23 Ramadhan)", isHoliday: false },
    { day: 25, title: "Malam Lailatul Qadar (25 Ramadhan)", isHoliday: false },
    { day: 27, title: "Malam Lailatul Qadar (27 Ramadhan)", isHoliday: false },
    { day: 29, title: "Malam Lailatul Qadar (29 Ramadhan)", isHoliday: false }
  ],
  9: [ // Syawal
    { day: 1, title: "Hari Raya Idul Fitri (1 Syawal)", isHoliday: true },
    { day: 2, title: "Hari Raya Idul Fitri (2 Syawal)", isHoliday: true },
    { day: 8, title: "Awal Puasa Sunnah Syawal 6 Hari", isHoliday: false }
  ],
  11: [ // Dzulhijjah
    { day: 8, title: "Hari Tarwiyah (8 Dzulhijjah)", isHoliday: false },
    { day: 9, title: "Hari Arafah / Puasa Arafah (9 Dzulhijjah)", isHoliday: false },
    { day: 10, title: "Hari Raya Idul Adha (10 Dzulhijjah)", isHoliday: true },
    { day: 11, title: "Hari Tasyrik (11 Dzulhijjah)", isHoliday: false },
    { day: 12, title: "Hari Tasyrik (12 Dzulhijjah)", isHoliday: false },
    { day: 13, title: "Hari Tasyrik (13 Dzulhijjah)", isHoliday: false }
  ]
};

// Peringatan Tradisi Adat Budaya Jawa Sultan Agungan (Berdasarkan Bulan Jawa 0-11)
export const JAWA_EVENTS: Record<number, Array<{ day: number; title: string; isHoliday: boolean }>> = {
  0: [ // Suro
    { day: 1, title: "Tahun Baru Jawa 1 Suro (Malam 1 Suro / Kirab Pusaka Karaton)", isHoliday: true },
    { day: 10, title: "Tradisi Bubur Suro (Asyura Kejawen)", isHoliday: false }
  ],
  1: [ // Sapar
    { day: 28, title: "Rebo Pungkasan / Rebo Wekasan Sapar (Upacara Tradisi Tolak Bala)", isHoliday: false }
  ],
  2: [ // Mulud
    { day: 12, title: "Grebeg Mulud (Hajad Dalem Sekaten Karaton Ngayogyakarta & Surakarta)", isHoliday: true }
  ],
  6: [ // Rejeb
    { day: 27, title: "Rejeban (Tradisi Peringatan Isra Mi'raj Jawa)", isHoliday: false }
  ],
  7: [ // Ruwah
    { day: 15, title: "Ruwahan & Sadranan (Tradisi Nyadran Ziarah Kubur Leluhur)", isHoliday: false }
  ],
  8: [ // Pasa
    { day: 1, title: "Awal Pasa Kejawen (Bulan Suci Pasa)", isHoliday: false },
    { day: 17, title: "Malem Pitulasan (Peringatan Nuzulul Qur'an Jawa)", isHoliday: false },
    { day: 21, title: "Malem Selikuran (Hajad Dalem Tumpengan Karaton)", isHoliday: false }
  ],
  9: [ // Sawal
    { day: 1, title: "Grebeg Sawal (Bakda Idul Fitri Karaton)", isHoliday: true },
    { day: 8, title: "Bakda Kupat (Tradisi Kupatan Jawa)", isHoliday: false }
  ],
  11: [ // Besar
    { day: 10, title: "Grebeg Besar (Bakda Idul Adha Karaton)", isHoliday: true }
  ]
};

// ==========================================
// 6. HELPER PENGAMBILAN EVENT ADAPTIF SESUAI MODE
// ==========================================
/**
 * Mengambil agenda & peringatan untuk tanggal tertentu sesuai Mode Kalender yang dipilih:
 * - 'hijriyah': HANYA peristiwa Hijriyah/Islam (TIDAK ADA Masehi seperti Hari Pers Nasional!)
 * - 'jawa': HANYA tradisi Jawa & Hijriyah (TIDAK ADA Masehi seperti Hari Pers Nasional!)
 * - 'julian': HANYA penanda Kalender Julian
 * - 'tionghoa': HANYA festival tradisi Tionghoa (Imlek, Cap Go Meh, Ceng Beng, dll)
 * - 'saka': HANYA hari suci Kalender Saka (Nyepi, Galungan, Purnama, Tilem)
 * - 'masehi': Hari libur & peringatan Masehi Nasional
 * - 'lengkap': Seluruh peringatan lintas budaya dengan identitas masing-masing
 */
export function getEventsForDate(
  date: Date, 
  hijri: HijriDate, 
  mode: CalendarViewMode = 'lengkap'
): CalendarEventItem[] {
  const events: CalendarEventItem[] = [];
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  const dateStr = date.toISOString().split('T')[0];

  // Helper Masehi
  const pushMasehi = () => {
    const masehiList = EVENT_DATABASE_MASEHI[month] || [];
    for (const m of masehiList) {
      if (m.day === day) {
        events.push({
          id: `masehi-${month}-${day}-${m.title}`,
          title: m.title,
          dateStr,
          type: m.isHoliday ? 'national_holiday' : 'observance',
          isHoliday: m.isHoliday,
          origin: 'masehi'
        });
      }
    }
  };

  // Helper Hijriyah
  const pushIslamic = () => {
    const islamicList = ISLAMIC_EVENTS[hijri.month] || [];
    for (const isl of islamicList) {
      if (isl.day === hijri.day) {
        events.push({
          id: `hijri-${hijri.month}-${hijri.day}-${isl.title}`,
          title: isl.title,
          dateStr,
          type: 'islamic',
          isHoliday: isl.isHoliday,
          origin: 'hijriyah'
        });
      }
    }
    // Puasa Sunnah Ayyamul Bidh
    if (checkAyyamulBidh(hijri)) {
      events.push({
        id: `hijri-ayyam-${hijri.month}-${hijri.day}`,
        title: `Puasa Ayyamul Bidh (${hijri.day} ${hijri.monthName})`,
        dateStr,
        type: 'puasa',
        isHoliday: false,
        origin: 'hijriyah'
      });
    }
  };

  // Helper Jawa
  const pushJawa = () => {
    const jawaList = JAWA_EVENTS[hijri.month] || [];
    for (const j of jawaList) {
      if (j.day === hijri.day) {
        events.push({
          id: `jawa-${hijri.month}-${hijri.day}-${j.title}`,
          title: j.title,
          dateStr,
          type: 'jawa',
          isHoliday: j.isHoliday,
          origin: 'jawa'
        });
      }
    }
  };

  // Helper Julian
  const pushJulian = () => {
    const jul = getJulianDate(date);
    for (const jEv of JULIAN_EVENTS) {
      if (jEv.julianMonth === jul.month && jEv.julianDay === jul.day) {
        events.push({
          id: `julian-${jul.month}-${jul.day}-${jEv.title}`,
          title: jEv.title,
          dateStr,
          type: 'julian',
          isHoliday: jEv.isHoliday,
          origin: 'julian'
        });
      }
    }
  };

  // Helper Tionghoa
  const pushTionghoa = () => {
    const tiong = getTionghoaDate(date);
    const tList = TIONGHOA_EVENTS[tiong.month] || [];
    for (const t of tList) {
      if (t.day === tiong.day) {
        events.push({
          id: `tionghoa-${tiong.month}-${tiong.day}-${t.title}`,
          title: t.title,
          dateStr,
          type: 'tionghoa',
          isHoliday: t.isHoliday,
          origin: 'tionghoa'
        });
      }
    }
    // Perayaan Solar Terms Tionghoa: Ceng Beng & Dongzhi
    if (month === 4 && (day === 4 || day === 5)) {
      events.push({
        id: `tionghoa-cengbeng-${day}`,
        title: "Hari Ceng Beng / Qingming (Ziarah Makam Leluhur Tionghoa)",
        dateStr,
        type: 'tionghoa',
        isHoliday: false,
        origin: 'tionghoa'
      });
    }
    if (month === 12 && (day === 21 || day === 22)) {
      events.push({
        id: `tionghoa-dongzhi-${day}`,
        title: "Festival Dongzhi (Perayaan Titik Balik Matahari Musim Dingin & Ronde)",
        dateStr,
        type: 'tionghoa',
        isHoliday: false,
        origin: 'tionghoa'
      });
    }
  };

  // Helper Saka
  const pushSaka = () => {
    const saka = getSakaDate(date, hijri);
    const sList = SAKA_EVENTS[saka.sasihIndex] || [];
    for (const s of sList) {
      if (s.day === saka.day) {
        events.push({
          id: `saka-${saka.sasihIndex}-${saka.day}-${s.title}`,
          title: s.title,
          dateStr,
          type: 'saka',
          isHoliday: s.isHoliday,
          origin: 'saka'
        });
      }
    }
    if (saka.faseBulan === 'Purnama') {
      events.push({
        id: `saka-purnama-${saka.sasihName}`,
        title: `Rahina Purnama (${saka.sasihName})`,
        dateStr,
        type: 'saka',
        isHoliday: false,
        origin: 'saka'
      });
    } else if (saka.faseBulan === 'Tilem') {
      events.push({
        id: `saka-tilem-${saka.sasihName}`,
        title: `Rahina Tilem (${saka.sasihName})`,
        dateStr,
        type: 'saka',
        isHoliday: false,
        origin: 'saka'
      });
    }
  };

  // ATURAN TEGAS SESUAI INSTRUKSI PENGGUNA:
  if (mode === 'hijriyah') {
    // Pada kalender hijriyah keterangan peringatan dan agenda hanya yang hijriyah !
    pushIslamic();
    return events;
  }

  if (mode === 'jawa') {
    // Pada kalender jawa keterangan peringatan dan agenda hanya yang jawa dan hijriyah !
    pushJawa();
    pushIslamic();
    return events;
  }

  if (mode === 'julian') {
    pushJulian();
    return events;
  }

  if (mode === 'tionghoa') {
    pushTionghoa();
    return events;
  }

  if (mode === 'saka') {
    pushSaka();
    return events;
  }

  if (mode === 'masehi') {
    pushMasehi();
    return events;
  }

  // Default: mode === 'lengkap'
  pushMasehi();
  pushIslamic();
  pushJawa();
  pushTionghoa();
  pushSaka();
  pushJulian();

  return events;
}

/**
 * Mendapatkan tanggal awal (tanggal 1) dan jumlah hari untuk bulan Hijriyah tertentu
 * berdasarkan hisab Kitab Sullamun Nayyirain.
 */
export function getHijriMonthRange(yearH: number, monthH: number): { startDate: Date; daysInMonth: number } {
  const idx = SULAM_MONTH_ANCHORS.findIndex(a => a.yearH === yearH && a.monthIdx === monthH);
  if (idx !== -1) {
    const a = SULAM_MONTH_ANCHORS[idx];
    const startDate = new Date(a.startYearM, a.startMonthM - 1, a.startDayM);
    let daysInMonth = 30;
    if (idx + 1 < SULAM_MONTH_ANCHORS.length) {
      const nextA = SULAM_MONTH_ANCHORS[idx + 1];
      const startT = Date.UTC(a.startYearM, a.startMonthM - 1, a.startDayM);
      const nextT = Date.UTC(nextA.startYearM, nextA.startMonthM - 1, nextA.startDayM);
      daysInMonth = Math.round((nextT - startT) / 86400000);
    } else {
      daysInMonth = 29;
    }
    return { startDate, daysInMonth };
  }

  // Fallback astronomis
  const approxMYear = Math.floor(yearH * 0.970224 + 621.57);
  const approxDate = new Date(approxMYear, monthH, 15);
  let foundDate = new Date(approxDate);
  for (let offset = -90; offset <= 90; offset++) {
    const testDate = new Date(approxDate.getTime() + offset * 86400000);
    const h = getHijriDate(testDate);
    if (h.year === yearH && h.month === monthH && h.day === 1) {
      foundDate = testDate;
      break;
    }
  }

  let daysInMonth = 29;
  for (let d = 1; d <= 32; d++) {
    const testDate = new Date(foundDate.getTime() + d * 86400000);
    const h = getHijriDate(testDate);
    if (h.month !== monthH || h.year !== yearH) {
      daysInMonth = d;
      break;
    }
  }

  return { startDate: foundDate, daysInMonth };
}

/**
 * Mendapatkan tanggal awal (tanggal 1) dan jumlah hari untuk bulan Julian tertentu.
 * Menjamin penanggalan Julian dimulai dari tanggal 1 (1 Januarius, 1 Februarius, dst).
 */
export function getJulianMonthRange(yearJ: number, monthJ: number): { startDate: Date; daysInMonth: number } {
  let daysInMonth = 31;
  if (monthJ === 2) {
    daysInMonth = (yearJ % 4 === 0) ? 29 : 28;
  } else if ([4, 6, 9, 11].includes(monthJ)) {
    daysInMonth = 30;
  }

  // Konversi Julian (yearJ, monthJ, day 1) ke Julian Day Number (JDN)
  const a = Math.floor((14 - monthJ) / 12);
  const y = yearJ + 4800 - a;
  const m = monthJ + 12 * a - 3;
  const jdn = 1 + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;

  // Konversi JDN ke waktu UTC
  const midnightUtc = (jdn - 2440588) * 86400000;
  const startDate = new Date(midnightUtc);

  return { startDate, daysInMonth };
}

/**
 * Mendapatkan tanggal awal (tanggal 1 初一 / Ce It) dan jumlah hari untuk bulan Tionghoa tertentu.
 * Menjamin kalender Tionghoa dimulai dari tanggal 1 初一 (Ce It) s.d. 29/30 (Cap Go di tgl 15).
 */
export function getTionghoaMonthRange(yearKongzili: number, monthTionghoa: number): { startDate: Date; daysInMonth: number } {
  const idx = CHINESE_MONTH_ANCHORS.findIndex(
    a => a.kongziliYear === yearKongzili && a.monthNum === monthTionghoa
  );

  if (idx !== -1) {
    const a = CHINESE_MONTH_ANCHORS[idx];
    const startDate = new Date(a.startYearM, a.startMonthM - 1, a.startDayM);
    let daysInMonth = 30;
    if (idx + 1 < CHINESE_MONTH_ANCHORS.length) {
      const nextA = CHINESE_MONTH_ANCHORS[idx + 1];
      const startT = Date.UTC(a.startYearM, a.startMonthM - 1, a.startDayM);
      const nextT = Date.UTC(nextA.startYearM, nextA.startMonthM - 1, nextA.startDayM);
      daysInMonth = Math.round((nextT - startT) / 86400000);
    } else {
      daysInMonth = 29;
    }
    return { startDate, daysInMonth };
  }

  // Fallback pencarian astronomis
  const approxMYear = yearKongzili - 551;
  const approxDate = new Date(approxMYear, monthTionghoa - 1, 15);
  let foundDate = new Date(approxDate);
  for (let offset = -90; offset <= 90; offset++) {
    const testDate = new Date(approxDate.getTime() + offset * 86400000);
    const t = getTionghoaDate(testDate);
    if (t.year === yearKongzili && t.month === monthTionghoa && t.day === 1) {
      foundDate = testDate;
      break;
    }
  }

  let daysInMonth = 30;
  for (let d = 1; d <= 32; d++) {
    const testDate = new Date(foundDate.getTime() + d * 86400000);
    const t = getTionghoaDate(testDate);
    if (t.month !== monthTionghoa || t.year !== yearKongzili) {
      daysInMonth = d;
      break;
    }
  }

  return { startDate: foundDate, daysInMonth };
}

/**
 * Mendapatkan tanggal awal (tanggal 1 Suklapaksa / Penanggal 1) dan jumlah hari untuk Sasih Saka tertentu.
 * Menjamin kalender Saka dimulai dari tanggal 1 Penanggal s.d. akhir Sasih (Tilem).
 */
export function getSakaMonthRange(yearSaka: number, sasihIdx: number): { startDate: Date; daysInMonth: number } {
  // Nyepi adalah tanggal 1 Sasih Kadasa (indeks ke-9)
  const closestNyepi = SAKA_NYEPI_ANCHORS.find(a => a.sakaYear === yearSaka) || {
    sakaYear: yearSaka,
    yearM: yearSaka + 78,
    monthM: 3,
    dayM: 20
  };

  const nyepiUtc = Date.UTC(closestNyepi.yearM, closestNyepi.monthM - 1, closestNyepi.dayM);

  // Urutan siklus sasih dalam tahun Saka mulai dari Nyepi (Kadasa):
  // [Kadasa(9), Jyestha(10), Asadha(11), Kasa(0), Karo(1), Katiga(2), Kapat(3), Kalima(4), Kanem(5), Kapitu(6), Kawolu(7), Kasanga(8)]
  let cycleMonth = sasihIdx >= 9 ? (sasihIdx - 9) : (sasihIdx + 3);

  const approxTime = nyepiUtc + Math.round(cycleMonth * 29.530588) * 86400000;
  let foundDate = new Date(approxTime);

  for (let offset = -4; offset <= 4; offset++) {
    const testDate = new Date(approxTime + offset * 86400000);
    const s = getSakaDate(testDate);
    if (s.sasihIndex === sasihIdx && s.day === 1) {
      foundDate = testDate;
      break;
    }
  }

  let daysInMonth = 30;
  for (let d = 1; d <= 32; d++) {
    const testDate = new Date(foundDate.getTime() + d * 86400000);
    const s = getSakaDate(testDate);
    if (s.sasihIndex !== sasihIdx) {
      daysInMonth = d;
      break;
    }
  }

  return { startDate: foundDate, daysInMonth };
}

