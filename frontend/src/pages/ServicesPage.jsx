import React, { useState, useEffect } from 'react';
import { clinicService } from '../services/api';
import { Clock, Tag, Calendar, Heart, Sparkles, Stethoscope } from 'lucide-react';

export const ServicesPage = ({ onOpenBooking }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await clinicService.getServices();
        setServices(res.data);
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Clinical Offerings
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Clinic Services & Pricing</h1>
        <p className="text-slate-600 text-sm">Transparent consultation rates and specialized medical care offerings.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-medium">Loading clinical services...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((serv) => (
            <div key={serv.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">
                    {serv.department_name || 'General Clinic'}
                  </span>
                  <span className="text-lg font-extrabold text-slate-900">${serv.price}</span>
                </div>
                <h3 className="font-bold text-xl text-slate-900">{serv.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{serv.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{serv.duration_minutes} Mins Duration</span>
                </div>

                <button
                  onClick={onOpenBooking}
                  className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  Book Service
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
