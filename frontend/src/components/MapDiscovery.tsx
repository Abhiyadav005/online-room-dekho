import { Crosshair, MapPin, Navigation, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Room } from '../types';
import { currency } from '../utils/format';
import { VerificationBadge } from './StatusBadge';

export function MapDiscovery({ rooms, className = '' }: { rooms: Room[]; className?: string }) {
  const [selectedId, setSelectedId] = useState<string>(rooms[0]?._id || '');
  const navigate = useNavigate();
  const selected = useMemo(() => rooms.find((room) => room._id === selectedId) || rooms[0], [rooms, selectedId]);
  const positions = [[17, 63], [44, 33], [68, 59], [32, 75], [75, 24], [57, 80]];
  if (!rooms.length) return <div className={`surface grid min-h-64 place-items-center p-6 text-center text-slate-500 ${className}`}>No mappable rooms match these filters.</div>;
  return (
    <section className={`surface overflow-hidden ${className}`} aria-label="Room map discovery">
      <div className="flex items-center justify-between border-b px-4 py-3"><div><p className="text-sm font-bold text-slate-900">Explore the neighbourhood</p><p className="text-xs text-slate-500">Map locations are approximate until you contact the owner.</p></div><button type="button" className="btn-quiet !min-h-9 !px-2 text-xs"><Crosshair size={15} /> Use my location</button></div>
      <div className="map-grid relative min-h-[420px] overflow-hidden p-4" role="region" aria-label="Interactive room map">
        <div className="absolute left-[8%] top-[17%] h-[3px] w-[85%] rotate-[16deg] bg-white/70" /><div className="absolute left-[32%] top-0 h-full w-[3px] -rotate-[18deg] bg-white/70" /><div className="absolute left-0 top-[60%] h-[3px] w-full -rotate-[7deg] bg-white/70" />
        <span className="absolute left-[8%] top-[8%] rounded bg-white/80 px-2 py-1 text-xs font-bold text-brand-900">Faizabad Road</span><span className="absolute right-[8%] top-[68%] rounded bg-white/80 px-2 py-1 text-xs font-bold text-brand-900">Gomti Nagar</span>
        {rooms.slice(0, 6).map((room, index) => <button type="button" key={room._id} onClick={() => setSelectedId(room._id)} aria-label={`View ${room.title} on map`} className={`absolute grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white text-white shadow-lg transition hover:scale-110 ${selectedId === room._id ? 'z-20 scale-110 bg-ink ring-4 ring-brand-200' : 'bg-brand-600'}`} style={{ left: `${positions[index][0]}%`, top: `${positions[index][1]}%` }}><MapPin size={20} fill="currentColor" /></button>)}
        {selected && <div className="absolute bottom-4 left-4 right-4 max-w-sm rounded-2xl bg-white p-3 shadow-lift sm:left-6 sm:right-auto"><div className="flex gap-3"><img src={selected.images[0]} alt="" className="size-16 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900">{selected.title}</p><p className="mt-0.5 text-sm font-bold text-brand-700">{currency(selected.monthlyRent)} <span className="font-medium text-slate-500">/ month</span></p><div className="mt-1 flex items-center gap-2 text-xs text-slate-600"><span className="inline-flex items-center gap-1"><Star size={12} fill="currentColor" className="text-amber-400" /> {selected.averageRating.toFixed(1)}</span><VerificationBadge status={selected.verificationStatus} compact /></div></div><button type="button" onClick={() => navigate(`/rooms/${selected._id}`)} className="btn-primary !min-h-9 !px-2.5 text-xs"><Navigation size={14} /> View</button></div></div>}
      </div>
    </section>
  );
}
