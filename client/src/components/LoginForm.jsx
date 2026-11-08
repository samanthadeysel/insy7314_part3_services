import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest, saveAuth } from '../services/api';
import StatusMessage from './StatusMessage';

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');
    setIsError(false);

    if (!email || !password) {
      setIsError(true);
      setStatus('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      saveAuth(data.token, data.user);
      onLogin(data.user);
    } catch (error) {
      setIsError(true);
      setStatus(error.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Welcome Back</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <StatusMessage message={status} type={isError ? 'error' : 'info'} />

      <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '1.25rem', color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Register here
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;