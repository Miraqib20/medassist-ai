import React, { useState, useEffect, useRef } from 'react';
import { chatService, doctorService, appointmentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Bot, X, Send, Sparkles, AlertTriangle, Calendar, Clock, User, CheckCircle2, RefreshCw, ChevronRight, Stethoscope
} from 'lucide-react';

export const ChatbotWidget = ({ isOpen, onToggle, onOpenBookingWithDoctor }) => {
  const { isAuthenticated, user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: 'Hello! I am MediAssist AI, your virtual clinic assistant. I can help you find doctors, check availability, book appointments, or answer questions about clinic services.\n\nHow can I help you today?',
      actions: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const response = await chatService.sendMessage({
        conversation_id: conversationId,
        message: text
      });

      const { conversation_id, message, actions } = response.data;
      if (!conversationId) setConversationId(conversation_id);

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: message,
        actions: actions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat API Connection Error:", err.response?.data || err.message);
      const detailMsg = err.response?.data?.detail;
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: detailMsg || 'Sorry, I encountered an issue connecting to the clinic network. Please check your backend connection.',
          actions: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Quick Action Buttons
  const quickActions = [
    "Book Appointment",
    "Show available dermatologists",
    "Clinic Operating Hours",
    "Services & Consultation Fees",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slide-up mb-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white px-5 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-300">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-base tracking-tight leading-tight">MediAssist AI</h3>
                <p className="text-xs text-blue-200 font-medium">Your virtual clinic assistant</p>
              </div>
            </div>

            <button
              onClick={onToggle}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Render Action Payload Cards */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                      {msg.actions.map((act, idx) => (
                        <div key={idx}>
                          {/* SHOW_DOCTORS CARD */}
                          {act.action_type === 'SHOW_DOCTORS' && act.data?.doctors && (
                            <div className="space-y-2">
                              {act.data.doctors.map((doc) => (
                                <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={doc.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.full_name}`}
                                      alt={doc.full_name}
                                      className="w-9 h-9 rounded-full object-cover border border-blue-200"
                                    />
                                    <div>
                                      <h5 className="font-bold text-xs text-slate-900">{doc.full_name}</h5>
                                      <p className="text-[11px] text-blue-600 font-semibold">{doc.specialty}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => onOpenBookingWithDoctor(doc.id)}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-sm"
                                  >
                                    Book
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* SHOW_AVAILABILITY CARD */}
                          {act.action_type === 'SHOW_AVAILABILITY' && act.data && (
                            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                                <span>{act.data.doctor?.full_name}</span>
                                <span>{act.data.date}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-1.5">
                                {(act.data.slots || []).map((s, sIdx) => (
                                  <button
                                    key={sIdx}
                                    disabled={!s.is_available}
                                    onClick={() => onOpenBookingWithDoctor(act.data.doctor?.id)}
                                    className={`py-1 px-2 text-[11px] font-bold rounded border ${
                                      s.is_available
                                        ? 'bg-white text-blue-700 border-blue-300 hover:bg-blue-600 hover:text-white'
                                        : 'bg-slate-200 text-slate-400 line-through'
                                    }`}
                                  >
                                    {s.start_time}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* SHOW_SERVICES CARD */}
                          {act.action_type === 'SHOW_SERVICES' && act.data?.services && (
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {act.data.services.map((serv) => (
                                <div key={serv.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                                  <div>
                                    <h5 className="font-bold text-xs text-slate-900">{serv.name}</h5>
                                    <p className="text-[11px] text-blue-600 font-semibold">{serv.department_name || 'General Clinic'}</p>
                                    <p className="text-[10px] text-slate-500">{serv.duration_minutes} Mins Duration</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-xs font-extrabold text-emerald-600">${serv.price}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* SHOW_FAQ CARD */}
                          {act.action_type === 'SHOW_FAQ' && act.data?.faqs && (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {act.data.faqs.map((faq, fIdx) => (
                                <div key={fIdx} className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs space-y-0.5">
                                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">{faq.category}</span>
                                  <p className="font-bold text-slate-900">{faq.question}</p>
                                  <p className="text-slate-600 text-[11px]">{faq.answer}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* EMERGENCY ALERT CARD */}
                          {act.action_type === 'EMERGENCY_ALERT' && (
                            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-start gap-2">
                              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold">Medical Emergency Warning</p>
                                <p className="text-[11px] text-rose-700 mt-1">Please immediately contact 911 or go to your nearest emergency department.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-2 rounded-xl border border-slate-200 w-fit">
                <span className="w-2 h-2 rounded-full bg-blue-600 typing-dot"></span>
                <span className="w-2 h-2 rounded-full bg-blue-600 typing-dot"></span>
                <span className="w-2 h-2 rounded-full bg-blue-600 typing-dot"></span>
                <span className="ml-1 font-medium">MediAssist is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickActions.map((actionText, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(actionText)}
                className="shrink-0 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full border border-blue-200 transition-colors"
              >
                {actionText}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about doctors, hours, or appointments..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl shadow-blue-500/40 transition-all transform hover:scale-105 active:scale-95 font-bold text-sm border-2 border-white/20"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
        </div>
        <span>Ask MediAssist</span>
      </button>
    </div>
  );
};
