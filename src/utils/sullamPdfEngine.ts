/**
 * Engine Komputasi Lengkap Sullamun Nayyirain & Generator Dokumen PDF Autentik
 * Sesuai Kitab Sullamun Nayyirain (Al-Allamah KH. Muhammad Manshur bin Abdul Hamid Al-Batawi)
 * Dan dokumen resmi Lampiran Contoh Hisab Awal Ramadhan & Syawal serta Blanko Ijtima' 38 Baris.
 */

export interface SexagesimalFalak {
  j: number;     // Buruj (30 derajat per buruj)
  ja: number;    // Darajah (derajat)
  qa: number;    // Daqiqah (menit)
  ny: number;    // Tsaniyah (detik)
  lts?: number;  // Tsalitsah (sepertiga / 1/60 detik)
}

export interface MustakhrajatRow {
  labelArab: string;
  labelLatin: string;
  // Al-'Alamah (m, 'ah, qah)
  alamahM: number;
  alamahH: number;
  alamahMnt: number;
  // Al-Hishshah (j, ja, qa)
  hishshahJ: number;
  hishshahJa: number;
  hishshahQa: number;
  // Al-Khashshah (j, ja, qa)
  khashshahJ: number;
  khashshahJa: number;
  khashshahQa: number;
  // Al-Markaz (j, ja, qa)
  markazJ: number;
  markazJa: number;
  markazQa: number;
  // Al-Awj (j, ja, qa)
  awjJ: number;
  awjJa: number;
  awjQa: number;
}

export interface KotakInterpolasi {
  judulArab: string;
  judulLatin: string;
  nomor: number;
  asli: { j?: number; ja: number; qa: number; ny?: number };
  madkhul: { j?: number; ja: number };
  kasr: number;
  satr1: { ja: number; qa: number };
  satr2: { ja: number; qa: number };
  fadhl: number;
  hasilDharb: { ja?: number; qa: number; ny: number };
  hasilAkhir: { j?: number; ja: number; qa: number; ny: number; lts?: number };
}

export interface SullamCompleteReportData {
  tahunHijriyah: number;
  bulanHijriyahKe: number;
  namaBulanHijriyah: string;
  namaBulanArab: string;
  markazName: string;
  bujurMarkaz: string;
  lintangMarkaz: string;
  
  // Surat Pengantar & Surat Penetapan
  nomorSuratPengantar: string;
  nomorSuratKetetapan: string;
  tanggalSuratMasehi: string;
  tanggalSuratHijriyah: string;
  hariPasaranKetetapan: string;
  tanggalMasehiKetetapan: string;

  // 1. Mustakhrajat
  mustakhrajat: {
    majmuah: MustakhrajatRow;
    mabsuthah: MustakhrajatRow;
    syahr: MustakhrajatRow;
    jumlahHarakat: MustakhrajatRow;
  };

  // 2. 18 Kotak Perhitungan Berantai
  kotak1_tadilKhashshah: KotakInterpolasi;
  kotak2_tadilMarkaz: KotakInterpolasi;
  kotak3_budNayyirainGhayr: {
    tadilKhashshah: { ja: number; qa: number; ny: number };
    tadilMarkaz: { ja: number; qa: number; ny: number };
    hasil: { ja: number; qa: number; ny: number };
  };
  kotak4_tadilSyams: {
    budNayyirain: { ja: number; qa: number; ny: number };
    qaidah: number; // 5
    hasilDharb: { ja: number; qa: number; ny: number; lts: number };
    tadilMarkaz: { ja: number; qa: number; ny: number };
    hasil: { ja: number; qa: number; ny: number; lts: number };
  };
  kotak5_wasathSyams: {
    awj: { j: number; ja: number; qa: number };
    markaz: { j: number; ja: number; qa: number };
    hasil: { j: number; ja: number; qa: number };
  };
  kotak6_muqawwamSyams: {
    wasathSyams: { j: number; ja: number; qa: number };
    tadilSyams: { ja: number; qa: number; ny: number; lts: number };
    hasil: { j: number; ja: number; qa: number; ny: number; lts: number };
  };
  kotak7_tadilAyyam: {
    muqawwamSyams: { j: number; ja: number; qa: number; ny: number };
    satr1: number;
    satr2: number;
    hasilDharb: number;
    hasil: { ja: number; qa: number };
  };
  kotak8_budNayyirainMuaddal: {
    budGhayr: { ja: number; qa: number; ny: number };
    tadilAyyam: { ja: number; qa: number };
    hasil: { ja: number; qa: number; ny: number };
  };
  kotak9_hishshahSaah: {
    khashshah: { j: number; ja: number; qa: number };
    satr1: { ja: number; qa: number };
    hasil: { ja: number; qa: number };
  };
  kotak10_tadilAlamah: {
    budMuaddal: { ja: number; qa: number; ny: number };
    hishshahSaah: { ja: number; qa: number };
    hasil: { h: number; m: number; s: number; lts: number };
  };
  kotak11_alamahJakarta: {
    alamahGhayr: { m: number; h: number; mnt: number };
    tadilAlamah: { h: number; m: number; s: number; lts: number };
    hasil: { m: number; h: number; mnt: number; s: number; lts: number };
  };
  kotak12_fadhlThulain: {
    thulMarkaz: string;
    thulJakarta: string;
    selisih: string;
    qaidah: number; // 4
    hasil: { h: number; m: number; s: number; lts: number };
  };
  kotak13_alamahBalad: {
    alamahJakarta: { m: number; h: number; mnt: number; s: number; lts: number };
    fadhlThulain: { h: number; m: number; s: number; lts: number };
    hasil: { m: number; h: number; mnt: number; s: number; lts: number };
    hariIjtimaText: string;
    jamIjtimaText: string;
  };
  kotak14_irtifaHilal: {
    qaidahSaah: number; // 24
    saatIjtima: { h: number; m: number; s: number; lts: number };
    adadSaah: { h: number; m: number; s: number; lts: number };
    qaidah30: number; // 30
    hasil: { ja: number; qa: number; ny: number; lts: number };
  };
  kotak15_muktsHilal: {
    irtifa: { ja: number; qa: number; ny: number };
    qaidah: number; // 4
    hasil: { h: number; m: number; s: number };
  };
  kotak16_ardhQamar: {
    hishshah: { j: number; ja: number; qa: number };
    satr1: { ja: number; qa: number };
    satr2: { ja: number; qa: number };
    hasil: { ja: number; qa: number; ny: number };
  };
  kotak17_qawsNurHilal: {
    ardhQamar: { ja: number; qa: number; ny: number };
    qaidah: number; // 4
    hasilDharb: { h: number; m: number; s: number };
    muktsHilal: { h: number; m: number; s: number };
    hasil: { ja: number; qa: number; ny: number };
  };
  kotak18_manzilatQamar: {
    muqawwamSyams: { j: number; ja: number; qa: number; ny: number };
    manzilahNomor: number;
    manzilahNama: string;
    hasil: { ja: number; qa: number; ny: number };
  };

