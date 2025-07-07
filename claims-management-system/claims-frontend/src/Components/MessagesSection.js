import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import Navbar from '../Components/NavBar';

// Accept claimId as a prop, or fallback to useParams if not provided
function MessagesSection(props) {
  // Always call useParams at the top
  const params = useParams();
  const claimId = props.claimId || params.id;
  const [claim, setClaim] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    api.get(`/claims/view/${claimId}`)
      .then(res => setClaim(res.data))
      .catch(err => console.error(err));

    api.get(`/claims/${claimId}/messages`)
      .then(res => setMessages(res.data))
      .catch(err => console.error(err));
  }, [claimId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await api.post(`/claims/${claimId}/messages`, {
        senderId: userId,
        message: newMessage,
      });
      setMessages([res.data, ...messages]);
      setNewMessage('');
    } catch (err) {
      alert('Error submitting message: ' + err.response?.data?.error);
    }
  };

  return (
    <div>
      <Navbar role={role} />
      <div className="container mt-5">
        <h2>Claim Detail View</h2>
        {claim ? (
          <div className="card p-3 mb-4">
            <p><strong>Claim ID:</strong> {claim.claim_id}</p>
            <p><strong>Status:</strong> {claim.status}</p>
            <p><strong>Submission Date:</strong> {new Date(claim.submission_date).toLocaleDateString()}</p>
            {claim.status === 'Rejected' && <p><strong>Rejection Reason:</strong> {claim.rejection_reason}</p>}
            {claim.status === 'Approved' && <p><strong>Approval Date:</strong> {new Date(claim.approval_date).toLocaleDateString()}</p>}
            <p><strong>Treatment:</strong> {claim.treatment_details}</p>
          </div>
        ) : (
          <p>Loading claim...</p>
        )}

        <h4>Insurer Remarks</h4>
        {messages.length === 0 ? (
          <p>No remarks submitted yet.</p>
        ) : (
          <ul className="list-group mb-3">
            {messages.map((msg, idx) => (
              <li key={idx} className="list-group-item">
                <strong>{msg.sender_role}</strong>: {msg.message}<br />
                <small>{new Date(msg.timestamp).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}

        {role === 'InsurerStaff' && (
          <div className="mb-3">
            <label className="form-label">Add Reason (Approval or Rejection)</label>
            <textarea
              className="form-control"
              rows="3"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Enter reason here..."
            />
            <button className="btn btn-primary mt-2" onClick={handleSendMessage}>
              Submit Reason
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessagesSection;
