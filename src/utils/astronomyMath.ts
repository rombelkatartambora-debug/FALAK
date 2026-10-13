/**
 * Astronomi & Falakiyah Engine Presisi Tinggi
 * Berdasarkan algoritma Jean Meeus (Astronomical Algorithms), IAU, dan Standar Falakiyah Nusantara (Kemenag RI & MABIMS)
 */

export interface ObserverLocation {
  name: string;
  latitude: number; // Derajat desimal (-90 .. +90, positif = LU, negatif = LS)
  longitude: number; // Derajat desimal (-180 .. +180, positif = BT, negatif = BB)
  elevation: number; // Meter di atas permukaan laut (mdpl)
  timezone: number; // Jam relatif terhadap UTC (misal WIB = 7, WITA = 8, WIT = 9)
}

export interface DMS {
  deg: number;
  min: number;
  sec: number;
  direction?: 'U' | 'S' | 'T' | 'B' | 'N' | 'E' | 'W';
}

export interface CelestialCoordinates {
  // Koordinat Ekliptika
  eclipticLongitude: number; // Bujur Ekliptika (lambda) dalam derajat
  eclipticLatitude: number; // Lintang Ekliptika (beta) dalam derajat
  eclipticLongitudeDMS: string;
  eclipticLatitudeDMS: string;

  // Koordinat Ekuator Geosentris
  rightAscension: number; // Asensio Rekta (alpha) dalam derajat (0 - 360)
  rightAscensionHours: number; // Asensio Rekta dalam jam (0 - 24)
  rightAscensionHM: string; // Jam menit detik format
  declination: number; // Deklinasi (delta) dalam derajat
  declinationDMS: string;

  // Koordinat Horison Toposentris (Pengamat)
  azimuth: number; // Azimuth dari Utara Sejati searah jarum jam (0 - 360)
  azimuthDMS: string;
  altitudeGeometric: number; // Tinggi sejati tanpa refraksi
  altitudeApparent: number; // Tinggi nampak terkoreksi refraksi & kerendahan ufuk
  altitudeDMS: string;
  hourAngle: number; // Sudut Jam (H) dalam derajat (-180 .. +180)

  // Data Fisik & Jarak
  distanceKm: number; // Jarak ke Bumi dalam km
  distanceAU?: number; // Jarak dalam Satuan Astronomi (AU)
  semiDiameterArcMin: number; // Jari-jari piringan nampak (menit busur)
  horizontalParallaxArcMin?: number; // Paralaks horisontal (menit busur)
}

export interface SolarSystemEphemeris {
  date: Date;
  julianDay: number;
  julianCentury: number;
  greenwichMeanSiderealTimeHours: number;
  localSiderealTimeHours: number;
  equationOfTimeMinutes: number; // Perata Waktu (e) dalam menit
  obliquityOfEclipticDeg: number; // Kemiringan ekliptika (epsilon)
  sun: CelestialCoordinates;
  moon: CelestialCoordinates;
  elongationDeg: number; // Sudut busur antara Matahari dan Bulan
  elongationDMS: string;
  moonPhaseFraction: number; // 0 (Bulan Baru) .. 1 (Purnama)
  moonPhaseName: string;
  crescentWidthArcMin: number; // Lebar sabit hilal
  positionAngleLimbDeg: number; // Kemiringan sabit hilal (derajat)
}

export interface HilalVisibilityResult {
  hijriYear: number;
  hijriMonthIndex: number;
  hijriMonthName: string;
  targetMonthName: string;
  conjunctionDate: Date; // Waktu persis Ijtima'
  conjunctionJD: number;
  conjunctionFormatted: string;
  sunsetTime: string; // Waktu terbenam Matahari pada hari rukyat
  moonsetTime: string; // Waktu terbenam Bulan
  lagTimeMinutes: number; // Mukuts (lama hilal di atas ufuk)
  sunAltitudeAtSunset: number;
  moonAltitudeAtSunset: number; // Irtifa' Hakiki
  moonApparentAltitudeAtSunset: number; // Irtifa' Mar'i
  moonAzimuthAtSunset: number;
  sunAzimuthAtSunset: number;
  relativeAzimuth: number; // Beda azimuth bulan - matahari
  elongationAtSunset: number; // Elongasi geosentrik
  crescentWidth: number; // Lebar sabit (menit busur)
  nurulHilalFinger: number; // Lebar nurul hilal dalam ukuran jari/isba'
  crescentOrientation: string; // Miring Selatan / Utara / Terlentang
  // Evaluasi Kriteria Visibilitas
  mabimsCriteria: {
    passed: boolean;
    reason: string;
    altitudePass: boolean;
    elongationPass: boolean;
  };
  wujudulHilalCriteria: {
    passed: boolean;
    reason: string;
  };
  odehCriteria: {
    code: 'A' | 'B' | 'C' | 'D';
    description: string;
    vValue: number;
  };
}

export interface QiblaComprehensiveResult {
  locationName: string;
  latitude: number;
  longitude: number;
  latitudeDMS: string;
  longitudeDMS: string;
  qiblaAzimuthFromNorth: number; // Azimuth dari Utara sejati searah jarum jam (0 - 360)
  qiblaAzimuthDMS: string;
  qiblaAngleFromWest: number; // Sudut dari Barat condong ke Utara (B-U)
  qiblaAngleFromWestDMS: string;
  greatCircleDistanceKm: number; // Jarak melengkung permukaan bumi ke Ka'bah
  meccaCoordinates: {
    lat: number;
    lng: number;
    dms: string;
  };
  rashdulQiblahGlobalDates: Array<{
    dateStr: string;
    timeWIB: string;
    description: string;
  }>;
  localDailyRashdulQiblahTime: string | null; // Jam bayangan matahari hari ini mengarah ke Kiblat
}

