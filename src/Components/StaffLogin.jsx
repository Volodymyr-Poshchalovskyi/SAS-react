import React from 'react';

// Google Icon is now part of this component
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const StaffLogin = ({ handleGoogleLogin, loading, error }) => {
  return (
    <div className="max-w-sm mx-auto text-center animate-fadeIn">
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-black mb-2 tracking-wider uppercase">
          WELCOME BACK.
        </h2>
        <p className="text-xs text-gray-500 tracking-wider uppercase leading-relaxed">
          PLEASE SIGN IN USING <br /> YOUR CORPORATE EMAIL
        </p>
      </div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <button
        onClick={handleGoogleLogin}
        type="button"
        disabled={loading}
        className="w-full py-3 mt-4 bg-white text-gray-700 font-semibold text-sm border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {loading ? (
          'PROCESSING...'
        ) : (
          <>
            <GoogleIcon />
            Sign in with Google
          </>
        )}
      </button>
    </div>
  );
};

export default StaffLogin;