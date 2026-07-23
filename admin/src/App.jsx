import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/products/ProductsPage'));
const ProductFormPage = lazy(() => import('./pages/products/ProductFormPage'));
const CategoriesPage = lazy(() => import('./pages/categories/CategoriesPage'));
const BrandsPage = lazy(() => import('./pages/brands/BrandsPage'));
const OrdersPage = lazy(() => import('./pages/orders/OrdersPage'));
const UsersPage = lazy(() => import('./pages/users/UsersPage'));
const CouponsPage = lazy(() => import('./pages/coupons/CouponsPage'));
const BannersPage = lazy(() => import('./pages/banners/BannersPage'));
const ReviewsPage = lazy(() => import('./pages/reviews/ReviewsPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));

const Fall = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<Fall />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id" element={<ProductFormPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="banners" element={<BannersPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
