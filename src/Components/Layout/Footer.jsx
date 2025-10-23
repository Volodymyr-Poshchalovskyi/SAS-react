// src/Components/Layout/Footer.jsx

// ! React & Router Imports
import React from 'react';
import { Link } from 'react-router-dom';

// ! Third-party Library Imports (React Icons)
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

// ! Local Asset Imports
import certifiedLogo from '../../assets/Logo/certified.jpg'; // WBENC certification logo

// ! Footer Component Definition
export default function Footer() {
  return (
    // * Main footer element with dark background and snap alignment
    <footer className="bg-black text-gray-400 font-sans snap-start">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-16">
        {/* // * Inner container with top border and responsive flex layout */}
        <div className="relative border-t border-gray-800 py-6 flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-8">

          {/* --- Left Section: Social Media Icons --- */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-5 text-lg">
              {/* // ? Replace '#' with actual social media links */}
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

          {/* --- Center Section: WBENC Logo --- */}
          {/* // * Absolutely positioned on large screens to center it */}
          <div className="lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
            <img
              src={certifiedLogo}
              alt="Certified WBENC"
              // * Grayscale filter applied for styling
              className="h-8 w-auto filter grayscale brightness-150"
            />
          </div>

          {/* --- Right Section: Copyright & Privacy Link --- */}
          <div className="text-xs uppercase tracking-wider text-center lg:text-right flex flex-col items-center lg:flex-row gap-2 lg:gap-0">
            <span>© 2025 SINNERS AND SAINTS LLC. ALL RIGHTS RESERVED.</span>
            <Link
              to="/privacy-policy"
              className="lg:ml-6 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}