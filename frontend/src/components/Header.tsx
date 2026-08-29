import { Heart, LayoutDashboard, Menu, PlusCircle, Search, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brand } from './Brand';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-bold transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`;

export function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const dashboardPath = user?.role === 'owner' ? '/owner' : user?.role === 'admin' ? '/admin' : '/dashboard';

  const close = () => setOpen(false);
  const doLogout = async () => { await logout(); navigate('/'); close(); };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <a href="#main-content" className="sr-only z-50 rounded-md bg-white px-3 py-2 font-bold text-brand-700 focus:not-sr-only focus:absolute focus:left-4 focus:top-4">Skip to content</a>
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <Brand />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          <NavLink to="/search" className={navClass}><span className="inline-flex items-center gap-1.5"><Search size={16} /> Find a room</span></NavLink>
          <NavLink to="/map" className={navClass}>Map view</NavLink>
          <NavLink to="/how-it-works" className={navClass}>How it works</NavLink>
          {user?.role === 'owner' && <NavLink to="/owner/listings/new" className={navClass}>List your property</NavLink>}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? <>
            {user?.role === 'user' && <Link to="/dashboard/favourites" className="btn-quiet !min-h-10 !px-3" aria-label="Saved homes"><Heart size={19} /></Link>}
            <Link to={dashboardPath} className="btn-secondary !min-h-10 !px-3"><LayoutDashboard size={17} /><span>{user?.name.split(' ')[0] || 'Dashboard'}</span></Link>
            <button className="btn-primary !min-h-10 !px-3" onClick={doLogout}>Log out</button>
          </> : <>
            <Link to="/login" className="btn-quiet !min-h-10">Log in</Link>
            <Link to="/register" className="btn-primary !min-h-10">Create account</Link>
          </>}
        </div>
        <button type="button" onClick={() => setOpen(!open)} className="btn-quiet !min-h-10 !px-2.5 lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && <div className="border-t border-slate-200 bg-white px-4 py-3 shadow-soft lg:hidden">
        <nav className="container-page flex flex-col gap-1" aria-label="Mobile navigation">
          <NavLink onClick={close} to="/search" className={navClass}>Find a room</NavLink>
          <NavLink onClick={close} to="/map" className={navClass}>Map view</NavLink>
          <NavLink onClick={close} to="/how-it-works" className={navClass}>How it works</NavLink>
          {user?.role === 'owner' && <NavLink onClick={close} to="/owner/listings/new" className={navClass}><span className="inline-flex items-center gap-2"><PlusCircle size={16} /> List your property</span></NavLink>}
          <div className="my-2 border-t" />
          {isAuthenticated ? <>
            <Link onClick={close} to={dashboardPath} className="btn-secondary justify-start"><UserRound size={17} /> {user?.name || 'Dashboard'}</Link>
            <button className="btn-primary justify-start" onClick={doLogout}>Log out</button>
          </> : <>
            <Link onClick={close} to="/login" className="btn-secondary">Log in</Link>
            <Link onClick={close} to="/register" className="btn-primary">Create account</Link>
          </>}
        </nav>
      </div>}
    </header>
  );
}
