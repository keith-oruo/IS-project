import React from 'react';
import { useNavigate } from 'react-router-dom';

function ClaimCard({ claim }) {
  const navigate = useNavigate();

  return (
    <div className="card">
      <h3>Patient ID: {claim.patient_id}</h3>
      <p>Status: {claim.status}</p>
      <p>Submitted: {new Date(claim.submission_date).toLocaleDateString()}</p>
      <button onClick={() => navigate(`/claims/${claim.claim_id}`)}>View</button>
    </div>
  );
}

export default ClaimCard;
