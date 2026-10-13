/**
 * Web Audio API synthesizer untuk Suara Bedug Tradisional Nusantara & Pengingat Waktu Sholat
 * 100% Client-side synthesized, bebas dependensi file mp3 eksternal, instan & jernih.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Memainkan 1 pukulan bedug dengan resonansi kayu khas masjid Nusantara
 */
export function playBedugHit(timeOffset = 0, intensity = 1.0) {
  try {
    const ctx = getAudioContext();
    const startTime = ctx.currentTime + timeOffset;

    // 1. Sub-bass drum membrane oscillator
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    // Pitch envelope: Pukulan awal bernada ~95Hz meluncur cepat ke ~48Hz resonansi kayu bedug
    osc.type = 'sine';
    osc.frequency.setValueAtTime(95 * intensity, startTime);
    osc.frequency.exponentialRampToValueAtTime(46, startTime + 0.12);

    // Amplitude envelope: Decay alami membran kulit lembu bedug
    oscGain.gain.setValueAtTime(0.9 * intensity, startTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.65);

    // 2. Resonansi bodi kayu bedug (Bandpass filter)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(110, startTime);
    filter.Q.setValueAtTime(3.5, startTime);

    // 3. Transient pukulan stik (Click/Thump)
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(220, startTime);
    clickGain.gain.setValueAtTime(0.35 * intensity, startTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);

    // Koneksi audio graph
    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(ctx.destination);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.7);

    clickOsc.start(startTime);
    clickOsc.stop(startTime + 0.05);
  } catch (err) {
    console.warn('Web Audio not supported or blocked:', err);
  }
}

/**
 * Memainkan irama tabuhan Bedug bertingkat sebelum adzan
 * "Dug... Dug... Dug dug dug dug... DUG!"
 */
export function playBedugRhythm() {
  const pattern = [
    { delay: 0.0, power: 0.8 },
    { delay: 0.5, power: 0.85 },
    { delay: 1.0, power: 0.9 },
    { delay: 1.4, power: 0.7 },
    { delay: 1.7, power: 0.75 },
    { delay: 2.0, power: 0.85 },
    { delay: 2.25, power: 0.9 },
    { delay: 2.5, power: 0.95 },
    { delay: 2.85, power: 1.0 }
  ];

  pattern.forEach(({ delay, power }) => {
    playBedugHit(delay, power);
  });
}

/**
 * Memainkan nada melodi chime adzan yang lembut & syahdu
 */
export function playAdzanChime() {
  try {
    const ctx = getAudioContext();
    const notes = [
      { freq: 440, delay: 0.0, dur: 0.4 },  // A4
      { freq: 493.88, delay: 0.4, dur: 0.4 }, // B4
      { freq: 554.37, delay: 0.8, dur: 0.6 }, // C#5
      { freq: 440, delay: 1.4, dur: 0.8 }   // A4
    ];

    notes.forEach(({ freq, delay, dur }) => {
      const startTime = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur + 0.1);
    });
  } catch (err) {
    console.warn('Audio chime error:', err);
  }
}
