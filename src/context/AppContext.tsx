import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Complaint, Hotspot, ComplaintStatus, WasteCategory, SystemStats, User, AuditLog } from '../types';
import { detectHotspots } from '../utils/hotspotEngine';
import {
  seedInitialFirestoreData,
  subscribeComplaints,
  subscribeUsers,
  subscribeAuditLogs,
  saveComplaintToFirestore,
  updateComplaintInFirestore,
  deleteComplaintFromFirestore,
  saveUserToFirestore,
  updateUserInFirestore,
  deleteUserFromFirestore,
  saveAuditLogToFirestore,
  uploadComplaintPhotoToStorage,
  deleteComplaintPhotoFromStorage,
  syncHotspotsToFirestore
} from '../services/firebaseService';
import { INITIAL_COMPLAINTS, INITIAL_USERS, INITIAL_AUDIT_LOGS } from '../data/initialData';

interface AppContextType {
  complaints: Complaint[];
  hotspots: Hotspot[];
  usersList: User[];
  auditLogs: AuditLog[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string | null) => void;
  addComplaint: (newComplaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status'>, currentUser?: User) => Promise<Complaint>;
  approveComplaint: (id: string, officerName: string, officerUid?: string) => Promise<void>;
  rejectComplaint: (id: string, reason: string, officerName: string, officerUid?: string) => Promise<void>;
  updateComplaintStatus: (id: string, status: ComplaintStatus, notes?: string, officerName?: string, userUid?: string) => Promise<void>;
  deleteComplaint: (id: string, currentUser?: User) => Promise<boolean>;
  addUser: (newUser: Omit<User, 'uid' | 'createdAt' | 'status'>, currentUser?: User) => Promise<User>;
  editUser: (uid: string, updates: Partial<User>, currentUser?: User) => Promise<void>;
  toggleUserStatus: (uid: string, currentUser?: User) => Promise<void>;
  deleteUser: (uid: string, currentUser?: User) => Promise<void>;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => Promise<void>;
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

  // Complaints State initialized with local storage or initial data
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('wastewatch_complaints');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_COMPLAINTS; }
    }
    return INITIAL_COMPLAINTS;
  });

  // Users State
  const [usersList, setUsersList] = useState<User[]>(() => {
    const saved = localStorage.getItem('wastewatch_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_USERS; }
    }
    return INITIAL_USERS;
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('wastewatch_audit_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_AUDIT_LOGS; }
    }
    return INITIAL_AUDIT_LOGS;
  });

  // Initialize and subscribe to real-time Firestore collections
  useEffect(() => {
    // 1. Seed initial data to Firestore if empty
    seedInitialFirestoreData();

    // 2. Real-time Firestore Complaints Listener
    const unsubComplaints = subscribeComplaints((liveComplaints) => {
      if (liveComplaints && liveComplaints.length > 0) {
        setComplaints(liveComplaints);
        localStorage.setItem('wastewatch_complaints', JSON.stringify(liveComplaints));
      }
    });

    // 3. Real-time Firestore Users Listener
    const unsubUsers = subscribeUsers((liveUsers) => {
      if (liveUsers && liveUsers.length > 0) {
        setUsersList(liveUsers);
        localStorage.setItem('wastewatch_users', JSON.stringify(liveUsers));
      }
    });

    // 4. Real-time Firestore Audit Logs Listener
    const unsubAudit = subscribeAuditLogs((liveLogs) => {
      if (liveLogs && liveLogs.length > 0) {
        setAuditLogs(liveLogs);
        localStorage.setItem('wastewatch_audit_logs', JSON.stringify(liveLogs));
      }
    });

    return () => {
      unsubComplaints();
      unsubUsers();
      unsubAudit();
    };
  }, []);

  // Calculate hotspots dynamically based ONLY on approved complaints
  const hotspots = useMemo(() => {
    const calculated = detectHotspots(complaints);
    syncHotspotsToFirestore(calculated);
    return calculated;
  }, [complaints]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addAuditLog = async (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const log: AuditLog = {
      ...logData,
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs((prev) => [log, ...prev]);
    await saveAuditLogToFirestore(log);
  };

  const addComplaint = async (
    data: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
    currentUser?: User
  ): Promise<Complaint> => {
    const newId = `CMP-${new Date().getFullYear()}-${String(complaints.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    // Upload photo to Firebase Storage if base64/dataURL
    let finalPhotoUrl = data.photoUrl;
    if (data.photoUrl && data.photoUrl.startsWith('data:')) {
      finalPhotoUrl = await uploadComplaintPhotoToStorage(newId, data.photoUrl);
    }

    const created: Complaint = {
      ...data,
      photoUrl: finalPhotoUrl,
      id: newId,
      status: 'Pending Approval',
      createdAt: now,
      updatedAt: now,
    };

    // Update local state immediately for snappy UI
    setComplaints((prev) => [created, ...prev]);

    // Save to Firestore
    await saveComplaintToFirestore(created);

    // Record Audit Log
    await addAuditLog({
      userUid: currentUser?.uid || data.reporterId,
      userName: currentUser?.fullName || data.reporterName,
      userRole: currentUser?.role || 'Reporter',
      action: 'Complaint Submission',
      complaintId: newId,
      details: `Submitted waste complaint #${newId} at ${data.locationName} (Pending Approval)`
    });

    showToast(`Complaint #${newId} submitted! Awaiting Local Body approval.`, 'success');
    return created;
  };

  const approveComplaint = async (id: string, officerName: string, officerUid?: string) => {
    const now = new Date().toISOString();
    const updates = {
      status: 'Pending' as const,
      approvedBy: officerName,
      approvedAt: now,
      updatedAt: now,
    };

    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );

    await updateComplaintInFirestore(id, updates);

    await addAuditLog({
      userUid: officerUid || 'user_localbody_01',
      userName: officerName,
      userRole: 'Local Body',
      action: 'Complaint Approval',
      complaintId: id,
      details: `Approved complaint #${id}. Complaint moved to municipal queue.`
    });

    showToast(`Complaint #${id} approved successfully!`, 'success');
  };

  const rejectComplaint = async (id: string, reason: string, officerName: string, officerUid?: string) => {
    const now = new Date().toISOString();
    const updates = {
      status: 'Rejected' as const,
      rejectionReason: reason,
      rejectedBy: officerName,
      rejectedAt: now,
      updatedAt: now,
    };

    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );

    await updateComplaintInFirestore(id, updates);

    await addAuditLog({
      userUid: officerUid || 'user_localbody_01',
      userName: officerName,
      userRole: 'Local Body',
      action: 'Complaint Rejection',
      complaintId: id,
      details: `Rejected complaint #${id}. Reason: ${reason}`
    });

    showToast(`Complaint #${id} rejected. Reason recorded.`, 'info');
  };

  const updateComplaintStatus = async (
    id: string,
    newStatus: ComplaintStatus,
    notes?: string,
    officerName?: string,
    userUid?: string
  ) => {
    const now = new Date().toISOString();
    const target = complaints.find((c) => c.id === id);

    const updates = {
      status: newStatus,
      resolutionNotes: notes || target?.resolutionNotes,
      resolvedBy: officerName || target?.resolvedBy,
      resolvedAt: newStatus === 'Resolved' ? now : target?.resolvedAt,
      updatedAt: now,
    };

    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );

    await updateComplaintInFirestore(id, updates);

    await addAuditLog({
      userUid: userUid || 'user_localbody_01',
      userName: officerName || 'Municipal Officer',
      userRole: 'Local Body',
      action: 'Status Update',
      complaintId: id,
      details: `Updated complaint #${id} status to "${newStatus}"${notes ? `: ${notes}` : ''}`
    });

    showToast(`Complaint #${id} status updated to "${newStatus}"`, 'info');
  };

  const deleteComplaint = async (id: string, currentUser?: User): Promise<boolean> => {
    if (currentUser && currentUser.role !== 'Administrator') {
      showToast('Access Denied: Only System Administrator can delete complaints.', 'error');
      return false;
    }

    const targetComplaint = complaints.find((c) => c.id === id);

    // Remove from local state
    setComplaints((prev) => prev.filter((c) => c.id !== id));

    // Delete document from Firestore
    await deleteComplaintFromFirestore(id);

    // Delete photo from Firebase Storage if present
    if (targetComplaint?.photoUrl) {
      await deleteComplaintPhotoFromStorage(targetComplaint.photoUrl);
    }

    // Write audit log entry
    await addAuditLog({
      userUid: currentUser?.uid || 'user_admin_01',
      userName: currentUser?.fullName || 'System Administrator',
      userRole: 'Administrator',
      action: 'Complaint Deletion',
      complaintId: id,
      details: `Permanently deleted complaint #${id}, removed image from Firebase Storage, and updated analytics.`
    });

    showToast(`Complaint #${id} permanently deleted from Firestore & Storage.`, 'info');
    return true;
  };

  const addUser = async (newUser: Omit<User, 'uid' | 'createdAt' | 'status'>, currentUser?: User): Promise<User> => {
    const user: User = {
      ...newUser,
      uid: `user_${Date.now()}`,
      status: 'Active',
      createdBy: currentUser?.fullName || 'Admin',
      createdAt: new Date().toISOString(),
    };

    setUsersList((prev) => [user, ...prev]);

    // Save to Firestore
    await saveUserToFirestore(user);

    await addAuditLog({
      userUid: currentUser?.uid || 'user_admin_01',
      userName: currentUser?.fullName || 'System Administrator',
      userRole: 'Administrator',
      action: 'User Creation',
      targetUserId: user.uid,
      details: `Created new ${user.role} user: ${user.fullName} (${user.phone})`
    });

    showToast(`Registered new ${user.role}: ${user.fullName}`, 'success');
    return user;
  };

  const editUser = async (uid: string, updates: Partial<User>, currentUser?: User) => {
    const updatedFields = { ...updates, updatedAt: new Date().toISOString() };

    setUsersList((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, ...updatedFields } : u))
    );

    // Update in Firestore
    await updateUserInFirestore(uid, updatedFields);

    await addAuditLog({
      userUid: currentUser?.uid || 'user_admin_01',
      userName: currentUser?.fullName || 'System Administrator',
      userRole: 'Administrator',
      action: 'User Edit',
      targetUserId: uid,
      details: `Updated profile info for user UID: ${uid}`
    });

    showToast(`Updated user details in Firestore.`, 'success');
  };

  const toggleUserStatus = async (uid: string, currentUser?: User) => {
    let newStatus: 'Active' | 'Deactivated' = 'Deactivated';
    const target = usersList.find((u) => u.uid === uid);
    if (target) {
      newStatus = target.status === 'Active' ? 'Deactivated' : 'Active';
    }

    const updates = { status: newStatus, updatedAt: new Date().toISOString() };

    setUsersList((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, ...updates } : u))
    );

    // Update in Firestore
    await updateUserInFirestore(uid, updates);

    await addAuditLog({
      userUid: currentUser?.uid || 'user_admin_01',
      userName: currentUser?.fullName || 'System Administrator',
      userRole: 'Administrator',
      action: newStatus === 'Deactivated' ? 'User Deactivation' : 'User Activation',
      targetUserId: uid,
      details: `${newStatus === 'Deactivated' ? 'Deactivated' : 'Activated'} user UID: ${uid}`
    });

    showToast(`User status set to ${newStatus}.`, 'info');
  };

  const deleteUser = async (uid: string, currentUser?: User) => {
    const userToDelete = usersList.find((u) => u.uid === uid);

    setUsersList((prev) => prev.filter((u) => u.uid !== uid));

    // Delete from Firestore
    await deleteUserFromFirestore(uid);

    await addAuditLog({
      userUid: currentUser?.uid || 'user_admin_01',
      userName: currentUser?.fullName || 'System Administrator',
      userRole: 'Administrator',
      action: 'User Deletion',
      targetUserId: uid,
      details: `Deleted user: ${userToDelete?.fullName || uid}`
    });

    showToast(`User account deleted from Firestore.`, 'info');
  };

  const viewComplaintDetails = (id: string) => {
    setSelectedComplaintId(id);
    setActiveTab('complaint-details');
  };

  // Compute System Statistics (Only Approved complaints count towards public statistics)
  const stats: SystemStats = useMemo(() => {
    const pendingApproval = complaints.filter((c) => c.status === 'Pending Approval').length;
    const pending = complaints.filter((c) => c.status === 'Pending').length;
    const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;
    const rejected = complaints.filter((c) => c.status === 'Rejected').length;

    // Approved complaints total
    const totalApproved = pending + inProgress + resolved;

    const catDist: Record<WasteCategory, number> = {
      'Plastic Waste': 0,
      'Household Waste': 0,
      'Construction Debris': 0,
      'Garden Waste': 0,
      'Electronic Waste': 0,
      Other: 0,
    };

    // Only tally categories for Approved complaints
    complaints
      .filter((c) => c.status === 'Pending' || c.status === 'In Progress' || c.status === 'Resolved')
      .forEach((c) => {
        if (catDist[c.category] !== undefined) {
          catDist[c.category]++;
        } else {
          catDist['Other']++;
        }
      });

    return {
      totalComplaints: totalApproved,
      pendingApprovalCount: pendingApproval,
      pendingCount: pending,
      inProgressCount: inProgress,
      resolvedCount: resolved,
      rejectedCount: rejected,
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
        auditLogs,
        activeTab,
        setActiveTab,
        selectedComplaintId,
        setSelectedComplaintId,
        addComplaint,
        approveComplaint,
        rejectComplaint,
        updateComplaintStatus,
        deleteComplaint,
        addUser,
        editUser,
        toggleUserStatus,
        deleteUser,
        addAuditLog,
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
