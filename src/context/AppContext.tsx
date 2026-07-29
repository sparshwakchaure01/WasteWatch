import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Complaint, Hotspot, ComplaintStatus, WasteCategory, SystemStats, User } from '../types';
import { INITIAL_COMPLAINTS, INITIAL_HOTSPOTS, INITIAL_USERS } from '../data/initialData';
import { detectHotspots } from '../utils/hotspotEngine';

interface AppContextType {
  complaints: Complaint[];
  hotspots: Hotspot[];
  usersList: User[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string | null) => void;
  addComplaint: (newComplaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Complaint;
  updateComplaintStatus: (id: string, status: ComplaintStatus, notes?: string, officerName?: string) => void;
  deleteComplaint: (id: string) => void;
  addUser: (newUser: Omit<User, 'uid' | 'createdAt'>) => void;
  stats: SystemStats;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  viewComplaintDetails: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Complaints state initialized with local storage fallback
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('wastewatch_complaints');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_COMPLAINTS; }
    }
    return INITIAL_COMPLAINTS;
  });

  const [usersList, setUsersList] = useState<User[]>(() => {
    const saved = localStorage.getItem('wastewatch_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_USERS; }
    }
    return INITIAL_USERS;
  });

  // Calculate hotspots dynamically based on active complaints
  const hotspots = useMemo(() => {
    return detectHotspots(complaints);
  }, [complaints]);

  // Persist complaints & users
  useEffect(() => {
    localStorage.setItem('wastewatch_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('wastewatch_users', JSON.stringify(usersList));
  }, [usersList]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addComplaint = (data: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Complaint => {
    const newId = `CMP-${new Date().getFullYear()}-${String(complaints.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const created: Complaint = {
      ...data,
      id: newId,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    };

    setComplaints((prev) => [created, ...prev]);
    showToast(`Complaint #${newId} registered successfully!`, 'success');
    return created;
  };

  const updateComplaintStatus = (
    id: string,
    newStatus: ComplaintStatus,
    notes?: string,
    officerName?: string
  ) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: newStatus,
            resolutionNotes: notes || c.resolutionNotes,
            resolvedBy: officerName || c.resolvedBy,
            resolvedAt: newStatus === 'Resolved' ? new Date().toISOString() : c.resolvedAt,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
    showToast(`Complaint #${id} updated to "${newStatus}"`, 'info');
  };

  const deleteComplaint = (id: string) => {
    setComplaints((prev) => prev.filter((c) => c.id !== id));
    showToast(`Complaint #${id} removed.`, 'info');
  };

  const addUser = (newUser: Omit<User, 'uid' | 'createdAt'>) => {
    const user: User = {
      ...newUser,
      uid: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsersList((prev) => [user, ...prev]);
    showToast(`Added ${user.role} user: ${user.fullName}`, 'success');
  };

  const viewComplaintDetails = (id: string) => {
    setSelectedComplaintId(id);
    setActiveTab('complaint-details');
  };

  // Compute System Statistics
  const stats: SystemStats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === 'Pending').length;
    const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;

    const catDist: Record<WasteCategory, number> = {
      'Plastic Waste': 0,
      'Household Waste': 0,
      'Construction Debris': 0,
      'Garden Waste': 0,
      'Electronic Waste': 0,
      Other: 0,
    };

    complaints.forEach((c) => {
      if (catDist[c.category] !== undefined) {
        catDist[c.category]++;
      } else {
        catDist['Other']++;
      }
    });

    return {
      totalComplaints: total,
      pendingCount: pending,
      inProgressCount: inProgress,
      resolvedCount: resolved,
      activeHotspots: hotspots.length,
      categoryDistribution: catDist,
    };
  }, [complaints, hotspots]);

  return (
    <AppContext.Provider
      value={{
        complaints,
        hotspots,
        usersList,
        activeTab,
        setActiveTab,
        selectedComplaintId,
        setSelectedComplaintId,
        addComplaint,
        updateComplaintStatus,
        deleteComplaint,
        addUser,
        stats,
        toast,
        showToast,
        viewComplaintDetails,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
