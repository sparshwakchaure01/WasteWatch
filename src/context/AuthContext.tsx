import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isLoggedIn: boolean;
  loginWithPhone: (phone: string, otp: string, role?: UserRole) => Promise<boolean>;
  switchDemoRole: (role: UserRole) => void;
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
    return INITIAL_USERS[0]; // Default to reporter
  });

  const role = currentUser?.role || 'Reporter';

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('wastewatch_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('wastewatch_user');
    }
  }, [currentUser]);

  const loginWithPhone = async (phone: string, otp: string, desiredRole: UserRole = 'Reporter'): Promise<boolean> => {
    // Simulate real phone OTP verification
    await new Promise((res) => setTimeout(res, 800));

    // Find existing user or create a new registered user
    let user = INITIAL_USERS.find((u) => u.phone === phone);
    if (!user) {
      user = {
        uid: `user_${Date.now()}`,
        fullName: desiredRole === 'Local Body' ? 'Officer ' + phone.slice(-4) : 'Citizen Reporter',
        phone,
        role: desiredRole,
        createdAt: new Date().toISOString()
      };
    }
    setCurrentUser(user);
    return true;
  };

  const switchDemoRole = (targetRole: UserRole) => {
    const matchedUser = INITIAL_USERS.find((u) => u.role === targetRole);
    if (matchedUser) {
      setCurrentUser(matchedUser);
    } else {
      setCurrentUser({
        uid: `demo_${targetRole.toLowerCase()}`,
        fullName: `Demo ${targetRole}`,
        phone: '+919800000000',
        role: targetRole,
        createdAt: new Date().toISOString()
      });
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
