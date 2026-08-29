# Smart Room Finder

Smart Room Finder is a full-stack rental-discovery platform for students,
employees, tourists, and people relocating to a new city. It helps people
search for rooms, PGs, hostels, flats, and shared accommodation; compare
verified listings; and contact owners directly.

The product intentionally does **not** support bookings, payments, Aadhaar,
government-ID collection, or government-verification claims. Owner trust is
shown accurately through phone OTP verification and administrator-reviewed
property verification.

## What is included

- React, Vite, TypeScript, Tailwind, React Router, React Hook Form, and Axios
- Express, TypeScript, MongoDB/Mongoose, JWT authentication, and role guards
- Tenant, owner, and administrator experiences
- OTP architecture with hashed, expiring, rate-limited, purpose-specific codes
- Listing CRUD, review/moderation, favourites, enquiries, reports, and audit data
- Validated filters, pagination, GeoJSON locations, and nearby-room search
- Provider abstractions for SMS, maps, AI, and image/object storage
- AI-assisted query parsing, recommendations, and a controlled room assistant
- Seed data, health checks, tests, security middleware, and API documentation

## Architecture

```
browser (React) ── HTTPS/JSON ──> Express API ──> MongoDB
                                  │       │
                                  │       ├── SMS provider (OTP)
                                  │       ├── map provider
                                  │       ├── AI provider
                                  │       └── object storage provider
                                  └── validation, authorization, audit logging
```

The API owns all database access. AI responses are converted to a restricted,
validated filter object before a normal application query is made; an AI model
never receives database credentials or executes MongoDB queries directly.

## Project layout

```
.
├── frontend/       # Vite React client
├── backend/        # Express API and MongoDB models
├── docs/           # API and deployment notes
├── .env.example    # Safe configuration template
└── package.json    # npm workspace scripts
```

## Prerequisites

- Node.js 20.11 or later
- npm 10 or later
- MongoDB 7 or later (local instance or managed cluster)

## Local setup

```bash
git clone <your-repository-url>
cd smart-room-finder
npm install
copy .env.example .env
```

Update `MONGODB_URI`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` in `.env`. Use
unique, high-entropy secrets outside development. Start MongoDB, then run the
API and client in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

The API health endpoint is `GET http://localhost:5000/health`; the web app is
served at `http://localhost:5173` by default. Add `VITE_API_URL` to
`frontend/.env` when using a non-default API address.

## Configuration

All secrets belong in environment variables—never source control. See
[.env.example](.env.example) for the full list.

| Area | Configuration |
| --- | --- |
| Database | `MONGODB_URI` |
| Auth | `JWT_SECRET`, `JWT_REFRESH_SECRET`, expiry variables |
| SMS/OTP | `SMS_PROVIDER`, `SMS_API_KEY`, `SMS_API_SECRET`, `SMS_FROM` |
| AI | `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL` |
| Maps | `MAP_PROVIDER`, `MAPS_API_KEY` |
| Storage | `STORAGE_PROVIDER`, credentials, bucket, and region |

Provider adapters are deliberately replaceable. The local/development provider
should be used only for development; configure a real SMS and object-storage
provider before deployment. OTPs are not returned from HTTP responses and must
not be logged.

## Core workflows

1. A tenant searches by text, filters, or a nearby location and opens a listing.
2. The tenant saves it, submits an enquiry, calls/uses the owner contact link,
   leaves a review, or reports a problem. There is no booking/payment flow.
3. An owner registers, verifies their phone through OTP, and creates listings.
4. An administrator reviews a listing and may mark the property as verified,
   reject it, remove fraud, or suspend an account.

## Security notes

- Passwords are hashed; access tokens are signed and role checks are enforced.
- OTPs are generated securely, hashed before temporary persistence, expiry- and
  attempt-limited, purpose-specific, cooldown-protected, and rate-limited.
- Input is schema-validated; Mongo query operators and malformed IDs are rejected.
- Helmet, CORS allow-listing, API rate limits, request-size limits, centralized
  error responses, and structured logs are configured by the API.
- Image uploads are validated for MIME type, count, and size, and production
  files should use object storage rather than MongoDB.
- No Aadhaar number, government document, payment information, booking, or
  reservation data is collected.

## Quality checks

```bash
npm run lint
npm run build
npm test
npm run seed
```

The seed script only creates fictional people, rooms, addresses, and reviews.

## Deployment

Deploy the statically built frontend to a CDN/static host and the API as a
container or Node service. Configure `NODE_ENV=production`, a restrictive
`FRONTEND_ORIGIN`, TLS, production MongoDB, persistent log collection, a
production SMS provider, object storage, and a real map/AI provider. Rotate
secrets using the deployment platform's secret manager. Place the API behind a
reverse proxy that terminates TLS and forwards the correct client IP for rate
limiting.

Before release, run database backups, migration/seed checks, lint/build/test,
dependency scanning, and a role/authorization smoke test. See `docs/` for the
API contract and integration details.

## Future improvements

- Saved-search notifications and owner response-time insights
- Image moderation and duplicate-listing detection
- Accessibility audits and full browser end-to-end tests
- Provider-specific operational dashboards and alerting
- Localized search, language support, and city-level ranking controls

## Contribution workflow

Create branches from `develop` using `feature/*`, `fix/*`, or `hotfix/*`, run
the checks above, and open a pull request for review. Do not push unreviewed
feature work directly to `main`.
