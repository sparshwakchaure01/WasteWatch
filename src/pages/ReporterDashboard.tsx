import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { MapWidget } from '../components/MapWidget';
import { PlusCircle, ClipboardList, Clock, CheckCircle2, ArrowRight, MapPin } from 'lucide-react';

export const ReporterDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { complaints, setActiveTab, viewComplaintDetails } = useApp();

  // Filter complaints submitted by current reporter
  const myComplaints = complaints.filter(
    (c) => c.reporterId === currentUser?.uid || c.reporterPhone === currentUser?.phone
  );

  const pendingCount = myComplaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = myComplaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = myComplaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Banner CTA */}
      <div className="bg-[#22223B] text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C9ADA7] bg-[#4A4E69]/40 px-3 py-1 rounded-full border border-[#9A8C98]/30">
            Citizen Action Portal
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {currentUser?.fullName || 'Reporter'}!
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm">
            Spot illegal garbage or construction waste in your neighborhood? Snap a photo and submit a geotagged complaint for instant municipal resolution.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('report-waste')}
          className="z-10 bg-[#C9ADA7] hover:bg-[#bba099] text-[#22223B] font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xl transition-all shrink-0"
        >
          <PlusCircle className="w-5 h-5 text-[#22223B]" />
          <span>Report Illegal Dumping</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[18px] border border-[#F2E9E4] shadow-card space-y-2">
          <div className="text-[10px] font-bold text-[#9A8C98] uppercase tracking-wider flex items-center justify-between">
            <span>Total Reported</span>
            <ClipboardList className="w-4 h-4 text-[#4A4E69]" />
          </div>
          <div className="text-3xl font-light text-[#22223B]">{myComplaints.length}</div>
          <p className="text-[11px] text-[#4A4E69]">Submitted reports</p>
        </div>

        <div className="bg-white p-5 rounded-[18px] border border-amber-200/60 shadow-card space-y-2">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-light text-amber-900">{pendingCount}</div>
          <p className="text-[11px] text-amber-800/80">Awaiting officer dispatch</p>
        </div>

        <div className="bg-white p-5 rounded-[18px] border border-sky-200/60 shadow-card space-y-2">
          <div className="text-[10px] font-bold text-sky-800 uppercase tracking-wider flex items-center justify-between">
            <span>In Clean-Up</span>
            <Clock className="w-4 h-4 text-sky-600 animate-spin" />
          </div>
          <div className="text-3xl font-light text-sky-900">{inProgressCount}</div>
          <p className="text-[11px] text-sky-800/80">Municipal team active</p>
        </div>

        <div className="bg-white p-5 rounded-[18px] border border-emerald-200/60 shadow-card space-y-2">
          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
            <span>Resolved Cases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-light text-emerald-900">{resolvedCount}</div>
          <p className="text-[11px] text-emerald-800/80">Site cleaned & verified</p>
        </div>
      </div>

      {/* Map & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* OpenStreetMap View */}
        <div className="lg:col-span-2 bg-white p-5 rounded-[18px] border border-[#F2E9E4] shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-sm font-bold text-[#22223B]">
                Your Reported Locations Map
              </h3>
              <p className="text-xs text-[#4A4E69]">Geotagged complaint pins in Sangamner</p>
            </div>
            <button
              onClick={() => setActiveTab('my-complaints')}
              className="text-xs font-bold text-[#4A4E69] hover:text-[#22223B] flex items-center gap-1"
            >
              <span>View List</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <MapWidget
            complaints={myComplaints}
            height="320px"
            onComplaintClick={viewComplaintDetails}
          />
        </div>

        {/* Recent Submissions Feed */}
        <div className="bg-white p-5 rounded-[18px] border border-[#F2E9E4] shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-[#22223B]">Recent Submissions</h3>
            <button
              onClick={() => setActiveTab('my-complaints')}
              className="text-xs font-bold text-[#4A4E69] hover:underline"
            >
              See All
            </button>
          </div>

          {myComplaints.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <MapPin className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-xs font-semibold text-[#4A4E69]">No complaints filed yet.</p>
              <button
                onClick={() => setActiveTab('report-waste')}
                className="text-xs font-bold text-[#22223B] underline"
              >
                File your first waste report
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myComplaints.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  onClick={() => viewComplaintDetails(c.id)}
                  className="p-3 rounded-2xl bg-[#F2E9E4]/50 hover:bg-[#F2E9E4] border border-[#9A8C98]/20 cursor-pointer transition-colors flex items-center gap-3"
                >
                  <img
                    src={c.photoUrl}
                    alt={c.category}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-[#22223B] truncate">{c.id}</span>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <div className="text-[11px] text-[#4A4E69] truncate">{c.locationName}</div>
                    <CategoryBadge category={c.category} showIcon={false} />
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
