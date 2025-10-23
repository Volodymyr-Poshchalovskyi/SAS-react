// src/Components/UserLogin.jsx

// ! React Import
import React from 'react';

// ========================================================================== //
// ! COMPONENT DEFINITION: UserLogin
// ========================================================================== //

/**
 * ? UserLogin Component
 * Renders the standard email/password login form for users.
 * Includes fields for email, password, a "Forgot Password?" link,
 * and handles loading states, error messages, and success messages.
 *
 * @param {object} props - Component props.
 * @param {string} props.email - Current value of the email input.
 * @param {function} props.setEmail - State setter for the email input.
 * @param {string} props.password - Current value of the password input.
 * @param {function} props.setPassword - State setter for the password input.
 * @param {function} props.handleLogin - Function to execute on form submission.
 * @param {boolean} props.loading - Indicates if the login process is in progress.
 * @param {string} props.error - Error message to display, if any.
 * @param {string} props.successMessage - Success message to display (e.g., after registration).
 * @param {function} props.onForgotPasswordClick - Function to call when "Forgot Password?" is clicked.
 * @returns {JSX.Element} The UserLogin form component.
 */
const UserLogin = ({
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  loading,
  error,
  successMessage, // * Displayed after successful registration redirect
  onForgotPasswordClick, // * Callback to switch view to Forgot Password
}) => {
  return (
    // * Main container with fade-in animation
    <div className="max-w-sm mx-auto text-center animate-fadeIn">
      {/* --- Header Section --- */}
      <div className="mb-8 sm:mb-10">
        <h2 className="text-xl font-semibold text-black mb-2 tracking-wider uppercase">
          WELCOME BACK.
        </h2>
        <p className="text-xs text-gray-500 tracking-wider uppercase">
          SIGN IN WITH YOUR EMAIL AND PASSWORD
        </p>
      </div>

      {/* --- Message Display Area (Error or Success) --- */}
      {error && (
        <p
          id="error-message"
          className="text-red-500 text-xs mb-4"
          role="alert"
        >
          {error}
        </p>
      )}
      {successMessage && (
        <p className="text-green-600 text-xs mb-4" role="status">
          {successMessage}
        </p>
      )}

      {/* --- Form Element --- */}
      <form onSubmit={handleLogin} className="text-left space-y-6">
        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            EMAIL <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email" // * Added autocomplete attribute
            placeholder="Enter your email"
            className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm text-black placeholder:text-gray-500 dark:placeholder:text-gray-400"
            aria-required="true"
            aria-describedby={error ? 'error-message' : undefined}
          />
        </div>

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            PASSWORD <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password" // * Added autocomplete attribute
            placeholder="Enter your password"
            className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm text-black placeholder:text-gray-500 dark:placeholder:text-gray-400"
            aria-required="true"
            aria-describedby={error ? 'error-message' : undefined}
          />
        </div>

        {/* Forgot Password Link */}
        <div className="pt-2">
          <button
            type="button" // * Use button for actions within a form
            onClick={onForgotPasswordClick}
            className="text-xs text-gray-500 uppercase tracking-wider font-semibold hover:text-black transition-colors"
          >
            FORGOT YOUR PASSWORD?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading} // * Disable button when loading
          className="w-full py-4 mt-4 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" // * Added disabled styles
        >
          {loading ? 'SIGNING IN...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default UserLogin;
