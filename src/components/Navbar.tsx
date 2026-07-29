import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  ShieldAlert,
  UserCheck,
  Building2,
  ChevronDown,
  LogOut,
  Bell,
  Menu,
  X,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { currentUser, role, switchDemoRole, logout } = useAuth();
  const { setActiveTab, stats, usersList } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleBadgeStyle = (r: UserRole) => {
    switch (r) {
      case 'Administrator':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Local Body':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'US';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#22223B] text-white border-b border-[#4A4E69]/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Menu Toggle + Logo Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-[#C9ADA7] hover:text-white hover:bg-[#4A4E69]/40 lg:hidden focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C9ADA7] flex items-center justify-center text-[#22223B] font-bold shadow-sm group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5 text-[#22223B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-logo text-xl tracking-tight text-white group-hover:text-[#C9ADA7] transition-colors">
                  WasteWatch
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold bg-[#4A4E69] text-[#C9ADA7] px-2 py-0.5 rounded-md border border-[#9A8C98]/30 uppercase tracking-wider">
                  AVCOE Sangamner
                </span>
              </div>
              <p className="text-[10px] text-[#C9ADA7] hidden md:block font-medium">
                Illegal Dumping Reporting System
              </p>
            </div>
          </div>
        </div>

        {/* Center: Institutional Accreditation Badge (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-[#C9ADA7] bg-[#4A4E69]/30 px-3.5 py-1.5 rounded-full border border-[#9A8C98]/20">
          <Building2 className="w-3.5 h-3.5 text-[#C9ADA7]" />
          <span>Computer Engg. | Amrutvahini College of Engineering</span>
        </div>

        {/* Right Actions & Demo Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Active Hotspots Alert Pill */}
          {stats.activeHotspots > 0 && (
            <button
              onClick={() => setActiveTab('hotspots')}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1 rounded-full animate-pulse"
              title="View Active Frequent Dumping Zones"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>{stats.activeHotspots} Hotspot{stats.activeHotspots > 1 ? 's' : ''}</span>
            </button>
          )}

          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${getRoleBadgeStyle(
                role
              )}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{role}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#22223B] border border-[#4A4E69] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-bold text-[#9A8C98] uppercase tracking-wider border-b border-[#4A4E69]/50 mb-1">
                  Switch Active Role (Demo)
                </div>
                {(['Reporter', 'Local Body', 'Administrator'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchDemoRole(r, usersList);
                      setShowRoleMenu(false);
                      setActiveTab('dashboard');
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-[#4A4E69]/40 transition-colors ${
                      role === r ? 'text-[#C9ADA7] font-bold' : 'text-stone-300'
                    }`}
                  >
                    <span>{r} View</span>
                    {role === r && <UserCheck className="w-3.5 h-3.5 text-[#C9ADA7]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Pill & Logout */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#4A4E69]/60">
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[#4A4E69] border border-[#9A8C98]/40 flex items-center justify-center text-xs font-bold text-[#F2E9E4]">
                {getInitials(currentUser?.fullName)}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-stone-100 leading-tight">
                  {currentUser?.fullName || 'User'}
                </div>
                <div className="text-[10px] text-[#C9ADA7] leading-tight">{currentUser?.phone}</div>
              </div>
            </button>

            <button
              onClick={logout}
              className="p-2 text-[#C9ADA7] hover:text-white hover:bg-rose-500/20 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
