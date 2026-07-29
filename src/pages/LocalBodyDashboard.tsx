import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { MapWidget } from '../components/MapWidget';
import {
  Building2,
  AlertOctagon,
  ClipboardList,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  ListFilter,
} from 'lucide-react';

export const LocalBodyDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { complaints, hotspots, setActiveTab, viewComplaintDetails, stats } = useApp();

  const pendingComplaints = complaints.filter((c) => c.status === 'Pending');
  const inProgressComplaints = complaints.filter((c) => c.status === 'In Progress');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#22223B] text-white p-6 sm:p-8 rounded-3xl border border-[#4A4E69] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C9ADA7] bg-[#4A4E69]/50 px-3 py-1 rounded-full border border-[#9A8C98]/30">
              Sangamner Municipal Corporation
            </span>
            <span className="text-xs text-stone-300 font-mono">
              Zone: North Sanitation Inspectorate
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Municipal Command Center
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm">
            Officer: <strong>{currentUser?.fullName || 'Sanitary Inspector'}</strong> | Managing city-wide waste reports, dispatches, and illegal dumping hotspots.
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

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[18px] border border-[#F2E9E4] shadow-card space-y-2">
          <div className="text-[10px] font-bold text-[#9A8C98] uppercase tracking-wider flex items-center justify-between">
            <span>Total Complaints</span>
            <ClipboardList className="w-4 h-4 text-[#4A4E69]" />
          </div>
          <div className="text-3xl font-light text-[#22223B]">{stats.totalComplaints}</div>
          <p className="text-[11px] text-[#4A4E69]">City-wide reports</p>
        </div>

        <div className="bg-white p-5 rounded-[18px] border border-amber-200/60 shadow-card space-y-2">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
            <span>Action Required</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-light text-amber-900">{stats.pendingCount}</div>
          <p className="text-[11px] text-amber-800/80">Pending dispatch</p>
        </div>

        <div className="bg-white p-5 rounded-[18px] border border-sky-200/60 shadow-card space-y-2">
          <div className="text-[10px] font-bold text-sky-800 uppercase tracking-wider flex items-center justify-between">
            <span>Under Clean-Up</span>
            <Clock className="w-4 h-4 text-sky-600 animate-spin" />
          </div>
          <div className="text-3xl font-light text-sky-900">{stats.inProgressCount}</div>
          <p className="text-[11px] text-sky-800/80">Team dispatched</p>
        </div>

        <div className="bg-white p-5 rounded-[18px] border border-rose-200/60 shadow-card space-y-2">
          <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider flex items-center justify-between">
            <span>Active Hotspots</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-light text-rose-900">{stats.activeHotspots}</div>
          <p className="text-[11px] text-rose-800/80">≥3 reports within 100m</p>
        </div>
      </div>

      {/* Map & Action Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sangamner City-Wide OpenStreetMap View */}
        <div className="lg:col-span-2 bg-white p-5 rounded-[18px] border border-[#F2E9E4] shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-sm font-bold text-[#22223B]">
                Live Dumping GIS Map & Hotspot Clusters
              </h3>
              <p className="text-xs text-[#4A4E69]">
                Red circles denote Frequent Dumping Zones requiring priority clean-up.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('hotspots')}
              className="text-xs font-bold text-rose-700 hover:underline flex items-center gap-1"
            >
              <span>Hotspots ({hotspots.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <MapWidget
            complaints={complaints}
            hotspots={hotspots}
            height="360px"
            onComplaintClick={viewComplaintDetails}
          />
        </div>

        {/* Priority Dispatches Queue */}
        <div className="bg-white p-5 rounded-[18px] border border-[#F2E9E4] shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#F2E9E4] pb-3">
            <div>
              <h3 className="font-heading text-sm font-bold text-[#22223B]">
                Pending Dispatches Queue
              </h3>
              <p className="text-[11px] text-[#4A4E69]">Click to assign officer or update status</p>
            </div>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
              {pendingComplaints.length}
            </span>
          </div>

          {pendingComplaints.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-semibold text-[#22223B]">All pending reports assigned!</p>
              <p className="text-[11px] text-[#4A4E69]">No unassigned dumping complaints.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {pendingComplaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => viewComplaintDetails(c.id)}
                  className="p-3.5 rounded-2xl bg-amber-50/50 hover:bg-amber-100/60 border border-amber-200/80 cursor-pointer transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#22223B]">#{c.id}</span>
                    <CategoryBadge category={c.category} showIcon={false} />
                  </div>

                  <div className="text-xs font-semibold text-[#22223B] flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="truncate">{c.locationName}</span>
                  </div>

                  <div className="text-[11px] text-[#4A4E69] line-clamp-1">{c.description}</div>

                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-amber-200/60">
                    <span>Logged {new Date(c.createdAt).toLocaleDateString()}</span>
                    <span className="text-[#22223B] font-bold hover:underline">Take Action &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
