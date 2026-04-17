import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/student';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  FaChartLine,
  FaCalendarCheck,
  FaExclamationTriangle,
  FaRobot,
  FaTrophy,
  FaArrowUp,
  FaArrowDown,
  FaBook,
  FaUserGraduate
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="page-section p-6"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
            <span className="ml-1">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="text-white text-xl" />
      </div>
    </div>
  </motion.div>
);

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  const chartTextColor = isDark ? '#cbd5e1' : '#475569';
  const chartGridColor = isDark ? '#334155' : '#e2e8f0';
  const chartTooltipStyle = {
    contentStyle: {
      backgroundColor: isDark ? '#121b2b' : '#ffffff',
      border: `1px solid ${isDark ? '#27344a' : '#d8dfeb'}`,
      borderRadius: '12px',
      color: isDark ? '#edf3ff' : '#102038',
    },
    labelStyle: { color: isDark ? '#edf3ff' : '#102038' },
    itemStyle: { color: isDark ? '#edf3ff' : '#102038' },
  };
  const [attendanceData, setAttendanceData] = useState([]);
  const [marksData, setMarksData] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await studentService.getDashboard();
      
      if (response.success) {
        setDashboardData(response.data);
        
        // Prepare chart data
        if (response.data.recentAttendance) {
          const attendance = response.data.recentAttendance.slice(0, 7).map((att) => ({
            date: new Date(att.date).toLocaleDateString(),
            present: att.status === 'present' ? 1 : 0,
          }));
          setAttendanceData(attendance);
        }
        
        if (response.data.recentMarks) {
          const marks = response.data.recentMarks.map((mark) => ({
            subject: mark.subject?.name || 'Unknown',
            marks: mark.totalMarks,
            grade: mark.grade,
          }));
          setMarksData(marks);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Current CGPA',
      value: dashboardData?.stats?.currentCGPA || 'N/A',
      icon: FaTrophy,
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      trend: 5,
    },
    {
      title: 'Attendance Rate',
      value: `${dashboardData?.stats?.attendanceRate || 0}%`,
      icon: FaCalendarCheck,
      color: 'bg-gradient-to-r from-green-400 to-emerald-500',
      trend: 2,
    },
    {
      title: 'Risk Level',
      value: dashboardData?.riskScore?.riskLevel || 'Low',
      icon: FaExclamationTriangle,
      color: dashboardData?.riskScore?.riskLevel === 'High' 
        ? 'bg-gradient-to-r from-red-400 to-red-600'
        : dashboardData?.riskScore?.riskLevel === 'Medium'
        ? 'bg-gradient-to-r from-orange-400 to-orange-600'
        : 'bg-gradient-to-r from-green-400 to-green-600',
    },
    {
      title: 'Total Subjects',
      value: dashboardData?.stats?.totalSubjects || 0,
      icon: FaBook,
      color: 'bg-gradient-to-r from-purple-400 to-pink-500',
    },
  ];

  const pieData = [
    { name: 'Present', value: dashboardData?.stats?.attendanceRate || 0 },
    { name: 'Absent', value: 100 - (dashboardData?.stats?.attendanceRate || 0) },
  ];

  const COLORS = ['#3b82f6', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-hero p-6"
      >
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="page-subtitle mt-2">
          Here's your academic performance overview. AI is analyzing your progress!
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="page-section p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis dataKey="date" tick={{ fill: chartTextColor }} />
              <YAxis tick={{ fill: chartTextColor }} />
              <Tooltip {...chartTooltipStyle} />
              <Legend wrapperStyle={{ color: chartTextColor }} />
              <Line type="monotone" dataKey="present" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Marks Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="page-section p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Marks</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={marksData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis dataKey="subject" tick={{ fill: chartTextColor }} />
              <YAxis tick={{ fill: chartTextColor }} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="marks" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* AI Recommendations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="page-section theme-highlight p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <FaRobot className="text-purple-600 text-2xl" />
          <h3 className="text-lg font-semibold text-gray-800">AI Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboardData?.riskScore?.recommendations?.map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <p className="text-gray-700">{rec}</p>
            </div>
          ))}
          {(!dashboardData?.riskScore?.recommendations?.length) && (
            <p className="text-gray-500 col-span-2 text-center">No recommendations available yet</p>
          )}
        </div>
      </motion.div>

      {/* Risk Gauge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="page-section p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Assessment</h3>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width={300} height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            {dashboardData?.riskScore?.riskLevel === 'High'
              ? '⚠️ You are at high risk. Please consult your academic advisor.'
              : dashboardData?.riskScore?.riskLevel === 'Medium'
              ? '📊 You have moderate risk. Consider improving attendance and marks.'
              : '✅ You are doing great! Keep up the good work!'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;