import React, { useState } from 'react';
import api from '../api';

function NewClaimPage() {
  const [form, setForm] = useState({ patientId: '', submittedByStaffId: '', treatmentDetails: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      const res = await api.post('/claims', form);
      alert('Claim submitted!');
    } catch (err) {
      alert('Error submitting claim');
    }
  };

  return (
    <div>
      <h2>New Claim</h2>
      <input name="patientId" placeholder="Patient ID" onChange={handleChange} />
      <input name="submittedByStaffId" placeholder="Staff ID" onChange={handleChange} />
      <textarea name="treatmentDetails" placeholder="Treatment Details" onChange={handleChange} />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default NewClaimPage;
