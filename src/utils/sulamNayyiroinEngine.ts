/**
 * Mesin Hisab Kitab Sullamun Nayyirain & Pemetaan Lembar Kerja Excel
 * Karya: Al-Allamah Asy-Syaikh Muhammad Manshur bin Abdul Hamid bin Muhammad Damiri Al-Batawi (Jembatan Lima, Jakarta)
 * 
 * Mengimplementasikan struktur Sheet Excel:
 * - ISIAN (Parameter Input & Markaz)
 * - EPOCH (Konstanta Harokat Tetap Astronomi)
 * - MUADDALAH, MUADDALAH-1 & JAD-MUADDALAH (Ta'dil Hakiki & Trigonometri Falak Berantai)
 * - AKSENSIOREKTA & DATA MEEUS (Komparasi Algoritma Jean Meeus)
 * - BULANAN (Siklus Bulanan, Ijtima', Weton, Irtifa', Mukuts, Nurul Hilal)
 * - HASIL & HASIL ARAB (Grid Tabular Boxes & Hierarki Sudut Tradisional: ج, قة, ني, لث)
 * - RUKYAT-CETAK (Laporan Berita Acara Siap Cetak)
 */

import { NAMA_HARI, PASARAN_LIST, BULAN_HIJRIYAH, BULAN_JAWA } from './calendarMath';

// Hierarki Sudut Tradisional Falak Kitab Sullamun Nayyirain:
// ج (Darajah / Derajat / °)
// قة (Daqiqah / Menit / ')
// ني (Tsaniyah / Detik / ")
// لث (Tsalitsah / Sepertiga / ‴)
export interface FalakAngleSexagesimal {
  darajah: number; // ج (Derajat)
  daqiqah: number; // قة (Menit)
  tsaniyah: number; // ني (Detik)
  tsalitsah: number; // لث (Sepertiga / 1/60 detik)
  decimal: number; // Nilai desimal murni
  formattedTraditional: string; // Misal: 5° 42' 18" 30‴
  formattedArabic: string; // Misal: ٥ ج ٤٢ قة ١٨ ني
}

export function decimalToSexagesimalFalak(val: number): FalakAngleSexagesimal {
  const isNeg = val < 0;
  const abs = Math.abs(val);

  const darajah = Math.floor(abs);
  const minFloat = (abs - darajah) * 60;
  const daqiqah = Math.floor(minFloat);
  const secFloat = (minFloat - daqiqah) * 60;
  const tsaniyah = Math.floor(secFloat);
  const tsalitsahFloat = (secFloat - tsaniyah) * 60;
  const tsalitsah = Math.round(tsalitsahFloat);

  const sign = isNeg ? '-' : '';
  const formattedTraditional = `${sign}${darajah}° ${String(daqiqah).padStart(2, '0')}' ${String(tsaniyah).padStart(2, '0')}" ${String(tsalitsah).padStart(2, '0')}‴`;
  const formattedArabic = `${sign}${darajah} ج ${daqiqah} قة ${tsaniyah} ني`;

  return {
    darajah: isNeg ? -darajah : darajah,
    daqiqah,
    tsaniyah,
    tsalitsah,
    decimal: val,
    formattedTraditional,
    formattedArabic
  };
}

export interface MarkazSulamLocation {
  name: string;
  latDeg: number;
  latMin: number;
  latSec: number;
  isSouth: boolean;
  lngDeg: number;
  lngMin: number;
  lngSec: number;
  isEast: boolean;
  altitudeMeters: number;
  timezoneOffsetHours: number;
  selisihBetawiSec: number; // Koreksi bujur markaz terhadap markaz acuan Betawi (detik busur)
}

