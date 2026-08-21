"use client";

import { useEffect, useState } from "react";
import { Stethoscope, Plus, Star, Edit, ToggleLeft, ToggleRight, Check, X, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminDoctorManagementPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Create Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [specialization, setSpecialization] = useState("Cardiology");
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(30);
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/doctors");
      const data = await res.json();
      if (data.success) {
        setDoctors(data.data.doctors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleToggleActive = async (doctorId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/doctors/${doctorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDoctors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          specialization,
          slotDurationMinutes: Number(slotDurationMinutes),
          bio,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error?.message || "Failed to create doctor");
        setIsSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      setName("");
      setEmail("");
      setBio("");
      fetchDoctors();
    } catch (err) {
      setErrorMsg("Error creating doctor profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Doctor Staff Directory</h1>
          <p className="text-sm text-slate-600">Configure physician profiles, slot durations, and working schedules.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-purple-500/20 transition-all flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor Account</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 animate-pulse">Loading doctors roster...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="p-4">Doctor</th>
                  <th className="p-4">Specialization</th>
                  <th className="p-4">Slot Duration</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Appointments</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center border border-purple-200">
                          {doc.user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">Dr. {doc.user.name}</div>
                          <div className="text-slate-500 text-[11px]">{doc.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-purple-50 text-purple-700 font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                        {doc.specialization}
                      </span>
                    </td>
                    <td className="p-4">{doc.slotDurationMinutes} mins</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${doc.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                        {doc.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{doc._count?.doctorAppointments || 0} Visits</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleActive(doc.id, doc.isActive)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                          doc.isActive
                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        }`}
                      >
                        {doc.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add New Doctor</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">
                ×
              </button>
            </div>

            {errorMsg && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">{errorMsg}</div>}

            <form onSubmit={handleCreateDoctor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase">Doctor Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ananya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="dr.sharma@clinix.health"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase">Specialization</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-xs font-semibold mt-1 bg-white"
                  >
                    <option>Cardiology</option>
                    <option>General Medicine</option>
                    <option>Dermatology</option>
                    <option>Orthopedics</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase">Slot Duration (Min)</label>
                  <input
                    type="number"
                    value={slotDurationMinutes}
                    onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase">Biography</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Clinical credentials & background..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-xs mt-1"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-md"
                >
                  {isSubmitting ? "Creating..." : "Save Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
