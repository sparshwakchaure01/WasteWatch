import React from 'react';
import { ShieldAlert, ArrowRight, Building2, CheckCircle, MapPin, Award } from 'lucide-react';

interface SplashScreenProps {
  onContinue: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-[#22223B] text-white flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
      {/* Background Subtle Geometric Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#4A4E69]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#9A8C98]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar: Institutional Affiliation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#4A4E69]/40 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C9ADA7] flex items-center justify-center text-[#22223B] font-bold shadow-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C9ADA7]">
              Amrutvahini College of Engineering, Sangamner
            </h3>
            <p className="text-xs text-stone-300">Department of Computer Engineering</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#4A4E69]/40 px-3 py-1.5 rounded-full border border-[#9A8C98]/30 text-xs text-stone-200">
          <Award className="w-4 h-4 text-amber-300" />
          <span>Municipal Waste Portal</span>
        </div>
      </div>

      {/* Center Hero Card */}
      <div className="max-w-3xl mx-auto my-auto text-center space-y-6 py-8">
        <div className="inline-flex items-center gap-2 bg-[#9A8C98]/20 border border-[#9A8C98]/40 text-[#C9ADA7] px-4 py-1.5 rounded-full text-xs font-semibold">
          <ShieldAlert className="w-4 h-4 text-[#C9ADA7]" />
          <span>Official Municipal Reporting Portal</span>
        </div>

        <h1 className="font-logo text-5xl sm:text-6xl md:text-7xl tracking-tight text-white">
          WasteWatch
        </h1>

        <p className="font-heading text-xl md:text-2xl font-bold text-[#C9ADA7]">
          Illegal Dumping Reporting System
        </p>

        <p className="text-stone-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Together for a Cleaner Community. Empowering registered citizens to report illegal waste dumping while municipal authorities monitor, cluster, and resolve complaints.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          <div className="p-4 rounded-2xl bg-[#4A4E69]/30 border border-[#9A8C98]/20">
            <MapPin className="w-5 h-5 text-[#C9ADA7] mb-2" />
            <h4 className="text-xs font-bold text-white">GPS Location Pin</h4>
            <p className="text-[11px] text-stone-300 mt-1">
              Capture GPS coordinates & precise OpenStreetMap markers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#4A4E69]/30 border border-[#9A8C98]/20">
            <ShieldAlert className="w-5 h-5 text-amber-300 mb-2" />
            <h4 className="text-xs font-bold text-white">Frequent Dumping Zones</h4>
            <p className="text-[11px] text-stone-300 mt-1">
              Automated hotspot detection when ≥3 complaints exist within 100m.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#4A4E69]/30 border border-[#9A8C98]/20">
            <CheckCircle className="w-5 h-5 text-emerald-400 mb-2" />
            <h4 className="text-xs font-bold text-white">Municipal Audit PDFs</h4>
            <p className="text-[11px] text-stone-300 mt-1">
              Export daily, weekly, & monthly verification reports instantly.
            </p>
          </div>
        </div>

        <div className="pt-6">
          <button
            onClick={onContinue}
            className="inline-flex items-center gap-3 bg-[#C9ADA7] hover:bg-[#bba099] text-[#22223B] font-bold px-8 py-4 rounded-2xl text-sm shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Enter WasteWatch Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer Developers Credit */}
      <div className="border-t border-[#4A4E69]/40 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-2">
        <div>
          Engineered by <span className="text-white font-bold">Sparsh Wakchaure</span> &{' '}
          <span className="text-white font-bold">Anushree Navale</span>
        </div>
        <div>Computer Engineering Department | AVCOE 2026</div>
      </div>
    </div>
  );
};
