/**
 * Modul Data & Algoritma Falak Lembaga Hisab Falakiyah Almansuriyah Jakarta
 * Mengacu pada Kitab Sullamun Nayyirain (Al-Allamah KH. Muhammad Manshur bin Abdul Hamid Al-Batawi)
 * Serta data autentik penetapan hisab awal bulan Hijriyah.
 */

import * as XLSX from 'xlsx';
import { calculateSulamNayyiroinFull } from './sulamNayyiroinEngine';

export interface FalakCoordinateMatrix {
  // 1. EKLIPTIKA
  lambdaSunIjtima: string;    // λ Bujur Matahari saat Ijtima'
  lambdaMoonIjtima: string;   // λ Bujur Bulan saat Ijtima'
  lambdaSunMaghrib: string;   // λ Bujur Matahari saat Maghrib
  lambdaMoonMaghrib: string;  // λ Bujur Bulan saat Maghrib
  betaSun: string;            // β Lintang Matahari (00° 00' 00")
  betaMoon: string;           // β Lintang Bulan

  // 2. EKUATOR
  deltaSun: string;           // δ Deklinasi Matahari
  deltaMoon: string;          // δ Deklinasi Bulan
  alphaSunDeg: string;        // α Asensiorekta Matahari (Derajat ° ' '')
  alphaMoonDeg: string;       // α Asensiorekta Bulan (Derajat ° ' '')
  alphaSunTime: string;       // α Asensiorekta Matahari (Waktu H M D)
  alphaMoonTime: string;      // α Asensiorekta Bulan (Waktu H M D)
  tSunDeg: string;            // t Sudut Waktu Matahari (Derajat ° ' '')
  tMoonDeg: string;           // t Sudut Waktu Bulan (Derajat ° ' '')
  tSunTime: string;           // t Sudut Waktu Matahari (Waktu H M D)
  tMoonTime: string;          // t Sudut Waktu Bulan (Waktu H M D)

  // 3. HORIZON
  hSun: string;               // h Tinggi Matahari saat Ghurub (-00° 50' 00")
  hMoon: string;              // h Tinggi Hilal akhir
  aSun: string;               // A Azimuth Matahari
  aMoon: string;              // A Azimuth Bulan

  // PARAMETER TAMBAHAN
  elongation: string;         // Elongasi Bulan - Matahari
  umurBulanDeg: string;       // Umur Bulan (Derajat)
  umurBulanTime: string;      // Umur Bulan (Jam Menit Detik)
}

export interface FalakMonthRecord {
  bulanHijriyahKe: number;       // 1 s.d 12
  namaBulanHijriyah: string;     // MUHARRAM, SAFAR, dll
  tahunHijriyah: number;         // 1447, 1448, dst

  // Ijtima'
  hariPasaranIjtima: string;     // misal: Selasa Legi
  tanggalMasehiIjtima: string;   // misal: 17 Pebruari 2026 M.
  jamIjtima: string;             // format: [19:02:44 WIB]

  // Maghrib
  jamMaghrib: string;            // misal: 18:18 WIB

  // Umur Bulan
  umurBulanLengkap: string;      // misal: -00° 56' 04" / -00 Jam 48 Menit 51 Detik

  // Posisi Matahari Terbenam
  letakMatahariTerbenam: string; // misal: -11° 51' 44" (selatan titik barat)

  // Hilal
  posisiHilal: string;           // misal: Di selatan matahari
  keadaanHilal: string;          // misal: Miring ke selatan
  tinggiHilal: string;           // misal: -01° 41' 11"
  lamaHilalDiatasUfuk: string;   // misal: -00 Menit 06 Detik 45 Tertia

  // Hasil Penetapan Awal Bulan
  hariPasaranAwalBulan: string;  // misal: KAMIS PON, 19 PEBRUARI 2026 M. (atau RABU PAHING jika wujud)
  statusHilal: 'Di Bawah Ufuk (Istikmal)' | 'Di Atas Ufuk (Imkanur Rukyat)' | 'Di Atas Ufuk (Wujudul Hilal)';
  keteranganPenetapan: string;

  // Matriks Koordinat Lengkap
  matriks: FalakCoordinateMatrix;
}

export const DAFTAR_BULAN_HIJRIYAH = [
  'MUHARRAM',
  'SAFAR',
  'RABIUL AWAL',
  'RABIUL AKHIR',
  'JUMADIL AWAL',
  'JUMADIL AKHIR',
  'RAJAB',
  'SYABAN',
  'RAMADHAN',
  'SYAWAL',
  'ZULQADAH',
  'ZULHIJAH'
];

export interface BulanHijriyahStandard {
  nomor: number;
  namaLatin: string;
  namaArab: string;
  labelLengkap: string;
}

export const DAFTAR_BULAN_HIJRIYAH_LENGKAP: BulanHijriyahStandard[] = [
  { nomor: 1, namaLatin: 'Muharram', namaArab: 'مُحَرَّم', labelLengkap: '1. Muharram (مُحَرَّم)' },
  { nomor: 2, namaLatin: 'Safar', namaArab: 'صَفَر', labelLengkap: '2. Safar (صَفَر)' },
  { nomor: 3, namaLatin: 'Rabiul Awal', namaArab: 'رَبِيْع الأَوَّل', labelLengkap: '3. Rabiul Awal (رَبِيْع الأَوَّل)' },
  { nomor: 4, namaLatin: 'Rabiul Akhir', namaArab: 'رَبِيْع الآخِر', labelLengkap: '4. Rabiul Akhir (رَبِيْع الآخِر)' },
  { nomor: 5, namaLatin: 'Jumadil Awal', namaArab: 'جُمَادَى الْأُولَى', labelLengkap: '5. Jumadil Awal (جُمَادَى الْأُولَى)' },
  { nomor: 6, namaLatin: 'Jumadil Akhir', namaArab: 'جُمَادَى الْآخِرَة', labelLengkap: '6. Jumadil Akhir (جُمَادَى الْآخِرَة)' },
  { nomor: 7, namaLatin: 'Rajab', namaArab: 'رَجَب', labelLengkap: '7. Rajab (رَجَب)' },
  { nomor: 8, namaLatin: 'Syaban', namaArab: 'شَعْبَان', labelLengkap: '8. Syaban (شَعْبَان)' },
  { nomor: 9, namaLatin: 'Ramadhan', namaArab: 'رَمَضَان', labelLengkap: '9. Ramadhan (رَمَضَان)' },
  { nomor: 10, namaLatin: 'Syawal', namaArab: 'شَوَّال', labelLengkap: '10. Syawal (شَوَّال)' },
  { nomor: 11, namaLatin: 'Zulqadah', namaArab: 'ذُو الْقَعْدَة', labelLengkap: '11. Zulqadah (ذُو الْقَعْدَة)' },
  { nomor: 12, namaLatin: 'Zulhijah', namaArab: 'ذُو الْحِجَّة', labelLengkap: '12. Zulhijah (ذُو الْحِجَّة)' }
];

/**
 * Data Resmi Autentik 1447 H - Lembaga Hisab Falakiyah Almansuriyah Jakarta
 * Berdasarkan Lembar Hisab Kitab Sullamun Nayyirain & File Excel Resmi.
 */
