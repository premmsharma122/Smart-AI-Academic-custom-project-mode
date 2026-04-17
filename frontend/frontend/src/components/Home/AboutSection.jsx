import React from 'react';
import { FaDatabase, FaNodeJs, FaReact, FaServer } from 'react-icons/fa';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';

const stackItems = [
  {
    icon: FaReact,
    title: 'React + Vite Frontend',
    description: 'Reusable pages and responsive components for students, faculty, and admins.',
  },
  {
    icon: FaNodeJs,
    title: 'Node.js + Express Backend',
    description: 'Structured for authentication, APIs, and day-to-day academic workflows.',
  },
  {
    icon: FaDatabase,
    title: 'MongoDB Database',
    description: 'Stores attendance, marks, profile details, and report-related data.',
  },
  {
    icon: FaServer,
    title: 'Analytics Support',
    description: 'Prepared for reports, recommendations, and academic review features.',
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
          className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10"
        >
          <SectionHeading
            badge="About the project"
            title="Built as a MERN stack academic system"
            description="This project uses React, Node.js, Express, and MongoDB. It is designed to improve academic decision-making with clean records, role-based access, and a more organized workflow."
            align="left"
          />

          <div className="mt-8 space-y-4 text-sm leading-7 text-slate-600">
            <p>
              The platform supports routine academic work such as attendance tracking, marks review, student monitoring,
              and access to reports for institutions.
            </p>
            <p>
              The design is intentionally simple and professional, so it feels like a real college portal instead of a template landing page.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2">
          {stackItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-xl text-white">
                  <Icon />
                </span>
                <h3 className="mt-6 text-xl font-bold text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
