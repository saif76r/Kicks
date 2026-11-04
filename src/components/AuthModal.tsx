import React, { useState } from 'react';
import { X, ShieldAlert, Lock, Mail, User as UserIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth, DEFAULT_ADMIN_EMAIL } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (email?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { loginCustomer, registerCustomer, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'reset_password'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) throw new Error('Please fill in both email and password.');
        await loginCustomer(email, password);
        onClose();
        if (onSuccess) onSuccess(email);
      } else if (mode === 'register') {
        if (!fullName.trim()) throw new Error('Please enter your full name.');
        if (!email.trim()) throw new Error('Please enter your email.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        if (password !== confirmPassword) throw new Error('Passwords do not match.');
        await registerCustomer(fullName, email, password);
        onClose();
        if (onSuccess) onSuccess(email);
      } else if (mode === 'reset_password') {
        if (!email.trim()) throw new Error('Please enter your email address to reset password.');
        await resetPassword(email);
        setSuccessMessage('Password reset email sent! Please check your inbox.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed. Please verify credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please verify your credentials or register a new account.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Try signing in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#F5F5F2] rounded-3xl skeuo-card p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200 shadow-2xl border border-black/10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl skeuo-btn-soft text-stone-600 hover:text-stone-900"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Tagline */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/assets/aistudio/WhatsApp_Image_2026-11-04_at_11.08.18_PM_0f182253.jpeg"
            alt="KICKS Logo"
            className="h-12 w-auto object-contain mix-blend-multiply"
          />
          <span className="font-display font-bold text-xs uppercase tracking-widest text-stone-500">
            Account Portal
          </span>
        </div>

        {/* 2 Clean Tabs Only: Sign In & Register */}
        <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-stone-900 shadow-sm font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-stone-900 shadow-sm font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Register
          </button>
        </div>

        {/* Title & Description */}
        <div className="mb-5">
          <h2 className="font-display font-bold text-xl text-stone-900">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && 'Create Your KICKS Account'}
            {mode === 'reset_password' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {mode === 'login' && 'Sign in to access your orders, account settings, or admin dashboard.'}
            {mode === 'register' && 'Join the KICKS community for exclusive drops, order tracking, and rewards.'}
            {mode === 'reset_password' && 'Enter your registered email to receive recovery instructions.'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saif Meer"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          {mode !== 'reset_password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('reset_password'); setError(null); }}
                    className="text-[11px] text-stone-500 hover:text-stone-800"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-display font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 mt-4 skeuo-btn-primary ${
              loading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                {mode === 'login' && 'Sign In to Account'}
                {mode === 'register' && 'Register Account'}
                {mode === 'reset_password' && 'Send Reset Email'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch */}
        <div className="mt-5 pt-4 border-t border-black/5 text-center text-xs text-stone-500">
          {mode === 'login' && (
            <span>
              Don't have an account yet?{' '}
              <button
                onClick={() => { setMode('register'); setError(null); }}
                className="font-bold text-[#FF6B35] hover:underline"
              >
                Register now
              </button>
            </span>
          )}
          {mode === 'register' && (
            <span>
              Already a member?{' '}
              <button
                onClick={() => { setMode('login'); setError(null); }}
                className="font-bold text-[#FF6B35] hover:underline"
              >
                Sign in here
              </button>
            </span>
          )}
          {mode === 'reset_password' && (
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className="font-bold text-[#FF6B35] hover:underline"
            >
              ← Back to Sign In
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
