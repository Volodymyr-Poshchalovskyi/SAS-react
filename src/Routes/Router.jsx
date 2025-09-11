import { Routes, Route } from 'react-router-dom';

import Layout from '../Components/Layout/Layout';
import AdminLayout from '../AdminComponents/Layout/AdminLayout';

import Main from '../Pages/Main';
import Login from '../Pages/Login';
import AdminPanel from '../AdminPages/AdminPanel';
import UserPanel from '../AdminPages/UserPanel';
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

      <Route element={<AdminLayout />}>
        <Route path="/userpanel" element={<UserPanel />} />
        <Route path="/adminpanel" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}
