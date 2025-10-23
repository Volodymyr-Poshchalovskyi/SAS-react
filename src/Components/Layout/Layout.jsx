// src/Components/Layout/Layout.jsx

// ! React & Router Imports
import React, { useRef, useState, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

// ! Local Component Imports
import Header from './Header';
import Footer from './Footer';

// ========================================================================== //
// ! LAYOUT COMPONENT DEFINITION
// ========================================================================== //

/**
 * ? Layout Component
 * Provides the main structure for the application, including the Header,
 * the main content area (rendered via <Outlet />), and the Footer.
 * It dynamically measures the Header's height to potentially pass it down
 * to child routes via Outlet context, allowing them to adjust their layout.
 */
export default function Layout() {
  // ! Hooks
  const location = useLocation(); // * Get current URL location
  const headerRef = useRef(null); // * Ref to access the Header DOM element

  // ! State
  // * State to store the measured height of the header. Initialized to null.
  const [headerHeight, setHeaderHeight] = useState(null);

  // ! Derived State
  // * Determine if the Footer should be hidden (e.g., on the homepage)
  const shouldHideFooter = location.pathname === '/';

  // ! Effect: Measure Header Height
  // * `useLayoutEffect` runs synchronously after DOM mutations but before paint.
  // * This is preferred for measurements that affect layout to avoid visual flicker.
  useLayoutEffect(() => {
    const headerElement = headerRef.current;
    if (!headerElement) return; // * Exit if header ref is not yet available

    // * Create a ResizeObserver to monitor changes in the header's dimensions.
    const resizeObserver = new ResizeObserver((entries) => {
      // * Typically, there's only one entry, but loop for robustness.
      for (let entry of entries) {
        const { height } = entry.contentRect; // * Get the actual rendered height
        // * Update state only if the height has actually changed to prevent unnecessary re-renders.
        setHeaderHeight((prevHeight) =>
          prevHeight !== height ? height : prevHeight
        );
      }
    });

    // * Start observing the header element.
    resizeObserver.observe(headerElement);

    // * Cleanup function: Disconnect the observer when the component unmounts
    // * or before the effect runs again (though it only runs once here).
    return () => {
      resizeObserver.disconnect();
    };
  }, []); // * Empty dependency array ensures the effect runs only once on mount.

  // ! Render Logic
  return (
    // * Main container div ensuring full height and flex column layout
    <div className="min-h-full bg-white text-black flex flex-col">
      {/* // * Render the Header component and pass the ref */}
      <Header ref={headerRef} />

      {/* // * Main content area that grows to fill available space */}
      <main className="flex-grow">
        {/* // * Renders the matched child route component.
            // * Passes the measured headerHeight down via context.
            // * Child components can access this using `useOutletContext()`.
            // * They might show a loading state or use a fallback if headerHeight is null initially.
        */}
        <Outlet context={{ headerHeight }} />
      </main>

      {/* // * Conditionally render the Footer (hidden on homepage) */}
      {!shouldHideFooter && <Footer />}
    </div>
  );
}
