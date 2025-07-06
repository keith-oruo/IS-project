import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from 'src/Components/AuthForm';

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/dashboard');
  };

  return (
    <div>
      <h2>Login</h2>
      <AuthForm onLogin={handleLogin} />
    </div>
  );
}

export default LoginPage;