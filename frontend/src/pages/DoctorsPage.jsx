import React, { useState, useEffect } from 'react';
import { doctorService, clinicService } from '../services/api';
import { Search, Filter, Calendar, Award, Stethoscope, CheckCircle2, User } from 'lucide-react';

export const DoctorsPage = ({ onSelectDoctorForBooking }) => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedDept]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, deptRes] = await Promise.all([
        doctorService.getDoctors({ department_id: selectedDept || undefined, search: searchTerm }),
        clinicService.getDepartments()
      ]);
      setDoctors(docRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error("Failed to load doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Medical Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Find & Consult Qualified Doctors</h1>
        <p className="text-slate-600 text-sm">Browse specialist profiles, qualifications, and real-time appointment availability.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search doctor name, specialty, or qualification..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-800 focus:outline-none"
          />
          <button type="submit" className="text-xs font-bold text-blue-600 px-3 py-1 bg-blue-50 rounded-lg hover:bg-blue-100">
            Search
          </button>
        </form>

        <div className="w-full md:w-auto flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full md:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 font-medium">Loading clinic specialists...</div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-500 font-medium">
          No doctors found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between">
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <img
                    src={doc.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.full_name}`}
                    alt={doc.full_name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                  />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">
                      {doc.specialty}
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-900 mt-1 leading-snug">{doc.full_name}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{doc.department?.name}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{doc.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{doc.experience_years} Years Professional Clinical Experience</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{doc.bio}</p>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between gap-4 mt-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation Fee</span>
                  <span className="text-lg font-extrabold text-slate-900">${doc.consultation_fee}</span>
                </div>

                <button
                  onClick={() => onSelectDoctorForBooking(doc.id)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
