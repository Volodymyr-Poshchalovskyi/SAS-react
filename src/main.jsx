// src/main.jsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import App from './App.jsx';
import './index.css';

/**
 * Entry point of the application.
 * - Wraps the app in React StrictMode for highlighting potential problems.
 * - Provides routing context via BrowserRouter.
 * - Provides authentication context via AuthProvider.
 * - Renders the main App component.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Enables client-side routing */}
    <BrowserRouter>
      {/* Provides authentication context to the entire app */}
      <AuthProvider>
        {/* Main application component */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
