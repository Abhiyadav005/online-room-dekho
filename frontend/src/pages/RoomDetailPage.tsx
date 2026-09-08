import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { roomService } from '../services/rooms';
import { apiMessage } from '../services/api';
import type { Room } from '../types';
import { currency } from '../utils/format';

export function RoomDetailPage() {
  const { id } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    roomService.getById(id).then(setRoom).catch((loadError) => setError(apiMessage(loadError, 'Room not found.')));
  }, [id]);

  if (error) return <div className="container-page py-12 text-center"><p className="text-rose-700">{error}</p><Link to="/search" className="btn-primary mt-5">Back to rooms</Link></div>;
  if (!room) return <div className="container-page py-12 text-center text-slate-600">Loading room details...</div>;

  return <div className="container-page space-y-6 py-8"><Link to="/search" className="text-sm font-bold text-brand-700">Back to rooms</Link><div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]"><img src={room.images?.[0]} alt={room.title} className="aspect-[16/10] w-full rounded-2xl object-cover bg-slate-100" /><div><h1 className="text-3xl font-bold text-slate-950">{room.title}</h1><p className="mt-2 text-slate-600">{[room.area, room.city, room.address].filter(Boolean).join(', ')}</p><p className="mt-6 text-2xl font-bold">{currency(room.monthlyRent)} <span className="text-base font-medium text-slate-500">/ month</span></p><p className="mt-6 leading-7 text-slate-700">{room.description}</p><div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{room.owner?.name ? `Listed by ${room.owner.name}` : 'Owner details available after enquiry.'}</div></div></div></div>;
}
