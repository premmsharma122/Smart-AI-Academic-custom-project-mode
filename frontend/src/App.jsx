import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import FacultyDashboard from './pages/Dashboard/FacultyDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import StudentAttendance from './pages/Attendance/StudentAttendance';
import FacultyAttendance from './pages/Attendance/FacultyAttendance';
import StudentMarks from './pages/Marks/StudentMarks';
import FacultyMarks from './pages/Marks/FacultyMarks';
import RiskAssessment from './pages/Predictions/RiskAssessment';
import PerformancePrediction from './pages/Predictions/PerformancePrediction';
import Profile from './pages/Profile/Profile';
import ThemeToggle from './components/Common/ThemeToggle';
import { useAuth } from './context/AuthContext';

const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center theme-page">
    <div className="loading-ring"></div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = {
    student: [
      { path: '/dashboard', name: 'Dashboard', icon: '📊' },
      { path: '/attendance', name: 'Attendance', icon: '📅' },
      { path: '/marks', name: 'Marks', icon: '📝' },
      { path: '/risk-assessment', name: 'Risk Assessment', icon: '⚠️' },
      { path: '/predictions', name: 'Predictions', icon: '📈' },
      { path: '/profile', name: 'Profile', icon: '👤' },
    ],
    faculty: [
      { path: '/dashboard', name: 'Dashboard', icon: '📊' },
      { path: '/attendance', name: 'Attendance', icon: '📅' },
      { path: '/marks', name: 'Marks', icon: '📝' },
      { path: '/profile', name: 'Profile', icon: '👤' },
    ],
    admin: [
      { path: '/dashboard', name: 'Dashboard', icon: '📊' },
      { path: '/profile', name: 'Profile', icon: '👤' },
    ],
  };

  const items = menuItems[user?.role] || menuItems.student;

  return (
    <div className="app-layout">
      <aside className={`sidebar-shell fixed left-0 top-0 z-50 h-full transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">S</div>
          {sidebarOpen ? (
            <div>
              <h1 className="sidebar-title">College ERP Portal</h1>
              <p className="sidebar-subtitle">Smart Academic Intelligence</p>
            </div>
          ) : null}
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {sidebarOpen ? <span>{item.name}</span> : null}
            </NavLink>
          ))}

          <button onClick={handleLogout} className="sidebar-link sidebar-logout" type="button">
            <span className="sidebar-link-icon">🚪</span>
            {sidebarOpen ? <span>Logout</span> : null}
          </button>
        </nav>
      </aside>

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <nav className="topbar-shell">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen((prev) => !prev)} className="topbar-icon-btn" aria-label="Toggle sidebar">
              ☰
            </button>
            <div>
              <p className="topbar-title">{user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)} Portal` : 'Academic Portal'}</p>
              <p className="topbar-subtitle">Academic records, attendance, examinations, and insights</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle compact />
            <div className="topbar-user-chip">
              <span className="topbar-user-name">{user?.name}</span>
              <span className="topbar-role-badge">{user?.role}</span>
            </div>
          </div>
        </nav>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="/reset-password/:token" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                {user?.role === 'student' && <StudentDashboard />}
                {user?.role === 'faculty' && <FacultyDashboard />}
                {user?.role === 'admin' && <AdminDashboard />}
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={['student', 'faculty']}>
              <Layout>
                {user?.role === 'student' && <StudentAttendance />}
                {user?.role === 'faculty' && <FacultyAttendance />}
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marks"
          element={
            <ProtectedRoute allowedRoles={['student', 'faculty']}>
              <Layout>
                {user?.role === 'student' && <StudentMarks />}
                {user?.role === 'faculty' && <FacultyMarks />}
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/risk-assessment"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout>
                <RiskAssessment />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/predictions"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout>
                <PerformancePrediction />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default function App() {
  return <AppRoutes />;
}
