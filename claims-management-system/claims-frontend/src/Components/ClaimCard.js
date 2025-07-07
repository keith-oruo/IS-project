import React from 'react';
import { useNavigate } from 'react-router-dom';

function ClaimCard({ claim }) {
  const navigate = useNavigate();

  return (
    <div className="card">
      <h5>Claim #{claim.claim_id}</h5>
      <p><strong>Patient ID:</strong> {claim.patient_id}</p>
      <p><strong>Status:</strong> {claim.status}</p>
      {claim.treatment_details && <p><strong>Treatment:</strong> {claim.treatment_details}</p>}
      {claim.submission_date && <p><strong>Submitted:</strong> {new Date(claim.submission_date).toLocaleDateString()}</p>}
      {claim.rejection_reason && <p><strong>Rejection Reason:</strong> {claim.rejection_reason}</p>}
      <button onClick={() => navigate(`/claims/${claim.claim_id}`)}>View</button>
    </div>
  );
}

export default ClaimCard;
