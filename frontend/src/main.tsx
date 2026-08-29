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
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const RoomDetailPage = React.lazy(() => import('./pages/RoomDetailPage').then(m => ({ default: m.RoomDetailPage })));

// Placeholder pages for dashboard sections
const DashboardOverview = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Welcome</h1><p className="text-slate-600">Dashboard overview coming soon</p></div>;
const DashboardFavourites = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Saved Rooms</h1><p className="text-slate-600">Your saved rooms will appear here</p></div>;
const DashboardEnquiries = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Enquiries</h1><p className="text-slate-600">Your enquiries will appear here</p></div>;
const DashboardProfile = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Profile Settings</h1><p className="text-slate-600">Manage your profile here</p></div>;

const OwnerOverview = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Properties Overview</h1><p className="text-slate-600">Your properties overview will appear here</p></div>;
const OwnerProperties = () => <div className="space-y-6"><h1 className="text-3xl font-bold">My Properties</h1><p className="text-slate-600">Your properties will appear here</p></div>;
const OwnerNewProperty = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Add New Property</h1><p className="text-slate-600">Property form coming soon</p></div>;
const OwnerEnquiries = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Enquiries</h1><p className="text-slate-600">Enquiries for your properties will appear here</p></div>;
const OwnerProfile = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Owner Profile</h1><p className="text-slate-600">Manage your owner profile here</p></div>;

const AdminOverview = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Admin Dashboard</h1><p className="text-slate-600">System overview coming soon</p></div>;
const AdminUsers = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Users</h1><p className="text-slate-600">User management coming soon</p></div>;
const AdminProperties = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Properties</h1><p className="text-slate-600">Property management coming soon</p></div>;
const AdminApprovals = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Pending Approvals</h1><p className="text-slate-600">Pending properties will appear here</p></div>;
const AdminReports = () => <div className="space-y-6"><h1 className="text-3xl font-bold">Reports</h1><p className="text-slate-600">User and property reports will appear here</p></div>;

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
            element: <OwnerProperties />,
          },
          {
            path: 'properties/new',
            element: <OwnerNewProperty />,
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
      // Admin Dashboard Routes
      {
        path: 'admin',
        element: <AdminDashboardPage />,
        children: [
          {
            index: true,
            element: <AdminOverview />,
          },
          {
            path: 'users',
            element: <AdminUsers />,
          },
          {
            path: 'properties',
            element: <AdminProperties />,
          },
          {
            path: 'approvals',
            element: <AdminApprovals />,
          },
          {
            path: 'reports',
            element: <AdminReports />,
          },
        ],
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
