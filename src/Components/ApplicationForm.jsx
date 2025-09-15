// src/Components/ApplicationForm.jsx (або де він у вас лежить)

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth'; // ++ Імпортуємо хук

const ApplicationForm = () => {
  const { submitApplication } = useAuth(); // ++ Отримуємо функцію
  const [email, setEmail] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => { // ++ Робимо функцію асинхронною
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!email || !text) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    // --- ВИДАЛЯЄМО СИМУЛЯЦІЮ ---
    
    // ++ ДОДАЄМО РЕАЛЬНУ ЛОГІКУ
    try {
      await submitApplication({ email: email, message: text });
      setSuccess(true);
      setEmail('');
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center animate-fadeIn">
        <h3 className="text-lg font-semibold text-green-600 mb-2">Thank you!</h3>
        <p className="text-xs text-gray-500 tracking-wider uppercase">
          Your application has been sent. We will review it shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto text-center animate-fadeIn">
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-black mb-2 tracking-wider uppercase">
          APPLICATION
        </h2>
        <p className="text-xs text-gray-500 tracking-wider uppercase">
          PLEASE FILL OUT THE FORM BELOW
        </p>
      </div>
      {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="text-left space-y-6">
        <div>
          <label
            htmlFor="app-email"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            YOUR EMAIL
          </label>
          <input
            type="email"
            id="app-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm text-black placeholder:text-black"
          />
        </div>
        <div>
          <label
            htmlFor="app-text"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            YOUR MESSAGE
          </label>
          <textarea
            id="app-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            rows="3"
            placeholder="Write your message..."
            className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm resize-none text-black placeholder:text-black"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-4 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'SENDING...' : 'Send Application'}
        </button>
      </form>
    </div>
  );
};

export default ApplicationForm;