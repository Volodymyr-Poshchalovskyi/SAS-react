// src/Components/Layout/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

// ✨ 1. Імпортуємо зображення логотипа
import certifiedLogo from '../../assets/Logo/certified.jpg';

export default function Footer() {
  return (
    <footer className="bg-black text-white font-sans">
      <div className="max-w-screen-2xl mx-auto px-16">
        {/* ✨ 2. Додано 'relative' для позиціонування логотипа */}
        <div className="relative border-t border-gray-800 py-6 flex justify-between items-center gap-8">
          
          {/* --- Ліва частина: Іконки соцмереж (без змін) --- */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-5 text-lg">
              <a
                href="#"
                aria-label="Facebook"
                className="hover:text-gray-300 transition-colors"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="hover:text-gray-300 transition-colors"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="hover:text-gray-300 transition-colors"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          {/* ✨ 3. Центральна частина: Логотип з абсолютним позиціонуванням */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <img 
              src={certifiedLogo} 
              alt="Certified WBENC" 
              className="h-8 w-auto" // Ви можете налаштувати висоту (h-12) за потреби
            />
          </div>

          {/* --- Права частина: Копірайт та посилання (без змін) --- */}
          <div className="text-gray-500 text-xs uppercase tracking-wider text-center md:text-right">
            <span>© 2025 SINNERS AND SAINTS LLC. ALL RIGHTS RESERVED.</span>
            
            <Link
              to="/privacy-policy"
              className="ml-6 hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}