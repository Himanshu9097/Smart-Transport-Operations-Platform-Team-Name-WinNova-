import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-6 dot-grid text-on-background">
      <div className="w-full max-w-md bg-white border-4 border-border p-8 rounded-2xl hard-shadow reveal active">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link to="/login" className="font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>

        {submitted ? (
          /* Success State */
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-success/15 border-4 border-success flex items-center justify-center text-success rounded-2xl mx-auto shadow-[4px_4px_0px_0px_#1E293B]">
              <ShieldCheck className="w-8 h-8 font-black" />
            </div>
            <div>
              <h2 className="font-headline text-2xl font-black uppercase tracking-tight">Email Dispatched</h2>
              <p className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-3 max-w-xs mx-auto leading-relaxed">
                If the email is associated with a registered member, password reset instructions will arrive shortly.
              </p>
            </div>
            <div className="border-t-2 border-border pt-6">
              <Link to="/login" className="candy-button bg-primary text-white px-6 py-2.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider hard-shadow inline-block">
                Return to sign in
              </Link>
            </div>
          </div>
        ) : (
          /* Input Form State */
          <>
            <div className="text-center mb-8 border-b-2 border-border pb-4">
              <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Forgot Password</h2>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-2">
                Enter email to request reset credentials
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col space-y-2">
                <label className="font-mono text-[10px] font-black uppercase tracking-wider text-on-background">
                  Registered Account Email
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

              <button
                type="submit"
                className="w-full candy-button bg-primary text-white py-4 rounded font-mono text-xs font-bold uppercase tracking-widest hard-shadow flex items-center justify-center gap-2"
              >
                <span>Request Reset Link</span>
                <Mail className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
