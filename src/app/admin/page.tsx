"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Stethoscope,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Bell,
  ArrowRight,
  UserCheck,
  TrendingUp,
  Mail,
  Send,
  X,
  Phone,
} from "lucide-react";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import { formatDate, formatTime } from "@/lib/utils";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Direct Communication Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<{
    recipientType: "PATIENT" | "DOCTOR" | "BOTH";
    patientEmail?: string;
    patientName?: string;
    doctorEmail?: string;
    doctorName?: string;
    appointmentId?: string;
  } | null>(null);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchDashboard = () => {
    setIsLoading(true);
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDashboardData(data.data);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleOpenModal = (
    type: "PATIENT" | "DOCTOR" | "BOTH",
    booking: any
  ) => {
    setModalTarget({
      recipientType: type,
      patientEmail: booking.patient.email,
      patientName: booking.patient.name,
      doctorEmail: booking.doctor.user.email,
      doctorName: `Dr. ${booking.doctor.user.name}`,
      appointmentId: booking.id,
    });
    setSubject(`Admin Operational Notice: Consultation on ${formatDate(booking.date)}`);
    setMessage("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTarget || !message.trim()) return;
    setIsSending(true);
    setSuccessMsg("");

    try {
      const recipients: { type: string; email: string; name: string }[] = [];

      if (modalTarget.recipientType === "PATIENT" || modalTarget.recipientType === "BOTH") {
        if (modalTarget.patientEmail) {
          recipients.push({
            type: "PATIENT",
            email: modalTarget.patientEmail,
            name: modalTarget.patientName || "Patient",
          });
        }
      }

      if (modalTarget.recipientType === "DOCTOR" || modalTarget.recipientType === "BOTH") {
        if (modalTarget.doctorEmail) {
          recipients.push({
            type: "DOCTOR",
            email: modalTarget.doctorEmail,
            name: modalTarget.doctorName || "Doctor",
          });
        }
      }

      for (const r of recipients) {
        await fetch("/api/notifications/send-direct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId: modalTarget.appointmentId,
            recipientType: r.type,
            recipientEmail: r.email,
            recipientName: r.name,
            subject,
            message,
          }),
        });
      }

      setSuccessMsg(`Email successfully dispatched to ${recipients.map((r) => r.email).join(", ")}!`);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg("");
      }, 2000);
    } catch (err) {
      alert("Failed to dispatch email");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <div className="py-16 text-center text-warm-400 animate-pulse">Loading system metrics dashboard...</div>;
  }

  const stats = dashboardData?.stats || {};
  const recentBookings = dashboardData?.recentBookings || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner with Photo */}
      <div
        className="dashboard-hero p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&q=80')`,
        }}
      >
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-brand-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>System Administration & Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-tight">Clinix Operations Analytics</h1>
          <p className="text-xs sm:text-sm text-warm-300">
            Platform performance metrics, doctor leave conflict resolution, and direct patient/doctor communications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/doctors"
            className="btn-amber !text-xs !py-2.5 shrink-0 flex items-center space-x-1.5 shadow-md"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Appoint New Doctor</span>
          </Link>
          <Link
            href="/admin/leave"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-full border border-white/20 transition-all flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Leave Conflicts</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="warm-card space-y-1">
          <div className="flex items-center justify-between text-warm-400">
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase">Patients</span>
          </div>
          <div className="text-2xl font-black text-warm-900">{stats.totalPatients || 0}</div>
        </div>

        <div className="warm-card space-y-1">
          <div className="flex items-center justify-between text-brand-600">
            <Stethoscope className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase text-warm-400">Doctors</span>
          </div>
          <div className="text-2xl font-black text-warm-900">{stats.totalDoctors || 0}</div>
        </div>

        <div className="warm-card space-y-1">
          <div className="flex items-center justify-between text-brand-600">
            <Calendar className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase text-warm-400">Appointments</span>
          </div>
          <div className="text-2xl font-black text-warm-900">{stats.totalAppointments || 0}</div>
        </div>

        <div className="warm-card space-y-1">
          <div className="flex items-center justify-between text-brand-500">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase text-warm-400">Upcoming</span>
          </div>
          <div className="text-2xl font-black text-brand-700">{stats.upcomingCount || 0}</div>
        </div>

        <div className="warm-card space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase text-warm-400">Completed</span>
          </div>
          <div className="text-2xl font-black text-emerald-700">{stats.completedCount || 0}</div>
        </div>

        <div className="warm-card space-y-1">
          <div className="flex items-center justify-between text-warm-400">
            <XCircle className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase text-warm-400">Cancelled</span>
          </div>
          <div className="text-2xl font-black text-warm-600">{stats.cancelledCount || 0}</div>
        </div>
      </div>

      {/* Operations Communications Center (Both Patient & Doctor Info Side-by-Side) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-warm-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-100 pb-4">
          <div>
            <h2 className="text-xl font-serif text-warm-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-brand-600" />
              Operations Communications & Direct Email Center
            </h2>
            <p className="text-xs text-warm-500 mt-0.5">
              Contact patients, doctors, or dispatch joint notifications with live status and contact details.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-warm-800">
            <thead className="bg-warm-50 border-b border-warm-200 text-warm-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Patient Details</th>
                <th className="p-3.5">Assigned Specialist</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Admin Communication Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {recentBookings.map((b: any) => (
                <tr key={b.id} className="hover:bg-warm-50/50 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-warm-900">{b.patient.name}</div>
                    <div className="text-warm-500">{b.patient.email}</div>
                    {b.patient.phone && <div className="text-[11px] text-warm-400">{b.patient.phone}</div>}
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-warm-900">Dr. {b.doctor.user.name}</div>
                    <div className="text-warm-500">{b.doctor.specialization}</div>
                    <div className="text-[11px] text-warm-400">{b.doctor.user.email}</div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="font-medium text-warm-900">{formatDate(b.date)}</div>
                    <div className="text-warm-500">{formatTime(b.startTime)}</div>
                  </td>
                  <td className="p-3.5">
                    <span className={b.status === "COMPLETED" ? "badge-completed" : b.status === "CANCELLED" ? "badge-cancelled" : "badge-upcoming"}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => handleOpenModal("PATIENT", b)}
                        className="px-2.5 py-1 bg-warm-100 hover:bg-warm-200 text-warm-800 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        Email Patient
                      </button>
                      <button
                        onClick={() => handleOpenModal("DOCTOR", b)}
                        className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-800 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        Email Doctor
                      </button>
                      <button
                        onClick={() => handleOpenModal("BOTH", b)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        Email Both
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Communication Modal */}
      {isModalOpen && modalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-brand-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  {modalTarget.recipientType === "BOTH"
                    ? "Dispatch Notice to Patient & Doctor"
                    : `Email ${modalTarget.recipientType === "PATIENT" ? modalTarget.patientName : modalTarget.doctorName}`}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-warm-50 p-3.5 rounded-2xl border border-warm-200 text-xs space-y-1">
              {modalTarget.recipientType !== "DOCTOR" && (
                <div>
                  <span className="font-bold text-warm-700">Patient: </span>
                  <span className="text-warm-900">{modalTarget.patientName} ({modalTarget.patientEmail})</span>
                </div>
              )}
              {modalTarget.recipientType !== "PATIENT" && (
                <div>
                  <span className="font-bold text-warm-700">Doctor: </span>
                  <span className="text-warm-900">{modalTarget.doctorName} ({modalTarget.doctorEmail})</span>
                </div>
              )}
            </div>

            {successMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Message Content *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter operational update, reschedule notification, or clinic guidance..."
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSending || !message.trim()}
                    className="btn-amber !text-xs !py-2.5 shadow-md flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSending ? "Sending..." : "Dispatch Email"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Analytics Recharts Section */}
      {dashboardData && (
        <AnalyticsCharts
          urgencyDistribution={dashboardData.urgencyDistribution || []}
          specDistribution={dashboardData.specDistribution || []}
          trends={dashboardData.trends || []}
        />
      )}
    </div>
  );
}
