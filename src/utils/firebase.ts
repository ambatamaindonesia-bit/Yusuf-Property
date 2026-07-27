import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== ''
  ? firebaseConfig.firestoreDatabaseId
  : '(default)';

export const db = getFirestore(app, dbId);

// Helper to listen to real-time updates for a single ERP collection document
// We can store each main collection array as a document in a 'erp_data' collection,
// OR save real-time listener for each entity.
// Storing as document or sync store ensures atomic, instant synchronization across all connected devices!

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

export async function saveToCloud<T>(key: string, data: T): Promise<void> {
  try {
    const docRef = doc(db, 'erp_data', key);
    const cleanData = sanitizeForFirestore(data);
    await setDoc(docRef, { payload: cleanData, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error(`Firebase Firestore save error for key ${key}:`, err);
  }
}

export async function loadFromCloud<T>(key: string): Promise<T | null> {
  try {
    const docRef = doc(db, 'erp_data', key);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().payload as T;
    }
    return null;
  } catch (err) {
    console.error(`Firebase Firestore load error for key ${key}:`, err);
    return null;
  }
}

export function subscribeToCloudKey<T>(key: string, callback: (data: T) => void): () => void {
  const docRef = doc(db, 'erp_data', key);
  return onSnapshot(
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
      console.error(`Firestore snapshot subscription error on ${key}:`, err);
    }
  );
}