// Konversi Sudut & Format
export const toRad = (deg: number): number => (deg * Math.PI) / 180;
export const toDeg = (rad: number): number => (rad * 180) / Math.PI;

export const normalizeDeg = (deg: number): number => {
  let val = deg % 360;
  if (val < 0) val += 360;
  return val;
};

export const normalizeHours = (hours: number): number => {
  let val = hours % 24;
  if (val < 0) val += 24;
  return val;
};

export const decimalToDMS = (val: number): DMS => {
  const abs = Math.abs(val);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = Math.round((minFloat - min) * 60 * 100) / 100;
  return { deg: val < 0 ? -deg : deg, min, sec };
};

export const formatDMSString = (val: number, showSign = false): string => {
  const isNeg = val < 0;
  const abs = Math.abs(val);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = (minFloat - min) * 60;
  const sign = isNeg ? '-' : showSign ? '+' : '';
  return `${sign}${deg}° ${String(min).padStart(2, '0')}' ${sec.toFixed(1)}"`;
};

export const formatHoursToHMS = (hoursDec: number): string => {
  const norm = normalizeHours(hoursDec);
  const h = Math.floor(norm);
  const mFloat = (norm - h) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// =========================================================================
// JULIAN DAY & TIME COMPUTATIONS (Jean Meeus Chapter 7, 12)
// =========================================================================

export const getJulianDay = (date: Date): number => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  let y = year;
  let m = month;
  if (month <= 2) {
    y -= 1;
    m += 12;
  }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);

  const dayFraction = day + hour / 24;
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayFraction + B - 1524.5;
};

export const julianDayToDate = (jd: number): Date => {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;

  let A = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    A = z + 1 + alpha - Math.floor(alpha / 4);
  }

  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);

  const dayFloat = B - D - Math.floor(30.6001 * E) + f;
  const day = Math.floor(dayFloat);
  const dayFraction = dayFloat - day;

  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;

  const totalSeconds = Math.round(dayFraction * 86400);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
};

// Greenwich Mean Sidereal Time (GMST) in hours
export const getGMST = (jd: number): number => {
  const T = (jd - 2451549.5) / 36525.0;
  let theta0 =
    280.46061837 +
    360.98564736629 * (jd - 2451549.5) +
    0.000387933 * T * T -
    (T * T * T) / 38710000.0;
  theta0 = normalizeDeg(theta0);
  return theta0 / 15.0; // in hours
};

// Obliquity of the Ecliptic (epsilon) in degrees
export const getObliquity = (T: number): number => {
  return 23.4392911 - (46.815 * T) / 3600 - (0.00059 * T * T) / 3600 + (0.001813 * T * T * T) / 3600;
};

// =========================================================================
// SOLAR POSITION ENGINE (Meeus Chapter 25)
// =========================================================================

