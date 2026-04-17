import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import SectionHeading from './SectionHeading';

const reasons = [
  'Smart analytics for better academic understanding',
  'Easy dashboard access for students, faculty, and admins',
  'Secure data handling with role-based access',
  'Real-time academic monitoring for timely action',
  'A user-friendly interface that stays simple and readable',
];

const WhyChooseUsSection = () => {
  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Why choose us"
          title="Made for regular academic use, not just presentation"
          description="The platform keeps the layout straightforward and readable so it works well for project demos as well as actual academic tasks."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45 }}
            className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"
          >
            <div className="grid gap-4">
              {reasons.map((reason) => (
                <div key={reason} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <span className="mt-1 text-slate-700">
                    <FaCheckCircle />
                  </span>
                  <p className="text-sm leading-7 text-slate-600">{reason}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45 }}
            className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">System value</p>
            <h3 className="mt-4 text-3xl font-bold text-slate-900">Clear structure, steady visual style, ready for future growth</h3>
            <p className="mt-5 text-base leading-8 text-slate-600">
              The homepage and inner screens now follow one consistent academic theme. The layout is easier to extend later without redesigning the whole project.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { value: 'Responsive', label: 'Works across screen sizes' },
                { value: 'Reusable', label: 'Separated component structure' },
                { value: 'Scalable', label: 'Ready for backend integration' },
                { value: 'Clean', label: 'Balanced academic styling' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
