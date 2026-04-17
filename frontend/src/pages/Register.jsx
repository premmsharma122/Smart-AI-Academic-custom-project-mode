import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowRight,
  FaBriefcase,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaGraduationCap,
  FaIdCard,
  FaLock,
  FaSchool,
  FaUser,
} from 'react-icons/fa';
import ThemeToggle from '../components/Common/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const initialState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student',
  studentId: '',
  facultyId: '',
  semester: 1,
  enrollmentYear: new Date().getFullYear(),
  designation: 'Assistant Professor',
};

const Register = () => {
  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const selectedRoleLabel = useMemo(() => (formData.role === 'faculty' ? 'Faculty' : 'Student'), [formData.role]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      const message = 'Passwords do not match';
      setError(message);
      showToast({ type: 'error', title: 'Signup failed', message });
      return;
    }

    if (formData.password.length < 6) {
      const message = 'Password must be at least 6 characters';
      setError(message);
      showToast({ type: 'error', title: 'Signup failed', message });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };

      if (formData.role === 'student') {
        payload.studentId = formData.studentId.trim();
        payload.semester = Number(formData.semester);
        payload.enrollmentYear = Number(formData.enrollmentYear);
      }

      if (formData.role === 'faculty') {
        payload.facultyId = formData.facultyId.trim();
        payload.designation = formData.designation;
      }

      const result = await register(payload);
      if (result?.success) {
        navigate('/dashboard', { replace: true });
        return;
      }

      throw new Error(result?.message || 'Registration failed');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unable to create account right now';
      setError(message);
      showToast({ type: 'error', title: 'Signup failed', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl justify-end pb-4">
        <ThemeToggle compact />
      </div>

      <div className="auth-shell mx-auto max-w-6xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="auth-main">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-xl">
            <div>
              <p className="auth-kicker">Create account</p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900">Sign up as student or faculty</h1>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                Choose the account type first, then fill in the basic details. The selected role tells the system exactly who is signing up.
              </p>
            </div>

            {error ? <div className="theme-alert theme-alert-error mt-5">{error}</div> : null}

            <div className="mt-7 grid grid-cols-2 gap-3 rounded-3xl bg-slate-100 p-2">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'student' }))}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${formData.role === 'student' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <span className="inline-flex items-center gap-2">
                  <FaGraduationCap /> Student
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'faculty' }))}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${formData.role === 'faculty' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <span className="inline-flex items-center gap-2">
                  <FaBriefcase /> Faculty
                </span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="theme-input w-full py-3 pl-12 pr-4" placeholder="Enter your full name" required />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="theme-input w-full py-3 pl-12 pr-4" placeholder="you@college.edu" required />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {formData.role === 'student' ? 'Student ID' : 'Faculty ID'} <span className="text-slate-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name={formData.role === 'student' ? 'studentId' : 'facultyId'}
                      value={formData.role === 'student' ? formData.studentId : formData.facultyId}
                      onChange={handleChange}
                      className="theme-input w-full py-3 pl-12 pr-4"
                      placeholder={formData.role === 'student' ? 'STU001' : 'FAC001'}
                    />
                  </div>
                </div>

                {formData.role === 'student' ? (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Semester</label>
                    <select name="semester" value={formData.semester} onChange={handleChange} className="theme-input w-full px-4 py-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                        <option key={semester} value={semester}>Semester {semester}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Designation</label>
                    <select name="designation" value={formData.designation} onChange={handleChange} className="theme-input w-full px-4 py-3">
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Professor">Professor</option>
                      <option value="Lecturer">Lecturer</option>
                    </select>
                  </div>
                )}
              </div>

              {formData.role === 'student' ? (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Enrollment year</label>
                  <div className="relative">
                    <FaSchool className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="number" name="enrollmentYear" value={formData.enrollmentYear} onChange={handleChange} className="theme-input w-full py-3 pl-12 pr-4" min="2000" max="2100" />
                  </div>
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="theme-input w-full py-3 pl-12 pr-12" placeholder="Create a password" required />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="theme-input w-full py-3 pl-12 pr-12" placeholder="Repeat your password" required />
                  <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700">
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="surface-soft rounded-3xl px-4 py-3 text-sm text-slate-700">
                This account will be created as <span className="font-semibold">{selectedRoleLabel}</span>. The selected role decides whether the system creates a student profile or a faculty profile.
              </div>

              <button type="submit" disabled={loading} className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Creating account...' : `Create ${selectedRoleLabel} Account`}
                {!loading ? <FaArrowRight className="text-xs" /> : null}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-slate-700 transition hover:text-slate-900">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>

        <div className="auth-side hidden lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="auth-pill">Structured onboarding</p>
            <h2 className="mt-8 text-4xl font-bold leading-tight text-slate-900">
              A signup flow that clearly separates students and faculty
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              Users choose the role first, so the backend receives the correct profile type from the beginning.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              'Role selection is visible before account creation',
              'Student and faculty records are created differently on the backend',
              'Optional IDs are supported without blocking registration',
            ].map((item) => (
              <div key={item} className="surface-soft rounded-3xl px-5 py-4 text-sm leading-7 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
