import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ComplaintStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { MapWidget } from '../components/MapWidget';
import { formatCoordinates } from '../utils/geo';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Phone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export const ComplaintDetailsPage: React.FC = () => {
  const { role, currentUser } = useAuth();
  const { complaints, selectedComplaintId, setActiveTab, updateComplaintStatus } = useApp();

  const complaint = complaints.find((c) => c.id === selectedComplaintId) || complaints[0];

  const [newStatus, setNewStatus] = useState<ComplaintStatus>(complaint?.status || 'Pending');
  const [resolutionNotes, setResolutionNotes] = useState(complaint?.resolutionNotes || '');
  const [officerName, setOfficerName] = useState(currentUser?.fullName || 'Inspector Rajesh Patil');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <button
        onClick={() => setActiveTab('my-complaints')}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#4A4E69] hover:text-[#22223B] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Complaints</span>
      </button>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo Evidence & Description */}
        <div className="bg-white p-6 rounded-3xl border border-[#9A8C98]/20 shadow-sm space-y-4">
          <h3 className="font-heading text-sm font-bold text-[#22223B] uppercase tracking-wider">
            Photo Evidence
          </h3>
          <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-inner">
            <img
              src={complaint.photoUrl}
              alt={complaint.category}
              className="w-full h-64 object-cover"
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
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </div>
                <div className="text-xs">
                  <div className="font-bold text-[#22223B]">Complaint Logged</div>
                  <div className="text-[10px] text-stone-500">
                    {new Date(complaint.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {complaint.status !== 'Pending' && (
                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-[#22223B]">
                      Sanitation Team Dispatched (In Progress)
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Assigned to Local Body Authority
                    </div>
                  </div>
                </div>
              )}

              {complaint.status === 'Resolved' && (
                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    3
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

      {/* Municipal Authority Action Modal / Form (Page 9) */}
      {(role === 'Local Body' || role === 'Administrator') && (
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
    </div>
  );
};
