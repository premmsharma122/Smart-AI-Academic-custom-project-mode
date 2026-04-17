import React from 'react';
import { Link } from 'react-router-dom';

const CtaSection = () => {
  return (
    <section className="pb-20 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-900 px-6 py-12 text-center text-white shadow-sm sm:px-10 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-300">Get started</p>
          <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Bring attendance, marks, and academic reports into one system
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Start with a clean academic workflow now and connect more backend features later as your MERN project grows.
          </p>
          <Link to="/signup" className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-semibold text-slate-900 transition duration-300 hover:bg-slate-100">
            Start Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