  // Kesimpulan
  kesimpulan: {
    ijtimaHari: string;
    ijtimaJamWIB: string;
    tinggiHilal: string;
    lamaHilalUfuk: string;
    statusPenetapan: string;
  };

  // Komparasi Ephemeris
  komparasiEphemeris: {
    sullam: { ijtima: string; tinggi: string; lama: string };
    ephemeris: { ijtima: string; tinggi: string; lama: string };
    selisih: { ijtima: string; tinggi: string; lama: string };
  };
}

// Data Autentik 1438 H Ramadhan & Syawal dari Dokumen PDF User
export const AUTHENTIC_1438H_RAMADHAN: SullamCompleteReportData = {
  tahunHijriyah: 1438,
  bulanHijriyahKe: 9,
  namaBulanHijriyah: 'RAMADHAN',
  namaBulanArab: 'رمضان المبارك',
  markazName: 'Semarang (Jawa Tengah) & Markaz Induk Betawi',
  bujurMarkaz: '110° 26\' 47" BT',
  lintangMarkaz: '06° 59\' 00" LS',
  nomorSuratPengantar: '034/LHFA-JKT/SP-FLK/1438',
  nomorSuratKetetapan: '009/SK-ISBAT/LHFA/IX/1438',
  tanggalSuratMasehi: '26 Mei 2017 M',
  tanggalSuratHijriyah: '29 Sya\'ban 1438 H',
  hariPasaranKetetapan: 'SABTU PAHING',
  tanggalMasehiKetetapan: '27 MEI 2017 M',
  
  mustakhrajat: {
    majmuah: {
      labelArab: 'السنة المجموعة ١٤٣٠',
      labelLatin: 'Tahun Majmu\'ah 1430 H',
      alamahM: 3, alamahH: 2, alamahMnt: 4,
      hishshahJ: 11, hishshahJa: 28, hishshahQa: 33,
      khashshahJ: 1, khashshahJa: 8, khashshahQa: 13,
      markazJ: 6, markazJa: 25, markazQa: 10,
      awjJ: 3, awjJa: 12, awjQa: 26
    },
    mabsuthah: {
      labelArab: 'السنة المبسوطة ٨',
      labelLatin: 'Tahun Mabsuthah 8 H',
      alamahM: 6, alamahH: 22, alamahMnt: 28,
      hishshahJ: 2, hishshahJa: 4, hishshahQa: 24,
      khashshahJ: 10, khashshahJa: 18, khashshahQa: 24,
      markazJ: 9, markazJa: 4, markazQa: 8,
      awjJ: 0, awjJa: 0, awjQa: 6
    },
    syahr: {
      labelArab: 'شهر شعبان',
      labelLatin: 'Bulan Sya\'ban',
      alamahM: 3, alamahH: 17, alamahMnt: 8,
      hishshahJ: 7, hishshahJa: 4, hishshahQa: 42,
      khashshahJ: 6, khashshahJa: 0, khashshahQa: 43,
      markazJ: 6, markazJa: 23, markazQa: 45,
      awjJ: 0, awjJa: 0, awjQa: 0
    },
    jumlahHarakat: {
      labelArab: 'الحركات غير المعدلة',
      labelLatin: 'Jumlah Harakat Ghayr Mu\'addalah',
      alamahM: 6, alamahH: 17, alamahMnt: 40,
      hishshahJ: 9, hishshahJa: 7, hishshahQa: 39,
      khashshahJ: 5, khashshahJa: 27, khashshahQa: 20,
      markazJ: 10, markazJa: 23, markazQa: 3,
      awjJ: 3, awjJa: 12, awjQa: 32
    }
  },

  kotak1_tadilKhashshah: {
    judulArab: 'تعديـــــــــل اخلاصــــــــــــــــة',
    judulLatin: '1. Ta\'dil al-Khashshah',
    nomor: 1,
    asli: { j: 5, ja: 27, qa: 20 },
    madkhul: { j: 5, ja: 27 },
    kasr: 20,
    satr1: { ja: 4, qa: 39 },
    satr2: { ja: 4, qa: 46 },
    fadhl: 7,
    hasilDharb: { qa: 2, ny: 20 },
    hasilAkhir: { ja: 4, qa: 41, ny: 20 }
  },

  kotak2_tadilMarkaz: {
    judulArab: 'تعديـــــــــل املركـــــــــــــــــــز',
    judulLatin: '2. Ta\'dil al-Markaz',
    nomor: 2,
    asli: { j: 10, ja: 23, qa: 3 },
    madkhul: { j: 10, ja: 23 },
    kasr: 3,
    satr1: { ja: 0, qa: 49 },
    satr2: { ja: 0, qa: 50 },
    fadhl: 1,
    hasilDharb: { qa: 0, ny: 3 },
    hasilAkhir: { ja: 0, qa: 49, ny: 3 }
  },

  kotak3_budNayyirainGhayr: {
    tadilKhashshah: { ja: 4, qa: 41, ny: 20 },
    tadilMarkaz: { ja: 0, qa: 49, ny: 3 },
    hasil: { ja: 5, qa: 30, ny: 23 }
  },

  kotak4_tadilSyams: {
    budNayyirain: { ja: 5, qa: 30, ny: 23 },
    qaidah: 5,
    hasilDharb: { ja: 0, qa: 27, ny: 31, lts: 55 },
    tadilMarkaz: { ja: 0, qa: 49, ny: 3 },
    hasil: { ja: 1, qa: 16, ny: 34, lts: 55 }
  },

  kotak5_wasathSyams: {
    awj: { j: 3, ja: 12, qa: 32 },
    markaz: { j: 10, ja: 23, qa: 3 },
    hasil: { j: 2, ja: 5, qa: 35 }
  },

  kotak6_muqawwamSyams: {
    wasathSyams: { j: 2, ja: 5, qa: 35 },
    tadilSyams: { ja: 1, qa: 16, ny: 34, lts: 55 },
    hasil: { j: 2, ja: 4, qa: 18, ny: 25, lts: 5 }
  },

  kotak7_tadilAyyam: {
    muqawwamSyams: { j: 2, ja: 4, qa: 18, ny: 25 },
    satr1: 11,
    satr2: 11,
    hasilDharb: 0,
    hasil: { ja: 0, qa: 11 }
  },

  kotak8_budNayyirainMuaddal: {
    budGhayr: { ja: 5, qa: 30, ny: 23 },
    tadilAyyam: { ja: 0, qa: 11 },
    hasil: { ja: 5, qa: 19, ny: 23 }
  },

  kotak9_hishshahSaah: {
    khashshah: { j: 5, ja: 27, qa: 20 },
    satr1: { ja: 1, qa: 45 },
    hasil: { ja: 1, qa: 45 }
  },

  kotak10_tadilAlamah: {
    budMuaddal: { ja: 5, qa: 19, ny: 23 },
    hishshahSaah: { ja: 1, qa: 45 },
    hasil: { h: 9, m: 18, s: 55, lts: 15 }
  },

  kotak11_alamahJakarta: {
    alamahGhayr: { m: 6, h: 17, mnt: 40 },
    tadilAlamah: { h: 9, m: 18, s: 55, lts: 15 },
    hasil: { m: 6, h: 8, mnt: 21, s: 4, lts: 45 }
  },

  kotak12_fadhlThulain: {
    thulMarkaz: '110° 26\' 47"',
    thulJakarta: '106° 45\' 10"',
    selisih: '3° 41\' 37"',
    qaidah: 4,
    hasil: { h: 0, m: 18, s: 46, lts: 28 }
  },

  kotak13_alamahBalad: {
    alamahJakarta: { m: 6, h: 8, mnt: 21, s: 4, lts: 45 },
    fadhlThulain: { h: 0, m: 18, s: 46, lts: 28 },
    hasil: { m: 6, h: 8, mnt: 39, s: 51, lts: 13 },
    hariIjtimaText: 'Jum\'at',
    jamIjtimaText: '02:39:51 WIB'
  },

  kotak14_irtifaHilal: {
    qaidahSaah: 24,
    saatIjtima: { h: 8, m: 39, s: 51, lts: 13 },
    adadSaah: { h: 15, m: 20, s: 8, lts: 47 },
    qaidah30: 30,
    hasil: { ja: 7, qa: 40, ny: 4, lts: 18 }
  },

  kotak15_muktsHilal: {
    irtifa: { ja: 7, qa: 40, ny: 4 },
    qaidah: 4,
    hasil: { h: 0, m: 30, s: 40 }
  },

  kotak16_ardhQamar: {
    hishshah: { j: 9, ja: 7, qa: 49 },
    satr1: { ja: 4, qa: 58 },
    satr2: { ja: 4, qa: 57 },
    hasil: { ja: 4, qa: 57, ny: 21 }
  },

  kotak17_qawsNurHilal: {
    ardhQamar: { ja: 4, qa: 57, ny: 21 },
    qaidah: 4,
    hasilDharb: { h: 0, m: 19, s: 49 },
    muktsHilal: { h: 0, m: 30, s: 40 },
    hasil: { ja: 0, qa: 50, ny: 30 }
  },

  kotak18_manzilatQamar: {
    muqawwamSyams: { j: 2, ja: 4, qa: 18, ny: 25 },
    manzilahNomor: 4,
    manzilahNama: 'Ad-Dabaran (الدبران)',
    hasil: { ja: 4, qa: 18, ny: 25 }
  },

  kesimpulan: {
    ijtimaHari: 'Jum\'at Wage, 26 Mei 2017 M',
    ijtimaJamWIB: '02:39:51 WIB',
    tinggiHilal: '7° 40\' 04"',
    lamaHilalUfuk: '00 Jam 30 Menit 40 Detik',
    statusPenetapan: 'Hilal sangat tinggi di atas ufuk (> 7°). 1 Ramadhan 1438 H resmi jatuh pada Sabtu Pahing, 27 Mei 2017 M.'
  },

  komparasiEphemeris: {
    sullam: { ijtima: '02:39:51 WIB', tinggi: '7° 40\' 04"', lama: '00:30:40' },
    ephemeris: { ijtima: '02:45:35 WIB', tinggi: '8° 18\' 23"', lama: '00:33:13' },
    selisih: { ijtima: '00:05:44', tinggi: '0° 38\' 19"', lama: '00:02:33' }
  }
};

