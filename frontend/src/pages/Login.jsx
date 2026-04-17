import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowRight,
  FaChalkboardTeacher,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaGraduationCap,
  FaLock,
  FaUserCog,
} from 'react-icons/fa';
import ThemeToggle from '../components/Common/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const demoAccounts = [
  {
    key: 'student',
    label: 'Student Demo',
    email: 'student1@college.edu',
    password: 'student123',
    icon: FaGraduationCap,
    description: 'Dashboard, attendance, marks, and profile access.',
  },
  {
    key: 'faculty',
    label: 'Faculty Demo',
    email: 'faculty1@college.edu',
    password: 'faculty123',
    icon: FaChalkboardTeacher,
    description: 'Attendance control, marks entry, and faculty view.',
  },
  {
    key: 'admin',
    label: 'Admin Demo',
    email: 'admin@college.edu',
    password: 'admin123',
    icon: FaUserCog,
    description: 'Institution overview and admin dashboard access.',
  },
];

const roleSummaries = {
  student: 'Student demo account detected',
  faculty: 'Faculty demo account detected',
  admin: 'Admin demo account detected',
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState('');
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const { showToast } = useToast();

  const detectedRole = useMemo(() => {
    const demo = demoAccounts.find((item) => item.email === email);
    return demo?.key || '';
  }, [email]);

  const performLogin = async (loginEmail, loginPassword) => {
    logout({ silent: true });
    const result = await login(loginEmail, loginPassword);

    if (result?.success) {
      navigate('/dashboard', { replace: true });
      return;
    }

    throw new Error(result?.message || 'Login failed');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await performLogin(email, password);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unable to sign in right now';
      setError(message);
      showToast({ type: 'error', title: 'Sign in failed', message });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demo) => {
    setError('');
    setEmail(demo.email);
    setPassword(demo.password);
    setLoading(true);
    setActiveDemo(demo.key);

    try {
      await performLogin(demo.email, demo.password);
    } catch (err) {
      const message = err.response?.data?.message || 'Demo login failed. Please verify that the backend server is running.';
      setError(message);
      showToast({ type: 'error', title: 'Demo login failed', message });
    } finally {
      setLoading(false);
      setActiveDemo('');
    }
  };

  return (
    <div className="auth-page px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl justify-end pb-4">
        <ThemeToggle compact />
      </div>

      <div className="auth-shell mx-auto max-w-6xl lg:grid-cols-[0.95fr_1.05fr]">
        <div className="auth-side hidden lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">S</span>
              <div>
                <p className="auth-kicker">Project</p>
                <h1 className="text-lg font-semibold text-slate-900">Smart AI Academic Intelligence System</h1>
              </div>
            </Link>

            <div className="mt-14 max-w-xl">
              <p className="auth-pill">Account access</p>
              <h2 className="mt-8 text-4xl font-bold leading-tight text-slate-900">
                Sign in to continue to your academic workspace
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                Access student, faculty, or admin tools from one place with one consistent academic interface.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              'Use your registered email and password',
              'Try demo access for student, faculty, and admin roles',
              'You can logout and switch roles without stale session issues',
            ].map((item) => (
              <div key={item} className="surface-soft rounded-3xl px-5 py-4 text-sm leading-7 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="auth-main">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-xl">
            <div>
              <p className="auth-kicker">Welcome back</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">Login to your account</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                Use your registered email and password, or choose one of the demo roles below.
              </p>
            </div>

            {error ? (
              <div className="theme-alert theme-alert-error mt-5">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
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

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  {detectedRole ? <span className="text-xs font-medium capitalize text-slate-600">{roleSummaries[detectedRole]}</span> : null}
                </div>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="theme-input w-full py-3 pl-12 pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-500">Need help with your password?</span>
                <Link to="/forgot-password" className="font-semibold text-slate-700 transition hover:text-slate-900">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={loading} className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading ? <FaArrowRight className="text-xs" /> : null}
              </button>
            </form>

            <div className="mt-8">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200"></div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Demo access</p>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {demoAccounts.map((demo) => {
                  const Icon = demo.icon;

                  return (
                    <button
                      key={demo.key}
                      type="button"
                      onClick={() => handleDemoLogin(demo)}
                      disabled={loading}
                      className="surface-card rounded-3xl p-4 text-left transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
                        <Icon />
                      </span>
                      <h3 className="mt-4 text-sm font-semibold text-slate-900">{demo.label}</h3>
                      <p className="mt-2 text-xs leading-6 text-slate-500">{demo.description}</p>
                      {activeDemo === demo.key ? <p className="mt-3 text-xs font-semibold text-slate-700">Signing in...</p> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-slate-500">
              Do not have an account?{' '}
              <Link to="/signup" className="font-semibold text-slate-700 transition hover:text-slate-900">
                Create account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
