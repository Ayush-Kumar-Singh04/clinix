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
  ChevronUp,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function AdminDoctorManagementPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  // Success Created Banner State (Credentials to convey)
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

      setIsFormOpen(false);
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
            setIsFormOpen(!isFormOpen);
          }}
          className={`!py-3 !px-6 text-xs flex items-center space-x-2 shrink-0 shadow-md font-bold rounded-2xl transition-all ${
            isFormOpen
              ? "bg-slate-800 text-white hover:bg-slate-900"
              : "btn-amber"
          }`}
        >
          {isFormOpen ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>Close Appoint Section</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Appoint New Doctor</span>
            </>
          )}
        </button>
      </div>

      {/* Success Credentials Banner (In-Section) */}
      {createdDoctorCreds && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-emerald-300 ring-4 ring-emerald-500/10 space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b-2 border-emerald-100 pb-3">
            <div className="flex items-center space-x-3 text-emerald-700">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center border border-emerald-200 shadow-xs">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Doctor Account Appointed & Onboarding Dispatched!
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Official credentials have been sent via email. You can also copy them below.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCreatedDoctorCreds(null)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>

          {/* Credentials Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 font-mono text-xs text-slate-900">
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-sans font-semibold text-[11px] uppercase">Doctor Name:</span>
              <div className="flex items-center space-x-2">
                {createdDoctorCreds.avatarUrl && (
                  <img
                    src={createdDoctorCreds.avatarUrl}
                    alt="Doctor"
                    className="w-5 h-5 rounded-full object-cover border"
                  />
                )}
                <span className="font-bold font-sans text-sm text-slate-900">Dr. {createdDoctorCreds.name}</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-sans font-semibold text-[11px] uppercase">Specialization:</span>
              <div className="font-sans font-bold text-brand-700">{createdDoctorCreds.specialization}</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-sans font-semibold text-[11px] uppercase">Login Email:</span>
              <div className="font-bold text-slate-800 truncate">{createdDoctorCreds.email}</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-sans font-semibold text-[11px] uppercase">Temporary Password:</span>
              <div className="font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200 inline-block">
                {createdDoctorCreds.password}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-slate-500">
              The physician can sign in at <strong className="text-slate-800">/doctor</strong> or <strong className="text-slate-800">/login</strong>.
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={copyCredentialsToClipboard}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-300" />
                    <span>Copy Credentials</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setCreatedDoctorCreds(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appoint New Doctor In-Section Expandable Form (No Dark Backdrop Screen) */}
      {isFormOpen && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-slate-300 ring-4 ring-black/5 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border-2 border-brand-200 shadow-xs">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  Appoint New Doctor
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Enter physician details below to register their profile in the clinic system.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center justify-center transition-colors"
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

          <form onSubmit={handleCreateDoctor} className="space-y-5 text-xs">
            {/* Top Grid: Profile Photo + Core Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Profile Photo Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-300 space-y-3 flex flex-col justify-between">
                <div>
                  <label className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Camera className="w-4 h-4 text-brand-600" />
                    Doctor Photo (Optional)
                  </label>
                  <p className="text-[10px] text-slate-500">Displayed in Navbar and directory.</p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 border-2 border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 rounded-xl text-[11px] font-bold shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5 text-brand-600" />
                      <span>Upload File</span>
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
                        className="block text-[10px] font-bold text-rose-600 hover:text-rose-700"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Or paste photo URL (https://...)"
                  value={avatarUrl}
                  onChange={(e) => {
                    setAvatarUrl(e.target.value);
                    setAvatarPreview(e.target.value || null);
                  }}
                  className="w-full p-2 border-2 border-slate-300 bg-white rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-slate-900"
                />
              </div>

              {/* Name & Email Fields */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

                {/* Password Setting Section */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border-2 border-slate-300 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-brand-600" />
                      Doctor Account Password *
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[11px] font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200"
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
                      className="w-full p-2.5 pr-10 border-2 border-slate-300 rounded-xl outline-none focus:border-slate-900 text-sm font-mono font-bold text-slate-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Specialization & Slot Duration & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  Consultation Duration
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
            </div>

            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Doctor Biography & Clinical Credentials
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="MBBS, MD - Dedicated specialist with 10+ years outpatient experience..."
                className="w-full p-3.5 border-2 border-slate-300 bg-slate-50/70 hover:border-slate-400 focus:border-slate-900 focus:bg-white text-slate-900 text-xs font-medium rounded-xl outline-none transition-all"
              />
            </div>

            <div className="pt-3 border-t-2 border-slate-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
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
    </div>
  );
}
