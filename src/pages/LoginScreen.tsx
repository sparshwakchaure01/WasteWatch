import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Mail, Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { loginWithEmail } = useAuth();
  const { usersList } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const result = await loginWithEmail(email, password, usersList);
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.error || 'Access Denied. Contact Administrator.');
      }
    } catch (err) {
      setError('Authentication failed. Please check credentials or contact System Administrator.');
    } finally {
      setIsLoading(false);
    }
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
            WasteWatch - Sangamner Municipal Illegal Dumping Portal
          </p>
        </div>

        {/* Security Banner Notice */}
        <div className="bg-[#4A4E69]/10 border border-[#9A8C98]/30 p-[#3.5] p-3.5 rounded-2xl text-[11px] text-[#22223B] space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-[#22223B]">
            <ShieldCheck className="w-4 h-4 text-[#4A4E69]" />
            <span>Firebase Authentication</span>
          </div>
          <p className="text-[#4A4E69]">
            Public sign-up is disabled. Only pre-authorized municipal officers and citizens created by the System Administrator can sign in.
          </p>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#22223B] mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@wastewatch.gov.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs font-medium text-[#22223B] focus:outline-none focus:ring-2 focus:ring-[#22223B]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#22223B] mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs font-medium text-[#22223B] focus:outline-none focus:ring-2 focus:ring-[#22223B]"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#22223B] hover:bg-[#333355] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