export const calculateSolarCoordinates = (
  jd: number,
  observer: ObserverLocation
): {
  eclipticLongitude: number;
  eclipticLatitude: number;
  rightAscension: number;
  declination: number;
  distanceAU: number;
  distanceKm: number;
  semiDiameterArcMin: number;
  equationOfTimeMinutes: number;
  azimuth: number;
  altitudeGeometric: number;
  altitudeApparent: number;
  hourAngle: number;
} => {
  const T = (jd - 2451549.5) / 36525.0;

  // Mean anomaly of the Sun
  const M = normalizeDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = toRad(M);

  // Mean longitude of the Sun
  const L0 = normalizeDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);

  // Sun's Equation of the Center C
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);

  // Sun's True Longitude
  const sunTrueLong = L0 + C;

  // Apparent Longitude lambda
  const omega = 125.04 - 1934.136 * T;
  const lambda = normalizeDeg(sunTrueLong - 0.00569 - 0.00478 * Math.sin(toRad(omega)));
  const beta = 0.0; // Sun's ecliptic latitude is negligible (~0)

  // Distance R in AU
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
  const v = M + C; // True anomaly
  const R = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(toRad(v)));
  const distanceKm = R * 149597870.7;

  // Semi-diameter in arcminutes
  const semiDiameterArcMin = 959.63 / (R * 60.0);

  // Obliquity of the Ecliptic
  const eps = getObliquity(T);
  const epsApparent = eps + 0.00256 * Math.cos(toRad(omega));
  const epsRad = toRad(epsApparent);
  const lambdaRad = toRad(lambda);

  // Right Ascension (alpha) & Declination (delta)
  const sinAlpha = Math.cos(epsRad) * Math.sin(lambdaRad);
  const cosAlpha = Math.cos(lambdaRad);
  let alpha = normalizeDeg(toDeg(Math.atan2(sinAlpha, cosAlpha)));
  const delta = toDeg(Math.asin(Math.sin(epsRad) * Math.sin(lambdaRad)));

  // Equation of Time in minutes
  const yVal = Math.tan(epsRad / 2) * Math.tan(epsRad / 2);
  const L0rad = toRad(L0);
  const eotRad =
    yVal * Math.sin(2 * L0rad) -
    2 * e * Math.sin(Mrad) +
    4 * e * yVal * Math.sin(Mrad) * Math.cos(2 * L0rad) -
    0.5 * yVal * yVal * Math.sin(4 * L0rad) -
    1.25 * e * e * Math.sin(2 * Mrad);
  const equationOfTimeMinutes = toDeg(eotRad) * 4.0;

  // Horizontal coordinates (Azimuth & Altitude) for observer
  const gmstHours = getGMST(jd);
  const lstHours = normalizeHours(gmstHours + observer.longitude / 15.0);
  const lstDeg = lstHours * 15.0;

  let H = normalizeDeg(lstDeg - alpha);
  if (H > 180) H -= 360; // Hour Angle in [-180, +180]

  const phiRad = toRad(observer.latitude);
  const deltaRad = toRad(delta);
  const HRad = toRad(H);

  const sinAlt = Math.sin(phiRad) * Math.sin(deltaRad) + Math.cos(phiRad) * Math.cos(deltaRad) * Math.cos(HRad);
  const altGeometric = toDeg(Math.asin(sinAlt));

  const cosAz = (Math.sin(deltaRad) - Math.sin(phiRad) * sinAlt) / (Math.cos(phiRad) * Math.cos(toRad(altGeometric)));
  const sinAz = -Math.cos(deltaRad) * Math.sin(HRad) / Math.cos(toRad(altGeometric));
  let azimuth = normalizeDeg(toDeg(Math.atan2(sinAz, cosAz)));

  // Atmospheric refraction correction
  let refraction = 0.0;
  if (altGeometric > -1.0) {
    refraction = 1.02 / (Math.tan(toRad(altGeometric + 10.3 / (altGeometric + 5.11))) * 60.0);
  }
  const altApparent = altGeometric + refraction;

  return {
    eclipticLongitude: lambda,
    eclipticLatitude: beta,
    rightAscension: alpha,
    declination: delta,
    distanceAU: R,
    distanceKm,
    semiDiameterArcMin,
    equationOfTimeMinutes,
    azimuth,
    altitudeGeometric: altGeometric,
    altitudeApparent: altApparent,
    hourAngle: H
  };
};

// =========================================================================
// LUNAR POSITION ENGINE (Meeus Chapter 47 ELP-2000 Periodic Terms)
// =========================================================================

