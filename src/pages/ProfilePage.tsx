import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, User, Phone, ShieldCheck, Award, LogOut, Sparkles } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, role, logout, switchDemoRole } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#9A8C98]/20 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#22223B] text-[#C9ADA7] flex items-center justify-center font-bold text-2xl shadow-md">
            {currentUser?.fullName.charAt(0) || 'U'}
          </div>

          <div className="space-y-1">
            <h2 className="font-heading text-xl font-bold text-[#22223B]">
              {currentUser?.fullName || 'Registered User'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-[#4A4E69] text-white px-3 py-0.5 rounded-full">
                {role} Account
              </span>
              <span className="text-xs text-stone-500 font-mono">{currentUser?.phone}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-stone-100">
          <div className="p-3 bg-stone-50 rounded-2xl">
            <div className="text-[10px] font-bold text-[#4A4E69] uppercase">Department / Entity</div>
            <div className="font-bold text-[#22223B] mt-0.5">
              {currentUser?.department || 'Sangamner Resident / Community Reporter'}
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl">
            <div className="text-[10px] font-bold text-[#4A4E69] uppercase">Jurisdiction Zone</div>
            <div className="font-bold text-[#22223B] mt-0.5">
              {currentUser?.jurisdictionZone || 'Sangamner Municipal Limits'}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={logout}
            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of WasteWatch</span>
          </button>
        </div>
      </div>

      {/* Institutional Metadata Card */}
      <div className="bg-[#22223B] text-white p-6 sm:p-8 rounded-3xl border border-[#4A4E69] shadow-lg space-y-4">
        <div className="flex items-center gap-3 border-b border-[#4A4E69] pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#C9ADA7] text-[#22223B] flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
              Academic & Institutional Credits
            </h3>
            <p className="text-xs text-stone-300">Community Engagement System</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-stone-200">
          <div className="flex justify-between border-b border-[#4A4E69]/50 pb-2">
            <span className="text-stone-400">Project Name:</span>
            <span className="font-bold text-white">WasteWatch - Illegal Dumping Reporting System</span>
          </div>

          <div className="flex justify-between border-b border-[#4A4E69]/50 pb-2">
            <span className="text-stone-400">Institution:</span>
            <span className="font-bold text-white">Amrutvahini College of Engineering, Sangamner</span>
          </div>

          <div className="flex justify-between border-b border-[#4A4E69]/50 pb-2">
            <span className="text-stone-400">Department:</span>
            <span className="font-bold text-white">Computer Engineering</span>
          </div>

          <div className="flex justify-between border-b border-[#4A4E69]/50 pb-2">
            <span className="text-stone-400">Project Team Developers:</span>
            <span className="font-bold text-[#C9ADA7]">Sparsh Wakchaure & Anushree Navale</span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-400">Deployment Architecture:</span>
            <span className="font-bold text-emerald-400">Production Ready (Flutter Web / Firebase)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
