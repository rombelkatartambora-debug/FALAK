import React from 'react';

interface CrescentVisualizerProps {
  phaseFraction: number; // 0 (New Moon) to 1 (Full Moon)
  elongationDeg: number;
  crescentWidthArcMin: number;
  orientationName: string;
  positionAngleLimbDeg: number;
}

export const CrescentVisualizer: React.FC<CrescentVisualizerProps> = ({
  phaseFraction,
  elongationDeg,
  crescentWidthArcMin,
  orientationName,
  positionAngleLimbDeg
}) => {
  const r = 50; // Radius piringan bulan dalam SVG
  const cx = 70;
  const cy = 70;

  // Nilai k = phaseFraction (0 = gelap gulita, 1 = purnama)
  // Untuk fase sabit muda (0 < k < 0.5):
  // Lebar sabit w_norm = 2 * r * k
  // Kelengkungan terminator: r_x = r * (1 - 2*k)
  const k = Math.max(0.01, Math.min(0.99, phaseFraction));
  const rx = Math.abs(r * (1 - 2 * k));
  const sweepFlag = k <= 0.5 ? 0 : 1;

  // Path SVG untuk Sabit Bulan:
  // Busur terang (Limb) selalu setengah lingkaran dari kutub atas (cx, cy - r) ke kutub bawah (cx, cy + r)
  // Terminator adalah elips yang menghubungkan kedua kutub tersebut
  const dPath = `M ${cx} ${cy - r} 
                 A ${r} ${r} 0 0 1 ${cx} ${cy + r} 
                 A ${rx} ${r} 0 0 ${sweepFlag} ${cx} ${cy - r} Z`;

  return (
    <div className="flex flex-col items-center p-4 bg-stone-900 border border-stone-800 rounded-2xl">
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
          Visualisasi Bentuk Hilal
        </span>
        <span className="text-[10px] font-mono text-stone-400">
          K = {(phaseFraction * 100).toFixed(1)}%
        </span>
      </div>

      {/* SVG Canvas dengan rotasi orientasi kemiringan sabit */}
      <div className="relative w-36 h-36 flex items-center justify-center my-1 select-none">
        <svg
          viewBox="0 0 140 140"
          className="w-full h-full drop-shadow-lg"
          style={{ transform: `rotate(${positionAngleLimbDeg}deg)` }}
        >
          {/* Piringan gelap bulan */}
          <circle cx={cx} cy={cy} r={r} fill="#111827" stroke="#374151" strokeWidth="1" />

          {/* Bagian sabit terang yang disinari matahari */}
          <path d={dPath} fill="#fef08a" stroke="#fef9c3" strokeWidth="1" filter="drop-shadow(0 0 4px #eab308)" />

          {/* Garis Ufuk Simulasi saat Ghurub */}
          <line x1="10" y1="125" x2="130" y2="125" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      </div>

      <div className="w-full mt-2 space-y-1.5 text-[11px] bg-stone-950/70 p-2.5 rounded-xl border border-stone-800">
        <div className="flex justify-between">
          <span className="text-stone-400">Elongasi ():</span>
          <span className="font-mono font-bold text-white">{elongationDeg.toFixed(2)}°</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Lebar Sabit (W):</span>
          <span className="font-mono font-bold text-amber-400">{crescentWidthArcMin.toFixed(2)}'</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Orientasi Hilal:</span>
          <span className="font-semibold text-cyan-300">{orientationName}</span>
        </div>
      </div>
    </div>
  );
};
