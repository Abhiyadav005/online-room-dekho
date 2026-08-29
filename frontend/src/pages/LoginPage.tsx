import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

type ActiveTab = 'user' | 'owner' | 'admin';

export function LoginPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) {
      const route = auth.userRole === 'owner' ? '/owner' : auth.userRole === 'admin' ? '/admin' : '/dashboard';
      navigate(route);
    }
  }, [auth.isAuthenticated, auth.userRole, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const role: UserRole = activeTab === 'user' ? 'user' : activeTab === 'owner' ? 'owner' : 'admin';
      await auth.login(email, password, role);
      setSuccess('Login successful! Redirecting...');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-slate-600">Log in to access your account</p>
        </div>

        {/* Role Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-xl p-1.5 shadow-sm">
          {(['user', 'owner', 'admin'] as const).map((role) => (
            <button
              key={role}
              onClick={() => {
                setActiveTab(role);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition capitalize ${
                activeTab === role
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {role === 'user' ? 'User' : role === 'owner' ? 'Owner' : 'Admin'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-soft p-8 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
              <p className="text-sm font-medium text-rose-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm font-medium text-emerald-800">{success}</p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="field-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="field"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="field-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="field pr-10"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Role Info */}
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
            {activeTab === 'user' && '👤 Login as a room seeker to search and book rooms'}
            {activeTab === 'owner' && '🏠 Login as a room owner to manage your properties'}
            {activeTab === 'admin' && '🔐 Admin access - credentials required'}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-500">New to Online Room Dekho?</span>
            </div>
          </div>

          {/* Registration Links */}
          {activeTab === 'user' && (
            <a
              href="/register?role=user"
              className="btn-secondary w-full text-center"
            >
              Create User Account
            </a>
          )}
          {activeTab === 'owner' && (
            <a
              href="/register?role=owner"
              className="btn-secondary w-full text-center"
            >
              Register as Room Owner
            </a>
          )}
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Protected by encryption. Your data is secure.
        </p>
      </div>
    </div>
  );
}
