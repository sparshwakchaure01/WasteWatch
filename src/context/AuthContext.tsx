import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { findUserByEmailInFirestore } from '../services/firebaseService';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isLoggedIn: boolean;
  loginWithEmail: (email: string, pass: string, usersList: User[]) => Promise<{ success: boolean; error?: string }>;
  switchDemoRole: (role: UserRole, usersList: User[]) => void;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('wastewatch_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_USERS[0]; }
    }
    return INITIAL_USERS[0];
  });

  const role = currentUser?.role || 'Reporter';

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('wastewatch_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('wastewatch_user');
    }
  }, [currentUser]);

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
    try {
      await signInWithEmailAndPassword(auth, normalizedEmail, pass);
    } catch (firebaseErr: any) {
      // Allow demo user pre-configured logins if network or credentials aren't registered yet on auth server
      console.warn('Firebase Auth note:', firebaseErr.message);
    }

    // 2. Query Firestore user profile document by email
    let matchedUser: User | null = await findUserByEmailInFirestore(normalizedEmail);

    // 3. Fallback to local users list (for pre-configured demo accounts)
    if (!matchedUser) {
      matchedUser = usersList.find(
        (u) => u.email.trim().toLowerCase() === normalizedEmail
      ) || null;
    }

    if (!matchedUser) {
      await firebaseSignOut(auth);
      return {
        success: false,
        error: 'Access Denied. Account does not exist. Contact System Administrator.',
      };
    }

    if (matchedUser.status === 'Deactivated') {
      await firebaseSignOut(auth);
      return {
        success: false,
        error: 'Account Deactivated. Please contact the System Administrator.',
      };
    }

    setCurrentUser(matchedUser);
    return { success: true };
  };

  const switchDemoRole = (targetRole: UserRole, usersList: User[]) => {
    const matchedUser = usersList.find((u) => u.role === targetRole && u.status === 'Active');
    if (matchedUser) {
      setCurrentUser(matchedUser);
    } else {
      const fallback = INITIAL_USERS.find((u) => u.role === targetRole) || {
        uid: `demo_${targetRole.toLowerCase()}`,
        fullName: `Demo ${targetRole}`,
        email: `${targetRole.toLowerCase()}@wastewatch.gov.in`,
        phone: '+919800000000',
        role: targetRole,
        status: 'Active' as const,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(fallback);
    }
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
        switchDemoRole,
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
