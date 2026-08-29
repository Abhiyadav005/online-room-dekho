import { BadgeCheck, Phone, ShieldCheck } from 'lucide-react';
import type { AvailabilityStatus, VerificationStatus } from '../types';

export function VerificationBadge({ status, compact = false }: { status: VerificationStatus; compact?: boolean }) {
  if (status !== 'verified') return null;
  return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700"><ShieldCheck size={compact ? 12 : 14} /> {compact ? 'Verified' : 'Property verified'}</span>;
}

export function PhoneBadge({ verified, compact = false }: { verified?: boolean; compact?: boolean }) {
  if (!verified) return null;
  return <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-xs font-bold text-sky-700"><Phone size={compact ? 12 : 14} /> {compact ? 'Phone' : 'Phone verified'}</span>;
}

export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  const map = {
    available: 'bg-emerald-50 text-emerald-700',
    limited: 'bg-amber-50 text-amber-700',
    unavailable: 'bg-slate-100 text-slate-600',
  };
  const label = status === 'limited' ? 'Limited availability' : status === 'available' ? 'Available' : 'Unavailable';
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${map[status]}`}><BadgeCheck size={13} /> {label}</span>;
}
