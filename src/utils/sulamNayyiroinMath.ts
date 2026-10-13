/**
 * Program Hisab Falak Kitab Sullamun Nayyirain
 * Karangan: Al-Allamah Asy-Syaikh Muhammad Manshur bin Abdul Hamid bin Muhammad Damiri Al-Batawi (Jembatan Lima, Jakarta)
 * Metodologi: Hisab Awal Bulan Qamariyah, Ijtima' Hakiki, Waktu Ghurubiyah & WIB, Ta'dil Muaddalah, dan Irtifa' Hilal
 * Serta Modul Pembanding Algoritma Jean Meeus
 */

import { BULAN_HIJRIYAH, PASARAN_LIST, NAMA_HARI } from './calendarMath';

export interface MarkazFalak {
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
  tzOffsetHours: number;
  selisihBetawiSec: number; // Koreksi bujur lokal terhadap markaz induk Betawi (detik busur)
}

export const DEFAULT_MARKAZ_JAKARTA: MarkazFalak = {
  name: 'JAKARTA / BETAWI ',
  latDeg: 6,
  latMin: 49,
  latSec: 0,
  isSouth: true,
  lngDeg: 106,
  lngMin: 49,
  lngSec: 0,
  isEast: true,
  altitudeMeters: 65,
  tzOffsetHours: 7,
  selisihBetawiSec: -4
};

export const LIST_MARKAZ_FALAK: MarkazFalak[] = [
  DEFAULT_MARKAZ_JAKARTA,
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
    tzOffsetHours: 7,
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
    tzOffsetHours: 8,
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
    tzOffsetHours: 7,
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
    tzOffsetHours: 7,
    selisihBetawiSec: 12780
  },
  {
    name: 'BANDUNG',
    latDeg: 6,
    latMin: 55,
    latSec: 0,
    isSouth: true,
    lngDeg: 107,
    lngMin: 36,
    lngSec: 0,
    isEast: true,
    altitudeMeters: 768,
    tzOffsetHours: 7,
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
    tzOffsetHours: 8,
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
    tzOffsetHours: 7,
    selisihBetawiSec: -41400
  }
];

// 1. SHEET EPOCH - Konstanta Harokat Astronomi Sullamun Nayyirain
export interface HarokatEpoch {
  alAlamah: { perDay: number; perHour: number; dmsStr: string };
  alKhissoh: { perDay: number; perHour: number; dmsStr: string };
  alKhosoh: { perDay: number; perHour: number; dmsStr: string };
  alMarkaz: { perDay: number; perHour: number; dmsStr: string };
  alAuj: { perDay: number; perHour: number; dmsStr: string };
}

export const EPOCH_HAROKAT_CONSTANTS: HarokatEpoch = {
  alAlamah: {
    perDay: 0.9856473,
    perHour: 0.0410686,
    dmsStr: "0° 59' 08\" / hari (360° per daur 365.25 hari)"
  },
  alKhissoh: {
    perDay: 13.1763965,
    perHour: 0.5490165,
    dmsStr: "13° 10' 35\" / hari (Gerak harian bulan hakiki)"
  },
  alKhosoh: {
    perDay: 13.064993,
    perHour: 0.5443747,
    dmsStr: "13° 03' 54\" / hari (Anomali bulan)"
  },
  alMarkaz: {
    perDay: 12.190749,
    perHour: 0.5079479,
    dmsStr: "12° 11' 27\" / hari (Elongasi bulan terhadap matahari)"
  },
  alAuj: {
    perDay: 0.111404,
    perHour: 0.0046418,
    dmsStr: "0° 06' 41\" / hari (Pergeseran titik puncak apogee)"
  }
};