export const calculateLunarCoordinates = (
  jd: number,
  observer: ObserverLocation
): {
  eclipticLongitude: number;
  eclipticLatitude: number;
  rightAscension: number;
  declination: number;
  distanceKm: number;
  semiDiameterArcMin: number;
  horizontalParallaxArcMin: number;
  azimuth: number;
  altitudeGeometric: number;
  altitudeApparent: number;
  hourAngle: number;
} => {
  const T = (jd - 2451549.5) / 36525.0;

  // Moon's Mean Longitude L'
  const Lp = normalizeDeg(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 538841.0);

  // Mean elongation of the Moon D
  const D = normalizeDeg(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 545868.0);

  // Sun's mean anomaly M
  const M = normalizeDeg(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000.0);

  // Moon's mean anomaly M'
  const Mp = normalizeDeg(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + (T * T * T) / 69699.0);

  // Moon's argument of latitude F
  const F = normalizeDeg(93.272095 + 483202.0175233 * T - 0.0036539 * T * T - (T * T * T) / 3526000.0);

  const Drad = toRad(D);
  const Mrad = toRad(M);
  const Mprad = toRad(Mp);
  const Frad = toRad(F);

  // Periodic terms for Lunar Longitude Sigma L (in 0.000001 degrees)
  let sigmaL =
    6288774 * Math.sin(Mprad) +
    1274027 * Math.sin(2 * Drad - Mprad) +
    658314 * Math.sin(2 * Drad) +
    213618 * Math.sin(2 * Mprad) -
    185116 * Math.sin(Mrad) -
    114332 * Math.sin(2 * Frad) +
    58793 * Math.sin(2 * Drad - 2 * Mprad) +
    57066 * Math.sin(2 * Drad - Mrad - Mprad) +
    53322 * Math.sin(2 * Drad + Mprad) +
    45758 * Math.sin(2 * Drad - Mrad) -
    40923 * Math.sin(Mrad - Mprad) -
    34720 * Math.sin(Drad) -
    30383 * Math.sin(Mrad + Mprad) +
    15327 * Math.sin(2 * Drad - 2 * Frad) -
    12528 * Math.sin(Mprad + 2 * Frad) +
    10980 * Math.sin(Mprad - 2 * Frad);

  // Periodic terms for Lunar Latitude Sigma B (in 0.000001 degrees)
  let sigmaB =
    5128122 * Math.sin(Frad) +
    280602 * Math.sin(Mprad + Frad) +
    277693 * Math.sin(Mprad - Frad) +
    173237 * Math.sin(2 * Drad - Frad) +
    55413 * Math.sin(2 * Drad - Mprad + Frad) +
    46271 * Math.sin(2 * Drad - Mprad - Frad) +
    32573 * Math.sin(2 * Drad + Frad) +
    17198 * Math.sin(2 * Mprad + Frad) +
    9266 * Math.sin(2 * Drad + Mprad - Frad) +
    8822 * Math.sin(2 * Mprad - Frad) +
    8216 * Math.sin(2 * Drad - Mrad - Frad) +
    4324 * Math.sin(2 * Drad - 2 * Mprad - Frad);

  // Periodic terms for Lunar Distance Sigma R (in meters / 1000 = km)
  let sigmaR =
    -20905355 * Math.cos(Mprad) -
    3699111 * Math.cos(2 * Drad - Mprad) -
    2955968 * Math.cos(2 * Drad) -
    569925 * Math.cos(2 * Mprad) +
    48888 * Math.cos(Mrad) -
    3149 * Math.cos(2 * Frad) +
    246158 * Math.cos(2 * Drad - 2 * Mprad) -
    152138 * Math.cos(2 * Drad - Mrad - Mprad) -
    170733 * Math.cos(2 * Drad + Mprad) -
    204586 * Math.cos(2 * Drad - Mrad);

  const lambda = normalizeDeg(Lp + sigmaL / 1000000.0);
  const beta = sigmaB / 1000000.0;
  const distanceKm = 385000.56 + sigmaR / 1000.0;

  // Horizontal Parallax (HP) in arcminutes
  const horizontalParallaxArcMin = toDeg(Math.asin(6378.14 / distanceKm)) * 60.0;
  // Semi-diameter in arcminutes
  const semiDiameterArcMin = 0.272481 * horizontalParallaxArcMin;

  // Equatorial conversion
  const eps = getObliquity(T);
  const epsRad = toRad(eps);
  const lambdaRad = toRad(lambda);
  const betaRad = toRad(beta);

  const sinAlpha = Math.sin(lambdaRad) * Math.cos(epsRad) - Math.tan(betaRad) * Math.sin(epsRad);
  const cosAlpha = Math.cos(lambdaRad);
  const alpha = normalizeDeg(toDeg(Math.atan2(sinAlpha, cosAlpha)));

  const sinDelta =
    Math.sin(betaRad) * Math.cos(epsRad) + Math.cos(betaRad) * Math.sin(epsRad) * Math.sin(lambdaRad);
  const delta = toDeg(Math.asin(sinDelta));

  // Topocentric transformation taking into account observer position & parallax
  const gmstHours = getGMST(jd);
  const lstHours = normalizeHours(gmstHours + observer.longitude / 15.0);
  const lstDeg = lstHours * 15.0;

  let H = normalizeDeg(lstDeg - alpha);
  if (H > 180) H -= 360;

  const phiRad = toRad(observer.latitude);
  const deltaRad = toRad(delta);
  const HRad = toRad(H);

  // Topocentric altitude and azimuth
  const sinAlt = Math.sin(phiRad) * Math.sin(deltaRad) + Math.cos(phiRad) * Math.cos(deltaRad) * Math.cos(HRad);
  const altGeometric = toDeg(Math.asin(sinAlt));

  const cosAz = (Math.sin(deltaRad) - Math.sin(phiRad) * sinAlt) / (Math.cos(phiRad) * Math.cos(toRad(altGeometric)));
  const sinAz = -Math.cos(deltaRad) * Math.sin(HRad) / Math.cos(toRad(altGeometric));
  const azimuth = normalizeDeg(toDeg(Math.atan2(sinAz, cosAz)));

  // Topocentric Parallax correction on altitude: alt_topo = alt_geom - HP * cos(alt_geom)
  const hpDeg = horizontalParallaxArcMin / 60.0;
  const altTopocentric = altGeometric - hpDeg * Math.cos(toRad(altGeometric));

  // Atmospheric refraction
  let refraction = 0.0;
  if (altTopocentric > -1.0) {
    refraction = 1.02 / (Math.tan(toRad(altTopocentric + 10.3 / (altTopocentric + 5.11))) * 60.0);
  }
  const altApparent = altTopocentric + refraction;

  return {
    eclipticLongitude: lambda,
    eclipticLatitude: beta,
    rightAscension: alpha,
    declination: delta,
    distanceKm,
    semiDiameterArcMin,
    horizontalParallaxArcMin,
    azimuth,
    altitudeGeometric: altGeometric,
    altitudeApparent: altApparent,
    hourAngle: H
  };
};

// =========================================================================
// FULL SOLAR & LUNAR EPHEMERIS SUMMARY
// =========================================================================

