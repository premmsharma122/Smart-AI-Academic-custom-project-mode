
import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/student';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { FaChartLine, FaTrophy, FaAward } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentMarks = () => {
  const [marks, setMarks] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    loadMarks();
  }, []);

  const loadMarks = async () => {
    try {
      const response = await studentService.getMarks();
      setMarks(response.data);
    } catch (error) {
      console.error('Failed to load marks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const marksList = marks?.marks || [];
  const chartData = marksList.map((mark) => ({
    subject: mark.subjectCode,
    marks: mark.endterm?.totalMarks ?? mark.midterm?.totalMarks ?? 0,
  }));

  const chartTextColor = isDark ? '#cbd5e1' : '#475569';
  const chartGridColor = isDark ? '#334155' : '#e2e8f0';
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: isDark ? '#121b2b' : '#ffffff',
      border: `1px solid ${isDark ? '#27344a' : '#d8dfeb'}`,
      borderRadius: '12px',
      color: isDark ? '#edf3ff' : '#102038',
    },
  };

  const gradeColors = {
    O: 'bg-purple-100 text-purple-600',
    'A+': 'bg-blue-100 text-blue-600',
    A: 'bg-green-100 text-green-600',
    'B+': 'bg-yellow-100 text-yellow-600',
    B: 'bg-orange-100 text-orange-600',
    C: 'bg-red-100 text-red-600',
    P: 'bg-slate-100 text-slate-600',
    F: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="page-hero p-6">
        <h1 className="text-2xl font-bold">Examination Results</h1>
        <p className="page-subtitle mt-2">Mid Term and End Term performance across your registered semester subjects.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="page-section p-6 text-center">
          <FaTrophy className="text-yellow-500 text-3xl mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Current CGPA</p>
          <p className="text-3xl font-bold text-gray-800">{marks?.cgpa || 'N/A'}</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="page-section p-6 text-center">
          <FaAward className="text-purple-500 text-3xl mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Total Credits</p>
          <p className="text-3xl font-bold text-gray-800">{marks?.totalCredits || 0}</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="page-section p-6 text-center">
          <FaChartLine className="text-blue-500 text-3xl mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Subjects</p>
          <p className="text-3xl font-bold text-gray-800">{marks?.totalSubjects || 0}</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-section p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">End Term Marks Overview</h3>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
            <XAxis dataKey="subject" tick={{ fill: chartTextColor }} />
            <YAxis tick={{ fill: chartTextColor }} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="marks" fill="#1f3656" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="page-section p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject-wise Result Sheet</h3>
        <div className="overflow-x-auto table-shell">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Subject</th>
                <th className="text-left py-3 px-4">Semester</th>
                <th className="text-left py-3 px-4">Mid Term</th>
                <th className="text-left py-3 px-4">End Term</th>
                <th className="text-left py-3 px-4">Grade</th>
                <th className="text-left py-3 px-4">Credits</th>
              </tr>
            </thead>
            <tbody>
              {marksList.map((mark, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">
                    <div>{mark.subjectName}</div>
                    <div className="text-xs text-gray-500">{mark.subjectCode}</div>
                  </td>
                  <td className="py-3 px-4">Semester {mark.semester}</td>
                  <td className="py-3 px-4">{mark.midterm?.totalMarks ?? 'NA'}</td>
                  <td className="py-3 px-4">{mark.endterm?.totalMarks ?? 'NA'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${gradeColors[mark.grade] || 'bg-gray-100 text-gray-600'}`}>{mark.grade}</span>
                  </td>
                  <td className="py-3 px-4">{mark.credits}</td>
                </tr>
              ))}
              {marksList.length === 0 && (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No marks have been uploaded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentMarks;