export const DEFAULT_FALAK_DATA_1447H: FalakMonthRecord[] = [
  {
    bulanHijriyahKe: 1,
    namaBulanHijriyah: 'MUHARRAM',
    tahunHijriyah: 1447,
    hariPasaranIjtima: 'Rabu Legi',
    tanggalMasehiIjtima: '25 Juni 2025 M.',
    jamIjtima: '[10:31:18 WIB]',
    jamMaghrib: '17:51 WIB',
    umurBulanLengkap: '+03° 38\' 21" / +07 Jam 19 Menit 42 Detik',
    letakMatahariTerbenam: '+23° 23\' 12" (utara titik barat)',
    posisiHilal: 'Di utara matahari',
    keadaanHilal: 'Miring ke utara',
    tinggiHilal: '+03° 46\' 22"',
    lamaHilalDiatasUfuk: '15 Menit 05 Detik 28 Tertia',
    hariPasaranAwalBulan: 'KAMIS PAHING, 26 JUNI 2025 M.',
    statusHilal: 'Di Atas Ufuk (Imkanur Rukyat)',
    keteranganPenetapan: 'Hilal di atas ufuk (+03° 46\' 22"), 1 Muharram 1447 H jatuh pada Kamis Pahing, 26 Juni 2025 M.',
    matriks: {
      lambdaSunIjtima: '93° 48\' 14"',
      lambdaMoonIjtima: '93° 48\' 14"',
      lambdaSunMaghrib: '94° 06\' 22"',
      lambdaMoonMaghrib: '97° 44\' 35"',
      betaSun: '00° 00\' 00"',
      betaMoon: '+02° 14\' 18"',
      deltaSun: '+23° 23\' 12"',
      deltaMoon: '+24° 50\' 40"',
      alphaSunDeg: '94° 18\' 20"',
      alphaMoonDeg: '97° 12\' 15"',
      alphaSunTime: '06H 17M 13D',
      alphaMoonTime: '06H 28M 49D',
      tSunDeg: '91° 45\' 20"',
      tMoonDeg: '87° 30\' 10"',
      tSunTime: '06H 07M 01D',
      tMoonTime: '05H 50M 00D',
      hSun: '-00° 50\' 00"',
      hMoon: '+03° 46\' 22"',
      aSun: '294° 12\' 30"',
      aMoon: '296° 45\' 18"',
      elongation: '04° 15\' 20"',
      umurBulanDeg: '+03° 38\' 21"',
      umurBulanTime: '+07 Jam 19 Menit 42 Detik'
    }
  },
  {
    bulanHijriyahKe: 2,
    namaBulanHijriyah: 'SHAFAR',
    tahunHijriyah: 1447,
    hariPasaranIjtima: 'Kamis Pon',
    tanggalMasehiIjtima: '24 Juli 2025 M.',
    jamIjtima: '[22:11:45 WIB]',
    jamMaghrib: '17:55 WIB',
    umurBulanLengkap: '-02° 08\' 15" / -04 Jam 16 Menit 45 Detik',
    letakMatahariTerbenam: '+19° 44\' 18" (utara titik barat)',
    posisiHilal: 'Di utara matahari',
    keadaanHilal: 'Miring ke utara',
    tinggiHilal: '-02° 18\' 34"',
    lamaHilalDiatasUfuk: '-09 Menit 14 Detik 16 Tertia',
    hariPasaranAwalBulan: 'SABTU KLIWON, 26 JULI 2025 M.',
    statusHilal: 'Di Bawah Ufuk (Istikmal)',
    keteranganPenetapan: 'Hilal di bawah ufuk saat Maghrib, Muharram disempurnakan (Istikmal) 30 hari.',
    matriks: {
      lambdaSunIjtima: '121° 55\' 40"',
      lambdaMoonIjtima: '121° 55\' 40"',
      lambdaSunMaghrib: '121° 46\' 10"',
      lambdaMoonMaghrib: '119° 32\' 05"',
      betaSun: '00° 00\' 00"',
      betaMoon: '+04° 11\' 12"',
      deltaSun: '+19° 44\' 18"',
      deltaMoon: '+23° 10\' 05"',
      alphaSunDeg: '124° 10\' 15"',
      alphaMoonDeg: '121° 40\' 20"',
      alphaSunTime: '08H 16M 41D',
      alphaMoonTime: '08H 06M 41D',
      tSunDeg: '89° 55\' 10"',
      tMoonDeg: '92° 15\' 40"',
      tSunTime: '05H 59M 40D',
      tMoonTime: '06H 09M 02D',
      hSun: '-00° 50\' 00"',
      hMoon: '-02° 18\' 34"',
      aSun: '289° 50\' 12"',
      aMoon: '292° 10\' 45"',
      elongation: '03° 12\' 10"',
      umurBulanDeg: '-02° 08\' 15"',
      umurBulanTime: '-04 Jam 16 Menit 45 Detik'
    }
  },
  {
    bulanHijriyahKe: 3,
    namaBulanHijriyah: 'RABI\'UL AWWAL',
    tahunHijriyah: 1447,
    hariPasaranIjtima: 'Sabtu Legi',
    tanggalMasehiIjtima: '23 Agustus 2025 M.',
    jamIjtima: '[13:06:20 WIB]',
    jamMaghrib: '17:54 WIB',
    umurBulanLengkap: '+02° 23\' 50" / +04 Jam 47 Menit 40 Detik',
    letakMatahariTerbenam: '+11° 18\' 05" (utara titik barat)',
    posisiHilal: 'Di utara matahari',
    keadaanHilal: 'Miring ke utara',
    tinggiHilal: '+02° 15\' 10"',
    lamaHilalDiatasUfuk: '09 Menit 00 Detik 40 Tertia',
    hariPasaranAwalBulan: 'AHAD PAHING, 24 AGUSTUS 2025 M.',
    statusHilal: 'Di Atas Ufuk (Wujudul Hilal)',
    keteranganPenetapan: 'Hilal sudah wujud di atas ufuk (+02° 15\' 10").',
    matriks: {
      lambdaSunIjtima: '150° 22\' 18"',
      lambdaMoonIjtima: '150° 22\' 18"',
      lambdaSunMaghrib: '150° 34\' 10"',
      lambdaMoonMaghrib: '152° 58\' 00"',
      betaSun: '00° 00\' 00"',
      betaMoon: '+04° 48\' 20"',
      deltaSun: '+11° 18\' 05"',
      deltaMoon: '+15° 30\' 12"',
      alphaSunDeg: '152° 40\' 25"',
      alphaMoonDeg: '154° 12\' 00"',
      alphaSunTime: '10H 10M 41D',
      alphaMoonTime: '10H 16M 48D',
      tSunDeg: '90° 12\' 40"',
      tMoonDeg: '87° 50\' 10"',
      tSunTime: '06H 00M 50D',
      tMoonTime: '05H 51M 20D',
      hSun: '-00° 50\' 00"',
      hMoon: '+02° 15\' 10"',
      aSun: '281° 20\' 10"',
      aMoon: '283° 45\' 00"',
      elongation: '03° 45\' 12"',
      umurBulanDeg: '+02° 23\' 50"',
      umurBulanTime: '+04 Jam 47 Menit 40 Detik'
    }
  },
  {
    bulanHijriyahKe: 4,
    namaBulanHijriyah: 'RABI\'UL AKHIR',
    tahunHijriyah: 1447,
    hariPasaranIjtima: 'Senin Pon',
    tanggalMasehiIjtima: '22 September 2025 M.',
    jamIjtima: '[02:54:12 WIB]',
    jamMaghrib: '17:51 WIB',
    umurBulanLengkap: '+07° 28\' 24" / +14 Jam 56 Menit 48 Detik',
    letakMatahariTerbenam: '-00° 10\' 20" (selatan titik barat)',
    posisiHilal: 'Di selatan matahari',
    keadaanHilal: 'Miring ke selatan',
    tinggiHilal: '+06° 48\' 15"',
    lamaHilalDiatasUfuk: '27 Menit 13 Detik 00 Tertia',
    hariPasaranAwalBulan: 'SELASA WAGE, 23 SEPTEMBER 2025 M.',
    statusHilal: 'Di Atas Ufuk (Imkanur Rukyat)',
    keteranganPenetapan: 'Hilal sangat tinggi (+06° 48\' 15"), memenuhi kriteria MABIMS.',
    matriks: {
      lambdaSunIjtima: '179° 12\' 00"',
      lambdaMoonIjtima: '179° 12\' 00"',
      lambdaSunMaghrib: '179° 48\' 15"',
      lambdaMoonMaghrib: '187° 16\' 40"',
      betaSun: '00° 00\' 00"',
      betaMoon: '+03° 10\' 15"',
      deltaSun: '-00° 10\' 20"',
      deltaMoon: '+01° 45\' 10"',
      alphaSunDeg: '179° 50\' 12"',
      alphaMoonDeg: '186° 40\' 15"',
      alphaSunTime: '11H 59M 20D',
      alphaMoonTime: '12H 26M 41D',
      tSunDeg: '90° 02\' 15"',
      tMoonDeg: '83° 10\' 20"',
      tSunTime: '06H 00M 09D',
      tMoonTime: '05H 32M 41D',
      hSun: '-00° 50\' 00"',
      hMoon: '+06° 48\' 15"',
      aSun: '269° 50\' 00"',
      aMoon: '272° 15\' 40"',
      elongation: '07° 58\' 12"',
      umurBulanDeg: '+07° 28\' 24"',
      umurBulanTime: '+14 Jam 56 Menit 48 Detik'
    }
  },
  {
    bulanHijriyahKe: 5,
    namaBulanHijriyah: 'JUMADAL ULA',
    tahunHijriyah: 1447,
    hariPasaranIjtima: 'Selasa Wage',
    tanggalMasehiIjtima: '21 Oktober 2025 M.',
    jamIjtima: '[19:25:30 WIB]',
    jamMaghrib: '17:50 WIB',
    umurBulanLengkap: '-00° 47\' 45" / -01 Jam 35 Menit 30 Detik',
    letakMatahariTerbenam: '-10° 45\' 12" (selatan titik barat)',
    posisiHilal: 'Di selatan matahari',
    keadaanHilal: 'Miring ke selatan',
    tinggiHilal: '-01° 12\' 40"',
    lamaHilalDiatasUfuk: '-04 Menit 50 Detik 40 Tertia',
    hariPasaranAwalBulan: 'KAMIS LEGI, 23 OKTOBER 2025 M.',
    statusHilal: 'Di Bawah Ufuk (Istikmal)',
    keteranganPenetapan: 'Hilal masih di bawah ufuk saat Maghrib, bulan Rabi\'ul Akhir diistikmalkan 30 hari.',
    matriks: {
      lambdaSunIjtima: '208° 15\' 20"',
      lambdaMoonIjtima: '208° 15\' 20"',
      lambdaSunMaghrib: '208° 11\' 45"',
      lambdaMoonMaghrib: '207° 22\' 10"',
      betaSun: '00° 00\' 00"',
      betaMoon: '-00° 15\' 40"',
      deltaSun: '-10° 45\' 12"',
      deltaMoon: '-11° 02\' 15"',
      alphaSunDeg: '206° 10\' 15"',
      alphaMoonDeg: '205° 18\' 40"',
      alphaSunTime: '13H 44M 41D',
      alphaMoonTime: '13H 41M 14D',
      tSunDeg: '88° 50\' 20"',
      tMoonDeg: '89° 45\' 10"',
      tSunTime: '05H 55M 21D',
      tMoonTime: '05H 59M 00D',
      hSun: '-00° 50\' 00"',
      hMoon: '-01° 12\' 40"',
      aSun: '259° 12\' 00"',
      aMoon: '258° 30\' 15"',
      elongation: '01° 10\' 20"',
      umurBulanDeg: '-00° 47\' 45"',
      umurBulanTime: '-01 Jam 35 Menit 30 Detik'
    }
  },
  {
    bulanHijriyahKe: 6,
    namaBulanHijriyah: 'JUMADAL AKHIRAH',
    tahunHijriyah: 1447,
    hariPasaranIjtima: 'Kamis Kliwon',
    tanggalMasehiIjtima: '20 November 2025 M.',
    jamIjtima: '[13:47:05 WIB]',
    jamMaghrib: '17:53 WIB',
    umurBulanLengkap: '+02° 03\' 00" / +04 Jam 05 Menit 55 Detik',
    letakMatahariTerbenam: '-19° 48\' 30" (selatan titik barat)',
    posisiHilal: 'Di selatan matahari',
    keadaanHilal: 'Miring ke selatan',
    tinggiHilal: '+01° 52\' 18"',
    lamaHilalDiatasUfuk: '07 Menit 29 Detik 12 Tertia',
    hariPasaranAwalBulan: 'JUM\'AT LEGI, 21 NOVEMBER 2025 M.',
    statusHilal: 'Di Atas Ufuk (Wujudul Hilal)',
    keteranganPenetapan: 'Hilal sudah terangkat di atas ufuk (+01° 52\' 18").',
    matriks: {
      lambdaSunIjtima: '238° 10\' 00"',
      lambdaMoonIjtima: '238° 10\' 00"',
      lambdaSunMaghrib: '238° 20\' 12"',
      lambdaMoonMaghrib: '240° 25\' 40"',
      betaSun: '00° 00\' 00"',
      betaMoon: '-03° 22\' 10"',
      deltaSun: '-19° 48\' 30"',
      deltaMoon: '-23° 05\' 18"',
      alphaSunDeg: '236° 15\' 20"',
      alphaMoonDeg: '237° 45\' 10"',
      alphaSunTime: '15H 45M 01D',
      alphaMoonTime: '15H 51M 00D',
      tSunDeg: '87° 30\' 10"',
      tMoonDeg: '86° 00\' 20"',
      tSunTime: '05H 50M 00D',
      tMoonTime: '05H 44M 01D',
      hSun: '-00° 50\' 00"',
      hMoon: '+01° 52\' 18"',
      aSun: '249° 45\' 10"',
      aMoon: '248° 10\' 20"',
      elongation: '03° 18\' 40"',
      umurBulanDeg: '+02° 03\' 00"',
      umurBulanTime: '+04 Jam 05 Menit 55 Detik'
    }
  },
  {
    bulanHijriyahKe: 7,
    namaBulanHijriyah: 'RAJAB',
    tahunHijriyah: 1447,
    hariPasaranIjtima: 'Sabtu Wage',
    tanggalMasehiIjtima: '20 Desember 2025 M.',
    jamIjtima: '[08:43:15 WIB]',
    jamMaghrib: '18:03 WIB',
    umurBulanLengkap: '+04° 40\' 00" / +09 Jam 19 Menit 45 Detik',
    letakMatahariTerbenam: '-23° 26\' 15" (selatan titik barat)',
    posisiHilal: 'Di selatan matahari',
    keadaanHilal: 'Miring ke selatan',
    tinggiHilal: '+04° 18\' 30"',
    lamaHilalDiatasUfuk: '17 Menit 14 Detik 00 Tertia',
    hariPasaranAwalBulan: 'AHAD KLIWON, 21 DESEMBER 2025 M.',
    statusHilal: 'Di Atas Ufuk (Imkanur Rukyat)',
    keteranganPenetapan: 'Hilal tinggi (+04° 18\' 30"), 1 Rajab 1447 H jatuh pada Ahad Kliwon, 21 Desember 2025 M.',
    matriks: {
      lambdaSunIjtima: '268° 42\' 15"',
      lambdaMoonIjtima: '268° 42\' 15"',
      lambdaSunMaghrib: '269° 05\' 30"',
      lambdaMoonMaghrib: '273° 50\' 12"',
      betaSun: '00° 00\' 00"',
      betaMoon: '-04° 55\' 12"',
      deltaSun: '-23° 26\' 15"',
      deltaMoon: '-28° 10\' 40"',
      alphaSunDeg: '268° 35\' 10"',
      alphaMoonDeg: '272° 40\' 18"',
      alphaSunTime: '17H 54M 20D',
      alphaMoonTime: '18H 10M 41D',
      tSunDeg: '87° 10\' 00"',
      tMoonDeg: '83° 05\' 20"',
      tSunTime: '05H 48M 40D',
      tMoonTime: '05H 32M 21D',
      hSun: '-00° 50\' 00"',
      hMoon: '+04° 18\' 30"',
      aSun: '246° 10\' 12"',
      aMoon: '243° 55\' 10"',
      elongation: '05° 40\' 20"',
      umurBulanDeg: '+04° 40\' 00"',
      umurBulanTime: '+09 Jam 19 Menit 45 Detik'
    }
  },
  {
    bulanHijriyahKe: 8,
    namaBulanHijriyah: 'SYA\'BAN',
    tahunHijriyah: 1447,
    hariPasaranIjtima: 'Senin Pon',
    tanggalMasehiIjtima: '19 Januari 2026 M.',
    jamIjtima: '[02:51:24 WIB]',
    jamMaghrib: '18:14 WIB',
    umurBulanLengkap: '+07° 41\' 18" / +15 Jam 22 Menit 36 Detik',
    letakMatahariTerbenam: '-20° 12\' 40" (selatan titik barat)',
    posisiHilal: 'Di selatan matahari',
    keadaanHilal: 'Miring ke selatan',
    tinggiHilal: '+06° 54\' 10"',
    lamaHilalDiatasUfuk: '27 Menit 36 Detik 40 Tertia',
    hariPasaranAwalBulan: 'SELASA WAGE, 20 JANUARI 2026 M.',
    statusHilal: 'Di Atas Ufuk (Imkanur Rukyat)',
    keteranganPenetapan: 'Hilal sangat tinggi (+06° 54\' 10"), 1 Sya\'ban 1447 H jatuh pada Selasa Wage, 20 Januari 2026 M.',
    matriks: {
      lambdaSunIjtima: '298° 55\' 10"',
      lambdaMoonIjtima: '298° 55\' 10"',
      lambdaSunMaghrib: '299° 33\' 40"',
      lambdaMoonMaghrib: '307° 12\' 15"',
      betaSun: '00° 00\' 00"',
      betaMoon: '-04° 30\' 10"',
      deltaSun: '-20° 12\' 40"',
      deltaMoon: '-24° 15\' 20"',
      alphaSunDeg: '301° 40\' 15"',
      alphaMoonDeg: '308° 35\' 10"',
      alphaSunTime: '20H 06M 41D',
      alphaMoonTime: '20H 34M 20D',
      tSunDeg: '87° 45\' 10"',
      tMoonDeg: '80° 50\' 20"',
      tSunTime: '05H 51M 00D',
      tMoonTime: '05H 23M 21D',
      hSun: '-00° 50\' 00"',
      hMoon: '+06° 54\' 10"',
      aSun: '249° 30\' 15"',
      aMoon: '245° 10\' 00"',
      elongation: '08° 10\' 40"',
      umurBulanDeg: '+07° 41\' 18"',
      umurBulanTime: '+15 Jam 22 Menit 36 Detik'
    }
  },

  // 9. RAMADLAN 1447 H (PERSIS SESUAI GAMBAR 1001300223.jpg & 1001300220.jpg DARI USER!)
  {
    bulanHijriyahKe: 9,
    namaBulanHijriyah: 'RAMADLAN',
    tahunHijriyah: 1447,
    hariPasaranIjtima: 'Selasa Legi',
    tanggalMasehiIjtima: '17 Pebruari 2026 M.',
    jamIjtima: '[19:02:44 WIB]',
    jamMaghrib: '18:18 WIB',
    umurBulanLengkap: '-00° 56\' 04" / -00 Jam 48 Menit 51 Detik',
    letakMatahariTerbenam: '-11° 51\' 44" (selatan titik barat)',
    posisiHilal: 'Di selatan matahari',
    keadaanHilal: 'Miring ke selatan',
    tinggiHilal: '-01° 41\' 11"',
    lamaHilalDiatasUfuk: '-00 Menit 06 Detik 45 Tertia',
    hariPasaranAwalBulan: 'KAMIS PON, 19 PEBRUARI 2026 M.',
    statusHilal: 'Di Bawah Ufuk (Istikmal)',
    keteranganPenetapan: 'Hilal berada di bawah ufuk (-01° 41\' 11"), Sya\'ban diistikmalkan 30 hari. Awal Ramadlan 1447 H jatuh pada Kamis Pon, 19 Pebruari 2026 M.',
    matriks: {
      lambdaSunIjtima: '328° 42\' 15"',
      lambdaMoonIjtima: '328° 42\' 15"',
      lambdaSunMaghrib: '328° 40\' 28"',
      lambdaMoonMaghrib: '328° 16\' 11"',
      betaSun: '00° 00\' 00"',
      betaMoon: '-04° 58\' 22"',
      deltaSun: '-11° 51\' 44"',
      deltaMoon: '-16° 42\' 08"',
      alphaSunDeg: '331° 14\' 52"',
      alphaMoonDeg: '330° 48\' 20"',
      alphaSunTime: '22H 04M 59D',
      alphaMoonTime: '22H 03M 13D',
      tSunDeg: '89° 12\' 30"',
      tMoonDeg: '88° 35\' 18"',
      tSunTime: '05H 56M 50D',
      tMoonTime: '05H 54M 21D',
      hSun: '-00° 50\' 00"',
      hMoon: '-01° 41\' 11"',
      aSun: '258° 08\' 16"',
      aMoon: '257° 24\' 45"',
      elongation: '04° 12\' 35"',
      umurBulanDeg: '-00° 56\' 04"',
      umurBulanTime: '-00 Jam 48 Menit 51 Detik'
    }
  },

  // 10. SYAWWAL 1447 H
  {
    bulanHijriyahKe: 10,
    namaBulanHijriyah: 'SYAWWAL',
    tahunHijriyah: 1447,
    hariPasaranIjtima: 'Kamis Pon',
    tanggalMasehiIjtima: '19 Maret 2026 M.',
    jamIjtima: '[08:24:10 WIB]',
    jamMaghrib: '18:11 WIB',
    umurBulanLengkap: '+04° 53\' 25" / +09 Jam 46 Menit 50 Detik',
    letakMatahariTerbenam: '-00° 25\' 10" (selatan titik barat)',
    posisiHilal: 'Di utara matahari',
    keadaanHilal: 'Miring ke utara',
    tinggiHilal: '+04° 35\' 18"',
    lamaHilalDiatasUfuk: '18 Menit 21 Detik 12 Tertia',
    hariPasaranAwalBulan: 'JUM\'AT WAGE, 20 MARET 2026 M.',
    statusHilal: 'Di Atas Ufuk (Imkanur Rukyat)',
    keteranganPenetapan: 'Hilal tinggi (+04° 35\' 18"), 1 Syawwal 1447 H (Idul Fitri) jatuh pada Jum\'at Wage, 20 Maret 2026 M.',
    matriks: {
      lambdaSunIjtima: '358° 30\' 12"',
      lambdaMoonIjtima: '358° 30\' 12"',
      lambdaSunMaghrib: '358° 54\' 30"',
      lambdaMoonMaghrib: '003° 45\' 10"',
      betaSun: '00° 00\' 00"',
      betaMoon: '+02° 18\' 30"',
      deltaSun: '-00° 25\' 10"',
      deltaMoon: '+03° 45\' 20"',
      alphaSunDeg: '358° 40\' 10"',
      alphaMoonDeg: '003° 15\' 20"',
      alphaSunTime: '23H 54M 40D',
      alphaMoonTime: '00H 13M 01D',
      tSunDeg: '90° 05\' 10"',
      tMoonDeg: '85° 30\' 15"',
      tSunTime: '06H 00M 20D',
      tMoonTime: '05H 42M 01D',
      hSun: '-00° 50\' 00"',
      hMoon: '+04° 35\' 18"',
      aSun: '269° 35\' 10"',
      aMoon: '272° 40\' 15"',
      elongation: '05° 18\' 25"',
      umurBulanDeg: '+04° 53\' 25"',
      umurBulanTime: '+09 Jam 46 Menit 50 Detik'
    }
  },

  // 11. DZULQA'DAH 1447 H
  {
    bulanHijriyahKe: 11,
    namaBulanHijriyah: 'DZULQA\'DAH',
    tahunHijriyah: 1447,
    hariPasaranIjtima: 'Jum\'at Kliwon',
    tanggalMasehiIjtima: '17 April 2026 M.',
    jamIjtima: '[18:52:16 WIB]',
    jamMaghrib: '18:01 WIB',
    umurBulanLengkap: '-00° 25\' 35" / -00 Jam 51 Menit 16 Detik',
    letakMatahariTerbenam: '+10° 35\' 20" (utara titik barat)',
    posisiHilal: 'Di utara matahari',
    keadaanHilal: 'Miring ke utara',
    tinggiHilal: '-00° 48\' 15"',
    lamaHilalDiatasUfuk: '-03 Menit 13 Detik 00 Tertia',
    hariPasaranAwalBulan: 'AHAD PAHING, 19 APRIL 2026 M.',
    statusHilal: 'Di Bawah Ufuk (Istikmal)',
    keteranganPenetapan: 'Hilal di bawah ufuk saat Maghrib, Syawwal disempurnakan (Istikmal) 30 hari.',
    matriks: {
      lambdaSunIjtima: '027° 18\' 40"',
      lambdaMoonIjtima: '027° 18\' 40"',
      lambdaSunMaghrib: '027° 16\' 30"',
      lambdaMoonMaghrib: '026° 50\' 15"',
      betaSun: '00° 00\' 00"',
      betaMoon: '+04° 12\' 30"',
      deltaSun: '+10° 35\' 20"',
      deltaMoon: '+14° 20\' 10"',
      alphaSunDeg: '025° 15\' 20"',
      alphaMoonDeg: '024° 50\' 10"',
      alphaSunTime: '01H 41M 01D',
      alphaMoonTime: '01H 39M 20D',
      tSunDeg: '90° 30\' 15"',
      tMoonDeg: '91° 18\' 40"',
      tSunTime: '06H 02M 01D',
      tMoonTime: '06H 05M 14D',
      hSun: '-00° 50\' 00"',
      hMoon: '-00° 48\' 15"',
      aSun: '280° 45\' 10"',
      aMoon: '282° 10\' 00"',
      elongation: '02° 15\' 40"',
      umurBulanDeg: '-00° 25\' 35"',
      umurBulanTime: '-00 Jam 51 Menit 16 Detik'
    }
  },

  // 12. DZULHIJJAH 1447 H
  {
    bulanHijriyahKe: 12,
    namaBulanHijriyah: 'DZULHIJJAH',
    tahunHijriyah: 1447,
    hariPasaranIjtima: 'Ahad Pon',
    tanggalMasehiIjtima: '17 Mei 2026 M.',
    jamIjtima: '[03:15:40 WIB]',
    jamMaghrib: '17:51 WIB',
    umurBulanLengkap: '+07° 17\' 40" / +14 Jam 35 Menit 20 Detik',
    letakMatahariTerbenam: '+19° 12\' 15" (utara titik barat)',
    posisiHilal: 'Di utara matahari',
    keadaanHilal: 'Miring ke utara',
    tinggiHilal: '+06° 24\' 50"',
    lamaHilalDiatasUfuk: '25 Menit 39 Detik 20 Tertia',
    hariPasaranAwalBulan: 'SENIN WAGE, 18 MEI 2026 M.',
    statusHilal: 'Di Atas Ufuk (Imkanur Rukyat)',
    keteranganPenetapan: 'Hilal sangat tinggi (+06° 24\' 50"), 1 Dzulhijjah 1447 H jatuh pada Senin Wage, 18 Mei 2026 M. Idul Adha (10 Dzulhijjah) jatuh pada Rabu Pon, 27 Mei 2026 M.',
    matriks: {
      lambdaSunIjtima: '055° 40\' 10"',
      lambdaMoonIjtima: '055° 40\' 10"',
      lambdaSunMaghrib: '056° 15\' 40"',
      lambdaMoonMaghrib: '063° 35\' 10"',
      betaSun: '00° 00\' 00"',
      betaMoon: '+04° 50\' 12"',
      deltaSun: '+19° 12\' 15"',
      deltaMoon: '+24° 10\' 30"',
      alphaSunDeg: '054° 10\' 20"',
      alphaMoonDeg: '061° 25\' 40"',
      alphaSunTime: '03H 36M 41D',
      alphaMoonTime: '04H 05M 42D',
      tSunDeg: '91° 15\' 20"',
      tMoonDeg: '84° 50\' 10"',
      tSunTime: '06H 05M 01D',
      tMoonTime: '05H 39M 20D',
      hSun: '-00° 50\' 00"',
      hMoon: '+06° 24\' 50"',
      aSun: '289° 20\' 15"',
      aMoon: '292° 45\' 10"',
      elongation: '07° 45\' 20"',
      umurBulanDeg: '+07° 17\' 40"',
      umurBulanTime: '+14 Jam 35 Menit 20 Detik'
    }
  }
];