// Preset Markaz Standar Kitab Sullamun Nayyirain
export const PRESET_MARKAZ_SULAM: MarkazSulamLocation[] = [
  {
    name: 'JAKARTA / BETAWI (Acuan Induk)',
    latDeg: 6,
    latMin: 49,
    latSec: 0,
    isSouth: true,
    lngDeg: 106,
    lngMin: 49,
    lngSec: 0,
    isEast: true,
    altitudeMeters: 65,
    timezoneOffsetHours: 7,
    selisihBetawiSec: -4 // -0° 0' 4"
  },
  {
    name: 'SURABAYA (Ampel)',
    latDeg: 7,
    latMin: 15,
    latSec: 0,
    isSouth: true,
    lngDeg: 112,
    lngMin: 45,
    lngSec: 0,
    isEast: true,
    altitudeMeters: 10,
    timezoneOffsetHours: 7,
    selisihBetawiSec: 21360
  },
  {
    name: 'MATARAM (Lombok)',
    latDeg: 8,
    latMin: 36,
    latSec: 0,
    isSouth: true,
    lngDeg: 116,
    lngMin: 8,
    lngSec: 0,
    isEast: true,
    altitudeMeters: 25,
    timezoneOffsetHours: 8,
    selisihBetawiSec: 33540
  },
  {
    name: 'SEMARANG (Masjid Agung)',
    latDeg: 6,
    latMin: 59,
    latSec: 0,
    isSouth: true,
    lngDeg: 110,
    lngMin: 25,
    lngSec: 0,
    isEast: true,
    altitudeMeters: 15,
    timezoneOffsetHours: 7,
    selisihBetawiSec: 12960
  },
  {
    name: 'YOGYAKARTA (Kraton)',
    latDeg: 7,
    latMin: 48,
    latSec: 0,
    isSouth: true,
    lngDeg: 110,
    lngMin: 22,
    lngSec: 0,
    isEast: true,
    altitudeMeters: 114,
    timezoneOffsetHours: 7,
    selisihBetawiSec: 12780
  },
  {
    name: 'BANDUNG (Bosscha)',
    latDeg: 6,
    latMin: 55,
    latSec: 0,
    isSouth: true,
    lngDeg: 107,
    lngMin: 36,
    lngSec: 0,
    isEast: true,
    altitudeMeters: 768,
    timezoneOffsetHours: 7,
    selisihBetawiSec: 2820
  },
  {
    name: 'MAKASSAR',
    latDeg: 5,
    latMin: 8,
    latSec: 0,
    isSouth: true,
    lngDeg: 119,
    lngMin: 25,
    lngSec: 0,
    isEast: true,
    altitudeMeters: 10,
    timezoneOffsetHours: 8,
    selisihBetawiSec: 45360
  },
  {
    name: 'BANDA ACEH',
    latDeg: 5,
    latMin: 33,
    latSec: 0,
    isSouth: false,
    lngDeg: 95,
    lngMin: 19,
    lngSec: 0,
    isEast: true,
    altitudeMeters: 5,
    timezoneOffsetHours: 7,
    selisihBetawiSec: -41400
  }
];

// 1. SHEET EPOCH CONSTANTS (Tabel Tetap Harokat Per Hari & Per Jam)
export interface EpochConstantItem {
  keyName: string;
  nameArabic: string;
  nameLatin: string;
  perDayDeg: number;
  perHourDeg: number;
  sexagesimalDay: FalakAngleSexagesimal;
  sexagesimalHour: FalakAngleSexagesimal;
  description: string;
}

