import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LoadsPage from './pages/LoadsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import DriverLoadsPage from './pages/DriverLoadsPage';
import LoadDetailsPage from './pages/LoadDetailsPage';
import CallbackPage from './pages/CallbackPage';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('App render:', { isAuthenticated, isLoading, user });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Route based on user role
  const isDriver = user?.role === 'driver';

  if (isDriver) {
    return (
      <Routes>
        <Route path="/driver/loads" element={<DriverLoadsPage />} />
        <Route path="/driver/loads/:id" element={<LoadDetailsPage />} />
        <Route path="*" element={<Navigate to="/driver/loads" replace />} />
      </Routes>
    );
  }

  // Admin/Co-admin routes
  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/loads" element={<LoadsPage />} />
        <Route path="/loads/:id" element={<LoadDetailsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
