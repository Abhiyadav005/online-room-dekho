import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { roomService } from '../services/rooms';
import { apiMessage } from '../services/api';
import type { ListingFormValues, Room } from '../types';
import { currency } from '../utils/format';

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

  const loadRooms = async () => {
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
  }, []);

  const deactivate = async (room: Room) => {
    if (!window.confirm(`Remove "${room.title}" from your listings?`)) return;
    try {
      await roomService.remove(room._id);
      await loadRooms();
    } catch (removeError) {
      setError(apiMessage(removeError, 'Unable to remove this listing.'));
    }
  };

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
      <div className="grid gap-4 md:grid-cols-2">
        {rooms.map((room) => (
          <article key={room._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-950">{room.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{[room.area, room.city].filter(Boolean).join(', ')}</p>
              </div>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold capitalize text-brand-700">{room.availabilityStatus}</span>
            </div>
            <p className="mt-4 text-lg font-bold text-slate-950">{currency(room.monthlyRent)} <span className="text-sm font-medium text-slate-500">/ month</span></p>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{room.description}</p>
            <button type="button" onClick={() => void deactivate(room)} className="btn-secondary mt-5 !min-h-9 text-sm">Remove listing</button>
          </article>
        ))}
      </div>
    </section>
  );
}

export function OwnerListingPage() {
  const [values, setValues] = useState<ListingFormValues>(initialValues);
  const [facilitiesText, setFacilitiesText] = useState('wifi, water');
  const [imagesText, setImagesText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const update = (field: keyof ListingFormValues, value: string | number) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const facilities = facilitiesText.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
      const invalidFacilities = facilities.filter((facility) => !allowedFacilities.has(facility));
      if (invalidFacilities.length > 0) {
        setError(`Unsupported facilities: ${invalidFacilities.join(', ')}. Use names such as wifi, water, parking or kitchen.`);
        return;
      }

      const images = imagesText.split(',').map((item) => item.trim()).filter(Boolean);
      if (images.some((image) => !/^https?:\/\/[^\s]+$/.test(image))) {
        setError('Each image must be a valid URL beginning with http:// or https://.');
        return;
      }

      await roomService.create({
        ...values,
        facilities,
        images,
      });
      navigate('/owner/properties');
    } catch (saveError) {
      setError(apiMessage(saveError, 'Unable to create this listing.'));
    } finally {
      setIsSaving(false);
    }
  };

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
        <Field label="Image URLs (comma separated, optional)"><input className="field" value={imagesText} onChange={(e) => setImagesText(e.target.value)} placeholder="https://example.com/room.jpg" /></Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Longitude"><input className="field" type="number" step="any" value={values.location.coordinates[0]} onChange={(e) => setValues((current) => ({ ...current, location: { ...current.location, coordinates: [Number(e.target.value), current.location.coordinates[1]] } }))} required /></Field>
          <Field label="Latitude"><input className="field" type="number" step="any" value={values.location.coordinates[1]} onChange={(e) => setValues((current) => ({ ...current, location: { ...current.location, coordinates: [current.location.coordinates[0], Number(e.target.value)] } }))} required /></Field>
        </div>
        <div className="flex flex-wrap justify-end gap-3"><Link to="/owner/properties" className="btn-secondary">Cancel</Link><button type="submit" disabled={isSaving} className="btn-primary disabled:opacity-60">{isSaving ? 'Saving...' : 'Publish listing'}</button></div>
      </form>
    </section>
  );
}