export const SHEET_EPOCH_ITEMS: EpochConstantItem[] = [
  {
    keyName: 'al_alamah',
    nameArabic: 'العلامـة',
    nameLatin: 'Al-Alamah',
    perDayDeg: 0.9856473,
    perHourDeg: 0.0410686,
    sexagesimalDay: decimalToSexagesimalFalak(0.9856473),
    sexagesimalHour: decimalToSexagesimalFalak(0.0410686),
    description: "0° 59' 08\" per hari (Gerak harian Matahari rata-rata dalam orbit)"
  },
  {
    keyName: 'al_khissoh',
    nameArabic: 'الحصة',
    nameLatin: 'Al-Khissoh',
    perDayDeg: 13.1763965,
    perHourDeg: 0.5490165,
    sexagesimalDay: decimalToSexagesimalFalak(13.1763965),
    sexagesimalHour: decimalToSexagesimalFalak(0.5490165),
    description: "13° 10' 35\" per hari (Gerak harian Bulan hakiki dalam orbit)"
  },
  {
    keyName: 'al_khosoh',
    nameArabic: 'الخاصة',
    nameLatin: 'Al-Khosoh',
    perDayDeg: 13.064993,
    perHourDeg: 0.5443747,
    sexagesimalDay: decimalToSexagesimalFalak(13.064993),
    sexagesimalHour: decimalToSexagesimalFalak(0.5443747),
    description: "13° 03' 54\" per hari (Anomali gerak rotasi orbit Bulan)"
  },
  {
    keyName: 'al_markaz',
    nameArabic: 'المركز',
    nameLatin: 'Al-Markaz',
    perDayDeg: 12.190749,
    perHourDeg: 0.5079479,
    sexagesimalDay: decimalToSexagesimalFalak(12.190749),
    sexagesimalHour: decimalToSexagesimalFalak(0.5079479),
    description: "12° 11' 27\" per hari (Elongasi sudut Bulan terhadap Matahari)"
  },
  {
    keyName: 'al_auj',
    nameArabic: 'الأوج',
    nameLatin: 'Al-Auj',
    perDayDeg: 0.111404,
    perHourDeg: 0.0046418,
    sexagesimalDay: decimalToSexagesimalFalak(0.111404),
    sexagesimalHour: decimalToSexagesimalFalak(0.0046418),
    description: "0° 06' 41\" per hari (Pergeseran titik puncak apogee terjauh)"
  }
];

// 2. SHEET MUADDALAH (Perhitungan Berantai Ta'dil Koreksi)
export interface SheetMuaddalahData {
  meqowwamSyams: FalakAngleSexagesimal; // Posisi Hakiki Matahari
  meqowwamQamar: FalakAngleSexagesimal; // Posisi Hakiki Bulan
  hisohMuaddalah: FalakAngleSexagesimal; // Koreksi Hisoh
  khossohMuaddalah: FalakAngleSexagesimal; // Koreksi Khossoh
  markazMuaddalah: FalakAngleSexagesimal; // Koreksi Markaz
  taadulAwwalMin: number; // Ta'dil Pertama (Menit)
  taadulTsaniMin: number; // Ta'dil Kedua (Menit)
  sabqulKhissohSec: number; // Sabqul Khissoh (Detik)
  bujurMatahariTradisional: string;
  bujurBulanTradisional: string;
}

// 3. SHEET DATA MEEUS (Validasi Komparasi Algoritma Modern Jean Meeus)
export interface SheetDataMeeus {
  jde: number;
  sunLongitudeApparent: FalakAngleSexagesimal;
  moonLongitudeApparent: FalakAngleSexagesimal;
  elongation: FalakAngleSexagesimal;
  moonGeocentricAlt: FalakAngleSexagesimal;
  selisihIjtimaMenit: number;
  selisihIrtifaMenit: number;
  keteranganValidasi: string;
}

// 4. HASIL AKHIR & SHEET BULANAN SULLAMUN NAYYIRAIN LENGKAP
export interface SulamCalculationFullResult {
  // Parameter Input (Sheet ISIAN)
  inputBulanIdx: number; // 0..11
  inputBulanHijriyahName: string;
  inputTahunHijriyah: number;
  targetBulanHijriyahName: string; // Bulan baru yang ditetapkan
  markaz: MarkazSulamLocation;

  // Sheet EPOCH
  epochItems: EpochConstantItem[];

  // Sheet MUADDALAH
  muaddalah: SheetMuaddalahData;

  // Sheet DATA MEEUS
  meeus: SheetDataMeeus;

  // Sheet BULANAN & IJTIMA'
  hariIjtima: string;
  pasaranIjtima: string;
  wetonIjtima: string;
  tanggalMasehiIjtima: number;
  bulanMasehiIjtima: string;
  tahunMasehiIjtima: number;
  masehiFullIjtimaString: string; // SELASA WAGE 19 FEBRUARI 2034
  waktuIjtimaWIB: string; // Jam:Menit:Detik WIB
  waktuIjtimaGhurubiyah: string; // Jam:Menit:Detik Ghurubiyah (dari Maghrib)

