import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI lazily or with check
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-memory student database for initial lookup simulation
interface StudentRecord {
  idNumber: string; // PDKT (3 digit), NISN (10 digit), or NIK (16 digit)
  idType: 'PDKT' | 'NISN' | 'NIK';
  nopdkt?: string;
  TahunMasuk?: string;
  tahunMasuk?: string;
  nisn?: string;
  NISN?: string;
  namaLengkap: string;
  NamaLengkap?: string;
  jenisKelamin?: 'Laki-laki' | 'Perempuan';
  JenisKelamin?: 'L' | 'P';
  tempatLahir: string;
  TempatLahir?: string;
  tanggalLahir: string;
  TanggalLahir?: string;
  nik?: string;
  NIK?: string;
  anakKe?: number | string;
  'Anak ke'?: number | string;
  jumlahSaudara?: number | string;
  Saudara?: number | string;
  agama?: string;
  Agama?: string;
  golonganDarah?: string;
  'Golongan Darah'?: string;
  tinggiBadan?: number | string;
  'TinggiBadan(cm)'?: number | string;
  beratBadan?: number | string;
  'BeratBadan(kg)'?: number | string;
  prestasi?: string;
  Prestasi?: string;
  hobi?: string;
  Hobi?: string;
  catatanPenting?: string;
  'Catatan Penting'?: string;
  alamat: string;
  Alamat?: string;
  rt?: string;
  RT?: string;
  rw?: string;
  RW?: string;
  kelurahan?: string;
  Kelurahan?: string;
  kecamatan?: string;
  Kecamatan?: string;
  kota?: string;
  Kota?: string;
  provinsi?: string;
  Provinsi?: string;
  kodePos?: string;
  KodePos?: string;
  jenisTinggal?: string;
  JenisTinggal?: string;
  alatTransportasi?: string;
  AlatTransportasi?: string;
  noHpWa: string;
  NomorHP?: string;
  email?: string;
  'E-Mail'?: string;
  asalSekolah?: string;
  AsalSekolah?: string;
  pasFoto?: string;
  PasFoto?: string;
  nomorKartuKeluarga?: string;
  NomorKartuKeluarga?: string;
  statusAyah?: string;
  StatusAyah?: string;
  namaAyah?: string;
  NamaAyah?: string;
  pendidikanAyah?: string;
  PendidikanAyah?: string;
  pekerjaanAyah?: string;
  PekerjaanAyah?: string;
  penghasilanAyah?: string;
  PenghasilanAyah?: string;
  tlpAyah?: string;
  TlpAyah?: string;
  statusIbu?: string;
  StatusIbu?: string;
  namaIbu?: string;
  NamaIbu?: string;
  pendidikanIbu?: string;
  PendidikanIbu?: string;
  pekerjaanIbu?: string;
  PekerjaanIbu?: string;
  penghasilanIbu?: string;
  PenghasilanIbu?: string;
  tlpIbu?: string;
  TlpIbu?: string;
  statusYatim?: string;
  StatusYatim?: string;
  namaWali?: string;
  NamaWali?: string;
  pekerjaanWali?: string;
  PekerjaanWali?: string;
  penghasilanWali?: string;
  PenghasilanWali?: string;
  hubungan?: string;
  Hubungan?: string;
  tlpWali?: string;
  'Tlp.Wali'?: string;
  status?: string;
  Status?: string;
  kelasSaatIni?: string;
  KelasSaatini?: string;
  kelasRombel?: string;
  namaOrangTua?: string;
  statusVerifikasi?: 'Terdaftar' | 'Perlu Pembaruan';
  [key: string]: any;
}

// Submitted confirmations store
interface FullSubmission {
  id: string;
  submittedAt: string;
  profile: {
    idNumber: string;
    idType: string;
    namaLengkap: string;
    kelasRombel: string;
    tempatLahir: string;
    tanggalLahir: string;
    alamat: string;
    noHpWa: string;
    namaOrangTua: string;
    email?: string;
  };
  work: {
    statusBekerja: 'Aktif' | 'Tidak Aktif';
    namaTempatKerja?: string;
    jenisPekerjaan?: string;
    alamatTempatKerja?: string;
    bidangUsaha?: string;
  };
  schedule: {
    hariBelajar: string[];
    jamBelajar: string;
    paketOpsi: string;
    persetujuan3xSeminggu: boolean;
  };
  statement: {
    hasMaterai: boolean;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    fileDataUrl?: string;
    confirmedAgreement: boolean;
    verificationCode: string;
  };
}

const submittedList: FullSubmission[] = [];

