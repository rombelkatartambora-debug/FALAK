import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Filter,
  Search,
  AlertCircle,
  CreditCard,
  X,
  FileCheck,
  User,
  MapPin,
} from 'lucide-react';
import { PendaftaranAnggota, BiodataPengurus } from '../types';
import { setVerifikasiPendaftar } from '../services/storage';
import { MembershipCard } from './MembershipCard';

interface VerifikasiBerkasViewProps {
  pendaftaranList: PendaftaranAnggota[];
  onRefresh: () => void;
}

export const VerifikasiBerkasView: React.FC<VerifikasiBerkasViewProps> = ({
  pendaftaranList,
  onRefresh,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('Pending');
  const [selectedItem, setSelectedItem] = useState<PendaftaranAnggota | null>(null);
  const [viewKta, setViewKta] = useState<PendaftaranAnggota | null>(null);
  const [catatan, setCatatan] = useState('');

  const filtered = pendaftaranList.filter((item) => {
    if (filterStatus === 'Semua') return true;
    return item.status === filterStatus;
  });

  const handleAction = (id: string, status: 'Diterima' | 'Ditolak') => {
    setVerifikasiPendaftar(id, status, catatan);
    setSelectedItem(null);
    setCatatan('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-black uppercase">
              DESK VERIFIKASI ADMIN
            </span>
            <span className="text-xs text-slate-500 font-medium">Validasi Berkas & Kependudukan DKI</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
            Verifikasi Pendaftaran Anggota & Penerbitan E-KTA
          </h1>
          <p className="text-xs text-slate-500">
            Tinjau keabsahan KTP, domisili RT/RW, dan setujui permohonan keanggotaan Karang Taruna.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1 text-xs">
          {['Pending', 'Diterima', 'Ditolak', 'Semua'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Applicants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-blue-400 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-base border border-blue-200">
                    {item.namaLengkap.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      {item.namaLengkap}
                    </h3>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      NIK: {item.nik}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    item.status === 'Pending'
                      ? 'bg-amber-100 text-amber-800'
                      : item.status === 'Diterima'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-red-500" />
                  <span>
                    Unit RW {item.rw} RT {item.rt} • Kel. {item.kelurahan}
                  </span>
                </div>
                <div>Bidang Minat: <strong>{item.minatBidang}</strong></div>
                <div>Pekerjaan: {item.pekerjaan}</div>
                <div>No. WA: {item.noHp}</div>
                <div className="text-[10px] text-slate-400 pt-1">
                  Mendaftar pada: {item.waktuDaftar}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setSelectedItem(item)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye size={14} />
                  <span>Tinjau Berkas</span>
                </button>

                {item.status === 'Diterima' && (
                  <button
                    onClick={() => setViewKta(item)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard size={14} />
                    <span>Lihat E-KTA</span>
                  </button>
                )}

                {item.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleAction(item.id, 'Diterima')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Setujui dan masukkan ke database"
                    >
                      <CheckCircle size={14} />
                      <span>Terima</span>
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'Ditolak')}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Tolak pendaftaran"
                    >
                      <XCircle size={14} />
                      <span>Tolak</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
            <AlertCircle size={36} className="mx-auto text-slate-300" />
            <div className="text-sm font-bold text-slate-500">
              Tidak ada antrean berkas dalam kategori &quot;{filterStatus}&quot;.
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETAIL REVIEW BERKAS */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <h3 className="font-black text-base text-slate-900 dark:text-white border-b pb-2">
              Verifikasi Dokumen: {selectedItem.namaLengkap}
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold">NIK KTP</span>
                <div className="font-mono font-bold">{selectedItem.nik}</div>
              </div>
              <div>
                <span className="text-slate-400 font-bold">Tempat, Tgl Lahir</span>
                <div>{selectedItem.tempatLahir}, {selectedItem.tanggalLahir}</div>
              </div>
              <div>
                <span className="text-slate-400 font-bold">Kelurahan / Unit RW</span>
                <div>Kel. {selectedItem.kelurahan} • RW {selectedItem.rw} RT {selectedItem.rt}</div>
              </div>
              <div>
                <span className="text-slate-400 font-bold">No. Kontak</span>
                <div>{selectedItem.noHp}</div>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-bold">Alamat Lengkap</span>
                <div>{selectedItem.alamat || '-'}</div>
              </div>
            </div>

            {/* Gambar KTP & Pas Foto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Foto KTP Asli</span>
                {selectedItem.fotoKtp ? (
                  <img
                    src={selectedItem.fotoKtp}
                    alt="KTP"
                    className="w-full h-32 object-cover rounded-xl border"
                  />
                ) : (
                  <div className="h-32 flex items-center justify-center text-slate-400 text-xs border border-dashed rounded-xl">
                    KTP Belum Diunggah
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Pas Foto 2x3</span>
                {selectedItem.pasFoto ? (
                  <img
                    src={selectedItem.pasFoto}
                    alt="Pas Foto"
                    className="w-24 h-32 object-cover mx-auto rounded-xl border"
                  />
                ) : (
                  <div className="h-32 flex items-center justify-center text-slate-400 text-xs border border-dashed rounded-xl">
                    Pas Foto Kosong
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t flex gap-2">
              <button
                onClick={() => handleAction(selectedItem.id, 'Diterima')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <CheckCircle size={15} />
                <span>Terima & Terbitkan E-KTA</span>
              </button>
              <button
                onClick={() => handleAction(selectedItem.id, 'Ditolak')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle size={15} />
                <span>Tolak</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW KTA UNTUK ANGGOTA DITERIMA */}
      {viewKta && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl relative border">
            <button
              onClick={() => setViewKta(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
            <div className="text-center mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Kartu Tanda Anggota (E-KTA)
              </h3>
            </div>
            <MembershipCard
              member={{
                id: viewKta.id,
                namaLengkap: viewKta.namaLengkap,
                nik: viewKta.nik,
                jenisKelamin: viewKta.jenisKelamin,
                tempatLahir: viewKta.tempatLahir,
                tanggalLahir: viewKta.tanggalLahir,
                jabatan: 'Anggota',
                noWhatsapp: viewKta.noHp,
                fotoUrl: viewKta.pasFoto,
              }}
              kelurahan={viewKta.kelurahan}
              nomorRw={viewKta.rw}
              onClose={() => setViewKta(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
