import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api';
import StatusMessage from './StatusMessage';

function RegisterForm({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'client'
  });
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setIsError(false);

    if (!formData.fullName || !formData.email || !formData.password) {
      setIsError(true);
      setStatus('All fields are required.');
      return;
    }

    if (formData.password.length < 8) {
      setIsError(true);
      setStatus('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setStatus('Registration successful! Redirecting to login...');
      setTimeout(() => {
        if (onRegisterSuccess) onRegisterSuccess();
      }, 1200);
    } catch (error) {
      setIsError(true);
      setStatus(error.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Jane Doe"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password (8+ chars)</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Account Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="client">Client (Hire Services)</option>
            <option value="freelancer">Freelancer (Offer Gigs)</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <StatusMessage message={status} type={isError ? 'error' : 'info'} />

      <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '1.25rem', color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Log in
        </Link>
      </p>
    </div>
  );
}

export default RegisterForm;