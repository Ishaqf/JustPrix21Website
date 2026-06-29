import { Outlet } from 'react-router-dom';

// Bare shell so routing can be verified now — the real Navbar/Footer
// (Step 16) slot in here around the same <Outlet />.
const MainLayout = () => (
  <div>
    <Outlet />
  </div>
);

export default MainLayout;