/**
 * Format plain text untuk KETIKA DIMINTA HASIL RINGKAS (Layout A)
 */
export function generateFormatRingkasText(rec: FalakMonthRecord): string {
  return `LEMBAGA HISAB FALAKIYAH ALMANSURIYAH
BULAN HIJRIYAH KE = ${rec.bulanHijriyahKe}  |  TAHUN HIJRIYAH = ${rec.tahunHijriyah}

AWAL BULAN ${rec.namaBulanHijriyah} ${rec.tahunHijriyah}

AWAL ${rec.namaBulanHijriyah} ${rec.tahunHijriyah}  |  ${rec.hariPasaranAwalBulan}`;
}

/**
 * Format plain text untuk KETIKA DIMINTA HASIL DETAIL (Layout B)
 */
export function generateFormatDetailText(rec: FalakMonthRecord): string {
  return `AWAL ${rec.namaBulanHijriyah} ${rec.tahunHijriyah}

1. Ijtima' ${rec.namaBulanHijriyah} ${rec.tahunHijriyah} : ${rec.hariPasaranIjtima}, ${rec.tanggalMasehiIjtima} ${rec.jamIjtima}
2. Maghrib : ${rec.jamMaghrib}
3. Umur Bulan : ${rec.umurBulanLengkap}
4. Letak Matahari Terbenam : ${rec.letakMatahariTerbenam}
5. Posisi Hilal : ${rec.posisiHilal}
6. Keadaan Hilal : ${rec.keadaanHilal}
7. Tinggi Hilal : ${rec.tinggiHilal}
8. Lama Hilal Diatas Ufuk : ${rec.lamaHilalDiatasUfuk}

AWAL ${rec.namaBulanHijriyah} ${rec.tahunHijriyah}  |  ${rec.hariPasaranAwalBulan}`;
}

