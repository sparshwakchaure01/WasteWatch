import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { MapWidget } from '../components/MapWidget';
import { SafeImage } from '../components/SafeImage';
import { Complaint } from '../types';
import {
  AlertOctagon,
  Clock,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
} from 'lucide-react';

export const LocalBodyDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { complaints, hotspots, setActiveTab, viewComplaintDetails, stats, approveComplaint, rejectComplaint } = useApp();

  // Rejection Modal state
  const [rejectingComplaint, setRejectingComplaint] = useState<Complaint | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  // Queue tab filter
  const [activeQueueTab, setActiveQueueTab] = useState<'pending-approval' | 'pending' | 'in-progress' | 'all'>('pending-approval');

  const pendingApprovalComplaints = complaints.filter((c) => c.status === 'Pending Approval');
  const pendingComplaints = complaints.filter((c) => c.status === 'Pending');

  const handleOpenReject = (c: Complaint, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRejectingComplaint(c);
    setRejectionReason('');
    setRejectError('');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setRejectError('Officer rejection reason is mandatory before rejecting.');
      return;
    }
    if (rejectingComplaint) {
      rejectComplaint(
        rejectingComplaint.id,
        rejectionReason.trim(),
        currentUser?.fullName || 'Municipal Officer',
        currentUser?.uid
      );
      setRejectingComplaint(null);
      setRejectionReason('');
    }
  };

  const handleApprove = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    approveComplaint(id, currentUser?.fullName || 'Municipal Officer', currentUser?.uid);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#22223B] text-white p-6 sm:p-8 rounded-3xl border border-[#4A4E69] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C9ADA7] bg-[#4A4E69]/50 px-3 py-1 rounded-full border border-[#9A8C98]/30">
              Sangamner Municipal Corporation
            </span>
            <span className="text-xs text-stone-300 font-mono">
              Zone: North Sanitation Inspectorate
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Municipal Inspector Dashboard
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm">
            Officer: <strong>{currentUser?.fullName || 'Sanitary Inspector'}</strong> | Managing complaint approvals, dispatches, and illegal dumping hotspots.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('hotspots')}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Frequent Zones ({hotspots.length})</span>
          </button>
        </div>
      </div>

      {/* Workflow Status Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Pending Approval */}
        <div
          onClick={() => setActiveQueueTab('pending-approval')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeQueueTab === 'pending-approval'
              ? 'bg-purple-100 border-purple-400 shadow-md ring-2 ring-purple-500'
              : 'bg-white border-purple-200/80 hover:bg-purple-50/50 shadow-card'
          }`}
        >
          <div className="text-[10px] font-bold text-purple-800 uppercase tracking-wider flex items-center justify-between">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900 mt-1">{stats.pendingApprovalCount}</div>
          <p className="text-[10px] text-purple-700 mt-0.5">Approval required</p>
        </div>

        {/* Pending */}
        <div
          onClick={() => setActiveQueueTab('pending')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeQueueTab === 'pending'
              ? 'bg-amber-100 border-amber-400 shadow-md ring-2 ring-amber-500'
              : 'bg-white border-amber-200/80 hover:bg-amber-50/50 shadow-card'
          }`}
        >
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
            <span>Pending Action</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-1">{stats.pendingCount}</div>
          <p className="text-[10px] text-amber-800">Approved & awaiting crew</p>
        </div>

        {/* In Progress */}
        <div
          onClick={() => setActiveQueueTab('in-progress')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeQueueTab === 'in-progress'
              ? 'bg-sky-100 border-sky-400 shadow-md ring-2 ring-sky-500'
              : 'bg-white border-sky-200/80 hover:bg-sky-50/50 shadow-card'
          }`}
        >
          <div className="text-[10px] font-bold text-sky-800 uppercase tracking-wider flex items-center justify-between">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-sky-600 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div className="text-2xl font-bold text-sky-900 mt-1">{stats.inProgressCount}</div>
          <p className="text-[10px] text-sky-800">Vehicle dispatched</p>
        </div>

        {/* Resolved */}
        <div
          onClick={() => setActiveQueueTab('all')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeQueueTab === 'all'
              ? 'bg-emerald-100 border-emerald-400 shadow-md ring-2 ring-emerald-500'
              : 'bg-white border-emerald-200/80 hover:bg-emerald-50/50 shadow-card'
          }`}
        >
          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{stats.resolvedCount}</div>
          <p className="text-[10px] text-emerald-800">Cleared & sanitized</p>
        </div>

        {/* Rejected */}
        <div
          onClick={() => setActiveQueueTab('all')}
          className="p-4 rounded-2xl border bg-white border-rose-200/80 shadow-card space-y-0.5 cursor-pointer"
        >
          <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider flex items-center justify-between">
            <span>Rejected</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-900 mt-1">{stats.rejectedCount}</div>
          <p className="text-[10px] text-rose-800">Private / Invalid zone</p>
        </div>
      </div>

      {/* Pending Approval Officer Queue */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#F2E9E4] shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#F2E9E4] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-700" />
              <h3 className="font-heading text-lg font-bold text-[#22223B]">
                Pending Approval Review Queue
              </h3>
              <span className="bg-purple-100 text-purple-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {pendingApprovalComplaints.length}
              </span>
            </div>
            <p className="text-xs text-[#4A4E69] mt-0.5">
              Review new citizen waste reports. Approved reports become active dispatches and contribute to GIS hotspots.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveQueueTab('pending-approval')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeQueueTab === 'pending-approval' ? 'bg-purple-700 text-white shadow' : 'text-stone-600 hover:text-black'
              }`}
            >
              Approval Queue ({pendingApprovalComplaints.length})
            </button>
            <button
              onClick={() => setActiveQueueTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeQueueTab === 'pending' ? 'bg-[#22223B] text-white shadow' : 'text-stone-600 hover:text-black'
              }`}
            >
              Dispatch Queue ({pendingComplaints.length})
            </button>
            <button
              onClick={() => setActiveQueueTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeQueueTab === 'all' ? 'bg-[#22223B] text-white shadow' : 'text-stone-600 hover:text-black'
              }`}
            >
              All Records
            </button>
          </div>
        </div>

        {/* Display pending approval queue or filtered list */}
        {activeQueueTab === 'pending-approval' && (
          pendingApprovalComplaints.length === 0 ? (
            <div className="text-center py-10 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
              <CheckCircle className="w-10 h-10 text-purple-600 mx-auto" />
              <p className="text-sm font-bold text-[#22223B]">No Complaints Pending Approval!</p>
              <p className="text-xs text-[#4A4E69]">All submitted reports have been reviewed by municipal officers.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingApprovalComplaints.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border-2 border-purple-200 rounded-2xl p-4 shadow-sm hover:border-purple-400 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-md">
                          #{c.id}
                        </span>
                        <StatusBadge status={c.status} size="sm" />
                      </div>
                      <span className="text-[10px] text-stone-500 font-medium">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-stone-200 bg-stone-900">
                        <SafeImage
                          src={c.photoUrl}
                          alt="Waste location"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <CategoryBadge category={c.category} size="sm" />
                        <p className="text-xs font-bold text-[#22223B] truncate flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span className="truncate">{c.locationName}</span>
                        </p>
                        <p className="text-xs text-stone-600 line-clamp-2">{c.description}</p>
                      </div>
                    </div>

                    <div className="bg-stone-50 p-2 rounded-xl text-[11px] text-[#4A4E69] flex justify-between items-center">
                      <span>Reporter: <strong>{c.reporterName}</strong> ({c.reporterPhone})</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => viewComplaintDetails(c.id)}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-bold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleOpenReject(c, e)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={(e) => handleApprove(c.id, e)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Map & Dispatches View for other tabs */}
        {activeQueueTab !== 'pending-approval' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-xs text-[#22223B] uppercase tracking-wider">
                Approved Dumping Map View
              </h4>
              <MapWidget
                complaints={complaints}
                hotspots={hotspots}
                height="340px"
                onComplaintClick={viewComplaintDetails}
              />
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              <h4 className="font-bold text-xs text-[#22223B] uppercase tracking-wider">
                {activeQueueTab === 'pending' ? 'Pending Dispatches' : activeQueueTab === 'in-progress' ? 'Active Dispatches' : 'Complaints Overview'}
              </h4>
              {complaints
                .filter((c) => {
                  if (activeQueueTab === 'pending') return c.status === 'Pending';
                  if (activeQueueTab === 'in-progress') return c.status === 'In Progress';
                  return true;
                })
                .map((c) => (
                  <div
                    key={c.id}
                    onClick={() => viewComplaintDetails(c.id)}
                    className="p-3 rounded-2xl border bg-stone-50 hover:bg-stone-100/80 cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#22223B]">#{c.id}</span>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <p className="text-xs font-semibold text-[#22223B] truncate">{c.locationName}</p>
                    <p className="text-[11px] text-stone-500 line-clamp-1">{c.description}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Rejection Modal Dialog */}
      {rejectingComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-[#22223B]">
                  Reject Complaint #{rejectingComplaint.id}
                </h3>
                <p className="text-xs text-[#4A4E69]">Provide official reason for rejection</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl">
              Location: <strong>{rejectingComplaint.locationName}</strong><br />
              Reporter: <strong>{rejectingComplaint.reporterName}</strong>
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#22223B] mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    setRejectError('');
                  }}
                  placeholder="e.g. Reported location is on private property; outside municipal jurisdiction."
                  rows={3}
                  className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-[#22223B]"
                  required
                />
              </div>

              {rejectError && <p className="text-xs font-bold text-rose-600">{rejectError}</p>}

              <p className="text-[11px] text-stone-500">
                Note: Rejected complaints will be visible only to the reporter with the rejection reason. They will never appear publicly or in statistics.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingComplaint(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
