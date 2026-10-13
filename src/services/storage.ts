import {
  DataOrganisasi,
  UnitRWProfile,
  SuratRecord,
  LpjStimulanRecord,
  PendaftaranAnggota,
  KelurahanName,
  BiodataPengurus,
  KegiatanRecord,
  UserSession,
  PenyaluranDanaRecord,
  StatusCairDana,
} from '../types';
import {
  INITIAL_ORGANISASI,
  INITIAL_UKKT_LIST,
  INITIAL_SURAT_LIST,
  INITIAL_LPJ_LIST,
  INITIAL_PENDAFTARAN_LIST,
  INITIAL_KEGIATAN_LIST,
} from '../data/initialData';
import { MAP_WILAYAH_TAMBORA, DAFTAR_KELURAHAN_TAMBORA } from '../data/wilayah';

const KEYS = {
  ORGANISASI: 'kata_tambora_org_v2',
  UKKT: 'kata_tambora_ukkt_v2',
  SURAT: 'kata_tambora_surat_v2',
  LPJ: 'kata_tambora_lpj_v2',
  PENDAFTARAN: 'kata_tambora_reg_v2',
  KEGIATAN: 'kata_tambora_kegiatan_v1',
  USER_SESSION: 'kata_tambora_session_v1',
  PENYALURAN_DANA: 'kata_tambora_penyaluran_dana_v1',
};

