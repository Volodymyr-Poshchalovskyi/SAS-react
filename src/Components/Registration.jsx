// src/Components/Registration.jsx

import React, { useState } from 'react';
import ApplicationForm from './ApplicationForm';

const Registration = () => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  return (
    <div className="max-w-sm mx-auto text-center animate-fadeIn">
      {showApplicationForm ? (
        <ApplicationForm />
      ) : (
        <>
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-black mb-2 tracking-wider uppercase">
              HELLO!
            </h2>
            <p className="text-xs text-gray-500 tracking-wider uppercase leading-relaxed">
              UNFORTUNATELY, PUBLIC REGISTRATION IS CURRENTLY CLOSED. PLEASE GET
              IN TOUCH WITH US.
            </p>
          </div>
          <button
            type="button"
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