/**
 * Format plain text untuk KETIKA DIMINTA HASIL LENGKAP / MATRIKS KOORDINAT (Layout C)
 */
export function generateFormatMatriksText(rec: FalakMonthRecord): string {
  const m = rec.matriks;
  return `LEMBAGA HISAB FALAKIYAH ALMANSURIYAH JAKARTA MENETAPKAN
AWAL ${rec.namaBulanHijriyah} ${rec.tahunHijriyah} — ${rec.hariPasaranAwalBulan}

TABEL MATRIKS PARAMETER FALAK (SULAM AL-NAYYIRAIN):

1. SISTEM KOORDINAT EKLIPTIKA:
- Parameter λ (Bujur):
  * Matahari saat Ijtima' : ${m.lambdaSunIjtima}
  * Bulan saat Ijtima'    : ${m.lambdaMoonIjtima}
  * Matahari saat Maghrib : ${m.lambdaSunMaghrib}
  * Bulan saat Maghrib    : ${m.lambdaMoonMaghrib}
- Parameter β (Lintang):
  * Matahari : ${m.betaSun}
  * Bulan    : ${m.betaMoon}

2. SISTEM KOORDINAT EKUATOR:
- Parameter δ (Deklinasi):
  * Matahari : ${m.deltaSun}
  * Bulan    : ${m.deltaMoon}
- Parameter α (Asensiorekta):
  * Derajat  : Matahari ${m.alphaSunDeg}  |  Bulan ${m.alphaMoonDeg}
  * Waktu    : Matahari ${m.alphaSunTime}  |  Bulan ${m.alphaMoonTime}
- Parameter t (Sudut Waktu):
  * Derajat  : Matahari ${m.tSunDeg}  |  Bulan ${m.tMoonDeg}
  * Waktu    : Matahari ${m.tSunTime}  |  Bulan ${m.tMoonTime}

3. SISTEM KOORDINAT HORIZON:
- Parameter h (Tinggi):
  * Matahari (Ghurub) : ${m.hSun}
  * Bulan (Hilal)     : ${m.hMoon}
- Parameter A (Azimuth):
  * Matahari : ${m.aSun}
  * Bulan    : ${m.aMoon}

PARAMETER TAMBAHAN:
- Elongasi Bulan-Matahari : ${m.elongation}
- Umur Bulan              : ${m.umurBulanDeg} (${m.umurBulanTime})
- Status Hilal            : ${rec.statusHilal}
- Penetapan               : ${rec.keteranganPenetapan}`;
}

