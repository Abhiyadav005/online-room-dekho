import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react';

export function LoadingBlock({ label = 'Finding great rooms…' }: { label?: string }) {
  return <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><div><LoaderCircle className="mx-auto size-7 animate-spin text-brand-600" /><p className="mt-3 text-sm font-bold text-slate-700">{label}</p></div></div>;
}

export function ErrorBlock({ message, retry }: { message: string; retry?: () => void }) {
  return <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center"><AlertCircle className="mx-auto size-6 text-rose-600" /><p className="mt-2 text-sm font-bold text-rose-900">We couldn’t load this just now.</p><p className="mt-1 text-sm text-rose-700">{message}</p>{retry && <button onClick={retry} className="btn-secondary mt-4 !min-h-9 text-xs">Try again</button>}</div>;
}

export function EmptyBlock({ title = 'Nothing here yet', detail = 'Try changing your filters or come back later.', action }: { title?: string; detail?: string; action?: React.ReactNode }) {
  return <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><div><Inbox className="mx-auto size-8 text-brand-600" /><h2 className="mt-3 font-bold text-slate-900">{title}</h2><p className="mt-1 max-w-sm text-sm text-slate-500">{detail}</p>{action && <div className="mt-4">{action}</div>}</div></div>;
}
