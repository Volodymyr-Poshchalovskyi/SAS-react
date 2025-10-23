// src/Components/RegistrationForm.jsx

// ! React & Router Imports
import React, { useState, useEffect, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ! Library Imports
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css'; // Default styles for library

// ! Local Imports (Hooks & Styles)
import { useAuth } from '../hooks/useAuth';
import './PhoneNumberInput.css'; // Custom styles to override library defaults

// ========================================================================== //
// ! CUSTOM PHONE INPUT COMPONENT
// ========================================================================== //

/**
 * ? CustomPhoneNumberInput
 * A custom input component specifically designed to be used with `react-phone-number-input`.
 * It forwards the ref and applies custom styling. Defined outside the main component
 * to prevent re-creation on every render.
 * Uses `forwardRef` to pass the ref down to the actual input element.
 */
const CustomPhoneNumberInput = forwardRef((props, ref) => {
  return (
    <input
      {...props}
      ref={ref}
      // * Apply custom styles for the input field itself within the phone number component
      className="w-full bg-transparent text-black focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
    />
  );
});
CustomPhoneNumberInput.displayName = 'CustomPhoneNumberInput'; // * Set display name for React DevTools

// ========================================================================== //
// ! MAIN COMPONENT: RegistrationForm
// ========================================================================== //

const RegistrationForm = () => {
  // ! Hooks
  const { user, completeRegistration } = useAuth(); // * Auth context for user info and registration function
  const navigate = useNavigate(); // * For navigating after successful registration

  // ! State Variables
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState(''); // * US State or similar region
  const [email, setEmail] = useState(''); // * Pre-filled from user context if available
  const [phone, setPhone] = useState(); // * State for react-phone-number-input (can be undefined initially)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // * Toggles password visibility
  const [error, setError] = useState(''); // * Stores registration errors
  const [loading, setLoading] = useState(false); // * Tracks submission status

  // ! Effect: Pre-fill email if available from auth context
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]); // * Run when the user object changes

  // ! Event Handlers
  /**
   * ? handleSubmit
   * Handles the form submission: performs validation, calls the registration API,
   * handles errors, and navigates on success.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // * Prevent default form submission
    setError(''); // * Clear previous errors

    // * --- Client-Side Validation ---
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    // * Use library's validation function for phone number
    if (!phone || !isValidPhoneNumber(phone)) {
      setError('Please enter a valid phone number including country code.');
      return;
    }
    // * --- End Validation ---

    setLoading(true); // * Set loading state

    try {
      // * Call the registration function from the auth context
      await completeRegistration({
        password,
        firstName,
        lastName,
        location, // * Maps to location_of_residence in Supabase? Verify schema.
        state, // * Maps to state in Supabase? Verify schema.
        phone,
      });

      // * Navigate to login page on success, passing a success message
      navigate('/login', {
        state: { message: 'Registration successful! Please sign in.' },
      });
      window.location.hash = ''; // * Clear any hash fragments (e.g., from Supabase redirects)
    } catch (err) {
      console.error('Detailed Registration Error:', err); // * Log the full error
      // * Set a user-friendly error message
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false); // * Reset loading state
    }
  };

  // ! Render Logic
  return (
    <div className="max-w-sm mx-auto text-center animate-fadeIn">
      {/* --- Form Header --- */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-black mb-2 tracking-wider uppercase">
          REGISTRATION
        </h2>
        <p className="text-xs text-gray-500 tracking-wider uppercase">
          CREATE YOUR ACCOUNT
        </p>
      </div>

      {/* --- Error Message Display --- */}
      {error && (
        <p id="form-error" className="text-red-500 text-xs mb-4" role="alert">
          {error}
        </p>
      )}

      {/* --- Form Element --- */}
      <form onSubmit={handleSubmit} className="text-left space-y-6">
        {/* First Name */}
        <div>
          <label
            htmlFor="reg-firstname"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            FIRST NAME <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="reg-firstname"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full bg-transparent text-black border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm placeholder:text-gray-500"
            aria-required="true"
            aria-describedby={error ? 'form-error' : undefined}
          />
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="reg-lastname"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            LAST NAME <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="reg-lastname"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full bg-transparent text-black border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm placeholder:text-gray-500"
            aria-required="true"
            aria-describedby={error ? 'form-error' : undefined}
          />
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="reg-location"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            LOCATION OF RESIDENCE <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="reg-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full bg-transparent text-black border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm placeholder:text-gray-500"
            aria-required="true"
            aria-describedby={error ? 'form-error' : undefined}
          />
        </div>

        {/* State/Region */}
        <div>
          <label
            htmlFor="reg-state"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            STATE <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="reg-state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            className="w-full bg-transparent text-black border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm placeholder:text-gray-500"
            aria-required="true"
            aria-describedby={error ? 'form-error' : undefined}
          />
        </div>

        {/* Email (Readonly) */}
        <div>
          <label
            htmlFor="reg-email"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            EMAIL
          </label>
          <input
            type="email"
            id="reg-email"
            value={email}
            readOnly // * Email cannot be changed here
            disabled // * Visually indicate it's not editable
            className="w-full bg-transparent text-gray-500 border-b border-gray-300 focus:outline-none py-2 text-sm cursor-not-allowed" // * Style for disabled field
            aria-describedby={error ? 'form-error' : undefined}
          />
        </div>

        {/* Phone Input */}
        <div>
          <label
            htmlFor="reg-phone"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            PHONE <span className="text-red-500">*</span>
          </label>
          {/* // * react-phone-number-input component */}
          <PhoneInput
            id="reg-phone"
            placeholder="Enter phone number"
            value={phone}
            onChange={setPhone} // * Directly update state
            defaultCountry="US" // * Set default country
            required
            international // * Ensure international format
            withCountryCallingCode // * Display country code
            // * Use the custom input component defined above for styling
            inputComponent={CustomPhoneNumberInput}
            // * Apply custom container styles from PhoneNumberInput.css
            className="phone-input-container"
            aria-required="true"
            aria-describedby={error ? 'form-error' : undefined}
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="reg-password"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            PASSWORD (min. 6 chars) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="reg-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6" // * HTML5 validation
              className="w-full bg-transparent text-black border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm pr-16 placeholder:text-gray-500" // * Padding right for button
              aria-required="true"
              aria-describedby={error ? 'form-error' : undefined}
            />
            {/* // * Show/Hide password button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-xs uppercase text-gray-500 hover:text-black focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="reg-confirm-password"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            CONFIRM PASSWORD <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'} // * Visibility linked to the same state
              id="reg-confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
              className="w-full bg-transparent text-black border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm pr-16 placeholder:text-gray-500"
              aria-required="true"
              aria-describedby={error ? 'form-error' : undefined}
            />
            {/* // * Show/Hide button (also linked to the same state) */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-xs uppercase text-gray-500 hover:text-black focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading} // * Disable while loading
          className="w-full py-4 mt-4 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" // * Added disabled styles
        >
          {loading ? 'CREATING ACCOUNT...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
