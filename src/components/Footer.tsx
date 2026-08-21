import Link from "next/link";
import { Activity, ShieldCheck, HeartPulse } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Clinix</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Healthcare appointment and follow-up management platform built for modern clinical excellence.
          </p>
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>HIPAA-Compliant Workflow Ready</span>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Platform</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/patient/doctors" className="hover:text-white transition-colors">Find Doctors</Link></li>
            <li><Link href="/patient" className="hover:text-white transition-colors">Patient Portal</Link></li>
            <li><Link href="/doctor" className="hover:text-white transition-colors">Doctor Portal</Link></li>
            <li><Link href="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Clinical Safety</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            All clinical summaries are workflow assistance tools for healthcare professionals. Not a medical diagnosis.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">System Status</h4>
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>All API Systems Operational</span>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            © 2026 Clinix Healthcare Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
