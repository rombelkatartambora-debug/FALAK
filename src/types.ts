export type TingkatOrganisasi = 'Kecamatan' | 'Kelurahan' | 'Unit RW';

export type KelurahanName =
  | 'TAMBORA'
  | 'KALI ANYAR'
  | 'DURI UTARA'
  | 'TANAH SEREAL'
  | 'KRENDANG'
  | 'JEMBATAN BESI'
  | 'ANGKE'
  | 'JEMBATAN LIMA'
  | 'PEKOJAN'
  | 'ROA MALAKA'
  | 'DURI SELATAN';

export type JenisKelamin = 'Laki-laki' | 'Perempuan';
export type JabatanKSB = 'Ketua' | 'Sekretaris' | 'Bendahara' | 'Wakil Ketua' | 'Wakil Sekretaris' | 'Wakil Bendahara' | 'Koordinator Bidang' | 'Anggota';

export interface BiodataPengurus {
  id: string;
  namaLengkap: string;
  nik: string; // 16 digit
  jenisKelamin: JenisKelamin;
  tempatLahir: string;
  tanggalLahir: string;
  jabatan: JabatanKSB;
  noWhatsapp: string;
  fotoUrl?: string;
  fotoKtpUrl?: string; // Upload KTP masing-masing pengurus KSB
  pekerjaan?: string;
  alamat?: string;
}

export interface UnitRWProfile {
  id: string;
  kelurahan: KelurahanName;
  nomorRw: string; // e.g. "001", "002"
  alamatSekretariat: string;
  namaKetua: string;
  nomorSk: string;
  tanggalSk: string;
  periodeMulai: string;
  periodeSelesai: string;
  nomorRekeningBank: string; // Bank DKI / Jakarta
  statusAktif?: 'Aktif' | 'Belum Aktif';
  dokumenSkUrl?: string;
  dokumenNpwpUrl?: string;

  // Media Sosial & Kontak Digital Sekretariat RW
  email?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  maps?: string; // Link Google Maps lokasi sekretariat

  pengurus: {
    ketua?: BiodataPengurus;
    sekretaris?: BiodataPengurus;
    bendahara?: BiodataPengurus;
    lainnya?: BiodataPengurus[];
  };
}

export type StatusVerifikasi = 'Pending' | 'Diterima' | 'Ditolak';

export interface PendaftaranAnggota {
  id: string;
  namaLengkap: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: JenisKelamin;
  alamat: string;
  kelurahan: KelurahanName;
  rw: string;
  rt: string;
  noHp: string;
  email: string;
  pekerjaan: string;
  minatBidang: string;
  fotoKtp?: string; // Data URL
  pasFoto?: string; // Data URL
  status: StatusVerifikasi;
  catatanAdmin?: string;
  waktuDaftar: string;
}

export type JenisSuratKatar =
  | 'Surat Undangan Rapat'
  | 'Surat Mandat (Tugas)'
  | 'Surat Keputusan (SK) Pengesahan UKKT'
  | 'Surat Permohonan Dana & Sarpras'
  | 'Surat Keterangan Aktif Organisasi'
  | 'Surat Pengantar Organisasi';

export interface SuratRecord {
  id: string;
  nomorSurat: string;
  jenisSurat: JenisSuratKatar;
  tanggalSurat: string;
  tingkat: TingkatOrganisasi;
  kelurahan?: string;
  nomorRw?: string;
  penerima: string;
  perihal: string;
  lampiran?: string;
  isiSurat: string;
  tempatKegiatan?: string;
  waktuKegiatan?: string;
  tanggalKegiatan?: string;
  namaPetugasMandat?: string;
  nikPetugasMandat?: string;
  jabatanPetugasMandat?: string;
  status: 'Tercatat' | 'Terkirim' | 'Arsip';
  waktuDibuat: string;
}

export interface PengeluaranLpjItem {
  id: string;
  no: number;
  bidang: string;
  uraian: string;
  jumlah: number;
  tanggal: string;
  fotoUrl?: string;
  adaNota: boolean;
  status: string;
}

export interface LpjStimulanRecord {
  id: string;
  tingkat: TingkatOrganisasi;
  kelurahan: string;
  nomorRw: string;
  bulan: string;
  tahun: number;
  tanggalLaporan: string;
  saldoBulanLalu: number;
  penerimaanDana: number;
  pengeluaran: PengeluaranLpjItem[];
  namaKetua: string;
  nikKetua: string;
  namaBendahara: string;
  nikBendahara: string;
  status: 'Draft' | 'Final' | 'Diverifikasi';
  catatan?: string;
  waktuDibuat: string;
}

