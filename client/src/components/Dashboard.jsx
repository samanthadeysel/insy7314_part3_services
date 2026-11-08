import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import GigList from './GigList';
import GigForm from './GigForm';
import StatusMessage from './StatusMessage';
import TaxDashboard from './TaxDashboard';

function Dashboard({ user }) {
  const [gigs, setGigs] = useState([]);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'create' | 'tax'
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);

  const loadDashboardData = async () => {
    try {
      setStatus('');
      setIsError(false);
      const gigRes = await apiRequest('/api/gigs');
      setGigs(gigRes.data || []);
    } catch (error) {
      setIsError(true);
      setStatus(error.message || 'Error loading marketplace gigs.');
    }
  };

  const handleBookGig = async (gig) => {
    try {
      setStatus(`Booking gig: "${gig.title}"...`);
      setIsError(false);

      await apiRequest('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          gigId: gig._id,
          scheduledDate: new Date(Date.now() + 86400000).toISOString(),
          notes: 'Standard client booking request'
        })
      });

      setStatus(`Successfully booked "${gig.title}"! Transaction generated.`);
      await loadDashboardData();
    } catch (error) {
      setIsError(true);
      setStatus(error.message || 'Failed to complete booking.');
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Marketplace Dashboard</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Welcome back, <strong>{user?.fullName || user?.email}</strong> — Signed in as <em>{user?.role}</em>
        </p>
      </div>

      {/* Tabs */}
      <div className="tab-container">
        <button
          className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Gigs
        </button>

        {(user?.role === 'freelancer' || user?.role === 'admin') && (
          <button
            className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Post a Gig
          </button>
        )}

        {(user?.role === 'freelancer' || user?.role === 'admin') && (
          <button
            className={`tab-btn ${activeTab === 'tax' ? 'active' : ''}`}
            onClick={() => setActiveTab('tax')}
          >
            Tax & Income Visuals
          </button>
        )}
      </div>

      <StatusMessage message={status} type={isError ? 'error' : 'info'} />

      {/* Active Tab Views */}
      {activeTab === 'browse' && (
        <GigList gigs={gigs} userRole={user?.role} onBookGig={handleBookGig} />
      )}

      {activeTab === 'create' && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <GigForm
            onCreated={() => {
              loadDashboardData();
              setActiveTab('browse');
            }}
          />
        </div>
      )}

      {activeTab === 'tax' && <TaxDashboard />}
    </div>
  );
}

export default Dashboard;