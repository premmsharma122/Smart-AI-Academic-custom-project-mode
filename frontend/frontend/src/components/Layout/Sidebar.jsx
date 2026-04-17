import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHome,
  FaCalendarCheck,
  FaChartLine,
  FaUserGraduate,
  FaRobot,
  FaExclamationTriangle,
  FaUserCog,
  FaSchool,
  FaUsers,
  FaBook,
  FaTachometerAlt,
} from 'react-icons/fa';

const Sidebar = ({ isOpen, setIsOpen, userRole }) => {
  const menuItems = {
    student: [
      { path: '/dashboard', icon: FaTachometerAlt, name: 'Dashboard' },
      { path: '/attendance', icon: FaCalendarCheck, name: 'Attendance' },
      { path: '/marks', icon: FaChartLine, name: 'Marks & Grades' },
      { path: '/risk-assessment', icon: FaExclamationTriangle, name: 'Risk Assessment' },
      { path: '/predictions', icon: FaRobot, name: 'AI Predictions' },
      { path: '/profile', icon: FaUserGraduate, name: 'Profile' },
    ],
    faculty: [
      { path: '/dashboard', icon: FaTachometerAlt, name: 'Dashboard' },
      { path: '/attendance', icon: FaCalendarCheck, name: 'Mark Attendance' },
      { path: '/marks', icon: FaChartLine, name: 'Upload Marks' },
      { path: '/students', icon: FaUsers, name: 'Students' },
      { path: '/predictions', icon: FaRobot, name: 'At-Risk Students' },
      { path: '/profile', icon: FaUserCog, name: 'Profile' },
    ],
    admin: [
      { path: '/dashboard', icon: FaTachometerAlt, name: 'Dashboard' },
      { path: '/departments', icon: FaSchool, name: 'Departments' },
      { path: '/students', icon: FaUsers, name: 'Students' },
      { path: '/faculty', icon: FaUserCog, name: 'Faculty' },
      { path: '/reports', icon: FaChartLine, name: 'Reports' },
      { path: '/predictions', icon: FaRobot, name: 'AI Analytics' },
      { path: '/profile', icon: FaUserCog, name: 'Profile' },
    ],
  };

  const items = menuItems[userRole] || menuItems.student;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 256 : 80 }}
      className="fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl z-50"
    >
      <div className="p-4 flex items-center justify-center border-b border-gray-700">
        <FaRobot className="text-3xl text-blue-400" />
        {isOpen && (
          <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Academic AI
          </span>
        )}
      </div>

      <nav className="mt-6">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <item.icon className="text-xl" />
            {isOpen && <span className="ml-3 text-sm font-medium">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            <p>AI Powered</p>
            <p>v1.0.0</p>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;