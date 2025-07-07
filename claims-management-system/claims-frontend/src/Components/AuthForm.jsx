import React, { useState } from 'react';
import api from '../api';

console.log('AuthForm module loaded');

function AuthForm({ onLogin, role }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    console.log('Submitting login form with data:', { ...form, role });

    try {
      const response = await api.post('auth/login', { ...form, role });
      console.log('Login API call successful:', response.data);
      const { token, role: userRole, userId } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('userId', userId);

      onLogin();
    } catch (err) {
      console.error('Login API call failed:', err.toJSON ? err.toJSON() : err);
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    }
  };

  return (
    <form>
      <div className="mb-3">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>
      {error && <div className="text-danger mb-2">{error}</div>}
      <button type="button" className="btn btn-primary" onClick={handleSubmit}>Login</button>
    </form>
  );
}

export default AuthForm;