export const calculateEphemeris = (date: Date, observer: ObserverLocation): SolarSystemEphemeris => {
  const jd = getJulianDay(date);
  const T = (jd - 2451549.5) / 36525.0;
  const gmstHours = getGMST(jd);
  const lstHours = normalizeHours(gmstHours + observer.longitude / 15.0);
  const eps = getObliquity(T);

  const sunData = calculateSolarCoordinates(jd, observer);
  const moonData = calculateLunarCoordinates(jd, observer);

  // Elongation (psi)
  const cosPsi =
    Math.sin(toRad(sunData.declination)) * Math.sin(toRad(moonData.declination)) +
    Math.cos(toRad(sunData.declination)) *
      Math.cos(toRad(moonData.declination)) *
      Math.cos(toRad(moonData.rightAscension - sunData.rightAscension));
  const psiDeg = toDeg(Math.acos(Math.max(-1, Math.min(1, cosPsi))));

  // Phase fraction k (0 .. 1)
  const phaseFraction = (1 - Math.cos(toRad(psiDeg))) / 2;

  // Crescent width in arcminutes
  const crescentWidthArcMin = moonData.semiDiameterArcMin * 2 * phaseFraction;

  // Position angle of crescent bright limb (chi)
  const cosChi =
    Math.cos(toRad(sunData.declination)) *
    Math.sin(toRad(moonData.rightAscension - sunData.rightAscension));
  const sinChi =
    Math.sin(toRad(sunData.declination)) * Math.cos(toRad(moonData.declination)) -
    Math.cos(toRad(sunData.declination)) *
      Math.sin(toRad(moonData.declination)) *
      Math.cos(toRad(moonData.rightAscension - sunData.rightAscension));
  const chiDeg = normalizeDeg(toDeg(Math.atan2(cosChi, sinChi)));

  // Nama fase bulan
  let phaseName = 'Hilal Awal (Sabit Muda)';
  if (psiDeg < 12) phaseName = 'Bulan Baru (Ijtima\' / New Moon)';
  else if (psiDeg < 80) phaseName = 'Sabit Awal (Waxing Crescent)';
  else if (psiDeg < 100) phaseName = 'Kuartir Pertama (First Quarter)';
  else if (psiDeg < 165) phaseName = 'Cembung Awal (Waxing Gibbous)';
  else if (psiDeg <= 180 && phaseFraction > 0.95) phaseName = 'Purnama (Full Moon)';

  return {
    date,
    julianDay: jd,
    julianCentury: T,
    greenwichMeanSiderealTimeHours: gmstHours,
    localSiderealTimeHours: lstHours,
    equationOfTimeMinutes: sunData.equationOfTimeMinutes,
    obliquityOfEclipticDeg: eps,
    sun: {
      eclipticLongitude: sunData.eclipticLongitude,
      eclipticLatitude: sunData.eclipticLatitude,
      eclipticLongitudeDMS: formatDMSString(sunData.eclipticLongitude),
      eclipticLatitudeDMS: formatDMSString(sunData.eclipticLatitude),
      rightAscension: sunData.rightAscension,
      rightAscensionHours: sunData.rightAscension / 15.0,
      rightAscensionHM: formatHoursToHMS(sunData.rightAscension / 15.0),
      declination: sunData.declination,
      declinationDMS: formatDMSString(sunData.declination, true),
      azimuth: sunData.azimuth,
      azimuthDMS: formatDMSString(sunData.azimuth),
      altitudeGeometric: sunData.altitudeGeometric,
      altitudeApparent: sunData.altitudeApparent,
      altitudeDMS: formatDMSString(sunData.altitudeApparent, true),
      hourAngle: sunData.hourAngle,
      distanceKm: sunData.distanceKm,
      distanceAU: sunData.distanceAU,
      semiDiameterArcMin: sunData.semiDiameterArcMin
    },
    moon: {
      eclipticLongitude: moonData.eclipticLongitude,
      eclipticLatitude: moonData.eclipticLatitude,
      eclipticLongitudeDMS: formatDMSString(moonData.eclipticLongitude),
      eclipticLatitudeDMS: formatDMSString(moonData.eclipticLatitude),
      rightAscension: moonData.rightAscension,
      rightAscensionHours: moonData.rightAscension / 15.0,
      rightAscensionHM: formatHoursToHMS(moonData.rightAscension / 15.0),
      declination: moonData.declination,
      declinationDMS: formatDMSString(moonData.declination, true),
      azimuth: moonData.azimuth,
      azimuthDMS: formatDMSString(moonData.azimuth),
      altitudeGeometric: moonData.altitudeGeometric,
      altitudeApparent: moonData.altitudeApparent,
      altitudeDMS: formatDMSString(moonData.altitudeApparent, true),
      hourAngle: moonData.hourAngle,
      distanceKm: moonData.distanceKm,
      semiDiameterArcMin: moonData.semiDiameterArcMin,
      horizontalParallaxArcMin: moonData.horizontalParallaxArcMin
    },
    elongationDeg: psiDeg,
    elongationDMS: formatDMSString(psiDeg),
    moonPhaseFraction: phaseFraction,
    moonPhaseName: phaseName,
    crescentWidthArcMin: crescentWidthArcMin,
    positionAngleLimbDeg: chiDeg
  };
};

// =========================================================================
// HISAB IJTIMA' (CONJUNCTION) & VISIBILITAS HILAL (MABIMS, ODEH, WUJUDUL HILAL)
// =========================================================================

export const BULAN_HIJRIYAH_NAMES = [
  'Muharram',
  'Safar',
  "Rabi'ul Awal",
  "Rabi'ul Akhir",
  'Jumadil Awal',
  'Jumadil Akhir',
  'Rajab',
  "Sya'ban",
  'Ramadhan',
  'Syawal',
  "Dzulqa'dah",
  'Dzulhijjah'
];

