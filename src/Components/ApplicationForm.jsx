// src/Components/ApplicationForm.jsx

// ! React & Custom Hooks
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth'; // * Custom hook for authentication and related API calls

// ! Component Definition: ApplicationForm
const ApplicationForm = () => {
  // ! Hooks
  const { submitApplication } = useAuth(); // * Get the function to submit the application from auth context

  // ! State Variables
  const [email, setEmail] = useState(''); // * Stores the user's email input
  const [text, setText] = useState(''); // * Stores the user's message input
  const [error, setError] = useState(''); // * Stores any submission error messages
  const [success, setSuccess] = useState(false); // * Flag to indicate successful submission
  const [loading, setLoading] = useState(false); // * Flag to indicate if submission is in progress

  // ! Event Handlers
  /**
   * ? Handles the form submission process.
   * Performs validation, calls the API function, and manages loading/error/success states.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // * Prevent default browser form submission
    setLoading(true);
    setError('');
    setSuccess(false);

    // * Basic client-side validation
    if (!email || !text) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    // * Call the API function from the useAuth hook
    try {
      await submitApplication({ email, message: text });
      setSuccess(true); // * Set success state
      // * Clear form fields on success
      setEmail('');
      setText('');
    } catch (err) {
      // * Display error message from the API call or hook
      setError(err.message || 'An unexpected error occurred.');
      console.error('Application submission failed:', err); // * Log error for debugging
    } finally {
      setLoading(false); // * Reset loading state regardless of outcome
    }
  };

  // ! Conditional Render: Success Message
  // * If the submission was successful, display a thank you message instead of the form.
  if (success) {
    return (
      <div className="text-center animate-fadeIn">
        {' '}
        {/* // ? Consider defining 'animate-fadeIn' if not globally available */}
        <h3 className="text-lg font-semibold text-green-600 mb-2">
          Thank you! 
        </h3>
        <p className="text-xs text-gray-500 tracking-wider uppercase">
          Your application has been sent. We will review it shortly.
        </p>
      </div>
    );
  }

  // ! Main Render: Application Form
  return (
    <div className="max-w-sm mx-auto text-center animate-fadeIn">
      {/* --- Form Header --- */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-black mb-2 tracking-wider uppercase">
          APPLICATION
        </h2>
        <p className="text-xs text-gray-500 tracking-wider uppercase">
          PLEASE FILL OUT THE FORM BELOW
        </p>
      </div>

      {/* --- Error Message Display --- */}
      {error && (
        <p className="text-red-500 text-xs mb-4" role="alert">
          {error}
        </p>
      )}

      {/* --- Form Element --- */}
      <form onSubmit={handleSubmit} className="text-left space-y-6">
        {/* Email Input Field */}
        <div>
          <label
            htmlFor="app-email"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            YOUR EMAIL <span className="text-red-500">*</span>{' '}
            {/* // * Indicate required field */}
          </label>
          <input
            type="email"
            id="app-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm text-black placeholder:text-gray-500 dark:placeholder:text-gray-400" // * Adjusted placeholder color
            aria-describedby={error ? 'error-message' : undefined} // * Accessibility for errors
          />
        </div>

        {/* Message Textarea Field */}
        <div>
          <label
            htmlFor="app-text"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            YOUR MESSAGE <span className="text-red-500">*</span>{' '}
            {/* // * Indicate required field */}
          </label>
          <textarea
            id="app-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            rows="3"
            placeholder="Write your message..."
            className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm resize-none text-black placeholder:text-gray-500 dark:placeholder:text-gray-400" // * Adjusted placeholder color
            aria-describedby={error ? 'error-message' : undefined} // * Accessibility for errors
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading} // * Disable button while loading
          className="w-full py-4 mt-4 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" // * Added disabled cursor style
        >
          {loading ? 'SENDING...' : 'Send Application'}
        </button>
      </form>
      {/* // * Expose error message ID for aria-describedby */}
      {error && (
        <p id="error-message" className="sr-only">
          {error}
        </p>
      )}
    </div>
  );
};

export default ApplicationForm;
