import React, { useState } from 'react';
import {
  UserPlus,
  ShieldCheck,
  MapPin,
  Upload,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileCheck,
} from 'lucide-react';
import { PendaftaranAnggota, KelurahanName, JenisKelamin } from '../types';
import { DAFTAR_KELURAHAN_TAMBORA, MAP_WILAYAH_TAMBORA, BIDANG_KEGIATAN_KATAR } from '../data/wilayah';
import { submitPendaftaran } from '../services/storage';

interface RegistrationViewProps {
  onSuccess: () => void;
}

export const RegistrationView: React.FC<RegistrationViewProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    namaLengkap: '',
    nik: '',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2002-05-15',
    jenisKelamin: 'Laki-laki' as JenisKelamin,
    alamat: '',
    kelurahan: 'PEKOJAN' as KelurahanName,
    rw: '001',
    rt: '001',
    noHp: '',
    email: '',
    pekerjaan: 'Wiraswasta / Mahasiswa',
    minatBidang: BIDANG_KEGIATAN_KATAR[0],
    fotoKtp: '',
    pasFoto: '',
  });

  const rwOptions = MAP_WILAYAH_TAMBORA[formData.kelurahan] || ['001'];

  const handleKtpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, fotoKtp: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, pasFoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReg: PendaftaranAnggota = {
      id: `REG-${Date.now()}`,
      namaLengkap: formData.namaLengkap || 'Calon Anggota',
      nik: formData.nik || '3173000000000000',
      tempatLahir: formData.tempatLahir,
      tanggalLahir: formData.tanggalLahir,
      jenisKelamin: formData.jenisKelamin,
      alamat: formData.alamat,
      kelurahan: formData.kelurahan,
      rw: formData.rw,
      rt: formData.rt,
      noHp: formData.noHp,
      email: formData.email,
      pekerjaan: formData.pekerjaan,
      minatBidang: formData.minatBidang,
      fotoKtp: formData.fotoKtp,
      pasFoto: formData.pasFoto,
      status: 'Pending',
      waktuDaftar: new Date().toLocaleString('id-ID'),
    };

    submitPendaftaran(newReg);
    setIsSubmitted(true);
    onSuccess();
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto my-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle size={36} />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          Pendaftaran Berhasil Dikirim!
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Terima kasih <strong>{formData.namaLengkap}</strong>. Berkas pendaftaran anggota Karang
          Taruna Unit RW {formData.rw} Kelurahan {formData.kelurahan} telah masuk ke sistem dan sedang
          menunggu verifikasi oleh Admin Kecamatan Tambora.
        </p>

        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs text-slate-600 dark:text-slate-300 font-mono">
          Nomor Registrasi: <strong>KT-TB-{formData.nik.slice(-4) || '9921'}</strong>
        </div>

        <button
          onClick={() => {
            setIsSubmitted(false);
            setStep(1);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs"
        >
          Daftarkan Anggota Lain
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-black uppercase">
          <UserPlus size={14} /> E-KTA REGISTRATION PORTAL
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Pendaftaran Anggota Karang Taruna Tambora
        </h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Terbuka untuk seluruh pemuda dan pemudi berusia 13 s.d 45 tahun yang berdomisili di 11 Kelurahan se-Kecamatan Tambora, Jakarta Barat.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-3">
        {[
          { num: 1, label: '1. Identitas Diri' },
          { num: 2, label: '2. Domisili Tambora' },
          { num: 3, label: '3. Berkas & Minat' },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              step >= s.num
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
              {s.num}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step Form Box */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        {/* STEP 1: IDENTITAS */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2">
              <ShieldCheck className="text-blue-600" size={18} />
              <span>Informasi Kependudukan & Kontak</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Nama Lengkap Sesuai KTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaLengkap}
                  onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                  placeholder="Masukkan nama lengkap Anda..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  NIK (16 Digit Kependudukan) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  value={formData.nik}
                  onChange={(e) =>
                    setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })
                  }
                  placeholder="3173xxxxxxxxxxxx"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Jenis Kelamin
                </label>
                <select
                  value={formData.jenisKelamin}
                  onChange={(e) =>
                    setFormData({ ...formData, jenisKelamin: e.target.value as JenisKelamin })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  value={formData.tempatLahir}
                  onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={formData.tanggalLahir}
                  onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  No. WhatsApp Aktif <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.noHp}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  placeholder="0812xxxxxxxx"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nama@email.com"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!formData.namaLengkap || formData.nik.length !== 16}
                className="bg-blue-600 disabled:opacity-50 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Lanjut ke Domisili</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DOMISILI */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2">
              <MapPin className="text-red-500" size={18} />
              <span>Domisili Wilayah Kecamatan Tambora</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Kelurahan (Tambora) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.kelurahan}
                  onChange={(e) => {
                    const k = e.target.value as KelurahanName;
                    setFormData({
                      ...formData,
                      kelurahan: k,
                      rw: MAP_WILAYAH_TAMBORA[k][0],
                    });
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  {DAFTAR_KELURAHAN_TAMBORA.map((k) => (
                    <option key={k} value={k}>
                      Kel. {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Unit RW <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.rw}
                  onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold"
                >
                  {rwOptions.map((rw) => (
                    <option key={rw} value={rw}>
                      RW {rw}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  RT
                </label>
                <input
                  type="text"
                  value={formData.rt}
                  onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                  placeholder="005"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Alamat Lengkap Sesuai KTP / Domisili
                </label>
                <textarea
                  rows={2}
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Jl. Tubagus Angke No. xx, RT xx / RW xx..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Pekerjaan / Aktivitas
                </label>
                <input
                  type="text"
                  value={formData.pekerjaan}
                  onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                  placeholder="Contoh: Karyawan Swasta / Mahasiswa / Wirausaha"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={15} />
                <span>Kembali</span>
              </button>

              <button
                onClick={() => setStep(3)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Lanjut Upload Berkas</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BERKAS DIGITAL & MINAT */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2">
              <Upload className="text-emerald-600" size={18} />
              <span>Verifikasi Berkas KTP & Minat Bidang</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Minat Bidang Pengembangan Karang Taruna
                </label>
                <select
                  value={formData.minatBidang}
                  onChange={(e) => setFormData({ ...formData, minatBidang: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-blue-600"
                >
                  {BIDANG_KEGIATAN_KATAR.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Foto KTP & Pas Foto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                  <div className="font-bold text-slate-700 dark:text-slate-300">
                    Foto KTP Asli / Suket
                  </div>
                  {formData.fotoKtp ? (
                    <img
                      src={formData.fotoKtp}
                      alt="KTP"
                      className="w-36 h-24 object-cover mx-auto rounded-lg border shadow-xs"
                    />
                  ) : (
                    <div className="h-20 flex items-center justify-center text-slate-400 text-xs">
                      Pilih file foto KTP Anda
                    </div>
                  )}
                  <label className="inline-block px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-700">
                    Pilih Foto KTP
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleKtpUpload}
                    />
                  </label>
                </div>

                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                  <div className="font-bold text-slate-700 dark:text-slate-300">
                    Pas Foto Anggota (2x3)
                  </div>
                  {formData.pasFoto ? (
                    <img
                      src={formData.pasFoto}
                      alt="Pas Foto"
                      className="w-20 h-24 object-cover mx-auto rounded-lg border shadow-xs"
                    />
                  ) : (
                    <div className="h-20 flex items-center justify-center text-slate-400 text-xs">
                      Pilih foto untuk E-KTA
                    </div>
                  )}
                  <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-700">
                    Pilih Pas Foto
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePasFotoUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed">
                * Dengan mengirimkan formulir ini, saya menyatakan bahwa data yang diisi adalah benar
                dan bersedia mematuhi AD/ART Karang Taruna serta siap berkontribusi memajukan wilayah
                Kecamatan Tambora.
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={15} />
                <span>Kembali</span>
              </button>

              <button
                onClick={handleSubmit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <CheckCircle size={16} />
                <span>KIRIM PENDAFTARAN ANGGOTA</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
