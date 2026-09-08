import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RoomCard } from '../components/RoomCard';
import { SearchBar } from '../components/SearchBar';
import { roomService } from '../services/rooms';
import { apiMessage } from '../services/api';
import type { Room, SearchFilters } from '../types';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const query = searchParams.get('query') || '';
  const city = searchParams.get('city') || '';
  const maxRent = searchParams.get('maxRent') ? Number(searchParams.get('maxRent')) : undefined;

  const filters: SearchFilters = { query, city, maxRent, page: 1, limit: 24 };

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    roomService.search(filters)
      .then((result) => { if (active) setRooms(result.items); })
      .catch((loadError) => { if (active) setError(apiMessage(loadError, 'Unable to load rooms.')); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [city, maxRent, query]);

  const handleSearch = (nextFilters: SearchFilters) => {
    const next = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') next.set(key, String(value));
    });
    setSearchParams(next);
  };

  return (
    <div className="container-page space-y-8 py-8">
      <div><h1 className="text-3xl font-bold text-slate-950">Find a room</h1><p className="mt-1 text-slate-600">Search rooms and properties listed by owners.</p></div>
      <SearchBar initial={{ query, city, maxRent }} onSearch={handleSearch} />
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
      {isLoading && <p className="text-slate-600">Loading rooms...</p>}
      {!isLoading && !error && rooms.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No rooms found for this search.</div>}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{rooms.map((room) => <RoomCard key={room._id} room={room} />)}</div>
    </div>
  );
}
