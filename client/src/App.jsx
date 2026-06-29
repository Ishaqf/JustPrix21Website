import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import WhatsAppButton from './components/common/WhatsAppButton';
import Home from './pages/Home';
import Login from './pages/Login';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import AffaireDetail from './pages/AffaireDetail';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/Dashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'shop', element: <Shop /> },
      { path: 'products/:slug', element: <ProductDetail /> },
      { path: 'affaires/:id', element: <AffaireDetail /> },
      {
        element: <ProtectedRoute />,
        children: [
          // Private customer routes (cart, checkout, orders, profile,
          // wishlist) mount here starting Step 19/20.
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [{ index: true, element: <AdminDashboard /> }],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

const App = () => (
  <>
    <RouterProvider router={router} />
    <WhatsAppButton />
  </>
);

export default App;
