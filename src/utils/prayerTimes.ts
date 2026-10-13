import { CityLocation, PrayerTimes } from '../types/calendar';

export const CITIES_INDONESIA: CityLocation[] = [
  { id: 'jkt', name: 'DKI Jakarta', province: 'DKI Jakarta', lat: -6.2088, lng: 106.8456, timezone: 7 },
  { id: 'sby', name: 'Surabaya', province: 'Jawa Timur', lat: -7.2575, lng: 112.7521, timezone: 7 },
  { id: 'bdg', name: 'Bandung', province: 'Jawa Barat', lat: -6.9175, lng: 107.6191, timezone: 7 },
  { id: 'bgr', name: 'Bogor', province: 'Jawa Barat', lat: -6.5971, lng: 106.8060, timezone: 7 },
  { id: 'dpk', name: 'Depok', province: 'Jawa Barat', lat: -6.4025, lng: 106.7942, timezone: 7 },
  { id: 'tgr', name: 'Tangerang', province: 'Banten', lat: -6.1783, lng: 106.6319, timezone: 7 },
  { id: 'bks', name: 'Bekasi', province: 'Jawa Barat', lat: -6.2383, lng: 106.9756, timezone: 7 },
  { id: 'srg', name: 'Serang', province: 'Banten', lat: -6.1104, lng: 106.1640, timezone: 7 },
  { id: 'crb', name: 'Cirebon', province: 'Jawa Barat', lat: -6.7320, lng: 108.5523, timezone: 7 },
  { id: 'tsm', name: 'Tasikmalaya', province: 'Jawa Barat', lat: -7.3274, lng: 108.2207, timezone: 7 },
  { id: 'smg', name: 'Semarang', province: 'Jawa Tengah', lat: -6.9667, lng: 110.4167, timezone: 7 },
  { id: 'slo', name: 'Surakarta (Solo)', province: 'Jawa Tengah', lat: -7.5755, lng: 110.8243, timezone: 7 },
  { id: 'jog', name: 'Yogyakarta', province: 'D.I. Yogyakarta', lat: -7.7956, lng: 110.3695, timezone: 7 },
  { id: 'mgl', name: 'Magelang', province: 'Jawa Tengah', lat: -7.4706, lng: 110.2178, timezone: 7 },
  { id: 'mlg', name: 'Malang', province: 'Jawa Timur', lat: -7.9666, lng: 112.6326, timezone: 7 },
  { id: 'kdr', name: 'Kediri', province: 'Jawa Timur', lat: -7.8480, lng: 112.0178, timezone: 7 },
  { id: 'mdn', name: 'Medan', province: 'Sumatera Utara', lat: 3.5952, lng: 98.6722, timezone: 7 },
  { id: 'ach', name: 'Banda Aceh', province: 'Aceh', lat: 5.5483, lng: 95.3238, timezone: 7 },
  { id: 'pdg', name: 'Padang', province: 'Sumatera Barat', lat: -0.9471, lng: 100.4172, timezone: 7 },
  { id: 'pbr', name: 'Pekanbaru', province: 'Riau', lat: 0.5071, lng: 101.4478, timezone: 7 },
  { id: 'plg', name: 'Palembang', province: 'Sumatera Selatan', lat: -2.9761, lng: 104.7754, timezone: 7 },
  { id: 'jmb', name: 'Jambi', province: 'Jambi', lat: -1.6101, lng: 103.6131, timezone: 7 },
  { id: 'bkl', name: 'Bengkulu', province: 'Bengkulu', lat: -3.8004, lng: 102.2655, timezone: 7 },
  { id: 'bdl', name: 'Bandar Lampung', province: 'Lampung', lat: -5.4292, lng: 105.2611, timezone: 7 },
  { id: 'pkp', name: 'Pangkalpinang', province: 'Bangka Belitung', lat: -2.1333, lng: 106.1167, timezone: 7 },
  { id: 'tpi', name: 'Tanjung Pinang', province: 'Kepulauan Riau', lat: 0.9167, lng: 104.4500, timezone: 7 },
  { id: 'dps', name: 'Denpasar', province: 'Bali', lat: -8.6705, lng: 115.2126, timezone: 8 },
  { id: 'mtr', name: 'Mataram (Lombok)', province: 'Nusa Tenggara Barat', lat: -8.5833, lng: 116.1167, timezone: 8 },
  { id: 'kpg', name: 'Kupang', province: 'Nusa Tenggara Timur', lat: -10.1772, lng: 123.6070, timezone: 8 },
  { id: 'pnk', name: 'Pontianak', province: 'Kalimantan Barat', lat: -0.0263, lng: 109.3425, timezone: 7 },
  { id: 'bjm', name: 'Banjarmasin', province: 'Kalimantan Selatan', lat: -3.3167, lng: 114.5900, timezone: 8 },
  { id: 'bpp', name: 'Balikpapan', province: 'Kalimantan Timur', lat: -1.2654, lng: 116.8312, timezone: 8 },
  { id: 'smd', name: 'Samarinda', province: 'Kalimantan Timur', lat: -0.5022, lng: 117.1536, timezone: 8 },
  { id: 'pky', name: 'Palangka Raya', province: 'Kalimantan Tengah', lat: -2.2136, lng: 113.9108, timezone: 7 },
  { id: 'trk', name: 'Tarakan', province: 'Kalimantan Utara', lat: 3.3272, lng: 117.5786, timezone: 8 },
  { id: 'mks', name: 'Makassar', province: 'Sulawesi Selatan', lat: -5.1477, lng: 119.4327, timezone: 8 },
  { id: 'mnd', name: 'Manado', province: 'Sulawesi Utara', lat: 1.4748, lng: 124.8421, timezone: 8 },
  { id: 'plu', name: 'Palu', province: 'Sulawesi Tengah', lat: -0.9003, lng: 119.8780, timezone: 8 },
  { id: 'kdr2', name: 'Kendari', province: 'Sulawesi Tenggara', lat: -3.9985, lng: 122.5126, timezone: 8 },
  { id: 'gtl', name: 'Gorontalo', province: 'Gorontalo', lat: 0.5435, lng: 123.0568, timezone: 8 },
  { id: 'amb', name: 'Ambon', province: 'Maluku', lat: -3.6554, lng: 128.1906, timezone: 9 },
  { id: 'tnt', name: 'Ternate', province: 'Maluku Utara', lat: 0.7905, lng: 127.3824, timezone: 9 },
  { id: 'jyp', name: 'Jayapura', province: 'Papua', lat: -2.5916, lng: 140.6690, timezone: 9 },
  { id: 'srg2', name: 'Sorong', province: 'Papua Barat Daya', lat: -0.8762, lng: 131.2558, timezone: 9 },
  { id: 'mrk', name: 'Merauke', province: 'Papua Selatan', lat: -8.4991, lng: 140.4018, timezone: 9 }
];

