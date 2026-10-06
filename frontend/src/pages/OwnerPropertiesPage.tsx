import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Lock, Plus, Trash2, UploadCloud, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roomService } from '../services/rooms';
import { apiMessage, authStorage } from '../services/api';
import type { ListingFormValues, Room } from '../types';
import { currency } from '../utils/format';
import { fallbackRoomImage, getRoomImageUrl } from '../utils/images';

const initialValues: ListingFormValues = {
  title: '',
  description: '',
  propertyType: 'room',
  roomType: 'single',
  monthlyRent: 0,
  securityDeposit: 0,
  city: '',
  area: '',
  address: '',
  landmark: '',
  location: { type: 'Point', coordinates: [0, 0] },
  furnishing: 'unfurnished',
  bathroom: 'shared',
  genderPreference: 'any',
  occupancy: 1,
  facilities: [],
  availabilityStatus: 'available',
  images: [],
};

const allowedFacilities = new Set([
  'wifi', 'parking', 'ac', 'cooler', 'washing_machine', 'kitchen',
  'balcony', 'power_backup', 'cctv', 'security', 'food', 'electricity',
  'water', 'attached_bathroom',
]);

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="field-label">{label}</span>{children}</label>;
}

export function OwnerPropertiesPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();

  const loadRooms = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const result = await roomService.listOwner();
      setRooms(result.items);
      setError('');
    } catch (loadError) {
      setError(apiMessage(loadError, 'Unable to load your room listings.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRooms();
  }, [isAuthenticated]);

  const deactivate = async (room: Room) => {
    if (!window.confirm(`Remove "${room.title}" from your listings?`)) return;
    try {
      await roomService.remove(room._id);
      await loadRooms();
    } catch (removeError) {
      setError(apiMessage(removeError, 'Unable to remove this listing.'));
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="mx-auto max-w-md py-12 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Lock size={28} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Sign in to View Properties</h2>
          <p className="mt-2 text-sm text-slate-600">
            Please log in with your room owner account to view and manage your listings.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/login" state={{ from: '/owner/properties' }} className="btn-primary">
              Log in as Owner
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">My Properties</h1>
          <p className="mt-1 text-slate-600">Manage the rooms you have listed.</p>
        </div>
        <Link to="/owner/properties/new" className="btn-primary">Add a room</Link>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</div>}
      {isLoading && <p className="text-slate-600">Loading your listings...</p>}
      {!isLoading && !error && rooms.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-xl font-bold text-slate-900">No rooms listed yet</h2>
          <p className="mt-2 text-slate-600">Add your first room so seekers can discover it.</p>
          <Link to="/owner/properties/new" className="btn-primary mt-5">List a room</Link>
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        {rooms.map((room) => {
          const mainImage = getRoomImageUrl(room.images?.[0]);
          return (
            <article
              key={room._id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <Link
                  to={`/rooms/${room._id}`}
                  aria-label={`View ${room.title}`}
                  className="absolute inset-0 z-10"
                />
                <img
                  src={mainImage}
                  alt={room.title}
                  onError={(e) => {
                    e.currentTarget.src = fallbackRoomImage;
                  }}
                  className="size-full object-cover transition duration-300 hover:scale-105"
                />
                <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5">
                  <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold capitalize text-brand-700 shadow-sm backdrop-blur-md">
                    {room.availabilityStatus}
                  </span>
                  {room.images && room.images.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/75 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
                      <Camera size={13} />
                      {room.images.length} {room.images.length === 1 ? 'photo' : 'photos'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      <Link
                        to={`/rooms/${room._id}`}
                        className="transition hover:text-brand-600"
                      >
                        {room.title}
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {[room.area, room.city].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-lg font-bold text-slate-950">
                  {currency(room.monthlyRent)}{' '}
                  <span className="text-sm font-medium text-slate-500">
                    / month
                  </span>
                </p>

                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {room.description}
                </p>

                <div className="mt-auto flex items-center gap-3 pt-5">
                  <Link
                    to={`/rooms/${room._id}`}
                    className="btn-secondary flex-1 !min-h-9 text-center text-sm"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => void deactivate(room)}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function OwnerListingPage() {
  const [values, setValues] = useState<ListingFormValues>(initialValues);
  const [facilitiesText, setFacilitiesText] = useState('wifi, water');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const addFiles = (files: File[]) => {
    if (!files.length) return;

    const validFiles = files.filter((file) => file.type.startsWith('image/'));

    if (validFiles.length !== files.length) {
      setError('Only image files (JPG, PNG, GIF, WEBP) can be uploaded.');
    }

    setSelectedFiles((current) => {
      const existingKeys = new Set(current.map((f) => `${f.name}-${f.size}-${f.lastModified}`));
      const newUnique = validFiles.filter((f) => !existingKeys.has(`${f.name}-${f.size}-${f.lastModified}`));

      if (current.length + newUnique.length > 12) {
        setError('Maximum 12 pictures allowed per room. Extra pictures were ignored.');
      }

      return [...current, ...newUnique].slice(0, 12);
    });
  };

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    addFiles(files);
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    addFiles(files);
  };

  const removeSelectedImage = (index: number) => {
    setSelectedFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const update = (field: keyof ListingFormValues, value: string | number) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!isAuthenticated || !authStorage.getToken()) {
      setError('You are not logged in. Please log in as a room owner to publish a listing.');
      return;
    }

    if (user?.role !== 'owner') {
      setError('Only room owners can publish listings. Please switch to an owner account.');
      return;
    }

    setIsSaving(true);
    try {
      const facilities = facilitiesText.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
      const invalidFacilities = facilities.filter((facility) => !allowedFacilities.has(facility));
      if (invalidFacilities.length > 0) {
        setError(`Unsupported facilities: ${invalidFacilities.join(', ')}. Use names such as wifi, water, parking or kitchen.`);
        return;
      }

      let uploadedImages: string[] = [];
      if (selectedFiles.length > 0) {
        uploadedImages = await roomService.uploadImages(selectedFiles);
      }

      if (uploadedImages.length === 0 && selectedFiles.length > 0) {
        setError('Image upload failed. Please try again with valid image files.');
        return;
      }

      await roomService.create({
        ...values,
        facilities,
        images: uploadedImages,
      });
      navigate('/owner/properties');
    } catch (saveError) {
      const msg = apiMessage(saveError, 'Unable to create this listing.');
      if (
        msg.toLowerCase().includes('authentication') ||
        msg.toLowerCase().includes('token') ||
        msg.toLowerCase().includes('permission') ||
        msg.toLowerCase().includes('forbidden')
      ) {
        setError('Your login session expired or authentication is required. Please log in again.');
      } else {
        setError(msg);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="mx-auto max-w-xl py-12 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Lock size={28} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Authentication Required</h2>
          <p className="mt-2 text-sm text-slate-600">
            Please log in with a Room Owner account to list and add properties.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              state={{ from: '/owner/properties/new' }}
              className="btn-primary justify-center"
            >
              Log in as Owner
            </Link>
            <Link
              to="/register"
              className="btn-secondary justify-center"
            >
              Register New Owner Account
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (user && user.role !== 'owner') {
    return (
      <section className="mx-auto max-w-xl py-12 text-center">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <UserX size={28} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-amber-950">Room Owner Account Required</h2>
          <p className="mt-2 text-sm text-amber-800">
            You are currently signed in as a room seeker ({user.email}). Only room owners can publish room listings.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/register"
              className="btn-primary justify-center"
            >
              Create Owner Account
            </Link>
            <Link
              to="/login"
              state={{ from: '/owner/properties/new' }}
              className="btn-secondary justify-center"
            >
              Switch to Owner Account
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div><h1 className="text-3xl font-bold text-slate-950">List a room</h1><p className="mt-1 text-slate-600">Add the details seekers need to find your property.</p></div>
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</div>}
      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Listing title"><input className="field" value={values.title} onChange={(e) => update('title', e.target.value)} placeholder="Bright single room near metro" minLength={8} required /></Field>
          <Field label="Monthly rent"><input className="field" type="number" min="0" value={values.monthlyRent} onChange={(e) => update('monthlyRent', Number(e.target.value))} required /></Field>
          <Field label="Property type"><select className="field" value={values.propertyType} onChange={(e) => update('propertyType', e.target.value)}><option value="room">Room</option><option value="pg">PG</option><option value="hostel">Hostel</option><option value="flat">Flat</option><option value="apartment">Apartment</option><option value="shared_accommodation">Shared accommodation</option></select></Field>
          <Field label="Room type"><select className="field" value={values.roomType} onChange={(e) => update('roomType', e.target.value)}><option value="single">Single</option><option value="shared">Shared</option><option value="entire_property">Entire property</option><option value="studio">Studio</option></select></Field>
          <Field label="City"><input className="field" value={values.city} onChange={(e) => update('city', e.target.value)} required /></Field>
          <Field label="Area"><input className="field" value={values.area} onChange={(e) => update('area', e.target.value)} /></Field>
          <Field label="Address"><input className="field" value={values.address} onChange={(e) => update('address', e.target.value)} minLength={5} required /></Field>
          <Field label="Landmark"><input className="field" value={values.landmark} onChange={(e) => update('landmark', e.target.value)} /></Field>
          <Field label="Security deposit"><input className="field" type="number" min="0" value={values.securityDeposit} onChange={(e) => update('securityDeposit', Number(e.target.value))} /></Field>
          <Field label="Occupancy"><input className="field" type="number" min="1" max="50" value={values.occupancy} onChange={(e) => update('occupancy', Number(e.target.value))} required /></Field>
          <Field label="Furnishing"><select className="field" value={values.furnishing} onChange={(e) => update('furnishing', e.target.value)}><option value="unfurnished">Unfurnished</option><option value="semi_furnished">Semi-furnished</option><option value="furnished">Furnished</option></select></Field>
          <Field label="Bathroom"><select className="field" value={values.bathroom} onChange={(e) => update('bathroom', e.target.value)}><option value="shared">Shared</option><option value="attached">Attached</option><option value="private">Private</option></select></Field>
        </div>
        <Field label="Description"><textarea className="field min-h-28" value={values.description} onChange={(e) => update('description', e.target.value)} minLength={20} required placeholder="Describe the room, house rules and nearby facilities." /></Field>
        <Field label="Facilities (comma separated)"><input className="field" value={facilitiesText} onChange={(e) => setFacilitiesText(e.target.value)} placeholder="wifi, water, parking" /></Field>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="field-label !mb-0">Property Pictures</label>
            <span className="text-xs font-semibold text-slate-500">
              {selectedFiles.length} / 12 photos selected
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageSelection}
            className="hidden"
            id="room-images-upload"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
              isDragging
                ? 'border-brand-500 bg-brand-50/60'
                : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-slate-100/70'
            }`}
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <UploadCloud size={24} />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">
              Choose one or multiple pictures (or drag and drop)
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Select multiple photos at once or add more one-by-one (Up to 12 images: JPG, PNG, WEBP, GIF)
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="btn-secondary !min-h-9 mt-3 inline-flex items-center gap-1.5 text-xs font-semibold"
            >
              <Plus size={14} />
              Browse Pictures
            </button>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-medium text-slate-500">
                Selected Photos (First photo is the main cover image):
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {previewUrls.map((previewUrl, index) => (
                  <div
                    key={`${previewUrl}-${index}`}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs"
                  >
                    <img
                      src={previewUrl}
                      alt={`Selected room image ${index + 1}`}
                      className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded-md bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                        Cover Photo
                      </span>
                    )}
                    <span className="absolute bottom-2 left-2 rounded-md bg-slate-950/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSelectedImage(index)}
                      title="Remove this photo"
                      className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-md transition hover:bg-rose-700"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                {selectedFiles.length < 12 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-500 transition hover:border-brand-500 hover:bg-brand-50/40 hover:text-brand-600"
                  >
                    <Plus size={20} />
                    <span className="mt-1 text-xs font-semibold">Add More</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Longitude"><input className="field" type="number" step="any" value={values.location.coordinates[0]} onChange={(e) => setValues((current) => ({ ...current, location: { ...current.location, coordinates: [Number(e.target.value), current.location.coordinates[1]] } }))} required /></Field>
          <Field label="Latitude"><input className="field" type="number" step="any" value={values.location.coordinates[1]} onChange={(e) => setValues((current) => ({ ...current, location: { ...current.location, coordinates: [current.location.coordinates[0], Number(e.target.value)] } }))} required /></Field>
        </div>
        <div className="flex flex-wrap justify-end gap-3"><Link to="/owner/properties" className="btn-secondary">Cancel</Link><button type="submit" disabled={isSaving} className="btn-primary disabled:opacity-60">{isSaving ? 'Saving...' : 'Publish listing'}</button></div>
      </form>
    </section>
  );
}
