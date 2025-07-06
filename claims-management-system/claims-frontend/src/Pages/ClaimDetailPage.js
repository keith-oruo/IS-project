import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import MessagesSection from 'src/Components/MessagesSection';

function ClaimDetailPage() {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);

  useEffect(() => {
    api.get(`/claims/status/1`) // Replace with single claim endpoint when available
      .then(res => {
        const found = res.data.find(c => c.claim_id === parseInt(id));
        setClaim(found);
      });
  }, [id]);

  if (!claim) return <div>Loading...</div>;

  return (
    <div>
      <h2>Claim Details</h2>
      <p>Status: {claim.status}</p>
      <p>Submitted: {new Date(claim.submission_date).toLocaleDateString()}</p>
      <MessagesSection claimId={claim.claim_id} />
    </div>
  );
}

export default ClaimDetailPage;