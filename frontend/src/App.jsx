import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { PageSkeleton } from './components/common/Skeleton';

const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/shop/ShopPage'));
const ProductDetailsPage = lazy(() => import('./pages/shop/ProductDetailsPage'));

function Lazy({ children }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          index
          element={
            <Lazy>
              <HomePage />
            </Lazy>
          }
        />
        <Route
          path="shop"
          element={
            <Lazy>
              <ShopPage />
            </Lazy>
          }
        />
        <Route
          path="product/:slug"
          element={
            <Lazy>
              <ProductDetailsPage />
            </Lazy>
          }
        />
        <Route
          path="*"
          element={
            <Lazy>
              <ShopPage />
            </Lazy>
          }
        />
      </Route>
    </Routes>
  );
}