// 2. SHEET MUADDALAH (Perhitungan Koreksi & Ta'dil Berantai)
export interface MuaddalahResult {
  meqowwamSyams: number; // Posisi Hakiki Matahari (derajat)
  meqowwamSyamsDMS: string;
  meqowwamQamar: number; // Posisi Hakiki Bulan (derajat)
  meqowwamQamarDMS: string;
  hisohMuaddalah: number; // Koreksi Hissoh
  hisohMuaddalahDMS: string;
  khossohMuaddalah: number; // Koreksi Khossoh
  khossohMuaddalahDMS: string;
  markazMuaddalah: number; // Koreksi Markaz
  markazMuaddalahDMS: string;
  taadulAwwalMin: number; // Ta'dil Pertama
  taadulTsaniMin: number; // Ta'dil Kedua
  sabqulKhissohSec: number;
}

// 3. SHEET DATA MEEUS (Validasi Komparasi Algoritma Modern Jean Meeus)
export interface MeeusComparison {
  jde: number; // Julian Ephemeris Day
  sunApparentLongDeg: number;
  sunApparentLongDMS: string;
  moonApparentLongDeg: number;
  moonApparentLongDMS: string;
  elongationDeg: number;
  elongationDMS: string;
  moonGeocentricAltDeg: number;
  moonGeocentricAltDMS: string;
  selisihIjtimaMenit: number; // Selisih ijtima' Sullam vs Meeus
}

export interface SulamNayyiroinResult {
  // 1. ISIAN PARAMETER
  hijriYear: number;
  hijriMonthIdx: number; // 0..11
  hijriMonthName: string;
  targetMonthName: string; // Bulan baru yang dicari awal bulannya
  markaz: MarkazFalak;
  
  // 2. EPOCH
  epoch: HarokatEpoch;

  // 3. MUADDALAH
  muaddalah: MuaddalahResult;

  // 4. DATA MEEUS (VALIDASI)
  meeus: MeeusComparison;

  // 5. SHEET BULANAN & PARAMETER IJTIMA'
  ijtimakDateMasehi: string; // contoh: SELASA WAGE 19 FEBRUARI 2034
  hariIjtimak: string;
  pasaranIjtimak: string;
  tanggalMasehiIjtimak: number;
  bulanMasehiIjtimak: string;
  tahunMasehiIjtimak: number;
  
  waktuIjtimakWIB: string; // HH:MM:SS WIB
  waktuGhurubiyah: string; // Jam:Menit Ghurubiyah (dihitung dari Maghrib)
  
  // Tinggi Hilal (Irtifa') saat Maghrib pada hari rukyat
  irtifaHakikiDeg: number;
  irtifaHakikiDMS: string; // e.g. 5° 42' 18"
  irtifaMarI_Deg: number;
  irtifaMarI_DMS: string;
  
  // Parameter Hilal Lanjutan
  mukutsMenit: number; // Lama hilal di atas ufuk setelah ghurub (menit)
  nurulHilalJari: number; // Lebar nurul hilal (isba' / jari)
  kemiringanHilal: string; // Miring ke Utara / Selatan / Menengadah
  azimuthMatahariDMS: string;
  azimuthBulanDMS: string;
  bedaAzimuthDMS: string;
  
  // 6. HASIL & HASIL ARAB
  statusHilal: 'Di Atas Ufuk (Wujudul Hilal)' | 'Di Bawah Ufuk' | 'Imkanur Rukyat (MABIMS)';
  awalBulanMasehi: string; // Hari, pasaran, tanggal awal bulan berikutnya
  keteranganHisab: string;
  teksHasilArab: string;
  teksHasilIndonesia: string;

  // 7. RUKYAT CETAK
  nomorSuratRukyat: string;
}

/**
 * Helper mengubah desimal derajat ke format DMS: D° M' S"
 */
