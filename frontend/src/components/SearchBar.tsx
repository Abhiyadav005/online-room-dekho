import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronDown,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { SearchFilters } from '../types';

const searchSchema = z.object({
  query: z
    .string()
    .trim()
    .max(120, 'Search must be under 120 characters.')
    .optional(),

  city: z
    .string()
    .trim()
    .max(80, 'City name is too long.')
    .optional(),

  maxRent: z
    .string()
    .refine(
      (value) =>
        value === '' ||
        (/^\d+$/.test(value) && Number(value) >= 0),
      'Enter a valid budget.'
    )
    .optional(),
});

type SearchInput = z.infer<typeof searchSchema>;

interface SearchBarProps {
  initial?: SearchFilters;
  onSearch: (filters: SearchFilters) => void;
  compact?: boolean;
}

export function SearchBar({
  initial = {},
  onSearch,
  compact = false,
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SearchInput>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: initial.query || '',
      city: initial.city || '',
      maxRent: initial.maxRent ? String(initial.maxRent) : '',
    },
  });

  useEffect(() => {
    reset({
      query: initial.query || '',
      city: initial.city || '',
      maxRent: initial.maxRent ? String(initial.maxRent) : '',
    });
  }, [initial.city, initial.maxRent, initial.query, reset]);

  const submit = (values: SearchInput) => {
    onSearch({
      query: values.query?.trim() || undefined,
      city: values.city?.trim() || undefined,
      maxRent: values.maxRent ? Number(values.maxRent) : undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className={[
        'w-full rounded-2xl border border-slate-200 bg-white shadow-lift',
        compact ? 'p-1.5' : 'p-2',
      ].join(' ')}
    >
      {/* Main search row */}
      <div
        className={[
          'grid gap-1',
          compact
            ? 'sm:grid-cols-[1.2fr_1fr_auto]'
            : 'md:grid-cols-[1.35fr_1fr_0.85fr_auto]',
        ].join(' ')}
      >
        {/* Search query */}
        <label className="group relative flex min-h-12 items-center gap-2 rounded-xl px-3 transition hover:bg-slate-50 focus-within:bg-slate-50" style={{minWidth: "300px"}}>
          <Search
            size={19}
            strokeWidth={2.2}
            className="shrink-0 text-brand-600"
          />

          <span className="sr-only">
            Search for a room, area, college or landmark
          </span>

          <input
            {...register('query')}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            placeholder="Area, college, landmark or room type"
          />
        </label>

        {/* City */}
        <label className="group relative flex min-h-12 items-center gap-2 rounded-xl border-t border-slate-100 px-3 transition hover:bg-slate-50 focus-within:bg-slate-50 sm:border-l sm:border-t-0" style={{minWidth: "130px"}}>
          <MapPin
            size={19}
            strokeWidth={2.2}
            className="shrink-0 text-brand-600"
          />

          <span className="sr-only">City</span>

          <input
            {...register('city')}
            autoComplete="address-level2"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            placeholder="City"
          />
        </label>

        {/* Budget */}
        {!compact && (
          <label className="group relative flex min-h-12 items-center gap-2 rounded-xl border-t border-slate-100 px-3 transition hover:bg-slate-50 focus-within:bg-slate-50 md:border-l md:border-t-0" style={{minWidth: "130px"}}>
            <span className="text-lg font-bold text-brand-700">₹</span>

            <span className="sr-only">Maximum monthly rent</span>

            <input
              inputMode="numeric"
              {...register('maxRent')}
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
              placeholder="Max budget"
            />
          </label>
        )}

        {/* Search button */}
        <button
          type="submit"
          className="btn-primary m-0.5 min-h-12 rounded-xl px-5"
        >
          <Search size={18} strokeWidth={2.4} />
          <span className="hidden sm:inline">Search rooms</span>
          <span className="sm:hidden">Search</span>
        </button>
      </div>

      {/* Validation error */}
      {(errors.query || errors.city || errors.maxRent) && (
        <p className="px-3 pb-1 pt-1 text-xs font-semibold text-rose-600">
          {errors.query?.message ||
            errors.city?.message ||
            errors.maxRent?.message}
        </p>
      )}

      {/* Advanced filter toggle */}
      {!compact && (
        <div className="mt-1 border-t border-slate-100 px-2 pt-2">
          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-brand-700"
          >
            <SlidersHorizontal size={15} />

            More filters

            <ChevronDown
              size={14}
              className={`transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showFilters && (
            <div className="mt-2 rounded-xl bg-slate-50 p-3">
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Property type
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    PG • Room • Flat • Hostel
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Room type
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    Single • Double • Shared
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Facilities
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    Wi-Fi • Parking • Food • AC
                  </p>
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-400">
                Detailed filters will be connected to the search results page
                in the next step.
              </p>
            </div>
          )}
        </div>
      )}
    </form>
  );
}

/* ================================================================
   AI SEARCH PROMPT
================================================================ */

interface AiPromptProps {
  onSearch: (query: string) => void;
  className?: string;
}

export function AiPrompt({
  onSearch,
  className = '',
}: AiPromptProps) {
  const exampleQuery =
    'Mujhe BBDITM ke paas 7000 ke andar furnished room chahiye with WiFi';

  return (
    <button
      type="button"
      onClick={() => onSearch(exampleQuery)}
      className={[
        'inline-flex items-center gap-2 rounded-full',
        'border border-brand-200 bg-brand-50 px-3 py-1.5',
        'text-xs font-bold text-brand-700',
        'transition hover:border-brand-300 hover:bg-brand-100',
        className,
      ].join(' ')}
    >
      <Sparkles size={14} />

      <span>
        Try AI search:{' '}
        <span className="font-semibold">
          Furnished room near BBDITM under ₹7,000
        </span>
      </span>
    </button>
  );
}