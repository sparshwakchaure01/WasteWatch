import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import {
  ShieldCheck,
  Users,
  FileBarChart,
  ClipboardList,
  AlertOctagon,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { stats, usersList, complaints, setActiveTab, viewComplaintDetails } = useApp();

  const resolutionRate = stats.totalComplaints > 0
    ? Math.round((stats.resolvedCount / stats.totalComplaints) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-[#22223B] text-white p-6 sm:p-8 rounded-3xl border border-[#4A4E69] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800">
              System Administrator Control Center
            </span>
            <span className="text-xs text-stone-300">Role: System Administrator</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            System Executive Dashboard
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm">
            Administrator: <strong>{currentUser?.fullName || 'Dr. S. K. Shinde'}</strong> | Full system authority, municipal user provisioning, and official PDF audit generation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('analytics')}
            className="bg-[#C9ADA7] hover:bg-[#bba099] text-[#22223B] font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Generate Municipal PDF Report</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[18px] border border-[#F2E9E4] shadow-card space-y-2">
          <div className="text-[10px] font-bold text-[#9A8C98] uppercase tracking-wider flex items-center justify-between">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-[#4A4E69]" />
          </div>
          <div className="text-3xl font-light text-[#22223B]">{usersList.length}</div>
          <p className="text-[11px] text-[#4A4E69]">Reporters & Officers</p>
        </div>

        <div className="bg-white p-5 rounded-[18px] border border-emerald-200/60 shadow-card space-y-2">
          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
            <span>Resolution Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-light text-emerald-900">{resolutionRate}%</div>
          <p className="text-[11px] text-emerald-800/80">{stats.resolvedCount} of {stats.totalComplaints} resolved</p>
        </div>

        <div className="bg-white p-5 rounded-[18px] border border-rose-200/60 shadow-card space-y-2">
          <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider flex items-center justify-between">
            <span>Hotspots Active</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-light text-rose-900">{stats.activeHotspots}</div>
          <p className="text-[11px] text-rose-800/80">Cluster zones</p>
        </div>

        <div className="bg-white p-5 rounded-[18px] border border-amber-200/60 shadow-card space-y-2">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
            <span>Pending Action</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-light text-amber-900">{stats.pendingCount}</div>
          <p className="text-[11px] text-amber-800/80">Unresolved complaints</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Progress Bars */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[18px] border border-[#F2E9E4] shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-sm font-bold text-[#22223B]">
                Waste Category Breakdown
              </h3>
              <p className="text-xs text-[#4A4E69]">Distribution across all logged dumping cases</p>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-bold text-[#4A4E69] hover:text-[#22223B] flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {Object.entries(stats.categoryDistribution).map(([category, count]) => {
              const numCount = Number(count) || 0;
              const percentage = stats.totalComplaints > 0
                ? Math.round((numCount / stats.totalComplaints) * 100)
                : 0;

              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-[#22223B]">
                    <span>{category}</span>
                    <span className="font-mono text-xs">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-[#F2E9E4] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#22223B] h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="bg-white p-6 rounded-[18px] border border-[#F2E9E4] shadow-card space-y-4">
          <h3 className="font-heading text-sm font-bold text-[#22223B]">
            Administrator Actions
          </h3>

          <div className="space-y-3">
            <div
              onClick={() => setActiveTab('my-complaints')}
              className="p-4 rounded-xl bg-[#F2E9E4]/40 hover:bg-[#F2E9E4] border border-[#C9ADA7]/40 cursor-pointer transition-colors space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#22223B] flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-emerald-700" />
                  <span>All Complaints ({stats.totalComplaints})</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#4A4E69]" />
              </div>
              <p className="text-[11px] text-[#4A4E69]">
                View, filter, manage, or delete city-wide waste reports.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('manage-users')}
              className="p-4 rounded-xl bg-[#F2E9E4]/40 hover:bg-[#F2E9E4] border border-[#C9ADA7]/40 cursor-pointer transition-colors space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#22223B] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#22223B]" />
                  <span>Manage Users</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#4A4E69]" />
              </div>
              <p className="text-[11px] text-[#4A4E69]">
                Register local body officers, manage roles, and review accounts.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('analytics')}
              className="p-4 rounded-xl bg-[#F2E9E4]/40 hover:bg-[#F2E9E4] border border-[#C9ADA7]/40 cursor-pointer transition-colors space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#22223B] flex items-center gap-2">
                  <FileBarChart className="w-4 h-4 text-sky-700" />
                  <span>PDF Reports & Analytics</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#4A4E69]" />
              </div>
              <p className="text-[11px] text-[#4A4E69]">
                Export official Daily, Weekly, or Monthly municipal PDFs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
