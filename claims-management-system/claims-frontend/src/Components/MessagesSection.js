import React, { useEffect, useState } from 'react';
import api from '../api';

function MessagesSection({ claimId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    api.get(`/claims/${claimId}/messages`).then((res) => setMessages(res.data));
  }, [claimId]);

  const sendMessage = async () => {
    const senderId = 1; // replace with real sender info
    await api.post(`/claims/${claimId}/messages`, {
      message: input,
      senderRole: 'HospitalStaff',
      senderId
    });
    setInput('');
    const updated = await api.get(`/claims/${claimId}/messages`);
    setMessages(updated.data);
  };

  return (
    <div>
      <h4>Messages</h4>
      {messages.map((msg, idx) => (
        <p key={idx}><b>{msg.sender_role}</b>: {msg.message}</p>
      ))}
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default MessagesSection;