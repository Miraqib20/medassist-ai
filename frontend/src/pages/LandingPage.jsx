import React, { useEffect, useState } from 'react';
import { doctorService, clinicService } from '../services/api';
import {
  Bot, Calendar, ShieldCheck, Clock, Award, ArrowRight, Heart, Sparkles, UserCheck, Stethoscope, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage = ({ onOpenBooking, onOpenChat, onSelectDoctorForBooking }) => {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, servRes] = await Promise.all([
          doctorService.getDoctors({ featured_only: true }),
          clinicService.getServices(),
        ]);
        setFeaturedDoctors(docRes.data);
        setServices(servRes.data.slice(0, 6));
      } catch (err) {
        console.error("Failed to load landing page data:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-slate-50 pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Next-Gen Healthcare SaaS Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Your Intelligent <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent">
                  Clinic Assistant
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Book appointments, find expert doctors, and get instant 24/7 AI-powered support with MediAssist AI — the seamless bridge between patients and modern clinical care.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={onOpenBooking}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base rounded-2xl shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Appointment</span>
                </button>

                <button
                  onClick={onOpenChat}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base rounded-2xl border border-slate-200 shadow-md transition-all hover:border-slate-300"
                >
                  <Bot className="w-5 h-5 text-blue-600" />
                  <span>Chat with AI</span>
                </button>
              </div>

              {/* Hero Micro Stats */}
              <div className="pt-6 border-t border-slate-200/60 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0">
                <div>
                  <h4 className="text-2xl font-extrabold text-slate-900">100%</h4>
                  <p className="text-xs text-slate-500 font-medium">Real Availability</p>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-blue-600">24/7</h4>
                  <p className="text-xs text-slate-500 font-medium">AI Support</p>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-slate-900">5.0 ★</h4>
                  <p className="text-xs text-slate-500 font-medium">Patient Rating</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-30 animate-pulse"></div>
                <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        <Bot className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">MediAssist AI</h4>
                        <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Assistant
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Just now</span>
                  </div>

                  {/* Chat Preview bubble */}
                  <div className="space-y-3">
                    <div className="bg-slate-100 rounded-2xl p-3.5 text-xs text-slate-700 font-medium">
                      "I need an appointment with a dermatologist tomorrow afternoon."
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5 text-xs text-slate-800 space-y-2">
                      <p className="font-semibold text-blue-900">
                        Dr. Robert Chen has 3 available slots tomorrow (2:00 PM, 3:00 PM, 4:30 PM). Would you like me to book one for you?
                      </p>
                      <button
                        onClick={onOpenChat}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors text-center"
                      >
                        Confirm Booking via AI
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">Why Choose MediAssist</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Designed for Modern Patient Care</h3>
          <p className="text-slate-600 text-base">Combining intelligent RAG technology with real-time clinic scheduling.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-12">
          {[
            { icon: Bot, title: "AI Assistant", desc: "Instant answer matching with RAG knowledge search.", color: "text-blue-600 bg-blue-50" },
            { icon: Calendar, title: "Easy Booking", desc: "Book, cancel, or reschedule in under 30 seconds.", color: "text-indigo-600 bg-indigo-50" },
            { icon: Clock, title: "Real Availability", desc: "Live slot calculation directly from doctor schedules.", color: "text-teal-600 bg-teal-50" },
            { icon: UserCheck, title: "24/7 Support", desc: "Always online for clinic info, hours, and FAQs.", color: "text-emerald-600 bg-emerald-50" },
            { icon: ShieldCheck, title: "Secure Data", desc: "Encrypted patient profiles and HIPAA-aligned safety.", color: "text-purple-600 bg-purple-50" },
          ].map((f, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center font-bold`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">{f.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED DOCTORS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">Our Medical Team</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">Featured Specialist Doctors</h3>
          </div>
          <Link to="/doctors" className="inline-flex items-center gap-1 font-bold text-sm text-blue-600 hover:text-blue-700">
            <span>View All Doctors</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
          {featuredDoctors.map((doc) => (
            <div key={doc.id} className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="relative h-56 bg-slate-100 overflow-hidden">
                <img
                  src={doc.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.full_name}`}
                  alt={doc.full_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-extrabold text-blue-700 shadow-sm">
                  ${doc.consultation_fee} Fee
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                    {doc.specialty}
                  </span>
                  <h4 className="font-extrabold text-lg text-slate-900 mt-2">{doc.full_name}</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{doc.experience_years} Years Experience</p>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">{doc.bio}</p>
                </div>

                <button
                  onClick={() => onSelectDoctorForBooking(doc.id)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">Clinic Departments</h2>
            <h3 className="text-3xl font-extrabold">Comprehensive Clinical Services</h3>
            <p className="text-slate-400 text-sm">State-of-the-art diagnostic care and treatment across key medical specialties.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s) => (
              <div key={s.id} className="bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 space-y-4 hover:border-blue-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{s.department_name}</span>
                  <span className="text-sm font-extrabold text-emerald-400">${s.price}</span>
                </div>
                <h4 className="font-bold text-lg text-white">{s.name}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{s.description}</p>
                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/40">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.duration_minutes} Minutes</span>
                  <button onClick={onOpenBooking} className="text-blue-400 font-bold hover:underline">Book Service →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">4-Step Workflow</h2>
          <h3 className="text-3xl font-extrabold text-slate-900">How MediAssist AI Works</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Ask the AI", desc: "State your medical concern or search for specialist doctors in plain language." },
            { step: "02", title: "Choose Doctor", desc: "Browse qualified doctor profiles, qualifications, and consultation rates." },
            { step: "03", title: "Select Slot", desc: "Pick real available time slots verified against doctor calendar schedules." },
            { step: "04", title: "Confirm & Attend", desc: "Receive instant confirmation and view appointment details in your dashboard." },
          ].map((item, idx) => (
            <div key={idx} className="relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <span className="text-4xl font-extrabold text-blue-100 tracking-tighter">{item.step}</span>
              <h4 className="font-bold text-lg text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
