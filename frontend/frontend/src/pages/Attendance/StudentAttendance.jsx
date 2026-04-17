
import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/student';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaInfoCircle } from 'react-icons/fa';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const response = await studentService.getAttendance();
      setAttendance(response.data);
    } catch (error) {
      console.error('Failed to load attendance:', error);
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

  const summary = attendance?.summary || {};
  const records = attendance?.attendance || [];
  const latestRecord = records[0] || null;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="page-hero p-6">
        <h1 className="text-2xl font-bold">Attendance Record</h1>
        <p className="page-subtitle mt-2">View your subject-wise attendance status and the latest marking updates.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="page-section p-6 text-center">
          <FaCalendarAlt className="text-blue-500 text-3xl mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Total Classes</p>
          <p className="text-2xl font-bold text-gray-800">{summary.totalDays || 0}</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="page-section p-6 text-center">
          <FaCheckCircle className="text-green-500 text-3xl mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Present</p>
          <p className="text-2xl font-bold text-gray-800">{summary.presentDays || 0}</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="page-section p-6 text-center">
          <FaTimesCircle className="text-red-500 text-3xl mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Absent</p>
          <p className="text-2xl font-bold text-gray-800">{summary.absentDays || 0}</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="page-section p-6 text-center">
          <FaClock className="text-orange-500 text-3xl mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Attendance %</p>
          <p className="text-2xl font-bold text-gray-800">{summary.attendancePercentage || 0}%</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="page-section p-5 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Records</h3>
          <div className="overflow-x-auto table-shell">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Subject</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{record.subject?.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.status === 'present' ? 'bg-green-100 text-green-600' :
                        record.status === 'absent' ? 'bg-red-100 text-red-600' :
                        record.status === 'late' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{record.remarks || '-'}</td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">No attendance has been marked yet for your account.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="page-section p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Status</h3>
          {latestRecord ? (
            <div className="space-y-4">
              <div className="theme-soft-block rounded-2xl p-4">
                <p className="text-sm text-gray-500">Last marked class</p>
                <p className="mt-1 font-semibold text-gray-800">{latestRecord.subject?.name}</p>
                <p className="text-sm text-gray-500 mt-1">{new Date(latestRecord.date).toLocaleDateString()}</p>
              </div>
              <div className="theme-soft-block rounded-2xl p-4">
                <p className="text-sm text-gray-500">Latest status</p>
                <p className="mt-2 text-xl font-bold capitalize text-gray-800">{latestRecord.status}</p>
                <p className="text-sm text-gray-500 mt-2">Your faculty has already marked this class. If a class has not yet been marked, it will appear here after submission.</p>
              </div>
            </div>
          ) : (
            <div className="theme-soft-block rounded-2xl p-4 text-sm text-gray-500">
              Attendance will appear here once a faculty member records it for your subjects.
            </div>
          )}

          <div className="theme-soft-block rounded-2xl p-4 mt-4">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="mt-1 text-slate-600" />
              <p className="text-sm text-gray-600">
                Present, absent, late, and excused statuses are shown directly in your record table, so you can always verify what has been marked for each class.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
