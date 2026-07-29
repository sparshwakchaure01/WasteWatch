import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Phone, ShieldCheck, ArrowRight, Lock, Sparkles, Building2, User } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { loginWithPhone, switchDemoRole } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('+919823012345');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Reporter');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setOtp('123456'); // Pre-fill mock OTP for convenience
    }, 600);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter valid 6-digit OTP code');
      return;
    }
    setIsLoading(true);
    try {
      await loginWithPhone(phoneNumber, otp, selectedRole);
      onLoginSuccess();
    } catch (err) {
      setError('OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoQuickLogin = (role: UserRole) => {
    switchDemoRole(role);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#F2E9E4] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#9A8C98]/30 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#22223B] text-white flex items-center justify-center mx-auto font-logo text-xl shadow-md">
            WW
          </div>
          <h2 className="font-heading text-2xl font-bold text-[#22223B]">
            Municipal Portal Login
          </h2>
          <p className="text-xs text-[#4A4E69]">
            WasteWatch - Sangamner Municipal Illegal Dumping System
          </p>
        </div>

        {/* Form Container */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#22223B] mb-1">
                User Role Selection *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Reporter', 'Local Body', 'Administrator'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedRole === r
                        ? 'bg-[#22223B] text-white border-[#22223B] shadow'
                        : 'bg-stone-50 text-[#4A4E69] border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#22223B] mb-1">
                Registered Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98230 12345"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs font-medium text-[#22223B] focus:outline-none focus:ring-2 focus:ring-[#22223B]"
                  required
                />
              </div>
            </div>

            {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#22223B] hover:bg-[#333355] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all"
            >
              {isLoading ? (
                <span>Sending OTP...</span>
              ) : (
                <>
                  <span>Send OTP Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-stone-50 p-3 rounded-xl text-xs text-[#4A4E69] flex items-center justify-between">
              <span>OTP sent to <strong>{phoneNumber}</strong></span>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-[#22223B] font-bold underline text-[11px]"
              >
                Edit
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#22223B] mb-1">
                Enter 6-Digit OTP Code *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs font-bold tracking-widest text-[#22223B] focus:outline-none focus:ring-2 focus:ring-[#22223B]"
                  required
                />
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                Demo code: <strong>123456</strong>
              </p>
            </div>

            {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#22223B] hover:bg-[#333355] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all"
            >
              {isLoading ? 'Verifying OTP...' : 'Verify & Enter Dashboard'}
            </button>
          </form>
        )}

        {/* Quick Demo Testing Roles */}
        <div className="pt-4 border-t border-stone-200 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#4A4E69] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Instant Demo Logins (Evaluator Access)</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoQuickLogin('Reporter')}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-left transition-colors"
            >
              <User className="w-3.5 h-3.5 mb-1 text-emerald-700" />
              <div className="text-[11px] font-bold">Reporter</div>
              <div className="text-[9px] text-emerald-700">Citizen account</div>
            </button>

            <button
              onClick={() => handleDemoQuickLogin('Local Body')}
              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-left transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 mb-1 text-blue-700" />
              <div className="text-[11px] font-bold">Local Body</div>
              <div className="text-[9px] text-blue-700">Municipal Inspector</div>
            </button>

            <button
              onClick={() => handleDemoQuickLogin('Administrator')}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-left transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 mb-1 text-amber-700" />
              <div className="text-[11px] font-bold">Admin</div>
              <div className="text-[9px] text-amber-700">System admin</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
