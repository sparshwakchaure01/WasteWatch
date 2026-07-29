import { Complaint, Hotspot, User, AuditLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    uid: 'user_reporter_01',
    fullName: 'Sparsh Wakchaure',
    phone: '+919823012345',
    role: 'Reporter',
    status: 'Active',
    createdAt: '2026-07-01T10:00:00Z'
  },
  {
    uid: 'user_reporter_02',
    fullName: 'Anushree Navale',
    phone: '+919823054321',
    role: 'Reporter',
    status: 'Active',
    createdAt: '2026-07-02T11:30:00Z'
  },
  {
    uid: 'user_localbody_01',
    fullName: 'Inspector Rajesh Patil',
    phone: '+919890011223',
    role: 'Local Body',
    status: 'Active',
    department: 'Sanitation & Waste Management',
    jurisdictionZone: 'Sangamner North Zone',
    createdAt: '2026-06-15T09:00:00Z'
  },
  {
    uid: 'user_admin_01',
    fullName: 'Dr. S. K. Shinde (Admin)',
    phone: '+919890099887',
    role: 'Administrator',
    status: 'Active',
    department: 'Municipal Governance',
    createdAt: '2026-06-01T08:00:00Z'
  }
];

// Coordinates centered around Sangamner / AVCOE College area (19.5768, 74.2070)
export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-2026-001',
    reporterId: 'user_reporter_01',
    reporterName: 'Sparsh Wakchaure',
    reporterPhone: '+919823012345',
    photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800',
    latitude: 19.5781,
    longitude: 74.2085,
    locationName: 'AVCOE Main Gate Road, Sangamner',
    category: 'Plastic Waste',
    description: 'Large pile of single-use plastic bottles, discarded polythene bags dumping near roadside drain.',
    status: 'Pending',
    approvedBy: 'Inspector Rajesh Patil',
    approvedAt: '2026-07-28T09:00:00Z',
    createdAt: '2026-07-28T08:30:00Z',
    updatedAt: '2026-07-28T09:00:00Z'
  },
  {
    id: 'CMP-2026-002',
    reporterId: 'user_reporter_01',
    reporterName: 'Sparsh Wakchaure',
    reporterPhone: '+919823012345',
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=800',
    latitude: 19.5784,
    longitude: 74.2088,
    locationName: 'AVCOE Hostel Corner, Sangamner',
    category: 'Plastic Waste',
    description: 'Overflowing plastic packaging and food wrappers on the footpath.',
    status: 'Pending',
    approvedBy: 'Inspector Rajesh Patil',
    approvedAt: '2026-07-28T09:30:00Z',
    createdAt: '2026-07-28T09:15:00Z',
    updatedAt: '2026-07-28T09:30:00Z'
  },
  {
    id: 'CMP-2026-003',
    reporterId: 'user_reporter_02',
    reporterName: 'Anushree Navale',
    reporterPhone: '+919823054321',
    photoUrl: 'https://images.unsplash.com/photo-1604186837056-8e7c286766f2?auto=format&fit=crop&q=80&w=800',
    latitude: 19.5782,
    longitude: 74.2086,
    locationName: 'Near Ghulewadi Cross Road',
    category: 'Household Waste',
    description: 'Uncovered domestic trash heap leaking liquid onto public road.',
    status: 'Pending',
    approvedBy: 'Inspector Rajesh Patil',
    approvedAt: '2026-07-28T11:00:00Z',
    createdAt: '2026-07-28T10:45:00Z',
    updatedAt: '2026-07-28T11:00:00Z'
  },
  {
    id: 'CMP-2026-004',
    reporterId: 'user_reporter_02',
    reporterName: 'Anushree Navale',
    reporterPhone: '+919823054321',
    photoUrl: 'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?auto=format&fit=crop&q=80&w=800',
    latitude: 19.5720,
    longitude: 74.2140,
    locationName: 'Sangamner Bus Stand Outer Margin',
    category: 'Construction Debris',
    description: 'Broken concrete blocks and discarded plaster rubble dumped on public walkway.',
    status: 'In Progress',
    approvedBy: 'Inspector Rajesh Patil',
    approvedAt: '2026-07-27T15:00:00Z',
    createdAt: '2026-07-27T14:20:00Z',
    updatedAt: '2026-07-28T07:00:00Z'
  },
  {
    id: 'CMP-2026-005',
    reporterId: 'user_reporter_01',
    reporterName: 'Sparsh Wakchaure',
    reporterPhone: '+919823012345',
    photoUrl: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&q=80&w=800',
    latitude: 19.5695,
    longitude: 74.2010,
    locationName: 'Maldad Road Junction, Sangamner',
    category: 'Electronic Waste',
    description: 'Old CRT monitor shell and discarded copper wiring bundles dumped near electric pole.',
    status: 'Resolved',
    approvedBy: 'Inspector Rajesh Patil',
    approvedAt: '2026-07-25T12:00:00Z',
    resolvedBy: 'Inspector Rajesh Patil',
    resolutionNotes: 'Municipal sanitary vehicle dispatched. Site cleared and sanitized.',
    resolvedAt: '2026-07-26T16:00:00Z',
    createdAt: '2026-07-25T11:00:00Z',
    updatedAt: '2026-07-26T16:00:00Z'
  },
  {
    id: 'CMP-2026-006',
    reporterId: 'user_reporter_01',
    reporterName: 'Sparsh Wakchaure',
    reporterPhone: '+919823012345',
    photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800',
    latitude: 19.5750,
    longitude: 74.2100,
    locationName: 'Akole Bypass Chowk, Sangamner',
    category: 'Garden Waste',
    description: 'Fresh cut tree branches piled up near commercial shop front.',
    status: 'Pending Approval',
    createdAt: '2026-07-29T08:00:00Z',
    updatedAt: '2026-07-29T08:00:00Z'
  },
  {
    id: 'CMP-2026-007',
    reporterId: 'user_reporter_02',
    reporterName: 'Anushree Navale',
    reporterPhone: '+919823054321',
    photoUrl: 'https://images.unsplash.com/photo-1604186837056-8e7c286766f2?auto=format&fit=crop&q=80&w=800',
    latitude: 19.5710,
    longitude: 74.2050,
    locationName: 'Private Land near College Road',
    category: 'Other',
    description: 'Small garden leaves inside private property premises.',
    status: 'Rejected',
    rejectionReason: 'Reported location is private agricultural land; outside municipal public jurisdiction.',
    rejectedBy: 'Inspector Rajesh Patil',
    rejectedAt: '2026-07-28T14:00:00Z',
    createdAt: '2026-07-28T12:00:00Z',
    updatedAt: '2026-07-28T14:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-07-29T08:00:00Z',
    userUid: 'user_reporter_01',
    userName: 'Sparsh Wakchaure',
    userRole: 'Reporter',
    action: 'Complaint Submission',
    complaintId: 'CMP-2026-006',
    details: 'Submitted new waste complaint for Akole Bypass Chowk (Pending Approval).'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-07-28T14:00:00Z',
    userUid: 'user_localbody_01',
    userName: 'Inspector Rajesh Patil',
    userRole: 'Local Body',
    action: 'Complaint Rejection',
    complaintId: 'CMP-2026-007',
    details: 'Rejected CMP-2026-007. Reason: Reported location is private agricultural land; outside municipal public jurisdiction.'
  },
  {
    id: 'LOG-003',
    timestamp: '2026-07-28T11:00:00Z',
    userUid: 'user_localbody_01',
    userName: 'Inspector Rajesh Patil',
    userRole: 'Local Body',
    action: 'Complaint Approval',
    complaintId: 'CMP-2026-003',
    details: 'Approved CMP-2026-003. Complaint moved to active municipal queue (Pending).'
  },
  {
    id: 'LOG-004',
    timestamp: '2026-06-15T09:00:00Z',
    userUid: 'user_admin_01',
    userName: 'Dr. S. K. Shinde (Admin)',
    userRole: 'Administrator',
    action: 'User Creation',
    targetUserId: 'user_localbody_01',
    details: 'Created Local Body officer account for Inspector Rajesh Patil (+919890011223).'
  }
];

