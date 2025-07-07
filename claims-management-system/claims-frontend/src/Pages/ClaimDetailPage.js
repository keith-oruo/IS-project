import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import MessagesSection from '../Components/MessagesSection';

function ClaimDetailPage() {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);


  const [error, setError] = useState(null);
  useEffect(() => {
    api.get(`/claims/view/${id}`)
      .then(res => {
        setClaim(res.data);
        setError(null);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Error loading claim');
        setClaim(null);
      });
  }, [id]);

  if (error) return <div className="alert alert-danger">{error}</div>;
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