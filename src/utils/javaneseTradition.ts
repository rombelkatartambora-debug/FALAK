/**
 * Budaya Nusantara & Tradisi Jawa:
 * 1. Petung Jodoh / Kalkulator Kecocokan Weton (8 Siklus Adat Jawa)
 * 2. Pencari Hari Baik (Akad Nikah, Pindah Rumah, Buka Usaha, Khitanan)
 * 3. Pranata Mangsa (12 Siklus Musim Tradisional Jawa)
 */

import { getPasaran, getNeptuInfo } from './calendarMath';

export interface PetungJodohResult {
  pria: {
    nama: string;
    tanggalStr: string;
    hari: string;
    pasaran: string;
    neptuHari: number;
    neptuPasaran: number;
    totalNeptu: number;
    weton: string;
  };
  wanita: {
    nama: string;
    tanggalStr: string;
    hari: string;
    pasaran: string;
    neptuHari: number;
    neptuPasaran: number;
    totalNeptu: number;
    weton: string;
  };
  totalNeptuGabungan: number;
  kategori: 'Pegat' | 'Ratu' | 'Jodo' | 'Topo' | 'Tinari' | 'Padu' | 'Sujanan' | 'Pesthi';
  kategoriAngka: number; // 1 s/d 8
  artiKategori: string;
  penjelasanWatak: string;
  saranTradisi: string;
  tingkatKecocokan: number; // Persentase 0 - 100%
  statusHarmoni: 'Sangat Baik' | 'Baik & Harmonis' | 'Perlu Ikhtiar & Saling Pengertian';
}

