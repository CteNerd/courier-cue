import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './hooks/useUser';
import { PublicNavigation } from './components/PublicNavigation';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import CallbackPage from './pages/CallbackPage';
import DashboardPage from './pages/DashboardPage';
import LoadsPage from './pages/LoadsPage';
import DriverLoadsPage from './pages/DriverLoadsPage';
import LoadDetailsPage from './pages/LoadDetailsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import TrailersPage from './pages/TrailersPage';
import DocksPage from './pages/DocksPage';
import DockYardsPage from './pages/DockYardsPage';

function App() {
  console.log('App rendering...');
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return (
      <>
        <PublicNavigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
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
      <Route path="/trailers" element={<TrailersPage />} />
      <Route path="/docks" element={<DocksPage />} />
      <Route path="/dockyards" element={<DockYardsPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
