import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingScreen } from './components/LoadingScreen';

const MenuPage = lazy(() => import('./pages/MenuPage').then((module) => ({ default: module.MenuPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage').then((module) => ({ default: module.OrderSuccessPage })));

export function App() {
  return (
    <Suspense fallback={<LoadingScreen label="Loading menu..." />}>
      <Routes>
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </Suspense>
  );
}
