import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ role }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/';
  };
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/dashboard">ClaimsSys</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            {role === 'HospitalStaff' && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/claims/new">New Claim</Link></li>
              </>
            )}
            {role === 'InsurerStaff' && (
              <li className="nav-item"><Link className="nav-link" to="/dashboard">Review Claims</Link></li>
            )}
            {role === 'SystemAdmin' && (
              <li className="nav-item"><Link className="nav-link" to="/profile">Admin Panel</Link></li>
            )}
          </ul>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <button className="btn btn-outline-light" onClick={handleLogout}>Log Out</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;