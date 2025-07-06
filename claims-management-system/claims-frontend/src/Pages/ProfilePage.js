import React from 'react';
import Navbar from '../Components/NavBar';

function ProfilePage() {
  const role = 'SystemAdmin';

  return (
    <div>
      <Navbar role={role} />
      <div className="container mt-5">
        <h2>System Admin Portal</h2>
        <p>Manage roles, claims audit, and system configuration.</p>
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card p-3">
              <h5>User Roles</h5>
              <p>Create, update or delete staff roles.</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card p-3">
              <h5>Audit Logs</h5>
              <p>View history of claim edits and actions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