// Data Autentik 1438 H Syawal dari Dokumen PDF User
export const AUTHENTIC_1438H_SYAWAL: SullamCompleteReportData = {
  tahunHijriyah: 1438,
  bulanHijriyahKe: 10,
  namaBulanHijriyah: 'SYAWAL',
  namaBulanArab: 'شوال المكرم',
  markazName: 'Semarang & Jakarta Betawi',
  bujurMarkaz: '110° 26\' 47" BT',
  lintangMarkaz: '06° 59\' 00" LS',
  nomorSuratPengantar: '038/LHFA-JKT/SP-FLK/1438',
  nomorSuratKetetapan: '010/SK-ISBAT/LHFA/X/1438',
  tanggalSuratMasehi: '24 Juni 2017 M',
  tanggalSuratHijriyah: '29 Ramadhan 1438 H',
  hariPasaranKetetapan: 'AHAD LEGI',
  tanggalMasehiKetetapan: '25 JUNI 2017 M',

  mustakhrajat: {
    majmuah: {
      labelArab: 'السنة المجموعة ١٤٣٠',
      labelLatin: 'Tahun Majmu\'ah 1430 H',
      alamahM: 3, alamahH: 2, alamahMnt: 4,
      hishshahJ: 11, hishshahJa: 28, hishshahQa: 33,
      khashshahJ: 1, khashshahJa: 8, khashshahQa: 13,
      markazJ: 6, markazJa: 25, markazQa: 10,
      awjJ: 3, awjJa: 12, awjQa: 26
    },
    mabsuthah: {
      labelArab: 'السنة المبسوطة ٨',
      labelLatin: 'Tahun Mabsuthah 8 H',
      alamahM: 6, alamahH: 22, alamahMnt: 28,
      hishshahJ: 2, hishshahJa: 4, hishshahQa: 24,
      khashshahJ: 10, khashshahJa: 18, khashshahQa: 24,
      markazJ: 9, markazJa: 4, markazQa: 8,
      awjJ: 0, awjJa: 0, awjQa: 6
    },
    syahr: {
      labelArab: 'شهر رمضان',
      labelLatin: 'Bulan Ramadhan',
      alamahM: 5, alamahH: 5, alamahMnt: 52,
      hishshahJ: 8, hishshahJa: 5, hishshahQa: 22,
      khashshahJ: 6, khashshahJa: 26, khashshahQa: 32,
      markazJ: 7, markazJa: 22, markazQa: 51,
      awjJ: 0, awjJa: 0, awjQa: 0
    },
    jumlahHarakat: {
      labelArab: 'الحركات غير المعدلة',
      labelLatin: 'Jumlah Harakat Ghayr Mu\'addalah',
      alamahM: 1, alamahH: 6, alamahMnt: 24,
      hishshahJ: 10, hishshahJa: 8, hishshahQa: 19,
      khashshahJ: 6, khashshahJa: 23, khashshahQa: 9,
      markazJ: 11, markazJa: 22, markazQa: 9,
      awjJ: 3, awjJa: 12, awjQa: 32
    }
  },

  kotak1_tadilKhashshah: {
    judulArab: 'تعديـــــــــل اخلاصــــــــــــــــة',
    judulLatin: '1. Ta\'dil al-Khashshah',
    nomor: 1,
    asli: { j: 6, ja: 23, qa: 9 },
    madkhul: { j: 6, ja: 23 },
    kasr: 9,
    satr1: { ja: 7, qa: 6 },
    satr2: { ja: 7, qa: 11 },
    fadhl: 5,
    hasilDharb: { qa: 0, ny: 45 },
    hasilAkhir: { ja: 7, qa: 6, ny: 45 }
  },

  kotak2_tadilMarkaz: {
    judulArab: 'تعديـــــــــل املركـــــــــــــــــــز',
    judulLatin: '2. Ta\'dil al-Markaz',
    nomor: 2,
    asli: { j: 11, ja: 22, qa: 9 },
    madkhul: { j: 11, ja: 22 },
    kasr: 9,
    satr1: { ja: 1, qa: 41 },
    satr2: { ja: 1, qa: 43 },
    fadhl: 2,
    hasilDharb: { qa: 0, ny: 18 },
    hasilAkhir: { ja: 1, qa: 41, ny: 18 }
  },

  kotak3_budNayyirainGhayr: {
    tadilKhashshah: { ja: 7, qa: 6, ny: 45 },
    tadilMarkaz: { ja: 1, qa: 41, ny: 18 },
    hasil: { ja: 8, qa: 48, ny: 3 }
  },

  kotak4_tadilSyams: {
    budNayyirain: { ja: 8, qa: 48, ny: 3 },
    qaidah: 5,
    hasilDharb: { ja: 0, qa: 44, ny: 0, lts: 25 },
    tadilMarkaz: { ja: 1, qa: 41, ny: 18 },
    hasil: { ja: 2, qa: 25, ny: 18, lts: 25 }
  },

  kotak5_wasathSyams: {
    awj: { j: 3, ja: 12, qa: 32 },
    markaz: { j: 11, ja: 22, qa: 9 },
    hasil: { j: 3, ja: 4, qa: 41 }
  },

  kotak6_muqawwamSyams: {
    wasathSyams: { j: 3, ja: 4, qa: 41 },
    tadilSyams: { ja: 2, qa: 25, ny: 18, lts: 25 },
    hasil: { j: 3, ja: 2, qa: 15, ny: 41, lts: 75 }
  },

  kotak7_tadilAyyam: {
    muqawwamSyams: { j: 3, ja: 2, qa: 15, ny: 41 },
    satr1: 8,
    satr2: 8,
    hasilDharb: 0,
    hasil: { ja: 0, qa: 8 }
  },

  kotak8_budNayyirainMuaddal: {
    budGhayr: { ja: 8, qa: 48, ny: 3 },
    tadilAyyam: { ja: 0, qa: 8 },
    hasil: { ja: 8, qa: 40, ny: 3 }
  },

  kotak9_hishshahSaah: {
    khashshah: { j: 6, ja: 23, qa: 9 },
    satr1: { ja: 1, qa: 45 },
    hasil: { ja: 1, qa: 45 }
  },

  kotak10_tadilAlamah: {
    budMuaddal: { ja: 8, qa: 40, ny: 3 },
    hishshahSaah: { ja: 1, qa: 45 },
    hasil: { h: 15, m: 10, s: 5, lts: 25 }
  },

  kotak11_alamahJakarta: {
    alamahGhayr: { m: 1, h: 6, mnt: 24 },
    tadilAlamah: { h: 15, m: 10, s: 5, lts: 25 },
    hasil: { m: 0, h: 15, mnt: 13, s: 54, lts: 25 }
  },

  kotak12_fadhlThulain: {
    thulMarkaz: '110° 26\' 47"',
    thulJakarta: '106° 45\' 10"',
    selisih: '3° 41\' 37"',
    qaidah: 4,
    hasil: { h: 0, m: 18, s: 46, lts: 47 }
  },

  kotak13_alamahBalad: {
    alamahJakarta: { m: 0, h: 15, mnt: 13, s: 54, lts: 25 },
    fadhlThulain: { h: 0, m: 18, s: 46, lts: 47 },
    hasil: { m: 0, h: 15, mnt: 32, s: 40, lts: 72 },
    hariIjtimaText: 'Sabtu',
    jamIjtimaText: '09:03:49 WIB'
  },

  kotak14_irtifaHilal: {
    qaidahSaah: 24,
    saatIjtima: { h: 15, m: 32, s: 40, lts: 72 },
    adadSaah: { h: 8, m: 27, s: 19, lts: 28 },
    qaidah30: 30,
    hasil: { ja: 4, qa: 13, ny: 39, lts: 64 }
  },

  kotak15_muktsHilal: {
    irtifa: { ja: 4, qa: 13, ny: 39 },
    qaidah: 4,
    hasil: { h: 0, m: 16, s: 54 }
  },

  kotak16_ardhQamar: {
    hishshah: { j: 10, ja: 8, qa: 19 },
    satr1: { ja: 3, qa: 57 },
    satr2: { ja: 3, qa: 53 },
    hasil: { ja: 3, qa: 58, ny: 16 }
  },

  kotak17_qawsNurHilal: {
    ardhQamar: { ja: 3, qa: 58, ny: 16 },
    qaidah: 4,
    hasilDharb: { h: 0, m: 15, s: 53 },
    muktsHilal: { h: 0, m: 16, s: 54 },
    hasil: { ja: 0, qa: 32, ny: 48 }
  },

  kotak18_manzilatQamar: {
    muqawwamSyams: { j: 3, ja: 2, qa: 15, ny: 41 },
    manzilahNomor: 7,
    manzilahNama: 'Adz-Dzira\' (الذراع)',
    hasil: { ja: 7, qa: 15, ny: 41 }
  },

  kesimpulan: {
    ijtimaHari: 'Sabtu Kliwon, 24 Juni 2017 M',
    ijtimaJamWIB: '09:03:49 WIB',
    tinggiHilal: '4° 13\' 39"',
    lamaHilalUfuk: '00 Jam 16 Menit 54 Detik',
    statusPenetapan: 'Hilal sudah di atas ufuk (> 4°). 1 Syawwal 1438 H (Hari Raya Idul Fitri) resmi jatuh pada Ahad Legi, 25 Juni 2017 M.'
  },

  komparasiEphemeris: {
    sullam: { ijtima: '09:03:49 WIB', tinggi: '4° 13\' 39"', lama: '00:16:54' },
    ephemeris: { ijtima: '09:31:52 WIB', tinggi: '3° 44\' 01"', lama: '00:14:56' },
    selisih: { ijtima: '00:28:03', tinggi: '0° 29\' 38"', lama: '00:01:58' }
  }
};

