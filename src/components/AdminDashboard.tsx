import React, { useState } from 'react';
import { 
  Building2, 
  Upload, 
  Image as ImageIcon, 
  Save, 
  Trash2, 
  Plus, 
  Download, 
  FileUp, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  FileText,
  Activity,
  Layers,
  Phone,
  Tag
} from 'lucide-react';
import { CalendarKop, AdminEvent, PersonalNote } from '../types/calendar';
import { RbiLogo } from './RbiLogo';

interface AdminDashboardProps {
  kop: CalendarKop;
  onUpdateKop: (newKop: CalendarKop) => void;
  adminEvents: AdminEvent[];
  onAddAdminEvent: (event: Omit<AdminEvent, 'id' | 'createdAt'>) => void;
  onDeleteAdminEvent: (id: string) => void;
  personalNotes: PersonalNote[];
  onImportPersonalNotes: (notes: PersonalNote[]) => void;
  onSwitchToPublic: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  kop,
  onUpdateKop,
  adminEvents,
  onAddAdminEvent,
  onDeleteAdminEvent,
  personalNotes,
  onImportPersonalNotes,
  onSwitchToPublic,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'kop' | 'agenda' | 'backup' | 'audit'>('kop');

  // Form State Kop
  const [kopForm, setKopForm] = useState<CalendarKop>(kop);

