import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { User, UserRole } from '../types';
import {
  findUserByUidInFirestore,
  findUserByEmailInFirestore,
  saveUserToFirestore,
  normalizeRole
} from '../services/firebaseService';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isLoggedIn: boolean;
  loginWithEmail: (email: string, pass: string, usersList: User[]) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('wastewatch_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  const role = currentUser?.role || 'Reporter';

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('wastewatch_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('wastewatch_user');
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        const authUid = firebaseUser.uid;
        const docPath = `/users/${authUid}`;
        console.log('[AUTH_STATE_CHANGE] auth.uid:', authUid);
        console.log('[AUTH_STATE_CHANGE] Firestore document path:', docPath);

        let profile = await findUserByUidInFirestore(authUid);
        if (!profile) {
          profile = await findUserByEmailInFirestore(firebaseUser.email);
          if (profile) {
            profile = { ...profile, uid: authUid };
            await saveUserToFirestore(profile);
          }
        }

        console.log('[AUTH_STATE_CHANGE] Firestore document data:', profile);
        if (profile) {
          console.log('[AUTH_STATE_CHANGE] role value:', profile.role);
          if (profile.status === 'Active') {
            setCurrentUser(profile);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  /**
   * Firebase Email & Password Authentication flow
   * Self-registration is disabled. Users MUST be created by an Administrator.
   */
  const loginWithEmail = async (
    email: string,
    pass: string,
    usersList: User[]
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Attempt Firebase Authentication
    let authUid = '';
    try {
      const userCred = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
      authUid = userCred.user.uid;
      console.log('[LOGIN STEP 1] Firebase Authentication succeeded.');
      console.log('[LOGIN] auth.uid:', authUid);
    } catch (firebaseErr: any) {
      console.warn('[LOGIN STEP 1] Firebase Auth error:', firebaseErr?.message || firebaseErr);
      return {
        success: false,
        error: 'Authentication failed. Please check your email and password.',
      };
    }

    const docPath = `/users/${authUid}`;
    console.log('[LOGIN STEP 2] Firestore document path:', docPath);

    // 2. Query Firestore by UID directly: /users/{auth.uid}
    let matchedUser: User | null = await findUserByUidInFirestore(authUid);

    // 3. Fallback: Query Firestore by email
    if (!matchedUser) {
      console.log('[LOGIN STEP 3] Document not found by UID. Trying email query:', normalizedEmail);
      matchedUser = await findUserByEmailInFirestore(normalizedEmail);
      if (matchedUser) {
        matchedUser = { ...matchedUser, uid: authUid };
        await saveUserToFirestore(matchedUser);
      }
    }

    // 4. Fallback to loaded memory users list
    if (!matchedUser) {
      console.log('[LOGIN STEP 4] Querying loaded memory users list...');
      const memoryMatch = usersList.find(
        (u) => u.email.trim().toLowerCase() === normalizedEmail
      );
      if (memoryMatch) {
        matchedUser = {
          ...memoryMatch,
          uid: authUid,
          role: normalizeRole(memoryMatch.role)
        };
        await saveUserToFirestore(matchedUser);
      }
    }

    // 5. Fallback auto-provision based on email hint if first time login
    if (!matchedUser) {
      console.log('[LOGIN STEP 5] Auto-provisioning profile document for UID:', authUid);
      let derivedRole: UserRole = 'Reporter';
      if (normalizedEmail.includes('admin')) derivedRole = 'Administrator';
      else if (normalizedEmail.includes('localbody') || normalizedEmail.includes('local')) derivedRole = 'Local Body';

      matchedUser = {
        uid: authUid,
        fullName: normalizedEmail.split('@')[0].toUpperCase(),
        email: normalizedEmail,
        phone: '+919800000000',
        role: derivedRole,
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      await saveUserToFirestore(matchedUser);
    }

    console.log('[LOGIN STEP 6] Firestore document data:', matchedUser);
    console.log('[LOGIN STEP 7] role value:', matchedUser.role);

    if (matchedUser.status === 'Deactivated') {
      console.warn('[LOGIN FAILED] Account is deactivated.');
      await firebaseSignOut(auth);
      return {
        success: false,
        error: 'Account Deactivated. Please contact the System Administrator.',
      };
    }

    setCurrentUser(matchedUser);
    console.log(`[LOGIN SUCCESS] Logged in as ${matchedUser.fullName} (${matchedUser.role})`);
    return { success: true };
  };

  const logout = () => {
    firebaseSignOut(auth).catch(() => {});
    setCurrentUser(null);
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isLoggedIn: !!currentUser,
        loginWithEmail,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