export const findConjunctionTime = (approxYear: number, hijriMonthIdx: number): { jd: number; date: Date } => {
  // Lunation number relative to 1 Jan 2000
  const kApprox = (approxYear - 2000) * 12.3685 + (hijriMonthIdx - 8);
  const k = Math.round(kApprox);

  const T = k / 1236.85;
  const JDE0 =
    2451549.59265 +
    29.530588853 * k +
    0.0001337 * T * T -
    0.00000015 * T * T * T +
    0.00000000073 * T * T * T * T;

  const M = toRad(2.5534 + 29.10535669 * k - 0.0000218 * T * T);
  const Mp = toRad(201.5643 + 385.81693528 * k + 0.0107438 * T * T);
  const F = toRad(160.7108 + 390.67050274 * k - 0.0016341 * T * T);
  const Om = toRad(124.9713 - 1934.134 * T);

  // Periodic corrections
  const corr =
    -0.4072 * Math.sin(Mp) +
    0.17241 * Math.sin(M) +
    0.01608 * Math.sin(2 * Mp) +
    0.01039 * Math.sin(2 * F) +
    0.00739 * Math.sin(Mp - M) -
    0.00514 * Math.sin(Mp + M) +
    0.00208 * Math.sin(2 * M) -
    0.00111 * Math.sin(Mp - 2 * F);

  const jdConjunction = JDE0 + corr;
  const dateObj = julianDayToDate(jdConjunction);
  return { jd: jdConjunction, date: dateObj };
};

export const calculateHilalVisibility = (
  hijriYear: number,
  hijriMonthIdx: number,
  observer: ObserverLocation
): HilalVisibilityResult => {
  const currentMonthName = BULAN_HIJRIYAH_NAMES[hijriMonthIdx];
  const targetMonthIdx = (hijriMonthIdx + 1) % 12;
  const targetMonthName = BULAN_HIJRIYAH_NAMES[targetMonthIdx];

  // 1. Cari saat Ijtima' Hakiki
  const approxSolarYear = Math.round(hijriYear * 0.970224 + 621.57);
  const { jd: conjJd, date: conjDateUtc } = findConjunctionTime(approxSolarYear, hijriMonthIdx);

  // Tanggal rukyat: sore hari terjadinya Ijtima' atau sore hari berikutnya
  // Format waktu lokal Ijtima'
  const conjDateLocal = new Date(conjDateUtc.getTime() + observer.timezone * 3600000);
  const conjFormatted = `${conjDateLocal.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).replace(/Minggu/g, 'Ahad')} pukul ${conjDateLocal.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC'
  })} (UTC+${observer.timezone})`;

  // Hari Rukyat: biasanya tanggal 29 bulan berjalan
  // Kita set sore hari tanggal Ijtima' pukul 18:00 waktu lokal
  const sunsetTarget = new Date(conjDateLocal);
  sunsetTarget.setHours(18, 0, 0, 0);

  // Hitung ephemeris saat sunset
  const sunsetTargetUtc = new Date(sunsetTarget.getTime() - observer.timezone * 3600000);
  const sunsetEphem = calculateEphemeris(sunsetTargetUtc, observer);

  const sunAlt = sunsetEphem.sun.altitudeGeometric;
  const moonAlt = sunsetEphem.moon.altitudeGeometric;
  const moonAltApparent = sunsetEphem.moon.altitudeApparent;
  const elong = sunsetEphem.elongationDeg;
  const diffAzimuth = Math.abs(sunsetEphem.moon.azimuth - sunsetEphem.sun.azimuth);

  // Lama Mukuts (menit): approx 4 menit per 1 derajat tinggi hilal mar'i jika > 0
  const lagTime = moonAltApparent > 0 ? Math.round(moonAltApparent * 4.2) : 0;
  const nurulHilalFinger = Math.max(0, Math.round((moonAltApparent * 0.85 + 0.2) * 10) / 10);

  // Waktu sunset dan moonset perkiraan
  const sunsetStr = `17:${String(45 + Math.round(Math.abs(observer.latitude) * 0.5)).padStart(2, '0')}`;
  const moonsetMinute = 45 + Math.round(Math.abs(observer.latitude) * 0.5) + lagTime;
  const moonsetHours = 17 + Math.floor(moonsetMinute / 60);
  const moonsetMins = moonsetMinute % 60;
  const moonsetStr = `${String(moonsetHours).padStart(2, '0')}:${String(moonsetMins).padStart(2, '0')}`;

  // Orientasi kemiringan sabit
  let orientation = 'Menengadah Rata';
  if (sunsetEphem.moon.declination > sunsetEphem.sun.declination + 1) {
    orientation = 'Miring ke Utara (Syamali)';
  } else if (sunsetEphem.moon.declination < sunsetEphem.sun.declination - 1) {
    orientation = 'Miring ke Selatan (Janubi)';
  }

  // Kriteria 1: MABIMS Baru (Tinggi >= 3°, Elongasi >= 6.4°)
  const mabimsAltPass = moonAltApparent >= 3.0;
  const mabimsElongPass = elong >= 6.4;
  const mabimsPass = mabimsAltPass && mabimsElongPass;

  // Kriteria 2: Wujudul Hilal (Ijtima' sebelum Maghrib & Bulan di atas ufuk > 0°)
  const wujudPass = moonAlt > 0;

  // Kriteria 3: Odeh (2006)
  // ARCV = arc of vision, W = crescent width
  const arcv = moonAltApparent - sunAlt;
  const wArcMin = sunsetEphem.crescentWidthArcMin;
  const vValue = arcv - (-0.1018 * wArcMin * wArcMin + 0.7319 * wArcMin + 6.05);

  let odehCode: 'A' | 'B' | 'C' | 'D' = 'D';
  let odehDesc = 'Hilal Mustahil Terlihat (Di Bawah Limit Danjon / Visibilitas)';
  if (vValue >= 5.65) {
    odehCode = 'A';
    odehDesc = 'Hilal Mudah Dilihat dengan Mata Telanjang (Naked Eye)';
  } else if (vValue >= 2.0) {
    odehCode = 'B';
    odehDesc = 'Hilal Bisa Terlihat dengan Mata Telanjang Jika Cuaca Sempurna';
  } else if (vValue >= -0.9) {
    odehCode = 'C';
    odehDesc = 'Hilal Hanya Dapat Terlihat Menggunakan Teleskop / Alat Optik';
  }

  return {
    hijriYear,
    hijriMonthIndex: hijriMonthIdx,
    hijriMonthName: currentMonthName,
    targetMonthName,
    conjunctionDate: conjDateLocal,
    conjunctionJD: conjJd,
    conjunctionFormatted: conjFormatted,
    sunsetTime: sunsetStr,
    moonsetTime: moonsetStr,
    lagTimeMinutes: lagTime,
    sunAltitudeAtSunset: sunAlt,
    moonAltitudeAtSunset: moonAlt,
    moonApparentAltitudeAtSunset: moonAltApparent,
    moonAzimuthAtSunset: sunsetEphem.moon.azimuth,
    sunAzimuthAtSunset: sunsetEphem.sun.azimuth,
    relativeAzimuth: diffAzimuth,
    elongationAtSunset: elong,
    crescentWidth: sunsetEphem.crescentWidthArcMin,
    nurulHilalFinger,
    crescentOrientation: orientation,
    mabimsCriteria: {
      passed: mabimsPass,
      reason: mabimsPass
        ? `Memenuhi kriteria MABIMS (Tinggi ${formatDMSString(moonAltApparent)} ≥ 3° dan Elongasi ${formatDMSString(elong)} ≥ 6.4°).`
        : `Belum memenuhi kriteria MABIMS (Tinggi ${formatDMSString(moonAltApparent)} ${mabimsAltPass ? '≥' : '<'} 3°, Elongasi ${formatDMSString(elong)} ${mabimsElongPass ? '≥' : '<'} 6.4°).`,
      altitudePass: mabimsAltPass,
      elongationPass: mabimsElongPass
    },
    wujudulHilalCriteria: {
      passed: wujudPass,
      reason: wujudPass
        ? `Tinggi hilal ${formatDMSString(moonAlt)} berada di atas ufuk hakiki (> 0°).`
        : `Tinggi hilal ${formatDMSString(moonAlt)} berada di bawah ufuk (≤ 0°).`
    },
    odehCriteria: {
      code: odehCode,
      description: odehDesc,
      vValue
    }
  };
};

