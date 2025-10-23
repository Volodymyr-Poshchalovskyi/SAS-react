// src/Routes/Router.jsx

// ! React & Router Imports
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// ! Layout Components
import Layout from '../Components/Layout/Layout.jsx'; // * Main public site layout
import AdminLayout from '../AdminComponents/Layout/AdminLayout.jsx'; // * Layout for admin/user panels

// ! Public Page Components
import Main from '../Pages/Main.jsx';
import Login from '../Pages/Login.jsx';
import Assignment from '../Pages/Assignment.jsx';
import Directors from '../Pages/Directors.jsx';
import DirectorPage from '../Components/DirectorPage.jsx'; // * Reusable page for Director/Assignment/Post/TableTop details
import Photographers from '../Pages/Photographers.jsx';
import PhotographerPage from '../Components/PhotographerPage.jsx';
import Feature from '../Pages/Feature.jsx';
import Production from '../Pages/Production.jsx'; // * Used for 'Service' route
import Team from '../Pages/Team.jsx'; // * Used for 'About' route
import PrivacyPolicyPage from '../Pages/PrivacyPolicy.jsx';
import PublicReelPage from '../Pages/PublicReelPage.jsx';
import ProjectPage from '../Pages/ProjectPage.jsx'; // * For Production/TableTop project details
import TableTopStudio from '../Pages/TableTopStudio.jsx';
import PostProduction from '../Pages/PostProduction.jsx';
import UpdatePassword from '../Pages/UpdatePassword.jsx';

// ! Admin/User Panel Page Components
import AdminPanel from '../AdminPages/AdminPanel.jsx'; // * Wrapper for admin routes
import UserPanel from '../AdminPages/UserPanel.jsx'; // * Wrapper for user routes
import Dashboard from '../AdminComponents/Layout/Dashboard.jsx';
import CreateReel from '../AdminComponents/Layout/CreateReel.jsx'; // * Used for both upload and edit
import Library from '../AdminComponents/Layout/Library.jsx';
import MyAnalytic from '../AdminComponents/Layout/MyAnalytic.jsx';
import ManagementPage from '../AdminComponents/Layout/Management.jsx'; // * Artist/Client/Celebrity management
import ApplicationsForAdmin from '../AdminComponents/ApplicationsForAdmin.jsx';
import UserManagement from '../AdminComponents/UserManagement.jsx';
import MetaDataManagement from '../AdminComponents/Layout/MetaDataManagement.jsx';
import FeatureManagement from '../AdminComponents/FeatureManagement.jsx'; // * PDF/Password management

// ! Auth & Utility Page Components
import AuthCallback from '../Pages/AuthCallback.jsx'; // * Handles OAuth redirects
import Logout from '../Pages/Logout.jsx';

// ! Route Guard Components
import ProtectedRoute from './ProtectedRoute.jsx'; // * Requires authentication
import AdminRoute from './AdminRoute.jsx'; // * Requires admin privileges

// ========================================================================== //
// ! MAIN ROUTER CONFIGURATION
// ========================================================================== //

export default function AppRouter() {
  return (
    <Routes>
      {/* // ! SECTION: Standalone Auth Routes (No Layout) */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/logout" element={<Logout />} />
      {/* // ! SECTION: Public Routes (Using Main Site Layout) */}
      <Route element={<Layout />}>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

        {/* Reel */}
        <Route path="/reel/:reelId" element={<PublicReelPage />} />

        {/* Directors */}
        <Route path="/directors" element={<Directors />} />
        <Route path="/directors/:directorSlug" element={<DirectorPage />} />

        {/* Photographers */}
        <Route path="/photographers" element={<Photographers />} />
        <Route
          path="/photographers/:photographerSlug"
          element={<PhotographerPage />}
        />

        {/* Assignment */}
        <Route path="/assignment" element={<Assignment />} />
        <Route path="/assignment/:directorSlug" element={<DirectorPage />} />

        {/* Service (Uses Production component) */}
        <Route path="/service" element={<Production />} />

        {/* Project Detail Page (Used by Production/TableTop) */}
        <Route path="/projects/:projectSlug" element={<ProjectPage />} />

        {/* Feature */}
        <Route path="/feature" element={<Feature />} />

        {/* Post Production */}
        <Route path="/post-production" element={<PostProduction />} />
        <Route
          path="/post-production/:directorSlug"
          element={<DirectorPage />}
        />

        {/* Table Top Studio */}
        <Route path="/table-top-studio" element={<TableTopStudio />} />
        <Route
          path="/table-top-studio/:directorSlug"
          element={<DirectorPage />}
        />

        {/* About (Uses Team component) */}
        <Route path="/about" element={<Team />} />

       
      </Route>
      {/* // ! SECTION: Protected Routes (Require Authentication, Use Admin Layout) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* --- User Panel Routes (Accessible to all authenticated users) --- */}
          <Route path="/userpanel" element={<UserPanel />}>
            {/* // * Index route defaults to Dashboard */}
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="upload-media" element={<CreateReel />} />
            <Route path="upload-media/:itemId" element={<CreateReel />} />{' '}
            {/* // * Edit route */}
            <Route path="library" element={<Library />} />
            <Route path="management" element={<ManagementPage />} />
            <Route path="analytics" element={<MyAnalytic />} />
            {/* // ? Add other user-specific routes here */}
          </Route>

          {/* --- Admin Panel Routes (Requires Admin privileges via AdminRoute guard) --- */}
          <Route element={<AdminRoute />}>
            <Route path="/adminpanel" element={<AdminPanel />}>
              {/* // * Shared routes (same components as user panel but under /adminpanel) */}
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="upload-media" element={<CreateReel />} />
              <Route path="upload-media/:itemId" element={<CreateReel />} />
              <Route path="library" element={<Library />} />
              <Route path="management" element={<ManagementPage />} />
              <Route path="analytics" element={<MyAnalytic />} />

              {/* // * Admin-specific routes */}
              <Route path="feature" element={<FeatureManagement />} />
              <Route
                path="metadata-management"
                element={<MetaDataManagement />}
              />
              <Route path="applications" element={<ApplicationsForAdmin />} />
              <Route path="user-management" element={<UserManagement />} />
            </Route>
          </Route>
        </Route>{' '}
        {/* End AdminLayout */}
      </Route>{' '}
      {/* End ProtectedRoute */}
      {/* // ! SECTION: Catch-all Route (Optional: 404 Page) */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}
