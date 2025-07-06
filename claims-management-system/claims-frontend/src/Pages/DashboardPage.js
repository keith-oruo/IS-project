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

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    const storedId = localStorage.getItem('userId');
    setRole(storedRole);
    setUserId(storedId);

    if (storedRole === 'Patient') {
      api.get(`claims/status/${storedId}`).then(res => setClaims(res.data));
      api.get(`invoices/patient/${storedId}`).then(res => setInvoices(res.data));
    } else if (storedRole === 'SystemAdmin') {
      api.get('admin/claims').then(res => setClaims(res.data));
    } else if (storedRole === 'HospitalStaff') {
      // Fetch claims submitted by this staff member
      api.get(`claims/staff/${storedId}`).then(res => setClaims(res.data));
    } else if (storedRole === 'InsurerStaff') {
      // Fetch claims assigned to this insurer
      api.get(`claims/insurer/${storedId}`).then(res => setClaims(res.data));
    }
  }, []);

  const approvedClaims = claims.filter(c => c.status === 'Approved');
  const approvedClaimIds = approvedClaims.map(c => c.claim_id);
  const visibleInvoices = invoices.filter(inv => approvedClaimIds.includes(inv.claim_id));

  return (
    <div>
      <Navbar role={role} />
      <div className="container mt-5">
        {role === 'Patient' ? (
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
        ) : (
          <>
            <h2>
              {role === 'HospitalStaff' ? 'Submitted Claims' :
              role === 'InsurerStaff' ? 'Claims to Review' :
              'Claims Overview'}
            </h2>

            {role === 'HospitalStaff' && (
              <Link to="/claims/new" className="btn btn-success mb-3">Submit New Claim</Link>
            )}

            <div className="row">
              {claims.map(claim => (
                <div className="col-md-6 col-lg-4" key={claim.claim_id}>
                  <ClaimCard claim={claim} />
                </div>
              ))}
            </div>

            <h2 className="mt-5">Approved Invoices</h2>
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