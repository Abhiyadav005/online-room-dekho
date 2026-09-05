import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  PlusCircle,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brand } from './Brand';

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'inline-flex items-center gap-2 rounded-xl px-3 py-2.5',
    'text-sm font-bold transition-all duration-200',
    isActive
      ? 'bg-brand-50 text-brand-700'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950',
  ].join(' ');

export function Header() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();

  const dashboardPath =
    user?.role === 'owner'
      ? '/owner'
      : user?.role === 'admin'
        ? '/admin'
        : '/dashboard';

  const closeMobileMenu = () => {
    setOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeMobileMenu();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      {/* Accessibility */}
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-lg bg-white px-4 py-2 font-bold text-brand-700 shadow-lg focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <div className="container-page">
        <div className="flex h-[72px] items-center justify-between gap-4">
          {/* =====================================================
              LOGO
          ====================================================== */}
          <Brand />

          {/* =====================================================
              DESKTOP NAVIGATION
          ====================================================== */}
          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Primary navigation"
          >
            <NavLink to="/search" className={navClass}>
              <Search size={17} strokeWidth={2.2} />
              Find a room
            </NavLink>

            <NavLink to="/map" className={navClass}>
              <Map size={17} strokeWidth={2.2} />
              Map view
            </NavLink>

            <NavLink to="/how-it-works" className={navClass}>
              How it works
            </NavLink>

            {/* Owner-specific navigation */}
            {user?.role === 'owner' && (
              <NavLink
                to="/owner/properties/new"
                className={navClass}
              >
                <PlusCircle size={17} strokeWidth={2.2} />
                List your property
              </NavLink>
            )}
          </nav>

          {/* =====================================================
              DESKTOP ACCOUNT AREA
          ====================================================== */}
          <div className="hidden items-center gap-2 lg:flex">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="btn-quiet !min-h-10 !rounded-xl"
                >
                  Log in
                </Link>

                <Link
                  to="/register"
                  className="btn-primary !min-h-10 !rounded-xl !px-5"
                >
                  Create account
                </Link>
              </>
            ) : (
              <>
                {/* Saved rooms — only for normal users */}
                {user?.role === 'user' && (
                  <Link
                    to="/dashboard/favourites"
                    className="group grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Saved rooms"
                    title="Saved rooms"
                  >
                    <Heart
                      size={19}
                      className="transition-transform group-hover:scale-110"
                    />
                  </Link>
                )}

                {/* Owner quick action */}
                {user?.role === 'owner' && (
                  <Link
                    to="/owner/properties/new"
                    className="btn-secondary !min-h-10 !rounded-xl !px-3.5"
                  >
                    <PlusCircle size={17} />
                    Add room
                  </Link>
                )}

                {/* Profile / Dashboard dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((value) => !value)}
                    className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-left transition hover:border-brand-200 hover:bg-brand-50"
                    aria-expanded={profileOpen}
                  >
                    <span className="grid size-8 place-items-center rounded-lg bg-brand-100 text-brand-700">
                      <UserRound size={17} />
                    </span>

                    <span className="hidden max-w-[110px] truncate text-sm font-bold text-slate-800 xl:block">
                      {user?.name || 'Account'}
                    </span>

                    <ChevronDown
                      size={15}
                      className={`text-slate-500 transition-transform ${
                        profileOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-lift">
                      {/* User information */}
                      <div className="border-b border-slate-100 px-3 py-3">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {user?.name || 'User'}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {user?.email || ''}
                        </p>

                        <span className="mt-2 inline-flex rounded-full bg-brand-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                          {user?.role === 'owner'
                            ? 'Room Owner'
                            : user?.role === 'admin'
                              ? 'Administrator'
                              : 'Room Seeker'}
                        </span>
                      </div>

                      {/* Dashboard */}
                      <Link
                        to={dashboardPath}
                        onClick={() => setProfileOpen(false)}
                        className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-brand-700"
                      >
                        <LayoutDashboard size={17} />
                        Dashboard
                      </Link>

                      {/* User favourites */}
                      {user?.role === 'user' && (
                        <Link
                          to="/dashboard/favourites"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-brand-700"
                        >
                          <Heart size={17} />
                          Saved rooms
                        </Link>
                      )}

                      {/* Owner add room */}
                      {user?.role === 'owner' && (
                        <Link
                          to="/owner/properties/new"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-brand-700"
                        >
                          <PlusCircle size={17} />
                          Add new room
                        </Link>
                      )}

                      <div className="my-1 border-t border-slate-100" />

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
                      >
                        <LogOut size={17} />
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* =====================================================
              MOBILE MENU BUTTON
          ====================================================== */}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {/* =====================================================
            MOBILE NAVIGATION
        ====================================================== */}
        {open && (
          <div className="border-t border-slate-100 py-3 lg:hidden">
            <nav
              className="flex flex-col gap-1"
              aria-label="Mobile navigation"
            >
              <NavLink
                onClick={closeMobileMenu}
                to="/search"
                className={navClass}
              >
                <Search size={18} />
                Find a room
              </NavLink>

              <NavLink
                onClick={closeMobileMenu}
                to="/map"
                className={navClass}
              >
                <Map size={18} />
                Explore on map
              </NavLink>

              <NavLink
                onClick={closeMobileMenu}
                to="/how-it-works"
                className={navClass}
              >
                How it works
              </NavLink>

              {user?.role === 'owner' && (
                <NavLink
                  onClick={closeMobileMenu}
                  to="/owner/properties/new"
                  className={navClass}
                >
                  <PlusCircle size={18} />
                  List your property
                </NavLink>
              )}

              <div className="my-2 border-t border-slate-100" />

              {/* =================================================
                  MOBILE AUTHENTICATED
              ================================================== */}
              {isAuthenticated ? (
                <>
                  <div className="mb-1 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700">
                      <UserRound size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {user?.name || 'Account'}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {user?.email || ''}
                      </p>
                    </div>
                  </div>

                  <Link
                    onClick={closeMobileMenu}
                    to={dashboardPath}
                    className="btn-secondary justify-start"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>

                  {user?.role === 'user' && (
                    <Link
                      onClick={closeMobileMenu}
                      to="/dashboard/favourites"
                      className="btn-secondary justify-start"
                    >
                      <Heart size={18} />
                      Saved rooms
                    </Link>
                  )}

                  {user?.role === 'owner' && (
                    <Link
                      onClick={closeMobileMenu}
                      to="/owner/properties/new"
                      className="btn-primary justify-start"
                    >
                      <PlusCircle size={18} />
                      Add new room
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-secondary justify-start !text-rose-600 hover:!border-rose-200 hover:!bg-rose-50"
                  >
                    <LogOut size={18} />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    onClick={closeMobileMenu}
                    to="/login"
                    className="btn-secondary"
                  >
                    Log in
                  </Link>

                  <Link
                    onClick={closeMobileMenu}
                    to="/register"
                    className="btn-primary"
                  >
                    Create account
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}