const PETUNG_KATEGORI_INFO: Record<string, {
  nama: 'Pegat' | 'Ratu' | 'Jodo' | 'Topo' | 'Tinari' | 'Padu' | 'Sujanan' | 'Pesthi';
  arti: string;
  penjelasan: string;
  saran: string;
  score: number;
  status: 'Sangat Baik' | 'Baik & Harmonis' | 'Perlu Ikhtiar & Saling Pengertian';
}> = {
  '1': {
    nama: 'Pegat',
    arti: 'Adanya potensi ujian dalam komunikasi, kesalahpahaman, atau masalah materi.',
    penjelasan: 'Kategori Pegat (sisanya 1) menunjukkan hubungan yang rentan diuji oleh godaan emosi atau perbedaan sudut pandang. Sering kali perselisihan timbul dari hal-hal sepele atau urusan ekonomi keluarga.',
    saran: 'Kunci keselamatan ada pada kelapangan dada, saling menahan amarah, dan memperbanyak sedekah bersama. Adat Jawa menyarankan ruwatan murah pangan dan memilih hari akad nikah yang berneptu tinggi.',
    score: 65,
    status: 'Perlu Ikhtiar & Saling Pengertian'
  },
  '2': {
    nama: 'Ratu',
    arti: 'Kedudukan mulia, disegani banyak orang, dan berwibawa tinggi.',
    penjelasan: 'Kategori Ratu (sisanya 2) melambangkan keharmonisan sejati di mata masyarakat. Pasangan ini bagaikan raja dan permaisuri, sangat serasi, disukai tetangga, dan menjadi teladan bagi keluarga besar.',
    saran: 'Pertahankan sifat rendah hati, jangan takabur. Sangat bagus untuk memimpin komunitas atau mengelola bisnis bersama.',
    score: 95,
    status: 'Sangat Baik'
  },
  '3': {
    nama: 'Jodo',
    arti: 'Pasangan sejati (soulmate), rukun tentram hingga usia senja.',
    penjelasan: 'Kategori Jodo (sisanya 3) adalah salah satu hasil terbaik dalam primbon petung Jawa. Pasangan saling melengkapi, saling menerima kekurangan, dan rezeki mengalir tenteram.',
    saran: 'Terus rawat rasa syukur dan saling menyayangi. Insya Allah langgeng hingga kaken-kaken ninen-ninen (kakek nenek).',
    score: 98,
    status: 'Sangat Baik'
  },
  '4': {
    nama: 'Topo',
    arti: 'Prihatin di awal pernikahan, namun memetik kemuliaan dan sukses di masa depan.',
    penjelasan: 'Kategori Topo (sisanya 4) menunjukkan jalan berliku di fase-fase awal, baik dalam penyesuaian sifat maupun merintis karier. Namun ketabahan bersama akan berbuah kesuksesan besar di masa matang.',
    saran: 'Kuncinya adalah sabar dan tekun menabung. Jangan mudah putus asa saat menghadapi ujian ekonomi awal pernikahan.',
    score: 80,
    status: 'Baik & Harmonis'
  },
  '5': {
    nama: 'Tinari',
    arti: 'Rezeki murah sandang pangan, gampang mencari nafkah, dan bahagia.',
    penjelasan: 'Kategori Tinari (sisanya 5) membawa berkah kemudahan dalam mencari rezeki. Pasangan ini kerap mendapat keberuntungan tak terduga dan hidup berkecukupan.',
    saran: 'Jangan lupa berzakat dan berbagi rezeki kepada sanak famili agar keberkahan terus melimpah.',
    score: 92,
    status: 'Sangat Baik'
  },
  '6': {
    nama: 'Padu',
    arti: 'Sering adu mulut atau beda pendapat, namun tidak sampai berujung perpisahan.',
    penjelasan: 'Kategori Padu (sisanya 6) mencirikan pasangan yang dinamis dan sama-sama keras kemauannya. Sering berdebat sengit, namun cepat berbaikan kembali.',
    saran: 'Biasakan jeda sejenak saat emosi memuncak. Hindari membahas hal sensitif saat perut lapar atau lelah bekerja.',
    score: 70,
    status: 'Perlu Ikhtiar & Saling Pengertian'
  },
  '7': {
    nama: 'Sujanan',
    arti: 'Rawan diuji rasa cemburu atau godaan orang ketiga.',
    penjelasan: 'Kategori Sujanan (sisanya 7) menandakan pentingnya keterbukaan tanpa rahasia. Prasangka buruk dan salah paham bisa menjadi pemicu kerenggangan jika tidak segera diklarifikasi.',
    saran: 'Junjung tinggi kejujuran, saling menghargai privasi dengan batas wajar, dan hindari membuka celah untuk perselingkuhan.',
    score: 68,
    status: 'Perlu Ikhtiar & Saling Pengertian'
  },
  '8': {
    nama: 'Pesthi',
    arti: 'Rukun, damai, tenteram, tenteram batin, dan langgeng abadi.',
    penjelasan: 'Kategori Pesthi (sisanya 8 atau kelipatan 8) adalah simbol ketenangan batin. Walaupun badai kehidupan datang, rumah tangga tetap adem ayem dan harmonis.',
    saran: 'Jaga kehangatan komunikasi dan terus istiqomah dalam ibadah keluarga.',
    score: 96,
    status: 'Sangat Baik'
  }
};

export function hitungPetungJodoh(
  namaPria: string,
  tanggalLahirPria: Date,
  namaWanita: string,
  tanggalLahirWanita: Date
): PetungJodohResult {
  const pasaranPria = getPasaran(tanggalLahirPria);
  const infoPria = getNeptuInfo(tanggalLahirPria, pasaranPria);

  const pasaranWanita = getPasaran(tanggalLahirWanita);
  const infoWanita = getNeptuInfo(tanggalLahirWanita, pasaranWanita);

  const total = infoPria.totalNeptu + infoWanita.totalNeptu;

  // Rumus petung 8: sisa = total % 8 (jika 0 maka dianggap 8)
  let sisa = total % 8;
  if (sisa === 0) sisa = 8;

  const infoKategori = PETUNG_KATEGORI_INFO[String(sisa)] || PETUNG_KATEGORI_INFO['3'];

  return {
    pria: {
      nama: namaPria || 'Calon Mempelai Pria',
      tanggalStr: tanggalLahirPria.toISOString().split('T')[0],
      hari: infoPria.hari,
      pasaran: infoPria.pasaran,
      neptuHari: infoPria.neptuHari,
      neptuPasaran: infoPria.neptuPasaran,
      totalNeptu: infoPria.totalNeptu,
      weton: infoPria.weton
    },
    wanita: {
      nama: namaWanita || 'Calon Mempelai Wanita',
      tanggalStr: tanggalLahirWanita.toISOString().split('T')[0],
      hari: infoWanita.hari,
      pasaran: infoWanita.pasaran,
      neptuHari: infoWanita.neptuHari,
      neptuPasaran: infoWanita.neptuPasaran,
      totalNeptu: infoWanita.totalNeptu,
      weton: infoWanita.weton
    },
    totalNeptuGabungan: total,
    kategori: infoKategori.nama,
    kategoriAngka: sisa,
    artiKategori: infoKategori.arti,
    penjelasanWatak: infoKategori.penjelasan,
    saranTradisi: infoKategori.saran,
    tingkatKecocokan: infoKategori.score,
    statusHarmoni: infoKategori.status
  };
}

