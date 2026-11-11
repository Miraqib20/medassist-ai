import React from 'react';
import { Stethoscope, Phone, Mail, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Emergency Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-3 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs md:text-sm text-amber-300 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Emergency Notice:</strong> MediAssist AI is an intelligent administrative assistant. In case of severe medical emergencies, please immediately call 911 or visit the nearest ER.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                MediAssist <span className="text-blue-500">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering patients and modern clinics with intelligent appointment booking, instant AI support, and seamless healthcare workflows.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Home Landing</Link></li>
              <li><Link to="/doctors" className="hover:text-blue-400 transition-colors">Our Doctors</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Clinic Services</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">Patient Portal</Link></li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Operating Hours</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Mon - Fri: 08:00 AM - 08:00 PM</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Saturday: 09:00 AM - 02:00 PM</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <Clock className="w-4 h-4 text-slate-600" />
                <span>Sunday: Closed (Emergency ER Only)</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Clinic Location</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                <span>124 Healthcare Boulevard, Medical District, Suite 400</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>+1 (800) 555-MEDI</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>support@mediassist.clinic</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MediAssist AI Healthcare Systems. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">HIPAA Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
