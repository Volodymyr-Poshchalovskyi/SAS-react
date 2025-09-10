import { Routes, Route } from 'react-router-dom';

// Import Layouts
import Layout from '../Components/Layout/Layout';
import AdminLayout from '../AdminComponents/AdminLayout';

// Import all your page components
import Assignment from '../Pages/Assignment';
import Directors from '../Pages/Directors';
import DirectorPage from '../Components/DirectorPage';
import Feature from '../Pages/Feature';
import Main from '../Pages/Main';
import Management from '../Pages/Management';
import Originals from '../Pages/Originals';
import Production from '../Pages/Production';
import Studio from '../Pages/Studio';
import Team from '../Pages/Team';
import Login from '../Pages/Login';
import AdminPanel from '../Pages/AdminPanel';
import UserPanel from '../Pages/UserPanel';

/**
 * Defines the application's routing structure.
 * It uses nested routes to apply different layouts to different sections of the app.
 * - Public-facing pages are wrapped in the main `Layout`.
 * - Admin pages are wrapped in the `AdminLayout`.
 */
export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes that use the main Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Main />} />
        <Route path="/assignment" element={<Assignment />} />
        <Route path="/directors" element={<Directors />} />
        <Route path="/directors/:directorSlug" element={<DirectorPage />} />
        <Route path="/feature" element={<Feature />} />
        <Route path="/management" element={<Management />} />
        <Route path="/originals" element={<Originals />} />
        <Route path="/production" element={<Production />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/team" element={<Team />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Admin routes that use the AdminLayout */}
      <Route element={<AdminLayout />}>
        <Route path="/adminpanel" element={<AdminPanel />} />
        <Route path="/userpanel" element={<UserPanel />} />
      </Route>
    </Routes>
  );
}

