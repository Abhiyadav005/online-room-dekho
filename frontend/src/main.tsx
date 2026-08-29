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
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'owner',
        element: <OwnerDashboardPage />,
      },
      {
        path: 'admin',
        element: <AdminDashboardPage />,
      },
      {
        path: 'rooms/:id',
        element: <RoomDetailPage />,
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
