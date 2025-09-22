// src/Components/Layout/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-black text-white font-sans">
      <div className="max-w-screen-2xl mx-auto px-16">
        <div className="border-t border-gray-800 py-6 flex flex-col md:flex-row justify-between items-center gap-8">
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
          <div className="text-gray-500 text-xs uppercase tracking-wider text-center md:text-right">
            <span>© 2025 SINNERS AND SAINTS LLC. ALL RIGHTS RESERVED.</span>
            
            {/* ✨ ЗМІНА ТУТ: Замінено <a> на <Link> та вказано шлях до сторінки політики конфіденційності */}
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