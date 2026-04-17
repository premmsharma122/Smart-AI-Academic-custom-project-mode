import React from 'react';
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AcademicIllustration from './AcademicIllustration';

const HeroSection = () => {
  return (
    <section id="home" className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center"
        >
          <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            Academic records, attendance, reports, and role-based access in one place
          </span>
          <h2 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            A practical academic portal for students, faculty, and administrators
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Smart AI Academic Intelligence System brings student records, attendance tracking, marks review, and academic monitoring together in one clean MERN stack platform built for regular academic use.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a href="#features" className="btn-primary gap-2 rounded-full">
              Explore Features
              <FaArrowRight className="text-xs" />
            </a>
            <Link to="/signup" className="btn-secondary rounded-full">
              Get Started
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {['Simple academic dashboard', 'Separate student and faculty access', 'Ready for future backend expansion'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <FaCheckCircle className="text-slate-700" />
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-center"
        >
          <AcademicIllustration />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