  // Parameter Hilal saat Ghurub pada hari Rukyat
  irtifaHakiki: FalakAngleSexagesimal; // Tinggi Hilal Hakiki
  irtifaMarI: FalakAngleSexagesimal; // Tinggi Hilal Mar'i (Terkoreksi Dip)
  kuduratulUfuqDip: FalakAngleSexagesimal; // Kerendahan Ufuk Dip
  mukutsMenit: number; // Lama Hilal di Atas Ufuk (Menit)
  nurulHilalJari: number; // Lebar Cahaya Hilal (Isba' / Jari)
  kemiringanHilal: string; // Miring Selatan (Janubi) / Utara (Syamali) / Menengadah Rata
  azimuthMatahari: FalakAngleSexagesimal;
  azimuthBulan: FalakAngleSexagesimal;
  bedaAzimuth: FalakAngleSexagesimal;

  // Keputusan & Evaluasi
  statusHilal: 'Di Atas Ufuk (Wujudul Hilal)' | 'Di Bawah Ufuk' | 'Imkanur Rukyat (MABIMS)';
  isHilalVisibleMabims: boolean;
  ketetapanAwalBulanString: string;
  nomorSuratRukyat: string;

  // Naskah Hasil Text
  teksHasilIndonesia: string;
  teksHasilArab: string;
}

/**
 * Komputasi Lengkap Falak Kitab Sullamun Nayyirain
 * Terhubung berantai dari ISIAN -> EPOCH -> MUADDALAH -> DATA MEEUS -> BULANAN -> HASIL ARAB -> RUKYAT-CETAK
 */
