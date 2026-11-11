import React, { useState, useEffect } from 'react';
import { appointmentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  Calendar, Clock, User, FileText, CheckCircle2, AlertCircle, RefreshCw, XCircle, Bot, Plus
} from 'lucide-react';

export const PatientDashboard = ({ onOpenBooking, onOpenChat }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reschedule state
  const [rescheduleModalAppId, setRescheduleModalAppId] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
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

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await appointmentService.cancel(id);
      setMsg("Appointment cancelled successfully.");
      fetchAppointments();
    } catch (err) {
      alert("Failed to cancel appointment.");
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate || !newTime) return;
    setRescheduleSubmitting(true);
    try {
      await appointmentService.reschedule(rescheduleModalAppId, {
        appointment_date: newDate,
        start_time: newTime
      });
      setMsg("Appointment rescheduled successfully!");
      setRescheduleModalAppId(null);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.detail || "Slot not available for reschedule.");
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  // Metrics
  const upcomingApps = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending');
  const completedApps = appointments.filter(a => a.status === 'Completed');
  const cancelledApps = appointments.filter(a => a.status === 'Cancelled' || a.status === 'Rejected');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome, {user?.full_name}</h1>
          <p className="text-xs text-slate-500 font-medium">Patient Dashboard & Appointment History</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            <Bot className="w-4 h-4 text-blue-600" />
            <span>AI Assistant</span>
          </button>
          <button
            onClick={onOpenBooking}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</span>
          <h3 className="text-3xl font-extrabold text-slate-900">{appointments.length}</h3>
          <p className="text-[11px] text-slate-500 font-medium">All time clinic visits</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-blue-200 shadow-sm space-y-2 bg-blue-50/30">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Upcoming Active</span>
          <h3 className="text-3xl font-extrabold text-blue-700">{upcomingApps.length}</h3>
          <p className="text-[11px] text-blue-600 font-medium">Confirmed / Pending</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed</span>
          <h3 className="text-3xl font-extrabold text-emerald-600">{completedApps.length}</h3>
          <p className="text-[11px] text-slate-500 font-medium">Fulfilled consultations</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cancelled</span>
          <h3 className="text-3xl font-extrabold text-rose-600">{cancelledApps.length}</h3>
          <p className="text-[11px] text-slate-500 font-medium">Cancelled / Rejected</p>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Your Appointments</h2>
          <button onClick={fetchAppointments} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 font-medium text-sm">Loading your appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="py-16 text-center text-slate-500 font-medium text-sm">
            You don't have any appointments booked yet.{' '}
            <button onClick={onOpenBooking} className="text-blue-600 font-bold underline ml-1">
              Book one now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((app) => (
              <div key={app.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-extrabold text-slate-900 text-base">{app.doctor_name}</h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-blue-600 font-semibold">{app.doctor_specialty} • {app.service_name}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {app.appointment_date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {app.start_time} - {app.end_time}</span>
                    </div>
                    {app.reason && <p className="text-xs text-slate-500 pt-1">Reason: {app.reason}</p>}
                  </div>
                </div>

                {/* Actions */}
                {(app.status === 'Confirmed' || app.status === 'Pending') && (
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => setRescheduleModalAppId(app.id)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleCancel(app.id)}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleModalAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">Reschedule Appointment</h3>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">New Date *</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">New Start Time *</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalAppId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleSubmitting}
                  className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
