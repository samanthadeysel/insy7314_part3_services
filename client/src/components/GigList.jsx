function GigList({ gigs, userRole, onBookGig }) {
  if (!gigs || gigs.length === 0) {
    return <p>No gigs currently available in the marketplace.</p>;
  }

  return (
    <section>
      <h3>Available Gigs</h3>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {gigs.map((gig) => (
          <div
            key={gig._id}
            style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', background: '#fff' }}
          >
            <h4 style={{ margin: '0 0 8px 0' }}>{gig.title}</h4>
            <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#64748b' }}>
              Category: <strong>{gig.category}</strong>
            </p>
            <p style={{ fontSize: '0.9rem', margin: '8px 0' }}>{gig.description}</p>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a' }}>
              R{gig.price}
            </p>
            
            {userRole === 'client' && (
              <button
                onClick={() => onBookGig(gig)}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Book This Gig
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default GigList;