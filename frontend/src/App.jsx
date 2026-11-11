import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AppointmentModal } from './components/AppointmentModal';
import { ChatbotWidget } from './components/ChatbotWidget';
import { LandingPage } from './pages/LandingPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { ServicesPage } from './pages/ServicesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 font-medium">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  const handleOpenBookingWithDoctor = (docId) => {
    setSelectedDoctorId(docId);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800">
      <Navbar
        onOpenBooking={() => { setSelectedDoctorId(null); setBookingModalOpen(true); }}
        onOpenChat={() => setChatOpen(true)}
      />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                onOpenBooking={() => setBookingModalOpen(true)}
                onOpenChat={() => setChatOpen(true)}
                onSelectDoctorForBooking={handleOpenBookingWithDoctor}
              />
            }
          />
          <Route
            path="/doctors"
            element={<DoctorsPage onSelectDoctorForBooking={handleOpenBookingWithDoctor} />}
          />
          <Route
            path="/services"
            element={<ServicesPage onOpenBooking={() => setBookingModalOpen(true)} />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Role Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientDashboard
                  onOpenBooking={() => setBookingModalOpen(true)}
                  onOpenChat={() => setChatOpen(true)}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Booking Modal */}
      <AppointmentModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        defaultDoctorId={selectedDoctorId}
      />

      {/* Global Floating AI Chatbot Widget */}
      <ChatbotWidget
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
        onOpenBookingWithDoctor={handleOpenBookingWithDoctor}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
