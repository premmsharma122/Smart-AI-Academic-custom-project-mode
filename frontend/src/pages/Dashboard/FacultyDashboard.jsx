
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { FaUsers, FaBook, FaExclamationTriangle, FaChalkboardTeacher } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Modal from '../../components/Common/Modal';

const FacultyDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [predictionDetails, setPredictionDetails] = useState(null);
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

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

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const dashboardRes = await fetch('http://localhost:5000/api/faculty/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      const dashboardDataRes = await dashboardRes.json();
      if (dashboardDataRes.success) {
        setDashboardData(dashboardDataRes.data);
        setAtRiskStudents(dashboardDataRes.data.atRiskStudents || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (riskRecord) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/predictions/student/${riskRecord.student._id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSelectedRisk(riskRecord);
      setPredictionDetails(data.success ? data.data : null);
    } catch (error) {
      showToast({ title: 'Unable to load details', message: 'The selected student prediction could not be loaded.', type: 'error' });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const stats = [
    { title: 'Total Students', value: dashboardData?.totalStudents || 0, icon: FaUsers, color: 'bg-blue-500' },
    { title: 'Assigned Subjects', value: dashboardData?.subjects || 0, icon: FaBook, color: 'bg-green-500' },
    { title: 'At-Risk Students', value: atRiskStudents?.length || 0, icon: FaExclamationTriangle, color: 'bg-red-500' },
    { title: 'Faculty Access', value: 1, icon: FaChalkboardTeacher, color: 'bg-purple-500' },
  ];

  const riskData = [
    { level: 'Low', count: atRiskStudents.filter((s) => s.riskLevel === 'low').length, color: '#10b981' },
    { level: 'Medium', count: atRiskStudents.filter((s) => s.riskLevel === 'medium').length, color: '#f59e0b' },
    { level: 'High', count: atRiskStudents.filter((s) => s.riskLevel === 'high').length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="page-hero p-6">
        <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
        <p className="page-subtitle mt-2">Review class activity, monitor student risk, and complete regular academic actions from one place.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div key={index} whileHover={{ scale: 1.02 }} className="page-section p-6">
            <div className="flex justify-between items-start"><div><p className="text-gray-500 text-sm">{stat.title}</p><p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p></div><div className={`p-3 rounded-xl ${stat.color}`}><stat.icon className="text-white text-xl" /></div></div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="page-section p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={riskData} cx="50%" cy="50%" labelLine={false} label={({ level, percent }) => `${level}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="count">
                {riskData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip {...chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="page-section p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full p-3 bg-blue-50 rounded-xl text-left hover:bg-blue-100 transition-colors flex items-center justify-between" onClick={() => navigate('/attendance')}><span className="font-medium text-blue-800">Attendance Register</span><span className="text-blue-600">→</span></button>
            <button className="w-full p-3 bg-green-50 rounded-xl text-left hover:bg-green-100 transition-colors flex items-center justify-between" onClick={() => navigate('/marks')}><span className="font-medium text-green-800">Marks Entry</span><span className="text-green-600">→</span></button>
            <button className="w-full p-3 bg-purple-50 rounded-xl text-left hover:bg-purple-100 transition-colors flex items-center justify-between" onClick={loadDashboard}><span className="font-medium text-purple-800">Refresh Dashboard Data</span><span className="text-purple-600">→</span></button>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-section p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">At-Risk Students</h3>
        <div className="overflow-x-auto table-shell">
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
              {atRiskStudents.slice(0, 10).map((student, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{student.student?.user?.name || 'N/A'}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs ${student.riskLevel === 'high' ? 'bg-red-100 text-red-600' : student.riskLevel === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{student.riskLevel}</span></td>
                  <td className="py-3 px-4">{(student.riskScore * 100).toFixed(0)}%</td>
                  <td className="py-3 px-4"><button className="text-slate-700 hover:text-slate-900 text-sm font-semibold" onClick={() => handleViewDetails(student)}>View Details</button></td>
                </tr>
              ))}
              {atRiskStudents.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-gray-500">No at-risk students found in your assigned department right now.</td></tr>}
            </tbody>
          </table>
        </div>
      </motion.div>

      <Modal isOpen={Boolean(selectedRisk)} title="Student Risk Details" onClose={() => { setSelectedRisk(null); setPredictionDetails(null); }} width="max-w-3xl">
        {selectedRisk && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="theme-soft-block rounded-2xl p-4"><p className="text-sm text-gray-500">Student</p><p className="font-semibold text-gray-800 mt-1">{selectedRisk.student?.user?.name}</p></div>
              <div className="theme-soft-block rounded-2xl p-4"><p className="text-sm text-gray-500">Risk Level</p><p className="font-semibold text-gray-800 mt-1 capitalize">{selectedRisk.riskLevel}</p></div>
              <div className="theme-soft-block rounded-2xl p-4"><p className="text-sm text-gray-500">Dropout Probability</p><p className="font-semibold text-gray-800 mt-1">{((selectedRisk.predictedDropoutProbability || 0) * 100).toFixed(1)}%</p></div>
            </div>

            {predictionDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="page-section p-4"><p className="text-sm text-gray-500">Predicted CGPA</p><p className="text-2xl font-bold text-gray-800 mt-1">{predictionDetails.predictedCGPA}</p></div>
                <div className="page-section p-4"><p className="text-sm text-gray-500">Predicted Grade</p><p className="text-2xl font-bold text-gray-800 mt-1">{predictionDetails.predictedGrade}</p></div>
              </div>
            )}

            <div className="page-section p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Recommended Faculty Actions</h4>
              <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                {(selectedRisk.recommendations || []).map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FacultyDashboard;
