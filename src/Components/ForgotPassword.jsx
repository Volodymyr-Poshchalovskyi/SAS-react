// src/Components/ForgotPassword.jsx

// ! React Import
import React from 'react';

/**
 * ? ForgotPassword Component
 * Renders a form for users to request a password reset link.
 * Handles displaying loading states, error messages, and success messages.
 *
 * @param {object} props - The component props.
 * @param {string} props.email - The current value of the email input.
 * @param {function} props.setEmail - Function to update the email state.
 * @param {function} props.handlePasswordReset - Function to call on form submission.
 * @param {boolean} props.loading - Indicates if the reset request is in progress.
 * @param {string} props.error - Error message to display, if any.
 * @param {string} props.successMessage - Success message to display after sending the link.
 * @param {function} props.onBackToLogin - Function to navigate back to the login view.
 * @returns {JSX.Element} The rendered ForgotPassword form or success message.
 */
const ForgotPassword = ({
  email,
  setEmail,
  handlePasswordReset,
  loading,
  error,
  successMessage, // * Prop to display success message
  onBackToLogin,
}) => {
  return (
    // * Main container with fade-in animation
    <div className="max-w-sm mx-auto text-center animate-fadeIn">
      {/* --- Header Section --- */}
      <div className="mb-8 sm:mb-10">
        <h2 className="text-xl font-semibold text-black mb-2 tracking-wider uppercase">
          RESET PASSWORD
        </h2>
        {/* // * Subtitle is hidden when success message is shown */}
        {!successMessage && (
          <p className="text-xs text-gray-500 tracking-wider uppercase">
            ENTER YOUR EMAIL TO RECEIVE A RESET LINK
          </p>
        )}
      </div>

      {/* --- Message Display Area --- */}
      {error && (
        <p className="text-red-500 text-xs mb-4" role="alert">
          {error}
        </p>
      )}
      {successMessage && (
        <p className="text-green-600 text-xs mb-4" role="status">
          {successMessage}
        </p>
      )}

      {/* --- Form Section (Hidden on Success) --- */}
      {!successMessage && (
        <form onSubmit={handlePasswordReset} className="text-left space-y-6">
          {/* Email Input Field */}
          <div>
            <label
              htmlFor="reset-email"
              className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
            >
              EMAIL <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="reset-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm text-black placeholder:text-gray-500 dark:placeholder:text-gray-400" // * Adjusted placeholder
              aria-describedby={error ? 'error-message' : undefined}
            />
          </div>

          {/* Back to Login Link */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-xs text-gray-500 uppercase tracking-wider font-semibold hover:text-black transition-colors"
            >
              BACK TO SIGN IN
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading} // * Disable button during loading
            className="w-full py-4 mt-4 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" // * Added disabled styles
          >
            {loading ? 'SENDING...' : 'Send Reset Link'}
          </button>
        </form>
      )}
      {/* // * Expose error message ID for aria-describedby */}
      {error && (
        <p id="error-message" className="sr-only">
          {error}
        </p>
      )}
    </div>
  );
};

export default ForgotPassword;
