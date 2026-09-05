import {
  Bath,
  BedDouble,
  Heart,
  MapPin,
  Ruler,
  ShieldCheck,
  Star,
  UsersRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import type { Room } from '../types';
import { currency } from '../utils/format';
import { AvailabilityBadge, VerificationBadge } from './StatusBadge';

const fallbackImage =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560"%3E%3Crect width="900" height="560" fill="%23eef2ff"/%3E%3Cpath d="M150 440V260l180-150 180 150v180M510 440V210l120-100 120 100v230" fill="none" stroke="%234f46e5" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/%3E%3C/svg%3E';

interface RoomCardProps {
  room: Room;
  favourite?: boolean;
  onFavourite?: (room: Room, next: boolean) => void;
}

const getPropertyLabel = (propertyType: string) => {
  const value = propertyType.toLowerCase();

  if (value.includes('flat')) return 'Flat';
  if (value.includes('house')) return 'House';
  if (value.includes('apartment')) return 'Apartment';
  if (value.includes('room')) return 'Room';

  return propertyType;
};

const getRoomTypeLabel = (roomType: string) => {
  const value = roomType.toLowerCase();

  if (value.includes('single')) return 'Single Room';
  if (value.includes('double')) return 'Double Room';
  if (value.includes('shared')) return 'Shared Room';
  if (value.includes('1 bhk')) return '1 BHK';
  if (value.includes('2 bhk')) return '2 BHK';
  if (value.includes('3 bhk')) return '3 BHK';

  return roomType;
};

const getFurnishingLabel = (status?: Room['furnishingStatus']) => {
  if (!status) return null;

  if (status === 'semi-furnished') return 'Semi-furnished';

  return status.charAt(0).toUpperCase() + status.slice(1);
};

export function RoomCard({
  room,
  favourite = false,
  onFavourite,
}: RoomCardProps) {
  const image = room.images?.[0] || fallbackImage;

  const propertyLabel = getPropertyLabel(room.propertyType);
  const roomTypeLabel = getRoomTypeLabel(room.roomType);
  const furnishingLabel = getFurnishingLabel(room.furnishingStatus);

  const location = [room.area, room.city].filter(Boolean).join(', ');

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
      {/* =========================================================
          IMAGE
      ========================================================== */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Link
          to={`/rooms/${room._id}`}
          aria-label={`View ${room.title}`}
          className="absolute inset-0 z-10"
        />

        <img
          src={image}
          onError={(event) => {
            event.currentTarget.src = fallbackImage;
          }}
          alt={`Photo of ${room.title}`}
          loading="lazy"
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Image overlay */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />

        {/* Availability */}
        <div className="absolute left-3 top-3 z-20">
          <AvailabilityBadge status={room.availabilityStatus} />
        </div>

        {/* Favourite */}
        <button
          type="button"
          disabled={!onFavourite}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            onFavourite?.(room, !favourite);
          }}
          aria-label={
            favourite
              ? `Remove ${room.title} from favourites`
              : `Save ${room.title} to favourites`
          }
          aria-pressed={favourite}
          className={[
            'absolute right-3 top-3 z-20 grid size-10 place-items-center rounded-full',
            'border border-white/70 shadow-sm backdrop-blur-md transition-all',
            favourite
              ? 'bg-rose-500 text-white'
              : 'bg-white/95 text-slate-700 hover:bg-white hover:text-rose-500',
            !onFavourite ? 'cursor-default opacity-90' : '',
          ].join(' ')}
        >
          <Heart
            size={18}
            fill={favourite ? 'currentColor' : 'none'}
            strokeWidth={2.2}
          />
        </button>

        {/* AI match */}
        {room.aiMatch !== undefined && (
          <span className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-slate-950/85 px-2.5 py-1.5 text-xs font-bold text-white backdrop-blur-md">
            <span className="text-emerald-300">✦</span>
            {room.aiMatch}% match
          </span>
        )}

        {/* Verified */}
        {room.verificationStatus === 'verified' && (
          <span className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 shadow-sm backdrop-blur-md">
            <ShieldCheck size={14} />
            Verified
          </span>
        )}
      </div>

      {/* =========================================================
          CONTENT
      ========================================================== */}
      <div className="p-4">
        {/* Property type + room type */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-brand-700">
                {propertyLabel}
              </span>

              <span className="text-slate-300">•</span>

              <span className="text-[11px] font-bold text-slate-500">
                {roomTypeLabel}
              </span>
            </div>

            <h3 className="mt-1.5 line-clamp-1 text-[17px] font-bold leading-6 text-slate-950">
              <Link
                to={`/rooms/${room._id}`}
                className="rounded-md outline-none transition hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {room.title}
              </Link>
            </h3>
          </div>

          {/* Rent */}
          <div className="shrink-0 text-right">
            <p className="text-[17px] font-extrabold text-slate-950">
              {currency(room.monthlyRent)}
            </p>

            <p className="text-[10px] font-semibold text-slate-400">
              / month
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="mt-2.5 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin
            size={15}
            className="shrink-0 text-brand-600"
          />

          <span className="min-w-0 truncate">
            {location || room.address}
          </span>

          {room.distance !== undefined && (
            <span className="ml-auto shrink-0 rounded-md bg-slate-100 px-1.5 py-1 text-[10px] font-bold text-slate-600">
              {room.distance} km
            </span>
          )}
        </div>

        {/* =======================================================
            PROPERTY QUICK INFO
        ======================================================== */}
        <div className="mt-3 flex flex-wrap gap-2">
          {room.roomType && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-600">
              <BedDouble size={14} className="text-brand-600" />
              {roomTypeLabel}
            </span>
          )}

          {room.occupancy && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-600">
              <UsersRound size={14} className="text-brand-600" />
              {room.occupancy}
            </span>
          )}

          {furnishingLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-600">
              <Ruler size={14} className="text-brand-600" />
              {furnishingLabel}
            </span>
          )}
        </div>

        {/* =======================================================
            FACILITIES
        ======================================================== */}
        {room.facilities?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {room.facilities.slice(0, 3).map((facility) => (
              <span
                key={facility}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500"
              >
                {facility}
              </span>
            ))}

            {room.facilities.length > 3 && (
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-400">
                +{room.facilities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* =======================================================
            RATING + VERIFICATION
        ======================================================== */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex min-w-0 items-center gap-2">
            {room.averageRating > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700">
                <Star
                  size={14}
                  fill="currentColor"
                  className="text-amber-400"
                />

                {room.averageRating.toFixed(1)}

                <span className="font-medium text-slate-400">
                  ({room.reviewCount})
                </span>
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-400">
                New listing
              </span>
            )}

            {room.owner?.phoneVerified && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600"
                title="Owner phone verified"
              >
                <ShieldCheck size={13} />
                Owner verified
              </span>
            )}
          </div>

          <VerificationBadge
            status={room.verificationStatus}
            compact
          />
        </div>

        {/* =======================================================
            BOTTOM ACTION
        ======================================================== */}
        <Link
          to={`/rooms/${room._id}`}
          className="mt-3 flex min-h-10 w-full items-center justify-center rounded-xl border border-brand-100 bg-brand-50 px-3 text-xs font-bold text-brand-700 transition hover:border-brand-200 hover:bg-brand-100"
        >
          View room details
        </Link>
      </div>
    </article>
  );
}