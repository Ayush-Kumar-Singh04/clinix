"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Star, Clock, Stethoscope, ArrowRight, User, Award, CheckCircle2 } from "lucide-react";
import { getDoctorProficiencies, getDoctorRatingDetails } from "@/lib/utils";

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
    "Neurology",
    "Pediatrics",
    "Psychiatry",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Find & Book Specialist Doctors</h1>
        <p className="text-sm text-slate-600">
          Select a verified physician, explore their clinical proficiencies, and reserve your consultation slot.
        </p>
      </div>

      {/* Search & Specialization Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by physician name or specialization..."
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
          {doctors.map((doctor) => {
            const proficiencies = getDoctorProficiencies(doctor.specialization);
            const ratingDetails = getDoctorRatingDetails(doctor.id, doctor.user.name);

            return (
              <div
                key={doctor.id}
                className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-brand-400 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3.5">
                  {/* Doctor Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-brand-500/20 overflow-hidden shrink-0 border-2 border-white">
                        {doctor.avatarUrl ? (
                          <img
                            src={doctor.avatarUrl}
                            alt={doctor.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{doctor.user.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors font-serif">
                          Dr. {doctor.user.name}
                        </h3>
                        <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200 inline-block">
                          {doctor.specialization}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Rating */}
                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded-full text-xs font-bold shadow-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{ratingDetails.rating}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                        ({ratingDetails.reviewsCount} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Biography */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {doctor.bio || "Board-certified clinical specialist offering outpatient consultation and patient-first care plans."}
                  </p>

                  {/* Clinical Proficiencies Section */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Award className="w-3 h-3 text-brand-600" />
                      <span>Clinical Proficiencies</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {proficiencies.slice(0, 3).map((prof, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200"
                        >
                          {prof}
                        </span>
                      ))}
                      {proficiencies.length > 3 && (
                        <span className="text-[11px] font-bold text-brand-600 px-1 py-0.5">
                          +{proficiencies.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Slot Duration & Experience meta */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doctor.slotDurationMinutes} Min Consultation</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {ratingDetails.experienceYears}+ Yrs Exp
                    </span>
                  </div>
                </div>

                <Link
                  href={`/patient/doctors/${doctor.id}`}
                  className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md"
                >
                  <span>View Full Profile & Book Slots</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
