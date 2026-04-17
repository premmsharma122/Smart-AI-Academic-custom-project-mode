import React from 'react';

const SectionHeading = ({ badge, title, description, align = 'center', theme = 'light' }) => {
  const alignment = align === 'left' ? 'text-left items-start' : 'text-center items-center';
  const isDark = theme === 'dark';

  return (
    <div className={`mx-auto flex max-w-3xl flex-col gap-4 ${alignment}`}>
      {badge && (
        <span
          className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-semibold shadow-sm ${
            isDark
              ? 'border border-white/20 bg-white/10 text-slate-200'
              : 'border border-slate-200 bg-slate-100 text-slate-700'
          }`}
        >
          {badge}
        </span>
      )}
      <div>
        <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl ${isDark ? 'text-white' : 'text-slate-950'}`}>{title}</h2>
        {description && (
          <p className={`mt-4 text-base leading-7 sm:text-lg ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>{description}</p>
        )}
      </div>
    </div>
  );
};

export default SectionHeading;
