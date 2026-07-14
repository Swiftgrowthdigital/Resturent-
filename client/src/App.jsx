import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { LoadingScreen } from './components/LoadingScreen';

const MenuPage = lazy(() => import('./pages/MenuPage').then((module) => ({ default: module.MenuPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage').then((module) => ({ default: module.OrderSuccessPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));
const ServerDownPage = lazy(() => import('./pages/ServerDownPage').then((module) => ({ default: module.ServerDownPage })));

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const showServerDown = () => {
      if (location.pathname !== '/server-down') navigate('/server-down');
    };
    window.addEventListener('restaurant:server-down', showServerDown);
    return () => window.removeEventListener('restaurant:server-down', showServerDown);
  }, [location.pathname, navigate]);

  return (
    <Suspense fallback={<LoadingScreen label="Loading menu..." />}>
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/server-down" element={<ServerDownPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
