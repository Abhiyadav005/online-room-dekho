import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Search, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { SearchFilters } from '../types';

const searchSchema = z.object({
  query: z.string().trim().max(120, 'Keep the search under 120 characters.').optional(),
  city: z.string().trim().max(80, 'City name is too long.').optional(),
  maxRent: z.string().optional(),
});
type SearchInput = z.infer<typeof searchSchema>;

export function SearchBar({ initial = {}, onSearch, compact = false }: { initial?: SearchFilters; onSearch: (filters: SearchFilters) => void; compact?: boolean }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<SearchInput>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: initial.query || '', city: initial.city || '', maxRent: initial.maxRent ? String(initial.maxRent) : '' },
  });
  useEffect(() => reset({ query: initial.query || '', city: initial.city || '', maxRent: initial.maxRent ? String(initial.maxRent) : '' }), [initial.city, initial.maxRent, initial.query, reset]);
  const submit = (values: SearchInput) => onSearch({ query: values.query?.trim() || undefined, city: values.city?.trim() || undefined, maxRent: Number(values.maxRent) || undefined });

  return (
    <form onSubmit={handleSubmit(submit)} className={`rounded-2xl border border-white/60 bg-white p-2 shadow-lift ${compact ? '' : 'md:p-2.5'}`} noValidate>
      <div className={`grid gap-1 ${compact ? 'sm:grid-cols-[1fr_1fr_auto]' : 'md:grid-cols-[1.3fr_1fr_0.8fr_auto]'}`}>
        <label className="relative flex min-h-12 items-center gap-2 rounded-xl px-3 transition focus-within:bg-slate-50"><Search size={19} className="shrink-0 text-brand-600" /><span className="sr-only">Search for a room or landmark</span><input {...register('query')} className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400" placeholder="College, area or room type" /></label>
        <label className="relative flex min-h-12 items-center gap-2 rounded-xl border-t border-slate-100 px-3 transition focus-within:bg-slate-50 sm:border-l sm:border-t-0"><MapPin size={19} className="shrink-0 text-brand-600" /><span className="sr-only">City</span><input {...register('city')} className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400" placeholder="City" /></label>
        {!compact && <label className="relative flex min-h-12 items-center gap-2 rounded-xl border-t border-slate-100 px-3 transition focus-within:bg-slate-50 md:border-l md:border-t-0"><span className="font-bold text-brand-700">₹</span><span className="sr-only">Maximum monthly rent</span><input inputMode="numeric" {...register('maxRent')} className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400" placeholder="Max budget" /></label>}
        <button type="submit" className="btn-primary m-0.5 min-h-12 rounded-xl"><Search size={18} /> Search</button>
      </div>
      {(errors.query || errors.city) && <p className="px-2 pt-1 text-xs font-medium text-rose-600">{errors.query?.message || errors.city?.message}</p>}
    </form>
  );
}

export function AiPrompt({ onSearch, className = '' }: { onSearch: (query: string) => void; className?: string }) {
  return <button type="button" onClick={() => onSearch('Mujhe BBDITM ke paas 7000 ke andar furnished room chahiye with WiFi')} className={`inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100 ${className}`}><Sparkles size={14} /> Try AI search: “Furnished room near BBDITM under ₹7,000”</button>;
}
