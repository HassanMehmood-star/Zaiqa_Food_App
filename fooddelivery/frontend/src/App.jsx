import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import RestaurantListPage from './pages/RestaurantListPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import OrdersPage from './pages/user/OrdersPage';
import OrderTrackingPage from './pages/user/OrderTrackingPage';
import UserDashboardPage from './pages/user/UserDashboardPage';
import ProfilePage from './pages/user/ProfilePage';

import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import MyRestaurantsPage from './pages/owner/MyRestaurantsPage';
import MealManagementPage from './pages/owner/MealManagementPage';
import OwnerOrdersPage from './pages/owner/OwnerOrdersPage';
import UserManagementPage from './pages/owner/UserManagementPage';

// "/" shows the marketing landing page to guests, and each role's
// dashboard once logged in - matches the nav's "Home" link per role.
function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <LandingPage />;
  if (user.role === 'restaurant_owner') return <Navigate to="/owner/dashboard" replace />;
  return <UserDashboardPage />;
}

export default function App() {
  return (
    <MainLayout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomeRoute />} />
        <Route path="/restaurants" element={<RestaurantListPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Regular user */}
        <Route path="/cart" element={
          <ProtectedRoute roles={['regular_user']}><CartPage /></ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute roles={['regular_user']}><CheckoutPage /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute roles={['regular_user']}><OrdersPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />

        {/* Shared between user & owner (access enforced by API + component logic) */}
        <Route path="/orders/:id" element={
          <ProtectedRoute><OrderTrackingPage /></ProtectedRoute>
        } />

        {/* Restaurant owner */}
        <Route path="/owner/dashboard" element={
          <ProtectedRoute roles={['restaurant_owner']}><OwnerDashboardPage /></ProtectedRoute>
        } />
        <Route path="/owner/restaurants" element={
          <ProtectedRoute roles={['restaurant_owner']}><MyRestaurantsPage /></ProtectedRoute>
        } />
        <Route path="/owner/meals" element={
          <ProtectedRoute roles={['restaurant_owner']}><MealManagementPage /></ProtectedRoute>
        } />
        <Route path="/owner/orders" element={
          <ProtectedRoute roles={['restaurant_owner']}><OwnerOrdersPage /></ProtectedRoute>
        } />
        <Route path="/owner/users" element={
          <ProtectedRoute roles={['restaurant_owner']}><UserManagementPage /></ProtectedRoute>
        } />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
}
