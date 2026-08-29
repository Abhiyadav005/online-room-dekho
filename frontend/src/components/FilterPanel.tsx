import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { SearchFilters } from '../types';

const facilities = ['Wi-Fi', 'AC', 'Food', 'CCTV', 'Security', 'Washing machine', 'Kitchen', 'Parking', 'Balcony', 'Power backup'];
const propertyTypes = ['Room', 'PG', 'Hostel', 'Flat', 'Apartment', '1BHK', '2BHK', 'Shared accommodation'];

const selected = (value: string, current?: string) => value === (current || '');

export function FilterPanel({ value, onApply, onClose, mobile = false }: { value: SearchFilters; onApply: (filters: SearchFilters) => void; onClose?: () => void; mobile?: boolean }) {
  const [draft, setDraft] = useState<SearchFilters>(value);
  useEffect(() => setDraft(value), [value]);
  const change = <K extends keyof SearchFilters>(key: K, next: SearchFilters[K]) => setDraft((current) => ({ ...current, [key]: next || undefined, page: 1 }));
  const toggleFacility = (facility: string) => {
    const current = draft.facilities || [];
    change('facilities', current.includes(facility) ? current.filter((item) => item !== facility) : [...current, facility]);
  };
  const reset = () => { setDraft({ query: value.query, city: value.city, area: value.area, sort: 'relevance' }); };
  const apply = () => { onApply(draft); onClose?.(); };
  return (
    <aside className={`${mobile ? 'w-full' : 'sticky top-24'} surface overflow-hidden`} aria-label="Search filters">
      <div className="flex items-center justify-between border-b px-4 py-3"><h2 className="inline-flex items-center gap-2 font-bold text-slate-900"><SlidersHorizontal size={18} className="text-brand-600" /> Filters</h2><button type="button" onClick={reset} className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900"><RotateCcw size={13} /> Reset</button></div>
      <div className="max-h-[65vh] space-y-5 overflow-y-auto p-4">
        <section><label className="field-label">Monthly rent</label><div className="grid grid-cols-2 gap-2"><input value={draft.minRent || ''} onChange={(event) => change('minRent', Number(event.target.value) || undefined)} inputMode="numeric" className="field" placeholder="Min ₹" aria-label="Minimum rent" /><input value={draft.maxRent || ''} onChange={(event) => change('maxRent', Number(event.target.value) || undefined)} inputMode="numeric" className="field" placeholder="Max ₹" aria-label="Maximum rent" /></div></section>
        <section><label className="field-label">Property type</label><select value={draft.propertyType || ''} onChange={(event) => change('propertyType', event.target.value || undefined)} className="field"><option value="">Any property</option>{propertyTypes.map((type) => <option key={type}>{type}</option>)}</select></section>
        <section><label className="field-label">Room type</label><select value={draft.roomType || ''} onChange={(event) => change('roomType', event.target.value || undefined)} className="field"><option value="">Any room type</option><option>Private room</option><option>Twin sharing</option><option>Triple sharing</option><option>Studio</option><option>Entire place</option><option>Double sharing</option></select></section>
        <section><label className="field-label">Facilities</label><div className="flex flex-wrap gap-2">{facilities.map((facility) => <button type="button" key={facility} onClick={() => toggleFacility(facility)} aria-pressed={(draft.facilities || []).includes(facility)} className={`rounded-full border px-2.5 py-1.5 text-xs font-bold transition ${(draft.facilities || []).includes(facility) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'}`}>{facility}</button>)}</div></section>
        <section className="space-y-2"><label className="field-label">Preferences</label><label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-700"><span>Furnished only</span><input checked={Boolean(draft.furnished)} onChange={(event) => change('furnished', event.target.checked || undefined)} type="checkbox" className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" /></label><label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-700"><span>Verified property</span><input checked={Boolean(draft.verified)} onChange={(event) => change('verified', event.target.checked || undefined)} type="checkbox" className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" /></label><label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-700"><span>Verified owner phone</span><input checked={Boolean(draft.phoneVerified)} onChange={(event) => change('phoneVerified', event.target.checked || undefined)} type="checkbox" className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" /></label></section>
        <section><label className="field-label">Distance</label><select value={draft.maxDistance || ''} onChange={(event) => change('maxDistance', Number(event.target.value) || undefined)} className="field"><option value="">Any distance</option><option value="1">Within 1 km</option><option value="2">Within 2 km</option><option value="5">Within 5 km</option><option value="10">Within 10 km</option></select></section>
        <section><label className="field-label">Minimum rating</label><select value={draft.minRating || ''} onChange={(event) => change('minRating', Number(event.target.value) || undefined)} className="field"><option value="">Any rating</option><option value="4.5">4.5 and up</option><option value="4">4.0 and up</option><option value="3">3.0 and up</option></select></section>
        <section><label className="field-label">Availability</label><select value={draft.availability || ''} onChange={(event) => change('availability', event.target.value as SearchFilters['availability'] || undefined)} className="field"><option value="">Any status</option><option value="available">Available now</option><option value="limited">Limited availability</option></select></section>
      </div>
      <div className="border-t p-3"><button type="button" onClick={apply} className="btn-primary w-full">Show matching rooms <ChevronDown size={16} /></button></div>
    </aside>
  );
}

export const SortSelect = ({ value, onChange }: { value?: SearchFilters['sort']; onChange: (value: SearchFilters['sort']) => void }) => <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-600"><span className="hidden sm:inline">Sort:</span><select value={value || 'relevance'} onChange={(event) => onChange(event.target.value as SearchFilters['sort'])} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-bold text-slate-700 focus:border-brand-500 focus:outline-none"><option value="relevance">Relevance</option><option value="ai">AI match</option><option value="rent_asc">Lowest rent</option><option value="rent_desc">Highest rent</option><option value="nearest">Nearest</option><option value="rating">Highest rated</option><option value="newest">Newest</option></select></label>;

export const activeFilterCount = (filters: SearchFilters) => ['minRent', 'maxRent', 'propertyType', 'roomType', 'furnished', 'facilities', 'genderPreference', 'maxDistance', 'minRating', 'verified', 'phoneVerified', 'availability'].reduce((count, key) => {
  const value = filters[key as keyof SearchFilters];
  return count + (Array.isArray(value) ? (value.length ? 1 : 0) : value ? 1 : 0);
}, 0);
