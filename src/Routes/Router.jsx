// src/Routes/Router.jsx

import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import UserProtectedRoute from './UserProtectedRoute';

// Layouts
import Layout from '../Components/Layout/Layout';
import AdminLayout from '../AdminComponents/AdminLayout';

// Pages
import Main from '../Pages/Main';
import Login from '../Pages/Login';
import AdminPanel from '../Pages/AdminPanel';
import UserPanel from '../Pages/UserPanel';
// ... (імпорти решти ваших сторінок)
import Assignment from '../Pages/Assignment';
import Directors from '../Pages/Directors';
import DirectorPage from '../Components/DirectorPage';
import Feature from '../Pages/Feature';
import Management from '../Pages/Management';
import Originals from '../Pages/Originals';
import Production from '../Pages/Production';
import Studio from '../Pages/Studio';
import Team from '../Pages/Team';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public and User routes with the main Layout */}
      <Route element={<Layout />}>
        {/* --- Public Routes --- */}
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

      <Route element={<UserProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/userpanel" element={<UserPanel />} />
        </Route>
      </Route>


      {/* Admin routes with the AdminLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/adminpanel" element={<AdminPanel />} />
        </Route>
      </Route>
    </Routes>
  );
}