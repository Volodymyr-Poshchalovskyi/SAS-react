import { Routes, Route } from 'react-router-dom';

// Layouts
import Layout from '../Components/Layout/Layout.jsx';
import AdminLayout from '../AdminComponents/Layout/AdminLayout.jsx';

// Public Pages
import Main from '../Pages/Main.jsx';
import Login from '../Pages/Login.jsx';
import Assignment from '../Pages/Assignment.jsx';
import Directors from '../Pages/Directors.jsx';
import DirectorPage from '../Components/DirectorPage.jsx';
import Feature from '../Pages/Feature.jsx';
import Management from '../Pages/Management.jsx';
import Originals from '../Pages/Originals.jsx';
import Production from '../Pages/Production.jsx';
import Team from '../Pages/Team.jsx';
import PrivacyPolicyPage from '../Pages/PrivacyPolicy.jsx';
import PublicReelPage from '../Pages/PublicReelPage.jsx';
import ProjectPage from '../Pages/ProjectPage.jsx';
// + НОВІ СТОРІНКИ
import TableTopStudio from '../Pages/TableTopStudio.jsx';
import PostProduction from '../Pages/PostProduction.jsx';


// Admin Pages
import AdminPanel from '../AdminPages/AdminPanel.jsx';
import UserPanel from '../AdminPages/UserPanel.jsx';
import Dashboard from '../AdminComponents/Layout/Dashboard.jsx';
import CreateReel from '../AdminComponents/Layout/CreateReel.jsx';
import Library from '../AdminComponents/Layout/Library.jsx';
import MyAnalytic from '../AdminComponents/Layout/MyAnalytic.jsx';
import ManagementPage from '../AdminComponents/Layout/Management.jsx';
import ApplicationsForAdmin from '../AdminComponents/ApplicationsForAdmin.jsx';
import UserManagement from '../AdminComponents/UserManagement.jsx';
import MetaDataManagement from '../AdminComponents/Layout/MetaDataManagement.jsx';

// Auth & Utility Pages
import AuthCallback from '../Pages/AuthCallback.jsx';
import Logout from '../Pages/Logout.jsx';

// Route Guards
import ProtectedRoute from './ProtectedRoute.jsx';
import AdminRoute from './AdminRoute.jsx';

export default function AppRouter() {
  return (
    <Routes>
      {/* Auth callback and logout routes */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/logout" element={<Logout />} />

      {/* Public Routes with main site layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Main />} />
        <Route path="/reel/:reelId" element={<PublicReelPage />} />
        <Route path="/assignment" element={<Assignment />} />
        <Route path="/directors" element={<Directors />} />
        <Route path="/directors/:directorSlug" element={<DirectorPage />} />
        <Route path="/projects/:projectSlug" element={<ProjectPage />} />
        <Route path="/feature" element={<Feature />} />
        <Route path="/management" element={<Management />} />
        <Route path="/originals" element={<Originals />} />
        <Route path="/production" element={<Production />} />
        <Route path="/about" element={<Team />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

        {/* ++ ДОДАНО НОВІ МАРШРУТИ ++ */}
        <Route path="/table-top-studio" element={<TableTopStudio />} />
        <Route path="/post-production" element={<PostProduction />} />
      </Route>

      {/* Protected Routes (require authentication) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* User panel routes for authenticated users */}
          <Route path="/userpanel" element={<UserPanel />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="upload-media" element={<CreateReel />} />
            <Route path="upload-media/:itemId" element={<CreateReel />} />
            <Route path="library" element={<Library />} />
            <Route path="management" element={<ManagementPage />} />
            <Route path="analytics" element={<MyAnalytic />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<AdminRoute />}>
            <Route path="/adminpanel" element={<AdminPanel />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="upload-media" element={<CreateReel />} />
              <Route path="upload-media/:itemId" element={<CreateReel />} />
              <Route path="library" element={<Library />} />
              <Route path="management" element={<ManagementPage />} />
              <Route path="analytics" element={<MyAnalytic />} />
              <Route path="metadata-management" element={<MetaDataManagement />} />
              <Route path="applications" element={<ApplicationsForAdmin />} />
              <Route path="user-management" element={<UserManagement />} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}