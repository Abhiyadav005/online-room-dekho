import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2 rounded-lg text-lg font-bold tracking-tight focus-visible:ring-offset-transparent" aria-label="Online Room Dekho home">
      <span className={`grid size-9 place-items-center rounded-xl ${light ? 'bg-white/15 text-white' : 'bg-brand-600 text-white'}`}><Home size={19} strokeWidth={2.5} /></span>
      <span className={light ? 'text-white' : 'text-ink'}>Online Room<span className={light ? 'text-emerald-200' : 'text-brand-600'}>Dekho</span></span>
    </Link>
  );
}
