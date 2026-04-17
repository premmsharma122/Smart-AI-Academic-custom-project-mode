import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ThemeToggle from '../Common/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

const HomeNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark } = useTheme();

  const headerClasses = isDark
    ? 'sticky top-0 z-50 border-b border-slate-800 bg-slate-950/92 backdrop-blur'
    : 'sticky top-0 z-50 border-b border-slate-200 bg-white/92 backdrop-blur';

  const projectLabelClasses = isDark
    ? 'text-xs font-semibold uppercase tracking-[0.22em] text-slate-400'
    : 'text-xs font-semibold uppercase tracking-[0.22em] text-slate-500';

  const projectTitleClasses = isDark
    ? 'text-sm font-semibold text-slate-100 sm:text-base'
    : 'text-sm font-semibold text-slate-900 sm:text-base';

  const navLinkClasses = isDark
    ? 'text-sm font-medium text-slate-300 transition hover:text-white'
    : 'text-sm font-medium text-slate-600 transition hover:text-slate-900';

  const loginLinkClasses = isDark
    ? 'text-sm font-medium text-slate-200 transition hover:text-white'
    : 'text-sm font-medium text-slate-700 transition hover:text-slate-900';

  const ctaClasses = isDark
    ? 'rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100'
    : 'rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800';

  const menuButtonClasses = isDark
    ? 'inline-flex items-center justify-center rounded-xl border border-slate-700 p-3 text-slate-200 transition hover:bg-slate-900'
    : 'inline-flex items-center justify-center rounded-xl border border-slate-200 p-3 text-slate-700 transition hover:bg-slate-50';

  const mobilePanelClasses = isDark
    ? 'border-t border-slate-800 bg-slate-950 px-4 py-4 shadow-sm lg:hidden'
    : 'border-t border-slate-200 bg-white px-4 py-4 shadow-sm lg:hidden';

  const mobileItemClasses = isDark
    ? 'rounded-xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-900'
    : 'rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50';

  return (
    <header className={headerClasses}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-3">
          <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold ${isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>
            S
          </span>
          <div>
            <p className={projectLabelClasses}>Project</p>
            <h1 className={projectTitleClasses}>Smart AI Academic Intelligence System</h1>
          </div>
        </a>

        <div className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className={navLinkClasses}>
              {item.label}
            </a>
          ))}
          <ThemeToggle compact />
          <Link to="/login" className={loginLinkClasses}>
            Login
          </Link>
          <Link to="/signup" className={ctaClasses}>
            Get Started
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle compact />
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className={menuButtonClasses}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className={mobilePanelClasses}>
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={mobileItemClasses}
              >
                {item.label}
              </a>
            ))}
            <Link to="/login" onClick={() => setMenuOpen(false)} className={mobileItemClasses}>
              Login
            </Link>
            <Link to="/signup" onClick={() => setMenuOpen(false)} className={ctaClasses + ' text-center'}>
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default HomeNavbar;
