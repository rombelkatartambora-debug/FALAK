import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Sun, 
  Moon, 
  Rotate3d, 
  Compass, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Eye, 
  Sparkles,
  Move3d,
  Crosshair,
  Clock
} from 'lucide-react';
import { SolarSystemEphemeris } from '../utils/astronomyMath';

interface CelestialSkyDomeProps {
  ephemeris: SolarSystemEphemeris;
  observerName: string;
  viewMode?: '3d_dome' | '2d_radar' | 'telescope';
  onViewModeChange?: (mode: '3d_dome' | '2d_radar' | 'telescope') => void;
  currentDate?: Date;
}

export const CelestialSkyDome: React.FC<CelestialSkyDomeProps> = ({ 
  ephemeris, 
  observerName,
  viewMode = '3d_dome',
  onViewModeChange,
  currentDate = new Date()
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 3D Camera Controls State (Yaw and Pitch in degrees)
  const [cameraYaw, setCameraYaw] = useState<number>(270); // Looking towards West (270°) by default for Hilal sunset!
  const [cameraPitch, setCameraPitch] = useState<number>(25); // 25° above horizon
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeMode, setActiveMode] = useState<'3d_dome' | '2d_radar' | 'telescope'>(viewMode);

  useEffect(() => {
    if (viewMode) {
      setActiveMode(viewMode);
    }
  }, [viewMode]);

  const handleModeChange = (mode: '3d_dome' | '2d_radar' | 'telescope') => {
    setActiveMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  const { sun, moon, elongationDeg, moonPhaseFraction, moonPhaseName, crescentWidthArcMin } = ephemeris;

  // Pre-generate stars for realistic background
  const stars = useMemo(() => {
    const starList: Array<{ az: number; alt: number; size: number; alpha: number }> = [];
    // Seeded random distribution across the hemisphere
    for (let i = 0; i < 220; i++) {
      const az = (i * 137.5) % 360;
      const alt = Math.sqrt((i + 1) / 220) * 88; // denser near horizon and spread to zenith
      const size = (i % 5 === 0) ? 2.2 : (i % 3 === 0) ? 1.5 : 1.0;
      const alpha = 0.4 + (Math.sin(i * 11) * 0.3 + 0.3);
      starList.push({ az, alt, size, alpha });
    }
    return starList;
  }, []);

  // Mouse / Touch Handlers for 3D Camera Orbit
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    setCameraYaw((prev) => (prev - deltaX * 0.5 + 360) % 360);
    setCameraPitch((prev) => Math.max(5, Math.min(85, prev + deltaY * 0.3)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStart.x;
    const deltaY = e.touches[0].clientY - dragStart.y;
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });

    setCameraYaw((prev) => (prev - deltaX * 0.6 + 360) % 360);
    setCameraPitch((prev) => Math.max(5, Math.min(85, prev + deltaY * 0.4)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Convert horizontal coordinate (Azimuth, Altitude) to 3D Cartesian (Unit sphere)
  const horizontalToCartesian = useCallback((azDeg: number, altDeg: number, radius: number) => {
    const azRad = (azDeg * Math.PI) / 180;
    const altRad = (altDeg * Math.PI) / 180;

    // Standard astronomical orientation:
    // X = East (+), -X = West (-)
    // Y = Altitude up (+)
    // Z = North (+), -Z = South (-)
    const cosAlt = Math.cos(altRad);
    const x = radius * cosAlt * Math.sin(azRad);
    const y = radius * Math.sin(altRad);
    const z = radius * cosAlt * Math.cos(azRad);

    return { x, y, z };
  }, []);

  // 3D Perspective Projection to 2D Canvas Screen
  const project3D = useCallback((
    pos3D: { x: number; y: number; z: number }, 
    centerX: number, 
    centerY: number, 
    fov: number,
    yawDeg: number,
    pitchDeg: number
  ) => {
    // 1. Rotate around Y axis (Yaw)
    const yawRad = (yawDeg * Math.PI) / 180;
    const cosYaw = Math.cos(yawRad);
    const sinYaw = Math.sin(yawRad);

    const x1 = pos3D.x * cosYaw - pos3D.z * sinYaw;
    const y1 = pos3D.y;
    const z1 = pos3D.x * sinYaw + pos3D.z * cosYaw;

    // 2. Rotate around X axis (Pitch)
    const pitchRad = (pitchDeg * Math.PI) / 180;
    const cosPitch = Math.cos(pitchRad);
    const sinPitch = Math.sin(pitchRad);

    const x2 = x1;
    const y2 = y1 * cosPitch - z1 * sinPitch;
    const z2 = y1 * sinPitch + z1 * cosPitch;

    // 3. Camera distance & perspective
    const cameraDist = 420;
    const depth = cameraDist + z2;

    if (depth <= 20) return null; // Behind camera clipping

    const scale = (fov / depth) * zoom;
    const screenX = centerX + x2 * scale;
    const screenY = centerY - y2 * scale; // Invert Y for screen coordinates

    return { screenX, screenY, scale, zDepth: z2 };
  }, [zoom]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI resolution
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2 + 30; // slightly lower center for sky dominance

    ctx.clearRect(0, 0, w, h);

    // -------------------------------------------------------------
    // MODE 1: 3D CELESTIAL HORIZON DOME (Kubah Langit 3D Interaktif)
    // -------------------------------------------------------------
    if (activeMode === '3d_dome') {
      const domeRadius = Math.min(w, h) * 0.52;
      const fov = 400;

      // Determine sky atmosphere tone based on Sun Altitude
      const sunAlt = sun.altitudeApparent;
      let skyGrad = ctx.createLinearGradient(0, 0, 0, h);

      if (sunAlt > 10) {
        // Bright Daylight
        skyGrad.addColorStop(0, '#0284c7'); // Sky blue zenith
        skyGrad.addColorStop(0.6, '#38bdf8');
        skyGrad.addColorStop(1, '#bae6fd'); // Pale horizon
      } else if (sunAlt > -2) {
        // Golden Twilight / Sunset (Waktu Rukyat Hilal!)
        skyGrad.addColorStop(0, '#0f172a'); // Dark twilight upper
        skyGrad.addColorStop(0.4, '#431407'); // Deep ember
        skyGrad.addColorStop(0.7, '#ea580c'); // Sunset orange
        skyGrad.addColorStop(1, '#fde047'); // Glowing horizon gold
      } else if (sunAlt > -12) {
        // Deep Dusk / Nautical Twilight
        skyGrad.addColorStop(0, '#030712');
        skyGrad.addColorStop(0.5, '#0f172a');
        skyGrad.addColorStop(0.85, '#1e1b4b');
        skyGrad.addColorStop(1, '#c2410c'); // Horizon residual glow
      } else {
        // Night Sky
        skyGrad.addColorStop(0, '#020617'); // Pitch dark zenith
        skyGrad.addColorStop(0.7, '#090d16');
        skyGrad.addColorStop(1, '#0f172a'); // Subtle horizon haze
      }

      // Draw Sky Background
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw Stars if sun is low enough
      if (sunAlt < 5) {
        const starBrightness = Math.min(1, Math.max(0, (5 - sunAlt) / 12));
        stars.forEach((star) => {
          const pt3D = horizontalToCartesian(star.az, star.alt, domeRadius);
          const p = project3D(pt3D, cx, cy, fov, cameraYaw, cameraPitch);
          if (p) {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * starBrightness})`;
            ctx.beginPath();
            ctx.arc(p.screenX, p.screenY, star.size, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // Draw 3D Celestial Grid (Altitude Arcs & Cardinal Meridians)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;

      // Altitude Rings (30°, 60°)
      [30, 60].forEach((alt) => {
        ctx.beginPath();
        let first = true;
        for (let az = 0; az <= 360; az += 10) {
          const pt3D = horizontalToCartesian(az, alt, domeRadius);
          const p = project3D(pt3D, cx, cy, fov, cameraYaw, cameraPitch);
          if (p) {
            if (first) {
              ctx.moveTo(p.screenX, p.screenY);
              first = false;
            } else {
              ctx.lineTo(p.screenX, p.screenY);
            }
          }
        }
        ctx.stroke();
      });

      // Cardinal Vertical Meridians (U, T, S, B arcs to Zenith)
      [0, 90, 180, 270].forEach((az) => {
        ctx.beginPath();
        let first = true;
        for (let alt = 0; alt <= 90; alt += 5) {
          const pt3D = horizontalToCartesian(az, alt, domeRadius);
          const p = project3D(pt3D, cx, cy, fov, cameraYaw, cameraPitch);
          if (p) {
            if (first) {
              ctx.moveTo(p.screenX, p.screenY);
              first = false;
            } else {
              ctx.lineTo(p.screenX, p.screenY);
            }
          }
        }
        ctx.stroke();
      });

      // 3D Zenith Point (90°)
      const zenith3D = horizontalToCartesian(0, 90, domeRadius);
      const zenithProj = project3D(zenith3D, cx, cy, fov, cameraYaw, cameraPitch);
      if (zenithProj) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(zenithProj.screenX, zenithProj.screenY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '10px sans-serif';
        ctx.fillText('Zenith (90°)', zenithProj.screenX + 6, zenithProj.screenY - 2);
      }

      // Draw Horizon Disc (Altitude 0°) & Ground Terrain Plane
      ctx.beginPath();
      let firstH = true;
      const horizonPts: Array<{ x: number; y: number }> = [];
      for (let az = 0; az <= 360; az += 5) {
        const pt3D = horizontalToCartesian(az, 0, domeRadius);
        const p = project3D(pt3D, cx, cy, fov, cameraYaw, cameraPitch);
        if (p) {
          horizonPts.push({ x: p.screenX, y: p.screenY });
          if (firstH) {
            ctx.moveTo(p.screenX, p.screenY);
            firstH = false;
          } else {
            ctx.lineTo(p.screenX, p.screenY);
          }
        }
      }
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Ground Shading (Bumi di bawah ufuk)
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      const groundGrad = ctx.createLinearGradient(0, cy, 0, h);
      groundGrad.addColorStop(0, '#09131d');
      groundGrad.addColorStop(1, '#020617');
      ctx.fillStyle = groundGrad;
      ctx.fill();

      // Cardinal Direction Markers on Horizon (U, TL, T, TG, S, BD, B, BL)
      const cardinalMarkers = [
        { label: 'U (0°)', az: 0, color: '#ef4444' },
        { label: 'T (90°)', az: 90, color: '#38bdf8' },
        { label: 'S (180°)', az: 180, color: '#e2e8f0' },
        { label: 'B (270°)', az: 270, color: '#fbbf24' }
      ];

      cardinalMarkers.forEach((m) => {
        const pt3D = horizontalToCartesian(m.az, 0, domeRadius);
        const p = project3D(pt3D, cx, cy, fov, cameraYaw, cameraPitch);
        if (p) {
          // Marker pin
          ctx.fillStyle = m.color;
          ctx.beginPath();
          ctx.arc(p.screenX, p.screenY, 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(m.label, p.screenX, p.screenY + 16);
        }
      });

      // -----------------------------------------------------------
      // RENDER 3D SUN (MATAHARI)
      // -----------------------------------------------------------
      const sun3D = horizontalToCartesian(sun.azimuth, sun.altitudeApparent, domeRadius);
      const sunProj = project3D(sun3D, cx, cy, fov, cameraYaw, cameraPitch);

      if (sunProj) {
        const isSunAbove = sun.altitudeApparent >= 0;

        // Altitude projection line down to horizon
        const sunGround3D = horizontalToCartesian(sun.azimuth, 0, domeRadius);
        const sunGroundProj = project3D(sunGround3D, cx, cy, fov, cameraYaw, cameraPitch);
        if (sunGroundProj) {
          ctx.strokeStyle = isSunAbove ? 'rgba(245, 158, 11, 0.4)' : 'rgba(120, 53, 15, 0.2)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(sunProj.screenX, sunProj.screenY);
          ctx.lineTo(sunGroundProj.screenX, sunGroundProj.screenY);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Sun Glow & Flare
        const glowGrad = ctx.createRadialGradient(
          sunProj.screenX, sunProj.screenY, 2,
          sunProj.screenX, sunProj.screenY, 28 * sunProj.scale
        );
        glowGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
        glowGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.6)');
        glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(sunProj.screenX, sunProj.screenY, 28 * sunProj.scale, 0, Math.PI * 2);
        ctx.fill();

        // Sun Core
        ctx.fillStyle = isSunAbove ? '#fef08a' : '#78350f';
        ctx.beginPath();
        ctx.arc(sunProj.screenX, sunProj.screenY, 9 * sunProj.scale, 0, Math.PI * 2);
        ctx.fill();

        // Sun Info Label
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Matahari (${sun.altitudeApparent.toFixed(1)}°)`, sunProj.screenX + 14, sunProj.screenY - 4);
        ctx.font = '9px monospace';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(`Az: ${sun.azimuth.toFixed(1)}°`, sunProj.screenX + 14, sunProj.screenY + 8);
      }

      // -----------------------------------------------------------
      // RENDER 3D MOON (BULAN DENGAN FASE SABIT / HILAL REALISTIS)
      // -----------------------------------------------------------
      const moon3D = horizontalToCartesian(moon.azimuth, moon.altitudeApparent, domeRadius);
      const moonProj = project3D(moon3D, cx, cy, fov, cameraYaw, cameraPitch);

      if (moonProj) {
        const isMoonAbove = moon.altitudeApparent >= 0;

        // Altitude projection line down to horizon
        const moonGround3D = horizontalToCartesian(moon.azimuth, 0, domeRadius);
        const moonGroundProj = project3D(moonGround3D, cx, cy, fov, cameraYaw, cameraPitch);
        if (moonGroundProj) {
          ctx.strokeStyle = isMoonAbove ? 'rgba(6, 182, 212, 0.45)' : 'rgba(8, 51, 68, 0.2)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(moonProj.screenX, moonProj.screenY);
          ctx.lineTo(moonGroundProj.screenX, moonGroundProj.screenY);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Moon Glow
        const mGlow = ctx.createRadialGradient(
          moonProj.screenX, moonProj.screenY, 2,
          moonProj.screenX, moonProj.screenY, 20 * moonProj.scale
        );
        mGlow.addColorStop(0, 'rgba(165, 243, 252, 0.7)');
        mGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.3)');
        mGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = mGlow;
        ctx.beginPath();
        ctx.arc(moonProj.screenX, moonProj.screenY, 20 * moonProj.scale, 0, Math.PI * 2);
        ctx.fill();

        // Moon Disk (Dark Body Earthshine)
        const moonRadiusPx = 8 * moonProj.scale;
        ctx.fillStyle = isMoonAbove ? '#164e63' : '#082f49';
        ctx.beginPath();
        ctx.arc(moonProj.screenX, moonProj.screenY, moonRadiusPx, 0, Math.PI * 2);
        ctx.fill();

        // Illuminated Crescent Portion (Calculated accurately based on phase)
        ctx.fillStyle = '#ecfeff';
        ctx.beginPath();
        ctx.arc(moonProj.screenX, moonProj.screenY, moonRadiusPx, -Math.PI / 2, Math.PI / 2, false);
        // Inner curve of crescent based on illumination fraction
        const kFraction = Math.max(0.02, Math.min(0.98, moonPhaseFraction));
        const innerRadiusX = moonRadiusPx * (1 - 2 * kFraction);
        ctx.ellipse(
          moonProj.screenX, moonProj.screenY, 
          Math.abs(innerRadiusX), moonRadiusPx, 
          0, Math.PI / 2, -Math.PI / 2, 
          innerRadiusX >= 0
        );
        ctx.fill();

        // Moon Info Label
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Bulan (${moon.altitudeApparent.toFixed(1)}°)`, moonProj.screenX + 14, moonProj.screenY - 4);
        ctx.font = '9px monospace';
        ctx.fillStyle = '#bae6fd';
        ctx.fillText(`Az: ${moon.azimuth.toFixed(1)}° | Hilal: ${(moonPhaseFraction * 100).toFixed(1)}%`, moonProj.screenX + 14, moonProj.screenY + 8);
      }

      // Elongation Angular Arc between Sun and Moon
      if (sunProj && moonProj && sun.altitudeApparent > -10 && moon.altitudeApparent > -10) {
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(sunProj.screenX, sunProj.screenY);
        ctx.lineTo(moonProj.screenX, moonProj.screenY);
        ctx.stroke();
        ctx.setLineDash([]);

        const midX = (sunProj.screenX + moonProj.screenX) / 2;
        const midY = (sunProj.screenY + moonProj.screenY) / 2;
        ctx.fillStyle = '#fde047';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Elongasi: ${elongationDeg.toFixed(1)}°`, midX, midY - 6);
      }
    }

    // -------------------------------------------------------------
    // MODE 2: 2D RADAR POLAR STEREOGRAFIS HORISON 360°
    // -------------------------------------------------------------
    else if (activeMode === '2d_radar') {
      const radarRadius = Math.min(w, h) * 0.42;

      // Dark Radar Background
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);

      // Radar Concentric Circles (0° Horizon, 30°, 60°, 90° Zenith)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;

      [30, 60].forEach((alt) => {
        const r = radarRadius * (90 - alt) / 90;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '9px monospace';
        ctx.fillText(`${alt}°`, cx + 4, cy - r + 10);
      });

      // Outer Horizon Ring (0°)
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radarRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Below Horizon Ring (-10°)
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(cx, cy, radarRadius + 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Cardinal Lines (North - South, East - West)
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(cx, cy - radarRadius);
      ctx.lineTo(cx, cy + radarRadius);
      ctx.moveTo(cx - radarRadius, cy);
      ctx.lineTo(cx + radarRadius, cy);
      ctx.stroke();

      // Cardinal Labels
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('U (0°)', cx, cy - radarRadius - 8);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('T (90°)', cx + radarRadius + 22, cy + 4);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('S (180°)', cx, cy + radarRadius + 16);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('B (270°)', cx - radarRadius - 22, cy + 4);

      // Polar to XY mapping
      const polarToScreen = (azDeg: number, altDeg: number) => {
        const clampedAlt = Math.max(-15, Math.min(90, altDeg));
        const r = (radarRadius * (90 - clampedAlt)) / 90;
        const angleRad = ((azDeg - 90) * Math.PI) / 180;
        return {
          x: cx + r * Math.cos(angleRad),
          y: cy + r * Math.sin(angleRad)
        };
      };

      const sunPos = polarToScreen(sun.azimuth, sun.altitudeApparent);
      const moonPos = polarToScreen(moon.azimuth, moon.altitudeApparent);

      // Sun Vector on Radar
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sunPos.x, sunPos.y);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(sunPos.x, sunPos.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`Matahari (${sun.altitudeApparent.toFixed(1)}°)`, sunPos.x + 10, sunPos.y - 4);

      // Moon Vector on Radar
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(moonPos.x, moonPos.y);
      ctx.stroke();

      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(moonPos.x, moonPos.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`Bulan (${moon.altitudeApparent.toFixed(1)}°)`, moonPos.x + 10, moonPos.y - 4);
    }

    // -------------------------------------------------------------
    // MODE 3: SIMULASI TELESKOP & HILAL CLOSE-UP (Rukyatul Hilal)
    // -------------------------------------------------------------
    else if (activeMode === 'telescope') {
      // Dark space background with subtle stars
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Circular Crosshair Reticle (Telescope Field of View)
      const reticleRadius = Math.min(w, h) * 0.42;

      // Telescope Barrel Vignette
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, reticleRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - reticleRadius, cy);
      ctx.lineTo(cx + reticleRadius, cy);
      ctx.moveTo(cx, cy - reticleRadius);
      ctx.lineTo(cx, cy + reticleRadius);
      ctx.stroke();

      // Inner Mil Scale Circles
      [0.3, 0.6, 0.85].forEach((ratio) => {
        ctx.beginPath();
        ctx.arc(cx, cy, reticleRadius * ratio, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Large High-Fidelity 3D Crescent Moon
      const moonLargeRadius = reticleRadius * 0.45;

      // Shaded dark lunar sphere with Earthshine
      const darkBodyGrad = ctx.createRadialGradient(
        cx - moonLargeRadius * 0.2, cy - moonLargeRadius * 0.2, 5,
        cx, cy, moonLargeRadius
      );
      darkBodyGrad.addColorStop(0, '#164e63');
      darkBodyGrad.addColorStop(0.8, '#082f49');
      darkBodyGrad.addColorStop(1, '#020617');

      ctx.fillStyle = darkBodyGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, moonLargeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Crescent Illumination Arc
      ctx.fillStyle = '#ecfeff';
      ctx.beginPath();
      ctx.arc(cx, cy, moonLargeRadius, -Math.PI / 2, Math.PI / 2, false);

      const kFrac = Math.max(0.015, Math.min(0.985, moonPhaseFraction));
      const innerX = moonLargeRadius * (1 - 2 * kFrac);
      ctx.ellipse(
        cx, cy,
        Math.abs(innerX), moonLargeRadius,
        0, Math.PI / 2, -Math.PI / 2,
        innerX >= 0
      );
      ctx.fill();

      // Crescent Glow
      const crescGlow = ctx.createRadialGradient(
        cx, cy, moonLargeRadius * 0.8,
        cx, cy, moonLargeRadius * 1.3
      );
      crescGlow.addColorStop(0, 'rgba(236, 254, 255, 0.4)');
      crescGlow.addColorStop(1, 'rgba(236, 254, 255, 0)');
      ctx.fillStyle = crescGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, moonLargeRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Optical Data Overlays
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`FOV: 2.0° | RETIKEL RUKYAT`, cx - reticleRadius + 12, cy - reticleRadius + 24);
      ctx.fillText(`ILUMINASI: ${(moonPhaseFraction * 100).toFixed(2)}%`, cx - reticleRadius + 12, cy - reticleRadius + 42);
      ctx.fillText(`LEBAR SABIT: ${crescentWidthArcMin.toFixed(2)}'`, cx - reticleRadius + 12, cy - reticleRadius + 60);

      ctx.textAlign = 'right';
      ctx.fillText(`FASE: ${moonPhaseName.toUpperCase()}`, cx + reticleRadius - 12, cy - reticleRadius + 24);
      ctx.fillText(`ALTITUDO: ${moon.altitudeApparent.toFixed(2)}°`, cx + reticleRadius - 12, cy - reticleRadius + 42);
      ctx.fillText(`AZIMUTH: ${moon.azimuth.toFixed(2)}°`, cx + reticleRadius - 12, cy - reticleRadius + 60);
    }

  }, [
    activeMode, 
    cameraYaw, 
    cameraPitch, 
    zoom, 
    sun, 
    moon, 
    elongationDeg, 
    moonPhaseFraction, 
    moonPhaseName, 
    crescentWidthArcMin, 
    stars, 
    horizontalToCartesian, 
    project3D
  ]);

  return (
    <div 
      ref={containerRef}
      className="w-full flex flex-col items-center bg-stone-950 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl relative select-none"
    >
      {/* Top Header & View Controls Bar */}
      <div className="w-full p-4 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Move3d className="w-4 h-4 text-cyan-400" />
              <span>Simulasi Horison Astronomi 3D & 4D</span>
            </h3>
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Markaz: <strong className="text-stone-200">{observerName}</strong> &bull; Toposentris Horizon Meeus & Sullamun Nayyirain
          </p>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center gap-1 p-1 bg-stone-950 rounded-xl border border-stone-800 text-xs font-bold">
          <button
            onClick={() => handleModeChange('3d_dome')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === '3d_dome'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            title="Kubah Langit 3D Interaktif (Bebas Geser & Putar)"
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span>Kubah 3D</span>
          </button>

          <button
            onClick={() => handleModeChange('2d_radar')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === '2d_radar'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            title="Radar Horison Polar 360°"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Radar 2D</span>
          </button>

          <button
            onClick={() => handleModeChange('telescope')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'telescope'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            title="Simulasi Teropong Rukyatul Hilal Close-up"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Teropong Hilal</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="relative w-full h-[380px] sm:h-[460px] cursor-grab active:cursor-grabbing overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full h-full block"
        />

        {/* 3D Navigation Hint Pill */}
        {activeMode === '3d_dome' && (
          <div className="absolute top-3 left-3 pointer-events-none px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-stone-300 flex items-center gap-1.5">
            <Move3d className="w-3 h-3 text-cyan-400" />
            <span>Geser / Sentuh kanvas untuk memutar sudut pandang 3D</span>
          </div>
        )}

        {/* Floating Fast Presets (Quick Look West / Sunset, East / Sunrise) */}
        {activeMode === '3d_dome' && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 text-[10px]">
            <button
              onClick={() => {
                setCameraYaw(270);
                setCameraPitch(22);
              }}
              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold cursor-pointer"
              title="Arahkan kamera ke ufuk Barat (Arah Rukyat Hilal)"
            >
              Ufuk Barat (270°)
            </button>
            <button
              onClick={() => {
                setCameraYaw(90);
                setCameraPitch(22);
              }}
              className="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold cursor-pointer"
              title="Arahkan kamera ke ufuk Timur"
            >
              Ufuk Timur (90°)
            </button>
            <button
              onClick={() => {
                setCameraYaw(0);
                setCameraPitch(80);
              }}
              className="px-2 py-1 rounded-lg bg-stone-700/60 hover:bg-stone-700 text-stone-200 font-bold cursor-pointer"
              title="Arahkan kamera ke Zenith (Puncak Langit)"
            >
              Zenith (90°)
            </button>
          </div>
        )}

        {/* Bottom Ephemeris Quick Floating Chips */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-amber-950/80 backdrop-blur-md border border-amber-600/40 text-[11px] text-amber-200 shadow-lg pointer-events-auto flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Matahari: <strong>{sun.altitudeApparent.toFixed(2)}°</strong> (Az {sun.azimuth.toFixed(1)}°)</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-cyan-950/80 backdrop-blur-md border border-cyan-600/40 text-[11px] text-cyan-200 shadow-lg pointer-events-auto flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bulan: <strong>{moon.altitudeApparent.toFixed(2)}°</strong> (Az {moon.azimuth.toFixed(1)}°)</span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-stone-900/80 backdrop-blur-md border border-stone-700 text-[11px] text-stone-200 shadow-lg pointer-events-auto">
            Elongasi: <strong className="text-yellow-400 font-mono">{elongationDeg.toFixed(2)}°</strong> &bull; Iluminasi: <strong className="text-white font-mono">{(moonPhaseFraction * 100).toFixed(1)}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
