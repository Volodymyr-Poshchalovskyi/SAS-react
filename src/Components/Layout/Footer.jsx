// src/Components/Layout/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import certifiedLogo from '../../assets/Logo/certified.jpg';

export default function Footer() {
  return (
    // ✨ 1. Default text color changed to a lighter gray (text-gray-400)
    <footer className="bg-black text-gray-400 font-sans">
      <div className="max-w-screen-2xl mx-auto px-16">
        <div className="relative border-t border-gray-800 py-6 flex justify-between items-center gap-8">
          {/* --- Ліва частина: Іконки соцмереж --- */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-5 text-lg">
              {/* ✨ 2. Hover color changed to white */}
              <a
                href="#"
                aria-label="Facebook"
                className="hover:text-white transition-colors"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="hover:text-white transition-colors"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="hover:text-white transition-colors"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          {/* --- Центральна частина: Логотип --- */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* ✨ 3. Added a CSS filter to make the JPG logo appear light gray */}
            <img
              src={certifiedLogo}
              alt="Certified WBENC"
              className="h-8 w-auto filter grayscale brightness-150"
            />
          </div>

          {/* --- Права частина: Копірайт та посилання --- */}
          {/* ✨ 4. Removed specific gray color to inherit from the parent */}
          <div className="text-xs uppercase tracking-wider text-center md:text-right">
            <span>© 2025 SINNERS AND SAINTS LLC. ALL RIGHTS RESERVED.</span>

            {/* ✨ 5. Hover color for the link changed to white */}
            <Link
              to="/privacy-policy"
              className="ml-6 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