// -------------------------------------------------------------
// PENCARI HARI BAIK (Hajatan, Nikah, Pindah Rumah, Buka Usaha)
// -------------------------------------------------------------

export type KebutuhanHajatan = 'nikah' | 'pindah_rumah' | 'usaha' | 'khitanan';

export interface HariBaikItem {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNum: number;
  hari: string;
  pasaran: string;
  weton: string;
  totalNeptu: number;
  predikat: 'Sangat Baik (Utama)' | 'Baik (Dianjurkan)' | 'Netral';
  alasan: string;
  pancasuda: string; // Karakter hari (Tunggak Semi, Satriya Wibawa, Dadi Kayu, dll.)
}

export function cariHariBaikBulan(
  year: number,
  month: number, // 1..12
  kebutuhan: KebutuhanHajatan
): HariBaikItem[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const results: HariBaikItem[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d, 12, 0, 0);
    const dayOfWeek = date.getDay();
    const pasaran = getPasaran(date);
    const neptu = getNeptuInfo(date, pasaran);

    // Hari pantangan adat Jawa (Taliwangke / Samparwangke / Dina Sangar)
    // Taliwangke: Senin Kliwon, Selasa Legi, Rabu Pahing, Kamis Pon, Jumat Wage, Sabtu Kliwon, Ahad Legi
    const isTaliwangke = 
      (dayOfWeek === 1 && pasaran === 'Kliwon') ||
      (dayOfWeek === 2 && pasaran === 'Legi') ||
      (dayOfWeek === 3 && pasaran === 'Pahing') ||
      (dayOfWeek === 4 && pasaran === 'Pon') ||
      (dayOfWeek === 5 && pasaran === 'Wage') ||
      (dayOfWeek === 6 && pasaran === 'Kliwon') ||
      (dayOfWeek === 0 && pasaran === 'Legi');

    // Hindari Taliwangke untuk hajat besar
    if (isTaliwangke) continue;

    // Evaluasi Pancasuda hari: totalNeptu % 5
    // 1: Sri (Rezeki), 2: Lungguh (Derajat), 3: Gedhong (Kekayaan), 4: Lara (Ujian), 5: Pati (Kematian/Kurang Cocok)
    const sisa5 = neptu.totalNeptu % 5;
    let pancasuda = 'Sri (Murah Sandang Pangan)';
    let predikat: 'Sangat Baik (Utama)' | 'Baik (Dianjurkan)' | 'Netral' = 'Netral';
    let alasan = '';

    if (sisa5 === 1) {
      pancasuda = 'Sri (Kemakmuran & Rezeki)';
      predikat = 'Sangat Baik (Utama)';
      alasan = 'Karakter hari Sri membawa ketentraman, kemakmuran, dan kelancaran rezeki.';
    } else if (sisa5 === 2) {
      pancasuda = 'Lungguh (Kedudukan & Derajat)';
      predikat = 'Sangat Baik (Utama)';
      alasan = 'Sangat cocok untuk mengangkat derajat, kehormatan keluarga, dan stabilitas.';
    } else if (sisa5 === 3) {
      pancasuda = 'Gedhong (Kekayaan & Simpanan)';
      predikat = 'Baik (Dianjurkan)';
      alasan = 'Mendatangkan kemudahan mengumpulkan bekal hidup dan ketenteraman materi.';
    } else if (sisa5 === 0) {
      pancasuda = 'Dadi Kayu (Kekuatan & Ketahanan)';
      predikat = 'Baik (Dianjurkan)';
      alasan = 'Kukuh bagai pohon rindang yang menaungi keluarga.';
    }

    // Filter spesifik kebutuhan
    if (kebutuhan === 'nikah') {
      // Hari Jumat, Kamis, dan Senin berneptu sedang-tinggi sangat disukai
      if ([1, 4, 5].includes(dayOfWeek) && (sisa5 === 1 || sisa5 === 2)) {
        predikat = 'Sangat Baik (Utama)';
        alasan = `Hari ${neptu.hari} ${neptu.pasaran} berwatak ${pancasuda}. Sangat dianjurkan untuk Ijab Qobul & Walimatul Ursy.`;
      }
    } else if (kebutuhan === 'usaha') {
      // Buka usaha: mencari hari Sri atau Gedhong
      if (sisa5 === 1 || sisa5 === 3) {
        predikat = 'Sangat Baik (Utama)';
        alasan = `Hari ${neptu.hari} ${neptu.pasaran} membawa rezeki terus bertumbuh (Tunggak Semi) dan pelanggan berkah.`;
      }
    } else if (kebutuhan === 'pindah_rumah') {
      // Pindah rumah: Lungguh atau Gedhong
      if (sisa5 === 2 || sisa5 === 3) {
        predikat = 'Sangat Baik (Utama)';
        alasan = `Tempat tinggal baru membawa ketenteraman batin dan keharmonisan sanak famili.`;
      }
    }

    if (predikat !== 'Netral') {
      results.push({
        date,
        dateStr: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        dayNum: d,
        hari: neptu.hari,
        pasaran: neptu.pasaran,
        weton: neptu.weton,
        totalNeptu: neptu.totalNeptu,
        predikat,
        alasan,
        pancasuda
      });
    }
  }

  return results.slice(0, 8); // Tampilkan 8 rekomendasi terbaik
}

