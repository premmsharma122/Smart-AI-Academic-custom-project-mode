import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaEnvelope, FaKey, FaPaperPlane } from 'react-icons/fa';
import ThemeToggle from '../components/Common/ThemeToggle';
import authService from '../services/auth';
import { useToast } from '../context/ToastContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setResetUrl('');

    try {
      const response = await authService.forgotPassword(email);
      const message = response.message || 'Reset instructions have been prepared.';
      setSuccess(message);
      setResetUrl(response.resetUrl || '');
      showToast({ type: 'success', title: 'Reset link prepared', message });
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to process your request right now';
      setError(message);
      showToast({ type: 'error', title: 'Request failed', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl justify-end pb-4">
        <ThemeToggle compact />
      </div>

      <div className="auth-shell mx-auto max-w-6xl lg:grid-cols-[1fr_1fr]">
        <div className="auth-side hidden lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="auth-pill">Password recovery</p>
            <h1 className="mt-8 text-4xl font-bold leading-tight text-slate-900">Reset access without leaving the portal</h1>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Enter your registered email address and we will prepare a secure password reset link.
            </p>
          </div>

          <div className="grid gap-4">
            {['Works for student, faculty, and admin accounts', 'The reset link expires automatically for security', 'A temporary development link appears when email is not configured'].map((item) => (
              <div key={item} className="surface-soft rounded-3xl px-5 py-4 text-sm leading-7 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="auth-main">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-xl">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700">
              <FaArrowLeft className="text-xs" />
              Back to login
            </Link>

            <div className="mt-6">
              <p className="auth-kicker">Forgot password</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">Request a reset link</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                We will prepare a secure link so you can set a new password.
              </p>
            </div>

            {error ? <div className="theme-alert theme-alert-error mt-5">{error}</div> : null}
            {success ? <div className="theme-alert theme-alert-success mt-5">{success}</div> : null}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Registered email address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="theme-input w-full py-3 pl-12 pr-4"
                    placeholder="you@college.edu"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Preparing reset link...' : 'Send reset link'}
                {!loading ? <FaPaperPlane className="text-xs" /> : null}
              </button>
            </form>

            {resetUrl ? (
              <div className="surface-soft mt-6 rounded-3xl p-4 text-sm text-slate-700">
                <div className="flex items-center gap-2 font-semibold">
                  <FaKey />
                  Temporary development reset link
                </div>
                <a href={resetUrl} className="mt-3 block break-all text-slate-900 underline underline-offset-4">
                  {resetUrl}
                </a>
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
