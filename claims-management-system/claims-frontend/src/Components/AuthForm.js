import React, { useState } from 'react';
import api from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

function AuthForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post('/auth/login', form);
      const { token, role, staffId, patientId, adminId } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', staffId || patientId || adminId);

      if (role === 'SystemAdmin') {
        navigate('/profile');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.error || 'Unknown error'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <div className="container mt-4">
      <div className="mb-3">
        <label>Email address</label>
        <input type="email" name="email" className="form-control" onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label>Password</label>
        <input type="password" name="password" className="form-control" onChange={handleChange} />
      </div>
      <button className="btn btn-primary me-2" onClick={handleSubmit}>Login</button>
      <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default AuthForm;