import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiMessage } from '../services/api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = (location.state as { from?: string } | undefined)?.from;

  useEffect(() => {
    if (auth.isAuthenticated) {
      const destination = redirectPath || (auth.userRole === 'owner' ? '/owner' : '/dashboard');
      navigate(destination, { replace: true });
    }
  }, [auth.isAuthenticated, auth.userRole, navigate, redirectPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      const loggedInUser = await auth.login(trimmedEmail, password, 'user');
      setSuccess('Login successful! Redirecting...');
      const destination = redirectPath || (loggedInUser.role === 'owner' ? '/owner' : '/dashboard');
      navigate(destination, { replace: true });
    } catch (err) {
      setError(apiMessage(err, 'Invalid credentials or login failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-600 text-sm">
            Log in to manage your listings or discover your next room
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleLogin}
          noValidate
          className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8 space-y-5"
        >
          {/* Role Notification Banner */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 text-xs text-slate-600 flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-brand-500 flex-shrink-0" />
            <span>Room seekers and room owners can log in using their registered credentials.</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm font-medium text-rose-800 animate-in fade-in duration-200">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-medium text-emerald-800 animate-in fade-in duration-200">
              {success}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="login-email" className="field-label">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="field pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="login-password" className="field-label">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="field pl-10 pr-10"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password}
            className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed transition duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              'Log In'
            )}
          </button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-500 font-medium">
                New to Online Room Dekho?
              </span>
            </div>
          </div>

          {/* Link to Register */}
          <Link to="/register" className="btn-secondary w-full text-center">
            Create an Account
          </Link>
        </form>

        {/* Security Footer */}
        <p className="text-center text-xs text-slate-500 mt-6 flex items-center justify-center gap-1.5">
          <span>Protected by secure encryption. Your data is safe.</span>
        </p>
      </div>
    </div>
  );
}
