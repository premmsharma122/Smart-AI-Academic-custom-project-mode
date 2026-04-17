
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaUsers, FaCheck, FaTimes } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

const FacultyAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadStudents(selectedSubject, selectedDate);
    }
  }, [selectedDate]);

  const loadSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/faculty/subjects', { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) setSubjects(data.data);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  const loadStudents = async (subjectId, dateValue = selectedDate) => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/faculty/subjects/${subjectId}/students?date=${dateValue}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) {
        setStudents(data.data);
        const initialAttendance = {};
        data.data.forEach((student) => {
          initialAttendance[student.studentId] = student.attendanceStatus === 'not-marked' ? 'present' : student.attendanceStatus;
        });
        setAttendanceData(initialAttendance);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    if (subjectId) loadStudents(subjectId, selectedDate);
    else setStudents([]);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const next = {};
    students.forEach((student) => { next[student.studentId] = status; });
    setAttendanceData(next);
  };

  const saveAttendance = async () => {
    if (!selectedSubject || !selectedDate) {
      setMessage('Please select subject and date');
      showToast({ title: 'Attendance not saved', message: 'Select a subject and date first.', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const attendanceList = students.map((student) => ({ studentId: student.studentId, status: attendanceData[student.studentId] || 'present' }));
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/attendance/bulk-mark', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId: selectedSubject, date: selectedDate, attendanceList }),
      });

      const data = await response.json();
      if (data.success) {
        const successMessage = `Attendance recorded for ${data.count} students.`;
        setMessage(`✅ ${successMessage}`);
        showToast({ title: 'Attendance saved', message: successMessage, type: 'success' });
        await loadStudents(selectedSubject, selectedDate);
      } else {
        setMessage('❌ Failed to save attendance');
        showToast({ title: 'Attendance not saved', message: data.message || 'Unable to save attendance.', type: 'error' });
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      setMessage('❌ Error saving attendance');
      showToast({ title: 'Attendance not saved', message: 'A server error occurred while saving attendance.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getStatusCount = () => {
    const counts = { present: 0, absent: 0, late: 0, excused: 0 };
    Object.values(attendanceData).forEach((status) => { counts[status] = (counts[status] || 0) + 1; });
    return counts;
  };

  const statusCounts = getStatusCount();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="page-hero p-6">
        <h1 className="text-2xl font-bold">Attendance Register</h1>
        <p className="page-subtitle mt-2">Select the correct subject, mark present or absent, and save the class attendance record.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="page-section p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Controls</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Subject</label>
              <select value={selectedSubject} onChange={handleSubjectChange} className="w-full px-4 py-2 theme-input rounded-lg">
                <option value="">-- Select Subject --</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>{subject.code} - {subject.name} (Sem {subject.semester})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-2 theme-input rounded-lg" />
            </div>

            {students.length > 0 && (
              <>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Quick Actions</p>
                  <div className="flex gap-2">
                    <button onClick={() => markAll('present')} className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"><FaCheck /> All Present</button>
                    <button onClick={() => markAll('absent')} className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"><FaTimes /> All Absent</button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-green-50 rounded-lg"><p className="text-2xl font-bold text-green-600">{statusCounts.present}</p><p className="text-xs text-gray-600">Present</p></div>
                    <div className="p-2 bg-red-50 rounded-lg"><p className="text-2xl font-bold text-red-600">{statusCounts.absent}</p><p className="text-xs text-gray-600">Absent</p></div>
                    <div className="p-2 bg-yellow-50 rounded-lg"><p className="text-2xl font-bold text-yellow-600">{statusCounts.late}</p><p className="text-xs text-gray-600">Late</p></div>
                    <div className="p-2 bg-blue-50 rounded-lg"><p className="text-2xl font-bold text-blue-600">{statusCounts.excused}</p><p className="text-xs text-gray-600">Excused</p></div>
                  </div>
                </div>

                <button onClick={saveAttendance} disabled={saving} className="btn-primary w-full rounded-lg py-3 flex items-center justify-center gap-2"><FaSave />{saving ? 'Saving...' : 'Save Attendance'}</button>
              </>
            )}
          </div>

          {message && <div className={`mt-4 p-3 rounded-lg text-center ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
        </div>

        <div className="lg:col-span-2 page-section p-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <h3 className="text-lg font-semibold text-gray-800"><FaUsers className="inline mr-2" />Students ({students.length})</h3>
            {selectedSubject && students.length > 0 && <div className="text-sm text-gray-500">Present: {statusCounts.present} | Absent: {statusCounts.absent} | Date: {selectedDate}</div>}
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-gray-500"><FaUsers className="text-4xl mx-auto mb-3 opacity-50" /><p>Select a subject to view the registered students for that semester.</p></div>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto table-shell">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Student ID</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Current Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{student.studentId}</td>
                      <td className="py-3 px-4">{student.user?.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${attendanceData[student.studentId] === 'present' ? 'bg-green-100 text-green-600' : attendanceData[student.studentId] === 'absent' ? 'bg-red-100 text-red-600' : attendanceData[student.studentId] === 'late' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}>{attendanceData[student.studentId] || 'present'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <button onClick={() => handleAttendanceChange(student.studentId, 'present')} className={`p-1 rounded ${attendanceData[student.studentId] === 'present' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`} title="Present"><FaCheck size={14} /></button>
                          <button onClick={() => handleAttendanceChange(student.studentId, 'absent')} className={`p-1 rounded ${attendanceData[student.studentId] === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`} title="Absent"><FaTimes size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyAttendance;
