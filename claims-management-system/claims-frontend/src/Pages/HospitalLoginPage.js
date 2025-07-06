import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../Components/AuthForm';

function HospitalLoginPage() {
  const navigate = useNavigate();
  const handleLogin = () => navigate('/dashboard');

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Claims Management System</h1>
      <h2>Hospital Staff Login Portal</h2>
      <AuthForm onLogin={handleLogin} role="HospitalStaff" />
    </div>
  );
}

export default HospitalLoginPage;
