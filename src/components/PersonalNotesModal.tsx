import React, { useState } from 'react';
import { 
  X, 
  StickyNote, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Search, 
  CheckSquare,
  ListTodo
} from 'lucide-react';
import { PersonalNote } from '../types/calendar';
import { NAMA_BULAN } from '../utils/calendarMath';

interface PersonalNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: number;
  year: number;
  notes: PersonalNote[];
  onAddNote: (dateStr: string, title: string) => void;
  onToggleNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onSelectDate: (year: number, month: number, day: number) => void;
}

export const PersonalNotesModal: React.FC<PersonalNotesModalProps> = ({
  isOpen,
  onClose,
  month,
  year,
  notes,
  onAddNote,
  onToggleNote,
  onDeleteNote,
  onSelectDate
}) => {
  if (!isOpen) return null;

  const [newTitle, setNewTitle] = useState('');
  const [selectedDayNum, setSelectedDayNum] = useState<number>(() => {
    const today = new Date();
    if (today.getFullYear() === year && today.getMonth() + 1 === month) {
      return today.getDate();
    }
    return 1;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'done'>('all');

  const monthStr = String(month).padStart(2, '0');
  const daysInMonth = new Date(year, month, 0).getDate();

  // Filter notes for current month
  const monthNotes = notes.filter((n) => n.dateStr.startsWith(`${year}-${monthStr}`));

  const filteredNotes = monthNotes.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStatus === 'pending') return !n.isDone;
    if (filterStatus === 'done') return !!n.isDone;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const dayStr = String(selectedDayNum).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    onAddNote(dateStr, newTitle.trim());
    setNewTitle('');
  };

  const pendingCount = monthNotes.filter((n) => !n.isDone).length;
  const doneCount = monthNotes.filter((n) => n.isDone).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div 
        className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-yellow-800 text-white p-4 sm:p-5 flex items-start justify-between relative shrink-0">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-amber-200 font-extrabold flex items-center gap-1.5 mb-1">
              <StickyNote className="w-3.5 h-3.5" />
              <span>Agenda Harian Lokal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Catatan Pribadi & To-Do List</span>
            </h2>
            <p className="text-xs text-amber-100/90 mt-0.5">
              {NAMA_BULAN[month - 1]} {year} &bull; {pendingCount} aktif, {doneCount} selesai
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-amber-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form Baru */}
        <form onSubmit={handleCreate} className="p-3.5 sm:p-4 bg-amber-50/60 dark:bg-stone-800/60 border-b border-amber-200/60 dark:border-stone-700 space-y-2.5 shrink-0">
          <div className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-amber-600" />
            <span>Tambah Catatan / To-Do Harian:</span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Pemilih Tanggal Bulan Ini */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-stone-900 px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs shrink-0">
              <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="font-semibold text-stone-500 text-[11px]">Tgl:</span>
              <select
                value={selectedDayNum}
                onChange={(e) => setSelectedDayNum(parseInt(e.target.value, 10))}
                className="bg-transparent font-bold text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
              >
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                    {d} {NAMA_BULAN[month - 1].slice(0, 3)}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Isi Catatan */}
            <input
              type="text"
              placeholder="Tulis kegiatan, janji, atau to-do harian..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white dark:bg-stone-900 text-xs sm:text-sm font-semibold rounded-xl border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            {/* Tombol Simpan */}
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              Simpan
            </button>
          </div>
        </form>

        {/* Filter & Pencarian */}
        <div className="px-4 py-2.5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2 text-xs shrink-0 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="relative flex-1 max-w-[200px]">
            <Search className="w-3 h-3 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2 py-1 bg-white dark:bg-stone-800 text-[11px] rounded-lg border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              Semua ({monthNotes.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              Aktif ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('done')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                filterStatus === 'done'
                  ? 'bg-amber-600 text-white'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              Selesai ({doneCount})
            </button>
          </div>
        </div>

        {/* Daftar Catatan / To-Do List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {filteredNotes.length === 0 ? (
            <div className="py-8 text-center text-stone-400 space-y-1.5">
              <ListTodo className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-600" />
              <p className="text-xs font-semibold">
                {searchQuery
                  ? 'Tidak ada catatan yang cocok dengan pencarian.'
                  : 'Belum ada catatan pribadi atau to-do di bulan ini.'}
              </p>
              <p className="text-[11px] text-stone-400 dark:text-stone-500">
                Gunakan form di atas untuk menulis catatan kecil atau tugas harian.
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const [, , dayPart] = note.dateStr.split('-');
              const dayNum = parseInt(dayPart, 10);

              return (
                <div
                  key={note.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                    note.isDone
                      ? 'bg-stone-100/70 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-75'
                      : 'bg-white dark:bg-stone-800 border-amber-200 dark:border-stone-700 shadow-2xs hover:border-amber-400'
                  }`}
                >
                  {/* Checkbox status selesai */}
                  <button
                    onClick={() => onToggleNote(note.id)}
                    className="p-0.5 text-stone-400 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                    title={note.isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
                  >
                    {note.isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-stone-400 hover:text-amber-600" />
                    )}
                  </button>

                  {/* Isi Catatan & Tanggal */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        note.isDone
                          ? 'line-through text-stone-400 dark:text-stone-500'
                          : 'text-stone-800 dark:text-stone-100'
                      }`}
                    >
                      {note.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-500 dark:text-stone-400">
                      <button
                        onClick={() => {
                          onSelectDate(year, month, dayNum);
                          onClose();
                        }}
                        className="font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Tgl {dayNum} {NAMA_BULAN[month - 1]} {year}</span>
                      </button>
                    </div>
                  </div>

                  {/* Hapus Catatan */}
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                    title="Hapus catatan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-3 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 shrink-0">
          <span>✦ Tersimpan otomatis di peramban Anda (offline & privat)</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
