import { useState } from 'react';
import { apiRequest } from '../services/api';
import StatusMessage from './StatusMessage';

function GigForm({ onCreated }) {
  const [form, setForm] = useState({
    title: '',
    category: 'Web Development',
    price: '',
    description: ''
  });
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);

  const categories = [
   'Web Development',
   'Design',
   'Writing',
   'Marketing',
   'Video & Animation'
  ];

  const updateField = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');
    setIsError(false);

    // Frontend validation
    if (!form.title || !form.category || !form.price || !form.description) {
      setIsError(true);
      setStatus('All fields are required.');
      return;
    }

    if (form.description.length > 500) {
      setIsError(true);
      setStatus('Description must not exceed 500 characters.');
      return;
    }

    if (Number(form.price) <= 0) {
      setIsError(true);
      setStatus('Price must be a positive number.');
      return;
    }

    try {
      await apiRequest('/api/gigs', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          price: Number(form.price)
        })
      });

      setForm({ title: '', category: 'Web Development', price: '', description: '' });
      setStatus('Gig published successfully!');
      onCreated();
    } catch (error) {
      setIsError(true);
      setStatus(error.message || 'Failed to create gig.');
    }
  };

  return (
    <section style={{ border: '1px solid #cbd5e1', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
      <h3>Create a New Gig Listing</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
        <div>
          <label htmlFor="title">Gig Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={updateField}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={updateField}
            style={{ width: '100%', padding: '8px' }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="price">Price (ZAR)</label>
          <input
            id="price"
            name="price"
            type="number"
            min="1"
            value={form.price}
            onChange={updateField}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label htmlFor="description">Description (Max 500 characters)</label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={form.description}
            onChange={updateField}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button
          type="submit"
          style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Publish Gig
        </button>
      </form>

      <StatusMessage message={status} type={isError ? 'error' : 'info'} />
    </section>
  );
}

export default GigForm;