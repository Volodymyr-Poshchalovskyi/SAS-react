import React, { useState } from 'react';

const RegistrationForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Наразі просто логуємо дані, оскільки логіка не потрібна
    console.log({
      firstName,
      lastName,
      location,
      state,
      email,
      phone,
      password,
    });

    // Імітація запиту на сервер
    setTimeout(() => {
      setLoading(false);
      // Тут можна буде додати логіку обробки успішної реєстрації або помилки
    }, 1500);
  };

  return (
    <div className="max-w-sm mx-auto text-center animate-fadeIn">
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-black mb-2 tracking-wider uppercase">
          REGISTRATION
        </h2>
        <p className="text-xs text-gray-500 tracking-wider uppercase">
          CREATE YOUR ACCOUNT
        </p>
      </div>
      {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="text-left space-y-6">
        <div>
          <label
            htmlFor="reg-firstname"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            FIRST NAME
          </label>
          <input
            type="text"
            id="reg-firstname"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="reg-lastname"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            LAST NAME
          </label>
          <input
            type="text"
            id="reg-lastname"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="reg-location"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            LOCATION OF RESIDENCE
          </label>
          <input
            type="text"
            id="reg-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="reg-state"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            STATE
          </label>
          <input
            type="text"
            id="reg-state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm"
          />
        </div>
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
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="reg-phone"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            PHONE
          </label>
          <input
            type="tel"
            id="reg-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="reg-password"
            className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
          >
            PASSWORD
          </label>
          <input
            type="password"
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-4 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'CREATING ACCOUNT...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;

