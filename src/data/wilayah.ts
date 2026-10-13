import { KelurahanName } from '../types';

export const DAFTAR_KELURAHAN_TAMBORA: KelurahanName[] = [
  'TAMBORA',
  'KALI ANYAR',
  'DURI UTARA',
  'TANAH SEREAL',
  'KRENDANG',
  'JEMBATAN BESI',
  'ANGKE',
  'JEMBATAN LIMA',
  'PEKOJAN',
  'ROA MALAKA',
  'DURI SELATAN',
];

/**
 * Pemetaan lengkap seluruh UKKT RW di 11 Kelurahan Kecamatan Tambora
 * Total 96 Unit Kerja RW
 */
export const MAP_WILAYAH_TAMBORA: Record<KelurahanName, string[]> = {
  TAMBORA: ['001', '002', '003', '004', '005', '006', '007'], // 7 RW
  'KALI ANYAR': ['001', '002', '003', '004', '005', '006', '007', '008', '009'], // 9 RW
  'DURI UTARA': ['001', '002', '003', '004', '005', '006', '007', '008'], // 8 RW
  'TANAH SEREAL': [
    '001', '002', '003', '004', '005', '006', '007', '008', '009', '010',
    '011', '012', '013', '014', '015',
  ], // 15 RW
  KRENDANG: ['001', '002', '003', '004', '005', '006', '007'], // 7 RW
  'JEMBATAN BESI': ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010'], // 10 RW
  ANGKE: ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010', '011'], // 11 RW
  'JEMBATAN LIMA': ['001', '002', '003', '004', '005', '006', '007', '008'], // 8 RW
  PEKOJAN: ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010', '011', '012'], // 12 RW
  'ROA MALAKA': ['001', '002', '003'], // 3 RW
  'DURI SELATAN': ['001', '002', '003', '004', '005', '006'], // 6 RW
};

export const INFO_KELURAHAN: Record<KelurahanName, { alamat: string; kodePos: string; namaLurah: string }> = {
  TAMBORA: {
    alamat: 'Jl. Tambora IV No. 1, Tambora, Kec. Tambora',
    kodePos: '11220',
    namaLurah: 'Drs. Subhan, M.Si',
  },
  'KALI ANYAR': {
    alamat: 'Jl. Kalianyar V No. 12, Kalianyar, Kec. Tambora',
    kodePos: '11310',
    namaLurah: 'Muhammad Ridwan, S.STP',
  },
  'DURI UTARA': {
    alamat: 'Jl. Duri Utara I No. 4, Duri Utara, Kec. Tambora',
    kodePos: '11270',
    namaLurah: 'Bambang Sugiharto, S.Sos',
  },
  'TANAH SEREAL': {
    alamat: 'Jl. KH. M. Mansyur No. 102, Tanah Sereal, Kec. Tambora',
    kodePos: '11210',
    namaLurah: 'Dra. Hj. Suharti, M.Si',
  },
  KRENDANG: {
    alamat: 'Jl. Krendang Raya No. 15, Krendang, Kec. Tambora',
    kodePos: '11260',
    namaLurah: 'H. Achmad Fauzi, S.E.',
  },
  'JEMBATAN BESI': {
    alamat: 'Jl. Jembatan Besi II No. 8, Jembatan Besi, Kec. Tambora',
    kodePos: '11320',
    namaLurah: 'Zainuddin, S.IP',
  },
  ANGKE: {
    alamat: 'Jl. Tubagus Angke No. 1, Angke, Kec. Tambora',
    kodePos: '11330',
    namaLurah: 'Teddy Martadilla, S.STP',
  },
  'JEMBATAN LIMA': {
    alamat: 'Jl. KH. Mansyur No. 45, Jembatan Lima, Kec. Tambora',
    kodePos: '11250',
    namaLurah: 'Samsul Bahri, S.Sos',
  },
  PEKOJAN: {
    alamat: 'Jl. Pengukir Raya No. 10, Pekojan, Kec. Tambora',
    kodePos: '11240',
    namaLurah: 'Saiful Islam, S.Kom, M.M.',
  },
  'ROA MALAKA': {
    alamat: 'Jl. Roa Malaka Selatan No. 2, Roa Malaka, Kec. Tambora',
    kodePos: '11230',
    namaLurah: 'Hendri Prasetyo, S.STP',
  },
  'DURI SELATAN': {
    alamat: 'Jl. Duri Selatan VIII No. 20, Duri Selatan, Kec. Tambora',
    kodePos: '11280',
    namaLurah: 'Rizal Kurniawan, S.IP',
  },
};

export const BIDANG_KEGIATAN_KATAR = [
  'i. Kesekretariatan & Organisasi',
  'ii. Pendidikan & Pelatihan Pemuda',
  'iii. Usaha Kesejahteraan Sosial (UKS)',
  'iv. Kerohanian & Pembinaan Mental',
  'v. Kelompok Usaha Bersama (KUBE) & Ekonomi Kreatif',
  'vi. Lingkungan Hidup & Kebersihan Wilayah',
  'vii. Olahraga, Seni & Budaya',
  'viii. Hubungan Masyarakat & Publikasi',
  'ix. Penanggulangan Bencana & Satgas',
];

