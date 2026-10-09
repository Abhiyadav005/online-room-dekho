import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteLayout } from './layouts/SiteLayout';
import './index.css';

// Lazy load pages
const HomePage = React.lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const SearchPage = React.lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })));
const MapPage = React.lazy(() => import('./pages/MapPage').then(m => ({ default: m.MapPage })));
const HowItWorksPage = React.lazy(() => import('./pages/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const OwnerDashboardPage = React.lazy(() => import('./pages/OwnerDashboardPage').then(m => ({ default: m.OwnerDashboardPage })));
const OwnerPropertiesPage = React.lazy(() => import('./pages/OwnerPropertiesPage').then(m => ({ default: m.OwnerPropertiesPage })));
const OwnerListingPage = React.lazy(() => import('./pages/OwnerPropertiesPage').then(m => ({ default: m.OwnerListingPage })));
const OwnerOverview = React.lazy(() => import('./pages/OwnerOverview').then(m => ({ default: m.OwnerOverview })));
const RoomDetailPage = React.lazy(() => import('./pages/RoomDetailPage').then(m => ({ default: m.RoomDetailPage })));

// Placeholder pages for dashboard sections
const DashboardOverview = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Welcome</h1><p className="text-slate-600">Dashboard overview coming soon</p></div>;
const DashboardFavourites = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Saved Rooms</h1><p className="text-slate-600">Your saved rooms will appear here</p></div>;
const DashboardEnquiries = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Enquiries</h1><p className="text-slate-600">Your enquiries will appear here</p></div>;
const DashboardProfile = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Profile Settings</h1><p className="text-slate-600">Manage your profile here</p></div>;
const OwnerEnquiries = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Enquiries</h1><p className="text-slate-600">Enquiries for your properties will appear here</p></div>;
const OwnerProfile = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Owner Profile</h1><p className="text-slate-600">Manage your owner profile here</p></div>;

const router = createBrowserRouter([
  {
    path: '/',
    element: <SiteLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'map',
        element: <MapPage />,
      },
      {
        path: 'how-it-works',
        element: <HowItWorksPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'rooms/:id',
        element: <RoomDetailPage />,
      },
      // User Dashboard Routes
      {
        path: 'dashboard',
        element: <DashboardPage />,
        children: [
          {
            index: true,
            element: <DashboardOverview />,
          },
          {
            path: 'favourites',
            element: <DashboardFavourites />,
          },
          {
            path: 'enquiries',
            element: <DashboardEnquiries />,
          },
          {
            path: 'profile',
            element: <DashboardProfile />,
          },
        ],
      },
      // Owner Dashboard Routes
      {
        path: 'owner',
        element: <OwnerDashboardPage />,
        children: [
          {
            index: true,
            element: <OwnerOverview />,
          },
          {
            path: 'properties',
            element: <OwnerPropertiesPage />,
          },
          {
            path: 'properties/new',
            element: <OwnerListingPage />,
          },
          {
            path: 'enquiries',
            element: <OwnerEnquiries />,
          },
          {
            path: 'profile',
            element: <OwnerProfile />,
          },
        ],
      },
      {
        path: '*',
        element: (
          <div className="container-page py-20 text-center">
            <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
              <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
                404 Error
              </span>
              <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Page not found</h1>
              <p className="mt-2 text-sm text-slate-600">
                The page you are looking for doesn't exist or has moved.
              </p>
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                <a href="/" className="btn-primary justify-center">
                  Go to Homepage
                </a>
                <a href="/login" className="btn-secondary justify-center">
                  Go to Login
                </a>
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
]);

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);