// -------------------------------------------------------------
// PRANATA MANGSA (12 Siklus Musim Tradisional Jawa)
// -------------------------------------------------------------

export interface PranataMangsaInfo {
  no: number;
  nama: string;
  namaJawa: string;
  rentangTanggal: string;
  candra: string;
  artiCandra: string;
  musim: 'Kemarau (Mareng)' | 'Pancaroba' | 'Hujan (Labuh/Rendheng)';
  tandaAlam: string;
  kearifanTani: string;
  isActiveNow: boolean;
}

export const LIST_PRANATA_MANGSA: Omit<PranataMangsaInfo, 'isActiveNow'>[] = [
  {
    no: 1,
    nama: 'Kasa (Kartika)',
    namaJawa: 'Mangsa Kasa (41 hari)',
    rentangTanggal: '23 Juni – 2 Agustus',
    candra: 'Sesotya murca ing embanan',
    artiCandra: 'Permata lepas dari ikatannya (daun-daun berguguran)',
    musim: 'Kemarau (Mareng)',
    tandaAlam: 'Daun pohon jati dan randu mulai rontok, tanah mengering, hawa malam terasa dingin.',
    kearifanTani: 'Petani membersihkan lahan (palawija), membakar sisa jerami, dan menjemur hasil panen.'
  },
  {
    no: 2,
    nama: 'Karo (Puspita)',
    namaJawa: 'Mangsa Karo (23 hari)',
    rentangTanggal: '3 Agustus – 25 Agustus',
    candra: 'Bantala rengka',
    artiCandra: 'Bumi retak-retak merekah',
    musim: 'Kemarau (Mareng)',
    tandaAlam: 'Tanah sawah mengering dan retak, pohon kapuk randu mulai berbunga, sumur mulai menyusut.',
    kearifanTani: 'Waktu yang tepat menanam palawija tahan kering seperti kedelai, kacang tanah, dan jagung.'
  },
  {
    no: 3,
    nama: 'Katelu (Manggasri)',
    namaJawa: 'Mangsa Katelu (24 hari)',
    rentangTanggal: '26 Agustus – 18 September',
    candra: 'Suta manut ing bapa',
    artiCandra: 'Anak menurut kepada bapaknya (sulur tanaman merambat mencari sandaran)',
    musim: 'Kemarau (Mareng)',
    tandaAlam: 'Pohon randu berbuah kapuk, tanaman menjalar merambat subur, udara siang terik.',
    kearifanTani: 'Memanen palawija tahap pertama dan mempersiapkan bibit tanaman ubi-ubian.'
  },
  {
    no: 4,
    nama: 'Kapat (Siti)',
    namaJawa: 'Mangsa Kapat (25 hari)',
    rentangTanggal: '19 September – 13 Oktober',
    candra: 'Waspa kumembeng jroning kalbu',
    artiCandra: 'Air mata tertahan dalam hati (sumber air mengering sampai ke dasar)',
    musim: 'Pancaroba',
    tandaAlam: 'Puncak kemarau, sumber mata air kritis, pohon kapuk merekah mengeluarkan kapuk putih.',
    kearifanTani: 'Membersihkan saluran air, merawat pematang sawah, dan memohon berkah hujan.'
  },
  {
    no: 5,
    nama: 'Kalima (Manggala)',
    namaJawa: 'Mangsa Kalima (27 hari)',
    rentangTanggal: '14 Oktober – 9 November',
    candra: 'Pancuran mas sumawur ing jagad',
    artiCandra: 'Pancuran emas bertabur di alam raya (hujan rintik mulai menyapa bumi)',
    musim: 'Pancaroba',
    tandaAlam: 'Awan mendung mulai berkumpul, petir sesekali menyambar, pohon asam mulai berdaun muda.',
    kearifanTani: 'Mulai mengolah tanah sawah, menabur benih persemaian padi gogo.'
  },
  {
    no: 6,
    nama: 'Kanem (Naya)',
    namaJawa: 'Mangsa Kanem (43 hari)',
    rentangTanggal: '10 November – 22 Desember',
    candra: 'Rasa mulya kasuciyan',
    artiCandra: 'Rasa mulia dalam kesucian (alam disegarkan oleh curah hujan yang lebat)',
    musim: 'Hujan (Labuh/Rendheng)',
    tandaAlam: 'Curah hujan deras dan merata, air sungai melimpah, katak mulai bernyanyi bersahutan.',
    kearifanTani: 'Musim membajak sawah serentak, menanam bibit padi utama (tandur).'
  },
  {
    no: 7,
    nama: 'Kapitu (Palguna)',
    namaJawa: 'Mangsa Kapitu (43 hari)',
    rentangTanggal: '23 Desember – 3 Februari',
    candra: 'Wisa kentas ing maruta',
    artiCandra: 'Bisa racun hilang tertiup angin kencang (puncak badai dan angin barat)',
    musim: 'Hujan (Labuh/Rendheng)',
    tandaAlam: 'Hujan lebat disertai angin kencang, sungai banjir, serangga dan ulat berkembang biak.',
    kearifanTani: 'Menyiang rumput liar di sawah, menjaga ketinggian air agar tanaman padi tidak tenggelam.'
  },
  {
    no: 8,
    nama: 'Kawolu (Wisaka)',
    namaJawa: 'Mangsa Kawolu (26/27 hari)',
    rentangTanggal: '4 Februari – 28/29 Februari',
    candra: 'Anjrah jroning kayun',
    artiCandra: 'Kegembiraan merebak dalam hati (padi tumbuh subur menghijau)',
    musim: 'Hujan (Labuh/Rendheng)',
    tandaAlam: 'Curah hujan mulai stabil, tanaman padi mulai bunting muda, kucing dan hewan peliharaan kawin.',
    kearifanTani: 'Memupuk tanaman padi susulan dan mewaspadai hama wereng.'
  },
  {
    no: 9,
    nama: 'Kasanga (Jita)',
    namaJawa: 'Mangsa Kasanga (25 hari)',
    rentangTanggal: '1 Maret – 25 Maret',
    candra: 'Wedharing wacana mulya',
    artiCandra: 'Keluarnya sabda mulia (tonggeret/garengpung mulai berbunyi, padi mulai berbulir)',
    musim: 'Pancaroba',
    tandaAlam: 'Bunga randu mulai berjatuhan, garengpung berbunyi nyaring di sore hari, padi menunduk.',
    kearifanTani: 'Menjaga padi dari serangan burung pipit dengan memasang orang-orangan sawah.'
  },
  {
    no: 10,
    nama: 'Kasapuluh (Srawana)',
    namaJawa: 'Mangsa Kasapuluh (24 hari)',
    rentangTanggal: '26 Maret – 18 April',
    candra: 'Gedhong mineb jroning kalbu',
    artiCandra: 'Pintu lumbung tertutup dalam hati (padi telah dipanen dan disimpan di lumbung)',
    musim: 'Pancaroba',
    tandaAlam: 'Hujan tinggal sedikit, udara mulai terasa sejuk di pagi hari, burung-burung kenyang makan biji padi.',
    kearifanTani: 'Musim panen raya padi sawah dan syukuran wiwitan panen.'
  },
  {
    no: 11,
    nama: 'Desta (Padrawana)',
    namaJawa: 'Mangsa Desta (23 hari)',
    rentangTanggal: '19 April – 11 Mei',
    candra: 'Sotya sinara wedi',
    artiCandra: 'Intan terpelihara di sarang (burung menyuapi anak-anaknya di sarang yang aman)',
    musim: 'Kemarau (Mareng)',
    tandaAlam: 'Hujan hampir berhenti total, angin tenggara mulai berhembus, dedaunan mulai menguning.',
    kearifanTani: 'Menanam palawija cepat panen atau membiarkan sawah istirahat (bero).'
  },
  {
    no: 12,
    nama: 'Sadha (Asuji)',
    namaJawa: 'Mangsa Sadha (41 hari)',
    rentangTanggal: '12 Mei – 22 Juni',
    candra: 'Tirta sah saking sasana',
    artiCandra: 'Air pergi dari kediamannya (udara sangat dingin, embun upas/bediding mulai muncul)',
    musim: 'Kemarau (Mareng)',
    tandaAlam: 'Hawa malam hingga subuh dingin menggigil (bediding), udara kering, embun membeku di dataran tinggi.',
    kearifanTani: 'Petani menjemur palawija, memperbaiki alat bajak, dan bersiap menyambut mangsa Kasa.'
  }
];

