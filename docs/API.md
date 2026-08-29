# API overview

The API base URL is `/api`; successful responses use:

```json
{ "success": true, "data": {} }
```

Failures use:

```json
{ "success": false, "message": "Human-readable message", "code": "ERROR_CODE" }
```

Protected endpoints require `Authorization: Bearer <access-token>`. Mutating
owner, tenant, and administrator routes additionally enforce their respective
role. IDs are MongoDB ObjectIds unless otherwise documented.

## Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Register a tenant or owner |
| POST | `/auth/login` | Authenticate and receive tokens |
| POST | `/auth/logout` | Clear/revoke the current session where configured |
| POST | `/auth/send-otp` | Request a purpose-scoped mobile OTP |
| POST | `/auth/verify-otp` | Verify OTP and set `phoneVerified` |
| POST | `/auth/forgot-password` | Request password-reset OTP/token |
| POST | `/auth/reset-password` | Reset password using a valid reset flow |

`send-otp` and `verify-otp` never return an OTP. They are rate-limited and
return only a generic delivery/verification result.

## Discovery and listings

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/rooms` | Paginated, filtered listing discovery |
| GET | `/rooms/:id` | One listing |
| POST | `/rooms` | Create an owner listing |
| PUT | `/rooms/:id` | Update the listing owner owns |
| DELETE | `/rooms/:id` | Deactivate/remove an owned listing |
| PATCH | `/rooms/:id/availability` | Change availability |
| GET | `/search/rooms` | Filtered/geospatial search |
| POST | `/search/ai` | AI-parsed but application-validated search |
| POST | `/ai/search` | Alias for AI-assisted search |
| POST | `/ai/recommend` | Rank actual candidate listings |
| POST | `/ai/chat` | Controlled room-assistant action |

Typical collection query parameters include `page`, `limit`, `q`, `city`,
`minRent`, `maxRent`, `propertyType`, `roomType`, `furnished`, `wifi`,
`genderPreference`, `verified`, `lat`, `lng`, `radius`, and `sort`.

## Maps

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/maps/geocode` | Forward geocoding via configured provider |
| GET | `/maps/reverse-geocode` | Reverse geocoding |
| GET | `/maps/distance` | Distance between two coordinates |
| GET | `/maps/nearby` | Nearby listings/places as provider supports |

## Engagement

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/favourites` | Current tenant favourites |
| POST | `/favourites/:roomId` | Save a listing |
| DELETE | `/favourites/:roomId` | Unsave a listing |
| GET | `/rooms/:roomId/reviews` | Listing reviews |
| POST | `/rooms/:roomId/reviews` | Add a 1–5-star review |
| POST | `/reports` | Report a listing, owner, or review |
| POST | `/enquiries` | Contact a listing owner through an enquiry |

## Owner and admin

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET/PUT | `/owner/profile` | Read/update the current owner profile |
| GET | `/owner/rooms` | Current owner's listings |
| GET | `/owner/enquiries` | Enquiries for current owner's listings |
| GET | `/admin/users` | User management list |
| GET | `/admin/owners` | Owner management list |
| GET | `/admin/rooms` | Listing moderation list |
| GET | `/admin/reports` | Report moderation list |
| PATCH | `/admin/rooms/:id/approve` | Approve and property-verify a listing |
| PATCH | `/admin/rooms/:id/reject` | Reject a listing |
| PATCH | `/admin/users/:id/suspend` | Suspend a tenant |
| PATCH | `/admin/owners/:id/suspend` | Suspend an owner |

The service also exposes `GET /health` outside the `/api` prefix for deployment
health checks.
