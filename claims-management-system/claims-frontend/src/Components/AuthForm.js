import React, { useState } from 'react';
import api from '../api';

function AuthForm({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      onLogin();
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.error || 'Unknown error'));
    }
  };

  return (
    <div>
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <button onClick={handleSubmit}>Login</button>
    </div>
  );
}

export default AuthForm;
