import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, MapPin, AlignLeft, CheckCircle2 } from 'lucide-react';
import { CreateEventInput } from '../services/googleCalendar';

interface AddEventModalProps {
  isOpen: boolean;
  selectedDate: Date | null;
  onClose: () => void;
  onSubmit: (eventData: CreateEventInput) => Promise<void>;
  isLoading?: boolean;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  selectedDate,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  if (!isOpen || !selectedDate) return null;

  const dateStr = selectedDate.toISOString().split('T')[0];

  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [showConfirmStep, setShowConfirmStep] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      setErrorMsg('Judul agenda wajib diisi.');
      return;
    }
    setErrorMsg('');
    setShowConfirmStep(true);
  };

  const handleFinalConfirm = async () => {
    try {
      await onSubmit({
        summary: summary.trim(),
        description: description.trim(),
        location: location.trim(),
        startDate: dateStr,
        startTime,
        endDate: dateStr,
        endTime,
        isAllDay
      });
      // Reset state
      setSummary('');
      setDescription('');
      setLocation('');
      setShowConfirmStep(false);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan agenda ke Google Calendar.');
      setShowConfirmStep(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-200" />
            <h3 className="font-bold text-lg">Tambah Agenda ke Google Calendar</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/50 border-b border-red-200 dark:border-red-800/50 px-6 py-2.5 text-xs text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {!showConfirmStep ? (
          <form onSubmit={handleInitialSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Judul Agenda *
              </label>
              <input
                type="text"
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Contoh: Pengajian Rutin / Rapat Yayasan / Buka Bersama"
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Tanggal
                </label>
                <div className="px-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-sm font-medium text-stone-800 dark:text-stone-200">
                  {selectedDate.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }).replace(/Minggu/g, 'Ahad')}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  Acara Sepanjang Hari
                </label>
                {!isAllDay && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-2 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded text-xs text-stone-900 dark:text-white"
                    />
                    <span className="text-stone-400 text-xs">-</span>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-2 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded text-xs text-stone-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Lokasi (Opsional)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Misal: Masjid Agung / Ruang Rapat Lt. 2 / Online Google Meet"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Catatan / Keterangan
              </label>
              <div className="relative">
                <AlignLeft className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan tambahan acara..."
                  className="w-full pl-9 pr-3.5 py-2 bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-md transition-all cursor-pointer"
              >
                Lanjutkan
              </button>
            </div>
          </form>
        ) : (
          /* Explicit confirmation step as required by Google Workspace integration rules */
          <div className="p-6 space-y-5">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold mb-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Konfirmasi Penambahan ke Google Calendar
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300/90 leading-relaxed mb-3">
                Anda akan menambahkan agenda berikut ke akun Google Calendar utama Anda:
              </p>
              <div className="bg-white dark:bg-stone-900 rounded-lg p-3 border border-blue-100 dark:border-stone-800 text-xs space-y-1.5">
                <div className="font-bold text-stone-900 dark:text-white text-sm">
                  {summary}
                </div>
                <div className="text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  {selectedDate.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                  {isAllDay ? ' (Sepanjang Hari)' : ` (${startTime} - ${endTime})`}
                </div>
                {location && (
                  <div className="text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {location}
                  </div>
                )}
                {description && (
                  <div className="text-stone-500 italic mt-1 pt-1 border-t border-stone-100 dark:border-stone-800">
                    "{description}"
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowConfirmStep(false)}
                className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              >
                Kembali Edit
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleFinalConfirm}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-md transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Ya, Simpan ke Google Calendar'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