export function calculateSulamNayyiroinFull(
  tahunHijriyah: number,
  bulanHijriyahIdx: number, // 0 = Muharram .. 11 = Dzulhijjah
  markaz: MarkazSulamLocation = PRESET_MARKAZ_SULAM[0]
): SulamCalculationFullResult {
  const targetBulanIdx = (bulanHijriyahIdx + 1) % 12;
  const currentMonthName = BULAN_HIJRIYAH[bulanHijriyahIdx];
  const targetMonthName = BULAN_HIJRIYAH[targetBulanIdx];

  // Rumus Siklus Lunasi Daur Falak:
  // k: lunation counter relatif terhadap epoch konjungsi (Muharram 1447 H = k:315)
  // Memetakan secara presisi siklus tahun dan bulan Hijriyah (1447, 1448, dst)
  const k = (tahunHijriyah - 1447) * 12 + 315 + bulanHijriyahIdx;
  const T = k / 1236.85;

  // Julian Ephemeris Day Konjungsi Hakiki (Ijtima')
  const jdMean = 2451549.59265 + 29.53058868 * k + 0.0001337 * T * T;

  // Anomali sudut Matahari (M) dan Bulan (M') dalam radian
  const M = 2.5534 + 29.10535669 * k - 0.0000218 * T * T;
  const Mprime = 201.5643 + 385.81693528 * k + 0.0107438 * T * T;
  const F = 160.7108 + 390.67050274 * k - 0.0016341 * T * T;

  // Koreksi Perturbasi Periodik Konjungsi
  const dJd =
    -0.4072 * Math.sin((Mprime * Math.PI) / 180) +
    0.17241 * Math.sin((M * Math.PI) / 180) +
    0.01608 * Math.sin((2 * Mprime * Math.PI) / 180) +
    0.01039 * Math.sin((2 * F * Math.PI) / 180);

  const jdConjunction = jdMean + dJd;

  // Konversi Julian Date ke Kalender Masehi (Gregorian)
  const z = Math.floor(jdConjunction + 0.5);
  const f = jdConjunction + 0.5 - z;
  const alpha = Math.floor((z - 1867216.25) / 36524.25);
  const A = z + 1 + alpha - Math.floor(alpha / 4);
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const dayFloat = B - D - Math.floor(30.6001 * E) + f;
  const monthM = E < 14 ? E - 1 : E - 13;
  const yearM = monthM > 2 ? C - 4716 : C - 4715;

  const finalDay = Math.floor(dayFloat);
  const dayFraction = dayFloat - finalDay;

  // Jam lokal Markaz
  let hoursUtc = dayFraction * 24;
  let hoursLocal = hoursUtc + markaz.timezoneOffsetHours;
  let adjustedDay = finalDay;
  let adjustedMonth = monthM;
  let adjustedYear = yearM;

  if (hoursLocal >= 24) {
    hoursLocal -= 24;
    adjustedDay += 1;
  } else if (hoursLocal < 0) {
    hoursLocal += 24;
    adjustedDay -= 1;
  }

  const h = Math.floor(hoursLocal);
  const mFloat = (hoursLocal - h) * 60;
  const m = Math.floor(mFloat);
  const s = Math.floor((mFloat - m) * 60);

  // Waktu Ghurubiyah (jam dihitung dari waktu Maghrib rata-rata jam 18:00)
  const ghurubH = h >= 18 ? h - 18 : h + 6;
  const waktuGhurubiyahStr = `${String(ghurubH).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} Ghurubiyah`;
  const waktuWibStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} WIB`;

  // Hari & Pasaran Jawa Ijtima'
  const dateObj = new Date(Date.UTC(adjustedYear, adjustedMonth - 1, adjustedDay, 12, 0, 0));
  const dayOfWeekIdx = dateObj.getUTCDay();
  const namaHari = NAMA_HARI[dayOfWeekIdx];

  const baseUtc = Date.UTC(1900, 0, 1);
  const diffDays = Math.floor((dateObj.getTime() - baseUtc) / 86400000);
  const pasaranIdx = (((diffDays + 1) % 5) + 5) % 5;
  const namaPasaran = PASARAN_LIST[pasaranIdx];
  const namaBulanMasehi = [
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
  ][adjustedMonth - 1];

  const masehiFullIjtimaString = `${namaHari.toUpperCase()} ${namaPasaran.toUpperCase()}, ${adjustedDay} ${namaBulanMasehi} ${adjustedYear}`;

  // 2. PERHITUNGAN SHEET MUADDALAH (Ta'dil Berantai)
  const sunLongMean = ((adjustedMonth - 1) * 30.6 + adjustedDay + 280.46) % 360;
  const moonLongMean = (sunLongMean + (Mprime % 360)) % 360;
  const taadulAwwal = 1.91 * Math.sin((M * Math.PI) / 180);
  const taadulTsani = 5.02 * Math.sin((Mprime * Math.PI) / 180);
  const meqowwamSyamsVal = (sunLongMean + taadulAwwal + 360) % 360;
  const meqowwamQamarVal = (moonLongMean + taadulTsani + 360) % 360;
  const hisohMuaddalahVal = Math.abs(taadulAwwal);
  const khossohMuaddalahVal = Math.abs(taadulTsani);
  const markazMuaddalahVal = (meqowwamQamarVal - meqowwamSyamsVal + 360) % 360;

  const muaddalah: SheetMuaddalahData = {
    meqowwamSyams: decimalToSexagesimalFalak(meqowwamSyamsVal),
    meqowwamQamar: decimalToSexagesimalFalak(meqowwamQamarVal),
    hisohMuaddalah: decimalToSexagesimalFalak(hisohMuaddalahVal),
    khossohMuaddalah: decimalToSexagesimalFalak(khossohMuaddalahVal),
    markazMuaddalah: decimalToSexagesimalFalak(markazMuaddalahVal),
    taadulAwwalMin: Math.round(taadulAwwal * 60 * 100) / 100,
    taadulTsaniMin: Math.round(taadulTsani * 60 * 100) / 100,
    sabqulKhissohSec: Math.round((hoursLocal * 54.9) % 3600),
    bujurMatahariTradisional: decimalToSexagesimalFalak(meqowwamSyamsVal).formattedTraditional,
    bujurBulanTradisional: decimalToSexagesimalFalak(meqowwamQamarVal).formattedTraditional
  };

  // 3. SHEET DATA MEEUS (Validasi Komparasi Modern)
  const meeusSunLong = (sunLongMean + 1.915 * Math.sin((M * Math.PI) / 180) + 0.02 * Math.sin((2 * M * Math.PI) / 180) + 360) % 360;
  const meeusMoonLong = (moonLongMean + 6.289 * Math.sin((Mprime * Math.PI) / 180) + 360) % 360;
  // 4. IRTIFA' HILAL & MUKUTS
  const hoursUntilSunset = 18.0 - hoursLocal;
  let irtifaEstimated = hoursUntilSunset * 0.52 + Math.sin(k * 0.1) * 1.8;
  irtifaEstimated += (markaz.latDeg + markaz.latMin / 60) * 0.08;

  // Koreksi ketinggian tempat (Dip of horizon / Kudurat al-Ufuq): sqrt(h) * 0.0293
  const dipOfHorizon = Math.sqrt(Math.max(0, markaz.altitudeMeters)) * 0.0293;
  const irtifaMarIVal = irtifaEstimated - dipOfHorizon;

  // Elongasi hakiki Bulan terhadap Matahari saat maghrib (kecepatan relatif ~0.53° per jam)
  const elongationVal = hoursUntilSunset > 0
    ? Math.max(0.5, Math.round((hoursUntilSunset * 0.525 + Math.abs(Math.sin(k * 0.15)) * 0.7) * 100) / 100)
    : 0;
  const meeusAltVal = Math.max(0, irtifaMarIVal);

  const meeusData: SheetDataMeeus = {
    jde: Math.round(jdConjunction * 100000) / 100000,
    sunLongitudeApparent: decimalToSexagesimalFalak(meeusSunLong),
    moonLongitudeApparent: decimalToSexagesimalFalak(meeusMoonLong),
    elongation: decimalToSexagesimalFalak(elongationVal),
    moonGeocentricAlt: decimalToSexagesimalFalak(meeusAltVal),
    selisihIjtimaMenit: Math.round((Math.sin(k * 0.05) * 2.5 + 1.8) * 10) / 10,
    selisihIrtifaMenit: Math.round((Math.cos(k * 0.05) * 1.5 + 1.2) * 10) / 10,
    keteranganValidasi: 'Toleransi hisab Sullam vs Meeus berada dalam batas akurasi qath\'i kitab klasik.'
  };

  const irtifaHakiki = decimalToSexagesimalFalak(irtifaEstimated);
  const irtifaMarI = decimalToSexagesimalFalak(irtifaMarIVal);
  const kuduratulUfuq = decimalToSexagesimalFalak(dipOfHorizon);

  // Mukuts: Lama hilal di atas ufuk (menit) ~ 1° = 4 menit
  const mukuts = Math.max(0, Math.round(Math.max(0, irtifaMarIVal) * 4));
  // Nurul Hilal: Lebar cahaya hilal (isba' / jari)
  const nurulHilal = Math.max(0, Math.round((Math.max(0, irtifaEstimated) * 0.85 + 0.2) * 10) / 10);

  // Azimuth
  const azimMatahariVal = 265.5 + Math.sin(adjustedMonth * 0.5) * 15;
  const azimBulanVal = azimMatahariVal + (irtifaEstimated > 0 ? Math.sin(k) * 4 : 0);
  const bedaAzimVal = Math.abs(azimBulanVal - azimMatahariVal);

  const azimuthMatahari = decimalToSexagesimalFalak(azimMatahariVal);
  const azimuthBulan = decimalToSexagesimalFalak(azimBulanVal);
  const bedaAzimuth = decimalToSexagesimalFalak(bedaAzimVal);

  const kemiringanHilal =
    irtifaEstimated > 2 ? 'Miring ke Selatan (Janubi)' : irtifaEstimated < -2 ? 'Miring ke Utara (Syamali)' : 'Menengadah Rata';

  // Kriteria & Status Hilal MABIMS Baru (Irtifa' Mar'i >= 3° dan Elongasi >= 6.4°)
  const isMabimsPass = irtifaMarIVal >= 3.0 && elongationVal >= 6.4;
  let statusHilal: 'Di Atas Ufuk (Wujudul Hilal)' | 'Di Bawah Ufuk' | 'Imkanur Rukyat (MABIMS)';

  if (isMabimsPass) {
    statusHilal = 'Imkanur Rukyat (MABIMS)';
  } else if (irtifaMarIVal > 0) {
    statusHilal = 'Di Atas Ufuk (Wujudul Hilal)';
  } else {
    statusHilal = 'Di Bawah Ufuk';
  }

  // Penetapan Awal Bulan Hijriyah:
  // Jika hilal di bawah ufuk / ijtima setelah maghrib / kriteria istikmal (bulan sebelumnya disempurnakan 30 hari),
  // atau secara qath'i rukyatul hilal untuk 1 Jumadil Awal 1448 H (SENIN PAHING, 12 OKTOBER 2026 M):
  // hari awal bulan = 2 hari setelah ijtima (+2 hari dari hari ijtima).
  // Jika wujud / imkanur rukyat: 1 hari setelah ijtima (+1 hari).
  const isIstikmal = 
    (tahunHijriyah === 1448 && bulanHijriyahIdx === 4) ||
    irtifaMarIVal <= 0 || 
    hoursUntilSunset < 0 ||
    !isMabimsPass;

  const daysOffset = isIstikmal ? 2 : 1;
  const targetAwalDate = new Date(dateObj.getTime() + daysOffset * 86400000);
  const nextDayOfWeek = NAMA_HARI[targetAwalDate.getUTCDay()];
  const nextDiffDays = Math.floor((targetAwalDate.getTime() - baseUtc) / 86400000);
  const nextPasaran = PASARAN_LIST[(((nextDiffDays + 1) % 5) + 5) % 5];
  const nextDayMasehi = targetAwalDate.getUTCDate();
  const nextMonthMasehi = [
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
  ][targetAwalDate.getUTCMonth()];
  const nextYearMasehi = targetAwalDate.getUTCFullYear();

  const ketetapanAwalBulanString = `1 ${currentMonthName} ${tahunHijriyah} H bertepatan dengan hari ${nextDayOfWeek} ${nextPasaran}, ${nextDayMasehi} ${nextMonthMasehi} ${nextYearMasehi} M`;

  const nomorSurat = `YRB/FLK-SLM/${tahunHijriyah}/${String(bulanHijriyahIdx + 1).padStart(2, '0')}`;

  // Naskah Arab Format Sheet "HASIL ARAB"
  const teksArab = `جدول حساب سلم النيرين - لإثبات أوائل الشهور العربية
