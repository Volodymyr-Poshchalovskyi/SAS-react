import { Outlet } from 'react-router-dom';

function UserPanel() {
    return (
        <div>
            {/* Вміст дочірніх маршрутів (Dashboard, Library і т.д.) буде відображатися тут */}
            <Outlet />
        </div>
    );
}

export default UserPanel;