export const MASTER_SUB_KEGIATAN_KATAR: Record<string, string[]> = {
  'i. Kesekretariatan & Organisasi': [
    'Penggandaan materi rapat formatur & ATK pembukuan kas bulanan',
    'Pengadaan buku agenda surat, stempel resmi UKKT RW, dan map arsip',
    'Rapat koordinasi pleno pengurus & konsolidasi unit rukun warga',
    'Penyusunan dan penggandaan Laporan Pertanggungjawaban (LPJ) Dana Stimulan',
    'Pembuatan papan nama sekretariat Karang Taruna RW',
  ],
  'ii. Pendidikan & Pelatihan Pemuda': [
    'Bimbingan belajar gratis bagi anak usia sekolah wilayah RW',
    'Pelatihan dasar kepemimpinan pemuda (LDKP) tingkat rukun warga',
    'Workshop literasi digital, desain grafis, dan pemanfaatan AI untuk pemuda',
    'Sosialisasi edukasi bahaya penyalahgunaan narkoba & judi online',
    'Penyuluhan beasiswa pendidikan dan pelatihan vokasi kerja',
  ],
  'iii. Usaha Kesejahteraan Sosial (UKS)': [
    'Pemberian santunan anak yatim piatu dan dhuafa di lingkungan RW',
    'Penyaluran paket sembako bagi lansia dan keluarga prasejahtera',
    'Pendampingan sosial warga disabilitas dan keluarga rentan',
    'Bantuan tanggap darurat dan posko logistik kebencanaan wilayah',
    'Aksi donor darah pemuda bekerjasama dengan PMI Jakarta Barat',
  ],
  'iv. Kerohanian & Pembinaan Mental': [
    'Konsumsi kegiatan Tahsin Al-Qur\'an & Santunan Ramadhan / Yatim RW',
    'Peringatan Hari Besar Islam (PHBI: Isra Mi\'raj, Maulid Nabi, Tahun Baru Hijriah)',
    'Kajian keagamaan rutin pemuda dan dialog kerukunan pemuda lintas agama',
    'Pembinaan akhlak generasi muda dan pencegahan tawuran remaja',
  ],
  'v. Kelompok Usaha Bersama (KUBE) & Ekonomi Kreatif': [
    'Pelatihan barista kopi dan pembuatan kudapan wirausaha pemuda RW',
    'Bazar UMKM pemuda dan promosi produk kreatif lokal RW',
    'Pengadaan bibit tanaman hidroponik dan budidaya lele bernilai ekonomi',
    'Pelatihan sablon kaos dan merchandise komunitas Karang Taruna',
  ],
  'vi. Lingkungan Hidup & Kebersihan Wilayah': [
    'Kerja bakti pembersihan saluran air (got) dan kantong sampah pilah',
    'Pengadaan tempat sampah pilah organik dan anorganik di pos RW',
    'Gerakan penghijauan kampung (penanaman bibit pohon pelindung & tanaman toga)',
    'Program bank sampah pemuda dan sosialisasi daur ulang sampah rumah tangga',
  ],
  'vii. Olahraga, Seni & Budaya': [
    'Penyelenggaraan turnamen bulutangkis / tenis meja / catur antar pemuda RW',
    'Pengadaan bola futsal, bola voli, raket, dan net olahraga pemuda',
    'Latihan seni tradisional Betawi (Palang Pintu, Hadroh, Tari Kreasi)',
    'Pentas seni kreativitas pemuda memperingati HUT Kemerdekaan RI',
  ],
  'viii. Hubungan Masyarakat & Publikasi': [
    'Pembuatan spanduk edukasi kamtibmas pemuda dan mading informasi warga',
    'Pengelolaan media sosial resmi dan dokumentasi kegiatan Karang Taruna RW',
    'Konsolidasi bersama Tiga Pilar (Babinsa, Bhabinkamtibmas, dan Ketua RW)',
    'Publikasi laporan kegiatan pemuda di portal karangtaruna.jakarta.go.id',
  ],
  'ix. Penanggulangan Bencana & Satgas': [
    'Piket posko siaga banjir dan mitigasi genangan air musim hujan',
    'Simulasi evakuasi tanggap darurat kebakaran pemukiman padat Tambora',
    'Penyediaan alat pemadam api ringan (APAR) dan kotak P3K darurat pemuda',
    'Aksi gotong royong pemulihan pasca kebakaran/bencana di pemukiman',
  ],
};

export function getUraianOptionsForBidang(bidang: string): string[] {
  return MASTER_SUB_KEGIATAN_KATAR[bidang] || [
    'Kegiatan kemasyarakatan dan kepemudaan Karang Taruna RW',
  ];
}

export const TOTAL_UNIT_RW = Object.values(MAP_WILAYAH_TAMBORA).reduce(
  (acc, curr) => acc + curr.length,
  0
); // 96