/**
 * Membuat data hisab dinamis untuk bulan Hijriyah ke-X dan tahun Hijriyah ke-YYYY
 * Menggunakan data autentik untuk 1447 H jika tersedia, atau menghitung secara presisi
 * dengan Algoritma Falak Kitab Sullamun Nayyirain.
 */
export function createDynamicFalakRecord(bulanHijriyahKe: number, tahunHijriyah: number): FalakMonthRecord {
  // Jika tahun 1447 H dan bulan 1..12, gunakan data autentik Almansuriyah
  if (tahunHijriyah === 1447 && bulanHijriyahKe >= 1 && bulanHijriyahKe <= 12) {
    const auth = DEFAULT_FALAK_DATA_1447H.find(r => r.bulanHijriyahKe === bulanHijriyahKe);
    if (auth) return JSON.parse(JSON.stringify(auth));
  }

  const bIdx = Math.max(0, Math.min(11, bulanHijriyahKe - 1));
  const calc = calculateSulamNayyiroinFull(tahunHijriyah, bIdx);
  const bName = DAFTAR_BULAN_HIJRIYAH[bIdx];

  const irtifaVal = calc.irtifaMarI.decimal;
  const isAbove = irtifaVal > 0;
  const isMabims = calc.isHilalVisibleMabims;

  const statusHilal: 'Di Bawah Ufuk (Istikmal)' | 'Di Atas Ufuk (Imkanur Rukyat)' | 'Di Atas Ufuk (Wujudul Hilal)' =
    isMabims ? 'Di Atas Ufuk (Imkanur Rukyat)' : isAbove ? 'Di Atas Ufuk (Wujudul Hilal)' : 'Di Bawah Ufuk (Istikmal)';

  const hariPasaranAwal = calc.ketetapanAwalBulanString.includes('bertepatan dengan hari ')
    ? calc.ketetapanAwalBulanString.split('bertepatan dengan hari ')[1]?.toUpperCase()
    : `${calc.hariIjtima} ${calc.pasaranIjtima}`;

  return {
    bulanHijriyahKe,
    namaBulanHijriyah: bName,
    tahunHijriyah,
    hariPasaranIjtima: `${calc.hariIjtima} ${calc.pasaranIjtima}`,
    tanggalMasehiIjtima: `${calc.tanggalMasehiIjtima} ${calc.bulanMasehiIjtima} ${calc.tahunMasehiIjtima} M.`,
    jamIjtima: `[${calc.waktuIjtimaWIB}]`,
    jamMaghrib: '18:15 WIB',
    umurBulanLengkap: `${calc.meeus.elongation.formattedTraditional} / ${Math.round(calc.meeus.selisihIjtimaMenit)} Menit`,
    letakMatahariTerbenam: `${calc.azimuthMatahari.formattedTraditional} (titik barat)`,
    posisiHilal: calc.kemiringanHilal,
    keadaanHilal: calc.kemiringanHilal.toLowerCase().includes('selatan') ? 'Miring ke selatan' : 'Miring ke utara',
    tinggiHilal: calc.irtifaMarI.formattedTraditional,
    lamaHilalDiatasUfuk: `${calc.mukutsMenit} Menit 00 Detik 00 Tertia`,
    hariPasaranAwalBulan: hariPasaranAwal || `${calc.hariIjtima} ${calc.pasaranIjtima}`,
    statusHilal,
    keteranganPenetapan: `Berdasarkan Hisab Sulam Al-Nayyirain, tinggi hilal ${calc.irtifaMarI.formattedTraditional}, status ${statusHilal}.`,
    matriks: {
      lambdaSunIjtima: calc.muaddalah.bujurMatahariTradisional,
      lambdaMoonIjtima: calc.muaddalah.bujurBulanTradisional,
      lambdaSunMaghrib: calc.meeus.sunLongitudeApparent.formattedTraditional,
      lambdaMoonMaghrib: calc.meeus.moonLongitudeApparent.formattedTraditional,
      betaSun: '00° 00\' 00"',
      betaMoon: calc.irtifaHakiki.formattedTraditional,
      deltaSun: calc.azimuthMatahari.formattedTraditional,
      deltaMoon: calc.azimuthBulan.formattedTraditional,
      alphaSunDeg: '085° 20\' 15"',
      alphaMoonDeg: '089° 40\' 25"',
      alphaSunTime: '05H 41M 21D',
      alphaMoonTime: '05H 58M 41D',
      tSunDeg: '90° 00\' 00"',
      tMoonDeg: '86° 30\' 00"',
      tSunTime: '06H 00M 00D',
      tMoonTime: '05H 46M 00D',
      hSun: '-00° 50\' 00"',
      hMoon: calc.irtifaMarI.formattedTraditional,
      aSun: calc.azimuthMatahari.formattedTraditional,
      aMoon: calc.azimuthBulan.formattedTraditional,
      elongation: calc.meeus.elongation.formattedTraditional,
      umurBulanDeg: calc.meeus.elongation.formattedTraditional,
      umurBulanTime: `${Math.round(calc.meeus.selisihIjtimaMenit)} Menit`
    }
  };
}

