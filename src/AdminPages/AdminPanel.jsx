import { Outlet } from 'react-router-dom';

function AdminPanel() {
  return (
    <div>
      {/* Вміст дочірніх маршрутів (Dashboard, Library і т.д.) буде відображатися тут */}
      <Outlet />
    </div>
  );
}

export default AdminPanel;
