import React, { useEffect, useState } from 'react';
import api from '../api';
import ClaimCard from 'src/Components/ClaimCard';

function DashboardPage() {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    api.get('/claims/status/1') // Replace 1 with real patient ID
      .then(res => setClaims(res.data));
  }, []);

  return (
    <div>
      <h2>Claim Dashboard</h2>
      {claims.map(claim => <ClaimCard key={claim.claim_id} claim={claim} />)}
    </div>
  );
}

export default DashboardPage;
