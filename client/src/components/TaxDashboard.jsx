import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import StatusMessage from './StatusMessage';

function TaxDashboard() {
  const [taxData, setTaxData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTax = async () => {
      try {
        setLoading(true);
        const res = await apiRequest('/api/tax/estimate');
        setTaxData(res.data || res);
      } catch (err) {
        setError(err.message || 'Unable to load tax estimation.');
      } finally {
        setLoading(false);
      }
    };
    fetchTax();
  }, []);

  if (loading) return <p>Calculating tax brackets and income metrics...</p>;
  if (error) return <StatusMessage message={error} type="error" />;
  if (!taxData) return <p>No transactions found for tax calculation.</p>;

  const grossIncome = Number(taxData.grossIncome || 0);
  const estimatedTax = Number(taxData.estimatedTax || 0);
  const netIncome = Number(taxData.netIncome || (grossIncome - estimatedTax));
  const effectiveRate = taxData.effectiveTaxRatePercentage !== undefined 
    ? taxData.effectiveTaxRatePercentage 
    : (grossIncome > 0 ? ((estimatedTax / grossIncome) * 100).toFixed(2) : 0);
  const transactionCount = taxData.transactionCount || 0;
  const bracketDescription = taxData.taxBracketsDescription || '';

  const netPercent = grossIncome > 0 ? Math.max(0, Math.min(100, (netIncome / grossIncome) * 100)) : 100;
  const taxPercent = grossIncome > 0 ? Math.max(0, Math.min(100, (estimatedTax / grossIncome) * 100)) : 0;

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {/*Metric Cards*/}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card">
          <small style={{ color: 'var(--text-muted)', fontWeight: 600 }}>GROSS REVENUE</small>
          <h2 style={{ margin: '0.4rem 0 0 0' }}>R{grossIncome.toLocaleString()}</h2>
          <small style={{ color: 'var(--text-muted)' }}>From {transactionCount} transaction(s)</small>
        </div>

        <div className="card">
          <small style={{ color: 'var(--text-muted)', fontWeight: 600 }}>ESTIMATED TAX (SARS)</small>
          <h2 style={{ margin: '0.4rem 0 0 0', color: 'var(--danger)' }}>R{estimatedTax.toLocaleString()}</h2>
          <small style={{ color: 'var(--text-muted)' }}>Effective Rate: {effectiveRate}%</small>
        </div>

        <div className="card">
          <small style={{ color: 'var(--text-muted)', fontWeight: 600 }}>NET TAKE-HOME</small>
          <h2 style={{ margin: '0.4rem 0 0 0', color: 'var(--success)' }}>R{netIncome.toLocaleString()}</h2>
          <small style={{ color: 'var(--text-muted)' }}>After estimated statutory tax</small>
        </div>
      </div>

      {/*Breakdown Bar*/}
      <div className="card">
        <h3>Income vs Tax Breakdown</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Visual distribution of gross freelance receipts vs statutory tax withholding.
        </p>

        <div style={{ width: '100%', height: '32px', background: '#e2e8f0', borderRadius: '6px', display: 'flex', overflow: 'hidden' }}>
          <div
            style={{ width: `${netPercent}%`, background: 'var(--success)', transition: 'width 0.4s' }}
            title={`Net Income: ${netPercent.toFixed(1)}%`}
          />
          <div
            style={{ width: `${taxPercent}%`, background: 'var(--danger)', transition: 'width 0.4s' }}
            title={`Estimated Tax: ${taxPercent.toFixed(1)}%`}
          />
        </div>

        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--success)' }} />
            <span>Net Take-Home: <strong>{netPercent.toFixed(1)}%</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--danger)' }} />
            <span>Tax Retained: <strong>{taxPercent.toFixed(1)}%</strong></span>
          </div>
        </div>
      </div>

      {/*Rubric Tax Logic Explanation*/}
      <div className="card" style={{ background: '#f1f5f9', borderLeft: '4px solid #2563eb' }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Tax Estimation Methodology</h4>
        <p style={{ fontSize: '0.875rem', color: '#334155', margin: '0 0 0.5rem 0' }}>
          {bracketDescription}
        </p>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
          Statutory calculations follow progressive tier thresholds on total completed and pending earnings.
        </p>
      </div>
    </div>
  );
}

export default TaxDashboard;