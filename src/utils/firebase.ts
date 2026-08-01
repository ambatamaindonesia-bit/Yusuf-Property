import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { saveToSupabase, loadFromSupabase, subscribeToSupabaseKey, isSupabaseConnected } from './supabase';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== ''
  ? firebaseConfig.firestoreDatabaseId
  : '(default)';

export const db = getFirestore(app, dbId);

// Flag to track if Firebase Firestore hit quota limits
let isFirebaseQuotaExceeded = false;
let quotaWarningLogged = false;

export function checkIsFirebaseQuotaExceeded(): boolean {
  return isFirebaseQuotaExceeded;
}

// Debounce map for cloud writes to prevent spamming cloud quotas
const writeDebounceTimers: Record<string, NodeJS.Timeout> = {};

function handleFirestoreError(err: any, context: string) {
  const errMsg = err?.message || String(err);
  const code = err?.code;
  if (code === 'resource-exhausted' || errMsg.includes('Quota limit exceeded') || errMsg.includes('resource-exhausted')) {
    isFirebaseQuotaExceeded = true;
    if (!quotaWarningLogged) {
      console.warn(`[Firebase Firestore] Quota limit reached in ${context}. Automatically switching to Supabase & IndexedDB storage mode.`);
      quotaWarningLogged = true;
    }
    return true;
  }
  return false;
}

// Helper function to recursively sanitize data (convert undefined properties or remove them)
function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  const cleanObj: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value !== undefined) {
      cleanObj[key] = sanitizeForFirestore(value);
    }
  }
  return cleanObj;
}

export async function saveToCloud<T>(key: string, data: T, immediate = false): Promise<void> {
  const executeSave = async () => {
    // 1. Try Save to Firebase Firestore if quota not exceeded
    if (!isFirebaseQuotaExceeded) {
      try {
        const docRef = doc(db, 'erp_data', key);
        const cleanData = sanitizeForFirestore(data);
        await setDoc(docRef, { payload: cleanData, updatedAt: new Date().toISOString() });
      } catch (err: any) {
        const isQuotaErr = handleFirestoreError(err, `saveToCloud(${key})`);
        if (!isQuotaErr) {
          console.warn(`Firebase Firestore save error for key ${key}:`, err?.message || err);
        }
      }
    }

    // 2. Save to Supabase
    if (isSupabaseConnected()) {
      try {
        await saveToSupabase(key, data);
      } catch (err) {
        console.warn(`Supabase save notice for key ${key}:`, err);
      }
    }
  };

  if (immediate) {
    if (writeDebounceTimers[key]) {
      clearTimeout(writeDebounceTimers[key]);
    }
    return executeSave();
  }

  // Clear any pending debounce timer for this key
  if (writeDebounceTimers[key]) {
    clearTimeout(writeDebounceTimers[key]);
  }

  // Debounce writes by 300ms
  return new Promise((resolve) => {
    writeDebounceTimers[key] = setTimeout(async () => {
      await executeSave();
      resolve();
    }, 300);
  });
}

export async function loadFromCloud<T>(key: string): Promise<T | null> {
  // 1. Try Firebase Firestore directly from server first
  if (!isFirebaseQuotaExceeded) {
    try {
      const docRef = doc(db, 'erp_data', key);
      const snap = await getDocFromServer(docRef);
      if (snap.exists() && snap.data().payload !== undefined) {
        return snap.data().payload as T;
      }
    } catch (err: any) {
      // Fallback to cached getDoc if getDocFromServer fails or offline
      try {
        const docRef = doc(db, 'erp_data', key);
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().payload !== undefined) {
          return snap.data().payload as T;
        }
      } catch (e: any) {
        const isQuotaErr = handleFirestoreError(e, `loadFromCloud(${key})`);
        if (!isQuotaErr) {
          console.warn(`Firebase Firestore load notice for key ${key}:`, e?.message || e);
        }
      }
    }
  }

  // 2. Try Supabase as backup/dual load
  if (isSupabaseConnected()) {
    try {
      const supabaseData = await loadFromSupabase<T>(key);
      if (supabaseData) return supabaseData;
    } catch (err) {
      console.warn(`Supabase load notice for key ${key}:`, err);
    }
  }

  return null;
}

export function subscribeToCloudKey<T>(key: string, callback: (data: T) => void): () => void {
  let unsubFirebase = () => {};

  if (!isFirebaseQuotaExceeded) {
    try {
      const docRef = doc(db, 'erp_data', key);
      unsubFirebase = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (data && data.payload !== undefined) {
              callback(data.payload as T);
            }
          }
        },
        (err) => {
          handleFirestoreError(err, `subscribeToCloudKey(${key})`);
        }
      );
    } catch (err) {
      handleFirestoreError(err, `subscribeToCloudKey init (${key})`);
    }
  }

  let unsubSupabase = () => {};
  if (isSupabaseConnected()) {
    unsubSupabase = subscribeToSupabaseKey<T>(key, callback);
  }

  return () => {
    unsubFirebase();
    unsubSupabase();
  };
}


