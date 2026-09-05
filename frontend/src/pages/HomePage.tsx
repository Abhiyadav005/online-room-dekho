import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  Heart,
  LockKeyhole,
  MapPin,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RoomCard } from '../components/RoomCard';
import { SearchBar } from '../components/SearchBar';
import { roomService } from '../services/rooms';
import type { Room, SearchFilters } from '../types';

const features = [
  {
    icon: ShieldCheck,
    title: 'Verified Listings',
    description: 'Every listed property goes through our verification process.',
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Users,
    title: 'No Brokerage',
    description: 'Connect directly with property owners and save money.',
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: SearchCheck,
    title: 'Easy Search',
    description: 'Find rooms using location, budget and your preferences.',
    iconClass: 'bg-violet-50 text-violet-600',
  },
  {
    icon: LockKeyhole,
    title: 'Secure & Safe',
    description: 'Your conversations and enquiries stay protected.',
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'We are here whenever you need help finding a room.',
    iconClass: 'bg-sky-50 text-sky-600',
  },
];

const popularSearches = [
  { label: 'PG in Lucknow', filters: { city: 'Lucknow', propertyType: 'PG' } },
  { label: 'Room in Delhi', filters: { city: 'Delhi', propertyType: 'Room' } },
  { label: 'PG in Noida', filters: { city: 'Noida', propertyType: 'PG' } },
  { label: 'Room in Bangalore', filters: { city: 'Bangalore', propertyType: 'Room' } },
];

export function HomePage() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadRooms = async () => {
      try {
        setLoading(true);

        const response = await roomService.search({
          sort: 'newest',
          page: 1,
          limit: 4,
        });

        if (active) {
          setRooms(response.items.slice(0, 4));
        }
      } catch {
        if (active) {
          setRooms([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRooms();

    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (filters: SearchFilters) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === false) return;

      if (Array.isArray(value)) {
        value.forEach((item) => params.append('facility', String(item)));
        return;
      }

      params.set(key, String(value));
    });

    navigate(`/search?${params.toString()}`);
  };

  const handlePopularSearch = (filters: SearchFilters) => {
    handleSearch(filters);
  };

  return (
    <div className="bg-slate-50">
      {/* =========================================================
          HERO SECTION
      ========================================================== */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="container-page py-5 sm:py-7 lg:py-8">
          <div className="relative min-h-[500px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lift">
            {/* Hero image */}
            <div
              className="absolute inset-y-0 right-0 w-full lg:w-[57%]"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            {/* Desktop image overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 via-[48%] to-white/10 lg:from-white lg:via-white lg:to-transparent" />

            {/* Hero content */}
            <div className="relative z-10 flex min-h-[500px] items-center">
              <div className="w-full px-5 py-10 sm:px-8 lg:w-[100%] lg:px-10 xl:px-12">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">
                  <BadgeCheck size={15} />
                  Verified rooms • Trusted owners
                </div>

                <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-[52px]">
                  Find Your Perfect
                  <span className="block text-brand-600">Room Anywhere</span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                  Find verified rooms, PGs and flats without brokerage.
                  Search by location, budget and everything that matters to you.
                </p>

                {/* Search box */}
                <div className="mt-7 max-w-3xl lg:max-w-[760px]" >
                  <SearchBar onSearch={handleSearch} />
                </div>

                {/* AI search */}
                <div className="mt-4">
                  <Link
                    to="/search?sort=ai"
                    className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 transition hover:text-brand-900"
                  >
                    <Sparkles size={16} />
                    Try AI-powered room search
                    <ArrowRight size={15} />
                  </Link>
                </div>

                {/* Popular searches */}
                <div className="mt-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-xs font-bold text-slate-500">
                      Popular:
                    </span>

                    {popularSearches.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handlePopularSearch(item.filters)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Verified room floating card */}
            <div className="absolute right-5 top-6 z-20 hidden rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-lift backdrop-blur-md md:block lg:right-8 lg:top-8">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={21} />
                </span>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Verified Rooms
                  </p>
                  <p className="text-xs text-slate-500">
                    Trusted listings for you
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="absolute bottom-5 right-5 z-20 hidden rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lift backdrop-blur-md lg:block">
              <div className="grid grid-cols-3 divide-x divide-slate-200">
                <div className="px-5 text-center">
                  <p className="text-xl font-bold text-brand-700">25K+</p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                    Rooms Listed
                  </p>
                </div>

                <div className="px-5 text-center">
                  <p className="text-xl font-bold text-brand-700">15K+</p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                    Happy Users
                  </p>
                </div>

                <div className="px-5 text-center">
                  <p className="text-xl font-bold text-brand-700">50+</p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                    Cities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY ONLINE ROOM DEKHO
      ========================================================== */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-page py-10 sm:py-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="flex gap-3 rounded-2xl p-3 transition hover:bg-slate-50"
                >
                  <div
                    className={`grid size-11 shrink-0 place-items-center rounded-xl ${feature.iconClass}`}
                  >
                    <Icon size={20} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      {feature.title}
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          RECOMMENDED ROOMS
      ========================================================== */}
      <section className="bg-slate-50">
        <div className="container-page py-12 sm:py-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Handpicked for you</p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Recommended Rooms
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Explore some of the latest rooms and PGs available on Online
                Room Dekho.
              </p>
            </div>

            <Link
              to="/search"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-900 sm:inline-flex"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="aspect-[16/10] animate-pulse bg-slate-200" />
                  <div className="space-y-3 p-4">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-3/5 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : rooms.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {rooms.map((room) => (
                <RoomCard key={room._id} room={room} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-brand-50 text-brand-600">
                <SearchCheck size={22} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Rooms are loading soon
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Start searching to discover rooms, PGs and flats available in
                your preferred location.
              </p>

              <Link
                to="/search"
                className="btn-primary mt-5 inline-flex"
              >
                Explore rooms
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700"
            >
              View all rooms
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          LIST YOUR ROOM CTA
      ========================================================== */}
      <section className="bg-white">
        <div className="container-page py-12 sm:py-14">
          <div className="relative overflow-hidden rounded-[28px] bg-brand-900 px-6 py-10 sm:px-10 lg:px-14">
            <div className="absolute -right-20 -top-20 size-64 rounded-full bg-brand-600/30 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-emerald-100">
                  <Heart size={14} />
                  For property owners
                </div>

                <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Have a room or property?
                  <span className="block text-emerald-200">
                    List it and start earning.
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-emerald-50/80 sm:text-base">
                  Reach genuine tenants looking for rooms, PGs and flats.
                  Manage your listings and enquiries from one place.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/register?role=owner"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand-900 transition hover:bg-emerald-50"
                  >
                    List Your Room
                    <ArrowRight size={17} />
                  </Link>

                  <Link
                    to="/how-it-works"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    How it works
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                {[
                  'Free listing',
                  'Verified tenants',
                  'Direct enquiries',
                  'Secure platform',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                  >
                    <BadgeCheck
                      size={19}
                      className="text-emerald-300"
                    />

                    <p className="mt-3 text-sm font-bold text-white">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          LOCATION / SEARCH CTA
      ========================================================== */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="container-page py-12 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <MapPin size={22} />
            </div>

            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Your next room is closer than you think.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Search by city, locality, college, office or landmark and find
              a place that fits your lifestyle and budget.
            </p>

            <Link
              to="/search"
              className="btn-primary mt-6 inline-flex"
            >
              <SearchCheck size={17} />
              Find my room
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}