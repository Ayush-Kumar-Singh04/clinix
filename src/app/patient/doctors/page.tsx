"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Star, Clock, Stethoscope, ArrowRight, User } from "lucide-react";

export default function SearchDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialization, setSpecialization] = useState("ALL");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (specialization !== "ALL") params.append("specialization", specialization);
      if (query) params.append("query", query);

      const res = await fetch(`/api/doctors?${params.toString()}`);
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
  }, [specialization]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const specializations = [
    "ALL",
    "Cardiology",
    "General Medicine",
    "Dermatology",
    "Orthopedics",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Find & Book Specialist Doctors</h1>
        <p className="text-sm text-slate-600">
          Select a verified physician, check real-time availability, and secure your appointment slot.
        </p>
      </div>

      {/* Search & Specialization Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by doctor (e.g. Dr. Sharma) or specialization..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </form>

        {/* Specialization Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecialization(spec)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                specialization === spec
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 animate-pulse">Searching available doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Doctors Found</h3>
          <p className="text-xs text-slate-500">Try adjusting your specialization filter or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-brand-500/20">
                      {doctor.user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors">
                        Dr. {doctor.user.name}
                      </h3>
                      <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                        {doctor.specialization}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{doctor.rating.toFixed(1)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {doctor.bio || "Experienced specialist committed to comprehensive patient care and personalized treatment plans."}
                </p>

                <div className="flex items-center space-x-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doctor.slotDurationMinutes} Min Slots</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/patient/doctors/${doctor.id}`}
                className="w-full py-3 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white font-bold text-xs rounded-2xl border border-brand-200 flex items-center justify-center space-x-2 transition-all shadow-xs"
              >
                <span>Select & View Available Slots</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
