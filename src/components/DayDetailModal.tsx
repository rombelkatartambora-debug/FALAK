import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Sparkles, 
  Info, 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  ExternalLink,
  StickyNote,
  CheckCircle2,
  Circle,
  ListTodo
} from 'lucide-react';
import { DayData, GoogleCalendarEvent, PersonalNote, CalendarViewMode } from '../types/calendar';
import { toArabicNumeral, NAMA_HARI, NAMA_BULAN } from '../utils/calendarMath';

interface DayDetailModalProps {
  dayData: DayData | null;
  isOpen: boolean;
  onClose: () => void;
  mode?: CalendarViewMode;
  onOpenAddEvent: (date: Date) => void;
  onRequestDeleteEvent: (event: GoogleCalendarEvent) => void;
  isAuthenticated: boolean;
  onSignInPrompt: () => void;
  onAddPersonalNote: (dateStr: string, title: string) => void;
  onTogglePersonalNote: (id: string) => void;
  onDeletePersonalNote: (id: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  dayData,
  isOpen,
  onClose,
  mode = 'lengkap',
  onOpenAddEvent,
  onRequestDeleteEvent,
  isAuthenticated,
  onSignInPrompt,
  onAddPersonalNote,
  onTogglePersonalNote,
  onDeletePersonalNote
}) => {
  if (!isOpen || !dayData) return null;

  const { date, pasaran, hijri, jawa, julian, tionghoa, saka, neptu, holidays, googleEvents, personalNotes } = dayData;
  const [newNoteInput, setNewNoteInput] = useState('');

  // ISO date string: YYYY-MM-DD
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dateIso = `${y}-${m}-${d}`;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;
    onAddPersonalNote(dateIso, newNoteInput.trim());
    setNewNoteInput('');
  };

  // Judul & deskripsi bagian peringatan adaptif
  let priorityHeading = 'Peringatan & Agenda Prioritas Hari Ini';
  let prioritySubtext = 'Peringatan & agenda resmi sesuai mode kalender aktif';
  let emptyPriorityText = 'Tidak ada catatan libur nasional atau agenda khusus.';

  if (mode === 'hijriyah') {
    priorityHeading = 'Peringatan & Agenda Khusus Hijriyah';
    prioritySubtext = 'Hanya menampilkan hari besar & peringatan resmi Islam (Hijriyah)';
    emptyPriorityText = 'Tidak ada peringatan atau hari besar Hijriyah pada tanggal ini.';
  } else if (mode === 'jawa') {
    priorityHeading = 'Peringatan Tradisi Jawa Sultan Agungan & Hijriyah';
    prioritySubtext = 'Hanya menampilkan tradisi adat Jawa dan penanggalan Hijriyah';
    emptyPriorityText = 'Tidak ada peringatan tradisi Jawa atau Hijriyah pada tanggal ini.';
  } else if (mode === 'julian') {
    priorityHeading = 'Peringatan & Penanda Kalender Julian';
    prioritySubtext = 'Penanda penanggalan Kalender Julius Caesar (Old Style)';
    emptyPriorityText = 'Tidak ada penanda khusus kalender Julian pada tanggal ini.';
  } else if (mode === 'tionghoa') {
    priorityHeading = 'Perayaan & Festival Tradisi Tionghoa';
    prioritySubtext = 'Festival & peringatan penanggalan Lunar Imlek';
    emptyPriorityText = 'Tidak ada festival besar penanggalan Tionghoa pada tanggal ini.';
  } else if (mode === 'saka') {
    priorityHeading = 'Hari Suci & Rahina Kalender Saka Bali';
    prioritySubtext = 'Hari suci & piodalan penanggalan Saka Nusantara';
    emptyPriorityText = 'Tidak ada hari suci kalender Saka pada tanggal ini.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div 
        className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 text-white p-5 flex items-start justify-between relative overflow-hidden shrink-0 border-b border-amber-600/30">
          <div className="relative z-10 space-y-2">
            <div className="text-xs uppercase tracking-widest text-amber-300 font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Detail 6 Sistem Penanggalan Nusantara</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-baseline gap-2">
              <span>{NAMA_HARI[date.getDay()]},</span>
              <span>{date.getDate()} {NAMA_BULAN[date.getMonth()]} {date.getFullYear()}</span>
            </h2>

            {/* Badges 6 Sistem Penanggalan */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {/* 1. Hijriyah */}
              <div className="bg-emerald-600/90 text-white px-2.5 py-1 rounded-lg border border-emerald-400/50 font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                <span>🌙 {hijri.day} {hijri.monthName} {hijri.year} H</span>
                <span className="text-emerald-200 font-serif">({toArabicNumeral(hijri.day)})</span>
              </div>
              
              {/* 2. Jawa Kasultanan */}
              <div className="bg-amber-800/80 text-amber-100 px-2.5 py-1 rounded-lg border border-amber-500/40 font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>🌾 {NAMA_HARI[date.getDay()]} {pasaran}, {jawa.day} {jawa.monthName} {jawa.year} Jawa</span>
              </div>

              {/* 3. Julian */}
              {julian && (
                <div className="bg-blue-900/80 text-blue-100 px-2 py-0.5 rounded-md border border-blue-500/40 text-[11px] font-semibold flex items-center gap-1">
                  <span>🏛️ {julian.day} {julian.monthName} {julian.year} Julian</span>
                </div>
              )}

              {/* 4. Tionghoa */}
              {tionghoa && (
                <div className="bg-red-900/80 text-red-100 px-2 py-0.5 rounded-md border border-red-500/40 text-[11px] font-semibold flex items-center gap-1">
                  <span>🏮 {tionghoa.day} {tionghoa.monthName} ({tionghoa.chineseMonthName}) {tionghoa.year} Imlek &bull; {tionghoa.shioAnimal}</span>
                </div>
              )}

              {/* 5. Saka */}
              {saka && (
                <div className="bg-purple-900/80 text-purple-100 px-2 py-0.5 rounded-md border border-purple-500/40 text-[11px] font-semibold flex items-center gap-1">
                  <span>🪷 Sasih {saka.sasihName} {saka.year} Saka ({saka.faseBulan === 'Purnama' ? '🌕 Purnama' : saka.faseBulan === 'Tilem' ? '🌑 Tilem' : `${saka.faseBulan} ${saka.faseBulanHari}`})</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* BAGIAN PRIORITAS: PERINGATAN HARI INI & AGENDA RESMI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-500" />
                <span>{priorityHeading}</span>
              </div>
              <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">
                {prioritySubtext}
              </span>
            </div>

            {holidays.length > 0 || (dayData.adminEvents && dayData.adminEvents.length > 0) ? (
              <div className="space-y-2">
                {/* Daftar Hari Libur & Peringatan Terfilter */}
                {holidays.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold shadow-xs ${
                      ev.isHoliday
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900 text-red-700 dark:text-red-300'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{ev.isHoliday ? '🔴' : '⭐'}</span>
                      <div>
                        <div className="font-extrabold text-sm">{ev.title}</div>
                        <div className="text-[10px] font-medium opacity-80">
                          {ev.isHoliday ? 'Hari Libur Resmi Nasional' : 'Peringatan / Hari Besar'}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase shrink-0 ${
                      ev.isHoliday ? 'bg-red-600 text-white' : 'bg-amber-500 text-stone-950'
                    }`}>
                      {ev.isHoliday ? 'Libur Nasional' : 'Peringatan'}
                    </span>
                  </div>
                ))}

                {/* Agenda Khusus Lembaga (Jika relevan) */}
                {dayData.adminEvents && mode !== 'masehi' && dayData.adminEvents.map((aEv) => (
                  <div
                    key={aEv.id}
                    className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs text-stone-900 dark:text-stone-100 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏛️</span>
                      <div>
                        <strong className="text-emerald-900 dark:text-emerald-200 block text-sm font-black">{aEv.title}</strong>
                        {aEv.description && <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">{aEv.description}</p>}
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-black bg-emerald-600 text-white uppercase shrink-0">
                      {aEv.category}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">●</span>
                  <span className="text-stone-700 dark:text-stone-200 font-bold">Hari Aktif Normal</span>
                </div>
                <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                  {emptyPriorityText}
                </span>
              </div>
            )}
          </div>

          {/* Rincian 6 Sistem Penanggalan (Kartu Rapi) */}
          <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Sinkronisasi 6 Sistem Kalender Hari Ini
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* 1. Masehi */}
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                <span className="font-bold text-blue-600 dark:text-blue-400 block text-[11px]">1. Masehi (Gregorian)</span>
                <p className="font-extrabold text-stone-900 dark:text-stone-100">{NAMA_HARI[date.getDay()]}, {date.getDate()} {NAMA_BULAN[date.getMonth()]} {date.getFullYear()}</p>
                <p className="text-[10px] text-stone-500">Sistem Solar (Syamsiyah)</p>
              </div>

              {/* 2. Hijriyah */}
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-emerald-300 dark:border-emerald-800/50">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-[11px]">2. Hijriyah (Sullamun Nayyirain)</span>
                <p className="font-extrabold text-stone-900 dark:text-stone-100">{hijri.day} {hijri.monthName} {hijri.year} H</p>
                <p className="text-[10px] text-stone-500">Sistem Lunar Hakiki Qamariyah</p>
              </div>

              {/* 3. Jawa Kasultanan */}
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-amber-300 dark:border-amber-800/50">
                <span className="font-bold text-amber-600 dark:text-amber-400 block text-[11px]">3. Jawa Sultan Agungan</span>
                <p className="font-extrabold text-stone-900 dark:text-stone-100">{NAMA_HARI[date.getDay()]} {pasaran}, {jawa.day} {jawa.monthName} {jawa.year}</p>
                <p className="text-[10px] text-stone-500">Neptu: {neptu.totalNeptu} ({neptu.hari} {neptu.neptuHari} + {neptu.pasaran} {neptu.neptuPasaran})</p>
              </div>

              {/* 4. Julian */}
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-sky-300 dark:border-sky-800/50">
                <span className="font-bold text-sky-600 dark:text-sky-400 block text-[11px]">4. Kalender Julian (Julius Caesar)</span>
                <p className="font-extrabold text-stone-900 dark:text-stone-100">{julian?.day} {julian?.monthName} {julian?.year}</p>
                <p className="text-[10px] text-stone-500">JDN: {julian?.julianDayNumber} (Selisih -13 Hari)</p>
              </div>

              {/* 5. Tionghoa */}
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-red-300 dark:border-red-800/50">
                <span className="font-bold text-red-600 dark:text-red-400 block text-[11px]">5. Kalender Tionghoa (Imlek)</span>
                <p className="font-extrabold text-stone-900 dark:text-stone-100">{tionghoa?.day} {tionghoa?.monthName} {tionghoa?.year} Kongzili</p>
                <p className="text-[10px] text-stone-500">Shio: {tionghoa?.shio} &bull; {tionghoa?.chineseDayName}</p>
              </div>

              {/* 6. Saka Bali */}
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-purple-300 dark:border-purple-800/50">
                <span className="font-bold text-purple-600 dark:text-purple-400 block text-[11px]">6. Kalender Saka Bali</span>
                <p className="font-extrabold text-stone-900 dark:text-stone-100">Sasih {saka?.sasihName} ({saka?.day}), {saka?.year} Saka</p>
                <p className="text-[10px] text-stone-500">Fase: {saka?.faseBulan} {saka?.faseBulanHari !== 15 ? saka?.faseBulanHari : ''}</p>
              </div>
            </div>
          </div>

          {/* Catatan Pribadi & To-Do List Harian */}
          <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5" />
                Catatan Pribadi & To-Do ({personalNotes.length})
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300/40">
                Pribadi & Offline
              </span>
            </div>

            {/* Quick Add Note Form */}
            <form onSubmit={handleAddNote} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Tambah to-do atau catatan hari ini..."
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={!newNoteInput.trim()}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simpan</span>
              </button>
            </form>

            {/* List Notes */}
            {personalNotes.length === 0 ? (
              <div className="p-3 bg-amber-50/40 dark:bg-stone-800/30 border border-amber-200/40 dark:border-stone-800 rounded-xl text-center">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Belum ada catatan pribadi di tanggal ini. Tulis rencana atau tugas kecil Anda di atas.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {personalNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                      note.isDone
                        ? 'bg-stone-100 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-70'
                        : 'bg-white dark:bg-stone-800 border-amber-200 dark:border-stone-700 shadow-2xs'
                    }`}
                  >
                    <button
                      onClick={() => onTogglePersonalNote(note.id)}
                      className="p-0.5 text-stone-400 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                    >
                      {note.isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-stone-400" />
                      )}
                    </button>
                    <span
                      className={`text-xs font-semibold flex-1 truncate ${
                        note.isDone
                          ? 'line-through text-stone-400 dark:text-stone-500'
                          : 'text-stone-800 dark:text-stone-100'
                      }`}
                    >
                      {note.title}
                    </span>
                    <button
                      onClick={() => onDeletePersonalNote(note.id)}
                      className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                      title="Hapus catatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
