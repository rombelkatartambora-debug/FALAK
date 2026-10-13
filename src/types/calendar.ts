export interface HijriDate {
  day: number;
  month: number; // 0-indexed (0: Muharram .. 11: Dzulhijjah)
  year: number;
  monthName: string;
}

export interface JawaDate {
  day: number;
  monthName: string;
  year: number;
  windu?: string;
}

export interface JulianDate {
  day: number;
  month: number; // 1-12
  year: number;
  monthName: string;
  julianDayNumber: number; // JDN
}

export interface TionghoaDate {
  day: number;
  month: number; // 1-12
  monthName: string; // e.g. Cia Gwee, Ji Gwee
  chineseMonthName: string; // e.g. 正月, 二月
  chineseDayName: string; // e.g. 初一 (Ce It), 十五 (Cap Go)
  year: number; // e.g. 2577 Kongzili
  shio: string; // e.g. Kuda Api
  shioAnimal: string; // e.g. Kuda
  element: string; // e.g. Api
  isLeapMonth?: boolean;
}

export interface SakaDate {
  day: number;
  sasihIndex: number; // 0-11
  sasihName: string; // e.g. Kasa, Karo, Kasanga, Kadasa
  year: number; // e.g. 1948 Saka
  faseBulan: 'Penanggal' | 'Panglong' | 'Purnama' | 'Tilem';
  faseBulanHari: number; // 1-15
}

export interface NeptuInfo {
  hari: string;
  pasaran: string;
  neptuHari: number;
  neptuPasaran: number;
  totalNeptu: number;
  weton: string;
}

export type CalendarEventOrigin = 'masehi' | 'hijriyah' | 'jawa' | 'julian' | 'tionghoa' | 'saka';

export interface CalendarEventItem {
  id: string;
  title: string;
  description?: string;
  dateStr: string; // YYYY-MM-DD
  type: 'national_holiday' | 'observance' | 'islamic' | 'jawa' | 'julian' | 'tionghoa' | 'saka' | 'puasa' | 'google_calendar';
  isHoliday?: boolean; // Red date indicator
  origin?: CalendarEventOrigin;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
}

export interface PersonalNote {
  id: string;
  title: string;
  dateStr: string; // YYYY-MM-DD
  isDone?: boolean;
  createdAt: number;
}

export interface DayData {
  date: Date;
  dayNum: number;
  monthIdx: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeek: number; // 0 = Ahad, 1 = Senin, ..., 6 = Sabtu
  pasaran: string;
  hijri: HijriDate;
  jawa: JawaDate;
  julian?: JulianDate;
  tionghoa?: TionghoaDate;
  saka?: SakaDate;
  neptu: NeptuInfo;
  isAyyamulBidh: boolean;
  isSeninKamis: boolean;
  isHaramPuasa: boolean;
  holidays: CalendarEventItem[];
  googleEvents: GoogleCalendarEvent[];
  personalNotes: PersonalNote[];
  adminEvents?: AdminEvent[];
}

export type CalendarTheme = 'classic' | 'dark' | 'print' | 'batik' | 'islamic' | 'minimal' | 'keraton';

export type CalendarViewMode = 'lengkap' | 'masehi' | 'hijriyah' | 'jawa' | 'julian' | 'tionghoa' | 'saka';

export interface CalendarFilters {
  showAyyamulBidh: boolean;
  showSeninKamis: boolean;
  showHolidays: boolean;
  showGoogleEvents: boolean;
}

export interface PrayerTimes {
  imsak: string;
  subuh: string;
  terbit: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface CityLocation {
  id: string;
  name: string;
  province: string;
  lat: number;
  lng: number;
  timezone: number; // 7 (WIB), 8 (WITA), 9 (WIT)
}

// Kustom Kop Foto / Logo Kalender
export interface CalendarKop {
  enabled: boolean;
  title: string;
  subtitle: string;
  logoUrl?: string;
  contactInfo?: string;
  tagline?: string;
}

// Deteksi Long Weekend & Harpitnas
export interface LongWeekendItem {
  type: 'long_weekend' | 'harpitnas';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  holidayTitle: string;
  holidayDayName: string;
  recommendation: string;
  cutiDate?: string;
}

// Admin Announcements / Agenda Yayasan
export interface AdminEvent {
  id: string;
  title: string;
  dateStr: string; // YYYY-MM-DD
  description?: string;
  category: 'kegiatan' | 'pengumuman' | 'bakti_sosial' | 'pengajian';
  createdAt: number;
}

// Internal Auth Session (Admin & User)
export type UserRole = 'admin' | 'user';

export interface AuthSession {
  role: UserRole;
  username: string;
  displayName: string;
  loggedAt: number;
}

// Active Menu in Admin Dashboard
export type AdminMenuKey =
  | 'koordinat_astronomi'
  | 'catatan_pribadi'
  | 'risalah_1'
  | 'risalah_2'
  | 'risalah_3'
  | 'terjemah_sulam'
  | 'kalkulator_falak'
  | 'hisab_kiblat'
  | 'tabel_imsakiyah'
  | 'download'
  | 'cetak_ekspor';
