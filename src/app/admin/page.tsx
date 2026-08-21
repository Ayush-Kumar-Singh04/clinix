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
} from "lucide-react";
import AnalyticsCharts from "@/components/AnalyticsCharts";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDashboardData(data.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="py-16 text-center text-slate-400 animate-pulse">Loading system metrics dashboard...</div>;
  }

  const stats = dashboardData?.stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-purple-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>System Administration & Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Clinix Operations Analytics</h1>
          <p className="text-xs sm:text-sm text-purple-200">
            Platform performance metrics, doctor leave conflict resolution, and notification health.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/doctors"
            className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Manage Doctors</span>
          </Link>
          <Link
            href="/admin/leave"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Doctor Leave Conflicts</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase">Patients</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalPatients || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-teal-600">
            <Stethoscope className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase text-slate-400">Doctors</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalDoctors || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-brand-600">
            <Calendar className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase text-slate-400">Appointments</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalAppointments || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase text-slate-400">Upcoming</span>
          </div>
          <div className="text-2xl font-black text-blue-700">{stats.upcomingCount || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase text-slate-400">Completed</span>
          </div>
          <div className="text-2xl font-black text-emerald-700">{stats.completedCount || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <XCircle className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase text-slate-400">Cancelled</span>
          </div>
          <div className="text-2xl font-black text-slate-600">{stats.cancelledCount || 0}</div>
        </div>
      </div>

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
