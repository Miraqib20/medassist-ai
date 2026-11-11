import React, { useState, useEffect } from 'react';
import { appointmentService, doctorService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Calendar, Clock, User, Check, X, FileText, CheckCircle2, RefreshCw, Stethoscope } from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchDoctorSchedule();
  }, []);

  const fetchDoctorSchedule = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments();
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await appointmentService.updateStatus(appId, { status: newStatus });
      fetchDoctorSchedule();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayApps = appointments.filter(a => a.appointment_date === todayStr);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
            Doctor Portal
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">Welcome, {user?.full_name}</h1>
          <p className="text-xs text-slate-500 font-medium">Manage your daily appointments and patient schedule.</p>
        </div>

        <button onClick={fetchDoctorSchedule} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">
          <RefreshCw className="w-4 h-4" /> Refresh Schedule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Assigned</span>
          <h3 className="text-3xl font-extrabold text-slate-900">{appointments.length}</h3>
          <p className="text-[11px] text-slate-500">Patient appointments</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-sm space-y-2 bg-emerald-50/20">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Today's Schedule</span>
          <h3 className="text-3xl font-extrabold text-emerald-700">{todayApps.length}</h3>
          <p className="text-[11px] text-emerald-600">{todayStr}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Care</span>
          <h3 className="text-3xl font-extrabold text-blue-600">
            {appointments.filter(a => a.status === 'Completed').length}
          </h3>
          <p className="text-[11px] text-slate-500">Finished consultations</p>
        </div>
      </div>

      {/* Appointment List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Assigned Patient Appointments</h2>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 font-medium text-sm">Loading doctor schedule...</div>
        ) : appointments.length === 0 ? (
          <div className="py-16 text-center text-slate-500 font-medium text-sm">No patient appointments assigned currently.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((app) => (
              <div key={app.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-extrabold text-slate-900 text-base">{app.patient_name}</h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Service: {app.service_name}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-600" /> {app.appointment_date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-600" /> {app.start_time} - {app.end_time}</span>
                    </div>
                    {app.reason && <p className="text-xs text-slate-600 pt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">Reason: {app.reason}</p>}
                  </div>
                </div>

                {/* Status Changer Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {app.status === 'Pending' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'Confirmed')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
                    >
                      Confirm
                    </button>
                  )}

                  {app.status === 'Confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'Completed')}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
                    >
                      Mark Completed
                    </button>
                  )}

                  {app.status !== 'Cancelled' && app.status !== 'Completed' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
