import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  AlertOctagon,
  Users,
  FileBarChart,
  User,
  ShieldCheck,
  Building,
  HelpCircle,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { role } = useAuth();
  const { activeTab, setActiveTab, stats } = useApp();

  const handleNav = (tab: string) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const navClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-[#4A4E69] text-white shadow-sm'
        : 'text-[#C9ADA7] hover:bg-[#4A4E69]/40 hover:text-white'
    }`;
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#22223B] border-r border-[#4A4E69]/40 p-5 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full justify-between pt-16 lg:pt-0">
        <div className="space-y-6">
          {/* Logo Branding */}
          <div className="mb-2 px-1">
            <h1 className="font-logo text-2xl font-bold text-white tracking-tight">
              WASTE<span className="text-[#9A8C98]">WATCH</span>
            </h1>
            <p className="text-[10px] text-[#C9ADA7] tracking-[0.2em] uppercase font-semibold mt-0.5">
              Government Portal
            </p>
          </div>

          {/* Header Role Banner */}
          <div className="p-3 bg-[#4A4E69]/30 rounded-xl border border-[#9A8C98]/20">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="w-4 h-4 text-[#C9ADA7]" />
              <span className="text-xs font-bold uppercase tracking-wider">{role} Portal</span>
            </div>
            <p className="text-[11px] text-[#C9ADA7] mt-1">
              {role === 'Reporter' && 'Submit waste reports & track status'}
              {role === 'Local Body' && 'Municipal authority command center'}
              {role === 'Administrator' && 'User management & PDF analytics'}
            </p>
          </div>

          {/* Nav Items depending on Role */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-[#9A8C98] uppercase tracking-wider px-3 mb-2">
              Navigation
            </div>

            {/* Dashboard (Shared per Role) */}
            <button onClick={() => handleNav('dashboard')} className={navClass('dashboard')}>
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>

            {/* Reporter Navigation */}
            {role === 'Reporter' && (
              <>
                <button
                  onClick={() => handleNav('report-waste')}
                  className={navClass('report-waste')}
                >
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4 text-[#C9ADA7]" />
                    <span>Report Waste</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                    New
                  </span>
                </button>

                <button
                  onClick={() => handleNav('my-complaints')}
                  className={navClass('my-complaints')}
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardList className="w-4 h-4" />
                    <span>My Complaints</span>
                  </div>
                </button>
              </>
            )}

            {/* Local Body Navigation */}
            {role === 'Local Body' && (
              <>
                <button onClick={() => handleNav('hotspots')} className={navClass('hotspots')}>
                  <div className="flex items-center gap-2.5">
                    <AlertOctagon className="w-4 h-4 text-rose-400" />
                    <span>Frequent Zones</span>
                  </div>
                  {stats.activeHotspots > 0 && (
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold px-2 py-0.5 rounded-full">
                      {stats.activeHotspots}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNav('my-complaints')}
                  className={navClass('my-complaints')}
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardList className="w-4 h-4" />
                    <span>All Complaints</span>
                  </div>
                  <span className="text-[10px] bg-[#9A8C98]/20 text-[#C9ADA7] font-bold px-2 py-0.5 rounded-full">
                    {stats.totalComplaints}
                  </span>
                </button>
              </>
            )}

            {/* Admin Navigation */}
            {role === 'Administrator' && (
              <>
                <button
                  onClick={() => handleNav('manage-users')}
                  className={navClass('manage-users')}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    <span>Manage Users</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNav('analytics')}
                  className={navClass('analytics')}
                >
                  <div className="flex items-center gap-2.5">
                    <FileBarChart className="w-4 h-4 text-sky-400" />
                    <span>Analytics & Reports</span>
                  </div>
                </button>

                <button onClick={() => handleNav('hotspots')} className={navClass('hotspots')}>
                  <div className="flex items-center gap-2.5">
                    <AlertOctagon className="w-4 h-4" />
                    <span>Frequent Zones</span>
                  </div>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold px-2 py-0.5 rounded-full">
                    {stats.activeHotspots}
                  </span>
                </button>
              </>
            )}

            {/* Account Settings */}
            <div className="pt-4 border-t border-[#4A4E69]/40 mt-4">
              <div className="text-[10px] font-bold text-[#9A8C98] uppercase tracking-wider px-3 mb-2">
                Account
              </div>
              <button onClick={() => handleNav('profile')} className={navClass('profile')}>
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>Profile & Settings</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info box */}
        <div className="p-3.5 bg-[#4A4E69]/20 border border-[#9A8C98]/20 rounded-xl text-stone-300 text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#C9ADA7]">
            <Building className="w-3.5 h-3.5" />
            <span>WasteWatch Project</span>
          </div>
          <p className="text-[10px] text-stone-400">
            Sparsh Wakchaure & Anushree Navale
          </p>
          <p className="text-[10px] text-[#9A8C98] pt-1 border-t border-[#4A4E69]/40">
            Computer Engg. | AVCOE
          </p>
        </div>
      </div>
    </aside>
  );
};
