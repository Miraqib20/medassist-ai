import React, { useState, useEffect } from 'react';
import { doctorService, appointmentService, clinicService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, Clock, User, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AppointmentModal = ({ isOpen, onClose, defaultDoctorId = null, onSuccess }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(defaultDoctorId || '');
  const [selectedService, setSelectedService] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow default
  );
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');

  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchDoctorsAndServices();
    }
  }, [isOpen]);

  useEffect(() => {
    if (defaultDoctorId) {
      setSelectedDoctor(defaultDoctorId);
    }
  }, [defaultDoctorId]);

  useEffect(() => {
    if (selectedDoctor && appointmentDate) {
      fetchSlots(selectedDoctor, appointmentDate);
    }
  }, [selectedDoctor, appointmentDate]);

  const fetchDoctorsAndServices = async () => {
    setLoadingDoctors(true);
    try {
      const [docRes, servRes] = await Promise.all([
        doctorService.getDoctors(),
        clinicService.getServices(),
      ]);
      setDoctors(docRes.data);
      setServices(servRes.data);
      if (docRes.data.length > 0 && !selectedDoctor) {
        setSelectedDoctor(docRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchSlots = async (docId, dateStr) => {
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot('');
    setError('');
    try {
      const res = await doctorService.getAvailability(docId, dateStr);
      setSlots(res.data.slots || []);
    } catch (err) {
      console.error(err);
      setError('Could not load doctor availability for this date.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onClose();
      navigate('/login');
      return;
    }

    if (!selectedDoctor || !appointmentDate || !selectedSlot) {
      setError('Please select a doctor, date, and time slot.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        doctor_id: selectedDoctor,
        service_id: selectedService || null,
        appointment_date: appointmentDate,
        start_time: selectedSlot,
        reason: reason || 'General Consultation',
      };
      await appointmentService.create(payload);
      setSuccessMsg('Appointment booked successfully!');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to book appointment. Please try another slot.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Calendar className="w-5 h-5" />
            <span>Book Clinic Appointment</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 text-sm font-medium rounded-xl border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Select Doctor */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Specialist Doctor *
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name} — {d.specialty} (${d.consultation_fee})
                </option>
              ))}
            </select>
          </div>

          {/* Select Date & Service */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Appointment Date *
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Service (Optional)
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">General Consultation</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (${s.price})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Available Slots */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Available Time Slots *
            </label>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-6 text-slate-400 text-sm gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span>Checking real schedule...</span>
              </div>
            ) : slots.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200 font-medium">
                No available time slots for this doctor on {appointmentDate}. Please choose another date or doctor.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                {slots.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!s.is_available}
                    onClick={() => setSelectedSlot(s.start_time)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                      selectedSlot === s.start_time
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : s.is_available
                        ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                        : 'bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed'
                    }`}
                  >
                    {s.start_time}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Reason for Visit
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Routine skin checkup, chest discomfort evaluation..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedSlot}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{isAuthenticated ? 'Confirm Booking' : 'Login to Book'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
