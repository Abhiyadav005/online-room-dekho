import { ArrowUpRight, HeartHandshake, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Brand } from './Brand';

export function Footer() {
  return (
    <footer className="mt-16 bg-ink text-slate-300">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Brand light />
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">A calmer way to find a room. Compare verified listings, ask the right questions and contact owners directly.</p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-emerald-100"><span className="inline-flex items-center gap-1"><ShieldCheck size={15} /> Phone verification</span><span className="inline-flex items-center gap-1"><HeartHandshake size={15} /> No booking fees</span></div>
        </div>
        <div><h2 className="font-bold text-white">Explore</h2><ul className="mt-3 space-y-2 text-sm"><li><Link to="/search" className="hover:text-white">Search rooms</Link></li><li><Link to="/map" className="hover:text-white">Browse on map</Link></li><li><Link to="/register?role=owner" className="hover:text-white">List a property</Link></li></ul></div>
        <div><h2 className="font-bold text-white">Built for trust</h2><p className="mt-3 text-sm leading-6">We use mobile verification and listing review. We never ask for Aadhaar or government identity documents.</p><Link to="/how-it-works" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-200 hover:text-white">How verification works <ArrowUpRight size={15} /></Link></div>
      </div>
      <div className="border-t border-white/10"><div className="container-page flex flex-col gap-2 py-4 text-xs sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Online Room Dekho</span><span>Discovery and owner contact only — no online bookings or payments.</span></div></div>
    </footer>
  );
}
