import React from 'react';
import { FaEnvelope, FaFacebookF, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhoneAlt, FaTwitter } from 'react-icons/fa';

const HomeFooter = () => {
  return (
    <footer id="contact" className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_0.8fr_1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Project</p>
          <h3 className="mt-3 text-2xl font-bold text-slate-900">Smart AI Academic Intelligence System</h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
            A MERN stack academic platform for attendance, marks, dashboards, and better decision-making with a clean and consistent interface.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-slate-900">Quick Links</h4>
          <div className="mt-5 flex flex-col gap-3 text-sm text-slate-600">
            <a href="#home" className="transition hover:text-slate-900">Home</a>
            <a href="#features" className="transition hover:text-slate-900">Features</a>
            <a href="#about" className="transition hover:text-slate-900">About</a>
            <a href="#contact" className="transition hover:text-slate-900">Contact</a>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-slate-900">Contact Info</h4>
          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <FaEnvelope className="mt-1 text-slate-700" />
              <span>smartaiacademic@example.com</span>
            </div>
            <div className="flex items-start gap-3">
              <FaPhoneAlt className="mt-1 text-slate-700" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="mt-1 text-slate-700" />
              <span>Academic Innovation Center, India</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            {[FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter].map((Icon, index) => (
              <a
                key={index}
                href="#home"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                aria-label="Social media"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 px-4 py-5 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
        © 2026 Smart AI Academic Intelligence System. All rights reserved.
      </div>
    </footer>
  );
};

export default HomeFooter;
