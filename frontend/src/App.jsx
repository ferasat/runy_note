import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import NotesPage from './pages/NotesPage.jsx';
import TopBar from './components/TopBar.jsx';
import useEitaaSDK from './hooks/useEitaaSDK.js';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  const { token } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
  }, []);

  useEitaaSDK({
    onThemeChange: (scheme) => {
      document.body.dataset.theme = scheme;
    },
    onViewportChange: () => {}
  });

  return (
    <div className="min-h-screen bg-surface text-slate-900 dark:text-slate-100 transition-colors">
      {token && <TopBar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <NotesPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={token ? '/notes' : '/login'} replace />} />
      </Routes>
    </div>
  );
}