// Helper to parse CSV text into object records
function parseCSVToObjects(csvText: string): Record<string, string>[] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = '';

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentVal.trim());
      currentVal = '';
      if (row.length > 0 && row.some(cell => cell.length > 0)) {
        lines.push(row);
      }
      row = [];
    } else {
      currentVal += char;
    }
  }
  if (currentVal.length > 0 || row.length > 0) {
    row.push(currentVal.trim());
    if (row.some(cell => cell.length > 0)) {
      lines.push(row);
    }
  }

  if (lines.length < 2) return [];
  const headers = lines[0].map(h => h.replace(/^["']|["']$/g, '').trim());
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowData = lines[i];
    const record: Record<string, string> = {};
    headers.forEach((header, idx) => {
      record[header] = (rowData[idx] || '').replace(/^["']|["']$/g, '').trim();
    });
    records.push(record);
  }
  return records;
}

// In-memory cache for live Google Sheet data
const SPREADSHEET_ID = '1iqO_qA0J9tWhU1dLbSrUWyu3nK53pEJGfyKgseBOE7E';
let liveSheetStudents: StudentRecord[] = [];
let liveSheetIndexByPdkt = new Map<string, StudentRecord>();
let liveSheetIndexByNisn = new Map<string, StudentRecord>();
let liveSheetIndexByNik = new Map<string, StudentRecord>();
let liveSheetIndexByName = new Map<string, StudentRecord>();
let lastSheetSyncTime: Date | null = null;
let isSyncingSheet = false;

// Convert raw row from Google Sheet into standard StudentRecord
function mapRowToStudentRecord(row: Record<string, string>): StudentRecord {
  const nopdkt = row['nopdkt'] || '';
  const cleanPdkt = nopdkt.replace(/\D/g, '');
  const nisn = row['NISN'] || row['nisn'] || '';
  const nik = row['NIK'] || row['nik'] || '';
  const namaLengkap = row['NamaLengkap'] || row['namaLengkap'] || '';
  const rawGender = row['JenisKelamin'] || row['jenisKelamin'] || '';
  const cleanGenderCode = rawGender.trim().toUpperCase() === 'P' || rawGender.trim().toUpperCase() === 'PEREMPUAN' ? 'P' : (rawGender.trim().toUpperCase() === 'L' || rawGender.trim().toUpperCase() === 'LAKI-LAKI' ? 'L' : '');
  const jenisKelamin = cleanGenderCode === 'P' ? 'Perempuan' : (cleanGenderCode === 'L' ? 'Laki-laki' : rawGender);
  const parentName = row['NamaAyah'] || row['NamaIbu'] || row['NamaWali'] || '';

  return {
    ...row,
    idNumber: cleanPdkt ? cleanPdkt.padStart(3, '0') : (nisn || nik || nopdkt),
    idType: cleanPdkt.length <= 4 ? 'PDKT' : (nisn ? 'NISN' : 'NIK'),
    nopdkt: cleanPdkt ? cleanPdkt.padStart(3, '0') : nopdkt,
    TahunMasuk: row['TahunMasuk'] || '',
    tahunMasuk: row['TahunMasuk'] || '',
    nisn: nisn,
    NISN: nisn,
    nik: nik,
    NIK: nik,
    namaLengkap: namaLengkap,
    NamaLengkap: namaLengkap,
    jenisKelamin: jenisKelamin as any,
    JenisKelamin: (cleanGenderCode || rawGender) as any,
    tempatLahir: row['Tempat Lahir'] || row['TempatLahir'] || '',
    TempatLahir: row['Tempat Lahir'] || row['TempatLahir'] || '',
    tanggalLahir: row['TanggalLahir'] || '',
    TanggalLahir: row['TanggalLahir'] || '',
    anakKe: row['Anak ke'] || row['AnakKe'] || '',
    'Anak ke': row['Anak ke'] || row['AnakKe'] || '',
    jumlahSaudara: row['Saudara'] || row['JumlahSaudara'] || '',
    Saudara: row['Saudara'] || row['JumlahSaudara'] || '',
    agama: row['Agama'] || '',
    Agama: row['Agama'] || '',
    golonganDarah: row['Golongan Darah'] || row['GolonganDarah'] || '',
    'Golongan Darah': row['Golongan Darah'] || row['GolonganDarah'] || '',
    tinggiBadan: row['TinggiBadan(cm)'] || row['TinggiBadan'] || '',
    'TinggiBadan(cm)': row['TinggiBadan(cm)'] || row['TinggiBadan'] || '',
    beratBadan: row['BeratBadan(kg)'] || row['BeratBadan'] || '',
    'BeratBadan(kg)': row['BeratBadan(kg)'] || row['BeratBadan'] || '',
    prestasi: row['Prestasi'] || '',
    Prestasi: row['Prestasi'] || '',
    hobi: row['Hobi'] || '',
    Hobi: row['Hobi'] || '',
    catatanPenting: row['Catatan Penting'] || row['CatatanPenting'] || '',
    'Catatan Penting': row['Catatan Penting'] || row['CatatanPenting'] || '',
    alamat: row['Alamat'] || '',
    Alamat: row['Alamat'] || '',
    rt: row['RT'] || '',
    RT: row['RT'] || '',
    rw: row['RW'] || '',
    RW: row['RW'] || '',
    kelurahan: row['Kelurahan'] || '',
    Kelurahan: row['Kelurahan'] || '',
    kecamatan: row['Kecamatan'] || '',
    Kecamatan: row['Kecamatan'] || '',
    kota: row['Kota'] || '',
    Kota: row['Kota'] || '',
    provinsi: row['Provinsi'] || '',
    Provinsi: row['Provinsi'] || '',
    kodePos: row['KodePos'] || '',
    KodePos: row['KodePos'] || '',
    jenisTinggal: row['JenisTinggal'] || '',
    JenisTinggal: row['JenisTinggal'] || '',
    alatTransportasi: row['AlatTransportasi'] || '',
    AlatTransportasi: row['AlatTransportasi'] || '',
    noHpWa: row['NomorHP'] || row['NoHpWa'] || '',
    NomorHP: row['NomorHP'] || row['NoHpWa'] || '',
    email: row['E-Mail'] || row['Email'] || '',
    'E-Mail': row['E-Mail'] || row['Email'] || '',
    asalSekolah: row['AsalSekolah'] || '',
    AsalSekolah: row['AsalSekolah'] || '',
    pasFoto: row['PasFoto'] || '',
    PasFoto: row['PasFoto'] || '',
    nomorKartuKeluarga: row['NomorKartuKeluarga'] || '',
    NomorKartuKeluarga: row['NomorKartuKeluarga'] || '',
    statusAyah: row['StatusAyah'] || '',
    StatusAyah: row['StatusAyah'] || '',
    namaAyah: row['NamaAyah'] || '',
    NamaAyah: row['NamaAyah'] || '',
    nikAyah: row['NIKAyah'] || '',
    tempatLahirAyah: row['TempatLahirAyah'] || '',
    tanggalLahirAyah: row['TanggalLahirAyah'] || '',
    pendidikanAyah: row['PendidikanAyah'] || '',
    PendidikanAyah: row['PendidikanAyah'] || '',
    pekerjaanAyah: row['PekerjaanAyah'] || '',
    PekerjaanAyah: row['PekerjaanAyah'] || '',
    penghasilanAyah: row['PenghasilanAyah'] || '',
    PenghasilanAyah: row['PenghasilanAyah'] || '',
    tlpAyah: row['TlpAyah'] || '',
    TlpAyah: row['TlpAyah'] || '',
    statusIbu: row['StatusIbu'] || '',
    StatusIbu: row['StatusIbu'] || '',
    namaIbu: row['NamaIbu'] || '',
    NamaIbu: row['NamaIbu'] || '',
    nikIbu: row['NIKIbu'] || '',
    tempatLahirIbu: row['TempatLahirIbu'] || '',
    tanggalLahirIbu: row['TanggalLahirIbu'] || '',
    pendidikanIbu: row['PendidikanIbu'] || '',
    PendidikanIbu: row['PendidikanIbu'] || '',
    pekerjaanIbu: row['PekerjaanIbu'] || '',
    PekerjaanIbu: row['PekerjaanIbu'] || '',
    penghasilanIbu: row['PenghasilanIbu'] || '',
    PenghasilanIbu: row['PenghasilanIbu'] || '',
    tlpIbu: row['TlpIbu'] || '',
    TlpIbu: row['TlpIbu'] || '',
    statusYatim: row['StatusYatim'] || '',
    StatusYatim: row['StatusYatim'] || '',
    namaWali: row['NamaWali'] || '',
    NamaWali: row['NamaWali'] || '',
    pekerjaanWali: row['PekerjaanWali'] || '',
    PekerjaanWali: row['PekerjaanWali'] || '',
    penghasilanWali: row['PenghasilanWali'] || '',
    PenghasilanWali: row['PenghasilanWali'] || '',
    hubungan: row['Hubungan'] || '',
    Hubungan: row['Hubungan'] || '',
    tlpWali: row['Tlp.Wali'] || row['TlpWali'] || '',
    'Tlp.Wali': row['Tlp.Wali'] || row['TlpWali'] || '',
    status: row['Status'] || '',
    Status: row['Status'] || '',
    kelasSaatIni: row['KelasSaatini'] || '',
    KelasSaatini: row['KelasSaatini'] || '',
    kelasRombel: row['KelasSaatini'] || '',
    namaOrangTua: parentName,
    statusVerifikasi: 'Terdaftar',
  };
}

// Fetch all student records directly from Google Spreadsheet
async function syncStudentsFromGoogleSheet(): Promise<number> {
  if (isSyncingSheet) return liveSheetStudents.length;
  isSyncingSheet = true;
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv`;
    const res = await fetch(csvUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      console.warn(`Failed to fetch spreadsheet CSV: HTTP ${res.status}`);
      return liveSheetStudents.length;
    }
    const csvText = await res.text();
    const rows = parseCSVToObjects(csvText);

    if (rows.length > 0) {
      const parsedStudents: StudentRecord[] = [];
      const newPdktMap = new Map<string, StudentRecord>();
      const newNisnMap = new Map<string, StudentRecord>();
      const newNikMap = new Map<string, StudentRecord>();
      const newNameMap = new Map<string, StudentRecord>();

      rows.forEach(r => {
        const student = mapRowToStudentRecord(r);
        parsedStudents.push(student);

        // Indexing for quick lookups
        const pdktRaw = (student.nopdkt || '').trim();
        if (pdktRaw) {
          newPdktMap.set(pdktRaw, student);
          const pdktNum = pdktRaw.replace(/\D/g, '');
          if (pdktNum) {
            newPdktMap.set(pdktNum, student);
            newPdktMap.set(pdktNum.padStart(3, '0'), student);
          }
        }
        if (student.nisn) {
          const nisnClean = student.nisn.trim().replace(/\D/g, '');
          newNisnMap.set(student.nisn.trim(), student);
          if (nisnClean) newNisnMap.set(nisnClean, student);
        }
        if (student.nik) {
          const nikClean = student.nik.trim().replace(/\D/g, '');
          newNikMap.set(student.nik.trim(), student);
          if (nikClean) newNikMap.set(nikClean, student);
        }
        if (student.namaLengkap) {
          newNameMap.set(student.namaLengkap.toLowerCase().trim(), student);
        }
      });

      liveSheetStudents = parsedStudents;
      liveSheetIndexByPdkt = newPdktMap;
      liveSheetIndexByNisn = newNisnMap;
      liveSheetIndexByNik = newNikMap;
      liveSheetIndexByName = newNameMap;
      lastSheetSyncTime = new Date();
      console.log(`[GoogleSheetSync] Successfully loaded ${parsedStudents.length} real students from Google Sheet ${SPREADSHEET_ID}`);
      return parsedStudents.length;
    }
  } catch (err) {
    console.error('[GoogleSheetSync] Error fetching live spreadsheet:', err);
  } finally {
    isSyncingSheet = false;
  }
  return liveSheetStudents.length;
}

// Initial sync on startup
syncStudentsFromGoogleSheet();

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    spreadsheetId: SPREADSHEET_ID,
    totalStudentsLoaded: liveSheetStudents.length,
    lastSync: lastSheetSyncTime?.toISOString() || null
  });
});

// Endpoint to trigger manual sync with Google Sheet
app.post('/api/students/sync-sheet', async (req, res) => {
  try {
    const count = await syncStudentsFromGoogleSheet();
    res.json({
      success: true,
      count,
      spreadsheetId: SPREADSHEET_ID,
      message: `Berhasil menarik ${count} data siswa secara langsung dari Google Spreadsheet (${SPREADSHEET_ID}).`,
      lastSync: lastSheetSyncTime?.toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Gagal sinkronisasi Google Sheet' });
  }
});

// Endpoint to get all students from live sheet (for Admin or Data Master)
app.get('/api/students/all', async (req, res) => {
  if (liveSheetStudents.length === 0) {
    await syncStudentsFromGoogleSheet();
  }
  res.json({
    success: true,
    count: liveSheetStudents.length,
    source: `Google Spreadsheet ${SPREADSHEET_ID}`,
    lastSync: lastSheetSyncTime?.toISOString(),
    data: liveSheetStudents
  });
});

// Search endpoint for live filtering directly from the real 407 Google Sheet records
app.get('/api/students/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json({ success: true, results: [] });
  if (liveSheetStudents.length === 0) {
    await syncStudentsFromGoogleSheet();
  }
  const qLower = q.toLowerCase();
  const qDigits = q.replace(/\D/g, '');
  
  const matches = liveSheetStudents.filter(s => {
    const nameMatch = (s.NamaLengkap || s.namaLengkap || '').toLowerCase().includes(qLower);
    const pdktMatch = s.nopdkt && (s.nopdkt.includes(q) || (qDigits && s.nopdkt.includes(qDigits)));
    const nisnMatch = s.nisn && (s.nisn.includes(q) || (qDigits && s.nisn.includes(qDigits)));
    const nikMatch = s.nik && (s.nik.includes(q) || (qDigits && s.nik.includes(qDigits)));
    return nameMatch || pdktMatch || nisnMatch || nikMatch;
  }).slice(0, 15);

  res.json({
    success: true,
    count: matches.length,
    results: matches
  });
});

// 2. Student Lookup Endpoint (Tahap 1) - Queries Live Google Sheet Only!
app.post('/api/students/lookup', async (req, res) => {
  const { idNumber } = req.body;
  if (!idNumber || typeof idNumber !== 'string' || idNumber.trim().length < 1) {
    return res.status(400).json({
      success: false,
      message: 'Nomor identitas tidak valid. Mohon masukkan No. PDKT (001 s/d 407), NISN (10 digit), NIK (16 digit), atau Nama Lengkap.',
    });
  }

  // Ensure live sheet data is populated
  if (liveSheetStudents.length === 0) {
    await syncStudentsFromGoogleSheet();
  }

  const clean = idNumber.trim();
  const rawDigits = clean.replace(/\D/g, '');
  const lowerName = clean.toLowerCase();

  // Search Live Google Sheet indexes
  let foundFromSheet: StudentRecord | undefined;

  // 1. By exact or padded PDKT
  if (liveSheetIndexByPdkt.has(clean)) {
    foundFromSheet = liveSheetIndexByPdkt.get(clean);
  } else if (rawDigits && liveSheetIndexByPdkt.has(rawDigits)) {
    foundFromSheet = liveSheetIndexByPdkt.get(rawDigits);
  } else if (rawDigits && rawDigits.length <= 4 && liveSheetIndexByPdkt.has(rawDigits.padStart(3, '0'))) {
    foundFromSheet = liveSheetIndexByPdkt.get(rawDigits.padStart(3, '0'));
  }

  // 2. By NISN
  if (!foundFromSheet) {
    if (liveSheetIndexByNisn.has(clean)) {
      foundFromSheet = liveSheetIndexByNisn.get(clean);
    } else if (rawDigits && liveSheetIndexByNisn.has(rawDigits)) {
      foundFromSheet = liveSheetIndexByNisn.get(rawDigits);
    }
  }

  // 3. By NIK
  if (!foundFromSheet) {
    if (liveSheetIndexByNik.has(clean)) {
      foundFromSheet = liveSheetIndexByNik.get(clean);
    } else if (rawDigits && liveSheetIndexByNik.has(rawDigits)) {
      foundFromSheet = liveSheetIndexByNik.get(rawDigits);
    }
  }

  // 4. By Nama Lengkap partial/exact
  if (!foundFromSheet && lowerName.length >= 3) {
    if (liveSheetIndexByName.has(lowerName)) {
      foundFromSheet = liveSheetIndexByName.get(lowerName);
    } else {
      foundFromSheet = liveSheetStudents.find(s => 
        (s.namaLengkap && s.namaLengkap.toLowerCase().includes(lowerName)) ||
        (s.NamaLengkap && s.NamaLengkap.toLowerCase().includes(lowerName))
      );
    }
  }

  // If found in Google Sheets
  if (foundFromSheet) {
    return res.json({
      success: true,
      foundInMaster: true,
      source: `Google Spreadsheet Realtime (${SPREADSHEET_ID})`,
      data: foundFromSheet,
      message: `Data siswa atas nama ${foundFromSheet.namaLengkap || foundFromSheet.NamaLengkap} (No. PDKT: ${foundFromSheet.nopdkt || '-'}, NISN: ${foundFromSheet.nisn || '-'}) berhasil ditarik langsung dari Google Spreadsheet resmi.`,
    });
  }

  // If not found in Google Sheets, return error directly - NO MOCK / FAKE DATA
  return res.status(404).json({
    success: false,
    foundInMaster: false,
    message: `Data siswa untuk "${clean}" tidak ditemukan di Google Spreadsheet (ID: ${SPREADSHEET_ID}). Pastikan nomor PDKT (001 s/d 407), NISN (10 digit), atau NIK (16 digit) sudah sesuai data di spreadsheet.`,
  });
});

// 2.1 Update Student Profile (Tahap 2) - Updates in-memory & prepares sync to sheet 'SISWA' (1iqO_qA0J9tWhU1dLbSrUWyu3nK53pEJGfyKgseBOE7E)
app.post('/api/students/update-profile', async (req, res) => {
  try {
    const { profile, photoBase64, photoFileName } = req.body;
    if (!profile) {
      return res.status(400).json({ success: false, message: 'Data profil siswa wajib disertakan.' });
    }

    const pdkt = (profile.nopdkt || profile.idNumber || '').replace(/\D/g, '').padStart(3, '0');
    const nisn = profile.nisn || profile.NISN || '';
    const nik = profile.nik || profile.NIK || '';
    const namaSiswa = profile.namaLengkap || profile.NamaLengkap || 'Siswa';

    // Format proper Drive photo name: "[No. PDKT] [Nama Siswa].jpg"
    const targetDriveFolderName = '1nxSpZEe3ar1_icNZGsWzLLbz3U_oBFQO';
    const standardPhotoName = `${pdkt ? pdkt : 'PDKT'} ${namaSiswa.replace(/[/\\?%*:|"<>]/g, '')}.jpg`;

    // Map updated fields to StudentRecord
    const updatedRecord: StudentRecord = {
      ...profile,
      idNumber: pdkt || nisn || nik,
      idType: pdkt ? 'PDKT' : (nisn ? 'NISN' : 'NIK'),
      nopdkt: pdkt,
      namaLengkap: namaSiswa,
      NamaLengkap: namaSiswa,
      pasFoto: profile.pasFoto || profile.PasFoto || '',
      PasFoto: profile.PasFoto || profile.pasFoto || '',
      statusVerifikasi: 'Terdaftar',
    };

    // Update in-memory live collection
    let foundIndex = -1;
    if (pdkt) {
      foundIndex = liveSheetStudents.findIndex(s => s.nopdkt === pdkt || (s.nopdkt && s.nopdkt.replace(/\D/g, '') === pdkt.replace(/\D/g, '')));
    }
    if (foundIndex === -1 && nisn) {
      foundIndex = liveSheetStudents.findIndex(s => (s.nisn && s.nisn.trim() === nisn.trim()) || (s.NISN && s.NISN.trim() === nisn.trim()));
    }
    if (foundIndex === -1 && nik) {
      foundIndex = liveSheetStudents.findIndex(s => (s.nik && s.nik.trim() === nik.trim()) || (s.NIK && s.NIK.trim() === nik.trim()));
    }

    if (foundIndex >= 0) {
      liveSheetStudents[foundIndex] = { ...liveSheetStudents[foundIndex], ...updatedRecord };
    } else {
      liveSheetStudents.push(updatedRecord);
    }

    // Refresh index map
    if (pdkt) {
      liveSheetIndexByPdkt.set(pdkt, updatedRecord);
      liveSheetIndexByPdkt.set(pdkt.replace(/^0+/, ''), updatedRecord);
    }
    if (nisn) liveSheetIndexByNisn.set(nisn, updatedRecord);
    if (nik) liveSheetIndexByNik.set(nik, updatedRecord);
    if (namaSiswa) liveSheetIndexByName.set(namaSiswa.toLowerCase().trim(), updatedRecord);

    console.log(`[ProfileUpdate] Siswa ${namaSiswa} (PDKT: ${pdkt}) berhasil dimutakhirkan. Pas foto disiapkan untuk Google Drive folder: ${targetDriveFolderName} (${standardPhotoName})`);

    return res.json({
      success: true,
      message: `Data siswa ${namaSiswa} berhasil disimpan dan dimutakhirkan.`,
      spreadsheetId: SPREADSHEET_ID,
      sheetName: 'SISWA',
      driveFolderId: targetDriveFolderName,
      photoFileName: standardPhotoName,
      data: updatedRecord,
    });
  } catch (err: any) {
    console.error('Error updating student profile:', err);
    return res.status(500).json({ success: false, message: err.message || 'Gagal menyimpan pembaruan profil siswa.' });
  }
});

// 3. AI Assistant Chat Endpoint (Karang Taruna Administrative AI)
app.post('/api/assistant/chat', async (req, res) => {
  const { message, history, currentStep, studentData } = req.body;

  const currentStepName =
    currentStep === 1
      ? 'Tahap 1: Lihat Data Saya (Pencarian No. PDKT / NISN / NIK)'
      : currentStep === 2
      ? 'Tahap 2: Review Biodata Diri (52 Kolom Profil Warga Belajar)'
      : currentStep === 3
      ? 'Tahap 3: Jadwal Pekerjaan (Status & Tempat Kerja)'
      : currentStep === 4
      ? 'Tahap 4: Kesepakatan Jadwal (Pilihan Paket Wajib 3x Seminggu)'
      : 'Tahap 5: Final Pernyataan (Surat Kesanggupan Materai 10k & Rekapitulasi Akhir)';

  const systemInstruction = `Anda adalah "AI Asisten Administratif Rombel Karang Taruna" yang cerdas, ramah, sopan, profesional, terstruktur, dan tegas dalam menegakkan aturan belajar.

Karakter & Identitas:
- Salam khas: "Salam Karang Taruna! / Aditya Karya Mahatva Yodha"
- Gaya bicara: Bahasa Indonesia yang komunikatif, suportif kepada pemuda/warga belajar, namun tegas & tertib administrasi.
- Selalu memandu siswa langkah demi langkah sesuai urutan 5 tahap dan DILARANG mengizinkan siswa melompati tahapan sebelum tahap saat ini selesai.

Tahapan Kerja Wajib:
- Tahap 1 (Lihat Data Saya): Pencarian nomor pengenal (No. PDKT / NISN / NIK) untuk menarik data dari Google Spreadsheet.
- Tahap 2 (Review Biodata Diri): Review dan mutakhirkan 52 atribut data diri warga belajar secara teliti.
- Tahap 3 (Jadwal Pekerjaan): Pengisian status bekerja (Aktif / Tidak Aktif, tempat kerja, profesi, bidang usaha).
- Tahap 4 (Kesepakatan Jadwal): Pemilihan paket jadwal belajar dengan komitmen wajib hadir minimal 3 kali dalam seminggu.
- Tahap 5 (Final Pernyataan): Penandatanganan Surat Pernyataan Kesanggupan bermaterai Rp10.000, pengunggahan dokumen PDF/JPG, dan rekapitulasi data akhir.

Konteks Saat Ini:
- Posisi Siswa: ${currentStepName}
- Ringkasan Data Siswa: ${JSON.stringify(studentData || {})}

Instruksi Khusus Respon:
1. Jawab pertanyaan siswa dengan jelas, ringkas, dan memotivasi.
2. Jika siswa bertanya soal kendala kerja (misal: shift malam), jelaskan bahwa Karang Taruna menyediakan opsi jadwal fleksibel namun tetap wajib memenuhi 3 sesi seminggu demi kelulusan.
3. Jika bertanya tentang materai, jelaskan kewajiban materai Rp10.000 (bisa materai tempel fisik atau e-meterai resmi) untuk menjamin kekuatan komitmen belajar.
4. Akhiri jawaban dengan instruksi jelas tindakan apa yang harus diambil pada tahap ini.`;

  const client = getAIClient();

  if (client) {
    try {
      const chatPrompt = `User Message: "${message || 'Halo'}"\nLangkah Saat Ini: ${currentStepName}\nData Siswa: ${JSON.stringify(
        studentData || {}
      )}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: chatPrompt,
        config: {
          systemInstruction,
          temperature: 0.65,
        },
      });

      return res.json({
        reply: response.text || 'Salam Karang Taruna! Ada yang bisa kami bantu dalam proses konfirmasi data ini?',
        source: 'gemini',
      });
    } catch (err: any) {
      console.error('Gemini API Error, using fallback response:', err?.message);
    }
  }

  // Fallback dynamic intelligent responses
  const msgLower = (message || '').toLowerCase();
  let fallbackReply = '';

  if (msgLower.includes('sheet') || msgLower.includes('spreadsheet') || msgLower.includes('kolom') || msgLower.includes('tabel') || msgLower.includes('excel')) {
    fallbackReply = `Salam Karang Taruna! Untuk file Spreadsheet pangkalan data rombel, berikut rekomendasi 6 Sheet yang wajib ada:
1. 'SISWA' (Master Data Induk Siswa & Biodata)
2. 'KONFIRMASI_PERNYATAAN' (Hasil sinkronisasi data dari Web App & Status Materai)
3. 'JADWAL_DAN_KELAS' (Mapping kelompok belajar, tutor, dan ruang sesi 3x seminggu)
4. 'PRESENSI_3X_MINGGU' (Log kehadiran wajib 3x/minggu dan izin shift kerja)
5. 'MONITORING_DAN_SANKSI' (Evaluasi kepatuhan surat materai dan penegakan SP)
6. 'DASHBOARD_REKAP' (Statistik otomatis KPI Rombel)

Anda dapat membuka Panel 'Rekap Data Admin' di pojok kanan atas aplikasi untuk langsung menyalin header kolom dan rumus otomatisnya!`;
  } else if (msgLower.includes('halo') || msgLower.includes('salam') || msgLower.includes('hai')) {
    fallbackReply = `Salam Karang Taruna! Aditya Karya Mahatva Yodha. Selamat datang di Sistem Konfirmasi Data Rombongan Belajar Karang Taruna. Saya asisten administratif siap memandu Anda menyelesaikan proses pemutakhiran data 4 tahap secara tertib. Saat ini Anda berada di ${currentStepName}. Silakan ikuti instruksi pada layar ya!`;
  } else if (msgLower.includes('materai') || msgLower.includes('meterai') || msgLower.includes('10000')) {
    fallbackReply = `Terkait Surat Pernyataan di Tahap 4: Surat wajib dibubuhi materai Rp10.000 (bisa materai fisik lalu difoto/scan, atau e-meterai resmi) lalu ditandatangani. Hal ini menegaskan komitmen hukum dan kedisiplinan Anda dalam mengikuti program belajar 3x seminggu.`;
  } else if (msgLower.includes('kerja') || msgLower.includes('lembur') || msgLower.includes('shift')) {
    fallbackReply = `Kami sangat mengapresiasi semangat belajar rekan-rekan yang juga bekerja! Di Tahap 3, Anda dapat mengisikan detail status pekerjaan dan memilih jadwal belajar malam (19.00 - 21.00 WIB) atau kelas pengganti agar aktivitas bekerja dan komitmen belajar 3x seminggu tetap berjalan selaras tanpa terganggu.`;
  } else if (msgLower.includes('jadwal') || msgLower.includes('3 kali') || msgLower.includes('3x')) {
    fallbackReply = `Sesuai kurikulum dan tata tertib Rombel Karang Taruna, kehadiran 3x dalam seminggu adalah syarat mutlak untuk evaluasi kemajuan belajar dan penerbitan sertifikat/ijazah kesetaraan. Pastikan Anda memilih hari yang sanggup dihadiri secara konsisten di Tahap 3.`;
  } else if (msgLower.includes('sanksi') || msgLower.includes('bolos') || msgLower.includes('aturan')) {
    fallbackReply = `Tata tertib kami mengatur bahwa ketidakhadiran tanpa keterangan sah lebih dari 3 kali berturut-turut dapat berakibat pada teguran tertulis, penangguhan fasilitas belajar Karang Taruna, hingga evaluasi status keaktifan oleh tim pengurus. Kejujuran dan komitmen adalah prioritas kami.`;
  } else if (msgLower.includes('tahap') || msgLower.includes('langkah') || msgLower.includes('alur')) {
    fallbackReply = `Alur konfirmasi wajib diikuti secara berurutan:
1. Tahap 1: Validasi & Tarik Data Lama (NISN/NIK)
2. Tahap 2: Review, Edit & Lengkapi Profil Diri
3. Tahap 3: Pengisian Status Bekerja & Jadwal Belajar (3x/minggu)
4. Tahap 4: Unggah Surat Pernyataan Bermaterai Rp10.000 & Rekapitulasi Data.`;
  } else {
    fallbackReply = `Salam Karang Taruna! Terkait pertanyaan Anda: Pada ${currentStepName}, pastikan seluruh kolom isian telah diisi secara jujur dan akurat. Jika data sudah sesuai, klik tombol lanjut ke tahap berikutnya. Ada hal administratif lain yang ingin ditanyakan?`;
  }

  return res.json({
    reply: fallbackReply,
    source: 'system',
  });
});

// 4. Submissions CRUD Endpoints
app.get('/api/submissions', (req, res) => {
  res.json({
    success: true,
    total: submittedList.length,
    data: submittedList,
  });
});

app.post('/api/submissions', (req, res) => {
  const { profile, work, schedule, statement } = req.body;

  if (!profile || !work || !schedule || !statement) {
    return res.status(400).json({
      success: false,
      message: 'Data konfirmasi belum lengkap. Pastikan seluruh 4 tahap telah diisi.',
    });
  }

  const newSubmission: FullSubmission = {
    id: `SUB-KT-2026-${String(submittedList.length + 1).padStart(3, '0')}`,
    submittedAt: new Date().toISOString(),
    profile,
    work,
    schedule,
    statement,
  };

  submittedList.unshift(newSubmission);

  return res.json({
    success: true,
    message: 'Konfirmasi data siswa dan surat pernyataan kesanggupan berhasil disimpan!',
    submission: newSubmission,
  });
});

// Setup Vite / Static handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Karang Taruna System] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
