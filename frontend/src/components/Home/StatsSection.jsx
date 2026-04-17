import React from 'react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';

const stats = [
  { value: '10,000+', label: 'Student Records Managed' },
  { value: '500+', label: 'Faculty Supported' },
  { value: '95%', label: 'Report Accuracy' },
  { value: '24/7', label: 'Smart Access' },
];

const StatsSection = () => {
  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Platform snapshot"
          title="A quick summary of scale and usage"
          description="These values are placeholder statistics for presentation. Later, you can connect them to backend APIs and MongoDB collections for live counts."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.07 }}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-4xl font-bold text-slate-950 sm:text-5xl">{stat.value}</p>
              <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