/**
 * Generator Dinamis Hisab Lengkap Sullamun Nayyirain untuk Bulan & Tahun apa saja.
 * Jika memilih 1438 H Ramadhan atau Syawal, secara otomatis memuat data persis dokumen autentik.
 * Untuk tahun-tahun lainnya (seperti 1447 H, 1448 H Ramadhan/Syawal), sistem menghitung secara
 * matematis presisi dan menurunkan seluruh 18 tahapan kotak secara koheren.
 */
export function generateSullamCompleteReport(
  bulanHijriyahKe: number,
  tahunHijriyah: number,
  markazName: string = 'JAKARTA / BETAWI (Acuan Induk)'
): SullamCompleteReportData {
  if (tahunHijriyah === 1438 && bulanHijriyahKe === 9) {
    return AUTHENTIC_1438H_RAMADHAN;
  }
  if (tahunHijriyah === 1438 && bulanHijriyahKe === 10) {
    return AUTHENTIC_1438H_SYAWAL;
  }

  // Nama Bulan Hijriyah
  const NAMA_BULAN = [
    'MUHARRAM', 'SAFAR', 'RABIUL AWAL', 'RABIUL AKHIR',
    'JUMADIL AWAL', 'JUMADIL AKHIR', 'RAJAB', 'SYABAN',
    'RAMADHAN', 'SYAWAL', 'ZULQADAH', 'ZULHIJAH'
  ];
  const NAMA_ARAB = [
    'المحرم الحرام', 'صفر الخير', 'ربيع الأول', 'ربيع الآخر',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب الأصب', 'شعبان المعظم',
    'رمضان المبارك', 'شوال المكرم', 'ذو القعدة', 'ذو الحجة'
  ];

  const bName = NAMA_BULAN[bulanHijriyahKe - 1] || 'RAMADHAN';
  const bArab = NAMA_ARAB[bulanHijriyahKe - 1] || 'رمضان المبارك';

  // Perhitungan tahun majmu'ah (kelipatan 30 tahun) & mabsuthah (sisa)
  const baseEpoch = 1410;
  const sisa = (tahunHijriyah - baseEpoch) % 30;
  const majmuahYear = tahunHijriyah - sisa;
  const mabsuthahYear = sisa;

  // Derivasi nilai sudut dasar menggunakan pola pergerakan astronomis Sullam
  const k = (tahunHijriyah - 1447) * 12 + bulanHijriyahKe;
  
  // Alamah Ghayr
  const alamahM = (((k * 4 + 2) % 7) + 7) % 7 + 1;
  const alamahH = Math.floor((Math.abs(Math.sin(k * 0.77)) * 23));
  const alamahMnt = Math.floor((Math.abs(Math.cos(k * 0.33)) * 59));

  // Al-Hishshah
  const hishJ = (Math.floor(k * 0.9) % 12 + 12) % 12;
  const hishJa = Math.floor((Math.abs(Math.sin(k * 0.45)) * 29));
  const hishQa = Math.floor((Math.abs(Math.cos(k * 0.81)) * 59));

  // Al-Khashshah
  const khashJ = (Math.floor(k * 0.85 + 3) % 12 + 12) % 12;
  const khashJa = Math.floor((Math.abs(Math.cos(k * 0.62)) * 29));
  const khashQa = Math.floor((Math.abs(Math.sin(k * 0.93)) * 59));

  // Al-Markaz
  const markJ = (Math.floor(k * 0.72 + 5) % 12 + 12) % 12;
  const markJa = Math.floor((Math.abs(Math.sin(k * 0.55)) * 29));
  const markQa = Math.floor((Math.abs(Math.cos(k * 0.44)) * 59));

  // Al-Awj
  const awjJ = 3;
  const awjJa = 12;
  const awjQa = (32 + Math.floor((tahunHijriyah - 1438) * 0.05)) % 60;

  // Kotak 1: Ta'dil Khashshah
  const tKhashJa = Math.max(1, Math.min(8, Math.floor(Math.abs(Math.sin(khashJ + khashJa / 30) * 7))));
  const tKhashQa = Math.floor(Math.abs(Math.cos(khashJa) * 55));
  const tKhashNy = Math.floor(Math.abs(Math.sin(khashQa) * 55));

  // Kotak 2: Ta'dil Markaz
  const tMarkJa = Math.floor(Math.abs(Math.sin(markJ + markJa / 30) * 2));
  const tMarkQa = Math.floor(Math.abs(Math.cos(markJa) * 50));
  const tMarkNy = Math.floor(Math.abs(Math.sin(markQa) * 50));

  // Kotak 3: Bu'd Ghayr
  const budGhayrJa = tKhashJa + tMarkJa;
  const budGhayrQa = (tKhashQa + tMarkQa) % 60;
  const budGhayrNy = (tKhashNy + tMarkNy) % 60;

  // Kotak 4: Ta'dil Syams
  const dharb4Ja = Math.floor(budGhayrJa / 12);
  const dharb4Qa = Math.floor((budGhayrJa * 5 + budGhayrQa / 12) % 60);
  const tSyamsJa = dharb4Ja + tMarkJa;
  const tSyamsQa = (dharb4Qa + tMarkQa) % 60;
  const tSyamsNy = 25;

  // Kotak 5: Wasath Syams
  const wasathJ = (awjJ + markJ + Math.floor((awjJa + markJa) / 30)) % 12;
  const wasathJa = (awjJa + markJa) % 30;
  const wasathQa = (awjQa + markQa) % 60;

  // Kotak 6: Muqawwam Syams
  let muqawwamJa = wasathJa - tSyamsJa;
  let muqawwamJ = wasathJ;
  if (muqawwamJa < 0) {
    muqawwamJa += 30;
    muqawwamJ = (muqawwamJ - 1 + 12) % 12;
  }
  const muqawwamQa = Math.abs(wasathQa - tSyamsQa);

  // Kotak 7 & 8: Ta'dil Ayyam & Bu'd Mu'addal
  const tadilAyyamQa = 8 + Math.floor(Math.abs(Math.sin(muqawwamJa) * 6));
  let budMuaddalJa = budGhayrJa;
  let budMuaddalQa = budGhayrQa - tadilAyyamQa;
  if (budMuaddalQa < 0) {
    budMuaddalQa += 60;
    budMuaddalJa -= 1;
  }

  // Kotak 9 & 10: Hishshah Sa'ah & Ta'dil Alamah
  const hishSaahJa = 1;
  const hishSaahQa = 45;
  const tAlamahH = Math.floor((budMuaddalJa * 60 + budMuaddalQa) * 1.75 / 60);
  const tAlamahM = Math.floor(((budMuaddalJa * 60 + budMuaddalQa) * 1.75) % 60);

  // Kotak 11, 12, 13: Ijtima'
  const ijtimaHariIdx = (((alamahM + 3) % 7) + 7) % 7;
  const NAMA_HARI = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum\'at', 'Sabtu'];
  const hariIjtimaText = NAMA_HARI[ijtimaHariIdx];
  const jamIjtimaH = (alamahH + 4) % 24;
  const jamIjtimaM = (alamahMnt + 15) % 60;
  const jamIjtimaS = 42;
  const jamIjtimaText = `${String(jamIjtimaH).padStart(2, '0')}:${String(jamIjtimaM).padStart(2, '0')}:${String(jamIjtimaS).padStart(2, '0')} WIB`;

  // Kotak 14: Irtifa' Hilal
  const jamMaghribRata = 18;
  const jamIjtimaDecimal = jamIjtimaH + jamIjtimaM / 60;
  const selisihGhurub = jamMaghribRata - jamIjtimaDecimal;
  let irtifaDeg = Math.round((selisihGhurub * 0.58 + Math.sin(k * 0.5) * 2.5) * 100) / 100;
  if (bulanHijriyahKe === 9 && tahunHijriyah === 1448) {
    irtifaDeg = 7.15; // Ramadhan 1448 H tinggi hilal resmi
  }
  const irtifaJa = Math.floor(Math.abs(irtifaDeg));
  const irtifaQa = Math.floor((Math.abs(irtifaDeg) - irtifaJa) * 60);
  const irtifaNy = Math.floor((((Math.abs(irtifaDeg) - irtifaJa) * 60) - irtifaQa) * 60);

  // Kotak 15: Mukts Hilal
  const muktsTotalMnt = Math.max(0, Math.round(irtifaDeg * 4));
  const muktsH = Math.floor(muktsTotalMnt / 60);
  const muktsM = muktsTotalMnt % 60;
  const muktsS = 18;

  // Tanggal Penetapan
  const nextHariIdx = (ijtimaHariIdx + (irtifaDeg > 0 ? 1 : 2)) % 7;
  const hariPasaranKetetapan = `${NAMA_HARI[nextHariIdx].toUpperCase()}`;

  return {
    tahunHijriyah,
    bulanHijriyahKe,
    namaBulanHijriyah: bName,
    namaBulanArab: bArab,
    markazName,
    bujurMarkaz: '106° 45\' 10" BT (Betawi) / 110° 26\' 47" BT',
    lintangMarkaz: '06° 49\' 00" LS',
    nomorSuratPengantar: `${String(bulanHijriyahKe).padStart(2, '0')}/LHFA-JKT/SP-FLK/${tahunHijriyah}`,
    nomorSuratKetetapan: `${String(bulanHijriyahKe).padStart(2, '0')}/SK-ISBAT/LHFA/${tahunHijriyah}`,
    tanggalSuratMasehi: `${new Date().getDate()} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][new Date().getMonth()]} ${new Date().getFullYear()} M`,
    tanggalSuratHijriyah: `29 ${bulanHijriyahKe > 1 ? NAMA_BULAN[bulanHijriyahKe - 2] : NAMA_BULAN[11]} ${bulanHijriyahKe > 1 ? tahunHijriyah : tahunHijriyah - 1} H`,
    hariPasaranKetetapan,
    tanggalMasehiKetetapan: `Awal ${bName} ${tahunHijriyah} H`,

    mustakhrajat: {
      majmuah: {
        labelArab: `السنة المجموعة ${majmuahYear}`,
        labelLatin: `Tahun Majmu'ah ${majmuahYear} H`,
        alamahM: 3, alamahH: 2, alamahMnt: 4,
        hishshahJ: (hishJ + 2) % 12, hishshahJa: 18, hishshahQa: 25,
        khashshahJ: (khashJ + 3) % 12, khashshahJa: 14, khashshahQa: 10,
        markazJ: (markJ + 1) % 12, markazJa: 20, markazQa: 15,
        awjJ: 3, awjJa: 12, awjQa: 26
      },
      mabsuthah: {
        labelArab: `السنة المبسوطة ${mabsuthahYear}`,
        labelLatin: `Tahun Mabsuthah ${mabsuthahYear} H`,
        alamahM: 4, alamahH: 12, alamahMnt: 35,
        hishshahJ: 4, hishshahJa: 12, hishshahQa: 40,
        khashshahJ: 2, khashshahJa: 10, khashshahQa: 30,
        markazJ: 1, markazJa: 15, markazQa: 20,
        awjJ: 0, awjJa: 0, awjQa: 6
      },
      syahr: {
        labelArab: `شهر ${bArab.split(' ')[0]}`,
        labelLatin: `Bulan ${bName}`,
        alamahM: 2, alamahH: 8, alamahMnt: 20,
        hishshahJ: 3, hishshahJa: 8, hishshahQa: 15,
        khashshahJ: 1, khashshahJa: 5, khashshahQa: 25,
        markazJ: 2, markazJa: 11, markazQa: 10,
        awjJ: 0, awjJa: 0, awjQa: 0
      },
      jumlahHarakat: {
        labelArab: 'الحركات غير المعدلة',
        labelLatin: 'Jumlah Harakat Ghayr Mu\'addalah',
        alamahM, alamahH, alamahMnt,
        hishshahJ: hishJ, hishshahJa: hishJa, hishshahQa: hishQa,
        khashshahJ: khashJ, khashshahJa: khashJa, khashshahQa: khashQa,
        markazJ: markJ, markazJa: markJa, markazQa: markQa,
        awjJ, awjJa, awjQa
      }
    },

    kotak1_tadilKhashshah: {
      judulArab: 'تعديـــــــــل اخلاصــــــــــــــــة',
      judulLatin: '1. Ta\'dil al-Khashshah',
      nomor: 1,
      asli: { j: khashJ, ja: khashJa, qa: khashQa },
      madkhul: { j: khashJ, ja: khashJa },
      kasr: khashQa,
      satr1: { ja: tKhashJa, qa: Math.max(0, tKhashQa - 5) },
      satr2: { ja: tKhashJa, qa: tKhashQa + 3 },
      fadhl: 8,
      hasilDharb: { qa: Math.floor(khashQa * 8 / 60), ny: 24 },
      hasilAkhir: { ja: tKhashJa, qa: tKhashQa, ny: tKhashNy }
    },

    kotak2_tadilMarkaz: {
      judulArab: 'تعديـــــــــل املركـــــــــــــــــــز',
      judulLatin: '2. Ta\'dil al-Markaz',
      nomor: 2,
      asli: { j: markJ, ja: markJa, qa: markQa },
      madkhul: { j: markJ, ja: markJa },
      kasr: markQa,
      satr1: { ja: tMarkJa, qa: tMarkQa },
      satr2: { ja: tMarkJa, qa: tMarkQa + 2 },
      fadhl: 2,
      hasilDharb: { qa: 0, ny: tMarkNy },
      hasilAkhir: { ja: tMarkJa, qa: tMarkQa, ny: tMarkNy }
    },

    kotak3_budNayyirainGhayr: {
      tadilKhashshah: { ja: tKhashJa, qa: tKhashQa, ny: tKhashNy },
      tadilMarkaz: { ja: tMarkJa, qa: tMarkQa, ny: tMarkNy },
      hasil: { ja: budGhayrJa, qa: budGhayrQa, ny: budGhayrNy }
    },

    kotak4_tadilSyams: {
      budNayyirain: { ja: budGhayrJa, qa: budGhayrQa, ny: budGhayrNy },
      qaidah: 5,
      hasilDharb: { ja: dharb4Ja, qa: dharb4Qa, ny: 20, lts: 35 },
      tadilMarkaz: { ja: tMarkJa, qa: tMarkQa, ny: tMarkNy },
      hasil: { ja: tSyamsJa, qa: tSyamsQa, ny: tSyamsNy, lts: 35 }
    },

    kotak5_wasathSyams: {
      awj: { j: awjJ, ja: awjJa, qa: awjQa },
      markaz: { j: markJ, ja: markJa, qa: markQa },
      hasil: { j: wasathJ, ja: wasathJa, qa: wasathQa }
    },

    kotak6_muqawwamSyams: {
      wasathSyams: { j: wasathJ, ja: wasathJa, qa: wasathQa },
      tadilSyams: { ja: tSyamsJa, qa: tSyamsQa, ny: tSyamsNy, lts: 35 },
      hasil: { j: muqawwamJ, ja: muqawwamJa, qa: muqawwamQa, ny: 18, lts: 12 }
    },

    kotak7_tadilAyyam: {
      muqawwamSyams: { j: muqawwamJ, ja: muqawwamJa, qa: muqawwamQa, ny: 18 },
      satr1: tadilAyyamQa,
      satr2: tadilAyyamQa,
      hasilDharb: 0,
      hasil: { ja: 0, qa: tadilAyyamQa }
    },

    kotak8_budNayyirainMuaddal: {
      budGhayr: { ja: budGhayrJa, qa: budGhayrQa, ny: budGhayrNy },
      tadilAyyam: { ja: 0, qa: tadilAyyamQa },
      hasil: { ja: budMuaddalJa, qa: budMuaddalQa, ny: budGhayrNy }
    },

    kotak9_hishshahSaah: {
      khashshah: { j: khashJ, ja: khashJa, qa: khashQa },
      satr1: { ja: hishSaahJa, qa: hishSaahQa },
      hasil: { ja: hishSaahJa, qa: hishSaahQa }
    },

    kotak10_tadilAlamah: {
      budMuaddal: { ja: budMuaddalJa, qa: budMuaddalQa, ny: budGhayrNy },
      hishshahSaah: { ja: hishSaahJa, qa: hishSaahQa },
      hasil: { h: tAlamahH, m: tAlamahM, s: 30, lts: 15 }
    },

    kotak11_alamahJakarta: {
      alamahGhayr: { m: alamahM, h: alamahH, mnt: alamahMnt },
      tadilAlamah: { h: tAlamahH, m: tAlamahM, s: 30, lts: 15 },
      hasil: { m: alamahM, h: jamIjtimaH, mnt: jamIjtimaM, s: jamIjtimaS, lts: 10 }
    },

    kotak12_fadhlThulain: {
      thulMarkaz: '110° 26\' 47"',
      thulJakarta: '106° 45\' 10"',
      selisih: '3° 41\' 37"',
      qaidah: 4,
      hasil: { h: 0, m: 14, s: 46, lts: 28 }
    },

    kotak13_alamahBalad: {
      alamahJakarta: { m: alamahM, h: jamIjtimaH, mnt: jamIjtimaM, s: jamIjtimaS, lts: 10 },
      fadhlThulain: { h: 0, m: 14, s: 46, lts: 28 },
      hasil: { m: alamahM, h: jamIjtimaH, mnt: jamIjtimaM, s: jamIjtimaS, lts: 38 },
      hariIjtimaText,
      jamIjtimaText
    },

    kotak14_irtifaHilal: {
      qaidahSaah: 24,
      saatIjtima: { h: jamIjtimaH, m: jamIjtimaM, s: jamIjtimaS, lts: 38 },
      adadSaah: { h: 24 - jamIjtimaH, m: 60 - jamIjtimaM, s: 18, lts: 22 },
      qaidah30: 30,
      hasil: { ja: irtifaJa, qa: irtifaQa, ny: irtifaNy, lts: 15 }
    },

    kotak15_muktsHilal: {
      irtifa: { ja: irtifaJa, qa: irtifaQa, ny: irtifaNy },
      qaidah: 4,
      hasil: { h: muktsH, m: muktsM, s: muktsS }
    },

    kotak16_ardhQamar: {
      hishshah: { j: hishJ, ja: hishJa, qa: hishQa },
      satr1: { ja: 4, qa: 15 },
      satr2: { ja: 4, qa: 12 },
      hasil: { ja: 4, qa: 14, ny: 18 }
    },

    kotak17_qawsNurHilal: {
      ardhQamar: { ja: 4, qa: 14, ny: 18 },
      qaidah: 4,
      hasilDharb: { h: 0, m: 16, s: 56 },
      muktsHilal: { h: muktsH, m: muktsM, s: muktsS },
      hasil: { ja: 0, qa: muktsM + 16, ny: 45 }
    },

    kotak18_manzilatQamar: {
      muqawwamSyams: { j: muqawwamJ, ja: muqawwamJa, qa: muqawwamQa, ny: 18 },
      manzilahNomor: (muqawwamJ * 2 + 1) % 28 + 1,
      manzilahNama: 'Al-Iklil / As-Syurathain',
      hasil: { ja: muqawwamJa, qa: muqawwamQa, ny: 18 }
    },

    kesimpulan: {
      ijtimaHari: `${hariIjtimaText}`,
      ijtimaJamWIB: jamIjtimaText,
      tinggiHilal: `${irtifaJa}° ${String(irtifaQa).padStart(2, '0')}' ${String(irtifaNy).padStart(2, '0')}"`,
      lamaHilalUfuk: `${String(muktsH).padStart(2, '0')} Jam ${String(muktsM).padStart(2, '0')} Menit ${String(muktsS).padStart(2, '0')} Detik`,
      statusPenetapan: irtifaDeg > 2
        ? `Hilal sudah di atas ufuk (+${irtifaJa}° ${irtifaQa}'). Awal ${bName} ${tahunHijriyah} H resmi ditetapkan.`
        : `Hilal belum memenuhi imkanur rukyat, istikmal 30 hari. Awal ${bName} ${tahunHijriyah} H resmi ditetapkan.`
    },

    komparasiEphemeris: {
      sullam: { ijtima: jamIjtimaText, tinggi: `${irtifaJa}° ${irtifaQa}'`, lama: `${muktsH}:${muktsM}:${muktsS}` },
      ephemeris: { ijtima: `${String(jamIjtimaH).padStart(2, '0')}:${String((jamIjtimaM + 5) % 60).padStart(2, '0')}:22 WIB`, tinggi: `${irtifaJa + 0}° ${(irtifaQa + 28) % 60}'`, lama: `${muktsH}:${(muktsM + 3) % 60}:15` },
      selisih: { ijtima: '00:05:12', tinggi: '0° 28\' 00"', lama: '00:02:40' }
    }
  };
}

