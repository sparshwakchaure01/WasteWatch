import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Default configuration or fallback
const firebaseConfig = {
  apiKey: "AIzaSyDemoWasteWatchKey2026",
  authDomain: "wastewatch-sangamner.firebaseapp.com",
  projectId: "wastewatch-sangamner",
  storageBucket: "wastewatch-sangamner.appspot.com",
  messagingSenderId: "987654321012",
  appId: "1:987654321012:web:wastewatch2026"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Test Firestore connection on boot defensively
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection active');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or unprovisioned. Operating in resilient local persistence mode.');
    }
  }
}
