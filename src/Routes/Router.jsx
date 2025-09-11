import { Routes, Route } from 'react-router-dom';

import Layout from '../Components/Layout/Layout.jsx';
import AdminLayout from '../AdminComponents/Layout/AdminLayout.jsx';

// Основні сторінки
import Main from '../Pages/Main.jsx';
import Login from '../Pages/Login.jsx';
import Assignment from '../Pages/Assignment.jsx';
import Directors from '../Pages/Directors.jsx';
import DirectorPage from '../Components/DirectorPage.jsx';
import Feature from '../Pages/Feature.jsx';
import Management from '../Pages/Management.jsx';
import Originals from '../Pages/Originals.jsx';
import Production from '../Pages/Production.jsx';
import Studio from '../Pages/Studio.jsx';
import Team from '../Pages/Team.jsx';

// Сторінки адмін-панелі
import AdminPanel from '../AdminPages/AdminPanel.jsx';
import UserPanel from '../AdminPages/UserPanel.jsx';

// Компоненти для вкладених маршрутів
import Dashboard from '../AdminComponents/Layout/Dashboard.jsx';
import CreateReel from '../AdminComponents/Layout/CreateReel.jsx';
import Library from '../AdminComponents/Layout/Library.jsx';
import MyAnalytic from '../AdminComponents/Layout/MyAnalytic.jsx';
import ApplicationsForAdmin from '../AdminComponents/ApplicationsForAdmin.jsx';
import UserManagement from '../AdminComponents/UserManagement.jsx';

export default function AppRouter() {
  return (
    <Routes>
      {/* Маршрути для звичайних користувачів */}
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

      {/* Маршрути для User/Admin панелей */}
      <Route element={<AdminLayout />}>
        {/* Вкладені маршрути для User Panel */}
        <Route path="/userpanel" element={<UserPanel />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-reel" element={<CreateReel />} />
          <Route path="library" element={<Library />} />
          <Route path="my-analytic" element={<MyAnalytic />} />
        </Route>

        {/* Вкладені маршрути для Admin Panel */}
        <Route path="/adminpanel" element={<AdminPanel />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-reel" element={<CreateReel />} />
          <Route path="library" element={<Library />} />
          <Route path="my-analytic" element={<MyAnalytic />} />
          <Route path="applications" element={<ApplicationsForAdmin />} />
          <Route path="user-management" element={<UserManagement />} />
        </Route>
      </Route>
    </Routes>
  );
}