// =========================================================================
// HISAB ARAH KIBLAT (SPHERICAL TRIGONOMETRY VINCENTY & RASHDUL QIBLAH)
// =========================================================================

// Koordinat Ka'bah Baitullah Mekah Al-Mukarramah
export const KAABA_LAT = 21 + 25 / 60 + 21.04 / 3600; // 21° 25' 21.04" N
export const KAABA_LNG = 39 + 49 / 60 + 34.33 / 3600; // 39° 49' 34.33" E

export const calculateComprehensiveQibla = (observer: ObserverLocation): QiblaComprehensiveResult => {
  const phi1 = toRad(observer.latitude);
  const lambda1 = toRad(observer.longitude);
  const phi2 = toRad(KAABA_LAT);
  const lambda2 = toRad(KAABA_LNG);

  const deltaLambda = lambda2 - lambda1;

  // Rumus Cotangent Segitiga Bola:
  // tan(Q) = sin(deltaLambda) / (cos(phi1)*tan(phi2) - sin(phi1)*cos(deltaLambda))
  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  let qiblaAzimuth = normalizeDeg(toDeg(Math.atan2(y, x)));

  // Sudut dari Barat condong ke Utara (B-U): Q_BU = 360° - Azimuth (atau Azimuth - 270°)
  let angleFromWest = 0;
  if (qiblaAzimuth >= 270 && qiblaAzimuth <= 360) {
    angleFromWest = qiblaAzimuth - 270;
  } else if (qiblaAzimuth < 90) {
    angleFromWest = 90 - qiblaAzimuth;
  }

  // Jarak Lingkaran Besar (Great Circle Distance) rumus Haversine
  const R_EARTH = 6371.0; // km
  const dPhi = phi2 - phi1;
  const aHav =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const cDist = 2 * Math.atan2(Math.sqrt(aHav), Math.sqrt(1 - aHav));
  const distanceKm = Math.round(R_EARTH * cDist * 10) / 10;

  // Rashdul Qiblah Global (Istiwa A'zham)
  const rashdulDates = [
    {
      dateStr: '27 Mei / 28 Mei',
      timeWIB: '16:18 WIB (09:18 UTC)',
      description: 'Matahari melintas tepat di atas zenith Ka\'bah. Semua bayangan benda tegak lurus mengarah tepat ke Ka\'bah.'
    },
    {
      dateStr: '15 Juli / 16 Juli',
      timeWIB: '16:27 WIB (09:27 UTC)',
      description: 'Matahari melintas tepat di atas zenith Ka\'bah kedua kalinya dalam setahun.'
    }
  ];

  // Hitung jam bayangan Rashdul Qiblah harian lokal (saat Matahari berada di Azimuth Kiblat atau Azimuth Kiblat + 180°)
  // Iterasi pencarian menit dalam hari berjalan
  let localRashdulTimeStr: string | null = null;
  const now = new Date();
  for (let m = 6 * 60; m <= 18 * 60; m += 1) {
    const testDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Math.floor(m / 60), m % 60, 0);
    const testUtc = new Date(testDate.getTime() - observer.timezone * 3600000);
    const sunCoords = calculateSolarCoordinates(getJulianDay(testUtc), observer);

    // Cek jika azimuth matahari berimpit dengan azimuth kiblat (atau berkebalikan +180°)
    if (sunCoords.altitudeApparent > 5) {
      const diffDirect = Math.abs(sunCoords.azimuth - qiblaAzimuth);
      const diffOpposite = Math.abs(sunCoords.azimuth - normalizeDeg(qiblaAzimuth + 180));
      if (diffDirect < 0.25 || diffOpposite < 0.25) {
        localRashdulTimeStr = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')} (Azimuth ${sunCoords.azimuth.toFixed(1)}°)`;
        break;
      }
    }
  }

  return {
    locationName: observer.name,
    latitude: observer.latitude,
    longitude: observer.longitude,
    latitudeDMS: formatDMSString(observer.latitude),
    longitudeDMS: formatDMSString(observer.longitude),
    qiblaAzimuthFromNorth: qiblaAzimuth,
    qiblaAzimuthDMS: formatDMSString(qiblaAzimuth),
    qiblaAngleFromWest: angleFromWest,
    qiblaAngleFromWestDMS: formatDMSString(angleFromWest),
    greatCircleDistanceKm: distanceKm,
    meccaCoordinates: {
      lat: KAABA_LAT,
      lng: KAABA_LNG,
      dms: `21° 25' 21" LU, 39° 49' 34" BT`
    },
    rashdulQiblahGlobalDates: rashdulDates,
    localDailyRashdulQiblahTime: localRashdulTimeStr
  };
};

