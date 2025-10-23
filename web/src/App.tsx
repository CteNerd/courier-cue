import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './hooks/useUser';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LoadsPage from './pages/LoadsPage';
import DriverLoadsPage from './pages/DriverLoadsPage';
import LoadDetailsPage from './pages/LoadDetailsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  console.log('App rendering...');
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/loads" element={<LoadsPage />} />
      <Route path="/loads/:id" element={<LoadDetailsPage />} />
      <Route path="/driver/loads" element={<DriverLoadsPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
