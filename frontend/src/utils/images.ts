export const fallbackRoomImage =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560"%3E%3Crect width="900" height="560" fill="%23f8fafc"/%3E%3Cpath d="M150 440V260l180-150 180 150v180M510 440V210l120-100 120 100v230" fill="none" stroke="%236366f1" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/%3E%3Ccircle cx="450" cy="280" r="40" fill="%23e2e8f0"/%3E%3Ctext x="50%25" y="80%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="%2394a3b8"%3ERoom Photo%3C/text%3E%3C/svg%3E';

/**
 * Normalizes image URLs so that:
 * - Remote URLs (Unsplash, Cloudinary, S3) are loaded directly.
 * - Local upload URLs (e.g. /uploads/... or http://localhost:5000/uploads/...)
 *   are resolved properly in both development (via Vite proxy) and production.
 */
export function getRoomImageUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return fallbackRoomImage;
  }

  const trimmed = rawUrl.trim();

  // If already a data URI
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // Handle absolute URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      // If this points to the backend /uploads path (e.g. localhost:5000 or same host)
      if (parsed.pathname.startsWith('/uploads/')) {
        // If frontend is in dev (port 5173) or using relative proxy, use relative /uploads/...
        // which Vite proxies directly to backend without CORS or host mismatch issues
        return parsed.pathname;
      }
    } catch {
      // Continue and return trimmed URL
    }
    return trimmed;
  }

  // If already relative /uploads/...
  if (trimmed.startsWith('/uploads/')) {
    return trimmed;
  }

  return trimmed;
}
