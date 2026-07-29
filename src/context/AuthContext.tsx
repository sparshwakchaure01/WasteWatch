import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { findUserByPhoneInFirestore } from '../services/firebaseService';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isLoggedIn: boolean;
  loginWithPhone: (phone: string, otp: string, usersList: User[]) => Promise<{ success: boolean; error?: string }>;
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
   * Phone Verification with Firestore Pre-Registered User Check.
   * Self-registration is disabled. Users MUST be created in Firestore by an Administrator.
   */
  const loginWithPhone = async (
    phone: string,
    otp: string,
    usersList: User[]
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedPhone = phone.trim().replace(/\s+/g, '');

    // 1. Try querying Firestore first
    let matchedUser: User | null = await findUserByPhoneInFirestore(phone);

    // 2. Fallback to local users list if network/offline
    if (!matchedUser) {
      matchedUser = usersList.find(
        (u) => u.phone.trim().replace(/\s+/g, '') === normalizedPhone
      ) || null;
    }

    if (!matchedUser) {
      return {
        success: false,
        error: 'Access Denied. Contact Administrator.',
      };
    }

    if (matchedUser.status === 'Deactivated') {
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
        phone: '+919800000000',
        role: targetRole,
        status: 'Active' as const,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(fallback);
    }
  };

  const logout = () => {
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
        loginWithPhone,
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
