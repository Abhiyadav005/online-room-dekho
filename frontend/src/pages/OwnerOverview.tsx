import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Eye,
  Home,
  MessageSquare,
  Plus,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roomService } from '../services/rooms';
import { interactionService } from '../services/interactions';
import { apiMessage } from '../services/api';
import type { Room, Enquiry } from '../types';
import { currency } from '../utils/format';
import { fallbackRoomImage, getRoomImageUrl } from '../utils/images';

export function OwnerOverview() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [roomsResult, enquiriesResult] = await Promise.allSettled([
        roomService.listOwner(1, 20),
        interactionService.ownerEnquiries(),
      ]);

      if (roomsResult.status === 'fulfilled') {
        setRooms(roomsResult.value.items || []);
      }
      if (enquiriesResult.status === 'fulfilled') {
        setEnquiries(enquiriesResult.value || []);
      }
    } catch (err) {
      setError(apiMessage(err, 'Failed to load dashboard data.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const confirmDelete = async () => {
    if (!roomToDelete) return;
    setIsDeleting(true);
    setError('');
    try {
      await roomService.remove(roomToDelete._id);
      setRooms((prev) => prev.filter((r) => r._id !== roomToDelete._id));
      setSuccessMessage(`Room "${roomToDelete.title}" has been successfully removed.`);
      setRoomToDelete(null);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (removeError) {
      setError(apiMessage(removeError, 'Unable to remove this room listing.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleAvailability = async (room: Room) => {
    const nextStatus = room.availabilityStatus === 'available' ? 'unavailable' : 'available';
    try {
      const updated = await roomService.changeAvailability(room._id, nextStatus);
      setRooms((current) =>
        current.map((r) => (r._id === room._id ? { ...r, availabilityStatus: updated.availabilityStatus } : r))
      );
    } catch (err) {
      setError(apiMessage(err, 'Failed to update availability status.'));
    }
  };

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.availabilityStatus === 'available').length;
  const unavailableRooms = rooms.filter((r) => r.availabilityStatus === 'unavailable').length;
  const totalEnquiries = enquiries.length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow">Owner Dashboard</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Welcome back, {user?.name || 'Property Owner'}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Monitor listing activity, manage availability, or remove listings anytime.
          </p>
        </div>
        <Link
          to="/owner/properties/new"
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          Add New Property
        </Link>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-sm animate-in fade-in">
          <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
          <span className="flex-1">{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-emerald-700 hover:text-emerald-900 p-1"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 shadow-sm">
          <AlertTriangle size={20} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Building2 size={20} />
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{totalRooms}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Total Properties</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Home size={20} />
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{availableRooms}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Available for Rent</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <TrendingUp size={20} />
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{unavailableRooms}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Occupied / Rented</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <MessageSquare size={20} />
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{totalEnquiries}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Total Enquiries</p>
        </div>
      </div>

      {/* Properties Section with Remove Option */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Listed Properties</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage status or remove rooms directly from here.
            </p>
          </div>
          <Link
            to="/owner/properties"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 hover:underline"
          >
            View all properties &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading your properties...</div>
        ) : rooms.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Building2 size={28} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-800">No rooms listed yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Start adding your rooms to begin receiving tenant inquiries.
            </p>
            <Link to="/owner/properties/new" className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus size={16} />
              List Your First Room
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rooms.map((room) => {
              const isAvailable = room.availabilityStatus === 'available';
              const thumbnail = getRoomImageUrl(room.images?.[0]);
              return (
                <div
                  key={room._id}
                  className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between transition hover:bg-slate-50/50 -mx-3 px-3 rounded-xl"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={thumbnail}
                      alt={room.title}
                      onError={(e) => {
                        e.currentTarget.src = fallbackRoomImage;
                      }}
                      className="size-16 shrink-0 rounded-xl object-cover border border-slate-200"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 truncate text-base hover:text-brand-600">
                          <Link to={`/rooms/${room._id}`}>{room.title}</Link>
                        </h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {room.availabilityStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {[room.area, room.city].filter(Boolean).join(', ')} • {room.roomType} room • {room.propertyType}
                      </p>
                      <p className="text-xs font-bold text-brand-700 mt-1">
                        {currency(room.monthlyRent)} <span className="font-normal text-slate-500">/ month</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link
                      to={`/rooms/${room._id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                      title="View public listing"
                    >
                      <Eye size={14} />
                      View
                    </Link>

                    <button
                      type="button"
                      onClick={() => void toggleAvailability(room)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      title="Change availability"
                    >
                      {isAvailable ? 'Mark Rented' : 'Mark Available'}
                    </button>

                    {/* Prominent Remove Option */}
                    <button
                      type="button"
                      onClick={() => setRoomToDelete(room)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 hover:border-rose-300"
                      title="Remove this room from your dashboard"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {roomToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="overview-delete-dialog-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Trash2 size={22} />
              </div>
              <div className="flex-1">
                <h3 id="overview-delete-dialog-title" className="text-lg font-bold text-slate-900">
                  Remove Room Listing?
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Are you sure you want to remove this property? This will permanently delete the listing from your dashboard and platform.
                </p>
              </div>
            </div>

            {/* Room Preview */}
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <img
                src={getRoomImageUrl(roomToDelete.images?.[0])}
                alt={roomToDelete.title}
                onError={(e) => {
                  e.currentTarget.src = fallbackRoomImage;
                }}
                className="size-14 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate text-sm">{roomToDelete.title}</p>
                <p className="text-xs text-slate-500">{[roomToDelete.area, roomToDelete.city].filter(Boolean).join(', ')}</p>
                <p className="text-xs font-bold text-brand-700 mt-0.5">{currency(roomToDelete.monthlyRent)}/month</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setRoomToDelete(null)}
                className="btn-secondary !min-h-10 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => void confirmDelete()}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
              >
                <Trash2 size={16} />
                {isDeleting ? 'Removing...' : 'Yes, Remove Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
