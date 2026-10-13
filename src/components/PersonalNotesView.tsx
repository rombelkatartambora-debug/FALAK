import React, { useState, useMemo } from 'react';
import { 
  StickyNote, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Search, 
  Download, 
  Sparkles,
  Filter
} from 'lucide-react';
import { PersonalNote } from '../types/calendar';
import { NAMA_BULAN } from '../utils/calendarMath';

interface PersonalNotesViewProps {
  notes: PersonalNote[];
  month: number;
  year: number;
  onAddNote: (dateStr: string, title: string) => void;
  onToggleNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const PersonalNotesView: React.FC<PersonalNotesViewProps> = ({
  notes,
  month,
  year,
  onAddNote,
  onToggleNote,
  onDeleteNote,
  onShowToast
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [targetDateStr, setTargetDateStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'done'>('all');

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.dateStr.includes(searchQuery);
      if (!matchesSearch) return false;
      if (filterStatus === 'pending') return !n.isDone;
      if (filterStatus === 'done') return !!n.isDone;
      return true;
    });
  }, [notes, searchQuery, filterStatus]);

  const totalCount = notes.length;
  const pendingCount = notes.filter(n => !n.isDone).length;
  const doneCount = notes.filter(n => n.isDone).length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddNote(targetDateStr, newTitle.trim());
    setNewTitle('');
    onShowToast('Catatan pribadi berhasil ditambahkan!');
  };

  const handleExportNotes = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `catatan_pribadi_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    onShowToast('Catatan berhasil diekspor ke file JSON!');
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950 via-stone-900 to-yellow-950 text-white border border-amber-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-amber-700/30 shrink-0">
            <StickyNote className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/30">
                MENU UTAMA
              </span>
              <span className="text-xs text-stone-300 font-arabic">الملاحظات الشخصية</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Catatan Pribadi & Agenda Harian
            </h2>
            <p className="text-xs text-amber-200/90 mt-0.5">
              Simpan to-do list, catatan penting, dan pengingat harian tersinkronisasi di perangkat Anda
            </p>
          </div>
        </div>

        <button
          onClick={handleExportNotes}
          className="px-4 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-stone-700"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Ekspor Catatan (JSON)</span>
        </button>
      </div>

      {/* Main Grid: Form Input & Notes List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Tambah Catatan (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Tambah Catatan Baru</span>
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Tanggal Target
                </label>
                <input
                  type="date"
                  value={targetDateStr}
                  onChange={(e) => setTargetDateStr(e.target.value)}
                  required
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Isi Catatan / Kegiatan
                </label>
                <textarea
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Kajian kitab Sulam bab ta'dil..."
                  rows={3}
                  required
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Catatan</span>
              </button>
            </form>
          </div>

          {/* Statistik Catatan */}
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-stone-950 rounded-xl border border-stone-800">
              <span className="text-stone-500 block text-[10px]">Total</span>
              <span className="font-mono text-base font-bold text-white">{totalCount}</span>
            </div>
            <div className="p-2 bg-stone-950 rounded-xl border border-stone-800">
              <span className="text-stone-500 block text-[10px]">Aktif</span>
              <span className="font-mono text-base font-bold text-amber-400">{pendingCount}</span>
            </div>
            <div className="p-2 bg-stone-950 rounded-xl border border-stone-800">
              <span className="text-stone-500 block text-[10px]">Selesai</span>
              <span className="font-mono text-base font-bold text-emerald-400">{doneCount}</span>
            </div>
          </div>
        </div>

        {/* Daftar Catatan (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari catatan..."
                className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none"
              />
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-stone-950 rounded-xl border border-stone-800 text-xs">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterStatus === 'all' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterStatus === 'pending' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-white'
                }`}
              >
                Aktif
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('done')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterStatus === 'done' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-white'
                }`}
              >
                Selesai
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    note.isDone
                      ? 'bg-stone-950/50 border-stone-800/50 text-stone-500'
                      : 'bg-stone-900 border-stone-800 text-stone-200 hover:border-amber-500/40'
                  }`}
                >
                  <button
                    onClick={() => onToggleNote(note.id)}
                    className="mt-0.5 text-stone-400 hover:text-amber-400 transition-colors cursor-pointer shrink-0"
                  >
                    {note.isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold leading-relaxed ${note.isDone ? 'line-through text-stone-500' : 'text-white'}`}>
                      {note.title}
                    </p>
                    <span className="text-[10px] text-stone-500 font-mono mt-0.5 block">
                      Target: {note.dateStr}
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteNote(note.id)}
                    title="Hapus Catatan"
                    className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-12 text-center rounded-3xl bg-stone-900 border border-stone-800 text-stone-500 text-xs">
                Tidak ada catatan ditemukan.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
