import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { roomService } from '../services/rooms';
import { apiMessage } from '../services/api';
import type { Room } from '../types';
import { currency } from '../utils/format';
import { fallbackRoomImage, getRoomImageUrl } from '../utils/images';

export function RoomDetailPage() {
  const { id } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    roomService
      .getById(id)
      .then((data) => {
        setRoom(data);
        setActiveImageIndex(0);
      })
      .catch((loadError) => setError(apiMessage(loadError, 'Room not found.')));
  }, [id]);

  if (error) {
    return (
      <div className="container-page py-12 text-center">
        <p className="text-rose-700">{error}</p>
        <Link to="/search" className="btn-primary mt-5">
          Back to rooms
        </Link>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container-page py-12 text-center text-slate-600">
        Loading room details...
      </div>
    );
  }

  const images = (room.images && room.images.length > 0)
    ? room.images.map((img) => getRoomImageUrl(img))
    : [fallbackRoomImage];

  const currentImage = images[activeImageIndex] || images[0] || fallbackRoomImage;

  return (
    <div className="container-page space-y-6 py-8">
      <Link to="/search" className="text-sm font-bold text-brand-700">
        &larr; Back to rooms
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm border border-slate-200">
            <img
              src={currentImage}
              alt={room.title}
              onError={(e) => {
                e.currentTarget.src = fallbackRoomImage;
              }}
              className="size-full object-cover transition duration-300"
            />
            {images.length > 1 && (
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
                <Camera size={14} />
                {activeImageIndex + 1} of {images.length}
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((imgUrl, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={[
                    'relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition',
                    activeImageIndex === index
                      ? 'border-brand-600 ring-2 ring-brand-300'
                      : 'border-slate-200 opacity-70 hover:opacity-100',
                  ].join(' ')}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${index + 1}`}
                    onError={(e) => {
                      e.currentTarget.src = fallbackRoomImage;
                    }}
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-950">{room.title}</h1>
          <p className="mt-2 text-slate-600">
            {[room.area, room.city, room.address].filter(Boolean).join(', ')}
          </p>
          <p className="mt-6 text-2xl font-bold">
            {currency(room.monthlyRent)}{' '}
            <span className="text-base font-medium text-slate-500">/ month</span>
          </p>
          <p className="mt-6 leading-7 text-slate-700">{room.description}</p>
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            {room.owner?.name
              ? `Listed by ${room.owner.name}`
              : 'Owner details available after enquiry.'}
          </div>
        </div>
      </div>
    </div>
  );
}
