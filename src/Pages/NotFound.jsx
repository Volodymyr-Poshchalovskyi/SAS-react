// src/Pages/NotFound.jsx

// ! React Import
import React from 'react';
import { Link } from 'react-router-dom'; // ! Import Link from react-router-dom

// ========================================================================== //
// ! COMPONENT DEFINITION: NotFound Page (404)
// ========================================================================== //

/**
 * ? NotFound Component
 * Renders a simple 404 error page in the application's style.
 *
 * @returns {JSX.Element} The NotFound page component.
 */
const NotFound = () => {
  return (
    // * Page container with padding and vertical centering
    <div className="min-h-screen flex items-start justify-center bg-gray-100 font-sans p-4 sm:p-8 lg:p-14 mt-[70px]">
      <div className="w-full max-w-xl text-center mt-8 sm:mt-11 xl:mt-16 animate-fadeIn">
        {/* --- Page Title/Header --- */}
        <h1 className="text-8xl md:text-9xl font-extrabold text-black mb-4 tracking-tight">
          404
        </h1>

        {/* --- Main Message --- */}
        <h2 className="text-xl md:text-2xl font-semibold text-black mb-4 tracking-wider uppercase">
          PAGE NOT FOUND
        </h2>
        <p className="text-sm text-gray-600 mb-10 tracking-wider">
          SORRY, WE COULDN'T FIND THE PAGE YOU'RE LOOKING FOR.
          <br className='hidden sm:block' /> PERHAPS IT WAS MOVED OR DELETED.
        </p>

        {/* --- Back to Home Link (Styled as a Button) --- */}
        <Link
          to="/" // * Link to the main page
          className="inline-block py-4 px-10 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
          aria-label="Go to the homepage"
        >
          GO BACK HOME
        </Link>
      </div>
    </div>
  );
};

export default NotFound;