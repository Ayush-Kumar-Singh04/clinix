"use client";

import { useEffect, useState } from "react";
import {
  Stethoscope,
  Plus,
  Check,
  X,
  AlertCircle,
  ArrowLeft,
  Copy,
  CheckCheck,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Phone,
  Camera,
  Upload,
  User,
  ChevronUp,
  Trash2,
  AlertTriangle,
  UserMinus,
  Mail,
  Star,
  Award,
  Calendar,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { getDoctorProficiencies, getDoctorRatingDetails, formatDate } from "@/lib/utils";

const PRESET_AVATARS = [
  { name: "Dr. Male 1", url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&q=80" },
  { name: "Dr. Female 1", url: "https://images.unsplash.com/photo-1594824813620-6d482390a880?w=200&q=80" },
  { name: "Dr. Male 2", url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&q=80" },
  { name: "Dr. Female 2", url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80" },
];

const DAYS_MAP = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminDoctorManagementPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  // Success Created Banner State
  const [createdDoctorCreds, setCreatedDoctorCreds] = useState<{
    name: string;
    email: string;
    password: string;
    specialization: string;
    avatarUrl?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Selected Doctor Full Profile Modal State
  const [selectedDoctorDetail, setSelectedDoctorDetail] = useState<any | null>(null);

  // Offboard / Remove Doctor Modal State
  const [doctorToOffboard, setDoctorToOffboard] = useState<any | null>(null);
  const [offboardReason, setOffboardReason] = useState("Contract Termination / Separation");
  const [offboardNote, setOffboardNote] = useState("");
  const [isOffboarding, setIsOffboarding] = useState(false);

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

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg("Profile photo must be under 3MB.");
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
        if (selectedDoctorDetail && selectedDoctorDetail.id === doctorId) {
          setSelectedDoctorDetail({ ...selectedDoctorDetail, isActive: !currentStatus });
        }
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

  const handleConfirmOffboarding = async () => {
    if (!doctorToOffboard) return;
    setIsOffboarding(true);
    setErrorMsg("");

    try {
      const isRetirement = offboardReason.toLowerCase().includes("retire");
      const res = await fetch(`/api/admin/doctors/${doctorToOffboard.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: offboardReason,
          customNote: offboardNote,
          actionType: isRetirement ? "RETIREMENT" : "TERMINATION",
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error?.message || "Failed to offboard doctor.");
        setIsOffboarding(false);
        return;
      }

      setSuccessMsg(`Dr. ${doctorToOffboard.user.name} was offboarded and notice emailed to ${doctorToOffboard.user.email}.`);
      setDoctorToOffboard(null);
      setSelectedDoctorDetail(null);
      setOffboardNote("");
      fetchDoctors();
    } catch (err) {
      setErrorMsg("Failed to offboard doctor due to network error.");
    } finally {
      setIsOffboarding(false);
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

Please sign in to configure your consultation schedule.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Clean Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="text-xs font-bold text-warm-500 hover:text-brand-600 flex items-center space-x-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-serif text-warm-900 tracking-tight">
            Doctor Staff Directory
          </h1>
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

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg("")}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Created Doctor Credentials Card */}
      {createdDoctorCreds && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-emerald-300 ring-4 ring-emerald-500/10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b-2 border-emerald-100 pb-3">
            <div className="flex items-center space-x-3 text-emerald-700">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center border border-emerald-200 shadow-xs">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Doctor Appointed & Credentials Sent!
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Onboarding email has been dispatched.
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 font-mono text-xs text-slate-900">
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-sans font-semibold text-[11px] uppercase">Doctor Name</span>
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
              <span className="text-slate-500 font-sans font-semibold text-[11px] uppercase">Specialization</span>
              <div className="font-sans font-bold text-brand-700">{createdDoctorCreds.specialization}</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-sans font-semibold text-[11px] uppercase">Login Email</span>
              <div className="font-bold text-slate-800 truncate">{createdDoctorCreds.email}</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-sans font-semibold text-[11px] uppercase">Temporary Password</span>
              <div className="font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200 inline-block">
                {createdDoctorCreds.password}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-1">
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
      )}

      {/* Appoint New Doctor In-Section Form */}
      {isFormOpen && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-slate-300 ring-4 ring-black/5 space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border-2 border-brand-200 shadow-xs">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                Appoint New Doctor
              </h3>
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
            {/* Profile Photo Section with Upload & Quick Presets */}
            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-300 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-brand-600" />
                  Doctor Profile Photo (Optional)
                </label>
                <span className="text-[11px] text-slate-500 font-medium font-sans">
                  Upload file, paste link, or pick a preset
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-200 border-2 border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 rounded-xl text-xs font-bold shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5 text-brand-600" />
                      <span>Choose Image File</span>
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
                        className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>

                  {/* Preset Avatars */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Presets:</span>
                    {PRESET_AVATARS.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setAvatarPreview(p.url);
                          setAvatarUrl(p.url);
                        }}
                        className="w-7 h-7 rounded-full overflow-hidden border-2 hover:scale-110 transition-transform focus:ring-2 focus:ring-brand-500"
                        title={p.name}
                      >
                        <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Info Fields */}
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
                Doctor Biography & Credentials
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="MBBS, MD - Dedicated specialist with outpatient clinical experience..."
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

      {/* IN-SECTION PHYSICIAN PROFILE DOSSIER CARD */}
      {selectedDoctorDetail && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-slate-300 ring-4 ring-black/5 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white font-bold text-xl flex items-center justify-center shadow-md overflow-hidden shrink-0 border-2 border-white">
                {selectedDoctorDetail.avatarUrl ? (
                  <img
                    src={selectedDoctorDetail.avatarUrl}
                    alt={selectedDoctorDetail.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{selectedDoctorDetail.user.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-serif">
                  Dr. {selectedDoctorDetail.user.name}
                </h3>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="font-semibold text-brand-700 text-xs">
                    {selectedDoctorDetail.specialization}
                  </span>
                  <span className="text-slate-300">•</span>
                  {selectedDoctorDetail.isActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Active on Roster</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      <span>Inactive</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedDoctorDetail(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
            >
              <span>Close Dossier</span>
              <span>×</span>
            </button>
          </div>

          {/* Quick Metrics & Details */}
          {(() => {
            const ratingDetails = getDoctorRatingDetails(selectedDoctorDetail.id, selectedDoctorDetail.user.name);
            const proficiencies = getDoctorProficiencies(selectedDoctorDetail.specialization);

            return (
              <div className="space-y-5 text-xs">
                {/* Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-center">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Rating</div>
                    <div className="font-bold text-slate-900 text-sm flex items-center justify-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{ratingDetails.rating}</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Reviews</div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">{ratingDetails.reviewsCount}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Consultations</div>
                    <div className="font-bold text-brand-700 text-sm mt-0.5">{selectedDoctorDetail._count?.doctorAppointments || 0}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Experience</div>
                    <div className="font-bold text-emerald-700 text-sm mt-0.5">{ratingDetails.experienceYears}+ Yrs</div>
                  </div>
                </div>

                {/* Contact & Record Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-600" />
                      <span>Credentials & Contact</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Login Email:</span>
                        <span className="font-mono font-bold text-slate-800">{selectedDoctorDetail.user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span className="font-bold text-slate-800">{selectedDoctorDetail.user.phone || "Not set"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Slot Duration:</span>
                        <span className="font-bold text-slate-800">{selectedDoctorDetail.slotDurationMinutes} mins</span>
                      </div>
                    </div>
                  </div>

                  {/* Biography */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-1.5">
                    <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100">
                      Physician Biography & Background
                    </div>
                    <p className="text-slate-700 leading-relaxed text-xs pt-0.5">
                      {selectedDoctorDetail.bio || "Primary care clinician focused on comprehensive patient health, diagnostic review, and personalized treatment plans."}
                    </p>
                  </div>
                </div>

                {/* Clinical Proficiencies */}
                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-brand-600" />
                    <span>Clinical Proficiencies</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proficiencies.map((prof: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-white text-slate-800 font-medium px-3 py-1 rounded-lg border border-slate-300 text-xs shadow-xs"
                      >
                        {prof}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Working Hours Schedule */}
                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    <span>Weekly Clinic Schedule</span>
                  </div>
                  {selectedDoctorDetail.workingHours && selectedDoctorDetail.workingHours.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {selectedDoctorDetail.workingHours.map((wh: any) => (
                        <div key={wh.id} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs text-center">
                          <div className="font-bold text-slate-800">{DAYS_MAP[wh.dayOfWeek] || `Day ${wh.dayOfWeek}`}</div>
                          <div className="text-brand-700 font-mono font-semibold text-[11px] mt-0.5">{wh.startTime} - {wh.endTime}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-500 italic">Standard Monday–Friday (09:00 - 17:00)</div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Dossier Card Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t-2 border-slate-100 text-xs">
            <button
              onClick={() => {
                setDoctorToOffboard(selectedDoctorDetail);
              }}
              className="px-4 py-2.5 font-bold text-rose-700 hover:bg-rose-50 border border-rose-300 rounded-xl transition-colors flex items-center justify-center space-x-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Offboard / Remove Doctor</span>
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={() => handleToggleActive(selectedDoctorDetail.id, selectedDoctorDetail.isActive)}
                className={`px-4 py-2.5 rounded-xl font-bold transition-colors text-center ${
                  selectedDoctorDetail.isActive
                    ? "text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300"
                    : "text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300"
                }`}
              >
                {selectedDoctorDetail.isActive ? "Deactivate Account" : "Activate Account"}
              </button>
              <button
                onClick={() => setSelectedDoctorDetail(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-colors text-center"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-SECTION REMOVE / OFFBOARD DOCTOR CONFIRMATION CARD */}
      {doctorToOffboard && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-rose-300 ring-4 ring-rose-500/10 space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b-2 border-rose-100 pb-3">
            <div className="flex items-center space-x-3 text-rose-700">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center border border-rose-200">
                <UserMinus className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Offboard & Remove Doctor
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Removes doctor from directory and emails departure notice.
                </p>
              </div>
            </div>
            <button
              onClick={() => setDoctorToOffboard(null)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>

          <div className="bg-rose-50/70 border-2 border-rose-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Dr. {doctorToOffboard.user.name}</span>
              <span className="font-bold text-rose-700 text-xs">
                {doctorToOffboard.specialization}
              </span>
            </div>
            <div className="text-slate-600 text-xs font-mono">{doctorToOffboard.user.email}</div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Departure / Offboarding Reason *
              </label>
              <select
                value={offboardReason}
                onChange={(e) => setOffboardReason(e.target.value)}
                className="w-full p-3 border-2 border-slate-300 bg-slate-50 font-bold text-slate-900 rounded-xl outline-none focus:border-slate-900"
              >
                <option>Contract Termination / Separation</option>
                <option>Retirement & Honorary Departure</option>
                <option>Physician Resignation / Relocation</option>
                <option>End of Clinical Tenure</option>
                <option>Administrative Roster Restructuring</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Administrative Note (Included in notice email)
              </label>
              <textarea
                rows={3}
                value={offboardNote}
                onChange={(e) => setOffboardNote(e.target.value)}
                placeholder="e.g. Effective immediately. Handover completed. Thank you for your dedicated service..."
                className="w-full p-3 border-2 border-slate-300 bg-slate-50 font-medium text-slate-900 rounded-xl outline-none focus:border-slate-900"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] rounded-xl flex items-start space-x-2">
              <Mail className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                An official notice explaining the selected reason will be delivered immediately to <strong>{doctorToOffboard.user.email}</strong>.
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2 border-t-2 border-slate-100">
            <button
              type="button"
              onClick={() => setDoctorToOffboard(null)}
              className="px-5 py-2.5 font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-xs text-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmOffboarding}
              disabled={isOffboarding}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-xs disabled:opacity-50"
            >
              {isOffboarding ? (
                <span>Offboarding & Sending Notice...</span>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Confirm Offboard & Send Notice</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Doctors Table */}
      {isLoading ? (
        <div className="py-16 text-center text-warm-400 animate-pulse text-sm">
          Loading physician staff roster...
        </div>
      ) : (
        <div className="bg-white rounded-3xl border-2 border-warm-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-warm-50/80 border-b border-warm-200/80 text-warm-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Physician</th>
                  <th className="p-4">Specialization</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Slot Duration</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Consultations</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 font-medium text-warm-800">
                {doctors.map((doc) => {
                  const ratingDetails = getDoctorRatingDetails(doc.id, doc.user.name);

                  return (
                    <tr key={doc.id} className="hover:bg-warm-50/70 transition-colors">
                      <td className="p-4">
                        <div
                          onClick={() => setSelectedDoctorDetail(doc)}
                          className="flex items-center space-x-3 cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white font-bold flex items-center justify-center shadow-sm overflow-hidden shrink-0 border border-slate-200 group-hover:scale-105 transition-transform">
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
                            <div className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors font-serif">
                              Dr. {doc.user.name}
                            </div>
                            <div className="text-slate-500 text-[11px] font-mono">{doc.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 text-xs">
                          {doc.specialization}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1 font-semibold text-slate-900 text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{ratingDetails.rating}</span>
                          <span className="text-[11px] text-slate-400 font-normal">({ratingDetails.reviewsCount})</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-700 text-xs">
                          {doc.slotDurationMinutes} mins
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">
                        {doc.user.phone ? (
                          <span className="font-mono text-[11px] text-slate-700">
                            {doc.user.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Not set</span>
                        )}
                      </td>
                      <td className="p-4">
                        {doc.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-slate-900 text-xs">
                        {doc._count?.doctorAppointments || 0}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleActive(doc.id, doc.isActive)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                              doc.isActive
                                ? "text-amber-800 hover:bg-amber-50 border border-amber-300"
                                : "text-emerald-800 hover:bg-emerald-50 border border-emerald-300"
                            }`}
                          >
                            {doc.isActive ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            onClick={() => setDoctorToOffboard(doc)}
                            className="px-3 py-1 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-300 transition-colors flex items-center space-x-1"
                            title="Offboard / Remove Doctor"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
