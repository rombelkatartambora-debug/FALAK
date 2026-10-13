import React, { useState } from 'react';

interface RbiLogoProps {
  className?: string;
  size?: number | string;
}

export const RbiLogo: React.FC<RbiLogoProps> = ({ 
  className = "w-10 h-10", 
  size 
}) => {
  const [hasError, setHasError] = useState(false);
  const style = size ? { width: size, height: size } : undefined;

  if (!hasError) {
    return (
      <img
        src="/logo.png"
        alt="Logo Lembaga Hisab Falakiyah Almansuriyah"
        onError={() => setHasError(true)}
        className={`shrink-0 select-none object-contain rounded-full drop-shadow-sm ${className}`}
        style={style}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={style}
    >
      <defs>
        {/* Outer Silver Ring Gradient */}
        <linearGradient id="rbiOuterSilver" x1="20" y1="20" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="25%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="75%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>

        {/* Silver Bevel Rim Gradient */}
        <linearGradient id="rbiRimBevel" x1="220" y1="220" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="40%" stopColor="#cbd5e1" />
          <stop offset="70%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Navy Background Gradient */}
        <radialGradient id="rbiNavyBg" cx="120" cy="120" r="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0c192e" />
          <stop offset="65%" stopColor="#071120" />
          <stop offset="100%" stopColor="#040913" />
        </radialGradient>

        {/* Chrome Metallic Letter Gradient */}
        <linearGradient id="rbiChromeLetters" x1="40" y1="40" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="20%" stopColor="#cbd5e1" />
          <stop offset="45%" stopColor="#f1f5f9" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="90%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Letter Bevel Highlight */}
        <linearGradient id="rbiChromeHighlight" x1="50" y1="50" x2="190" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
        </linearGradient>

        {/* Flame Ruby 3D Gradient */}
        <radialGradient id="rbiFlameCore" cx="180" cy="55" r="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff4d4d" />
          <stop offset="35%" stopColor="#dc2626" />
          <stop offset="70%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#450a0a" />
        </radialGradient>

        {/* Flame Specular Highlight */}
        <linearGradient id="rbiFlameGloss" x1="160" y1="30" x2="195" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="30%" stopColor="#fca5a5" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
        </linearGradient>

        {/* Flame Glow Filter */}
        <filter id="rbiFlameGlow" x="140" y="10" width="85" height="100" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Metallic Bevel Shadow */}
        <filter id="rbiDropShadow" x="0" y="0" width="240" height="240" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* 1. Outer Metallic Chrome Ring */}
      <circle cx="120" cy="120" r="114" fill="url(#rbiOuterSilver)" stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="120" cy="120" r="111" fill="none" stroke="url(#rbiRimBevel)" strokeWidth="3" />
      <circle cx="120" cy="120" r="108" fill="none" stroke="#000000" strokeWidth="1.5" strokeOpacity="0.5" />

      {/* 2. Deep Midnight Navy Background */}
      <circle cx="120" cy="120" r="105" fill="url(#rbiNavyBg)" />
      
      {/* Inner Circular Guide Rim */}
      <circle cx="120" cy="120" r="104" fill="none" stroke="#334155" strokeWidth="1" strokeOpacity="0.6" />

      {/* 3. Interlocking Stylized Letters "R B I" in Chrome Metallic */}
      <g filter="url(#rbiDropShadow)">
        {/* LETTER R - Left Stem and Upper Loop intertwining with B and sweeping cradle */}
        {/* Left vertical bar of R */}
        <path
          d="M 44 68 
             L 54 68 
             L 54 115 
             Q 54 185 106 185 
             Q 138 185 152 165
             L 152 178
             Q 135 200 106 200 
             Q 40 200 40 115 
             Z"
          fill="url(#rbiChromeLetters)"
          stroke="url(#rbiChromeHighlight)"
          strokeWidth="1.5"
        />

        {/* Upper loop of R bridging over into B */}
        <path
          d="M 44 70
             Q 44 48 80 48
             Q 104 48 104 68
             Q 104 88 80 88
             L 54 88
             L 54 74
             L 78 74
             Q 90 74 90 68
             Q 90 62 78 62
             Q 58 62 58 70
             Z"
          fill="url(#rbiChromeLetters)"
          stroke="url(#rbiChromeHighlight)"
          strokeWidth="1.5"
        />

        {/* Central Interlocking Cross-Ribbon: R connecting into B's Waist */}
        <path
          d="M 76 84
             C 86 84 94 96 104 116
             C 112 132 120 144 134 144
             L 134 156
             C 114 156 102 140 92 120
             C 84 104 78 96 66 96
             Z"
          fill="url(#rbiChromeLetters)"
          stroke="url(#rbiChromeHighlight)"
          strokeWidth="1.2"
        />

        {/* LETTER B - Two Stacked Bowls in Silver Ribbon */}
        {/* Top Bowl of B */}
        <path
          d="M 100 88
             C 100 68 116 68 136 68
             C 152 68 160 80 160 94
             C 160 106 150 114 136 116
             L 124 116
             C 138 114 146 106 146 94
             C 146 84 138 78 126 78
             C 114 78 110 82 108 88
             Z"
          fill="url(#rbiChromeLetters)"
          stroke="url(#rbiChromeHighlight)"
          strokeWidth="1.5"
        />

        {/* Bottom Bowl of B */}
        <path
          d="M 112 114
             C 126 114 144 116 156 126
             C 168 136 168 154 154 168
             C 142 178 124 180 108 180
             L 108 168
             C 120 168 134 166 144 158
             C 152 150 152 140 144 132
             C 136 126 124 124 112 124
             Z"
          fill="url(#rbiChromeLetters)"
          stroke="url(#rbiChromeHighlight)"
          strokeWidth="1.5"
        />

        {/* LETTER I - Right Upright Pillar / Candle Base */}
        <path
          d="M 174 94
             L 186 94
             C 186 125 186 160 186 182
             C 186 195 180 200 170 202
             L 168 190
             C 174 188 174 182 174 172
             Z"
          fill="url(#rbiChromeLetters)"
          stroke="url(#rbiChromeHighlight)"
          strokeWidth="1.5"
        />

        {/* Torch / Candle Collar Top under Flame */}
        <path
          d="M 170 92
             C 170 88 190 88 190 92
             L 188 95
             L 172 95
             Z"
          fill="url(#rbiChromeLetters)"
          stroke="url(#rbiChromeHighlight)"
          strokeWidth="1"
        />
      </g>

      {/* 4. Vivid 3D Ruby-Red Torch Flame sitting on top of the "I" */}
      <g filter="url(#rbiFlameGlow)">
        {/* Main Flame Body */}
        <path
          d="M 180 90
             C 172 88 166 76 166 62
             C 166 42 176 30 186 22
             C 184 32 188 40 196 46
             C 204 52 208 64 206 74
             C 204 84 194 91 180 90
             Z"
          fill="url(#rbiFlameCore)"
          stroke="#ef4444"
          strokeWidth="1"
        />

        {/* Inner Luminous Core */}
        <path
          d="M 180 84
             C 175 82 172 74 172 65
             C 172 52 179 40 186 32
             C 185 38 188 44 193 48
             C 198 54 200 62 199 69
             C 197 76 190 82 180 84
             Z"
          fill="#ff2222"
          opacity="0.85"
        />

        {/* Glossy White / Golden Specular Highlight */}
        <path
          d="M 176 65
             C 175 52 180 38 186 30
             C 184 36 186 44 190 48
             C 184 48 178 55 176 65
             Z"
          fill="url(#rbiFlameGloss)"
        />
      </g>
    </svg>
  );
};
