

import React, { useEffect, useState } from 'react';
import api from '../api';
import ClaimCard from '../Components/ClaimCard';
import Navbar from '../Components/NavBar';
import { Link } from 'react-router-dom';

function DashboardPage() {
  const [claims, setClaims] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState(null);

  // Handler for insurer editing invoice
  const handleEditInvoice = (invoice) => {
    const newAmount = prompt('Enter new amount for invoice #' + invoice.invoice_id, invoice.amount);
    if (newAmount && !isNaN(newAmount)) {
      api.patch(`/invoices/${invoice.invoice_id}`, { amount: Number(newAmount) })
        .then(res => {
          setInvoices(invoices.map(inv => inv.invoice_id === invoice.invoice_id ? res.data : inv));
        })
        .catch(() => alert('Failed to update invoice.'));
    }
  };

  // Approve or reject a claim (InsurerStaff)
  const handleReviewClaim = async (claim, action) => {
    let reason = '';
    if (action === 'Rejected') {
      reason = prompt('Enter rejection reason for claim #' + claim.claim_id);
      if (!reason) return;
    }
    try {
      await api.patch(`/claims/view/${claim.claim_id}`, {
        status: action,
        rejection_reason: action === 'Rejected' ? reason : null
      });
      // Optionally add a message
      if (action === 'Rejected' || action === 'Approved') {
        await api.post(`/claims/${claim.claim_id}/messages`, {
          message: action === 'Rejected' ? `Rejected: ${reason}` : 'Approved',
        });
      }
      // Refresh claims
      api.get(`/claims/insurer/${userId}`).then(res => setClaims(res.data)).catch(() => setClaims([]));
    } catch (err) {
      alert('Failed to update claim: ' + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    const storedId = localStorage.getItem('userId');
    setRole(storedRole);
    setUserId(storedId);

    if (storedRole === 'Patient') {
      api.get(`/claims/status/${storedId}`).then(res => setClaims(res.data)).catch(() => setClaims([]));
      api.get(`/invoices/patient/${storedId}`).then(res => {
        setInvoices(res.data);
        console.log('Invoices for patient:', res.data);
      }).catch(err => {
        setInvoices([]);
        console.error('Error fetching invoices for patient:', err.response?.data || err.message, err.config);
      });
    } else if (storedRole === 'SystemAdmin') {
      api.get('/admin/claims').then(res => setClaims(res.data)).catch(() => setClaims([]));
      api.get('/invoices').then(res => {
        setInvoices(res.data);
        console.log('Invoices for admin:', res.data);
      }).catch(err => {
        setInvoices([]);
        console.error('Error fetching invoices for admin:', err.response?.data || err.message, err.config);
      });
    } else if (storedRole === 'HospitalStaff') {
      // Fetch claims submitted by this staff member
      api.get(`/claims/staff/${storedId}`).then(res => setClaims(res.data)).catch(() => setClaims([]));
      api.get('/invoices').then(res => {
        setInvoices(res.data);
        console.log('Invoices for hospital staff:', res.data);
      }).catch(err => {
        setInvoices([]);
        console.error('Error fetching invoices for hospital staff:', err.response?.data || err.message, err.config);
      });
    } else if (storedRole === 'InsurerStaff') {
      // Fetch claims assigned to this insurer
      api.get(`/claims/insurer/${storedId}`).then(res => setClaims(res.data)).catch(() => setClaims([]));
      api.get('/invoices').then(res => {
        setInvoices(res.data);
        console.log('Invoices for insurer staff:', res.data);
      }).catch(err => {
        setInvoices([]);
        console.error('Error fetching invoices for insurer staff:', err.response?.data || err.message, err.config);
      });
    }
  }, []);

  // For InsurerStaff and HospitalStaff, show all invoices returned by the API (already filtered by backend)
  let visibleInvoices = invoices;
  // For HospitalStaff, only show invoices for claims they submitted
  if (role === 'HospitalStaff') {
    const staffClaimIds = claims.map(c => c.claim_id);
    visibleInvoices = invoices.filter(inv => staffClaimIds.includes(inv.claim_id));
  } else if (role === 'Patient') {
    const approvedClaims = claims.filter(c => c.status === 'Approved');
    const approvedClaimIds = approvedClaims.map(c => c.claim_id);
    visibleInvoices = invoices.filter(inv => approvedClaimIds.includes(inv.claim_id));
  }

  return (
    <div>
      <Navbar role={role} />
      <div className="container mt-5">
        {role === 'HospitalStaff' && (
          <>
            <h2>Claims Submitted by You</h2>
            <div className="row">
              {claims.length === 0 ? (
                <p>No claims found.</p>
              ) : (
                claims.map(claim => (
                  <div className="col-md-4 mb-3" key={claim.claim_id}>
                    <ClaimCard claim={claim} />
                  </div>
                ))
              )}
            </div>
            <h2 className="mt-5">Invoices (Approved Claims Only)</h2>
            <div className="row">
              {visibleInvoices.length === 0 ? (
                <p>No invoices found.</p>
              ) : (
                visibleInvoices.map(inv => (
                  <div className="col-md-4 mb-3" key={inv.invoice_id}>
                    <div className="card p-3">
                      <h5>Invoice ID: {inv.invoice_id}</h5>
                      <p>Claim ID: {inv.claim_id}</p>
                      <p>Amount: {inv.amount}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        {role === 'InsurerStaff' && (
          <>
            <h2>Claims to Review</h2>
            <div className="row">
              {claims.length === 0 ? (
                <p>No claims found.</p>
              ) : (
                claims.map(claim => (
                  <div className="col-md-6 mb-3" key={claim.claim_id}>
                    <div className="card p-3">
                      <h5>Claim #{claim.claim_id}</h5>
                      <p>Status: {claim.status}</p>
                      <p>Patient ID: {claim.patient_id}</p>
                      <p>Treatment: {claim.treatment_details}</p>
                      {claim.status === 'Pending' && (
                        <>
                          <button className="btn btn-success btn-sm me-2" onClick={() => handleReviewClaim(claim, 'Approved')}>Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleReviewClaim(claim, 'Rejected')}>Reject</button>
                        </>
                      )}
                      {claim.status === 'Rejected' && <p>Reason: {claim.rejection_reason}</p>}
                      <Link to={`/claim/${claim.claim_id}`}>View Details</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
            <h2 className="mt-5">Invoices (All Approved)</h2>
            <div className="row">
              {invoices.length === 0 ? (
                <p>No invoices found.</p>
              ) : (
                invoices.map(inv => (
                  <div className="col-md-4 mb-3" key={inv.invoice_id}>
                    <div className="card p-3">
                      <h5>Invoice ID: {inv.invoice_id}</h5>
                      <p>Claim ID: {inv.claim_id}</p>
                      <p>Amount: {inv.amount}</p>
                      <button className="btn btn-warning btn-sm mt-2" onClick={() => handleEditInvoice(inv)}>Edit</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        {role === 'SystemAdmin' && (
          <>
            <h2>All Claims</h2>
            <div className="row">
              {claims.length === 0 ? (
                <p>No claims found.</p>
              ) : (
                claims.map(claim => (
                  <div className="col-md-4 mb-3" key={claim.claim_id}>
                    <ClaimCard claim={claim} />
                  </div>
                ))
              )}
            </div>
            <h2 className="mt-5">All Invoices (Approved Claims Only)</h2>
            <div className="row">
              {invoices.length === 0 ? (
                <p>No invoices found.</p>
              ) : (
                invoices.map(inv => (
                  <div className="col-md-4 mb-3" key={inv.invoice_id}>
                    <div className="card p-3">
                      <h5>Invoice ID: {inv.invoice_id}</h5>
                      <p>Claim ID: {inv.claim_id}</p>
                      <p>Amount: {inv.amount}</p>
                      <button className="btn btn-warning btn-sm mt-2" onClick={() => handleEditInvoice(inv)}>Edit</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        {role === 'Patient' && (
          <>
            <h2>My Claims</h2>
            <div className="row">
              {claims.map((claim) => (
                <div key={claim.claim_id} className="col-md-6 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Claim #{claim.claim_id}</h5>
                      <p>Status: {claim.status}</p>
                      <p>Submitted: {new Date(claim.submission_date).toLocaleDateString()}</p>
                      {claim.status === 'Rejected' && <p>Reason: {claim.rejection_reason}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="mt-5">My Invoices</h2>
            <div className="row">
              {visibleInvoices.map((invoice) => (
                <div key={invoice.invoice_id} className="col-md-6 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Invoice #{invoice.invoice_id}</h5>
                      <p>Claim ID: {invoice.claim_id}</p>
                      <p>Amount: ${invoice.amount}</p>
                      <p>Date: {new Date(invoice.generated_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;