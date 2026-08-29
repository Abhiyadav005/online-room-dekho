import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type RegisterRole = 'user' | 'owner';

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as RegisterRole) || 'user';

  const [role, setRole] = useState<RegisterRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) {
      const route = auth.userRole === 'owner' ? '/owner' : '/dashboard';
      navigate(route);
    }
  }, [auth.isAuthenticated, auth.userRole, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      const values = { name, email, phone, password };
      if (role === 'owner') {
        await auth.registerOwner(values);
      } else {
        await auth.registerUser(values);
      }
      setSuccess('Registration successful! Redirecting...');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
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
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-slate-600">Join Online Room Dekho today</p>
        </div>

        {/* Role Selection */}
        <div className="flex gap-3 mb-8">
          {(['user', 'owner'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                role === r
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {r === 'user' ? '👤 Room Seeker' : '🏠 Room Owner'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow-soft p-8 space-y-5">
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

          {/* Name Field */}
          <div>
            <label className="field-label">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="field"
              required
              disabled={isLoading}
            />
          </div>

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

          {/* Phone Field */}
          <div>
            <label className="field-label">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="field"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500 mt-1">Phone number will be verified during login</p>
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
            <p className="text-xs text-slate-500 mt-1">At least 8 characters</p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="field-label">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="field pr-10"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1"
              disabled={isLoading}
            />
            <label htmlFor="terms" className="text-xs text-slate-600">
              I agree to the <a href="#" className="text-brand-600 font-semibold hover:underline">Terms of Service</a> and <a href="#" className="text-brand-600 font-semibold hover:underline">Privacy Policy</a>
            </label>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading || !agreeTerms}
            className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-500">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <a href="/login" className="btn-secondary w-full text-center">
            Log In
          </a>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Your account is protected by encryption. No sharing of personal data.
        </p>
      </div>
    </div>
  );
}

