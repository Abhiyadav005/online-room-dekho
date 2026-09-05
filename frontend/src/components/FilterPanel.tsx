import {
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type {
  GenderPreference,
  PropertyType,
  RoomType,
  SearchFilters,
  TenantType,
} from '../types';

/* ================================================================
   FILTER OPTIONS
================================================================ */

const facilities = [
  'Wi-Fi',
  'AC',
  'Attached bathroom',
  'CCTV',
  'Security',
  'Washing machine',
  'Kitchen',
  'Parking',
  'Balcony',
  'Power backup',
];

const propertyTypes: {
  value: PropertyType;
  label: string;
}[] = [
  {
    value: 'room',
    label: 'Room',
  },
  {
    value: 'flat',
    label: 'Flat',
  },
  {
    value: 'house',
    label: 'House',
  },
  {
    value: 'apartment',
    label: 'Apartment',
  },
];

const roomTypes: {
  value: RoomType;
  label: string;
}[] = [
  {
    value: 'single',
    label: 'Single room',
  },
  {
    value: 'double',
    label: 'Double sharing',
  },
  {
    value: 'shared',
    label: 'Shared room',
  },
  {
    value: '1bhk',
    label: '1 BHK',
  },
  {
    value: '2bhk',
    label: '2 BHK',
  },
  {
    value: '3bhk',
    label: '3 BHK',
  },
  {
    value: 'other',
    label: 'Studio / Other',
  },
];

const tenantTypes: {
  value: TenantType;
  label: string;
}[] = [
  {
    value: 'student',
    label: 'Student',
  },
  {
    value: 'tourist',
    label: 'Tourist',
  },
  {
    value: 'family',
    label: 'Family',
  },
  {
    value: 'worker',
    label: 'Worker',
  },
  {
    value: 'professional',
    label: 'Working professional',
  },
  {
    value: 'other',
    label: 'Other',
  },
];

/* ================================================================
   FILTER PANEL
================================================================ */

interface FilterPanelProps {
  value: SearchFilters;

  onApply: (
    filters: SearchFilters,
  ) => void;

  onClose?: () => void;

  mobile?: boolean;
}

export function FilterPanel({
  value,
  onApply,
  onClose,
  mobile = false,
}: FilterPanelProps) {
  const [draft, setDraft] =
    useState<SearchFilters>(value);

  /* Keep draft synchronized with parent filters. */
  useEffect(() => {
    setDraft(value);
  }, [value]);

  /* ==============================================================
     CHANGE FILTER
  ============================================================== */

  const change = <
    K extends keyof SearchFilters,
  >(
    key: K,
    next: SearchFilters[K],
  ) => {
    setDraft((current) => ({
      ...current,
      [key]:
        next === '' ||
        next === false ||
        next === undefined
          ? undefined
          : next,

      page: 1,
    }));
  };

  /* ==============================================================
     FACILITY TOGGLE
  ============================================================== */

  const toggleFacility = (
    facility: string,
  ) => {
    const current =
      draft.facilities || [];

    const exists =
      current.includes(facility);

    change(
      'facilities',
      exists
        ? current.filter(
            (item) =>
              item !== facility,
          )
        : [...current, facility],
    );
  };

  /* ==============================================================
     RESET
  ============================================================== */

  const reset = () => {
    setDraft({
      query: value.query,
      city: value.city,
      area: value.area,
      sort: 'relevance',
      page: 1,
      limit: value.limit || 12,
    });
  };

  /* ==============================================================
     APPLY
  ============================================================== */

  const apply = () => {
    onApply({
      ...draft,
      page: 1,
    });

    onClose?.();
  };

  return (
    <aside
      className={`${
        mobile
          ? 'w-full'
          : 'sticky top-24'
      } surface overflow-hidden`}
      aria-label="Room and flat search filters"
    >
      {/* ==========================================================
          HEADER
      ========================================================== */}

      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="inline-flex items-center gap-2 font-bold text-slate-900">
          <SlidersHorizontal
            size={18}
            className="text-brand-600"
          />

          Filters
        </h2>

        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900"
        >
          <RotateCcw size={13} />

          Reset
        </button>
      </div>

      {/* ==========================================================
          FILTER BODY
      ========================================================== */}

      <div className="max-h-[70vh] space-y-5 overflow-y-auto p-4">

        {/* ========================================================
            RENT
        ======================================================== */}

        <section>
          <label className="field-label">
            Monthly rent
          </label>

          <div className="grid grid-cols-2 gap-2">
            <input
              value={
                draft.minRent ?? ''
              }
              onChange={(event) =>
                change(
                  'minRent',
                  Number(
                    event.target.value,
                  ) || undefined,
                )
              }
              inputMode="numeric"
              min="0"
              type="number"
              className="field"
              placeholder="Min ₹"
              aria-label="Minimum monthly rent"
            />

            <input
              value={
                draft.maxRent ?? ''
              }
              onChange={(event) =>
                change(
                  'maxRent',
                  Number(
                    event.target.value,
                  ) || undefined,
                )
              }
              inputMode="numeric"
              min="0"
              type="number"
              className="field"
              placeholder="Max ₹"
              aria-label="Maximum monthly rent"
            />
          </div>
        </section>

        {/* ========================================================
            PROPERTY TYPE
        ======================================================== */}

        <section>
          <label className="field-label">
            Property type
          </label>

          <select
            value={
              draft.propertyType || ''
            }
            onChange={(event) =>
              change(
                'propertyType',
                event.target
                  .value as SearchFilters['propertyType'],
              )
            }
            className="field"
          >
            <option value="">
              Any property
            </option>

            {propertyTypes.map(
              (type) => (
                <option
                  key={type.value}
                  value={type.value}
                >
                  {type.label}
                </option>
              ),
            )}
          </select>
        </section>

        {/* ========================================================
            ROOM TYPE
        ======================================================== */}

        <section>
          <label className="field-label">
            Room / BHK type
          </label>

          <select
            value={
              draft.roomType || ''
            }
            onChange={(event) =>
              change(
                'roomType',
                event.target
                  .value as SearchFilters['roomType'],
              )
            }
            className="field"
          >
            <option value="">
              Any room type
            </option>

            {roomTypes.map(
              (type) => (
                <option
                  key={type.value}
                  value={type.value}
                >
                  {type.label}
                </option>
              ),
            )}
          </select>
        </section>

        {/* ========================================================
            WHO IS IT FOR?
        ======================================================== */}

        <section>
          <label className="field-label">
            Looking for whom?
          </label>

          <select
            value={
              draft.tenantType || ''
            }
            onChange={(event) =>
              change(
                'tenantType',
                event.target
                  .value as SearchFilters['tenantType'],
              )
            }
            className="field"
          >
            <option value="">
              Anyone
            </option>

            {tenantTypes.map(
              (type) => (
                <option
                  key={type.value}
                  value={type.value}
                >
                  {type.label}
                </option>
              ),
            )}
          </select>
        </section>

        {/* ========================================================
            FURNISHING
        ======================================================== */}

        <section>
          <label className="field-label">
            Furnishing
          </label>

          <select
            value={
              draft.furnishingStatus ||
              ''
            }
            onChange={(event) =>
              change(
                'furnishingStatus',
                event.target
                  .value as SearchFilters['furnishingStatus'],
              )
            }
            className="field"
          >
            <option value="">
              Any furnishing
            </option>

            <option value="furnished">
              Fully furnished
            </option>

            <option value="semi-furnished">
              Semi-furnished
            </option>

            <option value="unfurnished">
              Unfurnished
            </option>
          </select>
        </section>

        {/* ========================================================
            FACILITIES
        ======================================================== */}

        <section>
          <label className="field-label">
            Facilities
          </label>

          <div className="flex flex-wrap gap-2">
            {facilities.map(
              (facility) => {
                const active =
                  (
                    draft.facilities ||
                    []
                  ).includes(
                    facility,
                  );

                return (
                  <button
                    type="button"
                    key={facility}
                    onClick={() =>
                      toggleFacility(
                        facility,
                      )
                    }
                    aria-pressed={active}
                    className={`rounded-full border px-2.5 py-1.5 text-xs font-bold transition ${
                      active
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'
                    }`}
                  >
                    {facility}
                  </button>
                );
              },
            )}
          </div>
        </section>

        {/* ========================================================
            GENDER PREFERENCE
        ======================================================== */}

        <section>
          <label className="field-label">
            Preferred tenant
          </label>

          <select
            value={
              draft.genderPreference ||
              ''
            }
            onChange={(event) =>
              change(
                'genderPreference',
                event.target
                  .value as GenderPreference,
              )
            }
            className="field"
          >
            <option value="">
              No preference
            </option>

            <option value="any">
              Anyone
            </option>

            <option value="male">
              Male
            </option>

            <option value="female">
              Female
            </option>
          </select>
        </section>

        {/* ========================================================
            QUICK PREFERENCES
        ======================================================== */}

        <section className="space-y-3">
          <label className="field-label">
            Preferences
          </label>

          <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-700">
            <span>
              Furnished only
            </span>

            <input
              checked={Boolean(
                draft.furnished,
              )}
              onChange={(event) =>
                change(
                  'furnished',
                  event.target
                    .checked,
                )
              }
              type="checkbox"
              className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-700">
            <span>
              Verified property
            </span>

            <input
              checked={Boolean(
                draft.verified,
              )}
              onChange={(event) =>
                change(
                  'verified',
                  event.target
                    .checked,
                )
              }
              type="checkbox"
              className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-700">
            <span>
              Verified owner phone
            </span>

            <input
              checked={Boolean(
                draft.phoneVerified,
              )}
              onChange={(event) =>
                change(
                  'phoneVerified',
                  event.target
                    .checked,
                )
              }
              type="checkbox"
              className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
          </label>
        </section>

        {/* ========================================================
            DISTANCE
        ======================================================== */}

        <section>
          <label className="field-label">
            Maximum distance
          </label>

          <select
            value={
              draft.maxDistance || ''
            }
            onChange={(event) =>
              change(
                'maxDistance',
                Number(
                  event.target.value,
                ) || undefined,
              )
            }
            className="field"
          >
            <option value="">
              Any distance
            </option>

            <option value="1">
              Within 1 km
            </option>

            <option value="2">
              Within 2 km
            </option>

            <option value="5">
              Within 5 km
            </option>

            <option value="10">
              Within 10 km
            </option>
          </select>
        </section>

        {/* ========================================================
            RATING
        ======================================================== */}

        <section>
          <label className="field-label">
            Minimum rating
          </label>

          <select
            value={
              draft.minRating || ''
            }
            onChange={(event) =>
              change(
                'minRating',
                Number(
                  event.target.value,
                ) || undefined,
              )
            }
            className="field"
          >
            <option value="">
              Any rating
            </option>

            <option value="4.5">
              4.5★ and up
            </option>

            <option value="4">
              4.0★ and up
            </option>

            <option value="3">
              3.0★ and up
            </option>
          </select>
        </section>

        {/* ========================================================
            AVAILABILITY
        ======================================================== */}

        <section>
          <label className="field-label">
            Availability
          </label>

          <select
            value={
              draft.availability || ''
            }
            onChange={(event) =>
              change(
                'availability',
                event.target
                  .value as SearchFilters['availability'],
              )
            }
            className="field"
          >
            <option value="">
              Any status
            </option>

            <option value="available">
              Available now
            </option>

            <option value="limited">
              Limited availability
            </option>
          </select>
        </section>
      </div>

      {/* ==========================================================
          APPLY BUTTON
      ========================================================== */}

      <div className="border-t p-3">
        <button
          type="button"
          onClick={apply}
          className="btn-primary flex w-full items-center justify-center gap-2"
        >
          Show matching rooms

          <ChevronDown size={16} />
        </button>
      </div>
    </aside>
  );
}

/* ================================================================
   SORT SELECT
================================================================ */

export const SortSelect = ({
  value,
  onChange,
}: {
  value?: SearchFilters['sort'];

  onChange: (
    value: SearchFilters['sort'],
  ) => void;
}) => (
  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
    <span className="hidden sm:inline">
      Sort:
    </span>

    <select
      value={
        value || 'relevance'
      }
      onChange={(event) =>
        onChange(
          event.target
            .value as SearchFilters['sort'],
        )
      }
      className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-bold text-slate-700 focus:border-brand-500 focus:outline-none"
    >
      <option value="relevance">
        Relevance
      </option>

      <option value="ai">
        AI match
      </option>

      <option value="rent_asc">
        Lowest rent
      </option>

      <option value="rent_desc">
        Highest rent
      </option>

      <option value="nearest">
        Nearest
      </option>

      <option value="rating">
        Highest rated
      </option>

      <option value="newest">
        Newest
      </option>
    </select>
  </label>
);

/* ================================================================
   ACTIVE FILTER COUNT
================================================================ */

export const activeFilterCount = (
  filters: SearchFilters,
) => {
  const keys: (
    | keyof SearchFilters
  )[] = [
    'minRent',
    'maxRent',
    'propertyType',
    'roomType',
    'tenantType',
    'furnishingStatus',
    'furnished',
    'facilities',
    'genderPreference',
    'maxDistance',
    'minRating',
    'verified',
    'phoneVerified',
    'availability',
  ];

  return keys.reduce(
    (count, key) => {
      const value =
        filters[key];

      if (
        Array.isArray(value)
      ) {
        return (
          count +
          (value.length > 0
            ? 1
            : 0)
        );
      }

      return (
        count +
        (value ? 1 : 0)
      );
    },
    0,
  );
};