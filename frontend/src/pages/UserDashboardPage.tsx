import React, { Suspense } from 'react';
import { Heart, MessageSquare, Settings, User } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

export function UserDashboardPage() {
  const { user, logout } = useAuth();
  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: User },
    { name: 'Saved Rooms', href: '/dashboard/favourites', icon: Heart },
    { name: 'Enquiries', href: '/dashboard/enquiries', icon: MessageSquare },
    { name: 'Profile', href: '/dashboard/profile', icon: Settings },
  ];

  return (
    <ProtectedRoute roles={['user']}>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200">
          <div className="sticky top-0 p-6">
            <h2 className="text-lg font-bold mb-2">{user?.name}</h2>
            <p className="text-sm text-slate-600 mb-6">{user?.email}</p>
            <nav className="space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.name}
                </NavLink>
              ))}
            </nav>
            <button
              onClick={logout}
              className="w-full mt-6 btn-secondary text-sm"
            >
              Log Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="container-page py-8">
            <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
