import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function AuthForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', form);
      const { token, role, userId } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);

      // Redirect based on role
      if (role === 'SystemAdmin') navigate('/profile');
      else navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input name="email" className="form-control" onChange={handleChange} placeholder="Enter email" />
      </div>
      <div className="mb-3">
        <label className="form-label">Password</label>
        <input name="password" type="password" className="form-control" onChange={handleChange} placeholder="Enter password" />
      </div>
      <button className="btn btn-primary" onClick={handleLogin}>Login</button>
      <button className="btn btn-secondary ms-2" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default AuthForm;