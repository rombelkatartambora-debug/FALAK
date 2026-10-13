import React, { useState } from 'react';

interface AlmansuriyahLogoProps {
  className?: string;
  size?: number | string;
}

export const AlmansuriyahLogo: React.FC<AlmansuriyahLogoProps> = ({ 
  className = "w-14 h-14", 
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
        className={`shrink-0 select-none object-contain drop-shadow-md ${className}`}
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
        {/* Outer Gold Gradient */}
        <linearGradient id="almansurOuterGold" x1="20" y1="20" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="25%" stopColor="#eab308" />
          <stop offset="50%" stopColor="#fef9c3" />
          <stop offset="75%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>

        {/* Gold Rim Bevel */}
        <linearGradient id="almansurGoldBevel" x1="220" y1="220" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#713f12" />
          <stop offset="40%" stopColor="#ca8a04" />
          <stop offset="70%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>

        {/* Deep Emerald Celestial Background */}
        <radialGradient id="almansurEmeraldBg" cx="120" cy="120" r="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="50%" stopColor="#022c22" />
          <stop offset="85%" stopColor="#011611" />
          <stop offset="100%" stopColor="#000d0a" />
        </radialGradient>

        {/* Golden Hilal Gradient */}
        <linearGradient id="almansurHilalGold" x1="80" y1="60" x2="160" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#fde047" />
          <stop offset="70%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>

        {/* Astrolabe Brass Gradient */}
        <linearGradient id="almansurAstrolabe" x1="50" y1="50" x2="190" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#ca8a04" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#78350f" stopOpacity="0.7" />
        </linearGradient>

        {/* Drop Shadow */}
        <filter id="almansurShadow" x="0" y="0" width="240" height="240" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.7" />
        </filter>

        <filter id="almansurGlow" x="70" y="50" width="100" height="100" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Outer Metallic Gold Ring */}
      <circle cx="120" cy="120" r="114" fill="url(#almansurOuterGold)" stroke="#3f2e00" strokeWidth="1.5" />
      <circle cx="120" cy="120" r="110" fill="none" stroke="url(#almansurGoldBevel)" strokeWidth="3" />
      <circle cx="120" cy="120" r="106" fill="none" stroke="#1c1917" strokeWidth="1.5" />

      {/* 2. Deep Islamic Emerald Night Sky Background */}
      <circle cx="120" cy="120" r="104" fill="url(#almansurEmeraldBg)" />

      {/* Astrolabe Coordinate Circles and Crosshairs */}
      <circle cx="120" cy="120" r="92" fill="none" stroke="url(#almansurAstrolabe)" strokeWidth="1" strokeDasharray="2 3" />
      <circle cx="120" cy="120" r="76" fill="none" stroke="url(#almansurAstrolabe)" strokeWidth="0.8" strokeDasharray="3 3" />
      <circle cx="120" cy="120" r="58" fill="none" stroke="url(#almansurAstrolabe)" strokeWidth="0.6" />
      
      {/* Coordinate Crosshairs (Bujur & Lintang Markaz) */}
      <line x1="120" y1="28" x2="120" y2="212" stroke="#eab308" strokeWidth="0.7" strokeOpacity="0.4" />
      <line x1="28" y1="120" x2="212" y2="120" stroke="#eab308" strokeWidth="0.7" strokeOpacity="0.4" />
      <line x1="55" y1="55" x2="185" y2="185" stroke="#eab308" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="2 2" />
      <line x1="185" y1="55" x2="55" y2="185" stroke="#eab308" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="2 2" />

      {/* Degree ticks around outer rim */}
      {Array.from({ length: 36 }).map((_, i) => {
        const angle = (i * 10) * (Math.PI / 180);
        const x1 = 120 + 99 * Math.cos(angle);
        const y1 = 120 + 99 * Math.sin(angle);
        const x2 = 120 + (i % 3 === 0 ? 94 : 96) * Math.cos(angle);
        const y2 = 120 + (i % 3 === 0 ? 94 : 96) * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#fde047"
            strokeWidth={i % 3 === 0 ? 1.5 : 0.8}
            strokeOpacity={0.7}
          />
        );
      })}

      {/* Small Stars in Celestial Sphere */}
      <circle cx="80" cy="70" r="1.2" fill="#ffffff" opacity="0.8" />
      <circle cx="160" cy="65" r="1.5" fill="#fef08a" opacity="0.9" />
      <circle cx="70" cy="155" r="1" fill="#ffffff" opacity="0.7" />
      <circle cx="165" cy="150" r="1.2" fill="#fef08a" opacity="0.8" />
      <circle cx="140" cy="175" r="1" fill="#ffffff" opacity="0.6" />
      <circle cx="95" cy="175" r="0.9" fill="#fef08a" opacity="0.7" />

      {/* 3. Golden Crescent Moon (Hilal Falakiyah) */}
      <g filter="url(#almansurShadow)">
        {/* Crescent Moon */}
        <path
          d="M 125 58 
             C 78 58 48 95 48 135 
             C 48 175 78 202 120 202
             C 92 190 74 165 74 135
             C 74 102 96 74 125 58
             Z"
          fill="url(#almansurHilalGold)"
          stroke="#fef08a"
          strokeWidth="1.2"
        />

        {/* Inner Luminous Hilal Edge */}
        <path
          d="M 122 62
             C 95 76 77 104 77 135
             C 77 162 93 186 117 197
             C 88 185 70 162 70 135
             C 70 102 92 76 122 62
             Z"
          fill="#ffffff"
          opacity="0.3"
        />

        {/* 4. Islamic 8-Pointed Star (Rub El Hizb / Bintang Falak) with Glowing Center */}
        <g transform="translate(136, 105) scale(0.9)" filter="url(#almansurGlow)">
          {/* Square 1 */}
          <rect
            x="-18"
            y="-18"
            width="36"
            height="36"
            fill="url(#almansurHilalGold)"
            stroke="#fde047"
            strokeWidth="1"
            rx="2"
          />
          {/* Square 2 (Rotated 45 deg) */}
          <rect
            x="-18"
            y="-18"
            width="36"
            height="36"
            transform="rotate(45)"
            fill="url(#almansurHilalGold)"
            stroke="#fde047"
            strokeWidth="1"
            rx="2"
          />
          {/* Inner Central Star Core */}
          <circle cx="0" cy="0" r="8" fill="#022c22" stroke="#fef08a" strokeWidth="1" />
          <circle cx="0" cy="0" r="4.5" fill="#fef08a" />
        </g>

        {/* 5. Center Calligraphic Banner: "AL-MANSURIYAH" / "سُلَّم النَّيِّرَيْن" */}
        <g transform="translate(120, 158)">
          {/* Ribbon Background */}
          <rect
            x="-72"
            y="-13"
            width="144"
            height="26"
            rx="6"
            fill="#022c22"
            stroke="url(#almansurOuterGold)"
            strokeWidth="1.5"
          />
          {/* Text: ALMANSURIYAH */}
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fill="#fef08a"
            fontSize="10.5"
            fontWeight="900"
            letterSpacing="2"
            fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
          >
            ALMANSURIYAH
          </text>
        </g>

        {/* Lower Banner: SULLAMUN NAYYIRAIN */}
        <g transform="translate(120, 180)">
          <text
            x="0"
            y="2"
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="7"
            fontWeight="700"
            letterSpacing="1"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            ★ SULLAMUN NAYYIRAIN ★
          </text>
        </g>
      </g>
    </svg>
  );
};
