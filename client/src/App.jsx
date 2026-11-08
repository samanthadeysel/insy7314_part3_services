import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { getSavedUser, clearAuth } from './services/api';
import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const activeUser = getSavedUser();
    if (activeUser) {
      setUser(activeUser);
    }
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    navigate('/login');
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    navigate('/dashboard');
  };

  return (
    <div>
      <header className="app-header">
        <span className="app-brand">HustleHub+</span>
        {user ? (
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        ) : (
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
              Login
            </Link>
            <Link to="/register" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
              Register
            </Link>
          </nav>
        )}
      </header>

      <main style={{ padding: '1.5rem', flex: 1 }}>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <LoginForm onLogin={handleLoginSuccess} />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" replace /> : <RegisterForm onRegisterSuccess={() => navigate('/login')} />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="*"
            element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;