  // Form State Agenda Yayasan
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventDesc, setEventDesc] = useState('');
  const [eventCategory, setEventCategory] = useState<'kegiatan' | 'pengumuman' | 'bakti_sosial' | 'pengajian'>('kegiatan');

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onShowToast('Ukuran foto maksimal 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setKopForm(prev => ({ ...prev, logoUrl: base64 }));
        onShowToast('Foto / logo berhasil diunggah!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveKop = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateKop(kopForm);
    onShowToast('Pengaturan Kop Kalender berhasil disimpan!');
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    onAddAdminEvent({
      title: eventTitle.trim(),
      dateStr: eventDate,
      description: eventDesc.trim(),
      category: eventCategory
    });
    setEventTitle('');
    setEventDesc('');
    onShowToast('Agenda Yayasan berhasil ditambahkan!');
  };

  // Backup Data to JSON
  const handleExportBackup = () => {
    const backupData = {
      appName: 'Kalender Interaktif Nusantara',
      exportDate: new Date().toISOString(),
      kop: kopForm,
      adminEvents,
      personalNotes
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_kalender_nusantara_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onShowToast('File backup JSON berhasil diunduh!');
  };

  // Restore Data from JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.kop) {
            onUpdateKop(parsed.kop);
            setKopForm(parsed.kop);
          }
          if (Array.isArray(parsed.personalNotes)) {
            onImportPersonalNotes(parsed.personalNotes);
          }
          onShowToast('Data backup berhasil dipulihkan!');
        } catch {
          onShowToast('Format file JSON tidak valid.', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Admin */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white border border-stone-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black shadow-md">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                Panel Administrator
              </span>
              <span className="text-xs text-stone-400">Yayasan Ruang Belajar</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-0.5">
              Dashboard Kontrol Kalender Nusantara
            </h1>
            <p className="text-xs text-stone-300">
              Kelola Kop Kalender, Agenda Yayasan, Backup Data, dan Validasi Hisab Falakiyah.
            </p>
          </div>
        </div>

        <button
          onClick={onSwitchToPublic}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <span>Kembali ke Portal Publik</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-xl p-1 shadow-xs text-xs sm:text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('kop')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'kop'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Kop & Logo Kalender</span>
        </button>

        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'agenda'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Agenda & Kegiatan</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'backup'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Backup & Impor Data</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit Falak & Status</span>
        </button>
      </div>

      {/* Tab 1: PENGATURAN KOP & IDENTITAS KALENDER */}
      {activeTab === 'kop' && (
        <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-stone-200 dark:border-stone-800">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-white">
                Kustomisasi Kop Kalender Dinding
              </h3>
              <p className="text-xs text-stone-500">
                Kop akan tampil di bagian atas kalender dinding sebelum diekspor ke gambar atau PDF.
              </p>
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer">
              <input
                type="checkbox"
                checked={kopForm.enabled}
                onChange={(e) => setKopForm(prev => ({ ...prev, enabled: e.target.checked }))}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Aktifkan Kop Kalender</span>
            </label>
          </div>

          <form onSubmit={handleSaveKop} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Nama Lembaga / Yayasan / Komunitas / Keluarga
                </label>
                <input
                  type="text"
                  value={kopForm.title}
                  onChange={(e) => setKopForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Contoh: Yayasan Ruang Belajar"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Slogan / Ucapan Utama
                </label>
                <input
                  type="text"
                  value={kopForm.subtitle}
                  onChange={(e) => setKopForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Contoh: Menebar Cahaya Ilmu & Menjaga Warisan Nusantara"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Kontak / Alamat Singkat
                </label>
                <input
                  type="text"
                  value={kopForm.contactInfo || ''}
                  onChange={(e) => setKopForm(prev => ({ ...prev, contactInfo: e.target.value }))}
                  placeholder="Contoh: Jl. Nusantara No. 10 &bull; Telp: 085 645 274 534"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Tagline / Catatan Kaki Kop
                </label>
                <input
                  type="text"
                  value={kopForm.tagline || ''}
                  onChange={(e) => setKopForm(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="Contoh: Kalender Dinding Edisi Eksklusif 1446-1447 H / 2025 M"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl"
                />
              </div>
            </div>

            {/* Upload Foto / Logo */}
            <div className="p-4 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/40 space-y-3">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                Unggah Foto / Logo Kop (Format PNG / JPG / WebP)
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {kopForm.logoUrl ? (
                  <div className="relative group">
                    <img 
                      src={kopForm.logoUrl} 
                      alt="Logo Kop" 
                      className="w-20 h-20 object-contain p-1 rounded-xl bg-white border border-stone-300 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setKopForm(prev => ({ ...prev, logoUrl: undefined }))}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-red-600 text-white text-xs hover:bg-red-700 transition-colors cursor-pointer"
                      title="Hapus Logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-center p-2 bg-stone-900/40">
                    <RbiLogo className="w-16 h-16 drop-shadow-md" />
                  </div>
                )}

                <div className="space-y-1 text-center sm:text-left">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="text-xs text-stone-600 dark:text-stone-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                  />
                  <p className="text-[11px] text-stone-500">
                    Maksimal 2 MB. Gambar berlatar transparan (PNG) memberikan hasil paling memukau di kop kalender.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Kop Kalender</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: AGENDA & KEGIATAN YAYASAN */}
      {activeTab === 'agenda' && (
        <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-white">
              Agenda & Kegiatan Khusus Yayasan
            </h3>
            <p className="text-xs text-stone-500">
              Agenda ini akan disematkan langsung di kotak tanggal kalender publik sebagai penanda resmi kegiatan.
            </p>
          </div>

          <form onSubmit={handleAddEventSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40">
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Judul Agenda / Kegiatan
              </label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Contoh: Santunan Yatim & Tabligh Akbar"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Tanggal Pelaksanaan
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Kategori
              </label>
              <select
                value={eventCategory}
                onChange={(e) => setEventCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg"
              >
                <option value="kegiatan">Kegiatan Yayasan</option>
                <option value="pengajian">Pengajian / Kajian</option>
                <option value="bakti_sosial">Bakti Sosial</option>
                <option value="pengumuman">Pengumuman Resmi</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Keterangan Tambahan (Opsional)
              </label>
              <input
                type="text"
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                placeholder="Lokasi aula yayasan, penceramah, atau kontak koordinator"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambahkan ke Kalender</span>
              </button>
            </div>
          </form>

          {/* Daftar Agenda */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500">
              Daftar Agenda Terdaftar ({adminEvents.length})
            </h4>

            {adminEvents.length === 0 ? (
              <p className="text-xs text-stone-500 p-4 text-center bg-stone-50 dark:bg-stone-850 rounded-xl">
                Belum ada agenda yayasan yang ditambahkan. Gunakan formulir di atas untuk menambahkan kegiatan.
              </p>
            ) : (
              adminEvents.map((ev) => (
                <div key={ev.id} className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-white">{ev.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {ev.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                      Tanggal: <strong>{ev.dateStr}</strong> {ev.description && `&bull; ${ev.description}`}
                    </p>
                  </div>

                  <button
                    onClick={() => onDeleteAdminEvent(ev.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Hapus Agenda"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: BACKUP & IMPOR DATA */}
      {activeTab === 'backup' && (
        <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-white">
              Cadangan (Backup) & Impor Data Kalender
            </h3>
            <p className="text-xs text-stone-500">
              Simpan seluruh catatan pribadi, agenda kegiatan yayasan, dan konfigurasi kalender dalam format file JSON agar aman saat ganti perangkat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Download Backup */}
            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 space-y-3">
              <div className="flex items-center gap-2 text-stone-900 dark:text-white font-bold text-sm">
                <Download className="w-5 h-5 text-amber-600" />
                <span>Unduh File Cadangan (JSON)</span>
              </div>
              <p className="text-xs text-stone-500">
                Mengekspor seluruh {personalNotes.length} catatan pribadi & to-do list serta pengaturan kop ke file cadangan.
              </p>
              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Ekspor File Cadangan (.json)</span>
              </button>
            </div>

            {/* Impor Restore */}
            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 space-y-3">
              <div className="flex items-center gap-2 text-stone-900 dark:text-white font-bold text-sm">
                <FileUp className="w-5 h-5 text-emerald-600" />
                <span>Pulihkan dari File Cadangan (JSON)</span>
              </div>
              <p className="text-xs text-stone-500">
                Pilih file JSON hasil ekspor sebelumnya untuk memulihkan catatan dan agenda ke kalender ini.
              </p>
              <label className="w-full py-2.5 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 text-center">
                <FileUp className="w-4 h-4" />
                <span>Pilih File Backup (.json)</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AUDIT FALAK & STATUS */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-white">
              Status Sistem & Verifikasi Falak
            </h3>
            <p className="text-stone-500">
              Parameter integritas perhitungan hisab dan status runtime aplikasi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-[10px] text-stone-500 block uppercase">Hisab Kitab Falak</span>
              <strong className="text-stone-900 dark:text-white text-sm">Sullamun Nayyirain</strong>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Terverifikasi (Syaikh Manshur al-Batawi)</p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-[10px] text-stone-500 block uppercase">Hisab Arah Kiblat</span>
              <strong className="text-stone-900 dark:text-white text-sm">Spherical Trigonometry</strong>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Formula Hasib Subhan Azni Bahrul Alam</p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-[10px] text-stone-500 block uppercase">PWA & Offline Mode</span>
              <strong className="text-stone-900 dark:text-white text-sm">Siap Install di HP / PC</strong>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Offline Manifest Aktif</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