// Helper to convert radians / degrees
const toRad = (deg: number) => (deg * Math.PI) / 180.0;
const toDeg = (rad: number) => (rad * 180.0) / Math.PI;

/**
 * Calculates prayer times using standard Kemenag RI parameters:
 * Subuh: 20°, Isya: 18°, Asr: Shafi'i shadow ratio 1, Ihtiyat: +2 minutes
 */
export function calculatePrayerTimes(date: Date, city: CityLocation): PrayerTimes {
  const lat = city.lat;
  const lng = city.lng;
  const timezone = city.timezone;

  // Day of the year
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffDays = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1;

  // Solar declination (delta) & Equation of time (EoT)
  const b = (2 * Math.PI * (diffDays - 81)) / 365;
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // in minutes
  const delta = 23.45 * Math.sin((2 * Math.PI * (284 + diffDays)) / 365); // in degrees

  // Solar Noon (Dzuhur) in local time (hours)
  const transitHours = 12 + (timezone * 15 - lng) / 15 - eot / 60;
  const dzuhurDec = transitHours + 2 / 60; // +2 min ihtiyat

  // Function to calculate hour angle t for given solar angle alpha
  const calcHourAngle = (alpha: number) => {
    const sinLat = Math.sin(toRad(lat));
    const cosLat = Math.cos(toRad(lat));
    const sinDelta = Math.sin(toRad(delta));
    const cosDelta = Math.cos(toRad(delta));
    const sinAlpha = Math.sin(toRad(alpha));

    const cosH = (sinAlpha - sinLat * sinDelta) / (cosLat * cosDelta);
    if (cosH > 1 || cosH < -1) return 0;
    return toDeg(Math.acos(cosH)) / 15.0; // hours
  };

  // Subuh: -20 degrees
  const hSubuh = calcHourAngle(-20);
  const subuhDec = transitHours - hSubuh + 2 / 60;

  // Imsak: 10 minutes before Subuh
  const imsakDec = subuhDec - 10 / 60;

  // Terbit (Sunrise): -0.833 degrees
  const hSunrise = calcHourAngle(-0.833);
  const terbitDec = transitHours - hSunrise - 2 / 60;

  // Ashar: arc cot (1 + tan|lat - delta|)
  const phiMinusDelta = Math.abs(toRad(lat) - toRad(delta));
  const asrAlt = toDeg(Math.atan(1 / (1 + Math.tan(phiMinusDelta))));
  const hAshar = calcHourAngle(asrAlt);
  const asharDec = transitHours + hAshar + 2 / 60;

  // Maghrib (Sunset): -0.833 degrees
  const maghribDec = transitHours + hSunrise + 2 / 60;

  // Isya: -18 degrees
  const hIsya = calcHourAngle(-18);
  const isyaDec = transitHours + hIsya + 2 / 60;

  const formatHours = (decHours: number): string => {
    let normalized = decHours;
    while (normalized < 0) normalized += 24;
    while (normalized >= 24) normalized -= 24;

    const hours = Math.floor(normalized);
    const minutes = Math.floor((normalized - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  return {
    imsak: formatHours(imsakDec),
    subuh: formatHours(subuhDec),
    terbit: formatHours(terbitDec),
    dzuhur: formatHours(dzuhurDec),
    ashar: formatHours(asharDec),
    maghrib: formatHours(maghribDec),
    isya: formatHours(isyaDec)
  };
}

/**
 * Returns which prayer is next, and how many seconds remain
 */
export function getNextPrayerInfo(prayerTimes: PrayerTimes, currentTime: Date): { name: string; time: string; remainingStr: string } {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const parseToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const schedule = [
    { name: 'Subuh', time: prayerTimes.subuh, min: parseToMinutes(prayerTimes.subuh) },
    { name: 'Dzuhur', time: prayerTimes.dzuhur, min: parseToMinutes(prayerTimes.dzuhur) },
    { name: 'Ashar', time: prayerTimes.ashar, min: parseToMinutes(prayerTimes.ashar) },
    { name: 'Maghrib', time: prayerTimes.maghrib, min: parseToMinutes(prayerTimes.maghrib) },
    { name: 'Isya', time: prayerTimes.isya, min: parseToMinutes(prayerTimes.isya) }
  ];

  for (const s of schedule) {
    if (s.min > currentMinutes) {
      const diffMin = s.min - currentMinutes;
      const hours = Math.floor(diffMin / 60);
      const mins = diffMin % 60;
      return {
        name: s.name,
        time: s.time,
        remainingStr: hours > 0 ? `${hours} jam ${mins} mnt` : `${mins} menit lagi`
      };
    }
  }

  // If past Isya, next is Subuh tomorrow
  const subuhMin = schedule[0].min + 24 * 60;
  const diffMin = subuhMin - currentMinutes;
  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;

  return {
    name: 'Subuh',
    time: prayerTimes.subuh,
    remainingStr: `${hours} jam ${mins} mnt lagi`
  };
}
