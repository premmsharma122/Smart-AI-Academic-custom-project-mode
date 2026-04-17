import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { FaUsers, FaBook, FaChartLine, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FacultyDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [profileRes, atRiskRes] = await Promise.all([
        api.get('/faculty/dashboard'),
        api.get('/predictions/at-risk'),
      ]);
      setDashboardData(profileRes.data.data);
      setAtRiskStudents(atRiskRes.data.data);
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
      title: 'Total Students',
      value: dashboardData?.totalStudents || 0,
      icon: FaUsers,
      color: 'bg-blue-500',
    },
    {
      title: 'My Subjects',
      value: dashboardData?.subjects || 0,
      icon: FaBook,
      color: 'bg-green-500',
    },
    {
      title: 'At-Risk Students',
      value: atRiskStudents?.length || 0,
      icon: FaExclamationTriangle,
      color: 'bg-red-500',
    },
    {
      title: 'Attendance Rate',
      value: '85%',
      icon: FaCheckCircle,
      color: 'bg-purple-500',
    },
  ];

  const riskData = [
    { level: 'Low', count: 45 },
    { level: 'Medium', count: 12 },
    { level: 'High', count: 8 },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-bg rounded-2xl p-6 text-white"
      >
        <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
        <p className="text-blue-100 mt-2">Monitor your students' performance and identify at-risk students early.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="text-white text-xl" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {dashboardData?.recentAttendance?.slice(0, 5).map((att, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{att.student?.user?.name}</p>
                  <p className="text-sm text-gray-500">{att.subject?.name}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  att.status === 'present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {att.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">At-Risk Students</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Student Name</th>
                <th className="text-left py-3 px-4">Risk Level</th>
                <th className="text-left py-3 px-4">Risk Score</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {atRiskStudents.slice(0, 5).map((student, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{student.student?.user?.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      student.riskLevel === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {student.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4">{(student.riskScore * 100).toFixed(0)}%</td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default FacultyDashboard;