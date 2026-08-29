import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

export function Modal({ title, children, onClose, size = 'md' }: { title: string; children: ReactNode; onClose: () => void; size?: 'sm' | 'md' | 'lg' }) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [onClose]);
  const max = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-2xl' : 'max-w-xl';
  return <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-[2px] sm:items-center"><section role="dialog" aria-modal="true" aria-label={title} className={`max-h-[90vh] w-full ${max} overflow-y-auto rounded-2xl bg-white shadow-2xl`}><header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4"><h2 className="text-lg font-bold text-slate-900">{title}</h2><button type="button" className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900" onClick={onClose} aria-label={`Close ${title}`}><X size={19} /></button></header><div className="p-5">{children}</div></section></div>;
}
