// ... /src/Components/ForgotPassword.jsx

import React from 'react';

const ForgotPassword = ({
  email,
  setEmail,
  handlePasswordReset,
  loading,
  error,
  successMessage, // ◄◄◄ ДОДАЙТЕ ЦЕЙ ПРОП
  onBackToLogin,
}) => {
  return (
    <div className="max-w-sm mx-auto text-center animate-fadeIn">
      <div className="mb-8 sm:mb-10">
        <h2 className="text-xl font-semibold text-black mb-2 tracking-wider uppercase">
          RESET PASSWORD
        </h2>
        {/* ▼▼▼ ЛОГІКА РЕНДЕРУ ПІДЗАГОЛОВКА ▼▼▼ */}
        {!successMessage && (
          <p className="text-xs text-gray-500 tracking-wider uppercase">
            ENTER YOUR EMAIL TO RECEIVE A RESET LINK
          </p>
        )}
      </div>

      {/* ▼▼▼ БЛОКИ ПОВІДОМЛЕНЬ ▼▼▼ */}
      {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
      {successMessage && <p className="text-green-600 text-xs mb-4">{successMessage}</p>}

      {/* ▼▼▼ ХОВАЄМО ФОРМУ ПРИ УСПІХУ ▼▼▼ */}
      {!successMessage && (
        <form onSubmit={handlePasswordReset} className="text-left space-y-6">
          <div>
            <label
              htmlFor="reset-email"
              className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
            >
              EMAIL
            </label>
            <input
              type="email"
              id="reset-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm text-black placeholder:text-black"
            />
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-xs text-gray-500 uppercase tracking-wider font-semibold hover:text-black transition-colors"
            >
              BACK TO SIGN IN
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'SENDING...' : 'Send Reset Link'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;