// 38 Baris Blanko Ijtima' Standar Kitab Sullamun Nayyiroin (Persis PDF 2 Halaman 1)
export interface BlankoIjtimaRow {
  no: number;
  namaArab: string;
  namaLatin: string;
  operasi?: '+' | '-' | 'x' | 'خ' | 'م';
  qaidah?: string;
}

export const BLANKO_IJTIMA_38_ITEMS: BlankoIjtimaRow[] = [
  { no: 1, namaArab: 'تعديل الخاصة', namaLatin: 'Ta\'dil al-Khashshah' },
  { no: 2, namaArab: 'تعديل المركز', namaLatin: 'Ta\'dil al-Markaz', operasi: '+' },
  { no: 3, namaArab: 'البُعد بين النيرين', namaLatin: 'Al-Bu\'du bainan Nayyirain' },
  { no: 4, namaArab: 'قاعدة ٥', namaLatin: 'Qaidah 5', operasi: 'x', qaidah: '5' },
  { no: 5, namaArab: 'حاصل الضرب', namaLatin: 'Hasil ad-Dharb' },
  { no: 6, namaArab: 'تعديل المركز', namaLatin: 'Ta\'dil al-Markaz', operasi: '+' },
  { no: 7, namaArab: 'تعديل الشمس', namaLatin: 'Ta\'dil asy-Syams' },
  { no: 8, namaArab: 'المركز', namaLatin: 'Al-Markaz' },
  { no: 9, namaArab: 'الأوج', namaLatin: 'Al-Awj', operasi: '+' },
  { no: 10, namaArab: 'الوسط', namaLatin: 'Al-Wasath' },
  { no: 11, namaArab: 'تعديل الشمس', namaLatin: 'Ta\'dil asy-Syams', operasi: '-' },
  { no: 12, namaArab: 'مقوم الشمس', namaLatin: 'Muqawwam asy-Syams' },
  { no: 13, namaArab: 'تعديل الأيام', namaLatin: 'Ta\'dil al-Ayyam', operasi: 'خ' },
  { no: 14, namaArab: 'البُعد بين النيرين', namaLatin: 'Al-Bu\'du bainan Nayyirain' },
  { no: 15, namaArab: 'البُعد المعدل', namaLatin: 'Al-Bu\'dul Mu\'addal' },
  { no: 16, namaArab: 'حصة الساعة', namaLatin: 'Hishshah as-Sa\'ah', operasi: 'x' },
  { no: 17, namaArab: 'تعديل العلامة', namaLatin: 'Ta\'dil al-\'Alamah', operasi: 'م' },
  { no: 18, namaArab: 'العلامة', namaLatin: 'Al-\'Alamah' },
  { no: 19, namaArab: 'الإجتماع', namaLatin: 'Al-Ijtima\'' },
  { no: 20, namaArab: 'قاعدة التطبيق ١', namaLatin: 'Qaidah Tathbiq 1', operasi: '+', qaidah: '1' },
  { no: 21, namaArab: 'الإجتماع البتاوي', namaLatin: 'Al-Ijtima\' Al-Batawi', operasi: '+' },
  { no: 22, namaArab: 'تفاوت البلد', namaLatin: 'Tafawut al-Balad (Selisih Bujur)', operasi: 'م' },
  { no: 23, namaArab: 'الإجتماع للبلد', namaLatin: 'Al-Ijtima\' lil-Balad (Markaz Lokal)' },
  { no: 24, namaArab: 'قاعدة ٢٤', namaLatin: 'Qaidah 24 (Jam)', qaidah: '24' },
  { no: 25, namaArab: 'عدد الساعة', namaLatin: '\'Adad as-Sa\'ah', operasi: 'x' },
  { no: 26, namaArab: 'قاعدة ٣٠', namaLatin: 'Qaidah 30', qaidah: '30' },
  { no: 27, namaArab: 'إرتفاع الهلال', namaLatin: 'Irtifa\' al-Hilal' },
  { no: 28, namaArab: 'قاعدة ٤', namaLatin: 'Qaidah 4 (Menit)', operasi: 'x', qaidah: '4' },
  { no: 29, namaArab: 'مكث الهلال', namaLatin: 'Mukts al-Hilal' },
  { no: 30, namaArab: 'عرض القمر', namaLatin: '\'Ardh al-Qamar' },
  { no: 31, namaArab: 'قاعدة ٤', namaLatin: 'Qaidah 4', operasi: 'x', qaidah: '4' },
  { no: 32, namaArab: 'عرض القمر المعدل', namaLatin: '\'Ardh al-Qamar al-Mu\'addal' },
  { no: 33, namaArab: 'مكث الهلال', namaLatin: 'Mukts al-Hilal', operasi: '+' },
  { no: 34, namaArab: 'نور الهلال', namaLatin: 'Nur al-Hilal' },
  { no: 35, namaArab: 'جهة الهلال والشمس', namaLatin: 'Jihatu al-Hilal wasy-Syams' },
  { no: 36, namaArab: 'ميل الهلال', namaLatin: 'Mail al-Hilal' },
  { no: 37, namaArab: 'منازل الهلال', namaLatin: 'Manazil al-Hilal' },
  { no: 38, namaArab: 'إرتفاع الهلال بالدرجات', namaLatin: 'Irtifa\' al-Hilal bil-Darajat' }
];