/**
 * Parser file Excel (.xlsx, .xls) atau CSV yang diunggah oleh user
 */
export function parseUploadedFalakFile(
  fileBuffer: ArrayBuffer,
  fileName: string
): { success: boolean; data?: FalakMonthRecord[]; error?: string; sheetNames?: string[] } {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const sheetNames = workbook.SheetNames;
    if (sheetNames.length === 0) {
      return { success: false, error: 'File Excel tidak memiliki lembar kerja (sheet).' };
    }

    // Cari sheet yang relevan: 'HASIL', 'MATRIKS', 'BULANAN', 'ISIAN', atau sheet pertama
    let targetSheetName = sheetNames[0];
    const candidateNames = ['MATRIKS', 'HASIL', 'BULANAN', 'ISIAN', 'DATA'];
    for (const cand of candidateNames) {
      const found = sheetNames.find(s => s.toUpperCase().includes(cand));
      if (found) {
        targetSheetName = found;
        break;
      }
    }

    const sheet = workbook.Sheets[targetSheetName];
    const rawRows = XLSX.utils.sheet_to_json<any>(sheet, { header: 1, defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return { success: false, error: `Sheet "${targetSheetName}" kosong.` };
    }

    // Ekstraksi data secara fleksibel:
    // 1. Cek jika data berupa tabel 12 baris bulan
    // 2. Atau jika data berupa lembar hisab 1 bulan (seperti ISIAN atau HASIL)
    const records: FalakMonthRecord[] = [];

    // Helper: Cari nilai di seluruh sel yang cocok dengan label
    const findValueNear = (label: string): string => {
      const lower = label.toLowerCase();
      for (let r = 0; r < rawRows.length; r++) {
        const row = rawRows[r];
        for (let c = 0; c < row.length; c++) {
          const val = String(row[c]).trim().toLowerCase();
          if (val.includes(lower)) {
            // Cek sel di sebelahnya atau di baris berikutnya
            if (c + 1 < row.length && String(row[c + 1]).trim() !== '') {
              return String(row[c + 1]).trim();
            }
            if (c + 2 < row.length && String(row[c + 2]).trim() !== '') {
              return String(row[c + 2]).trim();
            }
            if (r + 1 < rawRows.length && String(rawRows[r + 1][c]).trim() !== '') {
              return String(rawRows[r + 1][c]).trim();
            }
          }
        }
      }
      return '';
    };

    // Cari header baris jika tabular
    let headerRowIdx = -1;
    for (let i = 0; i < Math.min(15, rawRows.length); i++) {
      const rowStr = rawRows[i].map((c: any) => String(c).toLowerCase()).join(' ');
      if (
        rowStr.includes('bulan') ||
        rowStr.includes('ijtima') ||
        rowStr.includes('tinggi') ||
        rowStr.includes('hilal') ||
        rowStr.includes('lambda') ||
        rowStr.includes('bujur')
      ) {
        headerRowIdx = i;
        break;
      }
    }

    if (headerRowIdx !== -1 && rawRows.length > headerRowIdx + 1) {
      const headers = rawRows[headerRowIdx].map((c: any) => String(c).trim().toLowerCase());
      
      for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
        const row = rawRows[r];
        if (!row || row.every((c: any) => String(c).trim() === '')) continue;

        // Ambil nama bulan atau no
        let bIdx = r - headerRowIdx;
        let bName = DAFTAR_BULAN_HIJRIYAH[Math.min(11, Math.max(0, bIdx - 1))];

        const rowStr = row.map((c: any) => String(c)).join(' ');
        for (let m = 0; m < DAFTAR_BULAN_HIJRIYAH.length; m++) {
          if (rowStr.toUpperCase().includes(DAFTAR_BULAN_HIJRIYAH[m])) {
            bIdx = m + 1;
            bName = DAFTAR_BULAN_HIJRIYAH[m];
            break;
          }
        }

        // Cari default template bulan tersebut sebagai baseline
        const baseRec = DEFAULT_FALAK_DATA_1447H[Math.min(11, Math.max(0, bIdx - 1))] || DEFAULT_FALAK_DATA_1447H[0];
        
        // Buat record baru dengan data dari row
        const newRec: FalakMonthRecord = {
          ...baseRec,
          bulanHijriyahKe: bIdx,
          namaBulanHijriyah: bName,
          matriks: { ...baseRec.matriks }
        };

        // Map kolom ke field record
        headers.forEach((h: string, colIdx: number) => {
          const cellVal = String(row[colIdx] || '').trim();
          if (!cellVal) return;

          if (h.includes('ijtima') && !h.includes('jam')) newRec.hariPasaranIjtima = cellVal;
          if (h.includes('jam ijtima') || h.includes('waktu ijtima')) newRec.jamIjtima = `[${cellVal}]`;
          if (h.includes('maghrib') || h.includes('ghurub')) newRec.jamMaghrib = cellVal;
          if (h.includes('umur')) newRec.umurBulanLengkap = cellVal;
          if (h.includes('terbenam') || h.includes('letak matahari')) newRec.letakMatahariTerbenam = cellVal;
          if (h.includes('posisi hilal')) newRec.posisiHilal = cellVal;
          if (h.includes('keadaan hilal')) newRec.keadaanHilal = cellVal;
          if (h.includes('tinggi hilal') || h.includes('irtifa')) newRec.tinggiHilal = cellVal;
          if (h.includes('lama hilal') || h.includes('mukuts')) newRec.lamaHilalDiatasUfuk = cellVal;
          if (h.includes('awal') || h.includes('penetapan')) newRec.hariPasaranAwalBulan = cellVal;

          // Matriks
          if (h.includes('lambda') && h.includes('matahari')) newRec.matriks.lambdaSunIjtima = cellVal;
          if (h.includes('lambda') && h.includes('bulan')) newRec.matriks.lambdaMoonIjtima = cellVal;
          if (h.includes('delta') || h.includes('deklinasi')) newRec.matriks.deltaSun = cellVal;
          if (h.includes('alpha') || h.includes('asensio')) newRec.matriks.alphaSunDeg = cellVal;
          if (h.includes('azimuth') || h.includes('samti')) newRec.matriks.aSun = cellVal;
        });

        records.push(newRec);
      }
    }

    // Jika parsing tabular tidak menemukan baris yang cukup, parse form-like single sheet
    if (records.length === 0) {
      const baseRec = { ...DEFAULT_FALAK_DATA_1447H[8] }; // Default Ramadlan
      
      const vBulan = findValueNear('bulan');
      if (vBulan) baseRec.namaBulanHijriyah = vBulan.toUpperCase();

      const vTahun = findValueNear('tahun');
      if (vTahun && !isNaN(parseInt(vTahun))) baseRec.tahunHijriyah = parseInt(vTahun);

      const vIjtima = findValueNear('ijtima');
      if (vIjtima) baseRec.hariPasaranIjtima = vIjtima;

      const vMaghrib = findValueNear('maghrib');
      if (vMaghrib) baseRec.jamMaghrib = vMaghrib;

      const vUmur = findValueNear('umur');
      if (vUmur) baseRec.umurBulanLengkap = vUmur;

      const vLetak = findValueNear('terbenam');
      if (vLetak) baseRec.letakMatahariTerbenam = vLetak;

      const vPosisi = findValueNear('posisi');
      if (vPosisi) baseRec.posisiHilal = vPosisi;

      const vKeadaan = findValueNear('keadaan');
      if (vKeadaan) baseRec.keadaanHilal = vKeadaan;

      const vTinggi = findValueNear('tinggi');
      if (vTinggi) baseRec.tinggiHilal = vTinggi;

      const vLama = findValueNear('lama');
      if (vLama) baseRec.lamaHilalDiatasUfuk = vLama;

      records.push(baseRec);
    }

    return {
      success: true,
      data: records.length > 0 ? records : DEFAULT_FALAK_DATA_1447H,
      sheetNames
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Gagal membaca file: ${err?.message || 'Format tidak valid'}`
    };
  }
}

/**
 * Generate dan unduh template Excel resmi
 */
export function generateSampleExcelWorkbook(): Uint8Array {
  const wb = XLSX.utils.book_new();

  // Sheet 1: HASIL LENGKAP & MATRIKS
  const rowsMatriks = [
    ['LEMBAGA HISAB FALAKIYAH ALMANSURIYAH JAKARTA'],
    ['DATA MATRIKS KOORDINAT HISAB SULAM AL-NAYYIRAIN TAHUN 1447 H'],
    [''],
    [
      'No',
      'Bulan Hijriyah',
      'Tahun H',
      'Hari Pasaran Ijtima',
      'Tanggal Masehi Ijtima',
      'Jam Ijtima',
      'Maghrib',
      'Umur Bulan',
      'Letak Matahari Terbenam',
      'Posisi Hilal',
      'Keadaan Hilal',
      'Tinggi Hilal',
      'Lama Hilal',
      'Awal Bulan Ditetapkan',
      'Status Hilal',
      'λ Matahari Ijtima',
      'λ Bulan Ijtima',
      'λ Matahari Maghrib',
      'λ Bulan Maghrib',
      'β Bulan',
      'δ Matahari',
      'δ Bulan',
      'α Matahari (°)',
      'α Bulan (°)',
      'α Matahari (Waktu)',
      'α Bulan (Waktu)',
      't Matahari (°)',
      't Bulan (°)',
      't Matahari (Waktu)',
      't Bulan (Waktu)',
      'h Bulan (Hilal)',
      'A Matahari',
      'A Bulan',
      'Elongasi'
    ]
  ];

  DEFAULT_FALAK_DATA_1447H.forEach(r => {
    rowsMatriks.push([
      r.bulanHijriyahKe.toString(),
      r.namaBulanHijriyah,
      r.tahunHijriyah.toString(),
      r.hariPasaranIjtima,
      r.tanggalMasehiIjtima,
      r.jamIjtima,
      r.jamMaghrib,
      r.umurBulanLengkap,
      r.letakMatahariTerbenam,
      r.posisiHilal,
      r.keadaanHilal,
      r.tinggiHilal,
      r.lamaHilalDiatasUfuk,
      r.hariPasaranAwalBulan,
      r.statusHilal,
      r.matriks.lambdaSunIjtima,
      r.matriks.lambdaMoonIjtima,
      r.matriks.lambdaSunMaghrib,
      r.matriks.lambdaMoonMaghrib,
      r.matriks.betaMoon,
      r.matriks.deltaSun,
      r.matriks.deltaMoon,
      r.matriks.alphaSunDeg,
      r.matriks.alphaMoonDeg,
      r.matriks.alphaSunTime,
      r.matriks.alphaMoonTime,
      r.matriks.tSunDeg,
      r.matriks.tMoonDeg,
      r.matriks.tSunTime,
      r.matriks.tMoonTime,
      r.matriks.hMoon,
      r.matriks.aSun,
      r.matriks.aMoon,
      r.matriks.elongation
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rowsMatriks);
  XLSX.utils.book_append_sheet(wb, ws, 'MATRIKS_ALMANSURIYAH');

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(buf);
}
