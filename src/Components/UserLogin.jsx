import React from 'react';

const UserLogin = ({
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  loading,
  error,
  successMessage, // Added prop for success message
  onForgotPasswordClick, // Added prop for handling click
}) => {
  return (
    <div className="max-w-sm mx-auto text-center animate-fadeIn">
      <div className="mb-8 sm:mb-10">
        <h2 className="text-xl font-semibold text-black mb-2 tracking-wider uppercase">
          WELCOME BACK.
        </h2>
        <p className="text-xs text-gray-500 tracking-wider uppercase">
          SIGN IN WITH YOUR EMAIL AND PASSWORD
        </p>
      </div>
      {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
      {successMessage && <p className="text-green-600 text-xs mb-4">{successMessage}</p>}
      <form onSubmit={handleLogin} className="text-left space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            EMAIL
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm text-black placeholder:text-black"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            PASSWORD
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm text-black placeholder:text-black"
          />
        </div>
        <div className="pt-2">
          <button
            type="button" // Changed from <a> to <button> for better semantics
            onClick={onForgotPasswordClick}
            className="text-xs text-gray-500 uppercase tracking-wider font-semibold hover:text-black transition-colors"
          >
            FORGOT YOUR PASSWORD?
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-4 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'SIGNING IN...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default UserLogin;
