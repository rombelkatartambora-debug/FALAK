/**
 * Hisab Arah Kiblat berbasis Spherical Trigonometry (Segitiga Bola)
 * Sesuai metodologi hisab Falak Nusantara (Hasib: Subhan Azni Bahrul Alam & Pakar Falak)
 */

export interface QiblaCalculationResult {
  locationName: string;
  latDMS: { deg: number; min: number; sec: number; dir: 'U' | 'S' };
  lngDMS: { deg: number; min: number; sec: number; dir: 'T' | 'B' };
  latDecimal: number;
  lngDecimal: number;
  meccaLatDecimal: number;
  meccaLngDecimal: number;
  a: number; // 90 - phi_tm
  b: number; // 90 - phi_m
  c: number; // lambda_tm - lambda_m
  cotB_val: number;
  cotC_val: number;
  sinA_val: number;
  sinC_val: number;
  cosA_val: number;
  qiblaAngleDecimal: number; // B (dari Barat ke Utara / BU)
  qiblaDMS: { deg: number; min: number; sec: number };
  azimuthDecimal: number; // Diukur dari Utara Sejati searah jarum jam (270 + B)
  azimuthDMS: { deg: number; min: number; sec: number };
  compassBearing: number; // Untuk visual jarum kompas
}

// Koordinat Ka'bah Mekah Al-Mukarramah
export const MECCA_LAT = 21 + 25 / 60; // 21° 25' U = 21.41666667
export const MECCA_LNG = 39 + 50 / 60; // 39° 50' T = 39.83333333

export function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function decimalToDMS(decimal: number): { deg: number; min: number; sec: number } {
  const absolute = Math.abs(decimal);
  const deg = Math.floor(absolute);
  const minFloat = (absolute - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = Math.round((minFloat - min) * 60 * 100) / 100;
  return { deg, min, sec };
}

export function formatDMS(dms: { deg: number; min: number; sec: number }, unitSymbol: boolean = true): string {
  if (unitSymbol) {
    return `${dms.deg}° ${dms.min}' ${dms.sec.toFixed(2)}"`;
  }
  return `${dms.deg}° ${dms.min}° ${dms.sec.toFixed(2)}°`;
}

/**
 * Menghitung Arah Kiblat & Azimut Lengkap Langkah demi Langkah
 */
export function calculateQiblaHisab(
  locationName: string,
  lat: number, // Positif = U, Negatif = S (contoh Mataram: -8.6)
  lng: number  // Positif = T (contoh Mataram: 116.1333333)
): QiblaCalculationResult {
  const phi_tm = lat;
  const lambda_tm = lng;
  const phi_m = MECCA_LAT;
  const lambda_m = MECCA_LNG;

  // Rumus variabel segitiga bola
  const a = 90 - phi_tm;
  const b = 90 - phi_m;
  const c = lambda_tm - lambda_m;

  const aRad = toRadians(a);
  const bRad = toRadians(b);
  const cRad = toRadians(c);

  const cotB = 1 / Math.tan(bRad);
  const cotC = 1 / Math.tan(cRad);
  const sinA = Math.sin(aRad);
  const sinC = Math.sin(cRad);
  const cosA = Math.cos(aRad);
  const cosC = Math.cos(cRad);

  // cotan B = (sin a * cotan b - cos a * cos c) / sin c
  const cotB_res = (sinA * cotB - cosA * cosC) / sinC;

  // Arah Kiblat B = atan(1 / cotB_res) dalam radian -> derajat
  let qiblaAngle = toDegrees(Math.atan(1 / cotB_res));
  if (qiblaAngle < 0) {
    qiblaAngle = Math.abs(qiblaAngle);
  }

  // Azimut dari Utara sejati searah jarum jam (untuk Indonesia barat/timur di kuadran barat-utara)
  // Azimut = 270° + B (atau 360° - (90° - B) = 270° + B)
  const azimuth = 270 + qiblaAngle;

  const latDMS = decimalToDMS(lat);
  const lngDMS = decimalToDMS(lng);

  return {
    locationName,
    latDMS: { ...latDMS, dir: lat >= 0 ? 'U' : 'S' },
    lngDMS: { ...lngDMS, dir: 'T' },
    latDecimal: lat,
    lngDecimal: lng,
    meccaLatDecimal: phi_m,
    meccaLngDecimal: lambda_m,
    a,
    b,
    c,
    cotB_val: cotB,
    cotC_val: cotC,
    sinA_val: sinA,
    sinC_val: sinC,
    cosA_val: cosA,
    qiblaAngleDecimal: qiblaAngle,
    qiblaDMS: decimalToDMS(qiblaAngle),
    azimuthDecimal: azimuth,
    azimuthDMS: decimalToDMS(azimuth),
    compassBearing: azimuth
  };
}

// Preset kota-kota utama Indonesia untuk Hisab Kiblat
export interface QiblaCityPreset {
  name: string;
  lat: number;
  lng: number;
  description: string;
}

export const QIBLA_CITY_PRESETS: QiblaCityPreset[] = [
  { name: 'Mataram (Lombok)', lat: -(8 + 36 / 60), lng: 116 + 8 / 60, description: 'Nusa Tenggara Barat' },
  { name: 'DKI Jakarta (Betawi)', lat: -(6 + 12 / 60), lng: 106 + 50 / 60, description: 'Ibu Kota & Markaz Falak Betawi' },
  { name: 'Surabaya', lat: -(7 + 15 / 60), lng: 112 + 45 / 60, description: 'Jawa Timur' },
  { name: 'Semarang', lat: -(6 + 58 / 60), lng: 110 + 25 / 60, description: 'Jawa Tengah' },
  { name: 'Yogyakarta', lat: -(7 + 48 / 60), lng: 110 + 22 / 60, description: 'D.I. Yogyakarta' },
  { name: 'Bandung', lat: -(6 + 55 / 60), lng: 107 + 36 / 60, description: 'Jawa Barat' },
  { name: 'Banda Aceh', lat: 5 + 33 / 60, lng: 95 + 19 / 60, description: 'Serambi Mekkah, Aceh' },
  { name: 'Medan', lat: 3 + 35 / 60, lng: 98 + 40 / 60, description: 'Sumatera Utara' },
  { name: 'Padang', lat: -(0 + 57 / 60), lng: 100 + 21 / 60, description: 'Sumatera Barat' },
  { name: 'Palembang', lat: -(2 + 59 / 60), lng: 104 + 45 / 60, description: 'Sumatera Selatan' },
  { name: 'Makassar', lat: -(5 + 8 / 60), lng: 119 + 25 / 60, description: 'Sulawesi Selatan' },
  { name: 'Banjarmasin', lat: -(3 + 19 / 60), lng: 114 + 35 / 60, description: 'Kalimantan Selatan' },
  { name: 'Pontianak', lat: -(0 + 2 / 60), lng: 109 + 20 / 60, description: 'Kalimantan Barat (Khatulistiwa)' },
  { name: 'Denpasar', lat: -(8 + 40 / 60), lng: 115 + 13 / 60, description: 'Bali' },
  { name: 'Kupang', lat: -(10 + 10 / 60), lng: 123 + 36 / 60, description: 'Nusa Tenggara Timur' },
  { name: 'Ambon', lat: -(3 + 42 / 60), lng: 128 + 11 / 60, description: 'Maluku' },
  { name: 'Jayapura', lat: -(2 + 32 / 60), lng: 140 + 43 / 60, description: 'Papua' }
];
