'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLoginAction } from '@/lib/actions';
import { FiLock, FiMail } from 'react-icons/fi';
import ClientPageTransition from '@/components/ClientPageTransition';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await adminLoginAction(email, password);
      if (res.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientPageTransition>
      <div className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md bg-bg-card border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-red/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-brand-purple/10 rounded-full blur-2xl" />

          <div className="flex flex-col gap-6 relative z-10">
            <div className="text-center">
              <div className="bg-brand-red text-white font-black px-3.5 py-1.5 rounded-xl text-lg tracking-wider w-fit mx-auto shadow-md shadow-brand-red/20 mb-3">
                SWC
              </div>
              <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight">Admin Authentication</h1>
              <p className="text-xs text-text-secondary mt-1">SWC Library Management Console</p>
            </div>

            {error && (
              <div className="text-xs font-semibold bg-brand-red/10 border border-brand-red/20 text-brand-red p-3 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="admin@swclibrary.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full input-field pl-10 text-sm"
                  />
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full input-field pl-10 text-sm"
                  />
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-gradient-to-r from-brand-red to-brand-purple hover:from-brand-red/90 hover:to-brand-purple/90 text-white font-bold py-3 rounded-xl transition-all duration-200 active:scale-98 disabled:opacity-50 text-sm cursor-pointer shadow-md shadow-brand-red/10"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ClientPageTransition>
  );
}