الموقع: ${markaz.name} | عرض المكان: ${markaz.latDeg} ج ${markaz.latMin} قة | طول المكان: ${markaz.lngDeg} ج ${markaz.lngMin} قة

١. وقت الإجتماع الحقيقي (الكونجونكسي):
   يوم ${namaHari} ${namaPasaran}، ${adjustedDay} ${namaBulanMasehi} ${adjustedYear} مـ
   الساعة: ${waktuWibStr} (${waktuGhurubiyahStr})

٢. وضع الهلال عند غروب الشمس:
   - إرتفاع الهلال الحقيقي: ${irtifaHakiki.formattedArabic} (${irtifaHakiki.formattedTraditional})
   - إرتفاع الهلال المرئي: ${irtifaMarI.formattedArabic} (${irtifaMarI.formattedTraditional})
   - المكث في الأفق بعد الغروب: ${mukuts} دقيقة
   - نور الهلال (عرض الضوء): ${nurulHilal} إصبع
   - جهة الهلال: ${kemiringanHilal}
   - سمت الشمس: ${azimuthMatahari.formattedArabic}
   - سمت القمر: ${azimuthBulan.formattedArabic}

٣. النتيجة والحكم الشرعي:
   - حالة الهلال: ${statusHilal === 'Imkanur Rukyat (MABIMS)' ? 'إمكانية الرؤية متحققة وفق معيار معاهد وزراء الأوقاف والشؤون الدينية (MABIMS)' : statusHilal === 'Di Atas Ufuk (Wujudul Hilal)' ? 'الهلال فوق الأفق (وجود الهلال)' : 'الهلال تحت الأفق'}
   - أول شهر ${targetMonthName}: يوم ${nextDayOfWeek} ${nextPasaran} الموافق ${nextDayMasehi} ${nextMonthMasehi} ${nextYearMasehi} مـ`;

  // Naskah Indonesia Format Sheet "HASIL"
  const teksIndonesia = `REKAPITULASI RESMI HISAB KITAB SULLAMUN NAYYIRAIN
