import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import WhatsAppButton from './components/common/WhatsAppButton';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import AffaireDetail from './pages/AffaireDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderDetail from './pages/OrderDetail';
import OrderHistory from './pages/OrderHistory';
import TrackOrder from './pages/TrackOrder';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/Dashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password/:token', element: <ResetPassword /> },
      { path: 'shop', element: <Shop /> },
      { path: 'products/:slug', element: <ProductDetail /> },
      { path: 'affaires/:id', element: <AffaireDetail /> },
      { path: 'cart', element: <Cart /> },
      { path: 'suivi-commande', element: <TrackOrder /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'checkout', element: <Checkout /> },
          { path: 'orders', element: <OrderHistory /> },
          { path: 'orders/:id', element: <OrderDetail /> },
          { path: 'profile', element: <Profile /> },
          { path: 'wishlist', element: <Wishlist /> },
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
