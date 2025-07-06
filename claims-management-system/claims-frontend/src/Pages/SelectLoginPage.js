import React from 'react';
import { Link } from 'react-router-dom';

function SelectLoginPage() {
  return (
    <div className="container mt-5 text-center">
      <h1 className="mb-4">Welcome to the Claims Management System</h1>
      <p>Select your role to login:</p>
      <div className="d-grid gap-3 col-6 mx-auto mt-4">
        <Link to="/login/patient" className="btn btn-primary">Patient Login</Link>
        <Link to="/login/insurer" className="btn btn-secondary">Insurer Staff Login</Link>
        <Link to="/login/hospital" className="btn btn-success">Hospital Staff Login</Link>
        <Link to="/login/admin" className="btn btn-dark">System Admin Login</Link>
      </div>
    </div>
  );
}

export default SelectLoginPage;