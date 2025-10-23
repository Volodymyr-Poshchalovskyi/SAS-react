// src/Components/Registration.jsx

// ! React Imports
import React, { useState } from 'react';

// ! Local Component Imports
import ApplicationForm from './ApplicationForm'; // * The form component shown after clicking 'Contact Us'

// ! Component Definition: Registration
const Registration = () => {
  // ! State
  // * Controls whether to show the initial message or the application form
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  // ! Render Logic
  return (
    // * Main container with fade-in animation
    <div className="max-w-sm mx-auto text-center animate-fadeIn">
      {showApplicationForm ? (
        // * If showApplicationForm is true, render the contact form
        <ApplicationForm />
      ) : (
        // * Otherwise, show the initial message and the "Contact Us" button
        <>
          {/* --- Initial Message Section --- */}
          <div className="mb-8 sm:mb-10">
            <h2 className="text-xl font-semibold text-black mb-2 tracking-wider uppercase">
              HELLO!
            </h2>
            <p className="text-xs text-gray-500 tracking-wider uppercase leading-relaxed">
              UNFORTUNATELY, PUBLIC REGISTRATION IS CURRENTLY CLOSED. PLEASE GET
              IN TOUCH WITH US.
            </p>
          </div>
          {/* --- "Contact Us" Button --- */}
          <button
            type="button"
            // * onClick handler updates state to show the form
            onClick={() => setShowApplicationForm(true)}
            className="w-full py-4 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Contact Us
          </button>
        </>
      )}
    </div>
  );
};

export default Registration;
