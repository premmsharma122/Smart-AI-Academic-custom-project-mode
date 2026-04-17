import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { FaUniversity, FaUsers, FaChalkboardTeacher, FaChartLine, FaRobot, FaDownload } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/predictions/analytics'),
      ]);
      setStats(statsRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = async () => {
    try {
      await api.post('/predictions/generate');
      alert('Predictions generated successfully!');
      loadData();
    } catch (error) {
      alert('Failed to generate predictions');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Students', value: stats?.totalStudents || 0, icon: FaUsers, color: 'bg-blue-500' },
    { title: 'Total Faculty', value: stats?.totalFaculty || 0, icon: FaChalkboardTeacher, color: 'bg-green-500' },
    { title: 'Departments', value: stats?.totalDepartments || 0, icon: FaUniversity, color: 'bg-purple-500' },
    { title: 'At-Risk Students', value: stats?.atRiskStudents || 0, icon: FaChartLine, color: 'bg-red-500' },
  ];

  const riskData = analytics?.riskLevels || [];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-bg rounded-2xl p-6 text-white"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-100 mt-2">College-wide analytics and AI insights</p>
          </div>
          <button
            onClick={generatePredictions}
            className="bg-white text-purple-600 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-100 transition-colors"
          >
            <FaRobot />
            <span>Generate AI Predictions</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.predictionsBySemester || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgPredictedCGPA" stroke="#a855f7" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
          <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-2">
            <FaDownload />
            <span>Export Report</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 rounded-xl text-left hover:bg-blue-100 transition-colors">
            <h4 className="font-semibold text-blue-800">Generate Reports</h4>
            <p className="text-sm text-blue-600 mt-1">Download department-wise reports</p>
          </button>
          <button className="p-4 bg-green-50 rounded-xl text-left hover:bg-green-100 transition-colors">
            <h4 className="font-semibold text-green-800">Manage Departments</h4>
            <p className="text-sm text-green-600 mt-1">Add or update department info</p>
          </button>
          <button className="p-4 bg-purple-50 rounded-xl text-left hover:bg-purple-100 transition-colors">
            <h4 className="font-semibold text-purple-800">AI Analytics</h4>
            <p className="text-sm text-purple-600 mt-1">View detailed AI insights</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;