export function getPranataMangsaCurrent(date: Date): PranataMangsaInfo {
  const m = date.getMonth() + 1; // 1..12
  const d = date.getDate();

  // Cari mangsa berdasarkan tanggal
  let activeIdx = 0;
  if ((m === 6 && d >= 23) || (m === 7) || (m === 8 && d <= 2)) activeIdx = 0;
  else if ((m === 8 && d >= 3 && d <= 25)) activeIdx = 1;
  else if ((m === 8 && d >= 26) || (m === 9 && d <= 18)) activeIdx = 2;
  else if ((m === 9 && d >= 19) || (m === 10 && d <= 13)) activeIdx = 3;
  else if ((m === 10 && d >= 14) || (m === 11 && d <= 9)) activeIdx = 4;
  else if ((m === 11 && d >= 10) || (m === 12 && d <= 22)) activeIdx = 5;
  else if ((m === 12 && d >= 23) || (m === 1) || (m === 2 && d <= 3)) activeIdx = 6;
  else if ((m === 2 && d >= 4 && d <= 29)) activeIdx = 7;
  else if ((m === 3 && d >= 1 && d <= 25)) activeIdx = 8;
  else if ((m === 3 && d >= 26) || (m === 4 && d <= 18)) activeIdx = 9;
  else if ((m === 4 && d >= 19) || (m === 5 && d <= 11)) activeIdx = 10;
  else activeIdx = 11; // 12 Mei - 22 Juni

  const mangsa = LIST_PRANATA_MANGSA[activeIdx];
  return {
    ...mangsa,
    isActiveNow: true
  };
}
