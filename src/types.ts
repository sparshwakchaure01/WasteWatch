export type UserRole = 'Reporter' | 'Local Body' | 'Administrator';

export type UserStatus = 'Active' | 'Deactivated';

export interface User {
  uid: string;
  fullName: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  jurisdictionZone?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export type WasteCategory =
  | 'Plastic Waste'
  | 'Household Waste'
  | 'Construction Debris'
  | 'Garden Waste'
  | 'Electronic Waste'
  | 'Other';

export type ComplaintStatus =
  | 'Pending Approval'
  | 'Pending'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export interface GPSLocation {
  latitude: number;
  longitude: number;
  addressName?: string;
}

export interface Complaint {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterPhone: string;
  photoUrl: string;
  latitude: number;
  longitude: number;
  locationName: string;
  category: WasteCategory;
  description: string;
  status: ComplaintStatus;
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  hotspotId?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hotspot {
  id: string;
  centerLat: number;
  centerLng: number;
  locationName: string;
  complaintIds: string[];
  complaintCount: number;
  status: 'Active' | 'Under Clean-Up' | 'Cleared';
  primaryCategory: WasteCategory;
  createdAt: string;
  updatedAt: string;
}

export type AuditAction =
  | 'User Creation'
  | 'User Edit'
  | 'User Deactivation'
  | 'User Activation'
  | 'User Deletion'
  | 'Complaint Submission'
  | 'Complaint Approval'
  | 'Complaint Rejection'
  | 'Complaint Deletion'
  | 'Status Update';

export interface AuditLog {
  id: string;
  timestamp: string;
  userUid: string;
  userName: string;
  userRole: UserRole;
  action: AuditAction;
  complaintId?: string;
  targetUserId?: string;
  details: string;
}

export interface SystemStats {
  totalComplaints: number;
  pendingApprovalCount: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  rejectedCount: number;
  activeHotspots: number;
  categoryDistribution: Record<WasteCategory, number>;
}

