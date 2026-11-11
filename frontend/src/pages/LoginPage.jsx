import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Stethoscope, Lock, Mail, AlertCircle, ArrowRight, UserCheck, Shield, Heart } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e, customEmail = null, customPass = null) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    if (!loginEmail || !loginPass) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(loginEmail, loginPass);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'DOCTOR') navigate('/doctor/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Patient', email: 'patient@mediassist.com', pass: 'patient123', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { role: 'Doctor', email: 'doctor@mediassist.com', pass: 'doctor123', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { role: 'Admin', email: 'admin@mediassist.com', pass: 'admin123', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-500">Sign in to your MediAssist AI portal account</p>
        </div>

        {/* Demo One-Click Login Bar */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">
            Instant Demo Logins (One-Click)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSubmit(null, acc.email, acc.pass)}
                className={`py-1.5 px-2 text-xs font-bold rounded-xl border transition-colors ${acc.color}`}
              >
                {acc.role}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have a patient account?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
