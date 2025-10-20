import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Ваш хук

const UpdatePassword = () => {
  const { supabase } = useAuth(); // Отримуємо supabase з нашого AuthProvider
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Примітка: Коли користувач заходить на цю сторінку з
  // email-посиланням (#access_token=...), AuthProvider
  // автоматично виявить це і оновить сесію.
  // Нам залишається лише викликати updateUser.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccess('Your password has been updated successfully!');
      
      // Відправляємо користувача на логін через 2 секунди
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password updated! Please sign in.' } 
        });
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-100 font-sans p-4 sm:p-8 lg:p-14 mt-[70px]">
      <div className="w-full max-w-sm text-center mt-8 sm:mt-11 xl:mt-16">
        <h1 className="text-3xl md:text-4xl font-semibold text-black mb-8 tracking-wider">
          NEW PASSWORD
        </h1>
        <div className="max-w-sm mx-auto text-center animate-fadeIn px-4 py-8">
          <div className="mb-8 sm:mb-10">
            <h2 className="text-xl font-semibold text-black mb-2 tracking-wider uppercase">
              SET A NEW PASSWORD
            </h2>
            <p className="text-xs text-gray-500 tracking-wider uppercase">
              ENTER AND CONFIRM YOUR NEW PASSWORD
            </p>
          </div>

          {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
          {success && <p className="text-green-600 text-xs mb-4">{success}</p>}

          {!success && (
            <form onSubmit={handleSubmit} className="text-left space-y-6">
              {/* New Password */}
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
                >
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  id="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm text-black placeholder:text-black"
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
                >
                  CONFIRM PASSWORD
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm text-black placeholder:text-black"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
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