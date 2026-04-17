
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaDownload, FaUpload } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

const FacultyMarks = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [examType, setExamType] = useState('midterm');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadStudents(selectedSubject, examType);
    }
  }, [examType]);

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

  const loadStudents = async (subjectId, currentExamType = examType) => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [studentsRes, reportRes] = await Promise.all([
        fetch(`http://localhost:5000/api/faculty/subjects/${subjectId}/students`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://localhost:5000/api/marks/report?subjectId=${subjectId}&examType=${currentExamType}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const studentsData = await studentsRes.json();
      const reportData = await reportRes.json();

      if (studentsData.success) {
        setStudents(studentsData.data);
        const initialMarks = {};
        studentsData.data.forEach((student) => {
          initialMarks[student.studentId] = { internalMarks: 0, externalMarks: 0, assignmentMarks: 0, quizMarks: 0 };
        });

        if (reportData.success) {
          reportData.data.forEach((record) => {
            const sid = record.student?.studentId;
            if (!sid) return;
            initialMarks[sid] = {
              internalMarks: record.internalMarks || 0,
              externalMarks: record.externalMarks || 0,
              assignmentMarks: record.assignmentMarks || 0,
              quizMarks: record.quizMarks || 0,
            };
          });
        }

        setMarksData(initialMarks);
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
    if (subjectId) loadStudents(subjectId, examType);
    else setStudents([]);
  };

  const handleMarkChange = (studentId, field, value) => {
    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: parseInt(value, 10) || 0,
      },
    }));
  };

  const calculateTotal = (marks) => (marks.internalMarks || 0) + (marks.externalMarks || 0);

  const saveMarks = async () => {
    if (!selectedSubject) {
      setMessage('Please select a subject');
      showToast({ title: 'Marks not saved', message: 'Select a subject before saving marks.', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const marksList = students.map((student) => ({
        studentId: student.studentId,
        internalMarks: marksData[student.studentId]?.internalMarks || 0,
        externalMarks: marksData[student.studentId]?.externalMarks || 0,
        assignmentMarks: marksData[student.studentId]?.assignmentMarks || 0,
        quizMarks: marksData[student.studentId]?.quizMarks || 0,
      }));

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/marks/bulk-upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId: selectedSubject, examType, marksList }),
      });

      const data = await response.json();
      if (data.success) {
        const successMessage = `${examType === 'midterm' ? 'Mid Term' : 'End Term'} marks saved for ${data.count} students.`;
        setMessage(`✅ ${successMessage}`);
        showToast({ title: 'Marks saved', message: successMessage, type: 'success' });
        await loadStudents(selectedSubject, examType);
      } else {
        setMessage('❌ Failed to save marks');
        showToast({ title: 'Marks not saved', message: data.message || 'Unable to save marks.', type: 'error' });
      }
    } catch (error) {
      console.error('Error saving marks:', error);
      setMessage('❌ Error saving marks');
      showToast({ title: 'Marks not saved', message: 'A server error occurred while saving marks.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Student ID', 'Name', 'Internal Marks', 'External Marks', 'Total'];
    const rows = students.map((student) => [student.studentId, student.user?.name, marksData[student.studentId]?.internalMarks || 0, marksData[student.studentId]?.externalMarks || 0, calculateTotal(marksData[student.studentId] || {})]);
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marks_${selectedSubject}_${examType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="page-hero p-6">
        <h1 className="text-2xl font-bold">Examination Marks Entry</h1>
        <p className="page-subtitle mt-2">Upload Mid Term and End Term marks for the selected subject.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="page-section p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Marks Controls</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Subject</label>
              <select value={selectedSubject} onChange={handleSubjectChange} className="w-full px-4 py-2 theme-input rounded-lg">
                <option value="">-- Select Subject --</option>
                {subjects.map((subject) => <option key={subject._id} value={subject._id}>{subject.code} - {subject.name} (Sem {subject.semester})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
              <select value={examType} onChange={(e) => setExamType(e.target.value)} className="w-full px-4 py-2 theme-input rounded-lg">
                <option value="midterm">Mid Term Exam</option>
                <option value="endterm">End Term Exam</option>
              </select>
            </div>

            {students.length > 0 && (
              <div className="pt-4 border-t space-y-2">
                <button onClick={saveMarks} disabled={saving} className="btn-primary w-full rounded-lg py-3 flex items-center justify-center gap-2"><FaSave />{saving ? 'Saving...' : 'Save All Marks'}</button>
                <button onClick={exportToCSV} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"><FaDownload />Export to CSV</button>
              </div>
            )}
          </div>

          {message && <div className={`mt-4 p-3 rounded-lg text-center ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
        </div>

        <div className="lg:col-span-2 page-section p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Enter Marks ({students.length} students)</h3>

          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-gray-500"><FaUpload className="text-4xl mx-auto mb-3 opacity-50" /><p>Select a subject to enter marks.</p></div>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto table-shell">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Student ID</th>
                    <th className="text-left py-3 px-2">Name</th>
                    <th className="text-center py-3 px-2">Internal<br />(0-30)</th>
                    <th className="text-center py-3 px-2">External<br />(0-70)</th>
                    <th className="text-center py-3 px-2">Assignment<br />(0-15)</th>
                    <th className="text-center py-3 px-2">Quiz<br />(0-10)</th>
                    <th className="text-center py-3 px-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const studentMarks = marksData[student.studentId] || { internalMarks: 0, externalMarks: 0, assignmentMarks: 0, quizMarks: 0 };
                    const total = calculateTotal(studentMarks);
                    return (
                      <tr key={student._id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-mono text-sm">{student.studentId}</td>
                        <td className="py-2 px-2">{student.user?.name}</td>
                        <td className="py-2 px-2"><input type="number" min="0" max="30" value={studentMarks.internalMarks} onChange={(e) => handleMarkChange(student.studentId, 'internalMarks', e.target.value)} className="w-20 px-2 py-1 theme-input rounded text-center" /></td>
                        <td className="py-2 px-2"><input type="number" min="0" max="70" value={studentMarks.externalMarks} onChange={(e) => handleMarkChange(student.studentId, 'externalMarks', e.target.value)} className="w-20 px-2 py-1 theme-input rounded text-center" /></td>
                        <td className="py-2 px-2"><input type="number" min="0" max="15" value={studentMarks.assignmentMarks} onChange={(e) => handleMarkChange(student.studentId, 'assignmentMarks', e.target.value)} className="w-16 px-2 py-1 theme-input rounded text-center" /></td>
                        <td className="py-2 px-2"><input type="number" min="0" max="10" value={studentMarks.quizMarks} onChange={(e) => handleMarkChange(student.studentId, 'quizMarks', e.target.value)} className="w-16 px-2 py-1 theme-input rounded text-center" /></td>
                        <td className="py-2 px-2 text-center font-bold">{total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyMarks;