export function getOrganisasi(): DataOrganisasi {
  try {
    const raw = localStorage.getItem(KEYS.ORGANISASI);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_ORGANISASI;
}

export function saveOrganisasi(data: DataOrganisasi): void {
  try {
    localStorage.setItem(KEYS.ORGANISASI, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

export function getUKKTList(): UnitRWProfile[] {
  try {
    const raw = localStorage.getItem(KEYS.UKKT);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_UKKT_LIST;
}

export function saveUKKTList(list: UnitRWProfile[]): void {
  try {
    localStorage.setItem(KEYS.UKKT, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export function getOrCreateUKKT(kelurahan: KelurahanName, nomorRw: string): UnitRWProfile {
  const list = getUKKTList();
  const existing = list.find((u) => u.kelurahan === kelurahan && u.nomorRw === nomorRw);
  if (existing) return existing;

  const newUnit: UnitRWProfile = {
    id: `UKKT-${kelurahan.replace(/\s+/g, '-')}-${nomorRw}`,
    kelurahan,
    nomorRw,
    alamatSekretariat: `Sekretariat RW ${nomorRw}, Kelurahan ${kelurahan}, Kec. Tambora`,
    namaKetua: '',
    nomorSk: '',
    tanggalSk: '',
    periodeMulai: '2024-01-01',
    periodeSelesai: '2027-01-01',
    nomorRekeningBank: 'Bank DKI',
    pengurus: {},
  };
  list.push(newUnit);
  saveUKKTList(list);
  return newUnit;
}

export function updateUKKT(updated: UnitRWProfile): void {
  const list = getUKKTList();
  const index = list.findIndex(
    (u) => u.kelurahan === updated.kelurahan && u.nomorRw === updated.nomorRw
  );
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.push(updated);
  }
  saveUKKTList(list);
}

export function getSuratList(): SuratRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.SURAT);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_SURAT_LIST;
}

export function saveSuratList(list: SuratRecord[]): void {
  try {
    localStorage.setItem(KEYS.SURAT, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export function addSurat(surat: SuratRecord): void {
  const list = getSuratList();
  list.unshift(surat);
  saveSuratList(list);
}

export function getLpjList(): LpjStimulanRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.LPJ);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_LPJ_LIST;
}

export function saveLpjList(list: LpjStimulanRecord[]): void {
  try {
    localStorage.setItem(KEYS.LPJ, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export function addOrUpdateLpj(record: LpjStimulanRecord): void {
  const list = getLpjList();
  const index = list.findIndex((l) => l.id === record.id);
  if (index >= 0) {
    list[index] = record;
  } else {
    list.unshift(record);
  }
  saveLpjList(list);
}

export function getPendaftaranList(): PendaftaranAnggota[] {
  try {
    const raw = localStorage.getItem(KEYS.PENDAFTARAN);
    if (raw) {
      const parsed: PendaftaranAnggota[] = JSON.parse(raw);
      if (parsed.length >= INITIAL_PENDAFTARAN_LIST.length) {
        return parsed;
      }
      // Gabungkan pendaftaran yang sudah ada dengan initial list agar 11 kelurahan terisi lengkap
      const existingIds = new Set(parsed.map((p) => p.id));
      const merged = [...parsed];
      INITIAL_PENDAFTARAN_LIST.forEach((init) => {
        if (!existingIds.has(init.id)) {
          merged.push(init);
        }
      });
      localStorage.setItem(KEYS.PENDAFTARAN, JSON.stringify(merged));
      return merged;
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_PENDAFTARAN_LIST;
}

export function savePendaftaranList(list: PendaftaranAnggota[]): void {
  try {
    localStorage.setItem(KEYS.PENDAFTARAN, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export function submitPendaftaran(item: PendaftaranAnggota): void {
  const list = getPendaftaranList();
  list.unshift(item);
  savePendaftaranList(list);
}

export function setVerifikasiPendaftar(
  id: string,
  status: 'Diterima' | 'Ditolak',
  catatanAdmin?: string
): void {
  const pendaftaran = getPendaftaranList();
  const item = pendaftaran.find((p) => p.id === id);
  if (!item) return;

  item.status = status;
  if (catatanAdmin) item.catatanAdmin = catatanAdmin;
  savePendaftaranList(pendaftaran);

  // Jika diterima, sinkronkan ke pengurus UKKT yang bersangkutan
  if (status === 'Diterima') {
    const unit = getOrCreateUKKT(item.kelurahan, item.rw);
    if (!unit.pengurus.lainnya) unit.pengurus.lainnya = [];
    const newPengurus: BiodataPengurus = {
      id: `P-${item.id}`,
      namaLengkap: item.namaLengkap,
      nik: item.nik,
      jenisKelamin: item.jenisKelamin,
      tempatLahir: item.tempatLahir,
      tanggalLahir: item.tanggalLahir,
      jabatan: 'Anggota',
      noWhatsapp: item.noHp,
      fotoUrl: item.pasFoto,
      pekerjaan: item.pekerjaan,
      alamat: item.alamat,
    };
    unit.pengurus.lainnya.push(newPengurus);
    updateUKKT(unit);
  }
}

/**
 * Mencari data KSB untuk level tertentu
 */
export function getKSBForUnit(
  tingkat: 'Kecamatan' | 'Kelurahan' | 'Unit RW',
  kelurahan?: string,
  nomorRw?: string
) {
  const org = getOrganisasi();
  if (tingkat === 'Kecamatan') {
    return {
      namaKetua: org.namaKetuaKecamatan,
      nikKetua: org.nikKetuaKecamatan,
      namaSekretaris: org.namaSekretarisKecamatan,
      nikSekretaris: org.nikSekretarisKecamatan,
      namaBendahara: org.namaBendaharaKecamatan,
      nikBendahara: org.nikBendaharaKecamatan,
    };
  }

  if (tingkat === 'Unit RW' && kelurahan && nomorRw) {
    const unit = getOrCreateUKKT(kelurahan as KelurahanName, nomorRw);
    return {
      namaKetua: unit.pengurus.ketua?.namaLengkap || unit.namaKetua || '..........................',
      nikKetua: unit.pengurus.ketua?.nik || '..........................',
      namaSekretaris: unit.pengurus.sekretaris?.namaLengkap || '..........................',
      nikSekretaris: unit.pengurus.sekretaris?.nik || '..........................',
      namaBendahara: unit.pengurus.bendahara?.namaLengkap || '..........................',
      nikBendahara: unit.pengurus.bendahara?.nik || '..........................',
    };
  }

  // Fallback Kelurahan
  return {
    namaKetua: `Ketua Karang Taruna Kel. ${kelurahan || 'Kelurahan'}`,
    nikKetua: '..........................',
    namaSekretaris: `Sekretaris Karang Taruna Kel. ${kelurahan || 'Kelurahan'}`,
    nikSekretaris: '..........................',
    namaBendahara: `Bendahara Karang Taruna Kel. ${kelurahan || 'Kelurahan'}`,
    nikBendahara: '..........................',
  };
}

// ==========================================
// KEGIATAN STORAGE
// ==========================================
export function getKegiatanList(): KegiatanRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.KEGIATAN);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_KEGIATAN_LIST;
}

export function saveKegiatanList(list: KegiatanRecord[]): void {
  try {
    localStorage.setItem(KEYS.KEGIATAN, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export function addKegiatan(kegiatan: KegiatanRecord): void {
  const list = getKegiatanList();
  list.unshift(kegiatan);
  saveKegiatanList(list);
}

export function deleteKegiatan(id: string): void {
  const list = getKegiatanList().filter((k) => k.id !== id);
  saveKegiatanList(list);
}

// ==========================================
// USER SESSION & PORTAL ROLE STORAGE
// ==========================================
export const DEFAULT_SESSION: UserSession = {
  role: 'kecamatan', // Default awal: Admin Kecamatan
  namaUser: 'Pengurus Kecamatan Tambora',
  isLoggedIn: true,
};

export function getUserSession(): UserSession {
  try {
    const raw = localStorage.getItem(KEYS.USER_SESSION);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_SESSION;
}

export function saveUserSession(session: UserSession): void {
  try {
    localStorage.setItem(KEYS.USER_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error(e);
  }
}

// ==========================================
// PENYALURAN DANA STIMULAN STORAGE & TRACKING
// ==========================================

export function generateInitialPenyaluranDanaList(): PenyaluranDanaRecord[] {
  const result: PenyaluranDanaRecord[] = [];
  const ukktList = getUKKTList();
  const lpjList = getLpjList();

  // 1. Unit Kecamatan
  const org = getOrganisasi();
  result.push({
    id: 'PENYALURAN-KEC-TAMBORA-2026',
    tingkat: 'Kecamatan',
    kelurahan: 'TAMBORA',
    nomorRw: '-',
    tahun: 2026,
    tahap: 'Tahap II (Tahun Anggaran 2026)',
    nominal: 2000000,
    statusCair: 'Sudah Cair',
    tanggalCair: '05 Juli 2026',
    namaPenerima: org.namaBendaharaKecamatan,
    nikPenerima: org.nikBendaharaKecamatan,
    jabatanPenerima: 'Bendahara Kecamatan',
    nomorRekeningBank: '503-11-00234-9 (Bank DKI)',
    nomorBuktiTransfer: 'TRF/DKI/2026/07/001',
    statusLpj: 'Sudah LPJ',
    catatan: 'Dana Operasional & Pembinaan Wilayah Karang Taruna Kecamatan Tambora',
    updatedAt: new Date().toISOString(),
  });

  // 2. Unit 11 Kelurahan
  DAFTAR_KELURAHAN_TAMBORA.forEach((kel, kIdx) => {
    const isCair = kIdx <= 7;
    result.push({
      id: `PENYALURAN-KEL-${kel}-2026`,
      tingkat: 'Kelurahan',
      kelurahan: kel,
      nomorRw: '-',
      tahun: 2026,
      tahap: 'Tahap II (Tahun Anggaran 2026)',
      nominal: 1000000,
      statusCair: isCair ? 'Sudah Cair' : (kIdx === 8 ? 'Dalam Proses' : 'Belum Cair'),
      tanggalCair: isCair ? `0${(kIdx % 6) + 3} Juli 2026` : undefined,
      namaPenerima: `Bendahara KT Kel. ${kel}`,
      jabatanPenerima: 'Bendahara Kelurahan',
      nomorRekeningBank: `503-22-0${(kIdx + 1).toString().padStart(4, '0')}-1 (Bank DKI)`,
      nomorBuktiTransfer: isCair ? `TRF/DKI/2026/07/KEL-${(kIdx + 1).toString().padStart(3, '0')}` : undefined,
      statusLpj: isCair ? 'Sudah LPJ' : 'Belum LPJ',
      catatan: `Stimulasi Program Kepemudaan Kelurahan ${kel}`,
      updatedAt: new Date().toISOString(),
    });
  });

  // 3. Seluruh 96 Unit Kerja RW (UKKT)
  let rwIndex = 0;
  DAFTAR_KELURAHAN_TAMBORA.forEach((kel) => {
    const rws = MAP_WILAYAH_TAMBORA[kel] || [];
    rws.forEach((rw) => {
      rwIndex++;
      const unit = ukktList.find((u) => u.kelurahan === kel && u.nomorRw === rw);
      const penerimaNama =
        unit?.pengurus?.bendahara?.namaLengkap ||
        unit?.pengurus?.ketua?.namaLengkap ||
        unit?.namaKetua ||
        `Pengurus UKKT RW ${rw}`;
      const penerimaNik =
        unit?.pengurus?.bendahara?.nik || unit?.pengurus?.ketua?.nik || '';
      const noRekening = unit?.nomorRekeningBank || `503-33-0${rwIndex.toString().padStart(4, '0')}-5 (Bank DKI)`;

      // Cek apakah ada LPJ untuk unit ini
      const hasLpj = lpjList.some((l) => l.kelurahan === kel && l.nomorRw === rw);

      // Status pencairan:
      // - Jika ada LPJ, sudah pasti Sudah Cair
      // - Sebagian besar sudah cair (68 RW), sebagian dalam proses (14 RW), sisanya belum cair (14 RW)
      let statusCair: StatusCairDana = 'Belum Cair';
      let tglCair: string | undefined = undefined;
      let noBukti: string | undefined = undefined;

      if (hasLpj || rwIndex <= 68) {
        statusCair = 'Sudah Cair';
        const day = ((rwIndex * 3) % 20) + 1;
        tglCair = `${day.toString().padStart(2, '0')} Juli 2026`;
        noBukti = `TRF/DKI/2026/07/RW-${rwIndex.toString().padStart(3, '0')}`;
      } else if (rwIndex <= 82) {
        statusCair = 'Dalam Proses';
      }

      result.push({
        id: `PENYALURAN-${kel}-${rw}-2026`,
        tingkat: 'Unit RW',
        kelurahan: kel,
        nomorRw: rw,
        tahun: 2026,
        tahap: 'Tahap II (Tahun Anggaran 2026)',
        nominal: 500000,
        statusCair,
        tanggalCair: tglCair,
        namaPenerima: penerimaNama,
        nikPenerima: penerimaNik,
        jabatanPenerima: unit?.pengurus?.bendahara ? 'Bendahara UKKT' : 'Ketua UKKT',
        nomorRekeningBank: noRekening,
        nomorBuktiTransfer: noBukti,
        statusLpj: hasLpj ? 'Sudah LPJ' : (statusCair === 'Sudah Cair' ? 'Belum LPJ' : 'Belum LPJ'),
        catatan: `Stimulan Pembinaan UKKT RW ${rw} Kelurahan ${kel}`,
        updatedAt: new Date().toISOString(),
      });
    });
  });

  return result;
}

export function getPenyaluranDanaList(): PenyaluranDanaRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.PENYALURAN_DANA);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error(e);
  }
  const initial = generateInitialPenyaluranDanaList();
  savePenyaluranDanaList(initial);
  return initial;
}

export function savePenyaluranDanaList(list: PenyaluranDanaRecord[]): void {
  try {
    localStorage.setItem(KEYS.PENYALURAN_DANA, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export function updatePenyaluranDana(updated: PenyaluranDanaRecord): void {
  const list = getPenyaluranDanaList();
  const idx = list.findIndex((item) => item.id === updated.id);
  if (idx >= 0) {
    list[idx] = { ...updated, updatedAt: new Date().toISOString() };
  } else {
    list.push({ ...updated, updatedAt: new Date().toISOString() });
  }
  savePenyaluranDanaList(list);
}


