import React, { useState, useEffect } from 'react';
import { adminService, doctorService, clinicService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  LayoutDashboard, Users, UserCheck, Calendar, HelpCircle, BookOpen, MessageSquare, BarChart3, ShieldAlert,
  Plus, Trash2, CheckCircle2, RefreshCw, Clock, Search, ChevronRight, X, AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Admin Data State
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [loading, setLoading] = useState(true);

  // Creation Modals
  const [showDocModal, setShowDocModal] = useState(false);
  const [newDocData, setNewDocData] = useState({
    email: '', password: 'password123', full_name: '', phone: '', specialty: '', qualification: '', experience_years: 5, consultation_fee: 60.0, bio: ''
  });

  const [showFaqModal, setShowFaqModal] = useState(false);
  const [newFaqData, setNewFaqData] = useState({ category: 'General', question: '', answer: '' });

  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [newKnowledgeData, setNewKnowledgeData] = useState({ title: '', category: 'General', content: '' });

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes, usersRes, docsRes, faqsRes, knowledgeRes, convsRes, auditRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAnalytics(),
        adminService.getUsers(),
        doctorService.getDoctors(),
        adminService.getFaqs(),
        adminService.getKnowledge(),
        adminService.getConversations(),
        adminService.getAuditLogs(),
      ]);

      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setDoctors(docsRes.data);
      setFaqs(faqsRes.data);
      setKnowledgeDocs(knowledgeRes.data);
      setConversations(convsRes.data);
      setAuditLogs(auditRes.data);
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      await adminService.createDoctor(newDocData);
      setShowDocModal(false);
      fetchAllAdminData();
    } catch (err) {
      alert("Failed to create doctor account.");
    }
  };

  const handleCreateFaq = async (e) => {
    e.preventDefault();
    try {
      await adminService.createFaq(newFaqData);
      setShowFaqModal(false);
      fetchAllAdminData();
    } catch (err) {
      alert("Failed to create FAQ.");
    }
  };

  const handleCreateKnowledge = async (e) => {
    e.preventDefault();
    try {
      await adminService.createKnowledge(newKnowledgeData);
      setShowKnowledgeModal(false);
      fetchAllAdminData();
    } catch (err) {
      alert("Failed to add knowledge document.");
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm("Delete this doctor profile?")) return;
    try {
      await adminService.deleteDoctor(id);
      fetchAllAdminData();
    } catch (err) {
      alert("Failed to delete doctor.");
    }
  };

  const handleDeleteFaq = async (id) => {
    try {
      await adminService.deleteFaq(id);
      fetchAllAdminData();
    } catch (err) {
      alert("Failed to delete FAQ.");
    }
  };

  // Recharts Palette Colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const sidebarLinks = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics Charts', icon: BarChart3 },
    { id: 'users', label: 'Users & Patients', icon: Users },
    { id: 'doctors', label: 'Doctors', icon: UserCheck },
    { id: 'faqs', label: 'FAQs Management', icon: HelpCircle },
    { id: 'knowledge', label: 'RAG Knowledge Base', icon: BookOpen },
    { id: 'conversations', label: 'Chat Logs', icon: MessageSquare },
    { id: 'audit', label: 'Audit Logs', icon: ShieldAlert },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-2 h-fit">
          <div className="px-3 py-2 border-b border-slate-100 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded">
              System Admin Suite
            </span>
          </div>
          {sidebarLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === link.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <link.icon className="w-4 h-4" />
              <span>{link.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Admin Metrics & Controls</h1>
                  <p className="text-xs text-slate-500 font-medium">Real-time clinic system statistics.</p>
                </div>
                <button onClick={fetchAllAdminData} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg">
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total Patients</span>
                    <h3 className="text-3xl font-extrabold text-slate-900">{stats.total_patients}</h3>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total Doctors</span>
                    <h3 className="text-3xl font-extrabold text-blue-600">{stats.total_doctors}</h3>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total Appointments</span>
                    <h3 className="text-3xl font-extrabold text-indigo-600">{stats.total_appointments}</h3>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Today's Appointments</span>
                    <h3 className="text-3xl font-extrabold text-amber-600">{stats.today_appointments}</h3>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Chatbot Conversations</span>
                    <h3 className="text-3xl font-extrabold text-purple-600">{stats.total_conversations}</h3>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Knowledge & FAQs</span>
                    <h3 className="text-3xl font-extrabold text-emerald-600">{stats.total_faqs}</h3>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ANALYTICS CHARTS */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-lg text-slate-900">Appointment Status Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.appointments_by_status}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analytics.appointments_by_status.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-lg text-slate-900">Appointments by Department</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.appointments_by_department}>
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USERS */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-extrabold text-lg text-slate-900">Registered Platform Users</h3>
              </div>
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold">
                    <tr>
                      <th className="px-6 py-3">Full Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-900">{u.full_name}</td>
                        <td className="px-6 py-4 text-slate-600">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-emerald-600 font-bold">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DOCTORS */}
          {activeTab === 'doctors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-extrabold text-lg text-slate-900">Doctor Profiles Directory</h3>
                <button
                  onClick={() => setShowDocModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow"
                >
                  <Plus className="w-4 h-4" /> Add Doctor
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.map((doc) => (
                  <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{doc.full_name}</h4>
                      <p className="text-xs text-blue-600 font-semibold">{doc.specialty}</p>
                      <p className="text-[11px] text-slate-500 mt-1">${doc.consultation_fee} Fee</p>
                    </div>
                    <button
                      onClick={() => handleDeleteDoctor(doc.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FAQS */}
          {activeTab === 'faqs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-extrabold text-lg text-slate-900">Clinic FAQs</h3>
                <button
                  onClick={() => setShowFaqModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
                >
                  <Plus className="w-4 h-4" /> Add FAQ
                </button>
              </div>

              <div className="space-y-3">
                {faqs.map((f) => (
                  <div key={f.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {f.category}
                      </span>
                      <button onClick={() => handleDeleteFaq(f.id)} className="text-rose-500 hover:bg-rose-50 p-1 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Q: {f.question}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">A: {f.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: RAG KNOWLEDGE BASE */}
          {activeTab === 'knowledge' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">RAG Knowledge Documents</h3>
                  <p className="text-xs text-slate-500">Documents automatically chunked and indexed for AI semantic search.</p>
                </div>
                <button
                  onClick={() => setShowKnowledgeModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
                >
                  <Plus className="w-4 h-4" /> Add Document
                </button>
              </div>

              <div className="space-y-3">
                {knowledgeDocs.map((doc) => (
                  <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {doc.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{doc.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{doc.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: CHAT CONVERSATIONS */}
          {activeTab === 'conversations' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-extrabold text-lg text-slate-900">Chatbot Support Logs</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {conversations.map((c) => (
                  <div key={c.id} className="p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{c.title}</h4>
                      <p className="text-xs text-slate-500">User: {c.user_name} • {c.message_count} Messages</p>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-extrabold text-lg text-slate-900">System Audit Logs</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="text-blue-600">{log.action}</span>
                      <span className="text-slate-400 font-normal">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE DOCTOR MODAL */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">Add Doctor Profile</h3>
            <form onSubmit={handleCreateDoctor} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Full Name (e.g. Dr. Alex Vance, MD)"
                value={newDocData.full_name}
                onChange={(e) => setNewDocData({ ...newDocData, full_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newDocData.email}
                onChange={(e) => setNewDocData({ ...newDocData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
                required
              />
              <input
                type="text"
                placeholder="Specialty (e.g. Cardiology Specialist)"
                value={newDocData.specialty}
                onChange={(e) => setNewDocData({ ...newDocData, specialty: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
                required
              />
              <input
                type="text"
                placeholder="Qualification (e.g. MD Johns Hopkins)"
                value={newDocData.qualification}
                onChange={(e) => setNewDocData({ ...newDocData, qualification: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowDocModal(false)} className="px-4 py-2 font-bold text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">Save Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE FAQ MODAL */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">Add Clinic FAQ</h3>
            <form onSubmit={handleCreateFaq} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Category (e.g. Insurance, Hours, Parking)"
                value={newFaqData.category}
                onChange={(e) => setNewFaqData({ ...newFaqData, category: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
                required
              />
              <input
                type="text"
                placeholder="Question"
                value={newFaqData.question}
                onChange={(e) => setNewFaqData({ ...newFaqData, question: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
                required
              />
              <textarea
                placeholder="Answer"
                rows={3}
                value={newFaqData.answer}
                onChange={(e) => setNewFaqData({ ...newFaqData, answer: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowFaqModal(false)} className="px-4 py-2 font-bold text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">Save FAQ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE KNOWLEDGE MODAL */}
      {showKnowledgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">Add RAG Knowledge Document</h3>
            <form onSubmit={handleCreateKnowledge} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Document Title"
                value={newKnowledgeData.title}
                onChange={(e) => setNewKnowledgeData({ ...newKnowledgeData, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={newKnowledgeData.category}
                onChange={(e) => setNewKnowledgeData({ ...newKnowledgeData, category: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
                required
              />
              <textarea
                placeholder="Full Document Content (will be automatically chunked and vector-indexed)..."
                rows={5}
                value={newKnowledgeData.content}
                onChange={(e) => setNewKnowledgeData({ ...newKnowledgeData, content: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowKnowledgeModal(false)} className="px-4 py-2 font-bold text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">Index Document</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
