import {
  BadgeCheck,
  CircleCheck,
  Clock3,
  Phone,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

import type {
  AvailabilityStatus,
  VerificationStatus,
} from '../types';

interface VerificationBadgeProps {
  status: VerificationStatus;
  compact?: boolean;
}

interface PhoneBadgeProps {
  verified?: boolean;
  compact?: boolean;
}

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  compact?: boolean;
}

/* ================================================================
   PROPERTY VERIFICATION
================================================================ */

export function VerificationBadge({
  status,
  compact = false,
}: VerificationBadgeProps) {
  if (status !== 'verified') return null;

  return (
    <span
      title="This property has been verified"
      className={[
        'inline-flex items-center gap-1 rounded-full',
        'border border-emerald-200 bg-emerald-50',
        'font-bold text-emerald-700',
        compact
          ? 'px-2 py-1 text-[10px]'
          : 'px-2.5 py-1.5 text-xs',
      ].join(' ')}
    >
      <ShieldCheck size={compact ? 12 : 14} strokeWidth={2.4} />

      {compact ? 'Verified' : 'Property verified'}
    </span>
  );
}

/* ================================================================
   OWNER PHONE VERIFICATION
================================================================ */

export function PhoneBadge({
  verified,
  compact = false,
}: PhoneBadgeProps) {
  if (!verified) return null;

  return (
    <span
      title="Owner phone number is verified"
      className={[
        'inline-flex items-center gap-1 rounded-full',
        'border border-sky-200 bg-sky-50',
        'font-bold text-sky-700',
        compact
          ? 'px-2 py-1 text-[10px]'
          : 'px-2.5 py-1.5 text-xs',
      ].join(' ')}
    >
      <Phone size={compact ? 11 : 13} strokeWidth={2.3} />

      {compact ? 'Phone verified' : 'Phone number verified'}
    </span>
  );
}

/* ================================================================
   ROOM / FLAT AVAILABILITY
================================================================ */

export function AvailabilityBadge({
  status,
  compact = false,
}: AvailabilityBadgeProps) {
  const config = {
    available: {
      label: 'Available',
      compactLabel: 'Available',
      icon: CircleCheck,
      className:
        'border-emerald-200 bg-emerald-50 text-emerald-700',
    },

    limited: {
      label: 'Limited availability',
      compactLabel: 'Limited',
      icon: Clock3,
      className:
        'border-amber-200 bg-amber-50 text-amber-700',
    },

    unavailable: {
      label: 'Currently unavailable',
      compactLabel: 'Unavailable',
      icon: XCircle,
      className:
        'border-slate-200 bg-slate-100 text-slate-600',
    },
  } as const;

  const current = config[status];
  const Icon = current.icon;

  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full',
        'border font-bold backdrop-blur-sm',
        current.className,
        compact
          ? 'px-2 py-1 text-[10px]'
          : 'px-2.5 py-1.5 text-xs',
      ].join(' ')}
    >
      <Icon
        size={compact ? 11 : 13}
        strokeWidth={2.4}
      />

      {compact ? current.compactLabel : current.label}
    </span>
  );
}

/* ================================================================
   FEATURED / TRUST BADGE
================================================================ */

export function FeaturedBadge({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full',
        'border border-violet-200 bg-violet-50',
        'font-bold text-violet-700',
        compact
          ? 'px-2 py-1 text-[10px]'
          : 'px-2.5 py-1.5 text-xs',
      ].join(' ')}
    >
      <BadgeCheck
        size={compact ? 11 : 13}
        strokeWidth={2.4}
      />

      {compact ? 'Featured' : 'Featured property'}
    </span>
  );
}

/* ================================================================
   TRUST BADGE
================================================================ */

export function TrustedOwnerBadge({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <span
      title="This owner has completed the verification process"
      className={[
        'inline-flex items-center gap-1 rounded-full',
        'border border-indigo-200 bg-indigo-50',
        'font-bold text-indigo-700',
        compact
          ? 'px-2 py-1 text-[10px]'
          : 'px-2.5 py-1.5 text-xs',
      ].join(' ')}
    >
      <ShieldCheck
        size={compact ? 11 : 13}
        strokeWidth={2.4}
      />

      {compact ? 'Trusted owner' : 'Trusted owner'}
    </span>
  );
}