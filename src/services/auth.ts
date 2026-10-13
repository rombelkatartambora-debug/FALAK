import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

const provider = new GoogleAuthProvider();
provider.addScope(CALENDAR_SCOPE);
// Ask for consent prompt so offline/refresh is clear and token is granted
provider.setCustomParameters({
  prompt: 'select_account'
});

// Flag to track ongoing sign in flow
let isSigningIn = false;
// Cache the access token in memory ONLY (never in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google Calendar OAuth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    // Tangani jika pengguna menutup popup atau membatalkan proses login
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      // Pembatalan wajar oleh pengguna - tidak perlu throw error atau log error
      return null;
    }

    if (error?.code === 'auth/popup-blocked') {
      throw new Error('Jendela pop-up diblokir oleh peramban. Harap izinkan pop-up pada peramban Anda.');
    }

    if (error?.code === 'auth/network-request-failed') {
      throw new Error('Koneksi internet bermasalah. Harap periksa jaringan Anda.');
    }

    console.warn('Google Sign In:', error?.message || error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  try {
    await signOut(auth);
  } finally {
    cachedAccessToken = null;
  }
};
