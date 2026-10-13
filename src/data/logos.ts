/**
 * PENGELOLAAN LOGO KARANG TARUNA NASIONAL & KARANG TARUNA JAYA RAYA DKI JAKARTA
 * Sesuai desain resmi aplikasi:
 * 1. Logo Karang Taruna (Adhitya Karya Mahatva Yodha) -> /logo-karang-taruna.svg (Tampil di Navbar & Kop Surat Kiri)
 * 2. Logo Karang Taruna Jaya Raya DKI Jakarta         -> /logo-karang-taruna-jaya-raya.svg (Tampil di Sidebar & Kop Surat Kanan)
 * 
 * Pengguna juga dapat mengunggah file kustom sendiri via pengaturan/kop surat.
 */

import { useState, useEffect } from 'react';

export const OFFICIAL_LOGO_NASIONAL = '/logo-karang-taruna.svg';
export const OFFICIAL_LOGO_DKI = '/logo-karang-taruna-jaya-raya.svg';

export const SVG_LOGO_KATAR_NASIONAL = OFFICIAL_LOGO_NASIONAL;
export const SVG_LOGO_KATAR_DKI = OFFICIAL_LOGO_DKI;

export const LOGO_ASSETS = {
  nasional: OFFICIAL_LOGO_NASIONAL,
  dki: OFFICIAL_LOGO_DKI,
  nasionalWeb: OFFICIAL_LOGO_NASIONAL,
  dkiWeb: OFFICIAL_LOGO_DKI,
};

const LOGO_NASIONAL_STORAGE_KEY = 'kata_custom_logo_nasional';
const LOGO_DKI_STORAGE_KEY = 'kata_custom_logo_dki';
const ORG_STORAGE_KEY = 'kata_tambora_org_v2';
export const LOGO_UPDATE_EVENT = 'simkat_logos_updated';

function dispatchLogoUpdate(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LOGO_UPDATE_EVENT));
  }
}

export function isCustomLogoNasionalActive(): boolean {
  try {
    const val = localStorage.getItem(LOGO_NASIONAL_STORAGE_KEY);
    return !!val && val.trim().length > 0 && val !== OFFICIAL_LOGO_NASIONAL;
  } catch {
    return false;
  }
}

export function isCustomLogoDkiActive(): boolean {
  try {
    const val = localStorage.getItem(LOGO_DKI_STORAGE_KEY);
    return !!val && val.trim().length > 0 && val !== OFFICIAL_LOGO_DKI;
  } catch {
    return false;
  }
}

export function getActiveLogoNasional(): string {
  try {
    const custom = localStorage.getItem(LOGO_NASIONAL_STORAGE_KEY);
    if (custom && custom.trim().length > 0) {
      return custom;
    }
    const orgRaw = localStorage.getItem(ORG_STORAGE_KEY);
    if (orgRaw) {
      const parsed = JSON.parse(orgRaw);
      if (parsed.logoKiriUrl && parsed.logoKiriUrl.trim().length > 0) {
        return parsed.logoKiriUrl;
      }
    }
  } catch (e) {}
  return OFFICIAL_LOGO_NASIONAL;
}

export function getActiveLogoDki(): string {
  try {
    const custom = localStorage.getItem(LOGO_DKI_STORAGE_KEY);
    if (custom && custom.trim().length > 0) {
      return custom;
    }
    const orgRaw = localStorage.getItem(ORG_STORAGE_KEY);
    if (orgRaw) {
      const parsed = JSON.parse(orgRaw);
      if (parsed.logoKananUrl && parsed.logoKananUrl.trim().length > 0) {
        return parsed.logoKananUrl;
      }
    }
  } catch (e) {}
  return OFFICIAL_LOGO_DKI;
}

export function saveCustomLogoNasional(base64: string): void {
  try {
    localStorage.setItem(LOGO_NASIONAL_STORAGE_KEY, base64);
    const orgRaw = localStorage.getItem(ORG_STORAGE_KEY);
    if (orgRaw) {
      const parsed = JSON.parse(orgRaw);
      parsed.logoKiriUrl = base64;
      localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch (e) {}
  dispatchLogoUpdate();
}

export function saveCustomLogoDki(base64: string): void {
  try {
    localStorage.setItem(LOGO_DKI_STORAGE_KEY, base64);
    const orgRaw = localStorage.getItem(ORG_STORAGE_KEY);
    if (orgRaw) {
      const parsed = JSON.parse(orgRaw);
      parsed.logoKananUrl = base64;
      localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch (e) {}
  dispatchLogoUpdate();
}

export function deleteCustomLogoNasional(): void {
  try {
    localStorage.removeItem(LOGO_NASIONAL_STORAGE_KEY);
    const orgRaw = localStorage.getItem(ORG_STORAGE_KEY);
    if (orgRaw) {
      const parsed = JSON.parse(orgRaw);
      parsed.logoKiriUrl = OFFICIAL_LOGO_NASIONAL;
      localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch (e) {}
  dispatchLogoUpdate();
}

export function deleteCustomLogoDki(): void {
  try {
    localStorage.removeItem(LOGO_DKI_STORAGE_KEY);
    const orgRaw = localStorage.getItem(ORG_STORAGE_KEY);
    if (orgRaw) {
      const parsed = JSON.parse(orgRaw);
      parsed.logoKananUrl = OFFICIAL_LOGO_DKI;
      localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch (e) {}
  dispatchLogoUpdate();
}

export function resetCustomLogoNasional(): void {
  deleteCustomLogoNasional();
}

export function resetCustomLogoDki(): void {
  deleteCustomLogoDki();
}

export function resetCustomLogos(): void {
  deleteCustomLogoNasional();
  deleteCustomLogoDki();
}

export function deleteAllLogos(): void {
  deleteCustomLogoNasional();
  deleteCustomLogoDki();
}

/**
 * Hook React untuk memantau perubahan logo secara real-time
 */
export function useLogos() {
  const [logoNasional, setLogoNasional] = useState<string>(() => getActiveLogoNasional());
  const [logoDki, setLogoDki] = useState<string>(() => getActiveLogoDki());

  useEffect(() => {
    const handleUpdate = () => {
      setLogoNasional(getActiveLogoNasional());
      setLogoDki(getActiveLogoDki());
    };

    window.addEventListener(LOGO_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(LOGO_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    logoNasional,
    logoDki,
    hasLogoNasional: !!logoNasional,
    hasLogoDki: !!logoDki,
    hasAnyLogo: !!logoNasional || !!logoDki,
    hasBothLogos: !!logoNasional && !!logoDki,
  };
}