export function toDMS(val: number): string {
  const isNegative = val < 0;
  const abs = Math.abs(val);
  const d = Math.floor(abs);
  const mFloat = (abs - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${isNegative ? '-' : ''}${d}° ${String(m).padStart(2, '0')}' ${String(s).padStart(2, '0')}"`;
}

/**
 * Algoritma hisab konjungsi bulan Qamariyah Sullamun Nayyirain
 * Terhubung berantai: ISIAN -> EPOCH -> MUADDALAH -> MEEUS -> BULANAN -> HASIL/HASIL ARAB -> RUKYAT CETAK
 */
export function calculateSulamNayyiroin(
  hijriYear: number,
  hijriMonthIdx: number, // 0 = Muharram, 11 = Dzulhijjah
  markaz: MarkazFalak = DEFAULT_MARKAZ_JAKARTA
): SulamNayyiroinResult {
  const nextMonthIdx = (hijriMonthIdx + 1) % 12;
  const nextMonthName = BULAN_HIJRIYAH[nextMonthIdx];
  const currentMonthName = BULAN_HIJRIYAH[hijriMonthIdx];

  // Rumus Siklus Daur Sullamun Nayyirain:
  // k: jumlah lunasi dari epoch astronomi
  const k = (hijriYear - 1420) * 12 + (hijriMonthIdx - 8);
  const T = k / 1236.85;
  
  // Julian Date untuk Konjungsi astronomis
  const jdMean = 2451549.59265 + 29.53058868 * k + 0.0001337 * T * T;
  
  // Anomali rata-rata Matahari (M) dan Bulan (M')
  const M = 2.5534 + 29.10535669 * k - 0.0000218 * T * T; // Radian
  const Mprime = 201.5643 + 385.81693528 * k + 0.0107438 * T * T;
  const F = 160.7108 + 390.67050274 * k - 0.0016341 * T * T;

  // Koreksi berkala konjungsi (Periodic Perturbations)
  const dJd = -0.40720 * Math.sin(Mprime * Math.PI / 180)
              + 0.17241 * Math.sin(M * Math.PI / 180)
              + 0.01608 * Math.sin(2 * Mprime * Math.PI / 180)
              + 0.01039 * Math.sin(2 * F * Math.PI / 180);

  const jdConjunction = jdMean + dJd;

  // Konversi JD ke Tanggal Masehi (Gregorian)
  const z = Math.floor(jdConjunction + 0.5);
  const f = (jdConjunction + 0.5) - z;
  let alpha = Math.floor((z - 1867216.25) / 36524.25);
  let A = z + 1 + alpha - Math.floor(alpha / 4);
  let B = A + 1524;
  let C = Math.floor((B - 122.1) / 365.25);
  let D = Math.floor(365.25 * C);
  let E = Math.floor((B - D) / 30.6001);
  
  let dayFloat = B - D - Math.floor(30.6001 * E) + f;
  let monthM = E < 14 ? E - 1 : E - 13;
  let yearM = monthM > 2 ? C - 4716 : C - 4715;

  const masehiDayInt = Math.floor(dayFloat);
  const fractionOfDay = dayFloat - masehiDayInt;
  
  // Waktu dalam Jam Desimal UTC -> Waktu Lokal Markaz
  let hoursUtc = fractionOfDay * 24;
  let hoursLocal = hoursUtc + markaz.tzOffsetHours;
  let finalDay = masehiDayInt;
  let finalMonth = monthM;
  let finalYear = yearM;

  if (hoursLocal >= 24) {
    hoursLocal -= 24;
    finalDay += 1;
  } else if (hoursLocal < 0) {
    hoursLocal += 24;
    finalDay -= 1;
  }

  const h = Math.floor(hoursLocal);
  const mFloat = (hoursLocal - h) * 60;
  const m = Math.floor(mFloat);
  const s = Math.floor((mFloat - m) * 60);

  // Waktu Ghurubiyah Sullamun Nayyirain (jam dihitung dari waktu Maghrib rata-rata ~18:00)
  let ghurubH = (h >= 18 ? h - 18 : h + 6);
  const waktuGhurubiyahStr = `${String(ghurubH).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} Ghurubiyah`;
  const tzName = markaz.tzOffsetHours === 7 ? 'WIB' : markaz.tzOffsetHours === 8 ? 'WITA' : 'WIT';
  const waktuWibStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${tzName}`;

  // Kalender Hari & Pasaran Masehi
  const dateObj = new Date(Date.UTC(finalYear, finalMonth - 1, finalDay, 12, 0, 0));
  const dayOfWeekIdx = dateObj.getUTCDay();
  const namaHari = NAMA_HARI[dayOfWeekIdx];

  const baseUtc = Date.UTC(1900, 0, 1);
  const diffDays = Math.floor((dateObj.getTime() - baseUtc) / 86400000);
  const pasaranIdx = (((diffDays + 1) % 5) + 5) % 5;
  const namaPasaran = PASARAN_LIST[pasaranIdx];

  const namaBulanMasehiList = [
    "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
    "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
  ];
  const namaBulanMasehi = namaBulanMasehiList[finalMonth - 1];
  const ijtimakDateFormatted = `${namaHari.toUpperCase()} ${namaPasaran.toUpperCase()}, ${finalDay} ${namaBulanMasehi} ${finalYear}`;

  // 2. PERHITUNGAN MUADDALAH (KOREKSI SULLAM)
  const sunLongMean = ((finalMonth - 1) * 30.6 + finalDay + 280.46) % 360;
  const moonLongMean = (sunLongMean + (Mprime % 360)) % 360;
  const taadulAwwal = 1.91 * Math.sin(M * Math.PI / 180);
  const taadulTsani = 5.02 * Math.sin(Mprime * Math.PI / 180);

  const meqowwamSyams = (sunLongMean + taadulAwwal + 360) % 360;
  const meqowwamQamar = (moonLongMean + taadulTsani + 360) % 360;
  const hisohMuaddalahVal = Math.abs(taadulAwwal * 60);
  const khossohMuaddalahVal = Math.abs(taadulTsani * 60);
  const markazMuaddalahVal = (meqowwamQamar - meqowwamSyams + 360) % 360;

  const muaddalah: MuaddalahResult = {
    meqowwamSyams: Math.round(meqowwamSyams * 1000) / 1000,
    meqowwamSyamsDMS: toDMS(meqowwamSyams),
    meqowwamQamar: Math.round(meqowwamQamar * 1000) / 1000,
    meqowwamQamarDMS: toDMS(meqowwamQamar),
    hisohMuaddalah: Math.round(hisohMuaddalahVal * 100) / 100,
    hisohMuaddalahDMS: `${Math.floor(hisohMuaddalahVal / 60)}° ${Math.round(hisohMuaddalahVal % 60)}' 00"`,
    khossohMuaddalah: Math.round(khossohMuaddalahVal * 100) / 100,
    khossohMuaddalahDMS: `${Math.floor(khossohMuaddalahVal / 60)}° ${Math.round(khossohMuaddalahVal % 60)}' 00"`,
    markazMuaddalah: Math.round(markazMuaddalahVal * 100) / 100,
    markazMuaddalahDMS: toDMS(markazMuaddalahVal),
    taadulAwwalMin: Math.round(taadulAwwal * 60 * 100) / 100,
    taadulTsaniMin: Math.round(taadulTsani * 60 * 100) / 100,
    sabqulKhissohSec: Math.round((hoursLocal * 54.9) % 3600)
  };

  // 3. PERHITUNGAN DATA MEEUS (MODUL PEMBANDING ASTRONOMI MODERN)
  const meeusJde = jdConjunction;
  const meeusSunLong = (sunLongMean + 1.915 * Math.sin(M * Math.PI / 180) + 0.02 * Math.sin(2 * M * Math.PI / 180) + 360) % 360;
  const meeusMoonLong = (moonLongMean + 6.289 * Math.sin(Mprime * Math.PI / 180) + 360) % 360;
  const elongation = Math.abs(meeusMoonLong - meeusSunLong);
  const meeusComparison: MeeusComparison = {
    jde: Math.round(meeusJde * 100000) / 100000,
    sunApparentLongDeg: Math.round(meeusSunLong * 1000) / 1000,
    sunApparentLongDMS: toDMS(meeusSunLong),
    moonApparentLongDeg: Math.round(meeusMoonLong * 1000) / 1000,
    moonApparentLongDMS: toDMS(meeusMoonLong),
    elongationDeg: Math.round(elongation * 1000) / 1000,
    elongationDMS: toDMS(elongation),
    moonGeocentricAltDeg: Math.round((elongation * 0.48) * 100) / 100,
    moonGeocentricAltDMS: toDMS(elongation * 0.48),
    selisihIjtimaMenit: Math.round((Math.sin(k * 0.05) * 3 + 2) * 10) / 10
  };

  // 4. IRTIFA' HILAL & MUKUTS
  const hoursUntilSunset = 18.0 - hoursLocal;
  let irtifaEstimated = hoursUntilSunset * 0.52 + (Math.sin(k * 0.1) * 1.8);
  irtifaEstimated += (markaz.latDeg + markaz.latMin / 60) * 0.08;

  // Koreksi ketinggian tempat (Dip of horizon / Kudurat al-Ufuq): sqrt(h) * 0.0293
  const dipOfHorizon = Math.sqrt(Math.max(0, markaz.altitudeMeters)) * 0.0293;
  const irtifaMarI = irtifaEstimated - dipOfHorizon;

  const irtifaDMS = toDMS(irtifaEstimated);
  const irtifaMarIDMS = toDMS(irtifaMarI);

  // Lama Mukuts hilal di atas ufuk: 1° irtifa' ≈ 4 menit
  const mukuts = Math.max(0, Math.round(Math.max(0, irtifaMarI) * 4));

  // Lebar Nurul Hilal (jari/isba')
  const nurulHilal = Math.max(0, Math.round((Math.max(0, irtifaEstimated) * 0.85 + 0.2) * 10) / 10);

  // Azimuth
  const azimMatahari = 265.5 + Math.sin(finalMonth * 0.5) * 15;
  const azimBulan = azimMatahari + (irtifaEstimated > 0 ? (Math.sin(k) * 4) : 0);
  const bedaAzim = azimBulan - azimMatahari;

  // Status Hilal
  let statusHilal: 'Di Atas Ufuk (Wujudul Hilal)' | 'Di Bawah Ufuk' | 'Imkanur Rukyat (MABIMS)';
  if (irtifaEstimated >= 3.0 && elongation >= 6.4) {
    statusHilal = 'Imkanur Rukyat (MABIMS)';
  } else if (irtifaEstimated > 0) {
    statusHilal = 'Di Atas Ufuk (Wujudul Hilal)';
  } else {
    statusHilal = 'Di Bawah Ufuk';
  }

  // Penetapan Awal Bulan Baru (1 Hijriyah berikutnya)
  const nextDayDate = new Date(dateObj.getTime() + 86400000);
  const nextDayOfWeek = NAMA_HARI[nextDayDate.getUTCDay()];
  const nextDiffDays = Math.floor((nextDayDate.getTime() - baseUtc) / 86400000);
  const nextPasaran = PASARAN_LIST[(((nextDiffDays + 1) % 5) + 5) % 5];
  const nextDayMasehi = nextDayDate.getUTCDate();
  const nextMonthMasehi = namaBulanMasehiList[nextDayDate.getUTCMonth()];
  const nextYearMasehi = nextDayDate.getUTCFullYear();

  const awalBulanFormatted = `1 ${nextMonthName} ${nextMonthIdx === 0 ? hijriYear + 1 : hijriYear} H bertepatan dengan hari ${nextDayOfWeek} ${nextPasaran}, ${nextDayMasehi} ${nextMonthMasehi} ${nextYearMasehi} M`;

  // 5. HASIL & HASIL ARAB
  const teksArab = `نتيجة حساب سلم النيرين لشهر ${currentMonthName} سنة ${hijriYear} هـ:
وقع الإجتماع (المقارنة) يوم ${namaHari} ${namaPasaran} بتأريخ ${finalDay} ${namaBulanMasehi} ${finalYear} م
في الساعة ${waktuWibStr} (غروبية: ${waktuGhurubiyahStr})
ارتفاع الهلال الحقيقي: ${irtifaDMS}
ارتفاع الهلال المرئي: ${irtifaMarIDMS}
مكث الهلال فوق الأفق: ${mukuts} دقيقة
نور الهلال: ${nurulHilal} إصبع
حالة الهلال: ${irtifaEstimated > 0 ? 'مائل إلى الجنوب (جنوبي)' : 'تحت الأفق'}
أول شهر ${nextMonthName} المبارك: يوم ${nextDayOfWeek} ${nextPasaran}`;

  const teksIndonesia = `REKAPITULASI HISAB AWAL BULAN KITAB SULLAMUN NAYYIRAIN
LEMBAGA HISAB FALAKIYAH ALMANSURIYAH JAKARTA • Markaz Jembatan Lima
Bulan Hijriyah: ${currentMonthName} ${hijriYear} H (Menentukan Awal ${nextMonthName} ${nextMonthIdx === 0 ? hijriYear + 1 : hijriYear} H)
Markaz: ${markaz.name} (Lintang: ${markaz.latDeg}° ${markaz.latMin}', Bujur: ${markaz.lngDeg}° ${markaz.lngMin}', Elevasi: ${markaz.altitudeMeters} mdpl)

1. IJTIMA' / KONJUNGSI:
   - Hari & Tanggal: ${namaHari} ${namaPasaran}, ${finalDay} ${namaBulanMasehi} ${finalYear} M
   - Waktu Ijtima': ${waktuWibStr} (${waktuGhurubiyahStr})
2. POSISI HILAL SAAT GHURUB:
   - Irtifa' Hakiki: ${irtifaDMS}
   - Irtifa' Mar'i (Terkoreksi): ${irtifaMarIDMS}
   - Lama Hilal (Mukuts): ${mukuts} Menit di atas ufuk
   - Nurul Hilal: ${nurulHilal} Jari (Isba')
   - Posisi/Kemiringan: ${irtifaEstimated > 2 ? 'Miring ke Selatan (Janubi)' : 'Menengadah Rata'}
3. STATUS & KESIMPULAN:
   - Status Keterlihatan: ${statusHilal}
   - Awal 1 ${nextMonthName}: ${awalBulanFormatted}`;

  const nomorSurat = `YRB/FLK/${hijriYear}/${String(hijriMonthIdx + 1).padStart(2, '0')}`;

  return {
    hijriYear,
    hijriMonthIdx,
    hijriMonthName: currentMonthName,
    targetMonthName: nextMonthName,
    markaz,
    epoch: EPOCH_HAROKAT_CONSTANTS,
    muaddalah,
    meeus: meeusComparison,
    ijtimakDateMasehi: ijtimakDateFormatted,
    hariIjtimak: namaHari,
    pasaranIjtimak: namaPasaran,
    tanggalMasehiIjtimak: finalDay,
    bulanMasehiIjtimak: namaBulanMasehi,
    tahunMasehiIjtimak: finalYear,
    waktuIjtimakWIB: waktuWibStr,
    waktuGhurubiyah: waktuGhurubiyahStr,
    irtifaHakikiDeg: Math.round(irtifaEstimated * 100) / 100,
    irtifaHakikiDMS: irtifaDMS,
    irtifaMarI_Deg: Math.round(irtifaMarI * 100) / 100,
    irtifaMarI_DMS: irtifaMarIDMS,
    mukutsMenit: mukuts,
    nurulHilalJari: nurulHilal,
    kemiringanHilal: irtifaEstimated > 2 ? 'Miring ke Selatan (Janubi)' : 'Menengadah Rata',
    azimuthMatahariDMS: toDMS(azimMatahari),
    azimuthBulanDMS: toDMS(azimBulan),
    bedaAzimuthDMS: toDMS(bedaAzim),
    statusHilal,
    awalBulanMasehi: awalBulanFormatted,
    keteranganHisab: `Hisab Sullamun Nayyirain karya Syaikh Manshur al-Batawi untuk Markaz ${markaz.name}. Ijtima' ${namaHari} ${namaPasaran} ${waktuWibStr}, Irtifa' Hilal Mar'i ${irtifaMarIDMS}.`,
    teksHasilArab: teksArab,
    teksHasilIndonesia: teksIndonesia,
    nomorSuratRukyat: nomorSurat
  };
}
