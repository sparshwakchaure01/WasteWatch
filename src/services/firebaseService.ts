import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut as firebaseSignOut, signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth, firebaseConfig, handleFirestoreError, OperationType } from '../firebase';
import { Complaint, User, Hotspot, AuditLog } from '../types';
import { INITIAL_USERS, INITIAL_COMPLAINTS, INITIAL_AUDIT_LOGS } from '../data/initialData';

const USERS_COL = 'users';
const COMPLAINTS_COL = 'complaints';
const HOTSPOTS_COL = 'hotspots';
const AUDIT_LOGS_COL = 'audit_logs';

/**
 * Seed initial Firestore collections if empty, ensuring Admin UID is present
 */
export async function seedInitialFirestoreData() {
  try {
    // 1. Seed Users
    const usersSnap = await getDocs(collection(db, USERS_COL));
    if (usersSnap.empty) {
      console.log('Seeding initial users into Firestore...');
      for (const u of INITIAL_USERS) {
        await setDoc(doc(db, USERS_COL, u.uid), u);
      }
    } else {
      // Ensure the Admin UID document exists even if collection was partially populated
      const adminUid = 'yGYeMshXHzLOlcfjlUGSBu7efiF2';
      const adminDocRef = doc(db, USERS_COL, adminUid);
      const adminSnap = await getDoc(adminDocRef);
      if (!adminSnap.exists()) {
        const adminUser: User = {
          uid: adminUid,
          fullName: 'System Administrator',
          email: 'admin@wastewatch.gov.in',
          phone: '+919890099887',
          role: 'Administrator',
          status: 'Active',
          department: 'Municipal Governance',
          createdAt: new Date().toISOString()
        };
        await setDoc(adminDocRef, adminUser, { merge: true });
      }
    }

    // 2. Seed Complaints
    const complaintsSnap = await getDocs(collection(db, COMPLAINTS_COL));
    if (complaintsSnap.empty) {
      console.log('Seeding initial complaints into Firestore...');
      for (const c of INITIAL_COMPLAINTS) {
        await setDoc(doc(db, COMPLAINTS_COL, c.id), c);
      }
    }

    // 3. Seed Audit Logs
    const auditSnap = await getDocs(collection(db, AUDIT_LOGS_COL));
    if (auditSnap.empty) {
      console.log('Seeding initial audit logs into Firestore...');
      for (const l of INITIAL_AUDIT_LOGS) {
        await setDoc(doc(db, AUDIT_LOGS_COL, l.id), l);
      }
    }
  } catch (err) {
    console.warn('Firestore initial seeding note:', err);
  }
}

/**
 * Firestore User Operations
 */
export function subscribeUsers(callback: (users: User[]) => void, onError?: (err: any) => void) {
  const q = query(collection(db, USERS_COL));
  return onSnapshot(
    q,
    (snapshot) => {
      const users: User[] = [];
      snapshot.forEach((docSnap) => {
        users.push(docSnap.data() as User);
      });
      callback(users);
    },
    (err) => {
      console.error('Error listening to users:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, USERS_COL);
    }
  );
}

export async function findUserByEmailInFirestore(email: string): Promise<User | null> {
  try {
    const normalized = email.trim().toLowerCase();
    const snap = await getDocs(collection(db, USERS_COL));
    let matched: User | null = null;
    snap.forEach((docSnap) => {
      const u = docSnap.data() as User;
      if (u.email && u.email.trim().toLowerCase() === normalized) {
        matched = u;
      }
    });
    return matched;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, USERS_COL);
    return null;
  }
}

export async function findUserByUidInFirestore(uid: string): Promise<User | null> {
  try {
    const userDocRef = doc(db, USERS_COL, uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `${USERS_COL}/${uid}`);
    return null;
  }
}

export async function createFirebaseAuthUser(email: string, pass: string): Promise<string | null> {
  try {
    // Use secondary Firebase App instance to prevent logging out current Admin user session
    const tempAppName = `AdminUserCreationApp_${Date.now()}`;
    const tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);
    
    const userCredential = await createUserWithEmailAndPassword(tempAuth, email, pass);
    const newUid = userCredential.user.uid;
    
    // Clean up temporary session
    await firebaseSignOut(tempAuth);
    await deleteApp(tempApp);
    
    return newUid;
  } catch (err: any) {
    console.warn('Firebase Auth user creation note (may already exist or offline):', err.message);
    return null;
  }
}

export async function saveUserToFirestore(user: User) {
  try {
    await setDoc(doc(db, USERS_COL, user.uid), user, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${USERS_COL}/${user.uid}`);
  }
}

export async function updateUserInFirestore(uid: string, updates: Partial<User>) {
  try {
    await updateDoc(doc(db, USERS_COL, uid), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${USERS_COL}/${uid}`);
  }
}

export async function deleteUserFromFirestore(uid: string) {
  try {
    await deleteDoc(doc(db, USERS_COL, uid));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${USERS_COL}/${uid}`);
  }
}

/**
 * Firestore Complaint Operations
 */
export function subscribeComplaints(callback: (complaints: Complaint[]) => void, onError?: (err: any) => void) {
  const q = query(collection(db, COMPLAINTS_COL));
  return onSnapshot(
    q,
    (snapshot) => {
      const complaints: Complaint[] = [];
      snapshot.forEach((docSnap) => {
        complaints.push(docSnap.data() as Complaint);
      });
      // Sort newest first
      complaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(complaints);
    },
    (err) => {
      console.error('Error listening to complaints:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, COMPLAINTS_COL);
    }
  );
}

export async function saveComplaintToFirestore(complaint: Complaint) {
  try {
    await setDoc(doc(db, COMPLAINTS_COL, complaint.id), complaint);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COMPLAINTS_COL}/${complaint.id}`);
  }
}

export async function updateComplaintInFirestore(id: string, updates: Partial<Complaint>) {
  try {
    await updateDoc(doc(db, COMPLAINTS_COL, id), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${COMPLAINTS_COL}/${id}`);
  }
}

export async function deleteComplaintFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, COMPLAINTS_COL, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COMPLAINTS_COL}/${id}`);
  }
}

/**
 * Firestore Audit Logs Operations
 */
export function subscribeAuditLogs(callback: (logs: AuditLog[]) => void, onError?: (err: any) => void) {
  const q = query(collection(db, AUDIT_LOGS_COL));
  return onSnapshot(
    q,
    (snapshot) => {
      const logs: AuditLog[] = [];
      snapshot.forEach((docSnap) => {
        logs.push(docSnap.data() as AuditLog);
      });
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(logs);
    },
    (err) => {
      console.error('Error listening to audit logs:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, AUDIT_LOGS_COL);
    }
  );
}

export async function saveAuditLogToFirestore(log: AuditLog) {
  try {
    await setDoc(doc(db, AUDIT_LOGS_COL, log.id), log);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${AUDIT_LOGS_COL}/${log.id}`);
  }
}

/**
 * Sync Hotspots to Firestore
 */
export async function syncHotspotsToFirestore(hotspots: Hotspot[]) {
  try {
    for (const h of hotspots) {
      await setDoc(doc(db, HOTSPOTS_COL, h.id), h, { merge: true });
    }
  } catch (err) {
    console.warn('Hotspot sync note:', err);
  }
}
