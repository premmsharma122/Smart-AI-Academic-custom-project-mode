import React from 'react';
import { FaChartLine, FaClipboardCheck, FaDatabase, FaGraduationCap, FaUsers } from 'react-icons/fa';

const AcademicIllustration = () => {
  const items = [
    { icon: <FaClipboardCheck />, label: 'Attendance Overview', value: '92%' },
    { icon: <FaChartLine />, label: 'Performance Score', value: '88/100' },
    { icon: <FaUsers />, label: 'Faculty Supported', value: '500+' },
    { icon: <FaDatabase />, label: 'Records Managed', value: '10K+' },
  ];

  return (
    <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Sample dashboard</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Academic Summary</h3>
          </div>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-2xl text-white">
            <FaGraduationCap />
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  {item.icon}
                </span>
                <span className="text-lg font-bold text-slate-900">{item.value}</span>
              </div>
              <p className="mt-4 text-sm text-slate-600">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between text-sm text-slate-600">
            <span>Institution readiness</span>
            <span>84%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-[84%] rounded-full bg-slate-800"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicIllustration;
