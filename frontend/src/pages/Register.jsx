import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, UserPlus, ArrowRight } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('fleet_manager');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const result = await register(name, email, password, role);
      if (result.success) {
        navigate('/console');
      } else {
        setError(result.message || 'Registration failed');
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
          <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Register Member</h2>
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-2">
            Create user credentials and assign roles
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
          {/* Full Name */}
          <div className="flex flex-col space-y-2">
            <label className="font-mono text-[10px] font-black uppercase tracking-wider text-on-background">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-50 border-2 border-border rounded-lg py-3 px-4 focus:outline-none focus:border-primary text-sm font-bold placeholder-slate-400"
              required
            />
          </div>

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
            <label className="font-mono text-[10px] font-black uppercase tracking-wider text-on-background">
              Secret Password (min 6 characters)
            </label>
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
            <span>{isSubmitting ? 'Creating User...' : 'Register Profile'}</span>
            <UserPlus className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info link */}
        <div className="mt-8 text-center border-t-2 border-border pt-6">
          <span className="font-mono text-[10px] text-on-surface-variant font-bold uppercase">
            Already registered?{' '}
            <Link to="/login" className="text-secondary font-black hover:underline inline-flex items-center gap-1">
              Sign in here <ArrowRight className="w-3 h-3" />
            </Link>
          </span>
        </div>

      </div>
    </div>
  );
}
