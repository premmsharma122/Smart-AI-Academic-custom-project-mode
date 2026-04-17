import api from './api';

export const studentService = {
  getDashboard: async () => {
    const response = await api.get('/students/dashboard');
    return response.data;
  },

  getAttendance: async () => {
    const response = await api.get('/students/attendance');
    return response.data;
  },

  getMarks: async () => {
    const response = await api.get('/students/marks');
    return response.data;
  },

  getRiskAssessment: async () => {
    const response = await api.get('/students/risk-assessment');
    return response.data;
  },

  getPredictions: async () => {
    const response = await api.get('/students/predictions');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/students/profile', data);
    return response.data;
  },
};