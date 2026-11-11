import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, User, LogOut, LayoutDashboard, Calendar, Menu, X, Bot } from 'lucide-react';

export const Navbar = ({ onOpenBooking, onOpenChat }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'DOCTOR') return '/doctor/dashboard';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 bg-clip-text text-transparent">
                MediAssist <span className="text-blue-600">AI</span>
              </span>
              <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase -mt-1">
                Smart Clinic Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/doctors" className="hover:text-blue-600 transition-colors">Doctors</Link>
            <Link to="/services" className="hover:text-blue-600 transition-colors">Services</Link>
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onOpenChat}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <Bot className="w-4 h-4 text-blue-600" />
              <span>Ask AI</span>
            </button>

            <button
              onClick={onOpenBooking}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/25 active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-600" />
                  <span>Dashboard</span>
                  <span className="ml-1 text-[10px] uppercase font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Home</Link>
          <Link to="/doctors" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Doctors</Link>
          <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Services</Link>
          
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenChat(); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50"
            >
              <Bot className="w-4 h-4" /> Ask MediAssist AI
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenBooking(); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600"
            >
              <Calendar className="w-4 h-4" /> Book Appointment
            </button>
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-blue-600 font-semibold"
                >
                  Go to {user.role} Dashboard
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2 text-rose-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 text-slate-700 font-semibold"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
