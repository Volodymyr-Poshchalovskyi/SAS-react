// src/main.jsx

// ! React Imports
import { StrictMode } from 'react'; // * For development checks
import { createRoot } from 'react-dom/client'; // * For rendering the React app

// ! Router Imports
import { BrowserRouter } from 'react-router-dom'; // * Provides routing capabilities

// ! Context Imports
import AuthProvider from './context/AuthContext'; // * Provides authentication state and functions

// ! Main App Component & Styles
import App from './App.jsx';
import './index.css'; // * Global styles

// ========================================================================== //
// ! APPLICATION ENTRY POINT
// ========================================================================== //

/**
 * ? Application Root
 * This is the main entry point where the React application is initialized and rendered into the DOM.
 *
 * It sets up the core providers:
 * - `StrictMode`: Enables checks for potential problems in the app during development.
 * - `BrowserRouter`: Enables client-side routing using React Router.
 * - `AuthProvider`: Provides authentication context (user, session, login/logout functions) to the entire application tree.
 *
 * Finally, it renders the main `App` component, which contains the application's structure and routing logic.
 */
createRoot(document.getElementById('root')).render(
  // * StrictMode helps identify potential problems in an application. It activates additional checks and warnings for its descendants.
  <StrictMode>
    {/* // * BrowserRouter provides the routing context necessary for React Router to function. */}
    <BrowserRouter>
      {/* // * AuthProvider wraps the application to provide authentication state and methods. */}
      <AuthProvider>
        {/* // * App component contains the main application structure, including layouts and routes. */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);