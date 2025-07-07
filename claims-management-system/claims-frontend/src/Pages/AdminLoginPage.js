import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../Components/AuthForm';

function AdminLoginPage() {
  const navigate = useNavigate();
  const handleLogin = () => navigate('/profile');

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Claims Management System</h1>
      <h2>System Admin Login Portal</h2>
      <AuthForm onLogin={handleLogin} role="SystemAdmin" />
    </div>
  );
}

export default AdminLoginPage;