import React, { useState } from 'react';
import api from '../api';

function GenerateInvoiceForm({ claims, onInvoiceCreated }) {
  const [claimId, setClaimId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const staffId = localStorage.getItem('userId');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/invoices', {
        claimId,
        generatedByStaffId: staffId,
        amount: parseFloat(amount)
      });
      onInvoiceCreated(res.data);
      setClaimId('');
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate invoice');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div className="mb-2">
        <label>Claim:</label>
        <select value={claimId} onChange={e => setClaimId(e.target.value)} className="form-select" required>
          <option value="">Select claim</option>
          {claims.filter(c => c.status === 'Approved').map(c => (
            <option key={c.claim_id} value={c.claim_id}>
              #{c.claim_id} - {c.treatment_details}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <label>Amount:</label>
        <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="form-control" required />
      </div>
      {error && <div className="text-danger mb-2">{error}</div>}
      <button type="submit" className="btn btn-primary">Generate Invoice</button>
    </form>
  );
}

export default GenerateInvoiceForm;
