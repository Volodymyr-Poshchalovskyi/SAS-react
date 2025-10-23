// src/Pages/UpdatePassword.jsx

// ! React & Router Imports
import React, { useState, useEffect } from 'react'; // Added useEffect for potential future use, although not strictly needed now
import { useNavigate } from 'react-router-dom';

// ! Hook Imports
import { useAuth } from '../hooks/useAuth'; // * Custom hook to access Supabase client and auth state

// ! Lucide Icon Imports (Optional for loading/success feedback)
import { Loader2, CheckCircle } from 'lucide-react';

// ========================================================================== //
// ! MAIN COMPONENT: UpdatePassword
// ========================================================================== //

/**
 * ? UpdatePassword Component
 * Allows a user who has followed a password reset link to set a new password.
 * The Supabase AuthProvider handles the session update from the link's access token automatically.
 * This component just needs to call `supabase.auth.updateUser` with the new password.
 */
const UpdatePassword = () => {
  // ! Hooks
  const { supabase, user } = useAuth(); // * Get Supabase client and user state from context
  const navigate = useNavigate(); // * For redirection after update

  // ! State Variables
  const [password, setPassword] = useState(''); // * New password input
  const [confirmPassword, setConfirmPassword] = useState(''); // * Confirm password input
  const [loading, setLoading] = useState(false); // * Tracks submission status
  const [error, setError] = useState(''); // * Stores update error messages
  const [success, setSuccess] = useState(''); // * Stores success message

  // ! Note on Authentication:
  // * When the user arrives at this page via the email link containing `#access_token=...`,
  // * the `AuthProvider`'s `onAuthStateChange` listener (specifically the PASSWORD_RECOVERY event)
  // * should automatically detect this, update the user session, and make the `user` object available.
  // * This component primarily needs to ensure a user session exists before allowing the update.

  // ! Effect: Redirect if no user session is active (optional safety check)
  useEffect(() => {
     // Small delay to allow AuthProvider to potentially establish session from URL hash
    const timer = setTimeout(() => {
        if (!user && !loading) { // Check loading to avoid premature redirect
            console.warn("UpdatePassword: No active user session found, redirecting to login.");
            navigate('/login', { state: { message: 'Invalid or expired password reset link.' } });
        }
    }, 1000); // 1-second delay, adjust if needed

    return () => clearTimeout(timer);
  }, [user, navigate, loading]);

  // ! Event Handlers
  /**
   * ? Handles the form submission for updating the password.
   * Performs validation and calls `supabase.auth.updateUser`.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // * Clear previous errors
    setSuccess(''); // * Clear previous success message

    // * --- Client-Side Validation ---
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    // * --- End Validation ---

    setLoading(true);
    try {
      // * Call Supabase function to update the currently authenticated user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError; // * Throw error if Supabase returns one

      // * Success state
      setSuccess('Your password has been updated successfully!');
      setPassword(''); // Clear fields on success
      setConfirmPassword('');

      // * Redirect to the login page after a short delay, passing a success message
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password updated! Please sign in with your new password.' }
        });
      }, 2000); // * 2-second delay

    } catch (err) {
      console.error("Password update error:", err);
      setError(err.message || 'Failed to update password. Please try again or request a new reset link.');
    } finally {
      setLoading(false); // * Reset loading state
    }
  };

  // ! Render Logic
  return (
    // * Page container
    <div className="min-h-screen flex justify-center bg-gray-100 font-sans p-4 sm:p-8 lg:p-14 mt-[70px]"> {/* Adjust mt based on actual header height */}
      <div className="w-full max-w-sm text-center mt-8 sm:mt-11 xl:mt-16">
        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-semibold text-black mb-8 tracking-wider">
          NEW PASSWORD
        </h1>
        {/* Form Container */}
        <div className="max-w-sm mx-auto text-center animate-fadeIn px-4 py-8 bg-white shadow-md rounded-lg"> {/* Added bg, shadow, rounded */}
          {/* Form Header */}
          <div className="mb-8 sm:mb-10">
            <h2 className="text-xl font-semibold text-black mb-2 tracking-wider uppercase">
              SET A NEW PASSWORD
            </h2>
            <p className="text-xs text-gray-500 tracking-wider uppercase">
              ENTER AND CONFIRM YOUR NEW PASSWORD
            </p>
          </div>

          {/* --- Message Display --- */}
          {error && <p id="form-error" className="text-red-500 text-xs mb-4" role="alert">{error}</p>}
          {success && <p className="text-green-600 text-xs mb-4 flex items-center justify-center gap-2" role="status"><CheckCircle size={16} /> {success}</p>}

          {/* --- Form (Hidden on Success) --- */}
          {!success && (
            <form onSubmit={handleSubmit} className="text-left space-y-6">
              {/* New Password Input */}
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
                >
                  NEW PASSWORD <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password (min. 6 chars)"
                  className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm text-black placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  aria-required="true"
                  aria-describedby={error ? "form-error" : undefined}
                  autoComplete="new-password"
                />
              </div>

              {/* Confirm New Password Input */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
                >
                  CONFIRM PASSWORD <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm text-black placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  aria-required="true"
                  aria-describedby={error ? "form-error" : undefined}
                  autoComplete="new-password"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading} // * Disable while loading
                className="w-full py-4 mt-4 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2" // * Added flex for loader
              >
                {loading && <Loader2 className="animate-spin" size={16} />}
                {loading ? 'SAVING...' : 'Save New Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;