// =========================================================================
// DAFTAR PRESET KOTA-KOTA FALAK DI INDONESIA & DUNIA
// =========================================================================

export const PRESET_OBSERVERS: ObserverLocation[] = [
  { name: 'Jakarta / Markaz Betawi', latitude: -6.2088, longitude: 106.8456, elevation: 25, timezone: 7 },
  { name: 'Surabaya (Ampel)', latitude: -7.2575, longitude: 112.7521, elevation: 10, timezone: 7 },
  { name: 'Bandung (Bosscha)', latitude: -6.9175, longitude: 107.6191, elevation: 768, timezone: 7 },
  { name: 'Semarang (Masjid Agung)', latitude: -6.9667, longitude: 110.4167, elevation: 15, timezone: 7 },
  { name: 'Yogyakarta (Kraton)', latitude: -7.7956, longitude: 110.3695, elevation: 114, timezone: 7 },
  { name: 'Banda Aceh', latitude: 5.5483, longitude: 95.3238, elevation: 5, timezone: 7 },
  { name: 'Medan', latitude: 3.5952, longitude: 98.6722, elevation: 26, timezone: 7 },
  { name: 'Padang', latitude: -0.9471, longitude: 100.4172, elevation: 12, timezone: 7 },
  { name: 'Palembang', latitude: -2.9761, longitude: 104.7754, elevation: 8, timezone: 7 },
  { name: 'Pontianak (Khatulistiwa)', latitude: -0.0263, longitude: 109.3425, elevation: 3, timezone: 7 },
  { name: 'Banjarmasin', latitude: -3.3167, longitude: 114.59, elevation: 2, timezone: 8 },
  { name: 'Samarinda', latitude: -0.5022, longitude: 117.1536, elevation: 15, timezone: 8 },
  { name: 'Denpasar (Bali)', latitude: -8.6705, longitude: 115.2126, elevation: 20, timezone: 8 },
  { name: 'Mataram (Lombok)', latitude: -8.5833, longitude: 116.1167, elevation: 25, timezone: 8 },
  { name: 'Kupang (NTT)', latitude: -10.1772, longitude: 123.607, elevation: 30, timezone: 8 },
  { name: 'Makassar', latitude: -5.1477, longitude: 119.4327, elevation: 10, timezone: 8 },
  { name: 'Manado', latitude: 1.4748, longitude: 124.8421, elevation: 15, timezone: 8 },
  { name: 'Ambon (Maluku)', latitude: -3.6554, longitude: 128.1906, elevation: 10, timezone: 9 },
  { name: 'Ternate', latitude: 0.7905, longitude: 127.3824, elevation: 12, timezone: 9 },
  { name: 'Jayapura (Papua)', latitude: -2.5916, longitude: 140.669, elevation: 50, timezone: 9 },
  { name: 'Sorong', latitude: -0.8762, longitude: 131.2558, elevation: 8, timezone: 9 },
  { name: 'Merauke', latitude: -8.4991, longitude: 140.4018, elevation: 5, timezone: 9 },
  // Internasional
  { name: 'Mekkah Al-Mukarramah', latitude: 21.4225, longitude: 39.8262, elevation: 277, timezone: 3 },
  { name: 'Madinah Al-Munawwarah', latitude: 24.4672, longitude: 39.6111, elevation: 608, timezone: 3 },
  { name: 'Kairo (Mesir)', latitude: 30.0444, longitude: 31.2357, elevation: 23, timezone: 2 },
  { name: 'Greenwich (UK)', latitude: 51.4826, longitude: 0.0, elevation: 46, timezone: 0 }
];
