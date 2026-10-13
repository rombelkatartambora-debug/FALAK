import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Share2,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  Building,
  Upload,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  KegiatanRecord,
  KelurahanName,
  TingkatOrganisasi,
  UnitRWProfile,
} from '../types';
import { BIDANG_KEGIATAN_KATAR, DAFTAR_KELURAHAN_TAMBORA, MAP_WILAYAH_TAMBORA } from '../data/wilayah';
import { addKegiatan, deleteKegiatan, getOrCreateUKKT, getUKKTList } from '../services/storage';
import { ShareSocialModal } from './ShareSocialModal';

interface KegiatanViewProps {
  kegiatanList: KegiatanRecord[];
  onRefresh: () => void;
  currentKelurahan: KelurahanName;
  currentRw: string;
  onNavigateToRekap?: () => void;
}

export const KegiatanView: React.FC<KegiatanViewProps> = ({
  kegiatanList,
  onRefresh,
  currentKelurahan,
  currentRw,
  onNavigateToRekap,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelurahan, setFilterKelurahan] = useState<string>('SEMUA');
  const [filterBidang, setFilterBidang] = useState<string>('SEMUA');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [notification, setNotification] = useState<string | null>(null);

  // Modal Share Social Media
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedKegiatanForShare, setSelectedKegiatanForShare] = useState<KegiatanRecord | null>(null);
  const [selectedUnitForShare, setSelectedUnitForShare] = useState<UnitRWProfile | null>(null);

  // Form State
  const [judulKegiatan, setJudulKegiatan] = useState('');
  const [bidang, setBidang] = useState<string>(BIDANG_KEGIATAN_KATAR[0]);
  const [tingkat, setTingkat] = useState<TingkatOrganisasi>('Unit RW');
  const [kelurahan, setKelurahan] = useState<KelurahanName>(currentKelurahan);
  const [nomorRw, setNomorRw] = useState<string>(currentRw);
  const [tanggalPelaksanaan, setTanggalPelaksanaan] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [waktuMulai, setWaktuMulai] = useState('08:00 WIB');
  const [waktuSelesai, setWaktuSelesai] = useState('12:00 WIB');
  const [lokasiKegiatan, setLokasiKegiatan] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [penyelenggara, setPenyelenggara] = useState(`UKKT RW ${currentRw} Kel. ${currentKelurahan}`);
  const [anggaranBiaya, setAnggaranBiaya] = useState<number>(500000);
  const [jumlahPartisipan, setJumlahPartisipan] = useState<number>(35);
  const [status, setStatus] = useState<'Akan Datang' | 'Sedang Berlangsung' | 'Selesai'>('Selesai');
  const [fotoDokumentasi, setFotoDokumentasi] = useState<string[]>([]);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Upload Foto Dokumentasi
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setFotoDokumentasi((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
      showNotify(`${files.length} foto dokumentasi berhasil ditambahkan!`);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFotoDokumentasi((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Kegiatan Baru
  const handleSubmitKegiatan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulKegiatan.trim() || !lokasiKegiatan.trim()) {
      alert('Mohon lengkapi judul dan lokasi kegiatan.');
      return;
    }

    const newRecord: KegiatanRecord = {
      id: `KEG-${Date.now()}`,
      judulKegiatan: judulKegiatan.trim(),
      bidang,
      tingkat,
      kelurahan,
      nomorRw: tingkat === 'Unit RW' ? nomorRw : undefined,
      tanggalPelaksanaan,
      waktuMulai,
      waktuSelesai,
      lokasiKegiatan: lokasiKegiatan.trim(),
      deskripsi: deskripsi.trim() || 'Kegiatan kepemudaan Karang Taruna untuk penguatan solidaritas dan pemberdayaan masyarakat.',
      penyelenggara: penyelenggara.trim(),
      anggaranBiaya,
      jumlahPartisipan,
      fotoDokumentasi,
      status,
      waktuDibuat: new Date().toISOString(),
    };

    addKegiatan(newRecord);
    onRefresh();

    // Ambil profil UKKT RW terkait untuk share ke media sosial
    const allUkkt = getUKKTList();
    const relatedUnit = allUkkt.find(
      (u) => u.kelurahan === kelurahan && u.nomorRw === nomorRw
    ) || null;

    // Reset Form
    setIsFormOpen(false);
    setJudulKegiatan('');
    setLokasiKegiatan('');
    setDeskripsi('');
    setFotoDokumentasi([]);

    // Buka Modal Share Medsos
    setSelectedKegiatanForShare(newRecord);
    setSelectedUnitForShare(relatedUnit);
    setShareModalOpen(true);
    showNotify('Kegiatan berhasil disimpan! Silakan bagikan ke media sosial.');
  };

  const handleDeleteKegiatan = (id: string, judul: string) => {
    if (confirm(`Hapus kegiatan "${judul}"?`)) {
      deleteKegiatan(id);
      onRefresh();
      showNotify('Kegiatan berhasil dihapus.');
    }
  };

  const handleOpenShare = (keg: KegiatanRecord) => {
    const allUkkt = getUKKTList();
    const relatedUnit = allUkkt.find(
      (u) => u.kelurahan === keg.kelurahan && u.nomorRw === keg.nomorRw
    ) || null;
    setSelectedKegiatanForShare(keg);
    setSelectedUnitForShare(relatedUnit);
    setShareModalOpen(true);
  };

  // Filter List
  const filteredKegiatan = useMemo(() => {
    return kegiatanList.filter((keg) => {
      if (filterKelurahan !== 'SEMUA' && keg.kelurahan !== filterKelurahan) return false;
      if (filterBidang !== 'SEMUA' && keg.bidang !== filterBidang) return false;
      if (filterStatus !== 'SEMUA' && keg.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchJudul = keg.judulKegiatan.toLowerCase().includes(q);
        const matchLokasi = keg.lokasiKegiatan.toLowerCase().includes(q);
        const matchPenyelenggara = keg.penyelenggara.toLowerCase().includes(q);
        return matchJudul || matchLokasi || matchPenyelenggara;
      }
      return true;
    });
  }, [kegiatanList, filterKelurahan, filterBidang, filterStatus, searchQuery]);

  // Statistik Cepat
  const totalPartisipan = kegiatanList.reduce((acc, k) => acc + (k.jumlahPartisipan || 0), 0);
  const totalAnggaran = kegiatanList.reduce((acc, k) => acc + (k.anggaranBiaya || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={20} />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      {/* Modal Share Medsos */}
      <ShareSocialModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        kegiatan={selectedKegiatanForShare}
        unit={selectedUnitForShare}
      />

      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-black uppercase">
              MODUL KEGIATAN PEMUDA
            </span>
            <span className="text-xs text-slate-500 font-medium">Kecamatan Tambora • 96 UKKT RW</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>Manajemen Kegiatan Karang Taruna</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToRekap && (
            <button
              onClick={onNavigateToRekap}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Award size={16} />
              <span>Rekap RW Sering Kegiatan</span>
            </button>
          )}

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>{isFormOpen ? 'Tutup Formulir' : 'Catat Kegiatan Baru'}</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Kegiatan</span>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {kegiatanList.length} <span className="text-xs font-medium text-slate-400">Kegiatan</span>
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1">Terdata se-Kecamatan Tambora</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase">Partisipan Pemuda</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {totalPartisipan.toLocaleString('id-ID')}{' '}
            <span className="text-xs font-medium text-slate-400">Jiwa</span>
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1">Pemuda aktif terlibat langsung</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase">Anggaran Terserap</span>
          <div className="mt-2 text-2xl font-black text-blue-600">
            Rp {(totalAnggaran / 1000000).toFixed(1)}{' '}
            <span className="text-xs font-medium text-slate-400">Juta</span>
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1">Dana Stimulan & Swadaya Warga</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-purple-600 uppercase">Penyebaran Medsos</span>
          <div className="mt-2 text-2xl font-black text-purple-600">
            100% <span className="text-xs font-medium text-slate-400">Terkoneksi</span>
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1">WA, IG, FB, TikTok & YouTube</div>
        </div>
      </div>

      {/* FORM INPUT KEGIATAN BARU */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitKegiatan}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-blue-500/40 shadow-xl space-y-5 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="text-blue-600" size={20} />
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Formulir Input Kegiatan Karang Taruna Baru
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Judul Kegiatan */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Judul Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={judulKegiatan}
                onChange={(e) => setJudulKegiatan(e.target.value)}
                placeholder="Contoh: Kerja Bakti Massal & Fogging Pencegahan DBD Lingkungan RW"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Bidang Kegiatan (9 bidang resmi KT) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Bidang Kegiatan Resmi KT <span className="text-red-500">*</span>
              </label>
              <select
                value={bidang}
                onChange={(e) => setBidang(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
              >
                {BIDANG_KEGIATAN_KATAR.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Tingkat & Wilayah */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Tingkat Organisasi
              </label>
              <select
                value={tingkat}
                onChange={(e) => setTingkat(e.target.value as TingkatOrganisasi)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
              >
                <option value="Unit RW">Unit Kerja RW</option>
                <option value="Kelurahan">Tingkat Kelurahan</option>
                <option value="Kecamatan">Tingkat Kecamatan Tambora</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Kelurahan
              </label>
              <select
                value={kelurahan}
                onChange={(e) => {
                  const k = e.target.value as KelurahanName;
                  setKelurahan(k);
                  setNomorRw(MAP_WILAYAH_TAMBORA[k][0]);
                  setPenyelenggara(
                    tingkat === 'Unit RW'
                      ? `UKKT RW ${MAP_WILAYAH_TAMBORA[k][0]} Kel. ${k}`
                      : `Karang Taruna Kelurahan ${k}`
                  );
                }}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
              >
                {DAFTAR_KELURAHAN_TAMBORA.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            {tingkat === 'Unit RW' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Nomor RW
                </label>
                <select
                  value={nomorRw}
                  onChange={(e) => {
                    const r = e.target.value;
                    setNomorRw(r);
                    setPenyelenggara(`UKKT RW ${r} Kel. ${kelurahan}`);
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold font-mono focus:ring-2 focus:ring-blue-500"
                >
                  {(MAP_WILAYAH_TAMBORA[kelurahan] || ['001']).map((rw) => (
                    <option key={rw} value={rw}>
                      RW {rw}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tanggal & Waktu */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Tanggal Pelaksanaan <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggalPelaksanaan}
                onChange={(e) => setTanggalPelaksanaan(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Waktu Pelaksanaan
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={waktuMulai}
                  onChange={(e) => setWaktuMulai(e.target.value)}
                  placeholder="08:00 WIB"
                  className="w-1/2 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-xs"
                />
                <input
                  type="text"
                  value={waktuSelesai}
                  onChange={(e) => setWaktuSelesai(e.target.value)}
                  placeholder="12:00 WIB"
                  className="w-1/2 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Status Kegiatan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
              >
                <option value="Selesai">Selesai Terlaksana</option>
                <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                <option value="Akan Datang">Akan Datang (Jadwal)</option>
              </select>
            </div>

            {/* Lokasi & Penyelenggara */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Lokasi / Alamat Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={lokasiKegiatan}
                onChange={(e) => setLokasiKegiatan(e.target.value)}
                placeholder="Contoh: Balai Warga RW 001, Jl. Pengukir II No. 15, Pekojan"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Penyelenggara
              </label>
              <input
                type="text"
                value={penyelenggara}
                onChange={(e) => setPenyelenggara(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Partisipan & Anggaran */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Estimasi Pemuda / Partisipan
              </label>
              <input
                type="number"
                value={jumlahPartisipan}
                onChange={(e) => setJumlahPartisipan(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Anggaran Biaya (Rp)
              </label>
              <input
                type="number"
                value={anggaranBiaya}
                onChange={(e) => setAnggaranBiaya(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold"
              />
            </div>

            {/* Deskripsi */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Narasi / Deskripsi Pelaksanaan Kegiatan
              </label>
              <textarea
                rows={3}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Tuliskan ringkasan jalannya kegiatan, output yang dicapai, dan antusiasme warga..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Upload Foto Dokumentasi */}
            <div className="md:col-span-3 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <ImageIcon size={18} className="text-emerald-500" />
                  <span>Upload Foto Dokumentasi Kegiatan (Bisa Lebih Dari 1)</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {fotoDokumentasi.length} foto terpilih
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center gap-2">
                  <Upload size={14} />
                  <span>Pilih Berkas Foto</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>

                {/* Thumbnail Preview */}
                {fotoDokumentasi.map((foto, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={foto}
                      alt="Dokumentasi"
                      className="w-16 h-14 object-cover rounded-xl border border-slate-300 dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow-md hover:bg-red-700"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Share2 size={16} />
              <span>Simpan & Buka Menu Bagikan Medsos</span>
            </button>
          </div>
        </form>
      )}

      {/* FILTER & PENCARIAN */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
          >
            <option value="SEMUA">Semua Status</option>
            <option value="Selesai">Selesai</option>
            <option value="Sedang Berlangsung">Sedang Berlangsung</option>
            <option value="Akan Datang">Akan Datang</option>
          </select>

          {/* Filter Kelurahan */}
          <select
            value={filterKelurahan}
            onChange={(e) => setFilterKelurahan(e.target.value)}
            className="p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
          >
            <option value="SEMUA">Semua Kelurahan (11)</option>
            {DAFTAR_KELURAHAN_TAMBORA.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>

          {/* Filter Bidang */}
          <select
            value={filterBidang}
            onChange={(e) => setFilterBidang(e.target.value)}
            className="p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium max-w-xs truncate"
          >
            <option value="SEMUA">Semua 9 Bidang KT</option>
            {BIDANG_KEGIATAN_KATAR.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama kegiatan / lokasi..."
            className="pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium w-full sm:w-64"
          />
        </div>
      </div>

      {/* DAFTAR KARTU KEGIATAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredKegiatan.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
            Belum ada kegiatan yang sesuai dengan filter. Klik "Catat Kegiatan Baru" untuk mulai menambahkan.
          </div>
        ) : (
          filteredKegiatan.map((keg) => (
            <div
              key={keg.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Header Card / Image Thumbnail */}
                {keg.fotoDokumentasi && keg.fotoDokumentasi.length > 0 ? (
                  <div className="h-44 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={keg.fotoDokumentasi[0]}
                      alt={keg.judulKegiatan}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-xs ${
                          keg.status === 'Selesai'
                            ? 'bg-emerald-600/90 text-white'
                            : keg.status === 'Sedang Berlangsung'
                            ? 'bg-blue-600/90 text-white'
                            : 'bg-amber-500/90 text-slate-950'
                        }`}
                      >
                        {keg.status}
                      </span>
                    </div>
                    {keg.fotoDokumentasi.length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">
                        +{keg.fotoDokumentasi.length - 1} foto
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-4 pb-0 flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        keg.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : keg.status === 'Sedang Berlangsung'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {keg.status}
                    </span>
                    <span className="text-[10.5px] font-mono text-slate-400">
                      {keg.kelurahan} {keg.nomorRw ? `RW ${keg.nomorRw}` : ''}
                    </span>
                  </div>
                )}

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                      {keg.bidang}
                    </span>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white mt-1 leading-snug line-clamp-2">
                      {keg.judulKegiatan}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-3">{keg.deskripsi}</p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-blue-600 shrink-0" />
                      <span>
                        {keg.tanggalPelaksanaan} ({keg.waktuMulai || 'WIB'})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-red-500 shrink-0" />
                      <span className="truncate">{keg.lokasiKegiatan}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={13} className="text-emerald-600 shrink-0" />
                      <span>{keg.jumlahPartisipan || 0} Pemuda Terlibat</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleDeleteKegiatan(keg.id, keg.judulKegiatan)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  title="Hapus Kegiatan"
                >
                  <Trash2 size={15} />
                </button>

                <button
                  onClick={() => handleOpenShare(keg)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Share2 size={13} />
                  <span>Bagikan ke Medsos</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
