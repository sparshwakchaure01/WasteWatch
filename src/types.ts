export type UserRole = 'Reporter' | 'Local Body' | 'Administrator';

export interface User {
  uid: string;
  fullName: string;
  phone: string;
  role: UserRole;
  department?: string;
  jurisdictionZone?: string;
  createdAt: string;
}

export type WasteCategory =
  | 'Plastic Waste'
  | 'Household Waste'
  | 'Construction Debris'
  | 'Garden Waste'
  | 'Electronic Waste'
  | 'Other';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

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

export interface SystemStats {
  totalComplaints: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  activeHotspots: number;
  categoryDistribution: Record<WasteCategory, number>;
}
