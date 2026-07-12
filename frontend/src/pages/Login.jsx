import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/console');
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Connection to auth server failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-6 dot-grid text-on-background">
      <div className="w-full max-w-md bg-white border-4 border-border p-8 rounded-2xl hard-shadow reveal active">
        
        {/* Title */}
        <div className="text-center mb-8 border-b-2 border-border pb-4">
          <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Access Console</h2>
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-2">
            TransitOps Secure Authenticator
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="bg-error/10 border-2 border-error p-4 mb-6 rounded flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
            <span className="font-mono text-[11px] font-bold text-error leading-relaxed uppercase">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
          <div className="flex flex-col space-y-2">
            <label className="font-mono text-[10px] font-black uppercase tracking-wider text-on-background">
              Corporate Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. name@logistics.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-50 border-2 border-border rounded-lg py-3 px-4 focus:outline-none focus:border-primary text-sm font-bold placeholder-slate-400"
              required
            />
          </div>

          {/* Password field */}
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-mono text-[10px] font-black uppercase tracking-wider text-on-background">
                Password credentials
              </label>
              <Link to="/forgot-password" className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-50 border-2 border-border rounded-lg py-3 px-4 focus:outline-none focus:border-primary text-sm font-bold placeholder-slate-400"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full candy-button bg-primary text-white py-4 rounded font-mono text-xs font-bold uppercase tracking-widest hard-shadow flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
            <LogIn className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info link */}
        <div className="mt-8 text-center border-t-2 border-border pt-6">
          <span className="font-mono text-[10px] text-on-surface-variant font-bold uppercase">
            New organization member?{' '}
            <Link to="/register" className="text-secondary font-black hover:underline inline-flex items-center gap-1">
              Register here <ArrowRight className="w-3 h-3" />
            </Link>
          </span>
        </div>

      </div>
    </div>
  );
}
