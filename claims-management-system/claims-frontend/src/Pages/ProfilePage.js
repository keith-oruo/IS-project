
import React, { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../Components/NavBar';

function ProfilePage() {
  const role = 'SystemAdmin';
  const [staff, setStaff] = useState({ hospitalStaff: [], insurerStaff: [] });
  const [logs, setLogs] = useState([]);
  const [editing, setEditing] = useState({}); // { type, id, role }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = () => {
    api.get('/admin/staff').then(res => setStaff(res.data)).catch(() => setStaff({ hospitalStaff: [], insurerStaff: [] }));
    api.get('/admin/audit-logs').then(res => setLogs(res.data)).catch(() => setLogs([]));
  };
  useEffect(() => { fetchData(); }, []);

  const handleEdit = (type, id, currentRole) => {
    setEditing({ type, id, role: currentRole });
    setError('');
  };
  const handleRoleChange = (e) => {
    setEditing(editing => ({ ...editing, role: e.target.value }));
  };
  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await api.put(`/admin/staff/${editing.type}/${editing.id}`, { role: editing.role });
      setEditing({});
      fetchData();
    } catch (err) {
      setError('Failed to update role.');
    }
    setLoading(false);
  };
  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    setLoading(true);
    setError('');
    try {
      await api.delete(`/admin/staff/${type}/${id}`);
      fetchData();
    } catch (err) {
      setError('Failed to delete staff.');
    }
    setLoading(false);
  };

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
              <h6>Hospital Staff</h6>
              <ul>
                {staff.hospitalStaff.length === 0 ? <li>No hospital staff found.</li> : staff.hospitalStaff.map(s => (
                  <li key={s.staff_id}>
                    {s.full_name} ({s.email}) - 
                    {editing.id === s.staff_id && editing.type === 'hospital' ? (
                      <>
                        <select value={editing.role} onChange={handleRoleChange} disabled={loading}>
                          <option value="HospitalStaff">HospitalStaff</option>
                          <option value="HospitalAdmin">HospitalAdmin</option>
                        </select>
                        <button className="btn btn-sm btn-success ms-2" onClick={handleSave} disabled={loading}>Save</button>
                        <button className="btn btn-sm btn-secondary ms-1" onClick={() => setEditing({})} disabled={loading}>Cancel</button>
                      </>
                    ) : (
                      <>
                        {s.role} (Hospital ID: {s.hospital_id})
                        <button className="btn btn-sm btn-link ms-2" onClick={() => handleEdit('hospital', s.staff_id, s.role)} disabled={loading}>Edit</button>
                        <button className="btn btn-sm btn-danger ms-1" onClick={() => handleDelete('hospital', s.staff_id)} disabled={loading}>Delete</button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              <h6>Insurer Staff</h6>
              <ul>
                {staff.insurerStaff.length === 0 ? <li>No insurer staff found.</li> : staff.insurerStaff.map(s => (
                  <li key={s.staff_id}>
                    {s.full_name} ({s.email}) - 
                    {editing.id === s.staff_id && editing.type === 'insurer' ? (
                      <>
                        <select value={editing.role} onChange={handleRoleChange} disabled={loading}>
                          <option value="InsurerStaff">InsurerStaff</option>
                          <option value="InsurerAdmin">InsurerAdmin</option>
                        </select>
                        <button className="btn btn-sm btn-success ms-2" onClick={handleSave} disabled={loading}>Save</button>
                        <button className="btn btn-sm btn-secondary ms-1" onClick={() => setEditing({})} disabled={loading}>Cancel</button>
                      </>
                    ) : (
                      <>
                        {s.role} (Insurer ID: {s.insurer_id})
                        <button className="btn btn-sm btn-link ms-2" onClick={() => handleEdit('insurer', s.staff_id, s.role)} disabled={loading}>Edit</button>
                        <button className="btn btn-sm btn-danger ms-1" onClick={() => handleDelete('insurer', s.staff_id)} disabled={loading}>Delete</button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              {error && <div className="alert alert-danger mt-2">{error}</div>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="card p-3">
              <h5>Audit Logs</h5>
              <p>View history of claim edits and actions.</p>
              <ul style={{ maxHeight: 300, overflowY: 'auto' }}>
                {logs.length === 0 ? <li>No audit logs found.</li> : logs.map(log => (
                  <li key={log.edit_id}>
                    <b>Claim #{log.claim_id}</b> (Patient ID: {log.patient_id}) edited by {log.editor_role} #{log.editor_id} on {new Date(log.edit_timestamp).toLocaleString()}<br />
                    <i>{log.edit_details}</i>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
