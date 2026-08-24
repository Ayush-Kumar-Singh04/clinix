"use client";

import { useEffect, useState } from "react";
import {
  Stethoscope,
  Plus,
  Star,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  AlertCircle,
  ArrowLeft,
  Copy,
  CheckCheck,
  KeyRound,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Phone,
  Camera,
  Upload,
  User,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";

export default function AdminDoctorManagementPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Create Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("ClinixDoctor2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("Cardiology");
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(30);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Created Modal State (Credentials to convey)
  const [createdDoctorCreds, setCreatedDoctorCreds] = useState<{
    name: string;
    email: string;
    password: string;
    specialization: string;
    avatarUrl?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let gen = "";
    for (let i = 0; i < 12; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(`Doc_${gen}`);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Profile photo must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setAvatarUrl(result);
    };
    reader.readAsDataURL(file);
  };

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
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim() || undefined,
          specialization,
          slotDurationMinutes: Number(slotDurationMinutes),
          bio: bio.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error?.message || "Failed to create doctor account");
        setIsSubmitting(false);
        return;
      }

      // Save created credentials for admin to convey to doctor
      setCreatedDoctorCreds({
        name,
        email: email.trim().toLowerCase(),
        password,
        specialization,
        avatarUrl: avatarUrl || undefined,
      });

      setIsModalOpen(false);
      setName("");
      setEmail("");
      setPhone("");
      setBio("");
      setAvatarUrl("");
      setAvatarPreview(null);
      setPassword("ClinixDoctor2026!");
      fetchDoctors();
    } catch (err) {
      setErrorMsg("Network error creating doctor profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCredentialsToClipboard = () => {
    if (!createdDoctorCreds) return;
    const text = `🏥 Clinix Healthcare — Physician Account Access
Doctor: Dr. ${createdDoctorCreds.name}
Specialization: ${createdDoctorCreds.specialization}
Login Portal: ${window.location.origin}/login
Email / Username: ${createdDoctorCreds.email}
Temporary Password: ${createdDoctorCreds.password}

Please sign in and set up your weekly consultation availability.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link
              href="/admin"
              className="text-xs font-bold text-warm-500 hover:text-brand-600 flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-warm-900 tracking-tight mt-1">
            Doctor Staff & Appointments Directory
          </h1>
          <p className="text-xs sm:text-sm text-warm-600">
            Appoint new physicians, configure profile photos, consultation durations, credentials, and toggle clinic roster status.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg("");
            setIsModalOpen(true);
          }}
          className="btn-amber !py-3 !px-6 text-xs flex items-center space-x-2 shrink-0 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Appoint New Doctor</span>
        </button>
      </div>

      {/* Success Modal: Credentials to Convey to Doctor */}
      {createdDoctorCreds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-slate-300 ring-4 ring-black/10 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5 text-emerald-700">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    Doctor Account Appointed!
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Credentials and onboarding email have been issued.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreatedDoctorCreds(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Credentials Card */}
            <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-5 space-y-3.5 font-mono text-xs text-slate-900 shadow-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans font-semibold">Doctor Name:</span>
                <div className="flex items-center space-x-2">
                  {createdDoctorCreds.avatarUrl && (
                    <img
                      src={createdDoctorCreds.avatarUrl}
                      alt="Doctor Photo"
                      className="w-6 h-6 rounded-full object-cover border border-slate-300"
                    />
                  )}
                  <span className="font-bold font-sans">Dr. {createdDoctorCreds.name}</span>
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans font-semibold">Specialization:</span>
                <span className="bg-brand-50 text-brand-700 font-sans font-bold px-2 py-0.5 rounded-full border border-brand-200">
                  {createdDoctorCreds.specialization}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans font-semibold">Login Email:</span>
                <span className="font-bold text-brand-700">{createdDoctorCreds.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-sans font-semibold">Password:</span>
                <span className="font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                  {createdDoctorCreds.password}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              The doctor can sign in at the <strong className="text-slate-900">/doctor</strong> or <strong className="text-slate-900">/login</strong> portal using the credentials above to configure availability slots and handle consultations.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={copyCredentialsToClipboard}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                    <span>Credentials Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-300" />
                    <span>Copy Credentials to Send</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setCreatedDoctorCreds(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctors Table */}
      {isLoading ? (
        <div className="py-16 text-center text-warm-400 animate-pulse text-sm">
          Loading physician staff roster...
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-warm-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-warm-50/80 border-b border-warm-200/80 text-warm-600 font-bold uppercase tracking-wider">
                  <th className="p-4">Physician</th>
                  <th className="p-4">Specialization</th>
                  <th className="p-4">Slot Duration</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Roster Status</th>
                  <th className="p-4">Total Consultations</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 font-medium text-warm-800">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-warm-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white font-bold flex items-center justify-center shadow-sm overflow-hidden shrink-0 border border-slate-200">
                          {doc.avatarUrl ? (
                            <img
                              src={doc.avatarUrl}
                              alt={doc.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{doc.user.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-warm-900 font-serif">
                            Dr. {doc.user.name}
                          </div>
                          <div className="text-warm-500 text-[11px] font-mono">{doc.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-brand-50 text-brand-700 font-bold px-2.5 py-0.5 rounded-full border border-brand-200">
                        {doc.specialization}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center space-x-1 text-warm-700">
                        <Clock className="w-3.5 h-3.5 text-warm-400" />
                        <span>{doc.slotDurationMinutes} mins</span>
                      </span>
                    </td>
                    <td className="p-4 text-warm-600">
                      {doc.user.phone ? (
                        <span className="flex items-center space-x-1 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-warm-400" />
                          <span>{doc.user.phone}</span>
                        </span>
                      ) : (
                        <span className="text-warm-400 italic">Not set</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          doc.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-warm-100 text-warm-500 border border-warm-200"
                        }`}
                      >
                        {doc.isActive ? "Active on Roster" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-warm-900">
                      {doc._count?.doctorAppointments || 0} Appointments
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleActive(doc.id, doc.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
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

      {/* Appoint New Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-slate-300 ring-4 ring-black/10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif">
                    Appoint New Doctor
                  </h3>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Register physician credentials & profile to the clinic directory.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 font-bold text-lg flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border-2 border-rose-300 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateDoctor} className="space-y-4 text-xs">
              {/* Profile Photo Upload Section */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border-2 border-slate-300 space-y-2">
                <label className="font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-brand-600" />
                    Doctor Profile Photo (Optional)
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium font-sans">Shows in Navbar & Directory</span>
                </label>

                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-200 border-2 border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 rounded-xl text-[11px] font-bold shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5 text-brand-600" />
                      <span>Upload Photo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarPreview(null);
                          setAvatarUrl("");
                        }}
                        className="ml-2 text-[11px] font-bold text-rose-600 hover:text-rose-700"
                      >
                        Remove
                      </button>
                    )}
                    <input
                      type="text"
                      placeholder="Or paste image URL (https://...)"
                      value={avatarUrl}
                      onChange={(e) => {
                        setAvatarUrl(e.target.value);
                        setAvatarPreview(e.target.value || null);
                      }}
                      className="w-full p-2 border border-slate-300 bg-white rounded-lg text-xs font-mono text-slate-800 outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Doctor Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ananya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3.5 border-2 border-slate-300 bg-slate-50/70 hover:border-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/10 text-slate-900 text-sm font-semibold rounded-xl outline-none transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Email Address (Login Username) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="dr.sharma@clinix.health"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 border-2 border-slate-300 bg-slate-50/70 hover:border-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/10 text-slate-900 text-sm font-semibold rounded-xl outline-none transition-all shadow-xs"
                />
              </div>

              {/* Password Setting Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-300 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-brand-600" />
                    Doctor Account Password *
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate Strong</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pr-10 border-2 border-slate-300 rounded-xl outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-sm font-mono font-bold text-slate-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  This password will be displayed for you to copy and convey to the doctor once created.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Specialization *
                  </label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full p-3.5 border-2 border-slate-300 bg-slate-50/70 hover:border-slate-400 focus:border-slate-900 focus:bg-white text-xs font-bold text-slate-900 rounded-xl outline-none transition-all"
                  >
                    <option>Cardiology</option>
                    <option>General Medicine</option>
                    <option>Dermatology</option>
                    <option>Orthopedics</option>
                    <option>Neurology</option>
                    <option>Pediatrics</option>
                    <option>Psychiatry</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Slot Duration
                  </label>
                  <select
                    value={slotDurationMinutes}
                    onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
                    className="w-full p-3.5 border-2 border-slate-300 bg-slate-50/70 hover:border-slate-400 focus:border-slate-900 focus:bg-white text-xs font-bold text-slate-900 rounded-xl outline-none transition-all"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes (Standard)</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3.5 border-2 border-slate-300 bg-slate-50/70 hover:border-slate-400 focus:border-slate-900 focus:bg-white text-slate-900 text-sm font-semibold rounded-xl outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Doctor Biography & Credentials
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="MBBS, MD - Dedicated specialist with 10+ years outpatient experience..."
                  className="w-full p-3.5 border-2 border-slate-300 bg-slate-50/70 hover:border-slate-400 focus:border-slate-900 focus:bg-white text-slate-900 text-xs font-medium rounded-xl outline-none transition-all"
                />
              </div>

              <div className="pt-4 border-t-2 border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <span>Creating Doctor Account...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Appoint Doctor</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
