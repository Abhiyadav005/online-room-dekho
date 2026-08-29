export const currency = (amount?: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount ?? 0);

export const shortDate = (value?: string) =>
  value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : 'Flexible';

export const titleCase = (value?: string) =>
  value ? value.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : '';

export const compactNumber = (value: number) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