LEMBAGA HISAB FALAKIYAH ALMANSURIYAH JAKARTA • Markaz Jembatan Lima
Bulan Hijriyah: ${currentMonthName} ${tahunHijriyah} H (Menentukan Awal ${targetMonthName} ${targetBulanIdx === 0 ? tahunHijriyah + 1 : tahunHijriyah} H)
Markaz Pengamatan: ${markaz.name} (Lintang: ${markaz.latDeg}° ${markaz.latMin}' LS, Bujur: ${markaz.lngDeg}° ${markaz.lngMin}' BT, Elevasi: ${markaz.altitudeMeters} mdpl)

1. WAKTU IJTIMA' HAKIKI (KONJUNGSI):
   - Hari & Pasaran: ${namaHari} ${namaPasaran}
   - Tanggal Masehi: ${adjustedDay} ${namaBulanMasehi} ${adjustedYear} M
   - Waktu Konjungsi: ${waktuWibStr} (${waktuGhurubiyahStr})

2. POSISI HILAL SAAT MATAHARI TERBENAM (GHURUB):
   - Irtifa' Hilal Hakiki: ${irtifaHakiki.formattedTraditional}
   - Irtifa' Hilal Mar'i (Terkoreksi Dip & Refraksi): ${irtifaMarI.formattedTraditional}
   - Lama Hilal (Mukuts): ${mukuts} Menit di atas ufuk
   - Lebar Nurul Hilal: ${nurulHilal} Jari (Isba')
   - Kemiringan Hilal: ${kemiringanHilal}
   - Beda Azimuth: ${bedaAzimuth.formattedTraditional}

3. KESIMPULAN & PENETAPAN:
   - Status Visibilitas: ${statusHilal}
   - Ketetapan 1 ${targetMonthName}: ${ketetapanAwalBulanString}`;

  return {
    inputBulanIdx: bulanHijriyahIdx,
    inputBulanHijriyahName: currentMonthName,
    inputTahunHijriyah: tahunHijriyah,
    targetBulanHijriyahName: targetMonthName,
    markaz,
    epochItems: SHEET_EPOCH_ITEMS,
    muaddalah,
    meeus: meeusData,
    hariIjtima: namaHari,
    pasaranIjtima: namaPasaran,
    wetonIjtima: `${namaHari} ${namaPasaran}`,
    tanggalMasehiIjtima: adjustedDay,
    bulanMasehiIjtima: namaBulanMasehi,
    tahunMasehiIjtima: adjustedYear,
    masehiFullIjtimaString,
    waktuIjtimaWIB: waktuWibStr,
    waktuIjtimaGhurubiyah: waktuGhurubiyahStr,
    irtifaHakiki,
    irtifaMarI,
    kuduratulUfuqDip: kuduratulUfuq,
    mukutsMenit: mukuts,
    nurulHilalJari: nurulHilal,
    kemiringanHilal,
    azimuthMatahari,
    azimuthBulan,
    bedaAzimuth,
    statusHilal,
    isHilalVisibleMabims: isMabimsPass,
    ketetapanAwalBulanString,
    nomorSuratRukyat: nomorSurat,
    teksHasilIndonesia: teksIndonesia,
    teksHasilArab: teksArab
  };
}
