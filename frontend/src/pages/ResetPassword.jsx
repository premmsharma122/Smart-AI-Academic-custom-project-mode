import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheckCircle, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import ThemeToggle from '../components/Common/ThemeToggle';
import authService from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      const message = 'Password must be at least 6 characters long';
      setError(message);
      showToast({ type: 'error', title: 'Reset failed', message });
      return;
    }

    if (password !== confirmPassword) {
      const message = 'Passwords do not match';
      setError(message);
      showToast({ type: 'error', title: 'Reset failed', message });
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(token, password);
      refreshAuth();
      const message = response.message || 'Password reset successful';
      setSuccess(message);
      showToast({ type: 'success', title: 'Password updated', message });
      window.setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to reset your password right now';
      setError(message);
      showToast({ type: 'error', title: 'Reset failed', message });
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
            <p className="auth-pill">New password</p>
            <h1 className="mt-8 text-4xl font-bold leading-tight text-slate-900">Set a fresh password for your account</h1>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Choose a secure password you will remember. Once updated, you will be signed in automatically.
            </p>
          </div>

          <div className="grid gap-4">
            {['Minimum 6 characters required', 'Token expires automatically for security', 'Works for all account roles'].map((item) => (
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
              <p className="auth-kicker">Reset password</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">Create a new password</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                Enter and confirm your new password below.
              </p>
            </div>

            {error ? <div className="theme-alert theme-alert-error mt-5">{error}</div> : null}
            {success ? (
              <div className="theme-alert theme-alert-success mt-5 flex items-start gap-3">
                <FaCheckCircle className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">New password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="theme-input w-full py-3 pl-12 pr-12" placeholder="Enter new password" required />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="theme-input w-full py-3 pl-12 pr-12" placeholder="Confirm new password" required />
                  <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700">
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Updating password...' : 'Update password'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
