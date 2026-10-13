import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Printer,
  Download,
  Filter,
  User,
  Shield,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { UnitRWProfile, BiodataPengurus, KelurahanName } from '../types';
import { DAFTAR_KELURAHAN_TAMBORA } from '../data/wilayah';
import { MembershipCard } from './MembershipCard';

interface KtaListViewProps {
  ukktList: UnitRWProfile[];
}

export const KtaListView: React.FC<KtaListViewProps> = ({ ukktList }) => {
  const [filterKel, setFilterKel] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedForCard, setSelectedForCard] = useState<{
    member: BiodataPengurus;
    kelurahan: string;
    rw: string;
  } | null>(null);

  // Flatten all members across UKKTs
  const allMembers: Array<{
    member: BiodataPengurus;
    kelurahan: string;
    rw: string;
    nomorSk: string;
  }> = [];

  ukktList.forEach((unit) => {
    if (unit.pengurus.ketua && unit.pengurus.ketua.namaLengkap) {
      allMembers.push({
        member: unit.pengurus.ketua,
        kelurahan: unit.kelurahan,
        rw: unit.nomorRw,
        nomorSk: unit.nomorSk,
      });
    }
    if (unit.pengurus.sekretaris && unit.pengurus.sekretaris.namaLengkap) {
      allMembers.push({
        member: unit.pengurus.sekretaris,
        kelurahan: unit.kelurahan,
        rw: unit.nomorRw,
        nomorSk: unit.nomorSk,
      });
    }
    if (unit.pengurus.bendahara && unit.pengurus.bendahara.namaLengkap) {
      allMembers.push({
        member: unit.pengurus.bendahara,
        kelurahan: unit.kelurahan,
        rw: unit.nomorRw,
        nomorSk: unit.nomorSk,
      });
    }
    if (unit.pengurus.lainnya) {
      unit.pengurus.lainnya.forEach((m) => {
        allMembers.push({
          member: m,
          kelurahan: unit.kelurahan,
          rw: unit.nomorRw,
          nomorSk: unit.nomorSk,
        });
      });
    }
  });

  const filtered = allMembers.filter((item) => {
    const matchKel = filterKel === 'Semua' || item.kelurahan === filterKel;
    const matchSearch =
      item.member.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.member.nik.includes(searchTerm) ||
      item.rw.includes(searchTerm);
    return matchKel && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-black uppercase">
              PORTAL E-KTA RESMI
            </span>
            <span className="text-xs text-slate-500 font-medium">Digital Identity Karang Taruna</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
            Kartu Tanda Anggota (E-KTA) Digital Pemuda Tambora
          </h1>
          <p className="text-xs text-slate-500">
            Diterbitkan dengan QR Code verifikasi, standar warna biru & merah Karang Taruna DKI Jakarta.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-950 px-4 py-2 rounded-2xl">
          <CreditCard size={16} />
          <span>{allMembers.length} KTA Terdaftar</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama pengurus, NIK 16 digit, atau nomor RW..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
          />
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={filterKel}
            onChange={(e) => setFilterKel(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold"
          >
            <option value="Semua">Semua 11 Kelurahan</option>
            {DAFTAR_KELURAHAN_TAMBORA.map((k) => (
              <option key={k} value={k}>
                Kel. {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, idx) => (
          <div
            key={`${item.member.id}-${idx}`}
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span
                  className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md ${
                    item.member.jabatan === 'Ketua'
                      ? 'bg-red-100 text-red-700'
                      : item.member.jabatan === 'Sekretaris'
                      ? 'bg-blue-100 text-blue-700'
                      : item.member.jabatan === 'Bendahara'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.member.jabatan}
                </span>

                <span className="text-[10px] font-bold text-slate-400">
                  RW {item.rw}
                </span>
              </div>

              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase leading-snug">
                  {item.member.namaLengkap}
                </h3>
                <div className="font-mono text-[10.5px] text-slate-500 mt-0.5">
                  NIK: {item.member.nik || '-'}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                <MapPin size={12} className="text-red-500" />
                <span>UKKT RW {item.rw} • Kel. {item.kelurahan}</span>
              </div>
            </div>

            <button
              onClick={() =>
                setSelectedForCard({
                  member: item.member,
                  kelurahan: item.kelurahan,
                  rw: item.rw,
                })
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <CreditCard size={14} />
              <span>Cetak E-KTA Digital</span>
            </button>
          </div>
        ))}
      </div>

      {/* Modal Preview KTA */}
      {selectedForCard && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl relative border">
            <MembershipCard
              member={selectedForCard.member}
              kelurahan={selectedForCard.kelurahan}
              nomorRw={selectedForCard.rw}
              onClose={() => setSelectedForCard(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
