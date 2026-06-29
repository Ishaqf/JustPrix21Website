import { Outlet } from 'react-router-dom';

// Bare shell so /admin routing can be verified now — a real admin
// sidebar/nav arrives with the admin dashboard step.
const AdminLayout = () => (
  <div>
    <Outlet />
  </div>
);

export default AdminLayout;
