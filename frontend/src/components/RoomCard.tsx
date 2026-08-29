import { Heart, MapPin, Star, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Room } from '../types';
import { currency } from '../utils/format';
import { AvailabilityBadge, VerificationBadge } from './StatusBadge';

const fallbackImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0" y1="0" x2="1" y2="1"%3E%3Cstop stop-color="%230f766e"/%3E%3Cstop offset="1" stop-color="%2394d9c8"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="900" height="560" fill="url(%23g)"/%3E%3Cpath d="M200 430V260l125-105 125 105v170M420 430V205l120-100 120 100v225" fill="none" stroke="white" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/%3E%3C/svg%3E';

export function RoomCard({ room, favourite = false, onFavourite }: { room: Room; favourite?: boolean; onFavourite?: (room: Room, next: boolean) => void }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-100">
        <img src={room.images[0] || fallbackImage} onError={(event) => { event.currentTarget.src = fallbackImage; }} alt={`Photo of ${room.title}`} className="size-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3"><AvailabilityBadge status={room.availabilityStatus} /></div>
        <button type="button" onClick={() => onFavourite?.(room, !favourite)} aria-label={favourite ? `Remove ${room.title} from favourites` : `Save ${room.title} to favourites`} aria-pressed={favourite} className={`absolute right-3 top-3 grid size-10 place-items-center rounded-full shadow-sm transition ${favourite ? 'bg-rose-500 text-white' : 'bg-white/95 text-slate-700 hover:bg-white'}`}><Heart size={18} fill={favourite ? 'currentColor' : 'none'} /></button>
        {room.aiMatch && <span className="absolute bottom-3 left-3 rounded-full bg-ink/90 px-2.5 py-1 text-xs font-bold text-emerald-100">{room.aiMatch}% match</span>}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-xs font-bold uppercase tracking-wide text-brand-700">{room.propertyType} · {room.roomType}</p><h3 className="mt-1 truncate text-base font-bold text-slate-900"><Link to={`/rooms/${room._id}`} className="after:absolute after:inset-0 focus-visible:outline-none">{room.title}</Link></h3></div><span className="shrink-0 text-right text-base font-bold text-slate-900">{currency(room.monthlyRent)}<span className="block text-[11px] font-medium text-slate-500">/ month</span></span></div>
        <p className="mt-2 flex items-center gap-1.5 truncate text-sm text-slate-500"><MapPin size={15} className="shrink-0 text-brand-600" /> {room.area || room.address}{room.distance !== undefined && <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-xs font-bold text-slate-600">{room.distance} km</span>}</p>
        <div className="mt-3 flex items-center gap-3 text-sm"><span className="inline-flex items-center gap-1 font-bold text-slate-700"><Star size={15} fill="currentColor" className="text-amber-400" /> {room.averageRating.toFixed(1)} <span className="font-normal text-slate-400">({room.reviewCount})</span></span>{room.occupancy && <span className="inline-flex min-w-0 items-center gap-1 truncate text-slate-500"><UsersRound size={15} /> {room.occupancy}</span>}</div>
        <div className="mt-3 flex flex-wrap gap-1.5"><VerificationBadge status={room.verificationStatus} compact />{room.facilities.slice(0, 2).map((item) => <span key={item} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{item}</span>)}{room.facilities.length > 2 && <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">+{room.facilities.length - 2}</span>}</div>
      </div>
    </article>
  );
}
