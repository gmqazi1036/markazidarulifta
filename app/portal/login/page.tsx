"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../actions/auth';
import { Key, Mail, ShieldAlert, CheckCircle, Shield } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function PortalLogin() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      router.push('/portal/dashboard');
    } else {
      setError(res.error || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 animate-fade-in">
      <div className="bg-white rounded-xl border border-stone-200 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-islamic-green to-islamic-darkGreen text-white p-6 text-center border-b border-islamic-gold">
          <div className="w-12 h-12 rounded-full bg-islamic-gold/15 flex items-center justify-center mx-auto mb-3 border border-islamic-gold/30">
            <Shield className="w-6 h-6 text-islamic-gold" />
          </div>
          <h2 className="text-xl font-bold font-urdu text-islamic-gold">Darul Ifta Portal Login</h2>
          <p className="text-xs text-stone-300 mt-1">Authorized access for certified Muftis and Super Administrators</p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded flex items-center space-x-2 rtl:space-x-reverse font-semibold">
              <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded flex items-center space-x-2 rtl:space-x-reverse font-semibold">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Authenticated! Redirecting to Dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Employee Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@darulifta.org"
                  className="w-full border border-stone-300 rounded px-3 py-2 pl-9 text-sm focus:outline-none focus:border-islamic-gold"
                />
                <Mail className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Secure Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-stone-300 rounded px-3 py-2 pl-9 text-sm focus:outline-none focus:border-islamic-gold"
                />
                <Key className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || success}
              className="w-full py-2.5 bg-islamic-gold hover:bg-amber-600 text-white rounded font-bold shadow text-sm transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-100 p-4 text-center text-[10px] text-slate-400">
          IpAddress, timestamps, and activity logs are audited. <br />
          Password: <strong>muftipassword</strong> (for Mufti) or <strong>adminpassword</strong> (for Admin).
        </div>
      </div>
    </div>
  );
}
