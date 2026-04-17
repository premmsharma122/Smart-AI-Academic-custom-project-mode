import React from 'react';
import { motion } from 'framer-motion';
import {
  FaBrain,
  FaChartBar,
  FaChalkboardTeacher,
  FaClipboardList,
  FaRegChartBar,
  FaUserShield,
} from 'react-icons/fa';
import SectionHeading from './SectionHeading';

const features = [
  {
    icon: FaChartBar,
    title: 'Student Performance Analysis',
    description: 'Review marks, engagement, and progress trends in one place so weak areas can be identified early.',
  },
  {
    icon: FaClipboardList,
    title: 'Attendance Intelligence',
    description: 'Track attendance subject-wise and quickly spot patterns that may affect academic consistency.',
  },
  {
    icon: FaRegChartBar,
    title: 'Predictive Academic Reports',
    description: 'Generate forward-looking summaries using attendance history, marks, and existing performance data.',
  },
  {
    icon: FaBrain,
    title: 'AI-based Recommendations',
    description: 'Support students with practical suggestions based on performance signals and risk indicators.',
  },
  {
    icon: FaChalkboardTeacher,
    title: 'Teacher Dashboard',
    description: 'Help faculty monitor classes, update records, and check academic signals without switching tools.',
  },
  {
    icon: FaUserShield,
    title: 'Admin Control Panel',
    description: 'Give administrators a central place to manage users, records, and institution-level monitoring.',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Core capabilities"
          title="Features that match a real academic platform"
          description="The homepage is kept practical and readable, with features that fit a student management system without making the design feel crowded."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-700 transition duration-300 group-hover:bg-slate-900 group-hover:text-white">
                  <Icon />
                </span>
                <h3 className="mt-6 text-xl font-bold text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