export interface DataOrganisasi {
  namaOrganisasi: string;
  wilayah: string;
  kota: string;
  alamat: string;
  email: string;
  telepon: string;
  website: string;
  namaCamat: string;
  nipCamat: string;
  namaKetuaKecamatan: string;
  nikKetuaKecamatan: string;
  namaSekretarisKecamatan: string;
  nikSekretarisKecamatan: string;
  namaBendaharaKecamatan: string;
  nikBendaharaKecamatan: string;
  kasudinSosial: string;
  nipKasudinSosial: string;
  bendaharaSudin: string;
  nipBendaharaSudin: string;

  // Konfigurasi Khusus Kop Surat & Logo
  logoKiriUrl?: string; // Logo Karang Taruna (Nasional / Custom Upload)
  logoKananUrl?: string; // Logo DKI Jakarta / Jaya Raya / Custom Upload
  tampilkanLogoKanan?: boolean; // True jika menampilkan 2 logo (kiri-kanan), false jika 1 logo
  judulKopBaris1?: string; // Default: 'PENGURUS KARANG TARUNA'
  judulKopBaris2?: string; // Default custom / otomatis sesuai unit
  judulKopBaris3?: string; // Default: 'KELURAHAN ... KECAMATAN TAMBORA'
  judulKopBaris4?: string; // Default: 'KOTA ADMINISTRASI JAKARTA BARAT'
  alamatKopSekretariat?: string; // Alamat lengkap untuk Kop Surat
  kontakKop?: string; // Telepon, WA, Email untuk Kop Surat
  warnaJudulKop?: 'hitam' | 'merah' | 'biru'; // Warna baris unit (default: 'hitam')
  ukuranLogoKop?: 'kecil' | 'sedang' | 'besar'; // Ukuran logo kop (default: 'sedang')
}

export interface KegiatanRecord {
  id: string;
  judulKegiatan: string;
  bidang: string; // 9 bidang resmi karang taruna
  tingkat: TingkatOrganisasi;
  kelurahan: KelurahanName;
  nomorRw?: string; // Unit RW jika tingkat === 'Unit RW'
  tanggalPelaksanaan: string; // YYYY-MM-DD
  waktuMulai?: string; // e.g. "08:30 WIB"
  waktuSelesai?: string; // e.g. "12:00 WIB"
  lokasiKegiatan: string;
  deskripsi: string;
  penyelenggara: string;
  anggaranBiaya?: number;
  jumlahPartisipan?: number;
  fotoDokumentasi?: string[]; // data URLs
  status: 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai';
  waktuDibuat: string;
}

export type StatusCairDana = 'Sudah Cair' | 'Dalam Proses' | 'Belum Cair';

export interface PenyaluranDanaRecord {
  id: string;
  tingkat: TingkatOrganisasi;
  kelurahan: KelurahanName | string;
  nomorRw: string;
  tahun: number;
  tahap: string;
  nominal: number;
  statusCair: StatusCairDana;
  tanggalCair?: string;
  namaPenerima: string;
  nikPenerima?: string;
  jabatanPenerima: string;
  nomorRekeningBank?: string;
  nomorBuktiTransfer?: string;
  statusLpj: 'Sudah LPJ' | 'Belum LPJ';
  catatan?: string;
  updatedAt: string;
}

export type PortalRole = 'public' | 'rw' | 'kelurahan' | 'kecamatan';

export interface UserSession {
  role: PortalRole;
  namaUser: string;
  kelurahan?: KelurahanName;
  nomorRw?: string;
  isLoggedIn: boolean;
}

export type ActiveTab =
  | 'dashboard'
  | 'rekap-data'
  | 'unit-rw'
  | 'kegiatan'
  | 'rekap-kegiatan'
  | 'portal-publik'
  | 'portal-kelurahan'
  | 'portal-rw'
  | 'buat-surat'
  | 'arsip-surat'
  | 'hasil-lpj'
  | 'tanda-terima'
  | 'pendaftaran-online'
  | 'verifikasi-berkas'
  | 'kartu-kta'
  | 'pengaturan';

