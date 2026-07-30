import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ComplaintStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { MapWidget } from '../components/MapWidget';
import { SafeImage } from '../components/SafeImage';
import { formatCoordinates } from '../utils/geo';
import {
  ArrowLeft,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const ComplaintDetailsPage: React.FC = () => {
  const { role, currentUser } = useAuth();
  const { complaints, selectedComplaintId, setActiveTab, updateComplaintStatus, approveComplaint, rejectComplaint, deleteComplaint } = useApp();

  const complaint = complaints.find((c) => c.id === selectedComplaintId) || complaints[0];

  const [newStatus, setNewStatus] = useState<ComplaintStatus>(complaint?.status || 'Pending');
  const [resolutionNotes, setResolutionNotes] = useState(complaint?.resolutionNotes || '');
  const [officerName, setOfficerName] = useState(currentUser?.fullName || 'Inspector Rajesh Patil');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Rejection and Deletion Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('Duplicate or test complaint');

  if (!complaint) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-semibold text-[#4A4E69]">No complaint selected.</p>
        <button
          onClick={() => setActiveTab('my-complaints')}
          className="px-4 py-2 bg-[#22223B] text-white rounded-xl text-xs font-bold"
        >
          Return to Complaints List
        </button>
      </div>
    );
  }

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    setTimeout(() => {
      updateComplaintStatus(complaint.id, newStatus, resolutionNotes, officerName);
      setIsUpdating(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    }, 500);
  };

  const handleApprove = () => {
    approveComplaint(complaint.id, currentUser?.fullName || 'Municipal Officer', currentUser?.uid);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    rejectComplaint(complaint.id, rejectionReason.trim(), currentUser?.fullName || 'Municipal Officer', currentUser?.uid);
    setShowRejectModal(false);
  };

  const handleConfirmDelete = () => {
    deleteComplaint(complaint.id, currentUser);
    setShowDeleteModal(false);
    setActiveTab('my-complaints');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Admin Delete Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('my-complaints')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#4A4E69] hover:text-[#22223B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints</span>
        </button>

        {role === 'Administrator' && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Delete Complaint (Admin Only)</span>
          </button>
        )}
      </div>

      {/* Main Detail Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#9A8C98]/20 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#4A4E69] bg-stone-100 px-2.5 py-1 rounded-lg">
                #{complaint.id}
              </span>
              <StatusBadge status={complaint.status} size="lg" />
            </div>
            <h2 className="font-heading text-xl font-bold text-[#22223B] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{complaint.locationName}</span>
            </h2>
          </div>

          <CategoryBadge category={complaint.category} />
        </div>

        {/* Rejection Alert Banner */}
        {complaint.status === 'Rejected' && complaint.rejectionReason && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Complaint Rejected by Municipal Inspector</span>
            </div>
            <p className="font-medium text-rose-950">{complaint.rejectionReason}</p>
            <p className="text-[10px] text-rose-700 italic">
              Note: Rejected complaints are visible only to you and do not appear on municipal maps or stats.
            </p>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-stone-50 rounded-2xl">
            <div className="text-[#4A4E69] text-[10px] uppercase font-bold mb-1">Reporter</div>
            <div className="font-bold text-[#22223B] truncate">{complaint.reporterName}</div>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl">
            <div className="text-[#4A4E69] text-[10px] uppercase font-bold mb-1">Contact Phone</div>
            <div className="font-bold text-[#22223B] font-mono">{complaint.reporterPhone}</div>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl">
            <div className="text-[#4A4E69] text-[10px] uppercase font-bold mb-1">Submitted On</div>
            <div className="font-bold text-[#22223B]">
              {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                dateStyle: 'medium',
              })}
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl">
            <div className="text-[#4A4E69] text-[10px] uppercase font-bold mb-1">GPS Point</div>
            <div className="font-bold text-[#22223B] font-mono">
              {formatCoordinates(complaint.latitude, complaint.longitude)}
            </div>
          </div>
        </div>
      </div>

      {/* Approval Actions for Officers if Pending Approval */}
      {complaint.status === 'Pending Approval' && (role === 'Local Body' || role === 'Administrator') && (
        <div className="bg-purple-900 text-white p-6 rounded-3xl border border-purple-700 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-300" />
            <h3 className="font-heading text-base font-bold">Officer Approval Required</h3>
          </div>
          <p className="text-xs text-purple-200">
            This complaint is currently in <strong>Pending Approval</strong> state. Approving it will register it as an active dispatch (Pending) and include it in city GIS statistics.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleApprove}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve Complaint</span>
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Complaint</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo Evidence & Description */}
        <div className="bg-white p-6 rounded-3xl border border-[#9A8C98]/20 shadow-sm space-y-4">
          <h3 className="font-heading text-sm font-bold text-[#22223B] uppercase tracking-wider">
            Photo Evidence
          </h3>
          <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-inner h-64 bg-stone-900">
            <SafeImage
              src={complaint.photoUrl}
              alt={complaint.category}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#22223B] uppercase tracking-wider">
              Description & Field Notes
            </h4>
            <p className="text-xs text-[#4A4E69] bg-[#F2E9E4]/40 p-3 rounded-2xl leading-relaxed border border-[#9A8C98]/20">
              {complaint.description}
            </p>
          </div>
        </div>

        {/* Location Map & Resolution Timeline */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#9A8C98]/20 shadow-sm space-y-3">
            <h3 className="font-heading text-sm font-bold text-[#22223B] uppercase tracking-wider">
              Geotagged Location Map
            </h3>
            <MapWidget
              center={[complaint.latitude, complaint.longitude]}
              selectedLocation={{ lat: complaint.latitude, lng: complaint.longitude }}
              height="200px"
            />
          </div>

          {/* Timeline & Resolution Status */}
          <div className="bg-white p-6 rounded-3xl border border-[#9A8C98]/20 shadow-sm space-y-4">
            <h3 className="font-heading text-sm font-bold text-[#22223B] uppercase tracking-wider">
              Resolution Audit Trail
            </h3>

            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-stone-200">
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </div>
                <div className="text-xs">
                  <div className="font-bold text-[#22223B]">Complaint Submitted</div>
                  <div className="text-[10px] text-stone-500">
                    {new Date(complaint.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {complaint.status !== 'Pending Approval' && complaint.status !== 'Rejected' && (
                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-[#22223B]">Officer Approved</div>
                    <div className="text-[10px] text-stone-500">Queued for sanitation dispatch</div>
                  </div>
                </div>
              )}

              {(complaint.status === 'In Progress' || complaint.status === 'Resolved') && (
                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-[#22223B]">
                      Sanitation Team Dispatched (In Progress)
                    </div>
                  </div>
                </div>
              )}

              {complaint.status === 'Resolved' && (
                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    4
                  </div>
                  <div className="text-xs space-y-0.5">
                    <div className="font-bold text-emerald-800">Site Cleaned & Resolved</div>
                    {complaint.resolvedBy && (
                      <div className="text-[11px] text-[#4A4E69]">
                        Verified by: <strong>{complaint.resolvedBy}</strong>
                      </div>
                    )}
                    {complaint.resolutionNotes && (
                      <div className="text-[11px] text-[#4A4E69] italic bg-emerald-50 p-2 rounded-xl border border-emerald-200 mt-1">
                        "{complaint.resolutionNotes}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Municipal Authority Action Modal / Form */}
      {(role === 'Local Body' || role === 'Administrator') && complaint.status !== 'Pending Approval' && (
        <div className="bg-[#22223B] text-white p-6 sm:p-8 rounded-3xl border border-[#4A4E69] shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#4A4E69] pb-3">
            <ShieldCheck className="w-5 h-5 text-[#C9ADA7]" />
            <h3 className="font-heading text-base font-bold text-white">
              Municipal Inspector Action Panel
            </h3>
          </div>

          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#C9ADA7] mb-1">
                  Update Complaint Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                  className="w-full p-2.5 rounded-xl bg-[#4A4E69]/50 border border-[#9A8C98]/40 text-xs font-bold text-white focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C9ADA7] mb-1">
                  Inspector Name *
                </label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#4A4E69]/50 border border-[#9A8C98]/40 text-xs font-medium text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C9ADA7] mb-1">
                Sanitation Work & Resolution Notes
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Details of vehicle dispatched, tonnage of waste cleared, or prevention notices issued..."
                rows={3}
                className="w-full p-3 rounded-2xl bg-[#4A4E69]/50 border border-[#9A8C98]/40 text-xs text-white focus:outline-none"
              />
            </div>

            {updateSuccess && (
              <p className="text-xs font-bold text-emerald-400 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800">
                ✓ Complaint status updated successfully!
              </p>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="px-6 py-3 bg-[#C9ADA7] hover:bg-[#bba099] text-[#22223B] font-bold text-xs rounded-xl shadow transition-all"
              >
                {isUpdating ? 'Saving Update...' : 'Confirm Status Update'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-heading text-lg font-bold text-rose-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>Reject Complaint #{complaint.id}</span>
            </h3>
            <form onSubmit={handleConfirmReject} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#22223B] mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Garbage is on private residential land; outside municipal jurisdiction."
                  rows={3}
                  className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-[#22223B]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl shadow"
                >
                  Reject Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-[#22223B]">
                  Permanently Delete Complaint?
                </h3>
                <p className="text-xs text-stone-500">Admin Authority Action</p>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl text-xs space-y-1 text-[#4A4E69]">
              <p>Complaint ID: <strong>#{complaint.id}</strong></p>
              <p>Location: <strong>{complaint.locationName}</strong></p>
              <p className="text-rose-700 font-semibold pt-1">
                This action will:
              </p>
              <ul className="list-disc list-inside text-[11px] text-rose-800 space-y-0.5">
                <li>Permanently remove document record from Firestore</li>
                <li>Recalculate live GIS hotspots & clusters</li>
                <li>Remove from analytics & aggregate metrics</li>
                <li>Write an immutable deletion entry to system audit logs</li>
              </ul>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#22223B] mb-1">
                Deletion Audit Reason
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow"
              >
                Permanently Delete Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
